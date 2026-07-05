## Graph Runtime
WebGL visualization subsystem for the collective results. It renders after survey completion or in observer mode. Graph Runtime owns per-filter shape visibility, stable deterministic dot placement so new data updates don't trigger a full reshuffle, camera behavior, interaction, sprite texture generation, and WebGL cleanup.

<br>

### Notable Features
- Renders filtered result sets as interactive Three.js sprites.
- Uses deterministic 3D positioning so streamed results can be added without a full graph reshuffle.
- Retains the current user's shape when the active role/section filter includes their submitted role/section.
- Renders after survey completion or in observer mode.
- Uses distance-aware per-shape hitboxes for more reliable pointer and touch interaction.
- Uses Three.js scene/camera data to place tooltips against each sprite's resolved hitbox.
- Converts `scene-canvas` shape drawers into offscreen sprite textures for the WebGL scene.

<br>

### Ownership Per Module
| | |
| :--- | :--- |
| **Page Shell** | Lazy-loads the graph experience and provides the loading fallback |
| **Data Boundary** | Reads survey results and identity state, applies graph limits, preserves the current user's result, and assigns stable dot slots |
| **Graph Context** | Provides capped/slotted graph data and score lookup helpers to the Three.js scene |
| **Canvas Host** | Owns R3F canvas mount, WebGL renderer settings, context-loss handling, visibility pause/resume, and GPU cleanup |
| **Dot Graph Scene** | Composition root that turns visible results into graph points, personalization state, hover state, observer mode, and render layers |
| **Camera Controls** | Distance-based zoom targets, rotation behavior, pixel offsets, activity tracking, and responsive framing |
| **Interaction Layer** | Hover bubble, dismissal, observer delay, observer spotlight, tooltip placement, and hitbox policy |
| **Sprite Pipeline** | Converts graph points into rendered shapes through identity copy, shape selection, texture queue, quality upgrades, cache registry, and disposal |
| **Gamification** | Personalized/general result panels, rank logic, solo/team display, and optional user messages |
| **Debug Tools** | Sprite cache metrics, zoom metrics, context flags, and graph runtime diagnostics |

<br>

### Flow

```txt
graph-runtime/index.tsx
  -> dotgraph/data-boundary.tsx
     -> useSurveyData() + useIdentity()
     -> capped, slotted graph rows
     -> GraphDataProvider
  -> dotgraph/canvas-host.tsx
     -> R3F Canvas / WebGL lifecycle
  -> dotgraph/scene.tsx
     -> graph points, camera, personalization, interactions
     -> ShapesLayer / PersonalizedLayer / GeneralizedLayer
  -> sprites/entry.ts
     -> texture generation and sprite rendering
```

<br>

### Sprite Path

```txt
survey row average / identity
  -> resolveSpriteVisual(...)
  -> scene-canvas shape drawer
  -> offscreen Canvas2D surface
  -> Three.js CanvasTexture
  -> SpriteShape in the R3F scene
```

<br>

### Boundaries

Graph Runtime owns filter-specific visibility, layout, interaction, sprite rendering, and WebGL lifecycle.

It doesn't own Sanity reads/writes, SSE connection logic, response validation, or survey form submission. Those belong to app state, client API, and server layers.

<br>

### Navigation

- [Graph Page](index.tsx)
- [Data Boundary](dotgraph/data-boundary.tsx)
- [Canvas Host](dotgraph/canvas-host.tsx)
- [Dot Graph Scene](dotgraph/scene.tsx)
- [Sprite Entry](sprites/entry.ts)
- [Gamification](gamification)
