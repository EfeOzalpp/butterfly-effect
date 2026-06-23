# Runtime

Runtime owns the mounted canvas engine: it receives host controls, keeps mutable engine state, builds per-frame render context, and delegates drawing to render passes and shapes.

## Important Files

- `index.ts` - external entry point; creates controls, scene source, runtime state, layout cache, effect state, scheduler, and ticker. Upstream: the root canvas host layer.
- `engine/` - frame orchestration and runtime state contracts. Upstream: `runtime/index.ts`.
- `geometry/` - cached grid metrics for the current canvas/profile. Upstream: `engine/loop.ts`; downstream: render passes.
- `render/` - pass drawing, pass-local caches, and cache policy. Upstream: `engine/loop.ts`; downstream: `shape-adapter` and `shapes`.
- `shape-adapter/` - final dispatch from runtime item payloads to shape draw functions. Upstream: shape pass.
- `debug/` - opt-in runtime diagnostics, placement helpers, and cache counters.

## Call Tree

```txt
canvas host layer
  -> startCanvasEngine(runtime/index.ts)
     -> create EngineControls and scene source
     -> create engine state, effect state, layout cache
     -> createEngineTicker(engine/loop.ts)
        -> tick(now)
           -> prepare scene frame
           -> draw cached/live scene passes
           -> prepare shape frame
           -> draw cached/live shape items
           -> draw live ambient particles
```

Cache hit path:

```txt
engine/loop.ts
  -> pass cache or shape cache
     -> key matches previous inputs
        -> blit stored canvas/bitmap
        -> skip deeper draw function
```

Cache miss path:

```txt
engine/loop.ts
  -> pass cache or shape cache
     -> key changed
        -> draw once into offscreen canvas
        -> store result
        -> blit result
```

## Contracts

External API:

```ts
startCanvasEngine(opts: StartCanvasEngineOpts): EngineControls
```

Internal profile contract:

```ts
EngineSceneProfile {
  lookupKey
  paddingSpec
  background
  ambientParticles
  fog
  foliage
  renderCache
}
```

Runtime rule: app code talks to `EngineControls`; the loop talks to render helpers; render helpers talk to shapes. Stable work should be cached by the smallest folder that owns the relevant inputs.
