# Canvas Padding Rules

Canvas padding rules define the usable grid area, horizon mode, row count, and forbidden cells for each scene/device.

## Important Files

- `types.ts` - `CanvasPaddingSpec` and device policy types.
- `index.ts` - exports `CANVAS_PADDING`.
- `resolve.ts` - resolves device and variant policy into one spec.
- `start.ts`, `questionnaire.ts`, `city.ts`, `spotlight.ts` - authored scene policies.
- `helpers.ts` - shared padding presets.

## Call Tree

```txt
scene-rules/resolver
  -> CANVAS_PADDING[sceneLookup]
     -> resolvePaddingSpec(device, policy)
        -> EngineSceneProfile.padding
           -> runtime/geometry/gridCache
              -> render passes and shape projection
```

## Contracts

External lookup:

```ts
CANVAS_PADDING: Record<SceneLookupKey, CanvasPaddingPolicy>
```

Spec schema:

```ts
CanvasPaddingSpec {
  rows
  useTopRatio?
  horizonPos?
  forbiddenCells?
}
```

Rule: padding controls grid geometry only. Placement rules decide which shapes occupy that grid.
