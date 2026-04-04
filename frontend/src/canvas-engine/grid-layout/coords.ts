// src/canvas/layout/grid-layout/coords.ts

import type { GridMetrics } from "./gridMetrics";

export type CellSize = {
  cellW: number;
  cellH: number;
  ox?: number;
  oy?: number;
} & Partial<GridMetrics>;

function o(v?: number) { return Number.isFinite(v) ? (v as number) : 0; }

/** New: rectangular grid center for a 1x1 cell */
export function cellCenterToPx2(size: CellSize, r: number, c: number) {
  const ox = o(size.ox), oy = o(size.oy);
  return {
    x: ox + c * size.cellW + size.cellW / 2,
    y: oy + r * size.cellH + size.cellH / 2,
  };
}

/** New: rectangular rect for occupied block */
export function cellRectToPx2(
  size: CellSize,
  r0: number,
  c0: number,
  w: number,
  h: number
) {
  const ox = o(size.ox), oy = o(size.oy);
  if (size.rowOffsetY && size.rowHeights) {
    let spanH = 0;
    for (let dr = 0; dr < h; dr++) spanH += size.rowHeights[r0 + dr] ?? size.cellH;
    return {
      x: ox + c0 * size.cellW,
      y: oy + (size.rowOffsetY[r0] ?? r0 * size.cellH),
      w: w * size.cellW,
      h: spanH,
    };
  }
  return {
    x: ox + c0 * size.cellW,
    y: oy + r0 * size.cellH,
    w: w * size.cellW,
    h: h * size.cellH,
  };
}

/** New: anchor point for a footprint rect */
export function cellAnchorToPx2(
  size: CellSize,
  rect: { r0: number; c0: number; w: number; h: number },
  anchor: "topleft" | "center" = "topleft"
) {
  const ox = o(size.ox), oy = o(size.oy);
  const bottomRow = rect.r0 + rect.h - 1;

  if (size.cellWPerRow && size.rowHeights && size.rowOffsetY) {
    const unitW = size.cellWPerRow[bottomRow] ?? size.cellW;
    const unitH = size.rowHeights[bottomRow] ?? size.cellH;
    const unitOY = size.rowOffsetY[bottomRow] ?? bottomRow * size.cellH;
    const pxH = unitH * rect.h;
    const pxY = unitOY - unitH * (rect.h - 1); // top of shape
    const pxX = ox + rect.c0 * unitW;
    if (anchor === "center") return { x: pxX + (rect.w * unitW) / 2, y: oy + pxY + pxH / 2 };
    return { x: pxX, y: oy + pxY };
  }

  if (anchor === "center") {
    return {
      x: ox + rect.c0 * size.cellW + (rect.w * size.cellW) / 2,
      y: oy + rect.r0 * size.cellH + (rect.h * size.cellH) / 2,
    };
  }
  return { x: ox + rect.c0 * size.cellW, y: oy + rect.r0 * size.cellH };
}

/* ----------------------------
   Legacy square API (unchanged)
   ---------------------------- */

export function cellCenterToPx(cell: number, r: number, c: number) {
  return { x: c * cell + cell / 2, y: r * cell + cell / 2 };
}

export function cellRectToPx(cell: number, r0: number, c0: number, w: number, h: number) {
  return { x: c0 * cell, y: r0 * cell, w: w * cell, h: h * cell };
}

export function cellAnchorToPx(
  cell: number,
  rect: { r0: number; c0: number; w: number; h: number },
  anchor: "topleft" | "center" = "topleft"
) {
  if (anchor === "center") {
    return {
      x: rect.c0 * cell + (rect.w * cell) / 2,
      y: rect.r0 * cell + (rect.h * cell) / 2,
    };
  }
  return { x: rect.c0 * cell, y: rect.r0 * cell };
}
