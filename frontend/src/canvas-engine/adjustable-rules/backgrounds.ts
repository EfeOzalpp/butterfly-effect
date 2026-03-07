// src/canvas-engine/adjustable-rules/backgrounds.ts

import { SceneLookupKey } from "./sceneMode";

export type RgbaStop = { k: number; rgba: string }; // k in [0..1]
export type RadialGradientSpec = {
  kind: "radial";
  center: { xK: number; yK: number };   
  innerK: number;                          
  outer: "diag" | { k: number };            
  stops: readonly RgbaStop[];
};

export type SolidBackgroundSpec = {
  kind: "solid";
  color: string; // css color
};

export type BackgroundSpec = {
  base: string; // used by p.background
  overlay?: RadialGradientSpec | SolidBackgroundSpec;
};

export type BackgroundsByMode = Record<SceneLookupKey, BackgroundSpec>;

const START_BACKGROUND: BackgroundSpec = {
  base: "rgb(229, 246, 255)",
  overlay: {
    kind: "radial",
    center: { xK: 0.5, yK: 0.82 },
    innerK: 0.06,
    outer: "diag",
    stops: [
      { k: 0.0, rgba: "rgba(255,255,255,1.00)" },
      { k: 0.2, rgba: "rgba(255,255,255,0.90)" },
      { k: 0.4, rgba: "rgba(255,255,255,0.60)" },
      { k: 0.5, rgba: "rgba(255,255,255,0.30)" },
      { k: 0.65, rgba: "rgba(210,230,246,0.18)" },
      { k: 0.9, rgba: "rgba(0, 157, 255, 0.1)" },
      { k: 1.0, rgba: "rgba(180,228,253,1.00)" },
    ] as const,
  },
} as const;

export const BACKGROUNDS: BackgroundsByMode = {
  start: START_BACKGROUND,
  sectionOpen: START_BACKGROUND,

  questionnaire: {
    base: "rgb(229, 246, 255)",
    overlay: {
      kind: "radial",
      center: { xK: 0.5, yK: 0.82 },
      innerK: 0.06,
      outer: "diag",
      stops: [
        { k: 0.0, rgba: "rgba(255,255,255,1.00)" },
        { k: 0.4, rgba: "rgba(255,255,255,0.55)" },
        { k: 1.0, rgba: "rgba(180,228,253,1.00)" },
      ] as const,
    },
  },

  overlay: {
    base: "rgb(229, 246, 255)",
    overlay: {
      kind: "radial",
      center: { xK: 0.5, yK: 0.82 },
      innerK: 0.06,
      outer: "diag",
      stops: [
        { k: 0.0, rgba: "rgba(255,255,255,1.00)" },
        { k: 0.2, rgba: "rgba(255,255,255,0.85)" },
        { k: 1.0, rgba: "rgba(160,220,250,1.00)" },
      ] as const,
    },
  },
} as const;

const START_BACKGROUND_DARK: BackgroundSpec = {
  base: "rgb(16, 22, 30)",
  overlay: {
    kind: "radial",
    center: { xK: 0.5, yK: 0.8 },
    innerK: 0.05,
    outer: "diag",
    stops: [
      { k: 0.0, rgba: "rgba(56, 78, 104, 0.28)" },
      { k: 0.35, rgba: "rgba(32, 48, 67, 0.32)" },
      { k: 0.7, rgba: "rgba(18, 30, 44, 0.62)" },
      { k: 1.0, rgba: "rgba(10, 16, 24, 0.96)" },
    ] as const,
  },
} as const;

export const BACKGROUNDS_DARK: BackgroundsByMode = {
  start: START_BACKGROUND_DARK,
  sectionOpen: START_BACKGROUND_DARK,
  questionnaire: {
    base: "rgb(18, 24, 33)",
    overlay: {
      kind: "radial",
      center: { xK: 0.5, yK: 0.8 },
      innerK: 0.05,
      outer: "diag",
      stops: [
        { k: 0.0, rgba: "rgba(70, 96, 126, 0.24)" },
        { k: 0.42, rgba: "rgba(36, 54, 74, 0.30)" },
        { k: 1.0, rgba: "rgba(11, 18, 27, 0.95)" },
      ] as const,
    },
  },
  overlay: {
    base: "rgb(14, 20, 28)",
    overlay: {
      kind: "radial",
      center: { xK: 0.5, yK: 0.8 },
      innerK: 0.05,
      outer: "diag",
      stops: [
        { k: 0.0, rgba: "rgba(76, 103, 134, 0.22)" },
        { k: 0.2, rgba: "rgba(43, 62, 84, 0.28)" },
        { k: 1.0, rgba: "rgba(9, 15, 22, 0.96)" },
      ] as const,
    },
  },
} as const;

export function backgroundForTheme(
  key: SceneLookupKey,
  darkMode: boolean
): BackgroundSpec {
  return darkMode ? BACKGROUNDS_DARK[key] : BACKGROUNDS[key];
}
