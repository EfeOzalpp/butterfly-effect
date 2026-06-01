import type { BackgroundSpec } from "../../backgrounds";
import type { ScenePlacementRuleMap } from "../../placement-rules";
import { centeredCount, spotlightRows, type SpotlightSlide } from "./types";

const carBackground: BackgroundSpec = {
  base: "rgb(42, 43, 55)",
  overlay: {
    kind: "linear",
    from: { xK: 0.5, yK: 0.0 },
    to: { xK: 0.5, yK: 1.0 },
    stops: [
      { rgba: "rgba(107, 126, 172, 0.36)" },
      { rgba: "rgba(75, 80, 112, 0.24)" },
      { rgba: "rgba(43, 43, 54, 0)" },
    ] as const,
  },
} as const;

const carDarkBackground: BackgroundSpec = {
  base: "rgb(39, 40, 52)",
  overlay: {
    kind: "radial",
    center: { xK: 0.48, yK: 0.42 },
    innerK: 0.08,
    outer: { k: 0.82 },
    stops: [
      { rgba: "rgba(167, 177, 222, 0.14)" },
      { rgba: "rgba(82, 88, 128, 0.20)" },
      { rgba: "rgba(43, 43, 54, 0)" },
    ] as const,
  },
} as const;

const carPlacement: ScenePlacementRuleMap = {
  car: {
    absolute: {
      kind: "center",
      count: centeredCount,
    },
  },
};

export const carSlide = {
  id: "car",
  shape: "car",
  background: carBackground,
  darkBackground: carDarkBackground,
  padding: spotlightRows(2),
  placement: carPlacement,
} as const satisfies SpotlightSlide;
