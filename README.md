# ScreenMind

**A desktop-aware AI copilot that sees your screen and remembers your work context.**

## What It Does

- **Screenshots your desktop** on a loop, analyzes each frame with Reka Vision to understand what you're working on
- **Builds a persistent knowledge graph** in Neo4j — topics, apps, and relationships accumulate over time
- **Answers questions via voice or text** using an agent that combines screen context, web search, and graph memory

## Architecture

```
Desktop Client (Python)              Backend (FastAPI on Render)
┌──────────────────────┐            ┌──────────────────────────┐
│ Screen Capture (mss) │──screenshot──>│ Reka Vision API       │
│ Voice (Whisper)      │──audio──────>│ OpenAI Whisper         │
│ Floating Overlay     │<──response───│ Agent Brain (GPT-4o)   │
│ (Tkinter)            │              │   ├─ Tavily Search     │
└──────────────────────┘              │   └─ Neo4j Graph       │
                                      └──────────────────────────┘
```

## Sponsor Tools Used

| Tool | Role |
|------|------|
| **Reka Vision** | Analyze desktop screenshots — extract text, UI elements, and context |
| **Tavily Search** | Web search with AI summaries for real-time information retrieval |
| **Neo4j** | Graph database storing topics, apps, and relationships as persistent memory |
| **Render** | Cloud hosting for the FastAPI backend |
| **OpenAI** | Whisper for voice transcription, GPT-4o as the agent reasoning engine |

## Setup

```bash
git clone https://github.com/StrangeStorm243-bit/ScreenMind.git
cd ScreenMind
pip install -r requirements.txt
```

Copy `.env.example` to `.env` and fill in your API keys:

```
REKA_API_KEY=...
TAVILY_API_KEY=...
NEO4J_URI=...
NEO4J_USER=neo4j
NEO4J_PASSWORD=...
OPENAI_API_KEY=...
```

Run the backend and client:

```bash
python backend/server.py     # Start FastAPI backend
python -m screenmind.main    # Start desktop client
```

## Built At

Autonomous Agents Hackathon — Feb 27, 2026
