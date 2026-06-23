// src/lib/utils/color-and-interpolation.ts
// Centralized gradient and interpolation helpers used across components.

export interface RGB {
  r: number;
  g: number;
  b: number;
}

export interface Stop {
  stop: number;
  color: RGB;
}

/** Clamp a number to [min,max] */
const clamp = (v: number, min = 0, max = 1) => Math.max(min, Math.min(max, v));

/** Interpolate two RGB colors */
const lerpColor = (t: number, c1: RGB, c2: RGB): RGB => ({
  r: Math.round(c1.r + (c2.r - c1.r) * t),
  g: Math.round(c1.g + (c2.g - c1.g) * t),
  b: Math.round(c1.b + (c2.b - c1.b) * t),
});

/** Convert RGB object to css rgb() string */
export const rgbString = (c: RGB) => `rgb(${String(c.r)}, ${String(c.g)}, ${String(c.b)})`;

// ---------------- Palettes ----------------

// VIVID brand gradient (narrow yellow, deeper endpoints)
const VIVID_COLOR_STOPS: Stop[] = [
  { stop: 0.00, color: { r: 210, g:  0,  b:  25 } },  // deeper, pure red
  { stop: 0.20, color: { r: 235, g:  90, b:   0 } },  // hot orange

  // Middle ridge, narrow but bright.
  { stop: 0.40, color: { r: 255, g: 150, b:  40 } },  // golden yellow
  { stop: 0.60, color: { r: 225, g: 175, b:  40 } },
  { stop: 0.7, color: { r: 180, g: 180, b: 120 } },  // bright yellow-green

  { stop: 0.78, color: { r: 110, g: 195, b:  70 } },  // clean green
  { stop: 1.00, color: { r: 0, g: 200, b:  40 } },  // deep forest green
];

const BRAND_STOPS: Stop[] = VIVID_COLOR_STOPS;

// --------------- Sampling -----------------

/**
 * Sample a multi-stop gradient.
 * @param tRaw - normalized 0..1 position
 * @param stops - gradient stops (sorted by stop)
 */
export const sampleStops = (tRaw: number, stops: Stop[] = BRAND_STOPS): RGB => {
  const t = clamp(tRaw, 0, 1);
  let lower = stops[0], upper = stops[stops.length - 1];
  for (let i = 0; i < stops.length - 1; i++) {
    if (t >= stops[i].stop && t <= stops[i + 1].stop) {
      lower = stops[i];
      upper = stops[i + 1];
      break;
    }
  }
  const range = Math.max(upper.stop - lower.stop, 1e-6);
  const localT = (t - lower.stop) / range;
  return lerpColor(localT, lower.color, upper.color);
};

