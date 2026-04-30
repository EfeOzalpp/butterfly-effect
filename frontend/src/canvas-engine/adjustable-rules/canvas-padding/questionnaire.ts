// src/canvas-engine/adjustable-rules/canvas-padding/questionnaire.ts

import { makeRowForbidden, CENTER_100, LR_0, type CanvasPaddingSpec } from './helpers';
import type { DeviceType } from '../../shared/responsiveness';

export const QUESTIONNAIRE_PADDING: Record<DeviceType, CanvasPaddingSpec | null> = {
  mobile: {
    rows: 36,
    useTopRatio: 1,
    horizonPos: 0.35,
    forbidden: makeRowForbidden(
      Array.from( { length: 36 } , () => ({ ...LR_0}))
    ),
  },

  tablet: {
    rows: 36,
    useTopRatio: 1,
    horizonPos: 0.35,
    forbidden: makeRowForbidden(
      Array.from( { length: 36 } , () => ({ ...LR_0}))
    ),
  },

  laptop: {
    rows: 24,
    useTopRatio: 1,
    horizonPos: 0.5,
    forbidden: makeRowForbidden(
      Array.from( { length: 24 } , () => ({ ...LR_0}))
    ),
  },
};
