// src/canvas-engine/scene-rules/shapeCatalog.ts

// condition ids are the stable buckets the scoring/data layer gives us.
export const CONDITION_KINDS = ['A', 'B', 'C', 'D'] as const;
export type ConditionKind = (typeof CONDITION_KINDS)[number];

// shape names are the drawable assets the canvas engine can place.
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
