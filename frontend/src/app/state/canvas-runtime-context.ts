import { createContext, useContext } from "react";
import type { CondAvgs } from "../types";
import type { Place } from "../../canvas-engine/grid-layout/occupancy";

export type CanvasRuntimeState = {
  // Continuous signal updated on every survey interaction — drives canvas color and animation in real-time
  liveAvg: number;
  setLiveAvg: (avg?: number) => void;
  // Committed signal updated on Next / Finish / drag release — drives scene composition (shape count and types)
  allocAvg: number;
  commitAllocAvg: (avg?: number) => void;
  // Per-shape-key averages (A/B/C/D) — drives condition-based canvas tweaks per answer option
  condAvgs: CondAvgs;
  setCondAvgs: (avgs: CondAvgs) => void;
  // Grid cells reserved by questionnaire UI — canvas avoids placing shapes in these zones
  reservedFootprints: Place[];
  setReservedFootprints: (next: Place[]) => void;
};

export const CanvasRuntimeCtx = createContext<CanvasRuntimeState | null>(null);

export function useCanvasRuntime(): CanvasRuntimeState {
  const ctx = useContext(CanvasRuntimeCtx);
  if (!ctx) throw new Error("useCanvasRuntime must be used within AppProvider");
  return ctx;
}

export function useOptionalCanvasRuntime(): CanvasRuntimeState | null {
  return useContext(CanvasRuntimeCtx);
}
