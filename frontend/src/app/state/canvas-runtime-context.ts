import { createContext, useContext } from "react";
import type { Place } from "../../canvas-engine/grid-layout/occupancy";

export interface CanvasRuntimeState {
  // Continuous signal updated on every survey interaction; drives canvas color and animation in real time.
  liveAvg: number;
  setLiveAvg: (avg?: number) => void;
  // Committed signal updated on Next / Finish / drag release; drives scene composition.
  allocAvg: number;
  commitAllocAvg: (avg?: number) => void;
  // Grid cells reserved by questionnaire UI; canvas avoids placing shapes in these zones.
  reservedFootprints: Place[];
  setReservedFootprints: (next: Place[]) => void;
}

export const CanvasRuntimeCtx = createContext<CanvasRuntimeState | null>(null);

export function useCanvasRuntime(): CanvasRuntimeState {
  const ctx = useContext(CanvasRuntimeCtx);
  if (!ctx) throw new Error("useCanvasRuntime must be used within AppProvider");
  return ctx;
}

export function useOptionalCanvasRuntime(): CanvasRuntimeState | null {
  return useContext(CanvasRuntimeCtx);
}
