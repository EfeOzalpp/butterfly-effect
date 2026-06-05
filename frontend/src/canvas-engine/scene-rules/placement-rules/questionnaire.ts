// src/canvas-engine/scene-rules/placement-rules/questionnaire.ts

import type { DeviceCount, QuotaAnchor, ScenePlacementRules } from "./types";

const FLAT_QUOTA: QuotaAnchor[] = [
  { t: 0, pct: 50 },
  { t: 1, pct: 50 },
];

const QUESTIONNAIRE_SHAPE_QUOTAS = {
  clouds: [
    { t: 0, pct: 35 },
    { t: 1, pct: 55 },
  ],
  snow: [
    { t: 0, pct: 40 },
    { t: 1, pct: 60 },
  ],
  villa: [
    { t: 0, pct: 45 },
    { t: 1, pct: 15 },
  ],
  house: [
    { t: 0, pct: 35 },
    { t: 1, pct: 55 },
  ],
  power: [
    { t: 0, pct: 40 },
    { t: 1, pct: 30 },
  ],
  carFactory: [
    { t: 0, pct: 35 },
    { t: 1, pct: 20 },
  ],
  trees: [
    { t: 0, pct: 30 },
    { t: 1, pct: 60 },
  ],
  sea: [
    { t: 0, pct: 20 },
    { t: 1, pct: 60 },
  ],
  bus: [
    { t: 0, pct: 10 },
    { t: 1, pct: 80 },
  ],
  car: [
    { t: 0, pct: 80 },
    { t: 1, pct: 20 },
  ],
} satisfies Record<string, QuotaAnchor[]>;

function count(mobile: number, tablet: number, laptop: number): DeviceCount {
  return { mobile, tablet, laptop };
}

export const QUESTIONNAIRE_PLACEMENTS: ScenePlacementRules = {
  preset: {
    kind: "zone-communities",
    seed: "questionnaire-community-layout-v1",
    overflow: "skip",
    zones: [
      // Sky
      {
        id: "sky-light",
        band: "sky",
        center: { x: 0.14, y: 0.14 },
        radius: { tiles: 2, xDistort: 1.4, yDistort: 0.8 },
        shapes: {
          sun: { count: count(1, 1, 1), quota: FLAT_QUOTA },
        },
      },
      {
        id: "weather-left",
        band: "sky",
        center: { x: 0.16, y: 0.34 },
        radius: { tiles: 5, xDistort: 2.8, yTiles: 0.7 },
        shapes: {
          clouds: { count: count(1, 2, 3), quota: QUESTIONNAIRE_SHAPE_QUOTAS.clouds },
          snow: { count: count(0, 1, 1), quota: QUESTIONNAIRE_SHAPE_QUOTAS.snow },
        },
      },
      {
        id: "weather-mid",
        band: "sky",
        center: { x: 0.54, y: 0.24 },
        radius: { tiles: 5, xDistort: 3.2, yTiles: 0.65 },
        shapes: {
          clouds: { count: count(0, 2, 4), quota: QUESTIONNAIRE_SHAPE_QUOTAS.clouds },
          snow: { count: count(0, 1, 1), quota: QUESTIONNAIRE_SHAPE_QUOTAS.snow },
        },
      },
      {
        id: "weather-right",
        band: "sky",
        center: { x: 0.86, y: 0.32 },
        radius: { tiles: 5, xDistort: 2.6, yTiles: 0.7 },
        shapes: {
          clouds: { count: count(1, 2, 4), quota: QUESTIONNAIRE_SHAPE_QUOTAS.clouds },
          snow: { count: count(0, 1, 2), quota: QUESTIONNAIRE_SHAPE_QUOTAS.snow },
        },
      },

      // Ground
      {
        id: "left-far-community",
        band: "ground",
        center: { x: 0.18, y: 0.16 },
        radius: { tiles: 5, xDistort: 4, yDistort: 0.45 },
        shapes: {
          villa: { count: count(1, 2, 4), quota: QUESTIONNAIRE_SHAPE_QUOTAS.villa },
          house: { count: count(1, 2, 3), quota: QUESTIONNAIRE_SHAPE_QUOTAS.house },
          trees: { count: count(4, 8, 16), quota: QUESTIONNAIRE_SHAPE_QUOTAS.trees },
          power: { count: count(0, 1, 1), quota: QUESTIONNAIRE_SHAPE_QUOTAS.power },
        },
      },
      {
        id: "mid-far-community",
        band: "ground",
        center: { x: 0.52, y: 0.18 },
        radius: { tiles: 6, xDistort: 4.4, yDistort: 0.45 },
        shapes: {
          villa: { count: count(1, 2, 5), quota: QUESTIONNAIRE_SHAPE_QUOTAS.villa },
          house: { count: count(1, 2, 3), quota: QUESTIONNAIRE_SHAPE_QUOTAS.house },
          trees: { count: count(5, 9, 18), quota: QUESTIONNAIRE_SHAPE_QUOTAS.trees },
          carFactory: { count: count(0, 1, 2), quota: QUESTIONNAIRE_SHAPE_QUOTAS.carFactory },
          bus: { count: count(0, 1, 1), quota: QUESTIONNAIRE_SHAPE_QUOTAS.bus },
        },
      },
      {
        id: "right-far-community",
        band: "ground",
        center: { x: 0.82, y: 0.20 },
        radius: { tiles: 5, xDistort: 4, yDistort: 0.45 },
        shapes: {
          villa: { count: count(1, 2, 4), quota: QUESTIONNAIRE_SHAPE_QUOTAS.villa },
          house: { count: count(1, 2, 3), quota: QUESTIONNAIRE_SHAPE_QUOTAS.house },
          trees: { count: count(4, 8, 16), quota: QUESTIONNAIRE_SHAPE_QUOTAS.trees },
          power: { count: count(0, 1, 2), quota: QUESTIONNAIRE_SHAPE_QUOTAS.power },
        },
      },
      {
        id: "left-close-community",
        band: "ground",
        center: { x: 0.16, y: 0.78 },
        radius: { tiles: 5, xDistort: 2.8, yDistort: 0.5 },
        shapes: {
          villa: { count: count(1, 1, 2), quota: QUESTIONNAIRE_SHAPE_QUOTAS.villa },
          house: { count: count(1, 1, 2), quota: QUESTIONNAIRE_SHAPE_QUOTAS.house },
          trees: { count: count(5, 7, 12), quota: QUESTIONNAIRE_SHAPE_QUOTAS.trees },
          car: { count: count(1, 1, 2), quota: QUESTIONNAIRE_SHAPE_QUOTAS.car },
          bus: { count: count(0, 1, 1), quota: QUESTIONNAIRE_SHAPE_QUOTAS.bus },
        },
      },
      {
        id: "mid-close-community",
        band: "ground",
        center: { x: 0.50, y: 0.74 },
        radius: { tiles: 6, xDistort: 3.2, yDistort: 0.55 },
        shapes: {
          sea: { count: count(1, 1, 2), quota: QUESTIONNAIRE_SHAPE_QUOTAS.sea },
          villa: { count: count(1, 1, 2), quota: QUESTIONNAIRE_SHAPE_QUOTAS.villa },
          house: { count: count(1, 1, 2), quota: QUESTIONNAIRE_SHAPE_QUOTAS.house },
          trees: { count: count(5, 7, 12), quota: QUESTIONNAIRE_SHAPE_QUOTAS.trees },
          carFactory: { count: count(0, 1, 1), quota: QUESTIONNAIRE_SHAPE_QUOTAS.carFactory },
          car: { count: count(1, 1, 2), quota: QUESTIONNAIRE_SHAPE_QUOTAS.car },
        },
      },
      {
        id: "right-close-community",
        band: "ground",
        center: { x: 0.84, y: 0.76 },
        radius: { tiles: 5, xDistort: 2.8, yDistort: 0.5 },
        shapes: {
          villa: { count: count(1, 1, 2), quota: QUESTIONNAIRE_SHAPE_QUOTAS.villa },
          house: { count: count(1, 1, 2), quota: QUESTIONNAIRE_SHAPE_QUOTAS.house },
          trees: { count: count(5, 7, 12), quota: QUESTIONNAIRE_SHAPE_QUOTAS.trees },
          power: { count: count(0, 1, 1), quota: QUESTIONNAIRE_SHAPE_QUOTAS.power },
          bus: { count: count(1, 1, 1), quota: QUESTIONNAIRE_SHAPE_QUOTAS.bus },
          car: { count: count(1, 1, 2), quota: QUESTIONNAIRE_SHAPE_QUOTAS.car },
        },
      },
    ],
  },
};
