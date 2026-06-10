# Services

The services folder owns data boundaries that sit outside React UI state. These files know how to read, normalize, mock, and write survey data, while app/onboarding state decides how those results affect the interface.

## Important Files

- `sanity/client.ts` creates the live Sanity client used by read subscriptions.
- `sanity/config.ts` owns mock-read fallback state, quota detection, and fallback subscriptions.
- `sanity/api.ts` builds Sanity queries, subscribes to live survey rows, polls on listener failure, and falls back to mock reads when configured.
- `sanity/edgeFunction.ts` wraps backend edge-function requests and exposes typed request failures.
- `sanity/saveUserResponse.ts` owns survey submission, edit-token/idempotency setup, optimistic saved-response objects, session persistence, and mock write fallback.
- `sanity/saveSoloMessage.ts` updates the solo message for an existing response through the edge function or mock store.
- `sanity/mockData.ts` owns local mock rows, mock subscriptions, mock writes, and mock storage reset helpers.
- `sanity/normalizeSurveyRow.ts` converts raw Sanity rows into the normalized `SurveyRow` shape used by app state.
- `sanity/sections.ts` defines student/staff section id groupings used by service queries.
- `sanity/types.ts` defines the service-level row, weight, query, and unsubscribe contracts.
- `sanity/__tests__/normalizeSurveyRow.test.ts` covers normalization behavior.

## Call Tree

```text
app/state/useSurveyDataState
  -> sanity/api.subscribeSurveyData
     -> shouldUseMockSanityReads?
        yes -> mockData.subscribeMockSurveyData
        no -> live Sanity query/listen
     -> normalizeSurveyRow
     -> SurveyDataCtx rows/counts

onboarding survey submit
  -> sanity/saveUserResponse.saveUserResponse
     -> ensure/begin edit token
     -> edgeFunction request
        success -> persistUserResponseSession
        mock fallback -> mockData.createMockUserResponse
        edge error -> caller handles duplicate/rate-limit UI

app solo message save
  -> sanity/saveSoloMessage.saveSoloMessage
     -> edgeFunction request
        success -> session snapshot update
        mock fallback -> mockData.updateMockSoloMessage
```

## Contracts

External API:

```ts
subscribeSurveyData(args: SubscribeSurveyDataArgs): Unsubscribe
saveUserResponse(section: string, weights: SurveyWeights): Promise<SavedUserResponse>
saveSoloMessage(message: string): Promise<SavedSoloMessage>
normalizeSurveyRow(row: RawSurveyRow): SurveyRow | null
```

Important storage and lookup contracts:

```text
be.mockRows -> mockData persisted row list
STUDENT_IDS / STAFF_IDS / NON_VISITOR_MASSART -> aggregate query groups
SavedUserResponse -> optimistic row, session snapshot, and post-submit identity source
```

Rule of thumb: services should own transport, fallback, and normalization decisions. They should not decide which app view, banner, graph mode, or onboarding step is shown.
