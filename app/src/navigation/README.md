# Navigation

The navigation folder owns the persistent controls around the canvas experience. It composes the top-left brand/home affordance, top-right graph/theme controls, and bottom mobile/compact controls from app context state.

## Important Files

- `navigation.tsx` is the folder entry point. It reads app flow, identity, and preference contexts, then coordinates the centered landing placement and spread navigation placement.
- `gp-data.ts` builds graph picker options from onboarding section lookups, current survey counts, and the user's saved section.
- `graph-picker.tsx` renders the accessible graph section picker, including student/staff submenus and open/close signals for parent layout.
- `left/logo.tsx` and `left/nav-left.tsx` render the brand/home side of the top navigation.
- `right/nav-right.tsx`, `right/color-toggle.tsx`, and `right/system-color.tsx` render graph selection and color-mode controls.
- `bottom/nav-bottom.tsx` composes mobile/compact controls, questionnaire next-state controls, logs, and graph widgets.
- `bottom/mode-toggle.tsx` switches observer/survey mode.
- `bottom/logs-button.tsx` renders the logs trigger and logs panel.
- `bottom/widgets/*` renders graph helper widgets, section scores, compact graph tools, and the bar graph.

## Call Tree

```text
app shell
  -> Navigation
     -> NavLeft
        -> Logo
     -> NavRight
        -> GraphPicker
           -> useGraphPickerData
              -> ROLE_SECTIONS
              -> SurveyDataCtx.counts
              -> IdentityCtx.mySection
        -> ColorToggle / SystemColor
     -> NavBottom
        -> ModeToggle
        -> LogsButton
        -> CompactGraphTools / SectionScores / BarGraph
```

## Contracts

External API:

```ts
Navigation(): JSX.Element
GraphPicker(props: {
  value?: string;
  onChange?: (id: string) => void;
  onOpenChange?: (open: boolean) => void;
}): JSX.Element
useGraphPickerData(value: string): GraphPickerData
```

Lookup and sentinel contracts:

```text
ROLE_SECTIONS -> student/staff department options
CHOOSE_STUDENT / CHOOSE_STAFF -> graph picker submenu sentinels
GO_BACK -> graph picker submenu return sentinel
```

Rule of thumb: navigation can read app contexts and request UI state changes. It should not fetch survey data directly, own canvas rendering decisions, or duplicate onboarding section catalogs.
