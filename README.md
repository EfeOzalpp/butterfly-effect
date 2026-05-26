# Butterfly Effect

A sustainability platform where questionnaire responses shape individual and shared visualizations.

[Live site](https://butterflyeff3ct.online/) | [Canvas engine docs](./documentation/CANVAS_ENGINE.md) | [Data flow](./documentation/DATA_FLOW.md) | [App state](./documentation/APP_STATE.md)

Built with React, TypeScript, Vite, Canvas 2D, Three.js/WebGL, Sanity, Supabase Edge Functions, Sentry, and PostHog.

## What This Is

Butterfly Effect is a React/TypeScript app that turns sustainability survey input into a live visual system. During onboarding, responses drive a custom Canvas 2D scene. After submission, the app moves into a shared results view powered by Sanity data and a WebGL visualization layer.

The project is built as an application first, but its canvas runtime is structured like an engine: scene rules, responsive grid placement, shape drawers, particles, fog, lighting, runtime controls, and render-loop scheduling live behind a dedicated `canvas-engine` boundary.

## Architecture

| Area | Responsibility |
| --- | --- |
| `src/app` | App state, session persistence, UI mode, survey data, and shared context providers |
| `src/canvas-engine` | Canvas scene runtime, layout rules, placement, shape drawing, modifiers, particles, and animation loop |
| `src/onboarding` | Role/section selection and questionnaire flow |
| `src/services/sanity` | Sanity reads, live subscription, polling fallback, and mock-data fallback |
| `src/graph-runtime` | Shared results visualization, scoring, sprite textures, WebGL scene, and interaction |
| `supabase/functions` | Backend write boundary for saving responses without exposing the Sanity write token |

## Engineering Notes

- Custom Canvas 2D scene engine with responsive placement and deterministic shape variation.
- `liveAvg` drives both immediate canvas feedback and scene composition.
- Runtime render loop uses cached ordering and scratch structures to reduce frame-loop allocation.
- Canvas DPR is capped for the heavy onboarding scene to reduce pixel workload on high-density displays.
- Sanity integration uses live updates with polling and mock-data fallbacks.
- Supabase Edge Function keeps the Sanity write token out of the browser and validates submitted payloads.
- Sentry and PostHog provide production error reporting and product analytics.
- The app is being migrated toward stricter TypeScript, linting, and test coverage.

## Key Entry Points

- [App provider](./frontend/src/app/app-provider.tsx)
- [Canvas host bridge](./frontend/src/canvas-engine/EngineHost.tsx)
- [Canvas runtime](./frontend/src/canvas-engine/runtime/index.ts)
- [Canvas render loop](./frontend/src/canvas-engine/runtime/engine/loop.ts)
- [Scene composition](./frontend/src/canvas-engine/scene-logic)
- [Graph runtime](./frontend/src/graph-runtime)
- [Sanity service layer](./frontend/src/services/sanity)

## Run Locally

```bash
cd frontend
npm install
npm run dev
```

Current checks for the cleaned app/canvas-engine path:

```bash
npm run build
npm run lint -- src/app src/canvas-engine
```

## Project Status

This is an active app and engine cleanup. The canvas-engine and app layers have been through a stricter TypeScript/ESLint pass; the wider repository is still being tightened, especially around tests and remaining strict TypeScript work outside the canvas-engine boundary.
