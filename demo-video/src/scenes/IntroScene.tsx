import React from "react";
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { THEME } from "../styles/theme";

const TypeWriterInline: React.FC<{
  text: string;
  startFrame: number;
  charsPerFrame: number;
}> = ({ text, startFrame, charsPerFrame }) => {
  const frame = useCurrentFrame();
  const elapsed = Math.max(0, frame - startFrame);
  const charsToShow = Math.min(text.length, Math.floor(elapsed * charsPerFrame));
  const visibleText = text.slice(0, charsToShow);
  const showCursor = charsToShow < text.length;

  return (
    <span>
      {visibleText}
      {showCursor && (
        <span
          style={{
            display: "inline-block",
            width: 3,
            height: "1em",
            backgroundColor: THEME.accent,
            marginLeft: 2,
            opacity: Math.floor(elapsed / 15) % 2 === 0 ? 1 : 0,
          }}
        />
      )}
    </span>
  );
};

export const IntroScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const logoScale = spring({
    fps,
    frame: frame - 10,
    config: { damping: 15, stiffness: 120 },
  });

  const logoOpacity = spring({
    fps,
    frame: frame - 10,
    config: { damping: 20, stiffness: 100 },
  });

  const dots = Array.from({ length: 30 }, (_, i) => ({
    x: 200 + Math.sin(i * 1.3) * 700,
    y: 200 + Math.cos(i * 0.9) * 400,
    size: 3 + (i % 4),
    delay: i * 3,
  }));

  return (
    <AbsoluteFill style={{ backgroundColor: THEME.bg, justifyContent: "center", alignItems: "center" }}>
      {/* Particle dots */}
      {dots.map((dot, i) => {
        const opacity = interpolate(frame - dot.delay, [0, 20], [0, 0.15], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: dot.x,
              top: dot.y,
              width: dot.size,
              height: dot.size,
              borderRadius: dot.size / 2,
              backgroundColor: THEME.accent,
              opacity,
            }}
          />
        );
      })}

      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 32 }}>
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
              width: 100,
              height: 100,
              borderRadius: 50,
              background: `linear-gradient(135deg, ${THEME.accent}, ${THEME.secondary})`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 50,
            }}
          >
            🧠
          </div>
          <div
            style={{
              fontFamily: "Inter, sans-serif",
              fontWeight: 800,
              fontSize: 60,
              color: THEME.text,
              letterSpacing: -1,
            }}
          >
            ScreenMind
          </div>
        </div>

        {/* Tagline */}
        <div style={{ fontSize: 32, fontFamily: "Inter, sans-serif", color: THEME.muted }}>
          <TypeWriterInline
            text="An AI that sees your screen and remembers everything."
            startFrame={60}
            charsPerFrame={1.2}
          />
        </div>
      </div>
    </AbsoluteFill>
  );
};
