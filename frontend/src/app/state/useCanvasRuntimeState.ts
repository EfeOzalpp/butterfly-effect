// src/app/state/useCanvasRuntimeState.ts
// Stores the live/committed score signals that drive the Canvas 2D scene.

import { useCallback, useState } from 'react';

import { DEFAULT_AVG } from './canvas-runtime-context';
import type { Place } from '../../canvas-engine/grid-layout/occupancy';

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
  const [liveAvgState, _setLiveAvgState] = useState<number>(DEFAULT_AVG);
  const [allocAvgState, _setAllocAvgState] = useState<number>(DEFAULT_AVG);
  const [reservedFootprintsState, _setReservedFootprintsState] = useState<Place[]>([]);

  const setLiveAvg = useCallback((avg?: number) => {
    _setLiveAvgState(normalizeAvg(avg));
  }, []);

  const commitAllocAvg = useCallback((avg?: number) => {
    _setAllocAvgState(normalizeAvg(avg));
  }, []);

  const setReservedFootprints = useCallback((next: Place[]) => {
    _setReservedFootprintsState((prev) => (sameFootprints(prev, next) ? prev : next));
  }, []);

  const resetCanvasRuntimeState = useCallback(() => {
    _setLiveAvgState(DEFAULT_AVG);
    _setAllocAvgState(DEFAULT_AVG);
    _setReservedFootprintsState([]);
  }, []);

  return {
    liveAvgState,
    setLiveAvg,
    allocAvgState,
    commitAllocAvg,
    reservedFootprintsState,
    setReservedFootprints,
    resetCanvasRuntimeState,
  };
}
