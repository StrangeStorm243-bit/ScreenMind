# ScreenMind Architecture

```
Desktop Client (Python)                    Backend (FastAPI)
+----------------------------+             +------------------------------+
|                            |             |                              |
|  Screen Capture (mss)      |--screenshot->  Reka Vision API             |
|  every 5s + hash diffing   |             |    -> scene description      |
|                            |             |                              |
|  Floating Overlay          |             |  Fastino GLiNER2 (local)     |
|  (Tkinter, always-on-top)  |             |    -> entity extraction      |
|                            |             |    -> activity classification |
|  Text Input                |--text------->                              |
|                            |             |  LLM Agent Brain             |
|  Voice Input (Ctrl+Space)  |--audio------>  (Groq / OpenAI-compatible)  |
|  sounddevice + Whisper     |             |    -> function calling:      |
|                            |             |      - Tavily web search     |
|                            |<-response---      - Neo4j remember/recall |
+----------------------------+             |      - Reka re-analyze       |
                                           |                              |
                                           |  Neo4j Knowledge Graph       |
                                           |    -> topics, entities       |
                                           |    -> relationships          |
                                           |    -> temporal memory        |
                                           |                              |
                                           |  Deployed on Render          |
                                           +------------------------------+
```

## Data Flow

```
Screenshot (every 5s)
    |
    v
Reka Vision API --> "User has VS Code open with Python file..."
    |
    v
Fastino GLiNER2 --> {entities: [VS Code, Python], activity: coding, focus: deep}
    |
    v
Neo4j Graph --> MERGE (t:Topic {name: "VS Code"}) ...
    |
    v
LLM Agent (on user query) --> Uses context + tools --> Response
```

## Sponsor Tools

| Tool | Integration | Purpose |
|------|------------|---------|
| Reka Vision | Screenshot analysis | Understands desktop content |
| Tavily Search | Agent tool | Real-time web search |
| Neo4j | Knowledge graph | Persistent memory across sessions |
| Render | Cloud deployment | Backend hosting |
| Fastino GLiNER2 | Entity extraction | Local NER, classification, relations |
| OpenAI Whisper | Voice transcription | Push-to-talk input |
