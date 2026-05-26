# Butterfly Effect

A production React/TypeScript platform where sustainability survey responses shape a live Canvas 2D scene and a shared WebGL results view.

[Live site](https://butterflyeff3ct.online/)

## What This Is

Butterfly Effect turns survey input into two connected visual systems:

- an onboarding canvas scene where answers change the environment in real time
- a shared results view powered by Sanity data and a WebGL graph runtime

The app is product-facing and runtime-heavy. The Canvas 2D layer is structured as an engine with scene rules, responsive grid placement, shape drawers, render caches, particles, fog, lighting, lifecycle controls, and a dedicated render loop.

## Stack

| Area | Tools |
| --- | --- |
| App | React, TypeScript, Vite |
| Rendering | Canvas 2D, Three.js/WebGL |
| Data and backend | Sanity, Supabase Edge Functions, PostgreSQL |
| Production tooling | Sentry, PostHog, GitHub Actions, ESLint |

## Architecture

| Area | Responsibility |
| --- | --- |
| `frontend/src/app` | App state, session persistence, UI mode, survey data, and shared context providers |
| `frontend/src/canvas-engine` | Canvas scene runtime, layout rules, placement, shape drawing, modifiers, particles, and animation loop |
| `frontend/src/onboarding` | Role/section selection and questionnaire flow |
| `frontend/src/services/sanity` | Sanity reads, live subscription, polling fallback, and mock-data fallback |
| `frontend/src/graph-runtime` | Shared results visualization, scoring, sprite textures, WebGL scene, and interaction |
| `supabase/functions` | Backend write boundary for saving responses without exposing the Sanity write token |

## Engineering Notes

- Custom Canvas 2D scene engine with responsive placement and deterministic shape variation.
- `liveAvg` drives both immediate canvas feedback and scene composition.
- Runtime render loop uses cached ordering and scratch structures to reduce frame-loop allocation.
- Canvas DPR is capped for the heavy onboarding scene to reduce pixel workload on high-density displays.
- Sanity integration uses live updates with polling and mock-data fallbacks.
- Supabase Edge Function keeps the Sanity write token out of the browser and validates submitted payloads.
- Sentry and PostHog provide production error reporting and product analytics.
- TypeScript, ESLint, and Vite production builds are part of the local verification flow.

## Useful Paths

- [App provider](./frontend/src/app/app-provider.tsx)
- [Canvas host bridge](./frontend/src/canvas-engine/EngineHost.tsx)
- [Canvas runtime](./frontend/src/canvas-engine/runtime/index.ts)
- [Canvas render loop](./frontend/src/canvas-engine/runtime/engine/loop.ts)
- [Scene composition](./frontend/src/canvas-engine/scene-logic)
- [Graph runtime](./frontend/src/graph-runtime)
- [Sanity service layer](./frontend/src/services/sanity)
- [Supabase save function](./supabase/functions/save-user-response/index.ts)

## Reference Docs

- [Canvas engine](./documentation/CANVAS_ENGINE.md)
- [Graph runtime](./documentation/GRAPH_RUNTIME.md)
- [App state](./documentation/APP_STATE.md)

## Run Locally

```bash
cd frontend
npm install
npm run dev
```

## Verify

```bash
npm run typecheck
npm run lint
npm run build
```
