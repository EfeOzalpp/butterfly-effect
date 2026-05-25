import { USE_MOCK_SANITY, enableMockSanityReadFallback, shouldUseMockSanityReads } from './config';
import { createMockUserResponse } from './mockData';
import type { SurveyWeights } from './types';

export interface SavedUserResponse {
  _id: string;
  section?: string;
  q1?: number;
  q2?: number;
  q3?: number;
  q4?: number;
  q5?: number;
  avgWeight?: number;
  submittedAt?: string;
}

interface EdgeSavePayload {
  section: string;
  weights: SurveyWeights;
  clientId: string;
  clientRequestId: string;
  website: string;
}

interface EdgeErrorBody {
  error?: string;
  code?: string;
  resetAt?: string;
}

class EdgeSaveError extends Error {
  readonly code?: string;
  readonly status: number;
  readonly resetAt?: string;

  constructor(message: string, status: number, code?: string, resetAt?: string) {
    super(message);
    this.name = 'EdgeSaveError';
    this.status = status;
    this.code = code;
    this.resetAt = resetAt;
  }
}

const clamp01 = (v?: number) =>
  typeof v === 'number' ? Math.max(0, Math.min(1, v)) : undefined;

const round3 = (v?: number) =>
  typeof v === 'number' ? Math.round(v * 1000) / 1000 : undefined;

function readErrorMessage(value: unknown): string | null {
  if (!value || typeof value !== 'object') return null;
  const record = value as Record<string, unknown>;
  return typeof record.error === 'string' ? record.error : null;
}

function readEdgeErrorBody(value: unknown): EdgeErrorBody {
  if (!value || typeof value !== 'object') return {};
  const record = value as Record<string, unknown>;
  return {
    error: typeof record.error === 'string' ? record.error : undefined,
    code: typeof record.code === 'string' ? record.code : undefined,
    resetAt: typeof record.resetAt === 'string' ? record.resetAt : undefined,
  };
}

function isSavedUserResponse(value: unknown): value is SavedUserResponse {
  if (!value || typeof value !== 'object') return false;
  const record = value as Record<string, unknown>;
  return typeof record._id === 'string';
}

function makeRandomId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
}

function getClientId(): string {
  if (typeof window === 'undefined') return makeRandomId();

  const key = 'be.clientId';
  try {
    const existing = window.localStorage.getItem(key);
    if (existing) return existing;

    const next = makeRandomId();
    window.localStorage.setItem(key, next);
    return next;
  } catch {
    return makeRandomId();
  }
}

function shouldFallbackToMockWrite(error: unknown) {
  return error instanceof EdgeSaveError && error.code === 'SANITY_WRITE_UNAVAILABLE';
}

export async function saveUserResponse(section: string, weights: SurveyWeights): Promise<SavedUserResponse> {
  const clamped: SurveyWeights = {
    q1: round3(clamp01(weights.q1)),
    q2: round3(clamp01(weights.q2)),
    q3: round3(clamp01(weights.q3)),
    q4: round3(clamp01(weights.q4)),
    q5: round3(clamp01(weights.q5)),
  };

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

  if (typeof window !== 'undefined') {
    sessionStorage.setItem('be.myEntryId', created._id);
    sessionStorage.setItem('be.mySection', section);
    sessionStorage.setItem('be.justSubmitted', '1');

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
        submittedAt: created.submittedAt,
      };
      sessionStorage.setItem('be.myDoc', JSON.stringify(snapshot));
    } catch (err) {
      console.warn('[saveUserResponse] Failed to persist snapshot to sessionStorage:', err);
    }
  }

  return created;
}

async function saveUserResponseViaEdge(section: string, weights: SurveyWeights): Promise<SavedUserResponse> {
  const supabaseUrl: unknown = import.meta.env.VITE_SUPABASE_URL;
  const supabasePublishableKey: unknown =
    import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ?? import.meta.env.VITE_SUPABASE_ANON_KEY;

  if (typeof supabaseUrl !== 'string' || supabaseUrl.length === 0) {
    throw new Error('Missing VITE_SUPABASE_URL');
  }
  if (typeof supabasePublishableKey !== 'string' || supabasePublishableKey.length === 0) {
    throw new Error('Missing VITE_SUPABASE_PUBLISHABLE_KEY');
  }

  const payload: EdgeSavePayload = {
    section,
    weights,
    clientId: getClientId(),
    clientRequestId: makeRandomId(),
    // Quiet bot trap. The UI never fills this, so the edge function can reject it if it appears.
    website: '',
  };

  const res = await fetch(`${supabaseUrl}/functions/v1/save-user-response`, {
    method: 'POST',
    headers: {
      apikey: supabasePublishableKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const json: unknown = await res.json().catch(() => null);
  if (!res.ok) {
    const edgeError = readEdgeErrorBody(json);
    const message = readErrorMessage(json) ?? `Edge function request failed with status ${String(res.status)}`;
    throw new EdgeSaveError(message, res.status, edgeError.code, edgeError.resetAt);
  }

  if (!isSavedUserResponse(json)) {
    throw new Error('Edge function returned an invalid response');
  }

  return json;
}
