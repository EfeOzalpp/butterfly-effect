// src/canvas-engine/adjustable-rules/placementRules.ts

import type { DeviceType } from "../shared/responsiveness";
import type { ShapeName } from "./shapeCatalog";
import type { SceneLookupKey } from "./sceneMode";

export type Band = { topK: number; botK: number };

export type ShapeBands = Record<DeviceType, Record<ShapeName, Band>>;

// 0 is top of the viewport and 1 is bottom of viewport topK is upper band and botK is lower band
const START_BANDS: ShapeBands = {
    mobile: {
      sun: { topK: 0.0, botK: 0.08 },
      clouds: { topK: 0.12, botK: 0.24 },
      snow: { topK: 0.16, botK: 0.32 },
      house: { topK: 0.44, botK: 0.78 },
      villa: { topK: 0.42, botK: 0.76 },
      power: { topK: 0.46, botK: 0.8 },
      carFactory: { topK: 0.5, botK: 0.84 },
      car: { topK: 0.56, botK: 0.9 },
      bus: { topK: 0.56, botK: 0.9 },
      sea: { topK: 0.62, botK: 0.94 },
      trees: { topK: 0.52, botK: 0.9 },
    },
    tablet: {
      sun: { topK: 0.0, botK: 0.1 },
      clouds: { topK: 0.14, botK: 0.28 },
      snow: { topK: 0.18, botK: 0.34 },
      house: { topK: 0.46, botK: 0.8 },
      villa: { topK: 0.42, botK: 0.76 },
      power: { topK: 0.46, botK: 0.82 },
      carFactory: { topK: 0.5, botK: 0.86 },
      car: { topK: 0.56, botK: 0.82 },
      bus: { topK: 0.56, botK: 0.86 },
      sea: { topK: 0.62, botK: 0.96 },
      trees: { topK: 0.54, botK: 0.9 },
    },
    laptop: {
      sun: { topK: 0.0, botK: 0.08 },
      clouds: { topK: 0.3, botK: 0.4 },
      snow: { topK: 0.1, botK: 0.2 },
      house: { topK: 0.53, botK: 0.6 },
      villa: { topK: 0.53, botK: 0.7 },
      power: { topK: 0.5, botK: 0.65 },
      carFactory: { topK: 0.7, botK: 0.8 },
      car: { topK: 0.65, botK: 0.75 },
      bus: { topK: 0.65, botK: 0.75 },
      sea: { topK: 0.65, botK: 0.75 },
      trees: { topK: 0.6, botK: 0.67 },
    },
};

export const SHAPE_BANDS: Record<SceneLookupKey, ShapeBands> = {
  start: START_BANDS,

  questionnaire: {
    mobile: {
      sun: { topK: 0, botK: 0.8 },
      clouds: { topK: 0, botK: 0.8 },
      snow: { topK: 0, botK: 0.8 },
      house: { topK: 0, botK: 1 },
      villa: { topK: 0, botK: 1 },
      power: { topK: 0.7, botK: 1 },
      carFactory: { topK: 0.8, botK: 1 },
      car: { topK: 0, botK: 1 },
      bus: { topK: 0, botK: 1 },
      sea: { topK: 0.8, botK: 1 },
      trees: { topK: 0, botK: 1 },
    },
    tablet: {
      sun: { topK: 0, botK: 0.8 },
      clouds: { topK: 0, botK: 0.65 },
      snow: { topK: 0, botK: 0.8 },
      house: { topK: 0, botK: 1 },
      villa: { topK: 0, botK: 1 },
      power: { topK: 0.7, botK: 1 },
      carFactory: { topK: 0.8, botK: 1 },
      car: { topK: 0, botK: 1 },
      bus: { topK: 0, botK: 1 },
      sea: { topK: 0.8, botK: 1 },
      trees: { topK: 0, botK: 1 },
    },
    laptop: {
      sun: { topK: 0, botK: 0.1 },
      clouds: { topK: 0.3, botK: 0.4 },
      snow: { topK: 0.2, botK: 0.6 },
      house: { topK: 0.55, botK: 0.62 },
      villa: { topK: 0.55, botK: 0.62 },
      power: { topK: 0.6, botK: 0.6 },
      carFactory: { topK: 0.6, botK: 0.6 },
      car: { topK: 0.6, botK: 0.7 },
      bus: { topK: 0.6, botK: 0.7 },
      sea: { topK: 0.6, botK: 0.7 },
      trees: { topK: 0.6, botK: 0.75 },
    },
  },

  city: {
    mobile: {
      sun: { topK: 0.0, botK: 0.24 },
      clouds: { topK: 0.02, botK: 0.42 },
      snow: { topK: 0.08, botK: 0.52 },
      house: { topK: 0.44, botK: 0.72 },
      villa: { topK: 0.48, botK: 0.78 },
      power: { topK: 0.42, botK: 0.72 },
      car: { topK: 0.72, botK: 0.9 },
      bus: { topK: 0.7, botK: 0.88 },
      trees: { topK: 0.58, botK: 0.88 },
      sea: { topK: 0.76, botK: 0.94 },
      carFactory: { topK: 0.54, botK: 0.82 },
    },
    tablet: {
      sun: { topK: 0.0, botK: 0.22 },
      clouds: { topK: 0.02, botK: 0.38 },
      snow: { topK: 0.08, botK: 0.48 },
      house: { topK: 0.42, botK: 0.68 },
      villa: { topK: 0.46, botK: 0.74 },
      power: { topK: 0.4, botK: 0.7 },
      car: { topK: 0.72, botK: 0.9 },
      bus: { topK: 0.68, botK: 0.88 },
      trees: { topK: 0.56, botK: 0.88 },
      sea: { topK: 0.76, botK: 0.94 },
      carFactory: { topK: 0.52, botK: 0.8 },
    },
    laptop: {
      sun: { topK: 0.0, botK: 0.2 },
      clouds: { topK: 0.02, botK: 0.34 },
      snow: { topK: 0.08, botK: 0.44 },
      house: { topK: 0.44, botK: 0.68 },
      villa: { topK: 0.48, botK: 0.74 },
      power: { topK: 0.42, botK: 0.7 },
      car: { topK: 0.74, botK: 0.9 },
      bus: { topK: 0.7, botK: 0.88 },
      trees: { topK: 0.56, botK: 0.86 },
      sea: { topK: 0.78, botK: 0.94 },
      carFactory: { topK: 0.54, botK: 0.8 },
    },
  },
};