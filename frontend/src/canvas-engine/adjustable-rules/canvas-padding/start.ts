// src/canvas-engine/adjustable-rules/canvas-padding/start.ts

import { makeRowForbidden, CENTER_100, LR_0, type CanvasPaddingSpec } from './helpers';
import type { DeviceType } from '../../shared/responsiveness';

export const START_PADDING: Record<DeviceType, CanvasPaddingSpec | null> = {
  mobile: {
    rows: 26,
    useTopRatio: 1,
    horizonPos: 0.55,
    forbidden: makeRowForbidden(
      Array.from( { length: 20 } , () => ({ ...LR_0}))
    ),
  },

  tablet: {
    rows: 17,
    useTopRatio: 1,
    horizonPos: 0.55,
    forbidden: makeRowForbidden([
      CENTER_100, CENTER_100,
      { left: '4%', right: '4%' }, { left: '4%', right: '4%' },
      { left: '4%', right: '4%' }, { left: '4%', right: '4%' },
      { left: '4%', right: '4%' }, { left: '4%', right: '4%' },
      { left: '4%', right: '4%' }, { left: '4%', right: '4%' },
      { left: '4%', right: '4%' },
      CENTER_100, CENTER_100, CENTER_100, CENTER_100, CENTER_100,
    ]),
  },

  laptop: {
    rows: 18,
    useTopRatio: 1,
    horizonPos: 0.56,
    forbidden: makeRowForbidden(
      Array.from( { length: 20 } , () => ({ ...LR_0}))
    ),
  },
};
