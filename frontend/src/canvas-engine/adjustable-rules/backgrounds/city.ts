// src/canvas-engine/adjustable-rules/backgrounds/city.ts

import type { BackgroundsByMode, BackgroundSpec } from "./helpers";

export const CITY_BACKGROUND: BackgroundSpec = {
  base: "rgb(214, 224, 244)",
  overlay: {
    kind: "linear",
    from: { xK: 0.36, yK: 0.0 },
    to: { xK: 0.62, yK: 1.0 },
    stops: [
      { k: 0.0, rgba: "rgba(247, 249, 255, 1.00)" },
      { k: 0.18, rgba: "rgba(224, 228, 255, 0.84)" },
      { k: 0.52, rgba: "rgba(185, 202, 244, 0.62)", liveBlend: [0.12, 0.04] },
      { k: 0.74, rgba: "rgba(123, 158, 220, 0.44)", liveBlend: [0.18, 0.06] },
      { k: 1.0, rgba: "rgba(72, 108, 186, 0.82)" },
    ] as const,
  },
} as const;

export const BACKGROUNDS_CITY: BackgroundsByMode = {
  start: CITY_BACKGROUND,
  questionnaire: CITY_BACKGROUND,
  city: CITY_BACKGROUND,
} as const;

// ── Dark ─────────────────────────────────────────────────────────────────────

export const CITY_BACKGROUND_DARK: BackgroundSpec = {
  base: "rgb(17, 19, 35)",
  overlay: {
    kind: "linear",
    from: { xK: 0.38, yK: 0.0 },
    to: { xK: 0.64, yK: 1.0 },
    stops: [
      { k: 0, rgba: "#242233" },
      { k: 0.25, rgba: "#4D5586", oscK: { amp: 0.04, hz: 0.02 } },
      { k: 0.58, rgba: "#acbdf1" },
      { k: 0.58, rgba: "rgba(68, 96, 158, 0.95)", liveBlend: [0.24, 0.08] },
      { k: 1.0, rgba: "#292d3d", oscK: { amp: 0.03, hz: 0.02 } },
    ] as const,
  },
  stars: {
    count: [10, 18],
    topBandK: 0.34,
    minR: 0.8,
    maxR: 1.7,
    alpha: [[0.05, 0.3], [0.16, 0.54]],
    flickerHz: [[0.34, 0.78], [0.12, 0.26]],
  },
} as const;

export const BACKGROUNDS_CITY_DARK: BackgroundsByMode = {
  start: CITY_BACKGROUND_DARK,
  questionnaire: CITY_BACKGROUND_DARK,
  city: CITY_BACKGROUND_DARK,
} as const;
