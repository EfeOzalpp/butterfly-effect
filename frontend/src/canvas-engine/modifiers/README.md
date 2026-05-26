# Canvas Modifiers

This folder holds reusable drawing modifiers for the canvas engine.

The shape files should stay responsible for their own art direction. Modifiers provide shared math and rendering helpers so the shapes do not need to re-create the same low-level behavior everywhere.

## Contract With Shapes

Shapes import modifier types and helpers through `modifiers/index.ts`. The
modifier layer provides primitives; shape files decide how those primitives are
used for their own art direction.

Typical shape imports:

```ts
import {
  applyShapeMods,
  blendRGB,
  clamp01,
  footprintToPx,
  resolveRangeValue,
  sampleDirectionalLightRect,
} from "../modifiers/index";
import type { GridFootprint, NumberRange, RGB, SceneLightContext } from "../modifiers/index";
```

Those modifier types also flow into the shape option contract:

```txt
ProjectionContext -> ShapeProjectionOptions
GridFootprint     -> projection.footprint
RGB               -> palettes, gradients, depth mask colors
SceneLightContext -> style.lightCtx
ParticleStore     -> particles.particleStore
NumberRange       -> shape tunables resolved with resolveRangeValue()
```

The engine does not import shape palettes. Runtime creates grouped draw options
with scene state, then each shape resolves its own palette and tunables:

```txt
runtime opts -> shape option groups -> shape tunables/palettes -> modifier helpers -> drawing
```

So the boundary is:

```txt
modifiers:
  reusable math, projection, lighting, particles, transforms, render-pass helpers,
  and shared types

shapes:
  palette choices, layout ratios, animation taste, render-pass decisions, and
  final draw calls
```

## Main Groups

`color-modifiers/`

Color conversion, blending, brightness, saturation, fog, gradients, and palette helpers.

`color-modifiers/index.ts` is the public surface for color helpers. `style.ts` composes a higher-level visual style, so it is not the folder index. `RGB`, `clamp01`, and `lerpNumber` live in `shared/math.ts` and are re-exported here; small color-helper contracts like `Stop` and CSS color parsing live in `utils.ts`.

`shape-modifiers/`

Geometry and animation helpers for shape bodies, such as lobes, displacement, fit scaling, seeded selection, paths, numeric interpolation, and applying shape modifier configs.

`shape-modifiers/index.ts` is the public surface for shape helpers. `apply.ts` resolves declarative shape modifier configs into a transform envelope, while `types.ts` owns the config contracts. When `rootAppearK` is present, `apply.ts` applies the standard root appear envelope; shapes only pass `appear` when they need a different anchor or easing. `ranges.ts` handles the common fixed-number-or-range pattern used by shape art direction through `resolveRangeValue()`.

`render-pass.ts`

Render-pass color helpers and the `ShapeRenderPass` contract. Shapes use these helpers to decide what belongs in the normal color pass and what belongs in the `depthMask` pass.

`projection/`

Grid placement to pixel projection. `GridFootprint` and `PixelRect` live in `shared/geometry.ts` and are re-exported here; this folder turns a footprint like `{ r0, c0, w, h }` into the `{ x, y, w, h }` rectangle that shapes draw.

The projection helper uses the footprint's bottom row as the sizing row. This keeps tall shapes anchored to the visual row they stand on, even when perspective rows have different widths and heights.

`lighting/`

Scene light sampling and small painting helpers. Runtime creates `style.lightCtx`;
shapes sample it for their own rectangles or triangles, then decide how much
highlight/shadow paint belongs on that surface. These helpers do not create a
separate highlight render pass.

`particles/`

Generic particle emitters and particle-specific perspective helpers. The emitters step and draw particles, but they consume final options such as `count`, `size`, `speed`, `lifetime`, `rect`, and `color`.

`particles/store.ts` owns emitter state for a canvas engine instance. `particles/types.ts` owns the shared emitter contracts and tiny drawing surface. `particles/utils.ts` owns shared math and PRNG helpers. Hashing stays inside each emitter when the seed contract is different.

`particles/perspective/`

Particle perspective scaling helpers. These read runtime row-height data, build depth buckets, and return a normalized `t` value for the placed object's row depth.

Shapes use that `t` to scale particle settings before passing them to the particle systems.

Example flow:

```ts
const rowBucket = particleRowBucket(rect, opts);
const sizeScale = particleBucketRange(rowBucket.t, 0.26, 1.0);

stepAndDrawPuffs(p, {
  store: opts.particleStore,
  size: { min: baseMin * sizeScale, max: baseMax * sizeScale },
});
```

## Shape Size vs Particle Perspective

Shape bodies usually scale through the grid layout:

```ts
const { x, y, w, h } = footprintToPx(rect, opts);
```

Particle behavior needs a separate perspective pass because emitters have their own settings. A bigger rendered shape does not automatically mean its smoke, rain, or snow has the right size, speed, lifetime, or count.

So the split is:

```txt
shape body size:
  grid layout -> projection -> footprintToPx / rowHeightAt / rowWidthAt

particle behavior:
  row heights -> particleRowBucket -> particleBucketRange -> emitter options
```

## Public Boundary

Most consumers should import from `modifiers/index.ts`.

Internal helper files can stay hidden behind the folder-level APIs unless another folder truly needs that lower-level contract.
