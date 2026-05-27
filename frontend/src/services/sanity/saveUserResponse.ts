import { USE_MOCK_SANITY, enableMockSanityReadFallback, shouldUseMockSanityReads } from './config';
import { createMockUserResponse } from './mockData';
import type { SurveyWeights } from './types';
import { getSessionItem, setSessionItem } from '../../app/session';
import {
  EdgeFunctionError,
  getClientId,
  getSupabaseEdgeConfig,
  makeEdgeFunctionError,
  makeRandomId,
} from './edgeFunction';

export interface SavedUserResponse {
  _id: string;
  section?: string;
  q1?: number;
  q2?: number;
  q3?: number;
  q4?: number;
  q5?: number;
  avgWeight?: number;
  soloMessage?: string;
  soloMessageUpdatedAt?: string;
  submittedAt?: string;
}

interface EdgeSavePayload {
  section: string;
  weights: SurveyWeights;
  clientId: string;
  clientRequestId: string;
  editToken?: string;
  website: string;
}

const clamp01 = (v?: number) =>
  typeof v === 'number' ? Math.max(0, Math.min(1, v)) : undefined;

const round3 = (v?: number) =>
  typeof v === 'number' ? Math.round(v * 1000) / 1000 : undefined;

const computeAvg = (weights: SurveyWeights) => {
  const vals = [weights.q1, weights.q2, weights.q3, weights.q4, weights.q5].filter(
    (x): x is number => Number.isFinite(x)
  );
  if (!vals.length) return undefined;
  return vals.reduce((a, b) => a + b, 0) / vals.length;
};

function normalizeWeights(weights: SurveyWeights): SurveyWeights {
  return {
    q1: round3(clamp01(weights.q1)),
    q2: round3(clamp01(weights.q2)),
    q3: round3(clamp01(weights.q3)),
    q4: round3(clamp01(weights.q4)),
    q5: round3(clamp01(weights.q5)),
  };
}

function isSavedUserResponse(value: unknown): value is SavedUserResponse {
  if (!value || typeof value !== 'object') return false;
  const record = value as Record<string, unknown>;
  return typeof record._id === 'string';
}

export function ensureUserResponseEditToken(): string {
  const existing = getSessionItem('be.myEditToken');
  if (existing) return existing;

  const next = makeRandomId();
  setSessionItem('be.myEditToken', next);
  return next;
}

function shouldFallbackToMockWrite(error: unknown) {
  return error instanceof EdgeFunctionError && error.code === 'SANITY_WRITE_UNAVAILABLE';
}

function shouldRetryWithoutEditToken(error: unknown) {
  return (
    error instanceof EdgeFunctionError &&
    error.functionName === 'save-user-response' &&
    error.status === 400 &&
    /unexpected payload|edit token/i.test(error.message)
  );
}

export function createOptimisticUserResponse(section: string, weights: SurveyWeights): SavedUserResponse {
  const clamped = normalizeWeights(weights);
  const submittedAt = new Date().toISOString();
  const avgWeight = round3(computeAvg(clamped)) ?? 0.5;

  return {
    _id: `pending-${makeRandomId()}`,
    section,
    q1: clamped.q1 ?? 0.5,
    q2: clamped.q2 ?? 0.5,
    q3: clamped.q3 ?? 0.5,
    q4: clamped.q4 ?? 0.5,
    q5: clamped.q5 ?? 0.5,
    avgWeight,
    submittedAt,
  };
}

export function persistUserResponseSession(created: SavedUserResponse, section: string) {
  if (typeof window === 'undefined') return;

  try {
    setSessionItem('be.myEntryId', created._id);
    setSessionItem('be.mySection', section);
    setSessionItem('be.justSubmitted', '1');
  } catch (err) {
    console.warn('[saveUserResponse] Failed to persist identity to browser storage:', err);
  }

  try {
    const snapshot = {
      _id: created._id,
      section,
      q1: created.q1,
      q2: created.q2,
      q3: created.q3,
      q4: created.q4,
      q5: created.q5,
      avgWeight: created.avgWeight,
      soloMessage: created.soloMessage,
      soloMessageUpdatedAt: created.soloMessageUpdatedAt,
      submittedAt: created.submittedAt,
    };
    setSessionItem('be.myDoc', JSON.stringify(snapshot));
  } catch (err) {
    console.warn('[saveUserResponse] Failed to persist snapshot to browser storage:', err);
  }
}

export async function saveUserResponse(section: string, weights: SurveyWeights): Promise<SavedUserResponse> {
  const clamped = normalizeWeights(weights);

  let created: SavedUserResponse;
  if (USE_MOCK_SANITY || shouldUseMockSanityReads()) {
    created = createMockUserResponse(section, clamped);
  } else {
    try {
      created = await saveUserResponseViaEdge(section, clamped);
    } catch (error) {
      if (!shouldFallbackToMockWrite(error)) throw error;

      enableMockSanityReadFallback(error);
      created = createMockUserResponse(section, clamped);
    }
  }

  persistUserResponseSession(created, section);

  return created;
}

async function saveUserResponseViaEdge(section: string, weights: SurveyWeights): Promise<SavedUserResponse> {
  const edge = getSupabaseEdgeConfig();
  const basePayload = {
    section,
    weights,
    clientId: getClientId(),
    // Quiet bot trap. The UI never fills this, so the edge function can reject it if it appears.
    website: '',
  };

  const payload: EdgeSavePayload = {
    ...basePayload,
    clientRequestId: makeRandomId(),
    editToken: ensureUserResponseEditToken(),
  };

  try {
    return await postSaveUserResponse(edge, payload);
  } catch (error) {
    if (!shouldRetryWithoutEditToken(error)) throw error;

    console.warn(
      '[saveUserResponse] save-user-response edge function does not accept editToken yet; retrying legacy payload.'
    );
    return await postSaveUserResponse(edge, {
      ...basePayload,
      clientRequestId: makeRandomId(),
    });
  }
}

async function postSaveUserResponse(
  edge: ReturnType<typeof getSupabaseEdgeConfig>,
  payload: EdgeSavePayload
): Promise<SavedUserResponse> {
  const res = await fetch(`${edge.url}/functions/v1/save-user-response`, {
    method: 'POST',
    keepalive: true,
    headers: {
      apikey: edge.publishableKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const json: unknown = await res.json().catch(() => null);
  if (!res.ok) {
    throw makeEdgeFunctionError(
      'save-user-response',
      res.status,
      json,
      `Edge function request failed with status ${String(res.status)}`
    );
  }

  if (!isSavedUserResponse(json)) {
    throw new Error('Edge function returned an invalid response');
  }

  return json;
}
