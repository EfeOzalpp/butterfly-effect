// canvas-engine/CanvasEntry.tsx

import { useCanvasRuntime } from "../app/state/canvas-runtime-context";
import { useUiFlow } from "../app/state/ui-context";
import { EngineHost } from "../canvas-engine/EngineHost";

export default function CanvasEntry({ visible = true }: { visible?: boolean }) {
  const { liveAvg, allocAvg, condAvgs, reservedFootprints } = useCanvasRuntime();
  const { questionnaireOpen } = useUiFlow();

  return (
    <div className={`onboarding-canvas${questionnaireOpen ? ' questionnaire-active' : ''}`}>
      <div id="canvas-root" style={{ width: "100%", height: "100%" }} />
      <EngineHost
        id="start"
        open
        visible={visible}
        liveAvg={liveAvg}
        allocAvg={allocAvg}
        questionnaireOpen={questionnaireOpen}
        condAvgs={condAvgs}
        reservedFootprints={reservedFootprints}
      />
    </div>
  );
}
