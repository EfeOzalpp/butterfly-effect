// src/canvas-engine/scene-logic/place.ts

import { createOccupancy } from "../grid-layout/occupancy";
import { cellAnchorToPx2 } from "../grid-layout/coords";
import type { GridMetrics } from "../grid-layout/gridMetrics";
import type { DeviceType } from "../shared/responsiveness";
import type { CanvasPaddingSpec } from "../scene-rules/canvas-padding";
import type { ScenePlacementRules } from "../scene-rules/placement-rules/index";
import type { PoolItem, PlacedItem, FootRect } from "./types";
import { buildFallbackCells } from "./candidates";
import { cellForbiddenFromSpec, allowedSegmentsForRow, footprintAllowed, horizontalReferenceForFootprint } from "./constraints";
import { scoreCandidateGeneric } from "./scoring";

function zoneCenterYForSpec(
  band: NonNullable<PoolItem["communityZone"]>["band"],
  yK: number,
  spec: CanvasPaddingSpec
) {
  const clampedY = Math.max(0, Math.min(1, yK));
  if (typeof spec.horizonPos !== "number") return clampedY;

  const horizon = Math.max(0, Math.min(1, spec.horizonPos));
  if (band === "sky") return clampedY * horizon;

  return horizon + clampedY * (1 - horizon);
}

function clampZoneCenterRowForFootprint(
  centerRow: number,
  hCell: number,
  usedRows: number
) {
  const minCenter = hCell / 2;
  const maxCenter = Math.max(minCenter, usedRows - hCell / 2);
  return Math.max(minCenter, Math.min(maxCenter, centerRow));
}

function communityBandRowBounds(
  band: NonNullable<PoolItem["communityZone"]>["band"],
  spec: CanvasPaddingSpec,
  usedRows: number,
  hCell: number
) {
  const maxR0 = Math.max(0, usedRows - hCell);
  if (typeof spec.horizonPos !== "number") {
    return { minR0: 0, maxR0 };
  }

  const horizonRow = Math.max(0, Math.min(usedRows, spec.horizonPos * usedRows));
  if (band === "sky") {
    return {
      minR0: 0,
      maxR0: Math.max(0, Math.min(maxR0, Math.floor(horizonRow - hCell))),
    };
  }

  return {
    minR0: Math.max(0, Math.min(maxR0, Math.ceil(horizonRow))),
    maxR0,
  };
}

function candidateInCommunityZone(args: {
  item: PoolItem;
  r0: number;
  c0: number;
  wCell: number;
  hCell: number;
  usedRows: number;
  refCols: number;
  spec: CanvasPaddingSpec;
}) {
  const { item, r0, c0, wCell, hCell, usedRows, refCols, spec } = args;
  const zone = item.communityZone;
  if (!zone) return false;

  const { minR0, maxR0 } = communityBandRowBounds(zone.band, spec, usedRows, hCell);
  if (r0 < minR0 || r0 > maxR0) return false;

  const rawCenterRow = zoneCenterYForSpec(zone.band, zone.centerY, spec) * Math.max(1, usedRows - 1);
  const centerRow = clampZoneCenterRowForFootprint(rawCenterRow, hCell, usedRows);
  const centerCol = zone.centerX * Math.max(1, refCols - 1);
  const itemRow = r0 + hCell / 2;
  const itemCol = c0 + wCell / 2;
  const radiusY = Math.max(0.5, zone.radiusY);
  const radiusX = Math.max(0.5, zone.radiusX);
  const dy = (itemRow - centerRow) / radiusY;
  const dx = (itemCol - centerCol) / radiusX;

  if (zone.radiusShape === "rect") {
    return Math.abs(dx) <= 1 && Math.abs(dy) <= 1;
  }

  return dx * dx + dy * dy <= 1;
}

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
  canvas: { w: number; h: number };
  usedRows: number;
  salt: number;
  placements: ScenePlacementRules;
  reservedFootprints?: FootRect[];
}): { placed: PlacedItem[] } {
  const {
    pool,
    spec,
    rows,
    cols,
    cellW,
    cellH,
    ox,
    oy,
    usedRows,
    salt,
    placements,
    metrics,
    canvas,
    reservedFootprints = [],
  } = opts;

  const { colsPerRow } = metrics ?? {};

  const isForbidden = cellForbiddenFromSpec(spec, rows, cols, colsPerRow);
  const occ = createOccupancy(rows, cols, (r, c) => isForbidden(r, c), colsPerRow);
  const occClouds = createOccupancy(rows, cols, undefined, colsPerRow);
  const fallbackCells = buildFallbackCells(rows, cols, spec);

  for (const reserved of reservedFootprints) {
    occ.tryPlaceAt(reserved.r0, reserved.c0, reserved.w, reserved.h);
  }

  const placedAccum: { id: PoolItem["id"]; x: number; y: number; footprint: FootRect }[] = [];
  const outPlaced: PlacedItem[] = [];
  let cursor = 0;

  for (const item of pool) {
    const { shape, zoneIndex, size } = item;
    const wCell = size.w;
    const hCell = size.h;

    if (item.absolute?.kind === "center") {
      const rectW = Math.max(1, wCell * cellW * item.absolute.scale);
      const rectH = Math.max(1, hCell * cellH * item.absolute.scale);
      const rectX = canvas.w * item.absolute.xK - rectW / 2;
      const rectY = canvas.h * item.absolute.yK - rectH / 2;
      const centerX = rectX + rectW / 2;
      const centerY = rectY + rectH / 2;
      const rectHit: FootRect = {
        r0: Math.max(0, Math.round((usedRows - hCell) * item.absolute.yK)),
        c0: Math.max(0, Math.round((cols - wCell) * item.absolute.xK)),
        w: wCell,
        h: hCell,
      };

      item.footprint = rectHit;
      item.pixelFootprint = { x: rectX, y: rectY, w: rectW, h: rectH };
      item.x = centerX;
      item.y = centerY;
      outPlaced.push({
        id: item.id,
        x: centerX,
        y: centerY,
        shape: item.shape,
        footprint: rectHit,
        pixelFootprint: item.pixelFootprint,
      });
      continue;
    }

    const ignoreForbidden = shape === "clouds";
    const itemForbidden = ignoreForbidden ? (() => false) : isForbidden;
    const targetOcc = shape === "clouds" ? occClouds : occ;

    const scoreSource = shape === "clouds" ? [] : placedAccum;
    const placedForScore = scoreSource.map((p) => ({
      r0: p.footprint.r0,
      c0: p.footprint.c0,
      w: p.footprint.w,
      h: p.footprint.h,
    }));

    const candidates: { r0: number; c0: number; score: number }[] = [];

    if (item.communityZone) {
      const { minR0: bandMinR0, maxR0: bandMaxR0 } = communityBandRowBounds(
        item.communityZone.band,
        spec,
        usedRows,
        hCell
      );
      const rawCenterRow = zoneCenterYForSpec(
        item.communityZone.band,
        item.communityZone.centerY,
        spec
      ) * Math.max(1, usedRows - 1);
      const centerRow = clampZoneCenterRowForFootprint(rawCenterRow, hCell, usedRows);
      const rMin = Math.max(bandMinR0, Math.floor(centerRow - item.communityZone.radiusY - hCell));
      const rMax = Math.min(
        bandMaxR0,
        Math.ceil(centerRow + item.communityZone.radiusY)
      );

      for (let r0 = rMin; r0 <= Math.min(rMax, rows - hCell); r0++) {
        const { refCols } = horizontalReferenceForFootprint(r0, hCell, cols, colsPerRow);
        const centerCol = item.communityZone.centerX * Math.max(1, refCols - 1);
        const cMin = Math.max(0, Math.floor(centerCol - item.communityZone.radiusX - wCell));
        const cMax = Math.min(refCols - wCell, Math.ceil(centerCol + item.communityZone.radiusX));
        const segs = allowedSegmentsForRow(r0, wCell, hCell, rows, cols, itemForbidden, colsPerRow);

        for (const seg of segs) {
          const c0Start = Math.max(seg.cStart, cMin);
          const c0End = Math.min(seg.cEnd, cMax);
          const effectiveCenterC = centerCol;

          for (let c0 = c0Start; c0 <= c0End; c0++) {
            if (!candidateInCommunityZone({
              item,
              r0,
              c0,
              wCell,
              hCell,
              usedRows,
              refCols,
              spec,
            })) {
              continue;
            }

            const score = scoreCandidateGeneric({
              r0, c0, wCell, hCell, cols, usedRows,
              placed: placedForScore,
              salt,
              effectiveCenterC,
              effectiveCenterR: centerRow,
            });
            candidates.push({ r0, c0, score });
          }
        }
      }

      candidates.sort((a, b) => b.score - a.score);
      let rectHit: FootRect | null = null;
      for (const cand of candidates) {
        const hit = targetOcc.tryPlaceAt(cand.r0, cand.c0, wCell, hCell);
        if (hit) { rectHit = hit; break; }
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

      if (shape !== "clouds") {
        placedAccum.push({ id: item.id, x, y, footprint: rectHit });
      }
      outPlaced.push({ id: item.id, x, y, shape: item.shape, footprint: rectHit });
      continue;
    }

    // Resolve zone bounds for this item
    const zone = placements[shape]?.zones?.[zoneIndex];
    const topK   = zone?.verticalK[0]    ?? 0;
    const botK   = zone?.verticalK[1]    ?? 1;
    const leftK  = zone?.horizontalK?.[0] ?? 0;
    const rightK = zone?.horizontalK?.[1] ?? 1;

    const rMin = Math.max(0, Math.floor(usedRows * topK));
    const rMax = Math.min(usedRows - hCell, Math.floor(usedRows * botK));

    for (let r0 = rMin; r0 <= Math.min(rMax, rows - hCell); r0++) {
      const { refCols } = horizontalReferenceForFootprint(r0, hCell, cols, colsPerRow);
      const cMin = Math.max(0, Math.floor(refCols * leftK));
      const cMax = Math.min(refCols - wCell, Math.floor(refCols * rightK));

      const segs = allowedSegmentsForRow(r0, wCell, hCell, rows, cols, itemForbidden, colsPerRow);

      for (const seg of segs) {
        const c0Start = Math.max(seg.cStart, cMin);
        const c0End   = Math.min(seg.cEnd,   cMax);
        // Score relative to the zone's own center, not the full segment center.
        // This prevents edge zones from being penalized for being far from grid center.
        const effectiveCenterC = (c0Start + c0End) / 2;

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
        const { refCols: fbRefCols } = horizontalReferenceForFootprint(r, hCell, cols, colsPerRow);
        const fbCMin = Math.max(0, Math.floor(fbRefCols * leftK));
        const fbCMax = Math.min(fbRefCols - wCell, Math.floor(fbRefCols * rightK));
        if (c < fbCMin || c > fbCMax) continue;
        if (!footprintAllowed(r, c, wCell, hCell, rows, cols, itemForbidden, colsPerRow)) continue;
        const hit = targetOcc.tryPlaceAt(r, c, wCell, hCell);
        if (hit) {
          rectHit = hit;
          cursor = Math.max(k - 2, 0);
          break;
        }
      }
    } else {
      candidates.sort((a, b) => b.score - a.score);
      for (const cand of candidates) {
        const hit = targetOcc.tryPlaceAt(cand.r0, cand.c0, wCell, hCell);
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

    if (shape !== "clouds") {
      placedAccum.push({ id: item.id, x, y, footprint: rectHit });
    }
    outPlaced.push({ id: item.id, x, y, shape: item.shape, footprint: rectHit });
  }

  return { placed: outPlaced };
}
