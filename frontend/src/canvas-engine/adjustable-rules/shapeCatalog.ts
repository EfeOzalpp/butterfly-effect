// src/canvas-engine/adjustable-rules/shapeCatalog.ts

export const CONDITION_KINDS = ['A', 'B', 'C', 'D'] as const;
export type ConditionKind = (typeof CONDITION_KINDS)[number];

export const SHAPES = [
  'clouds',
  'snow',
  'house',
  'power',
  'sun',
  'villa',
  'car',
  'sea',
  'carFactory',
  'bus',
  'trees',
] as const;

export type ShapeName = (typeof SHAPES)[number];
export type ShapeKind = ShapeName;

/** Reverse map: canvas shape name → condition kind (A/B/C/D).
 *  Matches the quota buckets in quotaSpecification.ts.
 *  Used by the render loop to resolve per-condition liveAvg. */
export const SHAPE_TO_COND: Record<ShapeName, ConditionKind> = {
  sun: 'A', bus: 'A', clouds: 'A',
  snow: 'B', trees: 'B', villa: 'B',
  power: 'C', house: 'C',
  sea: 'D', carFactory: 'D', car: 'D',
} as const;
