// src/canvas-engine/adjustable-rules/backgrounds.ts

import { SceneLookupKey } from "./sceneMode";

export type RgbaStop = {
  k: number;
  rgba: string;
  oscK?: { amp: number; hz: number };
  liveBlend?: number | readonly [number, number];
  fog?: { opacity: number; k?: number };
}; // k in [0..1]
export type RadialGradientSpec = {
  kind: "radial";
  center: { xK: number; yK: number };
  innerK: number;
  outer: "diag" | { k: number };
  stops: readonly RgbaStop[];
};

export type LinearGradientSpec = {
  kind: "linear";
  from: { xK: number; yK: number };
  to: { xK: number; yK: number };
  stops: readonly RgbaStop[];
};

export type SolidBackgroundSpec = {
  kind: "solid";
  color: string; // css color
};

export type ShapePaletteTheme = 'warm' | 'cool';

export type BackgroundSpec = {
  base: string; // used by p.background
  overlay?: RadialGradientSpec | LinearGradientSpec | SolidBackgroundSpec;
  shapePalette?: ShapePaletteTheme;
  stars?: {
    count: number | readonly [number, number];
    topBandK: number;
    minR: number;
    maxR: number;
    alpha: [number, number] | readonly [[number, number], [number, number]];
    flickerHz: [number, number] | readonly [[number, number], [number, number]];
  };
};

export type BackgroundsByMode = Record<SceneLookupKey, BackgroundSpec>;
export type BackgroundHost = "start" | "city";

const QUESTIONNAIRE_BACKGROUND: BackgroundSpec = {
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

export const BACKGROUNDS: BackgroundsByMode = {
  start: {
    base: "rgb(229, 246, 255)",
    overlay: {
      kind: "linear",
      from: { xK: 0.5, yK: 0.0 },
      to: { xK: 0.5, yK: 1.0 },
      stops: [
        { k: 0.0, rgba: "rgba(255, 255, 255, 1)" },
      ] as const,
    },
  },
  questionnaire: QUESTIONNAIRE_BACKGROUND,

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

const CITY_BACKGROUND: BackgroundSpec = {
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

const QUESTIONNAIRE_BACKGROUND_DARK: BackgroundSpec = {
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

export const BACKGROUNDS_DARK: BackgroundsByMode = {
  start: {
    base: "rgb(16, 22, 30)",
    overlay: {
      kind: "linear",
      from: { xK: 0.5, yK: 0.0 },
      to: { xK: 0.5, yK: 1.0 },
      stops: [
        { k: 0, rgba: "#5e6f82" },
        { k: 0.33, rgba: "#4f546f", oscK: { amp: 0.04, hz: 0.02 }, fog: { opacity: 0, k: 0} },
        { k: 0.52, rgba: "rgb(65, 65, 71)", liveBlend: [0.01, 0.01], fog: { opacity: 0.4, k: 0.33} },
        { k: 0.6, rgba: "#2c2c2c", fog: { opacity: 0.8, k: 0.55} },
        { k: 1, rgba: "#1d1c1c", oscK: { amp: 0.03, hz: 0.02 }, fog: { opacity: 0, k: 0.75} },
      ] as const,
    },
    stars: {
      count: [16, 28],
      topBandK: 0.4,
      minR: 0.9,
      maxR: 2.1,
      alpha: [[0.1, 0.46], [0.26, 0.82]],
      flickerHz: [[0.42, 0.98], [0.14, 0.34]],
    },
  },
  questionnaire: QUESTIONNAIRE_BACKGROUND_DARK,

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

const CITY_BACKGROUND_DARK: BackgroundSpec = {
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

export function backgroundForTheme(
  host: BackgroundHost,
  key: SceneLookupKey,
  darkMode: boolean
): BackgroundSpec {
  if (host === "city") {
    return darkMode ? BACKGROUNDS_CITY_DARK[key] : BACKGROUNDS_CITY[key];
  }
  return darkMode ? BACKGROUNDS_DARK[key] : BACKGROUNDS[key];
}