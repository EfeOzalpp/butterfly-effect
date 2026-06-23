# Ambient Particles

Ambient particle rules define scene-level live particles such as dust, pollen, wind flecks, and rain streaks.

## Important Files

- `types.ts` - layer and scene spec contracts.
- `index.ts` - exports `AMBIENT_PARTICLES` and `AMBIENT_PARTICLES_DARK`.

## Call Tree

```txt
scene-rules/resolver
  -> AMBIENT_PARTICLES or AMBIENT_PARTICLES_DARK[sceneLookup]
     -> EngineSceneProfile.ambientParticles
        -> engine/loop.ts runtime spotlight preset resolver
           -> render/passes/ambient-particles
              -> live draw every frame
```

## Contracts

External lookup:

```ts
AMBIENT_PARTICLES: Record<SceneLookupKey, AmbientParticlesSceneSpec | null>
AMBIENT_PARTICLES_DARK: Record<SceneLookupKey, AmbientParticlesSceneSpec | null>
```

Spec schema:

```ts
AmbientParticlesSceneSpec {
  layers: readonly AmbientParticleLayerSpec[]
  runtimePreset?: { selector: "spotlightIndex"; entries: readonly (AmbientParticlesSceneSpec | null)[] }
}
```

Rule: ambient particles stay live. Do not route time-based particle movement through offscreen pass caches.
