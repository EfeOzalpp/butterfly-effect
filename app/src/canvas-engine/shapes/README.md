# Shapes

Shapes own the actual drawing: proportions, palettes, seeded variation, lighting response, animation details, and optional render-pass support.

## Important Files

- `index.ts` - public shape exports, `SHAPE_RENDER_PASSES`, and `ENVIRONMENT_LIGHT_SHAPE`. Upstream: `runtime/shape-adapter`.
- `types.ts` - public shape draw contracts and grouped option slices.
- `options.ts` - grouped option accessors used by shape files.
- `*.ts` shape files - authored drawing functions such as `drawHouse`, `drawTrees`, `drawBus`.

## Call Tree

```txt
runtime/shape-adapter
  -> drawItemFromRegistry
     -> drawShape(p, cx, cy, r, opts)
        -> read grouped options
        -> resolve palette/tunables
        -> draw color or depthMask pass
```

Optional render pass:

```txt
shapeDepthOverlay or shape cache bake
  -> shapeRegistrySupportsRenderPass(shape, "depthMask")
     supported: invoke shape with pass.renderPass = "depthMask"
     unsupported: skip optional pass
```

## Contracts

External API:

```ts
drawShape(p, cx, cy, r, opts?)
SHAPE_RENDER_PASSES: Record<string, readonly ShapeRenderPass[]>
ENVIRONMENT_LIGHT_SHAPE: Partial<Record<string, ["lightShape", lightHex, darkHex?]>>
```

Option schema:

```txt
projection  cell, row metrics, footprint, usedRows
style       alpha, liveAvg, darkMode, exposure, contrast, gradientRGB, lightCtx
lifecycle   timeMs, dtSec, rootAppearK
identity    seed, seedKey, shapeOccurrenceIndex
sprite      fit/export/sprite controls
particles   particleStore
pass        color/depthMask, mask color/alpha, depth tint
```

Shape rule: shared runtime values are read through grouped accessors such as `shapeStyle(opts)` and `shapeProjection(opts)`. Direct root `opts.*` fields should mean shape-specific options.
