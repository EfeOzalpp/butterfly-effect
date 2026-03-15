// src/canvas-engine/adjustable-rules/quotaSpecification.ts

import type { ConditionKind, ShapeName } from "./shapeCatalog";

export type Quota = number | null;
export type Limits = Partial<Record<ShapeName, Quota>>;

export type QuotaAnchor = { t: number; limits: Limits };

// readonly array so `as const` tables are assignable
export type QuotaSpecificationByKind = Record<ConditionKind, readonly QuotaAnchor[]>;

const START_QUOTA_SPEC: QuotaSpecificationByKind = {
  A: [
    { t: 0.0, limits: { sun: 1, bus: 0, clouds: null } },
    { t: 1.0, limits: { sun: 1, bus: 4, clouds: null } },
  ],
  B: [
    { t: 0.0, limits: { villa: 2, trees: 3, snow: null } },
    { t: 1.0, limits: { villa: 5, trees: 3, snow: null } },
  ],
  C: [
    { t: 0.0, limits: { power: 3, house: null } },
    { t: 1.0, limits: { power: 2, house: null } },
  ],
  D: [
    { t: 0.0, limits: { sea: 1, carFactory: 2, car: null } },
    { t: 1.0, limits: { sea: 3, carFactory: 1, car: null } },
  ],
};

const QUESTIONNAIRE_QUOTA_SPEC: QuotaSpecificationByKind = {
  A: [
    { t: 0.0, limits: { sun: 1, bus: 1, clouds: null } },
    { t: 1.0, limits: { sun: 1, clouds: 4, bus: null } },
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
      { t: 0.0, limits: { sun: 4, bus: 5, clouds: null } },
      { t: 1.0, limits: { sun: 6, bus: 4, clouds: null } },
    ],
    B: [
      { t: 0.0, limits: { snow: 1, trees: 4, villa: null } },
      { t: 1.0, limits: { snow: 3, trees: 6, villa: null } },
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
} as const satisfies Record<"start" | "questionnaire" | "city", QuotaSpecificationByKind | null>;
