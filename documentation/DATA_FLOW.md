# Data Flow - Sanity Read And Write Paths

```mermaid
flowchart TD

    subgraph SubmitWrite ["Write Path: Survey Submit"]
        Answers["User answers\nq1-q5 averaged from selections"]
        Answers_note["onboarding/questionnaire/button-input/questionnaire-flow.tsx"]

        Transform["answersToWeights()\nMaps answers to q1-q5 values clamped to 0-1"]
        Transform_note["onboarding/index.tsx"]

        EditToken["Browser edit token\ncreated before first save"]
        EditToken_note["services/sanity/saveUserResponse.ts\napp/session.ts"]

        SaveResponse["Supabase Edge Function\nPOST /functions/v1/save-user-response"]
        SaveResponse_note["Holds Sanity write token\nvalidates request shape and rate limits"]

        ResponseDoc[("Sanity CMS\nuserResponseV4\n_id, section, q1-q5, avgWeight, submittedAt, editTokenHash")]
        ResponseDoc_note["Raw edit token is not stored in Sanity"]

        Session["session/local storage\nbe.myEntryId, be.mySection, be.myRole, be.myDoc, be.myEditToken"]

        Answers --> Transform
        Transform --> SaveResponse
        EditToken --> SaveResponse
        SaveResponse -->|"create document"| ResponseDoc
        SaveResponse -->|"saved response snapshot"| Session
    end

    subgraph SoloWrite ["Write Path: Solo Message Edit"]
        Popup["Personal popup\noptional user message"]
        Popup_note["graph-runtime/gamification/gamification-personal.tsx"]

        SaveSolo["Supabase Edge Function\nPOST /functions/v1/save-solo-message"]
        SaveSolo_note["Validates response id, message, rate limit, and edit token hash"]

        PatchDoc[("Sanity CMS\npatch userResponseV4\nsoloMessage, soloMessageUpdatedAt")]
        FallbackCopy["No saved message\nuse personalized Sanity copy\nthen local fallback"]

        Popup -->|"message + response id + raw edit token"| SaveSolo
        SaveSolo -->|"hash token and compare with editTokenHash"| PatchDoc
        Popup -->|"empty or missing soloMessage"| FallbackCopy
    end

    subgraph ReadPath ["Read Path: Real-Time Data"]
        LiveClient["Sanity live client\nNo CDN for real-time reads"]
        LiveClient_note["services/sanity/client.ts"]

        SSE["SSE listener\nliveClient.listen()"]
        Poll["Polling fallback\n6s while SSE is down\nbackoff before reconnect"]

        SurveyDataState["Survey data state\nallRows up to 5,000\ndata up to 300\ncounts by section"]
        SurveyDataState_note["app/state/useSurveyDataState.ts"]

        FilteredData["Filtered visualization data\nactive section + graph slice"]

        LiveClient --> SSE
        LiveClient --> Poll
        SSE -->|"mutation events"| SurveyDataState
        Poll -->|"periodic fetch"| SurveyDataState
        SurveyDataState --> FilteredData
    end

    subgraph MockFallback ["Mock Fallback"]
        MockTrigger{"Fallback trigger?"}
        MockData["Mock data\nStatic local dataset\nlocal solo-message updates"]
        MockData_note["services/sanity/mockData.ts"]
        MockBanner["UI banner\nAPI quota exceeded / demo data"]

        MockTrigger -->|"VITE_USE_MOCK_DATA=true"| MockData
        MockTrigger -->|"HTTP 402, 403, 429\nor CORS / network error"| MockData
        MockData --> MockBanner
        MockData --> SurveyDataState
    end

    ResponseDoc -->|"SSE push"| LiveClient
    PatchDoc -->|"SSE push"| LiveClient
```

## Ownership Token Model

The solo-message edit flow uses a browser-held capability token, not user authentication.

- The frontend creates a random edit token before the first response save.
- `save-user-response` hashes that token and stores only `editTokenHash` on the Sanity document.
- The raw token remains in browser storage next to `be.myEntryId`.
- `save-solo-message` accepts the response id, raw token, and message, then compares the token hash with the stored Sanity hash before patching.
- If the browser loses local storage, the app loses the ability to edit that response.

This keeps the Sanity write token out of the browser and avoids letting any client patch arbitrary survey documents. It is still an anonymous ownership model, so it should be treated as edit capability for one browser instance, not as identity.
