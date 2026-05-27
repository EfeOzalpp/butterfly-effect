// src/services/sanity/api.ts
// Live survey reads with a mock-data fallback when Sanity is unavailable.

import type { ListenEvent, MutationEvent } from '@sanity/client';

import { liveReadClient as liveClient } from './client';
import {
  enableMockSanityReadFallback,
  isSanityQuotaError,
  shouldUseMockSanityReads,
} from './config';
import { subscribeMockSurveyData } from './mockData';
import { normalizeSurveyRow } from './normalizeSurveyRow';
import { NON_VISITOR_MASSART, STAFF_IDS, STUDENT_IDS } from './sections';
import type {
  NormalizedSurveyRow,
  QueryAndParams,
  RawSurveyRow,
  SubscribeSurveyDataArgs,
  Unsubscribe,
} from './types';

const PROJECTION = `
  _id, section,
  q1, q2, q3, q4, q5,
  avgWeight,
  soloMessage,
  soloMessageUpdatedAt,
  submittedAt,
  _createdAt
`;

interface Poller {
  enable: () => void;
  disable: () => void;
}

interface ResilientListenParams {
  query: string;
  params: Record<string, unknown>;
  onMutation?: (event: MutationEvent<RawSurveyRow>) => void;
  onReconnect?: () => void;
  onError?: (error: unknown) => 'stop' | undefined;
  poller?: Poller;
}

function makePoller(fn: () => void, intervalMs = 6000): Poller {
  let timer: number | null = null;

  return {
    enable() {
      timer ??= window.setInterval(() => {
        fn();
      }, intervalMs);
    },
    disable() {
      if (timer === null) return;
      window.clearInterval(timer);
      timer = null;
    },
  };
}

function resilientListen({
  query,
  params,
  onMutation,
  onReconnect,
  onError,
  poller,
}: ResilientListenParams): Unsubscribe {
  let sub: { unsubscribe: () => void } | null = null;
  let closed = false;
  let attempt = 0;
  let shouldResyncOnWelcome = false;
  let reconnectTimer: number | null = null;

  const baseDelay = 1500;
  const maxDelay = 20000;

  const clearReconnectTimer = () => {
    if (reconnectTimer === null) return;
    window.clearTimeout(reconnectTimer);
    reconnectTimer = null;
  };

  const reconnectAfter = (delay: number) => {
    clearReconnectTimer();
    reconnectTimer = window.setTimeout(() => {
      reconnectTimer = null;
      if (closed || shouldUseMockSanityReads()) return;
      poller?.disable();
      start();
    }, delay);
  };

  const start = () => {
    if (closed || shouldUseMockSanityReads()) return;

    try {
      sub = liveClient
        .listen<RawSurveyRow>(query, params, {
          visibility: 'query',
          includeResult: true,
          includePreviousRevision: true,
        })
        .subscribe({
          next: (event: ListenEvent<RawSurveyRow>) => {
            poller?.disable();

            if (event.type === 'mutation') {
              onMutation?.(event);
              attempt = 0;
              return;
            }

            if (event.type === 'welcome' && shouldResyncOnWelcome) {
              shouldResyncOnWelcome = false;
              onReconnect?.();
            }
          },
          error: (error: unknown) => {
            const stop = onError?.(error) === 'stop';
            if (stop || shouldUseMockSanityReads()) return;

            poller?.enable();
            attempt += 1;
            shouldResyncOnWelcome = true;
            reconnectAfter(Math.min(maxDelay, baseDelay * Math.pow(1.6, attempt)));
          },
          complete: () => {
            if (closed || shouldUseMockSanityReads()) return;

            poller?.enable();
            shouldResyncOnWelcome = true;
            reconnectAfter(baseDelay);
          },
        });
    } catch (error: unknown) {
      const stop = onError?.(error) === 'stop';
      if (stop || shouldUseMockSanityReads()) return;

      poller?.enable();
      shouldResyncOnWelcome = true;
      reconnectAfter(baseDelay);
    }
  };

  start();

  return () => {
    closed = true;
    sub?.unsubscribe();
    poller?.disable();
    clearReconnectTimer();
  };
}

const newestTimestampOf = (row: NormalizedSurveyRow) => {
  const raw = row.submittedAt ?? row._createdAt;
  const ts = Date.parse(raw);
  return Number.isFinite(ts) ? ts : 0;
};

const sortNewestFirst = (a: NormalizedSurveyRow, b: NormalizedSurveyRow) =>
  newestTimestampOf(b) - newestTimestampOf(a);

const upsertSortedLimited = (
  rows: NormalizedSurveyRow[],
  nextRow: NormalizedSurveyRow,
  limit: number
) => {
  const filtered = rows.filter((row) => row._id !== nextRow._id);
  return [...filtered, nextRow].sort(sortNewestFirst).slice(0, limit);
};

const removeById = (rows: NormalizedSurveyRow[], id: string) =>
  rows.filter((row) => row._id !== id);

const noop: Unsubscribe = () => {
  // Filled once the live listener starts.
};

const shouldFallbackToMock = (error: unknown) => {
  if (!isSanityQuotaError(error)) return false;
  enableMockSanityReadFallback(error);
  return true;
};

function buildQueryAndParams(section: string, limit: number): QueryAndParams {
  const BASE = "*[!(_id in path('drafts.**')) && _type == 'userResponseV4'";
  if (!section || section === 'all') {
    return {
      query: `${BASE}] | order(coalesce(submittedAt, _createdAt) desc)[0...$limit]{ ${PROJECTION} }`,
      params: { limit },
    };
  }
  if (section === 'all-massart') {
    return {
      query: `${BASE} && section in $sections] | order(coalesce(submittedAt, _createdAt) desc)[0...$limit]{ ${PROJECTION} }`,
      params: { sections: NON_VISITOR_MASSART, limit },
    };
  }
  if (section === 'all-students') {
    return {
      query: `${BASE} && section in $sections] | order(coalesce(submittedAt, _createdAt) desc)[0...$limit]{ ${PROJECTION} }`,
      params: { sections: STUDENT_IDS, limit },
    };
  }
  if (section === 'all-staff') {
    return {
      query: `${BASE} && section in $sections] | order(coalesce(submittedAt, _createdAt) desc)[0...$limit]{ ${PROJECTION} }`,
      params: { sections: STAFF_IDS, limit },
    };
  }
  return {
    query: `${BASE} && section == $section] | order(coalesce(submittedAt, _createdAt) desc)[0...$limit]{ ${PROJECTION} }`,
    params: { section, limit },
  };
}

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : String(error);
}

export function subscribeSurveyData({
  section,
  limit = 300,
  onData,
}: SubscribeSurveyDataArgs): Unsubscribe {
  if (shouldUseMockSanityReads()) {
    return subscribeMockSurveyData({ section, limit, onData });
  }

  const { query, params } = buildQueryAndParams(section, limit);
  let currentRows: NormalizedSurveyRow[] = [];
  let mockUnsub: Unsubscribe | null = null;
  let unsub: Unsubscribe = noop;
  let closed = false;

  const emit = () => {
    if (closed) return;
    onData(currentRows);
  };

  const pump = (rows: RawSurveyRow[]) => {
    if (closed) return;
    currentRows = rows.map(normalizeSurveyRow).sort(sortNewestFirst).slice(0, limit);
    emit();
  };

  const fetchRows = () => liveClient.fetch<RawSurveyRow[]>(query, params);

  const switchToMock = () => {
    if (closed || mockUnsub) return;
    poller.disable();
    unsub();
    mockUnsub = subscribeMockSurveyData({ section, limit, onData });
  };

  const applyMutation = (event: MutationEvent<RawSurveyRow>) => {
    if (closed) return;
    if (event.transition === 'disappear') {
      currentRows = removeById(currentRows, event.documentId);
      emit();
      return;
    }

    if (!event.result) return;

    currentRows = upsertSortedLimited(currentRows, normalizeSurveyRow(event.result), limit);
    emit();
  };

  const refetch = () => {
    fetchRows()
      .then(pump)
      .catch((error: unknown) => {
        if (closed) return;
        if (shouldFallbackToMock(error)) {
          switchToMock();
          return;
        }
        console.error('[sanityAPI] refresh fetch', error);
      });
  };

  const poller = makePoller(() => {
    fetchRows().then(pump).catch((error: unknown) => {
      if (closed) return;
      console.error('[sanityAPI] poll fetch', error);
    });
  }, 6000);

  fetchRows()
    .then(pump)
    .catch((error: unknown) => {
      if (closed) return;
      if (shouldFallbackToMock(error)) {
        switchToMock();
        return;
      }
      console.error('[sanityAPI] initial fetch', error);
    });

  unsub = resilientListen({
    query,
    params,
    onMutation: applyMutation,
    onReconnect: refetch,
    onError: (error) => {
      if (closed) return 'stop';
      if (shouldFallbackToMock(error)) {
        switchToMock();
        return 'stop';
      }
      console.error('[sanityAPI] listen error', errorMessage(error));
      return undefined;
    },
    poller,
  });

  return () => {
    closed = true;
    unsub();
    mockUnsub?.();
    poller.disable();
  };
}

export { STUDENT_IDS, STAFF_IDS, NON_VISITOR_MASSART };
