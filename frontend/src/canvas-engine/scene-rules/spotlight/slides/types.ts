import type { AmbientParticlesSceneSpec } from "../../ambient-particles";
import type { BackgroundSpec } from "../../backgrounds";
import type { CanvasPaddingPolicyByDevice } from "../../canvas-padding";
import type { FoliageSceneSpec } from "../../foliage";
import type { ScenePlacementRuleMap } from "../../placement-rules";
import type { ShapeName } from "../../shapeCatalog";

export interface SpotlightSlide {
  id: string;
  shape: ShapeName;
  background: BackgroundSpec;
  darkBackground: BackgroundSpec;
  ambientParticles?: AmbientParticlesSceneSpec | null;
  darkAmbientParticles?: AmbientParticlesSceneSpec | null;
  foliage?: FoliageSceneSpec | null;
  darkFoliage?: FoliageSceneSpec | null;
  padding: CanvasPaddingPolicyByDevice;
  placement: ScenePlacementRuleMap;
}

export const centeredCount = { mobile: 1, tablet: 1, laptop: 1 } as const;

export function spotlightRows(rows: number): CanvasPaddingPolicyByDevice {
  return {
    mobile: {
      rows,
      useTopRatio: 1,
    },
    tablet: {
      rows,
      useTopRatio: 1,
    },
    laptop: {
      rows,
      useTopRatio: 1,
    },
  };
}
