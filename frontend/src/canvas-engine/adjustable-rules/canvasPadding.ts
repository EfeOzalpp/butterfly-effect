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
const CENTER_100 = { center: '100%' } as const;
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
      useTopRatio: 0.0,
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
      rows: 14,
      useTopRatio: 1,
      forbidden: makeRowForbidden([        
        CENTER_100, CENTER_100, CENTER_100, 
        { left: '4%', center: '40%', right: '4%' },
        { left: '4%', center: '30%', right: '4%' },
        { left: '4%', center: '30%', right: '4%' },
        { left: '4%', center: '40%', right: '4%' },
        { left: '4%', center: '40%', right: '4%' },
        { left: '4%', center: '40%', right: '4%' },
        { left: '4%', center: '40%', right: '4%' },
        { left: '4%', center: '40%', right: '4%' },
        { left: '4%', center: '40%', right: '4%' },
        CENTER_100, CENTER_100, 
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
        { left: '0%', right: '0%', center: '50%' },
        { left: '0%', right: '0%', center: '50%' },
        { left: '0%', right: '0%', center: '50%' },
        { left: '0%', right: '0%', center: '60%' },
        { left: '0%', right: '0%', center: '40%' },
        { left: '0%', right: '0%', center: '40%' },
        { left: '0%', right: '0%', center: '40%' },
        { left: '0%', right: '0%', center: '40%' },
        { left: '0%', right: '0%', center: '40%' },
        { left: '0%', right: '0%', center: '40%' },
      ]),
    },
    tablet: {
      rows: 44,
      useTopRatio: 1,
      forbidden: makeRowForbidden([
        CENTER_100, CENTER_100, CENTER_100, CENTER_100,
        CENTER_100, CENTER_100, CENTER_100, CENTER_100,
        CENTER_100, CENTER_100, CENTER_100,
        { left: '0%', right: '0%', center: '50%' },
        { left: '0%', right: '0%', center: '56%' },
        { left: '0%', right: '0%', center: '56%' },
        { left: '0%', right: '0%', center: '66%' },
        { left: '0%', right: '0%', center: '66%' },
        { left: '0%', right: '0%', center: '40%' },
        { left: '0%', right: '0%', center: '40%' },
        { left: '0%', right: '0%', center: '40%' },
        { left: '0%', right: '0%', center: '40%' },
      ]),
    },
    laptop: {
      rows: 14,
      useTopRatio: 1,
      forbidden: makeRowForbidden([
        CENTER_100, 
        { left: '5%', center: '40%', right: '5%' },
        { left: '5%', center: '40%', right: '5%' },
        { left: '5%', center: '40%', right: '5%' },
        { left: '5%', center: '40%', right: '5%' },
        { left: '5%', center: '40%', right: '5%' },
        { left: '5%', center: '40%', right: '5%' },
        { left: '5%', center: '40%', right: '5%' },
        { left: '5%', center: '40%', right: '5%' },
        { left: '5%', center: '40%', right: '5%' },
        { left: '5%', center: '40%', right: '5%' },
        { left: '5%', center: '40%', right: '5%' },
        CENTER_100, CENTER_100,
      ]),
    },
  },

  sectionOpen: {
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
      useTopRatio: 0.0,
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
        CENTER_100, CENTER_100, CENTER_100,
        { left: '4%', center: '35%', right: '4%' },
        { left: '4%', center: '35%', right: '4%' },
        { left: '4%', center: '35%', right: '4%' },
        { left: '4%', center: '35%', right: '4%' },
        { left: '4%', center: '35%', right: '4%' },
        { left: '4%', center: '35%', right: '4%' },
        { left: '4%', center: '35%', right: '4%' },
        { left: '4%', center: '35%', right: '4%' },
        { left: '4%', center: '35%', right: '4%' },
        { left: '4%', center: '35%', right: '4%' },
        { left: '4%', center: '35%', right: '4%' },
        { left: '4%', center: '35%', right: '4%' },
        CENTER_100,
      ]),
    },
  },

  overlay: {
    mobile: {
      rows: 44,
      useTopRatio: 1,
      forbidden: makeRowForbidden(Array.from({ length: 44 }, () => LR_0)),
    },
    tablet: {
      rows: 44,
      useTopRatio: 1,
      forbidden: makeRowForbidden(Array.from({ length: 44 }, () => LR_0)),
    },
    laptop: {
      rows: 16,
      useTopRatio: 1,
      forbidden: makeRowForbidden(Array.from({ length: 16 }, () => LR_0)),
    },
  },
} as const;
