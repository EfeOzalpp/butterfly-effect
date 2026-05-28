# App State Architecture

Six context slices are composed in `AppProvider` and exposed to the app tree.

```mermaid
flowchart TD

    subgraph Provider ["AppProvider (app-provider.tsx)"]

        subgraph Identity ["Identity Context"]
            IC["Who the user is\nmySection, myRole, myEntryId"]
            IC_note["app/state/useIdentityState.ts\napp/state/identity-context.ts"]
        end

        subgraph Preferences ["Preferences Context"]
            PC["Display settings\ndarkMode, mode, navPanelOpen, radarMode"]
            PC_note["app/state/usePreferencesState.ts\napp/state/preferences-context.ts"]
        end

        subgraph UI ["UI Context"]
            UC["Navigation and visibility flags\nvizVisible, questionnaireOpen, cityPanelOpen,\nobserverMode, hasCompletedSurvey,\nquestionnaireNav, logsOpen, widgetsOpen"]
            UC_note["app/state/useUiState.ts\napp/state/ui-context.ts"]
        end

        subgraph Canvas ["Canvas Runtime Context"]
            CC["Canvas engine signals\nliveAvg, reservedFootprints"]
            CC_note["app/state/useCanvasRuntimeState.ts\napp/state/canvas-runtime-context.ts"]
        end

        subgraph SurveyData ["Survey Data Context"]
            SC["Live survey data\nallRows up to 5,000, data up to 300,\ncounts by section, loading state"]
            SC_note["app/state/useSurveyDataState.ts\napp/state/survey-data-context.ts"]
        end

        subgraph Interaction ["Interaction Context"]
            IRC["Cross-feature interaction state\nmenuOpen, spotlightRequest"]
            IRC_note["app/state/interaction-context.ts"]
        end

    end

    Session["session/local storage\nbe.mySection, be.myEntryId, be.myRole,\nbe.myDoc, be.myEditToken,\nbe.darkMode, be.mode, be.radarMode"]
    Session_note["app/session.ts"]

    IC <-->|"read on init\nwrite on identity change"| Session
    PC <-->|"read on init\nwrite on preference change"| Session

    ResetToStart["resetToStart()\nClears visible app flow\nkeeps saved response ownership"]
    ResetToStart_note["app/app-provider.tsx"]

    UC --> ResetToStart
    IC --> ResetToStart
    CC --> ResetToStart
    Session --> ResetToStart
```

## Response Ownership State

`be.myEditToken` is intentionally stored with the local response keys. It is the browser-side capability used to patch the optional solo message for the current response.

The raw token is never stored in Sanity. Sanity stores only `editTokenHash`, and the Supabase `save-solo-message` function validates a matching hash before patching `soloMessage`.

`resetToStart()` clears the visible app flow and transient submit flags, but it does not erase `be.myEntryId`, `be.myDoc`, or `be.myEditToken`. A user who clicks Back or refreshes after submitting should still be able to return to their saved response.

On page refresh, stored response ownership hydrates identity only; it does not reopen the graph. The app starts at the landing/onboarding flow, and the navigation View Now action restores the saved response into the live identity state before opening the graph. That keeps the user in the personalized graph path instead of downgrading them to observer mode.

Submitting a new survey starts a new edit-token session and overwrites `be.myEntryId`, `be.mySection`, and `be.myDoc`, so the browser points at the newest response instance.

Save failure is different: the optimistic response keys are removed because no durable Sanity document exists yet. Clearing browser storage has the same effect: the user can still view shared results, but the browser can no longer edit that submitted response.
