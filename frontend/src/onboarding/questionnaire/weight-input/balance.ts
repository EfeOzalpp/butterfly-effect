export type ShapeKey = 'A' | 'B' | 'C' | 'D';
const KEYS: ShapeKey[] = ['A', 'B', 'C', 'D'];

export const SIMPLEX_DEFAULT: Record<ShapeKey, number> = {
  A: 0.25,
  B: 0.25,
  C: 0.25,
  D: 0.25,
};

// Normalize any record to sum to 1.0 across A/B/C/D
export const simplexNormalize = (
  vals: Partial<Record<ShapeKey, number>>
): Record<ShapeKey, number> => {
  const sum = KEYS.reduce((s, k) => s + (vals[k] ?? 0), 0);
  if (sum < 1e-9) return { ...SIMPLEX_DEFAULT };
  return KEYS.reduce((acc, k) => {
    acc[k] = (vals[k] ?? 0) / sum;
    return acc;
  }, {} as Record<ShapeKey, number>);
};

// Set key k to val, redistribute remaining budget to others proportionally.
// The moved slider takes precedence — others adapt.
export const simplexSet = (
  vals: Record<ShapeKey, number>,
  k: ShapeKey,
  val: number
): Record<ShapeKey, number> => {
  const clamped = Math.max(0, Math.min(1, val));
  const remaining = 1 - clamped;
  const others = KEYS.filter((ok) => ok !== k);
  const otherSum = others.reduce((s, ok) => s + vals[ok], 0);

  const result = { ...vals, [k]: clamped } as Record<ShapeKey, number>;

  if (otherSum < 1e-9) {
    // others are all zero — distribute remaining equally
    const each = remaining / others.length;
    others.forEach((ok) => { result[ok] = each; });
  } else {
    // scale others proportionally to fill the remaining budget
    const scale = remaining / otherSum;
    others.forEach((ok) => { result[ok] = vals[ok] * scale; });
  }

  return result;
};
