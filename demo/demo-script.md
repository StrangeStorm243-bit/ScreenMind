# ScreenMind Demo Script (3 minutes)

## Setup (before demo)
- Backend running: `python backend/server.py`
- Overlay running: `python -m screenmind.main`
- Have a browser, VS Code, and Discord open

---

## 0:00 - 0:30 | Introduction
> "ScreenMind is a desktop-aware AI copilot. It watches your screen, understands what you're doing, builds a knowledge graph of your work context, and lets you interact via text or voice."

- Show the floating overlay on screen (dark theme, always-on-top)
- Point out the status indicator: "Watching..." means it's capturing

## 0:30 - 1:00 | Screen Awareness
> "It captures screenshots every 5 seconds, analyzes them with Reka Vision, and extracts entities using Fastino GLiNER2 — all stored in a Neo4j knowledge graph."

- Switch between VS Code and a browser tab
- Show overlay status change to "Analyzing screen..."
- Type in overlay: **"What am I working on?"**
- Show the response references what's actually on screen

## 1:00 - 1:30 | Web Search Integration
> "ScreenMind can also search the web in real-time using Tavily when you need current information."

- Type in overlay: **"Search for the latest news about AI agents"**
- Show it returns Tavily search results with relevant info

## 1:30 - 2:00 | Knowledge Graph Memory
> "Everything ScreenMind observes gets stored in Neo4j. It can recall past context."

- Type: **"What have I been working on today?"**
- Show it recalls topics from Neo4j (apps, technologies, projects)
- Open browser to Neo4j dashboard or hit `/context` endpoint to show stored topics

## 2:00 - 2:30 | Voice Input
> "You can also use push-to-talk with Ctrl+Space. It records audio and transcribes with OpenAI Whisper."

- Press Ctrl+Space
- Say: "What is on my screen right now?"
- Show transcription appears and ScreenMind responds

## 2:30 - 3:00 | Architecture Recap
> "Under the hood: Reka Vision for screen understanding, Fastino GLiNER2 for entity extraction, Tavily for web search, Neo4j for persistent memory, Groq for LLM orchestration, and deployed on Render. Six tool integrations in a single desktop copilot."

- Show the architecture diagram
- End with: "ScreenMind — an AI that sees your desktop and remembers everything."
