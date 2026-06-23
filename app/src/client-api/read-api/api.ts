// src/client-api/read-api/api.ts
// Survey reads through the same-origin backend, with mock-data fallback when reads are unavailable.

import {
  enableMockReadFallback,
  shouldUseMockReads,
} from './config';
import { subscribeMockSurveyData } from '../mock-survey-data/mockData';
import type { SurveyRow, Unsubscribe } from '../../domain/survey/types';

interface SubscribeSurveyDataArgs {
  section: string;
  limit?: number;
  onData: (rows: SurveyRow[]) => void;
}

interface SurveyResponsesBody {
  rows?: unknown;
}

class ReadApiError extends Error {
  readonly status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = 'ReadApiError';
    this.status = status;
  }
}

function isSurveyRows(value: unknown): value is SurveyRow[] {
  return Array.isArray(value) && value.every((row) => {
    if (!row || typeof row !== 'object') return false;
    const record = row as Record<string, unknown>;
    return typeof record._id === 'string' && typeof record.section === 'string';
  });
}

function shouldFallbackToMock(error: unknown) {
  if (!(error instanceof ReadApiError)) return false;
  return error.status === 403 || error.status === 429 || error.status >= 500;
}

async function fetchSurveyRows(section: string, limit: number): Promise<SurveyRow[]> {
  const url = new URL('/api/survey-responses', window.location.origin);
  url.searchParams.set('section', section);
  url.searchParams.set('limit', String(limit));

  const response = await fetch(url, {
    headers: {
      Accept: 'application/json',
    },
  });
  const body: SurveyResponsesBody = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new ReadApiError(
      `Survey read API failed with status ${String(response.status)}`,
      response.status
    );
  }

  if (!isSurveyRows(body.rows)) {
    throw new ReadApiError('Survey read API returned an invalid response', 502);
  }

  return body.rows;
}

export function subscribeSurveyData({
  section,
  limit = 300,
  onData,
}: SubscribeSurveyDataArgs): Unsubscribe {
  if (shouldUseMockReads()) {
    return subscribeMockSurveyData({ section, limit, onData });
  }

  let closed = false;
  let mockUnsub: Unsubscribe | null = null;
  let timer: number | null = null;

  const clearTimer = () => {
    if (timer === null) return;
    window.clearTimeout(timer);
    timer = null;
  };

  const switchToMock = (error: unknown) => {
    if (closed || mockUnsub) return;
    clearTimer();
    enableMockReadFallback(error);
    mockUnsub = subscribeMockSurveyData({ section, limit, onData });
  };

  const schedule = () => {
    clearTimer();
    if (closed || mockUnsub) return;
    timer = window.setTimeout(() => {
      void refresh();
    }, 6000);
  };

  const refresh = async () => {
    try {
      const rows = await fetchSurveyRows(section, limit);
      if (closed || mockUnsub) return;
      onData(rows);
      schedule();
    } catch (error) {
      if (closed) return;
      if (shouldFallbackToMock(error)) {
        switchToMock(error);
        return;
      }
      console.error('[read-api] survey rows', error);
      schedule();
    }
  };

  void refresh();

  return () => {
    closed = true;
    clearTimer();
    mockUnsub?.();
  };
}
