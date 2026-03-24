// src/canvas-engine/adjustable-rules/canvasPadding.ts

import { makeRowForbidden } from '../grid-layout/forbidden';
import type { DeviceType } from '../shared/responsiveness';
import type { SceneLookupKey } from "./sceneMode";

export type CanvasPaddingSpec = {
  rows: number;
  useTopRatio?: number;
  forbidden?: (r: number, c: number, rows: number, cols: number) => boolean;
};
// Shortcut all row occupied: CENTER_100
// All row available: LR_0
const CENTER_100 = { center: '1010%' } as const;
const LR_0 = { left: '0%', right: '0%' } as const;

// Enter a new section for a new canvas padding rule
export const CANVAS_PADDING: Record<SceneLookupKey, Record<DeviceType, CanvasPaddingSpec | null>> = {
  start: {
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
      rows: 16,
      useTopRatio: 1,
      forbidden: makeRowForbidden([        
        LR_0,  
        LR_0, 
        LR_0, 
        { left: '4%', center: '10%', right: '4%' },
        { left: '24%', center: '20%', right: '4%' },
        { left: '24%', center: '30%', right: '34%' },
        { left: '4%', center: '25%', right: '5%' }, 
        { left: '4%', center: '10%', right: '4%' },
        { left: '36%', right: '0%' }, 
        { left: '36%', right: '0%' },
        { left: '36%', right: '0%' }, 
        { left: '36%', right: '0%' }, 
        { left: '36%', right: '0%' },
        { left: '36%', right: '0%' },  
        { left: '36%', right: '0%' }, 
        { left: '36%', right: '0%' },
        CENTER_100,    
        CENTER_100,
        CENTER_100,
      ]),
    },
  },

  questionnaire: {
    mobile: {
      rows: 40,
      useTopRatio: 1,
      forbidden: makeRowForbidden([
        CENTER_100, CENTER_100, CENTER_100, CENTER_100,
        CENTER_100, CENTER_100, CENTER_100, CENTER_100,
        CENTER_100, CENTER_100, CENTER_100, CENTER_100,
        CENTER_100,
        { left: '10%', right: '10%', center: '510%' },
        { left: '10%', right: '10%', center: '510%' },
        { left: '10%', right: '10%', center: '510%' },
        { left: '10%', right: '10%', center: '610%' },
        { left: '10%', right: '10%', center: '410%' },
        { left: '10%', right: '10%', center: '410%' },
        { left: '10%', right: '10%', center: '410%' },
        { left: '10%', right: '10%', center: '410%' },
        { left: '10%', right: '10%', center: '410%' },
        { left: '10%', right: '10%', center: '410%' },
      ]),
    },
    tablet: {
      rows: 44,
      useTopRatio: 1,
      forbidden: makeRowForbidden([
        CENTER_100, CENTER_100, CENTER_100, CENTER_100,
        CENTER_100, CENTER_100, CENTER_100, CENTER_100,
        CENTER_100, CENTER_100, CENTER_100,
        { left: '10%', right: '10%', center: '510%' },
        { left: '10%', right: '10%', center: '56%' },
        { left: '10%', right: '10%', center: '56%' },
        { left: '10%', right: '10%', center: '66%' },
        { left: '10%', right: '10%', center: '66%' },
        { left: '10%', right: '10%', center: '410%' },
        { left: '10%', right: '10%', center: '410%' },
        { left: '10%', right: '10%', center: '410%' },
        { left: '10%', right: '10%', center: '410%' },
      ]),
    },
    laptop: {
      rows: 16,
      useTopRatio: 1,
      forbidden: makeRowForbidden([
        CENTER_100,  
        { left: '0%', center: '40%', right: '0%' },
        { left: '0%', center: '40%', right: '0%' },
        { left: '0%', center: '40%', right: '0%' },
        { left: '10%', center: '40%', right: '10%' },
        { left: '10%', center: '40%', right: '10%' },
        { left: '10%', center: '30%', right: '10%' },
        { left: '5%', center: '30%', right: '5%' },
        { left: '0%', center: '30%', right: '0%' },
        { left: '0%', center: '30%', right: '0%' },
        { left: '0%', center: '30%', right: '0%' },
        { left: '0%', center: '30%', right: '0%' },
        { left: '0%', center: '30%', right: '0%' },
        { left: '0%', center: '30%', right: '0%' },
        { left: '0%', center: '30%', right: '0%' },
        CENTER_100, CENTER_100, CENTER_100, CENTER_100, 
      ]),
    },
  },

  city: {
    mobile: {
      rows: 44,
      useTopRatio: 1,
      forbidden: makeRowForbidden([
        CENTER_100, CENTER_100, CENTER_100, CENTER_100,
        { left: '6%', right: '6%', center: '56%' },
        { left: '6%', right: '6%', center: '56%' },
        { left: '6%', right: '6%', center: '56%' },
        { left: '6%', right: '6%', center: '56%' },
        { left: '6%', right: '6%', center: '44%' },
        { left: '6%', right: '6%', center: '44%' },
        { left: '6%', right: '6%', center: '40%' },
        { left: '6%', right: '6%', center: '40%' },
        { left: '6%', right: '6%', center: '34%' },
        { left: '6%', right: '6%', center: '34%' },
        { left: '6%', right: '6%' },
        { left: '6%', right: '6%' },
        { left: '6%', right: '6%' },
        { left: '6%', right: '6%' },
        { left: '6%', right: '6%' },
        { left: '6%', right: '6%' },
        { left: '6%', right: '6%' },
        { left: '6%', right: '6%' },
        { left: '5%', right: '5%' },
        { left: '5%', right: '5%' },
      ]),
    },
    tablet: {
      rows: 44,
      useTopRatio: 1,
      forbidden: makeRowForbidden([
        CENTER_100, CENTER_100, CENTER_100,
        { left: '4%', right: '4%', center: '52%' },
        { left: '4%', right: '4%', center: '52%' },
        { left: '4%', right: '4%', center: '52%' },
        { left: '4%', right: '4%', center: '48%' },
        { left: '4%', right: '4%', center: '48%' },
        { left: '4%', right: '4%', center: '40%' },
        { left: '4%', right: '4%', center: '40%' },
        { left: '4%', right: '4%', center: '32%' },
        { left: '4%', right: '4%', center: '32%' },
        { left: '4%', right: '4%', center: '26%' },
        { left: '4%', right: '4%', center: '26%' },
        { left: '4%', right: '4%' },
        { left: '4%', right: '4%' },
        { left: '4%', right: '4%' },
        { left: '4%', right: '4%' },
        { left: '4%', right: '4%' },
        { left: '4%', right: '4%' },
      ]),
    },
    laptop: {
      rows: 18,
      useTopRatio: 1,
      forbidden: makeRowForbidden([
        CENTER_100,
        { left: '5%', right: '4%', center: '34%' },
        { left: '5%', right: '4%', center: '34%' },
        { left: '5%', right: '4%', center: '28%' },
        { left: '5%', right: '4%', center: '28%' },
        { left: '5%', right: '4%', center: '22%' },
        { left: '5%', right: '4%', center: '22%' },
        { left: '5%', right: '4%', center: '18%' },
        { left: '5%', right: '4%', center: '18%' },
        { left: '5%', right: '4%' },
        { left: '5%', right: '4%' },
        { left: '5%', right: '4%' },
        { left: '5%', right: '4%' },
        { left: '5%', right: '4%' },
        { left: '5%', right: '4%' },
        { left: '5%', right: '4%' },
        { left: '4%', right: '4%' },
        { left: '4%', right: '4%' },
      ]),
    },
  },
} as const;
