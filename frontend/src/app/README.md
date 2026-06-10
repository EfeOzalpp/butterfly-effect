# App

App owns the React shell state: provider wiring, view flow, browser policies, persisted identity/preferences, survey row subscription, and global notices.

## Important Files

- `main.tsx` - top-level app composition and visible page shell. Upstream: Vite entry.
- `app-provider.tsx` - creates app-wide context values and cross-slice reset/bootstrap. Upstream: `main.tsx`; downstream: app views, graph runtime, canvas hosts.
- `app-effects.tsx` - browser-only policies, preloaders, and global banners.
- `session.ts` - guarded session/local storage helpers and theme application.
- `notices.ts` - custom event helpers for duplicate-survey and rate-limit notices.
- `useMockBanner.ts` - mock Sanity read fallback banner state.
- `state/*-context.ts` - public app state contracts.
- `state/use*State.ts` - provider-owned state implementations.
- `state/survey-data-utils.ts` - pure survey row transforms and section counts.
- `ui/HintBanner.tsx` - reusable app notice banner.

## Call Tree

```txt
main.tsx
  -> AppProvider
     -> usePreferencesState
     -> useUiState
     -> useCanvasRuntimeState
     -> useIdentityState
     -> useSurveyDataState
        -> subscribeToSurveyData()
           -> services/sanity/api

  -> page/view components
     -> app contexts
     -> canvas-engine EngineHost
     -> graph-runtime VisualizationPage

  -> AppBrowserPolicies / global banners
     -> prevent page zoom outside active canvas/graph zones
     -> preload canvas/gamification modules during idle
     -> show mock read, duplicate survey, and rate-limit notices
```

Reset path:

```txt
UiState.resetToStart()
  -> preserve saved identity keys
  -> close graph/survey/overlays/widgets
  -> reset canvas runtime signals
  -> increment surveyResetKey
  -> remove transient submit/open flags
```

## Contracts

Provider API:

```ts
PreferencesState  darkMode, setDarkMode
UiState           graph/survey/overlay/navigation mode and reset controls
CanvasRuntimeState liveAvg, reservedFootprints, spotlight controls
IdentityState     mySection, myEntryId, myRole
SurveyDataState   section, counts, allRows, filtered rows, loading, local upsert
```

Storage contract:

```txt
sessionStorage primary:
  all app keys written through session.ts

localStorage mirror:
  be.myEntryId
  be.mySection
  be.myRole
  be.myAvg
  be.myDoc
  be.myEditToken
  be.justSubmitted
  be.openPersonalOnNext
```

Notice contract:

```txt
be:duplicate-survey-notice -> DuplicateSurveyBanner
be:rate-limit-notice       -> RateLimitBanner
mock Sanity read fallback  -> MockReadBanner
```

Rule: app state owns product flow and persistence. Data fetching details stay in `services`, canvas rendering stays in `canvas-engine`, and graph layout/rendering stays in `graph-runtime`.
