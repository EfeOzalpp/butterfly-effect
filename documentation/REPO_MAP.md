# Repo Map

## Root
- `frontend/`: React app (UI, survey, canvas engine, graph runtime).
- `sanity/`: CMS content schema and backend project setup.
- `supabase/`: edge functions and local Supabase project config.
- `screenshots+gifs/`: portfolio/demo visuals.
- `documentation/`: architecture and engineering docs.

## Frontend Source Map
- `src/index.tsx`
  - frontend entrypoint.
- `src/app/`
  - `main.tsx`: app shell, zoom policy, high-level mounting.
  - `store.tsx`: top-level provider composition.
  - `session.ts` / `types.ts`: persistence helpers and shared app types.
  - `state/`: canvas, UI, identity, preferences, and survey data contexts/state hooks.
- `src/assets/`
  - fonts, lottie assets, and shared SVG icon components.
- `src/canvas-instances/`
  - host entrypoints for onboarding and city canvases.
- `src/styles/`
  - consolidated style entry points and theme variables.
- `src/navigation/`
  - top/bottom/side navigation controls and mode/theme toggles.
- `src/onboarding/`
  - onboarding flow, questionnaire, role/section selection.
  - `questionnaire/`: button-input and weight-input questionnaire variants.
- `src/canvas-engine/`
  - 2D renderer and placement system.
  - `adjustable-rules/`: padding, pools, placement, backgrounds.
  - `hooks/`: engine lifecycle and scene recomposition hooks.
  - `runtime/`: engine loop, lifecycle, render primitives.
  - `scene-logic/`: deterministic placement, constraints, and scoring.
- `src/graph-runtime/`
  - 3D visualization + overlays.
  - `bargraph/`, `dotgraph/`, `gamification/`: visualization layers and overlays.
  - `sprites/`: texture generation and cache/queue management.
- `src/lib/`
  - shared hooks and utility helpers.
- `src/services/`
  - Sanity fetch/save clients and data normalization helpers.

## Current Cleanup Decisions
- Removed legacy generated tree/import dump files from `frontend/src`.
- Consolidated reusable app state types and persistence logic.
- Moved dotgraph logic toward smaller modules/hooks/components.
