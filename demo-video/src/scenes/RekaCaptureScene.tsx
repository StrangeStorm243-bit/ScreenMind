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
 * Scene: Reka Background Capture
 *
 * Visualizes the background capture loop:
 * 1. Screenshot taken every 5 seconds (mss)
 * 2. Perceptual hash comparison (imagehash)
 * 3. If changed → send to Reka Vision API
 * 4. Reka returns structured description
 */

// Simulated screenshot thumbnails
const ScreenThumb: React.FC<{
  label: string;
  x: number;
  y: number;
  delay: number;
  active?: boolean;
}> = ({ label, x, y, delay, active = false }) => {
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

  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        width: 200,
        height: 130,
        borderRadius: 8,
        border: active
          ? `2px solid ${THEME.reka}`
          : "1px solid #E2E8F0",
        backgroundColor: active ? "#FEF2F2" : THEME.bgAlt,
        transform: `scale(${scale})`,
        opacity,
        overflow: "hidden",
        boxShadow: active
          ? `0 4px 16px ${THEME.reka}33`
          : "0 2px 8px rgba(0,0,0,0.06)",
      }}
    >
      {/* Mini title bar */}
      <div
        style={{
          height: 20,
          backgroundColor: "#F1F5F9",
          display: "flex",
          alignItems: "center",
          padding: "0 6px",
          gap: 4,
          borderBottom: "1px solid #E2E8F0",
        }}
      >
        <div style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: "#EF4444" }} />
        <div style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: "#F59E0B" }} />
        <div style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: "#22C55E" }} />
        <span style={{ marginLeft: 4, fontSize: 8, color: THEME.muted, fontFamily: "Inter, sans-serif" }}>
          {label}
        </span>
      </div>
      {/* Content blocks */}
      <div style={{ padding: 8 }}>
        {Array.from({ length: 4 }, (_, j) => (
          <div
            key={j}
            style={{
              height: 6,
              marginBottom: 4,
              borderRadius: 3,
              backgroundColor: "#E2E8F0",
              width: `${50 + ((j * 17 + 7) % 40)}%`,
            }}
          />
        ))}
      </div>
    </div>
  );
};

// Hash comparison visualization
const HashCompare: React.FC<{ startFrame: number }> = ({ startFrame }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const elapsed = frame - startFrame;
  if (elapsed < 0) return null;

  const fadeIn = interpolate(elapsed, [0, 15], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const hash1 = "a7c3e1f0";
  const hash2 = "b8d4f2a1";
  const diff = "Δ = 12";

  const hash1Opacity = interpolate(elapsed, [0, 15], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const hash2Opacity = interpolate(elapsed, [20, 35], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const diffOpacity = interpolate(elapsed, [40, 55], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const changedOpacity = interpolate(elapsed, [60, 75], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        position: "absolute",
        left: 760,
        top: 280,
        opacity: fadeIn,
        fontFamily: "monospace",
        textAlign: "center",
      }}
    >
      <div style={{ fontSize: 13, color: THEME.muted, marginBottom: 12, fontFamily: "Inter, sans-serif" }}>
        Perceptual Hash Check
      </div>
      <div style={{ display: "flex", gap: 20, alignItems: "center" }}>
        <div style={{ opacity: hash1Opacity }}>
          <div style={{ fontSize: 11, color: THEME.muted, marginBottom: 4 }}>Previous</div>
          <div
            style={{
              padding: "6px 14px",
              backgroundColor: THEME.bgAlt,
              borderRadius: 6,
              fontSize: 16,
              color: THEME.text,
              border: "1px solid #E2E8F0",
            }}
          >
            {hash1}
          </div>
        </div>
        <div style={{ fontSize: 20, color: THEME.muted, opacity: diffOpacity }}>≠</div>
        <div style={{ opacity: hash2Opacity }}>
          <div style={{ fontSize: 11, color: THEME.muted, marginBottom: 4 }}>Current</div>
          <div
            style={{
              padding: "6px 14px",
              backgroundColor: THEME.bgAlt,
              borderRadius: 6,
              fontSize: 16,
              color: THEME.text,
              border: "1px solid #E2E8F0",
            }}
          >
            {hash2}
          </div>
        </div>
      </div>
      <div
        style={{
          marginTop: 12,
          opacity: diffOpacity,
          fontSize: 14,
          color: THEME.muted,
        }}
      >
        {diff} &gt; threshold (8)
      </div>
      <div
        style={{
          marginTop: 8,
          opacity: changedOpacity,
          fontSize: 16,
          fontWeight: 700,
          color: THEME.success,
          fontFamily: "Inter, sans-serif",
        }}
      >
        Screen changed → Send to Reka
      </div>
    </div>
  );
};

// Reka Vision API result
const RekaResult: React.FC<{ startFrame: number }> = ({ startFrame }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const elapsed = frame - startFrame;
  if (elapsed < 0) return null;

  const slideIn = spring({
    fps,
    frame: elapsed,
    config: { damping: 15, stiffness: 120 },
  });

  const lines = [
    { label: "APPLICATION:", value: "Chrome — React Docs", delay: 10 },
    { label: "WINDOW TITLE:", value: "Server Components | React", delay: 25 },
    { label: "VISIBLE TEXT:", value: '"Server Components let you write..."', delay: 40 },
    { label: "ACTIVITY:", value: "Reading documentation", delay: 55 },
  ];

  return (
    <div
      style={{
        position: "absolute",
        right: 80,
        top: 180,
        width: 460,
        backgroundColor: THEME.overlayDark,
        borderRadius: 12,
        padding: 20,
        opacity: interpolate(slideIn, [0, 1], [0, 1]),
        transform: `translateX(${interpolate(slideIn, [0, 1], [50, 0])}px)`,
        boxShadow: `0 8px 32px ${THEME.reka}22`,
        border: `1px solid ${THEME.reka}33`,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          marginBottom: 16,
        }}
      >
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: 16,
            backgroundColor: THEME.reka,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 16,
          }}
        >
          👁️
        </div>
        <span
          style={{
            fontFamily: "Inter, sans-serif",
            fontWeight: 700,
            fontSize: 16,
            color: THEME.reka,
          }}
        >
          Reka Vision Output
        </span>
      </div>

      {lines.map((line, i) => {
        const lineOpacity = interpolate(elapsed - line.delay, [0, 12], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });
        return (
          <div key={i} style={{ marginBottom: 10, opacity: lineOpacity }}>
            <span
              style={{
                fontFamily: "monospace",
                fontSize: 12,
                color: THEME.reka,
                fontWeight: 700,
              }}
            >
              {line.label}
            </span>
            <span
              style={{
                fontFamily: "monospace",
                fontSize: 12,
                color: THEME.overlayText,
                marginLeft: 8,
              }}
            >
              {line.value}
            </span>
          </div>
        );
      })}
    </div>
  );
};

export const RekaCaptureScene: React.FC = () => {
  const frame = useCurrentFrame();

  const titleOpacity = interpolate(frame, [0, 20], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Capture loop indicator: every 5s = 150 frames
  const captureProgress = (frame % 150) / 150;
  const captureBarWidth = interpolate(captureProgress, [0, 1], [0, 100]);

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
          Always Watching, Never Missing
        </div>
        <div style={{ fontFamily: "Inter, sans-serif", fontSize: 20, color: THEME.muted, marginTop: 8 }}>
          Screenshots every 5 seconds — only sends when content changes
        </div>
      </div>

      {/* Capture timer bar */}
      {frame > 30 && (
        <div
          style={{
            position: "absolute",
            top: 160,
            left: 400,
            right: 400,
            height: 6,
            backgroundColor: "#E2E8F0",
            borderRadius: 3,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              width: `${captureBarWidth}%`,
              height: "100%",
              backgroundColor: THEME.reka,
              borderRadius: 3,
              transition: "none",
            }}
          />
        </div>
      )}

      {/* Screenshot timeline */}
      <ScreenThumb label="VS Code" x={80} y={210} delay={40} />
      <ScreenThumb label="VS Code" x={310} y={210} delay={70} />
      <ScreenThumb label="Chrome — React" x={540} y={210} delay={100} active />

      {/* Arrow from active screenshot to hash check */}
      {frame >= 120 && (
        <svg
          style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", pointerEvents: "none" }}
        >
          <line
            x1={640}
            y1={350}
            x2={820}
            y2={310}
            stroke={THEME.reka}
            strokeWidth={2}
            strokeDasharray="6,3"
            opacity={interpolate(frame, [120, 140], [0, 0.6], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            })}
          />
        </svg>
      )}

      {/* Labels under thumbnails */}
      {frame >= 50 && (
        <>
          <div
            style={{
              position: "absolute",
              left: 80,
              top: 350,
              fontFamily: "Inter, sans-serif",
              fontSize: 12,
              color: THEME.muted,
              opacity: interpolate(frame, [50, 65], [0, 1], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              }),
            }}
          >
            t = 0s (no change)
          </div>
          <div
            style={{
              position: "absolute",
              left: 310,
              top: 350,
              fontFamily: "Inter, sans-serif",
              fontSize: 12,
              color: THEME.muted,
              opacity: interpolate(frame, [80, 95], [0, 1], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              }),
            }}
          >
            t = 5s (no change)
          </div>
          <div
            style={{
              position: "absolute",
              left: 540,
              top: 350,
              fontFamily: "Inter, sans-serif",
              fontSize: 12,
              color: THEME.reka,
              fontWeight: 600,
              opacity: interpolate(frame, [110, 125], [0, 1], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              }),
            }}
          >
            t = 10s (CHANGED!)
          </div>
        </>
      )}

      {/* Hash comparison */}
      <HashCompare startFrame={140} />

      {/* Reka Vision result */}
      <RekaResult startFrame={280} />

      {/* Bottom pipeline label */}
      {frame >= 400 && (
        <div
          style={{
            position: "absolute",
            bottom: 60,
            left: 0,
            right: 0,
            textAlign: "center",
            opacity: interpolate(frame, [400, 430], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            }),
          }}
        >
          <div
            style={{
              display: "inline-flex",
              gap: 16,
              alignItems: "center",
              fontFamily: "Inter, sans-serif",
              fontSize: 18,
              color: THEME.text,
              backgroundColor: THEME.bgAlt,
              padding: "12px 32px",
              borderRadius: 12,
              border: "1px solid #E2E8F0",
            }}
          >
            <span>📸 mss capture</span>
            <span style={{ color: THEME.muted }}>→</span>
            <span>🔑 perceptual hash</span>
            <span style={{ color: THEME.muted }}>→</span>
            <span style={{ color: THEME.reka, fontWeight: 700 }}>👁️ Reka Vision</span>
            <span style={{ color: THEME.muted }}>→</span>
            <span>📝 structured description</span>
          </div>
        </div>
      )}
    </AbsoluteFill>
  );
};
