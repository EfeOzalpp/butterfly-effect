// src/canvas-engine/adjustable-rules/placement-rules/city.ts

import type { ScenePlacementRules } from "./helpers";

export const CITY_PLACEMENTS: ScenePlacementRules = {
  // ── Sky ──────────────────────────────────────────────────────────────────
  sun: {
    zones: [
      { verticalK: [0.0, 0.24], count: { mobile: 1, tablet: 2, laptop: 3 } },
    ],
  },

  clouds: {
    zones: [
      { verticalK: [0.02, 0.42], count: { mobile: 3, tablet: 5, laptop: 8 } },
    ],
  },

  snow: {
    zones: [
      { verticalK: [0.08, 0.52], count: { mobile: 1, tablet: 2, laptop: 4 } },
    ],
  },

  bus: {
    zones: [
      { verticalK: [0.7, 0.88], count: { mobile: 2, tablet: 3, laptop: 5 } },
    ],
  },

  // ── Built environment ────────────────────────────────────────────────────
  house: {
    zones: [
      { verticalK: [0.44, 0.72], count: { mobile: 4, tablet: 6, laptop: 10 } },
    ],
  },

  villa: {
    zones: [
      { verticalK: [0.48, 0.78], count: { mobile: 2, tablet: 4, laptop: 7 } },
    ],
  },

  power: {
    zones: [
      { verticalK: [0.42, 0.72], count: { mobile: 3, tablet: 5, laptop: 8 } },
    ],
  },

  carFactory: {
    zones: [
      { verticalK: [0.54, 0.82], count: { mobile: 2, tablet: 3, laptop: 5 } },
    ],
  },

  // ── Nature ───────────────────────────────────────────────────────────────
  trees: {
    zones: [
      { verticalK: [0.58, 0.88], count: { mobile: 4, tablet: 7, laptop: 12 } },
    ],
  },

  // ── Foreground ───────────────────────────────────────────────────────────
  car: {
    zones: [
      { verticalK: [0.72, 0.9], count: { mobile: 3, tablet: 5, laptop: 8 } },
    ],
  },

  sea: {
    zones: [
      { verticalK: [0.76, 0.94], count: { mobile: 2, tablet: 3, laptop: 5 } },
    ],
  },
};
