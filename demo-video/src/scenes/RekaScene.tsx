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

const ScreenshotThumbnail: React.FC<{
  title: string;
  x: number;
  y: number;
  barWidths: number[];
  borderColor?: string;
  delay: number;
}> = ({ title, x, y, barWidths, borderColor, delay }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const scale = spring({
    fps,
    frame: frame - delay,
    config: { damping: 12, stiffness: 200 },
  });

  const opacity = interpolate(frame - delay, [0, 8], [0, 1], clamp);

  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        width: 220,
        height: 150,
        borderRadius: 10,
        overflow: "hidden",
        backgroundColor: THEME.bgCard,
        border: borderColor
          ? `2px solid ${borderColor}`
          : `1px solid rgba(255,255,255,0.08)`,
        transform: `scale(${scale})`,
        opacity,
        boxShadow: borderColor
          ? `0 0 20px ${borderColor}44`
          : "0 4px 16px rgba(0,0,0,0.3)",
      }}
    >
      {/* title bar */}
      <div
        style={{
          height: 24,
          backgroundColor: THEME.bgCardAlt,
          display: "flex",
          alignItems: "center",
          padding: "0 8px",
          gap: 5,
        }}
      >
        <div style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: "#EF4444" }} />
        <div style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: "#F59E0B" }} />
        <div style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: "#22C55E" }} />
        <span
          style={{
            marginLeft: 6,
            fontSize: 10,
            color: THEME.textMuted,
            fontFamily: "Inter, sans-serif",
          }}
        >
          {title}
        </span>
      </div>

      {/* content bars */}
      <div style={{ padding: 12, display: "flex", flexDirection: "column", gap: 8 }}>
        {barWidths.map((w, i) => (
          <div
            key={i}
            style={{
              height: 6,
              width: `${w}%`,
              borderRadius: 3,
              backgroundColor: "rgba(255,255,255,0.08)",
            }}
          />
        ))}
      </div>
    </div>
  );
};

/* ── main scene ──────────────────────────────────────────────────────── */

export const RekaScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  /* ── Beat 1  (0-80): Title + Screen Capture ───────────────────────── */

  const titleOpacity = interpolate(frame, [0, 20], [0, 1], clamp);

  const captureScale = spring({
    fps,
    frame: frame - 20,
    config: { damping: 12, stiffness: 200 },
  });

  const captureOpacity = interpolate(frame - 20, [0, 8], [0, 1], clamp);

  // Pulsing for capture label
  const pulse = interpolate(
    Math.sin(((frame % 60) / 60) * Math.PI * 2),
    [-1, 1],
    [0.5, 1],
    clamp,
  );

  // Timer counting
  const seconds = Math.floor(frame / 30) % 20;
  const timerText =
    seconds < 5
      ? "5s..."
      : seconds < 10
        ? "10s..."
        : seconds < 15
          ? "15s..."
          : "20s...";

  /* ── Beat 2  (80-187): Perceptual Hash Change Detection ──────────── */

  const leftHashColors = Array(8).fill(THEME.success);
  const rightHashColors = [
    THEME.success,
    THEME.success,
    THEME.success,
    THEME.danger,
    THEME.success,
    THEME.danger,
    THEME.success,
    THEME.danger,
  ];

  const neqOpacity = interpolate(frame, [133, 143], [0, 1], clamp);

  const hashResultOpacity = interpolate(frame, [140, 150], [0, 1], clamp);

  const changeDetectedOpacity = interpolate(frame, [160, 170], [0, 1], clamp);

  /* ── Beat 3  (187-300): Reka Vision API Processing ────────────────── */

  const rekaNodeScale = spring({
    fps,
    frame: frame - 187,
    config: { damping: 12, stiffness: 180 },
  });

  const rekaNodeOpacity = interpolate(frame - 187, [0, 8], [0, 1], clamp);

  const terminalLines = [
    { label: "APPLICATION:", value: "VS Code" },
    { label: "WINDOW_TITLE:", value: "agent.py \u2014 ScreenMind" },
    { label: "CONTENT:", value: "Python function run_agent()" },
    { label: "ACTIVITY:", value: "coding" },
  ];

  const terminalCardOpacity = interpolate(frame, [193, 203], [0, 1], clamp);

  /* ── Beat 4  (300-400): Pipeline Summary ──────────────────────────── */

  const pipelineOpacity = interpolate(frame, [300, 320], [0, 1], clamp);

  // 6 data particles
  const PARTICLE_COUNT = 6;
  const PARTICLE_STAGGER = 8;
  const PARTICLE_TRAVEL = 80;

  return (
    <AbsoluteFill
      style={{
        backgroundColor: THEME.bg,
        backgroundImage: `radial-gradient(${THEME.gridLine} 1px, transparent 1px)`,
        backgroundSize: "30px 30px",
      }}
    >
      {/* ═══ Beat 1: Title + Screen Capture ═══ */}

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
          Step 1:{" "}
          <span style={{ color: THEME.reka }}>Always Watching</span>
        </div>
        <div
          style={{
            fontSize: 20,
            color: THEME.textMuted,
            marginTop: 12,
          }}
        >
          Screenshots every 5 seconds — only sends when content changes
        </div>
      </div>

      {/* Mock desktop screenshot thumbnail */}
      <div
        style={{
          position: "absolute",
          left: 100,
          top: 200,
          width: 220,
          height: 150,
          borderRadius: 10,
          overflow: "hidden",
          backgroundColor: THEME.bgCard,
          border: "1px solid rgba(255,255,255,0.08)",
          transform: `scale(${captureScale})`,
          opacity: captureOpacity,
          boxShadow: "0 4px 16px rgba(0,0,0,0.3)",
        }}
      >
        <div
          style={{
            height: 24,
            backgroundColor: THEME.bgCardAlt,
            display: "flex",
            alignItems: "center",
            padding: "0 8px",
            gap: 5,
          }}
        >
          <div style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: "#EF4444" }} />
          <div style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: "#F59E0B" }} />
          <div style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: "#22C55E" }} />
          <span
            style={{
              marginLeft: 6,
              fontSize: 10,
              color: THEME.textMuted,
              fontFamily: "Inter, sans-serif",
            }}
          >
            VS Code
          </span>
        </div>
        <div style={{ padding: 12, display: "flex", flexDirection: "column", gap: 8 }}>
          {[80, 55, 70, 40, 65].map((w, i) => (
            <div
              key={i}
              style={{
                height: 6,
                width: `${w}%`,
                borderRadius: 3,
                backgroundColor: "rgba(255,255,255,0.08)",
              }}
            />
          ))}
        </div>
      </div>

      {/* Pulsing capture label */}
      {frame >= 20 && (
        <div
          style={{
            position: "absolute",
            left: 100,
            top: 365,
            fontSize: 14,
            color: THEME.textMuted,
            fontFamily: "Inter, sans-serif",
            opacity: pulse,
          }}
        >
          {"📸"} mss capture — every 5 seconds
        </div>
      )}

      {/* Pulsing timer */}
      {frame >= 20 && (
        <div
          style={{
            position: "absolute",
            left: 100,
            top: 395,
            fontSize: 16,
            fontWeight: 700,
            color: THEME.cyan,
            fontFamily: "monospace",
            opacity: captureOpacity,
          }}
        >
          {timerText}
        </div>
      )}

      {/* ═══ Beat 2: Perceptual Hash Change Detection ═══ */}

      {frame >= 80 && (
        <>
          {/* Left thumbnail — same content */}
          <ScreenshotThumbnail
            title="VS Code"
            x={200}
            y={340}
            barWidths={[80, 55, 70, 40, 65]}
            delay={87}
          />

          {/* Right thumbnail — different content */}
          <ScreenshotThumbnail
            title="Chrome — React"
            x={500}
            y={340}
            barWidths={[60, 90, 45, 75, 50]}
            borderColor={THEME.reka}
            delay={100}
          />

          {/* Left hash squares */}
          <div
            style={{
              position: "absolute",
              left: 200,
              top: 505,
              display: "flex",
              gap: 3,
            }}
          >
            {leftHashColors.map((color, i) => {
              const squareOpacity = interpolate(
                frame,
                [113 + i * 2, 115 + i * 2],
                [0, 1],
                clamp,
              );
              return (
                <div
                  key={i}
                  style={{
                    width: 18,
                    height: 18,
                    borderRadius: 3,
                    backgroundColor: color,
                    opacity: squareOpacity,
                  }}
                />
              );
            })}
          </div>

          {/* Right hash squares */}
          <div
            style={{
              position: "absolute",
              left: 500,
              top: 505,
              display: "flex",
              gap: 3,
            }}
          >
            {rightHashColors.map((color, i) => {
              const squareOpacity = interpolate(
                frame,
                [113 + i * 2, 115 + i * 2],
                [0, 1],
                clamp,
              );
              return (
                <div
                  key={i}
                  style={{
                    width: 18,
                    height: 18,
                    borderRadius: 3,
                    backgroundColor: color,
                    opacity: squareOpacity,
                  }}
                />
              );
            })}
          </div>

          {/* "not equal" symbol between thumbnails */}
          <div
            style={{
              position: "absolute",
              left: 450,
              top: 395,
              fontSize: 28,
              color: THEME.textMuted,
              fontFamily: "Inter, sans-serif",
              fontWeight: 700,
              opacity: neqOpacity,
            }}
          >
            {"\u2260"}
          </div>

          {/* pHash delta result */}
          <div
            style={{
              position: "absolute",
              left: 200,
              top: 545,
              fontSize: 16,
              fontFamily: "monospace",
              color: THEME.cyan,
              opacity: hashResultOpacity,
            }}
          >
            {"pHash \u0394 = 12 > threshold (8)"}
          </div>

          {/* Change detected label */}
          <div
            style={{
              position: "absolute",
              left: 200,
              top: 575,
              fontSize: 16,
              fontFamily: "Inter, sans-serif",
              fontWeight: 700,
              color: THEME.success,
              opacity: changeDetectedOpacity,
            }}
          >
            {"Change detected \u2192 analyze"}
          </div>
        </>
      )}

      {/* ═══ Beat 3: Reka Vision API Processing ═══ */}

      {frame >= 187 && (
        <>
          {/* Reka node — glowing circle */}
          <div
            style={{
              position: "absolute",
              left: 1000,
              top: 160,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              transform: `scale(${rekaNodeScale})`,
              opacity: rekaNodeOpacity,
            }}
          >
            <div
              style={{
                width: 80,
                height: 80,
                borderRadius: 40,
                backgroundColor: THEME.reka,
                boxShadow: `0 0 30px ${THEME.reka}66`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 40,
              }}
            >
              {"👁️"}
            </div>
            <div
              style={{
                marginTop: 12,
                fontSize: 18,
                fontWeight: 700,
                color: THEME.reka,
                fontFamily: "Inter, sans-serif",
              }}
            >
              Reka Vision
            </div>
          </div>

          {/* Terminal output card */}
          <div
            style={{
              position: "absolute",
              left: 800,
              top: 310,
              width: 500,
              height: 220,
              borderRadius: 10,
              backgroundColor: THEME.bgCard,
              border: `1px solid ${THEME.reka}33`,
              overflow: "hidden",
              opacity: terminalCardOpacity,
            }}
          >
            {/* Terminal header */}
            <div
              style={{
                height: 32,
                backgroundColor: THEME.bgCardAlt,
                display: "flex",
                alignItems: "center",
                padding: "0 12px",
                gap: 8,
                borderBottom: `1px solid ${THEME.reka}33`,
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
                  fontSize: 13,
                  color: THEME.textMuted,
                  fontFamily: "Inter, sans-serif",
                  fontWeight: 600,
                }}
              >
                Reka Vision Output
              </span>
            </div>

            {/* Terminal lines — typewriter */}
            <div style={{ padding: 16 }}>
              {terminalLines.map((line, i) => {
                const lineStart = 200 + i * 13;
                // Characters revealed over time
                const fullText = `> ${line.label} ${line.value}`;
                const charsRevealed = interpolate(
                  frame,
                  [lineStart, lineStart + 12],
                  [0, fullText.length],
                  clamp,
                );
                const visibleChars = Math.floor(charsRevealed);

                if (visibleChars <= 0) return null;

                const revealedText = fullText.substring(0, visibleChars);
                // Parse out the ">" prefix, label, and value from the revealed text
                const prefixEnd = Math.min(2, visibleChars);
                const labelEnd = Math.min(2 + line.label.length + 1, visibleChars);

                return (
                  <div
                    key={i}
                    style={{
                      fontFamily: "monospace",
                      fontSize: 14,
                      lineHeight: 2,
                      whiteSpace: "nowrap",
                    }}
                  >
                    <span style={{ color: THEME.cyan }}>
                      {revealedText.substring(0, prefixEnd)}
                    </span>
                    <span style={{ color: THEME.reka, fontWeight: 700 }}>
                      {revealedText.substring(prefixEnd, labelEnd)}
                    </span>
                    <span style={{ color: THEME.text }}>
                      {revealedText.substring(labelEnd)}
                    </span>
                    {/* blinking cursor at end of current line */}
                    {visibleChars < fullText.length && (
                      <span
                        style={{
                          color: THEME.cyan,
                          opacity: Math.sin(frame * 0.3) > 0 ? 1 : 0,
                        }}
                      >
                        {"_"}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}

      {/* ═══ Beat 4: Pipeline Summary ═══ */}

      {frame >= 300 && (
        <>
          {/* Pipeline label card */}
          <div
            style={{
              position: "absolute",
              bottom: 80,
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
            <span>{"📸"} Capture</span>
            <span style={{ color: THEME.textMuted, margin: "0 4px" }}>{"\u2192"}</span>
            <span>{"🔑"} pHash</span>
            <span style={{ color: THEME.textMuted, margin: "0 4px" }}>{"\u2192"}</span>
            <span>
              {"👁️"}{" "}
              <span style={{ color: THEME.reka, fontWeight: 700 }}>Reka Vision</span>
            </span>
            <span style={{ color: THEME.textMuted, margin: "0 4px" }}>{"\u2192"}</span>
            <span>{"📝"} Structured Description</span>
          </div>

          {/* Data particles flowing across pipeline */}
          {Array.from({ length: PARTICLE_COUNT }, (_, i) => {
            const particleStart = 307 + i * PARTICLE_STAGGER;
            const loopLength = PARTICLE_TRAVEL + 20;
            const elapsed = (frame - particleStart) % loopLength;
            const progress = elapsed / PARTICLE_TRAVEL;

            if (frame < particleStart) return null;

            const particleX = interpolate(
              progress,
              [0, 1],
              [300, 1620],
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
                  bottom: 100,
                  width: 5,
                  height: 5,
                  borderRadius: "50%",
                  backgroundColor: THEME.cyan,
                  opacity: particleOpacity,
                  boxShadow: `0 0 6px ${THEME.cyan}88`,
                }}
              />
            );
          })}
        </>
      )}
    </AbsoluteFill>
  );
};
