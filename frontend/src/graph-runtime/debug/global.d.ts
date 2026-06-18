import type { Texture } from "../three";
import type { ShapeKey } from "../sprites/selection/types";
import type { SpriteCacheMetrics } from "./spriteCacheMetrics";
import type { GraphZoomMetrics } from "./zoomMetrics";

declare global {
  interface Window {
    __GP_CTX_LOST?: boolean;
    __GP_DISABLE_SPRITE_CACHE?: boolean;
    __GP_DISABLE_SPRITE_MATERIAL_CACHE?: boolean;
    __GP_DISABLE_SPRITE_OPTIMIZATIONS?: boolean;
    __GP_DISABLE_SPRITE_QUANTIZATION?: boolean;
    __GP_FORCE_SPRITE_AVG?: number;
    __GP_FORCE_SPRITE_SHAPE?: ShapeKey;
    __GP_LOG_LOAD_ERRORS?: boolean;
    __GP_SHOW_HITBOXES?: boolean;
    __GP_TEX_REGISTRY?: Set<Texture>;
    __GP_TRACK_SPRITE_CACHE_METRICS?: boolean;
    __GP_SPRITE_CACHE_METRICS?: SpriteCacheMetrics;
    __GP_TRACK_ZOOM_METRICS?: boolean;
    __GP_ZOOM_METRICS?: GraphZoomMetrics;
  }
}

export {};
