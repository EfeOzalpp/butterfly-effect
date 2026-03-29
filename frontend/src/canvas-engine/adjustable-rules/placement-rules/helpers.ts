// src/canvas-engine/adjustable-rules/placement-rules/helpers.ts

import type { DeviceType } from "../../shared/responsiveness";
import type { ShapeName } from "../shapeCatalog";
import { SHAPES } from "../shapeCatalog";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type DeviceCount = Partial<Record<DeviceType, number>>;

export type PlacementZone = {
  verticalK: [top: number, bottom: number];    // [0..1] fraction of viewport height
  horizontalK?: [left: number, right: number]; // [0..1] fraction of viewport width (default: [0, 1])
  count: DeviceCount;                          // base count per device at allocAvg = 0.5 (quota pct = 50)
};

export type QuotaAnchor = { t: number; pct: number };

export type ShapePlacementRule = {
  // Percentage curve: 50% means exactly `count` items. Default = flat 50%.
  // Formula: actual = round(zoneCount * pct(allocAvg) / 50)
  quota?: QuotaAnchor[];
  zones: PlacementZone[];
};

export type ScenePlacementRules = Partial<Record<ShapeName, ShapePlacementRule>>;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Apply the same rule to multiple shapes — spread the result into a rules object. */
export function forShapes(
  shapes: ShapeName[],
  rule: ShapePlacementRule
): ScenePlacementRules {
  const out: ScenePlacementRules = {};
  for (const s of shapes) out[s] = rule;
  return out;
}

// ---------------------------------------------------------------------------
// Stable item ID — deterministic per (shape, zoneIndex, itemIndex).
// Stable IDs allow the runtime lifecycle system to track appear/exit
// animations correctly as counts grow or shrink with allocAvg.
// ---------------------------------------------------------------------------

const SHAPE_IDX: Record<string, number> = Object.fromEntries(
  SHAPES.map((s, i) => [s, i])
);

export function stableItemId(shape: ShapeName, zoneIdx: number, itemIdx: number): number {
  // shape (0–10) × 65536 + zoneIdx (0–255) × 256 + itemIdx (0–255)
  return (SHAPE_IDX[shape] * 65536 + zoneIdx * 256 + itemIdx) | 0;
}

// ---------------------------------------------------------------------------
// Quota interpolation
// ---------------------------------------------------------------------------

export function interpolatePct(quota: QuotaAnchor[] | undefined, t: number): number {
  if (!quota || quota.length === 0) return 50;

  const sorted = [...quota].sort((a, b) => a.t - b.t);
  const clamped = Math.max(0, Math.min(1, t));

  if (clamped <= sorted[0].t) return sorted[0].pct;
  if (clamped >= sorted[sorted.length - 1].t) return sorted[sorted.length - 1].pct;

  let i = 0;
  while (i < sorted.length - 1 && clamped > sorted[i + 1].t) i++;

  const a = sorted[i];
  const b = sorted[i + 1];
  const k = (clamped - a.t) / Math.max(1e-6, b.t - a.t);
  return a.pct + (b.pct - a.pct) * k;
}
