// src/canvas-engine/adjustable-rules/quotaSpecification.ts

import type { ConditionKind, ShapeName } from "./shapeCatalog";
import type { SceneLookupKey } from "./sceneMode";

export type Quota = number | null;
export type Limits = Partial<Record<ShapeName, Quota>>;

export type QuotaAnchor = { t: number; limits: Limits };

// readonly array so `as const` tables are assignable
export type QuotaSpecificationByKind = Record<ConditionKind, readonly QuotaAnchor[]>;

// ---------------- TABLE (by SceneLookupKey) ----------------
// `null` means: no override / caller should fall back to base mode table.
export const QUOTA_SPECIFICATION: Record<SceneLookupKey, QuotaSpecificationByKind | null> = {
  start: {
    A: [
      { t: 0.0, limits: { sun: 1, bus: 0, clouds: null } },
      { t: 1.0, limits: { sun: 3, bus: 3, clouds: null } },
    ],
    B: [
      { t: 0.0, limits: { snow: 1, trees: 3, villa: null } },
      { t: 1.0, limits: { snow: 2, trees: 3, villa: null } },
    ],
    C: [
      { t: 0.0, limits: { power: 3, house: null } },
      { t: 1.0, limits: { power: 2, house: null } },
    ],
    D: [
      { t: 0.0, limits: { sea: 1, carFactory: 2, car: null } },
      { t: 1.0, limits: { sea: 1, carFactory: 1, car: null } },
    ],
  },

  questionnaire: null,

  overlay: {
    A: [
      { t: 0.0, limits: { sun: 4, bus: 5, clouds: null } },
      { t: 1.0, limits: { sun: 6, bus: 9, clouds: null } },
    ],
    B: [
      { t: 0.0, limits: { snow: 1, trees: 4, villa: null } },
      { t: 1.0, limits: { snow: 5, trees: 10, villa: null } },
    ],
    C: [
      { t: 0.0, limits: { power: 9, house: null } },
      { t: 1.0, limits: { power: 6, house: null } },
    ],
    D: [
      { t: 0.0, limits: { sea: 5, carFactory: 6, car: null } },
      { t: 1.0, limits: { sea: 8, carFactory: 3, car: null } },
    ],
  },
} as const;