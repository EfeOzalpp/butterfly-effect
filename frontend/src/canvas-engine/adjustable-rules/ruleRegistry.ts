// src/canvas-engine/adjustable-rules/ruleRegistry.ts

import type { SceneProfile } from "../multi-canvas-setup/sceneProfile";
import type { SceneState, BaseMode } from "./sceneMode";
import { isQuestionnaire, isSectionOpen } from "./sceneMode";

import { CANVAS_PADDING } from "./canvasPadding";
import { SHAPE_BANDS } from "./placementRules";
import { SEPARATION_META } from "./separationMeta";
import { POOL_SIZES } from "./poolSizes";
import { QUOTA_SPECIFICATION } from "./quotaSpecification";
import { BACKGROUNDS } from "./backgrounds"; 

import { defineRuleSet } from "../validation/index";

const SHARED_BACKGROUND = BACKGROUNDS.start;

// -------- Base profiles (by BaseMode) --------

function baseProfileFor(mode: BaseMode): SceneProfile {
  if (mode === "start") {
    return {
      padding: CANVAS_PADDING.start,
      bands: SHAPE_BANDS.start,
      separationMeta: SEPARATION_META.start,
      poolSizes: POOL_SIZES.start,
      quotaSpecification: QUOTA_SPECIFICATION.start,
      background: SHARED_BACKGROUND,
    };
  }

  // overlay
  return {
    padding: CANVAS_PADDING.overlay,
    bands: SHAPE_BANDS.overlay,
    separationMeta: SEPARATION_META.overlay,
    poolSizes: POOL_SIZES.overlay,
    quotaSpecification: QUOTA_SPECIFICATION.overlay,
    background: SHARED_BACKGROUND,
  };
}

// -------- Modifier overrides --------

function applyQuestionnaireOverrides(profile: SceneProfile): SceneProfile {
  return {
    ...profile,
    padding: CANVAS_PADDING.questionnaire,
    bands: SHAPE_BANDS.questionnaire,
    poolSizes: POOL_SIZES.questionnaire,
    // keep quotaSpecification + background from base unless you decide otherwise
  };
}

// sectionOpen: only padding changes — shapes/quota/bands stay as base "start".
function applySectionOpenOverrides(profile: SceneProfile): SceneProfile {
  return {
    ...profile,
    padding: CANVAS_PADDING.sectionOpen,
    poolSizes: POOL_SIZES.sectionOpen,
  };
}

// -------- Public resolver for profile --------

export function resolveProfile(state: SceneState): SceneProfile {
  const base = baseProfileFor(state.baseMode);
  if (isQuestionnaire(state)) return applyQuestionnaireOverrides(base);
  if (isSectionOpen(state)) return applySectionOpenOverrides(base);
  return base;
}

export const SCENE_RULESETS = {
  intro: defineRuleSet("intro", (state: SceneState) => resolveProfile(state)),

  city: defineRuleSet("city", (state: SceneState) =>
    resolveProfile({ ...state, baseMode: "overlay" })
  ),
} as const;
