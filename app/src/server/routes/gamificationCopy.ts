import type { Request, Response } from "express";

import { optionalEnv } from "../env";
import { consumeRateLimits, type RateRule } from "../security/rateLimiter";
import { getClientAddress } from "../security/requestIdentity";
import { sanityReadClient } from "../upstreams/sanity/readClient";
import { sha256 } from "../utils/hash";
import { rejectDisallowedOrigin } from "./shared";

interface CopyDoc {
  _id: string;
  _updatedAt: string;
  range?: { minPct: number; maxPct: number };
  titles?: string[];
  secondary?: string[];
  enabled?: boolean;
}

type CopyType = "general" | "personalized";

const SCHEMA_BY_TYPE: Record<CopyType, string> = {
  general: "gamificationGeneralCopy",
  personalized: "gamificationPersonalizedCopy",
};

const cache = new Map<string, { expiresAtMs: number; docs: CopyDoc[] }>();

function readCopyType(value: unknown): CopyType | null {
  if (value === "general" || value === "personalized") return value;
  return null;
}

function buildQuery(schemaName: string) {
  return `
*[
  !(_id in path('drafts.**')) &&
  _type == $schemaName &&
  enabled == true
]{
  _id, _updatedAt, range, titles, secondary
}
`;
}

function buildRateRules(req: Request): RateRule[] {
  const salt = optionalEnv("RATE_LIMIT_SALT", "butterfly-effect-gamification-read");
  const ipHash = sha256(`${salt}:ip:${getClientAddress(req)}`);
  return [
    { key: `gamification-read:ip:${ipHash}:1m`, max: 120, windowSeconds: 60 },
    { key: `gamification-read:ip:${ipHash}:10m`, max: 600, windowSeconds: 10 * 60 },
  ];
}

export async function gamificationCopyRoute(req: Request, res: Response) {
  if (rejectDisallowedOrigin(req, res)) return;

  const type = readCopyType(req.query.type);
  if (!type) {
    res.status(400).json({ error: "Invalid copy type", code: "INVALID_COPY_TYPE" });
    return;
  }

  const rateLimit = consumeRateLimits(buildRateRules(req));
  if (!rateLimit.allowed) {
    res.status(429).json({
      error: "Too many read requests",
      code: "RATE_LIMITED",
      ...(rateLimit.resetAt ? { resetAt: rateLimit.resetAt } : {}),
    });
    return;
  }

  const cached = cache.get(type);
  if (cached && cached.expiresAtMs > Date.now()) {
    res.status(200).json({ docs: cached.docs, cached: true });
    return;
  }

  try {
    const docs = await sanityReadClient.fetch<CopyDoc[]>(
      buildQuery(SCHEMA_BY_TYPE[type]),
      { schemaName: SCHEMA_BY_TYPE[type] }
    );
    cache.set(type, { docs, expiresAtMs: Date.now() + 60_000 });
    res.status(200).json({ docs, cached: false });
  } catch (error) {
    console.error("[gamification-copy] Sanity read failed:", error);
    res.status(503).json({
      error: "Unable to read gamification copy",
      code: "SANITY_READ_UNAVAILABLE",
    });
  }
}
