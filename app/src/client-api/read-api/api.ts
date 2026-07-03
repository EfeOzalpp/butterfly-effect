// src/client-api/read-api/api.ts
// Survey reads through the same-origin backend SSE stream, with mock-data fallback when reads are unavailable.

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

interface SurveyResponsesEvent {
  rows?: unknown;
}

function isSurveyRows(value: unknown): value is SurveyRow[] {
  return Array.isArray(value) && value.every((row) => {
    if (!row || typeof row !== 'object') return false;
    const record = row as Record<string, unknown>;
    return typeof record._id === 'string' && typeof record.section === 'string';
  });
}

function readRowsFromEvent(event: MessageEvent) {
  const body = JSON.parse(event.data as string) as SurveyResponsesEvent;
  if (!isSurveyRows(body.rows)) {
    throw new Error('Survey stream returned an invalid snapshot');
  }
  return body.rows;
}

function streamUrl(section: string, limit: number) {
  const url = new URL('/api/survey-responses/stream', window.location.origin);
  url.searchParams.set('section', section);
  url.searchParams.set('limit', String(limit));
  return url;
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
  let source: EventSource | null = new EventSource(streamUrl(section, limit));

  const switchToMock = (error: unknown) => {
    if (closed || mockUnsub) return;
    source?.close();
    source = null;
    enableMockReadFallback(error);
    mockUnsub = subscribeMockSurveyData({ section, limit, onData });
  };

  source.addEventListener('snapshot', (event) => {
    if (closed || mockUnsub) return;
    try {
      onData(readRowsFromEvent(event as MessageEvent));
    } catch (error) {
      switchToMock(error);
    }
  });

  source.addEventListener('stream-error', (event) => {
    if (closed || mockUnsub) return;
    switchToMock(new Error((event as MessageEvent).data as string));
  });

  source.onerror = (error) => {
    if (closed || mockUnsub) return;
    console.error('[read-api] survey response stream', error);
  };

  return () => {
    closed = true;
    source?.close();
    mockUnsub?.();
  };
}
