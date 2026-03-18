const TEMP_DISABLE_SPRITE_OPTIMIZATIONS = false;
const TEMP_DISABLE_SPRITE_CACHE = false;
const TEMP_DISABLE_SPRITE_QUANTIZATION = false;
const TEMP_DISABLE_SPRITE_MATERIAL_CACHE = false;

function readWindowFlag(name: string) {
  if (typeof window === "undefined") return false;
  return (window as any)[name] === true;
}

export function shouldDisableSpriteCaching() {
  return readWindowFlag("__GP_DISABLE_SPRITE_CACHE");
}

export function shouldDisableSpriteQuantization() {
  return readWindowFlag("__GP_DISABLE_SPRITE_QUANTIZATION");
}

export function shouldDisableSpriteOptimizations() {
  return readWindowFlag("__GP_DISABLE_SPRITE_OPTIMIZATIONS");
}

export function shouldDisableSpriteMaterialCaching() {
  return readWindowFlag("__GP_DISABLE_SPRITE_MATERIAL_CACHE");
}

export function spriteCachingDisabled() {
  return TEMP_DISABLE_SPRITE_OPTIMIZATIONS || TEMP_DISABLE_SPRITE_CACHE || shouldDisableSpriteOptimizations() || shouldDisableSpriteCaching();
}

export function spriteQuantizationDisabled() {
  return TEMP_DISABLE_SPRITE_OPTIMIZATIONS || TEMP_DISABLE_SPRITE_QUANTIZATION || shouldDisableSpriteOptimizations() || shouldDisableSpriteQuantization();
}

export function spriteMaterialCachingDisabled() {
  return TEMP_DISABLE_SPRITE_OPTIMIZATIONS || TEMP_DISABLE_SPRITE_MATERIAL_CACHE || shouldDisableSpriteOptimizations() || shouldDisableSpriteMaterialCaching();
}
