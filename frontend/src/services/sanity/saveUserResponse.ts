import { USE_MOCK_SANITY, shouldUseMockSanityReads } from './config';
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

const clamp01 = (v?: number) =>
  typeof v === 'number' ? Math.max(0, Math.min(1, v)) : undefined;

const round3 = (v?: number) =>
  typeof v === 'number' ? Math.round(v * 1000) / 1000 : undefined;

function readErrorMessage(value: unknown): string | null {
  if (!value || typeof value !== 'object') return null;
  const record = value as Record<string, unknown>;
  return typeof record.error === 'string' ? record.error : null;
}

function isSavedUserResponse(value: unknown): value is SavedUserResponse {
  if (!value || typeof value !== 'object') return false;
  const record = value as Record<string, unknown>;
  return typeof record._id === 'string';
}

export async function saveUserResponse(section: string, weights: SurveyWeights): Promise<SavedUserResponse> {
  const clamped: SurveyWeights = {
    q1: round3(clamp01(weights.q1)),
    q2: round3(clamp01(weights.q2)),
    q3: round3(clamp01(weights.q3)),
    q4: round3(clamp01(weights.q4)),
    q5: round3(clamp01(weights.q5)),
  };

  const created = (USE_MOCK_SANITY || shouldUseMockSanityReads())
    ? createMockUserResponse(section, clamped)
    : await saveUserResponseViaEdge(section, clamped);

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
  const supabaseAnonKey: unknown = import.meta.env.VITE_SUPABASE_ANON_KEY;

  if (typeof supabaseUrl !== 'string' || supabaseUrl.length === 0) {
    throw new Error('Missing VITE_SUPABASE_URL');
  }
  if (typeof supabaseAnonKey !== 'string' || supabaseAnonKey.length === 0) {
    throw new Error('Missing VITE_SUPABASE_ANON_KEY');
  }

  const res = await fetch(`${supabaseUrl}/functions/v1/save-user-response`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${supabaseAnonKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ section, weights }),
  });

  const json: unknown = await res.json().catch(() => null);
  if (!res.ok) {
    const message = readErrorMessage(json) ?? `Edge function request failed with status ${String(res.status)}`;
    throw new Error(message);
  }

  if (!isSavedUserResponse(json)) {
    throw new Error('Edge function returned an invalid response');
  }

  return json;
}
