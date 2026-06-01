import type { AmbientParticlesSceneSpec } from "../../ambient-particles";
import type { BackgroundSpec } from "../../backgrounds";
import type { ScenePlacementRuleMap } from "../../placement-rules";
import { centeredCount, spotlightRows, type SpotlightSlide } from "./types";

const busBackground: BackgroundSpec = {
  base: "rgb(38, 43, 60)",
  overlay: {
    kind: "radial",
    center: { xK: 0.5, yK: 0.5 },
    innerK: 0.08,
    outer: { k: 0.86 },
    stops: [
      { rgba: "rgb(111, 203, 142)" },
      { rgba: "rgb(160, 160, 81)" },
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

const busPlacement: ScenePlacementRuleMap = {
  bus: {
    absolute: {
      kind: "center",
      count: centeredCount,
    },
  },
};

const busAmbientParticles: AmbientParticlesSceneSpec = {
  layers: [
    {
      count: [22, 42],
      xRange: [0.08, 0.92],
      yRange: [0.16, 0.78],
      sizePx: [0.8, 1.8],
      speedX: [3, 6],
      speedY: [-3, 4],
      color: [
        { color: "rgb(170, 252, 140)", alpha: 0.16 },
        { color: "rgb(217, 255, 120)", alpha: 0.12 },
        { color: "rgb(255, 221, 100)", alpha: 0.1 },
      ],
      seed: 22,
    },
    {
      count: [8, 18],
      xRange: [0.12, 0.95],
      yRange: [0.36, 0.86],
      sizePx: [0.5, 1.2],
      speedX: [12, 24],
      speedY: [-2, 5],
      color: [
        { color: "rgb(224, 252, 221)", alpha: 0.11 },
        { color: "rgb(255, 249, 204)", alpha: 0.09 },
      ],
      seed: 39,
    },
  ],
};

export const busSlide = {
  id: "bus",
  shape: "bus",
  background: busBackground,
  darkBackground: busDarkBackground,
  ambientParticles: busAmbientParticles,
  padding: spotlightRows(2),
  placement: busPlacement,
} as const satisfies SpotlightSlide;
