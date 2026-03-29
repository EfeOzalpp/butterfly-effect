// src/canvas-engine/adjustable-rules/placement-rules/start.ts
//
// Scene concept:
//   Left third  — residential neighbourhood (house + villa) bordered by trees
//   Right third — industrial pocket (power + carFactory) bordered by trees
//   Center gap  — breathing room / trees separating the two communities
//   Sky         — sun top-left, clouds sparse, snow mid-sky depth
//   Street      — cars + bus at the very bottom, sea far-right corner

import type { ScenePlacementRules } from "./helpers";

export const START_PLACEMENTS: ScenePlacementRules = {

  // ── Sky ────────────────────────────────────────────────────────────────────

  sun: {
    zones: [
      { verticalK: [0.1, 0.13], horizontalK: [0.07, 0.17],
        count: { mobile: 1, tablet: 1, laptop: 1 } },
    ],
  },

  clouds: {
    quota: [{ t: 0, pct: 20 }, { t: 1, pct: 80 }],
    zones: [
      // left sky
      { verticalK: [0.0, 0.2], horizontalK: [0.05, 0.1],
        count: { mobile: 1, tablet: 1, laptop: 1 } },
      { verticalK: [0.0, 0.1], horizontalK: [0.03, 0.05],
        count: { mobile: 1, tablet: 1, laptop: 1 } },
      { verticalK: [0.1, 0.2], horizontalK: [0.04, 0.07],
        count: { mobile: 1, tablet: 1, laptop: 1 } },
      // right sky — counterbalance
      { verticalK: [0.0, 0.1], horizontalK: [0.8, 0.9],
        count: { mobile: 1, tablet: 1, laptop: 1 } },
      { verticalK: [0.1, 0.2], horizontalK: [0.9, 0.94],
        count: { mobile: 1, tablet: 1, laptop: 1 } },

      // ground cloud left
      { verticalK: [0.55, 0.65], horizontalK: [0.01, 0.05],
        count: { mobile: 1, tablet: 1, laptop: 1 } },
      { verticalK: [0.65, 0.7], horizontalK: [0.004, 0.01],
        count: { mobile: 1, tablet: 1, laptop: 1 } },

      // ground cloud right
      { verticalK: [0.55, 0.65], horizontalK: [0.48, 0.9],
        count: { mobile: 1, tablet: 1, laptop: 1 } },
      { verticalK: [0.65, 0.7], horizontalK: [0.6, 0.95],
        count: { mobile: 1, tablet: 1, laptop: 1 } },
      { verticalK: [0.57, 0.6], horizontalK: [0.36, 0.6],
        count: { mobile: 1, tablet: 1, laptop: 1 } },
      { verticalK: [0.55, 0.58], horizontalK: [0.34, 0.6],
        count: { mobile: 1, tablet: 1, laptop: 1 } },

      // sky cloud right
      { verticalK: [0.2, 0.3], horizontalK: [0.8, 0.99],
        count: { mobile: 1, tablet: 1, laptop: 1 } },
      { verticalK: [0.1, 0.2], horizontalK: [0.7, 0.99],
        count: { mobile: 1, tablet: 1, laptop: 1 } },
      { verticalK: [0.1, 0.1], horizontalK: [0.7, 0.99],
        count: { mobile: 1, tablet: 1, laptop: 1 } },
    ],
  },

  snow: {
    quota: [{ t: 0, pct: 80 }, { t: 1, pct: 40 }],
    zones: [
      // mid
      { verticalK: [0.75,  0.8 ], horizontalK: [0.15, 0.3],
        count: { mobile: 1, tablet: 2, laptop: 1 } },
    
      // left sky
      { verticalK: [0.05, 0.1], horizontalK: [0.25, 0.35],
        count: { mobile: 1, tablet: 1, laptop: 1 } },
      { verticalK: [0.15, 0.15], horizontalK: [0.35, 0.4],
        count: { mobile: 1, tablet: 1, laptop: 1 } },

      // right
      { verticalK: [0, 0.1], horizontalK: [0.9, 1],
        count: { mobile: 1, tablet: 1, laptop: 1 } },
      { verticalK: [0, 0.1], horizontalK: [0.8, 1],
        count: { mobile: 1, tablet: 1, laptop: 1 } },
    ],
  },

  // ── Left residential community ─────────────────────────────────────────────

  villa: {
    quota: [{ t: 0, pct: 25 }, { t: 1, pct: 100 }],
    zones: [
      // far left community
      { verticalK: [0.40, 0.54], horizontalK: [0.02, 0.08],
        count: { mobile: 3, tablet: 2, laptop: 4 } },

      // right bottom community
      { verticalK: [0.8,  0.8 ], horizontalK: [0.65, 0.7],
        count: { mobile: 1, tablet: 1, laptop: 2 } },
      { verticalK: [0.72, 0.85], horizontalK: [0.65, 0.75],
        count: { mobile: 1, tablet: 1, laptop: 1 } },
      { verticalK: [0.72, 0.85], horizontalK: [0.75, 0.84],
        count: { mobile: 1, tablet: 1, laptop: 1 } },
      { verticalK: [0.72, 0.77], horizontalK: [0.7, 0.95],
        count: { mobile: 1, tablet: 1, laptop: 1 } },

      // right far houses 
      { verticalK: [0.6,  0.61], horizontalK: [0.46, 0.7],
        count: { mobile: 1, tablet: 1, laptop: 2 } },   
      
      // left mid community
      { verticalK: [0.45, 0.7], horizontalK: [0.02, 0.1],
        count: { mobile: 1, tablet: 1, laptop: 1 } },

      // left close houses
      { verticalK: [0.75,  0.85 ], horizontalK: [0.25, 0.4],
        count: { mobile: 1, tablet: 2, laptop: 1 } },
      { verticalK: [0.8,  0.9 ], horizontalK: [0.1, 0.3],
        count: { mobile: 1, tablet: 2, laptop: 1 } },

      // mid far
      { verticalK: [0.5,  0.5 ], horizontalK: [0.35, 0.6],
        count: { mobile: 1, tablet: 2, laptop: 2 } },
      { verticalK: [0.55,  0.55 ], horizontalK: [0.35, 0.6],
        count: { mobile: 1, tablet: 2, laptop: 1 } },
 
    ],
  },

  house: {
    quota: [{ t: 0, pct: 25 }, { t: 1, pct: 100 }],
    zones: [
      // left mid community
      { verticalK: [0.45, 0.6], horizontalK: [0.03, 0.07],
        count: { mobile: 1, tablet: 1, laptop: 2 } },
      { verticalK: [0.55, 0.65], horizontalK: [0.01, 0.05],
        count: { mobile: 1, tablet: 1, laptop: 1 } },

      // bottom right 
      { verticalK: [0.5,  0.55], horizontalK: [0.56, 0.7],
      count: { mobile: 1, tablet: 1, laptop: 2 } },   
    ],
  },

  // ── Right industrial pocket ────────────────────────────────────────────────

  power: {
    quota: [{ t: 0, pct: 30 }, { t: 1, pct: 90 }],
    zones: [
      // right close community 
      { verticalK: [0.55, 0.65], horizontalK: [0.01, 0.05],
        count: { mobile: 1, tablet: 1, laptop: 1 } },

      // left mid community
      { verticalK: [0.55, 0.65], horizontalK: [0.5, 0.6],
        count: { mobile: 1, tablet: 1, laptop: 1 } },
    ],
  },

  carFactory: {
    quota: [{ t: 0, pct: 5 }, { t: 1, pct: 20}],
    zones: [
      // left mid community
      { verticalK: [0.7, 0.75], horizontalK: [0.025, 0.1],
        count: { mobile: 1, tablet: 1, laptop: 3 } },
    ],
  },

  // ── Trees — border both communities and fill center gap ───────────────────

  trees: {
    quota: [{ t: 0, pct: 120 }, { t: 1, pct: 40 }],
    zones: [
      // far left community
      { verticalK: [0.40, 0.66], horizontalK: [0.8, 0.9],
        count: { mobile: 3, tablet: 2, laptop: 4 } },

      // left mid community
      { verticalK: [0.40, 0.80], horizontalK: [0.03,  0.08],
        count: { mobile: 1, tablet: 1, laptop: 4 } },

      // right closer community
      { verticalK: [0.8,  0.85 ], horizontalK: [0.75, 1.0],
        count: { mobile: 1, tablet: 2, laptop: 2 } },
      { verticalK: [0.86,  1 ], horizontalK: [0.85, 1],
        count: { mobile: 1, tablet: 2, laptop: 3 } },
      { verticalK: [0.85, 0.85], horizontalK: [0.95, 0.98],
        count: { mobile: 1, tablet: 1, laptop: 1 } },

      // left close trees
      { verticalK: [0.8,  0.9 ], horizontalK: [0.25, 0.45],
        count: { mobile: 1, tablet: 2, laptop: 5 } },
        
      // left mid trees
      { verticalK: [0.68,  0.72 ], horizontalK: [0.6, 0.75],
        count: { mobile: 1, tablet: 2, laptop: 2 } },
      { verticalK: [0.62,  0.68 ], horizontalK: [0.54, 0.6],
        count: { mobile: 1, tablet: 2, laptop: 4 } },
      { verticalK: [0.62,  0.62 ], horizontalK: [0.45, 0.7],
        count: { mobile: 1, tablet: 2, laptop: 6 } },
      { verticalK: [0.55,  0.55 ], horizontalK: [0.55, 0.72],
        count: { mobile: 1, tablet: 2, laptop: 8 } },

      { verticalK: [0.7,  0.8 ], horizontalK: [0.7, 0.8],
        count: { mobile: 1, tablet: 2, laptop: 4 } },
    ],
  },

  // ── Street level ──────────────────────────────────────────────────────────

  bus: {
    quota: [{ t: 0, pct: 40 }, { t: 1, pct: 20 }],
    zones: [
      // right closer community
      { verticalK: [0.85, 0.85], horizontalK: [0.95, 1.0],
        count: { mobile: 1, tablet: 1, laptop: 2 } },
    ],
  },

  car: {
    quota: [{ t: 0, pct: 20 }, { t: 1, pct: 100 }],
    zones: [
      // right closer community
      { verticalK: [0.88, 0.94], horizontalK: [0.70, 0.95],
        count: { mobile: 1, tablet: 1, laptop: 1 } },
      { verticalK: [0.7, 0.75], horizontalK: [0.8, 0.95],
        count: { mobile: 1, tablet: 1, laptop: 1 } },

      // left mid community
      { verticalK: [0.65, 0.8], horizontalK: [0.01, 0.05],
        count: { mobile: 1, tablet: 1, laptop: 1 } },
        
      // center close
      { verticalK: [0.8,  0.85 ], horizontalK: [0.4, 0.5],
        count: { mobile: 1, tablet: 2, laptop: 1 } },
      { verticalK: [0.8,  0.85 ], horizontalK: [0.2, 0.3],
        count: { mobile: 1, tablet: 2, laptop: 1 } },

      //mid far 
      { verticalK: [0.6,  0.62 ], horizontalK: [0.45, 0.65],
        count: { mobile: 1, tablet: 2, laptop: 1 } },
    ],
  },

  sea: {
    zones: [
      // far right
      { verticalK: [0.75, 0.8], horizontalK: [0.9, 0.95],
        count: { mobile: 1, tablet: 1, laptop: 1 } },
      { verticalK: [0.65,  0.7 ], horizontalK: [0.0, 0.05],
        count: { mobile: 1, tablet: 2, laptop: 1 } },
    ],
  },
};
