import type { BackgroundSpec } from "../../backgrounds";
import type { ScenePlacementRuleMap } from "../../placement-rules";
import { centeredCount, spotlightRows, type SpotlightSlide } from "./types";

const villaBackground: BackgroundSpec = {
  base: "rgb(43, 43, 54)",
  overlay: {
    kind: "linear",
    from: { xK: 0.5, yK: 0.0 },
    to: { xK: 0.5, yK: 1.0 },
    stops: [
      { rgba: "rgb(214, 242, 255)" },
      { rgba: "rgb(214, 242, 255)" },
      { rgba: "rgb(248, 243, 239)" },
      { k: 0.6, rgba: "rgb(255, 226, 202)", liveBlend: [0.1, 0] },
      { k: 0.6, rgba: "#a9e0a7", rightRgba: "#87dcb7", liveBlend: [0.1, 0.1] },
      { rgba: "#c7ca83", liveBlend: [0.1, 0.1]  },
    ] as const,
  },
} as const;

const villaDarkBackground: BackgroundSpec = {
  base: "rgb(43, 43, 54)",
  overlay: {
    kind: "linear",
    from: { xK: 0.5, yK: 0.0 },
    to: { xK: 0.5, yK: 1.0 },
    stops: [
      { rgba: "rgb(20, 35, 68)",   rightRgba: "rgb(44, 49, 60)" },
      { rgba: "rgb(49, 84, 126)",  rightRgba: "rgb(67, 71, 93)" },
      { k: 0.6, rgba: "rgb(68, 116, 179)", rightRgba: "rgb(98, 99, 129)"},
      { k: 0.6, rgba: "#757f5c", rightRgba: "#628475", liveBlend: [0.1, 0] },
      { rgba: "#3e4137", liveBlend: [0.1, 0] },
    ] as const,
  },
  stars: {
    count: [18, 36],
    topBandK: 0.59,
    minR: 0.9,
    maxR: 1.6,
    alpha: [[0.5, 1.5], [0.6, 1.6]],
    flickerHz: [[0.42, 0.98], [0.14, 0.34]],
  },
} as const;

const villaPlacement: ScenePlacementRuleMap = {
  villa: {
    absolute: {
      kind: "center",
      count: centeredCount,
    },
  },
};

export const villaSlide = {
  id: "villa",
  shape: "villa",
  background: villaBackground,
  darkBackground: villaDarkBackground,
  padding: spotlightRows(3),
  placement: villaPlacement,
} as const satisfies SpotlightSlide;
