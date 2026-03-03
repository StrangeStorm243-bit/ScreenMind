import React from "react";
import { AbsoluteFill } from "remotion";
import { TransitionSeries, linearTiming } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { SCENES, TRANSITION_FRAMES, THEME } from "./styles/theme";
import { ProblemScene } from "./scenes/ProblemScene";
import { RekaScene } from "./scenes/RekaScene";
import { FastinoScene } from "./scenes/FastinoScene";
import { Neo4jRagScene } from "./scenes/Neo4jRagScene";
import { ClosingScene } from "./scenes/ClosingScene";
import { RealDemoScene } from "./scenes/RealDemoScene";

const T = linearTiming({ durationInFrames: TRANSITION_FRAMES });

export const Video: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: THEME.bg }}>
      <TransitionSeries>
        <TransitionSeries.Sequence durationInFrames={SCENES.problem}>
          <ProblemScene />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={fade()} timing={T} />

        <TransitionSeries.Sequence durationInFrames={SCENES.reka}>
          <RekaScene />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={fade()} timing={T} />

        <TransitionSeries.Sequence durationInFrames={SCENES.fastino}>
          <FastinoScene />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={fade()} timing={T} />

        <TransitionSeries.Sequence durationInFrames={SCENES.neo4jRag}>
          <Neo4jRagScene />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={fade()} timing={T} />

        <TransitionSeries.Sequence durationInFrames={SCENES.closing}>
          <ClosingScene />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={fade()} timing={T} />

        <TransitionSeries.Sequence durationInFrames={SCENES.realDemo}>
          <RealDemoScene />
        </TransitionSeries.Sequence>
      </TransitionSeries>
    </AbsoluteFill>
  );
};
