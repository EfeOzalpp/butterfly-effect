import type { SceneLookupKey } from "../../scene-state";
import type { BackgroundStopK } from "../backgrounds";

export interface FoliageColorStop {
  color: string;
  alpha?: number;
}

export interface FoliageLayerSpec {
  count: number | readonly [number, number];
  yK: BackgroundStopK;
  xRange?: readonly [number, number];
  heightPx: readonly [number, number];
  widthPx?: readonly [number, number];
  color: string | readonly FoliageColorStop[];
  alpha?: number;
  seed?: number;
}

export interface FoliageSceneSpec {
  layers: readonly FoliageLayerSpec[];
  variants?: readonly (FoliageSceneSpec | null)[];
}

export type FoliageSpecsByMode = Record<SceneLookupKey, FoliageSceneSpec | null>;
