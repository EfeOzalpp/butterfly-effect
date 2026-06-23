import type { ShapeKey } from './types';

export interface ProbAnchor { t: number; prob: number }
export type ShapeProbSpec = Record<ShapeKey, readonly ProbAnchor[]>;

// Linear interpolation across the score curve for one shape.
export function getProbAt(curve: readonly ProbAnchor[], avg: number): number {
  if (curve.length === 0) return 1;
  const first = curve[0];
  if (avg <= first.t) return first.prob;
  const last = curve[curve.length - 1];
  if (avg >= last.t) return last.prob;

  for (let i = 1; i < curve.length; i++) {
    const lo = curve[i - 1];
    const hi = curve[i];
    if (avg >= lo.t && avg <= hi.t) {
      const frac = (avg - lo.t) / (hi.t - lo.t);
      return lo.prob + (hi.prob - lo.prob) * frac;
    }
  }

  return 1;
}

// Art-direction table: each shape gets more or less likely as the score changes.
// The sampler turns these curves into a stable shape pick per respondent.
export const SHAPE_PROBABILITY_SPEC: ShapeProbSpec = {
  clouds: [],
  snow: [],
  house: [],
  power: [],
  sun: [],
  villa: [],
  car: [],
  sea: [],
  carFactory: [],
  bus: [],
  trees: [],
};
