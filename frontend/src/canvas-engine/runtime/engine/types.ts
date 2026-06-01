import type { SceneLookupKey } from "../../scene-state";
import type { CanvasPaddingSpec } from "../../scene-rules/canvas-padding";
import type { BackgroundSpec } from "../../scene-rules/backgrounds";
import type { AmbientParticlesSceneSpec } from "../../scene-rules/ambient-particles";
import type { FogSceneSpec } from "../../scene-rules/fog";
import type { FoliageSceneSpec } from "../../scene-rules/foliage";
import type { RenderCachePolicy } from "../../scene-rules/render-cache";
import type { EngineLayoutMode } from "../platform/mount";
import type { DprMode } from "../platform/viewport";
import type { CanvasBounds } from "../../multi-canvas-setup/hostDefs";
import type { ShapeRegistry } from "../shape-adapter/registry";
import type { DebugFlags } from "../debug";
import type { RGB } from "../../shared/math";
import type { EngineFieldItem } from "./field";
import type { SpotlightSignal } from "../../hooks/signals";
import type { EngineShapeLightSource } from "./state";

export type { EngineFieldItem } from "./field";

export interface EngineInputsPayload {
  liveAvg?: number;
  spotlight?: SpotlightSignal;
}

// Style patch accepted from outside the runtime.
// The full default style lives in engine/state.ts; this is only the public update shape.
export interface EngineFieldStyle {
  r?: number;
  gradientRGBOverride?: RGB | null;
  blend?: number;
  perShapeScale?: Record<string, number>;
  exposure?: number;
  contrast?: number;
  appearMs?: number;
  appearStaggerMs?: number;
  darkMode?: boolean;
  fog?: boolean;
  shapeLightSource?: EngineShapeLightSource | null;
  debug?: Partial<DebugFlags>;
}

export interface EngineSceneProfile {
  lookupKey: SceneLookupKey;
  paddingSpec: CanvasPaddingSpec | null;
  background: BackgroundSpec | null;
  ambientParticles: AmbientParticlesSceneSpec | null;
  fog: FogSceneSpec | null;
  foliage: FoliageSceneSpec | null;
  renderCache: RenderCachePolicy;
}

export interface EngineSceneSource {
  getProfile: () => EngineSceneProfile;
}

export interface EngineControls {
  // inbound signals provided by outside of engine to drive movement on shapes
  setInputs: (args?: EngineInputsPayload) => void;

  // field payload
  setFieldItems: (nextItems?: EngineFieldItem[]) => void;
  setFieldStyle: (args?: EngineFieldStyle) => void;
  setFieldVisible: (v: boolean) => void;

  setSceneProfile: (profile: EngineSceneProfile) => void;

  setVisible: (v: boolean) => void;

  stop: () => void;

  readonly canvas: HTMLCanvasElement | null;
}

export interface StartCanvasEngineOpts {
  mount?: string;
  onReady?: (controls: EngineControls) => void;
  dprMode?: DprMode;
  zIndex?: number;
  layout?: EngineLayoutMode;
  bounds?: CanvasBounds;
  shapeRegistry?: ShapeRegistry;
  fpsCap?: number;
  initialDarkMode?: boolean;
}
