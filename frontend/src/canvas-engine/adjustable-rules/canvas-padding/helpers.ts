// src/canvas-engine/adjustable-rules/canvas-padding/helpers.ts

import { makeRowForbidden } from '../../grid-layout/forbidden';

export type CanvasPaddingSpec = {
  rows: number;
  useTopRatio?: number;
  horizonPos?: number;
  forbidden?: (r: number, c: number, rows: number, cols: number) => boolean;
};

export type ScenePaddingByDevice = Record<string, CanvasPaddingSpec | null>;

// Shorthand row specs used across all scenes
export const CENTER_100 = { center: '1010%' } as const;
export const LR_0       = { left: '0%', right: '0%' } as const;

export { makeRowForbidden };
