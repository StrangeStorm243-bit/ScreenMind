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
  neo4j: "#018BFF",
  reka: "#E13238",
  fastino: "#F59E0B",
} as const;

export const FPS = 30;
export const WIDTH = 1920;
export const HEIGHT = 1080;

// Scene durations in frames (at 30fps) — 2 minute video
export const SCENES = {
  problem: 15 * FPS,       // 0:00–0:15 (450 frames)
  intro: 10 * FPS,         // 0:15–0:25 (300 frames)
  rekaCapture: 20 * FPS,   // 0:25–0:45 (600 frames) — NEW: Reka background capture loop
  ragFastino: 20 * FPS,    // 0:45–1:05 (600 frames) — NEW: Fastino GLiNER2 + Neo4j RAG
  demo: 25 * FPS,          // 1:05–1:30 (750 frames)
  arch: 20 * FPS,          // 1:30–1:50 (600 frames)
  closing: 10 * FPS,       // 1:50–2:00 (300 frames)
} as const;

export const TRANSITION_FRAMES = 15; // 0.5s fade between scenes

export const TOTAL_DURATION =
  SCENES.problem +
  SCENES.intro +
  SCENES.rekaCapture +
  SCENES.ragFastino +
  SCENES.demo +
  SCENES.arch +
  SCENES.closing -
  6 * TRANSITION_FRAMES; // 6 transitions between 7 scenes
