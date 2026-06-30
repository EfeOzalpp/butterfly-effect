// src/app/state/useCanvasRuntimeState.ts
// Stores the live score signal and reserved UI footprint data for the Canvas 2D scene.

import { useCallback, useState } from 'react';

import { DEFAULT_AVG, DEFAULT_SPOTLIGHT_SIGNAL } from './canvas-runtime-context';
import { getSessionItem } from '../session';
import type { Place } from '../../scene-canvas/grid-layout/occupancy';
import type { EngineFieldItem } from '../../scene-canvas/runtime/engine/field';

function normalizeAvg(avg: unknown) {
  return typeof avg === 'number' && Number.isFinite(avg) ? avg : DEFAULT_AVG;
}

function sameFootprint(a: Place, b: Place) {
  return a.r0 === b.r0 && a.c0 === b.c0 && a.w === b.w && a.h === b.h;
}

function sameFootprints(a: Place[], b: Place[]) {
  if (a === b) return true;
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i += 1) {
    if (!sameFootprint(a[i], b[i])) return false;
  }
  return true;
}

export default function useCanvasRuntimeState() {
  const [hoveredShapeState, _setHoveredShapeState] = useState<EngineFieldItem | null>(null);
  const [clickedShapeState, _setClickedShapeState] = useState<EngineFieldItem | null>(null);

  const setHoveredShape = useCallback((item: EngineFieldItem | null) => {
    _setHoveredShapeState(item);
  }, []);

  const setClickedShape = useCallback((item: EngineFieldItem | null) => {
    _setClickedShapeState(item);
  }, []);

  const [liveAvgState, _setLiveAvgState] = useState<number>(() => {
    const stored = getSessionItem('be.myAvg');
    if (stored === null) return DEFAULT_AVG;
    const parsed = parseFloat(stored);
    return Number.isFinite(parsed) && parsed >= 0 && parsed <= 1 ? parsed : DEFAULT_AVG;
  });
  const [spotlightLiveAvgState, _setSpotlightLiveAvgState] = useState<number>(DEFAULT_AVG);
  const [reservedFootprintsState, _setReservedFootprintsState] = useState<Place[]>([]);
  const [spotlightState, setSpotlightState] = useState(DEFAULT_SPOTLIGHT_SIGNAL);

  const setLiveAvg = useCallback((avg?: number) => {
    _setLiveAvgState(normalizeAvg(avg));
  }, []);

  const setSpotlightLiveAvg = useCallback((avg?: number) => {
    _setSpotlightLiveAvgState(normalizeAvg(avg));
  }, []);

  const setReservedFootprints = useCallback((next: Place[]) => {
    _setReservedFootprintsState((prev) => (sameFootprints(prev, next) ? prev : next));
  }, []);

  const previousSpotlight = useCallback(() => {
    setSpotlightState((prev) => ({
      ...prev,
      index: prev.index - 1,
    }));
  }, []);

  const nextSpotlight = useCallback(() => {
    setSpotlightState((prev) => ({
      ...prev,
      index: prev.index + 1,
    }));
  }, []);

  const setSpotlightPaused = useCallback((paused: boolean) => {
    setSpotlightState((prev) => (prev.paused === paused ? prev : { ...prev, paused }));
  }, []);

  const toggleSpotlightPaused = useCallback(() => {
    setSpotlightState((prev) => ({
      ...prev,
      paused: !prev.paused,
    }));
  }, []);

  const resetCanvasRuntimeState = useCallback(() => {
    _setLiveAvgState(DEFAULT_AVG);
    _setSpotlightLiveAvgState(DEFAULT_AVG);
    _setReservedFootprintsState([]);
    _setHoveredShapeState(null);
    _setClickedShapeState(null);
    setSpotlightState(DEFAULT_SPOTLIGHT_SIGNAL);
  }, []);

  return {
    hoveredShapeState,
    setHoveredShape,
    clickedShapeState,
    setClickedShape,
    liveAvgState,
    setLiveAvg,
    spotlightLiveAvgState,
    setSpotlightLiveAvg,
    reservedFootprintsState,
    setReservedFootprints,
    spotlightState,
    previousSpotlight,
    nextSpotlight,
    setSpotlightPaused,
    toggleSpotlightPaused,
    resetCanvasRuntimeState,
  };
}
