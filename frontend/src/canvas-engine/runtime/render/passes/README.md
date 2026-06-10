# Render Passes

Render passes own visual layers. Draw files describe how a layer is made; adjacent `cache.ts` files decide when that layer can be reused.

## Important Files

- `background/` - base color, gradients, background anchors, live stars, and background cache. Upstream: `engine/loop.ts`; authored by `scene-rules/backgrounds`.
- `atmosphere/` - fog state/layer cache and star geometry. Upstream: `engine/loop.ts`; authored by `scene-rules/fog`.
- `foliage/` - plant-detail draw and cache layer. Upstream: `engine/loop.ts`; authored by `scene-rules/foliage`.
- `light/` - scene-wide row light overlay and cache. Upstream: `engine/loop.ts`; input: `SceneLightContext`.
- `shape/` - item order, item lifecycle draw pass, palette cache, shape render cache, and depth overlays. Upstream: `engine/loop.ts`; downstream: `shape-adapter`.
- `ambient-particles/` - live scene particles. Upstream: `engine/loop.ts`; authored by `scene-rules/ambient-particles`.
- `shared/` - helpers used by multiple passes.

## Call Tree

```txt
engine/loop.ts
  -> background/cache.ts
     hit: blit base layer
     miss: background.ts draws base/gradient layer once

  -> background.drawBackgroundStarsOnly
     live every frame

  -> foliage/cache.ts
     hit: blit foliage layer
     miss: foliage.ts draws plant layer once

  -> atmosphere/cache.ts
     hit: blit fog layer
     miss: fog.ts draws fog bands once

  -> light/cache.ts
     hit: blit row-light layer
     miss: rowLight.ts draws row-light overlay once

  -> shape/items.ts
     receives sorted items from engine
     adds per-item runtime options
     asks shape cache or shape adapter to draw each item

  -> ambient-particles
     live every frame because particle positions are time-based
```

## Contracts

External API:

```ts
createBgCache()
createFogLayerCache()
createFoliageLayerCache()
createRowLightCache()
createShapeRenderCache(getPolicy)
drawItems(params)
```

Internal cache contract:

```txt
cache.ts owns cache key + offscreen reuse
draw file owns visual construction
render/cache owns generic canvas storage
render/cache-policy owns runtime budgets and opt-outs
```
