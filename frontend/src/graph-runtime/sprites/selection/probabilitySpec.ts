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
  clouds: [
    { t: 0, prob: 0.6 },
    { t: 0.45, prob: 0.82 },
    { t: 1, prob: 0.94 },
  ],
  snow: [
    { t: 0, prob: 0.38 },
    { t: 0.45, prob: 0.56 },
    { t: 1, prob: 0.76 },
  ],
  house: [
    { t: 0, prob: 0.52 },
    { t: 0.7, prob: 0.85 },
    { t: 1, prob: 0.62 },
  ],
  power: [
    { t: 0, prob: 0.62 },
    { t: 0.5, prob: 0.65 },
    { t: 1, prob: 0.62 },
  ],
  sun: [
    { t: 0, prob: 0.28 },
    { t: 0.5, prob: 0.60 },
    { t: 1, prob: 0.95 },
  ],
  villa: [
    { t: 0, prob: 0.18 },
    { t: 0.5, prob: 0.50 },
    { t: 1, prob: 0.92 },
  ],
  car: [
    { t: 0, prob: 0.92 },
    { t: 0.5, prob: 0.58 },
    { t: 1, prob: 0.20 },
  ],
  sea: [
    { t: 0, prob: 0.62 },
    { t: 0.5, prob: 0.65 },
    { t: 1, prob: 0.63 },
  ],
  carFactory: [
    { t: 0, prob: 0.95 },
    { t: 0.45, prob: 0.62 },
    { t: 1, prob: 0.18 },
  ],
  bus: [
    { t: 0, prob: 0.22 },
    { t: 0.5, prob: 0.56 },
    { t: 1, prob: 0.94 },
  ],
  trees: [
    { t: 0, prob: 0.30 },
    { t: 0.5, prob: 0.65 },
    { t: 1, prob: 1.0 },
  ],
};
