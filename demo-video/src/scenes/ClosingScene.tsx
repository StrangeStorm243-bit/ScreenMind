import React from "react";
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { THEME } from "../styles/theme";

const SPONSORS = ["Reka", "Tavily", "Neo4j", "Render", "OpenAI"];

export const ClosingScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const logoScale = spring({
    fps,
    frame: frame - 5,
    config: { damping: 15, stiffness: 120 },
  });

  const logoOpacity = spring({
    fps,
    frame: frame - 5,
    config: { damping: 20, stiffness: 100 },
  });

  const taglineOpacity = interpolate(frame, [40, 60], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const fadeOut = interpolate(frame, [250, 300], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ backgroundColor: THEME.bg }}>
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
        {/* Logo */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            transform: `scale(${logoScale})`,
            opacity: logoOpacity,
          }}
        >
          <div
            style={{
              width: 120,
              height: 120,
              borderRadius: 60,
              background: `linear-gradient(135deg, ${THEME.accent}, ${THEME.secondary})`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 60,
            }}
          >
            🧠
          </div>
          <div
            style={{
              fontFamily: "Inter, sans-serif",
              fontWeight: 800,
              fontSize: 72,
              color: THEME.text,
              letterSpacing: -2,
            }}
          >
            ScreenMind
          </div>
        </div>

        {/* Tagline */}
        <div
          style={{
            marginTop: 40,
            fontFamily: "Inter, sans-serif",
            fontSize: 28,
            color: THEME.muted,
            textAlign: "center",
            opacity: taglineOpacity,
          }}
        >
          Built in 5.5 hours at the Autonomous Agents Hackathon
        </div>

        {/* Sponsor logos */}
        <div style={{ marginTop: 60, display: "flex", gap: 40, alignItems: "center" }}>
          {SPONSORS.map((name, i) => {
            const sponsorScale = spring({
              fps,
              frame: frame - 80 - i * 10,
              config: { damping: 15, stiffness: 150 },
            });
            return (
              <div
                key={name}
                style={{
                  fontFamily: "Inter, sans-serif",
                  fontSize: 18,
                  fontWeight: 600,
                  color: THEME.accent,
                  opacity: interpolate(sponsorScale, [0, 1], [0, 1]),
                  transform: `scale(${sponsorScale})`,
                  padding: "8px 20px",
                  borderRadius: 8,
                  backgroundColor: THEME.bgAlt,
                  border: "1px solid #E2E8F0",
                }}
              >
                {name}
              </div>
            );
          })}
        </div>
      </AbsoluteFill>

      {/* Fade to black */}
      <AbsoluteFill style={{ backgroundColor: "black", opacity: fadeOut }} />
    </AbsoluteFill>
  );
};
