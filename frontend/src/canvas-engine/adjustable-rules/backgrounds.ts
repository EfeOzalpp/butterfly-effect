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

export const BACKGROUNDS: BackgroundsByMode = {
  start: {
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
        { k: 0.9, rgba: "rgba(190,229,253,0.10)" },
        { k: 1.0, rgba: "rgba(180,228,253,1.00)" },
      ] as const,
    },
  },

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
