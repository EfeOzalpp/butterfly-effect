## Scene Canvas

Canvas2D subsystem for the app's 2.5D city scenes. It owns the React host for mounting canvas instances, authored scene profiles selected by host id, placement composition, and the runtime that turns scene items into layered canvas draw calls.

<br>

### Notable Features

- Resolves scene profiles from lookup keys like `start`, `questionnaire`, `city`, and `spotlight`.
- Converts authored placement rules into runtime `EngineFieldItem[]`.
- Draws backgrounds, atmosphere, foliage, particles, lights, shapes, and depth overlays through explicit render passes.
- Coordinates active canvas instances through one shared `requestAnimationFrame` scheduler.
- Exposes shape drawers that `graph-runtime` reuses for offscreen sprite texture generation.

<br>

### Architecture
| | |
| :--- | :--- |
| **Engine Host** | React boundary that selects a host definition, starts/stops runtime, sends live inputs, and wires shape pointer callbacks |
| **Host Definitions** | Mount ids, scene keys, DPR policy, FPS caps, canvas bounds, z-index, and cross-canvas stop behavior |
| **Scene Rules** | Authored profiles for padding, placement rules, backgrounds, fog, foliage, ambient particles, and render-cache policy |
| **Scene Logic** | Resolves runtime placements and authored light sources, then composes field items for the renderer |
| **Grid Layout** | Perspective grid metrics, occupancy, forbidden cells, row sizing, and viewport-coordinate helpers |
| **Runtime Engine** | Canvas lifecycle, resize handling, mutable controls, field/style/input state, scheduler registration, and cleanup |
| **Render Passes** | Layered draw path for background, atmosphere, foliage, particles, lighting, shapes, and depth |
| **Shape Adapter** | Registry boundary that maps field item shape names to authored Canvas2D draw functions |
| **Modifiers** | Reusable helpers for transforms, color, particles, lighting, projection, appear/select/hover effects |

<br>

### Flow

```txt
EngineHost
  -> HOST_DEFS[id]
  -> useCanvasEngine()
     -> startCanvasEngine()
     -> shared frame scheduler
  -> useSceneField()
     -> scene-rules profile
     -> scene-logic placement composition
     -> EngineControls.setSceneProfile / setFieldItems / setFieldStyle
  -> runtime/engine/loop.ts
     -> render passes
```

<br>

### Architectural Drift

This subsystem still carries some architectural drift from the limitations of the initial iteration:

- `runtime/engine/loop.ts` knows too much. It coordinates layout, cache state, render-pass sequencing, interaction effects, and shape dispatch in one hot frame path.
- `runtime/` mixes engine lifecycle/control code with detailed renderer implementation, so orchestration and drawing policy aren't as separated as they could be.
- `shapes/` mixes authored shape identity with Canvas2D-specific draw behavior. A stricter split between declarative shape definitions and renderer-specific drawers would make reuse easier.

The current structure keeps React/app state away from the Canvas2D hot path, but future work would move more rendering policy out of the main loop and make shape definitions less coupled to the Canvas2D renderer.

<br>

### Navigation

- [EngineHost.tsx](EngineHost.tsx)
- [Host Definitions](multi-canvas-setup)
- [Scene Rules](scene-rules)
- [Scene Logic](scene-logic)
- [Runtime Engine](runtime)
- [Render Passes](runtime/render/passes)
- [Shapes](shapes)
