# Background Rules

Background rules define base colors, gradient overlays, animated star specs, and spotlight presets for each scene lookup key.

## Important Files

- `types.ts` - `BackgroundSpec`, overlay specs, stop specs, and anchor context.
- `index.ts` - exports `BACKGROUNDS` and `BACKGROUNDS_DARK`.
- `start.ts`, `questionnaire.ts`, `city.ts`, `spotlight.ts` - authored lookup entries.

## Call Tree

```txt
scene-rules/resolver
  -> BACKGROUNDS or BACKGROUNDS_DARK[sceneLookup]
     -> EngineSceneProfile.background
        -> engine/loop.ts runtime spotlight preset resolver
           -> render/passes/background/cache.ts
              -> background.ts draws base/overlay
           -> live star pass draws stars
```

## Contracts

External lookup:

```ts
BACKGROUNDS: Record<SceneLookupKey, BackgroundSpec>
BACKGROUNDS_DARK: Record<SceneLookupKey, BackgroundSpec>
```

Spec schema:

```ts
BackgroundSpec {
  base: string
  overlay?: radial | linear | solid
  stars?: StarSpec
  runtimePreset?: { selector: "spotlightIndex"; entries: readonly BackgroundSpec[] }
}
```

Anchor rule: gradient stops may reference `visualHorizon`; runtime resolves that through the background anchor context built from grid metrics.
