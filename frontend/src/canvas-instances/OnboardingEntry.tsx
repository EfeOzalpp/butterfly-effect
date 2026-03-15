// canvas-engine/CanvasEntry.tsx

import { EngineHost } from "../canvas-engine/EngineHost";

export default function CanvasEntry({
  visible = true,
  liveAvg = 0.5,
  allocAvg = 0.5,
  questionnaireOpen = false,
  condAvgs,
}: {
  visible?: boolean;
  liveAvg?: number;
  allocAvg?: number;
  questionnaireOpen?: boolean;
  condAvgs?: Partial<Record<'A' | 'B' | 'C' | 'D', number>>;
}) {
  return (
    <div className={`onboarding-canvas${questionnaireOpen ? ' questionnaire-active' : ''}`}>
      <div id="canvas-root" style={{ width: "100%", height: "100%" }} />
      <EngineHost id="start" open visible={visible} liveAvg={liveAvg} allocAvg={allocAvg} questionnaireOpen={questionnaireOpen} condAvgs={condAvgs} />
    </div>
  );
}
