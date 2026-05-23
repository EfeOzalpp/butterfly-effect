# Runtime

The runtime is the canvas side of the engine. It receives app-level controls, owns the canvas loop, builds grid/render context, then hands items to shape draw functions.

Main flow:

```txt
index.ts
  -> engine/loop.ts
  -> render/*
  -> shapes/registry.ts
  -> src/canvas-engine/shapes/*
```

Type ownership:

```txt
engine/types.ts         public controls and start options
engine/field.ts         item payload contract
engine/state.ts         runtime-owned defaults and mutable state shape
engine/itemLifecycle.ts per-item appear/replay lifecycle state
render/*                render-pass params local to each render helper
```

Folder map:

```txt
engine/
  Public controls, runtime state, frame scheduler, instance registry, item
  lifecycle, and the main frame loop.

geometry/
  Runtime layout orchestration. This calls the grid-layout and adjustable-rule
  helpers, then shapes the result for the render pass.

platform/
  DOM mount, canvas sizing, resize handlers, and browser-facing setup.

p/
  Small p5-like drawing facade over Canvas 2D. This keeps shape files away from
  raw canvas context details.

render/
  Background, palette, lighting, item drawing, item ordering, and ghost/fog
  render helpers.

shapes/
  Runtime shape registry and z-index policy. The actual art functions live in
  src/canvas-engine/shapes.

debug/
  Debug rendering helpers.

util/
  Runtime-local math and easing helpers.
```

The important boundary is this: app code talks to `EngineControls`; the loop talks to render helpers; render helpers talk to shapes. Shape-specific drawing options should stay close to shapes unless more than one runtime layer truly needs the same contract.

## Runtime Rule

The frame loop should receive prepared state and draw it. It should not rediscover app intent every frame.

That means expensive or stable work should usually happen before the loop, or be cached inside runtime helpers:

```txt
scene rules -> resolved lookup key
grid inputs -> cached grid metrics
field items -> prepared render order
shape drawing -> registry lookup
```

When something changes, invalidate the smallest cache that owns that thing.
