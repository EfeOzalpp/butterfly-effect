import type { CanvasDrawSurface } from "../shared/canvas";
import type {
  GridFootprint,
  ProjectionContext,
  RGB,
  SceneLightContext,
  ShapeRenderPassOptions,
} from "../modifiers/index";
import type { ParticleStore } from "../modifiers/particles";

export type ShapeCanvas = CanvasDrawSurface;
export type ShapeSeed = string | number;

// Base palette contract. Individual shapes narrow this into concrete palette
// types such as `BusPalette` or `HousePalette`.
export type ShapePalette = Record<string, unknown>;

// Projection is the shape's view of grid placement. It starts with the shared
// projection context and adds per-item placement data.
export interface ShapeProjectionOptions extends ProjectionContext {
  footprint?: GridFootprint;
  usedRows?: number;
}

// Scene style shared by all shapes. `palette` is generic because each shape owns
// its palette shape; runtime normally omits it.
export interface ShapeStyleOptions<Palette extends ShapePalette = ShapePalette> {
  palette?: Palette;
  darkMode?: boolean;
  exposure?: number;
  contrast?: number;
  alpha?: number;
  liveAvg?: number;
  blend?: number;
  gradientRGB?: RGB | null;
  // Runtime creates the scene light context; shapes decide how their own
  // surfaces respond to it through light sampling and paint helpers.
  lightCtx?: SceneLightContext | null;
}

// Frame timing and appear state. These are grouped so animation inputs do not
// get mixed into geometry or color options. `rootAppearK` is produced by the
// runtime lifecycle and consumed by the modifier layer's default root appear.
export interface ShapeLifecycleOptions {
  timeMs?: number;
  dtSec?: number;
  rootAppearK?: number;
}

// Stable identity inputs for seeded variation and repeated shape instances.
export interface ShapeIdentityOptions {
  seed?: ShapeSeed;
  seedKey?: ShapeSeed;
  shapeOccurrenceIndex?: number;
}

// Sprite/export controls. These affect offscreen texture rendering and fit
// behavior, not the shape's palette or scene state.
export interface ShapeSpriteOptions {
  allowUpscale?: boolean;
  fitToFootprint?: boolean;
  spriteMode?: boolean;
  coreScaleMult?: number;
  pixelScale?: number;
  particlePixelScale?: number;
  disableParticleDepthTint?: boolean;
}

// Engine-owned particle state passed to particle-backed shapes.
export interface ShapeParticleOptions {
  particleStore?: ParticleStore;
}

// The full grouped options object that a draw function receives.
export interface ShapeOptionGroups<Palette extends ShapePalette = ShapePalette> {
  projection?: ShapeProjectionOptions;
  style?: ShapeStyleOptions<Palette>;
  lifecycle?: ShapeLifecycleOptions;
  identity?: ShapeIdentityOptions;
  sprite?: ShapeSpriteOptions;
  particles?: ShapeParticleOptions;
  pass?: ShapeRenderPassOptions;
}

// Public draw-options type. Shape files usually bind the generic to their
// concrete palette type, then add any shape-only options in an extending
// interface.
export type ShapeDrawOptions<Palette extends ShapePalette = ShapePalette> =
  ShapeOptionGroups<Palette>;

// Canonical shape draw signature used by registries and direct callers.
export type ShapeDrawFn<Options extends ShapeDrawOptions = ShapeDrawOptions> = (
  p: ShapeCanvas,
  cx: number,
  cy: number,
  r: number,
  opts?: Options
) => void;
