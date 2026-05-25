# Supabase backend

This folder holds the backend boundary for Butterfly Effect. The frontend can read public visualization data directly, but writes go through Supabase Edge Functions so the app never exposes the Sanity write token in browser code.

## Why this exists

The app has no login or CAPTCHA, so the edge function is the security gate between anonymous users and Sanity writes. It does not prove that every submission is from a unique human, but it does make abuse bounded and easier to monitor.

The write path is:

```text
frontend
  -> Supabase Edge Function
  -> payload validation
  -> rate limiting
  -> Sanity create
```

The frontend sends only survey answers. The edge function decides whether that request is allowed to become a Sanity document.

## Edge functions

### `save-user-response`

Located at:

```text
functions/save-user-response/index.ts
```

This function accepts completed questionnaire submissions and creates `userResponseV4` documents in Sanity.

It checks:

- request method and JSON content type
- small body size
- known section ids only
- complete `q1` through `q5` answer payload
- answer values that match the real questionnaire contract
- honeypot field
- origin allowlist when `ALLOWED_ORIGINS` is set
- IP/client/request rate limits before writing to Sanity

The response is intentionally small. It returns only the saved fields the app needs, not the full Sanity document.

## Rate limiting

Rate limits are stored in Supabase Postgres through:

```text
migrations/20260524000000_edge_rate_limits.sql
```

That migration creates:

- `public.edge_rate_limits`
- `public.consume_edge_rate_limit(...)`

The edge function calls that SQL function with the service role key. Public `anon` and `authenticated` clients do not get direct access to the rate-limit table.

If the function cannot reach the persistent rate limiter, it falls back to an in-memory limiter. That is useful during local development, but production should use the SQL-backed limiter.

## CI/CD

GitHub Actions deploys the edge function when Supabase function code changes on `main`:

```text
.github/workflows/deploy-supabase-functions.yml
```

The workflow:

- checks out the repo
- runs `deno check` against `save-user-response`
- installs the Supabase CLI
- deploys `save-user-response` to the configured Supabase project

Required GitHub repository secrets:

```text
SUPABASE_ACCESS_TOKEN
SUPABASE_PROJECT_REF
```

The project ref is the id in the Supabase project URL and API URL. It is not the anon key.

Database migrations are not pushed automatically yet. Run the rate-limit SQL migration manually in the Supabase SQL editor before relying on persistent rate limits.

## Required secrets

Set these in Supabase Edge Function secrets:

```text
SANITY_PROJECT_ID
SANITY_DATASET
SANITY_TOKEN
SANITY_API_VERSION
RATE_LIMIT_SALT
ALLOWED_ORIGINS
```

`SANITY_TOKEN` should be least-privilege and only allow creating the survey response document type.

`ALLOWED_ORIGINS` is comma-separated:

```text
https://yourdomain.com,http://localhost:5173
```

Do not put `SUPABASE_SERVICE_ROLE_KEY` in frontend environment files.

Supabase also provides platform secrets to edge functions. The function uses:

```text
SUPABASE_URL
SUPABASE_SECRET_KEYS
SUPABASE_PUBLISHABLE_KEYS
```

`SUPABASE_SECRET_KEYS` is used server-side for the persistent rate-limit RPC. `SUPABASE_PUBLISHABLE_KEYS` is used to verify the public `apikey` header sent by the browser. The code still supports legacy `SUPABASE_SERVICE_ROLE_KEY` as a fallback while the project migrates, but new deployments should prefer the JWT signing key secrets shown by Supabase.

The frontend should use:

```text
VITE_SUPABASE_URL
VITE_SUPABASE_PUBLISHABLE_KEY
```

`VITE_SUPABASE_ANON_KEY` is still supported as a temporary local fallback, but the publishable key is the newer naming.

## Deno setup

Supabase Edge Functions run on Deno. The function has its own Deno config:

```text
functions/save-user-response/deno.json
```

Check the function locally from the repo root:

```powershell
deno check --config supabase/functions/save-user-response/deno.json supabase/functions/save-user-response/index.ts
```

On this Windows setup, the full path version may be needed:

```powershell
& "$env:USERPROFILE\.deno\bin\deno.exe" check --config supabase/functions/save-user-response/deno.json supabase/functions/save-user-response/index.ts
```

Deno may create a `node_modules` bridge for npm packages. Do not commit that folder. Commit `deno.lock`, because it pins the edge function dependencies.

## Public reads

Sanity reads are still public in the frontend. That is acceptable for the current visualization use case, but it means someone can replay public read queries if they know the project and dataset id.

If read traffic or query abuse becomes a problem, the next step is to move hot read queries behind a Supabase read function with a fixed query contract and caching.
