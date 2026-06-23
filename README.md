# Butterfly Effect

A runtime-heavy sustainability app where survey answers shape an animated Canvas2D world and a shared WebGL results graph.

[Live site](https://butterflyeff3ct.online/)

## What The Product Does

Butterfly Effect lets people answer a short sustainability questionnaire, then turns those responses into visual feedback:

- the onboarding canvas reacts to answer averages while the questionnaire is in progress
- completed submissions are persisted through a backend write boundary
- the shared graph view renders community results as interactive Three.js sprites
- logs and widgets expose aggregate scores, rankings, and question-level trends

The product goal is simple: make sustainability data feel immediate, visual, and inspectable without turning the interface into a dashboard-only experience.

## Why The Architecture Exists

The app has two rendering jobs with different constraints.

The onboarding experience needs an authored animated world. It uses a custom Canvas2D engine with scene rules, placement rules, particle modifiers, fog, lighting, and shape drawers. This keeps the visual system editable while avoiding hardcoded one-off canvas scenes.

The results experience needs many crisp, animated representations of Sanity submissions. It uses a sprite pipeline over Three.js/WebGL. The pipeline quantizes visual inputs, reuses cached textures, budgets quality upgrades, and caps visible rows so desktop and mobile stay within memory limits.

React owns product state and UI transitions. The canvas engine and graph runtime receive explicit signals and prepared scene data instead of reading app intent directly.

## System Overview

```txt
React app state
  -> onboarding, navigation, preferences, session state

Canvas engine
  -> scene rules
  -> field composition
  -> render loop
  -> Canvas2D shape drawers

Graph runtime
  -> Sanity rows
  -> visible row budget
  -> sprite texture cache
  -> Three.js scene

Backend/data
  -> Express write API
  -> Express read API
  -> server Sanity upstream reads/writes
  -> validation and mock fallback paths
```

## Key Folders To Inspect

| Path | What It Owns |
| --- | --- |
| `app/src/app` | App providers, session state, runtime signals, preferences |
| `app/src/onboarding` | Role flow, questionnaire flow, Canvas Engine information section |
| `app/src/canvas-engine` | Canvas runtime, scene rules, placement, render passes, shape drawers |
| `app/src/canvas-engine/scene-rules` | Authored backgrounds, padding, placement, fog, spotlight slides |
| `app/src/canvas-engine/runtime/render/cache-policy` | Runtime shape bitmap/depth-mask cache policy |
| `app/src/canvas-engine/runtime/engine/loop.ts` | Main Canvas2D frame pipeline |
| `app/src/graph-runtime` | Results graph, dot graph UI, sprite runtime, visible-row shaping |
| `app/src/graph-runtime/sprites` | Sprite texture generation, quality policy, cache/runtime internals |
| `app/src/navigation/bottom/widgets` | Aggregate result widgets and bar graphs |
| `app/src/domain/survey` | Shared survey row types and section groupings used by app and server |
| `app/src/client-api/read-api` | Browser wrappers for same-origin Express read endpoints and mock fallback |
| `app/src/client-api/response-api` | Browser wrappers for same-origin Express write endpoints |
| `app/src/server` | Express API routes, validation, in-memory rate limiting, Sanity upstream access |

## Engineering Highlights

- Built a custom Canvas2D scene engine with multi-canvas hosts, scene profiles, responsive grid projection, authored placement presets, and reusable shape drawers.
- Added scene-rule contracts for backgrounds, canvas padding, fog, placement, spotlight slides, foliage, and ambient particles, with runtime cache policy for shape bitmap/depth-mask reuse.
- Implemented procedural zone placement so authored communities can spawn multiple shape types around shared anchors while respecting horizon bands and occupancy.
- Built a Three.js sprite pipeline with quantized visual inputs, texture caching, quality budgets, visible-row limits, and prioritized personalized sprites.
- Reduced duplicate rendering work by removing stale frozen texture paths and relying on active particle starts plus runtime texture scheduling.
- Added production data boundaries with Express read/write APIs, Sanity upstream access, validation, mock fallback, Sentry, and PostHog.
- Kept performance work tied to real stress cases: mobile sprite ceilings, repeated filter switching, zooming, local session recovery, and jitter/flicker audits.

## Tradeoffs And Decisions

- Canvas2D remains the shape authoring layer because the project depends on direct procedural drawing, small visual variations, and a p-like drawing facade.
- Three.js/WebGL is used where many textured sprites need transforms, zooming, and graph interaction.
- The engine uses explicit scene rules instead of embedding placement and atmosphere logic inside shape files.
- Spotlight slides are authored as presets that compile into normal background, placement, padding, and particle variants. The runtime does not need to understand slides as a product concept.
- Placement communities currently support tile-based radius controls. `radius.shape: "rect"` exists for authored bands; the default ellipse mode remains available for softer clusters.
- The graph runtime caps visible rows rather than rendering every submission. New rows can enter the visible set without forcing all historical rows through the sprite pipeline.

## Setup

```bash
cd app
npm install
npm run dev
```

Run the local API server separately when testing real writes:

```bash
cd app
npm run dev:server
```

Server-only Sanity variables:

```bash
SANITY_READ=...
SANITY_WRITE=...
```

Do not prefix Sanity tokens with `VITE_`; Vite env names are intended for browser-exposed values.

## Verification

```bash
cd app
npm run typecheck
npm run lint:ci
npm run build:all
```

## Reference Docs

- [Canvas runtime](./app/src/canvas-engine/runtime/README.md)
- [Canvas shape drawers](./app/src/canvas-engine/shapes/README.md)
- [Canvas modifiers](./app/src/canvas-engine/modifiers/README.md)
- [Scene rule backgrounds](./app/src/canvas-engine/scene-rules/backgrounds/README.md)
- [Scene rule placement](./app/src/canvas-engine/scene-rules/placement-rules/README.md)
- [Spotlight scene rules](./app/src/canvas-engine/scene-rules/spotlight/README.md)
- [Graph runtime](./app/src/graph-runtime/README.md)
- [Dot graph](./app/src/graph-runtime/dotgraph/README.md)
