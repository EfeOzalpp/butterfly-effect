// src/canvas-engine/adjustable-rules/backgrounds/index.ts

export type {
  RgbaStop,
  RadialGradientSpec,
  LinearGradientSpec,
  SolidBackgroundSpec,
  BackgroundSpec,
  BackgroundsByMode,
  BackgroundHost,
} from "./helpers";

export { BACKGROUNDS_START, BACKGROUNDS_START_DARK } from "./start";
export { CITY_BACKGROUND, BACKGROUNDS_CITY, CITY_BACKGROUND_DARK, BACKGROUNDS_CITY_DARK } from "./city";

import type { BackgroundHost, BackgroundSpec, BackgroundsByMode } from "./helpers";
import type { SceneLookupKey } from "../sceneMode";
import { BACKGROUNDS_START, BACKGROUNDS_START_DARK } from "./start";
import { BACKGROUNDS_CITY, BACKGROUNDS_CITY_DARK } from "./city";

// Convenience alias matching the old export name
export const BACKGROUNDS: BackgroundsByMode = BACKGROUNDS_START;
export const BACKGROUNDS_DARK: BackgroundsByMode = BACKGROUNDS_START_DARK;

export function backgroundForTheme(
  host: BackgroundHost,
  key: SceneLookupKey,
  darkMode: boolean
): BackgroundSpec {
  if (host === "city") {
    return darkMode ? BACKGROUNDS_CITY_DARK[key] : BACKGROUNDS_CITY[key];
  }
  return darkMode ? BACKGROUNDS_START_DARK[key] : BACKGROUNDS_START[key];
}
