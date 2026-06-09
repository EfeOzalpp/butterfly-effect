# Shape Authoring

Shape files own the actual art direction: proportions, palette choices, lighting response, animation feel, and which details appear in each render pass.

They sit between a few shared surfaces:

```txt
types.ts
  Shape draw contracts. Import `ShapeDrawOptions`, `ShapePalette`,
  `ShapeCanvas`, and shape-facing option slice types from here.

options.ts
  Accessors for the grouped draw option contract. Use these inside shape
  files instead of reaching into flat runtime fields directly.

modifiers/index.ts
  Reusable drawing and math helpers: projection, color blending, lighting,
  shape modifier envelopes, particle perspective, render-pass helpers, ranges,
  and small math tools.
```

## Shape File Layout

Keep shape files in this order so every shape has the same reading path:

```txt
imports
  External engine helpers, modifier helpers, and shape option helpers.

types
  Shape-specific palette/options/tuning interfaces. Shape options should extend
  `ShapeDrawOptions<ShapePaletteForThisShape>` when they add shape-only knobs.

tunables
  Static art-direction config: NumberRange values, animation rates, layout
  ratios, particle counts, thresholds, and other authored constants.

palettes
  Shape-owned base/dark/theme palettes. These are not exported to the runtime.

helpers
  Local helpers that are genuinely specific to this shape after shared utility
  deduplication.

draw function
  The exported `drawShape(...)` entry point.
```

Example:

```ts
interface BusPalette extends ShapePalette {
  grass: RGB[];
  body: RGB[];
  window: RGB;
}

type BusDrawOptions = ShapeDrawOptions<BusPalette>;

const BUS = {
  body: { colorBlend: [0.06, 0.03] },
};

const BUS_BASE_PALETTE: BusPalette = { ... };

export function drawBus(
  p: ShapeCanvas,
  cx: number,
  cy: number,
  r: number,
  opts: BusDrawOptions = {}
): void {
  const style = shapeStyle(opts);
  const pal = style.palette ?? BUS_BASE_PALETTE;
}
```

## Option Contract

Runtime passes one `opts` object into every shape. Shared engine state lives in
grouped slices, not on the root object.

Prefer grouped access in migrated shapes:

```ts
const projection = shapeProjection(opts);
const style = shapeStyle(opts);
const lifecycle = shapeLifecycle(opts);
const identity = shapeIdentity(opts);
const sprite = shapeSprite(opts);
const pass = shapePass(opts);
```

Use those groups by intent:

```txt
projection  cell, row metrics, footprint, usedRows
style       alpha, liveAvg, darkMode, exposure, contrast, gradientRGB, lightCtx
lifecycle   timeMs, dtSec, rootAppearK
identity    seed, seedKey, shapeOccurrenceIndex
sprite      sprite/export sizing controls such as allowUpscale and pixelScale
particles   particleStore
pass        color/depthMask render pass, mask color/alpha, and depth tint values
```

Shape-specific palette overrides are exposed through the style slice:

```ts
const pal = style.palette ?? (darkMode ? DARK_PALETTE : BASE_PALETTE);
```

The normal runtime path does not pass palettes. Each shape owns its internal
palette constants and chooses between them from scene signals such as `darkMode`.
The `style.palette` field exists for direct/custom callers that want to override
a shape palette. Runtime deliberately narrows that field away in
`runtime/shape-adapter/types.ts`.

That keeps concrete palette typing inside the shape while the runtime avoids
owning a shape's art direction details.

## Render Passes And Lighting

The shape runtime has two render pass names:

```txt
color      full authored drawing, including shape-local highlights
depthMask  stable mass for depth overlays and cached masks
```

`depthMask` is optional. Runtime checks `SHAPE_RENDER_PASSES` in `shapes/index.ts`
before asking a shape to draw that pass, so sky/weather shapes can stay
color-pass only and handle depth tint inline.

The engine does not automatically compute per-shape highlights. Runtime creates
`style.lightCtx`; shapes sample their own surfaces with helpers such as
`sampleDirectionalLightRect`, then paint bands with helpers such as
`paintPixelLightBands` or `paintDirectionalTriangleBands`.

That keeps the light source engine-owned and the surface response shape-owned.
A house, tree, bus, and roof all expose different surfaces, so the shape decides
where the highlight belongs.

Highlight bands are color-mode details. Gate them with
`shouldDrawInRenderPass(renderPass, false)` or an equivalent color-detail check
so they do not draw into `depthMask`.

## Tunable Contract

Tunables are shape-authored config. They often use modifier types and helpers,
but they are not themselves runtime state.

Common pattern:

```ts
import { clamp01, resolveRangeValue } from "../modifiers/index";
import type { NumberRange } from "../modifiers/index";

interface HouseTuning {
  body: { colorBlend: NumberRange };
}

const HOUSE: HouseTuning = {
  body: { colorBlend: [0.2, 0.02] },
};

const u = clamp01(style.liveAvg ?? 0.5);
const blendK = resolveRangeValue(HOUSE.body.colorBlend, u);
```

In that flow:

```txt
tunable range -> modifier helper -> resolved draw value
```

Use `satisfies` when an inline config needs type checking without forcing a
separate named interface:

```ts
const SUN = {
  colorBlend: [0.30, 0.00],
  oscAmp: [0.12, 0.06],
} satisfies Record<string, NumberRange>;
```

Prefer a named interface when the config is nested enough that the contract is
worth reading independently.

## Import Roles

Use `types.ts` for contracts:

```ts
import type { ShapeCanvas, ShapeDrawOptions, ShapePalette } from "./types";
```

Use `options.ts` for grouped option reads:

```ts
import { shapeStyle, shapeProjection, shapePass } from "./options";
```

Use `modifiers/index.ts` for reusable engine modifiers:

```ts
import {
  applyShapeMods,
  applySrgbExposureContrast,
  blendRGB,
  fillRgb,
  footprintToPx,
  sampleDirectionalLightRect,
  shapeColorForRenderPass,
  shouldDrawInRenderPass,
} from "../modifiers/index";
```

## Local Variables

Procedural shapes can have a lot of local names. Keep them when they make the
geometry, seed choice, tint, lighting sample, pass state, or final dimensions
easier to follow.

## Contract Rule

Shared runtime values should be read through their group:

```ts
style.liveAvg
style.gradientRGB
lifecycle.rootAppearK
pass.renderPass
projection.footprint
sprite.allowUpscale
```

Direct `opts.*` reads inside a shape should mean "this is a shape-specific
option", not shared runtime plumbing.

`rootAppearK` is runtime lifecycle state. Shapes should only pass an explicit
`appear` modifier when they need to change the standard root envelope, such as a
center-anchored sun/cloud or a different easing curve.
