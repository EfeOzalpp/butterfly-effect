// src/canvas-instances/CityEntry.tsx
import { memo } from "react";
import { useCanvasRuntimeStore } from "../app/state/canvas-runtime-store";
import { EngineHost } from "../scene-canvas/EngineHost";

function CityOverlay({ open }: { open: boolean }) {
  const liveAvg = useCanvasRuntimeStore((s) => s.liveAvg);
  const reservedFootprints = useCanvasRuntimeStore((s) => s.reservedFootprints);
  const setClickedShape = useCanvasRuntimeStore((s) => s.setClickedShape);

  return (
    <div
      id="city-overlay-root"
      className={`city-overlay ${open ? "open" : ""}`}
      aria-hidden={!open}
    >
      <div id="city-canvas-root" className="city-canvas-host" />
      <EngineHost
        id="city"
        open={open}
        liveAvg={liveAvg}
        reservedFootprints={reservedFootprints}
        onShapeClick={setClickedShape}
      />
    </div>
  );
}

export default memo(CityOverlay);
