// src/canvas-engine/adjustable-rules/quotaSpecification.ts

import type { ConditionKind, ShapeName } from "./shapeCatalog";

export type Quota = number | null;
export type Limits = Partial<Record<ShapeName, Quota>>;

export type QuotaAnchor = { t: number; limits: Limits };

// readonly array so `as const` tables are assignable
export type QuotaSpecificationByKind = Record<ConditionKind, readonly QuotaAnchor[]>;

const START_QUOTA_SPEC: QuotaSpecificationByKind = {
  A: [
    { t: 0.0, limits: { sun: 1, bus: 1, clouds: 2 } },
    { t: 1.0, limits: { sun: 1, bus: 1, clouds: 2 } },
  ],
  B: [
    { t: 0.0, limits: { villa: 9, trees: 9, snow: 2 } },
    { t: 1.0, limits: { villa: 9, trees: 9, snow: 2 } },
  ],
  C: [
    { t: 0.0, limits: { power: 2, house: 10 } },
    { t: 1.0, limits: { power: 2, house: 10 } },
  ],
  D: [
    { t: 0.0, limits: { sea: 1, carFactory: 1, car: 3 } },
    { t: 1.0, limits: { sea: 1, carFactory: 1, car: 3 } },
  ],
};

const QUESTIONNAIRE_QUOTA_SPEC: QuotaSpecificationByKind = {
  A: [
    { t: 0.0, limits: { sun: 1, bus: 1, clouds: null } },
    { t: 1.0, limits: { sun: 1, bus: 4, clouds: null } },
  ],
  B: [
    { t: 0.0, limits: { snow: 2, trees: 2, villa: null } },
    { t: 1.0, limits: { snow: 4, trees: 5, villa: null } },
  ],
  C: [
    { t: 0.0, limits: { power: 2, house: null } },
    { t: 1.0, limits: { power: 4, house: null } },
  ],
  D: [
    { t: 0.0, limits: { sea: 2, carFactory: 1, car: null } },
    { t: 1.0, limits: { sea: 4, carFactory: 3, car: null } },
  ],
};

// ---------------- TABLE (by SceneLookupKey) ----------------
// `null` means: no override / caller should fall back to base mode table.
export const QUOTA_SPECIFICATION = {
  start: START_QUOTA_SPEC,

  questionnaire: QUESTIONNAIRE_QUOTA_SPEC,

  city: {
    A: [
      { t: 0.0, limits: { sun: 3, bus: 3, clouds: 4 } },
      { t: 1.0, limits: { sun: 5, bus: 6, clouds: 2 } },
    ],
    B: [
      { t: 0.0, limits: { snow: 1, trees: 5, villa: 2 } },
      { t: 1.0, limits: { snow: 2, trees: 8, villa: 5 } },
    ],
    C: [
      { t: 0.0, limits: { power: 7, house: 5 } },
      { t: 1.0, limits: { power: 4, house: 8 } },
    ],
    D: [
      { t: 0.0, limits: { sea: 3, carFactory: 4, car: 5 } },
      { t: 1.0, limits: { sea: 7, carFactory: 2, car: 8 } },
    ],
  },
} as const satisfies Record<"start" | "questionnaire" | "city", QuotaSpecificationByKind | null>;
