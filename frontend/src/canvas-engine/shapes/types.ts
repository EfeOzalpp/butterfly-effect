import type { PLike } from "../runtime/p/makeP";
import type {
  GridFootprint,
  ProjectionContext,
  RGB,
  SceneLightContext,
} from "../modifiers/index";

export type ShapeCanvas = PLike;
export type ShapeSeed = string | number;
export type ShapePalette = Record<string, unknown>;
export type ShapeRenderPass = "color" | "silhouette";

export interface ShapePuffOverrides {
  count?: number;
  sizeMin?: number;
  sizeMax?: number;
  lifeMin?: number;
  lifeMax?: number;
  speedMin?: number;
  speedMax?: number;
  gravity?: number;
  drag?: number;
  spreadAngle?: number;
  alpha?: number;
}

export interface ShapeDrawOptions<Palette extends ShapePalette = ShapePalette> extends ProjectionContext {
  palette?: Palette;
  darkMode?: boolean;
  exposure?: number;
  contrast?: number;
  alpha?: number;
  liveAvg?: number;
  blend?: number;
  gradientRGB?: RGB | null;
  lightCtx?: SceneLightContext | null;
  timeMs?: number;
  dtSec?: number;
  rootAppearK?: number;
  seed?: ShapeSeed;
  seedKey?: ShapeSeed;
  shapeOccurrenceIndex?: number;
  footprint?: GridFootprint;
  usedRows?: number;
  allowUpscale?: boolean;
  fitToFootprint?: boolean;
  spriteMode?: boolean;
  coreScaleMult?: number;
  pixelScale?: number;
  particlePixelScale?: number;

  renderPass?: ShapeRenderPass;
  silhouetteColor?: RGB;
  silhouetteAlpha?: number;
  depthTintColor?: RGB;
  depthTintK?: number;
}

export type ShapeDrawFn<Options extends ShapeDrawOptions = ShapeDrawOptions> = (
  p: ShapeCanvas,
  cx: number,
  cy: number,
  r: number,
  opts?: Options
) => void;
