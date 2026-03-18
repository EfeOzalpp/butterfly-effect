import { useState } from 'react';

import type { CondAvgs } from '../types';

export const DEFAULT_AVG = 0.5;

function normalizeAvg(avg: unknown) {
  return typeof avg === 'number' && Number.isFinite(avg) ? avg : DEFAULT_AVG;
}

export default function useCanvasRuntimeState() {
  const [liveAvgState, _setLiveAvgState] = useState<number>(DEFAULT_AVG);
  const [allocAvgState, _setAllocAvgState] = useState<number>(DEFAULT_AVG);
  const [condAvgsState, _setCondAvgsState] = useState<CondAvgs>({});

  const setLiveAvg = (avg?: number) => {
    _setLiveAvgState(normalizeAvg(avg));
  };

  const setCondAvgs = (next: CondAvgs) => {
    _setCondAvgsState((prev) => {
      const changed = (['A', 'B', 'C', 'D'] as const).some((k) => prev[k] !== next[k]);
      return changed ? next : prev;
    });
  };

  const commitAllocAvg = (avg?: number) => {
    _setAllocAvgState(normalizeAvg(avg));
  };

  const resetCanvasRuntimeState = () => {
    _setLiveAvgState(DEFAULT_AVG);
    _setAllocAvgState(DEFAULT_AVG);
    _setCondAvgsState({});
  };

  return {
    liveAvgState,
    setLiveAvg,
    allocAvgState,
    commitAllocAvg,
    condAvgsState,
    setCondAvgs,
    resetCanvasRuntimeState,
  };
}
