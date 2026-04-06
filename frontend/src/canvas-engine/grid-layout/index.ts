// src/canvas-engine/grid-layout/index.ts
//
// Barrel — re-exports only. Existing imports of specific files are untouched.
// Use this to understand dependency tiers at a glance.
//
// ── Tier 1: pure types & math (no local deps) ──────────────────────────────
export type { GridMetrics }                       from "./gridMetrics";
export { metricsDepth }                           from "./gridMetrics";
export { computeHorizonRowHeights }               from "./horizonRowHeights";
export { resolveCols }                            from "./resolveCols";
export type { ResolveColsOpts }                   from "./resolveCols";

// ── Tier 2: grid primitives (depend on Tier 1 types only) ──────────────────
export { cellAnchorToPx2, cellRectToPx2 }         from "./coords";
export {
  justifyContentForUiPlacement,
  resolveUiGridBandPlacement,
  resolveUiGridPlacement,
  uiGridPlacementToPx,
  uiGridRectToPx,
}                                                 from "./uiPlacement";
export type { CellSize }                          from "./footprint";
export type { Footprint, PlaceOpts }              from "./footprint";
export type {
  UiGridBandPlacement,
  UiGridPlacement,
  UiGridPlacementInput,
  UiGridPlacementPx,
  UiGridRect,
  UiGridResolver,
}                                                 from "./uiPlacement";
export {
  rectFromFootprint2,
  pointInFootprint2,
  rectFromFootprint,
  pointInFootprint,
}                                                 from "./footprint";
export { createOccupancy }                        from "./occupancy";
export type { Place, CellForbidden }              from "./occupancy";
export {
  makeRowForbidden,
  makeCellForbidden,
  rectFracToCellRange,
  cellInRectFrac,
}                                                 from "./forbidden";
export type { GridRectFrac, ForbiddenSpec, CellRC, RowRule } from "./forbidden";

// ── Tier 4: assembly — builds the full grid (calls everything above) ───────
export {
  makeCenteredSquareGrid,
  indexFromAvg,
  usedRowsFromSpec,
}                                                 from "./buildGrid";
export type { MakeCenteredGridOpts, Pt }          from "./buildGrid";
