// Runtime debug switches can be flipped from DevTools without changing source.
function readWindowFlag(name: keyof Window) {
  if (typeof window === "undefined") return false;
  return window[name] === true;
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
  return shouldDisableSpriteOptimizations() || shouldDisableSpriteCaching();
}

export function spriteQuantizationDisabled() {
  return shouldDisableSpriteOptimizations() || shouldDisableSpriteQuantization();
}

export function spriteMaterialCachingDisabled() {
  return shouldDisableSpriteOptimizations() || shouldDisableSpriteMaterialCaching();
}
