import type { BackgroundSpec } from "../../backgrounds";
import type { ScenePlacementRuleMap } from "../../placement-rules";
import { centeredCount, spotlightRows, type SpotlightSlide } from "./types";

const treesBackground: BackgroundSpec = {
  base: "rgb(38, 47, 44)",
  overlay: {
    kind: "radial",
    center: { xK: 0.5, yK: 0.44 },
    innerK: 0.08,
    outer: { k: 0.84 },
    stops: [
      { rgba: "rgba(168, 222, 169, 0.16)" },
      { rgba: "rgba(84, 124, 90, 0.24)" },
      { rgba: "rgba(43, 43, 54, 0)" },
    ] as const,
  },
} as const;

const treesDarkBackground: BackgroundSpec = {
  base: "rgb(35, 43, 43)",
  overlay: {
    kind: "linear",
    from: { xK: 0.5, yK: 0.0 },
    to: { xK: 0.5, yK: 1.0 },
    stops: [
      { rgba: "rgba(84, 126, 100, 0.38)" },
      { rgba: "rgba(66, 92, 82, 0.24)" },
      { rgba: "rgba(43, 43, 54, 0)" },
    ] as const,
  },
} as const;

const treesPlacement: ScenePlacementRuleMap = {
  trees: {
    absolute: {
      kind: "center",
      count: centeredCount,
    },
  },
};

export const treesSlide = {
  id: "trees",
  shape: "trees",
  background: treesBackground,
  darkBackground: treesDarkBackground,
  padding: spotlightRows(3),
  placement: treesPlacement,
} as const satisfies SpotlightSlide;
