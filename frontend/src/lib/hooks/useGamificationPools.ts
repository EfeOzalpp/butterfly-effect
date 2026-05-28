// src/lib/hooks/useGamificationPools.ts
import { useMemo, useSyncExternalStore } from 'react';
import { cdnClient, liveReadClient as liveClient } from '../../services/sanity/client';
import {
  enableMockSanityReadFallback,
  isSanityQuotaError,
  shouldUseMockSanityReads,
  subscribeMockSanityReadMode,
} from '../../services/sanity/config';
import { storageKeyFor, safeSession, bucketForPercent } from '../utils/session-cache';

interface CopyDoc {
  _id: string;
  _updatedAt: string;
  range?: { minPct: number; maxPct: number };
  titles?: string[];
  secondary?: string[];
  enabled?: boolean;
}

interface ReadyCopyDoc extends CopyDoc {
  range: { minPct: number; maxPct: number };
  titles: string[];
  secondary: string[];
}

interface PoolState {
  docs: CopyDoc[];
  rev: string;      // increments when docs change (use _updatedAt max)
  loaded: boolean;  // true after first live fetch completes
}

interface FallbackBucket {
  titles: string[];
  secondary: string[];
}

interface QueueState {
  queue: number[];
  cursor: number;
}

const isReadyCopyDoc = (doc: CopyDoc): doc is ReadyCopyDoc =>
  !!doc.range &&
  Array.isArray(doc.titles) &&
  doc.titles.length > 0 &&
  Array.isArray(doc.secondary) &&
  doc.secondary.length > 0;

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
      subs.forEach((fn) => {
        fn();
      });
    },
    subscribe: (fn: () => void) => {
      subs.add(fn);
      return () => {
        subs.delete(fn);
      };
    },
  };
}

/** One singleton per schema */
function createPool(schemaName: 'gamificationGeneralCopy' | 'gamificationPersonalizedCopy') {
  const store = createStore({ docs: [], rev: 'v0', loaded: false });
  let started = false;
  let unsubListen: { unsubscribe?: () => void } | null = null;
  let refreshTimer: ReturnType<typeof setTimeout> | null = null;

  const stop = () => {
    if (unsubListen) {
      unsubListen.unsubscribe?.();
      unsubListen = null;
    }
    if (refreshTimer) {
      clearTimeout(refreshTimer);
      refreshTimer = null;
    }
  };

  const setFallbackReady = () => {
    stop();
    // When CMS copy is unavailable or mock reads are active, let the
    // consuming component's local fallback buckets provide the text.
    store.set({ docs: [], rev: 'fallback', loaded: true });
  };

  subscribeMockSanityReadMode(() => {
    if (!started) return;
    if (shouldUseMockSanityReads()) setFallbackReady();
  });

  const start = () => {
    if (started) return;
    started = true;

    if (shouldUseMockSanityReads()) {
      setFallbackReady();
      return;
    }

    const QUERY = buildQuery(schemaName);
    const pump = (rows: CopyDoc[]) => {
      const docs = rows;
      const latest = docs.reduce((m, r) => (r._updatedAt > m ? r._updatedAt : m), '');
      store.set({ docs, rev: latest || 'v1', loaded: true });
    };

    // initial live fetch
    liveClient.fetch<CopyDoc[]>(QUERY, {}).then(pump).catch((error: unknown) => {
      if (isSanityQuotaError(error)) {
        enableMockSanityReadFallback(error);
        setFallbackReady();
        return;
      }
      console.error(error);
    });

    // listen via cdn, then refresh live
    unsubListen = cdnClient
      .listen(QUERY, {}, { visibility: 'query' })
      .subscribe({
        next: () => {
          if (refreshTimer) clearTimeout(refreshTimer);
          refreshTimer = setTimeout(() => {
            if (shouldUseMockSanityReads()) {
              setFallbackReady();
              return;
            }
            liveClient.fetch<CopyDoc[]>(QUERY, {}).then(pump).catch((error: unknown) => {
              if (isSanityQuotaError(error)) {
                enableMockSanityReadFallback(error);
                setFallbackReady();
                return;
              }
              console.error(error);
            });
          }, 100);
        },
        error: (error: unknown) => {
          if (isSanityQuotaError(error)) {
            enableMockSanityReadFallback(error);
            setFallbackReady();
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
        .filter(isReadyCopyDoc)
        .sort((a, b) => a.range.minPct - b.range.minPct);

      // Small Fisher-Yates shuffle.
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
        fallback?: Record<string, FallbackBucket>
      ) => {
        const p = Math.max(0, Math.min(100, Math.round(Number.isFinite(pct) ? pct : 0)));
        const found = sorted.find((d) => p >= d.range.minPct && p <= d.range.maxPct);

        // include schema + rev so cache invalidates on CMS changes
        const stableKey = storageKeyFor(`${cachePrefix}:${schemaName}:${rev}`, id, p, 'v1');

        // If this id+pct already has an assignment, return it (stability per dot)
        const cached = safeSession.get<{ title: string; secondary: string } | null>(stableKey, null);
        if (cached?.title && cached.secondary) return cached;

        // Resolve source arrays (from CMS or fallback)
        const fbKey = fallback ? bucketForPercent(p) : null;
        const fallbackBucket = fallback && fbKey ? fallback[fbKey] : undefined;
        const titles =
          found?.titles.length ? found.titles : fallbackBucket?.titles ?? null;
        const secondary =
          found?.secondary.length
            ? found.secondary
            : fallbackBucket?.secondary ?? null;

        if (!titles?.length || !secondary?.length) return null;

        // We pair titles[i] with secondary[i]; if lengths differ, clamp to min.
        const N = Math.min(titles.length, secondary.length);
        if (N <= 0) return null;

        // === NO-REPEAT BUCKET QUEUE (session-scoped, per range, per schema+rev) ===
        // Build a bucket identifier that is stable for the pct range we matched.
        const bucketId =
          found
            ? `${String(found.range.minPct)}-${String(found.range.maxPct)}`
            : // Fallback bucket uses the coarse fb key (e.g., '41-60')
              fbKey ?? 'fallback';

        // A pool that survives re-renders within the same session and resets on CMS rev change.
        const poolKey = storageKeyFor(
          `${schemaName}:${rev}:pool`,
          bucketId,
          0,
          'v1'
        );

        let pool = safeSession.get<QueueState | null>(poolKey, null);

        const createQueue = (): QueueState => ({
          queue: shuffle(Array.from({ length: N }, (_, i) => i)),
          cursor: 0,
        });

        const savePool = (nextPool: QueueState) => {
          pool = nextPool;
          safeSession.set(poolKey, nextPool);
        };

        if (!pool || !Array.isArray(pool.queue) || typeof pool.cursor !== 'number' || pool.queue.length !== N) {
          savePool(createQueue());
        }

        // Draw next index without replacement; reshuffle after exhausting.
        const currentPool = pool;
        if (!currentPool) return null;
        const idx = currentPool.queue[currentPool.cursor] ?? 0;
        const nextCursor = currentPool.cursor + 1;
        if (nextCursor >= currentPool.queue.length) {
          // Exhausted, reshuffle for next cycle.
          savePool(createQueue());
        } else {
          savePool({ ...currentPool, cursor: nextCursor });
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

/** Hooks for components: they only subscribe; they do not start fetch if not started yet */
export function useGeneralPools() {
  // Soft guarantee: if nothing started them yet, start once here as a safety net.
  generalPool.start();
  return generalPool.usePool();
}

export function usePersonalizedPools() {
  personalizedPool.start();
  return personalizedPool.usePool();
}
