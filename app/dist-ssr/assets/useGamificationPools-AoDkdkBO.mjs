(function() {
	try {
		var e = "undefined" != typeof window ? window : "undefined" != typeof global ? global : "undefined" != typeof globalThis ? globalThis : "undefined" != typeof self ? self : {};
		e.SENTRY_RELEASE = { id: "131decce1f878a04c070a93aabe3e016cfcc66cb" };
		var n = new e.Error().stack;
		n && (e._sentryDebugIds = e._sentryDebugIds || {}, e._sentryDebugIds[n] = "534ef734-fb08-4351-96b1-57c9d4b12bcd", e._sentryDebugIdIdentifier = "sentry-dbid-534ef734-fb08-4351-96b1-57c9d4b12bcd");
	} catch (e) {}
})();
import { D as enableMockReadFallback, O as shouldUseMockReads, k as subscribeMockReadMode } from "../entry-server.mjs";
import { useMemo, useSyncExternalStore } from "react";
//#region src/lib/utils/session-cache.ts
var bucketForPercent = (pct) => pct <= 20 ? "0-20" : pct <= 40 ? "21-40" : pct <= 60 ? "41-60" : pct <= 80 ? "61-80" : "81-100";
var storageKeyFor = (prefix, id, pct, version = "v1") => `${prefix}:${version}:${id}:${bucketForPercent(pct)}`;
var safeSession = {
	get(key, fallback) {
		try {
			const raw = sessionStorage.getItem(key);
			return raw ? JSON.parse(raw) : fallback;
		} catch {
			return fallback;
		}
	},
	set(key, value) {
		try {
			sessionStorage.setItem(key, JSON.stringify(value));
		} catch {}
	}
};
//#endregion
//#region src/lib/hooks/useGamificationPools.ts
var isReadyCopyDoc = (doc) => !!doc.range && Array.isArray(doc.titles) && doc.titles.length > 0 && Array.isArray(doc.secondary) && doc.secondary.length > 0;
var ReadApiError = class extends Error {
	constructor(message, status) {
		super(message);
		this.name = "ReadApiError";
		this.status = status;
	}
};
function isCopyDocs(value) {
	return Array.isArray(value) && value.every((doc) => {
		if (!doc || typeof doc !== "object") return false;
		const record = doc;
		return typeof record._id === "string" && typeof record._updatedAt === "string";
	});
}
function shouldFallbackToMock(error) {
	if (!(error instanceof ReadApiError)) return false;
	return error.status === 403 || error.status === 429 || error.status >= 500;
}
async function fetchCopyDocs(type) {
	const url = new URL("/api/gamification-copy", window.location.origin);
	url.searchParams.set("type", type);
	const response = await fetch(url, { headers: { Accept: "application/json" } });
	const body = await response.json().catch(() => ({}));
	if (!response.ok) throw new ReadApiError(`Gamification copy API failed with status ${String(response.status)}`, response.status);
	if (!isCopyDocs(body.docs)) throw new ReadApiError("Gamification copy API returned an invalid response", 502);
	return body.docs;
}
/** Simple store util */
function createStore(initial) {
	let state = initial;
	const subs = /* @__PURE__ */ new Set();
	return {
		get: () => state,
		set: (next) => {
			state = {
				...state,
				...next
			};
			subs.forEach((fn) => {
				fn();
			});
		},
		subscribe: (fn) => {
			subs.add(fn);
			return () => {
				subs.delete(fn);
			};
		}
	};
}
/** One singleton per copy type */
function createPool(copyType) {
	const store = createStore({
		docs: [],
		rev: "v0",
		loaded: false
	});
	let started = false;
	let refreshTimer = null;
	const stop = () => {
		if (refreshTimer) {
			clearTimeout(refreshTimer);
			refreshTimer = null;
		}
	};
	const setFallbackReady = () => {
		stop();
		store.set({
			docs: [],
			rev: "fallback",
			loaded: true
		});
	};
	subscribeMockReadMode(() => {
		if (!started) return;
		if (shouldUseMockReads()) setFallbackReady();
	});
	const start = () => {
		if (started) return;
		started = true;
		if (shouldUseMockReads()) {
			setFallbackReady();
			return;
		}
		const pump = (rows) => {
			const docs = rows;
			const latest = docs.reduce((m, r) => r._updatedAt > m ? r._updatedAt : m, "");
			store.set({
				docs,
				rev: latest || "v1",
				loaded: true
			});
		};
		const scheduleRefresh = () => {
			if (refreshTimer) clearTimeout(refreshTimer);
			refreshTimer = setTimeout(() => {
				refresh();
			}, 6e4);
		};
		const refresh = async () => {
			try {
				const docs = await fetchCopyDocs(copyType);
				if (shouldUseMockReads()) {
					setFallbackReady();
					return;
				}
				pump(docs);
				scheduleRefresh();
			} catch (error) {
				if (shouldFallbackToMock(error)) {
					enableMockReadFallback(error);
					setFallbackReady();
					return;
				}
				console.error(error);
				scheduleRefresh();
			}
		};
		refresh();
	};
	const usePool = () => {
		const { docs, rev, loaded } = useSyncExternalStore(store.subscribe, store.get, store.get);
		return {
			pick: useMemo(() => {
				const sorted = docs.filter(isReadyCopyDoc).sort((a, b) => a.range.minPct - b.range.minPct);
				const shuffle = (arr) => {
					const a = arr.slice();
					for (let i = a.length - 1; i > 0; i--) {
						const j = Math.floor(Math.random() * (i + 1));
						[a[i], a[j]] = [a[j], a[i]];
					}
					return a;
				};
				return (pct, cachePrefix, id, fallback) => {
					const p = Math.max(0, Math.min(100, Math.round(Number.isFinite(pct) ? pct : 0)));
					const found = sorted.find((d) => p >= d.range.minPct && p <= d.range.maxPct);
					const stableKey = storageKeyFor(`${cachePrefix}:${copyType}:${rev}`, id, p, "v1");
					const cached = safeSession.get(stableKey, null);
					if (cached?.title && cached.secondary) return cached;
					const fbKey = fallback ? bucketForPercent(p) : null;
					const fallbackBucket = fallback && fbKey ? fallback[fbKey] : void 0;
					const titles = found?.titles.length ? found.titles : fallbackBucket?.titles ?? null;
					const secondary = found?.secondary.length ? found.secondary : fallbackBucket?.secondary ?? null;
					if (!titles?.length || !secondary?.length) return null;
					const N = Math.min(titles.length, secondary.length);
					if (N <= 0) return null;
					const bucketId = found ? `${String(found.range.minPct)}-${String(found.range.maxPct)}` : fbKey ?? "fallback";
					const poolKey = storageKeyFor(`${copyType}:${rev}:pool`, bucketId, 0, "v1");
					let pool = safeSession.get(poolKey, null);
					const createQueue = () => ({
						queue: shuffle(Array.from({ length: N }, (_, i) => i)),
						cursor: 0
					});
					const savePool = (nextPool) => {
						pool = nextPool;
						safeSession.set(poolKey, nextPool);
					};
					if (!pool || !Array.isArray(pool.queue) || typeof pool.cursor !== "number" || pool.queue.length !== N) savePool(createQueue());
					const currentPool = pool;
					if (!currentPool) return null;
					const idx = currentPool.queue[currentPool.cursor] ?? 0;
					const nextCursor = currentPool.cursor + 1;
					if (nextCursor >= currentPool.queue.length) savePool(createQueue());
					else savePool({
						...currentPool,
						cursor: nextCursor
					});
					const chosen = {
						title: titles[idx] ?? titles[0],
						secondary: secondary[idx] ?? secondary[0]
					};
					safeSession.set(stableKey, chosen);
					return chosen;
				};
			}, [docs, rev]),
			loaded,
			hasCMS: docs.length > 0,
			rev
		};
	};
	return {
		start,
		stop,
		usePool
	};
}
/** Two singletons */
var generalPool = createPool("general");
var personalizedPool = createPool("personalized");
/** Hooks for components: they only subscribe; they do not start fetch if not started yet */
function useGeneralPools() {
	generalPool.start();
	return generalPool.usePool();
}
function usePersonalizedPools() {
	personalizedPool.start();
	return personalizedPool.usePool();
}
//#endregion
export { usePersonalizedPools as n, useGeneralPools as t };

//# sourceMappingURL=useGamificationPools-AoDkdkBO.mjs.map