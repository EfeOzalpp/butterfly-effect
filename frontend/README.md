# Butterfly Effect

Butterfly Effect is a sustainability platform that combines an interactive questionnaire with individual and shared visualizations.

The app has two main visual systems:

```txt
questionnaire canvas
  React flow -> canvas-engine -> Canvas 2D scene

shared results view
  Sanity data -> graph-runtime -> Three.js dotgraph + sprite textures
```

## Stack

```txt
React 18
TypeScript
Vite
Canvas 2D
Three.js / React Three Fiber
Sanity
Supabase Edge Functions
ESLint
```

## App Structure

```txt
src/app
  App providers, app shell, UI state, survey data state, browser policies.

src/onboarding
  Role, section, and questionnaire flow. This owns the user input path.

src/canvas-instances
  React entry points for the questionnaire canvas scenes.

src/canvas-engine
  Canvas 2D runtime, grid placement, scene rules, shape drawing, and modifiers.

src/graph-runtime
  Shared-results visualization. Owns the Three.js graph, sprite texture runtime,
  bar graph, and gamification panels.

src/navigation
  App navigation, graph picker, logs, mode toggle, and right-side controls.

src/services
  External data boundaries, currently Sanity reads/writes and mock read fallback.

src/lib
  Shared hooks and utilities that do not own app state.
```

## Important Boundaries

The app layer should own user flow and state. It should pass resolved state into the canvas and graph systems instead of making those systems read app context directly.

The canvas engine owns the Canvas 2D loop. App code talks to it through `EngineControls`; the loop talks to render helpers; render helpers talk to shapes.

The graph runtime owns the shared-results scene. Dotgraph consumes graph data and sprite APIs. Sprite internals should stay behind `src/graph-runtime/sprites/entry.ts`.

Sanity is treated as an external service boundary. Rows are normalized before the rest of the app consumes them.

## Commands

```bash
npm run dev
npm run build
npm run typecheck
npm run lint
```

`npm run typecheck` runs TypeScript in strict mode. `npm run lint` runs the project ESLint config.

## Notes For Reviewers

This repo is intentionally visual and runtime-heavy. The main engineering work is not only UI composition; it also includes canvas scheduling, render caching, typed scene contracts, graph interaction, and live-data normalization.

The heavier areas are documented separately:

```txt
src/canvas-engine/runtime/README.md
src/canvas-engine/modifiers/README.md
src/graph-runtime/README.md
```
