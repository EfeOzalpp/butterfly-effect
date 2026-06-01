// src/canvas-engine/scene-rules/placement-rules/index.ts

import type { SceneLookupKey } from "../../scene-state";
import type { ScenePlacementRules } from "./types";

export type {
  ScenePlacementRuleMap,
  ScenePlacementRules,
  ShapePlacementRule,
  PlacementZone,
  ProceduralPlacementZone,
  ProceduralZonePlacementPreset,
  ProceduralZoneShapeRule,
  ProceduralZoneBand,
  QuotaAnchor,
  DeviceCount,
} from "./types";
export { forShapes, stableItemId, interpolatePct } from "./helpers";

import { START_PLACEMENTS } from "./start";
import { CITY_PLACEMENTS } from "./city";
import { QUESTIONNAIRE_PLACEMENTS } from "./questionnaire";
import { SPOTLIGHT_PLACEMENTS } from "./spotlight";

export const SHAPE_PLACEMENTS: Record<SceneLookupKey, ScenePlacementRules> = {
  start: START_PLACEMENTS,
  city: CITY_PLACEMENTS,
  questionnaire: QUESTIONNAIRE_PLACEMENTS,
  spotlight: SPOTLIGHT_PLACEMENTS,
};
