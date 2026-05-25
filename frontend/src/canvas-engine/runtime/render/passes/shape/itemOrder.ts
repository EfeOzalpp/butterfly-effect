import type { EngineFieldItem } from "../../../engine/field";
import type { GridMetrics } from "../../../../grid-layout/gridMetrics";
import { metricsDepth } from "../../../../grid-layout/gridMetrics";

interface ItemOrderContext {
  gridMetrics?: GridMetrics;
}

function itemDepth(item: EngineFieldItem, gridMetrics?: GridMetrics): number {
  return gridMetrics && item.footprint ? metricsDepth(gridMetrics, item.footprint) : item.y;
}

function itemScreenY(item: EngineFieldItem, gridMetrics?: GridMetrics): number {
  if (!gridMetrics || !item.footprint) return item.y;
  const bottomRow = Math.max(
    0,
    Math.min(gridMetrics.rowOffsetY.length - 1, item.footprint.r0 + item.footprint.h - 1)
  );
  return gridMetrics.rowOffsetY[bottomRow] ?? item.y;
}

// Painter order follows projected depth. Screen Y is only a same-depth tie-breaker.
function compareItemsForRender(
  a: EngineFieldItem,
  b: EngineFieldItem,
  { gridMetrics }: ItemOrderContext
): number {
  const da = itemDepth(a, gridMetrics);
  const db = itemDepth(b, gridMetrics);
  if (da !== db) return da - db;

  const ya = itemScreenY(a, gridMetrics);
  const yb = itemScreenY(b, gridMetrics);
  if (ya !== yb) return ya - yb;

  return a.id.localeCompare(b.id);
}

export function sortItemsForRenderInto(
  target: EngineFieldItem[],
  items: EngineFieldItem[],
  context: ItemOrderContext
): EngineFieldItem[] {
  target.length = items.length;
  for (let i = 0; i < items.length; i += 1) {
    target[i] = items[i];
  }
  target.sort((a, b) => compareItemsForRender(a, b, context));
  return target;
}

export function renderDepthOfItem(item: EngineFieldItem, gridMetrics?: GridMetrics): number {
  return itemDepth(item, gridMetrics);
}
