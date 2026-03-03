import React from "react";
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { THEME } from "../styles/theme";

/* ── helpers ─────────────────────────────────────────────────────────── */

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

/* ── inline TypeWriter ───────────────────────────────────────────────── */

const TypeWriter: React.FC<{
  text: string;
  startFrame: number;
  speed?: number;
}> = ({ text, startFrame, speed = 1.5 }) => {
  const frame = useCurrentFrame();
  const elapsed = frame - startFrame;
  if (elapsed < 0) return null;
  const chars = Math.min(Math.floor(elapsed * speed), text.length);
  const showCursor = elapsed % 16 < 10;
  return (
    <span>
      {text.slice(0, chars)}
      {chars < text.length && showCursor && (
        <span style={{ opacity: 0.7 }}>{"\u258C"}</span>
      )}
    </span>
  );
};

/* ── graph data ──────────────────────────────────────────────────────── */

const NODES = [
  { id: "sc1", label: "ScreenCapture", x: 400, y: 200, r: 40, color: THEME.neo4j, delay: 73 },
  { id: "vscode", label: "VS Code", x: 200, y: 100, r: 26, color: THEME.neo4j, delay: 93 },
  { id: "python", label: "Python", x: 200, y: 300, r: 26, color: THEME.secondary, delay: 103 },
  { id: "runagent", label: "run_agent", x: 600, y: 100, r: 26, color: THEME.secondary, delay: 113 },
  { id: "coding", label: "coding", x: 600, y: 300, r: 26, color: THEME.fastino, delay: 123 },
  { id: "react", label: "React", x: 100, y: 200, r: 22, color: THEME.secondary, delay: 147 },
  { id: "chrome", label: "Chrome", x: 700, y: 200, r: 22, color: THEME.accent, delay: 157 },
  { id: "api", label: "API Design", x: 400, y: 380, r: 22, color: THEME.success, delay: 167 },
];

const EDGES = [
  { from: "sc1", to: "vscode", label: "MENTIONS", delay: 97 },
  { from: "sc1", to: "python", label: "MENTIONS", delay: 107 },
  { from: "sc1", to: "runagent", label: "MENTIONS", delay: 117 },
  { from: "sc1", to: "coding", label: "MENTIONS", delay: 127 },
  { from: "python", to: "react", label: "RELATED_TO", delay: 160 },
  { from: "vscode", to: "chrome", label: "RELATED_TO", delay: 170 },
];

const RELEVANT_IDS = new Set(["vscode", "python", "coding", "runagent"]);

/* ── helpers to look up node by id ───────────────────────────────────── */

const nodeById = (id: string) => NODES.find((n) => n.id === id)!;

/* ── main scene ──────────────────────────────────────────────────────── */

export const Neo4jRagScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  /* ── Phase A: Storage (0–200) ──────────────────────────────────────── */

  // Beat 1: Title fade in
  const titleOpacity = interpolate(frame, [0, 20], [0, 1], clamp);

  // Beat 1: Entity badges
  const BADGES = [
    { label: "VS Code", color: THEME.neo4j, delay: 20 },
    { label: "Python", color: THEME.secondary, delay: 30 },
    { label: "run_agent", color: THEME.secondary, delay: 40 },
    { label: "coding", color: THEME.fastino, delay: 50 },
  ];

  /* ── Phase B: RAG Retrieval (200–400) ──────────────────────────────── */

  // Beat 3: Chat input bar
  const chatBarScale = spring({
    fps,
    frame: frame - 200,
    config: { damping: 12, stiffness: 200 },
  });
  const chatBarOpacity = interpolate(frame - 200, [0, 8], [0, 1], clamp);

  // Beat 4: Retrieval label
  const retrievalLabelOpacity = interpolate(frame, [287, 297], [0, 1], clamp);

  // Beat 5: Comparison boxes
  const leftBoxScale = spring({
    fps,
    frame: frame - 333,
    config: { damping: 12, stiffness: 200 },
  });
  const leftBoxOpacity = interpolate(frame - 333, [0, 8], [0, 1], clamp);

  const rightBoxScale = spring({
    fps,
    frame: frame - 343,
    config: { damping: 12, stiffness: 200 },
  });
  const rightBoxOpacity = interpolate(frame - 343, [0, 8], [0, 1], clamp);

  const fasterBadgeScale = spring({
    fps,
    frame: frame - 353,
    config: { damping: 12, stiffness: 200 },
  });
  const fasterBadgeOpacity = interpolate(frame - 353, [0, 8], [0, 1], clamp);
  const fasterPulse = 1 + Math.sin(frame * 0.08) * 0.05;

  return (
    <AbsoluteFill
      style={{
        backgroundColor: THEME.bg,
        backgroundImage: `radial-gradient(${THEME.gridLine} 1px, transparent 1px)`,
        backgroundSize: "30px 30px",
      }}
    >
      {/* ═══ Beat 1: Title + Entity Input ═══ */}

      {/* Title */}
      <div
        style={{
          position: "absolute",
          top: 60,
          left: 0,
          right: 0,
          textAlign: "center",
          opacity: titleOpacity,
          fontFamily: "Inter, sans-serif",
        }}
      >
        <div style={{ fontSize: 44, fontWeight: 800, color: THEME.text }}>
          Step 3:{" "}
          <span style={{ color: THEME.neo4j }}>Building Memory</span>
        </div>
        <div
          style={{
            fontSize: 20,
            color: THEME.textMuted,
            marginTop: 12,
          }}
        >
          Entities stored as knowledge graph in Neo4j AuraDB
        </div>
      </div>

      {/* Entity badges — left side */}
      <div
        style={{
          position: "absolute",
          left: 60,
          top: 220,
          display: "flex",
          flexDirection: "column",
          gap: 14,
        }}
      >
        {BADGES.map((badge) => {
          const badgeSpring = spring({
            fps,
            frame: frame - badge.delay,
            config: { damping: 12, stiffness: 200 },
          });
          const badgeOpacity = interpolate(
            frame - badge.delay,
            [0, 8],
            [0, 1],
            clamp,
          );
          const translateX = interpolate(
            badgeSpring,
            [0, 1],
            [-100, 0],
            clamp,
          );
          return (
            <div
              key={badge.label}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                backgroundColor: THEME.bgCard,
                borderRadius: 20,
                padding: "8px 18px",
                border: "1px solid rgba(255,255,255,0.08)",
                opacity: badgeOpacity,
                transform: `translateX(${translateX}px)`,
              }}
            >
              <div
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: 5,
                  backgroundColor: badge.color,
                  boxShadow: `0 0 6px ${badge.color}88`,
                }}
              />
              <span
                style={{
                  fontSize: 16,
                  color: THEME.text,
                  fontFamily: "Inter, sans-serif",
                  fontWeight: 600,
                }}
              >
                {badge.label}
              </span>
            </div>
          );
        })}
      </div>

      {/* ═══ Beat 2: Graph Construction — Neo4j AuraDB container ═══ */}

      {frame >= 67 && (() => {
        const containerOpacity = interpolate(frame, [67, 77], [0, 1], clamp);
        return (
          <div
            style={{
              position: "absolute",
              left: 570,
              top: 180,
              width: 840,
              height: 540,
              borderRadius: 16,
              border: `1px solid ${THEME.neo4j}22`,
              backgroundColor: "rgba(1, 139, 255, 0.03)",
              opacity: containerOpacity,
              overflow: "hidden",
            }}
          >
            {/* Header */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "12px 18px",
                borderBottom: `1px solid ${THEME.neo4j}22`,
              }}
            >
              <div
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 14,
                  backgroundColor: `${THEME.neo4j}22`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 14,
                }}
              >
                {"\uD83D\uDD78\uFE0F"}
              </div>
              <span
                style={{
                  fontSize: 15,
                  fontWeight: 700,
                  color: THEME.neo4j,
                  fontFamily: "Inter, sans-serif",
                }}
              >
                Neo4j AuraDB
              </span>
            </div>

            {/* SVG graph */}
            <svg
              viewBox="0 0 800 460"
              width={800}
              height={460}
              style={{ marginLeft: 20, marginTop: 10 }}
            >
              {/* Edges */}
              {EDGES.map((edge) => {
                const fromNode = nodeById(edge.from);
                const toNode = nodeById(edge.to);
                const progress = interpolate(
                  frame - edge.delay,
                  [0, 20],
                  [0, 1],
                  clamp,
                );
                if (progress <= 0) return null;

                const x1 = fromNode.x;
                const y1 = fromNode.y;
                const x2 = x1 + (toNode.x - x1) * progress;
                const y2 = y1 + (toNode.y - y1) * progress;

                const isMentions = edge.label === "MENTIONS";
                const strokeColor = isMentions
                  ? THEME.neo4j
                  : THEME.textMuted;

                // In Beat 4 (400+), MENTIONS edges to relevant nodes glow brighter
                const isRelevantEdge =
                  isMentions &&
                  (RELEVANT_IDS.has(edge.to) || RELEVANT_IDS.has(edge.from));
                const baseOpacity = interpolate(
                  frame - edge.delay,
                  [0, 20],
                  [0, 0.6],
                  clamp,
                );
                const edgeOpacity =
                  frame >= 267 && isRelevantEdge
                    ? interpolate(
                        frame,
                        [267, 280],
                        [baseOpacity, 1.0],
                        clamp,
                      )
                    : baseOpacity;

                // Midpoint for label
                const mx = (fromNode.x + toNode.x) / 2;
                const my = (fromNode.y + toNode.y) / 2;
                const labelOpacity =
                  progress >= 1
                    ? interpolate(
                        frame - edge.delay - 20,
                        [0, 10],
                        [0, 0.7],
                        clamp,
                      )
                    : 0;

                return (
                  <g key={`${edge.from}-${edge.to}`}>
                    <line
                      x1={x1}
                      y1={y1}
                      x2={x2}
                      y2={y2}
                      stroke={strokeColor}
                      strokeWidth={1.5}
                      opacity={edgeOpacity}
                    />
                    {labelOpacity > 0 && (
                      <text
                        x={mx}
                        y={my - 6}
                        textAnchor="middle"
                        fill={THEME.textMuted}
                        fontSize={7}
                        fontFamily="Inter, sans-serif"
                        opacity={labelOpacity}
                      >
                        {edge.label}
                      </text>
                    )}
                  </g>
                );
              })}

              {/* Nodes */}
              {NODES.map((node) => {
                const nodeScale = spring({
                  fps,
                  frame: frame - node.delay,
                  config: { damping: 12, stiffness: 200 },
                });
                const nodeOpacity = interpolate(
                  frame - node.delay,
                  [0, 8],
                  [0, 1],
                  clamp,
                );
                if (nodeOpacity <= 0) return null;

                const isRelevant = RELEVANT_IDS.has(node.id);
                const showGlow = frame >= 267 && isRelevant;
                const glowOpacity = showGlow
                  ? 0.3 + Math.sin(frame * 0.1) * 0.2
                  : 0;

                const fontSize = node.id === "sc1" ? 8 : 9;

                return (
                  <g
                    key={node.id}
                    transform={`translate(${node.x}, ${node.y}) scale(${nodeScale})`}
                    opacity={nodeOpacity}
                  >
                    {/* Outer glow ring for relevant nodes during Beat 4 */}
                    {showGlow && (
                      <circle
                        cx={0}
                        cy={0}
                        r={node.r + 10}
                        fill={node.color}
                        opacity={glowOpacity}
                      />
                    )}
                    {/* Main circle */}
                    <circle
                      cx={0}
                      cy={0}
                      r={node.r}
                      fill={node.color}
                      opacity={0.85}
                    />
                    {/* Glow for ScreenCapture center node */}
                    {node.id === "sc1" && (
                      <circle
                        cx={0}
                        cy={0}
                        r={node.r + 6}
                        fill="none"
                        stroke={node.color}
                        strokeWidth={2}
                        opacity={0.3}
                      />
                    )}
                    {/* Label */}
                    <text
                      x={0}
                      y={node.r <= 22 ? 3 : 4}
                      textAnchor="middle"
                      fill="white"
                      fontSize={fontSize}
                      fontFamily="Inter, sans-serif"
                      fontWeight={600}
                    >
                      {node.label}
                    </text>
                  </g>
                );
              })}
            </svg>

            {/* Beat 4: Retrieval label */}
            {frame >= 287 && (
              <div
                style={{
                  position: "absolute",
                  bottom: 16,
                  right: 20,
                  fontSize: 16,
                  color: THEME.cyan,
                  fontFamily: "Inter, sans-serif",
                  fontWeight: 600,
                  opacity: retrievalLabelOpacity,
                }}
              >
                Top 5 relevant contexts retrieved
              </div>
            )}
          </div>
        );
      })()}

      {/* ═══ Beat 3: User Query — chat input bar ═══ */}

      {frame >= 200 && (
        <div
          style={{
            position: "absolute",
            top: 780,
            left: "50%",
            transform: `translateX(-50%) scale(${chatBarScale})`,
            width: 600,
            height: 50,
            borderRadius: 12,
            backgroundColor: THEME.bgCard,
            border: `1px solid ${THEME.accent}44`,
            display: "flex",
            alignItems: "center",
            padding: "0 20px",
            opacity: chatBarOpacity,
            fontFamily: "monospace",
            fontSize: 20,
            color: THEME.text,
          }}
        >
          <TypeWriter
            text="What was I coding earlier?"
            startFrame={213}
            speed={2.0}
          />
        </div>
      )}

      {/* ═══ Beat 5: Speed Comparison ═══ */}

      {frame >= 333 && (
        <div
          style={{
            position: "absolute",
            bottom: 40,
            left: "50%",
            transform: "translateX(-50%)",
            display: "flex",
            alignItems: "center",
            gap: 30,
          }}
        >
          {/* Left box: Without RAG */}
          <div
            style={{
              width: 380,
              backgroundColor: THEME.bgCard,
              borderRadius: 12,
              padding: 20,
              borderTop: `3px solid ${THEME.danger}`,
              border: `1px solid rgba(255,255,255,0.08)`,
              borderTopColor: THEME.danger,
              borderTopWidth: 3,
              borderTopStyle: "solid",
              transform: `scale(${leftBoxScale})`,
              opacity: leftBoxOpacity,
              fontFamily: "Inter, sans-serif",
            }}
          >
            <div
              style={{
                fontSize: 18,
                fontWeight: 700,
                color: THEME.danger,
                marginBottom: 12,
              }}
            >
              Without RAG
            </div>
            <div
              style={{
                fontSize: 36,
                fontFamily: "monospace",
                fontWeight: 700,
                color: THEME.danger,
                marginBottom: 8,
              }}
            >
              8-9 seconds
            </div>
            <div
              style={{
                fontSize: 12,
                color: THEME.textMuted,
              }}
            >
              Screenshot {"\u2192"} Reka {"\u2192"} LLM {"\u2192"} Response
            </div>
          </div>

          {/* Right box: With RAG */}
          <div
            style={{
              width: 380,
              backgroundColor: THEME.bgCard,
              borderRadius: 12,
              padding: 20,
              border: `1px solid rgba(255,255,255,0.08)`,
              borderTopColor: THEME.success,
              borderTopWidth: 3,
              borderTopStyle: "solid",
              transform: `scale(${rightBoxScale})`,
              opacity: rightBoxOpacity,
              fontFamily: "Inter, sans-serif",
            }}
          >
            <div
              style={{
                fontSize: 18,
                fontWeight: 700,
                color: THEME.success,
                marginBottom: 12,
              }}
            >
              With RAG
            </div>
            <div
              style={{
                fontSize: 36,
                fontFamily: "monospace",
                fontWeight: 700,
                color: THEME.success,
                marginBottom: 8,
              }}
            >
              4-5 seconds
            </div>
            <div
              style={{
                fontSize: 12,
                color: THEME.textMuted,
              }}
            >
              Query {"\u2192"} Neo4j {"\u2192"} LLM {"\u2192"} Response
            </div>
          </div>

          {/* "50% FASTER" badge */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              transform: `scale(${fasterBadgeScale * fasterPulse})`,
              opacity: fasterBadgeOpacity,
            }}
          >
            <div
              style={{
                fontSize: 56,
                fontWeight: 900,
                color: THEME.success,
                fontFamily: "Inter, sans-serif",
                lineHeight: 1,
              }}
            >
              50%
            </div>
            <div
              style={{
                fontSize: 16,
                fontWeight: 700,
                color: THEME.success,
                fontFamily: "Inter, sans-serif",
                marginTop: 4,
              }}
            >
              FASTER
            </div>
          </div>
        </div>
      )}
    </AbsoluteFill>
  );
};
