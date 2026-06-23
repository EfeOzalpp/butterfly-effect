// src/canvas-instances/OnboardingEntry.tsx

import { useCanvasRuntime } from "../app/state/canvas-runtime-context";
import { EngineHost } from "../canvas-engine/EngineHost";

export default function CanvasEntry({ visible = true }: { visible?: boolean }) {
  const { liveAvg, reservedFootprints } = useCanvasRuntime();

  return (
    <div
      className="onboarding-canvas"
      role="img"
      aria-label="Animated sustainability visualization"
    >
      <div id="canvas-root" style={{ width: "100%", height: "100%" }} />
      <EngineHost
        id="start"
        open
        visible={visible}
        liveAvg={liveAvg}
        reservedFootprints={reservedFootprints}
      />
    </div>
  );
}
