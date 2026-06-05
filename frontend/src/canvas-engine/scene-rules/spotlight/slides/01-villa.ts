import type { BackgroundSpec } from "../../backgrounds";
import { uniformRows } from "../../canvas-padding/helpers";
import { centerShape } from "../../placement-rules/helpers";
import type { SpotlightSlide } from "../types";

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
      { k: 0.6, rgba: "rgb(255, 221, 208)", liveBlend: [0.1, 0] },
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
      { rgba: "rgb(44, 63, 106)", rightRgba: "rgb(64, 59, 106)" },
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

const villaPlacement = centerShape("villa");

export const villaSlide = {
  id: "villa",
  shape: "villa",
  background: villaBackground,
  darkBackground: villaDarkBackground,
  padding: uniformRows(3),
  placement: villaPlacement,
} as const satisfies SpotlightSlide;
