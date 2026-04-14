// src/canvas-engine/adjustable-rules/canvas-padding/start.ts

import { makeRowForbidden, CENTER_100, LR_0, type CanvasPaddingSpec } from './helpers';
import type { DeviceType } from '../../shared/responsiveness';

export const START_PADDING: Record<DeviceType, CanvasPaddingSpec | null> = {
  mobile: {
    rows: 26,
    useTopRatio: 1,
    horizonPos: 0.55,
    forbidden: makeRowForbidden(
      Array.from( { length: 26 } , () => ({ ...LR_0}))
    ),
  },

  tablet: {
    rows: 22,
    useTopRatio: 1,
    horizonPos: 0.54,
    forbidden: makeRowForbidden(
      Array.from( { length: 22 }, () => ({ ...LR_0}))
    ),
  },

  laptop: {
    rows: 18,
    useTopRatio: 1,
    horizonPos: 0.545,
    forbidden: makeRowForbidden(
      Array.from( { length: 18 } , () => ({ ...LR_0}))
    ),
  },
};
