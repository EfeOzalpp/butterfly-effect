// src/canvas-engine/adjustable-rules/BACKGROUNDS_LIGHT/helpers.ts

import type { SceneLookupKey } from "../sceneMode";

export type RgbaStop = {
  k: number; // vertical position of a color band - k in [0..1]
  rgba: string; // color itself
  rightRgba?: string; // optional right-edge color for horizontal blends across this band
  oscK?: { amp: number; hz: number }; // oscillates color stops K value up and down for movement.
  liveBlend?: number | readonly [number, number]; // blends the bg stop with the livAvg lerp stops band
  fog?: { opacity: number; k?: number }; // high level fog that uses the background color at
  // specified opacity and K values above all shapes
};

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
export type StartBackgroundLookupKey = Exclude<SceneLookupKey, "city">;
export type StartBackgroundsByMode = Record<StartBackgroundLookupKey, BackgroundSpec>;
export type BackgroundHost = "start" | "city";
