// src/canvas-engine/adjustable-rules/backgrounds.ts

import { SceneLookupKey } from "./sceneMode";

export type RgbaStop = { k: number; rgba: string; oscK?: { amp: number; hz: number } }; // k in [0..1]
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

export type BackgroundSpec = {
  base: string; // used by p.background
  overlay?: RadialGradientSpec | LinearGradientSpec | SolidBackgroundSpec;
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
        { k: 0.6, rgba: "rgba(251, 252, 238, 0.9)" },
        { k: 0.6, rgba: "rgba(171, 200, 133, 0.64)" },
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
        { k: 0.0, rgba: "rgba(120, 188, 236, 0.42)" },
        { k: 0.25, rgba: "rgba(88, 156, 214, 0.38)" },
        { k: 0.59, rgba: "rgba(251, 252, 238, 0.9)" },
        { k: 0.59, rgba: "rgba(205, 229, 174, 0.92)" },
        { k: 1.0, rgba: "rgba(132, 168, 118, 0.95)" },
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
  base: "rgb(224, 240, 252)",
  overlay: {
    kind: "linear",
    from: { xK: 0.42, yK: 0.0 },
    to: { xK: 0.7, yK: 1.0 },
    stops: [
      { k: 0.0, rgba: "rgba(255,255,255,1.00)" },
      { k: 0.24, rgba: "rgba(245,252,255,0.92)" },
      { k: 0.58, rgba: "rgba(214,233,246,0.48)" },
      { k: 1.0, rgba: "rgba(164,209,236,0.92)" },
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
        { k: 0, rgba: "#1f1c3b" },
        { k: 0.3, rgba: "rgb(67, 65, 107)", oscK: { amp: 0.06, hz: 0.12 } },
        { k: 0.6, rgba: "#97b3e7" },
        { k: 0.6, rgba: "rgba(70, 98, 158, 0.95)" },
        { k: 1.0, rgba: "#263241", oscK: { amp: 0.06, hz: 0.12 } },
      ] as const,
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
        { k: 0, rgba: "#1f1c3b" },
        { k: 0.25, rgba: "#4D5586", oscK: { amp: 0.06, hz: 0.12 } },
        { k: 0.59, rgba: "#acbdf1" },
        { k: 0.59, rgba: "rgba(68, 96, 157, 0.95)" },
        { k: 1.0, rgba: "#2b314d", oscK: { amp: 0.06, hz: 0.12 } },
      ] as const,
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
  },
} as const;

const CITY_BACKGROUND_DARK: BackgroundSpec = {
  base: "rgb(12, 18, 26)",
  overlay: {
    kind: "linear",
    from: { xK: 0.4, yK: 0.0 },
    to: { xK: 0.7, yK: 1.0 },
    stops: [
      { k: 0.0, rgba: "#262624" },
      { k: 0.36, rgba: "rgba(39, 58, 79, 0.34)" },
      { k: 0.72, rgba: "rgba(20, 33, 47, 0.68)" },
      { k: 1.0, rgba: "rgba(8, 14, 21, 0.96)" },
    ] as const,
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
