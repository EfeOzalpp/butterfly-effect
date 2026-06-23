(function() {
	try {
		var e = "undefined" != typeof window ? window : "undefined" != typeof global ? global : "undefined" != typeof globalThis ? globalThis : "undefined" != typeof self ? self : {};
		e.SENTRY_RELEASE = { id: "131decce1f878a04c070a93aabe3e016cfcc66cb" };
		var n = new e.Error().stack;
		n && (e._sentryDebugIds = e._sentryDebugIds || {}, e._sentryDebugIds[n] = "8b6010d0-37f7-47fb-8f1b-4843ae20f4d7", e._sentryDebugIdIdentifier = "sentry-dbid-8b6010d0-37f7-47fb-8f1b-4843ae20f4d7");
	} catch (e) {}
})();
import { A as deviceType, j as getViewportSize } from "../entry-server.mjs";
//#region src/graph-runtime/sprites/textures/queue.ts
var Q = [];
var pumping = false;
var paused$2 = false;
var GEN = 0;
var isTouchDevice = typeof window !== "undefined" && (navigator.maxTouchPoints > 0 || "ontouchstart" in window);
var scheduleIdle = typeof requestIdleCallback === "function" ? requestIdleCallback : (callback) => window.setTimeout(() => {
	callback({
		didTimeout: false,
		timeRemaining: () => 0
	});
}, 16);
function maxJobsPerIdleSlice() {
	return isTouchDevice ? 1 : 2;
}
function minTimeRemainingMs() {
	return isTouchDevice ? 10 : 6;
}
function takeNextJob() {
	const foregroundIndex = Q.findIndex((job) => !job.background);
	const index = foregroundIndex >= 0 ? foregroundIndex : 0;
	return Q.splice(index, 1)[0];
}
function step(deadline) {
	if (paused$2) {
		pumping = false;
		return;
	}
	let done = 0;
	const maxJobs = maxJobsPerIdleSlice();
	const hasTime = () => !deadline || deadline.timeRemaining() > minTimeRemainingMs();
	while (Q.length && done < maxJobs && (done === 0 || hasTime())) {
		const job = takeNextJob();
		if (job.gen !== GEN) {
			try {
				job.onCancel?.();
			} catch {}
			continue;
		}
		try {
			job.run();
		} catch (err) {
			console.warn("[queue] job failed:", err);
		}
		done++;
		if (job.background) break;
	}
	if (Q.length) scheduleIdle(step);
	else pumping = false;
}
function enqueueTexture(run, prio = 0, background = false, onCancel) {
	const gen = GEN;
	Q.push({
		run,
		prio,
		gen,
		background,
		onCancel
	});
	Q.sort((a, b) => b.prio - a.prio);
	if (!pumping && !paused$2) {
		pumping = true;
		scheduleIdle(step);
	}
}
function pauseQueue() {
	paused$2 = true;
}
function resumeQueue() {
	if (!paused$2) return;
	paused$2 = false;
	if (Q.length && !pumping) {
		pumping = true;
		scheduleIdle(step);
	}
}
function cancelAllJobs() {
	for (const job of Q) try {
		job.onCancel?.();
	} catch {}
	Q = [];
	pumping = false;
}
function resetQueue() {
	cancelAllJobs();
	paused$2 = false;
}
function bumpGeneration() {
	GEN++;
	cancelAllJobs();
}
//#endregion
//#region src/graph-runtime/sprites/internal/spriteQuality.ts
var MAX_TILE_BY_DEVICE = {
	mobile: 96,
	tablet: 160,
	laptop: 160
};
var QUALITY_THRESHOLDS = {
	mobile: {
		midEnter: 150,
		midExit: 96,
		highEnter: 360,
		highExit: 240
	},
	tablet: {
		midEnter: 180,
		midExit: 104,
		highEnter: 420,
		highExit: 280
	},
	laptop: {
		midEnter: 170,
		midExit: 104,
		highEnter: 420,
		highExit: 280
	}
};
function maxSpriteTileSize(dev) {
	return MAX_TILE_BY_DEVICE[dev];
}
function clampSpriteTileSize(tileSize, dev) {
	return Math.max(64, Math.min(Math.round(tileSize), maxSpriteTileSize(dev)));
}
function runtimeHardware() {
	if (typeof navigator === "undefined") return {
		cores: 8,
		memoryGb: 8
	};
	const nav = navigator;
	const cores = nav.hardwareConcurrency;
	return {
		cores: Number.isFinite(cores) && cores > 0 ? cores : 8,
		memoryGb: nav.deviceMemory ?? 8
	};
}
function isConstrainedSpriteDevice(dev) {
	if (dev !== "laptop") return true;
	const { cores, memoryGb } = runtimeHardware();
	return cores <= 4 || memoryGb <= 4;
}
function spriteQualityCheckFrameModulo(dev) {
	if (dev === "mobile") return 36;
	if (dev === "tablet" || isConstrainedSpriteDevice(dev)) return 30;
	return 24;
}
function spriteQualityUpgradeDelayMs(dev, orderIndex = 0) {
	const constrained = isConstrainedSpriteDevice(dev);
	const slots = dev === "mobile" ? 48 : dev === "tablet" ? 48 : constrained ? 42 : 36;
	const stepMs = dev === "mobile" ? 120 : dev === "tablet" ? 110 : constrained ? 95 : 80;
	return Math.abs(orderIndex) % slots * stepMs;
}
function chooseSpriteTileForScreenSize(screenPx, current, base, dev) {
	if (dev === "mobile") return base;
	const mid = Math.max(base, 128);
	const high = Math.max(mid, maxSpriteTileSize(dev));
	const thresholds = QUALITY_THRESHOLDS[dev];
	if (current >= high) return screenPx < thresholds.highExit ? mid : high;
	if (current >= mid) {
		if (screenPx > thresholds.highEnter) return high;
		if (screenPx < thresholds.midExit) return base;
		return mid;
	}
	return screenPx > thresholds.midEnter ? mid : base;
}
function chooseCameraSpriteTileSize({ radius: _radius, minRadius: _minRadius, maxRadius: _maxRadius, isRealMobile, isTabletLike }) {
	if (isRealMobile) return 96;
	if (isTabletLike) return 128;
	return 112;
}
//#endregion
//#region src/graph-runtime/sprites/internal/epochScheduler.ts
var TICK_MS$1 = 120;
function schedulerBudget() {
	if (typeof window === "undefined") return {
		perTick: 2,
		cadence: 1
	};
	const dev = deviceType(getViewportSize().w);
	if (dev === "mobile") return {
		perTick: 1,
		cadence: 1.2
	};
	if (dev === "tablet") return {
		perTick: 1,
		cadence: 1.25
	};
	if (isConstrainedSpriteDevice(dev)) return {
		perTick: 1,
		cadence: 1.15
	};
	return {
		perTick: 2,
		cadence: 1
	};
}
var entries$1 = /* @__PURE__ */ new Map();
var keys$1 = [];
var rrIdx$1 = 0;
var intervalHandle$1 = null;
var paused$1 = false;
function schedulerTick$1() {
	if (paused$1) return;
	if (typeof document !== "undefined" && document.hidden) return;
	const now = typeof performance !== "undefined" ? performance.now() : Date.now();
	const visible = [];
	for (const k of keys$1) {
		const e = entries$1.get(k);
		if (e?.isVisible() && now >= e.nextAtMs) visible.push(k);
	}
	if (!visible.length) return;
	const { perTick, cadence } = schedulerBudget();
	const naturalTurnMs = Math.max(TICK_MS$1, Math.ceil(visible.length / Math.max(1, perTick)) * TICK_MS$1);
	for (let i = 0; i < perTick; i++) {
		const k = visible[rrIdx$1 % visible.length];
		const entry = entries$1.get(k);
		if (entry) {
			entry.tick();
			entry.nextAtMs = now + Math.ceil(Math.max(entry.intervalMs, naturalTurnMs) * cadence);
		}
		rrIdx$1 = (rrIdx$1 + 1) % visible.length;
	}
}
function pauseEpochScheduler() {
	paused$1 = true;
}
function resumeEpochScheduler() {
	paused$1 = false;
}
function startScheduler$1() {
	if (intervalHandle$1 !== null || typeof window === "undefined") return;
	intervalHandle$1 = setInterval(schedulerTick$1, TICK_MS$1);
}
function stopScheduler$1() {
	if (intervalHandle$1 === null) return;
	clearInterval(intervalHandle$1);
	intervalHandle$1 = null;
	rrIdx$1 = 0;
}
var idCounter$1 = 0;
function registerEpochShape(entry) {
	const id = String(idCounter$1++);
	const now = typeof performance !== "undefined" ? performance.now() : Date.now();
	const intervalMs = Math.max(TICK_MS$1, entry.intervalMs || TICK_MS$1);
	const spreadSteps = Math.max(1, Math.round(Math.min(intervalMs, Math.max(TICK_MS$1, keys$1.length * TICK_MS$1)) / TICK_MS$1));
	const nextAtMs = now + idCounter$1 % spreadSteps * TICK_MS$1;
	entries$1.set(id, {
		...entry,
		intervalMs,
		nextAtMs
	});
	keys$1 = Array.from(entries$1.keys());
	startScheduler$1();
	return () => {
		entries$1.delete(id);
		keys$1 = Array.from(entries$1.keys());
		if (entries$1.size === 0) stopScheduler$1();
	};
}
//#endregion
//#region src/graph-runtime/sprites/internal/qualityUpgradeScheduler.ts
var TICK_MS = 180;
var entries = /* @__PURE__ */ new Map();
var keys = [];
var rrIdx = 0;
var idCounter = 0;
var intervalHandle = null;
var paused = false;
function upgradeBudget() {
	return 1;
}
function startScheduler() {
	if (intervalHandle !== null || typeof window === "undefined") return;
	intervalHandle = setInterval(schedulerTick, TICK_MS);
}
function stopScheduler() {
	if (intervalHandle === null) return;
	clearInterval(intervalHandle);
	intervalHandle = null;
	rrIdx = 0;
}
function schedulerTick() {
	if (paused) return;
	if (typeof document !== "undefined" && document.hidden) return;
	const now = typeof performance !== "undefined" ? performance.now() : Date.now();
	const ready = [];
	for (const key of keys) {
		const entry = entries.get(key);
		if (entry?.isVisible() && now >= entry.dueAtMs) ready.push(key);
	}
	if (!ready.length) return;
	const perTick = upgradeBudget();
	const turns = Math.min(perTick, ready.length);
	for (let i = 0; i < turns; i++) {
		const key = ready[rrIdx % ready.length];
		const entry = entries.get(key);
		entries.delete(key);
		keys = keys.filter((candidate) => candidate !== key);
		if (entry) entry.apply();
		rrIdx = (rrIdx + 1) % ready.length;
	}
	if (!entries.size) stopScheduler();
}
function scheduleSpriteQualityUpgrade(entry) {
	const id = String(idCounter++);
	const now = typeof performance !== "undefined" ? performance.now() : Date.now();
	entries.set(id, {
		...entry,
		dueAtMs: now + Math.max(0, entry.delayMs ?? 0)
	});
	keys = Array.from(entries.keys());
	startScheduler();
	return () => {
		entries.delete(id);
		keys = Array.from(entries.keys());
		if (!entries.size) stopScheduler();
	};
}
function pauseQualityUpgradeScheduler() {
	paused = true;
}
function resumeQualityUpgradeScheduler() {
	paused = false;
}
//#endregion
//#region src/graph-runtime/sprites/api/theme.ts
function invalidateSpriteTexturesForThemeChange() {
	bumpGeneration();
	resetQueue();
}
//#endregion
export { resetQueue as _, pauseEpochScheduler as a, chooseCameraSpriteTileSize as c, maxSpriteTileSize as d, spriteQualityCheckFrameModulo as f, pauseQueue as g, enqueueTexture as h, scheduleSpriteQualityUpgrade as i, chooseSpriteTileForScreenSize as l, bumpGeneration as m, pauseQualityUpgradeScheduler as n, registerEpochShape as o, spriteQualityUpgradeDelayMs as p, resumeQualityUpgradeScheduler as r, resumeEpochScheduler as s, invalidateSpriteTexturesForThemeChange as t, clampSpriteTileSize as u, resumeQueue as v };

//# sourceMappingURL=theme-CrGG_WGJ.mjs.map