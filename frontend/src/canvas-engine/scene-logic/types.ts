// src/canvas-engine/scene-logic/types.ts

import type { DeviceType } from "../shared/responsiveness";
import type { CanvasPaddingSpec } from "../adjustable-rules/canvas-padding";
import type { Place } from "../grid-layout/occupancy";
import type { ConditionKind, ShapeName, Size } from "../condition/domain";
import type { SceneLookupKey } from "../adjustable-rules/sceneMode";
import type { ScenePlacementRules } from "../adjustable-rules/placement-rules/index";

export type FootRect = Place;

export type PoolItem = {
  id: number;
  shape: ShapeName;
  zoneIndex: number;    // index into the shape's zones array
  size: Size;           // footprint grid dimensions
  cond: ConditionKind;  // kept for color modifier pipeline (SHAPE_TO_COND)
  footprint?: FootRect;
  x?: number;
  y?: number;
};

export type PlacedItem = {
  id: number;
  x: number;
  y: number;
  shape?: ShapeName;
  footprint: FootRect;
};

export type ComposeOpts = {
  mode: SceneLookupKey;
  padding: Record<DeviceType, CanvasPaddingSpec | null>;
  placements: ScenePlacementRules;
  allocAvg: number | undefined;
  reservedFootprints?: FootRect[];
  viewportKey?: number | string;
  ruleWidthPx?: number;
  canvas: { w: number; h: number };
  salt?: number;
};

export type ComposeMeta = {
  device: DeviceType;
  spec: CanvasPaddingSpec;
  rows: number;
  cols: number;
  cell: number;
  usedRows: number;
  mode: SceneLookupKey;
};

export type ComposeResult = {
  placed: PlacedItem[];
  meta: ComposeMeta;
};
