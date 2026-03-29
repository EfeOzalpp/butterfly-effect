// src/canvas/scene-logic/constraints.ts

import type { CanvasPaddingSpec } from '../adjustable-rules/canvasPadding';
import { makeCellForbidden } from '../grid-layout/forbidden';

/**
 * Combines grid spec forbidden rules into a single cell-level predicate.
 */
export function cellForbiddenFromSpec(spec: CanvasPaddingSpec, rows: number, cols: number, colsPerRow?: number[]) {
  return makeCellForbidden(spec, rows, cols, colsPerRow);
}

/**
 * Checks whether a footprint rectangle is within bounds and contains no forbidden cells.
 */
export function footprintAllowed(
  r0: number,
  c0: number,
  w: number,
  h: number,
  rows: number,
  cols: number,
  isForbidden: (r: number, c: number) => boolean,
  colsPerRow?: number[]
) {
  if (r0 < 0 || c0 < 0 || r0 + h > rows) return false;
  for (let dr = 0; dr < h; dr++) {
    const rowCols = colsPerRow ? (colsPerRow[r0 + dr] ?? cols) : cols;
    if (c0 + w > rowCols) return false;
  }
  for (let dr = 0; dr < h; dr++) {
    for (let dc = 0; dc < w; dc++) {
      if (isForbidden(r0 + dr, c0 + dc)) return false;
    }
  }
  return true;
}

/**
 * Returns contiguous horizontal segments [cStart..cEnd] where a footprint can be placed on a row.
 * cEnd is inclusive and represents the footprint's left column.
 */
export function allowedSegmentsForRow(
  r0: number,
  wCell: number,
  hCell: number,
  rows: number,
  cols: number,
  isForbidden: (r: number, c: number) => boolean,
  colsPerRow?: number[]
): Array<{ cStart: number; cEnd: number }> {
  // Effective column limit: minimum across all rows spanned by the footprint
  let effectiveCols = cols;
  if (colsPerRow) {
    for (let dr = 0; dr < hCell; dr++) {
      const rc = colsPerRow[r0 + dr] ?? cols;
      if (rc < effectiveCols) effectiveCols = rc;
    }
  }

  const segs: Array<{ cStart: number; cEnd: number }> = [];
  let c = 0;

  while (c <= effectiveCols - wCell) {
    while (
      c <= effectiveCols - wCell &&
      !footprintAllowed(r0, c, wCell, hCell, rows, cols, isForbidden, colsPerRow)
    ) {
      c++;
    }
    if (c > effectiveCols - wCell) break;

    const cStart = c;

    while (
      c <= effectiveCols - wCell &&
      footprintAllowed(r0, c, wCell, hCell, rows, cols, isForbidden, colsPerRow)
    ) {
      c++;
    }

    const cEnd = c - 1;
    segs.push({ cStart, cEnd });
  }

  return segs;
}
