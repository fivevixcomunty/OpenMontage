import {
  AbsoluteFill,
  interpolate,
  interpolateColors,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import React from "react";

export const ShortsComposition: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  // Progress calculation
  const progress = (frame / durationInFrames) * 100;
  const clampedProgress = Math.min(100, Math.max(0, progress));

  // Scale animation with correct monotonic inputRange [0, 0.5, 1]
  const scale = spring({
    frame,
    fps,
    config: { damping: 25, stiffness: 150 },
  });

  const zoomEffect = interpolate(frame, [0, 0.5, 1], [1, 1.05, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Color transition using interpolateColors for non-numeric color strings
  const progressColor = interpolateColors(
    clampedProgress,
    [0, 100],
    ["#ff0000", "#ffff00"]
  );

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#0d0d0d",
        justifyContent: "center",
        alignItems: "center",
        color: "white",
        fontFamily: "sans-serif",
      }}
    >
      <div
        style={{
          transform: `scale(${scale * zoomEffect})`,
          textAlign: "center",
          padding: "20px",
        }}
      >
        <h1 style={{ fontSize: "60px", marginBottom: "20px" }}>
          Shorts Automation
        </h1>
        <div
          style={{
            width: "300px",
            height: "10px",
            backgroundColor: "#333",
            borderRadius: "5px",
            overflow: "hidden",
            margin: "0 auto",
          }}
        >
          <div
            style={{
              width: `${clampedProgress}%`,
              height: "100%",
              backgroundColor: progressColor,
            }}
          />
        </div>
      </div>
    </AbsoluteFill>
  );
};