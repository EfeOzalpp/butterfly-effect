// src/canvas-engine/adjustable-rules/placement-rules/questionnaire.ts
// Overrides applied on top of the base mode when questionnaire is open.

import type { ScenePlacementRules } from "./helpers";

export const QUESTIONNAIRE_PLACEMENTS: ScenePlacementRules =  {

  sun: {
    zones: [
      { verticalK: [0.1, 0.13], horizontalK: [0.83, 0.85],
        count: { mobile: 0, tablet: 0, laptop: 1 } },

      // tablet
      { verticalK: [0.12, 0.16], horizontalK: [0.83, 0.85],
        count: { mobile: 0, tablet: 1, laptop: 0 } },

      // mobile
      { verticalK: [0.02, 0.04], horizontalK: [0.95, 0.98],
        count: { mobile: 1, tablet: 0, laptop: 0 } },
    ],
  },

  clouds: {
    quota: [{ t: 0, pct: 20 }, { t: 1, pct: 88 }],
    zones: [
      {
        verticalK: [0.01, 0.03],
        horizontalK: [0.88, 0.9],
        count: { mobile: 0, tablet: 1, laptop: 1 },
      },
      {
        verticalK: [0.03, 0.06],
        horizontalK: [0.9, 0.92],
        count: { mobile: 0, tablet: 1, laptop: 1 },
      },
      {
        verticalK: [0.1, 0.12],
        horizontalK: [0.93, 0.97],
        count: { mobile: 0, tablet: 1, laptop: 1 },
      },
      {
        verticalK: [0.06, 0.09],
        horizontalK: [0.7, 0.8],
        count: { mobile: 0, tablet: 1, laptop: 1 },
      },
      {
        verticalK: [0.01, 0.03],
        horizontalK: [0.26, 0.34],
        count: { mobile: 0, tablet: 1, laptop: 1 },
      },
      {
        verticalK: [0.03, 0.08],
        horizontalK: [0.34, 0.38],
        count: { mobile: 0, tablet: 1, laptop: 1 },
      },
      {
        verticalK: [0.18, 0.22],
        horizontalK: [0.9, 0.97],
        count: { mobile: 1, tablet: 1, laptop: 0 },
      },
      {
        verticalK: [0.21, 0.25],
        horizontalK: [0.85, 0.91],
        count: { mobile: 1, tablet: 1, laptop: 0 },
      },
      {
        verticalK: [0.02, 0.05],
        horizontalK: [0.4, 0.55],
        count: { mobile: 1, tablet: 1, laptop: 0 },
      },
      {
        verticalK: [0.04, 0.08],
        horizontalK: [0.45, 0.5],
        count: { mobile: 1, tablet: 1, laptop: 0 },
      },
      {
        verticalK: [0.01, 0.04],
        horizontalK: [0.09, 0.14],
        count: { mobile: 0, tablet: 1, laptop: 1 },
      },
      {
        verticalK: [0.1, 0.14],
        horizontalK: [0.11, 0.16],
        count: { mobile: 0, tablet: 1, laptop: 1 },
      },
    ],
  },

  snow: {
    quota: [{ t: 0, pct: 80 }, { t: 1, pct: 48 }],
    zones: [
      {
        verticalK: [0.31, 0.36],
        horizontalK: [0.15, 0.29],
        count: { mobile: 0, tablet: 1, laptop: 1 },
      },
      {
        verticalK: [0.11, 0.16],
        horizontalK: [0.33, 0.44],
        count: { mobile: 1, tablet: 1, laptop: 0 },
      },
      {
        verticalK: [0.84, 0.89],
        horizontalK: [0.54, 0.62],
        count: { mobile: 1, tablet: 2, laptop: 1 },
      },
      {
        verticalK: [0.71, 0.72],
        horizontalK: [0.16, 0.22],
        count: { mobile: 0, tablet: 1, laptop: 1 },
      },
      {
        verticalK: [0.12, 0.14],
        horizontalK: [0.69, 0.79],
        count: { mobile: 0, tablet: 1, laptop: 1 },
      },
      {
        verticalK: [0.16, 0.2],
        horizontalK: [0.74, 0.79],
        count: { mobile: 0, tablet: 1, laptop: 1 },
      },
      {
        verticalK: [0.16, 0.2],
        horizontalK: [0.58, 0.64],
        count: { mobile: 0, tablet: 1, laptop: 1 },
      },
    ],
  },

  // ── Right residential community ────────────────────────────────────────────

  villa: {
    quota: [{ t: 0, pct: 75 }, { t: 1, pct: 50 }],
    zones: [
      // left close
      { verticalK: [0.75, 0.75], horizontalK: [0.12, 0.18],
        count: { mobile: 1, tablet: 0, laptop: 1 } },
      { verticalK: [0.85, 0.86], horizontalK: [0.08, 0.14],
        count: { mobile: 1, tablet: 0, laptop: 1 } },
      { verticalK: [0.85, 0.86], horizontalK: [0.23, 0.26],
        count: { mobile: 1, tablet: 0, laptop: 1 } },
      { verticalK: [0.8, 0.8], horizontalK: [0.23, 0.23],
        count: { mobile: 0, tablet: 1, laptop: 1 } },

      // tablet addition
      { verticalK: [0.85, 0.86], horizontalK: [0.4, 0.45],
        count: { mobile: 0, tablet: 1, laptop: 0 } },
      { verticalK: [0.85, 0.86], horizontalK: [0.15, 0.2],
        count: { mobile: 0, tablet: 1, laptop: 0 } },
      { verticalK: [0.95, 0.95], horizontalK: [0.25, 0.35],
        count: { mobile: 0, tablet: 1, laptop: 0 } },
      { verticalK: [0.85, 0.9], horizontalK: [0.75, 0.9],
        count: { mobile: 0, tablet: 1, laptop: 0 } },
      { verticalK: [0.55, 0.55], horizontalK: [0.75, 0.95],
        count: { mobile: 0, tablet: 2, laptop: 0 } },
      { verticalK: [0.50, 0.55], horizontalK: [0.45, 0.55],
        count: { mobile: 0, tablet: 3, laptop: 0 } },

      // mobile addition
      { verticalK: [0.9, 0.95], horizontalK: [0.26, 0.35],
        count: { mobile: 1, tablet: 0, laptop: 0 } },
      { verticalK: [0.8, 0.9], horizontalK: [0.8, 0.95],
        count: { mobile: 1, tablet: 0, laptop: 0 } },
      { verticalK: [0.50, 0.60], horizontalK: [0.35, 0.55],
        count: { mobile: 1, tablet: 0, laptop: 0 } },
      { verticalK: [0.45, 0.55], horizontalK: [0.65, 0.75],
        count: { mobile: 1, tablet: 0, laptop: 0 } },
      { verticalK: [0.60, 0.75], horizontalK: [0.35, 0.45],
        count: { mobile: 1, tablet: 0, laptop: 0 } },
      { verticalK: [0.55, 0.60], horizontalK: [0.65, 0.75],
        count: { mobile: 2, tablet: 0, laptop: 0 } },

      // left bottom
      { verticalK: [0.45, 0.50], horizontalK: [0.05, 0.08],
        count: { mobile: 1, tablet: 2, laptop: 1 } },
      { verticalK: [0.50, 0.55], horizontalK: [0.05, 0.1],
        count: { mobile: 1, tablet: 2, laptop: 1 } },
      { verticalK: [0.55, 0.55], horizontalK: [0.0, 0.05],
        count: { mobile: 1, tablet: 2, laptop: 1 } },

      // mid far
      { verticalK: [0.45, 0.50], horizontalK: [0.45, 0.5],
        count: { mobile: 0, tablet: 2, laptop: 3 } },

      // mid close
      { verticalK: [0.75, 0.8], horizontalK: [0.5, 0.56],
        count: { mobile: 0, tablet: 0, laptop: 1 } },
      { verticalK: [0.8, 0.8], horizontalK: [0.55, 0.65],
        count: { mobile: 0, tablet: 0, laptop: 2 } },
      { verticalK: [0.50, 0.55], horizontalK: [0.55, 0.65],
        count: { mobile: 1, tablet: 0, laptop: 2 } },
      { verticalK: [0.50, 0.55], horizontalK: [0.35, 0.4],
        count: { mobile: 1, tablet: 0, laptop: 3 } },

      // right mid
      { verticalK: [0.59, 0.67], horizontalK: [0.9, 0.92],
        count: { mobile: 1, tablet: 1, laptop: 1 } },
      { verticalK: [0.75, 0.75], horizontalK: [0.85, 0.9],
        count: { mobile: 0, tablet: 1, laptop: 1 } },

      // right far
      { verticalK: [0.55, 0.55], horizontalK: [0.9, 1.0],
        count: { mobile: 1, tablet: 0, laptop: 2 } },
    ],
  },

  house: {
    quota: [{ t: 0, pct: 25 }, { t: 1, pct: 100 }],
    zones: [
      // right mid community
      { verticalK: [0.7, 0.75], horizontalK: [0.94, 0.97],
        count: { mobile: 0, tablet: 0, laptop: 1 } },
      { verticalK: [0.55, 0.60], horizontalK: [0.79, 0.85],
        count: { mobile: 1, tablet: 0, laptop: 0 } },
      { verticalK: [0.60, 0.78], horizontalK: [0.86, 0.88],
        count: { mobile: 1, tablet: 0, laptop: 0 } },

      // mobile addition
      { verticalK: [0.9, 0.9], horizontalK: [0.1, 0.2],
        count: { mobile: 1, tablet: 0, laptop: 0 } },
      { verticalK: [0.50, 0.60], horizontalK: [0.4, 0.45],
        count: { mobile: 1, tablet: 0, laptop: 0 } },

      // tablet addition
      { verticalK: [0.60, 0.75], horizontalK: [0.9, 0.95],
        count: { mobile: 0, tablet: 1, laptop: 0 } },

      // left far community
      { verticalK: [0.45, 0.45], horizontalK: [0.0, 0.05],
        count: { mobile: 1, tablet: 1, laptop: 3 } },

      // left close community
      { verticalK: [0.7, 0.8], horizontalK: [0.08, 0.14],
        count: { mobile: 1, tablet: 1, laptop: 1 } },
    ],
  },

  // ── Left industrial pocket ─────────────────────────────────────────────────

  power: {
    quota: [{ t: 0, pct: 30 }, { t: 1, pct: 90 }],
    zones: [
      // left close community
      { verticalK: [0.60, 0.7], horizontalK: [0.2, 0.25],
        count: { mobile: 0, tablet: 1, laptop: 1 } },

      // mobile only
      { verticalK: [0.8, 0.9], horizontalK: [0.2, 0.3],
        count: { mobile: 1, tablet: 0, laptop: 0 } },

      // tablet only
      { verticalK: [0.60, 0.75], horizontalK: [0.75, 0.8],
        count: { mobile: 0, tablet: 1, laptop: 0 } },

      // far right
      { verticalK: [0.60, 0.75], horizontalK: [0.93, 0.97],
        count: { mobile: 1, tablet: 0, laptop: 1 } },
    ],
  },

  carFactory: {
    quota: [{ t: 0, pct: 5 }, { t: 1, pct: 20 }],
    zones: [
      // right mid community
      { verticalK: [0.72, 0.72], horizontalK: [0.9, 0.95],
        count: { mobile: 1, tablet: 1, laptop: 2 } },

      // mobile
      { verticalK: [0.8, 0.85], horizontalK: [0.7, 0.8],
        count: { mobile: 2, tablet: 0, laptop: 0 } },

      // tablet
      { verticalK: [0.7, 0.75], horizontalK: [0.75, 0.85],
        count: { mobile: 0, tablet: 2, laptop: 0 } },
    ],
  },

  // ── Trees — border both communities and fill center gap ───────────────────

  trees: {
    quota: [{ t: 0, pct: 90 }, { t: 1, pct: 40 }],
    zones: [
      // left close
      { verticalK: [0.95, 1], horizontalK: [0.05, 0.15],
        count: { mobile: 1, tablet: 0, laptop: 3 } },
      { verticalK: [0.85, 0.85], horizontalK: [0.15, 0.25],
        count: { mobile: 1, tablet: 1, laptop: 2 } },
      { verticalK: [0.75, 0.75], horizontalK: [0.23, 0.3],
        count: { mobile: 1, tablet: 0, laptop: 2 } },
      { verticalK: [0.8, 0.8], horizontalK: [0.2, 0.28],
        count: { mobile: 1, tablet: 2, laptop: 3 } },
      { verticalK: [0.8, 0.85], horizontalK: [0.25, 0.3],
        count: { mobile: 1, tablet: 1, laptop: 2 } },
      { verticalK: [0.7, 0.7], horizontalK: [0.18, 0.2],
        count: { mobile: 1, tablet: 0, laptop: 1 } },

      // mobile only
      { verticalK: [0.92, 0.95], horizontalK: [0.9, 1.0],
        count: { mobile: 1, tablet: 0, laptop: 0 } },
      { verticalK: [0.60, 0.7], horizontalK: [0.3, 0.5],
        count: { mobile: 6, tablet: 0, laptop: 0 } },
      { verticalK: [0.95, 1], horizontalK: [0.75, 0.85],
        count: { mobile: 2, tablet: 0, laptop: 0 } },
      { verticalK: [0.45, 0.50], horizontalK: [0.75, 0.85],
        count: { mobile: 7, tablet: 0, laptop: 0 } },
      { verticalK: [0.55, 0.60], horizontalK: [0.05, 0.2],
        count: { mobile: 7, tablet: 0, laptop: 0 } },

      // tablet only
      { verticalK: [0.7, 0.7], horizontalK: [0.38, 0.44],
        count: { mobile: 0, tablet: 2, laptop: 0 } },
      { verticalK: [0.85, 0.95], horizontalK: [0.1, 0.2],
        count: { mobile: 0, tablet: 2, laptop: 0 } },
      { verticalK: [0.8, 0.85], horizontalK: [0.15, 0.25],
        count: { mobile: 0, tablet: 1, laptop: 0 } },
      { verticalK: [0.95, 0.95], horizontalK: [0.75, 0.9],
        count: { mobile: 0, tablet: 2, laptop: 0 } },
      { verticalK: [0.45, 0.50], horizontalK: [0.2, 0.3],
        count: { mobile: 0, tablet: 4, laptop: 0 } },,
      { verticalK: [0.50, 0.55], horizontalK: [0.2, 0.3],
        count: { mobile: 0, tablet: 4, laptop: 0 } },
      { verticalK: [0.75, 0.85], horizontalK: [0.9, 1.0],
        count: { mobile: 0, tablet: 4, laptop: 0 } },
      { verticalK: [0.75, 0.85], horizontalK: [0.25, 0.35],
        count: { mobile: 0, tablet: 3, laptop: 0 } },

      // left far
      { verticalK: [0.60, 0.7], horizontalK: [0.0, 0.05],
        count: { mobile: 1, tablet: 3, laptop: 5 } },
      { verticalK: [0.55, 0.60], horizontalK: [0.0, 0.1],
        count: { mobile: 1, tablet: 2, laptop: 5 } },
      { verticalK: [0.50, 0.55], horizontalK: [0.1, 0.15],
        count: { mobile: 1, tablet: 1, laptop: 5 } },
      { verticalK: [0.45, 0.50], horizontalK: [0.1, 0.2],
        count: { mobile: 1, tablet: 4, laptop: 5 } },

      // mid far
      { verticalK: [0.7, 0.7], horizontalK: [0.38, 0.4],
        count: { mobile: 1, tablet: 0, laptop: 2 } },
      { verticalK: [0.60, 0.60], horizontalK: [0.36, 0.48],
        count: { mobile: 1, tablet: 2, laptop: 4 } },
      { verticalK: [0.55, 0.55], horizontalK: [0.4, 0.5],
        count: { mobile: 1, tablet: 2, laptop: 6 } },
      { verticalK: [0.50, 0.50], horizontalK: [0.35, 0.5],
        count: { mobile: 0, tablet: 2, laptop: 6 } },

      { verticalK: [0.45, 0.50], horizontalK: [0.64, 0.85],
        count: { mobile: 0, tablet: 2, laptop: 2 } },
      { verticalK: [0.50, 0.60], horizontalK: [0.55, 0.8],
        count: { mobile: 1, tablet: 2, laptop: 3 } },
      { verticalK: [0.55, 0.60], horizontalK: [0.5, 0.75],
        count: { mobile: 1, tablet: 2, laptop: 5 } },
      { verticalK: [0.60, 0.60], horizontalK: [0.5, 0.75],
        count: { mobile: 0, tablet: 2, laptop: 3 } },

      // mid close
      { verticalK: [0.8, 0.88], horizontalK: [0.55, 0.7],
        count: { mobile: 1, tablet: 0, laptop: 3 } },
      { verticalK: [0.85, 0.88], horizontalK: [0.65, 0.65],
        count: { mobile: 1, tablet: 0, laptop: 2 } },
      { verticalK: [0.82, 0.87], horizontalK: [0.5, 0.6],
        count: { mobile: 1, tablet: 0, laptop: 1 } },
      { verticalK: [0.9, 0.9], horizontalK: [0.53, 0.6],
        count: { mobile: 1, tablet: 0, laptop: 3 } },

      // right far
      { verticalK: [0.45, 0.50], horizontalK: [0.65, 0.8],
        count: { mobile: 1, tablet: 2, laptop: 6 } },
      { verticalK: [0.50, 0.50], horizontalK: [0.6, 0.8],
        count: { mobile: 1, tablet: 2, laptop: 3 } },
      { verticalK: [0.58, 0.60], horizontalK: [0.9, 1.0],
        count: { mobile: 1, tablet: 2, laptop: 4 } },
      { verticalK: [0.60, 0.7], horizontalK: [0.85, 0.95],
        count: { mobile: 1, tablet: 2, laptop: 2 } },
      { verticalK: [0.75, 0.8], horizontalK: [0.8, 0.85],
        count: { mobile: 1, tablet: 2, laptop: 2 } },
      { verticalK: [0.8, 0.8], horizontalK: [0.8, 0.85],
        count: { mobile: 1, tablet: 2, laptop: 2 } },
      { verticalK: [0.85, 0.85], horizontalK: [0.84, 0.92],
        count: { mobile: 0, tablet: 2, laptop: 3 } },
      { verticalK: [0.60, 0.75], horizontalK: [0.92, 0.98],
        count: { mobile: 1, tablet: 2, laptop: 2 } },
      { verticalK: [0.50, 0.60], horizontalK: [0.94, 0.98],
        count: { mobile: 0, tablet: 2, laptop: 2 } },
      { verticalK: [0.45, 0.55], horizontalK: [0.96, 1.0],
        count: { mobile: 0, tablet: 2, laptop: 8 } },
      { verticalK: [0.45, 0.45], horizontalK: [0.95, 1.0],
        count: { mobile: 0, tablet: 2, laptop: 3 } },
    ],
  },

  // ── Street level ──────────────────────────────────────────────────────────

  bus: {
    quota: [{ t: 0, pct: 40 }, { t: 1, pct: 20 }],
    zones: [
      // left closer community
      { verticalK: [0.85, 0.85], horizontalK: [0.0, 0.05],
        count: { mobile: 1, tablet: 1, laptop: 2 } },

      // right mid
      { verticalK: [0.7, 0.75], horizontalK: [0.9, 0.95],
        count: { mobile: 1, tablet: 1, laptop: 1 } },

      // mobile only
      { verticalK: [0.75, 0.8], horizontalK: [0.6, 0.8],
        count: { mobile: 1, tablet: 0, laptop: 0 } },

      // tablet only
      { verticalK: [0.85, 0.95], horizontalK: [0.7, 0.75],
        count: { mobile: 0, tablet: 1, laptop: 0 } },
    ],
  },

  car: {
    quota: [{ t: 0, pct: 20 }, { t: 1, pct: 100 }],
    zones: [
      // left close
      { verticalK: [0.85, 0.85], horizontalK: [0.25, 0.3],
        count: { mobile: 1, tablet: 1, laptop: 1 } },

      // mobile only
      { verticalK: [0.9, 0.95], horizontalK: [0.2, 0.25],
        count: { mobile: 1, tablet: 0, laptop: 0 } },

      // tablet only
      { verticalK: [0.88, 0.92], horizontalK: [0.45, 0.5],
        count: { mobile: 0, tablet: 1, laptop: 0 } },
      { verticalK: [0.7, 0.75], horizontalK: [0.4, 0.45],
        count: { mobile: 0, tablet: 1, laptop: 0 } },

      // mid close
      { verticalK: [0.8, 0.85], horizontalK: [0.5, 0.55],
        count: { mobile: 1, tablet: 0, laptop: 1 } },
      { verticalK: [0.8, 0.85], horizontalK: [0.65, 0.7],
        count: { mobile: 0, tablet: 0, laptop: 1 } },

      // right close
      { verticalK: [0.75, 0.85], horizontalK: [0.85, 0.87],
        count: { mobile: 1, tablet: 1, laptop: 0 } },
      { verticalK: [0.8, 0.85], horizontalK: [0.9, 0.93],
        count: { mobile: 1, tablet: 1, laptop: 1 } },
    ],
  },

  sea: {
    zones: [
      // far left
      { verticalK: [0.8, 0.85], horizontalK: [0.3, 0.3],
        count: { mobile: 1, tablet: 1, laptop: 1 } },

      // mobile only
      { verticalK: [0.92, 0.95], horizontalK: [0.6, 0.8],
        count: { mobile: 1, tablet: 0, laptop: 0 } },
    ],
  },
};
