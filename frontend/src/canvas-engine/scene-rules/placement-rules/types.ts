// src/canvas-engine/scene-rules/placement-rules/types.ts

import type { DeviceType } from "../../shared/responsiveness";
import type { ShapeName } from "../shapeCatalog";

export type DeviceCount = Partial<Record<DeviceType, number>>;

export interface PlacementZone {
  verticalK: [top: number, bottom: number]; // vertical fraction of viewport height
  horizontalK?: [left: number, right: number]; // horizontal fraction of viewport width
  count: DeviceCount; // base count per device at liveAvg = 0.5
}

export interface QuotaAnchor {
  t: number;
  pct: number;
}

export interface ShapePlacementRule {
  // 50% means exactly the authored zone count. Default is flat 50%.
  quota?: QuotaAnchor[];
  zones?: PlacementZone[];
  absolute?: {
    kind: "center";
    count: DeviceCount;
    xK?: number;
    yK?: number;
    scale?: number;
  };
}

export type ScenePlacementRuleMap = Partial<Record<ShapeName, ShapePlacementRule>>;

export type ProceduralZoneBand = "ground" | "sky";

export interface ProceduralZoneShapeRule {
  count: DeviceCount;
  quota?: QuotaAnchor[];
}

export interface ProceduralPlacementZone {
  id: string;
  band: ProceduralZoneBand;
  center: {
    x: number;
    y: number;
  };
  radius: {
    tiles: number;
    shape?: "ellipse" | "rect";
    xDistort?: number;
    yDistort?: number;
    xTiles?: number;
    yTiles?: number;
  };
  shapes: Partial<Record<ShapeName, ProceduralZoneShapeRule>>;
}

export interface ProceduralZonePlacementPreset {
  kind: "zone-communities";
  seed?: string;
  overflow?: "skip";
  zones: readonly ProceduralPlacementZone[];
}

export type ScenePlacementRules = ScenePlacementRuleMap & {
  preset?: ProceduralZonePlacementPreset;
  // Optional runtime-selectable placement maps. The Spotlight signal currently
  // drives this list, wrapping after the final entry.
  variants?: readonly ScenePlacementRuleMap[];
};
