import type { BackgroundSpec } from "../../backgrounds";
import { uniformRows } from "../../canvas-padding/helpers";
import type { ScenePlacementRules } from "../../placement-rules";
import type { SpotlightSlide } from "../types";

const carBackground: BackgroundSpec = {
  base: "rgb(42, 43, 55)",
  overlay: {
    kind: "linear",
    from: { xK: 0.5, yK: 0.0 },
    to: { xK: 0.5, yK: 1.0 },
    stops: [
      { rgba: "rgb(181, 213, 236)" },
      { k: 0.6, rgba: "rgb(210, 228, 245)" },
      { k: 0.6, rgba: "rgb(147, 202, 150)", liveBlend: [0.08, 0.12] },
      { rgba: "rgb(140, 205, 183)", liveBlend: [0.08, 0.12] },
    ] as const,
  },
} as const;

const carDarkBackground: BackgroundSpec = {
  base: "rgb(39, 40, 52)",
  overlay: {
    kind: "linear",
    from: { xK: 0.5, yK: 0.0 },
    to: { xK: 0.5, yK: 1.0 },
    stops: [
      { rgba: "rgb(75, 89, 132)" },
      { k: 0.6, rgba: "rgb(59, 98, 135)" },
      { k: 0.6, rgba: "rgb(96, 112, 94)", liveBlend: [0.07, 0.02] },
      { rgba: "rgb(83, 112, 101)", liveBlend: [0.05, 0.02] },
    ] as const,
  },
} as const;

const FLAT_QUOTA = [{ t: 0, pct: 50 }, { t: 1, pct: 50 }];

const carPlacement: ScenePlacementRules = {
  preset: {
    kind: "zone-communities",
    seed: "car-spotlight-v1",
    overflow: "skip",
    zones: [
      {
        id: "car",
        band: "ground",
        center: { x: 0.5, y: 0.6 },
        radius: { tiles: 3, xDistort: 2, yDistort: 0.1 },
        shapes: {
          car: { count: { mobile: 5, tablet: 5, laptop: 5 }, quota: FLAT_QUOTA },
        },
      },
    ],
  },
};

export const carSlide = {
  id: "car",
  shape: "car",
  background: carBackground,
  darkBackground: carDarkBackground,
  padding: uniformRows(3),
  placement: carPlacement,
} as const satisfies SpotlightSlide;
