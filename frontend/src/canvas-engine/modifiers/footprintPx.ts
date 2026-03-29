// modifiers/footprintPx.ts
// Converts a grid footprint to canvas pixel coordinates,
// supporting variable row heights when GridMetrics arrays are in opts.

import type { GridMetrics } from "../grid-layout/gridMetrics";

type Footprint = { r0: number; c0: number; w: number; h: number };

type FootprintContext = {
  cell?: number;
  cellW?: number;
  cellH?: number;
} & Partial<GridMetrics>;

/**
 * Computes the pixel bounding box of a footprint rect.
 *
 * Uses the bottom row of the footprint as the unit tile:
 *   w = f.w * unitW,  h = f.h * unitH
 * The shape's bottom edge is anchored to the bottom row's bottom edge,
 * keeping multi-tile shapes proportional regardless of variable row heights.
 */
export function footprintToPx(f: Footprint, opts: FootprintContext): { x: number; y: number; w: number; h: number } {
  const cell: number = opts?.cell ?? 0;
  const cellW: number = opts?.cellW ?? cell;
  const cellH: number = opts?.cellH ?? cell;
  const rowH: number[] | undefined = opts?.rowHeights;
  const rowOY: number[] | undefined = opts?.rowOffsetY;
  const cWPerRow: number[] | undefined = opts?.cellWPerRow;

  // Use the bottom row of the footprint as the unit tile — prevents distortion
  // from unevenly-sized rows when summing. Shape is sized as (unit * footprint dims)
  // with its bottom edge anchored to the actual bottom row's bottom.
  const bottomRow = f.r0 + f.h - 1;
  const unitW = cWPerRow ? (cWPerRow[bottomRow] ?? cellW) : cellW;
  const unitH = rowH ? (rowH[bottomRow] ?? cellH) : cellH;
  const unitOY = rowOY ? (rowOY[bottomRow] ?? bottomRow * cellH) : bottomRow * cellH;

  const x = f.c0 * unitW;
  const w = f.w * unitW;
  const h = f.h * unitH;
  // Anchor: bottom of shape = bottom of bottom row → top = unitOY - unitH*(h_tiles-1)
  const y = unitOY - unitH * (f.h - 1);

  return { x, y, w, h };
}

/**
 * Returns the pixel height of a single row.
 * Uses rowHeights[r] from opts when available, otherwise falls back to cellH.
 */
export function rowHeightAt(r: number, opts: FootprintContext): number {
  const cellH: number = opts?.cellH ?? opts?.cell ?? 0;
  const rowH: number[] | undefined = opts?.rowHeights;
  return (rowH && rowH[r] != null) ? rowH[r] : cellH;
}

/**
 * Returns the pixel width of a single row.
 * Uses cellWPerRow[r] from opts when available, otherwise falls back to cellW.
 */
export function rowWidthAt(r: number, opts: FootprintContext): number {
  const cellW: number = opts?.cellW ?? opts?.cell ?? 0;
  const rowW: number[] | undefined = opts?.cellWPerRow;
  return (rowW && rowW[r] != null) ? rowW[r] : cellW;
}

/**
 * Returns a local perspective scale for particle systems using the footprint's
 * bottom row as the reference tile. This keeps particle size/speed aligned with
 * the same row-based perspective used for shape sizing.
 */
export function particlePerspectiveScale(f: Footprint, opts: FootprintContext): number {
  const cell: number = opts?.cell ?? 0;
  const baseW: number = opts?.cellW ?? cell;
  const baseH: number = opts?.cellH ?? cell;
  const cWPerRow: number[] | undefined = opts?.cellWPerRow;
  const rowH: number[] | undefined = opts?.rowHeights;

  const bottomRow = f.r0 + f.h - 1;
  const unitW = cWPerRow ? (cWPerRow[bottomRow] ?? baseW) : baseW;
  const unitH = rowH ? (rowH[bottomRow] ?? baseH) : baseH;

  const scaleW = unitW / Math.max(1e-6, baseW || 1);
  const scaleH = unitH / Math.max(1e-6, baseH || 1);
  const scale = Math.sqrt(Math.max(1e-6, scaleW * scaleH));

  return Math.max(0.4, Math.min(3, scale));
}

export function particleSizePerspectiveScale(f: Footprint, opts: FootprintContext): number {
  const scale = particlePerspectiveScale(f, opts);
  return Math.max(0.18, Math.min(3.2, Math.pow(scale, 1.35)));
}

export function particleMotionPerspectiveScale(f: Footprint, opts: FootprintContext): number {
  const scale = particlePerspectiveScale(f, opts);
  return Math.max(0.12, Math.min(3.4, Math.pow(scale, 1.75)));
}
