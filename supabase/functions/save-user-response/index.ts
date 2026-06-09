import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient as createSanityClient } from "npm:@sanity/client@6";
import { createClient as createSupabaseClient } from "npm:@supabase/supabase-js@2";

type QuestionKey = "q1" | "q2" | "q3" | "q4" | "q5";
type Weights = Record<QuestionKey, number>;

interface ValidPayload {
  section: string;
  weights: Weights;
  clientId: string | null;
  clientRequestId: string | null;
  editToken: string | null;
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

const MAX_BODY_BYTES = 4096;
const QUESTION_KEYS = ["q1", "q2", "q3", "q4", "q5"] as const;
const TOP_LEVEL_KEYS = new Set([
  "section",
  "weights",
  "clientId",
  "clientRequestId",
  "editToken",
  "website",
  "startedAt",
]);

const STUDENT_IDS = [
  "3d-arts", "animation", "architecture", "art-education", "ceramics",
  "communication-design", "creative-writing", "design-innovation", "digital-media",
  "dynamic-media-institute", "fashion-design", "fibers", "film-video", "fine-arts-2d",
  "furniture-design", "glass", "history-of-art", "humanities", "illustration",
  "industrial-design", "integrative-sciences", "jewelry-metalsmithing", "liberal-arts",
  "mfa-low-residency", "mfa-low-residency-foundation", "mfa-studio-arts",
  "painting", "photography", "printmaking", "sculpture", "studio-arts",
  "studio-interrelated-media", "studio-foundation", "visual-storytelling",
  "fine-arts", "design", "foundations",
] as const;

const STAFF_IDS = [
  "academic-affairs", "academic-resource-center", "administration-finance",
  "administrative-services", "admissions", "artward-bound", "bookstore", "bursar",
  "career-development", "center-art-community", "community-health", "compass",
  "conference-event-services", "counseling-center", "facilities", "fiscal-accounting",
  "fiscal-budget", "graduate-programs", "health-office", "housing-residence-life",
  "human-resources", "institutional-advancement", "institutional-research",
  "international-education", "justice-equity", "library", "marketing-communications",
  "maam", "foundation", "president-office", "pce", "public-safety", "registrar",
  "student-development", "student-engagement", "student-financial-assistance",
  "sustainability", "technology", "woodshop", "youth-programs",
] as const;

const ALLOWED_SECTIONS = new Set<string>(["visitor", ...STUDENT_IDS, ...STAFF_IDS]);

const QUESTION_WEIGHTS: Record<QuestionKey, readonly number[]> = {
  q1: [1, 0.85, 0.67, 0.45, 0.25],
  q2: [1, 0.95, 0.8, 0.6, 0.3, 0.05],
  q3: [0.9, 0.75, 0.7, 0.6, 0.1, 1],
  q4: [1, 0.75, 0.65, 0.8, 0.25, 0],
  q5: [1, 0.75, 0.5, 0.25, 0],
};

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

const round3 = (value: number) => Math.round(value * 1000) / 1000;
const answerKey = (value: number) => round3(value).toFixed(3);

function buildAllowedAnswerSet(values: readonly number[]) {
  const allowed = new Set<string>();
  const maxMask = 1 << values.length;

  for (let mask = 1; mask < maxMask; mask += 1) {
    let sum = 0;
    let count = 0;

    for (let i = 0; i < values.length; i += 1) {
      if ((mask & (1 << i)) === 0) continue;
      sum += values[i];
      count += 1;
    }

    allowed.add(answerKey(sum / count));
  }

  return allowed;
}

const VALID_ANSWERS: Record<QuestionKey, Set<string>> = {
  q1: buildAllowedAnswerSet(QUESTION_WEIGHTS.q1),
  q2: buildAllowedAnswerSet(QUESTION_WEIGHTS.q2),
  q3: buildAllowedAnswerSet(QUESTION_WEIGHTS.q3),
  q4: buildAllowedAnswerSet(QUESTION_WEIGHTS.q4),
  q5: buildAllowedAnswerSet(QUESTION_WEIGHTS.q5),
};

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

function readEditToken(value: unknown) {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return /^[a-zA-Z0-9_-]{32,128}$/.test(trimmed) ? trimmed : null;
}

function validatePayload(value: unknown): { ok: true; payload: ValidPayload } | { ok: false; error: string } {
  if (!isRecord(value)) return { ok: false, error: "Invalid payload" };

  const unknownTopLevel = Object.keys(value).filter((key) => !TOP_LEVEL_KEYS.has(key));
  if (unknownTopLevel.length > 0) return { ok: false, error: "Unexpected payload fields" };

  if (typeof value.website === "string" && value.website.trim().length > 0) {
    return { ok: false, error: "Invalid payload" };
  }

  const section = typeof value.section === "string" ? value.section.trim() : "";
  if (!ALLOWED_SECTIONS.has(section)) return { ok: false, error: "Invalid section" };

  if (!isRecord(value.weights)) return { ok: false, error: "Invalid weights" };
  const hasEditToken = value.editToken !== undefined && value.editToken !== null;
  const editToken = hasEditToken ? readEditToken(value.editToken) : null;
  if (hasEditToken && !editToken) return { ok: false, error: "Invalid edit token" };

  const unknownWeightKeys = Object.keys(value.weights).filter((key) =>
    !QUESTION_KEYS.includes(key as QuestionKey)
  );
  if (unknownWeightKeys.length > 0) return { ok: false, error: "Unexpected weight fields" };

  const weights = {} as Weights;
  for (const key of QUESTION_KEYS) {
    const raw = value.weights[key];
    if (typeof raw !== "number" || !Number.isFinite(raw)) {
      return { ok: false, error: `Invalid ${key}` };
    }

    const rounded = round3(raw);
    if (rounded < 0 || rounded > 1 || !VALID_ANSWERS[key].has(answerKey(rounded))) {
      return { ok: false, error: `Invalid ${key}` };
    }

    weights[key] = rounded;
  }

  return {
    ok: true,
    payload: {
      section,
      weights,
      clientId: readOptionalId(value.clientId),
      clientRequestId: readOptionalId(value.clientRequestId),
      editToken,
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
  const salt = Deno.env.get("RATE_LIMIT_SALT") ?? "butterfly-effect-save-user-response";
  const ipHash = await sha256(`${salt}:ip:${getClientAddress(req)}`);
  const rules: RateRule[] = [
    { key: `save-user-response:ip:${ipHash}:10m`, max: 25, windowSeconds: 10 * 60 },
    { key: `save-user-response:ip:${ipHash}:day`, max: 200, windowSeconds: 24 * 60 * 60 },
  ];

  if (payload.clientId) {
    const clientHash = await sha256(`${salt}:client:${payload.clientId}`);
    rules.push(
      { key: `save-user-response:client:${clientHash}:1m`, max: 5, windowSeconds: 60 },
      { key: `save-user-response:client:${clientHash}:day`, max: 50, windowSeconds: 24 * 60 * 60 },
    );
  }

  if (payload.clientId && payload.clientRequestId) {
    const requestHash = await sha256(`${salt}:request:${payload.clientId}:${payload.clientRequestId}`);
    rules.push({ key: `save-user-response:request:${requestHash}`, max: 1, windowSeconds: 24 * 60 * 60 });
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
    console.warn("[save-user-response] persistent rate limit unavailable:", result.error.message);
    return consumeMemoryRateLimit(rule);
  }

  const row = Array.isArray(result.data) ? result.data[0] : result.data;
  return {
    allowed: row?.allowed === true,
    resetAt: typeof row?.reset_at === "string" ? row.reset_at : undefined,
  };
}

async function consumeRateLimitsBatch(rules: RateRule[]): Promise<RateResult | null> {
  if (!rateLimitClient) return null;

  const result = await rateLimitClient.rpc("consume_edge_rate_limits", {
    p_rules: rules.map((rule) => ({
      bucket: rule.key,
      max_count: rule.max,
      window_seconds: rule.windowSeconds,
    })),
  });

  if (result.error) {
    console.warn("[save-user-response] batch rate limit unavailable:", result.error.message);
    return null;
  }

  const row = Array.isArray(result.data) ? result.data[0] : result.data;
  if (typeof row?.allowed !== "boolean") return null;

  return {
    allowed: row.allowed,
    resetAt: typeof row.reset_at === "string" ? row.reset_at : undefined,
  };
}

async function enforceRateLimits(req: Request, payload: ValidPayload) {
  const rules = await buildRateRules(req, payload);
  const batchResult = await consumeRateLimitsBatch(rules);
  if (batchResult) return batchResult;

  for (const rule of rules) {
    const result = await consumeRateLimit(rule);
    if (!result.allowed) return result;
  }

  return { allowed: true } satisfies RateResult;
}

function avgWeight(weights: Weights) {
  const sum = QUESTION_KEYS.reduce((acc, key) => acc + weights[key], 0);
  return round3(sum / QUESTION_KEYS.length);
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
      return jsonResponse(req, 400, { error: validation.error, code: "INVALID_SURVEY_RESPONSE" });
    }

    const rateLimit = await enforceRateLimits(req, validation.payload);
    if (!rateLimit.allowed) {
      return jsonResponse(req, 429, {
        error: "Too many submissions",
        code: "RATE_LIMITED",
        ...(rateLimit.resetAt ? { resetAt: rateLimit.resetAt } : {}),
      });
    }

    const submittedAt = new Date().toISOString();
    const tokenHash = validation.payload.editToken
      ? await editTokenHash(validation.payload.editToken)
      : null;
    const doc = {
      _type: "userResponseV4",
      section: validation.payload.section,
      ...validation.payload.weights,
      avgWeight: avgWeight(validation.payload.weights),
      ...(tokenHash ? { editTokenHash: tokenHash } : {}),
      submittedAt,
    };

    let created: { _id: string };
    try {
      created = await sanity.create(doc);
    } catch (error) {
      console.error("[save-user-response] Sanity write failed:", error);
      return jsonResponse(req, 503, {
        error: "Unable to save response",
        code: "SANITY_WRITE_UNAVAILABLE",
      });
    }

    return jsonResponse(req, 200, {
      _id: created._id,
      section: doc.section,
      ...validation.payload.weights,
      avgWeight: doc.avgWeight,
      submittedAt,
    });
  } catch (error) {
    console.error("[save-user-response] failed:", error);
    return jsonResponse(req, 500, { error: "Unable to save response", code: "EDGE_FUNCTION_ERROR" });
  }
});
