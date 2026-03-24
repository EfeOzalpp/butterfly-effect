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
    sun: { separation: 3 },
    clouds: { separation: 16 },
    snow: { separation: 8 },

    house: { separation: 2 },
    villa: { separation: 3 },
    power: { separation: 2 },
    carFactory: { separation: 2 },

    car: { separation: 3 },
    bus: { separation: 4 },

    sea: { separation: 1},
    trees: { separation: 3 },
  },

  questionnaire: {
    sun: { separation: 7 },
    clouds: { separation: 5 },
    snow: { separation: 6 },

    house: { separation: 2 },
    villa: { separation: 3 },
    power: { separation: 7 },
    carFactory: { separation: 6 },

    car: { separation: 5 },
    bus: { separation: 5 },

    sea: { separation: 5 },
    trees: { separation: 5 },
  },

  city: {
    sun: { separation: 7 },
    clouds: { separation: 9 },
    snow: { separation: 5 },

    house: { separation: 5 },
    villa: { separation: 5 },
    power: { separation: 4 },
    carFactory: { separation: 4 },

    car: { separation: 4 },
    bus: { separation: 5 },

    sea: { separation: 6 },
    trees: { separation: 4 },
  },
} as const;

// ---------------- LOW-LEVEL LOOKUP ----------------

export function separationOf(table: SeparationMetaByShape, shape?: ShapeName): number {
  if (!shape) return 0;
  return table[shape]?.separation ?? 0;
}
