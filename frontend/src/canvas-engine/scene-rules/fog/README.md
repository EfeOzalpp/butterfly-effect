# Fog Rules

Fog rules define sky and ground fog color/gradient behavior for each scene and theme.

## Important Files

- `types.ts` - `FogSceneSpec`, mode specs, gradient stops, and light-gradient specs.
- `index.ts` - exports defaults plus `FOG` and `FOG_DARK`.

## Call Tree

```txt
scene-rules/resolver
  -> FOG or FOG_DARK[sceneLookup]
     -> EngineSceneProfile.fog
        -> engine/loop.ts createFogStateCache()
           -> atmosphere/fog.ts computes FogState from grid/theme/light
           -> atmosphere/cache.ts caches drawn fog layer
```

## Contracts

External lookup:

```ts
FOG: Record<SceneLookupKey, FogSceneSpec | null>
FOG_DARK: Record<SceneLookupKey, FogSceneSpec | null>
DEFAULT_FOG
DEFAULT_DARK_FOG
```

Spec schema:

```ts
FogSceneSpec {
  sky?: FogModeSpec | null
  ground?: FogModeSpec | null
  lightRadiusK?: number
}

FogModeSpec {
  alpha?: number
  color?: FogColor
  skyGradient?: FogLightGradientSpec | FogGradientStop[]
  groundGradient?: FogLightGradientSpec | FogGradientStop[]
}
```

Environment-light rule: `FogLightGradientSpec` lets fog gradients follow the runtime environment light source without putting scene-specific light logic in the fog renderer.
