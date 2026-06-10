# Scene Rules

Scene rules own authored visual profiles: padding, placement, background, fog, foliage, ambient particles, spotlight slides, and render cache policy.

## Important Files

- `registry.ts` - named rule sets used by host definitions.
- `profile.ts` - `SceneProfile` and `SceneRuleSet` contracts.
- `resolver.ts` - combines lookup tables into one profile for a scene state.
- `shapeCatalog.ts` and `shapeFootprints.ts` - canonical shape names and footprint sizes.
- subfolders - authored lookup tables by concern.

## Call Tree

```txt
host definition
  -> SCENE_RULESETS[id]
     -> resolveProfile(state, context)
        -> canvas-padding lookup
        -> placement-rules lookup
        -> backgrounds lookup
        -> fog lookup
        -> foliage lookup
        -> ambient-particles lookup
        -> render cache policy
     -> EngineSceneProfile
        -> runtime/index.ts
```

## Contracts

External API:

```ts
SceneRuleSet {
  id
  getProfile(state, context): SceneProfile
}

SceneProfile {
  padding
  placements
  background
  ambientParticles
  fog
  foliage
  renderCache
  landscapeCountScale?
}
```

Lookup rule: subfolders export authored tables; `resolver.ts` decides which table entry applies to the active scene, device, and theme.
