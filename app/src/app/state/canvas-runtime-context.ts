// src/app/state/canvas-runtime-context.ts
// Live canvas signals shared by questionnaire controls and canvas instances.

import { createContext, useContext } from "react";
import type { Place } from "../../canvas-engine/grid-layout/occupancy";
import type { SpotlightSignal } from "../../canvas-engine/hooks/signals";
import type { EngineFieldItem } from "../../canvas-engine/runtime/engine/field";

export const DEFAULT_AVG = 0.5;
export const DEFAULT_SPOTLIGHT_SIGNAL: SpotlightSignal = {
  index: 0,
  paused: false,
};

export interface CanvasRuntimeState {
  // Shape currently under the pointer (desktop hover).
  hoveredShape: EngineFieldItem | null;
  setHoveredShape: (item: EngineFieldItem | null) => void;
  // Shape selected by click/tap (toggles off on second tap).
  clickedShape: EngineFieldItem | null;
  setClickedShape: (item: EngineFieldItem | null) => void;
  // Continuous signal updated on every survey interaction; drives canvas visuals and composition.
  liveAvg: number;
  setLiveAvg: (avg?: number) => void;
  // Grid cells reserved by questionnaire UI; canvas avoids placing shapes in these zones.
  reservedFootprints: Place[];
  setReservedFootprints: (next: Place[]) => void;
  // Canvas-info Spotlight controls. Only SpotlightEntry forwards this signal to the engine.
  spotlight: SpotlightSignal;
  spotlightLiveAvg: number;
  setSpotlightLiveAvg: (avg?: number) => void;
  previousSpotlight: () => void;
  nextSpotlight: () => void;
  setSpotlightPaused: (paused: boolean) => void;
  toggleSpotlightPaused: () => void;
}

export const CanvasRuntimeCtx = createContext<CanvasRuntimeState | null>(null);

export function useCanvasRuntime(): CanvasRuntimeState {
  const ctx = useContext(CanvasRuntimeCtx);
  if (!ctx) throw new Error("useCanvasRuntime must be used within AppProvider");
  return ctx;
}
