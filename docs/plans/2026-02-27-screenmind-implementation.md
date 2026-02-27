# ScreenMind Implementation Plan — Parallel Execution

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a desktop-aware AI copilot that screenshots your screen, understands it via vision AI, builds a knowledge graph, and lets you interact via voice/text overlay.

**Architecture:** Python desktop client (mss + Tkinter overlay) sends screenshots to a FastAPI backend (local, then Render). Backend uses Reka Vision for screen analysis, OpenAI GPT-4o for agent orchestration with function calling, Tavily for web search, Neo4j AuraDB for knowledge graph memory, and OpenAI Whisper for voice transcription.

**Tech Stack:** Python 3.11+, FastAPI, Tkinter, python-mss, imagehash, reka-api, tavily-python, neo4j, openai, sounddevice, keyboard

---

## Execution Strategy: 4 Parallel Terminals (Solo)

You are a solo developer running 4 Claude Code terminals simultaneously. Each terminal has a dedicated lane with **non-overlapping files**. No two terminals ever touch the same file.

```
PHASE 1 (0:00-0:15)   Terminal 1 only — scaffold
PHASE 2 (0:15-1:30)   All 4 terminals — parallel module builds
PHASE 3 (1:30-1:45)   SYNC POINT — merge all work, resolve any issues
PHASE 4 (1:45-3:00)   Terminal 1 — integration (agent brain wiring)
                       Terminal 2-4 — testing + bug fixes on their modules
PHASE 5 (3:00-4:00)   Terminal 1 — deploy to Render
                       Terminal 2 — polish UX + error handling
                       Terminal 3 — README + architecture diagram
                       Terminal 4 — demo script prep
PHASE 6 (4:00-4:30)   All — final testing, demo recording, submit
```

### File Ownership Map

| File | Owner Terminal | Phase |
|------|---------------|-------|
| `requirements.txt` | T1 | Phase 1 |
| `screenmind/__init__.py` | T1 | Phase 1 |
| `screenmind/config.py` | T1 | Phase 1 |
| `.gitignore`, `.env` | T1 | Phase 1 |
| `screenmind/capture.py` | **T2** | Phase 2 |
| `screenmind/vision.py` | **T2** | Phase 2 |
| `screenmind/search.py` | **T3** | Phase 2 |
| `screenmind/graph.py` | **T3** | Phase 2 |
| `screenmind/overlay.py` | **T4** | Phase 2 |
| `screenmind/voice.py` | **T4** | Phase 2 |
| `backend/server.py` | **T1** | Phase 2 |
| `backend/__init__.py` | **T1** | Phase 2 |
| `backend/agent.py` | **T1** | Phase 4 |
| `screenmind/main.py` | **T1** | Phase 4 |
| `Procfile` | **T1** | Phase 5 |
| `README.md` | **T3** | Phase 5 |

---

## Prerequisites (do BEFORE the event — you have 5 hours)

### P1: Create Neo4j AuraDB Free Instance
1. Go to https://console.neo4j.io/
2. Sign up (Google/GitHub/email, no credit card)
3. Click "New Instance" -> "Create Free instance"
4. **Save credentials immediately**: username (neo4j), generated password, connection URI (`neo4j+s://xxxxx.databases.neo4j.io`)
5. Wait for "Running" status (~1-2 min)

### P2: Get API Keys
- **Reka**: Sign up at https://platform.reka.ai/ -> get API key
- **Tavily**: Sign up at https://tavily.com/ -> get API key (free: 1000 credits/month)
- **OpenAI**: Use existing key (for GPT-4o + Whisper)
- **Render**: Sign up at https://render.com/ (deploy later)

### P3: Create `.env` File (have this ready to paste)
```
REKA_API_KEY=your-key
TAVILY_API_KEY=your-key
OPENAI_API_KEY=your-key
NEO4J_URI=neo4j+s://xxxxx.databases.neo4j.io
NEO4J_USER=neo4j
NEO4J_PASSWORD=your-password
BACKEND_URL=http://localhost:8000
```

### P4: Pre-install dependencies (saves 5 min at event)
```bash
pip install python-mss imagehash Pillow reka-api tavily-python neo4j openai python-dotenv requests keyboard sounddevice scipy fastapi uvicorn pydantic
```

### P5: Create GitHub repo
```bash
# Create empty public repo on GitHub called "screenmind"
# Clone it locally to C:/GitHubProjects/hacks
```

---

## PHASE 1: Scaffold (0:00–0:15) — Terminal 1 Only

> **Terminal 1 prompt:** "Set up the project scaffold for ScreenMind. Create all files listed below exactly. Do NOT create any files outside this list. Commit when done."

### Create project structure

```
screenmind/
├── __init__.py          (empty)
├── config.py
backend/
├── __init__.py          (empty)
.env
.gitignore
requirements.txt
```

### `requirements.txt`

```
python-mss>=9.0.0
imagehash>=4.3.0
Pillow>=10.0.0
reka-api>=3.0.0
tavily-python>=0.5.0
neo4j>=5.0.0
openai>=1.0.0
python-dotenv>=1.0.0
requests>=2.31.0
keyboard>=0.13.5
sounddevice>=0.4.6
scipy>=1.11.0
fastapi>=0.100.0
uvicorn>=0.23.0
pydantic>=2.0.0
```

### `screenmind/config.py`

```python
import os
from dotenv import load_dotenv

load_dotenv()

REKA_API_KEY = os.getenv("REKA_API_KEY")
TAVILY_API_KEY = os.getenv("TAVILY_API_KEY")
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
NEO4J_URI = os.getenv("NEO4J_URI")
NEO4J_USER = os.getenv("NEO4J_USER", "neo4j")
NEO4J_PASSWORD = os.getenv("NEO4J_PASSWORD")

CAPTURE_INTERVAL = 2  # seconds
SCREENSHOT_WIDTH = 1280  # resize target
HASH_THRESHOLD = 10  # perceptual hash diff threshold
BACKEND_URL = os.getenv("BACKEND_URL", "http://localhost:8000")
```

### `.gitignore`

```
.env
__pycache__/
*.pyc
.venv/
screenshots/
*.wav
```

### Commit and install

```bash
pip install -r requirements.txt
git add -A
git commit -m "feat: project scaffold with dependencies and config"
git push origin main
```

**Signal to other terminals:** "Scaffold is done. Pull and start your lane."

---

## PHASE 2: Parallel Module Builds (0:15–1:30)

All 4 terminals start simultaneously. Each builds isolated modules. **No terminal touches another terminal's files.**

---

### TERMINAL 1: FastAPI Backend Shell

> **Prompt:** "You own `backend/server.py` only. Build the FastAPI backend server with placeholder endpoints. Follow the plan EXACTLY. Do NOT touch any file in `screenmind/`. Commit when done and verify the server runs."

**Files:** `backend/server.py` only

```python
import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(title="ScreenMind API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


class AnalyzeRequest(BaseModel):
    screenshot_b64: str
    user_message: str | None = None


class QueryRequest(BaseModel):
    message: str
    screenshot_b64: str | None = None


class AgentResponse(BaseModel):
    response: str
    proactive: bool = False
    sources: list[str] = []


@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/analyze", response_model=AgentResponse)
async def analyze(req: AnalyzeRequest):
    """Placeholder — will be wired to agent brain in Phase 4."""
    return AgentResponse(response="Analysis placeholder — agent brain not connected yet.")


@app.post("/query", response_model=AgentResponse)
async def query(req: QueryRequest):
    """Placeholder — will be wired to agent brain in Phase 4."""
    return AgentResponse(response="Query placeholder — agent brain not connected yet.")


@app.get("/context")
async def get_context():
    """Placeholder — will be wired to Neo4j in Phase 4."""
    return {"topics": [], "relationships": []}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
```

**Verify:**

```bash
python backend/server.py &
curl http://localhost:8000/health
# Expected: {"status":"ok"}
```

**Commit:**

```bash
git add backend/server.py
git commit -m "feat: FastAPI backend shell with placeholder endpoints"
```

---

### TERMINAL 2: Screen Capture + Reka Vision

> **Prompt:** "You own `screenmind/capture.py` and `screenmind/vision.py` only. Build both modules following the plan EXACTLY. Do NOT touch any other file. Verify each module works independently, then commit."

**File 1: `screenmind/capture.py`**

```python
import base64
import io
import mss
import imagehash
from PIL import Image
from screenmind.config import SCREENSHOT_WIDTH, HASH_THRESHOLD


class ScreenCapture:
    def __init__(self):
        self.sct = mss.mss()
        self.last_hash = None

    def capture(self) -> Image.Image:
        """Capture the primary monitor and return as PIL Image."""
        monitor = self.sct.monitors[1]  # primary monitor
        raw = self.sct.grab(monitor)
        img = Image.frombytes("RGB", raw.size, raw.bgra, "raw", "BGRX")
        # Resize to reduce payload
        ratio = SCREENSHOT_WIDTH / img.width
        new_size = (SCREENSHOT_WIDTH, int(img.height * ratio))
        return img.resize(new_size, Image.LANCZOS)

    def has_changed(self, img: Image.Image) -> bool:
        """Return True if screen has changed significantly since last capture."""
        current_hash = imagehash.phash(img)
        if self.last_hash is None:
            self.last_hash = current_hash
            return True
        diff = self.last_hash - current_hash
        self.last_hash = current_hash
        return diff > HASH_THRESHOLD

    def to_base64(self, img: Image.Image) -> str:
        """Convert PIL Image to base64 JPEG string."""
        buffer = io.BytesIO()
        img.save(buffer, format="JPEG", quality=80)
        return base64.b64encode(buffer.getvalue()).decode("utf-8")
```

**Verify capture.py:**

```bash
python -c "from screenmind.capture import ScreenCapture; sc = ScreenCapture(); img = sc.capture(); print(f'Captured {img.size}'); print(f'Changed: {sc.has_changed(img)}'); print(f'Base64 len: {len(sc.to_base64(img))}')"
```

Expected: `Captured (1280, ...)`, `Changed: True`, `Base64 len: ...`

**Commit:**

```bash
git add screenmind/capture.py
git commit -m "feat: screenshot capture with perceptual hash change detection"
```

**File 2: `screenmind/vision.py`**

```python
from reka.client import Reka
from reka import ChatMessage
from screenmind.config import REKA_API_KEY


client = Reka(api_key=REKA_API_KEY)


def analyze_screenshot(base64_image: str, question: str = None) -> str:
    """Send a screenshot to Reka Vision and get a description."""
    prompt = question or (
        "Describe what you see on this desktop screenshot. "
        "Include: which applications are open, what content is visible, "
        "what the user appears to be working on. Be concise but thorough."
    )

    response = client.chat.create(
        model="reka-flash-3",
        messages=[
            ChatMessage(
                role="user",
                content=[
                    {
                        "type": "image_url",
                        "image_url": f"data:image/jpeg;base64,{base64_image}",
                    },
                    {"type": "text", "text": prompt},
                ],
            )
        ],
    )
    return response.responses[0].message.content
```

**Verify vision.py (requires Reka API key in .env):**

```bash
python -c "
from screenmind.capture import ScreenCapture
from screenmind.vision import analyze_screenshot
sc = ScreenCapture()
img = sc.capture()
b64 = sc.to_base64(img)
result = analyze_screenshot(b64)
print(result[:200])
"
```

Expected: Reka returns a text description of the current desktop.

**Commit:**

```bash
git add screenmind/vision.py
git commit -m "feat: Reka Vision API integration for screenshot analysis"
```

---

### TERMINAL 3: Tavily Search + Neo4j Graph

> **Prompt:** "You own `screenmind/search.py` and `screenmind/graph.py` only. Build both modules following the plan EXACTLY. Do NOT touch any other file. Verify each module works independently, then commit."

**File 1: `screenmind/search.py`**

```python
from tavily import TavilyClient
from screenmind.config import TAVILY_API_KEY

client = TavilyClient(api_key=TAVILY_API_KEY)


def search_web(query: str, max_results: int = 5) -> list[dict]:
    """Search the web via Tavily and return results."""
    response = client.search(
        query=query,
        search_depth="basic",
        max_results=max_results,
        include_answer=True,
    )
    results = []
    if response.get("answer"):
        results.append({"title": "AI Summary", "content": response["answer"], "url": ""})
    for r in response.get("results", []):
        results.append({
            "title": r.get("title", ""),
            "content": r.get("content", ""),
            "url": r.get("url", ""),
        })
    return results
```

**Verify search.py:**

```bash
python -c "from screenmind.search import search_web; r = search_web('what is Neo4j graph database', 3); print(r[0]['title'], r[0]['content'][:100])"
```

Expected: Returns search results with titles and content.

**Commit:**

```bash
git add screenmind/search.py
git commit -m "feat: Tavily search integration"
```

**File 2: `screenmind/graph.py`**

```python
import json
from datetime import datetime, timezone
from neo4j import GraphDatabase
from screenmind.config import NEO4J_URI, NEO4J_USER, NEO4J_PASSWORD

driver = GraphDatabase.driver(NEO4J_URI, auth=(NEO4J_USER, NEO4J_PASSWORD))


def init_graph():
    """Create indexes for faster lookups."""
    with driver.session() as session:
        session.run("CREATE INDEX topic_name IF NOT EXISTS FOR (t:Topic) ON (t.name)")
        session.run("CREATE INDEX app_name IF NOT EXISTS FOR (a:App) ON (a.name)")


def remember_topic(topic: str, category: str, details: str, related_to: list[str] = None) -> str:
    """Store a topic in the knowledge graph. Returns confirmation."""
    now = datetime.now(timezone.utc).isoformat()

    with driver.session() as session:
        session.run("""
            MERGE (t:Topic {name: $name})
            ON CREATE SET t.category = $category, t.details = $details,
                          t.first_seen = $now, t.last_seen = $now, t.mention_count = 1
            ON MATCH SET t.last_seen = $now, t.mention_count = t.mention_count + 1,
                         t.details = $details
        """, name=topic, category=category, details=details, now=now)

        if related_to:
            for related in related_to:
                session.run("""
                    MERGE (t1:Topic {name: $name1})
                    MERGE (t2:Topic {name: $name2})
                    MERGE (t1)-[:RELATED_TO]->(t2)
                """, name1=topic, name2=related)

    return f"Stored: {topic} ({category}) with {len(related_to or [])} relationships"


def recall_topics(query: str) -> str:
    """Search the knowledge graph for topics matching the query."""
    with driver.session() as session:
        records = session.run("""
            MATCH (t:Topic)
            WHERE toLower(t.name) CONTAINS toLower($query)
               OR toLower(t.details) CONTAINS toLower($query)
            OPTIONAL MATCH (t)-[:RELATED_TO]-(related:Topic)
            RETURN t.name AS name, t.category AS category, t.details AS details,
                   t.first_seen AS first_seen, t.last_seen AS last_seen,
                   t.mention_count AS mentions,
                   collect(DISTINCT related.name) AS related_topics
            ORDER BY t.last_seen DESC
            LIMIT 10
        """, query=query).data()

    if not records:
        return "No matching topics found in memory."
    return json.dumps(records, indent=2, default=str)


def get_recent_context(limit: int = 20) -> list[dict]:
    """Get the most recently active topics for the /context endpoint."""
    with driver.session() as session:
        records = session.run("""
            MATCH (t:Topic)
            OPTIONAL MATCH (t)-[r:RELATED_TO]-(related:Topic)
            RETURN t.name AS name, t.category AS category,
                   t.mention_count AS mentions, t.last_seen AS last_seen,
                   collect(DISTINCT related.name) AS related
            ORDER BY t.last_seen DESC
            LIMIT $limit
        """, limit=limit).data()
    return records


def close():
    driver.close()
```

**Verify graph.py (requires Neo4j AuraDB credentials in .env):**

```bash
python -c "
from screenmind.graph import init_graph, remember_topic, recall_topics
init_graph()
print(remember_topic('Neo4j', 'technology', 'Graph database for knowledge graphs', ['databases', 'AI']))
print(recall_topics('Neo4j'))
"
```

Expected: Stores a topic and recalls it with relationships.

**Commit:**

```bash
git add screenmind/graph.py
git commit -m "feat: Neo4j knowledge graph with remember/recall/context"
```

---

### TERMINAL 4: Overlay UI + Voice Input

> **Prompt:** "You own `screenmind/overlay.py` and `screenmind/voice.py` only. Build both modules following the plan EXACTLY. Do NOT touch any other file. Verify each module works independently, then commit."

**File 1: `screenmind/overlay.py`**

```python
import threading
import tkinter as tk
from tkinter import scrolledtext


class Overlay:
    def __init__(self, on_submit=None):
        self.on_submit = on_submit  # callback(text) -> str
        self.root = tk.Tk()
        self.root.title("ScreenMind")
        self.root.attributes("-topmost", True)
        self.root.geometry("380x500+50+50")
        self.root.configure(bg="#1a1a2e")
        self.root.resizable(True, True)

        # Status label
        self.status_var = tk.StringVar(value="Idle")
        self.status_label = tk.Label(
            self.root,
            textvariable=self.status_var,
            fg="#00d4ff",
            bg="#1a1a2e",
            font=("Consolas", 10, "bold"),
        )
        self.status_label.pack(pady=(10, 5))

        # Chat display
        self.chat_display = scrolledtext.ScrolledText(
            self.root,
            wrap=tk.WORD,
            bg="#16213e",
            fg="#e0e0e0",
            font=("Consolas", 10),
            insertbackground="#e0e0e0",
            relief=tk.FLAT,
            padx=10,
            pady=10,
        )
        self.chat_display.pack(fill=tk.BOTH, expand=True, padx=10, pady=5)
        self.chat_display.config(state=tk.DISABLED)

        # Input frame
        input_frame = tk.Frame(self.root, bg="#1a1a2e")
        input_frame.pack(fill=tk.X, padx=10, pady=(5, 10))

        self.input_field = tk.Entry(
            input_frame,
            bg="#16213e",
            fg="#e0e0e0",
            font=("Consolas", 10),
            insertbackground="#e0e0e0",
            relief=tk.FLAT,
        )
        self.input_field.pack(side=tk.LEFT, fill=tk.X, expand=True, ipady=5)
        self.input_field.bind("<Return>", self._on_enter)

        send_btn = tk.Button(
            input_frame,
            text="Send",
            command=self._on_send,
            bg="#00d4ff",
            fg="#1a1a2e",
            font=("Consolas", 9, "bold"),
            relief=tk.FLAT,
        )
        send_btn.pack(side=tk.RIGHT, padx=(5, 0))

    def _on_enter(self, event):
        self._on_send()

    def _on_send(self):
        text = self.input_field.get().strip()
        if not text:
            return
        self.input_field.delete(0, tk.END)
        self.add_message(f"You: {text}")
        if self.on_submit:
            self.set_status("Thinking...")
            threading.Thread(target=self._handle_submit, args=(text,), daemon=True).start()

    def _handle_submit(self, text):
        try:
            response = self.on_submit(text)
            self.add_message(f"ScreenMind: {response}")
        except Exception as e:
            self.add_message(f"Error: {e}")
        finally:
            self.set_status("Idle")

    def add_message(self, message: str):
        """Thread-safe message addition."""
        def _add():
            self.chat_display.config(state=tk.NORMAL)
            self.chat_display.insert(tk.END, message + "\n\n")
            self.chat_display.see(tk.END)
            self.chat_display.config(state=tk.DISABLED)
        self.root.after(0, _add)

    def set_status(self, status: str):
        """Thread-safe status update."""
        self.root.after(0, lambda: self.status_var.set(status))

    def run(self):
        self.root.mainloop()
```

**Verify overlay.py:**

```bash
python -c "
from screenmind.overlay import Overlay
o = Overlay(on_submit=lambda t: f'Echo: {t}')
o.add_message('ScreenMind: Overlay test. Type something and press Enter.')
o.root.after(5000, o.root.destroy)  # auto-close after 5s
o.run()
"
```

Expected: Floating overlay window appears, dark theme, can type text.

**Commit:**

```bash
git add screenmind/overlay.py
git commit -m "feat: Tkinter floating overlay with dark theme UI"
```

**File 2: `screenmind/voice.py`**

```python
import io
import tempfile
import sounddevice as sd
from scipy.io.wavfile import write as write_wav
from openai import OpenAI
from screenmind.config import OPENAI_API_KEY

client = OpenAI(api_key=OPENAI_API_KEY)

SAMPLE_RATE = 16000
CHANNELS = 1


def record_audio(duration: float = 5.0) -> bytes:
    """Record audio from microphone for the given duration. Returns WAV bytes."""
    recording = sd.rec(
        int(duration * SAMPLE_RATE),
        samplerate=SAMPLE_RATE,
        channels=CHANNELS,
        dtype="int16",
    )
    sd.wait()

    buffer = io.BytesIO()
    write_wav(buffer, SAMPLE_RATE, recording)
    return buffer.getvalue()


def transcribe(audio_bytes: bytes) -> str:
    """Transcribe audio bytes using OpenAI Whisper."""
    with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as f:
        f.write(audio_bytes)
        f.flush()
        with open(f.name, "rb") as audio_file:
            transcript = client.audio.transcriptions.create(
                model="whisper-1",
                file=audio_file,
            )
    return transcript.text


def listen_and_transcribe(duration: float = 5.0) -> str:
    """Record from mic and return transcription."""
    audio = record_audio(duration)
    return transcribe(audio)
```

**Verify voice.py:**

```bash
python -c "from screenmind.voice import listen_and_transcribe; print('Speak now...'); t = listen_and_transcribe(3.0); print(f'Transcribed: {t}')"
```

Expected: Records 3 seconds of audio, transcribes it.

**Commit:**

```bash
git add screenmind/voice.py
git commit -m "feat: push-to-talk voice input via OpenAI Whisper"
```

---

## PHASE 3: Sync Point (1:30–1:45)

> **You (human) do this manually. Stop all terminals.**

```bash
# In any terminal:
git add -A
git status                    # check for conflicts
git commit -m "sync: all parallel modules complete"
git push origin main

# Verify all files exist:
ls screenmind/capture.py screenmind/vision.py screenmind/search.py screenmind/graph.py screenmind/overlay.py screenmind/voice.py backend/server.py
```

**Quick smoke test each module:**

```bash
# Capture
python -c "from screenmind.capture import ScreenCapture; print('capture OK')"

# Vision
python -c "from screenmind.vision import analyze_screenshot; print('vision OK')"

# Search
python -c "from screenmind.search import search_web; print('search OK')"

# Graph
python -c "from screenmind.graph import init_graph; print('graph OK')"

# Overlay
python -c "from screenmind.overlay import Overlay; print('overlay OK')"

# Voice
python -c "from screenmind.voice import listen_and_transcribe; print('voice OK')"

# Backend
python -c "from backend.server import app; print('server OK')"
```

If anything fails, fix it before proceeding to Phase 4.

---

## PHASE 4: Integration — Agent Brain (1:45–3:00)

### TERMINAL 1: Agent Brain + main.py (THE CRITICAL PATH)

> **Prompt:** "You own `backend/agent.py` and `screenmind/main.py`. Wire all modules together into the agent brain and the client entry point. Follow the plan EXACTLY. All module files (`capture.py`, `vision.py`, `search.py`, `graph.py`, `overlay.py`, `voice.py`) already exist and are tested. Import from them. Also update `backend/server.py` to wire in the agent. Verify the full end-to-end flow works."

**File 1: `backend/agent.py`**

```python
import json
from openai import OpenAI
from screenmind.vision import analyze_screenshot
from screenmind.search import search_web
from screenmind.config import OPENAI_API_KEY

client = OpenAI(api_key=OPENAI_API_KEY)

# Conversation history (simple in-memory, per-session)
conversation_history = []
last_screen_description = ""

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
                    "category": {"type": "string", "description": "Category: app, webpage, concept, project, person"},
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
        return remember_topic(args["topic"], args["category"], args["details"], args.get("related_to", []))
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
    else:
        context_msg = f"[Last known screen: {last_screen_description}]" if last_screen_description else ""

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
            "content": "Based on what you see on the screen, is there anything useful you should proactively tell the user? If not, respond with just 'NO_INSIGHT'. Only speak up if you have something genuinely helpful.",
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
```

**Update `backend/server.py` endpoints** — replace the three placeholder endpoints:

```python
@app.post("/analyze", response_model=AgentResponse)
async def analyze(req: AnalyzeRequest):
    from backend.agent import run_agent
    result = run_agent(screenshot_b64=req.screenshot_b64, user_message=req.user_message)
    return AgentResponse(
        response=result["response"],
        proactive=result.get("proactive", False),
    )


@app.post("/query", response_model=AgentResponse)
async def query(req: QueryRequest):
    from backend.agent import run_agent
    result = run_agent(screenshot_b64=req.screenshot_b64, user_message=req.message)
    return AgentResponse(response=result["response"])


@app.get("/context")
async def get_context():
    from screenmind.graph import get_recent_context
    return {"topics": get_recent_context()}
```

**File 2: `screenmind/main.py`**

```python
import threading
import time
import requests
import keyboard
from screenmind.config import BACKEND_URL, CAPTURE_INTERVAL
from screenmind.capture import ScreenCapture
from screenmind.overlay import Overlay


capture = ScreenCapture()


def handle_user_message(text: str) -> str:
    """Send user message + current screenshot to backend."""
    img = capture.capture()
    b64 = capture.to_base64(img)
    try:
        resp = requests.post(
            f"{BACKEND_URL}/analyze",
            json={"screenshot_b64": b64, "user_message": text},
            timeout=60,
        )
        return resp.json().get("response", "No response")
    except Exception as e:
        return f"Backend error: {e}"


def background_capture(overlay: Overlay):
    """Periodically capture screen and send for analysis if changed."""
    while True:
        try:
            img = capture.capture()
            if capture.has_changed(img):
                b64 = capture.to_base64(img)
                overlay.set_status("Analyzing screen...")
                resp = requests.post(
                    f"{BACKEND_URL}/analyze",
                    json={"screenshot_b64": b64},
                    timeout=60,
                )
                data = resp.json()
                if data.get("proactive") and data.get("response"):
                    overlay.add_message(f"ScreenMind: {data['response']}")
                overlay.set_status("Watching...")
            else:
                overlay.set_status("Watching...")
        except Exception:
            overlay.set_status("Watching...")
        time.sleep(CAPTURE_INTERVAL)


def main():
    overlay = Overlay(on_submit=handle_user_message)

    # Start background capture thread
    bg_thread = threading.Thread(target=background_capture, args=(overlay,), daemon=True)
    bg_thread.start()

    # Push-to-talk voice input
    def on_push_to_talk():
        overlay.add_message("Listening... (5 seconds)")
        overlay.set_status("Listening...")
        try:
            from screenmind.voice import listen_and_transcribe
            text = listen_and_transcribe(5.0)
            if text.strip():
                overlay.add_message(f"You (voice): {text}")
                overlay.set_status("Thinking...")
                response = handle_user_message(text)
                overlay.add_message(f"ScreenMind: {response}")
        except Exception as e:
            overlay.add_message(f"Voice error: {e}")
        overlay.set_status("Watching...")

    keyboard.add_hotkey("ctrl+space", lambda: threading.Thread(target=on_push_to_talk, daemon=True).start())

    overlay.add_message("ScreenMind: I'm watching your screen. Ask me anything!")
    overlay.add_message("ScreenMind: Press Ctrl+Space for voice input.")
    overlay.run()


if __name__ == "__main__":
    main()
```

**Verify full end-to-end:**

```bash
# Terminal A: start backend
python backend/server.py

# Terminal B: start client
python -m screenmind.main

# In the overlay:
# 1. Type "what's on my screen?" -> should get Reka Vision description
# 2. Type "search for latest AI agent news" -> should get Tavily results
# 3. Wait 10 seconds -> should see proactive insights appear
# 4. Press Ctrl+Space -> speak -> should transcribe and respond
```

**Commit:**

```bash
git add backend/agent.py backend/server.py screenmind/main.py
git commit -m "feat: agent brain with function calling, full client wiring"
```

---

### TERMINAL 2: Module Bug Fixes (Phase 4)

> **Prompt:** "Test `screenmind/capture.py` and `screenmind/vision.py` thoroughly. Fix any bugs. Test edge cases: what happens with multiple monitors? What if the Reka API returns an error? Add basic error handling. Only modify files you own."

---

### TERMINAL 3: Module Bug Fixes (Phase 4)

> **Prompt:** "Test `screenmind/search.py` and `screenmind/graph.py` thoroughly. Fix any bugs. Test: what if Tavily returns no results? What if Neo4j connection drops? Initialize the graph indexes. Only modify files you own."

---

### TERMINAL 4: Module Bug Fixes (Phase 4)

> **Prompt:** "Test `screenmind/overlay.py` and `screenmind/voice.py` thoroughly. Fix any bugs. Test: what if mic is not available? What about overlay on different screen sizes? Improve the UI if time permits (better colors, status animations). Only modify files you own."

---

## PHASE 5: Deploy + Polish (3:00–4:00)

### TERMINAL 1: Deploy to Render

> **Prompt:** "Deploy the backend to Render. Create a Procfile, push to GitHub, configure Render web service. Verify the deployed API responds."

**Create `Procfile` in project root:**

```
web: uvicorn backend.server:app --host 0.0.0.0 --port $PORT
```

**Deploy steps:**

1. `git push origin main` (ensure all code is pushed)
2. Go to https://dashboard.render.com/ -> New -> Web Service
3. Connect GitHub repo `screenmind`
4. Settings:
   - Build command: `pip install -r requirements.txt`
   - Start command: `uvicorn backend.server:app --host 0.0.0.0 --port $PORT`
   - Add environment variables: `REKA_API_KEY`, `TAVILY_API_KEY`, `OPENAI_API_KEY`, `NEO4J_URI`, `NEO4J_USER`, `NEO4J_PASSWORD`
5. Deploy

**Verify:**

```bash
curl https://screenmind-xxxx.onrender.com/health
# Expected: {"status":"ok"}
```

**Update `.env`:**

```
BACKEND_URL=https://screenmind-xxxx.onrender.com
```

**Commit:**

```bash
git add Procfile
git commit -m "feat: Render deployment config"
```

---

### TERMINAL 2: Polish UX + Error Handling

> **Prompt:** "Improve error handling across all screenmind modules. Add try/except around API calls that could fail. Make the overlay show user-friendly error messages instead of tracebacks. Only modify files in `screenmind/`."

---

### TERMINAL 3: README + Architecture Diagram

> **Prompt:** "Create README.md for the ScreenMind project. Include: project description, architecture diagram (ASCII), sponsor tools used (Reka, Tavily, Neo4j, Render), setup instructions, how to run. Keep it concise. Only create `README.md`."

---

### TERMINAL 4: Demo Script Prep

> **Prompt:** "Create `demo/demo-script.md` with the exact 3-minute demo script. Include what to show, what to say, timing marks. Also create `demo/architecture.md` with a clean architecture diagram for the presentation slide."

---

## PHASE 6: Final Testing + Submit (4:00–4:30)

> **All terminals stop coding. You (human) do final testing.**

### Checklist

- [ ] Backend running on Render (health check passes)
- [ ] Client connects to Render backend (not localhost)
- [ ] Type a question -> get response with screen context
- [ ] Tavily search works ("search for X")
- [ ] Neo4j stores and recalls topics (check via /context endpoint)
- [ ] Proactive insights appear when switching tabs
- [ ] Push-to-talk voice works (Ctrl+Space)
- [ ] GitHub repo is public
- [ ] Record 3-minute demo
- [ ] Submit on Devpost

---

## STRETCH GOAL: Fastino GLiNER2 — Local Entity Extraction (15–20 min)

> **When:** Only after core project works end-to-end (Phase 6 checklist passes). Slot into remaining Phase 5/6 time.

### What It Does

[Fastino GLiNER2](https://fastino.ai/) is a 205M-parameter model that extracts entities, classifies text, parses structured JSON, and extracts relations — all in a single forward pass on CPU (<150ms). No API key needed for the base model.

### Why Add It

- **Reduces GPT-4o calls**: entities extracted locally instead of burning an LLM call per screenshot cycle
- **Enriches the knowledge graph**: auto-populates Neo4j with structured entities from every screen description
- **Adds another tool integration**: strengthens the "Tool Use" judging criterion
- **Zero breaking changes**: purely additive, sits between Reka output and GPT-4o input

### Architecture Change

```
Reka Vision → screen description (text)
    ↓
Fastino GLiNER2 → extract entities, relations, classify activity  ← NEW
    ↓
Auto-store entities in Neo4j (skip GPT-4o for this)
    ↓
GPT-4o agent brain (now with richer structured context)
```

### Installation

Add to `requirements.txt`:

```
gliner2>=1.2.0
```

```bash
pip install gliner2
```

### Implementation — `backend/agent.py` only

Add a pre-processing function before the `run_agent()` call:

```python
from gliner2 import GLiNER2

gliner = GLiNER2.from_pretrained("fastino/gliner2-base-v1")

def extract_screen_entities(screen_description: str) -> dict:
    """Pre-extract entities from Reka's screen description using Fastino GLiNER2."""
    entities = gliner.extract_entities(
        screen_description,
        ["application", "person", "technology", "website", "project", "error_message"],
        include_confidence=True,
    )

    classification = gliner.classify_text(
        screen_description,
        {
            "activity": ["coding", "browsing", "reading_docs", "chatting", "email", "design"],
            "focus_level": ["deep_focus", "multitasking", "idle"],
        },
    )

    relations = gliner.extract_relations(
        screen_description,
        ["uses", "related_to", "working_on"],
    )

    return {
        "entities": entities,
        "classification": classification,
        "relations": relations,
    }
```

Then wire it into `run_agent()`:

```python
def run_agent(screenshot_b64: str = None, user_message: str = None) -> dict:
    global last_screen_description

    if screenshot_b64:
        screen_desc = analyze_screenshot(screenshot_b64)
        last_screen_description = screen_desc

        # Fastino: auto-extract and store entities without GPT-4o
        extracted = extract_screen_entities(screen_desc)
        for entity_type, items in extracted["entities"].get("entities", {}).items():
            for item in items:
                name = item if isinstance(item, str) else item.get("text", "")
                if name:
                    from screenmind.graph import remember_topic
                    remember_topic(name, entity_type, f"Seen on screen: {entity_type}", [])

        context_msg = (
            f"[Current screen shows: {screen_desc}]\n"
            f"[Extracted entities: {extracted['entities']}]\n"
            f"[Activity: {extracted['classification']}]"
        )
    # ... rest unchanged
```

### Verify

```bash
python -c "
from gliner2 import GLiNER2
ext = GLiNER2.from_pretrained('fastino/gliner2-base-v1')
r = ext.extract_entities('VS Code open with Python file, Chrome tab showing Neo4j docs', ['application', 'technology'])
print(r)
"
```

Expected: `{'entities': {'application': ['VS Code', 'Chrome'], 'technology': ['Python', 'Neo4j']}}`

### Commit

```bash
git add backend/agent.py requirements.txt
git commit -m "feat: Fastino GLiNER2 for local entity extraction (stretch goal)"
```

---

## Summary: Sponsor Tools

| Tool | Where Used | Verified At |
|------|-----------|-------------|
| **Reka Vision** | `screenmind/vision.py` — every screenshot analysis | Phase 2 (T2) |
| **Tavily Search** | `screenmind/search.py` — agent's search_web tool | Phase 2 (T3) |
| **Neo4j** | `screenmind/graph.py` — remember/recall knowledge graph | Phase 2 (T3) |
| **Render** | `backend/` — deployed FastAPI backend | Phase 5 (T1) |
| *OpenAI* | Agent brain (GPT-4o) + voice (Whisper) | Phase 4 (T1) |
| *Fastino GLiNER2* | `backend/agent.py` — local entity extraction from screen descriptions | Stretch Goal |

## Time Savings from Parallelization

| Approach | Estimated Time |
|----------|---------------|
| Sequential (original plan) | ~5.5 hours |
| 4 parallel terminals | **~3.5 hours** (leaves 2 hours for polish + demo) |
| **Time saved** | **~2 hours** |
