# Dotgraph

Dotgraph owns the Three.js shared-results scene: WebGL host lifecycle, derived graph model, camera/orbit behavior, hover/tooltip interaction, personalized presentation, and render layers.

## Important Files

- `data-boundary.tsx` - graph data adapter, visible-row cap, stable dot slots, personal-row inclusion. Upstream: app survey/identity state.
- `canvas-host.tsx` - R3F Canvas, renderer options, DPR, context-loss handling, and GPU cleanup.
- `scene.tsx` - scene composition root. Upstream: `GraphDataContext`; downstream: scene hooks, camera hooks, interaction hooks, and layers.
- `scene/` - derived graph model, personalization state/gate, dot points, and texture prewarm inputs.
- `camera/` - orbit, drag, zoom, responsive offsets, and camera reset behavior.
- `interaction/` - hover bubble, hover dismissal, observer spotlight, delay, and hitbox distance policy.
- `components/` - `ShapesLayer`, `PersonalizedLayer`, and `GeneralizedLayer`.
- `tooltip/` - projected center anchoring, tooltip placement, and hitbox CSS helpers.
- `scope/` and `utils/` - section scoping and graph math helpers.

## Call Tree

```txt
data-boundary.tsx
  -> GraphDataProvider(cappedData)
     -> canvas-host.tsx
        -> <Canvas>
           -> scene.tsx
              -> useSharedGraphData
              -> usePersonalizationGate
              -> useDotGraphSceneState
              -> usePersonalizationState
              -> useHoverBubble / useObserverSpotlight / useHoverDismissal
              -> ShapesLayer
              -> PersonalizedLayer
              -> GeneralizedLayer
```

Tooltip path:

```txt
pointer hover or observer spotlight
  -> resolveSpriteVisual
  -> hitboxDistancePolicy
  -> tooltip/hoverEvent creates centered anchor
  -> GeneralizedLayer renders Html at resolved hitbox center
```

Dataset switch path:

```txt
graphViewKey changes
  -> bump sprite generation
  -> reset texture queue
  -> clear hover
  -> reset zoom target
```

## Contracts

Data boundary contract:

```txt
desktop cap: 300 rows
mobile cap: 150 rows
existing row id update: keep slot
incoming row id: gets newest visible slot
personal row: reserved only when allowed by scope
```

Scene layer contract:

```ts
ShapesLayer      renders generalized sprites and hit planes
PersonalizedLayer renders personal sprite/panel path
GeneralizedLayer renders hover tooltip Html
```

Sprite interaction contract:

```txt
shapeProfiles      object footprint and baseline interaction padding
hitboxDistancePolicy camera/device interaction scaling
tooltip/hoverEvent shared anchor event fields
```

Rule: camera and interaction hooks may produce scene inputs, but they should not own graph data. Scene hooks derive state; components render prepared state.
