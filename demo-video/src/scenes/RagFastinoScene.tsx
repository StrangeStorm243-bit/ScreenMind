import React from "react";
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { THEME } from "../styles/theme";

/**
 * Scene: Fastino GLiNER2 Entity Extraction + Neo4j RAG
 *
 * Visualizes:
 * 1. Reka description → Fastino GLiNER2 extracts entities
 * 2. Entities + description stored as ScreenCapture nodes in Neo4j
 * 3. On user query: hybrid search retrieves relevant captures (skips Reka!)
 * 4. 50% latency improvement (8-9s → 4-5s)
 */

// Animated entity badge
const EntityBadge: React.FC<{
  label: string;
  category: string;
  x: number;
  y: number;
  delay: number;
}> = ({ label, category, x, y, delay }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const scale = spring({
    fps,
    frame: frame - delay,
    config: { damping: 12, stiffness: 200 },
  });

  const opacity = interpolate(frame - delay, [0, 8], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const categoryColors: Record<string, string> = {
    application: THEME.accent,
    technology: THEME.secondary,
    website: THEME.success,
    project: THEME.fastino,
    person: "#EC4899",
  };

  const color = categoryColors[category] || THEME.muted;

  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        transform: `scale(${scale})`,
        opacity,
        display: "flex",
        alignItems: "center",
        gap: 6,
        padding: "6px 14px",
        borderRadius: 20,
        backgroundColor: `${color}15`,
        border: `1px solid ${color}44`,
      }}
    >
      <div
        style={{
          width: 8,
          height: 8,
          borderRadius: 4,
          backgroundColor: color,
        }}
      />
      <span
        style={{
          fontFamily: "Inter, sans-serif",
          fontSize: 14,
          fontWeight: 600,
          color,
        }}
      >
        {label}
      </span>
      <span
        style={{
          fontFamily: "Inter, sans-serif",
          fontSize: 10,
          color: THEME.muted,
          backgroundColor: THEME.bgAlt,
          padding: "2px 6px",
          borderRadius: 4,
        }}
      >
        {category}
      </span>
    </div>
  );
};

// Neo4j graph storage visualization
const Neo4jStorage: React.FC<{ startFrame: number }> = ({ startFrame }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const elapsed = frame - startFrame;
  if (elapsed < 0) return null;

  const containerOpacity = interpolate(elapsed, [0, 20], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const nodes = [
    { label: "ScreenCapture", x: 160, y: 80, r: 35, color: THEME.neo4j, delay: 10, type: "capture" },
    { label: "Chrome", x: 60, y: 50, r: 22, color: THEME.accent, delay: 30, type: "topic" },
    { label: "React", x: 80, y: 140, r: 22, color: THEME.secondary, delay: 45, type: "topic" },
    { label: "API", x: 260, y: 50, r: 22, color: THEME.success, delay: 60, type: "topic" },
    { label: "coding", x: 270, y: 140, r: 22, color: THEME.fastino, delay: 75, type: "topic" },
  ];

  const edges = [
    { from: 0, to: 1, label: "MENTIONS", delay: 40 },
    { from: 0, to: 2, label: "MENTIONS", delay: 55 },
    { from: 0, to: 3, label: "MENTIONS", delay: 70 },
    { from: 0, to: 4, label: "MENTIONS", delay: 85 },
  ];

  return (
    <div
      style={{
        position: "absolute",
        right: 60,
        top: 300,
        width: 360,
        height: 260,
        backgroundColor: "rgba(1, 139, 255, 0.05)",
        borderRadius: 16,
        border: `1px solid ${THEME.neo4j}33`,
        padding: 20,
        opacity: containerOpacity,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          marginBottom: 12,
        }}
      >
        <div
          style={{
            width: 28,
            height: 28,
            borderRadius: 14,
            backgroundColor: THEME.neo4j,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 14,
          }}
        >
          🕸️
        </div>
        <span
          style={{
            fontFamily: "Inter, sans-serif",
            fontWeight: 700,
            fontSize: 14,
            color: THEME.neo4j,
          }}
        >
          Neo4j AuraDB
        </span>
      </div>

      <svg width="320" height="180" viewBox="0 0 320 180">
        {edges.map((edge, i) => {
          const from = nodes[edge.from];
          const to = nodes[edge.to];
          const edgeOpacity = interpolate(
            elapsed - edge.delay,
            [0, 12],
            [0, 0.5],
            { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
          );
          return (
            <g key={`e-${i}`}>
              <line
                x1={from.x}
                y1={from.y}
                x2={to.x}
                y2={to.y}
                stroke={THEME.neo4j}
                strokeWidth={1.5}
                opacity={edgeOpacity}
              />
              <text
                x={(from.x + to.x) / 2}
                y={(from.y + to.y) / 2 - 5}
                textAnchor="middle"
                fill={THEME.neo4j}
                fontSize={7}
                fontFamily="Inter, sans-serif"
                opacity={edgeOpacity}
              >
                {edge.label}
              </text>
            </g>
          );
        })}
        {nodes.map((node, i) => {
          const nodeScale = spring({
            fps,
            frame: elapsed - node.delay,
            config: { damping: 12, stiffness: 200 },
          });
          const nodeOpacity = interpolate(
            elapsed - node.delay,
            [0, 8],
            [0, 1],
            { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
          );
          return (
            <g key={`n-${i}`} opacity={nodeOpacity}>
              <circle
                cx={node.x}
                cy={node.y}
                r={node.r * nodeScale}
                fill={node.color}
                opacity={0.85}
              />
              <text
                x={node.x}
                y={node.y + 4}
                textAnchor="middle"
                fill="white"
                fontSize={node.type === "capture" ? 8 : 9}
                fontFamily="Inter, sans-serif"
                fontWeight={600}
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

// RAG retrieval visualization
const RAGRetrieval: React.FC<{ startFrame: number }> = ({ startFrame }) => {
  const frame = useCurrentFrame();
  const elapsed = frame - startFrame;
  if (elapsed < 0) return null;

  const fadeIn = interpolate(elapsed, [0, 20], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        position: "absolute",
        left: 80,
        bottom: 60,
        right: 80,
        opacity: fadeIn,
      }}
    >
      {/* The key insight */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: 60,
          alignItems: "center",
        }}
      >
        {/* Before: With Reka on every query */}
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              fontFamily: "Inter, sans-serif",
              fontSize: 14,
              color: THEME.danger,
              fontWeight: 700,
              marginBottom: 8,
            }}
          >
            Before: Query with Reka
          </div>
          <div
            style={{
              fontFamily: "monospace",
              fontSize: 32,
              fontWeight: 800,
              color: THEME.danger,
              opacity: interpolate(elapsed, [20, 40], [0, 1], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              }),
            }}
          >
            8-9 seconds
          </div>
          <div
            style={{
              fontFamily: "Inter, sans-serif",
              fontSize: 12,
              color: THEME.muted,
              marginTop: 4,
            }}
          >
            Screenshot → Reka → LLM → Response
          </div>
        </div>

        {/* Arrow */}
        <div
          style={{
            fontSize: 40,
            color: THEME.success,
            fontWeight: 800,
            opacity: interpolate(elapsed, [50, 70], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            }),
          }}
        >
          →
        </div>

        {/* After: RAG from Neo4j */}
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              fontFamily: "Inter, sans-serif",
              fontSize: 14,
              color: THEME.success,
              fontWeight: 700,
              marginBottom: 8,
            }}
          >
            After: RAG from Neo4j
          </div>
          <div
            style={{
              fontFamily: "monospace",
              fontSize: 32,
              fontWeight: 800,
              color: THEME.success,
              opacity: interpolate(elapsed, [60, 80], [0, 1], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              }),
            }}
          >
            4-5 seconds
          </div>
          <div
            style={{
              fontFamily: "Inter, sans-serif",
              fontSize: 12,
              color: THEME.muted,
              marginTop: 4,
            }}
          >
            Query → Neo4j → LLM → Response
          </div>
        </div>

        {/* 50% badge */}
        <div
          style={{
            opacity: interpolate(elapsed, [80, 100], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            }),
            textAlign: "center",
          }}
        >
          <div
            style={{
              fontFamily: "Inter, sans-serif",
              fontSize: 48,
              fontWeight: 900,
              color: THEME.success,
              lineHeight: 1,
            }}
          >
            50%
          </div>
          <div
            style={{
              fontFamily: "Inter, sans-serif",
              fontSize: 14,
              color: THEME.success,
              fontWeight: 600,
            }}
          >
            faster
          </div>
        </div>
      </div>
    </div>
  );
};

export const RagFastinoScene: React.FC = () => {
  const frame = useCurrentFrame();

  const titleOpacity = interpolate(frame, [0, 20], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ backgroundColor: THEME.bg }}>
      {/* Title */}
      <div
        style={{
          position: "absolute",
          top: 50,
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
            fontSize: 48,
            color: THEME.text,
            letterSpacing: -1,
          }}
        >
          Smart Memory, Fast Retrieval
        </div>
        <div style={{ fontFamily: "Inter, sans-serif", fontSize: 20, color: THEME.muted, marginTop: 8 }}>
          Fastino GLiNER2 extracts entities → Neo4j stores the knowledge graph
        </div>
      </div>

      {/* Left side: Reka description input */}
      <div
        style={{
          position: "absolute",
          left: 60,
          top: 180,
          width: 420,
          opacity: interpolate(frame, [30, 50], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
        }}
      >
        <div
          style={{
            fontFamily: "Inter, sans-serif",
            fontSize: 14,
            fontWeight: 700,
            color: THEME.reka,
            marginBottom: 10,
            display: "flex",
            alignItems: "center",
            gap: 6,
          }}
        >
          👁️ Reka Vision Description
        </div>
        <div
          style={{
            backgroundColor: THEME.bgAlt,
            borderRadius: 10,
            padding: 16,
            border: "1px solid #E2E8F0",
            fontFamily: "monospace",
            fontSize: 12,
            color: THEME.text,
            lineHeight: 1.6,
          }}
        >
          APPLICATION: Chrome — React Docs<br />
          WINDOW TITLE: Server Components | React<br />
          VISIBLE TEXT: "Server Components let you write..."<br />
          ACTIVITY: Reading documentation
        </div>
      </div>

      {/* Arrow from description to Fastino */}
      {frame >= 80 && (
        <div
          style={{
            position: "absolute",
            left: 500,
            top: 270,
            opacity: interpolate(frame, [80, 100], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            }),
          }}
        >
          <div
            style={{
              fontFamily: "Inter, sans-serif",
              fontSize: 30,
              color: THEME.fastino,
              fontWeight: 700,
            }}
          >
            →
          </div>
        </div>
      )}

      {/* Center: Fastino GLiNER2 extraction */}
      <div
        style={{
          position: "absolute",
          left: 540,
          top: 180,
          width: 320,
          opacity: interpolate(frame, [80, 100], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
        }}
      >
        <div
          style={{
            fontFamily: "Inter, sans-serif",
            fontSize: 14,
            fontWeight: 700,
            color: THEME.fastino,
            marginBottom: 10,
            display: "flex",
            alignItems: "center",
            gap: 6,
          }}
        >
          🏷️ Fastino GLiNER2
        </div>

        {/* Extracted entities */}
        <EntityBadge label="Chrome" category="application" x={0} y={0} delay={110} />
        <EntityBadge label="React" category="technology" x={0} y={40} delay={130} />
        <EntityBadge label="Server Components" category="technology" x={0} y={80} delay={150} />
        <EntityBadge label="reading_docs" category="activity" x={0} y={120} delay={170} />
      </div>

      {/* Right side: Neo4j storage */}
      <Neo4jStorage startFrame={200} />

      {/* Bottom: RAG retrieval comparison */}
      <RAGRetrieval startFrame={380} />
    </AbsoluteFill>
  );
};
