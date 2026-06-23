import type { Request, Response } from "express";

import { NON_VISITOR_MASSART, STAFF_IDS, STUDENT_IDS } from "../../domain/survey/sections";
import { normalizeSurveyRow } from "../../domain/survey/normalizeSurveyRow";
import type { RawSurveyRow, SurveyRow } from "../../domain/survey/types";
import { optionalEnv } from "../env";
import { consumeRateLimits, type RateRule } from "../security/rateLimiter";
import { getClientAddress } from "../security/requestIdentity";
import { sanityReadClient } from "../upstreams/sanity/readClient";
import { sha256 } from "../utils/hash";
import { rejectDisallowedOrigin } from "./shared";

const PROJECTION = `
  _id, section,
  q1, q2, q3, q4, q5,
  avgWeight,
  soloMessage,
  soloMessageUpdatedAt,
  submittedAt,
  _createdAt
`;

const AGGREGATE_SECTIONS = new Set(["all", "all-massart", "all-students", "all-staff"]);
const ALLOWED_SECTIONS = new Set<string>([
  "visitor",
  ...AGGREGATE_SECTIONS,
  ...STUDENT_IDS,
  ...STAFF_IDS,
]);

const cache = new Map<string, { expiresAtMs: number; rows: SurveyRow[] }>();

function readLimit(value: unknown) {
  const parsed = typeof value === "string" ? Number(value) : NaN;
  if (!Number.isInteger(parsed)) return 300;
  return Math.max(1, Math.min(parsed, 500));
}

function readSection(value: unknown) {
  const section = typeof value === "string" && value.trim() ? value.trim() : "all";
  return ALLOWED_SECTIONS.has(section) ? section : null;
}

function buildQueryAndParams(section: string, limit: number) {
  const base = "*[!(_id in path('drafts.**')) && _type == 'userResponseV4'";
  if (section === "all") {
    return {
      query: `${base}] | order(coalesce(submittedAt, _createdAt) desc)[0...$limit]{ ${PROJECTION} }`,
      params: { limit },
    };
  }
  if (section === "all-massart") {
    return {
      query: `${base} && section in $sections] | order(coalesce(submittedAt, _createdAt) desc)[0...$limit]{ ${PROJECTION} }`,
      params: { sections: NON_VISITOR_MASSART, limit },
    };
  }
  if (section === "all-students") {
    return {
      query: `${base} && section in $sections] | order(coalesce(submittedAt, _createdAt) desc)[0...$limit]{ ${PROJECTION} }`,
      params: { sections: STUDENT_IDS, limit },
    };
  }
  if (section === "all-staff") {
    return {
      query: `${base} && section in $sections] | order(coalesce(submittedAt, _createdAt) desc)[0...$limit]{ ${PROJECTION} }`,
      params: { sections: STAFF_IDS, limit },
    };
  }

  return {
    query: `${base} && section == $section] | order(coalesce(submittedAt, _createdAt) desc)[0...$limit]{ ${PROJECTION} }`,
    params: { section, limit },
  };
}

function buildRateRules(req: Request): RateRule[] {
  const salt = optionalEnv("RATE_LIMIT_SALT", "butterfly-effect-survey-read");
  const ipHash = sha256(`${salt}:ip:${getClientAddress(req)}`);
  return [
    { key: `survey-read:ip:${ipHash}:1m`, max: 120, windowSeconds: 60 },
    { key: `survey-read:ip:${ipHash}:10m`, max: 600, windowSeconds: 10 * 60 },
  ];
}

export async function surveyResponsesRoute(req: Request, res: Response) {
  if (rejectDisallowedOrigin(req, res)) return;

  const section = readSection(req.query.section);
  if (!section) {
    res.status(400).json({ error: "Invalid section", code: "INVALID_SECTION" });
    return;
  }

  const limit = readLimit(req.query.limit);
  const rateLimit = consumeRateLimits(buildRateRules(req));
  if (!rateLimit.allowed) {
    res.status(429).json({
      error: "Too many read requests",
      code: "RATE_LIMITED",
      ...(rateLimit.resetAt ? { resetAt: rateLimit.resetAt } : {}),
    });
    return;
  }

  const cacheKey = `${section}:${String(limit)}`;
  const cached = cache.get(cacheKey);
  if (cached && cached.expiresAtMs > Date.now()) {
    res.status(200).json({ rows: cached.rows, cached: true });
    return;
  }

  const { query, params } = buildQueryAndParams(section, limit);

  try {
    const rawRows = await sanityReadClient.fetch<RawSurveyRow[]>(query, params);
    const rows = rawRows.map(normalizeSurveyRow);
    cache.set(cacheKey, { rows, expiresAtMs: Date.now() + 5000 });
    res.status(200).json({ rows, cached: false });
  } catch (error) {
    console.error("[survey-responses] Sanity read failed:", error);
    res.status(503).json({
      error: "Unable to read survey responses",
      code: "SANITY_READ_UNAVAILABLE",
    });
  }
}
