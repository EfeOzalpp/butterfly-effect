import type { BackgroundSpec } from "../../backgrounds";
import type { ScenePlacementRuleMap } from "../../placement-rules";
import { centeredCount, spotlightRows, type SpotlightSlide } from "./types";

const powerBackground: BackgroundSpec = {
  base: "rgb(39, 45, 51)",
  overlay: {
    kind: "linear",
    from: { xK: 0.5, yK: 0.0 },
    to: { xK: 0.5, yK: 1.0 },
    stops: [
      { rgba: "rgba(143, 183, 190, 0.28)" },
      { rgba: "rgba(80, 99, 105, 0.24)" },
      { rgba: "rgba(43, 43, 54, 0)" },
    ] as const,
  },
} as const;

const powerDarkBackground: BackgroundSpec = {
  base: "rgb(35, 42, 50)",
  overlay: {
    kind: "radial",
    center: { xK: 0.48, yK: 0.4 },
    innerK: 0.08,
    outer: { k: 0.84 },
    stops: [
      { rgba: "rgba(170, 214, 220, 0.14)" },
      { rgba: "rgba(78, 108, 116, 0.22)" },
      { rgba: "rgba(43, 43, 54, 0)" },
    ] as const,
  },
} as const;

const powerPlacement: ScenePlacementRuleMap = {
  power: {
    absolute: {
      kind: "center",
      count: centeredCount,
    },
  },
};

export const powerSlide = {
  id: "power",
  shape: "power",
  background: powerBackground,
  darkBackground: powerDarkBackground,
  padding: spotlightRows(4),
  placement: powerPlacement,
} as const satisfies SpotlightSlide;
