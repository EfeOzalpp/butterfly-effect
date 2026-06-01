import { EngineHost } from "../canvas-engine/EngineHost";
import type { SpotlightSignal } from "../canvas-engine/hooks/signals";

export default function SpotlightEntry({
  visible = true,
  spotlight,
  liveAvg = 0.5,
}: {
  visible?: boolean;
  spotlight?: SpotlightSignal;
  liveAvg?: number;
}) {
  return (
    <>
      <div id="spotlight-canvas-root" className="canvas-info__spotlight-canvas" />
      <EngineHost
        id="spotlight"
        open
        visible={visible}
        liveAvg={liveAvg}
        spotlight={spotlight}
        fog={false}
        shapeLightSource={{ xK: 0.72, yK: -0.12, paletteClosenessK: 0.9 }}
      />
    </>
  );
}
