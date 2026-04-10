# Repo Map

## Root
- `frontend/`: React app (UI, survey, canvas engine, graph runtime).
- `sanity/`: CMS content schema and backend project setup.
- `supabase/`: edge functions and local Supabase project config.
- `screenshots+gifs/`: portfolio/demo visuals.
- `documentation/`: architecture and engineering docs (renamed from `docs/`).

## Frontend Source Map
- `src/app/`
  - `appState.tsx`: app-wide state provider.
  - `types.ts`: shared app state types.
  - `session.ts`: session/theme persistence helpers.
- `src/styles/`
  - consolidated style entry points and theme variables.
- `src/navigation/`
  - navigation controls and view toggles.
- `src/onboarding/`
  - onboarding flow, questionnaire, role/section selection.
- `src/canvas-engine/`
  - 2D renderer and placement system.
  - `adjustable-rules/`: padding, pools, placement, backgrounds.
  - `runtime/`: engine loop, lifecycle, render primitives.
- `src/graph-runtime/`
  - 3D visualization + overlays.
  - `dotgraph/`: scene interactions and tie/rank logic.
  - `sprites/`: texture generation and cache/queue management.

## Current Cleanup Decisions
- Removed legacy generated tree/import dump files from `frontend/src`.
- Consolidated reusable app state types and persistence logic.
- Moved dotgraph logic toward smaller modules/hooks/components.
