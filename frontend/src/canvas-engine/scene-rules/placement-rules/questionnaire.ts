// src/canvas-engine/scene-rules/placement-rules/questionnaire.ts

import type { DeviceCount, QuotaAnchor, ScenePlacementRules } from "./types";

const FLAT_QUOTA: QuotaAnchor[] = [
  { t: 0, pct: 50 },
  { t: 1, pct: 50 },
];

const Q = {
  clouds: [
    { t: 0, pct: 60 },
    { t: 1, pct: 60 },
  ],
  snow: [
    { t: 0, pct: 20 },
    { t: 1, pct: 80 },
  ],
  villa: [
    { t: 0, pct: 60 },
    { t: 1, pct: 60 },
  ],
  house: [
    { t: 0, pct: 60 },
    { t: 1, pct: 60 },
  ],
  power: [
    { t: 0, pct: 90 },
    { t: 1, pct: 60 },
  ],
  carFactory: [
    { t: 0, pct: 40 },
    { t: 1, pct: 20 },
  ],
  trees: [
    { t: 0, pct: 40 },
    { t: 1, pct: 90 },
  ],
  bus: [
    { t: 0, pct: 20 },
    { t: 1, pct: 60 },
  ],
  car: [
    { t: 0, pct: 60 },
    { t: 1, pct: 30 },
  ],
  sea: [
    { t: 0, pct: 40 },
    { t: 1, pct: 60 },
  ],
} satisfies Record<string, QuotaAnchor[]>;

function count(mobile: number, tablet: number, laptop: number): DeviceCount {
  return { mobile, tablet, laptop };
}

export const QUESTIONNAIRE_PLACEMENTS: ScenePlacementRules = {
  preset: {
    kind: "zone-communities",
    seed: "questionnaire-community-layout-v2",
    overflow: "skip",
    zones: [
      // Sky â€” untouched
      {
        id: "sky-light",
        band: "sky",
        center: { x: 0.2, y: 0.2 },
        radius: { tiles: 2, xDistort: 1.8, yDistort: 0.8 },
        shapes: {
          sun: { count: count(1, 1, 1), quota: FLAT_QUOTA },
        },
      },
      {
        id: "weather-left-close",
        band: "sky",
        center: { x: 0.1, y: 0.0 },
        radius: { tiles: 5, xDistort: 2.6, yTiles: 0.6 },
        shapes: {
          clouds: { count: count(1, 1, 2), quota: Q.clouds },
          snow: { count: count(1, 1, 1), quota: Q.snow },
        },
      },
      {
        id: "weather-left-mid",
        band: "sky",
        center: { x: 0.15, y: 0.6 },
        radius: { tiles: 4, xDistort: 4, yTiles: 0.4 },
        shapes: {
          clouds: { count: count(1, 2, 3), quota: Q.clouds },
          snow: { count: count(1, 3, 1), quota: Q.snow },
        },
      },
      {
        id: "weather-left-far",
        band: "sky",
        center: { x: 0.05, y: 0.8 },
        radius: { tiles: 5, xDistort: 4, yTiles: 0.4 },
        shapes: {
          clouds: { count: count(1, 2, 1), quota: Q.clouds },
          snow: { count: count(1, 3, 3), quota: Q.snow },
        },
      },
      {
        id: "weather-right-far",
        band: "sky",
        center: { x: 0.8, y: 0.8 },
        radius: { tiles: 4, xDistort: 3.2, yTiles: 0.65 },
        shapes: {
          clouds: { count: count(1, 2, 2), quota: Q.clouds },
          snow: { count: count(1, 1, 2), quota: Q.snow },
        },
      },
      {
        id: "weather-mid-far",
        band: "sky",
        center: { x: 0.45, y: 0.7 },
        radius: { tiles: 4, xDistort: 3.5, yTiles: 0.5 },
        shapes: {
          clouds: { count: count(1, 0, 2), quota: Q.clouds },
          snow: { count: count(1, 0, 1), quota: Q.snow },
        },
      },
      {
        id: "weather-mid-far-2",
        band: "sky",
        center: { x: 0.4, y: 0.6 },
        radius: { tiles: 2, xDistort: 2, yTiles: 0.4 },
        shapes: {
          clouds: { count: count(1, 0, 2), quota: Q.clouds },
          snow: { count: count(1, 0, 1), quota: Q.snow },
        },
      },
      {
        id: "weather-mid-far-3",
        band: "sky",
        center: { x: 0.28, y: 0.9 },
        radius: { tiles: 2, xDistort: 2, yTiles: 0.3 },
        shapes: {
          clouds: { count: count(1, 2, 2), quota: Q.clouds },
          snow: { count: count(1, 1, 1), quota: Q.snow },
        },
      },
      {
        id: "weather-mid-far-3.5",
        band: "sky",
        center: { x: 0.3, y: 0.5 },
        radius: { tiles: 2, xDistort: 2, yTiles: 0.3 },
        shapes: {
          clouds: { count: count(1, 0, 3), quota: Q.clouds },
          snow: { count: count(1, 0, 1), quota: Q.snow },
        },
      },
      {
        id: "weather-mid-far-4",
        band: "sky",
        center: { x: 0.7, y: 0.9 },
        radius: { tiles: 2, xDistort: 2, yTiles: 0.3 },
        shapes: {
          clouds: { count: count(1, 0, 2), quota: Q.clouds },
          snow: { count: count(1, 0, 1), quota: Q.snow },
        },
      },
      {
        id: "weather-mid-far-4.5",
        band: "sky",
        center: { x: 0.65, y: 0.8 },
        radius: { tiles: 2, xDistort: 2, yTiles: 0.3 },
        shapes: {
          clouds: { count: count(1, 2, 3), quota: Q.clouds },
          snow: { count: count(1, 1, 2), quota: Q.snow },
        },
      },
            {
        id: "weather-mid-far-5",
        band: "sky",
        center: { x: 0.35, y: 0.8 },
        radius: { tiles: 2, xDistort: 2, yTiles: 0.3 },
        shapes: {
          clouds: { count: count(1, 3, 2), quota: Q.clouds },
          snow: { count: count(1, 2, 2), quota: Q.snow },
        },
      },
      {
        id: "weather-right-close",
        band: "sky",
        center: { x: 0.8, y: 0.1 },
        radius: { tiles: 3, xDistort: 2, yTiles: 0.6 },
        shapes: {
          clouds: { count: count(1, 0, 2), quota: Q.clouds },
          snow: { count: count(1, 0, 1), quota: Q.snow },
        },
      },
      {
        id: "weather-right-close-Ipad",
        band: "sky",
        center: { x: 0.9, y: 0.4 },
        radius: { tiles: 3, xDistort: 2, yTiles: 0.6 },
        shapes: {
          clouds: { count: count(0, 2, 0), quota: Q.clouds },
          snow: { count: count(0, 1, 0), quota: Q.snow },
        },
      },
      {
        id: "weather-right-close-2",
        band: "sky",
        center: { x: 0.72, y: 0.2 },
        radius: { tiles: 2, xDistort: 1, yTiles: 0.6 },
        shapes: {
          clouds: { count: count(1, 3, 2), quota: Q.clouds },
          snow: { count: count(1, 2, 0), quota: Q.snow },
        },
      },
      {
        id: "weather-right-mid",
        band: "sky",
        center: { x: 1, y: 0.3 },
        radius: { tiles: 6, xDistort: 5, yTiles: 0.4 },
        shapes: {
          clouds: { count: count(1, 0, 2), quota: Q.clouds },
          snow: { count: count(1, 0, 1), quota: Q.snow },
        },
      },
      {
        id: "weather-right-far-2",
        band: "sky",
        center: { x: 0.88, y: 0.6 },
        radius: { tiles: 4, xDistort: 5, yTiles: 0.4 },
        shapes: {
          clouds: { count: count(1, 0, 2), quota: Q.clouds },
          snow: { count: count(1, 0, 2), quota: Q.snow },
        },
      },
      {
        id: "weather-right-far-2-Ipad",
        band: "sky",
        center: { x: 0.8, y: 0.9 },
        radius: { tiles: 2, xDistort: 6, yTiles: 0.2 },
        shapes: {
          clouds: { count: count(0, 2, 0), quota: Q.clouds },
          snow: { count: count(0, 3, 0), quota: Q.snow },
        },
      },
      {
        id: "weather-mid-far-Ipad",
        band: "sky",
        center: { x: 0.4, y: 1 },
        radius: { tiles: 2, xDistort: 6, yTiles: 0.2 },
        shapes: {
          clouds: { count: count(0, 2, 0), quota: Q.clouds },
          snow: { count: count(0, 3, 0), quota: Q.snow },
        },
      },
            {
        id: "weather-mid-far-Ipad-2",
        band: "sky",
        center: { x: 0.92, y: 1 },
        radius: { tiles: 2, xDistort: 6, yTiles: 0.2 },
        shapes: {
          clouds: { count: count(0, 1, 0), quota: Q.clouds },
          snow: { count: count(0, 2, 0), quota: Q.snow },
        },
      },

      // Ground drafted with bePlace in runtime/debug/placementAuthoring.ts
      {
        id: "mixed-01",
        band: "ground",
        center: { x: 0.165, y: 0.1 },
        radius: { tiles: 4, xDistort: 7, yDistort: 2 },
        shapes: {
          trees: { count: count(1, 7, 8), quota: Q.trees },
        },
      },
      {
        id: "mixed-01.5",
        band: "ground",
        center: { x: 0.1, y: 0.1 },
        radius: { tiles: 4, xDistort: 7, yDistort: 2 },
        shapes: {
          trees: { count: count(1, 5, 6), quota: Q.trees },
          villa: { count: count(1, 1, 4), quota: Q.villa },
        },
      },
      {
        id: "mixed-02",
        band: "ground",
        center: { x: 0.25, y: 0.301 },
        radius: { tiles: 3, xDistort: 3, yDistort: 2 },
        shapes: {
          trees: { count: count(1, 4, 5), quota: Q.trees },
        },
      },
      {
        id: "mixed-02.5",
        band: "ground",
        center: { x: 0.4, y: 0.1 },
        radius: { tiles: 3, xDistort: 3, yDistort: 2 },
        shapes: {
          trees: { count: count(1, 4, 5), quota: Q.trees },
          villa: { count: count(1, 1, 5), quota: Q.villa },
          power: { count: count(1, 1, 2), quota: Q.power },
        },
      },
      {
        id: "mixed-03",
        band: "ground",
        center: { x: 0.5, y: 0.208 },
        radius: { tiles: 6, xDistort: 3, yDistort: 2 },
        shapes: {
          trees: { count: count(1, 4, 5), quota: Q.trees },
        },
      },
      {
        id: "mixed-03.5",
        band: "ground",
        center: { x: 0.45, y: 0.208 },
        radius: { tiles: 6, xDistort: 3, yDistort: 2 },
        shapes: {
          trees: { count: count(1, 4, 5), quota: Q.trees },
          villa: { count: count(1, 1, 3), quota: Q.villa },
          house: { count: count(1, 1, 1), quota: Q.house },
        },
      },
      {
        id: "mixed-04",
        band: "ground",
        center: { x: 0.5, y: 0.4 },
        radius: { tiles: 4, xDistort: 3, yDistort: 1 },
        shapes: {
          trees: { count: count(1, 4, 5), quota: Q.trees },
        },
      },
      {
        id: "mixed-04.5",
        band: "ground",
        center: { x: 0.65, y: 0.2 },
        radius: { tiles: 4, xDistort: 3, yDistort: 1 },
        shapes: {
          villa: { count: count(1, 1, 2), quota: Q.villa },
          car: { count: count(1, 1, 1), quota: Q.car },
          bus: { count: count(1, 1, 1), quota: Q.bus },
          trees: { count: count(1, 2, 3), quota: Q.trees },
          carFactory: { count: count(1, 1, 1), quota: Q.carFactory },
        },
      },
      {
        id: "mixed-05",
        band: "ground",
        center: { x: 0.15, y: 0.768 },
        radius: { tiles: 4, xDistort: 3, yDistort: 1 },
        shapes: {
          trees: { count: count(1, 4, 5), quota: Q.trees },
        },
      },
      {
        id: "mixed-05.5",
        band: "ground",
        center: { x: 0.8, y: 0.55 },
        radius: { tiles: 4, xDistort: 3, yDistort: 1 },
        shapes: {
          villa: { count: count(1, 1, 2), quota: Q.villa },
          trees: { count: count(1, 4, 7), quota: Q.trees },
        },
      },
            {
        id: "mixed-05.6",
        band: "ground",
        center: { x: 0.5, y: 1 },
        radius: { tiles: 6, xDistort: 2, yDistort: 1 },
        shapes: {
          trees: { count: count(1, 4, 5), quota: Q.trees },
        },
      },
      {
        id: "mixed-05.7-ipad",
        band: "ground",
        center: { x: 0.2, y: 0.5 },
        radius: { tiles: 6, xDistort: 2, yDistort: 1 },
        shapes: {
          trees: { count: count(0, 4, 0), quota: Q.trees },
        },
      },
      {
        id: "mixed-05.8-ipad",
        band: "ground",
        center: { x: 0.4, y: 0.5 },
        radius: { tiles: 6, xDistort: 2, yDistort: 1 },
        shapes: {
          villa: { count: count(0, 2, 0), quota: Q.villa },
          car: { count: count(0, 2, 0), quota: Q.car },
          bus: { count: count(0, 2, 0), quota: Q.bus },
          trees: { count: count(0, 4, 0), quota: Q.trees },
          carFactory: { count: count(0, 2, 0), quota: Q.carFactory },
        },
      },
      {
        id: "mixed-05.9-ipad",
        band: "ground",
        center: { x: 0.8, y: 0.5 },
        radius: { tiles: 6, xDistort: 2, yDistort: 1 },
        shapes: {
          trees: { count: count(0, 4, 0), quota: Q.trees },
          villa: { count: count(0, 2, 0), quota: Q.villa },
          car: { count: count(0, 2, 0), quota: Q.car },
          bus: { count: count(0, 2, 0), quota: Q.bus },
        },
      },
      {
        id: "mixed-06",
        band: "ground",
        center: { x: 0.95, y: 0.7 },
        radius: { tiles: 4, xDistort: 4, yDistort: 1 },
        shapes: {
          house: { count: count(1, 1, 1), quota: Q.house },
          villa: { count: count(1, 1, 2), quota: Q.villa },
          car: { count: count(1, 1, 1), quota: Q.car },
          bus: { count: count(1, 1, 1), quota: Q.bus },
          trees: { count: count(1, 6, 7), quota: Q.trees },
          carFactory: { count: count(1, 1, 1), quota: Q.carFactory },
        },
      },
      {
        id: "mixed-07",
        band: "ground",
        center: { x: 0.255, y: 0.655 },
        radius: { tiles: 4, xDistort: 6, yDistort: 1 },
        shapes: {
          house: { count: count(1, 1, 1), quota: Q.house },
          villa: { count: count(1, 1, 3), quota: Q.villa },
          car: { count: count(1, 1, 1), quota: Q.car },
          bus: { count: count(1, 1, 1), quota: Q.bus },
          trees: { count: count(1, 3, 4), quota: Q.trees },
          sea: { count: count(1, 0, 1), quota: Q.sea },
        },
      },
      {
        id: "mixed-08",
        band: "ground",
        center: { x: 0.7, y: 0.6 },
        radius: { tiles: 4, xDistort: 3, yDistort: 1 },
        shapes: {
          house: { count: count(1, 1, 1), quota: Q.house },
          villa: { count: count(1, 1, 1), quota: Q.villa },
          car: { count: count(1, 1, 3), quota: Q.car },
          bus: { count: count(1, 1, 1), quota: Q.bus },
          trees: { count: count(1, 4, 6), quota: Q.trees },
          carFactory: { count: count(1, 2, 1), quota: Q.carFactory },
        },
      },
      {
        id: "mixed-09",
        band: "ground",
        center: { x: 0.18, y: 0.89 },
        radius: { tiles: 4, xDistort: 3, yDistort: 1 },
        shapes: {
          house: { count: count(1, 1, 1), quota: Q.house },
          villa: { count: count(1, 1, 1), quota: Q.villa },
          car: { count: count(1, 1, 1), quota: Q.car },
          bus: { count: count(1, 1, 2), quota: Q.bus },
          trees: { count: count(1, 4, 2), quota: Q.trees },
          power: { count: count(1, 1, 1), quota: Q.power },
          sea: { count: count(1, 1, 1), quota: Q.sea },
        },
      },
      {
        id: "mixed-10",
        band: "ground",
        center: { x: 0.845, y: 0.915 },
        radius: { tiles: 8, xDistort: 6, yDistort: 1 },
        shapes: {
          villa: { count: count(1, 1, 1), quota: Q.villa },
          car: { count: count(1, 1, 1), quota: Q.car },
          bus: { count: count(1, 1, 1), quota: Q.bus },
          trees: { count: count(1, 2, 3), quota: Q.trees },
        },
      },
      {
        id: "mixed-10.5",
        band: "ground",
        center: { x: 0.575, y: 0.715 },
        radius: { tiles: 8, xDistort: 6, yDistort: 1 },
        shapes: {
          villa: { count: count(1, 1, 1), quota: Q.villa },
          car: { count: count(1, 1, 2), quota: Q.car },
          bus: { count: count(1, 1, 1), quota: Q.bus },
          trees: { count: count(1, 5, 6), quota: Q.trees },
          sea: { count: count(1, 0, 1), quota: Q.sea },
        },
      },
      {
        id: "mixed-10.5",
        band: "ground",
        center: { x: 0.75, y: 0.1 },
        radius: { tiles: 8, xDistort: 6, yDistort: 2 },
        shapes: {
          villa: { count: count(1, 1, 2), quota: Q.villa },
          car: { count: count(1, 1, 3), quota: Q.car },
          bus: { count: count(1, 1, 1), quota: Q.bus },
          trees: { count: count(1, 6, 7), quota: Q.trees },
        },
      },
      {
        id: "mixed-11",
        band: "ground",
        center: { x: 0.4, y: 0.737 },
        radius: { tiles: 4, xDistort: 3, yDistort: 1 },
        shapes: {
          house: { count: count(1, 1, 1), quota: Q.house },
          villa: { count: count(1, 1, 2), quota: Q.villa },
          car: { count: count(1, 1, 1), quota: Q.car },
          bus: { count: count(1, 1, 1), quota: Q.bus },
          trees: { count: count(1, 2, 3), quota: Q.trees },
          power: { count: count(1, 1, 1), quota: Q.power },
          sea: { count: count(1, 1, 1), quota: Q.sea },
        },
      },
            {
        id: "mixed-11.5",
        band: "ground",
        center: { x: 1, y: 0.1 },
        radius: { tiles: 4, xDistort: 3, yDistort: 2 },
        shapes: {
          house: { count: count(1, 1, 1), quota: Q.house },
          villa: { count: count(1, 2, 3), quota: Q.villa },
          car: { count: count(1, 1, 1), quota: Q.car },
          bus: { count: count(1, 1, 1), quota: Q.bus },
          trees: { count: count(1, 4, 4), quota: Q.trees },
          power: { count: count(1, 1, 1), quota: Q.power },
        },
      },
      {
        id: "mixed-12",
        band: "ground",
        center: { x: 0.05, y: 0.52 },
        radius: { tiles: 4, xDistort: 3, yDistort: 2 },
        shapes: {
          villa: { count: count(1, 1, 3), quota: Q.villa },
          car: { count: count(1, 1, 1), quota: Q.car },
          bus: { count: count(1, 1, 2), quota: Q.bus },
          trees: { count: count(1, 4, 5), quota: Q.trees },
          sea: { count: count(1, 1, 1), quota: Q.sea },
        },
      },
      {
        id: "mixed-13",
        band: "ground",
        center: { x: 0.6, y: 0.1 },
        radius: { tiles: 4, xDistort: 3, yDistort: 2 },
        shapes: {
          house: { count: count(1, 1, 1), quota: Q.house },
          villa: { count: count(1, 1, 4), quota: Q.villa },
          car: { count: count(1, 1, 2), quota: Q.car },
          bus: { count: count(1, 1, 3), quota: Q.bus },
          trees: { count: count(1, 5, 6), quota: Q.trees },
        },
      },
      {
        id: "mixed-14",
        band: "ground",
        center: { x: 0.343, y: 0.1 },
        radius: { tiles: 4, xDistort: 3, yDistort: 2 },
        shapes: {
          house: { count: count(1, 1, 1), quota: Q.house },
          villa: { count: count(1, 1, 2), quota: Q.villa },
          car: { count: count(1, 1, 3), quota: Q.car },
          bus: { count: count(1, 1, 1), quota: Q.bus },
          trees: { count: count(1, 2, 12), quota: Q.trees },
        },
      },
      {
        id: "mixed-15",
        band: "ground",
        center: { x: 0.875, y: 0 },
        radius: { tiles: 6, xDistort: 3, yDistort: 2 },
        shapes: {
          house: { count: count(1, 1, 2), quota: Q.house },
          villa: { count: count(1, 1, 3), quota: Q.villa },
          car: { count: count(1, 1, 1), quota: Q.car },
          bus: { count: count(1, 1, 1), quota: Q.bus },
          trees: { count: count(1, 11, 12), quota: Q.trees },
        },
      },
    ],
  },
};
