# Shape Adapter

Shape adapter is the dispatch boundary between runtime item payloads and authored shape draw functions. It is not a cache and does not own art direction.

## Important Files

- `registry.ts` - maps `EngineFieldItem.shape` to a draw function and checks optional render-pass support. Upstream: `runtime/index.ts`; downstream: `shapes/index.ts`.
- `draw.ts` - invokes the registered draw function for one item.
- `options.ts` - copies grouped runtime options without reallocating per item.
- `types.ts` - runtime-safe shape option type that excludes palette ownership.

## Call Tree

```txt
engine/loop.ts renderOneSandboxed
  -> shape cache
     hit: skip adapter for color pass
     miss/live-only: continue

  -> drawItemFromRegistry
     -> registry lookup by item.shape
     -> shape draw function in shapes/*
```

Cache bake path:

```txt
shape cache miss with bake budget
  -> offscreen p-like surface
  -> drawItemFromRegistry
  -> store baked bitmap/mask
```

## Contracts

External API:

```ts
createRegistry(entries)
drawItemFromRegistry(registry, p, item, rEff, opts)
shapeRegistrySupportsRenderPass(registry, shape, pass)
```

Runtime option contract:

```ts
RuntimeShapeOptions = ShapeDrawOptions without runtime-owned palette overrides
```

Rule: if the runtime has decided a shape function must run, the adapter performs the lookup and call. Reuse decisions happen before this folder.
