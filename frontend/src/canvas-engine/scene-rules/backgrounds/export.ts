// src/canvas-engine/scene-rules/backgrounds/export.ts
// shim - re-exports the public backgrounds API.

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
  StartBackgroundsByMode,
  QuestionnaireBackgroundsByMode,
  CityBackgroundsByMode,
  SpotlightBackgroundsByMode,
} from "./index";

export {
  BACKGROUNDS,
  BACKGROUNDS_LIGHT,
  BACKGROUNDS_DARK,
  BACKGROUNDS_START_DARK,
  BACKGROUNDS_QUESTIONNAIRE,
  BACKGROUNDS_QUESTIONNAIRE_DARK,
  BACKGROUNDS_CITY,
  BACKGROUNDS_CITY_DARK,
  BACKGROUNDS_SPOTLIGHT,
  BACKGROUNDS_SPOTLIGHT_DARK,
} from "./index";
