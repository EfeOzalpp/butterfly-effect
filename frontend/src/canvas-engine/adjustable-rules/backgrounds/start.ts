// src/canvas-engine/adjustable-rules/BACKGROUNDS_LIGHT/start.ts

import type { BackgroundSpec, StartBackgroundsByMode } from "./helpers";

export const BACKGROUNDS_LIGHT: StartBackgroundsByMode = {
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
        { k: 0.0,  rgba: "rgba(158, 222, 248, 1.0)" },                                     
        { k: 0.12, rgba: "rgba(186, 232, 255, 0.99)", },  
        { k: 0.21, rgba: "rgba(214, 242, 255, 0.97)" },                                    
        { k: 0.44, rgba: "rgba(255, 236, 166, 0.95)", liveBlend: [0.32, 0.06], oscK: { amp: 0.03, hz: 0.05 } },                                   
        { k: 0.46, rgba: "rgba(108, 214, 184, 0.95)", liveBlend: [0.24, 0.04] },          
        { k: 0.7, rgba: "rgba(82, 184, 146, 0.97)", liveBlend: [0.16, 0.2] },           
        { k: 1, rgba: "rgba(82, 184, 126, 0.97)", liveBlend: [0.12, 0.0]  }, 
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
      // sky
      { k: 0.0,  rgba: "rgb(59, 68, 116)",  rightRgba: "rgb(12, 13, 45)" },
      { k: 0.20, rgba: "rgb(73, 91, 152)",  rightRgba: "rgb(33, 54, 95)" },
      { k: 0.34, rgba: "rgb(83, 114, 177)", rightRgba: "rgb(49, 92, 136)" },
      { k: 0.45, rgba: "rgb(90, 144, 202)", rightRgba: "rgb(60, 117, 161)" },
      { k: 0.535, rgba: "rgb(154, 230, 255)", rightRgba: "rgb(91, 156, 196)", liveBlend: [0.04, 0.12] },
      // ground
      { k: 0.535, rgba: "rgb(170, 238, 243)", rightRgba: "rgb(210, 236, 169)", liveBlend: [0.06, 0.12] },
      { k: 0.66,  rgba: "rgb(160, 228, 205)", rightRgba: "rgb(184, 210, 153)", liveBlend: [0.08, 0.10] },
      { k: 0.82,  rgba: "rgb(151, 209, 172)", rightRgba: "rgb(186, 198, 154)", liveBlend: [0.08, 0.12] },
      { k: 0.98,  rgba: "rgb(128, 186, 140)", rightRgba: "rgb(218, 200, 154)", liveBlend: [0.08, 0.10] },
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

export const BACKGROUNDS_START_DARK: StartBackgroundsByMode = {
  start: START_DARK,
  questionnaire: {
    base: "rgb(18, 26, 62)",
    overlay: {
      kind: "linear",
      from: { xK: 0.5, yK: 0.0 },
      to: { xK: 0.5, yK: 1.0 },
    stops: [
      // sky
      { k: 0.0,  rgba: "rgb(65, 93, 132)", rightRgba: "rgb(42, 53, 67)" },
      { k: 0.10, rgba: "rgb(58, 97, 151)", rightRgba: "rgb(57, 68, 92)" },
      { k: 0.22, rgba: "rgb(66, 117, 167)", rightRgba: "rgb(69, 85, 110)" }, 
      { k: 0.35, rgba: "rgb(75, 131, 171)", rightRgba: "rgb(57, 62, 101)" },
      { k: 0.42, rgba: "rgb(108, 171, 205)", rightRgba: "rgb(105, 60, 142)" },
      { k: 0.48, rgba: "rgb(139, 193, 255)", rightRgba: "rgb(119, 28, 120)", liveBlend: [0.06, 0.12] },
      // ground
      { k: 0.50, rgba: "rgb(209, 255, 249)", rightRgba: "rgb(116, 215, 192)", liveBlend: [0.06, 0.12] },
      { k: 0.53, rgba: "rgb(181, 225, 210)", rightRgba: "rgb(118, 200, 162)", liveBlend: [0.06, 0.11] },
      { k: 0.59, rgba: "rgb(164, 210, 185)", rightRgba: "rgb(125, 170, 148)", liveBlend: [0.07, 0.10] },
      { k: 0.6,  rgba: "rgb(175, 225, 193)", rightRgba: "rgb(142, 184, 145)", liveBlend: [0.08, 0.10] },
      { k: 0.75, rgba: "rgb(157, 211, 165)", rightRgba: "rgb(184, 202, 144)", liveBlend: [0.08, 0.12] },
      { k: 0.99, rgba: "rgb(152, 175, 135)", rightRgba: "rgb(177, 186, 138)", liveBlend: [0.08, 0.10] },
    ] as const,
    },
    stars: {
      count: [36, 56],
      topBandK: 0.36,
      minR: 0.6,
      maxR: 1.2,
      alpha: [[0.5, 1.5], [0.6, 1.6]],
      flickerHz: [[0.42, 0.98], [0.14, 0.34]],
    },
  },
} as const;
