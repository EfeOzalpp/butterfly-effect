import type { BackgroundSpec } from "../../backgrounds";
import type { ScenePlacementRuleMap } from "../../placement-rules";
import { centeredCount, spotlightRows, type SpotlightSlide } from "./types";

const cloudsBackground: BackgroundSpec = {
  base: "rgb(42, 45, 58)",
  overlay: {
    kind: "linear",
    from: { xK: 0.5, yK: 0.0 },
    to: { xK: 0.5, yK: 1.0 },
    stops: [
      { rgba: "rgba(120, 154, 194, 0.34)" },
      { rgba: "rgba(71, 82, 108, 0.26)" },
      { rgba: "rgba(43, 43, 54, 0)" },
    ] as const,
  },
} as const;

const cloudsDarkBackground: BackgroundSpec = {
  base: "rgb(37, 40, 53)",
  overlay: {
    kind: "radial",
    center: { xK: 0.5, yK: 0.38 },
    innerK: 0.08,
    outer: { k: 0.84 },
    stops: [
      { rgba: "rgba(210, 220, 236, 0.16)" },
      { rgba: "rgba(92, 102, 126, 0.20)" },
      { rgba: "rgba(43, 43, 54, 0)" },
    ] as const,
  },
} as const;

const cloudsPlacement: ScenePlacementRuleMap = {
  clouds: {
    absolute: {
      kind: "center",
      count: centeredCount,
    },
  },
};

export const cloudsSlide = {
  id: "clouds",
  shape: "clouds",
  background: cloudsBackground,
  darkBackground: cloudsDarkBackground,
  padding: spotlightRows(4),
  placement: cloudsPlacement,
} as const satisfies SpotlightSlide;
