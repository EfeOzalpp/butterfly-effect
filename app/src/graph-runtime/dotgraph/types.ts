// src/graph-runtime/dotgraph/types.ts

export type {
  DotPoint,
  DotPointsOptions,
  SurveyResponseLike,
} from "./utils/dotPoints";
export type { Vec3 } from "./utils/positions";

import type { DotPoint, SurveyResponseLike } from "./utils/dotPoints";
import type { Vec3 } from "./utils/positions";
import type { TooltipPlacement } from "./tooltip/placement";
import type { SpriteVisualLayout } from "../sprites/types";

export type IdentifiedDotPoint = DotPoint & { _id: string };
export type DotGraphEntry = SurveyResponseLike;
export type TooltipAnchorMode = "hitboxCenter" | "shapeCenter";

export interface DotGraphHoverEvent {
  nativeEvent?: {
    clientX?: number;
    clientY?: number;
    target?: EventTarget | null;
  };
  clientX?: number;
  clientY?: number;
  anchorPosition?: Vec3;
  tooltipLayout?: SpriteVisualLayout;
  tooltipPlacement?: TooltipPlacement;
  tooltipAnchorMode?: TooltipAnchorMode;
  stopPropagation?: () => void;
  preventDefault?: () => void;
}

export interface DotGraphHoveredDot {
  dotId: string;
  percentage: number;
  color: string;
  anchorPosition?: Vec3;
  tooltipLayout?: SpriteVisualLayout;
  tooltipPlacement?: TooltipPlacement;
  tooltipAnchorMode?: TooltipAnchorMode;
}

export type DotGraphHoverStart = (
  point: IdentifiedDotPoint,
  event: DotGraphHoverEvent
) => void;

export interface PersonalizedDotShape {
  position: Vec3;
  color: string;
}

export interface DotGraphTieStats {
  below: number;
  equal: number;
  above: number;
  totalOthers?: number;
}

export interface DotGraphPositionClass {
  position: string;
  tieContext: string;
}

export function hasDotId(point: DotPoint): point is IdentifiedDotPoint {
  return typeof point._id === "string" && point._id.length > 0;
}
