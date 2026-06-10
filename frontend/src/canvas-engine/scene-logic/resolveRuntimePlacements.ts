import type { ScenePlacementRules } from "../scene-rules/placement-rules";

function positiveModulo(value: number, length: number) {
  return ((value % length) + length) % length;
}

export function resolveRuntimePlacements(
  placements: ScenePlacementRules,
  spotlightIndex: number | undefined
): ScenePlacementRules {
  const variants = placements.variants;
  if (!variants?.length) return placements;

  if (typeof spotlightIndex !== "number") {
    return variants[0] ?? placements;
  }

  return variants[positiveModulo(spotlightIndex, variants.length)];
}

