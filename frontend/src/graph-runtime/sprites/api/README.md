# Sprite API

Sprite API is the public policy layer for graph sprites. It exposes shape choice, visual layout, prewarm, lifecycle, quality, theme, identity, and disposal without exposing texture caches or runtime internals.

## Important Files

- `visual.ts` - `resolveSpriteVisual`, stable assignment, and hitbox/anchor layout. Upstream: dotgraph layers.
- `shapeProfiles.ts` - per-shape lookup table for footprint, bleed, hitbox padding, scale, anchor bias, and particle participation.
- `prewarm.ts` - likely texture prebuild requests.
- `dispose.ts` - tracked texture disposal.
- `lifecycle.ts` - generation bumps and queue reset hooks.
- `theme.ts` - theme invalidation helpers.
- `quality.ts` - responsive texture quality helpers.
- `identity.ts` - sprite assignment to user-facing labels/copy.

## Call Tree

```txt
dotgraph layer
  -> sprites/entry.ts
     -> resolveSpriteVisual(...)
        -> stable assignment from spritePolicy
        -> SHAPE_PROFILES lookup
        -> SpriteVisual.layout

     -> SpriteShape
        -> texture runtime
           -> texture cache hit: reuse Three texture
           -> texture cache miss: draw canvas-engine shape into texture
```

Prewarm/lifecycle path:

```txt
graph view opens or switches
  -> prewarmSpriteTextures(...)
  -> bumpGeneration()
  -> resetQueue()
  -> disposeAllSpriteTextures() on teardown when needed
```

## Contracts

Public entry:

```ts
import {
  SpriteShape,
  resolveSpriteVisual,
  prewarmSpriteTextures,
  disposeAllSpriteTextures,
  bumpGeneration,
  resetQueue,
} from "../sprites/entry";
```

Visual contract:

```ts
SpriteVisual {
  shape
  assignment
  layout: {
    scale
    center
    visualOffset
    tileWorld
    footprint
    boundsPadding
    tooltipBiasY
  }
}
```

Lookup table schema:

```ts
SHAPE_PROFILES: Record<ShapeKey, {
  footprint
  bleed?
  interactionBounds?
  visualScale?
  anchorBiasY?
  tooltipAnchorBiasY?
  interactionPadding?
  interactionScale?
  particles?
}>
```

Rule: `bleed` protects texture clipping only. Hitboxes come from `interactionPadding`, `interactionScale`, and dotgraph's `hitboxDistancePolicy`.
