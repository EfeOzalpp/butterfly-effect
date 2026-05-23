import type * as THREE from "three";

declare global {
  interface Window {
    __GP_DISABLE_SPRITE_CACHE?: boolean;
    __GP_DISABLE_SPRITE_MATERIAL_CACHE?: boolean;
    __GP_DISABLE_SPRITE_OPTIMIZATIONS?: boolean;
    __GP_DISABLE_SPRITE_QUANTIZATION?: boolean;
    __GP_FROZEN_TEX?: { size: number };
    __GP_LOG_LOAD_ERRORS?: boolean;
    __GP_TEX_REGISTRY?: Set<THREE.Texture>;
  }
}

export {};
