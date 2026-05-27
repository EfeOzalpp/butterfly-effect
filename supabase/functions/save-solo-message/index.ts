import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient as createSanityClient } from "npm:@sanity/client@6";
import { createClient as createSupabaseClient } from "npm:@supabase/supabase-js@2";

interface ValidPayload {
  responseId: string;
  editToken: string;
  message: string;
  clientId: string | null;
  clientRequestId: string | null;
}

interface RateRule {
  key: string;
  max: number;
  windowSeconds: number;
}

interface RateResult {
  allowed: boolean;
  resetAt?: string;
}

interface StoredResponse {
  _id: string;
  editTokenHash?: string;
}

interface SavedMessageResponse {
  _id: string;
  soloMessage?: string;
  soloMessageUpdatedAt?: string;
}

const MAX_BODY_BYTES = 2048;
const MAX_MESSAGE_LENGTH = 160;
const TOP_LEVEL_KEYS = new Set([
  "responseId",
  "editToken",
  "message",
  "clientId",
  "clientRequestId",
  "website",
]);

const rateLimitMemory = new Map<string, { count: number; resetAtMs: number }>();

function getRequiredEnv(name: string) {
  const value = Deno.env.get(name);
  if (!value) throw new Error(`Missing required secret: ${name}`);
  return value;
}

function parseCsvEnv(name: string): Set<string> {
  const raw = Deno.env.get(name);
  if (!raw) return new Set();
  return new Set(raw.split(",").map((part) => part.trim()).filter(Boolean));
}

function parseKeyListEnv(name: string): string[] {
  const raw = Deno.env.get(name)?.trim();
  if (!raw) return [];

  try {
    const parsed: unknown = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed.filter((value): value is string => typeof value === "string" && value.length > 0);
    }
    if (parsed && typeof parsed === "object") {
      return Object.values(parsed).filter((value): value is string => typeof value === "string" && value.length > 0);
    }
  } catch {
    // Fall through to comma-separated parsing.
  }

  return raw.split(",").map((part) => part.trim()).filter(Boolean);
}

function readSupabaseSecretKey() {
  const explicit = Deno.env.get("SUPABASE_SECRET_KEY");
  const fromKeySet = parseKeyListEnv("SUPABASE_SECRET_KEYS")[0];
  const legacy = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  return explicit ?? fromKeySet ?? legacy ?? null;
}

const allowedOrigins = parseCsvEnv("ALLOWED_ORIGINS");
const publishableKeys = new Set(parseKeyListEnv("SUPABASE_PUBLISHABLE_KEYS"));

const sanity = createSanityClient({
  projectId: getRequiredEnv("SANITY_PROJECT_ID"),
  dataset: getRequiredEnv("SANITY_DATASET"),
  apiVersion: Deno.env.get("SANITY_API_VERSION") ?? "2022-03-07",
  useCdn: false,
  token: getRequiredEnv("SANITY_TOKEN"),
});

const supabaseUrl = Deno.env.get("SUPABASE_URL");
const supabaseSecretKey = readSupabaseSecretKey();
const rateLimitClient = supabaseUrl && supabaseSecretKey
  ? createSupabaseClient(supabaseUrl, supabaseSecretKey)
  : null;

function isRecord(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === "object" && !Array.isArray(value);
}

function isAllowedOrigin(origin: string | null) {
  if (!origin || allowedOrigins.size === 0) return true;
  return allowedOrigins.has(origin);
}

function corsHeaders(req: Request) {
  const origin = req.headers.get("Origin");
  const allowOrigin = origin && isAllowedOrigin(origin)
    ? origin
    : allowedOrigins.size === 0
      ? "*"
      : "null";

  return {
    "Access-Control-Allow-Origin": allowOrigin,
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Vary": "Origin",
  };
}

function jsonResponse(req: Request, status: number, body: Record<string, unknown>) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders(req), "Content-Type": "application/json" },
  });
}

function hasValidPublishableKey(req: Request) {
  if (publishableKeys.size === 0) return true;
  const key = req.headers.get("apikey")?.trim() ?? "";
  return publishableKeys.has(key);
}

function readOptionalId(value: unknown) {
  if (value === undefined || value === null) return null;
  if (typeof value !== "string") return null;

  const trimmed = value.trim();
  return /^[a-zA-Z0-9_-]{8,96}$/.test(trimmed) ? trimmed : null;
}

function readResponseId(value: unknown) {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return /^[a-zA-Z0-9._-]{8,128}$/.test(trimmed) ? trimmed : null;
}

function readEditToken(value: unknown) {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return /^[a-zA-Z0-9_-]{32,128}$/.test(trimmed) ? trimmed : null;
}

function readMessage(value: unknown) {
  if (typeof value !== "string") return null;
  const trimmed = value.trim().replace(/\s+/g, " ");
  if (trimmed.length > MAX_MESSAGE_LENGTH) return null;
  return trimmed;
}

function validatePayload(value: unknown): { ok: true; payload: ValidPayload } | { ok: false; error: string } {
  if (!isRecord(value)) return { ok: false, error: "Invalid payload" };

  const unknownTopLevel = Object.keys(value).filter((key) => !TOP_LEVEL_KEYS.has(key));
  if (unknownTopLevel.length > 0) return { ok: false, error: "Unexpected payload fields" };

  if (typeof value.website === "string" && value.website.trim().length > 0) {
    return { ok: false, error: "Invalid payload" };
  }

  const responseId = readResponseId(value.responseId);
  if (!responseId) return { ok: false, error: "Invalid response id" };

  const editToken = readEditToken(value.editToken);
  if (!editToken) return { ok: false, error: "Invalid edit token" };

  const message = readMessage(value.message);
  if (message === null) return { ok: false, error: "Invalid message" };

  return {
    ok: true,
    payload: {
      responseId,
      editToken,
      message,
      clientId: readOptionalId(value.clientId),
      clientRequestId: readOptionalId(value.clientRequestId),
    },
  };
}

function getClientAddress(req: Request) {
  const forwardedFor = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return forwardedFor ||
    req.headers.get("cf-connecting-ip") ||
    req.headers.get("x-real-ip") ||
    "unknown";
}

async function sha256(value: string) {
  const bytes = new TextEncoder().encode(value);
  const hash = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(hash))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

async function editTokenHash(value: string) {
  return await sha256(`edit-token:${value}`);
}

async function buildRateRules(req: Request, payload: ValidPayload): Promise<RateRule[]> {
  const salt = Deno.env.get("RATE_LIMIT_SALT") ?? "butterfly-effect-save-solo-message";
  const ipHash = await sha256(`${salt}:ip:${getClientAddress(req)}`);
  const responseHash = await sha256(`${salt}:response:${payload.responseId}`);
  const rules: RateRule[] = [
    { key: `save-solo-message:ip:${ipHash}:10m`, max: 20, windowSeconds: 10 * 60 },
    { key: `save-solo-message:ip:${ipHash}:day`, max: 80, windowSeconds: 24 * 60 * 60 },
    { key: `save-solo-message:response:${responseHash}:10m`, max: 8, windowSeconds: 10 * 60 },
  ];

  if (payload.clientId) {
    const clientHash = await sha256(`${salt}:client:${payload.clientId}`);
    rules.push({ key: `save-solo-message:client:${clientHash}:10m`, max: 10, windowSeconds: 10 * 60 });
  }

  if (payload.clientId && payload.clientRequestId) {
    const requestHash = await sha256(`${salt}:request:${payload.clientId}:${payload.clientRequestId}`);
    rules.push({ key: `save-solo-message:request:${requestHash}`, max: 1, windowSeconds: 24 * 60 * 60 });
  }

  return rules;
}

function consumeMemoryRateLimit(rule: RateRule): RateResult {
  const now = Date.now();
  const existing = rateLimitMemory.get(rule.key);

  if (!existing || existing.resetAtMs <= now) {
    const resetAtMs = now + rule.windowSeconds * 1000;
    rateLimitMemory.set(rule.key, { count: 1, resetAtMs });
    return { allowed: true, resetAt: new Date(resetAtMs).toISOString() };
  }

  existing.count += 1;
  return {
    allowed: existing.count <= rule.max,
    resetAt: new Date(existing.resetAtMs).toISOString(),
  };
}

async function consumeRateLimit(rule: RateRule): Promise<RateResult> {
  if (!rateLimitClient) return consumeMemoryRateLimit(rule);

  const result = await rateLimitClient.rpc("consume_edge_rate_limit", {
    p_bucket: rule.key,
    p_max_count: rule.max,
    p_window_seconds: rule.windowSeconds,
  });

  if (result.error) {
    console.warn("[save-solo-message] persistent rate limit unavailable:", result.error.message);
    return consumeMemoryRateLimit(rule);
  }

  const row = Array.isArray(result.data) ? result.data[0] : result.data;
  return {
    allowed: row?.allowed === true,
    resetAt: typeof row?.reset_at === "string" ? row.reset_at : undefined,
  };
}

async function enforceRateLimits(req: Request, payload: ValidPayload) {
  const rules = await buildRateRules(req, payload);

  for (const rule of rules) {
    const result = await consumeRateLimit(rule);
    if (!result.allowed) return result;
  }

  return { allowed: true } satisfies RateResult;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders(req) });
  }

  if (!isAllowedOrigin(req.headers.get("Origin"))) {
    return jsonResponse(req, 403, { error: "Origin not allowed", code: "ORIGIN_NOT_ALLOWED" });
  }

  if (!hasValidPublishableKey(req)) {
    return jsonResponse(req, 401, { error: "Invalid API key", code: "INVALID_API_KEY" });
  }

  if (req.method !== "POST") {
    return jsonResponse(req, 405, { error: "Method not allowed", code: "METHOD_NOT_ALLOWED" });
  }

  const contentType = req.headers.get("Content-Type") ?? "";
  if (!contentType.toLowerCase().includes("application/json")) {
    return jsonResponse(req, 415, { error: "Expected application/json", code: "UNSUPPORTED_CONTENT_TYPE" });
  }

  const contentLength = Number(req.headers.get("Content-Length") ?? "0");
  if (Number.isFinite(contentLength) && contentLength > MAX_BODY_BYTES) {
    return jsonResponse(req, 413, { error: "Payload too large", code: "PAYLOAD_TOO_LARGE" });
  }

  try {
    const rawBody = await req.text();
    if (new TextEncoder().encode(rawBody).length > MAX_BODY_BYTES) {
      return jsonResponse(req, 413, { error: "Payload too large", code: "PAYLOAD_TOO_LARGE" });
    }

    let parsed: unknown;
    try {
      parsed = JSON.parse(rawBody);
    } catch {
      return jsonResponse(req, 400, { error: "Malformed JSON", code: "MALFORMED_JSON" });
    }

    const validation = validatePayload(parsed);
    if (!validation.ok) {
      return jsonResponse(req, 400, { error: validation.error, code: "INVALID_SOLO_MESSAGE" });
    }

    const rateLimit = await enforceRateLimits(req, validation.payload);
    if (!rateLimit.allowed) {
      return jsonResponse(req, 429, {
        error: "Too many message updates",
        code: "RATE_LIMITED",
        ...(rateLimit.resetAt ? { resetAt: rateLimit.resetAt } : {}),
      });
    }

    const existing = await sanity.fetch<StoredResponse | null>(
      `*[!(_id in path("drafts.**")) && _type == "userResponseV4" && _id == $id][0]{ _id, editTokenHash }`,
      { id: validation.payload.responseId },
    );

    if (!existing) {
      return jsonResponse(req, 404, { error: "Response not found", code: "RESPONSE_NOT_FOUND" });
    }

    const expectedHash = await editTokenHash(validation.payload.editToken);
    if (!existing.editTokenHash || existing.editTokenHash !== expectedHash) {
      return jsonResponse(req, 403, { error: "Not allowed to edit this response", code: "EDIT_TOKEN_MISMATCH" });
    }

    const patch = sanity.patch(existing._id);
    if (validation.payload.message.length > 0) {
      patch.set({
        soloMessage: validation.payload.message,
        soloMessageUpdatedAt: new Date().toISOString(),
      });
    } else {
      patch.unset(["soloMessage", "soloMessageUpdatedAt"]);
    }

    const updated = await patch.commit<SavedMessageResponse>({
      returnDocuments: true,
      visibility: "sync",
    });

    return jsonResponse(req, 200, {
      _id: updated._id,
      ...(updated.soloMessage ? { soloMessage: updated.soloMessage } : {}),
      ...(updated.soloMessageUpdatedAt ? { soloMessageUpdatedAt: updated.soloMessageUpdatedAt } : {}),
    });
  } catch (error) {
    console.error("[save-solo-message] failed:", error);
    return jsonResponse(req, 500, { error: "Unable to save message", code: "EDGE_FUNCTION_ERROR" });
  }
});
