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
/*  Inline TypeWriter                                                  */
/* ------------------------------------------------------------------ */
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
        <span style={{ opacity: 0.7 }}>&#9612;</span>
      )}
    </span>
  );
};

/* ------------------------------------------------------------------ */
/*  Ghost App Windows (Beat 1)                                         */
/* ------------------------------------------------------------------ */
const GHOST_APPS: {
  name: string;
  x: number;
  y: number;
  delay: number;
  rot: number;
}[] = [
  { name: "VS Code", x: 80, y: 60, delay: 5, rot: -2 },
  { name: "Chrome", x: 520, y: 40, delay: 12, rot: 1.5 },
  { name: "Slack", x: 1000, y: 100, delay: 19, rot: -1 },
  { name: "Figma", x: 1400, y: 50, delay: 26, rot: 2 },
  { name: "Gmail", x: 200, y: 500, delay: 33, rot: -0.5 },
  { name: "Terminal", x: 900, y: 520, delay: 40, rot: 1 },
];

const PLACEHOLDER_WIDTHS = [
  ["70%", "55%", "80%", "40%"],
  ["60%", "85%", "45%", "70%"],
  ["75%", "50%", "65%", "80%"],
  ["80%", "40%", "60%", "55%"],
  ["55%", "75%", "50%", "65%"],
  ["65%", "60%", "80%", "45%"],
];

const GhostWindow: React.FC<{
  name: string;
  x: number;
  y: number;
  delay: number;
  rotation: number;
  placeholders: string[];
}> = ({ name, x, y, delay, rotation, placeholders }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const scale = spring({
    fps,
    frame: frame - delay,
    config: { damping: 12, stiffness: 200 },
  });

  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        width: 400,
        height: 280,
        backgroundColor: "transparent",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: 10,
        boxShadow: "0 0 15px rgba(255,255,255,0.03)",
        transform: `scale(${scale}) rotate(${rotation}deg)`,
        overflow: "hidden",
      }}
    >
      {/* Title bar */}
      <div
        style={{
          height: 28,
          backgroundColor: "rgba(255,255,255,0.03)",
          display: "flex",
          alignItems: "center",
          padding: "0 10px",
          gap: 6,
        }}
      >
        <div
          style={{
            width: 10,
            height: 10,
            borderRadius: 5,
            backgroundColor: "rgba(239,68,68,0.3)",
          }}
        />
        <div
          style={{
            width: 10,
            height: 10,
            borderRadius: 5,
            backgroundColor: "rgba(245,158,11,0.3)",
          }}
        />
        <div
          style={{
            width: 10,
            height: 10,
            borderRadius: 5,
            backgroundColor: "rgba(34,197,94,0.3)",
          }}
        />
        <span
          style={{
            marginLeft: 8,
            fontSize: 12,
            color: THEME.textMuted,
            fontFamily: "Inter, sans-serif",
          }}
        >
          {name}
        </span>
      </div>

      {/* Content placeholders */}
      <div style={{ padding: 14, display: "flex", flexDirection: "column", gap: 8 }}>
        {placeholders.map((w, i) => (
          <div
            key={i}
            style={{
              height: 10,
              width: w,
              backgroundColor: "rgba(255,255,255,0.05)",
              borderRadius: 4,
            }}
          />
        ))}
      </div>
    </div>
  );
};

/* ------------------------------------------------------------------ */
/*  Main Scene                                                         */
/* ------------------------------------------------------------------ */
export const ProblemScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  /* --- dissolve for beat 1 + beat 2 elements --- */
  const previousElementsOpacity = interpolate(frame, [340, 380], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  /* --- Beat 3: ScreenMind entrance --- */
  const logoScale = spring({
    fps,
    frame: frame - 380,
    config: { damping: 10, stiffness: 150 },
  });

  const logoOpacity = interpolate(frame, [380, 395], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const titleScale = spring({
    fps,
    frame: frame - 400,
    config: { damping: 12, stiffness: 180 },
  });

  const titleOpacity = interpolate(frame, [400, 415], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  /* --- Beat 4: final fade out --- */
  const finalFade = interpolate(frame, [550, 600], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  /* --- Beat 2: chat card spring --- */
  const chatScale = spring({
    fps,
    frame: frame - 150,
    config: { damping: 12, stiffness: 180 },
  });

  const chatOpacity = interpolate(frame, [150, 160], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  /* --- Beat 2: red glow on AI response --- */
  const redGlow = interpolate(frame, [290, 300], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  /* --- Beat 2: side text fade --- */
  const sideTextOpacity = interpolate(frame, [300, 315], [0, 1], {
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
      {/* BEAT 1 + BEAT 2: ghost windows + chat (dissolve together)     */}
      {/* ============================================================ */}
      <div style={{ opacity: previousElementsOpacity * finalFade }}>
        {/* Beat 1: Ghost App Windows */}
        {GHOST_APPS.map((app, i) => (
          <GhostWindow
            key={app.name}
            name={app.name}
            x={app.x}
            y={app.y}
            delay={app.delay}
            rotation={app.rot}
            placeholders={PLACEHOLDER_WIDTHS[i]}
          />
        ))}

        {/* Beat 2: ChatGPT mock interface */}
        {frame >= 150 && (
          <AbsoluteFill
            style={{
              justifyContent: "center",
              alignItems: "center",
              zIndex: 10,
            }}
          >
            <div
              style={{
                width: 700,
                backgroundColor: THEME.bgCard,
                borderRadius: 16,
                border: "1px solid rgba(255,255,255,0.1)",
                overflow: "hidden",
                transform: `scale(${chatScale})`,
                opacity: chatOpacity,
                boxShadow: "0 16px 48px rgba(0,0,0,0.4)",
              }}
            >
              {/* Chat header */}
              <div
                style={{
                  padding: "14px 20px",
                  borderBottom: "1px solid rgba(255,255,255,0.06)",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <div
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: 4,
                    backgroundColor: "#22C55E",
                  }}
                />
                <span
                  style={{
                    fontSize: 15,
                    fontWeight: 600,
                    color: THEME.textMuted,
                  }}
                >
                  ChatGPT
                </span>
              </div>

              {/* Chat body */}
              <div
                style={{
                  padding: "24px 20px",
                  display: "flex",
                  flexDirection: "column",
                  gap: 16,
                  minHeight: 200,
                }}
              >
                {/* User message */}
                {frame >= 170 && (
                  <div
                    style={{
                      alignSelf: "flex-end",
                      maxWidth: "75%",
                    }}
                  >
                    <div
                      style={{
                        backgroundColor: THEME.accent,
                        color: "#FFFFFF",
                        padding: "12px 18px",
                        borderRadius: "16px 16px 4px 16px",
                        fontSize: 16,
                        lineHeight: 1.5,
                      }}
                    >
                      <TypeWriter
                        text="What was I researching earlier?"
                        startFrame={170}
                        speed={1.5}
                      />
                    </div>
                  </div>
                )}

                {/* AI response */}
                {frame >= 230 && (
                  <div
                    style={{
                      alignSelf: "flex-start",
                      maxWidth: "80%",
                    }}
                  >
                    <div
                      style={{
                        backgroundColor: THEME.bgCardAlt,
                        border: "1px solid rgba(255,255,255,0.08)",
                        color: THEME.text,
                        padding: "12px 18px",
                        borderRadius: "16px 16px 16px 4px",
                        fontSize: 16,
                        lineHeight: 1.5,
                        boxShadow:
                          redGlow > 0
                            ? `0 0 ${20 * redGlow}px ${THEME.danger}44`
                            : "none",
                        transition: "box-shadow 0.15s",
                      }}
                    >
                      <TypeWriter
                        text="I don't have access to your screen or browsing history."
                        startFrame={230}
                        speed={1.5}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* "Your AI is blind" text below chat card */}
            {frame >= 300 && (
              <div
                style={{
                  marginTop: 32,
                  fontSize: 28,
                  fontWeight: 600,
                  color: THEME.danger,
                  opacity: sideTextOpacity,
                  textAlign: "center",
                }}
              >
                Your AI is blind to your workflow
              </div>
            )}
          </AbsoluteFill>
        )}
      </div>

      {/* ============================================================ */}
      {/* BEAT 3: ScreenMind Enters                                     */}
      {/* ============================================================ */}
      {frame >= 380 && (
        <AbsoluteFill
          style={{
            justifyContent: "center",
            alignItems: "center",
            opacity: finalFade,
          }}
        >
          {/* Brain logo in gradient circle */}
          <div
            style={{
              width: 140,
              height: 140,
              borderRadius: 70,
              background: `linear-gradient(135deg, ${THEME.accent}, ${THEME.secondary})`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 70,
              transform: `scale(${logoScale})`,
              opacity: logoOpacity,
              boxShadow: `0 0 40px ${THEME.accent}44`,
            }}
          >
            &#129504;
          </div>

          {/* "ScreenMind" title */}
          <div
            style={{
              marginTop: 24,
              fontSize: 80,
              fontWeight: 800,
              color: THEME.text,
              letterSpacing: -2,
              transform: `scale(${titleScale})`,
              opacity: titleOpacity,
            }}
          >
            ScreenMind
          </div>

          {/* Tagline */}
          {frame >= 430 && (
            <div
              style={{
                marginTop: 16,
                fontSize: 26,
                color: THEME.textMuted,
                textAlign: "center",
              }}
            >
              <TypeWriter
                text="An AI that sees your screen and remembers everything"
                startFrame={430}
                speed={1.5}
              />
            </div>
          )}
        </AbsoluteFill>
      )}
    </AbsoluteFill>
  );
};
