# Grid Layout

`grid-layout` turns canvas size and authored grid rules into reusable grid coordinates. It does not choose which shapes exist. It creates rows, columns, forbidden cells, occupied footprints, and pixel conversions that `scene-logic`, `runtime`, and questionnaire UI can share.

## Folder Journey

```text
scene/canvas padding rule
  -> buildGrid.makeCenteredSquareGrid
     -> resolveCols or computeHorizonRowHeights
     -> points + rows + cols + cell sizes + GridMetrics

placement rules
  -> forbidden.makeCellForbidden / makeRowForbidden
  -> occupancy.createOccupancy
  -> placed GridFootprint / Place

placed footprint
  -> coords.cellAnchorToPx2 / cellRectToPx2
  -> footprint.pointInFootprint
  -> uiPlacement.uiGridPlacementToPx
  -> downstream pixel rects, anchors, and draw positions
```

## Important Files

- `buildGrid.ts` is the assembly entry point. It receives canvas width, height, row count, optional top-crop ratio, and optional horizon position. It returns grid points, row/column counts, base cell sizes, origin, and `GridMetrics`.
- `resolveCols.ts` chooses the column count for uniform grids. Rows are the authored density; columns are derived from viewport aspect ratio and quantized for stability.
- `horizonRowHeights.ts` builds perspective grids. It splits rows around a horizon, compresses rows near the horizon, expands rows away from it, and creates per-row column widths.
- `gridMetrics.ts` defines the per-row arrays produced by horizon grids and exposes `metricsDepth`, which downstream render sorting uses for painter order.
- `forbidden.ts` converts authored blocked regions into per-cell predicates. It supports fractional rectangles, custom forbidden functions, and row trimming rules.
- `occupancy.ts` tracks which footprint bottom-row cells are blocked or already used. Multi-row shapes still keep their full footprint for sizing, but occupancy reserves the ground row.
- `coords.ts` converts grid cells and footprint anchors into pixels. It understands both uniform grids and horizon grids with per-row metrics.
- `footprint.ts` turns a footprint into a pixel rect or point inside that rect using anchors, sub-cells, fractions, and pixel offsets.
- `uiPlacement.ts` resolves UI placement specs into grid rectangles and pixel rectangles. Questionnaire buttons use this so UI can align to the same grid as shapes.
- `index.ts` is the public barrel. It groups exports by math, primitives, and grid assembly.

## What Gets Created

Grid assembly creates:

```ts
{
  points: Pt[];
  rows: number;
  cols: number;
  cell: number;
  cellW: number;
  cellH: number;
  ox: number;
  oy: number;
  metrics: GridMetrics;
}
```

`GridMetrics` carries row-specific perspective data:

```ts
{
  rowHeights: number[];
  rowOffsetY: number[];
  colsPerRow: number[];
  cellWPerRow: number[];
}
```

Placement creates `Place` / `GridFootprint` values:

```ts
{
  r0: number;
  c0: number;
  w: number;
  h: number;
}
```

Pixel conversion creates rects and anchors:

```ts
{
  left: number;
  top: number;
  width: number;
  height: number;
  anchorX: number;
  anchorY: number;
}
```

## Downstream API

Scene logic imports:

```ts
makeCenteredSquareGrid
usedRowsFromSpec
makeCellForbidden
createOccupancy
cellAnchorToPx2
GridMetrics
```

Runtime imports:

```ts
makeCenteredSquareGrid
GridMetrics
metricsDepth
```

Questionnaire UI imports:

```ts
resolveUiGridPlacement
uiGridPlacementToPx
justifyContentForUiPlacement
UiGridPlacementInput
Place
```

App and canvas host state import `Place` as the shared reserved-footprint type.

## Contract

The grid uses row/column cells as the stable authoring space. `scene-rules` decide row counts and forbidden areas; `grid-layout` turns those rules into measurable cells; `scene-logic` chooses specific placements; `runtime` turns the resulting footprints into pixels and draw order.

Rule: this folder should stay pure. It should not know shape palettes, render passes, React state, Sanity data, or product flow.
