// modifiers/index.ts

/* =========================
 * COLOR
 * ========================= */

export { clamp01 } from "./color-modifiers/math";

export { rgbToHsl, hslToRgb } from "./color-modifiers/colorspace";

export { blendRGB, blendRGBGamma } from "./color-modifiers/blend";

export { cssToRgbViaCanvas } from "./color-modifiers/adapter";

export {
  oscillateSaturation,
  clampBrightness,
  clampSaturation,
  driveSaturation,
} from "./color-modifiers/effects";

// Runtime uses these
export { gradientColor } from "./color-modifiers/gradient";
export { BRAND_STOPS_VIVID } from "./color-modifiers/stops";


/* =========================
 * SHAPE MODIFIERS
 * ========================= */

export { displacementOsc } from "./shape-modifiers/osc";
export { makeArchLobes } from "./shape-modifiers/geom";

// legacy surface expects clamp01/val/mix to come from here.
// clamp01 would collide with color clamp01, so keep the old names:
// - clamp01 from color
// - val/mix from useLerp
export { val, mix } from "./shape-modifiers/useLerp";

export { applyShapeMods } from "./shape-modifiers/shapeMods.apply";
export type { Anchor, ShapeMods, ApplyShapeModsOpts } from "./shape-modifiers/shapeMods.types";


/* =========================
 * PARTICLES 
 * ========================= */

export { stepAndDrawParticles } from "./particle-systems/particle-1";
export { stepAndDrawPuffs } from "./particle-systems/particle-2";
