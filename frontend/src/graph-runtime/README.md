# Graph Runtime

This folder owns the shared-results visualization. It turns survey rows into graph data, renders the Three.js scene, and uses generated sprite textures for the visual markers.

Main flow:

```txt
app/state/useSurveyDataState
  -> graph-runtime/index.tsx
  -> GraphDataProvider
  -> dotgraph/canvas-host.tsx
  -> dotgraph/dot-graph.tsx
  -> sprites/entry.ts
```

## Folder Ownership

```txt
bargraph/
  Compact numeric view for shared results.

dotgraph/
  Three.js graph scene, camera/orbit behavior, personalized layers, hover state,
  and point placement.

gamification/
  Rank, relative/absolute copy, and personalized result panels.

sprites/
  Texture-backed visual markers used by dotgraph. This hides canvas texture
  generation, caching, prewarm, lifecycle, and theme handling.

GraphDataContext.tsx
  Local graph data provider. Keeps graph consumers away from app-level survey
  state shape.

useGraphData.ts
  Read hook for graph data consumers.
```

## Dotgraph Boundary

Dotgraph is split by job:

```txt
canvas-host.tsx
  Browser and canvas host concerns. This is the component exported by dotgraph.

dot-graph.tsx
  Scene composition. It wires graph model, camera behavior, layers, and sprites.

camera/
  Orbit, zoom, drag, and responsive offset logic.

interaction/
  Hover bubble, observer delay, and spotlight behavior.

scene/
  Derived graph model: dots, ties, personalization, and scene state.

scope/
  Viewer scope and section scoping.

components/
  Render layers used by the scene.

utils/
  Small graph math helpers with no React state ownership.
```

The important rule: camera and interaction hooks can produce scene inputs, but they should not own the graph data model. Scene hooks derive graph state. Components render the result.

## Sprite Boundary

Dotgraph should import sprites from:

```ts
import { SpriteShape } from "../sprites/entry";
```

`sprites/entry.ts` is the public sprite API. Dotgraph should not reach into `sprites/internal`, `sprites/textures`, or `sprites/cache` unless we intentionally expand the public contract.

Sprite internals are split like this:

```txt
api/
  Public sprite operations: shape component, prewarm, lifecycle, visual policy,
  theme invalidation, and disposal.

selection/
  Maps data values to sprite shape choices and footprint policy.

textures/
  Canvas texture creation, frozen texture generation, queue progress, and
  texture registry.

cache/
  Texture cache and particle cache storage.

internal/
  Runtime policy, scheduling, debug flags, and the low-level sprite component.
```

Sprites may reuse canvas-engine shape drawers and the supported
`canvas-engine/offscreen-shape-surface` bridge to draw those shapes into
caller-owned canvases. They should not import the mounted canvas runtime,
scene-rules, scene-logic, or render-pass cache internals.

## External Contracts

The graph runtime receives normalized survey rows through `GraphDataProvider`. It should not know how Sanity fetches, retries, or falls back to mock data.

The graph runtime uses app UI context only for view-level behavior, such as personalized panel visibility. Data transformation should stay inside graph-runtime or services, not scattered through navigation components.

The sprite runtime talks to browser graphics APIs through Three.js textures and Canvas 2D generation. That low-level work is intentionally hidden from dotgraph.

## Performance Notes

The hot path is camera movement plus sprite rendering. Avoid rebuilding texture work from depth or camera changes unless the visual input actually changed.

Good defaults:

```txt
cache sprite textures by stable visual keys
prewarm likely sprite states
avoid placeholder flashes during camera motion
keep per-frame allocations out of render loops where possible
```

If a change makes camera orbit flicker, inspect sprite texture keys, frozen texture readiness, and any depth-dependent invalidation first.
