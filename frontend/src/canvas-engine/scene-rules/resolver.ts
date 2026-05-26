// src/canvas-engine/scene-rules/resolver.ts

import type { SceneState, BaseMode } from "../scene-state";
import { isQuestionnaire } from "../scene-state";
import type { SceneProfile, SceneProfileContext } from "./profile";

import { CANVAS_PADDING } from "./canvas-padding/index";
import { SHAPE_PLACEMENTS } from "./placement-rules/index";
import {
  BACKGROUNDS_CITY,
  BACKGROUNDS_CITY_DARK,
  BACKGROUNDS_LIGHT,
  BACKGROUNDS_START_DARK,
  type BackgroundSpec,
} from "./backgrounds";
import { DEFAULT_RENDER_CACHE_POLICY } from "./render-cache";

type SceneRules = Pick<SceneProfile, "padding" | "placements">;

// Base mode gives us the scene's default layout rules before modifiers are applied.
function baseRulesFor(mode: BaseMode): SceneRules {
  if (mode === "start") {
    return {
      padding: CANVAS_PADDING.start,
      placements: SHAPE_PLACEMENTS.start,
    };
  }

  return {
    padding: CANVAS_PADDING.city,
    placements: SHAPE_PLACEMENTS.city,
  };
}

// Questionnaire keeps the base scene but swaps in its own layout constraints.
function applyQuestionnaireOverrides(rules: SceneRules): SceneRules {
  return {
    ...rules,
    padding: CANVAS_PADDING.questionnaire,
    placements: SHAPE_PLACEMENTS.questionnaire,
  };
}

// Background is resolved here so the scene profile owns the full visual contract.
function backgroundForState(
  state: SceneState,
  context: SceneProfileContext
): BackgroundSpec {
  if (state.baseMode === "city") {
    return context.darkMode ? BACKGROUNDS_CITY_DARK.city : BACKGROUNDS_CITY.city;
  }

  if (isQuestionnaire(state)) {
    return context.darkMode
      ? BACKGROUNDS_START_DARK.questionnaire
      : BACKGROUNDS_LIGHT.questionnaire;
  }

  return context.darkMode ? BACKGROUNDS_START_DARK.start : BACKGROUNDS_LIGHT.start;
}

export function resolveProfile(
  state: SceneState,
  context: SceneProfileContext
): SceneProfile {
  const baseRules = baseRulesFor(state.baseMode);
  const rules = isQuestionnaire(state)
    ? applyQuestionnaireOverrides(baseRules)
    : baseRules;

  return {
    ...rules,
    background: backgroundForState(state, context),
    renderCache: DEFAULT_RENDER_CACHE_POLICY,
  };
}
