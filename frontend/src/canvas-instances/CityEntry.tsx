// navigation/CityOverlay.tsx
import { useCanvasRuntime } from "../app/state/canvas-runtime-context";
import { EngineHost } from "../canvas-engine/EngineHost";

export default function CityOverlay({ open }: { open: boolean }) {
  const { liveAvg, allocAvg, reservedFootprints } = useCanvasRuntime();

  return (
    <div
      id="city-overlay-root"
      className={`city-overlay ${open ? "open" : ""}`}
      aria-hidden={!open}
    >
      <div id="city-canvas-root" className="city-canvas-host" />
      <EngineHost id="city" open={open} liveAvg={liveAvg} allocAvg={allocAvg} reservedFootprints={reservedFootprints} />
    </div>
  );
}
