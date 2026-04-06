import { useCallback, useState } from 'react';

import type { CondAvgs } from '../types';
import type { Place } from '../../canvas-engine/grid-layout/occupancy';

export const DEFAULT_AVG = 0.5;

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
  const [condAvgsState, _setCondAvgsState] = useState<CondAvgs>({});
  const [reservedFootprintsState, _setReservedFootprintsState] = useState<Place[]>([]);

  const setLiveAvg = useCallback((avg?: number) => {
    _setLiveAvgState(normalizeAvg(avg));
  }, []);

  const setCondAvgs = useCallback((next: CondAvgs) => {
    _setCondAvgsState((prev) => {
      const changed = (['A', 'B', 'C', 'D'] as const).some((k) => prev[k] !== next[k]);
      return changed ? next : prev;
    });
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
    _setCondAvgsState({});
    _setReservedFootprintsState([]);
  }, []);

  return {
    liveAvgState,
    setLiveAvg,
    allocAvgState,
    commitAllocAvg,
    condAvgsState,
    setCondAvgs,
    reservedFootprintsState,
    setReservedFootprints,
    resetCanvasRuntimeState,
  };
}
