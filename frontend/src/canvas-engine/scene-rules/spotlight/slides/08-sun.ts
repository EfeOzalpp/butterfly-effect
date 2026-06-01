import type { BackgroundSpec } from "../../backgrounds";
import type { ScenePlacementRuleMap } from "../../placement-rules";
import { centeredCount, spotlightRows, type SpotlightSlide } from "./types";

const sunBackground: BackgroundSpec = {
  base: "rgb(50, 43, 50)",
  overlay: {
    kind: "radial",
    center: { xK: 0.5, yK: 0.38 },
    innerK: 0.08,
    outer: { k: 0.86 },
    stops: [
      { rgba: "rgba(255, 229, 151, 0.26)" },
      { rgba: "rgba(154, 109, 83, 0.22)" },
      { rgba: "rgba(43, 43, 54, 0)" },
    ] as const,
  },
} as const;

const sunDarkBackground: BackgroundSpec = {
  base: "rgb(45, 40, 52)",
  overlay: {
    kind: "radial",
    center: { xK: 0.5, yK: 0.38 },
    innerK: 0.08,
    outer: { k: 0.86 },
    stops: [
      { rgba: "rgba(255, 230, 166, 0.18)" },
      { rgba: "rgba(132, 103, 86, 0.24)" },
      { rgba: "rgba(43, 43, 54, 0)" },
    ] as const,
  },
} as const;

const sunPlacement: ScenePlacementRuleMap = {
  sun: {
    absolute: {
      kind: "center",
      count: centeredCount,
    },
  },
};

export const sunSlide = {
  id: "sun",
  shape: "sun",
  background: sunBackground,
  darkBackground: sunDarkBackground,
  padding: spotlightRows(3),
  placement: sunPlacement,
} as const satisfies SpotlightSlide;
