// src/canvas/layout/grid-layout/occupancy.ts

export type Place = { r0: number; c0: number; w: number; h: number };

export type CellForbidden = (r: number, c: number) => boolean;

/**
 * Tracks occupied cells for a grid and supports incremental placement of rectangular footprints.
 * A provided forbidden predicate is treated as pre-occupied space.
 */
export function createOccupancy(rows: number, cols: number, isForbidden?: CellForbidden, colsPerRow?: number[]) {
  const used = new Array(rows * cols).fill(false);
  const idx = (r: number, c: number) => r * cols + c;

  for (let r = 0; r < rows; r++) {
    const rowCols = colsPerRow ? (colsPerRow[r] ?? cols) : cols;
    for (let c = 0; c < cols; c++) {
      if (c >= rowCols || (isForbidden && isForbidden(r, c))) used[idx(r, c)] = true;
    }
  }

  function canPlace(r0: number, c0: number, w: number, h: number) {
    if (r0 < 0 || c0 < 0 || r0 + h > rows || c0 + w > cols) return false;
    // Ensure footprint fits within every spanned row's column count
    if (colsPerRow) {
      for (let dr = 0; dr < h; dr++) {
        if (c0 + w > (colsPerRow[r0 + dr] ?? cols)) return false;
      }
    }
    const bottomR = r0 + h - 1;
    for (let c = 0; c < w; c++) {
      if (used[idx(bottomR, c0 + c)]) return false;
    }
    return true;
  }

  function mark(r0: number, c0: number, w: number, h: number) {
    const bottomR = r0 + h - 1;
    for (let c = 0; c < w; c++) {
      used[idx(bottomR, c0 + c)] = true;
    }
  }

  function tryPlaceAt(r0: number, c0: number, w: number, h: number): Place | null {
    if (!canPlace(r0, c0, w, h)) return null;
    mark(r0, c0, w, h);
    return { r0, c0, w, h };
  }

  return { canPlace, tryPlaceAt };
}
