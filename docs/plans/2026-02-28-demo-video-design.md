# ScreenMind Demo Video — Design Document

**Date:** 2026-02-28
**Format:** Remotion (React-based programmatic video)
**Length:** 60-90 seconds (target ~80s)
**Resolution:** 1920x1080 (16:9), 30fps
**Style:** Clean minimal — white/light backgrounds, sharp typography, subtle animations
**Audio:** Voiceover narration (recorded separately, video designed with timing cues)

---

## Scene Breakdown

### Scene 1: The Problem (0:00 – 0:15)

**Purpose:** Create visceral empathy — the user FEELS the chaos of context-switching.

**Visuals:**
- Starts clean white
- 8-10 app windows flood in rapidly with scale-up + slight rotation
  - Windows: VS Code, Chrome (multiple tabs), Slack, Gmail, Notion, Terminal, Figma, Discord
- Cursor teleports frantically between windows
- Notification badges pile up (3 → 7 → 15)
- Browser tabs multiply across the top edge
- Screen becomes visually overwhelming

**Climax:** Bold text punches center: **"WHERE WAS THAT?"**

**Exit:** Everything shatters/dissolves outward → clean white

**Voiceover cue:** "You switch between dozens of apps every day. You lose track of what you were working on. Your context disappears."

---

### Scene 2: Enter ScreenMind (0:15 – 0:25)

**Purpose:** Relief moment — introduce the solution.

**Visuals:**
- From clean white, ScreenMind logo fades in center (soft scale animation)
- Tagline types out letter by letter below logo:
  > "An AI that sees your screen and remembers everything."
- Subtle dot/particle animation in background suggesting neural connections

**Voiceover cue:** "Meet ScreenMind — an AI copilot that watches your desktop and never forgets."

---

### Scene 3: The Demo (0:25 – 0:50)

**Purpose:** Show the product working — the money shot.

**Visuals:**
- Simulated desktop appears with 2-3 app windows:
  - Browser showing a research article
  - Notes app with bullet points
  - Chat window (Slack-like)
- ScreenMind overlay fades into bottom-right corner (dark theme, matches real app)

**Animation sequence:**
1. Scanning line sweeps across desktop (Reka Vision capture visualization)
2. Overlay shows "Watching..." with pulsing green dot
3. Entity tags float up from desktop into overlay: "React docs", "Chrome", "API research"
4. User types in overlay: "What was I researching earlier?"
5. Response streams word-by-word: "You were reading React server components documentation in Chrome and taking notes about API design patterns..."
6. Mini knowledge graph builds in corner — Topic nodes connecting with MENTIONS edges, growing organically

**Voiceover cue:** "ScreenMind captures your screen, understands what you're doing, and stores it in a knowledge graph. Ask it anything — it remembers."

---

### Scene 4: How It Works (0:50 – 1:10)

**Purpose:** Show the technical architecture with sponsor tools.

**Visuals:** Architecture diagram builds step-by-step with 1-second stagger:

| Step | Icon | Label | Sponsor | Animation |
|------|------|-------|---------|-----------|
| 1 | Eye | "Sees your screen" | Reka Vision | Screenshot flows in |
| 2 | Brain | "Understands context" | GPT-4o / OpenAI | Processing pulse |
| 3 | Graph | "Remembers everything" | Neo4j | Nodes + edges animate |
| 4 | Search | "Searches the web" | Tavily | Globe rotation |
| 5 | Cloud | "Runs in the cloud" | Render | Connection lines |
| 6 | Mic | "Hears your voice" | Whisper | Audio waveform |

Lines connect all elements into a flow diagram at the end.

**Voiceover cue:** "Powered by Reka Vision for screen understanding, Neo4j for persistent memory, Tavily for web search, and deployed on Render."

---

### Scene 5: Closing (1:10 – 1:20)

**Purpose:** Sign off with branding.

**Visuals:**
- Architecture fades out
- ScreenMind logo returns center
- Text below: "Built in 5.5 hours at the Autonomous Agents Hackathon"
- Sponsor logos line up horizontally at bottom: Reka, Tavily, Neo4j, Render, OpenAI
- Fade to black

**Voiceover cue:** "ScreenMind. Built in five and a half hours at the Autonomous Agents Hackathon."

---

## Technical Approach

### Remotion Project Structure
```
demo-video/
├── src/
│   ├── Root.tsx              # Composition setup
│   ├── Video.tsx             # Main composition (sequences all scenes)
│   ├── scenes/
│   │   ├── ProblemScene.tsx   # Scene 1: App chaos
│   │   ├── IntroScene.tsx     # Scene 2: Logo + tagline
│   │   ├── DemoScene.tsx      # Scene 3: Simulated desktop + overlay
│   │   ├── ArchScene.tsx      # Scene 4: Architecture diagram
│   │   └── ClosingScene.tsx   # Scene 5: Branding
│   ├── components/
│   │   ├── AppWindow.tsx      # Reusable mock app window
│   │   ├── Overlay.tsx        # ScreenMind overlay mockup
│   │   ├── GraphViz.tsx       # Mini knowledge graph animation
│   │   ├── TypeWriter.tsx     # Typing text effect
│   │   ├── ScanLine.tsx       # Screen capture visualization
│   │   ├── ArchNode.tsx       # Architecture diagram node
│   │   └── Logo.tsx           # ScreenMind logo component
│   └── styles/
│       └── theme.ts           # Colors, fonts, spacing constants
├── public/
│   └── assets/                # Logo files, sponsor logos, icons
├── package.json
└── tsconfig.json
```

### Key Animation Techniques
- **Spring animations** for window pop-ins (Remotion's `spring()`)
- **`interpolate()`** for smooth fades, scales, positions
- **`<Sequence>`** for scene timing
- **`useCurrentFrame()`** for frame-by-frame animation control
- **CSS transitions** for typewriter effect and streaming text

### Color Palette (Clean Minimal)
- Background: `#FFFFFF` (white) / `#F8F9FA` (off-white)
- Primary text: `#1A1A2E` (near-black)
- Accent: `#4361EE` (blue)
- Secondary: `#7209B7` (purple)
- Success/watching: `#06D6A0` (green)
- Overlay dark: `#1E1E2E` (dark theme for ScreenMind overlay)

### Typography
- Headings: Inter Bold
- Body: Inter Regular
- Code/overlay: JetBrains Mono

---

## Challenges & Solutions to Highlight

The video's narrative arc includes these real challenges from the hackathon:

1. **Reka Vision latency (8-9s)** → Solved with Neo4j RAG caching (4-5s)
2. **LLM hallucination** → Solved with strict prompt engineering
3. **Background capture blocking queries** → Solved with non-blocking fast-path
4. **Overlay UX (close = quit)** → Solved with hide/show/quit controls

These are woven into Scene 3 (demo) and Scene 4 (architecture) rather than being separate scenes, to keep within 60-90 seconds.
