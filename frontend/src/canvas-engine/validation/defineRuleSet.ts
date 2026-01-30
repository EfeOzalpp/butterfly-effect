// src/canvas-engine/validation/defineRuleSet.ts

import type { SceneProfile } from "../multi-canvas-setup/sceneProfile";
import type { SceneMode } from "../adjustable-rules/sceneRuleSets";
import { validateSceneProfile } from "./validateSceneProfile";
import type { SceneRuleSet } from "../multi-canvas-setup/types";

export function defineRuleSet(
  id: string,
  getProfile: (mode: SceneMode) => SceneProfile
): SceneRuleSet {
  return {
    id,
    getProfile: (mode) => {
      const profile = getProfile(mode);
      validateSceneProfile(id, mode, profile);
      return profile;
    },
  };
}