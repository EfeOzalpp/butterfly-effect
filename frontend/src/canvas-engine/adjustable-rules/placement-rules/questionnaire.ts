// src/canvas-engine/adjustable-rules/placement-rules/questionnaire.ts
// Overrides applied on top of the base mode when questionnaire is open.
// Wide bands and moderate counts — shapes fill available space loosely.

import type { ScenePlacementRules } from "./helpers";

export const QUESTIONNAIRE_PLACEMENTS: ScenePlacementRules = {
  // ── Sky ────────────────────────────────────────────────────────────────────

  sun: {
    zones: [
      { verticalK: [0.1, 0.13], horizontalK: [0.15, 0.17],
        count: { mobile: 0, tablet: 1, laptop: 1 } },

      // mobile 
      { verticalK: [0.02, 0.04], horizontalK: [0.02, 0.05],
        count: { mobile: 1, tablet: 0, laptop: 0 } },
    ],
  },

  clouds: {
    quota: [{ t: 0, pct: 20 }, { t: 1, pct: 88 }],
    zones: [

      // left sky
      { verticalK: [0.01, 0.03], horizontalK: [0.07, 0.1],
        count: { mobile: 0, tablet: 1, laptop: 1 } },
      { verticalK: [0.03, 0.06], horizontalK: [0.08, 0.11],
        count: { mobile: 0, tablet: 1, laptop: 1 } },
      { verticalK: [0.06, 0.09], horizontalK: [0.1, 0.13],
        count: { mobile: 0, tablet: 1, laptop: 1 } },

      // mid sky
      { verticalK: [0.02, 0.06], horizontalK: [0.46, 0.54],
        count: { mobile: 0, tablet: 1, laptop: 1 } },
      { verticalK: [0.05, 0.09], horizontalK: [0.53, 0.59],
        count: { mobile: 0, tablet: 1, laptop: 1 } },

      // mobile only
      { verticalK: [0.18, 0.22], horizontalK: [0.03, 0.1],
        count: { mobile: 1, tablet: 1, laptop: 0 } },
      { verticalK: [0.21, 0.25], horizontalK: [0.09, 0.15],
        count: { mobile: 1, tablet: 1, laptop: 0 } },

      { verticalK: [0.02, 0.05], horizontalK: [0.78, 0.84],
        count: { mobile: 1, tablet: 1, laptop: 0 } },
      { verticalK: [0.04, 0.08], horizontalK: [0.73, 0.8],
        count: { mobile: 1, tablet: 1, laptop: 0 } },

      // far left ground
      { verticalK: [0.55, 0.58], horizontalK: [0.1, 0.14],
        count: { mobile: 0, tablet: 1, laptop: 1 } },

      // far right ground
      { verticalK: [0.58, 0.6], horizontalK: [0.85, 0.89],
        count: { mobile: 0, tablet: 1, laptop: 1 } },
      { verticalK: [0.6, 0.62], horizontalK: [0.88, 0.92],
        count: { mobile: 0, tablet: 1, laptop: 1 } },
      { verticalK: [0.63, 0.65], horizontalK: [0.91, 0.96],
        count: { mobile: 0, tablet: 1, laptop: 1 } },

      // right sky
      { verticalK: [0.06, 0.09], horizontalK: [0.71, 0.76],
        count: { mobile: 0, tablet: 1, laptop: 1 } },

      { verticalK: [0.03, 0.06], horizontalK: [0.86, 0.91],
        count: { mobile: 1, tablet: 1, laptop: 1 } },
      { verticalK: [0.06, 0.09], horizontalK: [0.89, 0.93],
        count: { mobile: 0, tablet: 1, laptop: 1 } },
      { verticalK: [0.1, 0.14], horizontalK: [0.84, 0.89],
        count: { mobile: 0, tablet: 1, laptop: 1 } },
    ],
  },

  snow: {
    quota: [{ t: 0, pct: 80 }, { t: 1, pct: 48 }],
    zones: [
      // right top
      { verticalK: [0.11, 0.16], horizontalK: [0.71, 0.85],
        count: { mobile: 0, tablet: 1, laptop: 1 } },

      // mobile only
      { verticalK: [0.11, 0.16], horizontalK: [0.56, 0.67],
        count: { mobile: 1, tablet: 1, laptop: 0 } },

      // mid
      { verticalK: [0.74, 0.79], horizontalK: [0.38, 0.46],
        count: { mobile: 1, tablet: 2, laptop: 1 } },
      { verticalK: [0.21, 0.22], horizontalK: [0.48, 0.54],
        count: { mobile: 0, tablet: 1, laptop: 1 } },

      // left top
      { verticalK: [0.08, 0.11], horizontalK: [0.21, 0.31],
        count: { mobile: 0, tablet: 1, laptop: 1 } },
      { verticalK: [0.14, 0.16], horizontalK: [0.28, 0.34],
        count: { mobile: 0, tablet: 1, laptop: 1 } },
      { verticalK: [0.19, 0.21], horizontalK: [0.06, 0.11],
        count: { mobile: 0, tablet: 1, laptop: 1 } },
    ],
  },

  // ── Left residential community ─────────────────────────────────────────────

  villa: {
    quota: [{ t: 0, pct: 75 }, { t: 1, pct: 56 }],
    zones: [
      // right close
      { verticalK: [0.74, 0.76], horizontalK: [0.85, 0.88],
        count: { mobile: 1, tablet: 2, laptop: 1 } },
      { verticalK: [0.84, 0.87], horizontalK: [0.84, 0.94],
        count: { mobile: 1, tablet: 2, laptop: 1 } },
      { verticalK: [0.84, 0.87], horizontalK: [0.74, 0.81],
        count: { mobile: 1, tablet: 2, laptop: 1 } },
      { verticalK: [0.79, 0.81], horizontalK: [0.76, 0.79],
        count: { mobile: 0, tablet: 2, laptop: 1 } },
      { verticalK: [0.74, 0.79], horizontalK: [0.79, 0.84],
        count: { mobile: 0, tablet: 2, laptop: 1 } },

      // mobile addition
      { verticalK: [0.89, 0.95], horizontalK: [0.64, 0.73],
        count: { mobile: 1, tablet: 1, laptop: 0 } },
      { verticalK: [0.79, 0.89], horizontalK: [0.06, 0.21],
        count: { mobile: 1, tablet: 2, laptop: 0 } },
      { verticalK: [0.56, 0.66], horizontalK: [0.46, 0.64],
        count: { mobile: 1, tablet: 1, laptop: 0 } },
      { verticalK: [0.51, 0.61], horizontalK: [0.24, 0.34],
        count: { mobile: 1, tablet: 1, laptop: 0 } },
      { verticalK: [0.66, 0.76], horizontalK: [0.54, 0.64],
        count: { mobile: 1, tablet: 1, laptop: 0 } },
      { verticalK: [0.61, 0.66], horizontalK: [0.24, 0.34],
        count: { mobile: 2, tablet: 1, laptop: 0 } },

      // right bottom
      { verticalK: [0.51, 0.56], horizontalK: [0.89, 0.95],
        count: { mobile: 1, tablet: 2, laptop: 1 } },
      { verticalK: [0.56, 0.61], horizontalK: [0.9, 0.96],
        count: { mobile: 1, tablet: 2, laptop: 1 } },
      { verticalK: [0.61, 0.62], horizontalK: [0.94, 1.0],
        count: { mobile: 1, tablet: 2, laptop: 1 } },

      // mid far
      { verticalK: [0.49, 0.54], horizontalK: [0.44, 0.54],
        count: { mobile: 0, tablet: 2, laptop: 3 } },
      { verticalK: [0.49, 0.51], horizontalK: [0.74, 0.79],
        count: { mobile: 0, tablet: 2, laptop: 2 } },
      { verticalK: [0.44, 0.49], horizontalK: [0.26, 0.36],
        count: { mobile: 0, tablet: 2, laptop: 2 } },

      // mid close
      { verticalK: [0.74, 0.79], horizontalK: [0.39, 0.46],
        count: { mobile: 0, tablet: 1, laptop: 2 } },
      { verticalK: [0.79, 0.81], horizontalK: [0.34, 0.44],
        count: { mobile: 0, tablet: 1, laptop: 2 } },

      { verticalK: [0.56, 0.61], horizontalK: [0.34, 0.44],
        count: { mobile: 1, tablet: 1, laptop: 2 } },

      { verticalK: [0.56, 0.61], horizontalK: [0.56, 0.66],
        count: { mobile: 1, tablet: 1, laptop: 3 } },

      // left mid
      { verticalK: [0.69, 0.74], horizontalK: [0.09, 0.12],
        count: { mobile: 1, tablet: 1, laptop: 1 } },

      // left far
      { verticalK: [0.46, 0.51], horizontalK: [0.33, 0.38],
        count: { mobile: 0, tablet: 1, laptop: 3 } },
      { verticalK: [0.59, 0.61], horizontalK: [0.0, 0.11],
        count: { mobile: 1, tablet: 2, laptop: 2 } },
    ],
  },

  house: {
    quota: [{ t: 0, pct: 25 }, { t: 1, pct: 94 }],
    zones: [
      // left mid community
      { verticalK: [0.69, 0.74], horizontalK: [0.04, 0.1],
        count: { mobile: 0, tablet: 1, laptop: 1 } },
      { verticalK: [0.61, 0.66], horizontalK: [0.14, 0.2],
        count: { mobile: 1, tablet: 1, laptop: 1 } },
      { verticalK: [0.66, 0.77], horizontalK: [0.11, 0.15],
        count: { mobile: 1, tablet: 1, laptop: 1 } },
      { verticalK: [0.49, 0.51], horizontalK: [0.03, 0.09],
        count: { mobile: 0, tablet: 1, laptop: 1 } },
      
      // mid close
      { verticalK: [0.69, 0.74], horizontalK: [0.44, 0.53],
        count: { mobile: 0, tablet: 1, laptop: 1 } },
      
      // mobile addition
      { verticalK: [0.89, 0.91], horizontalK: [0.79, 0.88],
        count: { mobile: 1, tablet: 1, laptop: 0 } },
      { verticalK: [0.56, 0.64], horizontalK: [0.54, 0.59],
        count: { mobile: 1, tablet: 1, laptop: 0 } },

      // right far community
      { verticalK: [0.49, 0.51], horizontalK: [0.89, 0.94],
        count: { mobile: 1, tablet: 1, laptop: 3 } },

      // right close community
      { verticalK: [0.71, 0.79], horizontalK: [0.79, 0.9],
        count: { mobile: 1, tablet: 1, laptop: 1 } },
    ],
  },

  // ── Right industrial pocket ────────────────────────────────────────────────

  power: {
    quota: [{ t: 0, pct: 30 }, { t: 1, pct: 78 }],
    zones: [
      // right close community
      { verticalK: [0.64, 0.69], horizontalK: [0.79, 0.84],
        count: { mobile: 0, tablet: 2, laptop: 1 } },

      // mobile only
      { verticalK: [0.79, 0.88], horizontalK: [0.69, 0.79],
        count: { mobile: 1, tablet: 2, laptop: 0 } },

      // far left
      { verticalK: [0.44, 0.46], horizontalK: [0.79, 0.88],
        count: { mobile: 1, tablet: 1, laptop: 1 } },

      { verticalK: [0.61, 0.69], horizontalK: [0.04, 0.09],
        count: { mobile: 1, tablet: 1, laptop: 1 } },

      { verticalK: [0.59, 0.64], horizontalK: [0.94, 1],
        count: { mobile: 1, tablet: 1, laptop: 1 } },
    ],
  },

  carFactory: {
    quota: [{ t: 0, pct: 5 }, { t: 1, pct: 14 }],
    zones: [
      // left mid community
      { verticalK: [0.74, 0.76], horizontalK: [0.11, 0.16],
        count: { mobile: 0, tablet: 1, laptop: 3 } },

      // mobile
      { verticalK: [0.79, 0.84], horizontalK: [0.22, 0.31],
        count: { mobile: 2, tablet: 0, laptop: 0 } },
    ],
  },

  // ── Trees — border both communities and fill center gap ───────────────────

  trees: {
    quota: [{ t: 0, pct: 90 }, { t: 1, pct: 54 }],
    zones: [
      // right close
      { verticalK: [0.94, 1], horizontalK: [0.79, 0.89],
        count: { mobile: 1, tablet: 2, laptop: 3 } },
      { verticalK: [0.84, 0.86], horizontalK: [0.74, 0.84],
        count: { mobile: 1, tablet: 2, laptop: 2 } },
      { verticalK: [0.74, 0.76], horizontalK: [0.69, 0.76],
        count: { mobile: 1, tablet: 2, laptop: 2 } },
      { verticalK: [0.79, 0.81], horizontalK: [0.71, 0.79],
        count: { mobile: 1, tablet: 2, laptop: 3 } },
      { verticalK: [0.69, 0.71], horizontalK: [0.71, 0.74],
        count: { mobile: 1, tablet: 2, laptop: 1 } },

      // mobile only
      { verticalK: [0.91, 0.95], horizontalK: [0.01, 0.1],
        count: { mobile: 1, tablet: 2, laptop: 0 } },
      { verticalK: [0.66, 0.71], horizontalK: [0.49, 0.69],
        count: { mobile: 6, tablet: 1, laptop: 0 } },
      { verticalK: [0.94, 1], horizontalK: [0.14, 0.24],
        count: { mobile: 2, tablet: 1, laptop: 0 } },
      { verticalK: [0.51, 0.56], horizontalK: [0.14, 0.24],
        count: { mobile: 7, tablet: 1, laptop: 0 } },
      { verticalK: [0.61, 0.66], horizontalK: [0.79, 0.94],
        count: { mobile: 7, tablet: 1, laptop: 0 } },

      // right far
      { verticalK: [0.66, 0.71], horizontalK: [0.94, 1],
        count: { mobile: 1, tablet: 2, laptop: 5 } },
      { verticalK: [0.61, 0.66], horizontalK: [0.89, 1],
        count: { mobile: 1, tablet: 2, laptop: 5 } },
      { verticalK: [0.56, 0.61], horizontalK: [0.84, 0.9],
        count: { mobile: 1, tablet: 2, laptop: 5 } },
      { verticalK: [0.51, 0.56], horizontalK: [0.69, 0.79],
        count: { mobile: 1, tablet: 2, laptop: 5 } },

      // mid far
      { verticalK: [0.69, 0.71], horizontalK: [0.59, 0.63],
        count: { mobile: 1, tablet: 2, laptop: 2 } },
      { verticalK: [0.64, 0.66], horizontalK: [0.51, 0.63],
        count: { mobile: 1, tablet: 2, laptop: 4 } },
      { verticalK: [0.59, 0.61], horizontalK: [0.49, 0.59],
        count: { mobile: 1, tablet: 2, laptop: 6 } },
      { verticalK: [0.54, 0.56], horizontalK: [0.49, 0.64],
        count: { mobile: 0, tablet: 2, laptop: 6 } },

      { verticalK: [0.51, 0.56], horizontalK: [0.16, 0.35],
        count: { mobile: 0, tablet: 2, laptop: 2 } },
      { verticalK: [0.56, 0.66], horizontalK: [0.21, 0.44],
        count: { mobile: 1, tablet: 2, laptop: 3 } },
      { verticalK: [0.61, 0.66], horizontalK: [0.26, 0.49],
        count: { mobile: 1, tablet: 2, laptop: 5 } },
      { verticalK: [0.64, 0.66], horizontalK: [0.26, 0.48],
        count: { mobile: 0, tablet: 2, laptop: 3 } },

      // mid close
      { verticalK: [0.79, 0.89], horizontalK: [0.29, 0.44],
        count: { mobile: 1, tablet: 2, laptop: 3 } },
      { verticalK: [0.84, 0.87], horizontalK: [0.34, 0.37],
        count: { mobile: 1, tablet: 2, laptop: 2 } },
      { verticalK: [0.81, 0.86], horizontalK: [0.39, 0.49],
        count: { mobile: 1, tablet: 2, laptop: 1 } },
      { verticalK: [0.84, 0.87], horizontalK: [0.31, 0.34],
        count: { mobile: 1, tablet: 2, laptop: 1 } },
      { verticalK: [0.89, 0.91], horizontalK: [0.41, 0.46],
        count: { mobile: 1, tablet: 2, laptop: 2 } },

      // left far
      { verticalK: [0.51, 0.56], horizontalK: [0.21, 0.34],
        count: { mobile: 1, tablet: 2, laptop: 6 } },
      { verticalK: [0.54, 0.56], horizontalK: [0.21, 0.39],
        count: { mobile: 1, tablet: 2, laptop: 3 } },
      { verticalK: [0.62, 0.64], horizontalK: [0.0, 0.09],
        count: { mobile: 1, tablet: 2, laptop: 4 } },
      { verticalK: [0.66, 0.71], horizontalK: [0.04, 0.14],
        count: { mobile: 1, tablet: 2, laptop: 5 } },
      { verticalK: [0.74, 0.79], horizontalK: [0.14, 0.19],
        count: { mobile: 1, tablet: 2, laptop: 3 } },
      { verticalK: [0.84, 0.86], horizontalK: [0.1, 0.15],
        count: { mobile: 0, tablet: 2, laptop: 2 } },
      { verticalK: [0.64, 0.74], horizontalK: [0.03, 0.09],
        count: { mobile: 1, tablet: 2, laptop: 2 } },
      { verticalK: [0.56, 0.64], horizontalK: [0.01, 0.05],
        count: { mobile: 0, tablet: 2, laptop: 2 } },
      { verticalK: [0.51, 0.61], horizontalK: [0.0, 0.05],
        count: { mobile: 0, tablet: 2, laptop: 8 } },
      { verticalK: [0.49, 0.51], horizontalK: [0.0, 0.04],
        count: { mobile: 0, tablet: 2, laptop: 3 } }, 
    ],
  },

  // ── Street level ──────────────────────────────────────────────────────────

  bus: {
    quota: [{ t: 0, pct: 40 }, { t: 1, pct: 168 }],
    zones: [
      // right closer community
      { verticalK: [0.84, 0.86], horizontalK: [0.79, 0.98],
        count: { mobile: 1, tablet: 1, laptop: 2 } },

      // left mid
      { verticalK: [0.69, 0.74], horizontalK: [0.04, 0.11],
        count: { mobile: 1, tablet: 1, laptop: 1 } },

      // mobile only
      { verticalK: [0.74, 0.79], horizontalK: [0.21, 0.39],
        count: { mobile: 1, tablet: 0, laptop: 0 } },
    ],
  },

  car: {
    quota: [{ t: 0, pct: 80 }, { t: 1, pct: 20 }],
    zones: [
      // right close
      { verticalK: [0.84, 0.86], horizontalK: [0.69, 0.74],
        count: { mobile: 1, tablet: 1, laptop: 1 } },

      // mobile only
      { verticalK: [0.89, 0.94], horizontalK: [0.74, 0.79],
        count: { mobile: 1, tablet: 1, laptop: 0 } },

      // mid close
      { verticalK: [0.79, 0.84], horizontalK: [0.44, 0.49],
        count: { mobile: 1, tablet: 1, laptop: 1 } },
      { verticalK: [0.79, 0.84], horizontalK: [0.29, 0.34],
        count: { mobile: 0, tablet: 1, laptop: 1 } },

      // left close
      { verticalK: [0.74, 0.84], horizontalK: [0.12, 0.15],
        count: { mobile: 1, tablet: 1, laptop: 0 } },
      { verticalK: [0.79, 0.84], horizontalK: [0.06, 0.1],
        count: { mobile: 1, tablet: 1, laptop: 1 } },
    ],
  },

  sea: {
    quota: [{ t: 0, pct: 20 }, { t: 1, pct: 128 }],
    zones: [
      // far right
      { verticalK: [0.79, 0.84], horizontalK: [0.68, 0.72],
        count: { mobile: 1, tablet: 1, laptop: 1 } },

      // mobile only
      { verticalK: [0.91, 0.95], horizontalK: [0.22, 0.38],
        count: { mobile: 1, tablet: 1, laptop: 0 } },
    ],
  },
};