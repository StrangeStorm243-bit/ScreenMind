import React from "react";
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { THEME } from "../styles/theme";

// === Inline components to avoid import issues ===

const AppWindow: React.FC<{
  title: string;
  x: number;
  y: number;
  width: number;
  height: number;
  delay: number;
  bgColor?: string;
  children: React.ReactNode;
}> = ({ title, x, y, width, height, delay, bgColor = "#FFFFFF", children }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const scale = spring({
    fps,
    frame: frame - delay,
    config: { damping: 12, stiffness: 200 },
  });

  const opacity = interpolate(frame - delay, [0, 5], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        width,
        height,
        transform: `scale(${scale})`,
        opacity,
        borderRadius: 12,
        overflow: "hidden",
        boxShadow: "0 8px 32px rgba(0,0,0,0.1)",
        border: "1px solid #E2E8F0",
      }}
    >
      <div
        style={{
          height: 36,
          backgroundColor: "#F1F5F9",
          display: "flex",
          alignItems: "center",
          padding: "0 12px",
          gap: 8,
          borderBottom: "1px solid #E2E8F0",
        }}
      >
        <div style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: "#EF4444" }} />
        <div style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: "#F59E0B" }} />
        <div style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: "#22C55E" }} />
        <span style={{ marginLeft: 8, fontSize: 13, color: THEME.muted, fontFamily: "Inter, sans-serif" }}>
          {title}
        </span>
      </div>
      <div style={{ backgroundColor: bgColor, height: height - 36, padding: 16 }}>
        {children}
      </div>
    </div>
  );
};

const TypeWriterText: React.FC<{
  text: string;
  startFrame: number;
  charsPerFrame?: number;
}> = ({ text, startFrame, charsPerFrame = 1 }) => {
  const frame = useCurrentFrame();
  const elapsed = Math.max(0, frame - startFrame);
  const charsToShow = Math.min(text.length, Math.floor(elapsed * charsPerFrame));
  const visibleText = text.slice(0, charsToShow);
  const showCursor = charsToShow < text.length && elapsed > 0;

  return (
    <span>
      {visibleText}
      {showCursor && (
        <span
          style={{
            display: "inline-block",
            width: 2,
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

// === ScanLine ===
const ScanLine: React.FC<{ startFrame: number; duration: number }> = ({
  startFrame,
  duration,
}) => {
  const frame = useCurrentFrame();
  const progress = interpolate(frame - startFrame, [0, duration], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const opacity = interpolate(
    frame - startFrame,
    [0, 5, duration - 5, duration],
    [0, 0.6, 0.6, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  if (frame < startFrame || frame > startFrame + duration) return null;

  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        overflow: "hidden",
        pointerEvents: "none",
        zIndex: 50,
      }}
    >
      <div
        style={{
          position: "absolute",
          top: `${progress * 100}%`,
          left: 0,
          right: 0,
          height: 3,
          background: `linear-gradient(90deg, transparent, ${THEME.accent}, transparent)`,
          opacity,
          boxShadow: `0 0 20px ${THEME.accent}`,
        }}
      />
    </div>
  );
};

// === Entity Tags floating up ===
const EntityTag: React.FC<{
  label: string;
  x: number;
  startFrame: number;
}> = ({ label, x, startFrame }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const elapsed = frame - startFrame;
  if (elapsed < 0) return null;

  const moveUp = interpolate(elapsed, [0, 40], [0, -120], {
    extrapolateRight: "clamp",
  });

  const opacity = interpolate(elapsed, [0, 10, 30, 40], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const scale = spring({
    fps,
    frame: elapsed,
    config: { damping: 12, stiffness: 200 },
  });

  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: 500,
        transform: `translateY(${moveUp}px) scale(${scale})`,
        opacity,
        fontFamily: "Inter, sans-serif",
        fontSize: 14,
        fontWeight: 600,
        color: THEME.accent,
        backgroundColor: "rgba(67, 97, 238, 0.1)",
        padding: "4px 12px",
        borderRadius: 12,
        border: `1px solid ${THEME.accent}33`,
        whiteSpace: "nowrap",
        zIndex: 55,
      }}
    >
      {label}
    </div>
  );
};

// === Knowledge Graph ===
const GraphViz: React.FC<{ startFrame: number }> = ({ startFrame }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const nodes = [
    { label: "React", x: 80, y: 60, delay: 0 },
    { label: "Chrome", x: 200, y: 40, delay: 10 },
    { label: "API", x: 155, y: 130, delay: 20 },
    { label: "Notes", x: 260, y: 110, delay: 30 },
    { label: "Slack", x: 50, y: 150, delay: 40 },
  ];

  const edges = [
    { from: 0, to: 1, delay: 15 },
    { from: 0, to: 2, delay: 25 },
    { from: 1, to: 3, delay: 35 },
    { from: 2, to: 4, delay: 45 },
    { from: 3, to: 2, delay: 50 },
  ];

  const containerOpacity = interpolate(frame - startFrame, [0, 15], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  if (frame < startFrame) return null;

  return (
    <div
      style={{
        position: "absolute",
        left: 40,
        bottom: 40,
        width: 340,
        height: 240,
        backgroundColor: "rgba(26, 26, 46, 0.9)",
        borderRadius: 12,
        overflow: "hidden",
        padding: 16,
        zIndex: 55,
        opacity: containerOpacity,
      }}
    >
      <div style={{ fontFamily: "Inter, sans-serif", fontSize: 11, color: THEME.muted, marginBottom: 8 }}>
        Knowledge Graph
      </div>
      <svg width="310" height="190" viewBox="0 0 310 190">
        {edges.map((edge, i) => {
          const fromNode = nodes[edge.from];
          const toNode = nodes[edge.to];
          const edgeOpacity = interpolate(
            frame - startFrame - edge.delay,
            [0, 10],
            [0, 0.4],
            { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
          );
          return (
            <line
              key={`e-${i}`}
              x1={fromNode.x}
              y1={fromNode.y}
              x2={toNode.x}
              y2={toNode.y}
              stroke={THEME.accent}
              strokeWidth={1.5}
              opacity={edgeOpacity}
            />
          );
        })}
        {nodes.map((node, i) => {
          const nodeScale = spring({
            fps,
            frame: frame - startFrame - node.delay,
            config: { damping: 12, stiffness: 200 },
          });
          const nodeOpacity = interpolate(
            frame - startFrame - node.delay,
            [0, 5],
            [0, 1],
            { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
          );
          return (
            <g key={`n-${i}`} opacity={nodeOpacity}>
              <circle cx={node.x} cy={node.y} r={20 * nodeScale} fill={THEME.accent} opacity={0.8} />
              <text
                x={node.x}
                y={node.y + 4}
                textAnchor="middle"
                fill="white"
                fontSize={8}
                fontFamily="Inter, sans-serif"
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

// === Overlay ===
const ScreenMindOverlay: React.FC<{ delay: number }> = ({ delay }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const slideIn = spring({
    fps,
    frame: frame - delay,
    config: { damping: 15, stiffness: 100 },
  });

  const translateY = interpolate(slideIn, [0, 1], [100, 0]);
  const opacity = interpolate(slideIn, [0, 1], [0, 1]);

  const dotOpacity = interpolate(Math.sin((frame - delay - 30) * 0.15), [-1, 1], [0.3, 1]);

  const messages: Array<{ role: "user" | "assistant"; text: string; startFrame: number }> = [
    { role: "user", text: "What was I researching earlier?", startFrame: 300 },
    {
      role: "assistant",
      text: "You were reading React server components documentation in Chrome and taking notes about API design patterns in your notes app.",
      startFrame: 380,
    },
  ];

  return (
    <div
      style={{
        position: "absolute",
        right: 40,
        bottom: 40,
        width: 380,
        height: 500,
        backgroundColor: THEME.overlayDark,
        borderRadius: 16,
        overflow: "hidden",
        boxShadow: "0 12px 48px rgba(0,0,0,0.3)",
        transform: `translateY(${translateY}px)`,
        opacity,
        display: "flex",
        flexDirection: "column",
        zIndex: 60,
      }}
    >
      {/* Title bar */}
      <div
        style={{
          padding: "12px 16px",
          borderBottom: "1px solid #2D2D3E",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <span style={{ fontFamily: "Inter, sans-serif", fontWeight: 700, fontSize: 14, color: THEME.overlayText }}>
          🧠 ScreenMind
        </span>
        {frame >= delay + 30 && (
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <div
              style={{
                width: 8,
                height: 8,
                borderRadius: 4,
                backgroundColor: THEME.success,
                opacity: dotOpacity,
              }}
            />
            <span style={{ fontFamily: "Inter, sans-serif", fontSize: 12, color: THEME.success }}>
              Watching...
            </span>
          </div>
        )}
      </div>

      {/* Messages */}
      <div style={{ flex: 1, padding: 16, overflow: "hidden" }}>
        {messages.map((msg, i) => {
          if (frame < msg.startFrame) return null;
          return (
            <div
              key={i}
              style={{
                marginBottom: 12,
                padding: "8px 12px",
                borderRadius: 8,
                backgroundColor: msg.role === "user" ? "#2D2D4E" : "#1A1A30",
                maxWidth: "90%",
                marginLeft: msg.role === "user" ? "auto" : 0,
              }}
            >
              <div
                style={{
                  fontFamily: msg.role === "user" ? "Inter, sans-serif" : "monospace",
                  fontSize: msg.role === "user" ? 14 : 13,
                  color: THEME.overlayText,
                  lineHeight: 1.5,
                }}
              >
                <TypeWriterText
                  text={msg.text}
                  startFrame={msg.startFrame}
                  charsPerFrame={msg.role === "user" ? 1.5 : 1}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// === Main Scene ===
export const DemoScene: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: "#E8ECF1" }}>
      {/* Browser window */}
      <AppWindow title="Chrome — React Server Components" x={60} y={40} width={700} height={500} delay={10}>
        <div style={{ fontFamily: "Inter, sans-serif", fontSize: 14, color: THEME.text }}>
          <div style={{ fontSize: 22, fontWeight: 700, marginBottom: 12 }}>React Server Components</div>
          <div style={{ color: THEME.muted, lineHeight: 1.8 }}>
            Server Components let you write UI that can be rendered and optionally cached on the server. They
            represent a new way to build React applications that leverage the server and client...
          </div>
          <div style={{ marginTop: 16, color: THEME.muted, lineHeight: 1.8 }}>
            Unlike traditional client-side rendering, Server Components execute entirely on the server, reducing
            the JavaScript bundle sent to users.
          </div>
        </div>
      </AppWindow>

      {/* Notes window */}
      <AppWindow title="Notes — API Design" x={820} y={80} width={500} height={380} delay={20}>
        <div style={{ fontFamily: "Inter, sans-serif", fontSize: 13, color: THEME.text, lineHeight: 1.8 }}>
          <div style={{ fontWeight: 600, marginBottom: 8 }}>API Design Patterns</div>
          • RESTful endpoints for CRUD<br />
          • GraphQL for flexible queries<br />
          • WebSocket for real-time updates<br />
          • Rate limiting strategy<br />
          • Authentication via JWT tokens
        </div>
      </AppWindow>

      {/* Slack window */}
      <AppWindow title="Slack — #dev-team" x={180} y={420} width={480} height={220} delay={30} bgColor="#1A1A2E">
        <div style={{ fontFamily: "Inter, sans-serif", fontSize: 12, color: THEME.overlayText, lineHeight: 2 }}>
          <span style={{ color: THEME.accent }}>@alice:</span> PR is ready for review<br />
          <span style={{ color: THEME.success }}>@bob:</span> Looks good, merging now<br />
          <span style={{ color: "#F59E0B" }}>@charlie:</span> Deployed to staging
        </div>
      </AppWindow>

      {/* Scan line */}
      <ScanLine startFrame={80} duration={60} />

      {/* Entity tags floating up */}
      <EntityTag label="React docs" x={200} startFrame={160} />
      <EntityTag label="Chrome" x={400} startFrame={175} />
      <EntityTag label="API research" x={600} startFrame={190} />
      <EntityTag label="Slack" x={350} startFrame={205} />

      {/* ScreenMind overlay */}
      <ScreenMindOverlay delay={150} />

      {/* Knowledge graph */}
      <GraphViz startFrame={500} />
    </AbsoluteFill>
  );
};
