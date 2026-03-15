// services/sanity/api.ts
import { liveReadClient as liveClient } from './client';
import {
  enableMockSanityReadFallback,
  isSanityQuotaError,
  shouldUseMockSanityReads,
} from './config';
import {
  fetchMockSurveyData,
  subscribeMockSectionCounts,
  subscribeMockSurveyData,
} from './mockData';

// --- section ids (unchanged) ---
const STUDENT_IDS = [
  '3d-arts','animation','architecture','art-education','ceramics',
  'communication-design','creative-writing','design-innovation','digital-media',
  'dynamic-media-institute','fashion-design','fibers','film-video','fine-arts-2d',
  'furniture-design','glass','history-of-art','humanities','illustration',
  'industrial-design','integrative-sciences','jewelry-metalsmithing','liberal-arts',
  'mfa-low-residency','mfa-low-residency-foundation','mfa-studio-arts',
  'painting','photography','printmaking','sculpture','studio-arts',
  'studio-interrelated-media','studio-foundation','visual-storytelling',
  'fine-arts','design','foundations'
];

const STAFF_IDS = [
  'academic-affairs','academic-resource-center','administration-finance',
  'administrative-services','admissions','artward-bound','bookstore','bursar',
  'career-development','center-art-community','community-health','compass',
  'conference-event-services','counseling-center','facilities','fiscal-accounting',
  'fiscal-budget','graduate-programs','health-office','housing-residence-life',
  'human-resources','institutional-advancement','institutional-research',
  'international-education','justice-equity','library','marketing-communications',
  'maam','foundation','president-office','pce','public-safety','registrar',
  'student-development','student-engagement','student-financial-assistance',
  'sustainability','technology','woodshop','youth-programs'
];

const NON_VISITOR_MASSART = Array.from(new Set([...STUDENT_IDS, ...STAFF_IDS]));

// --- rounding helpers (3 dp) ---
const round3 = (v) => (typeof v === 'number' ? Math.round(v * 1000) / 1000 : undefined);

// normalize to the shape the viz uses (3 dp + weights{})
const normalizeRow = (r) => {
  const q1 = round3(r.q1), q2 = round3(r.q2), q3 = round3(r.q3), q4 = round3(r.q4), q5 = round3(r.q5);
  const avgWeight = round3(r.avgWeight);
  return {
    ...r,
    q1, q2, q3, q4, q5, avgWeight,
    weights: {
      question1: q1 ?? 0.5,
      question2: q2 ?? 0.5,
      question3: q3 ?? 0.5,
      question4: q4 ?? 0.5,
      question5: q5 ?? 0.5,
    },
  };
};

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
const isStudentSection = (section) => STUDENT_IDS.includes(section);
const isStaffSection = (section) => STAFF_IDS.includes(section);
const isMassArtSection = (section) => NON_VISITOR_MASSART.includes(section);

const buildSectionCounts = (rows) => {
  const counts = new Map();
  for (const r of rows || []) counts.set(r?.section || '', (counts.get(r?.section || '') || 0) + 1);
  const bySection = Object.fromEntries(counts);
  const sum = (ids) => ids.reduce((acc, id) => acc + (bySection[id] || 0), 0);

  return {
    all: rows?.length || 0,
    'all-massart': sum(NON_VISITOR_MASSART),
    'all-students': sum(STUDENT_IDS),
    'all-staff': sum(STAFF_IDS),
    visitor: bySection['visitor'] || 0,
    ...bySection,
  };
};

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
    currentRows = (rows || []).map(normalizeRow).sort(sortNewestFirst).slice(0, limit);
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

    currentRows = upsertSortedLimited(currentRows, normalizeRow(event.result), limit);
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

export const fetchSurveyData = (callback, { limit = 300 } = {}) => {
  if (shouldUseMockSanityReads()) {
    return fetchMockSurveyData(callback, { limit });
  }
  const query = `
    *[!(_id in path('drafts.**')) && _type == "userResponseV4"]
      | order(coalesce(submittedAt, _createdAt) desc)[0...$limit]{ ${PROJECTION} }
  `;
  let currentRows = [];
  let mockUnsub = null;
  let unsub = () => {};
  const emit = () => callback(currentRows);
  const pump = (rows) => {
    currentRows = (rows || []).map(normalizeRow).sort(sortNewestFirst).slice(0, limit);
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

    currentRows = upsertSortedLimited(currentRows, normalizeRow(event.result), limit);
    emit();
  };
  const refetch = () => {
    liveClient.fetch(query, { limit }).then(pump).catch((e) => {
      if (shouldFallbackToMock(e)) {
        poller.disable();
        try { unsub?.(); } catch {}
        mockUnsub = fetchMockSurveyData(callback, { limit });
        return;
      }
      console.error('[sanityAPI] refresh fetch', e);
    });
  };

  // single-shot + resilient refresh on change
  liveClient.fetch(query, { limit }).then(pump).catch((e) => {
    if (shouldFallbackToMock(e)) {
      mockUnsub = fetchMockSurveyData(callback, { limit });
      return;
    }
    console.error('[sanityAPI] initial fetch', e);
  });

  const poller = makePoller(() => {
    liveClient.fetch(query, { limit }).then(pump).catch((e) => console.error('[sanityAPI] poll fetch', e));
  }, 6000);

  unsub = resilientListen({
    query,
    params: { limit },
    onMutation: applyMutation,
    onReconnect: refetch,
    onError: (e) => {
      if (shouldFallbackToMock(e)) {
        poller.disable();
        mockUnsub = fetchMockSurveyData(callback, { limit });
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

export const subscribeSectionCounts = ({ onData }) => {
  if (shouldUseMockSanityReads()) {
    return subscribeMockSectionCounts({ onData });
  }
  const query = `*[!(_id in path('drafts.**')) && _type == "userResponseV4"]{ section }`;
  let currentCounts = {};
  let mockUnsub = null;
  let unsub = () => {};

  const emit = () => onData(currentCounts);
  const bumpCount = (counts, key, delta) => {
    if (!key) return;
    counts[key] = Math.max(0, (counts[key] || 0) + delta);
  };
  const applySectionDelta = (counts, section, delta) => {
    if (!section) return;
    bumpCount(counts, section, delta);
    bumpCount(counts, 'all', delta);
    if (isMassArtSection(section)) bumpCount(counts, 'all-massart', delta);
    if (isStudentSection(section)) bumpCount(counts, 'all-students', delta);
    if (isStaffSection(section)) bumpCount(counts, 'all-staff', delta);
    if (section === 'visitor') bumpCount(counts, 'visitor', delta);
  };
  const pump = (rows) => {
    currentCounts = buildSectionCounts(rows || []);
    emit();
  };
  const applyMutation = (event) => {
    const nextCounts = { ...currentCounts };
    const prevSection = event?.previous?.section || '';
    const nextSection = event?.result?.section || '';

    if (event?.transition === 'appear') {
      applySectionDelta(nextCounts, nextSection, 1);
      currentCounts = nextCounts;
      emit();
      return;
    }

    if (event?.transition === 'disappear') {
      applySectionDelta(nextCounts, prevSection, -1);
      currentCounts = nextCounts;
      emit();
      return;
    }

    if (event?.transition === 'update') {
      if (prevSection === nextSection) return;
      applySectionDelta(nextCounts, prevSection, -1);
      applySectionDelta(nextCounts, nextSection, 1);
      currentCounts = nextCounts;
      emit();
    }
  };
  const refetch = () => {
    liveClient.fetch(query, {}).then(pump).catch((e) => {
      if (shouldFallbackToMock(e)) {
        poller.disable();
        try { unsub?.(); } catch {}
        mockUnsub = subscribeMockSectionCounts({ onData });
        return;
      }
      console.error('[sanityAPI] counts refresh', e);
    });
  };

  liveClient.fetch(query, {}).then(pump).catch((e) => {
    if (shouldFallbackToMock(e)) {
      mockUnsub = subscribeMockSectionCounts({ onData });
      return;
    }
    console.error('[sanityAPI] counts initial', e);
  });

  const poller = makePoller(() => {
    liveClient.fetch(query, {}).then(pump).catch((e) => console.error('[sanityAPI] counts poll', e));
  }, 7000);

  unsub = resilientListen({
    query,
    params: {},
    onMutation: applyMutation,
    onReconnect: refetch,
    onError: (e) => {
      if (shouldFallbackToMock(e)) {
        poller.disable();
        mockUnsub = subscribeMockSectionCounts({ onData });
        return 'stop';
      }
      console.error('[sanityAPI] counts listen error', e?.message || e);
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
