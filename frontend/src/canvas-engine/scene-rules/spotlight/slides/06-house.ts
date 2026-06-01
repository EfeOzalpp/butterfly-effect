import type { BackgroundSpec } from "../../backgrounds";
import type { ScenePlacementRuleMap } from "../../placement-rules";
import { centeredCount, spotlightRows, type SpotlightSlide } from "./types";

const houseBackground: BackgroundSpec = {
  base: "rgb(45, 43, 54)",
  overlay: {
    kind: "radial",
    center: { xK: 0.5, yK: 0.44 },
    innerK: 0.08,
    outer: { k: 0.82 },
    stops: [
      { rgba: "rgba(255, 229, 172, 0.16)" },
      { rgba: "rgba(126, 120, 91, 0.22)" },
      { rgba: "rgba(43, 43, 54, 0)" },
    ] as const,
  },
} as const;

const houseDarkBackground: BackgroundSpec = {
  base: "rgb(41, 39, 51)",
  overlay: {
    kind: "linear",
    from: { xK: 0.5, yK: 0.0 },
    to: { xK: 0.5, yK: 1.0 },
    stops: [
      { rgba: "rgba(96, 84, 116, 0.42)" },
      { rgba: "rgba(82, 74, 91, 0.24)" },
      { rgba: "rgba(43, 43, 54, 0)" },
    ] as const,
  },
} as const;

const housePlacement: ScenePlacementRuleMap = {
  house: {
    absolute: {
      kind: "center",
      count: centeredCount,
    },
  },
};

export const houseSlide = {
  id: "house",
  shape: "house",
  background: houseBackground,
  darkBackground: houseDarkBackground,
  padding: spotlightRows(5),
  placement: housePlacement,
} as const satisfies SpotlightSlide;
