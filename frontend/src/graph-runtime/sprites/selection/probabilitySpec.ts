import type { ShapeKey } from './types';

export type ProbAnchor = { t: number; prob: number };
export type ShapeProbSpec = Record<ShapeKey, readonly ProbAnchor[]>;

export function getProbAt(curve: readonly ProbAnchor[], avg: number): number {
  if (!curve || curve.length === 0) return 1;
  if (avg <= curve[0].t) return curve[0].prob;
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
    { t: 0, prob: 0.48 },
    { t: 0.55, prob: 0.68 },
    { t: 1, prob: 0.88 },
  ],
  power: [
    { t: 0, prob: 0.96 },
    { t: 0.45, prob: 0.72 },
    { t: 1, prob: 0.42 },
  ],
  sun: [
    { t: 0, prob: 0.44 },
    { t: 0.5, prob: 0.66 },
    { t: 1, prob: 0.9 },
  ],
  villa: [
    { t: 0, prob: 0.34 },
    { t: 0.55, prob: 0.58 },
    { t: 1, prob: 0.82 },
  ],
  car: [
    { t: 0, prob: 0.52 },
    { t: 0.5, prob: 0.66 },
    { t: 1, prob: 0.9 },
  ],
  sea: [
    { t: 0, prob: 0.42 },
    { t: 0.55, prob: 0.68 },
    { t: 1, prob: 0.9 },
  ],
  carFactory: [
    { t: 0, prob: 0.94 },
    { t: 0.45, prob: 0.7 },
    { t: 1, prob: 0.36 },
  ],
  bus: [
    { t: 0, prob: 0.42 },
    { t: 0.5, prob: 0.62 },
    { t: 1, prob: 0.88 },
  ],
  trees: [
    { t: 0, prob: 0.5 },
    { t: 0.5, prob: 0.78 },
    { t: 1, prob: 1 },
  ],
};
