// src/canvas-engine/multi-canvas-setup/types.ts

import type { SceneProfile } from "./sceneProfile";
import type { SceneState } from "../adjustable-rules/sceneMode";

export type SceneRuleSet = {
  id: string;
  getProfile: (state: SceneState) => SceneProfile;
};