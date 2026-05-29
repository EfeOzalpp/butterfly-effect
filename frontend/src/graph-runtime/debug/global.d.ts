import type { Texture } from "three";
import type { ShapeKey } from "../sprites/selection/types";

declare global {
  interface Window {
    __GP_CTX_LOST?: boolean;
    __GP_DISABLE_SPRITE_CACHE?: boolean;
    __GP_DISABLE_SPRITE_MATERIAL_CACHE?: boolean;
    __GP_DISABLE_SPRITE_OPTIMIZATIONS?: boolean;
    __GP_DISABLE_SPRITE_QUANTIZATION?: boolean;
    __GP_FORCE_SPRITE_SHAPE?: ShapeKey;
    __GP_LOG_LOAD_ERRORS?: boolean;
    __GP_SHOW_HITBOXES?: boolean;
    __GP_TEX_REGISTRY?: Set<Texture>;
  }
}

export {};
