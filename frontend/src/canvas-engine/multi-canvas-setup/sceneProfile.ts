// src/canvas-engine/multi-canvas-setup/sceneProfile.ts

import type { DeviceType } from "../shared/responsiveness";
import type { CanvasPaddingSpec } from "../adjustable-rules/canvas-padding";
import type { ScenePlacementRules } from "../adjustable-rules/placement-rules/index";
import type { BackgroundSpec } from "../adjustable-rules/backgrounds";
import type { RenderCachePolicy } from "../adjustable-rules/render-cache";

export type PaddingPolicyByDevice = Record<DeviceType, CanvasPaddingSpec | null>;

export interface SceneProfileContext {
  darkMode: boolean;
}

export interface SceneProfile {
  padding: PaddingPolicyByDevice;
  placements: ScenePlacementRules;
  background: BackgroundSpec;
  renderCache: RenderCachePolicy;
}
