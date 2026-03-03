# ScreenMind Demo Video v2 — Design Document

## Overview
90-second (1 min 30 sec) Remotion video. Dark tech aesthetic throughout.
Replaces the existing 2-minute video with a tighter, more visually impressive cut.

**Total:** 2700 frames at 30fps = 90 seconds

---

## Visual Style
- **Background:** Dark (#0D1117) with subtle dot grid pattern
- **Accents:** Neon glow effects — cyan (#00D4FF), magenta (#FF006E), amber (#F59E0B)
- **Text:** Monospace (JetBrains Mono or similar via Google Fonts) for technical content, Inter/sans-serif for titles
- **Animations:** Spring physics for entries, interpolate for fades, particle effects for data flow
- **Brand colors:** Reka=#E13238 (red), Fastino=#F59E0B (amber), Neo4j=#018BFF (blue), LLM=#06D6A0 (green), Tavily=#7209B7 (purple)

---

## Scene Breakdown

### Scene 1: The Problem (0:00–0:20, 600 frames)

**Purpose:** Establish why ChatGPT fails and position ScreenMind as the answer.

**Beat 1 (frames 0–150):** App windows scatter
- 6-8 translucent app window outlines (VS Code, Chrome, Slack, Figma, etc.) drift across dark background
- Each window is a ghost/outline style — borders glow faintly
- Staggered spring entry with slight rotations

**Beat 2 (frames 150–350):** ChatGPT fails
- Center: mock ChatGPT-style chat bubble appears
- User message types out: "What was I researching earlier?"
- AI response types out: "I don't have access to your screen or browsing history."
- Red X or error glow on the response — this is the pain point
- Side text fades in: "Your AI is blind to your workflow"

**Beat 3 (frames 350–550):** ScreenMind enters
- All app windows and ChatGPT mock dissolve/fade
- Brain emoji (🧠) scales up from center with spring + glow
- "ScreenMind" text appears below
- Tagline types out: "An AI that sees your screen and remembers everything"

**Beat 4 (frames 550–600):** Transition
- Fade to full dark for clean transition

---

### Scene 2: Reka Vision Capture Pipeline (0:20–0:40, 600 frames)

**Purpose:** Show how screenshots are captured, change-detected, and analyzed.

**Layout:** Left-to-right horizontal pipeline flow

**Beat 1 (frames 0–120):** Title + Screen Capture
- Title: "Step 1: Always Watching" with Reka red accent
- Left side: mock desktop screenshot thumbnail appears (dark card with colored blocks)
- Label: "📸 mss capture — every 5 seconds"
- A pulsing timer counts: 5s...10s...15s...

**Beat 2 (frames 120–280):** Perceptual Hash Change Detection
- Two screenshot thumbnails side by side
- Below each: a row of 8 hash blocks (colored squares representing hash bits)
- Hash blocks animate in, some matching (green) some different (red)
- Text: "pHash Δ = 12 > threshold (8)"
- Arrow + label: "Change detected → analyze"

**Beat 3 (frames 280–450):** Reka Vision API Processing
- Screenshot thumbnail slides right, feeds into a glowing "Reka Vision" node (red border)
- Terminal-style output scrolls line by line in a dark card:
  ```
  > APPLICATION: VS Code
  > WINDOW_TITLE: agent.py — ScreenMind
  > CONTENT: Python function run_agent()
  > ACTIVITY: coding
  ```
- Each line appears with a brief delay (typewriter)

**Beat 4 (frames 450–600):** Pipeline Summary
- Bottom pipeline label glows in:
  "📸 Capture → 🔑 pHash → 👁️ Reka Vision → 📝 Structured Description"
- Data particles (small dots) flow along the pipeline path left to right

---

### Scene 3: Fastino GLiNER2 Entity Extraction (0:40–0:55, 450 frames)

**Purpose:** Show how entities are extracted from Reka's output.

**Layout:** Left=input, Center=processing, Right=output

**Beat 1 (frames 0–80):** Title + Input
- Title: "Step 2: Understanding Context" with Fastino amber accent
- Left: Reka output card from previous scene (smaller, dark card)
- Arrow pointing right toward center

**Beat 2 (frames 80–220):** GLiNER2 Processing
- Center: "Fastino GLiNER2" node pulses amber
- Words in the Reka output highlight/glow one by one as they're "scanned"
- Extracted entities fly out rightward as color-coded badges:
  - 🔵 "VS Code" [application] — blue
  - 🟣 "Python" [technology] — purple
  - 🟣 "run_agent" [technology] — purple
  - 🟡 "coding" [activity] — amber
- Each badge springs in with staggered delay
- Small confidence scores pulse next to each: "0.94", "0.87", etc.

**Beat 3 (frames 220–340):** Three Operations
- Below the main flow, three small cards appear side by side:
  1. "Entity Extraction" — list of entity types
  2. "Classification" — activity: coding, focus: deep_focus
  3. "Relation Extraction" — "VS Code → uses → Python"
- Cards spring in with stagger

**Beat 4 (frames 340–450):** Flow continues
- All entities compress into a data stream flowing rightward
- Pipeline label updates: "👁️ Reka → 🏷️ GLiNER2 → entities + relations"
- Particle flow along bottom

---

### Scene 4: Neo4j Knowledge Graph + RAG (0:55–1:15, 600 frames)

**Purpose:** Show knowledge storage and intelligent retrieval.

**Layout:** Two phases — storage then retrieval

**Phase A: Storage (frames 0–300)**

**Beat 1 (frames 0–100):** Title + Entity Input
- Title: "Step 3: Building Memory" with Neo4j blue accent
- Entity badges from Scene 3 flow in from left

**Beat 2 (frames 100–300):** Graph Construction
- Center: animated Neo4j-style graph builds itself
- Central node: "ScreenCapture" (larger, blue glow, timestamp label)
- Topic nodes spring outward connected by MENTIONS edges:
  - "VS Code" (application) — connected
  - "Python" (technology) — connected
  - "run_agent" (technology) — connected
  - "coding" (activity) — connected
- Additional nodes from "previous captures" fade in around edges:
  - "React", "Chrome", "API Design"
- RELATED_TO edges draw between related topics (e.g., Python ↔ React)
- Edges animate from source to target (SVG line drawing)

**Phase B: RAG Retrieval (frames 300–600)**

**Beat 3 (frames 300–400):** User Query
- Bottom: chat input appears — user types "What was I coding earlier?"
- Query text glows and sends a pulse into the graph

**Beat 4 (frames 400–500):** Graph Search
- Relevant nodes light up (VS Code, Python, coding, run_agent)
- MENTIONS edges glow showing traversal path
- Matched ScreenCapture nodes highlight with scores
- Text: "Top 5 relevant contexts retrieved"

**Beat 5 (frames 500–600):** Speed Comparison
- Two boxes side by side:
  - Left (red tint): "Without RAG: Screenshot → Reka → LLM = 8-9s"
  - Right (green tint): "With RAG: Query → Neo4j → LLM = 4-5s"
- Big badge: "50% FASTER" with glow pulse
- Pipeline: "🔍 Query → 🕸️ Neo4j RAG → 🧠 LLM → 💬 Response"

---

### Scene 5: Complete Pipeline + Closing (1:15–1:30, 450 frames)

**Purpose:** Show full architecture, credits, sponsors.

**Beat 1 (frames 0–200):** Full Pipeline
- Horizontal pipeline with all 7 tool nodes, evenly spaced:
  1. 📸 mss Capture (gray)
  2. 🔑 pHash Detection (gray)
  3. 👁️ Reka Vision (red)
  4. 🏷️ Fastino GLiNER2 (amber)
  5. 🕸️ Neo4j AuraDB (blue)
  6. 🔍 Tavily Search (purple)
  7. 🧠 LLM Agent (green)
- Connecting arrows draw between each with glow
- Data particles stream continuously left to right
- Each node pulses in its brand color

**Beat 2 (frames 200–350):** Credits
- Pipeline compresses upward
- Center: 🧠 ScreenMind logo
- "Built in 5.5 hours at the Autonomous Agents Hackathon"
- Sponsor badges appear in a row: Reka, Fastino, Tavily, Neo4j, Render, OpenAI

**Beat 3 (frames 350–450):** Fade Out
- Everything fades to black smoothly

---

## Technical Notes

### File Structure (new)
```
src/
  Root.tsx          — updated composition (2700 frames)
  Video.tsx         — updated scene sequence (5 scenes)
  styles/theme.ts   — updated dark theme + timing
  scenes/
    ProblemScene.tsx     — Scene 1 (600 frames)
    RekaScene.tsx        — Scene 2 (600 frames)
    FastinoScene.tsx     — Scene 3 (450 frames)
    Neo4jRagScene.tsx    — Scene 4 (600 frames)
    ClosingScene.tsx     — Scene 5 (450 frames)
```

### Reusable Components (inline in scenes)
- `TypeWriter` — character-by-character text reveal with cursor
- `GlowNode` — circular node with neon glow border
- `DataParticle` — small dot that flows along a path
- `PipelineArrow` — SVG arrow with animated drawing + glow
- `EntityBadge` — color-coded entity tag
- `TerminalOutput` — line-by-line text reveal in monospace

### Dependencies
- Existing: remotion, @remotion/transitions, @remotion/google-fonts, react
- No new dependencies needed
