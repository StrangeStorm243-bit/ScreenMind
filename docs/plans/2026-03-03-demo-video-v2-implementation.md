# Demo Video v2 Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace the existing 2-minute, 7-scene demo video with a 90-second, 5-scene dark tech aesthetic video that shows the problem (ChatGPT blindness) and ScreenMind's technical pipeline in detail.

**Architecture:** Complete rewrite of theme.ts (dark palette + new timing), Video.tsx (5 scenes instead of 7), and all scene files. Delete old scenes, create 5 new ones. Reuse Remotion patterns from existing code (spring, interpolate, AbsoluteFill, TransitionSeries).

**Tech Stack:** Remotion 4.0.399, React 18, TypeScript, @remotion/transitions, @remotion/google-fonts

---

### Task 1: Update theme.ts — Dark palette and new timing

**Files:**
- Modify: `demo-video/src/styles/theme.ts`

**Step 1: Rewrite theme.ts**

Replace the entire file with the dark tech aesthetic theme and 5-scene timing:

```typescript
export const THEME = {
  // Dark tech aesthetic
  bg: "#0D1117",
  bgCard: "#161B22",
  bgCardAlt: "#1C2333",
  text: "#E6EDF3",
  textMuted: "#7D8590",
  // Neon accents
  cyan: "#00D4FF",
  magenta: "#FF006E",
  // Brand colors
  reka: "#E13238",
  fastino: "#F59E0B",
  neo4j: "#018BFF",
  llm: "#06D6A0",
  tavily: "#7209B7",
  // Semantic
  accent: "#4361EE",
  secondary: "#7209B7",
  success: "#06D6A0",
  danger: "#E13238",
  // Grid
  gridLine: "rgba(255,255,255,0.03)",
} as const;

export const FPS = 30;
export const WIDTH = 1920;
export const HEIGHT = 1080;

// 5 scenes, 90 seconds total (2700 frames at 30fps)
export const SCENES = {
  problem: 600,       // 0:00–0:20 (20s)
  reka: 600,          // 0:20–0:40 (20s)
  fastino: 450,       // 0:40–0:55 (15s)
  neo4jRag: 600,      // 0:55–1:15 (20s)
  closing: 450,       // 1:15–1:30 (15s)
} as const;

export const TRANSITION_FRAMES = 15;

export const TOTAL_DURATION =
  SCENES.problem +
  SCENES.reka +
  SCENES.fastino +
  SCENES.neo4jRag +
  SCENES.closing -
  4 * TRANSITION_FRAMES; // 4 transitions between 5 scenes
```

**Step 2: Verify**

Run: `cd demo-video && npx tsc --noEmit`
Expected: No type errors (imports in other files will break — that's expected until we update them)

---

### Task 2: Update Video.tsx — 5-scene composition

**Files:**
- Modify: `demo-video/src/Video.tsx`

**Step 1: Rewrite Video.tsx**

```typescript
import React from "react";
import { AbsoluteFill } from "remotion";
import { TransitionSeries, linearTiming } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { SCENES, TRANSITION_FRAMES, THEME } from "./styles/theme";
import { ProblemScene } from "./scenes/ProblemScene";
import { RekaScene } from "./scenes/RekaScene";
import { FastinoScene } from "./scenes/FastinoScene";
import { Neo4jRagScene } from "./scenes/Neo4jRagScene";
import { ClosingScene } from "./scenes/ClosingScene";

const T = linearTiming({ durationInFrames: TRANSITION_FRAMES });

export const Video: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: THEME.bg }}>
      <TransitionSeries>
        <TransitionSeries.Sequence durationInFrames={SCENES.problem}>
          <ProblemScene />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={fade()} timing={T} />

        <TransitionSeries.Sequence durationInFrames={SCENES.reka}>
          <RekaScene />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={fade()} timing={T} />

        <TransitionSeries.Sequence durationInFrames={SCENES.fastino}>
          <FastinoScene />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={fade()} timing={T} />

        <TransitionSeries.Sequence durationInFrames={SCENES.neo4jRag}>
          <Neo4jRagScene />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={fade()} timing={T} />

        <TransitionSeries.Sequence durationInFrames={SCENES.closing}>
          <ClosingScene />
        </TransitionSeries.Sequence>
      </TransitionSeries>
    </AbsoluteFill>
  );
};
```

---

### Task 3: Delete old scene files

**Files:**
- Delete: `demo-video/src/scenes/IntroScene.tsx`
- Delete: `demo-video/src/scenes/RekaCaptureScene.tsx`
- Delete: `demo-video/src/scenes/RagFastinoScene.tsx`
- Delete: `demo-video/src/scenes/DemoScene.tsx`
- Delete: `demo-video/src/scenes/ArchScene.tsx`

**Step 1:** Delete the 5 old scene files that are no longer imported. Keep `ProblemScene.tsx` and `ClosingScene.tsx` (they'll be rewritten in-place).

```bash
rm demo-video/src/scenes/IntroScene.tsx
rm demo-video/src/scenes/RekaCaptureScene.tsx
rm demo-video/src/scenes/RagFastinoScene.tsx
rm demo-video/src/scenes/DemoScene.tsx
rm demo-video/src/scenes/ArchScene.tsx
```

---

### Task 4: Write ProblemScene.tsx — The Problem (600 frames)

**Files:**
- Modify: `demo-video/src/scenes/ProblemScene.tsx`

**Step 1: Rewrite ProblemScene.tsx**

This scene has 4 beats:
1. (0–150) Ghost app windows scatter across dark background
2. (150–350) ChatGPT mock fails — user asks question, gets "no access" response
3. (350–550) ScreenMind logo + tagline reveal
4. (550–600) Fade to dark

Key elements:
- Dark background with subtle dot grid pattern
- Ghost windows: translucent outlines with faint glow borders (not solid white cards)
- ChatGPT mock: dark chat bubble, user question typewriter, AI response with red glow
- ScreenMind: brain emoji + gradient circle + typewriter tagline
- All text uses `THEME.text` (light on dark) and `THEME.textMuted`

The full implementation should use the existing animation patterns (spring for scale, interpolate for opacity) but switch all colors to the dark theme. Ghost windows should use `border: 1px solid rgba(255,255,255,0.1)` with `backgroundColor: "transparent"` and subtle `boxShadow` glow. The ChatGPT mock should be a dark card with the characteristic green-on-dark style. The ScreenMind reveal should have a neon glow effect on the logo circle.

TypeWriter component (inline):
```typescript
const TypeWriter: React.FC<{text: string; startFrame: number; speed?: number}> = ({text, startFrame, speed = 1.5}) => {
  const frame = useCurrentFrame();
  const elapsed = frame - startFrame;
  if (elapsed < 0) return null;
  const chars = Math.min(Math.floor(elapsed * speed), text.length);
  const showCursor = elapsed % 16 < 10;
  return (
    <span>
      {text.slice(0, chars)}
      {chars < text.length && showCursor && (
        <span style={{opacity: 0.7}}>▌</span>
      )}
    </span>
  );
};
```

**Step 2: Visual verify**

Run: `cd demo-video && npx remotion studio` — scrub through frames 0–600 of Scene 1.
Check: Dark background, ghost windows appear, ChatGPT fails, ScreenMind logo reveals.

---

### Task 5: Write RekaScene.tsx — Reka Vision Capture Pipeline (600 frames)

**Files:**
- Create: `demo-video/src/scenes/RekaScene.tsx`

**Step 1: Write RekaScene.tsx**

This scene has 4 beats:
1. (0–120) Title "Step 1: Always Watching" + mock screenshot capture with pulsing timer
2. (120–280) Perceptual hash comparison — two thumbnail screenshots, hash blocks below each (colored squares), some green (match) some red (differ), text shows "pHash Δ = 12 > threshold (8)"
3. (280–450) Reka Vision processing — screenshot feeds into glowing Reka node, terminal-style output scrolls line by line (APPLICATION, WINDOW_TITLE, CONTENT, ACTIVITY)
4. (450–600) Pipeline summary label + data particle dots flowing left to right

Key visual elements:
- All on dark background with dot grid
- Screenshot thumbnails: dark cards (`THEME.bgCard`) with colored content blocks
- Hash blocks: row of 8 small squares, green for matching bits, red for different
- Reka node: circle with red glow border (`boxShadow: 0 0 20px ${THEME.reka}66`)
- Terminal output: monospace text on `THEME.bgCard`, lines appear with `>` prefix in cyan
- Data particles: array of 5-8 small circles (4px) that move along a horizontal path using `interpolate(frame, [start, end], [x1, x2])`
- Pipeline label: dark card at bottom with emoji pipeline, `THEME.reka` for Reka text

Reuse the hash comparison pattern from old `RekaCaptureScene.tsx` but restyle for dark theme.

---

### Task 6: Write FastinoScene.tsx — Entity Extraction (450 frames)

**Files:**
- Create: `demo-video/src/scenes/FastinoScene.tsx`

**Step 1: Write FastinoScene.tsx**

This scene has 4 beats:
1. (0–80) Title "Step 2: Understanding Context" + Reka output card (smaller, left side)
2. (80–220) GLiNER2 processing — center node pulses amber, entities fly out as color-coded badges with confidence scores
3. (220–340) Three operation cards below: Entity Extraction, Classification, Relation Extraction
4. (340–450) Entities compress into data stream, pipeline label

Key visual elements:
- EntityBadge: dark pill with colored left border/dot, label, category tag, confidence score
  - Application entities: `THEME.neo4j` (blue)
  - Technology entities: `THEME.secondary` (purple)
  - Activity entities: `THEME.fastino` (amber)
- GLiNER2 node: circle with amber glow, "🏷️" emoji
- Three operation cards: `THEME.bgCard` with colored top border
  - "Entity Extraction" — list: application, person, technology, website
  - "Classification" — activity: coding, focus: deep_focus
  - "Relation Extraction" — "VS Code → uses → Python"
- Pipeline label at bottom in dark card

Reuse EntityBadge pattern from old `RagFastinoScene.tsx` but restyle with dark backgrounds and glow effects.

---

### Task 7: Write Neo4jRagScene.tsx — Knowledge Graph + RAG (600 frames)

**Files:**
- Create: `demo-video/src/scenes/Neo4jRagScene.tsx`

**Step 1: Write Neo4jRagScene.tsx**

Two phases:

**Phase A: Storage (0–300)**
1. (0–100) Title "Step 3: Building Memory" + entity badges flow in from left
2. (100–300) Neo4j graph builds: central ScreenCapture node (large, blue glow), Topic nodes spring outward with MENTIONS edges. Additional "previous capture" nodes fade in (React, Chrome, API Design). RELATED_TO edges draw between related topics.

**Phase B: RAG Retrieval (300–600)**
3. (300–400) Chat input appears at bottom, user types "What was I coding earlier?"
4. (400–500) Query pulse hits graph, relevant nodes light up (glow intensifies), MENTIONS edges glow, text: "Top 5 relevant contexts retrieved"
5. (500–600) Speed comparison boxes: red-tinted "Without RAG: 8-9s" vs green-tinted "With RAG: 4-5s", big "50% FASTER" badge with glow pulse

Key visual elements:
- SVG graph: nodes as circles with `filter: drop-shadow(0 0 8px color)` equivalent via boxShadow on foreignObject or just bright fill colors
- Edges: SVG lines, animated from source to target using progress interpolation
- Edge labels: "MENTIONS" in small text at midpoint
- Query pulse: expanding circle from chat input up into graph area
- Node glow-up: on relevant nodes, increase opacity of a second larger circle behind (glow ring)
- Speed comparison: two cards side by side, left has red border/tint, right has green
- "50% FASTER" badge: large text with `THEME.success` color and pulsing scale animation

Reuse Neo4j graph pattern from old `RagFastinoScene.tsx` but expand it significantly — more nodes, animated edge drawing, glow effects.

---

### Task 8: Rewrite ClosingScene.tsx — Pipeline + Credits (450 frames)

**Files:**
- Modify: `demo-video/src/scenes/ClosingScene.tsx`

**Step 1: Rewrite ClosingScene.tsx**

3 beats:
1. (0–200) Full horizontal pipeline — 7 tool nodes evenly spaced with connecting arrows + data particles streaming through
2. (200–350) Pipeline compresses upward, ScreenMind logo center, "Built in 5.5 hours" tagline, sponsor badges
3. (350–450) Smooth fade to black

Key visual elements:
- Pipeline nodes: circles with brand colors and emoji icons, same as old ArchScene but on dark background with neon glow
  1. 📸 mss Capture (gray/#7D8590)
  2. 🔑 pHash (gray/#7D8590)
  3. 👁️ Reka Vision (red/#E13238)
  4. 🏷️ Fastino GLiNER2 (amber/#F59E0B)
  5. 🕸️ Neo4j AuraDB (blue/#018BFF)
  6. 🔍 Tavily Search (purple/#7209B7)
  7. 🧠 LLM Agent (green/#06D6A0)
- Connecting arrows: SVG lines with animated drawing + glow (`strokeDasharray` animation or progress-based)
- Data particles: small dots (3-4px) moving left to right along the pipeline path, staggered
- Sponsor badges: dark cards with colored text, spring-in animation
- Fade to black: `AbsoluteFill` with black background, opacity interpolate 0→1

Reuse ArchNode pattern from old `ArchScene.tsx` but with dark bg, neon glow `boxShadow: 0 0 16px ${color}66`.

---

### Task 9: Type-check and visual verification

**Step 1: Type-check**

Run: `cd demo-video && npx tsc --noEmit`
Expected: No errors

**Step 2: Visual verify in Remotion Studio**

Run: `cd demo-video && npx remotion studio`
- Scrub through entire 2700 frames
- Verify all 5 scenes render
- Check transitions between scenes
- Verify dark theme throughout
- Check timing feels right

---

### Task 10: Render final video and commit

**Step 1: Render**

Run: `cd demo-video && npx remotion render src/index.ts ScreenMindDemo out/screenmind-demo.mp4`

**Step 2: Commit**

```bash
git add demo-video/src/ demo-video/out/screenmind-demo.mp4
git commit -m "feat: redesign demo video — 90s dark tech aesthetic with detailed pipeline"
```
