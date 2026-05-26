// src/app/state/canvas-runtime-context.ts
// Live canvas signals shared by questionnaire controls and canvas instances.

import { createContext, useContext } from "react";
import type { Place } from "../../canvas-engine/grid-layout/occupancy";

export const DEFAULT_AVG = 0.5;

export interface CanvasRuntimeState {
  // Continuous signal updated on every survey interaction; drives canvas visuals and composition.
  liveAvg: number;
  setLiveAvg: (avg?: number) => void;
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
