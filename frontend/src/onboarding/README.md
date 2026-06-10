# Onboarding

The onboarding folder owns the survey entry flow: role selection, optional section selection, questionnaire answers, live canvas feedback, and submit handoff to services.

## Important Files

- `index.tsx` exports `Survey`, the flow coordinator for role, section, and question stages. It connects onboarding state to app flow, identity, survey data, canvas runtime, notices, analytics, and the Sanity submit service.
- `types.ts` contains the older generic question/option contracts.
- `role-picker/index.tsx` and `role-picker/role-step.tsx` render the visitor/student/staff choice step.
- `section-picker/sections.ts` defines `ROLE_SECTIONS`, the student/staff section lookup used by onboarding and navigation.
- `section-picker/index.tsx` renders the section picker step.
- `information/canvas-info.tsx` renders the intro information panel.
- `questionnaire/index.ts` is the public barrel for questionnaire components and contracts.
- `questionnaire/button-input/questionnaire-flow.tsx` runs the button-questionnaire step state, live average updates, bottom-nav next button state, and reserved canvas footprints.
- `questionnaire/button-input/button-questions.ts` defines the finite question and weight table.
- `questionnaire/button-input/button-layouts.ts` maps question options to canvas/grid placement zones.
- `questionnaire/button-input/useQuestionnaireGridLayout.ts` adapts placement rules to the current canvas grid/device.
- `questionnaire/button-input/useLiveAvgButtons.ts` owns the reusable multi-select toggle logic.
- `questionnaire/button-input/index.tsx` exports the reusable `LiveAvgButtonGroup`.

## Call Tree

```text
app shell
  -> Survey
     -> RoleStep
        -> role-picker
     -> SectionPickerIntro
        -> ROLE_SECTIONS
     -> ButtonQuestionnaireFlow
        -> BUTTON_QUESTIONS
        -> useLiveAvgButtons
        -> useQuestionnaireGridLayout
           -> button-layouts
        -> CanvasRuntime.setLiveAvg
        -> CanvasRuntime.setReservedFootprints
        -> UiFlow.setQuestionnaireNav
     -> saveUserResponse
        -> optimistic row/session
        -> edge-function write
        -> duplicate/rate-limit notices handled by Survey
```

## Contracts

External API:

```ts
Survey(props: {
  onAnswersUpdate?: (answers: Record<string, number | null>) => void;
}): JSX.Element

ButtonQuestionnaireFlow(props: {
  onAnswersUpdate?: (answers: Record<string, number | null>) => void;
  onSubmit?: (answers: Record<string, number | null>) => void;
  submitting?: boolean;
}): JSX.Element
```

Lookup and state contracts:

```text
ROLE_SECTIONS -> canonical role-to-section catalog
BUTTON_QUESTIONS -> finite questionnaire weights and labels
questionnaireAdvanceTick -> bottom navigation requests the next questionnaire action
reservedFootprints -> questionnaire buttons reserve canvas/grid space while visible
liveAvg -> canvas preview value derived from answered question weights
```

Rule of thumb: onboarding owns survey input and immediate canvas feedback. Services own persistence, app state owns global mode/reset/banner decisions, and navigation owns persistent controls.
