// src/canvas-engine/validation/defineRuleSet.ts

import type { SceneProfile } from "../multi-canvas-setup/sceneProfile";
import type { SceneState, SceneLookupKey } from "../adjustable-rules/sceneMode";
import { isQuestionnaire } from "../adjustable-rules/sceneMode";
import { validateSceneProfile } from "./validateSceneProfile";
import type { SceneRuleSet } from "../multi-canvas-setup/types";

function lookupKeyFromState(state: SceneState): SceneLookupKey {
  return isQuestionnaire(state) ? "questionnaire" : state.baseMode;
}

export function defineRuleSet(
  id: string,
  getProfile: (state: SceneState) => SceneProfile
): SceneRuleSet {
  return {
    id,
    getProfile: (state: SceneState) => {
      const profile = getProfile(state);
      validateSceneProfile(id, lookupKeyFromState(state), profile);
      return profile;
    },
  };
}