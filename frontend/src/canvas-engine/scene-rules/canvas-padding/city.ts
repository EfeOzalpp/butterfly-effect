// src/canvas-engine/scene-rules/canvas-padding/city.ts

import type { CanvasPaddingSpec } from './types';
import type { DeviceType } from '../../shared/responsiveness';

export const CITY_PADDING: Record<DeviceType, CanvasPaddingSpec | null> = {
  mobile: {
    rows: 26,
    useTopRatio: 1,
    horizonPos: 0.5,
  },

  tablet: {
    rows: 22,
    useTopRatio: 1,
    horizonPos: 0.55,
  },

  laptop: {
    rows: 24,
    useTopRatio: 1,
    horizonPos: 0.52,
  },
};
