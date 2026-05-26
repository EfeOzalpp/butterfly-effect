// Shape configs often accept either a fixed number or a [from, to] range.
// These helpers resolve those small art-direction ranges from a 0..1 driver.

import { clamp01, lerpNumber } from "../../shared/math";

export type NumberRange = [number, number];

export { clamp01, lerpNumber };

export function mix(a: number, b: number, t: number): number {
  return lerpNumber(a, b, t);
}

export function resolveRangeValue(v: number | NumberRange, u: number): number {
  return Array.isArray(v) ? lerpNumber(v[0], v[1], clamp01(u)) : v;
}

// Backward-compatible aliases. New shape code should prefer resolveRangeValue()
// for ranges and lerpNumber() for plain numeric interpolation.
export const val = resolveRangeValue;
