import React from "react";
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { THEME } from "../styles/theme";

/* ------------------------------------------------------------------ */
/*  Pipeline Node Data                                                 */
/* ------------------------------------------------------------------ */
const PIPELINE_NODES = [
  { icon: "\u{1F4F8}", label: "mss Capture", color: THEME.textMuted, delay: 10 },
  { icon: "\u{1F511}", label: "pHash", color: THEME.textMuted, delay: 25 },
  { icon: "\u{1F441}\uFE0F", label: "Reka Vision", color: THEME.reka, delay: 40 },
  { icon: "\u{1F3F7}\uFE0F", label: "Fastino GLiNER2", color: THEME.fastino, delay: 55 },
  { icon: "\u{1F578}\uFE0F", label: "Neo4j AuraDB", color: THEME.neo4j, delay: 70 },
  { icon: "\u{1F50D}", label: "Tavily Search", color: THEME.tavily, delay: 85 },
  { icon: "\u{1F9E0}", label: "LLM Agent", color: THEME.llm, delay: 100 },
];

const SPONSORS = [
  { name: "Reka", color: THEME.reka },
  { name: "Fastino", color: THEME.fastino },
  { name: "Tavily", color: THEME.tavily },
  { name: "Neo4j", color: THEME.neo4j },
  { name: "Render", color: THEME.llm },
  { name: "OpenAI", color: THEME.success },
];

/* ------------------------------------------------------------------ */
/*  PipelineNode (inline component)                                    */
/* ------------------------------------------------------------------ */
const PipelineNode: React.FC<{
  icon: string;
  label: string;
  color: string;
  delay: number;
  x: number;
  y: number;
}> = ({ icon, label, color, delay, x, y }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const scale = spring({
    fps,
    frame: frame - delay,
    config: { damping: 12, stiffness: 180 },
  });

  return (
    <div
      style={{
        position: "absolute",
        left: x - 60,
        top: y - 36,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        transform: `scale(${scale})`,
        width: 120,
      }}
    >
      {/* Circle */}
      <div
        style={{
          width: 72,
          height: 72,
          borderRadius: "50%",
          backgroundColor: color,
          boxShadow: `0 0 20px ${color}55`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 32,
        }}
      >
        {icon}
      </div>
      {/* Label */}
      <div
        style={{
          marginTop: 8,
          fontSize: 14,
          fontWeight: 700,
          color: THEME.text,
          textAlign: "center",
          fontFamily: "Inter, sans-serif",
          whiteSpace: "nowrap",
        }}
      >
        {label}
      </div>
    </div>
  );
};

/* ------------------------------------------------------------------ */
/*  Main ClosingScene                                                  */
/* ------------------------------------------------------------------ */
export const ClosingScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  /* --- Beat 2: pipeline compresses upward --- */
  const pipelineY = interpolate(frame, [200, 240], [350, 150], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  /* --- Beat 2: logo entrance --- */
  const logoScale = spring({
    fps,
    frame: frame - 210,
    config: { damping: 15, stiffness: 120 },
  });

  /* --- Beat 2: tagline fade --- */
  const taglineOpacity = interpolate(frame, [240, 260], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  /* --- Beat 3: fade to black --- */
  const fadeToBlack = interpolate(frame, [350, 450], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: THEME.bg,
        fontFamily: "Inter, sans-serif",
      }}
    >
      {/* Dot grid background */}
      <AbsoluteFill
        style={{
          backgroundImage: `radial-gradient(${THEME.gridLine} 1px, transparent 1px)`,
          backgroundSize: "30px 30px",
        }}
      />

      {/* ============================================================ */}
      {/* BEAT 1 + BEAT 2: Pipeline Nodes                               */}
      {/* ============================================================ */}

      {/* Connecting arrows (SVG) */}
      <svg
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: 1920,
          height: 1080,
          pointerEvents: "none",
        }}
      >
        {PIPELINE_NODES.slice(0, -1).map((node, i) => {
          const nextNode = PIPELINE_NODES[i + 1];
          const arrowDelay = (node.delay + nextNode.delay) / 2;
          const arrowProgress = interpolate(
            frame,
            [arrowDelay, arrowDelay + 20],
            [0, 1],
            { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
          );

          const x1 = 130 + i * 240 + 36;
          const x2 = 130 + (i + 1) * 240 - 36;
          const lineY = pipelineY + 36;

          const currentX2 = x1 + (x2 - x1) * arrowProgress;

          return (
            <line
              key={`arrow-${i}`}
              x1={x1}
              y1={lineY}
              x2={currentX2}
              y2={lineY}
              stroke={`${THEME.cyan}66`}
              strokeWidth={2}
              strokeDasharray="8,4"
            />
          );
        })}
      </svg>

      {/* Data particles */}
      <svg
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: 1920,
          height: 1080,
          pointerEvents: "none",
        }}
      >
        {Array.from({ length: 8 }).map((_, i) => {
          const startFrame = 20 + i * 15;
          const elapsed = frame - startFrame;
          if (elapsed < 0) return null;
          const progress = (elapsed % 120) / 120;
          const px = 100 + progress * 1720;
          const py = pipelineY + 36;

          return (
            <circle
              key={`particle-${i}`}
              cx={px}
              cy={py}
              r={4}
              fill={`${THEME.cyan}80`}
            />
          );
        })}
      </svg>

      {/* Pipeline nodes */}
      {PIPELINE_NODES.map((node, i) => (
        <PipelineNode
          key={node.label}
          icon={node.icon}
          label={node.label}
          color={node.color}
          delay={node.delay}
          x={130 + i * 240}
          y={pipelineY}
        />
      ))}

      {/* ============================================================ */}
      {/* BEAT 2: Credits                                               */}
      {/* ============================================================ */}
      {frame >= 200 && (
        <>
          {/* ScreenMind logo */}
          <div
            style={{
              position: "absolute",
              top: 450,
              left: 0,
              width: 1920,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              gap: 16,
              transform: `scale(${logoScale})`,
            }}
          >
            <div
              style={{
                width: 120,
                height: 120,
                borderRadius: "50%",
                background: `linear-gradient(135deg, ${THEME.accent}, ${THEME.secondary})`,
                boxShadow: `0 0 40px ${THEME.accent}44`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 56,
                flexShrink: 0,
              }}
            >
              {"\u{1F9E0}"}
            </div>
            <div
              style={{
                fontSize: 64,
                fontWeight: 800,
                color: THEME.text,
                letterSpacing: -2,
                fontFamily: "Inter, sans-serif",
              }}
            >
              ScreenMind
            </div>
          </div>

          {/* Tagline */}
          <div
            style={{
              position: "absolute",
              top: 600,
              left: 0,
              width: 1920,
              textAlign: "center",
              fontSize: 24,
              color: THEME.textMuted,
              fontFamily: "Inter, sans-serif",
              opacity: taglineOpacity,
            }}
          >
            Built in 5.5 hours at the Autonomous Agents Hackathon
          </div>

          {/* Sponsor badges */}
          <div
            style={{
              position: "absolute",
              top: 700,
              left: 0,
              width: 1920,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              gap: 30,
            }}
          >
            {SPONSORS.map((sponsor, i) => {
              const badgeScale = spring({
                fps,
                frame: frame - (270 + i * 12),
                config: { damping: 12, stiffness: 180 },
              });

              return (
                <div
                  key={sponsor.name}
                  style={{
                    backgroundColor: THEME.bgCard,
                    borderRadius: 8,
                    padding: "8px 20px",
                    border: `1px solid ${sponsor.color}33`,
                    transform: `scale(${badgeScale})`,
                  }}
                >
                  <span
                    style={{
                      fontSize: 16,
                      fontWeight: 600,
                      color: sponsor.color,
                      fontFamily: "Inter, sans-serif",
                    }}
                  >
                    {sponsor.name}
                  </span>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* ============================================================ */}
      {/* BEAT 3: Fade to Black                                         */}
      {/* ============================================================ */}
      <AbsoluteFill style={{ backgroundColor: "black", opacity: fadeToBlack }} />
    </AbsoluteFill>
  );
};
