# Client API

The client-api folder owns browser-side data boundaries that sit outside React UI state. Reads and writes go through same-origin Express API endpoints; Sanity upstream access belongs to the server.

## Important Files

- `read-api/config.ts` owns mock-read fallback state, quota detection, and fallback subscriptions.
- `read-api/api.ts` polls the backend survey read endpoint and falls back to mock reads when configured.
- `mock-survey-data/mockData.ts` owns local mock rows, mock subscriptions, mock writes, and mock storage reset helpers.
- `response-api/writeApi.ts` wraps same-origin backend write requests and exposes typed request failures.
- `response-api/saveUserResponse.ts` owns survey submission, edit-token/idempotency setup, optimistic saved-response objects, session persistence, and mock write fallback.
- `response-api/saveSoloMessage.ts` updates the solo message for an existing response through the write API or mock store.
- `../domain/survey/sections.ts` defines student/staff section id groupings used by services and server validation.
- `../domain/survey/types.ts` defines shared row, weight, raw row, and unsubscribe contracts.
- `../domain/survey/normalizeSurveyRow.ts` converts raw upstream rows into the normalized `SurveyRow` shape used by app state.
- `../domain/survey/__tests__/normalizeSurveyRow.test.ts` covers normalization behavior.

## Call Tree

```text
app/state/useSurveyDataState
  -> read-api/api.subscribeSurveyData
     -> shouldUseMockReads?
        yes -> mock-survey-data/mockData.subscribeMockSurveyData
        no -> GET /api/survey-responses
     -> SurveyDataCtx rows/counts

onboarding survey submit
  -> response-api/saveUserResponse.saveUserResponse
     -> ensure/begin edit token
     -> same-origin Express write API request
        success -> persistUserResponseSession
        mock fallback -> mock-survey-data/mockData.createMockUserResponse
        API error -> caller handles duplicate/rate-limit UI

app solo message save
  -> response-api/saveSoloMessage.saveSoloMessage
     -> same-origin Express write API request
        success -> session snapshot update
        mock fallback -> mock-survey-data/mockData.updateMockSoloMessage
```

## Contracts

External API:

```ts
subscribeSurveyData(args: SubscribeSurveyDataArgs): Unsubscribe
saveUserResponse(section: string, weights: SurveyWeights): Promise<SavedUserResponse>
saveSoloMessage(message: string): Promise<SavedSoloMessage>
```

Important storage and lookup contracts:

```text
be.mockRows -> mockData persisted row list
STUDENT_IDS / STAFF_IDS / NON_VISITOR_MASSART -> aggregate query groups
SavedUserResponse -> optimistic row, session snapshot, and post-submit identity source
```

Rule of thumb: client API modules should own app-facing transport and fallback decisions. Sanity upstream access belongs under `server`, and shared survey contracts belong under `domain/survey`.
