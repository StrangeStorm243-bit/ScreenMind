"""ScreenMind agent brain — LLM with function calling + Fastino GLiNER2 entity extraction."""

import json
import os
from openai import OpenAI
from screenmind.vision import analyze_screenshot
from screenmind.search import search_web
from screenmind.config import LLM_API_KEY, LLM_BASE_URL, LLM_MODEL

# LLM client — works with OpenAI, Ollama, LM Studio, or any OpenAI-compatible API
client = OpenAI(api_key=LLM_API_KEY or "not-set", base_url=LLM_BASE_URL)

# Fastino GLiNER2 — local entity extraction (lazy-loaded)
_gliner = None


def _get_gliner():
    global _gliner
    if _gliner is None:
        from gliner2 import GLiNER2
        _gliner = GLiNER2.from_pretrained("fastino/gliner2-base-v1")
    return _gliner


def extract_screen_entities(screen_description: str) -> dict:
    """Extract entities and classify activity from a screen description using Fastino GLiNER2."""
    try:
        ext = _get_gliner()

        entities = ext.extract_entities(
            screen_description,
            ["application", "person", "technology", "website", "project", "error_message"],
            include_confidence=True,
        )

        classification = ext.classify_text(
            screen_description,
            {
                "activity": ["coding", "browsing", "reading_docs", "chatting", "email", "design"],
                "focus_level": ["deep_focus", "multitasking", "idle"],
            },
        )

        relations = ext.extract_relations(
            screen_description,
            ["uses", "related_to", "working_on"],
        )

        return {
            "entities": entities,
            "classification": classification,
            "relations": relations,
        }
    except Exception:
        return {"entities": {}, "classification": {}, "relations": {}}


def _auto_store_entities(extracted: dict):
    """Silently store GLiNER2-extracted entities into Neo4j."""
    try:
        from screenmind.graph import remember_topic

        entity_map = extracted.get("entities", {}).get("entities", {})
        for entity_type, items in entity_map.items():
            for item in items:
                name = item if isinstance(item, str) else item.get("text", "")
                if name and len(name) > 1:
                    remember_topic(name, entity_type, f"Seen on screen ({entity_type})", [])
    except Exception:
        pass  # Neo4j may not be configured


# In-memory conversation history (per session)
conversation_history: list[dict] = []
last_screen_description: str = ""

SYSTEM_PROMPT = """You are ScreenMind, a desktop-aware AI copilot. You can see the user's screen via periodic screenshots and help them with anything they're working on.

Your capabilities:
- search_web: Search the internet for information relevant to what the user is doing
- remember: Store important context about what the user has been working on into a knowledge graph
- recall: Retrieve past context about what the user has worked on

Behavior:
- When given a screenshot analysis, decide if the user would benefit from a proactive insight
- Only surface proactive insights when genuinely useful (don't be annoying)
- When the user asks a question, use the available tools to give the best answer
- Be concise but helpful
- Reference specific things you can see on their screen"""

TOOLS = [
    {
        "type": "function",
        "function": {
            "name": "search_web",
            "description": "Search the web for real-time information. Use when the user asks about something that needs current data, or when you want to find more about a topic visible on screen.",
            "parameters": {
                "type": "object",
                "properties": {
                    "query": {"type": "string", "description": "The search query"},
                },
                "required": ["query"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "remember",
            "description": "Store a piece of context in the knowledge graph. Use when you observe something important the user is working on.",
            "parameters": {
                "type": "object",
                "properties": {
                    "topic": {"type": "string", "description": "The main topic or entity"},
                    "category": {
                        "type": "string",
                        "description": "Category: app, webpage, concept, project, person",
                    },
                    "details": {"type": "string", "description": "Key details about this topic"},
                    "related_to": {
                        "type": "array",
                        "items": {"type": "string"},
                        "description": "Other topics this relates to",
                    },
                },
                "required": ["topic", "category", "details"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "recall",
            "description": "Retrieve context from the knowledge graph about what the user has been working on.",
            "parameters": {
                "type": "object",
                "properties": {
                    "query": {"type": "string", "description": "What to search for in past context"},
                },
                "required": ["query"],
            },
        },
    },
]


def execute_tool(name: str, args: dict) -> str:
    """Execute a tool and return the result as a string."""
    if name == "search_web":
        results = search_web(args["query"])
        return json.dumps(results[:3], indent=2)
    elif name == "remember":
        from screenmind.graph import remember_topic

        return remember_topic(
            args["topic"], args["category"], args["details"], args.get("related_to", [])
        )
    elif name == "recall":
        from screenmind.graph import recall_topics

        return recall_topics(args["query"])
    return "Unknown tool"


def run_agent(screenshot_b64: str = None, user_message: str = None) -> dict:
    """Run the agent brain. Returns {'response': str, 'proactive': bool}."""
    global last_screen_description

    messages = [{"role": "system", "content": SYSTEM_PROMPT}]

    # Add screen context
    if screenshot_b64:
        screen_desc = analyze_screenshot(screenshot_b64)
        last_screen_description = screen_desc

        # Fastino GLiNER2: extract entities and auto-store in Neo4j
        extracted = extract_screen_entities(screen_desc)
        _auto_store_entities(extracted)

        context_msg = (
            f"[Current screen shows: {screen_desc}]\n"
            f"[Extracted entities: {json.dumps(extracted.get('entities', {}))}]\n"
            f"[Activity: {json.dumps(extracted.get('classification', {}))}]"
        )
    elif last_screen_description:
        context_msg = f"[Last known screen: {last_screen_description}]"
    else:
        context_msg = ""

    if context_msg:
        messages.append({"role": "system", "content": context_msg})

    # Add conversation history (last 10 messages)
    messages.extend(conversation_history[-10:])

    # Add user message or proactive prompt
    if user_message:
        messages.append({"role": "user", "content": user_message})
        conversation_history.append({"role": "user", "content": user_message})
        proactive = False
    else:
        messages.append({
            "role": "user",
            "content": (
                "Based on what you see on the screen, is there anything useful you "
                "should proactively tell the user? If not, respond with just 'NO_INSIGHT'. "
                "Only speak up if you have something genuinely helpful."
            ),
        })
        proactive = True

    # Run the agent loop (max 3 tool calls)
    for _ in range(3):
        response = client.chat.completions.create(
            model=LLM_MODEL,
            messages=messages,
            tools=TOOLS,
            tool_choice="auto",
        )
        msg = response.choices[0].message

        if msg.tool_calls:
            messages.append(msg)
            for tool_call in msg.tool_calls:
                result = execute_tool(
                    tool_call.function.name,
                    json.loads(tool_call.function.arguments),
                )
                messages.append({
                    "role": "tool",
                    "tool_call_id": tool_call.id,
                    "content": result,
                })
        else:
            text = msg.content or ""
            if proactive and "NO_INSIGHT" in text:
                return {"response": "", "proactive": True}
            conversation_history.append({"role": "assistant", "content": text})
            return {"response": text, "proactive": proactive}

    return {"response": "I couldn't complete my analysis.", "proactive": proactive}
