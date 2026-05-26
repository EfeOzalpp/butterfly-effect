// src/canvas-engine/validation/defineRuleSet.ts

import type { SceneState, SceneLookupKey } from "../scene-state";
import { isQuestionnaire } from "../scene-state";
import type { SceneProfile, SceneProfileContext, SceneRuleSet } from "../scene-rules/profile";
import { validateSceneProfile } from "./validateSceneProfile";

function lookupKeyFromState(state: SceneState): SceneLookupKey {
  return isQuestionnaire(state) ? "questionnaire" : state.baseMode;
}

export function defineRuleSet(
  id: string,
  getProfile: (state: SceneState, context: SceneProfileContext) => SceneProfile
): SceneRuleSet {
  return {
    id,
    getProfile: (state: SceneState, context: SceneProfileContext) => {
      const profile = getProfile(state, context);
      validateSceneProfile(id, lookupKeyFromState(state), profile);
      return profile;
    },
  };
}
