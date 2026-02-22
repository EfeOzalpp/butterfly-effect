// src/canvas-engine/scene-logic/types.ts

import type { DeviceType } from "../shared/responsiveness";
import type { CanvasPaddingSpec } from "../adjustable-rules/canvasPadding";
import type { Place } from "../grid-layout/occupancy";

import type { QuotaSpecificationByKind } from "../adjustable-rules/quotaSpecification";
import type { ConditionKind, ShapeName, Size } from "../condition/domain";

import type { ShapeBands } from "../adjustable-rules/placementRules";
import type { SeparationMeta } from "../adjustable-rules/separationMeta";
import type { SceneLookupKey } from "../adjustable-rules/sceneMode";

export type FootRect = Place;

export type PoolItem = {
  id: number;
  cond: ConditionKind;
  shape?: ShapeName;
  size?: Size;
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
  // keep mode for debugging/meta + padding selection
  mode: SceneLookupKey;

  // padding table (device resolved later)
  padding: Record<DeviceType, CanvasPaddingSpec | null>;

  // resolved rule data (NO mode branching needed in compose/placement)
  bands: ShapeBands;
  separationMeta: Record<ShapeName, SeparationMeta>;

  quotaSpecification: QuotaSpecificationByKind;

  allocAvg: number | undefined;
  viewportKey?: number | string;

  canvas: { w: number; h: number };

  pool: PoolItem[];
  salt?: number;
};

export type ComposeMeta = {
  device: DeviceType;

  // keep spec in meta for debugging
  spec: CanvasPaddingSpec;

  rows: number;
  cols: number;
  cell: number;
  usedRows: number;

  mode: SceneLookupKey;
};

export type ComposeResult = {
  placed: PlacedItem[];
  nextPool: PoolItem[];
  meta: ComposeMeta;
};