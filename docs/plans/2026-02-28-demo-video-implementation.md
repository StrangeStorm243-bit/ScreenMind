# ScreenMind Demo Video — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a 60-90 second Remotion demo video showcasing ScreenMind with simulated desktop demo, architecture diagram, and clean minimal style.

**Architecture:** Remotion v4 project using `<TransitionSeries>` for scene sequencing with fade transitions. Each scene is an independent React component. Animations use `spring()`, `interpolate()`, and `useCurrentFrame()`. Google Fonts loaded via `@remotion/google-fonts`.

**Tech Stack:** Remotion 4.0.x, React 18, TypeScript, `@remotion/transitions`, `@remotion/google-fonts`

**Design doc:** `docs/plans/2026-02-28-demo-video-design.md`

---

## Task 1: Scaffold Remotion Project

**Files:**
- Create: `demo-video/` (via `npx create-video`)
- Modify: `demo-video/src/Root.tsx`
- Create: `demo-video/src/Video.tsx`
- Create: `demo-video/src/styles/theme.ts`

**Step 1: Create the project**

```bash
cd C:/GitHubProjects/ScreenMind
npx create-video@latest --blank demo-video
```

Select "blank" template, npm as package manager.

**Step 2: Install dependencies**

```bash
cd demo-video
npm i --save-exact @remotion/transitions@4.0.399 @remotion/google-fonts@4.0.399
```

**Step 3: Create the theme file**

Create `demo-video/src/styles/theme.ts`:

```ts
export const THEME = {
  bg: "#FFFFFF",
  bgAlt: "#F8F9FA",
  text: "#1A1A2E",
  accent: "#4361EE",
  secondary: "#7209B7",
  success: "#06D6A0",
  overlayDark: "#1E1E2E",
  overlayText: "#E0E0E0",
  danger: "#E13238",
  muted: "#94A3B8",
} as const;

export const FPS = 30;
export const WIDTH = 1920;
export const HEIGHT = 1080;

// Scene durations in frames (at 30fps)
export const SCENES = {
  problem: 15 * FPS,     // 0:00–0:15 (450 frames)
  intro: 10 * FPS,       // 0:15–0:25 (300 frames)
  demo: 25 * FPS,        // 0:25–0:50 (750 frames)
  arch: 20 * FPS,        // 0:50–1:10 (600 frames)
  closing: 10 * FPS,     // 1:10–1:20 (300 frames)
} as const;

export const TRANSITION_FRAMES = 15; // 0.5s fade between scenes

export const TOTAL_DURATION =
  SCENES.problem + SCENES.intro + SCENES.demo + SCENES.arch + SCENES.closing
  - 4 * TRANSITION_FRAMES; // 4 transitions
```

**Step 4: Create main Video composition**

Create `demo-video/src/Video.tsx`:

```tsx
import React from "react";
import { AbsoluteFill } from "remotion";
import { TransitionSeries, linearTiming } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { SCENES, TRANSITION_FRAMES, THEME } from "./styles/theme";
import { ProblemScene } from "./scenes/ProblemScene";
import { IntroScene } from "./scenes/IntroScene";
import { DemoScene } from "./scenes/DemoScene";
import { ArchScene } from "./scenes/ArchScene";
import { ClosingScene } from "./scenes/ClosingScene";

export const Video: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: THEME.bg }}>
      <TransitionSeries>
        <TransitionSeries.Sequence durationInFrames={SCENES.problem}>
          <ProblemScene />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition
          presentation={fade()}
          timing={linearTiming({ durationInFrames: TRANSITION_FRAMES })}
        />
        <TransitionSeries.Sequence durationInFrames={SCENES.intro}>
          <IntroScene />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition
          presentation={fade()}
          timing={linearTiming({ durationInFrames: TRANSITION_FRAMES })}
        />
        <TransitionSeries.Sequence durationInFrames={SCENES.demo}>
          <DemoScene />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition
          presentation={fade()}
          timing={linearTiming({ durationInFrames: TRANSITION_FRAMES })}
        />
        <TransitionSeries.Sequence durationInFrames={SCENES.arch}>
          <ArchScene />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition
          presentation={fade()}
          timing={linearTiming({ durationInFrames: TRANSITION_FRAMES })}
        />
        <TransitionSeries.Sequence durationInFrames={SCENES.closing}>
          <ClosingScene />
        </TransitionSeries.Sequence>
      </TransitionSeries>
    </AbsoluteFill>
  );
};
```

**Step 5: Update Root.tsx**

Replace `demo-video/src/Root.tsx` with:

```tsx
import { Composition } from "remotion";
import { Video } from "./Video";
import { TOTAL_DURATION, FPS, WIDTH, HEIGHT } from "./styles/theme";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="ScreenMindDemo"
        component={Video}
        durationInFrames={TOTAL_DURATION}
        fps={FPS}
        width={WIDTH}
        height={HEIGHT}
      />
    </>
  );
};
```

**Step 6: Create placeholder scene files**

Create each with a simple colored background + label so the project compiles:
- `demo-video/src/scenes/ProblemScene.tsx`
- `demo-video/src/scenes/IntroScene.tsx`
- `demo-video/src/scenes/DemoScene.tsx`
- `demo-video/src/scenes/ArchScene.tsx`
- `demo-video/src/scenes/ClosingScene.tsx`

Each placeholder:

```tsx
import React from "react";
import { AbsoluteFill } from "remotion";
import { THEME } from "../styles/theme";

export const ProblemScene: React.FC = () => {
  return (
    <AbsoluteFill
      style={{
        backgroundColor: THEME.bg,
        justifyContent: "center",
        alignItems: "center",
        fontFamily: "Inter, sans-serif",
        fontSize: 48,
        color: THEME.text,
      }}
    >
      Scene 1: The Problem
    </AbsoluteFill>
  );
};
```

(Repeat pattern for IntroScene, DemoScene, ArchScene, ClosingScene with different labels.)

**Step 7: Verify studio launches**

```bash
cd demo-video && npm run dev
```

Expected: Remotion Studio opens in browser showing the 5 placeholder scenes with fade transitions.

**Step 8: Commit**

```bash
git add demo-video/
git commit -m "feat: scaffold Remotion demo video project with scene structure"
```

---

## Task 2: Build Reusable Components

**Files:**
- Create: `demo-video/src/components/AppWindow.tsx`
- Create: `demo-video/src/components/TypeWriter.tsx`
- Create: `demo-video/src/components/Logo.tsx`

**Step 1: Create AppWindow component**

`demo-video/src/components/AppWindow.tsx` — A mock desktop app window with title bar, traffic light dots, and content area:

```tsx
import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { THEME } from "../styles/theme";

type Props = {
  title: string;
  color?: string;
  width?: number;
  height?: number;
  x?: number;
  y?: number;
  delay?: number;
  rotation?: number;
  children?: React.ReactNode;
};

export const AppWindow: React.FC<Props> = ({
  title,
  color = THEME.bgAlt,
  width = 500,
  height = 350,
  x = 0,
  y = 0,
  delay = 0,
  rotation = 0,
  children,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const scale = spring({
    fps,
    frame: frame - delay,
    config: { damping: 12, stiffness: 200 },
  });

  const opacity = interpolate(frame - delay, [0, 5], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        width,
        height,
        transform: `scale(${scale}) rotate(${rotation}deg)`,
        opacity,
        borderRadius: 12,
        overflow: "hidden",
        boxShadow: "0 8px 32px rgba(0,0,0,0.1)",
        border: "1px solid #E2E8F0",
      }}
    >
      {/* Title bar */}
      <div
        style={{
          height: 36,
          backgroundColor: "#F1F5F9",
          display: "flex",
          alignItems: "center",
          padding: "0 12px",
          gap: 8,
          borderBottom: "1px solid #E2E8F0",
        }}
      >
        <div style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: "#EF4444" }} />
        <div style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: "#F59E0B" }} />
        <div style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: "#22C55E" }} />
        <span
          style={{
            marginLeft: 8,
            fontSize: 13,
            color: THEME.muted,
            fontFamily: "Inter, sans-serif",
          }}
        >
          {title}
        </span>
      </div>
      {/* Content */}
      <div style={{ backgroundColor: color, height: height - 36, padding: 16 }}>
        {children}
      </div>
    </div>
  );
};
```

**Step 2: Create TypeWriter component**

`demo-video/src/components/TypeWriter.tsx`:

```tsx
import React from "react";
import { useCurrentFrame } from "remotion";

type Props = {
  text: string;
  startFrame?: number;
  charsPerFrame?: number;
  style?: React.CSSProperties;
  cursorColor?: string;
};

export const TypeWriter: React.FC<Props> = ({
  text,
  startFrame = 0,
  charsPerFrame = 0.8,
  style,
  cursorColor = "#4361EE",
}) => {
  const frame = useCurrentFrame();
  const elapsed = Math.max(0, frame - startFrame);
  const charsToShow = Math.min(text.length, Math.floor(elapsed * charsPerFrame));
  const visibleText = text.slice(0, charsToShow);
  const showCursor = charsToShow < text.length;

  return (
    <span style={style}>
      {visibleText}
      {showCursor && (
        <span
          style={{
            display: "inline-block",
            width: 3,
            height: "1em",
            backgroundColor: cursorColor,
            marginLeft: 2,
            animation: "none",
            opacity: Math.floor(elapsed / 15) % 2 === 0 ? 1 : 0,
          }}
        />
      )}
    </span>
  );
};
```

**Step 3: Create Logo component**

`demo-video/src/components/Logo.tsx`:

```tsx
import React from "react";
import { spring, useCurrentFrame, useVideoConfig } from "remotion";
import { THEME } from "../styles/theme";

type Props = {
  size?: number;
  delay?: number;
};

export const Logo: React.FC<Props> = ({ size = 80, delay = 0 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const scale = spring({
    fps,
    frame: frame - delay,
    config: { damping: 15, stiffness: 120 },
  });

  const opacity = spring({
    fps,
    frame: frame - delay,
    config: { damping: 20, stiffness: 100 },
  });

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 16,
        transform: `scale(${scale})`,
        opacity,
      }}
    >
      {/* Brain/eye icon */}
      <div
        style={{
          width: size,
          height: size,
          borderRadius: size / 2,
          background: `linear-gradient(135deg, ${THEME.accent}, ${THEME.secondary})`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: size * 0.5,
        }}
      >
        🧠
      </div>
      <div>
        <div
          style={{
            fontFamily: "Inter, sans-serif",
            fontWeight: 800,
            fontSize: size * 0.6,
            color: THEME.text,
            letterSpacing: -1,
          }}
        >
          ScreenMind
        </div>
      </div>
    </div>
  );
};
```

**Step 4: Verify components render**

Temporarily import one in a placeholder scene, run studio, confirm it renders.

**Step 5: Commit**

```bash
git add demo-video/src/components/
git commit -m "feat: add AppWindow, TypeWriter, and Logo components"
```

---

## Task 3: Build Scene 1 — The Problem

**Files:**
- Modify: `demo-video/src/scenes/ProblemScene.tsx`

**Step 1: Implement the chaotic app window flood**

Replace `ProblemScene.tsx` with the full implementation:

```tsx
import React from "react";
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { AppWindow } from "../components/AppWindow";
import { THEME, SCENES } from "../styles/theme";

const APPS = [
  { title: "VS Code — main.py", x: 100, y: 80, w: 550, h: 400, delay: 5, rot: -2 },
  { title: "Chrome — Stack Overflow", x: 350, y: 120, w: 600, h: 380, delay: 10, rot: 1 },
  { title: "Slack — #general", x: 200, y: 200, w: 480, h: 350, delay: 15, rot: -1.5 },
  { title: "Gmail — Inbox (15)", x: 600, y: 60, w: 520, h: 370, delay: 20, rot: 2 },
  { title: "Notion — Project Notes", x: 50, y: 300, w: 500, h: 360, delay: 25, rot: -0.5 },
  { title: "Terminal — npm run dev", x: 700, y: 280, w: 480, h: 320, delay: 30, rot: 1.5 },
  { title: "Figma — Dashboard v3", x: 400, y: 350, w: 560, h: 380, delay: 35, rot: -1 },
  { title: "Discord — Hackathon", x: 150, y: 400, w: 500, h: 340, delay: 40, rot: 0.8 },
  { title: "Chrome — React Docs", x: 550, y: 180, w: 580, h: 360, delay: 45, rot: -2.5 },
  { title: "Notes — TODO list", x: 800, y: 400, w: 420, h: 300, delay: 50, rot: 1.2 },
];

export const ProblemScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const totalFrames = SCENES.problem;

  // Phase 1: Windows flood in (frames 0-200)
  // Phase 2: "WHERE WAS THAT?" text (frames 250-350)
  // Phase 3: Dissolve out (frames 350-450)

  const textOpacity = interpolate(frame, [250, 270, 380, 400], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const textScale = spring({
    fps,
    frame: frame - 250,
    config: { damping: 8, stiffness: 300 },
  });

  // Dissolve all windows out
  const dissolve = interpolate(frame, [370, totalFrames], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ backgroundColor: THEME.bg }}>
      {/* App windows flooding in */}
      <div style={{ opacity: dissolve }}>
        {APPS.map((app, i) => (
          <AppWindow
            key={i}
            title={app.title}
            x={app.x}
            y={app.y}
            width={app.w}
            height={app.h}
            delay={app.delay}
            rotation={app.rot}
          >
            <div
              style={{
                fontFamily: "monospace",
                fontSize: 11,
                color: THEME.muted,
                lineHeight: 1.6,
              }}
            >
              {Array.from({ length: 8 }, (_, j) => (
                <div key={j} style={{ opacity: 0.5 + Math.random() * 0.5 }}>
                  {"█".repeat(10 + Math.floor(Math.random() * 30))}
                </div>
              ))}
            </div>
          </AppWindow>
        ))}
      </div>

      {/* "WHERE WAS THAT?" text */}
      {frame >= 250 && (
        <AbsoluteFill
          style={{
            justifyContent: "center",
            alignItems: "center",
            zIndex: 100,
          }}
        >
          <div
            style={{
              fontFamily: "Inter, sans-serif",
              fontWeight: 900,
              fontSize: 96,
              color: THEME.text,
              opacity: textOpacity,
              transform: `scale(${textScale})`,
              textAlign: "center",
              letterSpacing: -2,
            }}
          >
            WHERE WAS THAT?
          </div>
        </AbsoluteFill>
      )}
    </AbsoluteFill>
  );
};
```

**Step 2: Preview in studio**

```bash
cd demo-video && npm run dev
```

Navigate to Scene 1 in the timeline. Verify windows flood in with spring animations and the text punches in.

**Step 3: Commit**

```bash
git add demo-video/src/scenes/ProblemScene.tsx
git commit -m "feat: implement Scene 1 — chaotic app window flood"
```

---

## Task 4: Build Scene 2 — Enter ScreenMind

**Files:**
- Modify: `demo-video/src/scenes/IntroScene.tsx`

**Step 1: Implement logo reveal + typewriter tagline**

```tsx
import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { Logo } from "../components/Logo";
import { TypeWriter } from "../components/TypeWriter";
import { THEME } from "../styles/theme";

export const IntroScene: React.FC = () => {
  const frame = useCurrentFrame();

  // Subtle particle dots in background
  const dots = Array.from({ length: 30 }, (_, i) => ({
    x: 200 + Math.sin(i * 1.3) * 700,
    y: 200 + Math.cos(i * 0.9) * 400,
    size: 3 + (i % 4),
    delay: i * 3,
  }));

  return (
    <AbsoluteFill
      style={{
        backgroundColor: THEME.bg,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      {/* Particle dots */}
      {dots.map((dot, i) => {
        const opacity = interpolate(frame - dot.delay, [0, 20], [0, 0.15], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: dot.x,
              top: dot.y,
              width: dot.size,
              height: dot.size,
              borderRadius: dot.size / 2,
              backgroundColor: THEME.accent,
              opacity,
            }}
          />
        );
      })}

      {/* Logo */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 32 }}>
        <Logo size={100} delay={10} />

        {/* Tagline */}
        <div style={{ fontSize: 32, fontFamily: "Inter, sans-serif", color: THEME.muted }}>
          <TypeWriter
            text="An AI that sees your screen and remembers everything."
            startFrame={60}
            charsPerFrame={1.2}
          />
        </div>
      </div>
    </AbsoluteFill>
  );
};
```

**Step 2: Preview, verify logo springs in and tagline types out.**

**Step 3: Commit**

```bash
git add demo-video/src/scenes/IntroScene.tsx
git commit -m "feat: implement Scene 2 — logo reveal and typewriter tagline"
```

---

## Task 5: Build Scene 3 — The Demo (Simulated ScreenMind)

**Files:**
- Modify: `demo-video/src/scenes/DemoScene.tsx`
- Create: `demo-video/src/components/Overlay.tsx`
- Create: `demo-video/src/components/ScanLine.tsx`
- Create: `demo-video/src/components/GraphViz.tsx`

**Step 1: Create ScanLine component**

`demo-video/src/components/ScanLine.tsx`:

```tsx
import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { THEME } from "../styles/theme";

type Props = { startFrame?: number; duration?: number };

export const ScanLine: React.FC<Props> = ({ startFrame = 0, duration = 30 }) => {
  const frame = useCurrentFrame();
  const progress = interpolate(frame - startFrame, [0, duration], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const opacity = interpolate(frame - startFrame, [0, 5, duration - 5, duration], [0, 0.6, 0.6, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        overflow: "hidden",
        pointerEvents: "none",
        zIndex: 50,
      }}
    >
      <div
        style={{
          position: "absolute",
          top: `${progress * 100}%`,
          left: 0,
          right: 0,
          height: 3,
          background: `linear-gradient(90deg, transparent, ${THEME.accent}, transparent)`,
          opacity,
          boxShadow: `0 0 20px ${THEME.accent}`,
        }}
      />
    </div>
  );
};
```

**Step 2: Create Overlay component (ScreenMind mockup)**

`demo-video/src/components/Overlay.tsx`:

```tsx
import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { TypeWriter } from "./TypeWriter";
import { THEME } from "../styles/theme";

type Message = { role: "user" | "assistant"; text: string; startFrame: number };

type Props = {
  messages: Message[];
  showWatching?: boolean;
  watchingStartFrame?: number;
  delay?: number;
};

export const Overlay: React.FC<Props> = ({
  messages,
  showWatching = true,
  watchingStartFrame = 0,
  delay = 0,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const slideIn = spring({
    fps,
    frame: frame - delay,
    config: { damping: 15, stiffness: 100 },
  });

  const translateY = interpolate(slideIn, [0, 1], [100, 0]);
  const opacity = interpolate(slideIn, [0, 1], [0, 1]);

  // Watching dot pulse
  const dotOpacity = showWatching
    ? interpolate(
        Math.sin((frame - watchingStartFrame) * 0.15),
        [-1, 1],
        [0.3, 1]
      )
    : 0;

  return (
    <div
      style={{
        position: "absolute",
        right: 40,
        bottom: 40,
        width: 380,
        height: 500,
        backgroundColor: THEME.overlayDark,
        borderRadius: 16,
        overflow: "hidden",
        boxShadow: "0 12px 48px rgba(0,0,0,0.3)",
        transform: `translateY(${translateY}px)`,
        opacity,
        display: "flex",
        flexDirection: "column",
        zIndex: 60,
      }}
    >
      {/* Title bar */}
      <div
        style={{
          padding: "12px 16px",
          borderBottom: `1px solid #2D2D3E`,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <span
          style={{
            fontFamily: "Inter, sans-serif",
            fontWeight: 700,
            fontSize: 14,
            color: THEME.overlayText,
          }}
        >
          🧠 ScreenMind
        </span>
        {showWatching && frame >= watchingStartFrame && (
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <div
              style={{
                width: 8,
                height: 8,
                borderRadius: 4,
                backgroundColor: THEME.success,
                opacity: dotOpacity,
              }}
            />
            <span
              style={{
                fontFamily: "Inter, sans-serif",
                fontSize: 12,
                color: THEME.success,
              }}
            >
              Watching...
            </span>
          </div>
        )}
      </div>

      {/* Messages area */}
      <div style={{ flex: 1, padding: 16, overflow: "hidden" }}>
        {messages.map((msg, i) => {
          if (frame < msg.startFrame) return null;
          return (
            <div
              key={i}
              style={{
                marginBottom: 12,
                padding: "8px 12px",
                borderRadius: 8,
                backgroundColor: msg.role === "user" ? "#2D2D4E" : "#1A1A30",
                maxWidth: "90%",
                marginLeft: msg.role === "user" ? "auto" : 0,
              }}
            >
              <div
                style={{
                  fontFamily:
                    msg.role === "user"
                      ? "Inter, sans-serif"
                      : "'JetBrains Mono', monospace",
                  fontSize: msg.role === "user" ? 14 : 13,
                  color: THEME.overlayText,
                  lineHeight: 1.5,
                }}
              >
                <TypeWriter
                  text={msg.text}
                  startFrame={msg.startFrame}
                  charsPerFrame={msg.role === "user" ? 1.5 : 1}
                  cursorColor={THEME.accent}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
```

**Step 3: Create GraphViz component**

`demo-video/src/components/GraphViz.tsx`:

```tsx
import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { THEME } from "../styles/theme";

type Node = { label: string; x: number; y: number; delay: number };
type Edge = { from: number; to: number; delay: number };

type Props = {
  nodes: Node[];
  edges: Edge[];
  startFrame?: number;
};

export const GraphViz: React.FC<Props> = ({ nodes, edges, startFrame = 0 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <div
      style={{
        position: "absolute",
        left: 40,
        bottom: 40,
        width: 340,
        height: 240,
        backgroundColor: "rgba(26, 26, 46, 0.9)",
        borderRadius: 12,
        overflow: "hidden",
        padding: 16,
        zIndex: 55,
      }}
    >
      <div
        style={{
          fontFamily: "Inter, sans-serif",
          fontSize: 11,
          color: THEME.muted,
          marginBottom: 8,
        }}
      >
        Knowledge Graph
      </div>

      <svg width="310" height="190" viewBox="0 0 310 190">
        {/* Edges */}
        {edges.map((edge, i) => {
          const fromNode = nodes[edge.from];
          const toNode = nodes[edge.to];
          const edgeOpacity = interpolate(
            frame - startFrame - edge.delay,
            [0, 10],
            [0, 0.4],
            { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
          );
          return (
            <line
              key={`e-${i}`}
              x1={fromNode.x}
              y1={fromNode.y}
              x2={toNode.x}
              y2={toNode.y}
              stroke={THEME.accent}
              strokeWidth={1.5}
              opacity={edgeOpacity}
            />
          );
        })}

        {/* Nodes */}
        {nodes.map((node, i) => {
          const nodeScale = spring({
            fps,
            frame: frame - startFrame - node.delay,
            config: { damping: 12, stiffness: 200 },
          });
          const nodeOpacity = interpolate(
            frame - startFrame - node.delay,
            [0, 5],
            [0, 1],
            { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
          );
          return (
            <g key={`n-${i}`} opacity={nodeOpacity}>
              <circle
                cx={node.x}
                cy={node.y}
                r={20 * nodeScale}
                fill={THEME.accent}
                opacity={0.8}
              />
              <text
                x={node.x}
                y={node.y + 4}
                textAnchor="middle"
                fill="white"
                fontSize={8}
                fontFamily="Inter, sans-serif"
              >
                {node.label}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
};
```

**Step 4: Implement DemoScene**

Replace `demo-video/src/scenes/DemoScene.tsx`:

```tsx
import React from "react";
import { AbsoluteFill } from "remotion";
import { AppWindow } from "../components/AppWindow";
import { Overlay } from "../components/Overlay";
import { ScanLine } from "../components/ScanLine";
import { GraphViz } from "../components/GraphViz";
import { THEME } from "../styles/theme";

const GRAPH_NODES = [
  { label: "React", x: 80, y: 60, delay: 0 },
  { label: "Chrome", x: 200, y: 40, delay: 10 },
  { label: "API", x: 155, y: 130, delay: 20 },
  { label: "Notes", x: 260, y: 110, delay: 30 },
  { label: "Slack", x: 50, y: 150, delay: 40 },
];

const GRAPH_EDGES = [
  { from: 0, to: 1, delay: 15 },
  { from: 0, to: 2, delay: 25 },
  { from: 1, to: 3, delay: 35 },
  { from: 2, to: 4, delay: 45 },
  { from: 3, to: 2, delay: 50 },
];

const MESSAGES = [
  {
    role: "user" as const,
    text: "What was I researching earlier?",
    startFrame: 300,
  },
  {
    role: "assistant" as const,
    text: "You were reading React server components documentation in Chrome and taking notes about API design patterns in your notes app.",
    startFrame: 380,
  },
];

export const DemoScene: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: "#E8ECF1" }}>
      {/* Simulated desktop with app windows */}
      <AppWindow
        title="Chrome — React Server Components"
        x={60}
        y={40}
        width={700}
        height={500}
        delay={10}
      >
        <div style={{ fontFamily: "Inter, sans-serif", fontSize: 14, color: THEME.text }}>
          <div style={{ fontSize: 22, fontWeight: 700, marginBottom: 12 }}>
            React Server Components
          </div>
          <div style={{ color: THEME.muted, lineHeight: 1.8 }}>
            Server Components let you write UI that can be rendered and optionally
            cached on the server. They represent a new way to build React
            applications that leverage the server and client...
          </div>
        </div>
      </AppWindow>

      <AppWindow
        title="Notes — API Design"
        x={820}
        y={80}
        width={500}
        height={380}
        delay={20}
      >
        <div
          style={{
            fontFamily: "Inter, sans-serif",
            fontSize: 13,
            color: THEME.text,
            lineHeight: 1.8,
          }}
        >
          <div style={{ fontWeight: 600, marginBottom: 8 }}>API Design Patterns</div>
          • RESTful endpoints for CRUD
          <br />
          • GraphQL for flexible queries
          <br />
          • WebSocket for real-time
          <br />
          • Rate limiting strategy
        </div>
      </AppWindow>

      <AppWindow
        title="Slack — #dev-team"
        x={180}
        y={420}
        width={480}
        height={220}
        delay={30}
        color="#1A1A2E"
      >
        <div
          style={{
            fontFamily: "Inter, sans-serif",
            fontSize: 12,
            color: THEME.overlayText,
            lineHeight: 2,
          }}
        >
          <span style={{ color: THEME.accent }}>@alice:</span> PR is ready for review
          <br />
          <span style={{ color: THEME.success }}>@bob:</span> Looks good, merging now
        </div>
      </AppWindow>

      {/* Scan line sweep */}
      <ScanLine startFrame={80} duration={60} />

      {/* ScreenMind overlay */}
      <Overlay
        delay={150}
        watchingStartFrame={180}
        messages={MESSAGES}
      />

      {/* Knowledge graph visualization */}
      <GraphViz
        nodes={GRAPH_NODES}
        edges={GRAPH_EDGES}
        startFrame={450}
      />
    </AbsoluteFill>
  );
};
```

**Step 5: Preview in studio — verify the full demo sequence plays.**

**Step 6: Commit**

```bash
git add demo-video/src/components/ demo-video/src/scenes/DemoScene.tsx
git commit -m "feat: implement Scene 3 — simulated desktop with ScreenMind demo"
```

---

## Task 6: Build Scene 4 — Architecture Diagram

**Files:**
- Modify: `demo-video/src/scenes/ArchScene.tsx`
- Create: `demo-video/src/components/ArchNode.tsx`

**Step 1: Create ArchNode component**

`demo-video/src/components/ArchNode.tsx`:

```tsx
import React from "react";
import { spring, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { THEME } from "../styles/theme";

type Props = {
  icon: string;
  label: string;
  sponsor: string;
  x: number;
  y: number;
  delay: number;
  color?: string;
};

export const ArchNode: React.FC<Props> = ({
  icon,
  label,
  sponsor,
  x,
  y,
  delay,
  color = THEME.accent,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const scale = spring({
    fps,
    frame: frame - delay,
    config: { damping: 12, stiffness: 180 },
  });

  const opacity = interpolate(frame - delay, [0, 10], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        transform: `scale(${scale})`,
        opacity,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 8,
        width: 180,
      }}
    >
      {/* Icon circle */}
      <div
        style={{
          width: 80,
          height: 80,
          borderRadius: 40,
          backgroundColor: color,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 36,
          boxShadow: `0 4px 16px ${color}44`,
        }}
      >
        {icon}
      </div>

      {/* Label */}
      <div
        style={{
          fontFamily: "Inter, sans-serif",
          fontWeight: 700,
          fontSize: 16,
          color: THEME.text,
          textAlign: "center",
        }}
      >
        {label}
      </div>

      {/* Sponsor name */}
      <div
        style={{
          fontFamily: "Inter, sans-serif",
          fontSize: 13,
          color: THEME.muted,
          textAlign: "center",
          backgroundColor: THEME.bgAlt,
          padding: "4px 12px",
          borderRadius: 12,
        }}
      >
        {sponsor}
      </div>
    </div>
  );
};
```

**Step 2: Implement ArchScene**

Replace `demo-video/src/scenes/ArchScene.tsx`:

```tsx
import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { ArchNode } from "../components/ArchNode";
import { THEME } from "../styles/theme";

const NODES = [
  { icon: "👁️", label: "Sees your screen", sponsor: "Reka Vision", x: 100, y: 120, delay: 30, color: "#E13238" },
  { icon: "🧠", label: "Understands context", sponsor: "GPT-4o", x: 400, y: 120, delay: 60, color: "#10A37F" },
  { icon: "🕸️", label: "Remembers everything", sponsor: "Neo4j", x: 700, y: 120, delay: 90, color: "#018BFF" },
  { icon: "🔍", label: "Searches the web", sponsor: "Tavily", x: 1000, y: 120, delay: 120, color: "#7209B7" },
  { icon: "☁️", label: "Runs in the cloud", sponsor: "Render", x: 1300, y: 120, delay: 150, color: "#46E3B7" },
  { icon: "🎤", label: "Hears your voice", sponsor: "Whisper", x: 1600, y: 120, delay: 180, color: "#F59E0B" },
];

// Arrows between nodes
const ARROWS = [
  { from: 0, to: 1, delay: 70 },
  { from: 1, to: 2, delay: 100 },
  { from: 2, to: 3, delay: 130 },
  { from: 3, to: 4, delay: 160 },
  { from: 4, to: 5, delay: 190 },
];

export const ArchScene: React.FC = () => {
  const frame = useCurrentFrame();

  // Title
  const titleOpacity = interpolate(frame, [0, 20], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // "How It Works" subtext
  const subtitleOpacity = interpolate(frame, [10, 30], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ backgroundColor: THEME.bg }}>
      {/* Title */}
      <div
        style={{
          position: "absolute",
          top: 60,
          left: 0,
          right: 0,
          textAlign: "center",
          opacity: titleOpacity,
        }}
      >
        <div
          style={{
            fontFamily: "Inter, sans-serif",
            fontWeight: 800,
            fontSize: 56,
            color: THEME.text,
            letterSpacing: -1,
          }}
        >
          How It Works
        </div>
        <div
          style={{
            fontFamily: "Inter, sans-serif",
            fontSize: 22,
            color: THEME.muted,
            marginTop: 8,
            opacity: subtitleOpacity,
          }}
        >
          6 tools working together, seamlessly
        </div>
      </div>

      {/* Architecture nodes */}
      {NODES.map((node, i) => (
        <ArchNode key={i} {...node} />
      ))}

      {/* Connecting arrows */}
      <svg
        style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", pointerEvents: "none" }}
      >
        {ARROWS.map((arrow, i) => {
          const from = NODES[arrow.from];
          const to = NODES[arrow.to];
          const arrowOpacity = interpolate(
            frame - arrow.delay,
            [0, 15],
            [0, 0.5],
            { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
          );
          const fromX = from.x + 90;
          const fromY = from.y + 40;
          const toX = to.x + 90;
          const toY = to.y + 40;
          // Progress of line drawing
          const progress = interpolate(
            frame - arrow.delay,
            [0, 15],
            [0, 1],
            { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
          );
          const currentX = fromX + (toX - fromX) * progress;
          const currentY = fromY + (toY - fromY) * progress;

          return (
            <line
              key={`a-${i}`}
              x1={fromX}
              y1={fromY}
              x2={currentX}
              y2={currentY}
              stroke={THEME.accent}
              strokeWidth={2}
              opacity={arrowOpacity}
              strokeDasharray="8,4"
            />
          );
        })}
      </svg>

      {/* Bottom flow label */}
      {frame >= 250 && (
        <div
          style={{
            position: "absolute",
            bottom: 120,
            left: 0,
            right: 0,
            textAlign: "center",
            opacity: interpolate(frame, [250, 280], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            }),
          }}
        >
          <div
            style={{
              display: "inline-block",
              fontFamily: "Inter, sans-serif",
              fontSize: 20,
              color: THEME.text,
              backgroundColor: THEME.bgAlt,
              padding: "12px 32px",
              borderRadius: 12,
              border: `1px solid #E2E8F0`,
            }}
          >
            Screenshot → Vision → Graph → Agent → Response
          </div>
        </div>
      )}
    </AbsoluteFill>
  );
};
```

**Step 3: Preview, verify nodes appear with staggered springs and arrows draw between them.**

**Step 4: Commit**

```bash
git add demo-video/src/components/ArchNode.tsx demo-video/src/scenes/ArchScene.tsx
git commit -m "feat: implement Scene 4 — architecture diagram with sponsor tools"
```

---

## Task 7: Build Scene 5 — Closing

**Files:**
- Modify: `demo-video/src/scenes/ClosingScene.tsx`

**Step 1: Implement closing scene**

```tsx
import React from "react";
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { Logo } from "../components/Logo";
import { THEME } from "../styles/theme";

const SPONSORS = ["Reka", "Tavily", "Neo4j", "Render", "OpenAI"];

export const ClosingScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const taglineOpacity = interpolate(frame, [40, 60], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Fade to black at end
  const fadeOut = interpolate(frame, [250, 300], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ backgroundColor: THEME.bg }}>
      <AbsoluteFill
        style={{
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        {/* Logo */}
        <Logo size={120} delay={5} />

        {/* Tagline */}
        <div
          style={{
            marginTop: 40,
            fontFamily: "Inter, sans-serif",
            fontSize: 28,
            color: THEME.muted,
            textAlign: "center",
            opacity: taglineOpacity,
          }}
        >
          Built in 5.5 hours at the Autonomous Agents Hackathon
        </div>

        {/* Sponsor logos */}
        <div
          style={{
            marginTop: 60,
            display: "flex",
            gap: 40,
            alignItems: "center",
          }}
        >
          {SPONSORS.map((name, i) => {
            const sponsorScale = spring({
              fps,
              frame: frame - 80 - i * 10,
              config: { damping: 15, stiffness: 150 },
            });
            return (
              <div
                key={name}
                style={{
                  fontFamily: "Inter, sans-serif",
                  fontSize: 18,
                  fontWeight: 600,
                  color: THEME.accent,
                  opacity: interpolate(sponsorScale, [0, 1], [0, 1]),
                  transform: `scale(${sponsorScale})`,
                  padding: "8px 20px",
                  borderRadius: 8,
                  backgroundColor: THEME.bgAlt,
                  border: `1px solid #E2E8F0`,
                }}
              >
                {name}
              </div>
            );
          })}
        </div>
      </AbsoluteFill>

      {/* Fade to black */}
      <AbsoluteFill
        style={{
          backgroundColor: "black",
          opacity: fadeOut,
        }}
      />
    </AbsoluteFill>
  );
};
```

**Step 2: Preview full video end-to-end in studio.**

**Step 3: Commit**

```bash
git add demo-video/src/scenes/ClosingScene.tsx
git commit -m "feat: implement Scene 5 — closing with sponsor logos and fade to black"
```

---

## Task 8: Polish and Render

**Files:**
- Potentially adjust timing constants in `demo-video/src/styles/theme.ts`
- Minor tweaks to any scene

**Step 1: Play through entire video in Remotion Studio**

```bash
cd demo-video && npm run dev
```

Check: all 5 scenes play, transitions are smooth, timing feels right for ~80 seconds.

**Step 2: Adjust scene durations if needed**

Edit `theme.ts` SCENES constants to tweak timing per scene.

**Step 3: Render final video**

```bash
cd demo-video
npx remotion render ScreenMindDemo out/screenmind-demo.mp4
```

Expected: MP4 file at `demo-video/out/screenmind-demo.mp4`

**Step 4: Commit final state**

```bash
git add demo-video/
git commit -m "feat: complete ScreenMind demo video — all 5 scenes with transitions"
```

---

## Summary

| Task | What | Est. |
|------|------|------|
| 1 | Scaffold Remotion project + structure | 5 min |
| 2 | Reusable components (AppWindow, TypeWriter, Logo) | 5 min |
| 3 | Scene 1: The Problem (chaotic window flood) | 5 min |
| 4 | Scene 2: Enter ScreenMind (logo + tagline) | 3 min |
| 5 | Scene 3: The Demo (desktop + overlay + graph) | 8 min |
| 6 | Scene 4: Architecture diagram | 5 min |
| 7 | Scene 5: Closing | 3 min |
| 8 | Polish + render | 5 min |
