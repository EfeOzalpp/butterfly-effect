// src/canvas-engine/scene-logic/types.ts


import type { GridFootprint } from "../shared/geometry";
import type { CanvasPaddingPolicy } from "../scene-rules/canvas-padding";
import type { ShapeName } from "../scene-rules/shapeCatalog";
import type { Size } from "../scene-rules/shapeFootprints";
import type { ScenePlacementRules } from "../scene-rules/placement-rules/index";
import type { ProceduralZoneBand } from "../scene-rules/placement-rules";
import type { EngineFieldItem } from "../runtime/engine/field";

export type FootRect = GridFootprint;

export interface PoolItem {
  id: EngineFieldItem["id"];
  shape: ShapeName;
  zoneIndex: number;    // index into the shape's zones array
  size: Size;           // footprint grid dimensions
  point?: {
    xK: number;
    yK: number;
  };
  center?: {
    xK: number;
    yK: number;
    scale: number;
  };
  communityZone?: {
    id: string;
    band: ProceduralZoneBand;
    centerX: number;
    centerY: number;
    radiusTiles: number;
    radiusShape: "ellipse" | "rect";
    radiusX: number;
    radiusY: number;
  };
  footprint?: FootRect;
  pixelFootprint?: EngineFieldItem["pixelFootprint"];
  x?: number;
  y?: number;
}

// scene output stays narrower, but it must satisfy the runtime field item API.
export interface PlacedItem extends EngineFieldItem {
  shape: ShapeName;
  footprint: FootRect;
}

export interface ComposeOpts {
  padding: CanvasPaddingPolicy;
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
