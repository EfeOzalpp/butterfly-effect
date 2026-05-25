# Shape Adapter

This folder is the bridge between runtime items and the actual shape drawings.

The real shape art lives in `src/canvas-engine/shapes`. Shape-level metadata such
as supported render passes is exported from the same `shapes/index.ts` surface.

The adapter only does runtime work:

- look up a shape by the `EngineFieldItem.shape` string
- pass runtime coordinates/options into the shape draw function
- skip render passes the shape does not support
- add small runtime-only overrides such as snow ground hiding by device
