# Dotgraph

Dotgraph is the Three.js shared-results scene. It owns camera behavior, point
placement, interaction, tooltip anchoring, personalized presentation, and the
render layers that combine those systems.

Main flow:

```txt
data-boundary.tsx
  -> GraphDataProvider
  -> canvas-host.tsx
  -> scene.tsx
  -> scene/useDotGraphSceneState.ts
  -> interaction/*
  -> components/ShapesLayer.tsx
  -> components/GeneralizedLayer.tsx
  -> components/PersonalizedLayer.tsx
```

## Folder Map

```txt
data-boundary.tsx
  Data adapter for this graph. It owns visible-row limits, live-row windowing,
  personal-row inclusion, and the GraphDataProvider boundary before the Three.js
  canvas sees data.

canvas-host.tsx
  R3F Canvas and WebGL lifecycle. It owns renderer options, mount/unmount gates,
  context loss handling, DPR, and GPU cleanup.

scene.tsx
  Scene composition. It connects shared graph data, scene hooks, camera hooks,
  interaction hooks, and render layers.

camera/
  Orbit, drag, zoom, responsive tooltip offset, and camera reset behavior.

components/
  Render layers. These should render prepared scene state instead of deriving
  graph data from scratch.

interaction/
  Hover bubble, observer delay, spotlight, hover dismissal, and hitbox distance
  policy.

scene/
  Derived graph state: point positions, personalization state, scene scale,
  zoom reset keys, and texture prewarm inputs.

tooltip/
  Tooltip placement classes and Three.js center-anchor event helpers.

utils/
  Math helpers for point generation and small scene calculations.
```

`scene.tsx` is the scene composition root. It wires shared graph data
into scene hooks, passes explicit props to render layers, and keeps dataset
switches from leaving stale hover/camera/texture state behind.

`data-boundary.tsx` sits above it so row-budget policy does not leak into
the page shell or the WebGL host.

When live Sanity rows exceed the desktop/mobile cap, new row ids enter the
visible window at the front and the tail of the current visible list is evicted.
Existing row id updates are treated as updates, not new dots. If the personal
row must be reserved outside the cap, it is inserted at the tail so the newest
Sanity row keeps the first visible slot.

Placement order is separate from data order. `data-boundary.tsx` attaches a
private dot slot index to each visible row. Existing row ids keep their slot
while visible; incoming row ids receive the next available stable slot, or the
slot freed by the evicted tail row at max capacity.

## Sprite Boundary

Dotgraph does not own what a sprite is. It asks the sprite API for that:

```ts
const sprite = resolveSpriteVisual({
  entryId,
  sectionKey,
  avg,
  seed,
  orderIndex,
  baseScale,
});
```

The returned `layout` is the contract for hitboxes and tooltips. Dotgraph can
use the layout, but per-shape visual facts belong in:

```txt
sprites/api/shapeProfiles.ts
```

Scene-specific interaction behavior belongs here:

```txt
dotgraph/interaction/hitboxDistancePolicy.ts
```

That split matters. Sprite profiles define the object; dotgraph policies define
how the object behaves in this camera scene.

## Hitboxes

`ShapesLayer.tsx` renders an invisible Three.js `Sprite` as the hover/click
plane for each visible shape. While debugging, that material may be temporarily
colored so the interaction plane is visible.

Hitbox size comes from three layers:

```txt
shapeProfiles.interactionPadding
  Baseline per-shape hitbox shape.

hitboxDistancePolicy.ts
  Scene interaction scaling. This includes device-level touch target
  enlargement and optional camera-distance shrinking/cropping.
```

Bleed is not part of hitbox math. Bleed only protects the texture from visual
clipping.

## Tooltip Anchoring

Tooltips should enter through `tooltip/hoverEvent.ts`.

```txt
shape center in world space
  -> compute placement from projected center
  -> resolve hitbox center offset from SpriteVisualLayout
  -> create hover event with anchorPosition, tooltipLayout, tooltipPlacement
  -> GeneralizedLayer renders Html at the hitbox center anchor
```

The Three.js anchor is based on the resolved hitbox center, not on tooltip
orientation. This keeps rotation, zoom, and asymmetric hitboxes predictable.
Tooltip orientation still exists, but it only chooses CSS classes and dynamic
offset values.

There are two entry paths that must stay aligned:

```txt
pointer hover/click
  ShapesLayer -> makeCenteredTooltipEvent

observer spotlight
  useObserverSpotlight -> resolveSpriteVisual -> hitboxDistancePolicy
  -> makeCenteredTooltipEvent
```

If one path changes, update the other or move the behavior into the shared
tooltip helper.

`GeneralizedLayer` applies the anchor once in `useLayoutEffect` and then keeps
it updated in `useFrame`. The layout effect prevents the tooltip from mounting
at the raw dot center for one frame before moving to the resolved hitbox center.

## Camera And Dataset Switches

The first camera radius is derived from graph scale and shape count. Graph view
switches use a `graphViewKey` so graph picker changes reset the right scene
state:

```txt
bump sprite generation
reset texture queue
clear hover
reset zoom target
```

This prevents stale camera zoom targets, stale hover anchors, and obsolete
texture work from leaking between graph views.

Live Sanity updates are intentionally not camera reset events. The first zoom
target is computed from the row count when a graph view opens or the graph
picker changes section; later row appends should update dots without snapping
the user's current zoom.

## Dot Placement

Dot positions use an even seeded sphere distribution. The current baseline is
intentionally simple: every dot starts from the same spherical spacing algorithm,
then render layers handle sprite scale, hitboxes, hover, and personalization.

The personalized path clears the center and first-open camera corridor after
base sphere placement. Tune spherical spacing in `utils/positions.ts`; tune
scene spread and seed choices in `scene/useDotGraphSceneState.ts`.

## Personalized Path

The personalized shape has two possible render modes:

```txt
in-dataset personalized sprite
  Rendered in ShapesLayer and centered at the semantic dot position.

extra personalized sprite
  Rendered by PersonalizedLayer when the user's result needs a dedicated visual
  even if the graph distribution path is different.
```

When centering a personalized sprite, prefer sprite center correction over
moving the world position. Moving the world position makes rotation reveal the
offset.

## Practical Debugging

When a tooltip or hitbox is wrong, check in this order:

```txt
1. shapeProfiles footprint / interactionPadding
2. visual.ts resolved layout scale and center
3. hitboxDistancePolicy runtime scale and center
4. hoverEvent.ts center-anchor event fields
5. GeneralizedLayer anchor update
6. CSS orientation offsets in gamification.css
```

If rotation breaks alignment but zoom does not, suspect world-space anchoring or
sprite center math before suspecting CSS.
