import React from "react";
import {
  AbsoluteFill,
  OffthreadVideo,
  staticFile,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { THEME } from "../styles/theme";

export const RealDemoScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Title card fades in then out over first 90 frames (3 seconds)
  const titleOpacity = interpolate(frame, [0, 20, 60, 90], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const titleScale = spring({
    fps,
    frame,
    config: { damping: 15, stiffness: 120 },
  });

  // Video fades in after title card
  const videoOpacity = interpolate(frame, [60, 90], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Subtle pulsing glow on the phone frame
  const glowIntensity = 0.15 + Math.sin(frame * 0.03) * 0.05;

  // "LIVE DEMO" badge
  const badgeOpacity = interpolate(frame, [90, 110], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const dotPulse = Math.sin(frame * 0.15) * 0.4 + 0.6;

  return (
    <AbsoluteFill
      style={{
        backgroundColor: THEME.bg,
        backgroundImage: `radial-gradient(${THEME.gridLine} 1px, transparent 1px)`,
        backgroundSize: "30px 30px",
      }}
    >
      {/* Title card overlay */}
      {frame < 90 && (
        <AbsoluteFill
          style={{
            justifyContent: "center",
            alignItems: "center",
            zIndex: 10,
            opacity: titleOpacity,
          }}
        >
          <div
            style={{
              textAlign: "center",
              transform: `scale(${titleScale})`,
            }}
          >
            <div
              style={{
                fontFamily: "Inter, sans-serif",
                fontWeight: 800,
                fontSize: 56,
                color: THEME.text,
                letterSpacing: -1,
                marginBottom: 16,
              }}
            >
              See It In Action
            </div>
            <div
              style={{
                fontFamily: "Inter, sans-serif",
                fontSize: 24,
                color: THEME.textMuted,
              }}
            >
              3 real questions, answered from screen context
            </div>
          </div>
        </AbsoluteFill>
      )}

      {/* Video container — centered portrait video on dark landscape canvas */}
      <AbsoluteFill
        style={{
          justifyContent: "center",
          alignItems: "center",
          opacity: videoOpacity,
        }}
      >
        {/* Phone-style frame around the portrait video */}
        <div
          style={{
            position: "relative",
            width: 478,
            height: 850,
            borderRadius: 24,
            overflow: "hidden",
            boxShadow: `0 0 60px rgba(67, 97, 238, ${glowIntensity}), 0 0 120px rgba(67, 97, 238, ${glowIntensity * 0.5})`,
            border: "2px solid rgba(255, 255, 255, 0.1)",
          }}
        >
          <OffthreadVideo
            src={staticFile("real-demo.mp4")}
            style={{
              width: 478,
              height: 850,
            }}
          />
        </div>
      </AbsoluteFill>

      {/* "LIVE DEMO" badge — top right */}
      <div
        style={{
          position: "absolute",
          top: 40,
          right: 60,
          opacity: badgeOpacity,
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "10px 20px",
          backgroundColor: THEME.bgCard,
          borderRadius: 8,
          border: `1px solid ${THEME.danger}44`,
        }}
      >
        <div
          style={{
            width: 10,
            height: 10,
            borderRadius: 5,
            backgroundColor: THEME.danger,
            opacity: dotPulse,
          }}
        />
        <span
          style={{
            fontFamily: "Inter, sans-serif",
            fontWeight: 700,
            fontSize: 14,
            color: THEME.danger,
            letterSpacing: 2,
          }}
        >
          LIVE DEMO
        </span>
      </div>

      {/* "🧠 ScreenMind" label — bottom left */}
      <div
        style={{
          position: "absolute",
          bottom: 40,
          left: 60,
          opacity: badgeOpacity,
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "10px 20px",
          backgroundColor: THEME.bgCard,
          borderRadius: 8,
          border: "1px solid rgba(255, 255, 255, 0.08)",
        }}
      >
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: 16,
            background: `linear-gradient(135deg, ${THEME.accent}, ${THEME.secondary})`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 16,
          }}
        >
          🧠
        </div>
        <span
          style={{
            fontFamily: "Inter, sans-serif",
            fontWeight: 700,
            fontSize: 16,
            color: THEME.text,
          }}
        >
          ScreenMind
        </span>
      </div>
    </AbsoluteFill>
  );
};
