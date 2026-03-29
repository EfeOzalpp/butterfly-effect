// src/canvas-engine/scene-logic/place.ts

import { createOccupancy } from "../grid-layout/occupancy";
import { cellAnchorToPx2 } from "../grid-layout/coords";
import type { GridMetrics } from "../grid-layout/gridMetrics";
import type { DeviceType } from "../shared/responsiveness";
import type { CanvasPaddingSpec } from "../adjustable-rules/canvasPadding";
import type { ScenePlacementRules } from "../adjustable-rules/placement-rules/index";
import type { PoolItem, PlacedItem, FootRect } from "./types";
import { buildFallbackCells } from "./candidates";
import { cellForbiddenFromSpec, allowedSegmentsForRow, footprintAllowed } from "./constraints";
import { scoreCandidateGeneric } from "./scoring";

export function placePoolItems(opts: {
  pool: PoolItem[];
  spec: CanvasPaddingSpec;
  device: DeviceType;
  rows: number;
  cols: number;
  cell: number;
  cellW: number;
  cellH: number;
  ox?: number;
  oy?: number;
  metrics?: GridMetrics;
  usedRows: number;
  salt: number;
  placements: ScenePlacementRules;
}): { placed: PlacedItem[] } {
  const { pool, spec, device, rows, cols, cell, cellW, cellH, ox, oy, usedRows, salt, placements, metrics } = opts;

  const { rowHeights, rowOffsetY, colsPerRow, cellWPerRow } = metrics ?? {};

  const isForbidden = cellForbiddenFromSpec(spec, rows, cols, colsPerRow);
  const occ = createOccupancy(rows, cols, (r, c) => isForbidden(r, c), colsPerRow);
  const fallbackCells = buildFallbackCells(rows, cols, spec);

  const placedAccum: Array<{ id: number; x: number; y: number; footprint: FootRect }> = [];
  const outPlaced: PlacedItem[] = [];
  let cursor = 0;

  for (const item of pool) {
    const { shape, zoneIndex, size } = item;
    const wCell = size.w;
    const hCell = size.h;

    // Resolve zone bounds for this item
    const zone = placements[shape]?.zones[zoneIndex];
    const topK   = zone?.verticalK[0]    ?? 0;
    const botK   = zone?.verticalK[1]    ?? 1;
    const leftK  = zone?.horizontalK?.[0] ?? 0;
    const rightK = zone?.horizontalK?.[1] ?? 1;

    const rMin = Math.max(0, Math.floor(usedRows * topK));
    const rMax = Math.min(usedRows - hCell, Math.floor(usedRows * botK));

    const placedForScore = placedAccum.map((p) => ({
      r0: p.footprint.r0,
      c0: p.footprint.c0,
      w: p.footprint.w,
      h: p.footprint.h,
    }));

    const candidates: Array<{ r0: number; c0: number; score: number }> = [];

    for (let r0 = rMin; r0 <= Math.min(rMax, rows - hCell); r0++) {
      // Use per-row column count so horizontalK is a consistent fraction of
      // each row's actual width, not the max columns at the horizon.
      const rowCols = colsPerRow?.[r0] ?? cols;
      const cMin = Math.max(0, Math.floor(rowCols * leftK));
      const cMax = Math.min(rowCols - wCell, Math.floor(rowCols * rightK));

      const segs = allowedSegmentsForRow(r0, wCell, hCell, rows, cols, isForbidden, colsPerRow);

      for (const seg of segs) {
        const effectiveCenterC = (seg.cStart + seg.cEnd) / 2;
        const c0Start = Math.max(seg.cStart, cMin);
        const c0End   = Math.min(seg.cEnd,   cMax);

        for (let c0 = c0Start; c0 <= c0End; c0++) {
          const score = scoreCandidateGeneric({
            r0, c0, wCell, hCell, cols, usedRows,
            placed: placedForScore,
            salt,
            effectiveCenterC,
          });
          candidates.push({ r0, c0, score });
        }
      }
    }

    let rectHit: FootRect | null = null;

    if (candidates.length === 0) {
      for (let k = cursor; k < fallbackCells.length; k++) {
        const { r, c } = fallbackCells[k];
        if (r < rMin || r > rMax) continue;
        const fbRowCols = colsPerRow?.[r] ?? cols;
        const fbCMin = Math.max(0, Math.floor(fbRowCols * leftK));
        const fbCMax = Math.min(fbRowCols - wCell, Math.floor(fbRowCols * rightK));
        if (c < fbCMin || c > fbCMax) continue;
        if (!footprintAllowed(r, c, wCell, hCell, rows, cols, isForbidden, colsPerRow)) continue;
        const hit = occ.tryPlaceAt(r, c, wCell, hCell);
        if (hit) {
          rectHit = hit;
          cursor = Math.max(k - 2, 0);
          break;
        }
      }
    } else {
      candidates.sort((a, b) => b.score - a.score);
      for (const cand of candidates) {
        const hit = occ.tryPlaceAt(cand.r0, cand.c0, wCell, hCell);
        if (hit) { rectHit = hit; break; }
      }
    }

    if (!rectHit) continue;

    const { x, y } = cellAnchorToPx2(
      { cellW, cellH, ox, oy, ...metrics },
      rectHit,
      "center"
    );

    item.footprint = rectHit;
    item.x = x;
    item.y = y;

    placedAccum.push({ id: item.id, x, y, footprint: rectHit });
    outPlaced.push({ id: item.id, x, y, shape: item.shape, footprint: rectHit });
  }

  return { placed: outPlaced };
}
