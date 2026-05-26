// src/canvas-engine/scene-rules/canvas-padding/types.ts

export interface CanvasPaddingSpec {
  rows: number;
  useTopRatio?: number;
  horizonPos?: number;
  forbidden?: (r: number, c: number, rows: number, cols: number) => boolean;
}
