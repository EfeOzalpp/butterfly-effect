// canvas-engine/modifiers/color-modifiers/fog.ts
//
// Recursively lerps every {r,g,b} leaf in a palette structure toward a haze color.
// Used to apply atmospheric fog to shape palettes based on row depth.

import type { RGB } from "./types";

function isRGB(v: unknown): v is RGB {
  return !!v && typeof v === 'object' && 'r' in (v as object) && 'g' in (v as object) && 'b' in (v as object);
}

function fogifyValue(v: unknown, t: number, haze: RGB): unknown {
  if (isRGB(v)) {
    return {
      r: Math.round(v.r + (haze.r - v.r) * t),
      g: Math.round(v.g + (haze.g - v.g) * t),
      b: Math.round(v.b + (haze.b - v.b) * t),
    };
  }
  if (Array.isArray(v)) return v.map(item => fogifyValue(item, t, haze));
  if (v && typeof v === 'object') {
    const result: Record<string, unknown> = {};
    for (const key of Object.keys(v as object)) {
      result[key] = fogifyValue((v as Record<string, unknown>)[key], t, haze);
    }
    return result;
  }
  return v;
}

/**
 * Returns a fog-adjusted copy of `palette` where every RGB color is lerped
 * toward the haze target by `fogK` (0 = no fog, 1 = full haze).
 * Returns the original palette reference unchanged when fogK <= 0.
 */
export function fogifyPalette(palette: unknown, fogK: number, darkMode: boolean): unknown {
  if (!palette || fogK <= 0) return palette;
  const haze: RGB = darkMode
    ? { r: 79,  g: 84,  b: 111 }  // ~horizon band of dark start background (#4f546f)
    : { r: 229, g: 246, b: 255 }; // base background color of start scene
  return fogifyValue(palette, fogK, haze);
}
