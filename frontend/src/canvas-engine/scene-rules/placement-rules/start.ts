// src/canvas-engine/scene-rules/placement-rules/start.ts

import type { DeviceCount, QuotaAnchor, ScenePlacementRules } from "./types";

const FLAT_QUOTA: QuotaAnchor[] = [
  { t: 0, pct: 50 },
  { t: 1, pct: 50 },
];

const START_SHAPE_QUOTAS = {
  clouds: [
    { t: 0, pct: 20 },
    { t: 1, pct: 80 },
  ],
  snow: [
    { t: 0, pct: 80 },
    { t: 1, pct: 40 },
  ],
  villa: [
    { t: 0, pct: 75 },
    { t: 1, pct: 50 },
  ],
  house: [
    { t: 0, pct: 25 },
    { t: 1, pct: 50 },
  ],
  power: [
    { t: 0, pct: 30 },
    { t: 1, pct: 90 },
  ],
  carFactory: [
    { t: 0, pct: 5 },
    { t: 1, pct: 20 },
  ],
  trees: [
    { t: 0, pct: 90 },
    { t: 1, pct: 40 },
  ],
  bus: [
    { t: 0, pct: 40 },
    { t: 1, pct: 20 },
  ],
  car: [
    { t: 0, pct: 20 },
    { t: 1, pct: 100 },
  ],
} satisfies Record<string, QuotaAnchor[]>;

function count(mobile: number, tablet: number, laptop: number): DeviceCount {
  return { mobile, tablet, laptop };
}

export const START_PLACEMENTS: ScenePlacementRules = {
  preset: {
    kind: "zone-communities",
    seed: "start-community-layout-v1",
    overflow: "skip",
    zones: [
      // Sky
      {
        id: "sky-light",
        band: "sky",
        center: { x: 0.25, y: 0.24 },
        radius: { tiles: 2, xDistort: 1.8, yDistort: 0.8 },
        shapes: {
          sun: { count: count(0, 1, 1), quota: FLAT_QUOTA },
        },
      },
      {
        id: "sky-light-mobile",
        band: "sky",
        center: { x: 0.15, y: 0.15 },
        radius: { tiles: 2, xDistort: 1.8, yDistort: 0.8 },
        shapes: {
          sun: { count: count(1, 0, 0), quota: FLAT_QUOTA },
        },
      },
      {
        id: "weather-right-close",
        band: "sky",
        center: { x: 0.65, y: 0.2},
        radius: { tiles: 6, xDistort: 3, yTiles: 0.6 },
        shapes: {
          clouds: { count: count(0, 0, 2), quota: START_SHAPE_QUOTAS.clouds },
          snow: { count: count(0, 0, 1), quota: START_SHAPE_QUOTAS.snow },
        },
      },
      {
        id: "weather-right-close-2",
        band: "sky",
        center: { x: 0.8, y: 0.1},
        radius: { tiles: 4, xDistort: 6, yTiles: 0.3 },
        shapes: {
          clouds: { count: count(0, 3, 0), quota: START_SHAPE_QUOTAS.clouds },
          snow: { count: count(0, 1, 0), quota: START_SHAPE_QUOTAS.snow },
        },
      },
      {
        id: "weather-right-mid",
        band: "sky",
        center: { x: 1, y: 0.35},
        radius: { tiles: 6, xDistort: 5, yTiles: 0.4 },
        shapes: {
          clouds: { count: count(0, 0, 2), quota: START_SHAPE_QUOTAS.clouds },
        },
      },
      {
        id: "weather-right-mid-mobile",
        band: "sky",
        center: { x: 1, y: 0.2},
        radius: { tiles: 6, xDistort: 4, yTiles: 0.4 },
        shapes: {
          clouds: { count: count(2, 0, 0), quota: START_SHAPE_QUOTAS.clouds },
          snow: { count: count(1, 0, 0), quota: START_SHAPE_QUOTAS.snow },
        },
      },
      {
        id: "weather-right-mid-mobile",
        band: "sky",
        center: { x: 1.1, y: 0.55},
        radius: { tiles: 6, xDistort: 5, yTiles: 0.4 },
        shapes: {
          clouds: { count: count(2, 0, 0), quota: START_SHAPE_QUOTAS.clouds },
          snow: { count: count(1, 0, 0), quota: START_SHAPE_QUOTAS.snow },
        },
      },
      {
        id: "weather-left-mid-mobile",
        band: "sky",
        center: { x: 0.15, y: 0.7},
        radius: { tiles: 6, xDistort: 5, yTiles: 0.4 },
        shapes: {
          clouds: { count: count(3, 0, 0), quota: START_SHAPE_QUOTAS.clouds },
          snow: { count: count(2, 0, 0), quota: START_SHAPE_QUOTAS.snow },
        },
      },
      {
        id: "weather-left-far-mobile",
        band: "sky",
        center: { x: 0.25, y: 0.95},
        radius: { tiles: 6, xDistort: 5, yTiles: 0.4 },
        shapes: {
          clouds: { count: count(4, 0, 0), quota: START_SHAPE_QUOTAS.clouds },
          snow: { count: count(3, 0, 0), quota: START_SHAPE_QUOTAS.snow },
        },
      },
      {
        id: "weather-right-mid-2",
        band: "sky",
        center: { x: 0.8, y: 0.55},
        radius: { tiles: 6, xDistort: 1, yTiles: 0.2 },
        shapes: {
          clouds: { count: count(0, 0, 3), quota: START_SHAPE_QUOTAS.clouds },
          snow: { count: count(0, 0, 2), quota: START_SHAPE_QUOTAS.snow },
        },
      },
      {
        id: "weather-right-mid-3",
        band: "sky",
        center: { x: 0.8, y: 0.55},
        radius: { tiles: 6, xDistort: 4, yTiles: 0.2 },
        shapes: {
          clouds: { count: count(0, 3, 0), quota: START_SHAPE_QUOTAS.clouds },
          snow: { count: count(0, 1, 0), quota: START_SHAPE_QUOTAS.snow },
        },
      },
      {
        id: "weather-right-far",
        band: "sky",
        center: { x: 0.65, y: 0.9},
        radius: { tiles: 6, xDistort: 6, yTiles: 0.4 },
        shapes: {
          clouds: { count: count(2, 0, 2), quota: START_SHAPE_QUOTAS.clouds },
          snow: { count: count(1, 0, 4), quota: START_SHAPE_QUOTAS.snow },
        },
      },
      {
        id: "weather-right-far",
        band: "sky",
        center: { x: 0.8, y: 1},
        radius: { tiles: 6, xDistort: 6, yTiles: 0.4 },
        shapes: {
          clouds: { count: count(0, 3, 0), quota: START_SHAPE_QUOTAS.clouds },
          snow: { count: count(0, 2, 0), quota: START_SHAPE_QUOTAS.snow },
        },
      },
      {
        id: "weather-mid-far",
        band: "sky",
        center: { x: 0.4, y: 1},
        radius: { tiles: 6, xDistort: 6, yTiles: 0.4 },
        shapes: {
          clouds: { count: count(0, 4, 0), quota: START_SHAPE_QUOTAS.clouds },
          snow: { count: count(0, 3, 0), quota: START_SHAPE_QUOTAS.snow },
        },
      },
      {
        id: "weather-right-far-2",
        band: "sky",
        center: { x: 0.95, y: 0.75},
        radius: { tiles: 6, xDistort: 6, yTiles: 0.4 },
        shapes: {
          clouds: { count: count(0, 3, 3), quota: START_SHAPE_QUOTAS.clouds },
          snow: { count: count(0, 2, 2), quota: START_SHAPE_QUOTAS.snow },
        },
      },
      {
        id: "weather-right-far-2-mobile",
        band: "sky",
        center: { x: 0.8, y: 0.75},
        radius: { tiles: 6, xDistort: 6, yTiles: 0.4 },
        shapes: {
          clouds: { count: count(2, 0, 0), quota: START_SHAPE_QUOTAS.clouds },
          snow: { count: count(1, 0, 0), quota: START_SHAPE_QUOTAS.snow },
        },
      },
      {
        id: "weather-left-far",
        band: "sky",
        center: { x: 0.2, y: 0.8 },
        radius: { tiles: 6, xDistort: 4, yTiles: 0.4 },
        shapes: {
          clouds: { count: count(3, 4, 3), quota: START_SHAPE_QUOTAS.clouds },
          snow: { count: count(2, 2, 2), quota: START_SHAPE_QUOTAS.snow },
        },
      },
      {
        id: "weather-left-mid",
        band: "sky",
        center: { x: 0, y: 0.6 },
        radius: { tiles: 3, xDistort: 4, yTiles: 0.4 },
        shapes: {
          clouds: { count: count(0, 2, 2), quota: START_SHAPE_QUOTAS.clouds },
        },
      },
      {
        id: "weather-left-mid-2",
        band: "sky",
        center: { x: 0.1, y: 0.5 },
        radius: { tiles: 3, xDistort: 4, yTiles: 0.4 },
        shapes: {
          clouds: { count: count(0, 0, 2), quota: START_SHAPE_QUOTAS.clouds },
        },
      },
      {
        id: "weather-mid-far",
        band: "sky",
        center: { x: 0.5, y: 0.8 },
        radius: { tiles: 3, xDistort: 4, yTiles: 0.6 },
        shapes: {
          clouds: { count: count(0, 3, 3), quota: START_SHAPE_QUOTAS.clouds },
          snow: { count: count(0, 2, 2), quota: START_SHAPE_QUOTAS.snow },
        },
      },
      {
        id: "weather-mid-far-2",
        band: "sky",
        center: { x: 0.35, y: 0.6 },
        radius: { tiles: 3, xDistort: 3, yTiles: 0.5 },
        shapes: {
          clouds: { count: count(0, 2, 1), quota: START_SHAPE_QUOTAS.clouds },
          snow: { count: count(0, 1, 2), quota: START_SHAPE_QUOTAS.snow },
        },
      },
      {
        id: "weather-mid-far-3",
        band: "sky",
        center: { x: 0.3, y: 0.9 },
        radius: { tiles: 3, xDistort: 3, yTiles: 0.5 },
        shapes: {
          clouds: { count: count(0, 0, 3), quota: START_SHAPE_QUOTAS.clouds },
        },
      },
      // Ground
      {
        id: "left-far-community",
        band: "ground",
        center: { x: 0.4, y: 0.0 },
        radius: { tiles: 8, xDistort: 6, yDistort: 0.3 },
        shapes: {
          house: { count: count(2, 2, 3), quota: START_SHAPE_QUOTAS.house },
          villa: { count: count(2, 3, 5), quota: START_SHAPE_QUOTAS.villa },
          trees: { count: count(4, 6, 8), quota: START_SHAPE_QUOTAS.trees },
          car: { count: count(2, 2, 4), quota: START_SHAPE_QUOTAS.car },
        },
      },
      {
        id: "left-far-trees",
        band: "ground",
        center: { x: 0.25, y: 0.1 },
        radius: { tiles: 8, xDistort: 6, yDistort: 6 },
        shapes: {
          trees: { count: count(6, 6, 8), quota: START_SHAPE_QUOTAS.trees },
        },
      },
      {
        id: "right-close-trees",
        band: "ground",
        center: { x: 1, y: 1 },
        radius: { tiles: 4, xDistort: 4, yDistort: 2 },
        shapes: {
          trees: { count: count(4, 4, 5), quota: START_SHAPE_QUOTAS.trees },
        },
      },
      {
        id: "right-mid-trees",
        band: "ground",
        center: { x: 0.8, y: 0.4 },
        radius: { tiles: 4, xDistort: 4, yDistort: 2 },
        shapes: {
          trees: { count: count(3, 3, 4), quota: START_SHAPE_QUOTAS.trees },
        },
      },
      {
        id: "left-mid-trees-tablet",
        band: "ground",
        center: { x: 0, y: 0.35 },
        radius: { tiles: 4, xDistort: 4, yDistort: 2 },
        shapes: {
          trees: { count: count(0, 4, 0), quota: START_SHAPE_QUOTAS.trees },
        },
      },
      {
        id: "right-far-trees",
        band: "ground",
        center: { x: 0.8, y: 0 },
        radius: { tiles: 4, xDistort: 4, yDistort: 2 },
        shapes: {
          trees: { count: count(4, 8, 5), quota: START_SHAPE_QUOTAS.trees },
        },
      },
      {
        id: "right-far-trees-2",
        band: "ground",
        center: { x: 0.95, y: 0.3 },
        radius: { tiles: 4, xDistort: 3, yDistort: 2 },
        shapes: {
          trees: { count: count(1, 4, 12), quota: START_SHAPE_QUOTAS.trees },
          clouds: { count: count(1, 1, 1), quota: FLAT_QUOTA },
        },
      },
      {
        id: "right-far-community",
        band: "ground",
        center: { x: 0.75, y: 0.25 },
        radius: { tiles: 6, xDistort: 4, yDistort: 0.3 },
        shapes: {
          villa: { count: count(2, 3, 6), quota: START_SHAPE_QUOTAS.villa },
          trees: { count: count(3, 4, 6), quota: START_SHAPE_QUOTAS.trees },
          car: { count: count(1, 2, 3), quota: START_SHAPE_QUOTAS.car },
          bus: { count: count(1, 1, 1), quota: START_SHAPE_QUOTAS.bus },
          power: { count: count(1, 1, 2), quota: FLAT_QUOTA },
          clouds: { count: count(1, 0, 1), quota: FLAT_QUOTA },
        },
      },
      {
        id: "right-far-community-2",
        band: "ground",
        center: { x: 0.65, y: 0 },
        radius: { tiles: 6, xDistort: 5, yDistort: 0.4 },
        shapes: {
          villa: { count: count(2, 2, 1), quota: START_SHAPE_QUOTAS.villa },
          house: { count: count(1, 2, 2), quota: START_SHAPE_QUOTAS.house },
          trees: { count: count(6, 8, 8), quota: START_SHAPE_QUOTAS.trees },
          car: { count: count(1, 2, 3), quota: START_SHAPE_QUOTAS.car },
          bus: { count: count(1, 1, 1), quota: START_SHAPE_QUOTAS.bus },
        },
      },
      {
        id: "right-far-community-2",
        band: "ground",
        center: { x: 0.9, y: 0 },
        radius: { tiles: 6, xDistort: 3, yDistort: 0.2 },
        shapes: {
          villa: { count: count(1, 1, 1), quota: START_SHAPE_QUOTAS.villa },
          house: { count: count(1, 2, 3), quota: START_SHAPE_QUOTAS.house },
          trees: { count: count(1, 6, 8), quota: START_SHAPE_QUOTAS.trees },
          car: { count: count(1, 1, 3), quota: START_SHAPE_QUOTAS.car },
          bus: { count: count(1, 1, 1), quota: START_SHAPE_QUOTAS.bus },
          power: { count: count(1, 1, 2), quota: FLAT_QUOTA },
        },
      },
      {
        id: "right-close-community",
        band: "ground",
        center: { x: 0.85, y: 0.75 },
        radius: { tiles: 6, xDistort: 4, yDistort: 0.3 },
        shapes: {
          villa: { count: count(2, 2, 3), quota: START_SHAPE_QUOTAS.villa },
          trees: { count: count(1, 3, 6), quota: START_SHAPE_QUOTAS.trees },
          car: { count: count(1, 1, 2), quota: START_SHAPE_QUOTAS.car },
          bus: { count: count(1, 1, 1), quota: START_SHAPE_QUOTAS.bus },
          snow: { count: count(1, 1, 1), quota: FLAT_QUOTA },
        },
      },
      {
        id: "mid-mid-community",
        band: "ground",
        center: { x: 0.6, y: 0.55 },
        radius: { tiles: 8, xDistort: 5, yDistort: 0.4 },
        shapes: {
          villa: { count: count(1, 2, 3), quota: START_SHAPE_QUOTAS.villa },
          trees: { count: count(2, 2, 8), quota: START_SHAPE_QUOTAS.trees },
          car: { count: count(1, 1, 1), quota: START_SHAPE_QUOTAS.car },
          power: { count: count(1, 1, 1), quota: FLAT_QUOTA },
          carFactory: { count: count(0, 1, 1), quota: START_SHAPE_QUOTAS.carFactory },
          house: { count: count(1, 1, 1), quota: START_SHAPE_QUOTAS.house },
        },
      },
      {
        id: "mid-right-community-mobile",
        band: "ground",
        center: { x: 1, y: 0.55 },
        radius: { tiles: 8, xDistort: 5, yDistort: 0.4 },
        shapes: {
          trees: { count: count(2, 0, 0), quota: START_SHAPE_QUOTAS.trees },
          car: { count: count(1, 0, 0), quota: START_SHAPE_QUOTAS.car },
          power: { count: count(1, 0, 0), quota: FLAT_QUOTA },
          carFactory: { count: count(1, 0, 0), quota: START_SHAPE_QUOTAS.carFactory },
        },
      },
      {
        id: "mid-mid-community-2",
        band: "ground",
        center: { x: 0.48, y: 0.3 },
        radius: { tiles: 4, xDistort: 1.55, yDistort: 0.85 },
        shapes: {
          villa: { count: count(1, 1, 2), quota: START_SHAPE_QUOTAS.villa },
          trees: { count: count(2, 2, 4), quota: START_SHAPE_QUOTAS.trees },
          car: { count: count(1, 1, 1), quota: START_SHAPE_QUOTAS.car },
          power: { count: count(0, 1, 1), quota: FLAT_QUOTA },
          carFactory: { count: count(1, 1, 1), quota: START_SHAPE_QUOTAS.carFactory },
        },
      },
      {
        id: "mid-close-community",
        band: "ground",
        center: { x: 0.45, y: 0.75 },
        radius: { tiles: 8, xDistort: 6, yDistort: 0.3 },
        shapes: {
          villa: { count: count(0, 1, 2), quota: START_SHAPE_QUOTAS.villa },
          house: { count: count(1, 3, 1), quota: START_SHAPE_QUOTAS.house },
          trees: { count: count(1, 2, 4), quota: START_SHAPE_QUOTAS.trees },
          car: { count: count(1, 1, 1), quota: START_SHAPE_QUOTAS.car },
          bus: { count: count(0, 1, 2), quota: START_SHAPE_QUOTAS.bus },
          power: { count: count(1, 1, 1), quota: FLAT_QUOTA },
          carFactory: { count: count(1, 1, 1), quota: START_SHAPE_QUOTAS.carFactory },
          sea: { count: count(1, 0, 0), quota: FLAT_QUOTA },
        },
      },
      {
        id: "mid-close-community-2",
        band: "ground",
        center: { x: 0.6, y: 0.82 },
        radius: { tiles: 8, xDistort: 6, yDistort: 0.3 },
        shapes: {
          trees: { count: count(2, 2, 3), quota: START_SHAPE_QUOTAS.trees },
          bus: { count: count(1, 1, 1), quota: START_SHAPE_QUOTAS.bus },
        },
      },
      {
        id: "mid-edge-patch",
        band: "ground",
        center: { x: 0.7, y: 0.65 },
        radius: { tiles: 8, xDistort: 6, yDistort: 0.3 },
        shapes: {
          trees: { count: count(1, 2, 4), quota: START_SHAPE_QUOTAS.trees },
          car: { count: count(1, 1, 1), quota: START_SHAPE_QUOTAS.car },
          bus: { count: count(0, 1, 1), quota: START_SHAPE_QUOTAS.bus },
        },
      },
      {
        id: "mid-trees",
        band: "ground",
        center: { x: 0.35, y: 0.9 },
        radius: { tiles: 5, xDistort: 6, yDistort: 0.3 },
        shapes: {
          trees: { count: count(2, 2, 4), quota: START_SHAPE_QUOTAS.trees },
        },
      },
      {
        id: "left-close-trees",
        band: "ground",
        center: { x: 0, y: 0.8 },
        radius: { tiles: 5, xDistort: 6, yDistort: 0.3 },
        shapes: {
          trees: { count: count(1, 2, 4), quota: START_SHAPE_QUOTAS.trees },
          clouds: { count: count(0, 1, 1), quota: START_SHAPE_QUOTAS.clouds },
        },
      },
      {
        id: "left-mid-community",
        band: "ground",
        center: { x: 0.2, y: 0.7 },
        radius: { tiles: 5, xDistort: 1, yDistort: 0.2 },
        shapes: {
          sea: { count: count(1, 1, 1), quota: FLAT_QUOTA },
          house: { count: count(1, 1, 1), quota: START_SHAPE_QUOTAS.house },
          villa: { count: count(1, 2, 3), quota: START_SHAPE_QUOTAS.villa },
          trees: { count: count(1, 0, 4), quota: START_SHAPE_QUOTAS.trees },
          car: { count: count(1, 1, 1), quota: START_SHAPE_QUOTAS.car },
          bus: { count: count(1, 1, 1), quota: START_SHAPE_QUOTAS.bus },
        },
      },
      {
        id: "left-far-community",
        band: "ground",
        center: { x: 0.3, y: 0.4 },
        radius: { tiles: 5, xDistort: 2, yDistort: 0.3 },
        shapes: {
          sea: { count: count(1, 1, 2), quota: FLAT_QUOTA },
          carFactory: { count: count(1, 1, 1), quota: FLAT_QUOTA },
          house: { count: count(1, 1, 1), quota: START_SHAPE_QUOTAS.house },
          villa: { count: count(1, 1, 2), quota: START_SHAPE_QUOTAS.villa },
          trees: { count: count(1, 2, 6), quota: START_SHAPE_QUOTAS.trees },
          car: { count: count(1, 1, 1), quota: START_SHAPE_QUOTAS.car },
          bus: { count: count(1, 1, 1), quota: START_SHAPE_QUOTAS.bus },
        },
      },
      {
        id: "left-far-community-2",
        band: "ground",
        center: { x: 0.1, y: 0.3 },
        radius: { tiles: 6, xDistort: 4, yDistort: 0.1 },
        shapes: {
          villa: { count: count(1, 3, 5), quota: START_SHAPE_QUOTAS.villa },
          house: { count: count(1, 3, 5), quota: START_SHAPE_QUOTAS.house },
          trees: { count: count(1, 2, 8), quota: START_SHAPE_QUOTAS.trees },
          car: { count: count(1, 1, 3), quota: START_SHAPE_QUOTAS.car },
          bus: { count: count(1, 1, 1), quota: START_SHAPE_QUOTAS.bus },
          power: { count: count(1, 1, 3), quota: FLAT_QUOTA },
        },
      },
    ],
  },
};
