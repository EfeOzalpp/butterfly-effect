# Canvas Engine - Debug Tools

All tools here are opt-in and have zero cost when disabled. Nothing logs or renders unless you turn it on.

Production builds do not import the placement authoring helper. In dev, `EngineHost`
installs `window.bePlace` after a canvas is ready.

---

## Grid overlay

Draws the placement grid over the canvas so you can see rows, columns, and the used-row boundary.

**Turn on at runtime** (browser console):

```js
// via engine controls, if you have a reference to the engine
engine.controls.current?.setFieldStyle({ debug: { grid: true, gridAlpha: 0.5 } })
```

`gridAlpha` controls opacity of the grid lines (0..1, default `1`).
The used-row boundary is drawn as a separate line at the bottom of the occupied rows.
Forbidden cells (from the padding spec) are shaded.

---

## Placement authoring

`bePlace` is a browser-console helper for drafting procedural placement zones on top of the live canvas.

Useful commands:

```js
bePlace.enable({ shapes: "hide" })
bePlace.use("town", { shapes: { villa: 4, house: 2, trees: 6 } })
bePlace.resize({ tiles: 6, xDistort: 3, yDistort: 0.4 })
bePlace.copy()
```

Interaction shortcuts:

- Click to place a zone center.
- Drag to author the radius visually.
- Shift-drag creates a rectangular radius.
- Ctrl+Z or Backspace undoes the last zone.
- `[` and `]` shrink/grow tiles.
- Arrow keys adjust distort values.
- `R` toggles rect/ellipse radius shape.

`bePlace.copy()` returns a `zones: [...]` snippet for the active host. For `start`
and `questionnaire`, supported shape quotas are emitted as the existing quota
constants.

---

## Depth mask stats

Logs a `console.table` every second showing how the depth mask cache is performing: how many masks were created, reused, baked, trimmed, and skipped.

**Turn on** (browser console, persists across reloads):

```js
localStorage.setItem("be:debug:depth-mask", "1")
// then refresh
```

**Turn off:**

```js
localStorage.removeItem("be:debug:depth-mask")
// then refresh
```

Or for a one-off session without a reload:

```js
window.__BE_DEBUG_DEPTH_MASK = true
```

To stop the one-off session when localStorage is not enabled:

```js
window.__BE_DEBUG_DEPTH_MASK = false
```

### What the columns mean

| Column | Meaning |
|---|---|
| `calls` | Total calls to the depth mask renderer this interval |
| `drawn` | Masks actually composited onto the canvas |
| `created` | New offscreen canvases allocated |
| `baked` | Masks finished rendering and stored in cache |
| `reused` | Cache hits; mask drawn from cache without re-rendering |
| `trimmed` | Stale entries evicted from the cache |
| `skippedUnsupported` | Shape doesn't support depth masks |
| `skippedAppear` | Skipped because shape is mid-appear animation |
| `skippedBlend` | Skipped because the depth tint blend is below the configured threshold |
| `skippedBounds` | Shape was out of canvas bounds |
| `skippedWarmupBudget` | Max bakes per frame reached and no stale mask could be reused |
| `skippedTooLarge` | Shape too large to cache |
| `cachePixels` | Total pixels held in the cache right now |
| `allocatedPixels` | Total pixels allocated this interval |
| `largestMaskPixels` | Largest single mask allocated this interval |

---

## Diagnostics

These fire automatically, no setup needed:

- **`warnUnknownShape`** - `console.warn` in dev when the renderer encounters a shape key with no registered draw function.
- **`reportSchedulerTickError`** - `console.error` when a tick throws, tagged with the engine instance id.
