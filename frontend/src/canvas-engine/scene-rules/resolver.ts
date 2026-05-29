// src/canvas-engine/scene-rules/resolver.ts

import type { SceneLookupKey, SceneState } from "../scene-state";
import type { SceneProfile, SceneProfileContext } from "./profile";

import { CANVAS_PADDING } from "./canvas-padding/index";
import { SHAPE_PLACEMENTS } from "./placement-rules/index";
import {
  BACKGROUNDS_CITY,
  BACKGROUNDS_CITY_DARK,
  BACKGROUNDS_LIGHT,
  BACKGROUNDS_QUESTIONNAIRE,
  BACKGROUNDS_QUESTIONNAIRE_DARK,
  BACKGROUNDS_START_DARK,
  type BackgroundSpec,
} from "./backgrounds";
import { DEFAULT_RENDER_CACHE_POLICY } from "./render-cache";

type SceneRules = Pick<SceneProfile, "padding" | "placements">;

function rulesForLookupKey(lookupKey: SceneLookupKey): SceneRules {
  if (lookupKey === "start") {
    return {
      padding: CANVAS_PADDING.start,
      placements: SHAPE_PLACEMENTS.start,
    };
  }

  if (lookupKey === "questionnaire") {
    return {
      padding: CANVAS_PADDING.questionnaire,
      placements: SHAPE_PLACEMENTS.questionnaire,
    };
  }

  return {
    padding: CANVAS_PADDING.city,
    placements: SHAPE_PLACEMENTS.city,
  };
}

// Background is resolved here so the scene profile owns the full visual contract.
function backgroundForState(
  state: SceneState,
  context: SceneProfileContext
): BackgroundSpec {
  if (state.lookupKey === "city") {
    return context.darkMode ? BACKGROUNDS_CITY_DARK.city : BACKGROUNDS_CITY.city;
  }

  if (state.lookupKey === "questionnaire") {
    return context.darkMode
      ? BACKGROUNDS_QUESTIONNAIRE_DARK.questionnaire
      : BACKGROUNDS_QUESTIONNAIRE.questionnaire;
  }

  return context.darkMode ? BACKGROUNDS_START_DARK.start : BACKGROUNDS_LIGHT.start;
}

export function resolveProfile(
  state: SceneState,
  context: SceneProfileContext
): SceneProfile {
  return {
    ...rulesForLookupKey(state.lookupKey),
    background: backgroundForState(state, context),
    renderCache: DEFAULT_RENDER_CACHE_POLICY,
  };
}
