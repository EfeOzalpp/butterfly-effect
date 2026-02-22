// src/canvas-engine/adjustable-rules/separationMeta.ts

import type { ShapeName } from "./shapeCatalog";
import type { SceneLookupKey } from "./sceneMode";

/**
 * separation: soft minimum distance (in cells) from other shapes
 * 0/undefined means "no spacing preference"
 */
export type SeparationMeta = {
  separation?: number;
};

export type SeparationMetaByShape = Record<ShapeName, SeparationMeta>;

// Single table keyed by resolved lookup key.
// `null` means: "no override / use base mode's table".
export type SeparationMetaByMode = Record<SceneLookupKey, SeparationMetaByShape | null>;

export const SEPARATION_META: SeparationMetaByMode = {
  start: {
    sun: { separation: 1 },
    clouds: { separation: 2 },
    snow: { separation: 3 },

    house: { separation: 2 },
    villa: { separation: 1 },
    power: { separation: 1 },
    carFactory: { separation: 2 },

    car: { separation: 2 },
    bus: { separation: 2 },

    sea: { separation: 0 },
    trees: { separation: 1 },
  },

  questionnaire: null,

  overlay: {
    sun: { separation: 6 },
    clouds: { separation: 4 },
    snow: { separation: 4 },

    house: { separation: 3 },
    villa: { separation: 3 },
    power: { separation: 3 },
    carFactory: { separation: 3 },

    car: { separation: 2 },
    bus: { separation: 2 },

    sea: { separation: 0 },
    trees: { separation: 1 },
  },
} as const;

// ---------------- LOW-LEVEL LOOKUP ----------------

export function separationOf(table: SeparationMetaByShape, shape?: ShapeName): number {
  if (!shape) return 0;
  return table[shape]?.separation ?? 0;
}