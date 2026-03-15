// src/canvas-engine/adjustable-rules/ruleRegistry.ts

import type { SceneProfile } from "../multi-canvas-setup/sceneProfile";
import type { SceneState, BaseMode } from "./sceneMode";
import { isQuestionnaire } from "./sceneMode";

import { CANVAS_PADDING } from "./canvasPadding";
import { SHAPE_BANDS } from "./placementRules";
import { SEPARATION_META } from "./separationMeta";
import { POOL_SIZES } from "./poolSizes";
import { QUOTA_SPECIFICATION } from "./quotaSpecification";
import { BACKGROUNDS } from "./backgrounds"; 

import { defineRuleSet } from "../validation/index";

// -------- Base profiles (by BaseMode) --------

function baseProfileFor(mode: BaseMode): SceneProfile {
  if (mode === "start") {
    return {
      padding: CANVAS_PADDING.start,
      bands: SHAPE_BANDS.start,
      separationMeta: SEPARATION_META.start,
      poolSizes: POOL_SIZES.start,
      quotaSpecification: QUOTA_SPECIFICATION.start,
      background: BACKGROUNDS.start,
    };
  }

  // city
  return {
    padding: CANVAS_PADDING.city,
    bands: SHAPE_BANDS.city,
    separationMeta: SEPARATION_META.city,
    poolSizes: POOL_SIZES.city,
    quotaSpecification: QUOTA_SPECIFICATION.city,
    background: BACKGROUNDS.city,
  };
}

// -------- Modifier overrides --------

function applyQuestionnaireOverrides(profile: SceneProfile): SceneProfile {
  return {
    ...profile,
    padding: CANVAS_PADDING.questionnaire,
    bands: SHAPE_BANDS.questionnaire,
    separationMeta: SEPARATION_META.questionnaire ?? profile.separationMeta,
    poolSizes: POOL_SIZES.questionnaire,
    quotaSpecification: QUOTA_SPECIFICATION.questionnaire ?? profile.quotaSpecification,
    // keep background from base unless you decide otherwise
  };
}

// -------- Public resolver for profile --------

export function resolveProfile(state: SceneState): SceneProfile {
  const base = baseProfileFor(state.baseMode);
  if (isQuestionnaire(state)) return applyQuestionnaireOverrides(base);
  return base;
}

export const SCENE_RULESETS = {
  intro: defineRuleSet("intro", (state: SceneState) => resolveProfile(state)),

  city: defineRuleSet("city", (state: SceneState) =>
    resolveProfile({ ...state, baseMode: "city" })
  ),
} as const;
