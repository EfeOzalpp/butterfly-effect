// src/canvas-engine/multi-canvas-setup/types.ts
import type { SceneProfile } from "./sceneProfile";
import type { SceneMode } from "../adjustable-rules/sceneRuleSets";

export type SceneRuleSet = {
  id: string;
  getProfile: (mode: SceneMode) => SceneProfile;
};
