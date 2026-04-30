// src/canvas-engine/adjustable-rules/BACKGROUNDS_LIGHT.ts
// shim — re-exports from BACKGROUNDS_LIGHT/index.ts

export type {
  RgbaStop,
  BackgroundStopAnchor,
  BackgroundStopK,
  BackgroundAnchorContext,
  RadialGradientSpec,
  LinearGradientSpec,
  SolidBackgroundSpec,
  BackgroundSpec,
  BackgroundsByMode,
  StartBackgroundLookupKey,
  StartBackgroundsByMode,
  BackgroundHost,
} from "./backgrounds/index";

export {
  BACKGROUNDS,
  BACKGROUNDS_LIGHT,
  BACKGROUNDS_DARK,
  BACKGROUNDS_START_DARK,
  BACKGROUNDS_CITY,
  BACKGROUNDS_CITY_DARK,
  CITY_BACKGROUND,
  CITY_BACKGROUND_DARK,
  backgroundForTheme,
} from "./backgrounds/index";
