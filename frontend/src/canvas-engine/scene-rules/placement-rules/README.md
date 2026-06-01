# Placement Rules

Placement rules describe where each shape type is allowed to appear and how many instances should be composed per device.

The runtime uses these rules during scene composition, before drawing. The output is a list of field items with footprints, positions, and optional projection overrides.

## Choose A Placement Blueprint

Use the smallest placement feature that matches the scene:

- Use **zones** when a shape should be distributed inside one or more regions.
- Use **multiple zones** when a shape should appear in separate authored bands.
- Use **quota** when a shape count should respond to `liveAvg`.
- Use **variants** when a runtime signal should swap whole placement maps.
- Use **absolute center** when a presentation canvas needs one precisely centered featured shape.
- Use **zone communities** when a scene should author clusters of multiple shapes around shared procedural anchors.

## Blueprint: Distribute One Shape In A Region

Use this for normal scene composition.

```ts
export const START_PLACEMENTS: ScenePlacementRules = {
  house: {
    zones: [
      {
        verticalK: [0.48, 0.95],
        horizontalK: [0.05, 0.95],
        count: {
          mobile: 8,
          tablet: 14,
          laptop: 22,
        },
      },
    ],
  },
};
```

`verticalK` and `horizontalK` are viewport fractions. The engine converts the zone into grid cells, filters invalid cells, scores candidates, then places each item into the occupancy grid.

## Blueprint: Use Multiple Visual Bands

Use this when one shape has several authored locations, such as high clouds plus lower clouds.

```ts
const CLOUD_RULE: ShapePlacementRule = {
  zones: [
    {
      verticalK: [0.05, 0.24],
      horizontalK: [0.02, 0.98],
      count: { mobile: 3, tablet: 5, laptop: 7 },
    },
    {
      verticalK: [0.24, 0.38],
      horizontalK: [0.1, 0.9],
      count: { mobile: 1, tablet: 2, laptop: 3 },
    },
  ],
};
```

Each zone has its own count. This avoids creating fake shape names just to author different regions.

## Blueprint: Scale Density With Live Average

Use this when the same zone layout should become denser or sparser.

```ts
const POWER_RULE: ShapePlacementRule = {
  quota: [
    { t: 0, pct: 40 },
    { t: 1, pct: 90 },
  ],
  zones: [
    {
      verticalK: [0.45, 0.9],
      count: { mobile: 2, tablet: 4, laptop: 7 },
    },
  ],
};
```

`quota` is a curve over `liveAvg`. A `pct` of `50` means "use the authored zone count." Higher values increase count; lower values reduce count.

## Blueprint: Swap Placement Maps With A Runtime Signal

Use this when a canvas has authored states, such as a Spotlight carousel.

```ts
const CENTERED_VILLA: ScenePlacementRuleMap = {
  villa: {
    absolute: {
      kind: "center",
      count: { mobile: 1, tablet: 1, laptop: 1 },
    },
  },
};

const CENTERED_BUS: ScenePlacementRuleMap = {
  bus: {
    absolute: {
      kind: "center",
      count: { mobile: 1, tablet: 1, laptop: 1 },
    },
  },
};

export const SPOTLIGHT_PLACEMENTS: ScenePlacementRules = {
  ...CENTERED_VILLA,
  variants: [CENTERED_VILLA, CENTERED_BUS],
};
```

`variants` lets a runtime signal choose among authored placement maps. The top-level spread is the fallback/default state before a runtime signal is available.

Placement variants are resolved before field composition. Changing the selected variant recomposes the field instead of branching inside the render loop.

## Blueprint: Center One Featured Shape Precisely

Use this for presentation canvases, panels, or previews where grid scoring is too indirect.

```ts
const CENTERED_BUS: ScenePlacementRuleMap = {
  bus: {
    absolute: {
      kind: "center",
      count: { mobile: 1, tablet: 1, laptop: 1 },
    },
  },
};
```

Absolute center placement:

- bypasses grid candidate scoring
- creates a pixel footprint centered on the canvas
- keeps the shape's normal footprint size
- passes a projection override so footprint-based shapes actually draw at the centered rect

Optional precision controls:

```ts
absolute: {
  kind: "center",
  count: { mobile: 1, tablet: 1, laptop: 1 },
  xK: 0.5,
  yK: 0.45,
  scale: 1.15,
}
```

Use `xK` and `yK` as canvas fractions. Use `scale` to enlarge or shrink the generated pixel footprint while keeping the same shape identity.

Use this sparingly. Normal scene composition should prefer zones; absolute placement is for authored showcase behavior.

## Blueprint: Compose Procedural Communities

Use this when the scene should describe clusters rather than hand-place each shape.

```ts
export const START_PLACEMENTS: ScenePlacementRules = {
  preset: {
    kind: "zone-communities",
    overflow: "skip",
    zones: [
      {
        id: "left-neighborhood",
        band: "ground",
        center: { x: 0.22, y: 0.58 },
        radius: { xTiles: 7, yTiles: 4.5 },
        shapes: {
          house: { count: { mobile: 2, tablet: 3, laptop: 6 } },
          trees: { count: { mobile: 6, tablet: 10, laptop: 20 } },
          car: { count: { mobile: 1, tablet: 1, laptop: 2 } },
        },
      },
    ],
  },
};
```

Zone communities are resolved during field composition, before runtime drawing. If a requested shape cannot fit inside its zone, it is skipped and never sent to the renderer.

`band` controls how `center.y` is interpreted:

- `ground`: `center.y: 0` maps to the horizon and `center.y: 1` maps to the bottom edge.
- `sky`: `center.y: 0` maps to the top edge and `center.y: 1` maps to the horizon.
- If a canvas has no `horizonPos`, both bands map `center.y: 0..1` to the full canvas height.

`radius.xTiles` and `radius.yTiles` are explicit radii measured in grid cells. Use `radius.tiles` as shorthand when the zone should use the same radius in both directions. `xDistort` and `yDistort` are multipliers against `tiles`; explicit `xTiles` / `yTiles` take precedence when you need an exact narrow band.

The default radius shape is an ellipse:

```ts
radius: { tiles: 5, xDistort: 2, yDistort: 0.6 }
```

Use a rectangular radius when the authored region should behave like a band:

```ts
radius: { tiles: 7, shape: "rect", xDistort: 12, yDistort: 0.2 }
```

Overlapping zones naturally compete for the same occupancy grid; placement attempts are interleaved so one zone does not fully consume shared space before another gets a chance.

## Field Meanings

- `zones`: one or more allowed regions for normal grid-scored placement.
- `absolute`: optional direct placement mode outside grid candidate scoring.
- `count`: per-device base count.
- `quota`: optional signal-to-percentage curve.
- `variants`: optional runtime-selectable placement maps.
- `verticalK`: `[top, bottom]` viewport fraction.
- `horizontalK`: optional `[left, right]` viewport fraction.
- `xK`: absolute horizontal center as a canvas fraction.
- `yK`: absolute vertical center as a canvas fraction.
- `scale`: absolute placement pixel-footprint multiplier.
- `preset`: optional high-level placement compiler.
- `band`: horizon-aware vertical mapping for procedural zones.
- `center`: procedural zone center as canvas fractions.
- `radius.tiles`: shorthand procedural zone radius in grid cells.
- `radius.shape`: optional radius test. Defaults to `"ellipse"`; use `"rect"` for rectangular bands.
- `radius.xTiles` / `radius.yTiles`: explicit horizontal and vertical radii in grid cells.
- `radius.xDistort` / `radius.yDistort`: optional multipliers applied to `radius.tiles` when explicit axis radii are not provided.
