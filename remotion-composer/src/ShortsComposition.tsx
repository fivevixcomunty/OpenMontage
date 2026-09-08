import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

// ============================================================
// ShortsComposition — YouTube Shorts (1080x1920, 30fps, 30s)
// ============================================================

interface BRollProps {
  src: string; // Video or image URL/path
}

interface HookTextProps {
  text: string;
  /** Start frame (default: 0) */
  startFrame?: number;
  /** End frame (default: 90 = 3 seconds at 30fps) */
  endFrame?: number;
  /** Font size in rem (default: 8) */
  fontSize?: number;
}

interface CaptionWord {
  word: string;
  startMs: number;
  endMs: number;
}

interface ShortsCompositionProps {
  /** B-roll video/image source */
  bRollSrc: string;
  /** Array of caption words with timing */
  captions: CaptionWord[];
  /** Hook text shown in first 3 seconds */
  hookText: string;
  /** Optional accent color for progress bar (default: red accent) */
  accentColor?: string;
  /** Optional progress bar background (default: semi-transparent black) */
  progressBgColor?: string;
}

/**
 * B-Roll component with 40% black overlay for text readability
 */
const BRoll: React.FC<BRollProps> = ({ src }) => {
  return (
    <video
      src={src}
      style={{
        width: "100%",
        height: "100%",
        objectFit: "cover",
      }}
      playsInline
      muted
      autoPlay
    />
  );
};

/**
 * Hook Text — shown in the first 3 seconds (0-90 frames)
 * Positioned at top-center with bold yellow/white font
 */
const HookText: React.FC<HookTextProps> = ({
  text,
  startFrame = 0,
  endFrame = 90,
  fontSize = 8,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Show hook text only between startFrame and endFrame
  const isVisible = frame >= startFrame && frame <= endFrame;

  // Scale animation using spring for smooth entrance
  const scale = spring({
    frame,
    fps,
    config: { damping: 30, stiffness: 200 },
    from: 0,
    to: isVisible ? 1 : 0,
  });

  // Opacity tied to visibility
  const opacity = isVisible ? 1 : 0;

  // Horizontal position: center of the screen
  // Vertical position: top area (15% from top)
  const topPosition = interpolate(scale, [0, 1], [40, 15], {
    extrapolate: "clamp",
  });

  return (
    <div
      style={{
        position: "absolute",
        left: "50%",
        top: `${topPosition}%`,
        transform: `translateX(-50%) scale(${scale})`,
        color: "#FFE600", // Yellow color as specified
        fontFamily: "'Montserrat Black', 'Impact', sans-serif", // Bold font as specified
        fontSize: `${12 + fontSize * 0.8}rem`, // Large font
        fontWeight: 900,
        textAlign: "center",
        lineHeight: 1.2,
        pointerEvents: "none",
        zIndex: 100,
      }}
    >
      {isVisible && <span style={{ display: "block" }}>{text}</span>}
    </div>
  );
};

/**
 * Dynamic Caption System — word-by-word display
 * Active word highlights in #FFE600 (yellow)
 */
const DynamicCaptions: React.FC<ShortsCompositionProps> = ({
  captions,
  accentColor = "#FFE600",
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return captions.map((word) => {
    const isActive =
      word.startMs <= frame / fps * 1000 && word.endMs > frame / fps * 1000;
    const isPast = word.endMs <= frame / fps * 1000;

    // Spring entrance animation for each word
    const entrance = spring({
      frame,
      fps,
      config: { damping: 25, stiffness: 150 },
    });

    // Scale effect - slight zoom-in for active words
    const wordScale = interpolate(entrance, [0, 1, 0.5], [0.8, 1, 1], {
      extrapolate: "clamp",
    });

    return (
      <span
        key={word.word}
        style={{
          position: "absolute",
          left: "50%",
          top: "75%",
          transform: `translateX(-50) scale(${wordScale})`,
          color: isActive ? accentColor : "#6B7280",
          fontFamily: "'Montserrat Medium', sans-serif",
          fontSize: isActive ? "1.2rem" : "1rem",
          fontWeight: isActive ? 600 : 400,
          textAlign: "center",
          pointerEvents: "none",
          whiteSpace: "nowrap",
          opacity: isActive ? 1 : isPast ? 0.4 : 0.2,
          transition: "none", // Remotion CSS transitions forbidden
        }}
      >
        {word.word} {isActive ? "" : ""}
      </span>
    );
  });
};

/**
 * Retention Progress Bar — bottom of video showing 0-100% progress
 * Red/yellow gradient colors, thin bar
 */
const RetentionBar: React.FC<ShortsCompositionProps> = ({
  progress, // 0-100
  accentColor = "#FF4444",
  progressBgColor = "rgba(0, 0, 0, 0.5)",
}) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  // Clamp progress to 0-100
  const clampedProgress = Math.max(0, Math.min(100, progress));

  // Progress fill animation using interpolate
  const fillFraction = interpolate(
    frame,
    [10, Math.max(30, durationInFrames * 0.3)],
    [0, clampedProgress / 100],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  // Color animation - start red, transition to yellow as progress increases
  const barColor = interpolate(
    frame,
    [10, durationInFrames * 0.5],
    ["#FF4444", "#FFE600"],
    { extrapolate: "clamp" }
  );

  // Spring for container entrance
  const containerSpring = spring({
    frame,
    fps,
    config: { damping: 20, stiffness: 100 },
  });

  const barHeight = 3;
  const trackHeight = 8;

  return (
    <div
      style={{
        position: "absolute",
        bottom: 20,
        left: 0,
        right: 0,
        zIndex: 50,
        opacity: containerSpring,
      }}
    >
      {/* Background track */}
      <div
        style={{
          width: "100%",
          height: trackHeight,
          backgroundColor: progressBgColor,
          borderRadius: 4,
          overflow: "hidden",
          marginBottom: 8,
        }}
      >
        {/* Progress fill with gradient color */}
        <div
          style={{
            width: `${fillFraction * 100}%`,
            height: "100%",
            background: `linear-gradient(90deg, ${barColor}, ${accentColor})`,
            transition: "width 0.01s linear", // Smooth fill transition
          }}
        />
      </div>

      {/* Percentage label */}
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: "50%",
          transform: "translate(-50%, -50%)",
          color: "#FFFFFF",
          fontFamily: "'Montserrat Medium', sans-serif",
          fontSize: "0.7rem",
          fontWeight: 600,
          textShadow: "0 0 2px rgba(0,0,0,0.8)",
        }}
      >
        {Math.round(clampedProgress)}%
      </div>
    </div>
  );
};

/**
 * Main ShortsComposition component
 * Combines all elements: B-Roll, Hook Text, Dynamic Captions, Retention Bar
 */
export const ShortsComposition: React.FC<ShortsCompositionProps> = ({
  bRollSrc,
  captions,
  hookText,
  accentColor = "#FF4444",
  progressBgColor = "rgba(0, 0, 0, 0.5)",
}) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  // Ensure 1080x1920 dimensions (9:16 aspect ratio)
  // Remotion will handle this via the Composition wrapper

  return (
    <div
      style={{
        position: "relative",
        width: width || 1080,
        height: height || 1920,
        overflow: "hidden",
        backgroundColor: "#000000",
      }}
    >
      {/* 1. B-Roll Background with 40% black overlay for readability */}
      <AbsoluteFill>
        <BRoll src={bRollSrc} />
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "rgba(0, 0, 0, 0.4)", // 40% black overlay
          }}
        />
      </AbsoluteFill>

      {/* 2. Hook Text - shown in first 3 seconds (0-90 frames) */}
      {hookText && (
        <HookText
          text={hookText}
          startFrame={0}
          endFrame={90}
          fontSize={8}
        />
      )}

      {/* 3. Dynamic Captions - word-by-word display */}
      <DynamicCaptions
        captions={captions}
        accentColor={accentColor}
      />

      {/* 4. Retention Progress Bar at bottom */}
      <RetentionBar
        progress={frame / fps * 100} // Convert frames to percentage
        accentColor={accentColor}
        progressBgColor={progressBgColor}
      />
    </div>
  );
};