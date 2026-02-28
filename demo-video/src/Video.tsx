import React from "react";
import { AbsoluteFill } from "remotion";
import { TransitionSeries, linearTiming } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { SCENES, TRANSITION_FRAMES, THEME } from "./styles/theme";
import { ProblemScene } from "./scenes/ProblemScene";
import { IntroScene } from "./scenes/IntroScene";
import { RekaCaptureScene } from "./scenes/RekaCaptureScene";
import { RagFastinoScene } from "./scenes/RagFastinoScene";
import { DemoScene } from "./scenes/DemoScene";
import { ArchScene } from "./scenes/ArchScene";
import { ClosingScene } from "./scenes/ClosingScene";

const T = linearTiming({ durationInFrames: TRANSITION_FRAMES });

export const Video: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: THEME.bg }}>
      <TransitionSeries>
        <TransitionSeries.Sequence durationInFrames={SCENES.problem}>
          <ProblemScene />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={fade()} timing={T} />

        <TransitionSeries.Sequence durationInFrames={SCENES.intro}>
          <IntroScene />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={fade()} timing={T} />

        <TransitionSeries.Sequence durationInFrames={SCENES.rekaCapture}>
          <RekaCaptureScene />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={fade()} timing={T} />

        <TransitionSeries.Sequence durationInFrames={SCENES.ragFastino}>
          <RagFastinoScene />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={fade()} timing={T} />

        <TransitionSeries.Sequence durationInFrames={SCENES.demo}>
          <DemoScene />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={fade()} timing={T} />

        <TransitionSeries.Sequence durationInFrames={SCENES.arch}>
          <ArchScene />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={fade()} timing={T} />

        <TransitionSeries.Sequence durationInFrames={SCENES.closing}>
          <ClosingScene />
        </TransitionSeries.Sequence>
      </TransitionSeries>
    </AbsoluteFill>
  );
};
