import type { SpotlightSignal } from "../../hooks/signals";
import type { AmbientParticlesSceneSpec } from "../../scene-rules/ambient-particles";
import type { BackgroundSpec } from "../../scene-rules/backgrounds";
import type { FoliageSceneSpec } from "../../scene-rules/foliage";

function positiveModulo(value: number, length: number) {
  return ((value % length) + length) % length;
}

export function resolveRuntimeBackground(
  background: BackgroundSpec | null,
  spotlight: SpotlightSignal | null
): BackgroundSpec | null {
  const variants = background?.variants;
  if (!variants?.length) return background;

  if (!spotlight) {
    return variants[0] ?? null;
  }

  return variants[positiveModulo(spotlight.index, variants.length)];
}

export function resolveRuntimeAmbientParticles(
  ambientParticles: AmbientParticlesSceneSpec | null,
  spotlight: SpotlightSignal | null
): AmbientParticlesSceneSpec | null {
  const variants = ambientParticles?.variants;
  if (!variants?.length) return ambientParticles;

  if (!spotlight) {
    return variants[0] ?? null;
  }

  return variants[positiveModulo(spotlight.index, variants.length)] ?? null;
}

export function resolveRuntimeFoliage(
  foliage: FoliageSceneSpec | null,
  spotlight: SpotlightSignal | null
): FoliageSceneSpec | null {
  const variants = foliage?.variants;
  if (!variants?.length) return foliage;

  if (!spotlight) {
    return variants[0] ?? null;
  }

  return variants[positiveModulo(spotlight.index, variants.length)] ?? null;
}

