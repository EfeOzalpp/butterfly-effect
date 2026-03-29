// src/canvas-engine/adjustable-rules/backgrounds/start.ts

import type { BackgroundsByMode, BackgroundSpec } from "./helpers";

const QUESTIONNAIRE: BackgroundSpec = {
  base: "rgb(229, 246, 255)",
  overlay: {
    kind: "linear",
    from: { xK: 0.5, yK: 0.0 },
    to: { xK: 0.5, yK: 1.0 },
    stops: [
      { k: 0.0, rgba: "rgba(120, 188, 236, 0.32)" },
      { k: 0.25, rgba: "rgba(88, 156, 214, 0.38)", oscK: { amp: 0.08, hz: 0.12 } },
      { k: 0.58, rgba: "rgba(251, 252, 238, 0.9)" },
      { k: 0.58, rgba: "rgba(171, 200, 133, 0.64)", liveBlend: [0.24, 0.08] },
      { k: 1.0, rgba: "rgba(139, 152, 134, 0.55)" },
    ] as const,
  },
} as const;

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
        { k: 0.56, rgba: "rgba(108, 214, 184, 0.95)", liveBlend: [0.04, 0.12] },          // teal break
        { k: 0.75, rgba: "rgba(82, 184, 146, 0.97)", liveBlend: [0.02, 0.08] },           // adventure grass-teal
        { k: 0.96, rgba: "rgba(82, 184, 146, 0.97)" }, 
        { k: 0.96, rgba: "rgba(120, 156, 102, 1)" },
        { k: 0.98, rgba: "rgba(120, 156, 102, 1)" },
        { k: 0.98,  rgba: "rgb(248, 240, 234)" },
        { k: 1.0,  rgba: "rgb(248, 240, 234)" },
      ] as const,
    },
  },
  questionnaire: QUESTIONNAIRE,
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

const QUESTIONNAIRE_DARK: BackgroundSpec = {
  base: "rgb(18, 24, 33)",
  overlay: {
    kind: "linear",
    from: { xK: 0.5, yK: 0.0 },
    to: { xK: 0.5, yK: 1.0 },
    stops: [
      { k: 0, rgba: "#242233" },
      { k: 0.25, rgba: "#4D5586", oscK: { amp: 0.04, hz: 0.02 } },
      { k: 0.58, rgba: "#b3c3f5" },
      { k: 0.58, rgba: "rgba(68, 96, 158, 0.95)", liveBlend: [0.24, 0.08] },
      { k: 1.0, rgba: "#292d3d", oscK: { amp: 0.03, hz: 0.02 } },
    ] as const,
  },
  stars: {
    count: [14, 46],
    topBandK: 0.4,
    minR: 0.8,
    maxR: 1.9,
    alpha: [[0.08, 0.42], [0.24, 0.78]],
    flickerHz: [[0.4, 0.95], [0.14, 0.34]],
  },
} as const;

const START_DARK: BackgroundSpec = {
  base: "rgb(18, 26, 62)",
  overlay: {
    kind: "linear",
    from: { xK: 0.5, yK: 0.0 },
    to: { xK: 0.5, yK: 1.0 },
    stops: [
      { k: 0.0,  rgba: "rgba(18, 26, 62, 1.0)" },                                     // Adventure times navy sky
      { k: 0.20, rgba: "rgba(24, 38, 88, 0.98)", oscK: { amp: 0.03, hz: 0.015 } },   // navy drift
      { k: 0.40, rgba: "rgba(30, 54, 108, 0.95)" },                                   // mid blue
      { k: 0.52, rgba: "rgba(28, 68, 102, 0.93)" },                                   // horizon blue
      { k: 0.56, rgba: "rgba(24, 96, 86, 0.95)", liveBlend: [0.04, 0.12] },           // teal break
      { k: 0.75, rgba: "rgba(28, 118, 104, 0.97)", liveBlend: [0.02, 0.08] },         // Adventure times teal ground
      { k: 0.98, rgba: "rgba(28, 118, 104, 0.97)"}, 
      { k: 0.98,  rgba: "rgba(26, 30, 35, 1)" }, 
      { k: 1.0,  rgba: "rgba(26, 30, 35, 1)" },                                      
    ] as const,
  },
  stars: {
    count: [24, 36],
    topBandK: 0.3,
    minR: 0.9,
    maxR: 2.1,
    alpha: [[0.5, 1.5], [0.6, 1.6]],
    flickerHz: [[0.42, 0.98], [0.14, 0.34]],
  },
} as const;

export const BACKGROUNDS_START_DARK: BackgroundsByMode = {
  start: START_DARK,
  questionnaire: QUESTIONNAIRE_DARK,
  city: {
    base: "rgb(14, 20, 28)",
    overlay: {
      kind: "linear",
      from: { xK: 0.5, yK: 0.0 },
      to: { xK: 0.5, yK: 1.0 },
      stops: [
        { k: 0.0, rgba: "rgba(76, 103, 134, 0.22)" },
        { k: 0.2, rgba: "rgba(43, 62, 84, 0.28)" },
        { k: 1.0, rgba: "rgba(9, 15, 22, 0.96)" },
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
