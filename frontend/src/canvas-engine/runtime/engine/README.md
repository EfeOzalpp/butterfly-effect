# Engine

Engine owns runtime state, controls contracts, scheduling, lifecycle, and the frame loop. It coordinates rendering but does not own art rules or pass-specific cache strategy.

## Important Files

- `types.ts` - public controls and start options. Upstream: `runtime/index.ts`; downstream: host code.
- `state.ts` - runtime defaults and mutable state shape. Upstream: `runtime/index.ts`; downstream: `loop.ts`.
- `field.ts` - item payload consumed by render passes.
- `loop.ts` - per-frame orchestration and pass order.
- `shapeFrameOptions.ts` - base shape option assembly and shape light item resolution.
- `environmentLight.ts` - environment light source lookup for fog/atmosphere effects.
- `runtimeSceneVariants.ts` - spotlight variant selection for runtime scene specs.
- `itemLifecycle.ts` and `sceneSurfaceLifecycle.ts` - item and scene appear state.
- `scheduler.ts` - requestAnimationFrame registration and cleanup.

## Call Tree

```txt
createEngineTicker(deps)
  -> create long-lived caches
     background, row light, fog, stars, foliage, palette, shape render

tick(now)
  -> prepareSceneFrame(now)
     -> resolve scene profile and spotlight variants
     -> compute/reuse grid metrics
     -> resolve anchors, environment light, fog state

  -> render scene passes
     background cache -> live stars -> foliage cache -> fog cache -> debug grid

  -> prepareShapeFrame(sceneFrame)
     -> resolve gradient color through palette cache
     -> sort field items only when items/grid metrics changed
     -> create SceneLightContext
     -> create base RuntimeShapeOptions

  -> render shape passes
     row-light cache -> drawItems(sortedItems, baseOpts) -> live ambient particles
```

Shape item path:

```txt
drawItems
  -> append lifecycle, identity, occurrence index, alpha, footprint
  -> renderOneSandboxed
     -> ask shape cache to draw/reuse color pass
     -> if cache declined, call shape-adapter live
     -> draw/reuse shape depth overlay
```

## Contracts

External API:

```ts
EngineControls {
  setFieldItems(items, options?)
  setFieldVisible(visible)
  setFieldStyle(style)
  setInputs(inputs)
  setSceneProfile(profile)
  resize()
  destroy()
}
```

Internal frame contract:

```ts
SceneFrameContext -> shared scene/grid/fog/background state
ShapeFrameContext -> SceneFrameContext + sortedItems + sceneLight + baseOpts
```

Rule: `loop.ts` should orchestrate prepared state. If a helper owns stable inputs or cache identity, keep that helper outside the loop.
