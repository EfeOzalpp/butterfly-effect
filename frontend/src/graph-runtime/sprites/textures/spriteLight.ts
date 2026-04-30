import type { SceneLightContext } from "../../../canvas-engine/modifiers/lighting";

const SPRITE_PALETTE_CLOSENESS_K = 0.6;

export function makeSpritePaletteLightContext(
  sceneW: number,
  sceneH: number,
  darkMode: boolean
): SceneLightContext {
  const w = Math.max(1, sceneW);
  const h = Math.max(1, sceneH);

  return {
    sourceX: w * 0.5,
    sourceY: -h * 0.08,
    kind: darkMode ? "moon" : "sun",
    intensity: 0,
    paletteClosenessK: SPRITE_PALETTE_CLOSENESS_K,
    sceneW: w,
    sceneH: h,
    sceneDiag: Math.max(1, Math.hypot(w, h)),
    lightColor: darkMode
      ? { r: 198, g: 220, b: 255 }
      : { r: 255, g: 222, b: 168 },
    shadowColor: darkMode
      ? { r: 58, g: 76, b: 108 }
      : { r: 88, g: 114, b: 150 },
  };
}
