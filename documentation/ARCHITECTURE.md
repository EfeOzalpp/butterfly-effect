# Architecture Overview

## High-Level Flow
1. User interacts with survey buttons (sliders are unmounted) and section/role pickers.
2. Survey logic computes live values (`liveAvg`, `condAvgs`) and commit values (`allocAvg`).
3. `AppState` publishes these values globally.
4. Canvas engine composes a field layout from rulesets and renders 2D shapes.
5. Graph runtime renders interactive 3D visualization using generated/queued textures.

## Main Runtime Boundaries
- `frontend/src/app`
  - Global state, session persistence, app shell orchestration.
- `frontend/src/onboarding`
  - Question flow, questionnaire UI, section/role pickers, commit events.
- `frontend/src/canvas-engine`
  - Deterministic 2D placement/render pipeline.
  - Rulesets in `adjustable-rules/`.
  - Lifecycle/runtime loop in `runtime/`.
- `frontend/src/graph-runtime`
  - Dot graph + bar graph + gamification overlays.
  - Sprite generation and texture queueing.
- `frontend/src/navigation`
  - Top navigation and mode/theme controls.
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
