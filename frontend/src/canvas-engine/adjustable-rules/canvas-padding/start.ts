// src/canvas-engine/adjustable-rules/canvas-padding/start.ts

import { makeRowForbidden, CENTER_100, LR_0, type CanvasPaddingSpec } from './helpers';
import type { DeviceType } from '../../shared/responsiveness';

export const START_PADDING: Record<DeviceType, CanvasPaddingSpec | null> = {
  mobile: {
    rows: 10,
    useTopRatio: 0.9,
    forbidden: makeRowForbidden([
      LR_0, LR_0, LR_0, LR_0, LR_0, LR_0, LR_0, LR_0,
      CENTER_100, CENTER_100, CENTER_100, CENTER_100,
      CENTER_100, CENTER_100, CENTER_100, CENTER_100,
    ]),
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
    rows: 20,
    useTopRatio: 1,
    horizonPos: 0.5,
    forbidden: makeRowForbidden(
      Array.from( { length: 20 } , () => ({ ...LR_0}))
    ),
  },
};
