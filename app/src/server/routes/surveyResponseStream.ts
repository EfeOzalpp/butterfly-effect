import type { Request, Response } from "express";

import { optionalEnv } from "../env";
import { consumeRateLimits, type RateRule } from "../security/rateLimiter";
import { getClientAddress } from "../security/requestIdentity";
import { sha256 } from "../utils/hash";
import { rejectDisallowedOrigin } from "./shared";
import {
  openSurveyResponseStream,
  readSurveyResponseLimit,
  readSurveyResponseSection,
} from "../services/surveyResponseFeed";

function buildRateRules(req: Request): RateRule[] {
  const salt = optionalEnv("RATE_LIMIT_SALT", "butterfly-effect-survey-stream");
  const ipHash = sha256(`${salt}:ip:${getClientAddress(req)}`);
  return [
    { key: `survey-stream:ip:${ipHash}:1m`, max: 30, windowSeconds: 60 },
    { key: `survey-stream:ip:${ipHash}:10m`, max: 120, windowSeconds: 10 * 60 },
  ];
}

export function surveyResponseStreamRoute(req: Request, res: Response) {
  if (rejectDisallowedOrigin(req, res)) return;

  const section = readSurveyResponseSection(req.query.section);
  if (!section) {
    res.status(400).json({ error: "Invalid section", code: "INVALID_SECTION" });
    return;
  }

  const rateLimit = consumeRateLimits(buildRateRules(req));
  if (!rateLimit.allowed) {
    res.status(429).json({
      error: "Too many stream connections",
      code: "RATE_LIMITED",
      ...(rateLimit.resetAt ? { resetAt: rateLimit.resetAt } : {}),
    });
    return;
  }

  const cleanup = openSurveyResponseStream({
    section,
    limit: readSurveyResponseLimit(req.query.limit),
    res,
  });

  req.on("close", cleanup);
}
