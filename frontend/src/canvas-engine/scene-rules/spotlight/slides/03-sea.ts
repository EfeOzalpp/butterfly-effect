import type { BackgroundSpec } from "../../backgrounds";
import type { ScenePlacementRuleMap } from "../../placement-rules";
import { centeredCount, spotlightRows, type SpotlightSlide } from "./types";

const seaBackground: BackgroundSpec = {
  base: "rgb(48, 42, 51)",
  overlay: {
    kind: "radial",
    center: { xK: 0.48, yK: 0.38 },
    innerK: 0.06,
    outer: { k: 0.82 },
    stops: [
      { rgba: "rgba(255, 218, 226, 0.14)" },
      { rgba: "rgba(139, 101, 124, 0.24)" },
      { rgba: "rgba(43, 43, 54, 0)" },
    ] as const,
  },
} as const;

const seaDarkBackground: BackgroundSpec = {
  base: "rgb(43, 40, 55)",
  overlay: {
    kind: "linear",
    from: { xK: 0.5, yK: 0.0 },
    to: { xK: 0.5, yK: 1.0 },
    stops: [
      { rgba: "rgba(76, 68, 112, 0.52)" },
      { rgba: "rgba(88, 72, 104, 0.22)" },
      { rgba: "rgba(43, 43, 54, 0)" },
    ] as const,
  },
} as const;

const seaPlacement: ScenePlacementRuleMap = {
  sea: {
    absolute: {
      kind: "center",
      count: centeredCount,
    },
  },
};

export const seaSlide = {
  id: "sea",
  shape: "sea",
  background: seaBackground,
  darkBackground: seaDarkBackground,
  padding: spotlightRows(2),
  placement: seaPlacement,
} as const satisfies SpotlightSlide;
