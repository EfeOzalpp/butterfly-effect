import { USE_MOCK_SANITY, shouldUseMockSanityReads } from './config';
import { createMockUserResponse } from './mockData';

type Weights = { q1?: number; q2?: number; q3?: number; q4?: number; q5?: number };

const clamp01 = (v?: number) =>
  typeof v === 'number' ? Math.max(0, Math.min(1, v)) : undefined;

const round3 = (v?: number) =>
  typeof v === 'number' ? Math.round(v * 1000) / 1000 : undefined;

export async function saveUserResponse(section: string, weights: Weights) {
  const clamped: Weights = {
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

async function saveUserResponseViaEdge(section: string, weights: Weights) {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

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

  const json = await res.json().catch(() => null);
  if (!res.ok) {
    const message =
      json && typeof json.error === 'string'
        ? json.error
        : `Edge function request failed with status ${res.status}`;
    throw new Error(message);
  }

  return json;
}
