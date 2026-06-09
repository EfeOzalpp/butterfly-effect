# Runtime

The runtime is the canvas side of the engine. It receives app-level controls, owns the canvas loop, builds grid/render context, then hands items to shape draw functions.

Main flow:

```txt
index.ts
  -> engine/loop.ts
  -> render/passes/*
  -> shape-adapter/registry.ts
  -> src/canvas-engine/shapes/*
```

Type ownership:

```txt
../offscreen-shape-surface.ts
                        alternate caller-owned canvas surface for drawing shapes
engine/types.ts         public controls and start options
engine/field.ts         item payload contract
engine/state.ts         runtime-owned defaults and mutable state shape
engine/itemLifecycle.ts per-item appear/replay lifecycle state
engine/sceneSurfaceLifecycle.ts
                        first-ready canvas surface appear state
shape-adapter/types.ts  runtime-safe shape options
render/cache/*          shared offscreen cache mechanics
render/cache-policy/*   runtime policy for shape bitmap and depth-mask caching
render/passes/*         render-pass params local to each render helper
```

`offscreen-shape-surface.ts` is not a render-pass cache and does not mount or
schedule an engine. It exists for alternate render paths, such as graph sprite
texture generation, that need a p-like shape drawing surface on a caller-owned
canvas.

`EngineControls.setSceneProfile()` is the host-to-runtime scene handoff. A
canvas host resolves its explicit scene lookup key into a padding spec,
background spec, and runtime cache policy before runtime receives it. The frame
loop receives that same profile through `getProfile()` instead of separate
scene/padding/background cache getters.

Folder map:

```txt
engine/
  Public controls, runtime state, frame scheduler, item lifecycle, and the main
  frame loop.

geometry/
  Runtime layout orchestration. This calls the grid-layout and scene-rule
  helpers, then shapes the result for the render pass.

platform/
  DOM mount ownership, canvas sizing, resize handlers, and browser-facing setup.

p/
  Small p5-like drawing facade over Canvas 2D. This keeps shape files away from
  raw canvas context details.

render/
  Pass-specific drawing code plus shared offscreen cache mechanics. Passes own
  cache keys and bake/draw behavior; render/cache owns canvas entries and
  eviction; render/cache-policy owns cache budgets and always-live decisions.

shape-adapter/
  Runtime bridge from EngineFieldItem payloads to shape draw functions. Shape
  metadata like supported render passes lives with the actual shape drawings in
  src/canvas-engine/shapes/index.ts.

debug/
  Debug flags, optional diagnostics, grid overlay rendering, and opt-in cache
  counters. Runtime files should import debug tools from this folder instead of
  writing console/debug behavior inline.

util/
  Runtime-local math and easing helpers.
```

The important boundary is this: app code talks to `EngineControls`; the loop talks to render helpers; render helpers talk to shapes. Shape-specific drawing options should stay close to shapes unless more than one runtime layer truly needs the same contract.

## Runtime Rule

The frame loop should receive prepared state and draw it. It should not rediscover app intent every frame.

That means expensive or stable work should usually happen before the loop, or be cached inside runtime helpers:

```txt
host definition -> scene lookup key -> scene rules
grid-layout -> runtime/geometry/gridCache -> cached grid metrics
field items -> prepared render order
shape drawing -> registry lookup
```

When something changes, invalidate the smallest cache that owns that thing.
