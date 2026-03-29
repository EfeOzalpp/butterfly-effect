// src/canvas-engine/adjustable-rules/backgrounds.ts
// shim — re-exports from backgrounds/index.ts

export type {
  RgbaStop,
  RadialGradientSpec,
  LinearGradientSpec,
  SolidBackgroundSpec,
  BackgroundSpec,
  BackgroundsByMode,
  BackgroundHost,
} from "./backgrounds/index";

export {
  BACKGROUNDS,
  BACKGROUNDS_START,
  BACKGROUNDS_DARK,
  BACKGROUNDS_START_DARK,
  BACKGROUNDS_CITY,
  BACKGROUNDS_CITY_DARK,
  CITY_BACKGROUND,
  CITY_BACKGROUND_DARK,
  backgroundForTheme,
} from "./backgrounds/index";
