import type { SceneLookupKey } from "../../scene-state";

export interface AmbientParticleColorStop {
  color: string;
  alpha?: number;
}

export interface AmbientParticleLayerSpec {
  count: number | readonly [number, number];
  xRange?: readonly [number, number];
  yRange?: readonly [number, number];
  sizePx: readonly [number, number];
  speedX?: readonly [number, number];
  speedY?: readonly [number, number];
  color: string | readonly AmbientParticleColorStop[];
  alpha?: number;
  seed?: number;
}

export interface AmbientParticlesSceneSpec {
  layers: readonly AmbientParticleLayerSpec[];
  variants?: readonly (AmbientParticlesSceneSpec | null)[];
}

export type AmbientParticlesSpecsByMode = Record<SceneLookupKey, AmbientParticlesSceneSpec | null>;
