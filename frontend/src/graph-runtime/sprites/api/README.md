# Sprite API

This folder is the public policy layer for graph sprites. It answers questions
dotgraph needs without exposing texture caches, queue scheduling, or the React
sprite internals.

Main public entry:

```ts
import {
  SpriteShape,
  resolveSpriteVisual,
  prewarmSpriteTextures,
  disposeAllSpriteTextures,
} from "../sprites/entry";
```

Dotgraph should normally import from `sprites/entry.ts`, not from files in this
folder directly. The files here define the API that `entry.ts` re-exports.

## Shape Profiles

`shapeProfiles.ts` owns per-shape facts:

```ts
car: {
  footprint: { w: 1, h: 1 },
  visualScale: 0.86,
  anchorBiasY: -0.14,
}
```

Use this file when tuning the object itself:

```txt
footprint
  The intended art footprint in tile units. This controls aspect ratio and the
  base hitbox shape.

bleed
  Extra transparent texture room around the drawing. This is visual-only and
  exists to prevent particle trails, shadows, or oversized drawing details from
  clipping. Bleed must not make the interaction hitbox larger.

interactionPadding
  Default hitbox padding in footprint tile units. Positive values grow the
  hover/click region; negative values shrink it. This is the shape's baseline
  interaction shape before dotgraph applies camera-distance behavior. Each side
  can be a number or `[far, near]`, where far is used around 50 world units from
  the camera and near is used around 1 world unit from the camera.

interactionScale
  Uniformly scales the baseline hitbox without changing the rendered art. Use
  this for shapes whose clickable area should be generally smaller or larger.

visualScale
  Shape-level art-direction scale. Use this when a sprite's drawing reads too
  large or too small compared with other sprites.

anchorBiasY
  Visual centering correction for shapes whose natural center differs from the
  footprint center. This affects the rendered sprite anchor.

tooltipAnchorBiasY
  Extra tooltip anchor nudge when a shape's perceived visual center needs a
  small correction. Prefer fixing footprint/padding first.

particles
  Particle participation and optional per-device pixel scale boosts.
```

The important split:

```txt
bleed              visual texture safety only
interactionPadding baseline hitbox shape
hitboxDistancePolicy camera-distance scene behavior
```

If a hitbox looks wrong after rotation, do not fix it with bleed. Fix the
interaction padding or the dotgraph distance policy.

## Visual Layout

`visual.ts` resolves the sprite contract dotgraph consumes:

```txt
shape assignment -> profile lookup -> visual layout
```

The returned layout includes:

```txt
scale
  Hitbox plane size in Three.js world units.

center
  Three.Sprite center correction. This keeps asymmetric padding and anchor bias
  from moving the shape's semantic world position.

tileWorld
  World-unit size of one footprint tile after base scale and visual scale.

footprint / boundsPadding
  The shape facts used by tooltip and hitbox policy code.

tooltipBiasY
  World-space tooltip nudge derived from the profile.
```

`resolveSpriteVisual()` also handles stable shape assignment. Callers should pass
the same `entryId`, `sectionKey`, `seed`, and `orderIndex` they use to render
`SpriteShape`, otherwise a tooltip or hitbox can describe a different assigned
shape than the visible sprite.

## Identity

`identity.ts` turns a sprite assignment into user-facing copy:

```txt
shape assignment -> rendered kind -> label/copy
```

This is intentionally separate from `shapeProfiles.ts`. Profiles describe
geometry and rendering facts; identity describes what the sprite means in UI
copy.

## Lifecycle And Quality

`prewarm.ts`, `dispose.ts`, `lifecycle.ts`, `quality.ts`, and `theme.ts` are
small public operations over the internal sprite runtime:

```txt
prewarm    build likely textures before sprites mount
dispose    release tracked sprite textures
lifecycle  generation bumps for runtime refreshes
quality    responsive texture quality helpers
theme      theme invalidation helpers
```

Keep cache and queue mechanics in `sprites/internal` or `sprites/textures`.
The API folder should describe what the rest of graph-runtime can ask for, not
how textures are built.
