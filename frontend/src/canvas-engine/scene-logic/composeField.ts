// src/canvas-engine/scene-logic/composeField.ts

import { deviceType } from "../shared/responsiveness";
import { resolvePaddingSpec } from "../scene-rules/canvas-padding";
import { makeCenteredSquareGrid } from "../grid-layout/buildGrid";
import { SHAPES } from "../scene-rules/shapeCatalog";
import { footprintForShape } from "../scene-rules/shapeFootprints";
import { stableItemId, interpolatePct } from "../scene-rules/placement-rules/index";

import type { ComposeOpts, ComposeResult, PoolItem } from "./types";
import { clamp01, usedRowsFromSpec } from "./math";
import { placePoolItems } from "./place";

function hasExplicitShapePlacement(
  rule: ComposeOpts["placements"][keyof ComposeOpts["placements"]]
): boolean {
  if (!rule || Array.isArray(rule) || "kind" in rule) return false;
  const r = rule as { center?: unknown; points?: unknown[]; zones?: unknown[] };
  return "center" in r ||
    (Array.isArray(r.points) && r.points.length > 0) ||
    (Array.isArray(r.zones) && r.zones.length > 0);
}

function buildPresetPool(
  opts: ComposeOpts,
  device: ReturnType<typeof deviceType>
): PoolItem[] {
  const preset = opts.placements.preset;
  if (preset?.kind !== "zone-communities") return [];

  const t = clamp01(opts.liveAvg);
  const queues: PoolItem[][] = [];

  preset.zones.forEach((zone, zoneIdx) => {
    for (const shape of SHAPES) {
      if (hasExplicitShapePlacement(opts.placements[shape])) continue;

      const rule = zone.shapes[shape];
      if (!rule) continue;

      const baseCount =
        rule.count[device] ??
        rule.count.tablet ??
        rule.count.mobile ??
        0;
      const pct = interpolatePct(rule.quota, t);
      const count = Math.max(0, Math.round(baseCount * pct / 50));
      if (count <= 0) continue;

      const size = footprintForShape(shape);
      const radiusX = zone.radius.xTiles ?? zone.radius.tiles * (zone.radius.xDistort ?? 1);
      const radiusY = zone.radius.yTiles ?? zone.radius.tiles * (zone.radius.yDistort ?? 1);
      const radiusShape = zone.radius.shape ?? "ellipse";
      const queue: PoolItem[] = [];

      for (let i = 0; i < count; i++) {
        queue.push({
          id: stableItemId(shape, zoneIdx, i),
          shape,
          zoneIndex: zoneIdx,
          size,
          communityZone: {
            id: zone.id,
            band: zone.band,
            centerX: zone.center.x,
            centerY: zone.center.y,
            radiusTiles: zone.radius.tiles,
            radiusShape,
            radiusX,
            radiusY,
          },
        });
      }

      queues.push(queue);
    }
  });

  const items: PoolItem[] = [];
  let round = 0;
  let found = true;

  while (found) {
    found = false;
    for (const queue of queues) {
      const item = queue[round];
      if (item !== undefined) {
        items.push(item);
        found = true;
      }
    }
    round += 1;
  }

  return items;
}

function buildRulePool(opts: ComposeOpts, device: ReturnType<typeof deviceType>): PoolItem[] {
  const { placements, liveAvg } = opts;
  const t = clamp01(liveAvg);
  const items: PoolItem[] = [];

  for (const shape of SHAPES) {
    const rule = placements[shape];
    if (!rule) continue;

    const pct = interpolatePct(rule.quota, t);
    const size = footprintForShape(shape);

    if (rule.center) {
      const baseCount =
        rule.center.count?.[device] ??
        rule.center.count?.tablet ??
        rule.center.count?.mobile ??
        1;
      const count = Math.max(0, Math.round(baseCount * pct / 50));

      for (let i = 0; i < count; i++) {
        items.push({
          id: stableItemId(shape, -2000, i),
          shape,
          zoneIndex: -2000,
          size,
          center: {
            xK: rule.center.xK ?? 0.5,
            yK: rule.center.yK ?? 0.5,
            scale: rule.center.scale ?? 1,
          },
        });
      }
    }

    rule.points?.forEach((pointPlacement, pointIdx) => {
      const baseCount =
        pointPlacement.count?.[device] ??
        pointPlacement.count?.tablet ??
        pointPlacement.count?.mobile ??
        1;
      const count = Math.max(0, Math.round(baseCount * pct / 50));

      for (let i = 0; i < count; i++) {
        items.push({
          id: stableItemId(shape, -1000 - pointIdx, i),
          shape,
          zoneIndex: -1000 - pointIdx,
          size,
          point: {
            xK: pointPlacement.xK,
            yK: pointPlacement.yK,
          },
        });
      }
    });

    rule.zones?.forEach((zone, zoneIdx) => {
      const baseCount = zone.count[device] ?? zone.count.tablet ?? zone.count.mobile ?? 0;
      const count = Math.max(0, Math.round(baseCount * pct / 50));

      for (let i = 0; i < count; i++) {
        items.push({
          id: stableItemId(shape, zoneIdx, i),
          shape,
          zoneIndex: zoneIdx,
          size,
        });
      }
    });
  }

  return items;
}

function buildPool(opts: ComposeOpts, device: ReturnType<typeof deviceType>): PoolItem[] {
  const rulePool = buildRulePool(opts, device);

  if (opts.placements.preset?.kind === "zone-communities") {
    return [...rulePool, ...buildPresetPool(opts, device)];
  }

  return rulePool;
}

export function composeField(opts: ComposeOpts): ComposeResult {
  const w = Math.round(opts.canvas.w);
  const h = Math.round(opts.canvas.h);
  const ruleW = Math.round(opts.ruleWidthPx ?? w);

  const device = deviceType(ruleW);
  const spec = resolvePaddingSpec(ruleW, opts.padding);

  const { cell, cellW, cellH, ox, oy, rows, cols, metrics } = makeCenteredSquareGrid({
    w,
    h,
    rows: spec.rows,
    useTopRatio: spec.useTopRatio ?? 1,
    horizonPos: spec.horizonPos,
  });

  const usedRows = usedRowsFromSpec(rows, spec.useTopRatio);

  if (!rows || !cols || !cell) {
    return { placed: [] };
  }

  const salt =
    typeof opts.salt === "number"
      ? opts.salt
      : (rows * 73856093) ^ (cols * 19349663);

  const pool = buildPool(opts, device);

  const { placed } = placePoolItems({
    pool,
    spec,
    device,
    rows,
    cols,
    cell,
    cellW,
    cellH,
    ox,
    oy,
    canvas: { w, h },
    usedRows,
    salt,
    placements: opts.placements,
    metrics,
    reservedFootprints: opts.reservedFootprints,
  });

  return { placed };
}
