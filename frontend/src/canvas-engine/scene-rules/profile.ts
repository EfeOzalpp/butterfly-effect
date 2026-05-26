import type { SceneState } from "../scene-state";
import type { DeviceType } from "../shared/responsiveness";
import type { BackgroundSpec } from "./backgrounds";
import type { CanvasPaddingSpec } from "./canvas-padding";
import type { ScenePlacementRules } from "./placement-rules";
import type { RenderCachePolicy } from "./render-cache";

// Scene rules own the full visual profile. Hosts select a ruleset; validation
// checks it; runtime consumes the resolved profile.
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

export interface SceneRuleSet {
  id: string;
  getProfile: (state: SceneState, context: SceneProfileContext) => SceneProfile;
}
