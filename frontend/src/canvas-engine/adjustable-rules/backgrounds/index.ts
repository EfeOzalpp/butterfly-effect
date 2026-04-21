// src/canvas-engine/adjustable-rules/BACKGROUNDS_LIGHT/index.ts

export type {
  RgbaStop,
  RadialGradientSpec,
  LinearGradientSpec,
  SolidBackgroundSpec,
  BackgroundSpec,
  BackgroundsByMode,
  StartBackgroundLookupKey,
  StartBackgroundsByMode,
  BackgroundHost,
} from "./helpers";

export { BACKGROUNDS_LIGHT, BACKGROUNDS_START_DARK } from "./start";
export { CITY_BACKGROUND, BACKGROUNDS_CITY, CITY_BACKGROUND_DARK, BACKGROUNDS_CITY_DARK } from "./city";

import type { BackgroundHost, BackgroundSpec, BackgroundsByMode, StartBackgroundsByMode, StartBackgroundLookupKey } from "./helpers";
import type { SceneLookupKey } from "../sceneMode";
import { BACKGROUNDS_LIGHT, BACKGROUNDS_START_DARK } from "./start";
import { BACKGROUNDS_CITY, BACKGROUNDS_CITY_DARK, CITY_BACKGROUND, CITY_BACKGROUND_DARK } from "./city";

// Convenience alias matching the old export name
export const BACKGROUNDS: BackgroundsByMode = {
  ...BACKGROUNDS_LIGHT,
  city: CITY_BACKGROUND,
};

export const BACKGROUNDS_DARK: BackgroundsByMode = {
  ...BACKGROUNDS_START_DARK,
  city: CITY_BACKGROUND_DARK,
};

function startBackgroundKey(key: SceneLookupKey): StartBackgroundLookupKey {
  return key === "questionnaire" ? "questionnaire" : "start";
}

function startBackgroundForKey(
  backgrounds: StartBackgroundsByMode,
  key: SceneLookupKey
): BackgroundSpec {
  return backgrounds[startBackgroundKey(key)];
}

export function backgroundForTheme(
  host: BackgroundHost,
  key: SceneLookupKey,
  darkMode: boolean
): BackgroundSpec {
  if (host === "city") {
    return darkMode ? BACKGROUNDS_CITY_DARK[key] : BACKGROUNDS_CITY[key];
  }
  return startBackgroundForKey(darkMode ? BACKGROUNDS_START_DARK : BACKGROUNDS_LIGHT, key);
}
