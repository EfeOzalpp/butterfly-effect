import type { EngineFieldItem } from "../../../../engine/field";
import type { GridMetrics } from "../../../../geometry/gridCache";
import type { FarShapeBitmapCachePolicy } from "../../../cache-policy";

const SHARED_FAR_STAMP_SHAPES = new Set(["trees", "villa"]);

export const SHARED_FAR_STAMP_SIZE_K = 0.45;

export function isSharedFarStampShape(item: EngineFieldItem) {
  return SHARED_FAR_STAMP_SHAPES.has(item.shape) && item.footprint != null;
}

export function isFarCacheCandidate(
  item: EngineFieldItem,
  gridMetrics: GridMetrics | undefined,
  farSizeK: number
) {
  const sizeK = itemSizeK(item, gridMetrics);
  return sizeK !== null && sizeK <= farSizeK;
}

function itemSizeK(
  item: EngineFieldItem,
  gridMetrics: GridMetrics | undefined
) {
  const f = item.footprint;
  if (!f || !gridMetrics || gridMetrics.rowHeights.length === 0) return null;

  const bottomRow = f.r0 + f.h - 1;
  const rowH = gridMetrics.rowHeights[bottomRow] ?? 0;
  const maxRowH = Math.max(...gridMetrics.rowHeights);
  if (rowH <= 0 || maxRowH <= 0) return null;

  return rowH / maxRowH;
}

export function allowsFarShapeBitmapCache(
  item: EngineFieldItem,
  policy: FarShapeBitmapCachePolicy,
  gridMetrics?: GridMetrics
) {
  if (!policy.alwaysLiveShapes.includes(item.shape)) return true;

  const cacheBelowSizeK = policy.cacheBelowSizeK?.[item.shape];
  if (cacheBelowSizeK === undefined) return false;

  const sizeK = itemSizeK(item, gridMetrics);
  return sizeK !== null && sizeK <= cacheBelowSizeK;
}
