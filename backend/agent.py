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


def extract_query_entities(query: str) -> list[str]:
    """Extract entity names from a user query using GLiNER2.
    Returns a flat list of entity name strings for Neo4j retrieval.
    """
    try:
        ext = _get_gliner()
        entities = ext.extract_entities(
            query,
            ["application", "person", "technology", "website", "project", "topic"],
            include_confidence=True,
        )
        names = []
        entity_map = entities.get("entities", {})
        for items in entity_map.values():
            for item in items:
                name = item if isinstance(item, str) else item.get("text", "")
                if name and len(name) > 1:
                    names.append(name)
        return names
    except Exception:
        return []


def update_screen_context(screenshot_b64: str):
    """Fast path: Reka + GLiNER2 + Neo4j storage. No LLM call."""
    global last_screen_description
    screen_desc = analyze_screenshot(screenshot_b64)
    last_screen_description = screen_desc
    extracted = extract_screen_entities(screen_desc)

    # Store full description + entities in Neo4j
    from screenmind.graph import store_screen_capture
    activity = ""
    classification = extracted.get("classification", {})
    if isinstance(classification, dict):
        act = classification.get("activity", "")
        if isinstance(act, list) and act:
            activity = act[0]
        elif isinstance(act, dict):
            activity = max(act, key=act.get, default="")
        elif isinstance(act, str):
            activity = act

    store_screen_capture(
        description=screen_desc,
        activity=str(activity),
        entities=extracted.get("entities", {}),
    )


# In-memory conversation history (per session)
conversation_history: list[dict] = []
last_screen_description: str = ""

SYSTEM_PROMPT = """You are ScreenMind, a desktop-aware AI copilot that sees the user's screen through periodic screenshots stored in a knowledge graph.

Answer the user's question directly. Short, clear, no fluff. If they ask "what app am I on?" — name the app. If they ask for help with code on screen — help with the code. Match your answer to what they actually asked.

You have screen context from recent captures. Each capture identifies the application, window title, visible content, and what the user was doing. Use this to give informed answers.

Rules:
- Only reference what the screen descriptions explicitly say. Never fabricate names, channels, or content.
- If something is unclear in the descriptions, say so honestly rather than guessing.
- Prefer recent captures over older ones.
- Don't over-explain. Don't repeat what the user already knows from their own screen.
- When the user asks about their workflow or history, synthesize across multiple captures.

Tools: search_web (look things up), remember (save to knowledge graph), recall (retrieve past context). Use them when they'd genuinely help — not every time."""

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

    if user_message:
        # === RAG retrieval path: skip Reka, use cached context from Neo4j ===
        # Skip GLiNER2 entity extraction on queries (too slow, ~17s).
        # Just use raw query text for Neo4j full-text/CONTAINS search.
        from screenmind.graph import retrieve_relevant_context

        relevant_captures = retrieve_relevant_context(
            query=user_message,
            entity_names=None,
            limit=5,
        )

        if relevant_captures:
            captures_text = "\n\n".join(
                f"[Screen at {c.get('timestamp', 'unknown')} "
                f"(activity: {c.get('activity', 'unknown')})]:\n{c['description']}"
                for c in relevant_captures
            )
            context_msg = (
                f"[Retrieved screen context based on query relevance:]\n{captures_text}"
            )
        elif last_screen_description:
            context_msg = f"[Last known screen: {last_screen_description}]"
        else:
            context_msg = ""

        proactive = False

    elif screenshot_b64:
        # === Background analysis path: Reka + GLiNER2 + store in Neo4j ===
        screen_desc = analyze_screenshot(screenshot_b64)
        last_screen_description = screen_desc

        extracted = extract_screen_entities(screen_desc)

        # Store full description in Neo4j
        from screenmind.graph import store_screen_capture
        activity = ""
        classification = extracted.get("classification", {})
        if isinstance(classification, dict):
            act = classification.get("activity", "")
            if isinstance(act, list) and act:
                activity = act[0]
            elif isinstance(act, dict):
                activity = max(act, key=act.get, default="")
            elif isinstance(act, str):
                activity = act

        store_screen_capture(
            description=screen_desc,
            activity=str(activity),
            entities=extracted.get("entities", {}),
        )

        context_msg = (
            f"[Current screen shows: {screen_desc}]\n"
            f"[Extracted entities: {json.dumps(extracted.get('entities', {}))}]\n"
            f"[Activity: {json.dumps(extracted.get('classification', {}))}]"
        )
        proactive = True

    else:
        context_msg = ""
        proactive = False

    if context_msg:
        messages.append({"role": "system", "content": context_msg})

    # Add conversation history (last 10 messages)
    messages.extend(conversation_history[-10:])

    # Add user message or proactive prompt
    if user_message:
        messages.append({"role": "user", "content": user_message})
        conversation_history.append({"role": "user", "content": user_message})
    else:
        messages.append({
            "role": "user",
            "content": (
                "Based on what you see on the screen, is there anything useful you "
                "should proactively tell the user? If not, respond with just 'NO_INSIGHT'. "
                "Only speak up if you have something genuinely helpful."
            ),
        })

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


def run_agent_stream(user_message: str):
    """Streaming version of run_agent for user queries. Yields text chunks."""
    global last_screen_description

    messages = [{"role": "system", "content": SYSTEM_PROMPT}]

    # RAG retrieval — skip GLiNER2 entity extraction (too slow for queries),
    # just use the raw query text for Neo4j full-text/CONTAINS search
    from screenmind.graph import retrieve_relevant_context

    relevant_captures = retrieve_relevant_context(
        query=user_message,
        entity_names=None,
        limit=5,
    )

    if relevant_captures:
        captures_text = "\n\n".join(
            f"[Screen at {c.get('timestamp', 'unknown')} "
            f"(activity: {c.get('activity', 'unknown')})]:\n{c['description']}"
            for c in relevant_captures
        )
        context_msg = f"[Retrieved screen context based on query relevance:]\n{captures_text}"
    elif last_screen_description:
        context_msg = f"[Last known screen: {last_screen_description}]"
    else:
        context_msg = ""

    if context_msg:
        messages.append({"role": "system", "content": context_msg})

    messages.extend(conversation_history[-10:])
    messages.append({"role": "user", "content": user_message})
    conversation_history.append({"role": "user", "content": user_message})

    # Stream directly — handle tool calls inline from stream deltas
    for attempt in range(3):
        stream = client.chat.completions.create(
            model=LLM_MODEL,
            messages=messages,
            tools=TOOLS,
            tool_choice="auto",
            stream=True,
        )

        full_text = ""
        tool_calls_acc = {}  # id -> {name, arguments}

        for chunk in stream:
            delta = chunk.choices[0].delta

            # Accumulate tool call deltas
            if delta.tool_calls:
                for tc_delta in delta.tool_calls:
                    idx = tc_delta.index
                    if idx not in tool_calls_acc:
                        tool_calls_acc[idx] = {
                            "id": tc_delta.id or "",
                            "name": "",
                            "arguments": "",
                        }
                    if tc_delta.id:
                        tool_calls_acc[idx]["id"] = tc_delta.id
                    if tc_delta.function:
                        if tc_delta.function.name:
                            tool_calls_acc[idx]["name"] = tc_delta.function.name
                        if tc_delta.function.arguments:
                            tool_calls_acc[idx]["arguments"] += tc_delta.function.arguments

            # Stream content chunks immediately
            if delta.content:
                full_text += delta.content
                yield delta.content

        # If tool calls were made, execute them and loop
        if tool_calls_acc:
            # Build assistant message with tool_calls for history
            tc_list = [
                {
                    "id": tc["id"],
                    "type": "function",
                    "function": {"name": tc["name"], "arguments": tc["arguments"]},
                }
                for tc in tool_calls_acc.values()
            ]
            messages.append({"role": "assistant", "content": full_text or None, "tool_calls": tc_list})
            for tc in tool_calls_acc.values():
                result = execute_tool(tc["name"], json.loads(tc["arguments"]))
                messages.append({
                    "role": "tool",
                    "tool_call_id": tc["id"],
                    "content": result,
                })
            continue  # Next iteration will stream the follow-up

        # No tool calls — we're done
        conversation_history.append({"role": "assistant", "content": full_text})
        return

    yield "I couldn't complete my analysis."
