# Render Cache

This folder owns generic offscreen canvas storage. It does not know scene rules, shape names, depth masks, stamps, or pass-specific cache keys.

## Important Files

- `offscreenCache.ts` - offscreen entry creation/release, DPR sizing, render-target invalidation, pixel-budget trimming, and full-canvas layer blitting. Upstream: pass-local `cache.ts` files.

## Call Tree

```txt
pass cache
  -> createOffscreenCache()
  -> getOrCreateCanvasLayer(cache, p)
     canvas/DPR changed: clear entries
     canvas/DPR same: reuse entry

  -> key matches pass inputs
     drawCanvasLayer(p, entry)

  -> key changed
     clearOffscreenEntry(entry)
     pass draw function renders into entry
     drawCanvasLayer(p, entry)
```

## Contracts

External API:

```ts
createOffscreenCache<Bounds>()
canvasDpr(p)
snapBoundsToDevicePixels(bounds, dpr)
pixelSizeForBounds(bounds, dpr)
maxCachePixelsForCanvas(p, maxPixelsPerCanvasPixel)
getOrCreateCanvasLayer(cache, p, dpr?)
drawCanvasLayer(p, entry, alpha?)
clearOffscreenEntry(entry)
```

Internal rule: this folder stores pixels. Cache identity and visual invalidation belong to the pass using the cache.
