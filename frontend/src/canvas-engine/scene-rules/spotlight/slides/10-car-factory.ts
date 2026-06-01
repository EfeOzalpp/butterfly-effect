import type { BackgroundSpec } from "../../backgrounds";
import type { ScenePlacementRuleMap } from "../../placement-rules";
import { centeredCount, spotlightRows, type SpotlightSlide } from "./types";

const carFactoryBackground: BackgroundSpec = {
  base: "rgb(48, 42, 48)",
  overlay: {
    kind: "radial",
    center: { xK: 0.5, yK: 0.42 },
    innerK: 0.08,
    outer: { k: 0.84 },
    stops: [
      { rgba: "rgba(228, 164, 178, 0.16)" },
      { rgba: "rgba(133, 84, 102, 0.24)" },
      { rgba: "rgba(43, 43, 54, 0)" },
    ] as const,
  },
} as const;

const carFactoryDarkBackground: BackgroundSpec = {
  base: "rgb(44, 39, 48)",
  overlay: {
    kind: "linear",
    from: { xK: 0.5, yK: 0.0 },
    to: { xK: 0.5, yK: 1.0 },
    stops: [
      { rgba: "rgba(116, 82, 104, 0.40)" },
      { rgba: "rgba(92, 70, 86, 0.24)" },
      { rgba: "rgba(43, 43, 54, 0)" },
    ] as const,
  },
} as const;

const carFactoryPlacement: ScenePlacementRuleMap = {
  carFactory: {
    absolute: {
      kind: "center",
      count: centeredCount,
    },
  },
};

export const carFactorySlide = {
  id: "carFactory",
  shape: "carFactory",
  background: carFactoryBackground,
  darkBackground: carFactoryDarkBackground,
  padding: spotlightRows(3),
  placement: carFactoryPlacement,
} as const satisfies SpotlightSlide;
