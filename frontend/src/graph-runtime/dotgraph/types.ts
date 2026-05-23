// src/graph-runtime/dotgraph/types.ts

export type {
  DotPoint,
  DotPointsOptions,
  SurveyResponseLike,
} from "./utils/dotPoints";
export type { Vec3 } from "./utils/positions";

import type { DotPoint, SurveyResponseLike } from "./utils/dotPoints";
import type { Vec3 } from "./utils/positions";

export type IdentifiedDotPoint = DotPoint & { _id: string };
export type DotGraphEntry = SurveyResponseLike;

export interface DotGraphHoverEvent {
  nativeEvent?: {
    clientX?: number;
    clientY?: number;
    target?: EventTarget | null;
  };
  clientX?: number;
  clientY?: number;
  stopPropagation?: () => void;
  preventDefault?: () => void;
}

export interface DotGraphHoveredDot {
  dotId: string;
  percentage: number;
  color: string;
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
