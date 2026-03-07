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
    sun: { separation: 17 },
    clouds: { separation: 7 },
    snow: { separation: 5 },

    house: { separation: 3 },
    villa: { separation: 5 },
    power: { separation: 3 },
    carFactory: { separation: 5 },

    car: { separation: 5 },
    bus: { separation: 5 },

    sea: { separation: 5 },
    trees: { separation: 5 },
  },

  questionnaire: null,
  sectionOpen: null,

  overlay: {
    sun: { separation: 6 },
    clouds: { separation: 6 },
    snow: { separation: 6 },

    house: { separation: 7 },
    villa: { separation: 7 },
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