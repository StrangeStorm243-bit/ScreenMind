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

// 6 scenes: 60s animated (1.5x speed) + ~89s real demo = ~2.5 minutes
export const SCENES = {
  problem: 400,       // 0:00–0:13 (13.3s)
  reka: 400,          // 0:13–0:27 (13.3s)
  fastino: 300,       // 0:27–0:37 (10s)
  neo4jRag: 400,      // 0:37–0:50 (13.3s)
  closing: 300,       // 0:50–1:00 (10s)
  realDemo: 2681,     // 1:00–2:29 (~89.4s at 30fps)
} as const;

export const TRANSITION_FRAMES = 15;

export const TOTAL_DURATION =
  SCENES.problem +
  SCENES.reka +
  SCENES.fastino +
  SCENES.neo4jRag +
  SCENES.closing +
  SCENES.realDemo -
  5 * TRANSITION_FRAMES; // 5 transitions between 6 scenes
