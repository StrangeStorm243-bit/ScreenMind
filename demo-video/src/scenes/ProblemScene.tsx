import React from "react";
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
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

const AppWindowSimple: React.FC<{
  title: string;
  x: number;
  y: number;
  width: number;
  height: number;
  delay: number;
  rotation: number;
}> = ({ title, x, y, width, height, delay, rotation }) => {
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
        <span style={{ marginLeft: 8, fontSize: 13, color: THEME.muted, fontFamily: "Inter, sans-serif" }}>
          {title}
        </span>
      </div>
      <div style={{ backgroundColor: "#FFFFFF", height: height - 36, padding: 16 }}>
        <div style={{ fontFamily: "monospace", fontSize: 11, color: THEME.muted, lineHeight: 1.6 }}>
          {Array.from({ length: 8 }, (_, j) => (
            <div key={j} style={{ opacity: 0.4 }}>
              {"█".repeat(10 + ((j * 7 + 3) % 25))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export const ProblemScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const totalFrames = SCENES.problem;

  const textOpacity = interpolate(frame, [250, 270, 380, 400], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const textScale = spring({
    fps,
    frame: frame - 250,
    config: { damping: 8, stiffness: 300 },
  });

  const dissolve = interpolate(frame, [370, totalFrames], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ backgroundColor: THEME.bg }}>
      <div style={{ opacity: dissolve }}>
        {APPS.map((app, i) => (
          <AppWindowSimple
            key={i}
            title={app.title}
            x={app.x}
            y={app.y}
            width={app.w}
            height={app.h}
            delay={app.delay}
            rotation={app.rot}
          />
        ))}
      </div>

      {frame >= 250 && (
        <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", zIndex: 100 }}>
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
