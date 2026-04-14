// src/canvas-engine/adjustable-rules/backgrounds/start.ts

import type { BackgroundsByMode, BackgroundSpec } from "./helpers";

export const BACKGROUNDS_START: BackgroundsByMode = {
  start: {
    base: "rgb(158, 222, 248)",
    overlay: {
      kind: "linear",
      from: { xK: 0.5, yK: 0.0 },
      to: { xK: 0.5, yK: 1.0 },
      stops: [
        { k: 0.0,  rgba: "rgba(158, 222, 248, 1.0)" },                                     // Adventure-bright sky blue
        { k: 0.20, rgba: "rgba(186, 232, 255, 0.99)", oscK: { amp: 0.03, hz: 0.015 } },   // airy drift
        { k: 0.40, rgba: "rgba(214, 242, 255, 0.97)" },                                    // pale candy sky
        { k: 0.52, rgba: "rgba(255, 236, 166, 0.95)" },                                    // warm horizon glow
        { k: 0.54, rgba: "rgba(108, 214, 184, 0.95)", liveBlend: [0.04, 0.12] },          // teal break
        { k: 0.70, rgba: "rgba(82, 184, 146, 0.97)", liveBlend: [0.02, 0.08] },           // adventure grass-teal
        { k: 0.96, rgba: "rgba(82, 184, 146, 0.97)" }, 
        { k: 0.96, rgba: "rgba(120, 156, 102, 1)" },
        { k: 0.98, rgba: "rgba(120, 156, 102, 1)" },
        { k: 0.98,  rgba: "rgb(248, 240, 234)" },
        { k: 1.0,  rgba: "rgb(248, 240, 234)" },
      ] as const,
    },
  },
  questionnaire: {
    base: "rgb(158, 222, 248)",
    overlay: {
      kind: "linear",
      from: { xK: 0.5, yK: 0.0 },
      to: { xK: 0.5, yK: 1.0 },
      stops: [
        { k: 0.0,  rgba: "rgba(158, 222, 248, 1.0)" },                                     // Adventure-bright sky blue
        { k: 0.12, rgba: "rgba(186, 232, 255, 0.99)", oscK: { amp: 0.03, hz: 0.015 } },   // airy drift
        { k: 0.21, rgba: "rgba(214, 242, 255, 0.97)" },                                    // pale candy sky
        { k: 0.35, rgba: "rgba(255, 236, 166, 0.95)" },                                    // warm horizon glow
        { k: 0.4, rgba: "rgba(108, 214, 184, 0.95)", liveBlend: [0.04, 0.12] },          // teal break
        { k: 0.7, rgba: "rgba(82, 184, 146, 0.97)", liveBlend: [0.02, 0.08] },           // adventure grass-teal
        { k: 1, rgba: "rgba(82, 184, 126, 0.97)" }, 
      ] as const,
    },
  },
  city: {
    base: "rgb(229, 246, 255)",
    overlay: {
      kind: "linear",
      from: { xK: 0.5, yK: 0.0 },
      to: { xK: 0.5, yK: 1.0 },
      stops: [
        { k: 0.0, rgba: "rgba(255,255,255,1.00)" },
        { k: 0.2, rgba: "rgba(255,255,255,0.85)" },
        { k: 1.0, rgba: "rgba(160,220,250,1.00)" },
      ] as const,
    },
  },
} as const;

// ── Dark ─────────────────────────────────────────────────────────────────────

const START_DARK: BackgroundSpec = {
  base: "rgb(18, 26, 62)",
  overlay: {
    kind: "linear",
    from: { xK: 0.5, yK: 0.0 },
    to: { xK: 0.5, yK: 1.0 },
    stops: [
      { k: 0.0,  rgba: "rgba(18, 26, 62, 1.0)" },                                     // Adventure times navy sky
      { k: 0.20, rgba: "rgba(35, 50, 105, 0.98)", oscK: { amp: 0.03, hz: 0.015 } },   // navy drift
      { k: 0.35, rgba: "rgba(40, 65, 122, 0.95)" },                                   // mid blue
      { k: 0.47, rgba: "rgba(48, 107, 159, 0.93)" },                                   // horizon blue
      { k: 0.52, rgba: "rgba(56, 147, 196, 0.95)", liveBlend: [0.04, 0.12] },           // teal break
      { k: 0.54, rgba: "rgb(144, 206, 161)", liveBlend: [0.02, 0.08] , oscK: { amp: 0.02, hz: 0.03 }},         // Adventure times teal ground
      { k: 0.58, rgba: "rgb(153, 201, 144)", liveBlend: [0.04, 0.10] },  
      { k: 0.98, rgba: "rgba(159, 179, 132, 0.97)"},
      { k: 0.98,  rgba: "rgba(53, 48, 42, 1)" },
      { k: 1.0,  rgba: "rgba(53, 48, 42, 1)" },
    ] as const,
  },
  stars: {
    count: [24, 32],
    topBandK: 0.35,
    minR: 0.9,
    maxR: 1.6,
    alpha: [[0.5, 1.5], [0.6, 1.6]],
    flickerHz: [[0.42, 0.98], [0.14, 0.34]],
  },
} as const;

export const BACKGROUNDS_START_DARK: BackgroundsByMode = {
  start: START_DARK,
  questionnaire: {
    base: "rgb(18, 26, 62)",
    overlay: {
      kind: "linear",
      from: { xK: 0.5, yK: 0.0 },
      to: { xK: 0.5, yK: 1.0 },
    stops: [
      { k: 0.0,  rgba: "rgba(18, 26, 62, 1.0)" },                                     // Adventure times navy sky
      { k: 0.16, rgba: "rgba(35, 50, 105, 0.98)", oscK: { amp: 0.03, hz: 0.015 } },   // navy drift
      { k: 0.24, rgba: "rgba(40, 65, 122, 0.95)" },                                   // mid blue
      { k: 0.28, rgba: "rgba(48, 107, 159, 0.93)" },                                   // horizon blue
      { k: 0.34, rgba: "rgba(56, 147, 196, 0.95)", liveBlend: [0.04, 0.12] },           // teal break
      { k: 0.36, rgba: "rgb(144, 206, 161)", liveBlend: [0.02, 0.08] , oscK: { amp: 0.02, hz: 0.03 }},         // Adventure times teal ground
      { k: 0.6, rgba: "rgb(153, 201, 144)", liveBlend: [0.04, 0.10] },  
      { k: 1, rgba: "rgba(159, 179, 132, 0.97)"},
    ] as const,
    },
    stars: {
      count: [32, 44],
      topBandK: 0.26,
      minR: 0.6,
      maxR: 1.2,
      alpha: [[0.5, 1.5], [0.6, 1.6]],
      flickerHz: [[0.42, 0.98], [0.14, 0.34]],
    },
  },
  city: {
    base: "rgb(14, 20, 28)",
    overlay: {
      kind: "linear",
      from: { xK: 0.5, yK: 0.0 },
      to: { xK: 0.5, yK: 1.0 },
      stops: [
        { k: 0.0,  rgba: "rgba(18, 26, 62, 1.0)" },                                    
        { k: 0.12, rgba: "rgba(35, 50, 105, 0.98)", oscK: { amp: 0.03, hz: 0.015 } },  
        { k: 0.26, rgba: "rgba(42, 91, 170, 0.95)" },                                  
        { k: 0.32, rgba: "rgba(56, 176, 227, 0.93)", liveBlend: [0.06, 0.12]  },                                  
        { k: 0.34, rgba: "rgba(77, 167, 155, 0.97)", liveBlend: [0.12, 0.08] },         
        { k: 0.8, rgba: "rgba(117, 164, 143, 0.97)"},                                    
      ] as const,
    },
    stars: {
      count: [10, 18],
      topBandK: 0.36,
      minR: 0.8,
      maxR: 1.7,
      alpha: [[0.06, 0.32], [0.18, 0.58]],
      flickerHz: [[0.36, 0.82], [0.12, 0.28]],
    },
  },
} as const;
