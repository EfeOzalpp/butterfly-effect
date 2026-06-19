import type { SceneState } from "../scene-state";
import type { BackgroundSpec } from "./backgrounds";
import type { AmbientParticlesSceneSpec } from "./ambient-particles";
import type { CanvasPaddingPolicy } from "./canvas-padding";
import type { FogSceneSpec } from "./fog";
import type { FoliageSceneSpec } from "./foliage";
import type { ScenePlacementRules } from "./placement-rules";
import type { RenderCachePolicy } from "../runtime/render/cache-policy";
import type { DeviceCountScale } from "../shared/responsiveness";

// Scene rules own the full visual profile. Hosts select a ruleset; validation
// checks it; runtime consumes the resolved profile.
export interface SceneProfileContext {
  darkMode: boolean;
}

export interface SceneProfile {
  padding: CanvasPaddingPolicy;
  placements: ScenePlacementRules;
  background: BackgroundSpec;
  ambientParticles: AmbientParticlesSceneSpec | null;
  fog: FogSceneSpec | null;
  foliage: FoliageSceneSpec | null;
  renderCache: RenderCachePolicy;
  landscapeCountScale?: DeviceCountScale;
}

export interface SceneRuleSet {
  id: string;
  getProfile: (state: SceneState, context: SceneProfileContext) => SceneProfile;
}
