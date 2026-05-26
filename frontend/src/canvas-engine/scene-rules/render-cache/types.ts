// src/canvas-engine/scene-rules/render-cache/types.ts

export interface FarShapeBitmapCachePolicy {
  enabled: boolean;
  farSizeK: number;
  maxPixelsPerCanvasPixel: number;
  alwaysLiveShapes: readonly string[];
}

export interface ShapeDepthMaskCachePolicy {
  maxPixelsPerCanvasPixel: number;
  maxBakesPerFrame: number;
  minBlend: number;
  alwaysLiveShapes: readonly string[];
}

export interface RenderCachePolicy {
  farShapeBitmap: FarShapeBitmapCachePolicy;
  shapeDepthMask: ShapeDepthMaskCachePolicy;
}
