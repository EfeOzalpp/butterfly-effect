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
    snow: { separation: 2 },

    house: { separation: 8 },
    villa: { separation: 8 },
    power: { separation: 8 },
    carFactory: { separation: 7 },

    car: { separation: 5 },
    bus: { separation: 5 },

    sea: { separation: 7 },
    trees: { separation: 6 },
  },

  questionnaire: {
    sun: { separation: 7 },
    clouds: { separation: 6 },
    snow: { separation: 4 },

    house: { separation: 6 },
    villa: { separation: 6 },
    power: { separation: 6 },
    carFactory: { separation: 6 },

    car: { separation: 3 },
    bus: { separation: 4 },

    sea: { separation: 5 },
    trees: { separation: 5 },
  },

  city: {
    sun: { separation: 5 },
    clouds: { separation: 5 },
    snow: { separation: 6 },

    house: { separation: 7 },
    villa: { separation: 4 },
    power: { separation: 5 },
    carFactory: { separation: 5 },

    car: { separation: 6 },
    bus: { separation: 6 },

    sea: { separation: 5 },
    trees: { separation: 5 },
  },
} as const;

// ---------------- LOW-LEVEL LOOKUP ----------------

export function separationOf(table: SeparationMetaByShape, shape?: ShapeName): number {
  if (!shape) return 0;
  return table[shape]?.separation ?? 0;
}
