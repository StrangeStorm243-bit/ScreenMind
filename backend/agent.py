"""ScreenMind agent brain — GPT-4o with function calling."""

import json
from openai import OpenAI
from screenmind.vision import analyze_screenshot
from screenmind.search import search_web
from screenmind.config import OPENAI_API_KEY

client = OpenAI(api_key=OPENAI_API_KEY)

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
        context_msg = f"[Current screen shows: {screen_desc}]"
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
            model="gpt-4o",
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
