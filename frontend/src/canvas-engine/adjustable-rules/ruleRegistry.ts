// src/canvas-engine/adjustable-rules/ruleRegistry.ts

import type { SceneProfile } from "../multi-canvas-setup/sceneProfile";
import type { SceneState, BaseMode } from "./sceneMode";
import { isQuestionnaire } from "./sceneMode";

import { CANVAS_PADDING }        from './canvas-padding/index';
import { SHAPE_PLACEMENTS } from "./placement-rules/index";
import { BACKGROUNDS } from "./backgrounds";

import { defineRuleSet } from "../validation/index";

function baseProfileFor(mode: BaseMode): SceneProfile {
  if (mode === "start") {
    return {
      padding: CANVAS_PADDING.start,
      placements: SHAPE_PLACEMENTS.start,
      background: BACKGROUNDS.start,
    };
  }

  return {
    padding: CANVAS_PADDING.city,
    placements: SHAPE_PLACEMENTS.city,
    background: BACKGROUNDS.city,
  };
}

function applyOverrides(profile: SceneProfile): SceneProfile {
  return {
    ...profile,
    padding: CANVAS_PADDING.questionnaire,
    placements: SHAPE_PLACEMENTS.questionnaire,
  };
}

export function resolveProfile(state: SceneState): SceneProfile {
  const base = baseProfileFor(state.baseMode);
  if (isQuestionnaire(state)) return applyOverrides(base);
  return base;
}

export const SCENE_RULESETS = {
  intro: defineRuleSet("intro", (state: SceneState) => resolveProfile(state)),

  city: defineRuleSet("city", (state: SceneState) =>
    resolveProfile({ ...state, baseMode: "city" })
  ),
} as const;
