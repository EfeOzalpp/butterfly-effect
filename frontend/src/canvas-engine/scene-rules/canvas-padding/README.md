# Canvas Padding Rules

Canvas padding rules describe the logical grid a canvas scene uses for shape placement. The runtime converts this rule into row heights, cell widths, horizon layout, and forbidden cells.

Device bands are selected from the viewport width, not the local size of a bounded canvas instance. A 500px Spotlight canvas on a laptop should still use the laptop padding rule.

## Basic Flat Canvas

```ts
export const SPOTLIGHT_PADDING = {
  mobile: { rows: 6, useTopRatio: 1 },
  tablet: { rows: 6, useTopRatio: 1 },
  laptop: { rows: 6, useTopRatio: 1 },
};
```

Leaving out `horizonPos` creates a flat 2D canvas. The engine still computes a grid, but it does not need sky/ground perspective semantics.

## 2.5D Canvas With Horizon

```ts
export const START_PADDING = {
  mobile: {
    rows: 18,
    useTopRatio: 0.72,
    horizonPos: 0.48,
  },
  tablet: {
    rows: 20,
    useTopRatio: 0.7,
    horizonPos: 0.5,
  },
  laptop: {
    rows: 22,
    useTopRatio: 0.68,
    horizonPos: 0.52,
  },
};
```

`horizonPos` is a viewport fraction. When present, the engine treats the canvas as a 2.5D scene: rows near the horizon can appear smaller, fog can split into sky/ground behavior, and background anchors like `visualHorizon` have meaningful layout context.

## Forbidden Cells

```ts
const CENTER_RESERVED = {
  rows: 12,
  useTopRatio: 1,
  forbidden: (r, c, rows, cols) => {
    const centerRow = Math.floor(rows / 2);
    const centerCol = Math.floor(cols / 2);
    return Math.abs(r - centerRow) <= 1 && Math.abs(c - centerCol) <= 2;
  },
};
```

Use `forbidden` when a scene needs a reserved visual area, such as a title, call-to-action, or UI panel.

## Field Meanings

- `rows`: logical vertical grid resolution.
- `useTopRatio`: how much of the viewport height the grid may occupy.
- `horizonPos`: optional split point for 2.5D scenes.
- `forbidden`: optional callback that blocks placement in specific grid cells.
