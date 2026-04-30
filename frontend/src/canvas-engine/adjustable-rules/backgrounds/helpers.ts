// src/canvas-engine/adjustable-rules/BACKGROUNDS_LIGHT/helpers.ts

import type { SceneLookupKey } from "../sceneMode";

export type BackgroundStopAnchor = "visualHorizon" | "fogHorizon";

export type BackgroundStopK =
  | number
  | BackgroundStopAnchor
  | { anchor: BackgroundStopAnchor; offset?: number };

export type BackgroundAnchorContext = {
  // Canvas-padding horizonPos. Use when the color break should align with the
  // authored sky/ground split for this canvas instance.
  visualHorizonK: number;
  // Runtime fog seam. This is usually slightly above visualHorizon because fog
  // starts a few grid rows early to leave room for tall shapes near the horizon.
  fogHorizonK: number;
  // visual horizon signifies the end of the ground area backgrounds
  // the area between fogHorizon and visualHorizon still holds ground fog 
  // but I used a blue color here to visually cluster it with sky
  // as sky stops go further up the fog will dissolve based on distance
  // other techniques to make the blend more seamless per use case can be found in runtime/render/atmosphere/fog.ts 
  // check: SKY_FOG_HORIZON_BLEND_BY_DISTANCE and groundFogGradient + skyFogGradient.
};

export type RgbaStop = {
  k: BackgroundStopK; // vertical position of a color band - k in [0..1], or an engine anchor like k: "fogHorizon" or k: "visualHorizon".
  rgba: string; // color itself
  rightRgba?: string; // optional right-edge color for horizontal blends across this band
  oscK?: { amp: number; hz: number }; // oscillates color stops K value up and down for movement.
  liveBlend?: number | readonly [number, number]; // blends the bg stop with the livAvg lerp stops band
  blendFromPrevious?: boolean; // false creates a hard vertical edge at this stop
  blendToNext?: boolean; // false holds this stop until the next stop instead of interpolating
  fog?: { opacity: number; k?: BackgroundStopK }; // high level fog that uses the background color at
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
