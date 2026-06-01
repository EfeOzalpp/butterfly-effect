import type { BackgroundSpec } from "../../backgrounds";
import type { ScenePlacementRuleMap } from "../../placement-rules";
import { centeredCount, spotlightRows, type SpotlightSlide } from "./types";

const snowBackground: BackgroundSpec = {
  base: "rgb(40, 44, 58)",
  overlay: {
    kind: "linear",
    from: { xK: 0.5, yK: 0.0 },
    to: { xK: 0.5, yK: 1.0 },
    stops: [
      { rgba: "rgba(166, 188, 220, 0.38)" },
      { rgba: "rgba(88, 101, 132, 0.26)" },
      { rgba: "rgba(43, 43, 54, 0)" },
    ] as const,
  },
} as const;

const snowDarkBackground: BackgroundSpec = {
  base: "rgb(34, 39, 54)",
  overlay: {
    kind: "radial",
    center: { xK: 0.5, yK: 0.36 },
    innerK: 0.08,
    outer: { k: 0.86 },
    stops: [
      { rgba: "rgba(235, 242, 255, 0.14)" },
      { rgba: "rgba(100, 118, 148, 0.22)" },
      { rgba: "rgba(43, 43, 54, 0)" },
    ] as const,
  },
} as const;

const snowPlacement: ScenePlacementRuleMap = {
  snow: {
    absolute: {
      kind: "center",
      count: centeredCount,
    },
  },
};

export const snowSlide = {
  id: "snow",
  shape: "snow",
  background: snowBackground,
  darkBackground: snowDarkBackground,
  padding: spotlightRows(4),
  placement: snowPlacement,
} as const satisfies SpotlightSlide;
