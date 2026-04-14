// src/canvas-engine/adjustable-rules/placement-rules/questionnaire.ts

import type { ScenePlacementRules } from "./helpers";

export const QUESTIONNAIRE_PLACEMENTS: ScenePlacementRules = {

  // ── Sky ────────────────────────────────────────────────────────────────────

  sun: {
    zones: [
      { verticalK: [0.06, 0.1], horizontalK: [0.83, 0.85],
        count: { mobile: 0, tablet: 0, laptop: 1 } },

      // tablet
      { verticalK: [0.08, 0.12], horizontalK: [0.8, 0.82],
        count: { mobile: 0, tablet: 1, laptop: 0 } },

      // mobile
      { verticalK: [0.02, 0.04], horizontalK: [0.95, 0.98],
        count: { mobile: 1, tablet: 0, laptop: 0 } },
    ],
  },

  clouds: {
    quota: [{ t: 0, pct: 20 }, { t: 1, pct: 88 }],
    zones: [

      // right sky
      { verticalK: [0.06, 0.1], horizontalK: [0.9, 0.94],
        count: { mobile: 0, tablet: 0, laptop: 1 } },
      { verticalK: [0.1, 0.15], horizontalK: [0.85, 0.92],
        count: { mobile: 0, tablet: 0, laptop: 1 } },

      // mid sky
      { verticalK: [0.01, 0.04], horizontalK: [0.6, 0.65],
        count: { mobile: 0, tablet: 0, laptop: 1 } },
      { verticalK: [0.1, 0.15], horizontalK: [0.33, 0.4],
        count: { mobile: 0, tablet: 0, laptop: 1 } },
      { verticalK: [0.03, 0.06], horizontalK: [0.65, 0.7],
        count: { mobile: 0, tablet: 0, laptop: 1 } },

      // tablet only
      { verticalK: [0.08, 0.1], horizontalK: [0.15, 0.25],
        count: { mobile: 0, tablet: 1, laptop: 0 } },
      { verticalK: [0.01, 0.04], horizontalK: [0.45, 0.5],
        count: { mobile: 0, tablet: 1, laptop: 0 } },
      { verticalK: [0.04, 0.08], horizontalK: [0.25, 0.35],
        count: { mobile: 0, tablet: 1, laptop: 0 } },

      // mobile only
      { verticalK: [0.22, 0.25], horizontalK: [0.85, 0.95],
        count: { mobile: 1, tablet: 0, laptop: 0 } },
      { verticalK: [0.25, 0.3], horizontalK: [0.8, 0.9],
        count: { mobile: 1, tablet: 0, laptop: 0 } },

      { verticalK: [0.01, 0.04], horizontalK: [0.15, 0.2],
        count: { mobile: 1, tablet: 0, laptop: 0 } },
      { verticalK: [0.04, 0.08], horizontalK: [0.25, 0.35],
        count: { mobile: 1, tablet: 0, laptop: 0 } },

      // far right ground
      { verticalK: [0.56, 0.6], horizontalK: [0.9, 0.95],
        count: { mobile: 0, tablet: 0, laptop: 1 } },

      // far left ground
      { verticalK: [0.6, 0.6], horizontalK: [0.05, 0.1],
        count: { mobile: 0, tablet: 0, laptop: 1 } },
      { verticalK: [0.6, 0.6], horizontalK: [0.1, 0.15],
        count: { mobile: 0, tablet: 0, laptop: 1 } },

      // left sky
      { verticalK: [0.16, 0.2], horizontalK: [0.42, 0.46],
        count: { mobile: 0, tablet: 0, laptop: 1 } },
      { verticalK: [0.01, 0.03], horizontalK: [0.0, 0.05],
        count: { mobile: 1, tablet: 0, laptop: 1 } },
      { verticalK: [0.08, 0.11], horizontalK: [0.08, 0.1],
        count: { mobile: 0, tablet: 0, laptop: 1 } },
      { verticalK: [0.12, 0.16], horizontalK: [0.15, 0.16],
        count: { mobile: 0, tablet: 0, laptop: 1 } },
    ],
  },

  snow: {
    quota: [{ t: 0, pct: 80 }, { t: 1, pct: 48 }],
    zones: [

      // mobile only
      { verticalK: [0.01, 0.07], horizontalK: [0.6, 0.75],
        count: { mobile: 1, tablet: 0, laptop: 0 } },

      // tablet only
      { verticalK: [0.25, 0.3], horizontalK: [0.9, 0.96],
        count: { mobile: 0, tablet: 1, laptop: 0 } },
      { verticalK: [0.15, 0.2], horizontalK: [0.86, 0.9],
        count: { mobile: 0, tablet: 1, laptop: 0 } },
      { verticalK: [0.07, 0.15], horizontalK: [0.55, 0.6],
        count: { mobile: 0, tablet: 1, laptop: 0 } },
      { verticalK: [0.05, 0.12], horizontalK: [0.6, 0.65],
        count: { mobile: 0, tablet: 1, laptop: 0 } },
      { verticalK: [0.75, 0.8], horizontalK: [0.35, 0.4],
        count: { mobile: 0, tablet: 1, laptop: 0 } },

      // mid
      { verticalK: [0.05, 0.1], horizontalK: [0.25, 0.3],
        count: { mobile: 0, tablet: 0, laptop: 1 } },
      { verticalK: [0.01, 0.04], horizontalK: [0.25, 0.3],
        count: { mobile: 0, tablet: 0, laptop: 1 } },
      { verticalK: [0.12, 0.2], horizontalK: [0.08, 0.12],
        count: { mobile: 0, tablet: 0, laptop: 1 } },

      // right top
      { verticalK: [0.2, 0.22], horizontalK: [0.8, 0.86],
        count: { mobile: 0, tablet: 0, laptop: 1 } },
      { verticalK: [0.2, 0.24], horizontalK: [0.8, 0.87],
        count: { mobile: 0, tablet: 0, laptop: 1 } },
    ],
  },

  // ── Right residential community ────────────────────────────────────────────

  villa: {
    quota: [{ t: 0, pct: 75 }, { t: 1, pct: 50 }],
    zones: [
      // left close
      { verticalK: [0.75, 0.75], horizontalK: [0.12, 0.18],
        count: { mobile: 1, tablet: 0, laptop: 1 } },
      { verticalK: [0.85, 0.86], horizontalK: [0.14, 0.16],
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
      { verticalK: [0.6, 0.6], horizontalK: [0.75, 0.95],
        count: { mobile: 0, tablet: 2, laptop: 0 } },
      { verticalK: [0.55, 0.6], horizontalK: [0.45, 0.55],
        count: { mobile: 0, tablet: 3, laptop: 0 } },

      // mobile addition
      { verticalK: [0.9, 0.95], horizontalK: [0.26, 0.35],
        count: { mobile: 1, tablet: 0, laptop: 0 } },
      { verticalK: [0.8, 0.9], horizontalK: [0.8, 0.95],
        count: { mobile: 1, tablet: 0, laptop: 0 } },
      { verticalK: [0.55, 0.65], horizontalK: [0.35, 0.55],
        count: { mobile: 1, tablet: 0, laptop: 0 } },
      { verticalK: [0.5, 0.6], horizontalK: [0.65, 0.75],
        count: { mobile: 1, tablet: 0, laptop: 0 } },
      { verticalK: [0.65, 0.75], horizontalK: [0.35, 0.45],
        count: { mobile: 1, tablet: 0, laptop: 0 } },
      { verticalK: [0.6, 0.65], horizontalK: [0.65, 0.75],
        count: { mobile: 2, tablet: 0, laptop: 0 } },

      // left bottom
      { verticalK: [0.5, 0.55], horizontalK: [0.05, 0.08],
        count: { mobile: 1, tablet: 2, laptop: 1 } },
      { verticalK: [0.55, 0.6], horizontalK: [0.06, 0.08],
        count: { mobile: 1, tablet: 2, laptop: 1 } },
      { verticalK: [0.6, 0.6], horizontalK: [0.0, 0.05],
        count: { mobile: 1, tablet: 2, laptop: 1 } },
      { verticalK: [0.5, 0.55], horizontalK: [0.1, 0.2],
        count: { mobile: 1, tablet: 2, laptop: 3 } },

      // mid far
      { verticalK: [0.5, 0.55], horizontalK: [0.45, 0.5],
        count: { mobile: 0, tablet: 2, laptop: 3 } },
      { verticalK: [0.5, 0.5], horizontalK: [0.22, 0.35],
        count: { mobile: 0, tablet: 2, laptop: 2 } },
      { verticalK: [0.55, 0.6], horizontalK: [0.35, 0.5],
        count: { mobile: 1, tablet: 0, laptop: 3 } },
      { verticalK: [0.45, 0.5], horizontalK: [0.65, 0.75],
        count: { mobile: 0, tablet: 2, laptop: 2 } },
      { verticalK: [0.55, 0.6], horizontalK: [0.55, 0.65],
        count: { mobile: 1, tablet: 0, laptop: 2 } },
      { verticalK: [0.6, 0.6], horizontalK: [0.55, 0.65],
        count: { mobile: 0, tablet: 0, laptop: 2 } },
      { verticalK: [0.6, 0.6], horizontalK: [0.35, 0.45],
        count: { mobile: 0, tablet: 0, laptop: 2 } },

      // mid close
      { verticalK: [0.7, 0.75], horizontalK: [0.55, 0.6],
        count: { mobile: 0, tablet: 0, laptop: 1 } },
      { verticalK: [0.85, 0.85], horizontalK: [0.5, 0.56],
        count: { mobile: 0, tablet: 0, laptop: 1 } },
      { verticalK: [0.8, 0.8], horizontalK: [0.6, 0.66],
        count: { mobile: 0, tablet: 0, laptop: 1 } },

      // right mid
      { verticalK: [0.75, 0.75], horizontalK: [0.75, 0.85],
        count: { mobile: 0, tablet: 1, laptop: 1 } },
      { verticalK: [0.8, 0.82], horizontalK: [0.9, 0.95],
        count: { mobile: 0, tablet: 0, laptop: 1 } },

      // right far
      { verticalK: [0.5, 0.55], horizontalK: [0.8, 1.0],
        count: { mobile: 0, tablet: 0, laptop: 3 } },
      { verticalK: [0.6, 0.6], horizontalK: [0.9, 1.0],
        count: { mobile: 1, tablet: 0, laptop: 2 } },
    ],
  },

  house: {
    quota: [{ t: 0, pct: 25 }, { t: 1, pct: 100 }],
    zones: [
      // right mid community
      { verticalK: [0.7, 0.75], horizontalK: [0.88, 0.92],
        count: { mobile: 0, tablet: 0, laptop: 1 } },
      { verticalK: [0.65, 0.7], horizontalK: [0.8, 0.88],
        count: { mobile: 1, tablet: 0, laptop: 2 } },
      { verticalK: [0.5, 0.5], horizontalK: [0.92, 0.98],
        count: { mobile: 0, tablet: 0, laptop: 1 } },

      // mid
      { verticalK: [0.55, 0.55], horizontalK: [0.4, 0.5],
        count: { mobile: 0, tablet: 0, laptop: 2 } },
      { verticalK: [0.45, 0.5], horizontalK: [0.65, 0.7],
        count: { mobile: 0, tablet: 0, laptop: 1 } },
      { verticalK: [0.5, 0.55], horizontalK: [0.6, 0.7],
        count: { mobile: 0, tablet: 0, laptop: 1 } },

      // mobile addition
      { verticalK: [0.9, 0.9], horizontalK: [0.1, 0.2],
        count: { mobile: 1, tablet: 0, laptop: 0 } },
      { verticalK: [0.55, 0.65], horizontalK: [0.4, 0.45],
        count: { mobile: 1, tablet: 0, laptop: 0 } },

      // tablet addition
      { verticalK: [0.65, 0.75], horizontalK: [0.9, 0.95],
        count: { mobile: 0, tablet: 1, laptop: 0 } },

      // left far community
      { verticalK: [0.5, 0.5], horizontalK: [0.0, 0.05],
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
      { verticalK: [0.65, 0.7], horizontalK: [0.15, 0.25],
        count: { mobile: 0, tablet: 1, laptop: 1 } },
      { verticalK: [0.8, 0.8], horizontalK: [0.8, 0.85],
        count: { mobile: 0, tablet: 0, laptop: 1 } },
      { verticalK: [0.7, 0.72], horizontalK: [0.18, 0.25],
        count: { mobile: 0, tablet: 0, laptop: 1 } },

      // mobile only
      { verticalK: [0.8, 0.9], horizontalK: [0.2, 0.3],
        count: { mobile: 1, tablet: 0, laptop: 0 } },

      // tablet only
      { verticalK: [0.65, 0.75], horizontalK: [0.75, 0.8],
        count: { mobile: 0, tablet: 1, laptop: 0 } },

      // right
      { verticalK: [0.7, 0.75], horizontalK: [0.86, 0.9],
        count: { mobile: 1, tablet: 0, laptop: 1 } },
      { verticalK: [0.55, 0.65], horizontalK: [0.86, 0.9],
        count: { mobile: 1, tablet: 0, laptop: 2 } },
    ],
  },

  carFactory: {
    quota: [{ t: 0, pct: 5 }, { t: 1, pct: 20 }],
    zones: [
      // right mid community
      { verticalK: [0.8, 0.82], horizontalK: [0.9, 0.95],
        count: { mobile: 1, tablet: 0, laptop: 2 } },

      // mobile
      { verticalK: [0.8, 0.85], horizontalK: [0.7, 0.8],
        count: { mobile: 2, tablet: 0, laptop: 0 } },

      // tablet
      { verticalK: [0.8, 0.85], horizontalK: [0.85, 0.95],
        count: { mobile: 0, tablet: 2, laptop: 0 } },
    ],
  },

  // ── Trees — border both communities and fill center gap ───────────────────

  trees: {
    quota: [{ t: 0, pct: 90 }, { t: 1, pct: 40 }],
    zones: [
      // right close
      { verticalK: [0.95, 1], horizontalK: [0.85, 0.95],
        count: { mobile: 1, tablet: 2, laptop: 3 } },
      { verticalK: [0.85, 0.9], horizontalK: [0.8, 0.9],
        count: { mobile: 1, tablet: 2, laptop: 2 } },
      { verticalK: [0.75, 0.8], horizontalK: [0.82, 0.88],
        count: { mobile: 1, tablet: 2, laptop: 2 } },

      // right mid
      { verticalK: [0.75, 0.8], horizontalK: [0.62, 0.68],
        count: { mobile: 0, tablet: 1, laptop: 1 } },
      { verticalK: [0.8, 0.85], horizontalK: [0.7, 0.75],
        count: { mobile: 0, tablet: 1, laptop: 2 } },

      // center gap
      { verticalK: [0.55, 0.65], horizontalK: [0.48, 0.52],
        count: { mobile: 0, tablet: 2, laptop: 2 } },
      { verticalK: [0.62, 0.72], horizontalK: [0.52, 0.58],
        count: { mobile: 0, tablet: 2, laptop: 3 } },
      { verticalK: [0.68, 0.76], horizontalK: [0.46, 0.5],
        count: { mobile: 0, tablet: 1, laptop: 2 } },

      // left mid
      { verticalK: [0.75, 0.8], horizontalK: [0.25, 0.3],
        count: { mobile: 0, tablet: 1, laptop: 1 } },
      { verticalK: [0.8, 0.85], horizontalK: [0.18, 0.24],
        count: { mobile: 0, tablet: 1, laptop: 2 } },

      // left close
      { verticalK: [0.95, 1], horizontalK: [0.05, 0.15],
        count: { mobile: 1, tablet: 2, laptop: 3 } },
      { verticalK: [0.85, 0.9], horizontalK: [0.1, 0.2],
        count: { mobile: 1, tablet: 2, laptop: 2 } },
      { verticalK: [0.75, 0.8], horizontalK: [0.12, 0.18],
        count: { mobile: 1, tablet: 2, laptop: 2 } },

      // far left filler
      { verticalK: [0.55, 0.65], horizontalK: [0.02, 0.06],
        count: { mobile: 0, tablet: 2, laptop: 2 } },
      { verticalK: [0.5, 0.6], horizontalK: [0.0, 0.04],
        count: { mobile: 0, tablet: 2, laptop: 8 } },
      { verticalK: [0.5, 0.5], horizontalK: [0.0, 0.05],
        count: { mobile: 0, tablet: 2, laptop: 3 } },
    ],
  },

  // ── Street level ──────────────────────────────────────────────────────────

  bus: {
    quota: [{ t: 0, pct: 40 }, { t: 1, pct: 150 }],
    zones: [
      // right closer community
      { verticalK: [0.85, 0.85], horizontalK: [0.8, 1.0],
        count: { mobile: 1, tablet: 1, laptop: 2 } },

      // left mid
      { verticalK: [0.7, 0.75], horizontalK: [0.05, 0.1],
        count: { mobile: 1, tablet: 1, laptop: 1 } },

      // mobile only
      { verticalK: [0.75, 0.8], horizontalK: [0.2, 0.4],
        count: { mobile: 1, tablet: 0, laptop: 0 } },
    ],
  },

  car: {
    quota: [{ t: 0, pct: 20 }, { t: 1, pct: 100 }],
    zones: [
      // right close
      { verticalK: [0.85, 0.85], horizontalK: [0.7, 0.75],
        count: { mobile: 1, tablet: 1, laptop: 1 } },

      // mobile only
      { verticalK: [0.9, 0.95], horizontalK: [0.75, 0.8],
        count: { mobile: 1, tablet: 1, laptop: 0 } },

      // mid close
      { verticalK: [0.8, 0.85], horizontalK: [0.45, 0.5],
        count: { mobile: 1, tablet: 1, laptop: 1 } },
      { verticalK: [0.8, 0.85], horizontalK: [0.3, 0.35],
        count: { mobile: 0, tablet: 1, laptop: 1 } },

      // left close
      { verticalK: [0.75, 0.85], horizontalK: [0.13, 0.15],
        count: { mobile: 1, tablet: 1, laptop: 0 } },
      { verticalK: [0.8, 0.85], horizontalK: [0.07, 0.1],
        count: { mobile: 1, tablet: 1, laptop: 1 } },
    ],
  },

  sea: {
    quota: [{ t: 0, pct: 20 }, { t: 1, pct: 100 }],
    zones: [
      // far right
      { verticalK: [0.8, 0.85], horizontalK: [0.7, 0.7],
        count: { mobile: 1, tablet: 1, laptop: 1 } },

      // mobile only
      { verticalK: [0.92, 0.95], horizontalK: [0.2, 0.4],
        count: { mobile: 1, tablet: 1, laptop: 0 } },
    ],
  },
};