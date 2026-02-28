import React from "react";
import { Composition } from "remotion";
import { Video } from "./Video";
import { TOTAL_DURATION, FPS, WIDTH, HEIGHT } from "./styles/theme";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="ScreenMindDemo"
        component={Video}
        durationInFrames={TOTAL_DURATION}
        fps={FPS}
        width={WIDTH}
        height={HEIGHT}
      />
    </>
  );
};
