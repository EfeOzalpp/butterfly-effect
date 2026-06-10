# Shape Cache

Shape cache owns shape-specific reuse: far item bitmaps, shared stamps, stamp masks, cache keys, eligibility, stale fallback, and policy enforcement.

## Important Files

- `index.ts` - public cache entry for the shape pass.
- `farShapeBitmap.ts` - color-pass bitmap cache, shared stamp cache, stamp mask cache, bake budget, stale fallback, and debug counters. Upstream: `shapeRenderCache`.
- `bitmapKeys.ts` - cache key construction, liveAvg buckets, palette keys, depth/light key fragments.
- `policy.ts` - far-cache and shared-stamp eligibility. Upstream: `render/cache-policy`.

## Call Tree

```txt
engine/loop.ts renderOneSandboxed
  -> shapeRenderCache.drawFarShapeBitmap
     -> policy rejects or item is not far
        return false, shape draws live

     -> shared stamp candidate
        stamp hit: draw stamp bitmap, draw/reuse stamp mask, skip live color draw
        stamp miss with budget: bake shape once into stamp, store, draw
        stamp miss without budget: use stale compatible stamp or return handled/false

     -> generic far bitmap candidate
        bitmap hit: draw stored item bitmap, skip live color draw
        bitmap miss with budget: bake shape once into bitmap, store, draw
        bitmap miss without budget: use stale compatible bitmap or return false

  -> if false, shape-adapter invokes live shape draw
  -> shapeDepthOverlay draws or reuses depth mask
```

## Contracts

External API:

```ts
createFarShapeBitmapRenderer(getPolicy)
```

Key contract:

```txt
item identity + footprint + size + quantized liveAvg/palette
+ darkMode + exposure/contrast/blend + depth tint + light signature
+ bounds + DPR
```

Rule: shared stamps are not generic images. They preserve seeded variation, lighting, dark/light mode, liveAvg color buckets, footprint scaling, and matching depth masks, so they stay under `passes/shape/cache`.
