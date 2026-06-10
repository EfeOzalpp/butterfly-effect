# Runtime Debug

Debug owns opt-in diagnostics for the canvas engine. Nothing here should affect normal rendering unless a debug flag or console helper is enabled.

## Important Files

- `gridOverlay.ts` - draws grid, used-row boundary, and forbidden cells. Upstream: `engine/loop.ts`.
- `placementAuthoring.ts` - installs the `bePlace` browser helper in dev.
- `depthMaskStats.ts` - optional interval logging for depth mask cache counters.
- `farShapeCacheStats.ts` - browser helpers for far-shape cache counters.
- `diagnostics.ts` - unknown-shape and scheduler error reports.
- `flags.ts` - default debug flags.

## Call Tree

```txt
engine/loop.ts
  -> drawGridOverlay when style.debug.grid is true

EngineHost dev mode
  -> install bePlace after canvas is ready

shapeDepthOverlay
  -> createDepthMaskDebugTracker()

shape/cache/farShapeBitmap
  -> createFarShapeCacheDebugTracker()
```

## Contracts

External style flag:

```ts
debug: {
  grid: boolean
  gridAlpha: number
}
```

Browser helpers:

```js
bePlace.enable({ shapes: "hide" })
bePlace.use("town", { shapes: { villa: 4, house: 2, trees: 6 } })
bePlace.resize({ tiles: 6, xDistort: 3, yDistort: 0.4 })
bePlace.copy()

beCanvasCacheStats()
beResetCanvasCacheStats()
```

Depth mask logging:

```js
localStorage.setItem("be:debug:depth-mask", "1")
localStorage.removeItem("be:debug:depth-mask")
window.__BE_DEBUG_DEPTH_MASK = true
```

Counter read: high hit/drawn counts with low bake/budget-skip growth means cache reuse is healthy. Rapid misses, trims, or budget skips usually mean keys are too unique, budgets are too low, or too many far candidates are changing at once.
