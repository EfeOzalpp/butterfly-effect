// src/canvas-engine/scene-logic/types.ts

import type { DeviceType } from "../shared/responsiveness";
import type { GridFootprint } from "../shared/geometry";
import type { CanvasPaddingSpec } from "../scene-rules/canvas-padding";
import type { ShapeName } from "../scene-rules/shapeCatalog";
import type { Size } from "../scene-rules/conditionFootprints";
import type { ScenePlacementRules } from "../scene-rules/placement-rules/index";
import type { EngineFieldItem } from "../runtime/engine/field";

export type FootRect = GridFootprint;

export interface PoolItem {
  id: EngineFieldItem["id"];
  shape: ShapeName;
  zoneIndex: number;    // index into the shape's zones array
  size: Size;           // footprint grid dimensions
  footprint?: FootRect;
  x?: number;
  y?: number;
}

// scene output stays narrower, but it must satisfy the runtime field item API.
export interface PlacedItem extends EngineFieldItem {
  shape: ShapeName;
  footprint: FootRect;
}

export interface ComposeOpts {
  padding: Record<DeviceType, CanvasPaddingSpec | null>;
  placements: ScenePlacementRules;
  liveAvg: number | undefined;
  reservedFootprints?: FootRect[];
  ruleWidthPx?: number;
  canvas: { w: number; h: number };
  salt?: number;
}

export interface ComposeResult {
  placed: PlacedItem[];
}
