import { createContext, useContext } from "react";
import type { CondAvgs } from "../types";
import type { Place } from "../../canvas-engine/grid-layout/occupancy";

export type CanvasRuntimeState = {
  liveAvg: number;
  setLiveAvg: (avg?: number) => void;
  allocAvg: number;
  commitAllocAvg: (avg?: number) => void;
  condAvgs: CondAvgs;
  setCondAvgs: (avgs: CondAvgs) => void;
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
