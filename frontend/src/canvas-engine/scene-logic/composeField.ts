// src/canvas-engine/scene-logic/composeField.ts

import { deviceType } from "../shared/responsiveness";
import { resolvePaddingSpec } from "../scene-rules/canvas-padding";
import { makeCenteredSquareGrid } from "../grid-layout/buildGrid";
import { SHAPES } from "../scene-rules/shapeCatalog";
import { footprintForShape } from "../scene-rules/conditionFootprints";
import { stableItemId, interpolatePct } from "../scene-rules/placement-rules/index";

import type { ComposeOpts, ComposeResult, PoolItem } from "./types";
import { clamp01, usedRowsFromSpec } from "./math";
import { placePoolItems } from "./place";

function buildPool(opts: ComposeOpts, device: ReturnType<typeof deviceType>): PoolItem[] {
  const { placements, liveAvg } = opts;
  const t = clamp01(liveAvg);
  const items: PoolItem[] = [];

  for (const shape of SHAPES) {
    const rule = placements[shape];
    if (!rule) continue;

    const pct = interpolatePct(rule.quota, t);
    const size = footprintForShape(shape);

    rule.zones.forEach((zone, zoneIdx) => {
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
    usedRows,
    salt,
    placements: opts.placements,
    metrics,
    reservedFootprints: opts.reservedFootprints,
  });

  return { placed };
}
