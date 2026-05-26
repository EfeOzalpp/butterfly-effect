# Canvas Engine - Onboarding Scene

Custom 2D canvas renderer. `liveAvg` drives both real-time visuals and scene composition.

```mermaid
flowchart TD

    subgraph Signals ["Input Signals (from CanvasRuntimeCtx)"]
        LiveAvg["Live Average\nUpdates on every survey interaction\nRange: 0-1"]
        LiveAvg_note["(app/state/useCanvasRuntimeState.ts)"]
    end

    subgraph ReactLayer ["React Layer"]
        CanvasEntry["Canvas Mount Point\nPulls signals from context\nOwns the canvas DOM element"]
        CanvasEntry_note["(canvas-instances/OnboardingEntry.tsx)"]

        EngineHost["Engine Bridge\nReceives signals\ndecides scene mode\nOrchestrates layout + render"]
        EngineHost_note["(canvas-engine/EngineHost.tsx)"]

        CanvasEntry --> EngineHost
    end

    subgraph LayoutLayer ["Layout Layer"]
        SceneResolver["Scene Rule Resolver\nPicks rule profile for current mode\nstart, questionnaire, city"]
        SceneResolver_note["(canvas-engine/scene-state.ts)\n(canvas-engine/scene-rules/resolver.ts)\n(canvas-engine/scene-rules/registry.ts)"]

        ShapePool["Shape Pool Builder\nUses liveAvg to interpolate shape quotas\nDecides count of each shape type"]
        ShapePool_note["(canvas-engine/scene-logic/composeField.ts)"]

        GridPlacement["Grid Placement\nPositions shapes on canvas grid\nPerspective-scaled row heights"]
        GridPlacement_note["(canvas-engine/scene-logic/place.ts)\n(canvas-engine/grid-layout/)"]

        SceneResolver --> ShapePool --> GridPlacement
    end

    subgraph RenderLayer ["Render Layer (runs every frame)"]
        RenderLoop["Animation Frame Loop\nReads liveAvg each tick\nRuns render passes"]
        RenderLoop_note["(canvas-engine/runtime/engine/loop.ts)\n(canvas-engine/runtime/engine/scheduler.ts)"]

        ShapeDrawers["Shape Draw Functions\nbus, car, house, trees\nclouds, snow, villa, and more"]
        ShapeDrawers_note["(canvas-engine/shapes/)"]

        VisualEffects["Visual Effects\nColor gradients, particles\nlighting, fog"]
        VisualEffects_note["(canvas-engine/modifiers/)"]

        Background["Render Passes\nBackground, atmosphere, light, shape"]
        Background_note["(canvas-engine/runtime/render/passes/)"]

        RenderLoop --> ShapeDrawers --> VisualEffects
        RenderLoop --> Background
    end

    subgraph Engine ["Engine Startup"]
        StartEngine["startCanvasEngine()\nCreates canvas DOM, p facade\nInits render loop, returns EngineControls"]
        StartEngine_note["(canvas-engine/runtime/index.ts)"]
    end

    LiveAvg -->|"real-time -> color & animation"| RenderLoop
    LiveAvg -->|"shape count & types"| ShapePool

    Signals --> ReactLayer
    EngineHost --> SceneResolver
    EngineHost --> StartEngine
    GridPlacement -->|"placed items"| RenderLoop
```
