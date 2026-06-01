# Background Rules

Background rules describe the non-shape visual mood of a canvas scene: the base clear color, optional gradient overlays, animated stars, and optional runtime-selectable variants.

The runtime resolves one `BackgroundSpec` for the active scene key, then the background pass draws:

1. `base` with `p.background(...)`
2. `overlay`, if present
3. `stars`, if present and not being drawn by the live atmosphere pass

## Basic Background

```ts
const SIMPLE_BACKGROUND: BackgroundSpec = {
  base: "rgb(43, 43, 54)",
};
```

Use this when a scene only needs a flat clear color.

## Linear Overlay

```ts
const SKY_BACKGROUND: BackgroundSpec = {
  base: "rgb(43, 43, 54)",
  overlay: {
    kind: "linear",
    from: { xK: 0.5, yK: 0 },
    to: { xK: 0.5, yK: 1 },
    stops: [
      { k: 0, rgba: "rgba(28, 43, 72, 0.72)" },
      { k: "visualHorizon", rgba: "rgba(91, 118, 104, 0.32)" },
      { k: 1, rgba: "rgba(43, 43, 54, 0)" },
    ],
  },
};
```

Use `visualHorizon` when the background should follow the authored horizon of a 2.5D scene instead of hardcoding a viewport fraction.

## Radial Overlay

```ts
const SPOTLIGHT_BACKGROUND: BackgroundSpec = {
  base: "rgb(43, 43, 54)",
  overlay: {
    kind: "radial",
    center: { xK: 0.5, yK: 0.42 },
    innerK: 0.08,
    outer: { k: 0.78 },
    stops: [
      { rgba: "rgba(255, 255, 255, 0.18)" },
      { rgba: "rgba(122, 146, 132, 0.20)" },
      { rgba: "rgba(43, 43, 54, 0)" },
    ],
  },
};
```

Radial overlays are useful for canvas surfaces that need a centered glow or presentational focus.

## Solid Overlay

```ts
const TINTED_BACKGROUND: BackgroundSpec = {
  base: "rgb(43, 43, 54)",
  overlay: {
    kind: "solid",
    color: "rgba(255, 240, 220, 0.08)",
  },
};
```

Solid overlays are useful for cheap global tinting without rewriting the base color.

## Animated Stars

```ts
const NIGHT_BACKGROUND: BackgroundSpec = {
  base: "rgb(25, 26, 36)",
  stars: {
    count: [20, 60],
    topBandK: 0.45,
    minR: 0.75,
    maxR: 1.8,
    alpha: [0.2, 0.85],
    flickerHz: [0.08, 0.32],
  },
};
```

`count`, `alpha`, and `flickerHz` can be fixed values or ranges. Ranges can respond to `liveAvg`, which lets a scene become visually richer or quieter as the app signal changes.

## Background Variants

```ts
const BACKGROUND_A: BackgroundSpec = {
  base: "rgb(43, 43, 54)",
};

const BACKGROUND_B: BackgroundSpec = {
  base: "rgb(38, 43, 60)",
};

const SEQUENCED_BACKGROUND: BackgroundSpec = {
  ...BACKGROUND_A,
  variants: [BACKGROUND_A, BACKGROUND_B],
};
```

`variants` lets a runtime signal pick among authored backgrounds. Today this is used by the Spotlight canvas. The engine validates if non-Spotlight rulesets author variants without an explicit signal contract.

The top-level background still carries a normal base/overlay so direct callers and fallback paths can draw the first authored state safely.

