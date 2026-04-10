# Architecture Overview

## High-Level Flow
1. User interacts with survey buttons (sliders are unmounted) and section/role pickers.
2. Survey logic computes live values (`liveAvg`, `condAvgs`) and commit values (`allocAvg`).
3. `AppProvider` composes app-level contexts from `src/app/store.tsx` and publishes these values globally.
4. Canvas host entries mount the onboarding/city canvases and feed scene signals into the canvas engine.
5. Canvas engine composes a field layout from rulesets and renders 2D shapes.
6. Graph runtime renders interactive 3D visualization using generated/queued textures.
7. Save/fetch boundaries run through `services/sanity` and `supabase/functions`.

## Main Runtime Boundaries
- `frontend/src/app`
  - App shell, provider composition, session persistence, and cross-feature state.
- `frontend/src/onboarding`
  - Question flow, questionnaire UI, section/role pickers, commit events.
- `frontend/src/canvas-instances`
  - React host entrypoints that mount the onboarding and city canvases.
- `frontend/src/canvas-engine`
  - Deterministic 2D placement/render pipeline.
  - Rulesets in `adjustable-rules/`.
  - Lifecycle/runtime loop in `runtime/`.
- `frontend/src/graph-runtime`
  - Dot graph + bar graph + gamification overlays.
  - Sprite generation and texture queueing.
- `frontend/src/navigation`
  - Top navigation and mode/theme controls.
- `frontend/src/services/sanity`
  - CMS-backed reads, normalization, and save calls used by the frontend.
- `supabase/functions`
  - Edge functions for save/submit flows outside the frontend bundle.

## State Contracts (Important)
- `liveAvg`: continuous signal for visual response.
- `allocAvg`: commit-only signal for placement transitions.
- `condAvgs`: per-condition visual signal map.
- `questionnaireOpen` / `sectionOpen`: scene modifiers used by rulesets.

## Technical Notes
- Canvas engine keeps shape IDs stable for deterministic behavior.
- Appear lifecycle now replays when meaningful item changes are detected on update.
- Dot graph has been split into smaller layers/hooks to reduce coupling.
- App state is split by domain under `src/app/state` rather than living in a single monolithic app state module.
