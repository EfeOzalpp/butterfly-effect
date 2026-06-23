// src/canvas-instances/QuestionnaireEntry.tsx

import { useCanvasRuntime } from "../app/state/canvas-runtime-context";
import { EngineHost } from "../canvas-engine/EngineHost";

export default function QuestionnaireEntry({ visible = true }: { visible?: boolean }) {
  const { liveAvg, reservedFootprints } = useCanvasRuntime();

  return (
    <div
      className="onboarding-canvas questionnaire-active"
      role="img"
      aria-label="Animated sustainability questionnaire visualization"
    >
      <div id="questionnaire-canvas-root" style={{ width: "100%", height: "100%" }} />
      <EngineHost
        id="questionnaire"
        open
        visible={visible}
        liveAvg={liveAvg}
        reservedFootprints={reservedFootprints}
      />
    </div>
  );
}
