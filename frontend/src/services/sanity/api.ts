// services/sanity/api.ts
import { liveReadClient as liveClient } from './client';
import {
  enableMockSanityReadFallback,
  isSanityQuotaError,
  shouldUseMockSanityReads,
} from './config';
import { normalizeSurveyRow } from './normalizeSurveyRow';
import { subscribeMockSurveyData } from './mockData';
import { NON_VISITOR_MASSART, STAFF_IDS, STUDENT_IDS } from './sections';

const PROJECTION = `
  _id, section,
  q1, q2, q3, q4, q5,
  avgWeight,
  submittedAt,
  _createdAt
`;

// -------------------
// Resilience helpers
// -------------------
function makePoller(fn, intervalMs = 6000) {
  let timer = null;
  return {
    enable() { if (!timer) timer = setInterval(fn, intervalMs); },
    disable() { if (timer) { clearInterval(timer); timer = null; } },
  };
}

/**
 * Resilient SSE listener:
 * - uses liveClient.listen (avoids CDN HTTP/3 quirks)
 * - on error/complete: backoff & temporarily enable polling
 */
function resilientListen({ query, params, onMutation, onReconnect, onError, poller }) {
  let sub;
  let closed = false;

  let attempt = 0;
  const baseDelay = 1500;
  const maxDelay = 20000;
  let shouldResyncOnWelcome = false;

  const start = () => {
    if (closed || shouldUseMockSanityReads()) return;
    try {
      sub = liveClient
        .listen(query, params, {
          visibility: 'query',
          includeResult: true,
          includePreviousRevision: true,
        })
        .subscribe({
        next: (event) => {
          poller?.disable();

          if (event?.type === 'mutation') {
            onMutation?.(event);
            attempt = 0;
            return;
          }

          if (event?.type === 'welcome' && shouldResyncOnWelcome) {
            shouldResyncOnWelcome = false;
            onReconnect?.();
          }
        },
        error: (e) => {
          const stop = onError?.(e) === 'stop';
          if (stop || shouldUseMockSanityReads()) return;
          // turn on polling while we back off
          poller?.enable();
          attempt += 1;
          shouldResyncOnWelcome = true;
          const delay = Math.min(maxDelay, baseDelay * Math.pow(1.6, attempt));
          setTimeout(() => {
            if (closed || shouldUseMockSanityReads()) return;
            poller?.disable();
            start();
          }, delay);
        },
        complete: () => {
          // stream closed by server; try reconnect after a short delay
          if (!closed && !shouldUseMockSanityReads()) {
            poller?.enable();
            shouldResyncOnWelcome = true;
            setTimeout(() => {
              if (closed || shouldUseMockSanityReads()) return;
              poller?.disable();
              start();
            }, baseDelay);
          }
        },
      });
    } catch (e) {
      const stop = onError?.(e) === 'stop';
      if (stop || shouldUseMockSanityReads()) return;
      poller?.enable();
      shouldResyncOnWelcome = true;
      setTimeout(() => {
        if (closed || shouldUseMockSanityReads()) return;
        poller?.disable();
        start();
      }, baseDelay);
    }
  };

  start();

  return () => {
    closed = true;
    try { sub?.unsubscribe?.(); } catch {}
  };
}

const newestTimestampOf = (row) => {
  const raw = row?.submittedAt || row?._createdAt || '';
  const ts = Date.parse(raw);
  return Number.isFinite(ts) ? ts : 0;
};

const sortNewestFirst = (a, b) => newestTimestampOf(b) - newestTimestampOf(a);

const upsertSortedLimited = (rows, nextRow, limit) => {
  const filtered = rows.filter((row) => row?._id !== nextRow?._id);
  return [...filtered, nextRow].sort(sortNewestFirst).slice(0, limit);
};

const removeById = (rows, id) => rows.filter((row) => row?._id !== id);

const shouldFallbackToMock = (error) => {
  if (!isSanityQuotaError(error)) return false;
  enableMockSanityReadFallback(error);
  return true;
};

// -------------------
// Queries
// -------------------
function buildQueryAndParams(section, limit) {
  const BASE = "*[!(_id in path('drafts.**')) && _type == 'userResponseV4'";
  if (!section || section === 'all') {
    return { query: `${BASE}] | order(coalesce(submittedAt, _createdAt) desc)[0...$limit]{ ${PROJECTION} }`, params: { limit } };
  }
  if (section === 'all-massart') {
    return { query: `${BASE} && section in $sections] | order(coalesce(submittedAt, _createdAt) desc)[0...$limit]{ ${PROJECTION} }`, params: { sections: NON_VISITOR_MASSART, limit } };
  }
  if (section === 'all-students') {
    return { query: `${BASE} && section in $sections] | order(coalesce(submittedAt, _createdAt) desc)[0...$limit]{ ${PROJECTION} }`, params: { sections: STUDENT_IDS, limit } };
  }
  if (section === 'all-staff') {
    return { query: `${BASE} && section in $sections] | order(coalesce(submittedAt, _createdAt) desc)[0...$limit]{ ${PROJECTION} }`, params: { sections: STAFF_IDS, limit } };
  }
  return { query: `${BASE} && section == $section] | order(coalesce(submittedAt, _createdAt) desc)[0...$limit]{ ${PROJECTION} }`, params: { section, limit } };
}

// -------------------
// Public API
// -------------------
export const subscribeSurveyData = ({ section, limit = 300, onData }) => {
  if (shouldUseMockSanityReads()) {
    return subscribeMockSurveyData({ section, limit, onData });
  }
  const { query, params } = buildQueryAndParams(section, limit);
  let currentRows = [];
  let mockUnsub = null;
  let unsub = () => {};

  const emit = () => onData(currentRows);
  const pump = (rows) => {
    currentRows = (rows || []).map(normalizeSurveyRow).sort(sortNewestFirst).slice(0, limit);
    emit();
  };
  const applyMutation = (event) => {
    if (!event?.documentId) return;

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
    liveClient.fetch(query, params).then(pump).catch((e) => {
      if (shouldFallbackToMock(e)) {
        poller.disable();
        try { unsub?.(); } catch {}
        mockUnsub = subscribeMockSurveyData({ section, limit, onData });
        return;
      }
      console.error('[sanityAPI] refresh fetch', e);
    });
  };

  // initial fetch
  liveClient.fetch(query, params).then(pump).catch((e) => {
    if (shouldFallbackToMock(e)) {
      mockUnsub = subscribeMockSurveyData({ section, limit, onData });
      return;
    }
    console.error('[sanityAPI] initial fetch', e);
  });

  // polling fallback while SSE is down
  const poller = makePoller(() => {
    liveClient.fetch(query, params).then(pump).catch((e) => console.error('[sanityAPI] poll fetch', e));
  }, 6000);

  unsub = resilientListen({
    query,
    params,
    onMutation: applyMutation,
    onReconnect: refetch,
    onError: (e) => {
      if (shouldFallbackToMock(e)) {
        poller.disable();
        mockUnsub = subscribeMockSurveyData({ section, limit, onData });
        return 'stop';
      }
      console.error('[sanityAPI] listen error', e?.message || e);
      return undefined;
    },
    poller,
  });

  return () => {
    try { unsub?.(); } catch {}
    try { mockUnsub?.(); } catch {}
    poller.disable();
  };
};

export { STUDENT_IDS, STAFF_IDS, NON_VISITOR_MASSART };
