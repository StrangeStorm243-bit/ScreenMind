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

const ENTITIES = [
  { delay: 67, dot: THEME.neo4j, label: "VS Code", category: "application", score: "0.94" },
  { delay: 80, dot: THEME.secondary, label: "Python", category: "technology", score: "0.91" },
  { delay: 93, dot: THEME.secondary, label: "run_agent", category: "technology", score: "0.87" },
  { delay: 107, dot: THEME.fastino, label: "coding", category: "activity", score: "0.93" },
] as const;

const REKA_LINES = [
  { label: "APPLICATION:", value: "VS Code" },
  { label: "WINDOW_TITLE:", value: "agent.py — ScreenMind" },
  { label: "CONTENT:", value: "Python function run_agent()" },
  { label: "ACTIVITY:", value: "coding" },
] as const;

/* ── main scene ──────────────────────────────────────────────────────── */

export const FastinoScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  /* ── Beat 1 (0–53): Title + Reka Input ─────────────────────────────── */

  const titleOpacity = interpolate(frame, [0, 20], [0, 1], clamp);

  const rekaCardScale = spring({
    fps,
    frame: frame - 13,
    config: { damping: 12, stiffness: 200 },
  });

  const rekaCardOpacity = interpolate(frame - 13, [0, 8], [0, 1], clamp);

  /* ── Beat 2 (53–147): GLiNER2 Processing + Entity Extraction ───────── */

  const arrowOpacity = interpolate(frame, [53, 63], [0, 1], clamp);

  const fastinoNodeScale = spring({
    fps,
    frame: frame - 57,
    config: { damping: 12, stiffness: 180 },
  });

  const fastinoNodeOpacity = interpolate(frame - 57, [0, 8], [0, 1], clamp);

  // Pulsing glow for the Fastino node
  const glowIntensity = Math.sin(frame * 0.15) * 0.3 + 0.5;

  /* ── Beat 3 (147–227): Three Operation Cards ───────────────────────── */

  const card1Scale = spring({
    fps,
    frame: frame - 150,
    config: { damping: 12, stiffness: 200 },
  });

  const card2Scale = spring({
    fps,
    frame: frame - 167,
    config: { damping: 12, stiffness: 200 },
  });

  const card3Scale = spring({
    fps,
    frame: frame - 183,
    config: { damping: 12, stiffness: 200 },
  });

  /* ── Beat 4 (227–300): Pipeline label + particles ──────────────────── */

  const pipelineOpacity = interpolate(frame, [227, 247], [0, 1], clamp);

  const PARTICLE_COUNT = 5;
  const PARTICLE_STAGGER = 10;
  const PARTICLE_TRAVEL = 70;

  return (
    <AbsoluteFill
      style={{
        backgroundColor: THEME.bg,
        backgroundImage: `radial-gradient(${THEME.gridLine} 1px, transparent 1px)`,
        backgroundSize: "30px 30px",
      }}
    >
      {/* ═══ Beat 1: Title + Reka Input ═══ */}

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
          Step 2:{" "}
          <span style={{ color: THEME.fastino }}>Understanding Context</span>
        </div>
        <div
          style={{
            fontSize: 20,
            color: THEME.textMuted,
            marginTop: 12,
          }}
        >
          Fastino GLiNER2 extracts entities from every screen description
        </div>
      </div>

      {/* Reka output card */}
      <div
        style={{
          position: "absolute",
          left: 80,
          top: 200,
          width: 440,
          borderRadius: 12,
          backgroundColor: THEME.bgCard,
          border: `1px solid ${THEME.reka}33`,
          overflow: "hidden",
          transform: `scale(${rekaCardScale})`,
          opacity: rekaCardOpacity,
        }}
      >
        {/* Card header */}
        <div
          style={{
            padding: "12px 20px",
            display: "flex",
            alignItems: "center",
            gap: 8,
            borderBottom: `1px solid ${THEME.reka}22`,
          }}
        >
          <div
            style={{
              width: 8,
              height: 8,
              borderRadius: 4,
              backgroundColor: THEME.reka,
              boxShadow: `0 0 6px ${THEME.reka}`,
            }}
          />
          <span
            style={{
              fontSize: 14,
              fontWeight: 700,
              color: THEME.reka,
              fontFamily: "Inter, sans-serif",
            }}
          >
            Reka Vision Output
          </span>
        </div>

        {/* Card body */}
        <div style={{ padding: 20 }}>
          {REKA_LINES.map((line, i) => (
            <div
              key={i}
              style={{
                fontFamily: "monospace",
                fontSize: 13,
                lineHeight: 1.8,
                color: THEME.text,
              }}
            >
              <span style={{ color: THEME.reka, fontWeight: 700 }}>
                {line.label}
              </span>{" "}
              {line.value}
            </div>
          ))}
        </div>
      </div>

      {/* ═══ Beat 2: GLiNER2 Processing + Entity Extraction ═══ */}

      {/* Arrow from Reka card to Fastino node */}
      {frame >= 53 && (
        <div
          style={{
            position: "absolute",
            left: 530,
            top: 280,
            fontSize: 36,
            color: THEME.fastino,
            fontWeight: 700,
            opacity: arrowOpacity,
            fontFamily: "Inter, sans-serif",
          }}
        >
          {"\u2192"}
        </div>
      )}

      {/* Fastino GLiNER2 processing node */}
      {frame >= 57 && (
        <div
          style={{
            position: "absolute",
            left: 580,
            top: 200,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            transform: `scale(${fastinoNodeScale})`,
            opacity: fastinoNodeOpacity,
          }}
        >
          <div
            style={{
              width: 70,
              height: 70,
              borderRadius: "50%",
              backgroundColor: THEME.fastino,
              boxShadow: `0 0 30px rgba(245, 158, 11, ${glowIntensity})`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 32,
            }}
          >
            {"\uD83C\uDFF7\uFE0F"}
          </div>
          <div
            style={{
              marginTop: 12,
              fontSize: 16,
              fontWeight: 700,
              color: THEME.fastino,
              fontFamily: "Inter, sans-serif",
            }}
          >
            Fastino GLiNER2
          </div>
        </div>
      )}

      {/* Extracted entity badges */}
      {frame >= 67 && (
        <div
          style={{
            position: "absolute",
            left: 750,
            top: 180,
            display: "flex",
            flexDirection: "column",
            gap: 12,
          }}
        >
          {ENTITIES.map((entity, i) => {
            const badgeScale = spring({
              fps,
              frame: frame - entity.delay,
              config: { damping: 12, stiffness: 200 },
            });

            const badgeOpacity = interpolate(
              frame - entity.delay,
              [0, 8],
              [0, 1],
              clamp,
            );

            return (
              <div
                key={i}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  backgroundColor: THEME.bgCard,
                  borderRadius: 24,
                  padding: "8px 16px",
                  border: "1px solid rgba(255,255,255,0.06)",
                  transform: `scale(${badgeScale})`,
                  opacity: badgeOpacity,
                }}
              >
                {/* Colored dot */}
                <div
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: "50%",
                    backgroundColor: entity.dot,
                    flexShrink: 0,
                  }}
                />

                {/* Label */}
                <span
                  style={{
                    fontFamily: "Inter, sans-serif",
                    fontSize: 14,
                    fontWeight: 600,
                    color: THEME.text,
                  }}
                >
                  {entity.label}
                </span>

                {/* Category tag */}
                <span
                  style={{
                    backgroundColor: THEME.bgCardAlt,
                    borderRadius: 12,
                    padding: "2px 8px",
                    fontSize: 10,
                    color: THEME.textMuted,
                    fontFamily: "Inter, sans-serif",
                  }}
                >
                  {entity.category}
                </span>

                {/* Confidence score */}
                <span
                  style={{
                    fontFamily: "monospace",
                    fontSize: 12,
                    color: THEME.cyan,
                    marginLeft: "auto",
                  }}
                >
                  {entity.score}
                </span>
              </div>
            );
          })}
        </div>
      )}

      {/* ═══ Beat 3: Three Operation Cards ═══ */}

      {frame >= 147 && (
        <div
          style={{
            position: "absolute",
            top: 520,
            left: 0,
            right: 0,
            display: "flex",
            justifyContent: "center",
            gap: 30,
          }}
        >
          {/* Card 1: Entity Extraction */}
          <div
            style={{
              width: 350,
              height: 200,
              borderRadius: 12,
              backgroundColor: THEME.bgCard,
              padding: 20,
              borderTop: `3px solid ${THEME.neo4j}`,
              border: `1px solid rgba(255,255,255,0.06)`,
              borderTopWidth: 3,
              borderTopColor: THEME.neo4j,
              borderTopStyle: "solid",
              transform: `scale(${card1Scale})`,
              opacity: interpolate(card1Scale, [0, 1], [0, 1], clamp),
            }}
          >
            <div
              style={{
                fontSize: 16,
                fontWeight: 700,
                color: THEME.neo4j,
                fontFamily: "Inter, sans-serif",
                marginBottom: 16,
              }}
            >
              Entity Extraction
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {[
                "application",
                "person",
                "technology",
                "website",
                "project",
                "error_message",
              ].map((type, i) => (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    fontFamily: "monospace",
                    fontSize: 13,
                    color: THEME.text,
                  }}
                >
                  <div
                    style={{
                      width: 6,
                      height: 6,
                      borderRadius: "50%",
                      backgroundColor: THEME.neo4j,
                      flexShrink: 0,
                    }}
                  />
                  {type}
                </div>
              ))}
            </div>
          </div>

          {/* Card 2: Classification */}
          <div
            style={{
              width: 350,
              height: 200,
              borderRadius: 12,
              backgroundColor: THEME.bgCard,
              padding: 20,
              border: `1px solid rgba(255,255,255,0.06)`,
              borderTopWidth: 3,
              borderTopColor: THEME.fastino,
              borderTopStyle: "solid",
              transform: `scale(${card2Scale})`,
              opacity: interpolate(card2Scale, [0, 1], [0, 1], clamp),
            }}
          >
            <div
              style={{
                fontSize: 16,
                fontWeight: 700,
                color: THEME.fastino,
                fontFamily: "Inter, sans-serif",
                marginBottom: 16,
              }}
            >
              Classification
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {/* activity: coding */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  fontFamily: "monospace",
                  fontSize: 13,
                }}
              >
                <span style={{ color: THEME.textMuted }}>activity:</span>
                <span
                  style={{
                    backgroundColor: `${THEME.success}22`,
                    color: THEME.success,
                    borderRadius: 12,
                    padding: "3px 12px",
                    fontSize: 12,
                    fontWeight: 600,
                    fontFamily: "Inter, sans-serif",
                  }}
                >
                  coding
                </span>
              </div>
              {/* focus: deep_focus */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  fontFamily: "monospace",
                  fontSize: 13,
                }}
              >
                <span style={{ color: THEME.textMuted }}>focus:</span>
                <span
                  style={{
                    backgroundColor: `${THEME.cyan}22`,
                    color: THEME.cyan,
                    borderRadius: 12,
                    padding: "3px 12px",
                    fontSize: 12,
                    fontWeight: 600,
                    fontFamily: "Inter, sans-serif",
                  }}
                >
                  deep_focus
                </span>
              </div>
            </div>
          </div>

          {/* Card 3: Relation Extraction */}
          <div
            style={{
              width: 350,
              height: 200,
              borderRadius: 12,
              backgroundColor: THEME.bgCard,
              padding: 20,
              border: `1px solid rgba(255,255,255,0.06)`,
              borderTopWidth: 3,
              borderTopColor: THEME.secondary,
              borderTopStyle: "solid",
              transform: `scale(${card3Scale})`,
              opacity: interpolate(card3Scale, [0, 1], [0, 1], clamp),
            }}
          >
            <div
              style={{
                fontSize: 16,
                fontWeight: 700,
                color: THEME.secondary,
                fontFamily: "Inter, sans-serif",
                marginBottom: 16,
              }}
            >
              Relation Extraction
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                marginTop: 20,
                fontFamily: "Inter, sans-serif",
              }}
            >
              {/* Source node */}
              <span
                style={{
                  backgroundColor: `${THEME.neo4j}22`,
                  color: THEME.neo4j,
                  borderRadius: 8,
                  padding: "6px 14px",
                  fontSize: 14,
                  fontWeight: 600,
                }}
              >
                VS Code
              </span>

              {/* Arrow + relation label */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 2,
                }}
              >
                <span
                  style={{
                    fontSize: 10,
                    color: THEME.textMuted,
                    fontFamily: "monospace",
                  }}
                >
                  uses
                </span>
                <span
                  style={{
                    fontSize: 20,
                    color: THEME.textMuted,
                  }}
                >
                  {"\u2192"}
                </span>
              </div>

              {/* Target node */}
              <span
                style={{
                  backgroundColor: `${THEME.secondary}22`,
                  color: THEME.secondary,
                  borderRadius: 8,
                  padding: "6px 14px",
                  fontSize: 14,
                  fontWeight: 600,
                }}
              >
                Python
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ═══ Beat 4: Pipeline label + particles ═══ */}

      {frame >= 227 && (
        <>
          {/* Pipeline label card */}
          <div
            style={{
              position: "absolute",
              top: 920,
              left: "50%",
              transform: "translateX(-50%)",
              backgroundColor: THEME.bgCard,
              borderRadius: 12,
              padding: "14px 36px",
              border: "1px solid rgba(255,255,255,0.1)",
              opacity: pipelineOpacity,
              fontFamily: "Inter, sans-serif",
              fontSize: 20,
              color: THEME.text,
              whiteSpace: "nowrap",
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            <span>{"\uD83D\uDC41\uFE0F"}</span>
            <span style={{ color: THEME.reka, fontWeight: 700 }}>Reka</span>
            <span style={{ color: THEME.textMuted, margin: "0 4px" }}>
              {"\u2192"}
            </span>
            <span>{"\uD83C\uDFF7\uFE0F"}</span>
            <span style={{ color: THEME.fastino, fontWeight: 700 }}>
              GLiNER2
            </span>
            <span style={{ color: THEME.textMuted, margin: "0 4px" }}>
              {"\u2192"}
            </span>
            <span>entities + relations</span>
          </div>

          {/* Data particles flowing left to right */}
          {Array.from({ length: PARTICLE_COUNT }, (_, i) => {
            const particleStart = 230 + i * PARTICLE_STAGGER;
            const loopLength = PARTICLE_TRAVEL + 20;
            const elapsed = (frame - particleStart) % loopLength;
            const progress = elapsed / PARTICLE_TRAVEL;

            if (frame < particleStart) return null;

            const particleX = interpolate(
              progress,
              [0, 1],
              [400, 1520],
              clamp,
            );

            const particleOpacity = interpolate(
              progress,
              [0, 0.05, 0.9, 1],
              [0, 0.6, 0.6, 0],
              clamp,
            );

            return (
              <div
                key={i}
                style={{
                  position: "absolute",
                  left: particleX,
                  top: 940,
                  width: 5,
                  height: 5,
                  borderRadius: "50%",
                  backgroundColor: THEME.fastino,
                  opacity: particleOpacity,
                  boxShadow: `0 0 6px ${THEME.fastino}88`,
                }}
              />
            );
          })}
        </>
      )}
    </AbsoluteFill>
  );
};
