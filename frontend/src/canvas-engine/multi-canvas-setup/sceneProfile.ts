// src/canvas-engine/multi-canvas-setup/sceneProfile.ts

import type { DeviceType } from "../shared/responsiveness";
import type { CanvasPaddingSpec } from "../adjustable-rules/canvasPadding";
import type { ScenePlacementRules } from "../adjustable-rules/placement-rules/index";
import type { BackgroundSpec } from "../adjustable-rules/backgrounds";

export type PaddingPolicyByDevice = Record<DeviceType, CanvasPaddingSpec | null>;

export type SceneProfile = {
  padding: PaddingPolicyByDevice;
  placements: ScenePlacementRules;
  background: BackgroundSpec;
};
