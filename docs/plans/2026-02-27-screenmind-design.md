# ScreenMind — Desktop-Aware AI Copilot

## Design Document | Feb 27, 2026

---

## What We're Building

A personal productivity copilot that lives as a floating overlay on your desktop. It periodically screenshots your screen, understands what you're looking at via vision AI, builds a knowledge graph of your work context over time, and lets you ask questions or receive proactive insights — all via voice or text.

**Core value prop**: "An AI that sees your whole desktop and remembers everything you've been working on."

---

## Sponsor Tool Integration (4 sponsor tools + OpenAI)

| Tool | Role | Integration Point |
|------|------|-------------------|
| **Reka Vision API** | Screen understanding | Every captured screenshot -> Reka describes visible content (apps, text, context) |
| **Tavily Search API** | Real-time web search | Agent searches the web when user asks about something on screen or when proactive context would help |
| **Neo4j** | Knowledge graph memory | Stores entities, topics, and relationships observed across screenshots. Enables temporal recall ("what was I reading earlier?") |
| **Render** | Deployment | Backend API deployed on Render |
| *OpenAI* | Agent brain + voice | GPT-4o for orchestration, Whisper for push-to-talk voice transcription |
|(Fastino) as a stretch goal

> Note: Modulate was evaluated but is enterprise-only (C/C++ SDKs, no public API). If API access is provided at the event, can integrate as a stretch goal.

---

## Architecture

```
Desktop Client (Python)                   Backend (FastAPI on Render)
┌────────────────────────┐                ┌──────────────────────────┐
│ Screen Capture (mss)   │───screenshot──>│ Reka Vision API          │
│ every ~5s + diff check │                │   -> scene description   │
│                        │                │                          │
│ Voice Input            │───audio─────-->│ Modulate API             │
│ (push-to-talk hotkey)  │                │   -> processed audio     │
│                        │                │ OpenAI Whisper            │
│ Floating Overlay       │<──response─────│   -> transcription       │
│ (Tkinter, always-on-   │                │                          │
│  top, ~300x400px)      │                │ Agent Brain              │
│                        │                │ (OpenAI function calling) │
│ Text Input (optional)  │───text────────>│   -> tool routing:       │
└────────────────────────┘                │     - Tavily search      │
                                          │     - Neo4j read/write   │
                                          │     - Reka re-analyze    │
                                          │                          │
                                          │ Neo4j (AuraDB Free)      │
                                          │   -> knowledge graph     │
                                          └──────────────────────────┘
```

### Data Flow

1. Client captures screenshot every ~5 seconds via `python-mss`
2. Perceptual hash diff (via `imagehash`) — skip if screen unchanged
3. On significant change OR user voice/text input -> POST to backend
4. Backend sends screenshot to Reka Vision API -> scene description
5. LLM (OpenAI GPT-4o with function calling) decides:
   - Store new context in Neo4j? (entities, topics, relationships)
   - Search the web via Tavily for relevant info?
   - Surface a proactive insight to the user?
   - Respond to a direct user question?
6. Response sent back to client overlay

### Autonomy Loop (Background)

The agent doesn't just wait for questions. It continuously:
- Watches for topic changes ("user switched from coding to browsing docs")
- Builds the knowledge graph silently
- Surfaces insights when genuinely useful ("You've had 3 tabs open about Neo4j Cypher queries — want a cheat sheet?")
- Detects patterns ("You've been on this error page for 2 minutes — want me to search for solutions?")

---

## Component Details

### Desktop Client

**Screen Capture**
- Library: `python-mss` (3ms captures, cross-platform, no deps)
- Capture interval: 2 seconds (configurable)
- Change detection: `imagehash` perceptual hashing, threshold-based skip
- Resize to 1280px wide before sending (reduce payload)

**Voice Input**
- Global hotkey: `Ctrl+Space` (via `keyboard` library)
- Audio capture: `sounddevice`
- Send to backend -> Modulate API -> OpenAI Whisper for transcription
- Optional: TTS response via `RealtimeSTT`/`RealtimeTTS` if time permits

**Floating Overlay**
- Library: Tkinter (built-in, zero deps)
- Always-on-top: `root.attributes('-topmost', True)`
- Borderless/draggable: `root.overrideredirect(True)` + drag handlers
- Semi-transparent background
- Shows: agent status (idle/listening/thinking), last message, mini chat log
- Hotkey to expand/collapse
- Text input field for typing questions

### Backend (FastAPI on Render)

**API Endpoints**
- `POST /analyze` — screenshot (base64) + optional transcript -> agent response
- `POST /query` — text question about current/past context -> agent response
- `GET /context` — recent knowledge graph state from Neo4j
- `WebSocket /ws` — bidirectional streaming (stretch goal)

**Agent Brain**
- Model: OpenAI GPT-4o (fast, strong function calling)
- Pattern: direct function calling loop (no framework)
- Tools registered:

```python
tools = [
    {"name": "analyze_screen", "description": "Send screenshot to Reka Vision API"},
    {"name": "search_web", "description": "Search via Tavily for real-time info"},
    {"name": "remember", "description": "Store entity/relationship in Neo4j"},
    {"name": "recall", "description": "Query Neo4j for past context"},
]
```

- Proactive logic: after each screen analysis, LLM evaluates whether to surface an insight. Threshold: only speak up if confidence is high and the insight is actionable.

### Neo4j Knowledge Graph

**Hosting**: Neo4j AuraDB Free tier (cloud, no Docker needed)

**Schema**:
```cypher
(:Topic {name, category, first_seen, last_seen, mention_count})
(:App {name, type})  // e.g., "Discord", "VS Code", "Chrome"
(:WebPage {url, title, domain})
(:Insight {text, timestamp, confidence})

// Relationships
(topic)-[:SEEN_IN]->(app)
(topic)-[:MENTIONED_WITH]->(topic)
(topic)-[:FOUND_ON]->(webpage)
(insight)-[:ABOUT]->(topic)
(topic)-[:ACTIVE_DURING]->(session)
```

**Value**: Enables "what was I researching 2 hours ago?" and "what topics keep coming up together?" queries.

---

## Open Source Accelerators (use only what saves time)

| Library | Purpose | Why use it |
|---------|---------|------------|
| `python-mss` | Screenshot capture | 5 lines, 3ms, zero deps |
| `imagehash` | Frame diff detection | Avoid sending unchanged screens |
| Tkinter | Floating overlay | Built-in, zero deps, 50 lines for always-on-top |
| `keyboard` | Global hotkey capture | Push-to-talk trigger |
| `sounddevice` | Mic audio capture | Record voice for Modulate/Whisper |
| `RealtimeSTT` | Speech-to-text (stretch) | Only if time: drop-in Whisper wrapper with VAD |

**Not using**: OpenClaw, PicoClaw, Screenpipe, PyGPT, CrewAI, LangGraph, Pipecat (all add complexity without proportional time savings for 5.5 hours).

---

## Hackathon Time Budget (5.5 hours)

| Time Block | What to Build | Milestone |
|------------|---------------|-----------|
| **0:00–1:00** | Screenshot capture + Reka Vision API integration | Can screenshot desktop and get AI description |
| **1:00–2:00** | FastAPI backend + Tkinter floating overlay | Can send screenshots from client to backend, see responses in overlay |
| **2:00–3:00** | Agent brain with function calling + Tavily search | Agent can answer questions about screen AND search the web |
| **3:00–4:00** | Neo4j knowledge graph + proactive insights | Agent builds context graph, can recall past context, surfaces insights |
| **4:00–4:45** | Modulate voice integration + polish | Push-to-talk works, UX polished |
| **4:45–5:00** | Demo prep, bug fixes, submission | 3-minute demo recording ready |

---

## Demo Script (3 minutes)

1. **(0:00–0:30)** Intro: "Meet ScreenMind — an AI copilot that sees your entire desktop."
   Show the floating overlay. Explain it watches your screen continuously.

2. **(0:30–1:30)** Live demo: Browse several tabs (docs, Discord, code). Ask via voice: "What am I looking at right now?" Agent responds with accurate screen analysis via Reka.

3. **(1:30–2:15)** Autonomy: Agent proactively says "I noticed you've been researching Neo4j across 3 tabs — here's a summary." Show the Neo4j knowledge graph visualization of accumulated context.

4. **(2:15–2:45)** Search: "Find me more about [topic visible on screen]" -> Tavily real-time search -> contextual results in overlay.

5. **(2:45–3:00)** Architecture slide: 5 sponsor tools, the agent loop, what we built in 5.5 hours.

---

## Judging Alignment

| Criterion (20%) | How We Score |
|-----------------|-------------|
| **Autonomy** | Agent continuously monitors screen, builds knowledge graph in background, surfaces proactive insights without being asked |
| **Idea** | Universal productivity tool — everyone has a desktop, everyone context-switches. Real-world value is immediate |
| **Technical Implementation** | Vision API + LLM orchestration + graph DB + voice + real-time capture — technically dense |
| **Tool Use** | 5 sponsor tools deeply integrated (Reka, Tavily, Neo4j, Render, Modulate) |
| **Presentation** | Live demo showing real desktop interaction — visceral, easy to understand |
