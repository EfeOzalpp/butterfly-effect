# Placement Rules

Placement rules define which shapes appear in each scene and where generated grid items may be placed.

## Important Files

- `types.ts` - placement contracts for quotas, points, centers, and procedural zones.
- `helpers.ts` - shared placement helpers and deterministic distribution utilities.
- `index.ts` - exports `SHAPE_PLACEMENTS`.
- `start.ts`, `questionnaire.ts`, `city.ts`, `spotlight.ts` - authored scene placement maps.

## Call Tree

```txt
scene-rules/resolver
  -> SHAPE_PLACEMENTS[sceneLookup]
     -> SceneProfile.placements
        -> scene-logic/resolveRuntimePlacements
        -> scene-logic/composeField
           -> EngineFieldItem[]
              -> runtime/engine/loop sorted item list
              -> render/passes/shape/items.ts
```

## Contracts

External lookup:

```ts
SHAPE_PLACEMENTS: Record<SceneLookupKey, ScenePlacementRules>
```

Spec schema:

```ts
ScenePlacementRules = Partial<Record<ShapeName, ShapePlacementRule>> & {
  proceduralZones?: ProceduralZonePlacementPreset
}

ShapePlacementRule {
  count?
  zones?
  anchors?
  points?
  center?
}
```

Lookup structures:

```txt
quota anchors  named authored density presets reused by shape rules
points         exact authored grid locations
center         one featured shape centered by footprint
zones          procedural distribution regions
proceduralZones grouped multi-shape distribution zones
```

Rule: placement rules author intent. Scene logic turns them into concrete `EngineFieldItem[]`; runtime only sorts and draws those items.
