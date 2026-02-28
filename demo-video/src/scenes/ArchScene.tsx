import React from "react";
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { THEME } from "../styles/theme";

const NODES = [
  { icon: "👁️", label: "Sees your screen", sponsor: "Reka Vision", x: 70, y: 300, delay: 30, color: "#E13238" },
  { icon: "🧠", label: "Understands context", sponsor: "GPT-4o", x: 370, y: 300, delay: 60, color: "#10A37F" },
  { icon: "🕸️", label: "Remembers everything", sponsor: "Neo4j", x: 670, y: 300, delay: 90, color: "#018BFF" },
  { icon: "🔍", label: "Searches the web", sponsor: "Tavily", x: 970, y: 300, delay: 120, color: "#7209B7" },
  { icon: "☁️", label: "Runs in the cloud", sponsor: "Render", x: 1270, y: 300, delay: 150, color: "#46E3B7" },
  { icon: "🎤", label: "Hears your voice", sponsor: "Whisper", x: 1570, y: 300, delay: 180, color: "#F59E0B" },
];

const ARROWS = [
  { from: 0, to: 1, delay: 70 },
  { from: 1, to: 2, delay: 100 },
  { from: 2, to: 3, delay: 130 },
  { from: 3, to: 4, delay: 160 },
  { from: 4, to: 5, delay: 190 },
];

const ArchNode: React.FC<{
  icon: string;
  label: string;
  sponsor: string;
  x: number;
  y: number;
  delay: number;
  color: string;
}> = ({ icon, label, sponsor, x, y, delay, color }) => {
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

export const ArchScene: React.FC = () => {
  const frame = useCurrentFrame();

  const titleOpacity = interpolate(frame, [0, 20], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

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
          top: 80,
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
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          pointerEvents: "none",
        }}
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
          const progress = interpolate(frame - arrow.delay, [0, 15], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          });
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

      {/* Flow label */}
      {frame >= 300 && (
        <div
          style={{
            position: "absolute",
            bottom: 100,
            left: 0,
            right: 0,
            textAlign: "center",
            opacity: interpolate(frame, [300, 330], [0, 1], {
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
              border: "1px solid #E2E8F0",
            }}
          >
            Screenshot → Vision → Graph → Agent → Response
          </div>
        </div>
      )}
    </AbsoluteFill>
  );
};
