# Foliage Rules

Foliage rules define optional static plant-detail layers that sit behind/around the scene.

## Important Files

- `types.ts` - foliage color, layer, scene, and lookup contracts.
- `index.ts` - exports authored `FOLIAGE` and `FOLIAGE_DARK` tables.

## Call Tree

```txt
scene-rules/resolver
  -> FOLIAGE or FOLIAGE_DARK[sceneLookup]
     -> EngineSceneProfile.foliage
        -> engine/loop.ts runtime variant resolver
           -> render/passes/foliage/cache.ts
              hit: blit foliage layer
              miss: foliage.ts redraws plant layer once
```

## Contracts

External lookup:

```ts
FOLIAGE: Record<SceneLookupKey, FoliageSceneSpec | null>
FOLIAGE_DARK: Record<SceneLookupKey, FoliageSceneSpec | null>
```

Spec schema:

```ts
FoliageSceneSpec {
  layers: readonly FoliageLayerSpec[]
  variants?: readonly (FoliageSceneSpec | null)[]
}
```

Rule: foliage is authored scene detail. Runtime may cache its rendered layer because the layer is static between scene/theme/anchor/liveAvg changes.
