// src/canvas-engine/scene-rules/render-cache/index.ts

import type { RenderCachePolicy } from "./types";

export type {
  FarShapeBitmapCachePolicy,
  ShapeDepthMaskCachePolicy,
  RenderCachePolicy,
} from "./types";

// Distance-based bitmap caching freezes tiny far-away shapes after their first stable draw.
// This keeps small background details cheap without changing the authored shape files.
const FAR_SHAPE_BITMAP_ALWAYS_LIVE = [
  "snow",
  "power",
  "sun",
  "clouds",
  "house"
] as const;

// Depth masks are cache-stable by default. Animated color details keep moving
// in the live color pass; the depth tint layer should not rebuild every frame.
const SHAPE_DEPTH_MASK_ALWAYS_LIVE = [
  "power"
] as const;

// Cache policy for runtime-rendered shape bitmaps and depth masks.
export const DEFAULT_RENDER_CACHE_POLICY: RenderCachePolicy = {
  farShapeBitmap: {
    enabled: true,
    farSizeK: 0.36,
    // Far-shape bitmap memory scales with the canvas instead of a fixed item count.
    maxPixelsPerCanvasPixel: 3,
    // These shapes keep moving or emitting particles, so distance caching would freeze them.
    alwaysLiveShapes: FAR_SHAPE_BITMAP_ALWAYS_LIVE,
  },
  shapeDepthMask: {
    // Total cached mask backing pixels scale with the visible canvas.
    // This avoids one fixed number being too small for desktop or too large for mobile.
    maxPixelsPerCanvasPixel: 5,
    // Missing masks warm in over multiple frames instead of all baking at startup.
    maxBakesPerFrame: 32,
    // Skip nearly invisible overlays. They still cost a mask lookup/blit,
    // and row-count changes can otherwise create sharp performance cliffs.
    minBlend: 0.08,
    // Opt-in only. Default masks stay cached to avoid liveAvg-driven rebuild churn.
    alwaysLiveShapes: SHAPE_DEPTH_MASK_ALWAYS_LIVE,
  },
};
