export type ShapeKey = 'A' | 'B' | 'C' | 'D';

export const KEYS: ShapeKey[] = ['A', 'B', 'C', 'D'];

// A=Circle (top/best), B=Square (right), D=Diamond (left), C=Triangle (bottom/worst)
export const AXIS_ANGLES: Record<ShapeKey, number> = {
  A: -Math.PI / 2, // top
  B: 0,            // right
  C: Math.PI / 2,  // bottom
  D: Math.PI,      // left
};

export const axisPoint = (
  cx: number,
  cy: number,
  r: number,
  key: ShapeKey,
  value: number
) => ({
  x: cx + value * r * Math.cos(AXIS_ANGLES[key]),
  y: cy + value * r * Math.sin(AXIS_ANGLES[key]),
});

// Project screen point onto axis, return 0..1 value
export const projectOntoAxis = (
  px: number,
  py: number,
  cx: number,
  cy: number,
  key: ShapeKey,
  r: number
): number => {
  const angle = AXIS_ANGLES[key];
  const dx = px - cx;
  const dy = py - cy;
  const proj = dx * Math.cos(angle) + dy * Math.sin(angle);
  return Math.max(0, Math.min(1, proj / r));
};
