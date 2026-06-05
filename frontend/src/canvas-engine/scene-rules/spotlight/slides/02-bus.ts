import type { BackgroundSpec } from "../../backgrounds";
import { rowsByDevice } from "../../canvas-padding/helpers";
import { centerShape } from "../../placement-rules/helpers";
import type { SpotlightSlide } from "../types";

const busBackground: BackgroundSpec = {
  base: "rgb(38, 43, 60)",
  overlay: {
    kind: "radial",
    center: { xK: 0.5, yK: 0.5 },
    innerK: 0.08,
    outer: { k: 0.86 },
    stops: [
      { rgba: "rgb(108, 182, 133)" },
      { rgba: "rgb(198, 255, 152)" },
     ] as const,
  },
} as const;

const busDarkBackground: BackgroundSpec = {
  base: "rgb(37, 43, 43)",
  overlay: {
    kind: "radial",
    center: { xK: 0.5, yK: 0.5 },
    innerK: 0.08,
    outer: { k: 0.86 },
    stops: [
      { rgba: "rgb(89, 150, 109)" },
      { rgba: "rgb(149, 149, 92)" },
     ] as const,
  },
} as const;

const busPlacement = centerShape("bus");

export const busSlide = {
  id: "bus",
  shape: "bus",
  background: busBackground,
  darkBackground: busDarkBackground,
  padding: rowsByDevice(3, 2, 2),
  placement: busPlacement,
} as const satisfies SpotlightSlide;
