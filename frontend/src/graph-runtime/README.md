# Graph Runtime

Graph runtime owns the shared-results visualization: it receives normalized survey rows, gates the visible graph dataset, renders the Three.js dot scene, and uses generated sprite textures for visual markers.

## Important Files

- `index.tsx` - lazy graph page shell and loading fallback. Upstream: app routing.
- `dotgraph/data-boundary.tsx` - row windowing, personal-row inclusion, dot slot stability, and `GraphDataProvider` boundary. Upstream: app survey/identity state.
- `GraphDataContext.tsx` and `useGraphData.ts` - graph-local data provider/read hook.
- `dotgraph/` - Three.js canvas host, scene composition, camera, interaction, tooltip, and render layers.
- `sprites/` - public sprite API, texture generation/cache, quality/lifecycle controls, and shape profile lookup tables.
- `gamification/` - personalized/general result panels and rank logic.
- `debug/` - graph/sprite diagnostic counters and flags.

## Call Tree

```txt
app route
  -> graph-runtime/index.tsx
     -> lazy dotgraph/data-boundary.tsx
        -> useSurveyData + useIdentity
        -> cap rows by desktop/mobile limit
        -> keep stable dot slots while rows update
        -> reserve personal row when allowed in current scope
        -> GraphDataProvider
           -> dotgraph/canvas-host.tsx
              -> R3F Canvas / WebGL lifecycle
              -> dotgraph/scene.tsx
                 -> scene hooks derive graph model
                 -> camera and interaction hooks
                 -> ShapesLayer / PersonalizedLayer / GeneralizedLayer
                    -> sprites/entry.ts
```

Sprite texture path:

```txt
dotgraph layer
  -> resolveSpriteVisual(...)
  -> SpriteShape
     -> sprite texture cache
        hit: reuse Three texture
        miss: draw canvas-engine shape into texture canvas, track texture
```

## Contracts

External data contract:

```ts
GraphDataProvider {
  data: SurveyRow[]
}
```

Slotted row contract:

```ts
SurveyRow & {
  __dotSlotIndex: number
  __dotSlotCapacity: number
}
```

Public sprite boundary:

```ts
import {
  SpriteShape,
  resolveSpriteVisual,
  prewarmSpriteTextures,
  disposeAllSpriteTextures,
} from "./sprites/entry";
```

Rule: graph-runtime should not know Sanity fetch/retry details. It consumes normalized rows and owns graph-specific visibility, layout, interaction, and sprite rendering.
