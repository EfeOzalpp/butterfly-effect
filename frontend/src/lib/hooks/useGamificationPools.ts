// src/utils/useGamificationPools.ts
import { useMemo, useSyncExternalStore } from 'react';
import { cdnClient, liveReadClient as liveClient } from '../../services/sanity/client';
import {
  enableMockSanityReadFallback,
  isSanityQuotaError,
  shouldUseMockSanityReads,
  subscribeMockSanityReadMode,
} from '../../services/sanity/config';
import { storageKeyFor, safeSession, bucketForPercent } from '../utils/color-and-interpolation';

type Doc = {
  _id: string;
  _updatedAt: string;
  range?: { minPct: number; maxPct: number };
  titles?: string[];
  secondary?: string[];
  enabled?: boolean;
};

type PoolState = {
  docs: Doc[];
  rev: string;      // increments when docs change (use _updatedAt max)
  loaded: boolean;  // true after first live fetch completes
};

const GENERAL_MOCK_DOCS: Doc[] = [
  {
    _id: 'mock-general-0-20',
    _updatedAt: 'mock',
    range: { minPct: 0, maxPct: 20 },
    titles: ['Early Climate Learner', 'Starting the Journey'],
    secondary: ['A few small shifts can move this quickly.', 'You are at the beginning, not the end.'],
  },
  {
    _id: 'mock-general-21-40',
    _updatedAt: 'mock',
    range: { minPct: 21, maxPct: 40 },
    titles: ['Building Better Habits', 'Momentum Matters'],
    secondary: ['There is movement here, but still room to grow.', 'A couple stronger choices would lift this band.'],
  },
  {
    _id: 'mock-general-41-60',
    _updatedAt: 'mock',
    range: { minPct: 41, maxPct: 60 },
    titles: ['Holding the Middle', 'Balanced but Open'],
    secondary: ['You are in the middle of the pack.', 'This is a stable baseline with room to improve.'],
  },
  {
    _id: 'mock-general-61-80',
    _updatedAt: 'mock',
    range: { minPct: 61, maxPct: 80 },
    titles: ['Strong Climate Habits', 'Reliable Low-Impact Choices'],
    secondary: ['A strong band with a clear positive pattern.', 'These habits are trending in the right direction.'],
  },
  {
    _id: 'mock-general-81-100',
    _updatedAt: 'mock',
    range: { minPct: 81, maxPct: 100 },
    titles: ['Top Climate Habits', 'Leading by Example'],
    secondary: ['This sits near the top of the community.', 'High-impact choices are showing up consistently here.'],
  },
];

const PERSONALIZED_MOCK_DOCS: Doc[] = [
  {
    _id: 'mock-personal-0-20',
    _updatedAt: 'mock',
    range: { minPct: 0, maxPct: 20 },
    titles: ['Reset Point', 'Fresh Start'],
    secondary: ['Your current habits leave a lot of room for improvement.', 'This is a clear place to start building better patterns.'],
  },
  {
    _id: 'mock-personal-21-40',
    _updatedAt: 'mock',
    range: { minPct: 21, maxPct: 40 },
    titles: ['Room to Grow', 'On the Way'],
    secondary: ['Some better choices are present, but not consistent yet.', 'You have movement, but the pattern is still uneven.'],
  },
  {
    _id: 'mock-personal-41-60',
    _updatedAt: 'mock',
    range: { minPct: 41, maxPct: 60 },
    titles: ['Steady Middle', 'Balanced Pattern'],
    secondary: ['You are around the middle right now.', 'Your habits are mixed, but stable enough to build on.'],
  },
  {
    _id: 'mock-personal-61-80',
    _updatedAt: 'mock',
    range: { minPct: 61, maxPct: 80 },
    titles: ['Good Direction', 'Strong Pattern'],
    secondary: ['Your daily choices are landing in a strong range.', 'This reflects a consistent low-impact direction.'],
  },
  {
    _id: 'mock-personal-81-100',
    _updatedAt: 'mock',
    range: { minPct: 81, maxPct: 100 },
    titles: ['Excellent Habits', 'Leading Pattern'],
    secondary: ['Your choices place you near the top end.', 'This reflects a strong and consistent climate profile.'],
  },
];

function mockDocsFor(schemaName: 'gamificationGeneralCopy' | 'gamificationPersonalizedCopy') {
  return schemaName === 'gamificationGeneralCopy' ? GENERAL_MOCK_DOCS : PERSONALIZED_MOCK_DOCS;
}

const buildQuery = (schemaName: string) => `
*[
  !(_id in path('drafts.**')) &&
  _type == "${schemaName}" &&
  enabled == true
]{
  _id, _updatedAt, range, titles, secondary
}
`;

/** Simple store util */
function createStore(initial: PoolState) {
  let state = initial;
  const subs = new Set<() => void>();
  return {
    get: () => state,
    set: (next: Partial<PoolState>) => {
      state = { ...state, ...next };
      subs.forEach((fn) => fn());
    },
    subscribe: (fn: () => void) => {
      subs.add(fn);
      return () => subs.delete(fn);
    },
  };
}

/** One singleton per schema */
function createPool(schemaName: 'gamificationGeneralCopy' | 'gamificationPersonalizedCopy') {
  const store = createStore({ docs: [], rev: 'v0', loaded: false });
  let started = false;
  let unsubListen: { unsubscribe?: () => void } | null = null;
  let refreshTimer: any = null;

  const stop = () => {
    if (unsubListen) {
      unsubListen.unsubscribe?.();
      unsubListen = null;
    }
    clearTimeout(refreshTimer);
  };

  const setMockDocs = () => {
    stop();
    store.set({ docs: mockDocsFor(schemaName), rev: 'mock', loaded: true });
  };

  subscribeMockSanityReadMode(() => {
    if (!started) return;
    if (shouldUseMockSanityReads()) setMockDocs();
  });

  const start = () => {
    if (started) return;
    started = true;

    if (shouldUseMockSanityReads()) {
      setMockDocs();
      return;
    }

    const QUERY = buildQuery(schemaName);
    const pump = (rows: Doc[]) => {
      const docs = rows || [];
      const latest = docs.reduce((m, r) => (r._updatedAt > m ? r._updatedAt : m), '');
      store.set({ docs, rev: latest || 'v1', loaded: true });
    };

    // initial live fetch
    liveClient.fetch<Doc[]>(QUERY, {}).then(pump).catch((error) => {
      if (isSanityQuotaError(error)) {
        enableMockSanityReadFallback(error);
        setMockDocs();
        return;
      }
      console.error(error);
    });

    // listen via cdn, then refresh live
    unsubListen = cdnClient
      .listen(QUERY, {}, { visibility: 'query' })
      .subscribe({
        next: () => {
          clearTimeout(refreshTimer);
          refreshTimer = setTimeout(() => {
            if (shouldUseMockSanityReads()) {
              setMockDocs();
              return;
            }
            liveClient.fetch<Doc[]>(QUERY, {}).then(pump).catch((error) => {
              if (isSanityQuotaError(error)) {
                enableMockSanityReadFallback(error);
                setMockDocs();
                return;
              }
              console.error(error);
            });
          }, 100);
        },
        error: (error) => {
          if (isSanityQuotaError(error)) {
            enableMockSanityReadFallback(error);
            setMockDocs();
            return;
          }
          console.error(error);
        },
      });
  };

  const usePool = () => {
    // Subscribe to external store (React 18 safe)
    const snapshot = useSyncExternalStore(store.subscribe, store.get, store.get);
    const { docs, rev, loaded } = snapshot;

    // Build the picker from current snapshot
    const pick = useMemo(() => {
      const sorted = docs
        .filter(
          (d) =>
            d.range &&
            Array.isArray(d.titles) &&
            d.titles?.length &&
            Array.isArray(d.secondary) &&
            d.secondary?.length
        )
        .sort((a, b) => a.range!.minPct - b.range!.minPct);

      // Small Fisher–Yates
      const shuffle = <T,>(arr: T[]) => {
        const a = arr.slice();
        for (let i = a.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [a[i], a[j]] = [a[j], a[i]];
        }
        return a;
      };

      return (
        pct: number,
        cachePrefix: string,
        id: string,
        fallback?: Record<string, { titles: string[]; secondary: string[] }>
      ) => {
        const p = Math.max(0, Math.min(100, Math.round(Number(pct) || 0)));
        const found = sorted.find((d) => p >= d.range!.minPct && p <= d.range!.maxPct);

        // include schema + rev so cache invalidates on CMS changes
        const stableKey = storageKeyFor(`${cachePrefix}:${schemaName}:${rev}`, id, p, 'v1');

        // If this id+pct already has an assignment, return it (stability per dot)
        const cached = safeSession.get<{ title: string; secondary: string } | null>(stableKey, null);
        if (cached?.title && cached?.secondary) return cached;

        // Resolve source arrays (from CMS or fallback)
        const fbKey = fallback ? bucketForPercent(p) : null;
        const titles =
          found?.titles?.length ? found.titles : fallback ? fallback[fbKey!]?.titles : null;
        const secondary =
          found?.secondary?.length
            ? found.secondary
            : fallback
            ? fallback[fbKey!]?.secondary
            : null;

        if (!titles?.length || !secondary?.length) return null;

        // We pair titles[i] with secondary[i]; if lengths differ, clamp to min.
        const N = Math.min(titles.length, secondary.length);
        if (N <= 0) return null;

        // === NO-REPEAT BUCKET QUEUE (session-scoped, per range, per schema+rev) ===
        // Build a bucket identifier that is stable for the pct range we matched.
        const bucketId =
          found?.range
            ? `${found.range.minPct}-${found.range.maxPct}`
            : // Fallback bucket uses the coarse fb key (e.g., '41-60')
              fbKey!;

        // A pool that survives re-renders within the same session and resets on CMS rev change.
        const poolKey = storageKeyFor(
          `${schemaName}:${rev}:pool`,
          bucketId,
          0,
          'v1'
        );

        type PoolState = { queue: number[]; cursor: number };
        let pool = safeSession.get<PoolState | null>(poolKey, null);

        const resetPool = () => {
          pool = { queue: shuffle(Array.from({ length: N }, (_, i) => i)), cursor: 0 };
          safeSession.set(poolKey, pool);
        };

        if (!pool || !Array.isArray(pool.queue) || typeof pool.cursor !== 'number' || pool.queue.length !== N) {
          resetPool();
        }

        // Draw next index without replacement; reshuffle after exhausting.
        let idx = pool!.queue[pool!.cursor];
        pool!.cursor += 1;
        if (pool!.cursor >= pool!.queue.length) {
          // exhausted → reshuffle for next cycle
          resetPool();
        } else {
          safeSession.set(poolKey, pool!);
        }

        // Pair title+secondary at the same index (clamped)
        const chosen = { title: titles[idx] ?? titles[0], secondary: secondary[idx] ?? secondary[0] };

        // Cache per id+pct so a given dot stays consistent across renders
        safeSession.set(stableKey, chosen);
        return chosen;
      };
    }, [docs, rev]);

    return { pick, loaded, hasCMS: docs.length > 0, rev };
  };

  return { start, stop, usePool };
}

/** Two singletons */
const generalPool = createPool('gamificationGeneralCopy');
const personalizedPool = createPool('gamificationPersonalizedCopy');

/** Public: start both early (call once in a preloader) */
export function startGamificationCopyPreload() {
  generalPool.start();
  personalizedPool.start();
}

/** Hooks for components: they only subscribe; they WON’T start fetch if not started yet */
export function useGeneralPools() {
  // Soft guarantee: if nothing started them yet, start once here as a safety net.
  generalPool.start();
  return generalPool.usePool();
}

export function usePersonalizedPools() {
  personalizedPool.start();
  return personalizedPool.usePool();
}
