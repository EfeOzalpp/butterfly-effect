(function() {
	try {
		var e = "undefined" != typeof window ? window : "undefined" != typeof global ? global : "undefined" != typeof globalThis ? globalThis : "undefined" != typeof self ? self : {};
		e.SENTRY_RELEASE = { id: "131decce1f878a04c070a93aabe3e016cfcc66cb" };
		var n = new e.Error().stack;
		n && (e._sentryDebugIds = e._sentryDebugIds || {}, e._sentryDebugIds[n] = "db554244-f343-4b2b-ae75-c368b58e443a", e._sentryDebugIdIdentifier = "sentry-dbid-db554244-f343-4b2b-ae75-c368b58e443a");
	} catch (e) {}
})();
import { A as clamp01$6, B as setSessionItem, C as createParticleStore$1, D as gradientColor, E as VIVID_COLOR_STOPS, I as getSessionItem, O as applyExposureContrast, a as drawCarFactory, c as drawCar, d as resolvePowerVisualKind, f as drawHouse, h as drawClouds, i as drawBus, k as makeP, l as drawVilla, m as drawSnow, o as drawSun, p as houseHasChimney, r as drawTrees, s as drawSea, u as drawPower, z as removeSessionItems } from "./shapes-BYH03xOX.mjs";
import { d as useIdentity, i as ROLE_SECTIONS, l as useSurveyData, n as avgWeightOf, o as useOptionalUiFlow, s as useUiFlow } from "./useRelativeScore-DD8ox_AN.mjs";
import { A as deviceType, C as makeRandomId, E as updateMockSoloMessage, N as useOptionalPreferences, O as shouldUseMockReads, P as usePreferences, S as isWriteApiEditToken, a as useTransientFlag, c as CloseIcon, d as useWindowWidth, f as DEFAULT_VIEWPORT_WIDTH, h as isTabletWidth, i as HintBanner, j as getViewportSize, l as desktopGraphToolsOffsetPx, m as isMobileWidth, o as GraphDataProvider, p as VIEWPORT_BREAKPOINTS, s as useSharedGraphData, u as tabletGraphToolsYOffsetPx, w as makeWriteApiError, x as getClientId } from "../entry-server.mjs";
import { _ as resetQueue, a as pauseEpochScheduler, c as chooseCameraSpriteTileSize, d as maxSpriteTileSize, f as spriteQualityCheckFrameModulo, g as pauseQueue, h as enqueueTexture, i as scheduleSpriteQualityUpgrade, l as chooseSpriteTileForScreenSize, m as bumpGeneration, n as pauseQualityUpgradeScheduler, o as registerEpochShape, p as spriteQualityUpgradeDelayMs, r as resumeQualityUpgradeScheduler, s as resumeEpochScheduler, u as clampSpriteTileSize, v as resumeQueue } from "./theme-CrGG_WGJ.mjs";
import { t as useGeneralPools } from "./useGamificationPools-AoDkdkBO.mjs";
import * as React$1 from "react";
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { Fragment, jsx, jsxs } from "react/jsx-runtime";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { AdaptiveDpr } from "@react-three/drei/core/AdaptiveDpr.js";
import { AdaptiveEvents } from "@react-three/drei/core/AdaptiveEvents.js";
import { Preload } from "@react-three/drei/core/Preload.js";
import { ACESFilmicToneMapping, CanvasTexture, ClampToEdgeWrapping, Frustum, LinearFilter, Matrix4, Quaternion, SRGBColorSpace, SpriteMaterial, Vector2, Vector3 } from "three";
import { Html } from "@react-three/drei/web/Html.js";
//#region src/lib/hooks/useRealMobileViewport.ts
function useRealMobileViewport() {
	const [isRealMobile, setIsRealMobile] = useState(false);
	useEffect(() => {
		const checkMobile = () => {
			const touch = navigator.maxTouchPoints > 0;
			const coarse = window.matchMedia("(pointer: coarse)").matches;
			const width = window.innerWidth;
			const ua = navigator.userAgent;
			const isIOS = ua.includes("iPad") || ua.includes("iPhone") || ua.includes("iPod") || ua.includes("Macintosh") && touch;
			const isAndroid = ua.includes("Android");
			setIsRealMobile(touch && width <= VIEWPORT_BREAKPOINTS.tabletMax || isIOS || isAndroid || coarse);
		};
		checkMobile();
		window.addEventListener("resize", checkMobile);
		window.addEventListener("orientationchange", checkMobile);
		return () => {
			window.removeEventListener("resize", checkMobile);
			window.removeEventListener("orientationchange", checkMobile);
		};
	}, []);
	return isRealMobile;
}
//#endregion
//#region src/canvas-engine/modifiers/color-modifiers/style.ts
function sampleBrandColor(avg) {
	return gradientColor(VIVID_COLOR_STOPS, avg).rgb;
}
function computeVisualStyle(avg) {
	const t = clamp01$6(avg);
	return {
		rgb: applyExposureContrast(sampleBrandColor(t), 1 + .4 * t, .9 + .3 * t),
		alpha: 255,
		blend: 1,
		hueShift: 0,
		brightness: 1
	};
}
//#endregion
//#region src/graph-runtime/sprites/selection/probabilitySpec.ts
function getProbAt(curve, avg) {
	if (curve.length === 0) return 1;
	const first = curve[0];
	if (avg <= first.t) return first.prob;
	const last = curve[curve.length - 1];
	if (avg >= last.t) return last.prob;
	for (let i = 1; i < curve.length; i++) {
		const lo = curve[i - 1];
		const hi = curve[i];
		if (avg >= lo.t && avg <= hi.t) {
			const frac = (avg - lo.t) / (hi.t - lo.t);
			return lo.prob + (hi.prob - lo.prob) * frac;
		}
	}
	return 1;
}
var SHAPE_PROBABILITY_SPEC = {
	clouds: [],
	snow: [],
	house: [],
	power: [],
	sun: [],
	villa: [],
	car: [],
	sea: [],
	carFactory: [],
	bus: [],
	trees: []
};
//#endregion
//#region src/graph-runtime/sprites/selection/shapeForAvg.ts
var SHAPES = [
	"clouds",
	"snow",
	"house",
	"power",
	"sun",
	"villa",
	"car",
	"sea",
	"carFactory",
	"bus",
	"trees"
];
var FALLBACK_SHAPE = "clouds";
function clamp01$5(t) {
	return Math.max(0, Math.min(1, t));
}
function hash01$2(s) {
	let h = 2166136261;
	for (let i = 0; i < s.length; i++) {
		h ^= s.charCodeAt(i);
		h = Math.imul(h, 16777619);
	}
	h ^= h >>> 16;
	h = Math.imul(h, 2246822507);
	h ^= h >>> 13;
	h = Math.imul(h, 3266489909);
	h ^= h >>> 16;
	return (h >>> 0) / 4294967295;
}
function prng(seedStr) {
	let x = Math.max(1, Math.floor(hash01$2(seedStr) * 4294967295)) >>> 0;
	return () => {
		x ^= x << 13;
		x >>>= 0;
		x ^= x >> 17;
		x >>>= 0;
		x ^= x << 5;
		x >>>= 0;
		return (x >>> 0) / 4294967295;
	};
}
function permute(arr, seedStr) {
	const out = arr.slice();
	const rnd = prng(seedStr);
	for (let i = out.length - 1; i > 0; i--) {
		const j = Math.floor(rnd() * (i + 1));
		const a = out[i];
		const b = out[j];
		if (a === void 0 || b === void 0) continue;
		out[i] = b;
		out[j] = a;
	}
	return out;
}
function pickDeterministicFromShapes(shapes, avgIn, seed, orderIndex) {
	const n = shapes.length;
	if (!n) return FALLBACK_SHAPE;
	const a = clamp01$5(Number.isFinite(avgIn) ? avgIn : .5);
	const seedStr = seed == null ? "seed:default" : String(seed);
	if (typeof orderIndex === "number" && Number.isFinite(orderIndex)) {
		const idx = Math.max(0, Math.floor(orderIndex));
		const batch = Math.floor(idx / n);
		const pos = idx % n;
		return permute(shapes, `perm:${seedStr}:b${String(batch)}`)[pos];
	}
	return shapes[(Math.min(n - 1, Math.floor(a * n)) + Math.floor(hash01$2(`rot:${seedStr}`) * n) % n) % n] ?? FALLBACK_SHAPE;
}
function isUniformPool(pool, epsilon = 1e-6) {
	if (pool.length <= 1) return true;
	const first = pool[0]?.w ?? 0;
	return pool.every((entry) => Math.abs(entry.w - first) <= epsilon);
}
function weightsToSlots(pool) {
	const maxWeight = Math.max(...pool.map((entry) => entry.w), 1e-6);
	return pool.map((entry) => ({
		shape: entry.shape,
		slots: Math.max(1, Math.round(entry.w / maxWeight * 4))
	}));
}
function weightedSequenceLength(pool) {
	return weightsToSlots(pool).reduce((sum, entry) => sum + entry.slots, 0);
}
function buildWeightedSequence(pool, seedStr) {
	const weighted = permute(weightsToSlots(pool), `weights:${seedStr}`);
	const totalSlots = weighted.reduce((sum, entry) => sum + entry.slots, 0);
	const current = new Map(weighted.map((entry) => [entry.shape, 0]));
	const sequence = [];
	for (let step = 0; step < totalSlots; step++) {
		let picked = weighted[0];
		let pickedScore = -Infinity;
		for (const entry of weighted) {
			const nextScore = (current.get(entry.shape) ?? 0) + entry.slots;
			current.set(entry.shape, nextScore);
			if (nextScore > pickedScore) {
				picked = entry;
				pickedScore = nextScore;
			}
		}
		current.set(picked.shape, (current.get(picked.shape) ?? 0) - totalSlots);
		sequence.push(picked.shape);
	}
	return sequence;
}
function shapeForAvg(avgIn, seed, orderIndex) {
	return pickDeterministicFromShapes(SHAPES, avgIn, seed, orderIndex);
}
function sampleShapeForAvg(avgIn, seed, orderIndex, spec = SHAPE_PROBABILITY_SPEC) {
	const avg = clamp01$5(Number.isFinite(avgIn) ? avgIn : .5);
	const seedStr = seed == null ? "seed:default" : String(seed);
	const pool = [];
	let total = 0;
	for (const shape of SHAPES) {
		const w = getProbAt(spec[shape], avg);
		if (w > 0) {
			pool.push({
				shape,
				w
			});
			total += w;
		}
	}
	if (pool.length === 0) return shapeForAvg(avgIn, seed, orderIndex);
	if (isUniformPool(pool)) return pickDeterministicFromShapes(pool.map((entry) => entry.shape), avgIn, seed, orderIndex);
	if (typeof orderIndex === "number" && Number.isFinite(orderIndex)) {
		const idx = Math.max(0, Math.floor(orderIndex));
		const batchSize = Math.max(1, weightedSequenceLength(pool));
		const sequence = buildWeightedSequence(pool, `${seedStr}:weighted:b${String(Math.floor(idx / batchSize))}`);
		return sequence[idx % sequence.length] ?? FALLBACK_SHAPE;
	}
	const rng = hash01$2(`prob:${seedStr}:${orderIndex === void 0 ? "" : String(orderIndex)}`) * total;
	let acc = 0;
	for (const entry of pool) {
		acc += entry.w;
		if (rng <= acc) return entry.shape;
	}
	return pool[pool.length - 1]?.shape ?? FALLBACK_SHAPE;
}
//#endregion
//#region src/graph-runtime/debug/spriteFlags.ts
var SHAPE_ALIASES = {
	bus: "bus",
	car: "car",
	carfactory: "carFactory",
	clouds: "clouds",
	cloud: "clouds",
	house: "house",
	power: "power",
	sea: "sea",
	snow: "snow",
	sun: "sun",
	trees: "trees",
	tree: "trees",
	villa: "villa"
};
function readWindowFlag(name) {
	if (typeof window === "undefined") return false;
	return window[name] === true;
}
function readBooleanStorageFlag(key) {
	if (typeof window === "undefined") return false;
	try {
		const value = window.localStorage.getItem(key);
		return value === "1" || value === "true";
	} catch {
		return false;
	}
}
function readBooleanQueryFlag(...keys) {
	if (typeof window === "undefined") return false;
	try {
		const params = new URLSearchParams(window.location.search);
		return keys.some((key) => {
			const value = params.get(key);
			return value === "1" || value === "true";
		});
	} catch {
		return false;
	}
}
function normalizeShape(value) {
	if (typeof value !== "string") return void 0;
	return SHAPE_ALIASES[value.trim().replace(/[\s_-]/g, "").toLowerCase()];
}
function normalizeAvg(value) {
	const n = typeof value === "number" ? value : typeof value === "string" ? Number(value.trim()) : NaN;
	if (!Number.isFinite(n)) return void 0;
	return Math.max(0, Math.min(1, n));
}
function readStorageShape() {
	if (typeof window === "undefined") return void 0;
	try {
		return normalizeShape(window.localStorage.getItem("be.debug.spriteShape"));
	} catch {
		return;
	}
}
function readQueryShape() {
	if (typeof window === "undefined") return void 0;
	try {
		const params = new URLSearchParams(window.location.search);
		return normalizeShape(params.get("gpShape") ?? params.get("spriteShape"));
	} catch {
		return;
	}
}
function readStorageAvg() {
	if (typeof window === "undefined") return void 0;
	try {
		return normalizeAvg(window.localStorage.getItem("be.debug.spriteAvg"));
	} catch {
		return;
	}
}
function readQueryAvg() {
	if (typeof window === "undefined") return void 0;
	try {
		const params = new URLSearchParams(window.location.search);
		return normalizeAvg(params.get("gpAvg") ?? params.get("spriteAvg"));
	} catch {
		return;
	}
}
function shouldDisableSpriteCaching() {
	return readWindowFlag("__GP_DISABLE_SPRITE_CACHE");
}
function shouldDisableSpriteQuantization() {
	return readWindowFlag("__GP_DISABLE_SPRITE_QUANTIZATION");
}
function shouldDisableSpriteOptimizations() {
	return readWindowFlag("__GP_DISABLE_SPRITE_OPTIMIZATIONS");
}
function shouldDisableSpriteMaterialCaching() {
	return readWindowFlag("__GP_DISABLE_SPRITE_MATERIAL_CACHE");
}
function spriteCachingDisabled() {
	return shouldDisableSpriteOptimizations() || shouldDisableSpriteCaching();
}
function spriteQuantizationDisabled() {
	return shouldDisableSpriteOptimizations() || shouldDisableSpriteQuantization();
}
function spriteMaterialCachingDisabled() {
	return shouldDisableSpriteOptimizations() || shouldDisableSpriteMaterialCaching();
}
function forcedSpriteShape() {
	if (typeof window === "undefined") return void 0;
	return normalizeShape(window.__GP_FORCE_SPRITE_SHAPE) ?? readQueryShape() ?? readStorageShape();
}
function forcedSpriteShapeCacheKey() {
	return forcedSpriteShape() ?? "auto";
}
function forcedSpriteAvg() {
	if (typeof window === "undefined") return void 0;
	return normalizeAvg(window.__GP_FORCE_SPRITE_AVG) ?? readQueryAvg() ?? readStorageAvg();
}
function forcedSpriteAvgCacheKey() {
	const avg = forcedSpriteAvg();
	return avg === void 0 ? "auto" : avg.toFixed(4);
}
function shouldLogSpriteLoadErrors() {
	return readWindowFlag("__GP_LOG_LOAD_ERRORS");
}
function shouldShowHitboxDebugOverlay() {
	return readWindowFlag("__GP_SHOW_HITBOXES") || readBooleanQueryFlag("gpHitboxes", "showHitboxes") || readBooleanStorageFlag("be.debug.showHitboxes");
}
//#endregion
//#region src/graph-runtime/debug/spriteCacheMetrics.ts
var SPRITE_CACHE_METRIC_NAMES = [
	"quantizationCalls",
	"quantizationDisabledCalls",
	"assignmentCacheHits",
	"assignmentCacheMisses",
	"registryGetHits",
	"registryGetMisses",
	"ensureCacheHits",
	"ensureInFlightDedupes",
	"textureBuildsQueued",
	"textureBuildsCompleted",
	"textureBuildFailures"
];
function attachReset$1(metrics) {
	metrics.reset = () => {
		for (const key of SPRITE_CACHE_METRIC_NAMES) metrics[key] = void 0;
		delete metrics.bucketCounts;
		delete metrics.staticKeys;
	};
	return metrics;
}
var createMetrics$1 = () => attachReset$1({});
function metricsEnabled$1() {
	if (typeof window === "undefined") return false;
	return window.__GP_TRACK_SPRITE_CACHE_METRICS === true || window.__GP_SPRITE_CACHE_METRICS != null;
}
function getMetrics() {
	var _window;
	if (!metricsEnabled$1()) return null;
	(_window = window).__GP_SPRITE_CACHE_METRICS ?? (_window.__GP_SPRITE_CACHE_METRICS = createMetrics$1());
	if (!window.__GP_SPRITE_CACHE_METRICS.reset) attachReset$1(window.__GP_SPRITE_CACHE_METRICS);
	return window.__GP_SPRITE_CACHE_METRICS;
}
function bumpSpriteCacheMetric(name, amount = 1) {
	const metrics = getMetrics();
	if (!metrics) return;
	metrics[name] = (metrics[name] ?? 0) + amount;
}
function recordSpriteBucket(bucketId) {
	const metrics = getMetrics();
	if (!metrics) return;
	metrics.bucketCounts ?? (metrics.bucketCounts = {});
	const key = String(bucketId);
	metrics.bucketCounts[key] = (metrics.bucketCounts[key] ?? 0) + 1;
}
function recordStaticTextureKey(key) {
	const metrics = getMetrics();
	if (!metrics) return;
	metrics.staticKeys ?? (metrics.staticKeys = /* @__PURE__ */ new Set());
	metrics.staticKeys.add(key);
}
//#endregion
//#region src/graph-runtime/sprites/internal/spritePolicy.ts
var SPRITE_TINT_BUCKETS = 10;
function clamp01$4(v) {
	return Math.max(0, Math.min(1, v));
}
var BIAS_GAMMA = 1.8;
function biasDown(t, gamma = BIAS_GAMMA) {
	return Math.pow(clamp01$4(t), Math.max(1, gamma));
}
function rawBucketIdFromAvg(avg) {
	const tb = biasDown(Number.isFinite(avg) ? avg : .5);
	return Math.min(SPRITE_TINT_BUCKETS - 1, Math.floor(tb * SPRITE_TINT_BUCKETS));
}
var REMAP = [
	0,
	0,
	1,
	1,
	2,
	3,
	4,
	6,
	6,
	6
];
function adjustedBucketId(id) {
	return REMAP[Math.max(0, Math.min(9, id))] ?? 0;
}
function bucketMidpoint(id) {
	return (id + .5) / SPRITE_TINT_BUCKETS;
}
function quantizeAvgWithDownshift(avg) {
	if (spriteQuantizationDisabled()) {
		bumpSpriteCacheMetric("quantizationDisabledCalls");
		const unclamped = clamp01$4(Number.isFinite(avg) ? avg : .5);
		const bucketId = Math.round(unclamped * 1e3);
		recordSpriteBucket(bucketId);
		return {
			bucketId,
			bucketAvg: unclamped
		};
	}
	bumpSpriteCacheMetric("quantizationCalls");
	const adj = adjustedBucketId(rawBucketIdFromAvg(avg));
	recordSpriteBucket(adj);
	return {
		bucketId: adj,
		bucketAvg: bucketMidpoint(adj)
	};
}
function resolveSpriteAvgForDebug(avg) {
	const fallbackAvg = typeof avg === "number" && Number.isFinite(avg) ? avg : .5;
	return forcedSpriteAvg() ?? fallbackAvg;
}
function hash01$1(s) {
	let h = 2166136261;
	for (let i = 0; i < s.length; i++) {
		h ^= s.charCodeAt(i);
		h = Math.imul(h, 16777619);
	}
	h ^= h >>> 16;
	h = Math.imul(h, 2246822507);
	h ^= h >>> 13;
	h = Math.imul(h, 3266489909);
	h ^= h >>> 16;
	return (h >>> 0) / 4294967295;
}
function pickVariantSlot(seedStr, slots = 8) {
	const s = Math.max(1, slots | 0);
	return Math.floor(hash01$1(seedStr) * s) % s;
}
function makeStaticKey(args) {
	const { shape, tileSize, dpr, alpha, bucketId, variant, darkMode, pixelScaleBoost, footprint, bleed } = args;
	const boostSuffix = pixelScaleBoost !== void 0 && pixelScaleBoost !== 1 ? `|PX${String(pixelScaleBoost)}` : "";
	const geometrySuffix = footprint ? `|FP${String(footprint.w)}x${String(footprint.h)}|BL${String(bleed?.top ?? 0)},${String(bleed?.right ?? 0)},${String(bleed?.bottom ?? 0)},${String(bleed?.left ?? 0)}` : "";
	return [
		"SPRITE",
		shape,
		`B${String(bucketId)}`,
		`V${String(variant)}`,
		String(tileSize),
		String(dpr),
		String(alpha),
		`STATIC_NATIVE${darkMode ? "|DK" : ""}${boostSuffix}${geometrySuffix}`
	].join("|");
}
function makeSpriteSeedKey(args) {
	const { shape, bucketId, variant } = args;
	return [
		"SPRITE_SEED",
		shape,
		`B${String(bucketId)}`,
		`V${String(variant)}`
	].join("|");
}
function chooseShape(args) {
	const forced = forcedSpriteShape();
	if (forced) return forced;
	const avg = resolveSpriteAvgForDebug(args.avg);
	const t = clamp01$4(Number.isFinite(avg) ? avg : .5);
	return sampleShapeForAvg(t, args.seed ?? t, args.orderIndex);
}
var _assignmentCache = /* @__PURE__ */ new Map();
function getOrAssignShapeEntry(entryId, sectionKey, avg, seed, orderIndex, variantSlots = 8) {
	const cacheKey = `${entryId}|${sectionKey}|${forcedSpriteShapeCacheKey()}|${forcedSpriteAvgCacheKey()}`;
	const hit = _assignmentCache.get(cacheKey);
	if (hit) {
		bumpSpriteCacheMetric("assignmentCacheHits");
		return hit;
	}
	bumpSpriteCacheMetric("assignmentCacheMisses");
	const effectiveAvg = resolveSpriteAvgForDebug(avg);
	const shape = chooseShape({
		avg: effectiveAvg,
		seed,
		orderIndex
	});
	const { bucketId, bucketAvg } = quantizeAvgWithDownshift(effectiveAvg);
	const assignment = {
		shape,
		variant: pickVariantSlot(`${shape}|B${String(bucketId)}|${String(seed)}|${String(orderIndex)}`, Math.max(1, variantSlots)),
		bucketId,
		bucketAvg,
		sourceAvg: clamp01$4(effectiveAvg)
	};
	_assignmentCache.set(cacheKey, assignment);
	return assignment;
}
function resolveDpr(fallback = 1) {
	return typeof window !== "undefined" ? Math.min(1.5, window.devicePixelRatio) : fallback;
}
//#endregion
//#region src/graph-runtime/sprites/selection/drawers.ts
var drawSpriteSnow = (p, x, y, r, opts) => {
	drawSnow(p, x, y, r, {
		...opts,
		showGround: false
	});
};
var DRAWERS = {
	sea: drawSea,
	trees: drawTrees,
	house: drawHouse,
	power: drawPower,
	carFactory: drawCarFactory,
	car: drawCar,
	bus: drawBus,
	clouds: drawClouds,
	sun: drawSun,
	snow: drawSpriteSnow,
	villa: drawVilla
};
//#endregion
//#region src/graph-runtime/sprites/api/shapeProfiles.ts
var SPRITE_FOOTPRINT_WORLD_SCALE = 1 / 2;
var SHAPE_PROFILES = {
	clouds: {
		footprint: {
			w: 2,
			h: 3
		},
		bleed: {
			top: .5,
			right: .5,
			bottom: .5,
			left: .5
		},
		interactionPadding: {
			top: 0,
			right: 0,
			bottom: -1.5,
			left: 0
		},
		particles: {
			enabled: true,
			scaleBoost: {
				laptop: 2.4,
				tablet: 1.8,
				mobile: 1.6
			}
		}
	},
	bus: { footprint: {
		w: 2,
		h: 1
	} },
	snow: {
		footprint: {
			w: 1,
			h: 3
		},
		visualScale: .9,
		bleed: {
			top: .5,
			left: 1,
			right: 1
		},
		interactionPadding: {
			top: [0, -.5],
			right: .2,
			left: .2,
			bottom: -1.5
		},
		particles: {
			enabled: true,
			scaleBoost: {
				laptop: 1.4,
				tablet: 1.4,
				mobile: 1.3
			}
		}
	},
	house: {
		footprint: {
			w: 1,
			h: 4
		},
		interactionBounds: "renderedShape",
		bleed: { top: 2 },
		particles: {
			enabled: true,
			scaleBoost: {
				laptop: 1.5,
				tablet: 1.5,
				mobile: 1.35
			}
		}
	},
	power: {
		footprint: {
			w: 1,
			h: 3
		},
		particles: { enabled: true },
		bleed: {
			top: 3,
			left: 3,
			right: 3
		},
		interactionPadding: {
			top: [-1, 0],
			right: 0,
			bottom: 0,
			left: 0
		}
	},
	sun: {
		bleed: {
			top: 1,
			right: 1,
			bottom: 1,
			left: 1
		},
		footprint: {
			w: 1,
			h: 1
		},
		interactionScale: .9
	},
	villa: {
		footprint: {
			w: 2,
			h: 2
		},
		interactionPadding: { top: -.3 },
		bleed: { left: 1 }
	},
	car: {
		footprint: {
			w: 1,
			h: 1
		},
		visualScale: .86,
		anchorBiasY: -.14
	},
	sea: {
		footprint: {
			w: 2,
			h: 1
		},
		bleed: {
			top: .1,
			bottom: .4,
			right: 1,
			left: 1
		},
		particles: {
			enabled: true,
			scaleBoost: {
				laptop: 1.15,
				tablet: 1.15,
				mobile: 1.1
			}
		}
	},
	carFactory: {
		footprint: {
			w: 2,
			h: 2
		},
		particles: {
			enabled: true,
			scaleBoost: {
				laptop: 1.5,
				tablet: 1.5,
				mobile: 1.5
			}
		},
		bleed: {
			top: 2,
			right: .1,
			bottom: 0,
			left: .1
		},
		interactionPadding: {
			top: [-.2, -.7],
			right: 0,
			bottom: 0,
			left: 0
		}
	},
	trees: {
		footprint: {
			w: 1,
			h: 1
		},
		bleed: {
			top: 1.5,
			right: .1,
			bottom: 0,
			left: .1
		},
		interactionPadding: {
			top: .5,
			right: 0,
			bottom: 0,
			left: 0
		}
	}
};
function getShapeProfile(shape) {
	return SHAPE_PROFILES[shape];
}
function resolveParticleScaleBoost(shape, dev) {
	const boost = getShapeProfile(shape).particles?.scaleBoost;
	if (!boost) return void 0;
	return boost[dev ?? deviceType(getViewportSize().w)];
}
var PARTICLE_SHAPES = new Set(Object.keys(SHAPE_PROFILES).filter((shape) => SHAPE_PROFILES[shape].particles?.enabled));
var FOOTPRINTS = Object.fromEntries(Object.keys(SHAPE_PROFILES).map((shape) => [shape, SHAPE_PROFILES[shape].footprint]));
var BLEED = Object.fromEntries(Object.keys(SHAPE_PROFILES).filter((shape) => SHAPE_PROFILES[shape].bleed).map((shape) => [shape, SHAPE_PROFILES[shape].bleed]));
//#endregion
//#region src/canvas-engine/offscreen-shape-surface.ts
function makeOffscreenShapeSurface(canvas, { dpr = 1 } = {}) {
	const ctx = canvas.getContext("2d", { alpha: true });
	if (!ctx) throw new Error("2D canvas context not available");
	const p = makeP(canvas, ctx);
	const cssW = canvas.style.width ? parseFloat(canvas.style.width) : canvas.width / dpr;
	const cssH = canvas.style.height ? parseFloat(canvas.style.height) : canvas.height / dpr;
	p.pixelDensity(Math.max(1, dpr || 1));
	p.resizeCanvas(cssW, cssH);
	return p;
}
//#endregion
//#region src/graph-runtime/sprites/textures/canvasFacade.ts
function makeCanvasFacade(canvas, opts) {
	return makeOffscreenShapeSurface(canvas, opts);
}
//#endregion
//#region src/graph-runtime/sprites/textures/spriteLight.ts
var SPRITE_PALETTE_CLOSENESS_K = .6;
var SPRITE_LIGHT_SOURCE = {
	xK: .5,
	yK: -.12
};
var SPRITE_LIGHT_INTENSITY = {
	sun: .95,
	moon: .72
};
function makeSpritePaletteLightContext(sceneW, sceneH, darkMode) {
	const w = Math.max(1, sceneW);
	const h = Math.max(1, sceneH);
	return {
		sourceX: w * SPRITE_LIGHT_SOURCE.xK,
		sourceY: h * SPRITE_LIGHT_SOURCE.yK,
		kind: darkMode ? "moon" : "sun",
		intensity: darkMode ? SPRITE_LIGHT_INTENSITY.moon : SPRITE_LIGHT_INTENSITY.sun,
		paletteClosenessK: SPRITE_PALETTE_CLOSENESS_K,
		sceneW: w,
		sceneH: h,
		sceneDiag: Math.max(1, Math.hypot(w, h)),
		lightColor: darkMode ? {
			r: 198,
			g: 220,
			b: 255
		} : {
			r: 255,
			g: 222,
			b: 168
		},
		shadowColor: darkMode ? {
			r: 58,
			g: 76,
			b: 108
		} : {
			r: 88,
			g: 114,
			b: 150
		}
	};
}
//#endregion
//#region src/graph-runtime/sprites/textures/makeTextureFromDrawer.ts
function makeTextureFromDrawer({ drawer, tileSize = 192, alpha = 235, dpr = typeof window !== "undefined" ? Math.min(2, window.devicePixelRatio || 1) : 1, gradientRGB, liveAvg = .5, blend = .6, footprint = {
	w: 1,
	h: 1
}, bleed = {}, timeMs = typeof performance !== "undefined" ? performance.now() : 0, dtSec = 1 / 60, seedKey, darkMode = false, pixelScaleBoost, particleStore }) {
	const wTiles = Math.max(1e-6, footprint.w || 1);
	const hTiles = Math.max(1e-6, footprint.h || 1);
	const bTop = Math.max(0, bleed.top ?? 0);
	const bRight = Math.max(0, bleed.right ?? 0);
	const bBottom = Math.max(0, bleed.bottom ?? 0);
	const bLeft = Math.max(0, bleed.left ?? 0);
	const totalTilesW = wTiles + bLeft + bRight;
	const totalTilesH = hTiles + bTop + bBottom;
	const logicalW = Math.max(2, Math.round(totalTilesW * tileSize));
	const logicalH = Math.max(2, Math.round(totalTilesH * tileSize));
	const cnv = document.createElement("canvas");
	cnv.style.width = `${String(logicalW)}px`;
	cnv.style.height = `${String(logicalH)}px`;
	const p = makeCanvasFacade(cnv, { dpr });
	const ctx = p.drawingContext;
	{
		const prev = ctx.getTransform();
		ctx.setTransform(1, 0, 0, 1, 0, 0);
		ctx.clearRect(0, 0, cnv.width, cnv.height);
		ctx.setTransform(prev);
	}
	const centerX = logicalW / 2;
	const centerY = logicalH / 2;
	const cell = tileSize;
	const drawParticleStore = particleStore ?? createParticleStore$1();
	const footprintForDrawer = {
		r0: bTop,
		c0: bLeft,
		w: wTiles,
		h: hTiles
	};
	const lightCtx = makeSpritePaletteLightContext(logicalW, logicalH, darkMode);
	const baseOpts = {
		projection: {
			cell,
			footprint: footprintForDrawer
		},
		style: {
			alpha,
			gradientRGB,
			liveAvg,
			blend,
			darkMode,
			lightCtx
		},
		identity: { seedKey },
		sprite: {
			fitToFootprint: true,
			coreScaleMult: Math.max(1, pixelScaleBoost ?? 1),
			pixelScale: Math.max(1, pixelScaleBoost ?? 1),
			particlePixelScale: Math.max(1, pixelScaleBoost ?? 1),
			disableParticleDepthTint: true
		},
		particles: { particleStore: drawParticleStore },
		oscAmp: 0,
		oscSpeed: 0,
		opacityOsc: { amp: 0 },
		sizeOsc: { mode: "none" }
	};
	const r = Math.min(logicalW, logicalH) * .8;
	const safeDtSec = Math.max(1 / 120, Math.min(.35, dtSec));
	const renderTimeMs = timeMs;
	p.__tick(renderTimeMs - safeDtSec * 1e3);
	p.__tick(renderTimeMs);
	const opts = {
		...baseOpts,
		lifecycle: {
			timeMs: renderTimeMs,
			dtSec: safeDtSec
		}
	};
	try {
		drawer(p, centerX, centerY, r, opts);
	} catch (err) {
		const prev = ctx.getTransform();
		ctx.setTransform(1, 0, 0, 1, 0, 0);
		ctx.clearRect(0, 0, cnv.width, cnv.height);
		ctx.setTransform(prev);
		throw err;
	}
	const tex = new CanvasTexture(cnv);
	tex.colorSpace = SRGBColorSpace;
	tex.generateMipmaps = false;
	tex.minFilter = LinearFilter;
	tex.magFilter = LinearFilter;
	tex.wrapS = ClampToEdgeWrapping;
	tex.wrapT = ClampToEdgeWrapping;
	tex.anisotropy = 8;
	tex.needsUpdate = true;
	return tex;
}
//#endregion
//#region src/graph-runtime/sprites/textures/cache/registry.ts
var isMobileDevice = typeof window !== "undefined" && (navigator.maxTouchPoints > 0 || "ontouchstart" in window);
var TextureRegistry = class {
	constructor() {
		this.cache = /* @__PURE__ */ new Map();
		this.inFlight = /* @__PURE__ */ new Set();
		this.listeners = /* @__PURE__ */ new Set();
		this.cancelListeners = /* @__PURE__ */ new Set();
	}
	get(key) {
		if (spriteCachingDisabled()) return null;
		const tex = this.cache.get(key) ?? null;
		bumpSpriteCacheMetric(tex ? "registryGetHits" : "registryGetMisses");
		if (tex) recordStaticTextureKey(key);
		return tex;
	}
	onReady(cb) {
		this.listeners.add(cb);
		return () => this.listeners.delete(cb);
	}
	onCancel(cb) {
		this.cancelListeners.add(cb);
		return () => this.cancelListeners.delete(cb);
	}
	ensure(args) {
		const { key, prio = 0, background = false } = args;
		const disableCache = spriteCachingDisabled();
		recordStaticTextureKey(key);
		if (this.inFlight.has(key)) {
			bumpSpriteCacheMetric("ensureInFlightDedupes");
			return;
		}
		if (!disableCache && this.cache.has(key)) {
			bumpSpriteCacheMetric("ensureCacheHits");
			return;
		}
		this.inFlight.add(key);
		bumpSpriteCacheMetric("textureBuildsQueued");
		enqueueTexture(() => {
			let tex = null;
			try {
				tex = makeTextureFromDrawer({
					drawer: args.drawer,
					tileSize: args.tileSize,
					dpr: args.dpr,
					alpha: args.alpha,
					gradientRGB: args.gradientRGB,
					liveAvg: args.liveAvg,
					blend: args.blend,
					footprint: args.footprint,
					bleed: args.bleed,
					seedKey: args.seedKey,
					darkMode: args.darkMode,
					pixelScaleBoost: args.pixelScaleBoost
				});
				tex.generateMipmaps = false;
				tex.anisotropy = isMobileDevice ? 4 : 8;
				tex.minFilter = LinearFilter;
				tex.magFilter = LinearFilter;
				tex.needsUpdate = true;
				if (!disableCache) this.cache.set(key, tex);
				bumpSpriteCacheMetric("textureBuildsCompleted");
				for (const l of this.listeners) l(key, tex);
			} catch (err) {
				bumpSpriteCacheMetric("textureBuildFailures");
				if (shouldLogSpriteLoadErrors()) console.warn("[SPRITE:STATIC] build failed", key, err);
			} finally {
				this.inFlight.delete(key);
			}
		}, prio, background, () => {
			this.inFlight.delete(key);
			for (const listener of this.cancelListeners) listener(key);
		});
	}
	prewarm(list, { prioBase = 0 } = {}) {
		let p = prioBase;
		for (const args of list) this.ensure({
			...args,
			prio: p++
		});
	}
	clear() {
		for (const tex of this.cache.values()) try {
			tex.dispose();
		} catch {}
		this.cache.clear();
		this.inFlight.clear();
		this.listeners.clear();
		this.cancelListeners.clear();
	}
};
var textureRegistry = new TextureRegistry();
//#endregion
//#region src/graph-runtime/sprites/textures/cache/textureTracker.ts
var __GLOBAL_TEX = /* @__PURE__ */ new Set();
function trackTexture(tex) {
	__GLOBAL_TEX.add(tex);
	return tex;
}
function disposeAllTrackedTextures() {
	try {
		for (const t of __GLOBAL_TEX) try {
			t.dispose();
		} catch {}
	} catch {}
	__GLOBAL_TEX.clear();
}
//#endregion
//#region src/graph-runtime/sprites/internal/spriteMaterials.ts
var PLACEHOLDER_MATERIAL = new SpriteMaterial({
	transparent: true,
	opacity: .24,
	color: "#a6a6a6",
	depthWrite: false,
	depthTest: false,
	toneMapped: false
});
var SHARED_SPRITE_MATERIALS = /* @__PURE__ */ new Map();
function makeSpriteMaterialKey(tex, opacity) {
	return [
		tex.uuid,
		opacity,
		0,
		0,
		0,
		"white"
	].join("|");
}
function acquireSpriteMaterial(tex, opacity) {
	const key = makeSpriteMaterialKey(tex, opacity);
	const hit = SHARED_SPRITE_MATERIALS.get(key);
	if (hit) {
		hit.refs += 1;
		return hit.material;
	}
	const material = new SpriteMaterial({
		map: tex,
		transparent: true,
		depthWrite: false,
		depthTest: false,
		opacity,
		toneMapped: false,
		color: "white"
	});
	material.needsUpdate = true;
	SHARED_SPRITE_MATERIALS.set(key, {
		material,
		refs: 1
	});
	return material;
}
function releaseSpriteMaterial(tex, opacity) {
	const key = makeSpriteMaterialKey(tex, opacity);
	const hit = SHARED_SPRITE_MATERIALS.get(key);
	if (!hit) return;
	hit.refs -= 1;
	if (hit.refs > 0) return;
	try {
		hit.material.dispose();
	} catch {}
	SHARED_SPRITE_MATERIALS.delete(key);
}
function disposeAllSpriteMaterials() {
	for (const hit of SHARED_SPRITE_MATERIALS.values()) try {
		hit.material.dispose();
	} catch {}
	SHARED_SPRITE_MATERIALS.clear();
}
function makeUnsharedSpriteMaterial(tex, opacity) {
	const material = new SpriteMaterial({
		map: tex,
		transparent: true,
		depthWrite: false,
		depthTest: false,
		opacity,
		toneMapped: false,
		color: "white"
	});
	material.needsUpdate = true;
	return material;
}
//#endregion
//#region src/graph-runtime/sprites/internal/spriteRuntime.ts
var noop$1 = () => void 0;
function disposeAllSpriteTextures() {
	disposeAllSpriteMaterials();
	disposeAllTrackedTextures();
	try {
		textureRegistry.clear();
	} catch {}
}
function prewarmSpriteTextures(items, { tileSize = 256, dpr = resolveDpr(1), maxCount = 32, darkMode = false } = {}) {
	const dev = deviceType(getViewportSize().w);
	const TILE = clampSpriteTileSize(tileSize, dev);
	const seen = /* @__PURE__ */ new Set();
	const jobs = [];
	const limited = items.slice(0, Math.max(1, maxCount));
	for (const it of limited) {
		const effectiveAvg = resolveSpriteAvgForDebug(it.avg);
		const shape = chooseShape({
			avg: effectiveAvg,
			seed: it.seed,
			orderIndex: it.orderIndex
		});
		const { bucketId, bucketAvg } = quantizeAvgWithDownshift(effectiveAvg);
		const variant = pickVariantSlot(`${shape}|B${String(bucketId)}|${String(it.seed ?? "")}|${String(it.orderIndex ?? 0)}`);
		const seedKey = makeSpriteSeedKey({
			shape,
			bucketId,
			variant
		});
		const seenKey = `${shape}:${String(bucketId)}:V${String(variant)}`;
		if (seen.has(seenKey)) continue;
		seen.add(seenKey);
		const drawer = DRAWERS[shape];
		if (!drawer) continue;
		const footprint = FOOTPRINTS[shape];
		const bleed = BLEED[shape];
		const vs = computeVisualStyle(bucketAvg);
		const alphaUse = vs.alpha;
		const blendUse = vs.blend;
		if (PARTICLE_SHAPES.has(shape)) {
			const sKeyEarly = makeStaticKey({
				shape,
				tileSize: TILE,
				dpr,
				alpha: alphaUse,
				bucketId,
				variant,
				darkMode,
				pixelScaleBoost: resolveParticleScaleBoost(shape, dev),
				footprint,
				bleed
			});
			if (!textureRegistry.get(sKeyEarly)) jobs.push({
				key: sKeyEarly,
				drawer,
				tileSize: TILE,
				dpr,
				alpha: alphaUse,
				gradientRGB: vs.rgb,
				liveAvg: bucketAvg,
				blend: blendUse,
				footprint,
				bleed,
				seedKey,
				prio: 1,
				darkMode,
				pixelScaleBoost: resolveParticleScaleBoost(shape, dev)
			});
		} else {
			const key2 = makeStaticKey({
				shape,
				tileSize: TILE,
				dpr,
				alpha: alphaUse,
				bucketId,
				variant,
				darkMode,
				pixelScaleBoost: resolveParticleScaleBoost(shape, dev),
				footprint,
				bleed
			});
			if (!textureRegistry.get(key2)) jobs.push({
				key: key2,
				drawer,
				tileSize: TILE,
				dpr,
				alpha: alphaUse,
				gradientRGB: vs.rgb,
				liveAvg: bucketAvg,
				blend: blendUse,
				footprint,
				bleed,
				seedKey,
				prio: 0,
				darkMode,
				pixelScaleBoost: resolveParticleScaleBoost(shape, dev)
			});
		}
	}
	if (jobs.length) textureRegistry.prewarm(jobs, { prioBase: 0 });
}
function getStaticTexture(key) {
	return textureRegistry.get(key);
}
function requestStaticTexture(args, onReady) {
	const existing = textureRegistry.get(args.key);
	if (existing) {
		onReady(existing);
		return noop$1;
	}
	textureRegistry.ensure({
		...args,
		prio: args.prio ?? 0
	});
	let active = true;
	let retryTimer;
	const off = textureRegistry.onReady((readyKey, readyTex) => {
		if (!active) return;
		if (readyKey === args.key) onReady(readyTex);
	});
	const offCancel = textureRegistry.onCancel((cancelledKey) => {
		if (!active || cancelledKey !== args.key) return;
		retryTimer = setTimeout(() => {
			if (!active || textureRegistry.get(args.key)) return;
			textureRegistry.ensure({
				...args,
				prio: args.prio ?? 0
			});
		}, 0);
	});
	return () => {
		active = false;
		off();
		offCancel();
		if (retryTimer !== void 0) clearTimeout(retryTimer);
	};
}
//#endregion
//#region src/graph-runtime/debug/zoomMetrics.ts
var GRAPH_ZOOM_METRIC_NAMES = [
	"wheelEvents",
	"touchMoveEvents",
	"zoomFrames",
	"radiusStateUpdates",
	"zoomTexturePauses",
	"zoomTextureResumes",
	"tileSizeUpdates",
	"qualityChecks",
	"qualityUpgradeSchedules",
	"qualityUpgradeApplies",
	"qualityDowngrades"
];
function attachReset(metrics) {
	metrics.reset = () => {
		for (const key of GRAPH_ZOOM_METRIC_NAMES) metrics[key] = void 0;
	};
	return metrics;
}
var createMetrics = () => attachReset({});
function metricsEnabled() {
	if (typeof window === "undefined") return false;
	return window.__GP_TRACK_ZOOM_METRICS === true || window.__GP_ZOOM_METRICS != null;
}
function bumpZoomMetric(name, amount = 1) {
	var _window;
	if (!metricsEnabled()) return;
	(_window = window).__GP_ZOOM_METRICS ?? (_window.__GP_ZOOM_METRICS = createMetrics());
	if (!window.__GP_ZOOM_METRICS.reset) attachReset(window.__GP_ZOOM_METRICS);
	window.__GP_ZOOM_METRICS[name] = (window.__GP_ZOOM_METRICS[name] ?? 0) + amount;
}
//#endregion
//#region src/graph-runtime/sprites/textures/measureRenderedBounds.ts
function createParticleStore() {
	const particleEmitters = /* @__PURE__ */ new Map();
	const puffEmitters = /* @__PURE__ */ new Map();
	return {
		particleEmitters,
		puffEmitters,
		clear() {
			particleEmitters.clear();
			puffEmitters.clear();
		}
	};
}
var CACHE = /* @__PURE__ */ new Map();
function cacheKey(args) {
	const bleed = args.bleed ?? {};
	return [
		args.seedKey ?? "seedless",
		args.footprint.w,
		args.footprint.h,
		bleed.top ?? 0,
		bleed.right ?? 0,
		bleed.bottom ?? 0,
		bleed.left ?? 0,
		args.liveAvg ?? .5,
		args.blend ?? .6,
		args.tileSize ?? 96
	].join("|");
}
function measureRenderedShapeBounds(args) {
	if (typeof document === "undefined") return null;
	const key = cacheKey(args);
	if (CACHE.has(key)) return CACHE.get(key) ?? null;
	const tileSize = args.tileSize ?? 96;
	const footprint = args.footprint;
	const bleed = args.bleed ?? {};
	const bTop = Math.max(0, bleed.top ?? 0);
	const bRight = Math.max(0, bleed.right ?? 0);
	const bBottom = Math.max(0, bleed.bottom ?? 0);
	const bLeft = Math.max(0, bleed.left ?? 0);
	const logicalW = Math.max(2, Math.round((footprint.w + bLeft + bRight) * tileSize));
	const logicalH = Math.max(2, Math.round((footprint.h + bTop + bBottom) * tileSize));
	const canvas = document.createElement("canvas");
	canvas.style.width = `${String(logicalW)}px`;
	canvas.style.height = `${String(logicalH)}px`;
	const p = makeCanvasFacade(canvas, { dpr: 1 });
	const ctx = p.drawingContext;
	ctx.setTransform(1, 0, 0, 1, 0, 0);
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	try {
		args.drawer(p, logicalW / 2, logicalH / 2, Math.min(logicalW, logicalH) * .8, {
			projection: {
				cell: tileSize,
				footprint: {
					r0: bTop,
					c0: bLeft,
					w: footprint.w,
					h: footprint.h
				}
			},
			style: {
				alpha: 255,
				liveAvg: args.liveAvg ?? .5,
				blend: args.blend ?? .6,
				darkMode: false,
				lightCtx: makeSpritePaletteLightContext(logicalW, logicalH, false)
			},
			identity: { seedKey: args.seedKey },
			sprite: {
				fitToFootprint: true,
				coreScaleMult: 1,
				pixelScale: 1,
				particlePixelScale: 1
			},
			particles: { particleStore: createParticleStore() },
			pass: {
				renderPass: "depthMask",
				maskColor: {
					r: 0,
					g: 0,
					b: 0
				},
				maskAlpha: 255
			},
			lifecycle: {
				timeMs: 0,
				dtSec: 1 / 60
			}
		});
	} catch {
		CACHE.set(key, null);
		return null;
	}
	const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
	let minX = canvas.width;
	let minY = canvas.height;
	let maxX = -1;
	let maxY = -1;
	for (let y = 0; y < canvas.height; y += 1) for (let x = 0; x < canvas.width; x += 1) {
		if (data[(y * canvas.width + x) * 4 + 3] <= 8) continue;
		if (x < minX) minX = x;
		if (x > maxX) maxX = x;
		if (y < minY) minY = y;
		if (y > maxY) maxY = y;
	}
	if (maxX < minX || maxY < minY) {
		CACHE.set(key, null);
		return null;
	}
	const left = minX / tileSize - bLeft;
	const right = (maxX + 1) / tileSize - bLeft;
	const top = minY / tileSize - bTop;
	const bottom = (maxY + 1) / tileSize - bTop;
	const bounds = {
		width: Math.max(.05, right - left),
		height: Math.max(.05, bottom - top),
		centerX: (left + right) / 2,
		centerY: (top + bottom) / 2
	};
	CACHE.set(key, bounds);
	return bounds;
}
//#endregion
//#region src/graph-runtime/sprites/internal/spriteGeometry.ts
function computeSpriteWorldGeometry({ shape, basePosition, scale, applyVisualOffsets = true, assignment }) {
	const profile = getShapeProfile(shape);
	const shapeScaleK = profile.visualScale ?? 1;
	const finalScale = scale * SPRITE_FOOTPRINT_WORLD_SCALE * shapeScaleK;
	const fp = profile.footprint;
	const bl = profile.bleed;
	const totalW = fp.w + (bl?.left ?? 0) + (bl?.right ?? 0);
	const totalH = fp.h + (bl?.top ?? 0) + (bl?.bottom ?? 0);
	const width = finalScale * totalW;
	const height = finalScale * totalH;
	const position = [...basePosition];
	const renderedBounds = !applyVisualOffsets && profile.interactionBounds === "renderedShape" && assignment && DRAWERS[shape] ? measureRenderedShapeBounds({
		drawer: DRAWERS[shape],
		footprint: fp,
		bleed: bl,
		seedKey: makeSpriteSeedKey({
			shape,
			bucketId: assignment.bucketId,
			variant: assignment.variant
		}),
		liveAvg: assignment.bucketAvg
	}) : null;
	const renderedCenterX = renderedBounds ? (bl?.left ?? 0) + renderedBounds.centerX : null;
	const renderedCenterY = renderedBounds ? (bl?.bottom ?? 0) + (fp.h - renderedBounds.centerY) : null;
	const offsetX = bl ? ((bl.right ?? 0) - (bl.left ?? 0)) * width / (2 * totalW) : 0;
	const offsetY = height * (profile.anchorBiasY ?? 0) + (bl ? ((bl.top ?? 0) - (bl.bottom ?? 0)) * height / (2 * totalH) : 0);
	const centerX = renderedCenterX !== null ? renderedCenterX / Math.max(1e-4, totalW) : .5 - offsetX / Math.max(1e-4, width);
	const centerY = renderedCenterY !== null ? renderedCenterY / Math.max(1e-4, totalH) : .5 - offsetY / Math.max(1e-4, height);
	return {
		scale: [
			width,
			height,
			1
		],
		position,
		center: [centerX, centerY],
		width,
		height
	};
}
//#endregion
//#region src/graph-runtime/sprites/internal/spriteShape.tsx
function clamp01$3(v) {
	return Math.max(0, Math.min(1, v));
}
var track = trackTexture;
function releaseEpochTex(tex) {
	if (!tex) return;
	try {
		tex.dispose();
		if (tex.image instanceof HTMLCanvasElement) {
			tex.image.width = 1;
			tex.image.height = 1;
		}
	} catch {}
}
function SpriteShape({ avg, seed, orderIndex, position = [
	0,
	0,
	0
], scale = 3.6, tileSize = 256, alpha: _alpha = 215, blend: _blend = 1, opacity = 1, variantSlots = 8, variantSeed, darkMode = false, occasionalRefreshMs = 0, worldPosition, centerAtPosition = false, suspendQualityUpdates = false, texturePriority = 0, assignment }) {
	const effectiveAvg = resolveSpriteAvgForDebug(avg);
	const tShape = clamp01$3(Number.isFinite(effectiveAvg) ? effectiveAvg : .5);
	const _derived = quantizeAvgWithDownshift(effectiveAvg);
	const bucketId = assignment?.bucketId ?? _derived.bucketId;
	const bucketAvg = assignment?.bucketAvg ?? _derived.bucketAvg;
	const shape = React$1.useMemo(() => assignment?.shape ?? chooseShape({
		avg: tShape,
		seed: seed ?? tShape,
		orderIndex
	}), [
		assignment,
		tShape,
		seed,
		orderIndex
	]);
	const dev = deviceType(getViewportSize().w);
	const baseTile = clampSpriteTileSize(tileSize, dev);
	const [qualityTileSize, setQualityTileSize] = React$1.useState(baseTile);
	const cancelQualityUpgradeRef = React$1.useRef(null);
	const pendingQualityTileRef = React$1.useRef(null);
	const qualityCheckModulo = spriteQualityCheckFrameModulo(dev);
	const TILE = qualityTileSize;
	const dpr = resolveDpr(1);
	const isVisibleRef = React$1.useRef(true);
	const clearPendingQualityUpgrade = React$1.useCallback(() => {
		cancelQualityUpgradeRef.current?.();
		cancelQualityUpgradeRef.current = null;
		pendingQualityTileRef.current = null;
	}, []);
	const scheduleQualityUpgrade = React$1.useCallback((nextTile) => {
		if (pendingQualityTileRef.current === nextTile) return;
		clearPendingQualityUpgrade();
		pendingQualityTileRef.current = nextTile;
		bumpZoomMetric("qualityUpgradeSchedules");
		cancelQualityUpgradeRef.current = scheduleSpriteQualityUpgrade({
			delayMs: spriteQualityUpgradeDelayMs(dev, orderIndex ?? 0),
			isVisible: () => isVisibleRef.current,
			apply: () => {
				const target = pendingQualityTileRef.current;
				cancelQualityUpgradeRef.current = null;
				pendingQualityTileRef.current = null;
				if (target) {
					bumpZoomMetric("qualityUpgradeApplies");
					setQualityTileSize((prev) => Math.max(prev, target));
				}
			}
		});
	}, [
		clearPendingQualityUpgrade,
		dev,
		orderIndex,
		setQualityTileSize
	]);
	React$1.useEffect(() => {
		const maxTile = maxSpriteTileSize(dev);
		if (qualityTileSize > maxTile) {
			clearPendingQualityUpgrade();
			setQualityTileSize(maxTile);
			return;
		}
		if (baseTile > qualityTileSize) {
			scheduleQualityUpgrade(baseTile);
			return;
		}
		if (pendingQualityTileRef.current !== null && pendingQualityTileRef.current <= baseTile) clearPendingQualityUpgrade();
	}, [
		baseTile,
		clearPendingQualityUpgrade,
		dev,
		qualityTileSize,
		scheduleQualityUpgrade
	]);
	const isParticleShape = PARTICLE_SHAPES.has(shape);
	const vs = computeVisualStyle(bucketAvg);
	const alphaUse = vs.alpha;
	const variant = React$1.useMemo(() => {
		if (assignment?.variant !== void 0) return assignment.variant;
		const seedPart = seed == null ? "" : String(seed);
		const vSeed = variantSeed ?? `${shape}|B${String(bucketId)}|${seedPart}|${String(orderIndex ?? 0)}`;
		return pickVariantSlot(String(vSeed), Math.max(1, variantSlots));
	}, [
		assignment,
		shape,
		bucketId,
		seed,
		orderIndex,
		variantSeed,
		variantSlots
	]);
	const [localDarkMode, setLocalDarkMode] = React$1.useState(darkMode);
	React$1.useEffect(() => {
		if (localDarkMode === darkMode) return;
		const delay = Math.min((orderIndex ?? 0) * 6, 1200);
		const id = setTimeout(() => {
			setLocalDarkMode(darkMode);
		}, delay);
		return () => {
			clearTimeout(id);
		};
	}, [darkMode]);
	const stableSeedKey = React$1.useMemo(() => {
		return makeSpriteSeedKey({
			shape,
			bucketId,
			variant
		});
	}, [
		shape,
		bucketId,
		variant
	]);
	const wantsEpochRefresh = React$1.useMemo(() => {
		if (shape === "house") return houseHasChimney(stableSeedKey, bucketAvg);
		return true;
	}, [
		shape,
		stableSeedKey,
		bucketAvg
	]);
	const [refreshEpoch, setRefreshEpoch] = React$1.useState(0);
	const setRefreshEpochRef = React$1.useRef(setRefreshEpoch);
	React$1.useEffect(() => {
		setRefreshEpochRef.current = setRefreshEpoch;
	}, [setRefreshEpoch]);
	React$1.useEffect(() => {
		if (!occasionalRefreshMs || !wantsEpochRefresh) return;
		return registerEpochShape({
			isVisible: () => isVisibleRef.current && fogOpacityRef.current > .72,
			tick: () => {
				setRefreshEpochRef.current((e) => e + 1);
			},
			intervalMs: occasionalRefreshMs
		});
	}, [occasionalRefreshMs, wantsEpochRefresh]);
	const key = React$1.useMemo(() => {
		const staticBase = makeStaticKey({
			shape,
			tileSize: TILE,
			dpr,
			alpha: alphaUse,
			bucketId,
			variant,
			darkMode: localDarkMode,
			pixelScaleBoost: resolveParticleScaleBoost(shape, dev),
			footprint: FOOTPRINTS[shape],
			bleed: BLEED[shape]
		});
		if (refreshEpoch > 0) return `${staticBase}|e:${String(refreshEpoch)}`;
		return staticBase;
	}, [
		shape,
		TILE,
		dpr,
		alphaUse,
		bucketId,
		variant,
		localDarkMode,
		refreshEpoch,
		dev
	]);
	const [texState, setTexState] = React$1.useState(() => {
		return {
			key,
			tex: getStaticTexture(key) ?? null
		};
	});
	const tex = texState.key === key ? texState.tex : null;
	const prevTexRef = React$1.useRef(null);
	const prevTexShapeRef = React$1.useRef(null);
	React$1.useEffect(() => {
		if (tex) {
			prevTexRef.current = tex;
			prevTexShapeRef.current = shape;
		}
	}, [tex, shape]);
	const displayTex = tex ?? (prevTexShapeRef.current === shape ? prevTexRef.current : null);
	React$1.useEffect(() => {
		setTexState({
			key,
			tex: getStaticTexture(key) ?? null
		});
	}, [localDarkMode, key]);
	React$1.useEffect(() => {
		let cancelled = false;
		const setIfAlive = (t) => {
			if (!cancelled && t) setTexState({
				key,
				tex: track(t)
			});
		};
		const drawer = DRAWERS[shape];
		if (!drawer) return;
		if (tex) return;
		const footprint = FOOTPRINTS[shape];
		const bleed = BLEED[shape];
		const isBackgroundTextureRequest = prevTexShapeRef.current === shape && prevTexRef.current !== null || texturePriority <= 0;
		const common = {
			tileSize: TILE,
			dpr,
			alpha: alphaUse,
			liveAvg: bucketAvg,
			blend: vs.blend,
			gradientRGB: vs.rgb,
			footprint,
			bleed,
			seedKey: stableSeedKey
		};
		if (refreshEpoch > 0) {
			const prevEpochTex = epochTexRef.current;
			try {
				const nowMs = typeof performance !== "undefined" ? performance.now() : Date.now();
				const particleStoreKey = [
					shape,
					stableSeedKey,
					bucketId,
					variant,
					localDarkMode ? 1 : 0,
					TILE,
					dpr,
					alphaUse,
					resolveParticleScaleBoost(shape, dev) ?? 1
				].join("|");
				if (isParticleShape && epochParticleKeyRef.current !== particleStoreKey) {
					epochParticleStoreRef.current?.clear();
					epochParticleStoreRef.current = createParticleStore$1();
					epochParticleKeyRef.current = particleStoreKey;
					epochParticleTimeRef.current = null;
				}
				const lastParticlePaintMs = epochParticleTimeRef.current;
				const dtSec = lastParticlePaintMs == null ? 1 / 60 : (nowMs - lastParticlePaintMs) / 1e3;
				const newTex = makeTextureFromDrawer({
					drawer,
					tileSize: TILE,
					dpr,
					alpha: alphaUse,
					gradientRGB: vs.rgb,
					liveAvg: bucketAvg,
					blend: vs.blend,
					footprint,
					bleed,
					seedKey: common.seedKey,
					darkMode: localDarkMode,
					pixelScaleBoost: resolveParticleScaleBoost(shape, dev),
					timeMs: nowMs,
					dtSec,
					particleStore: isParticleShape ? epochParticleStoreRef.current ?? void 0 : void 0
				});
				if (isParticleShape) epochParticleTimeRef.current = nowMs;
				epochTexRef.current = newTex;
				setTexState({
					key,
					tex: newTex
				});
				if (prevEpochTex) requestAnimationFrame(() => {
					releaseEpochTex(prevEpochTex);
				});
			} catch {}
			return () => {
				cancelled = true;
			};
		}
		const off = requestStaticTexture({
			key,
			drawer,
			tileSize: TILE,
			dpr,
			alpha: alphaUse,
			gradientRGB: vs.rgb,
			liveAvg: bucketAvg,
			blend: vs.blend,
			footprint,
			bleed,
			seedKey: common.seedKey,
			prio: texturePriority,
			darkMode: localDarkMode,
			pixelScaleBoost: resolveParticleScaleBoost(shape, dev),
			background: isBackgroundTextureRequest
		}, (t) => {
			setIfAlive(t);
		});
		return () => {
			cancelled = true;
			off();
		};
	}, [
		key,
		tex,
		shape,
		TILE,
		dpr,
		alphaUse,
		bucketAvg,
		variant,
		bucketId,
		localDarkMode,
		vs.blend,
		vs.rgb,
		refreshEpoch,
		stableSeedKey,
		isParticleShape,
		dev,
		texturePriority
	]);
	const materialCacheDisabled = spriteMaterialCachingDisabled() || !!worldPosition;
	const material = React$1.useMemo(() => {
		if (!displayTex) return null;
		return materialCacheDisabled ? makeUnsharedSpriteMaterial(displayTex, opacity) : acquireSpriteMaterial(displayTex, opacity);
	}, [
		displayTex,
		opacity,
		materialCacheDisabled
	]);
	React$1.useEffect(() => {
		if (!displayTex) return;
		return () => {
			if (materialCacheDisabled) {
				try {
					material?.dispose();
				} catch {}
				return;
			}
			releaseSpriteMaterial(displayTex, opacity);
		};
	}, [
		displayTex,
		opacity,
		material,
		materialCacheDisabled
	]);
	const spriteGeometry = computeSpriteWorldGeometry({
		shape,
		basePosition: Array.isArray(position) ? [...position] : [
			0,
			0,
			0
		],
		scale,
		applyVisualOffsets: !centerAtPosition,
		assignment
	});
	const sx = spriteGeometry.width;
	const sy = spriteGeometry.height;
	const spriteCenter = React$1.useMemo(() => new Vector2(spriteGeometry.center[0], spriteGeometry.center[1]), [spriteGeometry.center]);
	const materialRef = React$1.useRef(null);
	React$1.useEffect(() => {
		materialRef.current = material;
	}, [material]);
	const spriteRef = React$1.useRef(null);
	const _wp = React$1.useRef(new Vector3());
	const _frustum = React$1.useRef(new Frustum());
	const _projScreenMatrix = React$1.useRef(new Matrix4());
	const fogOpacityRef = React$1.useRef(1);
	const smoothZoomFadeRef = React$1.useRef(0);
	const smoothFogTRef = React$1.useRef(0);
	const epochTexRef = React$1.useRef(null);
	const epochParticleStoreRef = React$1.useRef(null);
	const epochParticleKeyRef = React$1.useRef(null);
	const epochParticleTimeRef = React$1.useRef(null);
	const qualityCheckFrameRef = React$1.useRef((orderIndex ?? 0) % qualityCheckModulo);
	React$1.useEffect(() => {
		return () => {
			cancelQualityUpgradeRef.current?.();
			pendingQualityTileRef.current = null;
			releaseEpochTex(epochTexRef.current);
			epochParticleStoreRef.current?.clear();
		};
	}, []);
	useFrame(({ camera }) => {
		const spr = spriteRef.current;
		if (spr) {
			spr.getWorldPosition(_wp.current);
			_projScreenMatrix.current.multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse);
			_frustum.current.setFromProjectionMatrix(_projScreenMatrix.current);
			isVisibleRef.current = _frustum.current.containsPoint(_wp.current);
		}
		if (!suspendQualityUpdates && spr && isVisibleRef.current) {
			qualityCheckFrameRef.current = (qualityCheckFrameRef.current + 1) % qualityCheckModulo;
			if (qualityCheckFrameRef.current === 0) {
				bumpZoomMetric("qualityChecks");
				const distance = Math.max(.001, camera.position.distanceTo(_wp.current));
				const height = typeof window !== "undefined" ? window.innerHeight || 1 : 1;
				const fovRad = ("fov" in camera && typeof camera.fov === "number" ? camera.fov : 50) * Math.PI / 180;
				const worldPerPxY = 2 * Math.tan(fovRad / 2) * distance / height;
				const nextTile = chooseSpriteTileForScreenSize(Math.max(sx, sy) / Math.max(1e-6, worldPerPxY), qualityTileSize, baseTile, dev);
				if (nextTile < qualityTileSize) {
					clearPendingQualityUpgrade();
					bumpZoomMetric("qualityDowngrades");
					setQualityTileSize(nextTile);
				} else if (nextTile > qualityTileSize && pendingQualityTileRef.current !== nextTile) scheduleQualityUpgrade(nextTile);
			}
		}
		const mat = materialRef.current;
		if (!mat || !spr || !worldPosition) return;
		const cameraToOrigin = camera.position.length();
		const invLen = 1 / Math.max(.001, cameraToOrigin);
		const fwdX = -camera.position.x * invLen;
		const fwdY = -camera.position.y * invLen;
		const fwdZ = -camera.position.z * invLen;
		const depth = (_wp.current.x - camera.position.x) * fwdX + (_wp.current.y - camera.position.y) * fwdY + (_wp.current.z - camera.position.z) * fwdZ;
		const fogNear = cameraToOrigin + 1.5;
		const fogFar = cameraToOrigin + 24;
		const fogTRaw = Math.max(0, Math.min(1, (depth - fogNear) / Math.max(1, fogFar - fogNear)));
		smoothFogTRef.current += (fogTRaw - smoothFogTRef.current) * .1;
		const t = smoothFogTRef.current * smoothFogTRef.current * (3 - 2 * smoothFogTRef.current);
		const rawZoomFade = Math.max(0, Math.min(1, (cameraToOrigin - 25) / 50));
		smoothZoomFadeRef.current += (rawZoomFade - smoothZoomFadeRef.current) * .07;
		const zoomFade = smoothZoomFadeRef.current;
		const newOpacity = Math.max(.34, 1 - t * .74 * zoomFade);
		fogOpacityRef.current = newOpacity;
		if (Math.abs(mat.opacity - newOpacity) > .004) mat.opacity = newOpacity;
	});
	if (!displayTex) return null;
	return /* @__PURE__ */ jsx("sprite", {
		ref: spriteRef,
		position: spriteGeometry.position,
		scale: spriteGeometry.scale,
		center: spriteCenter,
		renderOrder: 5,
		children: /* @__PURE__ */ jsx("primitive", {
			object: material ?? PLACEHOLDER_MATERIAL,
			attach: "material",
			dispose: null
		})
	});
}
//#endregion
//#region src/graph-runtime/sprites/api/visual.ts
function normalizeBoundsPaddingSpec(bounds) {
	return {
		top: bounds?.top ?? 0,
		right: bounds?.right ?? 0,
		bottom: bounds?.bottom ?? 0,
		left: bounds?.left ?? 0
	};
}
function farPaddingValue(value) {
	return Array.isArray(value) ? value[0] : value;
}
function resolveStaticBoundsPadding(bounds) {
	return {
		top: farPaddingValue(bounds.top),
		right: farPaddingValue(bounds.right),
		bottom: farPaddingValue(bounds.bottom),
		left: farPaddingValue(bounds.left)
	};
}
function resolveBoundedSize$1(size, before, after) {
	return Math.max(.05, size + before + after);
}
function getOrAssignSprite(args) {
	if (!args.entryId) return void 0;
	return getOrAssignShapeEntry(args.entryId, args.sectionKey, args.avg, args.seed, args.orderIndex, args.variantSlots ?? 8);
}
function resolveSpriteShape(args) {
	return args.assignment?.shape ?? chooseShape(args);
}
function resolveSpriteVisualLayout(args) {
	const profile = getShapeProfile(args.shape);
	const footprint = profile.footprint;
	const boundsPaddingSpec = normalizeBoundsPaddingSpec(args.boundsPadding ?? profile.interactionPadding);
	const boundsPadding = resolveStaticBoundsPadding(boundsPaddingSpec);
	const hitboxScale = args.hitboxScale ?? 1;
	const interactionScale = profile.interactionScale ?? 1;
	const finalScale = args.baseScale * SPRITE_FOOTPRINT_WORLD_SCALE * (profile.visualScale ?? 1);
	const drawer = DRAWERS[args.shape];
	const renderedBounds = profile.interactionBounds === "renderedShape" && args.assignment && drawer ? measureRenderedShapeBounds({
		drawer,
		footprint,
		bleed: profile.bleed,
		seedKey: makeSpriteSeedKey({
			shape: args.shape,
			bucketId: args.assignment.bucketId,
			variant: args.assignment.variant
		}),
		liveAvg: args.assignment.bucketAvg
	}) : null;
	const baseW = renderedBounds?.width ?? footprint.w;
	const baseH = renderedBounds?.height ?? footprint.h;
	const baseCenterX = renderedBounds?.centerX ?? footprint.w / 2;
	const baseCenterY = renderedBounds?.centerY ?? footprint.h / 2;
	const totalW = resolveBoundedSize$1(baseW, boundsPadding.left, boundsPadding.right);
	const totalH = resolveBoundedSize$1(baseH, boundsPadding.top, boundsPadding.bottom);
	const sxBase = finalScale * totalW;
	const syBase = finalScale * totalH;
	const measuredOffsetX = finalScale * (baseCenterX - footprint.w / 2);
	const measuredOffsetY = finalScale * (footprint.h / 2 - baseCenterY);
	const offsetX = measuredOffsetX + finalScale * (boundsPadding.right - boundsPadding.left) / 2;
	const visualOffsetY = measuredOffsetY + finalScale * (boundsPadding.top - boundsPadding.bottom) / 2 + syBase * (profile.anchorBiasY ?? 0);
	const sxHitbox = sxBase * interactionScale * hitboxScale;
	const syHitbox = syBase * interactionScale * hitboxScale;
	const centerX = .5 - offsetX / Math.max(1e-4, sxHitbox);
	const centerY = .5 - visualOffsetY / Math.max(1e-4, syHitbox);
	return {
		scale: [
			sxHitbox,
			syHitbox,
			1
		],
		offset: [
			0,
			0,
			0
		],
		center: [centerX, centerY],
		visualOffset: [
			offsetX,
			visualOffsetY,
			0
		],
		aspect: totalW / Math.max(1e-4, totalH),
		tileWorld: finalScale,
		footprint,
		boundsSize: {
			w: baseW,
			h: baseH
		},
		boundsPadding,
		boundsPaddingSpec,
		tooltipBiasY: syBase * (profile.tooltipAnchorBiasY ?? 0)
	};
}
function resolveSpriteVisual(args) {
	const assignment = args.assignment ?? getOrAssignSprite(args);
	const shape = resolveSpriteShape({
		avg: args.avg,
		seed: args.seed,
		orderIndex: args.orderIndex,
		assignment
	});
	return {
		shape,
		assignment,
		layout: resolveSpriteVisualLayout({
			shape,
			baseScale: args.baseScale,
			hitboxScale: args.hitboxScale,
			assignment
		})
	};
}
//#endregion
//#region src/graph-runtime/sprites/api/identity.ts
var SHAPE_LABELS = {
	clouds: "cloud",
	snow: "snow cloud",
	house: "house",
	sun: "sun",
	villa: "home",
	car: "car",
	sea: "pond",
	carFactory: "workshop",
	bus: "bus",
	trees: "tree grove"
};
var SHAPE_COPY = {
	clouds: {
		veryLow: "You're a cloud. People can't predict you; one moment you pour like there's no tomorrow, next it's all sunshine and rainbows.",
		low: "You're a cloud that used to rain at the right moment. These days it's more of a guess fed by ever-changing conditions; you give a reason to discuss weather.",
		high: "You're a cloud, doing cloudy deeds. You rain and feed the soil - just leave before the plants have had enough.",
		veryHigh: "You're a well-behaved cloud, moving slowly, raining steadily, and people think the soil smells good when you rain."
	},
	snow: {
		veryLow: "You're a snow cloud, but you don't snow enough for a snowman.",
		low: "You're a snow cloud - enough snow to make a backdrop for a romance movie, not enough to support ecosystems.",
		high: "You're a snow cloud. You would stop schools for a day in the South, but you'd likely stay in the North.",
		veryHigh: "You're a snow cloud, a snow cloud from the 1950s - a nostalgic one, days of steady snow type."
	},
	house: {
		veryLow: "You're a house, and it seems Santa won't be able to use the chimney. At least, burglars will stay away too.",
		low: "You're a house, comfort zone for many, but the landlord will be angry at the electric costs.",
		high: "You're a house where the thermostat was set once and nobody dared to change it since. Though, it gets the job done.",
		veryHigh: "You're a house; either everyone's out or they're all vampires for how little electricity they use."
	},
	sun: {
		veryLow: "You're the sun. You're not shaking; the atmosphere is bending your light more than it should.",
		low: "You're the sun, glowing orange through a thick layer of atmosphere.",
		high: "You're the sun, illuminating everything with a bright light. You're too hot for your own good.",
		veryHigh: "You're the sun. Your brightness makes us squint, but we can't do without you. You're hot and cool rather than cooling the world."
	},
	moon: {
		veryLow: "You're the moon, jittering in a restless sky. Your light seems almost nervous.",
		low: "You're the moon, wobbling in an infinite sky. You are dreamy; your light seems to flicker every now and then.",
		high: "You're the moon, the solace for those that notice the details of the world. When they look at you, all feels calmer.",
		veryHigh: "You're the moon, quiet, steady, anchoring the night in magic. The night feels cozy with clean chill air and you're the star."
	},
	villa: {
		veryLow: "You're a home where someone's always inside, lights on, and nobody's checked on the garden in a while.",
		low: "You're a home where people overspend on utilities. They don't have to, but life gets distracting and they forget.",
		high: "You're a home where a family lives, but the kids sleep with lights at night. It gets scary...",
		veryHigh: "You're a home that makes you believe the garden has a soul that breathes. The smells are great! That's why everyone's outside usually."
	},
	car: {
		veryLow: "You're a car with a generous footprint. Your engine roars. You're a cheap thrill, but at least you are cooler than the world you left behind.",
		low: "You're a car for a working-class person who landed an onsite job with a not-so-ideal commute, but they landed a job in 2026 - that's all that matters!",
		high: "You're a car, built with sensibility, but you have to consume diesel to stay alive and you get sluggish when it's cold outside.",
		veryHigh: "You're a car. Your driver is retired and prefers a yacht, so you get to stay in the parking lot most days. At least you've got some other cars to hang out with."
	},
	sea: {
		veryLow: "You're a pond, spilling. Icebergs used to float over you, now they've all melted into your water. Coastal cities have become Atlantis.",
		low: "You're a pond, holding enough to support everything from seals to sea turtles. One of them lost territory they won't get back. The fish moved south. Water level is elevating.",
		high: "You're a pond. Your tides used to make headlines; people got used to it slowly, now it's just Tuesday.",
		veryHigh: "You're a pond. North or south, upside down or not, you don't spill. Perfectly stable. The weather made sure the icebergs you hold stay icy."
	},
	carFactory: {
		veryLow: "You're a car factory running at full throttle. The neighborhood tracks your shifts by the noise. Nobody inside is counting anything except units.",
		low: "You're a car factory striving for a balance of quantity and quality. Managers made sacrifices from material to manufacturing. The environment pays for those until the world is in debt.",
		high: "You're a car factory, employees split down the middle. Half advocate for clean manufacturing, costs and all. The other half think polluting is an acceptable tradeoff.",
		veryHigh: "You're a car factory using solar power. You build eco-friendly cars, but you're doing it for the sport of it. Pure class."
	},
	bus: {
		veryLow: "You're a bus. The municipality set you on an empty route with seldom any passengers, yet you roam the streets trying to find them. The occasional passenger is thankful for your service.",
		low: "You're a bus in a bustling city. Traffic got bad enough that people prefer to crowd your interior. The transportation authority got you a brand new air conditioner that'll surely help.",
		high: "You're a bus. Most of your passengers don't own a car, and some take a bike on good days. Although some people own umbrellas, you get crowded when the weather turns bad.",
		veryHigh: "You're a city bus, but you might as well be a sightseeing one. It's a walkable city. People hop on when their feet give out, just to find somewhere new to walk around."
	},
	trees: {
		veryLow: "You're a resilient tree grove facing drought, scorching asphalt, and a beating sun. You're turning yellow, but the fact that you're holding on is remarkable.",
		low: "You're a somewhat unlucky tree grove. There is a new road being paved right next to you, and you can't exactly pack up and leave. But deep down, you know you'll survive as you always do.",
		high: "You're a tree grove that someone started watering again. You still have that road next door, but you aren't interested in going through that door - not that you can anyway.",
		veryHigh: "You're a green tree grove with no roads cutting through your roots. People come to sit under your canopy, and animals love you."
	},
	factory: {
		veryLow: "You're a power plant, a stationary old train. Pre-evolution, you would've made the biggest smoker in the village. We've known how to cook for a while now, so we don't need your smoke anymore.",
		low: "You're a power plant, only working part-time. The smoke comes in patterns now. Operator Joe has been sending love letters to Mary from that village on the hill.",
		high: "You're a power plant. Contrary to popular belief, you can get sick. When you do, you sneeze bad particles. Right now, it is mostly harmless vapor. Still, work on that immune system."
	},
	windTurbine: {
		low: "You're a wind turbine, but someone picked the wrong location. No wind. Ugh.",
		high: "You're a wind turbine people complain about. Plant you a little farther out and you'd have all the room to swing your petals in peace.",
		veryHigh: "You're a wind turbine some kid decided looks like an alien spacecraft. They'll find out later you powered their house. Not bad."
	}
};
function sentenceForLabel(label) {
	return `You're a ${label}.`;
}
function copyBandForAvg(avg) {
	if (!Number.isFinite(avg)) return "low";
	if (avg < .25) return "veryLow";
	if (avg < .5) return "low";
	if (avg < .75) return "high";
	return "veryHigh";
}
function copyForRenderedKind({ renderedKind, label, avg }) {
	return SHAPE_COPY[renderedKind][copyBandForAvg(avg)] ?? sentenceForLabel(label);
}
function seedKeyForAssignment(assignment) {
	return makeSpriteSeedKey({
		shape: assignment.shape,
		bucketId: assignment.bucketId,
		variant: assignment.variant
	});
}
function resolveSpriteIdentity(assignment, context = {}) {
	const seedKey = seedKeyForAssignment(assignment);
	if (assignment.shape === "power") {
		const renderedKind = resolvePowerVisualKind({
			liveAvg: assignment.bucketAvg,
			seedKey
		});
		const label = renderedKind === "windTurbine" ? "wind turbine" : "small factory";
		return {
			shape: assignment.shape,
			renderedKind,
			label,
			copy: copyForRenderedKind({
				renderedKind,
				label,
				avg: assignment.sourceAvg ?? assignment.bucketAvg
			})
		};
	}
	if (assignment.shape === "sun") {
		const renderedKind = context.darkMode ? "moon" : "sun";
		const label = renderedKind;
		return {
			shape: assignment.shape,
			renderedKind,
			label,
			copy: copyForRenderedKind({
				renderedKind,
				label,
				avg: assignment.sourceAvg ?? assignment.bucketAvg
			})
		};
	}
	const label = SHAPE_LABELS[assignment.shape];
	const hasChimney = assignment.shape === "house" ? houseHasChimney(seedKey, assignment.bucketAvg) : void 0;
	return {
		shape: assignment.shape,
		renderedKind: assignment.shape,
		label,
		copy: copyForRenderedKind({
			renderedKind: assignment.shape,
			label,
			avg: assignment.sourceAvg ?? assignment.bucketAvg
		}),
		hasChimney
	};
}
//#endregion
//#region src/graph-runtime/dotgraph/tooltip/placement.ts
function classNameForPlacement(vertical, horizontal) {
	const parts = [];
	if (vertical === "top") parts.push("is-top");
	if (vertical === "bottom") parts.push("is-bottom");
	parts.push(horizontal === "mid" ? "is-mid" : `is-${horizontal}`);
	return parts.join(" ");
}
function placement(vertical, horizontal) {
	return {
		vertical,
		horizontal,
		className: classNameForPlacement(vertical, horizontal)
	};
}
function computeTooltipPlacement({ x, y, width, height, useDesktopLayout }) {
	if (isMobileWidth(width) || !useDesktopLayout) {
		const xFrac = x / width;
		const yFrac = y / height;
		const vertical = yFrac < .33 ? "top" : yFrac > .67 ? "bottom" : "middle";
		const isVerticalEdge = vertical !== "middle";
		const leftEdge = isVerticalEdge ? .12 : .25;
		const rightEdge = isVerticalEdge ? .88 : .75;
		if (xFrac < leftEdge) return placement(vertical, "left");
		if (xFrac > rightEdge) return placement(vertical, "right");
		return placement(yFrac < .33 ? "top" : "bottom", "mid");
	}
	const vEdge = 150;
	return placement(y < vEdge ? "top" : y > height - vEdge ? "bottom" : "middle", x > width * .84 ? "right" : x < width * .22 ? "left" : "mid");
}
function resolveTooltipAnchorCenterOffset(layout) {
	const width = Math.max(1e-4, layout.scale[0]);
	const height = Math.max(1e-4, layout.scale[1]);
	const [centerX, centerY] = layout.center;
	const left = -centerX * width;
	const right = (1 - centerX) * width;
	const bottom = -centerY * height;
	const top = (1 - centerY) * height;
	return [
		(left + right) / 2,
		(bottom + top) / 2,
		0
	];
}
//#endregion
//#region src/graph-runtime/dotgraph/interaction/useHoverBubble.ts
function useHoverBubble({ useDesktopLayout, isPinchingRef, isTouchRotatingRef, calcPercentForAvg }) {
	const [hoveredDot, setHoveredDot] = useState(null);
	const [viewportClass, setViewportClass] = useState("");
	const hideTimerRef = useRef(null);
	const onHoverStart = useCallback((dot, e) => {
		if (isPinchingRef?.current || isTouchRotatingRef?.current) return;
		const native = e.nativeEvent ?? e;
		const clientX = native.clientX;
		const clientY = native.clientY;
		if (typeof clientX === "number" && typeof clientY === "number" && Number.isFinite(clientX) && Number.isFinite(clientY) && typeof window !== "undefined") setViewportClass((e.tooltipPlacement ?? computeTooltipPlacement({
			x: clientX,
			y: clientY,
			width: document.documentElement.clientWidth,
			height: document.documentElement.clientHeight,
			useDesktopLayout
		})).className);
		if (!useDesktopLayout && hideTimerRef.current) {
			clearTimeout(hideTimerRef.current);
			hideTimerRef.current = null;
		}
		const avg = dot.averageWeight;
		const pct = typeof calcPercentForAvg === "function" ? calcPercentForAvg(avg) : 0;
		setHoveredDot({
			dotId: dot._id,
			percentage: pct,
			color: dot.color,
			anchorPosition: e.anchorPosition,
			tooltipLayout: e.tooltipLayout,
			tooltipPlacement: e.tooltipPlacement,
			tooltipAnchorMode: e.tooltipAnchorMode
		});
	}, [
		useDesktopLayout,
		isPinchingRef,
		isTouchRotatingRef,
		calcPercentForAvg
	]);
	const onHoverEnd = useCallback(() => {
		if (isPinchingRef?.current) return;
		setHoveredDot(null);
		setViewportClass("");
	}, [isPinchingRef]);
	return {
		hoveredDot,
		viewportClass,
		onHoverStart,
		onHoverEnd,
		handleHoverStart: onHoverStart,
		handleHoverEnd: onHoverEnd
	};
}
//#endregion
//#region src/graph-runtime/dotgraph/interaction/useHoverDismissal.ts
var getOrbitRotationSource = (event) => {
	if (!(event instanceof CustomEvent)) return void 0;
	const detail = event.detail;
	if (!detail || typeof detail !== "object" || !("source" in detail)) return void 0;
	return detail.source;
};
function useHoverDismissal({ mode, section, dataCount, useDesktopLayout, spotlightActiveRef, onHoverEnd }) {
	useEffect(() => {
		if (!spotlightActiveRef.current) onHoverEnd();
	}, [
		mode,
		section,
		dataCount,
		onHoverEnd,
		spotlightActiveRef
	]);
	const mobileRotDismissRef = useRef(null);
	useEffect(() => {
		const onRot = (event) => {
			if (useDesktopLayout || getOrbitRotationSource(event) !== "touch") return;
			if (mobileRotDismissRef.current) clearTimeout(mobileRotDismissRef.current);
			mobileRotDismissRef.current = setTimeout(() => {
				onHoverEnd();
				mobileRotDismissRef.current = null;
			}, 2e3);
		};
		window.addEventListener("gp:orbit-rot", onRot);
		return () => {
			window.removeEventListener("gp:orbit-rot", onRot);
			if (mobileRotDismissRef.current) clearTimeout(mobileRotDismissRef.current);
		};
	}, [useDesktopLayout, onHoverEnd]);
}
//#endregion
//#region src/graph-runtime/dotgraph/interaction/useObserverDelay.ts
function useObserverDelay(observerMode, delayMs = 2e3) {
	const [showCompleteUI, setShowCompleteUI] = useState(!observerMode);
	const t = useRef(null);
	useEffect(() => {
		if (t.current) {
			clearTimeout(t.current);
			t.current = null;
		}
		if (observerMode) setShowCompleteUI(false);
		else t.current = setTimeout(() => {
			setShowCompleteUI(true);
			t.current = null;
		}, delayMs);
		return () => {
			if (t.current) clearTimeout(t.current);
			t.current = null;
		};
	}, [observerMode, delayMs]);
	return showCompleteUI;
}
//#endregion
//#region src/graph-runtime/dotgraph/types.ts
function hasDotId(point) {
	return typeof point._id === "string" && point._id.length > 0;
}
//#endregion
//#region src/graph-runtime/dotgraph/tooltip/hoverEvent.ts
var TMP_CAMERA_RIGHT$2 = new Vector3();
var TMP_CAMERA_UP$2 = new Vector3();
var TMP_CAMERA_FORWARD$1 = new Vector3();
function projectWorldToClient({ camera, domElement, world }) {
	const projected = world.clone().project(camera);
	const rect = domElement.getBoundingClientRect();
	return {
		x: (projected.x * .5 + .5) * rect.width + rect.left,
		y: (-projected.y * .5 + .5) * rect.height + rect.top
	};
}
function spriteRuntimeTooltipLayout(layout, sprite) {
	return {
		...layout,
		scale: [
			sprite.scale.x,
			sprite.scale.y,
			sprite.scale.z
		],
		center: [sprite.center.x, sprite.center.y]
	};
}
function makeCenteredTooltipEvent({ camera, domElement, centerWorld, layout, target = null, useDesktopLayout, anchorMode = "hitboxCenter" }) {
	if (typeof document === "undefined") return null;
	const viewport = {
		width: document.documentElement.clientWidth,
		height: document.documentElement.clientHeight,
		useDesktopLayout
	};
	const centerClient = projectWorldToClient({
		camera,
		domElement,
		world: centerWorld
	});
	const tooltipPlacement = computeTooltipPlacement({
		x: centerClient.x,
		y: centerClient.y,
		...viewport
	});
	TMP_CAMERA_RIGHT$2.setFromMatrixColumn(camera.matrixWorld, 0).normalize();
	TMP_CAMERA_UP$2.setFromMatrixColumn(camera.matrixWorld, 1).normalize();
	TMP_CAMERA_FORWARD$1.setFromMatrixColumn(camera.matrixWorld, 2).normalize();
	const anchorWorld = centerWorld.clone();
	if (anchorMode !== "shapeCenter") {
		const [offsetX, offsetY, offsetZ] = resolveTooltipAnchorCenterOffset(layout);
		anchorWorld.addScaledVector(TMP_CAMERA_RIGHT$2, offsetX).addScaledVector(TMP_CAMERA_UP$2, offsetY).addScaledVector(TMP_CAMERA_FORWARD$1, offsetZ);
	}
	const finalClient = projectWorldToClient({
		camera,
		domElement,
		world: anchorWorld
	});
	return {
		nativeEvent: {
			clientX: finalClient.x,
			clientY: finalClient.y,
			target
		},
		anchorPosition: [
			anchorWorld.x,
			anchorWorld.y,
			anchorWorld.z
		],
		tooltipLayout: layout,
		tooltipPlacement,
		tooltipAnchorMode: anchorMode
	};
}
//#endregion
//#region src/graph-runtime/dotgraph/interaction/hitboxDistancePolicy.ts
var RANGE_FAR_DISTANCE = 50;
var RANGE_NEAR_DISTANCE = 1;
var FAR_HITBOX_SCALE_MAX = 1.75;
var FAR_HITBOX_SCALE_NEAR_DISTANCE = 35;
var FAR_HITBOX_SCALE_FULL_DISTANCE = 180;
var FAR_HITBOX_SCALE_CURVE = 4;
function clamp01$2(value) {
	return Math.max(0, Math.min(1, value));
}
function lerp$2(a, b, t) {
	return a + (b - a) * t;
}
function resolvePaddingValue(value, distanceToCamera) {
	if (!Array.isArray(value)) return value;
	const [farValue, nearValue] = value;
	return lerp$2(nearValue, farValue, clamp01$2((distanceToCamera - RANGE_NEAR_DISTANCE) / Math.max(1e-4, RANGE_FAR_DISTANCE - RANGE_NEAR_DISTANCE)));
}
function resolvePadding(layout, distanceToCamera) {
	const spec = layout.boundsPaddingSpec;
	return {
		top: resolvePaddingValue(spec.top, distanceToCamera),
		right: resolvePaddingValue(spec.right, distanceToCamera),
		bottom: resolvePaddingValue(spec.bottom, distanceToCamera),
		left: resolvePaddingValue(spec.left, distanceToCamera)
	};
}
function resolveBoundedSize(size, before, after) {
	return Math.max(.05, size + before + after);
}
function resolvePaddedLayout(layout, padding, sceneHitboxScale, distanceScale = 1) {
	const boundsSize = layout.boundsSize;
	const baseTotalW = resolveBoundedSize(boundsSize.w, layout.boundsPadding.left, layout.boundsPadding.right);
	const baseTotalH = resolveBoundedSize(boundsSize.h, layout.boundsPadding.top, layout.boundsPadding.bottom);
	const hitboxScaleX = layout.scale[0] / Math.max(1e-4, layout.tileWorld * baseTotalW);
	const hitboxScaleY = layout.scale[1] / Math.max(1e-4, layout.tileWorld * baseTotalH);
	const baseOffsetX = layout.tileWorld * (layout.boundsPadding.right - layout.boundsPadding.left) / 2;
	const baseOffsetY = layout.tileWorld * (layout.boundsPadding.top - layout.boundsPadding.bottom) / 2;
	const baseVisualOffsetX = (.5 - layout.center[0]) * layout.scale[0];
	const baseVisualOffsetY = (.5 - layout.center[1]) * layout.scale[1];
	const anchorBiasX = baseVisualOffsetX - baseOffsetX;
	const anchorBiasY = baseVisualOffsetY - baseOffsetY;
	const totalW = resolveBoundedSize(boundsSize.w, padding.left, padding.right);
	const totalH = resolveBoundedSize(boundsSize.h, padding.top, padding.bottom);
	const sxBase = layout.tileWorld * totalW * hitboxScaleX * sceneHitboxScale * distanceScale;
	const syBase = layout.tileWorld * totalH * hitboxScaleY * sceneHitboxScale * distanceScale;
	const offsetX = layout.tileWorld * (padding.right - padding.left) / 2;
	const offsetY = layout.tileWorld * (padding.top - padding.bottom) / 2;
	const centerX = .5 - (offsetX + anchorBiasX) / Math.max(1e-4, sxBase);
	const centerY = .5 - (offsetY + anchorBiasY) / Math.max(1e-4, syBase);
	return {
		scale: [
			sxBase,
			syBase,
			1
		],
		center: [centerX, centerY]
	};
}
function resolveFarHitboxScale(distanceToCamera) {
	const t = clamp01$2((distanceToCamera - FAR_HITBOX_SCALE_NEAR_DISTANCE) / Math.max(1e-4, FAR_HITBOX_SCALE_FULL_DISTANCE - FAR_HITBOX_SCALE_NEAR_DISTANCE));
	return lerp$2(1, FAR_HITBOX_SCALE_MAX, Math.pow(t, FAR_HITBOX_SCALE_CURVE));
}
function resolveTooltipHitboxState({ layout, distanceToCamera, sceneHitboxScale = 1 }) {
	return {
		visible: true,
		...resolvePaddedLayout(layout, resolvePadding(layout, distanceToCamera), sceneHitboxScale)
	};
}
function resolveHitboxDistanceState({ shape: _shape, layout, distanceToCamera, cameraRadius: _cameraRadius, sceneHitboxScale = 1 }) {
	return {
		visible: true,
		...resolvePaddedLayout(layout, resolvePadding(layout, distanceToCamera), sceneHitboxScale, resolveFarHitboxScale(distanceToCamera))
	};
}
//#endregion
//#region src/graph-runtime/dotgraph/interaction/useObserverSpotlight.ts
var noop = () => void 0;
var _frustum$1 = new Frustum();
var _projScreen$1 = new Matrix4();
var _dotWorld$1 = new Vector3();
function useObserverSpotlight({ points, onHoverStart, onHoverEnd, groupRef, excludeId, sectionKey, bagSeed, spriteScale, hitboxScale, useDesktopLayout }) {
	const { camera, gl } = useThree();
	const cameraRef = useRef(camera);
	useEffect(() => {
		cameraRef.current = camera;
	}, [camera]);
	const glRef = useRef(gl);
	useEffect(() => {
		glRef.current = gl;
	}, [gl]);
	const ui = useOptionalUiFlow();
	const spotlightRequest = ui?.spotlightRequest ?? null;
	const setSpotlightRequest = ui?.setSpotlightRequest;
	const spotlightTimerRef = useRef(null);
	const spotlightActiveRef = useRef(false);
	const onHoverStartRef = useRef(onHoverStart);
	const onHoverEndRef = useRef(onHoverEnd);
	const pointsRef = useRef(points);
	useEffect(() => {
		onHoverStartRef.current = onHoverStart;
	}, [onHoverStart]);
	useEffect(() => {
		onHoverEndRef.current = onHoverEnd;
	}, [onHoverEnd]);
	useEffect(() => {
		pointsRef.current = points;
	}, [points]);
	useEffect(() => {
		if (!spotlightRequest || !setSpotlightRequest) return;
		const durationMs = Math.max(500, spotlightRequest.durationMs);
		const xRatio = Math.max(0, Math.min(1, spotlightRequest.fakeMouseXRatio));
		const yRatio = Math.max(0, Math.min(1, spotlightRequest.fakeMouseYRatio));
		const pts = pointsRef.current;
		if (!pts.length) return;
		const cam = cameraRef.current;
		const group = groupRef.current;
		const visiblePts = [];
		if (group) {
			group.updateWorldMatrix(true, false);
			_projScreen$1.multiplyMatrices(cam.projectionMatrix, cam.matrixWorldInverse);
			_frustum$1.setFromProjectionMatrix(_projScreen$1);
			for (const point of pts) {
				if (!hasDotId(point)) continue;
				if (excludeId && point._id === excludeId) continue;
				_dotWorld$1.set(point.position[0], point.position[1], point.position[2]);
				_dotWorld$1.applyMatrix4(group.matrixWorld);
				if (_frustum$1.containsPoint(_dotWorld$1)) visiblePts.push(point);
			}
		}
		const candidates = visiblePts.length > 0 ? visiblePts : pts.filter((p) => hasDotId(p) && p._id !== excludeId);
		let best = null;
		let bestD = Infinity;
		for (const point of candidates) {
			const [x, y, z] = point.position;
			const d = x * x + y * y + z * z;
			if (d < bestD) {
				bestD = d;
				best = point;
			}
		}
		if (!best) return;
		if (spotlightTimerRef.current) {
			clearTimeout(spotlightTimerRef.current);
			spotlightTimerRef.current = null;
		}
		spotlightActiveRef.current = true;
		const bestIndex = pts.findIndex((point) => point._id === best._id);
		const sprite = resolveSpriteVisual({
			entryId: best._id,
			sectionKey,
			avg: Number.isFinite(best.averageWeight) ? best.averageWeight : .5,
			seed: bagSeed,
			orderIndex: Math.max(0, bestIndex),
			baseScale: spriteScale
		});
		const centerWorld = new Vector3(best.position[0], best.position[1], best.position[2]);
		if (group) centerWorld.applyMatrix4(group.matrixWorld);
		const distanceState = resolveTooltipHitboxState({
			layout: sprite.layout,
			distanceToCamera: cam.position.distanceTo(centerWorld),
			sceneHitboxScale: hitboxScale
		});
		const tooltipLayout = {
			...sprite.layout,
			scale: distanceState.scale,
			center: distanceState.center
		};
		const synthEvt = makeCenteredTooltipEvent({
			camera: cam,
			domElement: glRef.current.domElement,
			centerWorld,
			layout: tooltipLayout,
			target: null,
			useDesktopLayout
		}) ?? {
			stopPropagation: noop,
			preventDefault: noop,
			clientX: (typeof window !== "undefined" ? window.innerWidth : 1e3) * xRatio,
			clientY: (typeof window !== "undefined" ? window.innerHeight : 800) * yRatio
		};
		try {
			onHoverStartRef.current(best, synthEvt);
		} catch (err) {
			console.warn("[useObserverSpotlight] onHoverStart failed:", err);
		}
		setSpotlightRequest(null);
		spotlightTimerRef.current = setTimeout(() => {
			try {
				onHoverEndRef.current();
			} catch (err) {
				console.warn("[useObserverSpotlight] onHoverEnd failed:", err);
			}
			spotlightActiveRef.current = false;
			spotlightTimerRef.current = null;
		}, durationMs);
		return () => {
			if (spotlightTimerRef.current) clearTimeout(spotlightTimerRef.current);
			spotlightTimerRef.current = null;
			spotlightActiveRef.current = false;
		};
	}, [
		bagSeed,
		excludeId,
		groupRef,
		hitboxScale,
		sectionKey,
		setSpotlightRequest,
		spotlightRequest,
		spriteScale,
		useDesktopLayout
	]);
	return { spotlightActiveRef };
}
//#endregion
//#region src/graph-runtime/dotgraph/components/ShapesLayer.tsx
var HITBOX_ZOOM_SETTLE_MS = 120;
var TEXTURE_ZOOM_SETTLE_MS = 360;
var DENSE_SCENE_QUALITY_UPGRADE_LIMIT = 180;
function ShapesLayer({ shapes, myEntry, personalizedEntryId, showCompleteUI, onHoverStart, onHoverEnd, spriteScale, bagSeed, darkMode = false, occasionalRefreshMs = 0, particleFrames = 219, tileSize = 128, section = "", hitboxScale = 1, useDesktopLayout, zoomTargetRef, hidePersonalizedSprite = false }) {
	const { camera, gl } = useThree();
	const hoverTimerRef = useRef(null);
	const hitboxRefs = useRef([]);
	const _tmpVec = useMemo(() => new Vector3(), []);
	const showHitboxDebugOverlay = shouldShowHitboxDebugOverlay();
	const lastZoomActiveAtRef = useRef(0);
	const textureQueuePausedRef = useRef(false);
	const epochSchedulerPausedRef = useRef(false);
	const qualitySchedulerPausedRef = useRef(false);
	const suspendSpriteQualityRef = useRef(false);
	const [suspendSpriteQuality, setSuspendSpriteQuality] = useState(false);
	const denseScene = shapes.length >= DENSE_SCENE_QUALITY_UPGRADE_LIMIT;
	const setSpriteQualitySuspended = (next) => {
		if (suspendSpriteQualityRef.current === next) return;
		suspendSpriteQualityRef.current = next;
		setSuspendSpriteQuality(next);
	};
	const shapeVisuals = useMemo(() => shapes.map((shape, i) => {
		const avg = Number.isFinite(shape.averageWeight) ? shape.averageWeight : .5;
		const sprite = resolveSpriteVisual({
			entryId: shape._id,
			sectionKey: section,
			avg,
			seed: bagSeed,
			orderIndex: i,
			baseScale: spriteScale
		});
		return {
			shape,
			avg,
			index: i,
			sx: sprite.layout.scale[0],
			sy: sprite.layout.scale[1],
			offset: sprite.layout.offset,
			center: sprite.layout.center,
			spriteShape: sprite.shape,
			assignment: sprite.assignment,
			layout: sprite.layout
		};
	}), [
		shapes,
		bagSeed,
		spriteScale,
		section
	]);
	useFrame(() => {
		const now = performance.now();
		if (zoomTargetRef?.current != null) {
			lastZoomActiveAtRef.current = now;
			if (!textureQueuePausedRef.current) {
				pauseQueue();
				bumpZoomMetric("zoomTexturePauses");
				textureQueuePausedRef.current = true;
			}
			if (!epochSchedulerPausedRef.current) {
				pauseEpochScheduler();
				epochSchedulerPausedRef.current = true;
			}
			if (!qualitySchedulerPausedRef.current) {
				pauseQualityUpgradeScheduler();
				qualitySchedulerPausedRef.current = true;
			}
			setSpriteQualitySuspended(true);
			return;
		}
		if (textureQueuePausedRef.current && now - lastZoomActiveAtRef.current >= TEXTURE_ZOOM_SETTLE_MS) {
			resumeQueue();
			bumpZoomMetric("zoomTextureResumes");
			textureQueuePausedRef.current = false;
			resumeEpochScheduler();
			epochSchedulerPausedRef.current = false;
			resumeQualityUpgradeScheduler();
			qualitySchedulerPausedRef.current = false;
			setSpriteQualitySuspended(false);
		}
		if (now - lastZoomActiveAtRef.current < HITBOX_ZOOM_SETTLE_MS) return;
		const camRadius = camera.position.length();
		for (let i = 0; i < shapeVisuals.length; i++) {
			const sprite = hitboxRefs.current[i];
			if (!sprite?.parent) continue;
			sprite.getWorldPosition(_tmpVec);
			const d = camera.position.distanceTo(_tmpVec);
			const next = resolveHitboxDistanceState({
				shape: shapeVisuals[i].spriteShape,
				layout: shapeVisuals[i].layout,
				distanceToCamera: d,
				cameraRadius: camRadius,
				sceneHitboxScale: hitboxScale
			});
			sprite.visible = next.visible;
			sprite.scale.set(next.scale[0], next.scale[1], next.scale[2]);
			sprite.center.set(next.center[0], next.center[1]);
		}
	});
	const clearHoverTimer = () => {
		if (!hoverTimerRef.current) return;
		clearTimeout(hoverTimerRef.current);
		hoverTimerRef.current = null;
	};
	useEffect(() => () => {
		if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
		if (textureQueuePausedRef.current) {
			resumeQueue();
			textureQueuePausedRef.current = false;
		}
		if (epochSchedulerPausedRef.current) {
			resumeEpochScheduler();
			epochSchedulerPausedRef.current = false;
		}
		if (qualitySchedulerPausedRef.current) {
			resumeQualityUpgradeScheduler();
			qualitySchedulerPausedRef.current = false;
		}
		suspendSpriteQualityRef.current = false;
	}, []);
	const setShapeCursor = (active, e) => {
		const target = e?.nativeEvent?.target;
		if (!(target instanceof HTMLElement)) return;
		target.classList.toggle("hovering-shape", active);
	};
	const makeTooltipHoverEvent = (hitbox, target, layout, useShapeCenterAnchor) => {
		if (!hitbox) return null;
		const centerWorld = new Vector3();
		hitbox.getWorldPosition(centerWorld);
		const tooltipState = resolveTooltipHitboxState({
			layout,
			distanceToCamera: camera.position.distanceTo(centerWorld),
			sceneHitboxScale: hitboxScale
		});
		return makeCenteredTooltipEvent({
			camera,
			domElement: gl.domElement,
			centerWorld,
			layout: {
				...spriteRuntimeTooltipLayout(layout, hitbox),
				scale: tooltipState.scale,
				center: tooltipState.center
			},
			target,
			useDesktopLayout,
			anchorMode: useShapeCenterAnchor ? "shapeCenter" : "hitboxCenter"
		});
	};
	return /* @__PURE__ */ jsx(Fragment, { children: shapeVisuals.map(({ shape, avg, index, offset, center, assignment, layout }, loopIdx) => {
		const suppressHover = !!(myEntry && shape._id === personalizedEntryId && showCompleteUI);
		const identifiedShape = hasDotId(shape) ? shape : null;
		const isPersonalizedShape = !!myEntry && shape._id === personalizedEntryId;
		const shouldHideGraphSprite = hidePersonalizedSprite && isPersonalizedShape;
		return /* @__PURE__ */ jsxs("group", {
			position: shape.position,
			children: [/* @__PURE__ */ jsx("sprite", {
				ref: (el) => {
					hitboxRefs.current[loopIdx] = el;
				},
				onPointerOver: (e) => {
					e.stopPropagation();
					if (!suppressHover && identifiedShape) {
						setShapeCursor(true, e);
						const tgt = e.nativeEvent.target;
						const capturedShape = identifiedShape;
						clearHoverTimer();
						hoverTimerRef.current = setTimeout(() => {
							hoverTimerRef.current = null;
							const hoverEvent = makeTooltipHoverEvent(hitboxRefs.current[loopIdx] ?? e.object, tgt, layout, isPersonalizedShape);
							if (hoverEvent) onHoverStart(capturedShape, hoverEvent);
						}, 80);
					}
				},
				onPointerOut: (e) => {
					e.stopPropagation();
					setShapeCursor(false, e);
					clearHoverTimer();
					if (!suppressHover && identifiedShape) onHoverEnd();
				},
				onClick: (e) => {
					e.stopPropagation();
					if (!identifiedShape) return;
					if (!suppressHover) onHoverStart(identifiedShape, makeTooltipHoverEvent(hitboxRefs.current[loopIdx] ?? e.object, e.nativeEvent.target, layout, isPersonalizedShape) ?? e);
				},
				position: offset,
				center: new Vector2(center[0], center[1]),
				children: /* @__PURE__ */ jsx("spriteMaterial", {
					color: "#ff3b8a",
					transparent: true,
					opacity: showHitboxDebugOverlay ? .24 : 0,
					depthWrite: false,
					depthTest: false
				})
			}), !shouldHideGraphSprite && /* @__PURE__ */ jsx(SpriteShape, {
				avg,
				position: [
					0,
					0,
					0
				],
				scale: spriteScale,
				tileSize,
				alpha: 215,
				blend: .6,
				worldPosition: shape.position,
				seed: bagSeed,
				orderIndex: index,
				particleStepMs: 33,
				particleFrames,
				darkMode,
				occasionalRefreshMs,
				assignment,
				centerAtPosition: isPersonalizedShape,
				suspendQualityUpdates: suspendSpriteQuality || denseScene
			})]
		}, shape._id ?? shape.position.join("-"));
	}) });
}
//#endregion
//#region src/client-api/response-api/saveSoloMessage.ts
var MAX_MESSAGE_LENGTH = 160;
function normalizeMessage(message) {
	return message.trim().replace(/\s+/g, " ").slice(0, MAX_MESSAGE_LENGTH);
}
function isSavedSoloMessage(value) {
	if (!value || typeof value !== "object") return false;
	return typeof value._id === "string";
}
function explainSoloMessageSaveError(error) {
	if (error.code === "EDIT_TOKEN_MISMATCH" || /invalid edit token|not allowed to edit/i.test(error.message)) return /* @__PURE__ */ new Error("This saved response cannot be edited from this browser. It may have been saved before message editing was enabled.");
	return error;
}
function persistSoloMessageSnapshot(updated) {
	const raw = getSessionItem("be.myDoc");
	if (!raw) return;
	try {
		const next = {
			...JSON.parse(raw),
			_id: updated._id
		};
		if (updated.soloMessage) {
			next.soloMessage = updated.soloMessage;
			next.soloMessageUpdatedAt = updated.soloMessageUpdatedAt;
		} else {
			delete next.soloMessage;
			delete next.soloMessageUpdatedAt;
		}
		setSessionItem("be.myDoc", JSON.stringify(next));
	} catch (error) {
		console.warn("[saveSoloMessage] Failed to update local response snapshot:", error);
	}
}
async function saveSoloMessage(message) {
	const responseId = getSessionItem("be.myEntryId");
	const editToken = getSessionItem("be.myEditToken");
	const normalized = normalizeMessage(message);
	if (!responseId || responseId.startsWith("pending-")) throw new Error("Your response is still being saved. Try again in a moment.");
	if (!editToken) throw new Error("This browser can no longer edit that response.");
	if (!isWriteApiEditToken(editToken)) throw new Error("This browser has an old edit token for that response. Submit a new response to enable message editing.");
	if (shouldUseMockReads()) {
		const updated = updateMockSoloMessage(responseId, normalized);
		persistSoloMessageSnapshot(updated);
		return updated;
	}
	const payload = {
		responseId,
		editToken,
		message: normalized,
		clientId: getClientId(),
		clientRequestId: makeRandomId(),
		website: ""
	};
	const res = await fetch("/api/save-solo-message", {
		method: "POST",
		keepalive: true,
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(payload)
	});
	const json = await res.json().catch(() => null);
	if (!res.ok) throw explainSoloMessageSaveError(makeWriteApiError("save-solo-message", res.status, json, `Solo message request failed with status ${String(res.status)}`));
	if (!isSavedSoloMessage(json)) throw new Error("Solo message API returned an invalid response");
	persistSoloMessageSnapshot(json);
	return json;
}
//#endregion
//#region src/graph-runtime/gamification/gamification-personal.tsx
var FADE_MS = 200;
function InlineLines$1({ children }) {
	return /* @__PURE__ */ jsx("span", {
		className: "gam-inline-lines",
		children
	});
}
function HighlightWord({ children, color }) {
	return /* @__PURE__ */ jsx("strong", {
		style: { textShadow: `0 0 7px ${color}` },
		children
	});
}
function ordinalSuffix(n) {
	const mod100 = Math.abs(n) % 100;
	if (mod100 >= 11 && mod100 <= 13) return `${String(n)}th`;
	switch (Math.abs(n) % 10) {
		case 1: return `${String(n)}st`;
		case 2: return `${String(n)}nd`;
		case 3: return `${String(n)}rd`;
		default: return `${String(n)}th`;
	}
}
function stopGraphEventPropagation(event) {
	event.stopPropagation();
	event.nativeEvent.stopPropagation();
	event.nativeEvent.stopImmediatePropagation();
}
function classifyBand({ below: b, equal: e, above: a }) {
	const totalOthers = Math.max(0, b | 0) + Math.max(0, e | 0) + Math.max(0, a | 0);
	const N = totalOthers + 1;
	const rankFromLow = (b | 0) + 1;
	const q = N > 0 ? rankFromLow / N : 0;
	if (totalOthers === 0) return {
		band: "solo",
		tie: "none",
		N,
		b,
		e,
		a,
		q,
		rankFromLow
	};
	const isTopBand = a === 0;
	const isBottomBand = b === 0;
	const EDGE_COUNT = Math.max(2, Math.ceil(.25 * N));
	const NEAR_Q = .3;
	const nearBottom = !isBottomBand && (rankFromLow <= EDGE_COUNT || q <= NEAR_Q);
	const nearTop = !isTopBand && (N - rankFromLow + 1 <= EDGE_COUNT || q >= 1 - NEAR_Q);
	let band = "middle";
	if (isTopBand) band = "top";
	else if (isBottomBand) band = "bottom";
	else if (nearTop) band = "nearTop";
	else if (nearBottom) band = "nearBottom";
	return {
		band,
		tie: e > 0 ? isTopBand ? "tiedTop" : isBottomBand ? "tiedBottom" : "tiedMiddle" : "notTied",
		N,
		b,
		e,
		a,
		q,
		rankFromLow
	};
}
function GamificationPersonalized({ userData, percentage, score, groupAverage, color, shapeCopy, mode = "relative", onOpenChange, onPanelEnter, belowCountStrict, equalCount, aboveCountStrict, statsLoading = false, zoomFraction }) {
	const darkMode = !!useOptionalPreferences()?.darkMode;
	const ui = useOptionalUiFlow();
	const openPersonalized = ui?.openPersonalized;
	const setOpenPersonalized = ui?.setOpenPersonalized;
	const [open, setOpen] = useState(true);
	const [savedMessageOverride, setSavedMessageOverride] = useState(null);
	const [draftState, setDraftState] = useState(null);
	const [messageStatus, setMessageStatus] = useState(null);
	const { visible: savedNoticeVisible, show: showSavedNotice, hide: hideSavedNotice } = useTransientFlag(2500);
	const safePct = Math.max(0, Math.min(100, Math.round(Number(percentage) || 0)));
	const safeScore = Math.max(0, Math.min(100, Math.round(Number(score) || 0)));
	const safeGroupAverage = Math.max(0, Math.min(100, Math.round(Number(groupAverage) || 0)));
	const entryId = userData?._id ?? "me";
	const editToken = getSessionItem("be.myEditToken");
	const messageStateKey = editToken ? `edit:${editToken}` : `entry:${entryId}`;
	const sourceSoloMessage = typeof userData?.soloMessage === "string" ? userData.soloMessage : "";
	const savedSoloMessage = savedMessageOverride?.entryId === messageStateKey || savedMessageOverride?.entryId === entryId ? savedMessageOverride.value : sourceSoloMessage;
	const draftForEntry = draftState?.entryId === messageStateKey || draftState?.entryId === entryId ? draftState : null;
	const messageDraft = draftForEntry?.dirty ? draftForEntry.value : savedSoloMessage;
	const currentMessageStatus = messageStatus?.entryId === messageStateKey || messageStatus?.entryId === entryId ? messageStatus.state : "idle";
	const messageError = messageStatus?.entryId === messageStateKey || messageStatus?.entryId === entryId ? messageStatus.error : "";
	const normalizedDraft = messageDraft.trim().replace(/\s+/g, " ");
	const normalizedSavedMessage = savedSoloMessage.trim().replace(/\s+/g, " ");
	const canSaveSoloMessage = Boolean(mode === "absolute" && userData?._id && !userData._id.startsWith("pending-"));
	const saveMessageDisabled = currentMessageStatus === "saving" || !canSaveSoloMessage || normalizedDraft === normalizedSavedMessage;
	const handleSoloMessageSubmit = async (event) => {
		event.preventDefault();
		event.stopPropagation();
		if (saveMessageDisabled) return;
		setMessageStatus({
			entryId: messageStateKey,
			state: "saving",
			error: ""
		});
		try {
			const next = (await saveSoloMessage(messageDraft)).soloMessage ?? "";
			setSavedMessageOverride({
				entryId: messageStateKey,
				value: next
			});
			setDraftState({
				entryId: messageStateKey,
				value: next,
				dirty: false
			});
			setMessageStatus({
				entryId: messageStateKey,
				state: "saved",
				error: ""
			});
			showSavedNotice();
		} catch (error) {
			console.error("[GamificationPersonalized] save solo message failed:", error);
			setMessageStatus({
				entryId: messageStateKey,
				state: "error",
				error: error instanceof Error ? error.message : "Message could not be saved."
			});
		}
	};
	const handleSoloMessageKeyDown = (event) => {
		if (event.key !== "Enter" || event.shiftKey || event.altKey || event.ctrlKey || event.metaKey || event.nativeEvent.isComposing) return;
		event.preventDefault();
		event.stopPropagation();
		event.currentTarget.form?.requestSubmit();
	};
	useEffect(() => {
		onOpenChange?.(open);
	}, [open, onOpenChange]);
	useEffect(() => {
		if (!openPersonalized) return;
		const timerId = window.setTimeout(() => {
			setOpen(true);
		}, 0);
		setOpenPersonalized?.(false);
		return () => {
			window.clearTimeout(timerId);
		};
	}, [openPersonalized, setOpenPersonalized]);
	if (!userData) return null;
	const panelId = `panel-${userData._id ?? "me"}`;
	const wrapperVisible = open || (zoomFraction !== void 0 ? zoomFraction > .7 : true);
	const bandInfo = classifyBand({
		below: Math.max(0, (belowCountStrict ?? 0) | 0),
		equal: Math.max(0, (equalCount ?? 0) | 0),
		above: Math.max(0, (aboveCountStrict ?? 0) | 0)
	});
	let relativeLine = null;
	if (mode === "relative" && statsLoading) relativeLine = /* @__PURE__ */ jsx("span", {
		className: "stats-loading-word",
		role: "status",
		children: "Loading..."
	});
	else if (mode === "relative") {
		const { band, tie, b: bb, e: ee, a: aa } = bandInfo;
		switch (band) {
			case "solo":
				relativeLine = /* @__PURE__ */ jsx(Fragment, { children: "You're the first one here." });
				break;
			case "top":
				relativeLine = tie === "tiedTop" ? /* @__PURE__ */ jsxs(InlineLines$1, { children: [/* @__PURE__ */ jsxs("span", { children: [
					"Sharing the very ",
					/* @__PURE__ */ jsx(HighlightWord, {
						color,
						children: "top"
					}),
					"."
				] }), /* @__PURE__ */ jsxs("span", { children: [
					"Tied with ",
					ee,
					"."
				] })] }) : /* @__PURE__ */ jsxs(InlineLines$1, { children: [/* @__PURE__ */ jsxs("span", { children: [
					"You're on ",
					/* @__PURE__ */ jsx(HighlightWord, {
						color,
						children: "top"
					}),
					","
				] }), /* @__PURE__ */ jsx("span", { children: "ahead of everyone else." })] });
				break;
			case "nearTop":
				relativeLine = ee > 0 ? /* @__PURE__ */ jsxs(InlineLines$1, { children: [
					/* @__PURE__ */ jsxs("span", { children: [
						"Close to the ",
						/* @__PURE__ */ jsx(HighlightWord, {
							color,
							children: "top"
						}),
						"."
					] }),
					/* @__PURE__ */ jsxs("span", { children: ["Behind ", aa] }),
					/* @__PURE__ */ jsxs("span", { children: [
						"Tied with ",
						ee,
						"."
					] })
				] }) : /* @__PURE__ */ jsxs(InlineLines$1, { children: [/* @__PURE__ */ jsxs("span", { children: [
					"Close to the ",
					/* @__PURE__ */ jsx(HighlightWord, {
						color,
						children: "top"
					}),
					"."
				] }), /* @__PURE__ */ jsxs("span", { children: ["Behind ", aa] })] });
				break;
			case "bottom":
				relativeLine = tie === "tiedBottom" ? /* @__PURE__ */ jsxs(InlineLines$1, { children: [/* @__PURE__ */ jsxs("span", { children: [
					"At the ",
					/* @__PURE__ */ jsx(HighlightWord, {
						color,
						children: "bottom"
					}),
					"."
				] }), /* @__PURE__ */ jsxs("span", { children: [
					"Tied with ",
					ee,
					"."
				] })] }) : /* @__PURE__ */ jsxs(InlineLines$1, { children: [/* @__PURE__ */ jsxs("span", { children: [
					"At the ",
					/* @__PURE__ */ jsx(HighlightWord, {
						color,
						children: "bottom"
					}),
					"."
				] }), /* @__PURE__ */ jsx("span", { children: "Everyone else is ahead." })] });
				break;
			case "nearBottom":
				relativeLine = ee > 0 ? /* @__PURE__ */ jsxs(InlineLines$1, { children: [
					/* @__PURE__ */ jsxs("span", { children: [
						"Near the ",
						/* @__PURE__ */ jsx(HighlightWord, {
							color,
							children: "bottom"
						}),
						"."
					] }),
					/* @__PURE__ */ jsxs("span", { children: ["Ahead of ", bb] }),
					/* @__PURE__ */ jsxs("span", { children: [
						"Tied with ",
						ee,
						"."
					] })
				] }) : /* @__PURE__ */ jsxs(InlineLines$1, { children: [/* @__PURE__ */ jsxs("span", { children: [
					"Near the ",
					/* @__PURE__ */ jsx(HighlightWord, {
						color,
						children: "bottom"
					}),
					"."
				] }), /* @__PURE__ */ jsxs("span", { children: ["Ahead of ", bb] })] });
				break;
			default: if (tie === "tiedMiddle") relativeLine = /* @__PURE__ */ jsxs(InlineLines$1, { children: [
				/* @__PURE__ */ jsxs("span", { children: [
					"In the ",
					/* @__PURE__ */ jsx(HighlightWord, {
						color,
						children: "middle"
					}),
					"."
				] }),
				/* @__PURE__ */ jsxs("span", { children: ["Ahead of ", bb] }),
				/* @__PURE__ */ jsxs("span", { children: ["Behind ", aa] }),
				/* @__PURE__ */ jsxs("span", { children: [
					"Tied with ",
					ee,
					"."
				] })
			] });
			else if (aa < bb) relativeLine = /* @__PURE__ */ jsxs(InlineLines$1, { children: [/* @__PURE__ */ jsxs("span", { children: [
				"In the ",
				/* @__PURE__ */ jsx(HighlightWord, {
					color,
					children: "middle"
				}),
				"."
			] }), /* @__PURE__ */ jsxs("span", { children: ["Behind ", aa] })] });
			else if (bb < aa) relativeLine = /* @__PURE__ */ jsxs(InlineLines$1, { children: [/* @__PURE__ */ jsxs("span", { children: [
				"In the ",
				/* @__PURE__ */ jsx(HighlightWord, {
					color,
					children: "middle"
				}),
				"."
			] }), /* @__PURE__ */ jsxs("span", { children: ["Ahead of ", bb] })] });
			else relativeLine = /* @__PURE__ */ jsxs(InlineLines$1, { children: [
				/* @__PURE__ */ jsxs("span", { children: [
					"In the ",
					/* @__PURE__ */ jsx(HighlightWord, {
						color,
						children: "middle"
					}),
					"."
				] }),
				/* @__PURE__ */ jsxs("span", { children: ["Ahead of ", bb] }),
				/* @__PURE__ */ jsxs("span", { children: ["Behind ", aa] })
			] });
		}
	}
	const saveLabel = currentMessageStatus === "saving" ? "Saving" : "Save";
	return /* @__PURE__ */ jsx("div", {
		className: `personalized-root ${wrapperVisible ? "is-visible" : ""}`,
		onPointerEnter: onPanelEnter,
		onTouchStart: onPanelEnter,
		onPointerDownCapture: stopGraphEventPropagation,
		onTouchStartCapture: stopGraphEventPropagation,
		onWheelCapture: stopGraphEventPropagation,
		children: /* @__PURE__ */ jsxs("div", {
			className: "personalized-anchor",
			children: [!open && /* @__PURE__ */ jsx("button", {
				type: "button",
				className: `toggle-button toggle${darkMode ? " is-dark" : ""}`,
				"aria-controls": panelId,
				"aria-expanded": false,
				"aria-label": "Open personalized panel",
				onClick: (e) => {
					e.stopPropagation();
					setOpen(true);
				},
				style: { pointerEvents: "auto" },
				children: /* @__PURE__ */ jsx("span", {
					className: "toggle-icon is-closed",
					"aria-hidden": true,
					children: /* @__PURE__ */ jsxs("svg", {
						className: "icon-plus ui-icon",
						viewBox: "0 0 24 24",
						fill: "none",
						stroke: "currentColor",
						children: [/* @__PURE__ */ jsx("line", {
							x1: "12",
							y1: "5",
							x2: "12",
							y2: "19",
							strokeWidth: "2.5"
						}), /* @__PURE__ */ jsx("line", {
							x1: "5",
							y1: "12",
							x2: "19",
							y2: "12",
							strokeWidth: "2.5"
						})]
					})
				})
			}), open && /* @__PURE__ */ jsxs("div", {
				id: panelId,
				className: "personalized-result",
				style: {
					pointerEvents: "auto",
					transition: `opacity ${String(FADE_MS)}ms ease`
				},
				children: [
					/* @__PURE__ */ jsx("button", {
						type: "button",
						className: "personal-close-btn",
						"aria-label": "Close personalized panel",
						onClick: (e) => {
							e.stopPropagation();
							setOpen(false);
						},
						children: /* @__PURE__ */ jsx(CloseIcon, { className: "ui-close" })
					}),
					/* @__PURE__ */ jsxs("div", {
						className: `gam-panel${mode === "relative" ? " is-team" : ""}`,
						children: [
							mode === "relative" ? /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsx("p", {
								className: "gam-copy",
								children: relativeLine
							}), /* @__PURE__ */ jsxs("p", {
								className: "gam-team-story",
								children: [
									"Your result is ",
									/* @__PURE__ */ jsx("strong", { children: safeScore }),
									". The current group averages",
									" ",
									/* @__PURE__ */ jsx("strong", { children: safeGroupAverage }),
									", placing you in the",
									" ",
									/* @__PURE__ */ jsxs("strong", { children: [ordinalSuffix(safePct), " percentile"] }),
									"."
								]
							})] }) : null,
							mode === "absolute" ? /* @__PURE__ */ jsxs(Fragment, { children: [shapeCopy ? /* @__PURE__ */ jsx("h4", {
								className: "gam-subline",
								children: shapeCopy
							}) : normalizedSavedMessage ? /* @__PURE__ */ jsx("h4", {
								className: "gam-subline",
								children: normalizedSavedMessage
							}) : null, /* @__PURE__ */ jsxs("div", {
								className: "solo-message-intro",
								children: [/* @__PURE__ */ jsx("h4", { children: "Have a word to say?" }), /* @__PURE__ */ jsx("p", { children: "It stays here, with your shape." })]
							})] }) : null,
							mode === "absolute" ? /* @__PURE__ */ jsxs("form", {
								className: "solo-message-form",
								onSubmit: (event) => {
									handleSoloMessageSubmit(event);
								},
								children: [
									/* @__PURE__ */ jsx("textarea", {
										id: `${panelId}-message`,
										className: "solo-message-input",
										"aria-label": "Personal message",
										value: messageDraft,
										maxLength: 160,
										rows: 2,
										placeholder: "I've been thinking about...",
										disabled: currentMessageStatus === "saving",
										onClick: (event) => {
											event.stopPropagation();
										},
										onKeyDown: handleSoloMessageKeyDown,
										onChange: (event) => {
											setDraftState({
												entryId: messageStateKey,
												value: event.currentTarget.value,
												dirty: true
											});
											setMessageStatus({
												entryId: messageStateKey,
												state: "idle",
												error: ""
											});
											hideSavedNotice();
										}
									}),
									/* @__PURE__ */ jsxs("div", {
										className: "solo-message-actions",
										children: [/* @__PURE__ */ jsx("span", {
											className: "solo-message-count",
											children: 160 - messageDraft.length
										}), /* @__PURE__ */ jsxs("button", {
											type: "submit",
											className: "solo-message-save",
											disabled: saveMessageDisabled,
											children: [/* @__PURE__ */ jsx("span", {
												className: "solo-message-save__ghost",
												"aria-hidden": "true",
												children: "Saving"
											}), /* @__PURE__ */ jsx("span", {
												className: "solo-message-save__inner",
												children: saveLabel
											})]
										})]
									}),
									messageError ? /* @__PURE__ */ jsx("p", {
										className: "solo-message-state is-error",
										role: "alert",
										children: messageError
									}) : null
								]
							}) : null
						]
					}),
					/* @__PURE__ */ jsx(HintBanner, {
						visible: savedNoticeVisible,
						className: "solo-message-save-toast",
						closeLabel: "Dismiss save confirmation",
						onDismiss: hideSavedNotice,
						children: "Message saved."
					})
				]
			})]
		})
	});
}
//#endregion
//#region src/graph-runtime/dotgraph/tooltip/screenSize.ts
var TMP_LEFT = new Vector3();
var TMP_RIGHT = new Vector3();
var TMP_BOTTOM = new Vector3();
var TMP_TOP = new Vector3();
function projectToClient({ camera, rect, world }) {
	const projected = world.project(camera);
	return {
		x: (projected.x * .5 + .5) * rect.width + rect.left,
		y: (-projected.y * .5 + .5) * rect.height + rect.top
	};
}
function distance(a, b) {
	return Math.hypot(a.x - b.x, a.y - b.y);
}
function resolveHitboxScreenHalfSize({ camera, domElement, anchorWorld, cameraRight, cameraUp, layout }) {
	const rect = domElement.getBoundingClientRect();
	const halfWidthWorld = Math.max(0, layout.scale[0]) / 2;
	const halfHeightWorld = Math.max(0, layout.scale[1]) / 2;
	TMP_LEFT.copy(anchorWorld).addScaledVector(cameraRight, -halfWidthWorld);
	TMP_RIGHT.copy(anchorWorld).addScaledVector(cameraRight, halfWidthWorld);
	TMP_BOTTOM.copy(anchorWorld).addScaledVector(cameraUp, -halfHeightWorld);
	TMP_TOP.copy(anchorWorld).addScaledVector(cameraUp, halfHeightWorld);
	const left = projectToClient({
		camera,
		rect,
		world: TMP_LEFT
	});
	const right = projectToClient({
		camera,
		rect,
		world: TMP_RIGHT
	});
	const bottom = projectToClient({
		camera,
		rect,
		world: TMP_BOTTOM
	});
	const top = projectToClient({
		camera,
		rect,
		world: TMP_TOP
	});
	return {
		width: distance(left, right) / 2,
		height: distance(bottom, top) / 2
	};
}
//#endregion
//#region src/graph-runtime/dotgraph/tooltip/hitboxCss.ts
var EMPTY_TOOLTIP_HITBOX_CSS_VARS = {
	"--hitbox-width-px": "0px",
	"--hitbox-height-px": "0px",
	"--hitbox-half-width-px": "0px",
	"--hitbox-half-height-px": "0px"
};
function hasResolvedHitboxSize(size) {
	return Number.isFinite(size.width) && Number.isFinite(size.height) && size.width > 0 && size.height > 0;
}
function resolveZoomEdgeGapPx(zoomFraction) {
	return 1 + 14 * Math.max(0, Math.min(1, zoomFraction));
}
function makeTooltipHitboxCssVars({ halfSize, zoomFraction, style }) {
	const edgeGapPx = resolveZoomEdgeGapPx(zoomFraction);
	return {
		...style,
		"--hitbox-width-px": `${String(halfSize.width * 2 + edgeGapPx)}px`,
		"--hitbox-height-px": `${String(halfSize.height * 2 + edgeGapPx)}px`,
		"--hitbox-half-width-px": `${String(halfSize.width)}px`,
		"--hitbox-half-height-px": `${String(halfSize.height)}px`
	};
}
//#endregion
//#region src/graph-runtime/dotgraph/components/PersonalizedLayer.tsx
var TMP_CENTER_LOCAL$1 = new Vector3();
var TMP_CENTER_WORLD$1 = new Vector3();
var TMP_ANCHOR_WORLD$1 = new Vector3();
var TMP_ANCHOR_LOCAL$1 = new Vector3();
var TMP_CAMERA_RIGHT$1 = new Vector3();
var TMP_CAMERA_UP$1 = new Vector3();
var PERSONALIZED_TEXTURE_PRIORITY = 1e4;
function PersonalizedAnchor({ position, layout, shape, sceneHitboxScale, zoomFraction, className, style, children }) {
	const anchorRef = useRef(null);
	const { camera, gl } = useThree();
	const [hitboxHalfSize, setHitboxHalfSize] = useState({
		width: 0,
		height: 0
	});
	const [htmlReady, setHtmlReady] = useState(false);
	const readyFrameRef = useRef(null);
	const hasPositionedOnceRef = useRef(false);
	const [positionX, positionY, positionZ] = position;
	const updateAnchorPosition = useCallback(() => {
		const anchor = anchorRef.current;
		const parent = anchor?.parent;
		if (!anchor || !parent || !layout || !shape) return;
		TMP_CENTER_LOCAL$1.set(positionX, positionY, positionZ);
		TMP_CENTER_WORLD$1.copy(TMP_CENTER_LOCAL$1);
		parent.localToWorld(TMP_CENTER_WORLD$1);
		const next = resolveTooltipHitboxState({
			layout,
			distanceToCamera: camera.position.distanceTo(TMP_CENTER_WORLD$1),
			sceneHitboxScale
		});
		TMP_CAMERA_RIGHT$1.setFromMatrixColumn(camera.matrixWorld, 0).normalize();
		TMP_CAMERA_UP$1.setFromMatrixColumn(camera.matrixWorld, 1).normalize();
		const resolvedLayout = {
			...layout,
			scale: next.scale,
			center: next.center
		};
		TMP_ANCHOR_WORLD$1.copy(TMP_CENTER_WORLD$1);
		const nextHalfSize = resolveHitboxScreenHalfSize({
			camera,
			domElement: gl.domElement,
			anchorWorld: TMP_ANCHOR_WORLD$1,
			cameraRight: TMP_CAMERA_RIGHT$1,
			cameraUp: TMP_CAMERA_UP$1,
			layout: resolvedLayout
		});
		setHitboxHalfSize((prev) => {
			const width = Math.round(nextHalfSize.width);
			const height = Math.round(nextHalfSize.height);
			return prev.width === width && prev.height === height ? prev : {
				width,
				height
			};
		});
		TMP_ANCHOR_LOCAL$1.copy(TMP_ANCHOR_WORLD$1);
		parent.worldToLocal(TMP_ANCHOR_LOCAL$1);
		anchor.position.copy(TMP_ANCHOR_LOCAL$1);
		if (!hasPositionedOnceRef.current && readyFrameRef.current === null) readyFrameRef.current = requestAnimationFrame(() => {
			readyFrameRef.current = null;
			hasPositionedOnceRef.current = true;
			setHtmlReady(true);
		});
	}, [
		camera,
		gl.domElement,
		layout,
		positionX,
		positionY,
		positionZ,
		sceneHitboxScale,
		shape
	]);
	useLayoutEffect(() => {
		updateAnchorPosition();
		return () => {
			if (readyFrameRef.current !== null) {
				cancelAnimationFrame(readyFrameRef.current);
				readyFrameRef.current = null;
			}
		};
	}, [updateAnchorPosition]);
	useLayoutEffect(() => {
		hasPositionedOnceRef.current = false;
		setHtmlReady(false);
	}, [
		positionX,
		positionY,
		positionZ,
		shape
	]);
	useFrame(updateAnchorPosition);
	const resolvedStyle = useMemo(() => makeTooltipHitboxCssVars({
		halfSize: hitboxHalfSize,
		zoomFraction,
		style
	}), [
		hitboxHalfSize,
		style,
		zoomFraction
	]);
	const replayPointerMoveToCanvas = useCallback((event) => {
		if (typeof PointerEvent === "undefined") return;
		const canvas = gl.domElement;
		const replay = new PointerEvent("pointermove", {
			bubbles: true,
			cancelable: true,
			pointerId: event.pointerId,
			pointerType: event.pointerType,
			isPrimary: event.isPrimary,
			clientX: event.clientX,
			clientY: event.clientY,
			screenX: event.screenX,
			screenY: event.screenY,
			button: event.button,
			buttons: event.buttons,
			ctrlKey: event.ctrlKey,
			shiftKey: event.shiftKey,
			altKey: event.altKey,
			metaKey: event.metaKey
		});
		canvas.dispatchEvent(replay);
	}, [gl.domElement]);
	return /* @__PURE__ */ jsx("group", {
		ref: anchorRef,
		position,
		children: hasResolvedHitboxSize(hitboxHalfSize) && /* @__PURE__ */ jsx(Html, {
			position: [
				0,
				0,
				0
			],
			center: true,
			zIndexRange: [110, 130],
			className,
			style: {
				...resolvedStyle,
				visibility: htmlReady ? "visible" : "hidden"
			},
			children: /* @__PURE__ */ jsx("div", {
				onPointerLeave: replayPointerMoveToCanvas,
				children
			})
		})
	});
}
function PersonalizedLayer({ shouldRenderPersonalUI, shouldRenderExtraPersonalSprite, effectiveMyShape, effectiveMyEntry, personalSpriteAssignment, personalSpriteIdentity, spriteScale, bagSeed, myDisplayValue, myScoreValue, groupAverageValue, mode, myStats, statsLoading, setPersonalOpen, onPersonalizedPanelEnter, viewportClass, darkMode = false, zoomFraction, particleFrames = 219, sectionKey, hitboxScale = 1 }) {
	const htmlStyle = {
		pointerEvents: "none",
		...EMPTY_TOOLTIP_HITBOX_CSS_VARS
	};
	const personalVisual = useMemo(() => {
		if (!effectiveMyEntry) return null;
		const entryId = effectiveMyEntry._id;
		if (!entryId) return null;
		return resolveSpriteVisual({
			entryId,
			sectionKey,
			avg: Number.isFinite(effectiveMyEntry.avgWeight) ? Number(effectiveMyEntry.avgWeight) : .5,
			seed: bagSeed,
			orderIndex: 0,
			baseScale: spriteScale,
			assignment: personalSpriteAssignment
		});
	}, [
		bagSeed,
		effectiveMyEntry,
		personalSpriteAssignment,
		sectionKey,
		spriteScale
	]);
	if (!shouldRenderPersonalUI) return null;
	return /* @__PURE__ */ jsxs(Fragment, { children: [shouldRenderExtraPersonalSprite && effectiveMyShape && effectiveMyEntry && /* @__PURE__ */ jsx("group", {
		position: effectiveMyShape.position,
		children: /* @__PURE__ */ jsx(SpriteShape, {
			avg: Number.isFinite(effectiveMyEntry.avgWeight) ? Number(effectiveMyEntry.avgWeight) : .5,
			position: [
				0,
				0,
				0
			],
			scale: spriteScale,
			tileSize: 192,
			seed: bagSeed,
			orderIndex: 0,
			particleStepMs: 33,
			particleFrames,
			occasionalRefreshMs: 240,
			darkMode,
			assignment: personalSpriteAssignment,
			centerAtPosition: true,
			texturePriority: PERSONALIZED_TEXTURE_PRIORITY
		})
	}), effectiveMyShape && /* @__PURE__ */ jsx(PersonalizedAnchor, {
		position: effectiveMyShape.position,
		layout: personalVisual?.layout ?? null,
		shape: personalVisual?.shape ?? personalSpriteAssignment?.shape ?? null,
		sceneHitboxScale: hitboxScale,
		zoomFraction: zoomFraction ?? 0,
		className: viewportClass,
		style: htmlStyle,
		children: /* @__PURE__ */ jsx("div", { children: /* @__PURE__ */ jsx(GamificationPersonalized, {
			userData: effectiveMyEntry,
			percentage: myDisplayValue,
			score: myScoreValue,
			groupAverage: groupAverageValue,
			color: effectiveMyShape.color,
			shapeCopy: personalSpriteIdentity?.copy,
			mode,
			belowCountStrict: myStats.below,
			equalCount: myStats.equal,
			aboveCountStrict: myStats.above,
			statsLoading,
			onOpenChange: setPersonalOpen,
			onPanelEnter: onPersonalizedPanelEnter,
			zoomFraction
		}) })
	})] });
}
//#endregion
//#region src/graph-runtime/gamification/gamification-general.tsx
function InlineLines({ children }) {
	return /* @__PURE__ */ jsx("span", {
		className: "gam-inline-lines",
		children
	});
}
function Emphasis({ children, textShadow }) {
	return /* @__PURE__ */ jsx("strong", {
		style: { textShadow },
		children
	});
}
function GamificationGeneral({ dotId, percentage, color, soloMessage, mode = "relative", belowCountStrict, equalCount, aboveCountStrict, positionClass }) {
	const darkMode = useOptionalPreferences()?.darkMode ?? false;
	const safePct = Math.max(0, Math.min(100, Number.isFinite(percentage) ? Math.round(percentage) : 0));
	const normalizedSoloMessage = typeof soloMessage === "string" ? soloMessage.trim().replace(/\s+/g, " ") : "";
	const emphasisShadow = useMemo(() => darkMode ? `0 0 10px color-mix(in srgb, ${color} 52%, var(--gam-glow-dark-base)), 0 0 18px color-mix(in srgb, ${color} 32%, var(--gam-glow-dark-base))` : `0 0 8px color-mix(in srgb, ${color} 30%, var(--gam-glow-light-base)), 0 0 14px color-mix(in srgb, ${color} 16%, var(--gam-glow-light-base))`, [color, darkMode]);
	const { pick, loaded } = useGeneralPools();
	const b = Math.max(0, (belowCountStrict ?? 0) | 0);
	const e = Math.max(0, (equalCount ?? 0) | 0);
	const a = Math.max(0, (aboveCountStrict ?? 0) | 0);
	const totalOthers = b + e + a;
	const N = totalOthers + 1;
	const rankFromLow = b + 1;
	const q = N > 0 ? rankFromLow / N : 0;
	const SMALL = N < 8;
	const BOTTOM_Q = .15;
	const TOP_Q = .85;
	const NEAR_M = .05;
	const isSolo = totalOthers === 0 || positionClass === "solo";
	const isTopBand = !isSolo && a === 0;
	const isBottomBand = !isSolo && b === 0;
	const isNearTop = !isSolo && !isTopBand && (SMALL ? a === 1 : q >= TOP_Q - NEAR_M);
	const isNearBottom = !isSolo && !isBottomBand && (SMALL ? b === 1 : q <= BOTTOM_Q + NEAR_M);
	const isUpperMid = !isTopBand && !isBottomBand && !isNearTop && !isNearBottom && q > .6;
	const isLowerMid = !isTopBand && !isBottomBand && !isNearTop && !isNearBottom && q < .4;
	const canonicalTie = e > 0 ? isTopBand ? "tiedTop" : isBottomBand ? "tiedBottom" : "tiedMiddle" : "notTied";
	const { description } = useMemo(() => {
		const fallbackBuckets = {
			"0-20": {
				titles: ["The warmest years in history? Almost all in the past decade."],
				secondary: ["Hope grows when we do."]
			},
			"21-40": {
				titles: ["Below Average", "Getting Started"],
				secondary: ["Most carbon still comes from how we move and what we power."]
			},
			"41-60": {
				titles: ["Reuse is just creativity in disguise."],
				secondary: ["Little acts, lasting impact."]
			},
			"61-80": {
				titles: ["Above Average", "Solid Standing"],
				secondary: ["Cool the planet, warm the heart."]
			},
			"81-100": {
				titles: ["No one's too small to make an impact."],
				secondary: ["Among the strongest here."]
			}
		};
		if (!loaded || !dotId) return {
			title: "",
			description: ""
		};
		const chosen = pick(safePct, "gd", dotId, fallbackBuckets);
		return chosen ? {
			title: chosen.title,
			description: chosen.secondary || ""
		} : {
			title: "Eco Participant",
			description: ""
		};
	}, [
		dotId,
		safePct,
		pick,
		loaded
	]);
	if (!dotId) return null;
	let relativeLine = null;
	if (mode === "relative") switch (isSolo ? "solo" : isTopBand ? "top" : isBottomBand ? "bottom" : isNearTop ? "nearTop" : isNearBottom ? "nearBottom" : isUpperMid ? "upperMid" : isLowerMid ? "lowerMid" : "middle") {
		case "solo":
			relativeLine = /* @__PURE__ */ jsx(Fragment, { children: "First one here." });
			break;
		case "top":
			relativeLine = canonicalTie === "tiedTop" ? /* @__PURE__ */ jsxs(InlineLines, { children: [/* @__PURE__ */ jsxs("span", { children: [/* @__PURE__ */ jsx(Emphasis, {
				textShadow: emphasisShadow,
				children: "top"
			}), " spot."] }), /* @__PURE__ */ jsxs("span", { children: ["Tied with ", e] })] }) : /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsx(Emphasis, {
				textShadow: emphasisShadow,
				children: "top"
			}), " of the group"] });
			break;
		case "nearTop":
			relativeLine = e > 0 ? /* @__PURE__ */ jsxs(InlineLines, { children: [
				/* @__PURE__ */ jsxs("span", { children: [
					"Near ",
					/* @__PURE__ */ jsx(Emphasis, {
						textShadow: emphasisShadow,
						children: "top"
					}),
					"."
				] }),
				/* @__PURE__ */ jsxs("span", { children: ["Behind ", a] }),
				/* @__PURE__ */ jsxs("span", { children: ["Tied with ", e] })
			] }) : /* @__PURE__ */ jsxs(InlineLines, { children: [/* @__PURE__ */ jsxs("span", { children: [
				"Near ",
				/* @__PURE__ */ jsx(Emphasis, {
					textShadow: emphasisShadow,
					children: "top"
				}),
				"."
			] }), /* @__PURE__ */ jsxs("span", { children: ["Behind ", a] })] });
			break;
		case "bottom":
			relativeLine = canonicalTie === "tiedBottom" ? /* @__PURE__ */ jsxs(InlineLines, { children: [/* @__PURE__ */ jsxs("span", { children: [/* @__PURE__ */ jsx(Emphasis, {
				textShadow: emphasisShadow,
				children: "bottom"
			}), "."] }), /* @__PURE__ */ jsxs("span", { children: ["Tied with ", e] })] }) : /* @__PURE__ */ jsx(Fragment, { children: /* @__PURE__ */ jsx(Emphasis, {
				textShadow: emphasisShadow,
				children: "bottom"
			}) });
			break;
		case "nearBottom":
			relativeLine = e > 0 ? /* @__PURE__ */ jsxs(InlineLines, { children: [
				/* @__PURE__ */ jsxs("span", { children: [
					"Near ",
					/* @__PURE__ */ jsx(Emphasis, {
						textShadow: emphasisShadow,
						children: "bottom"
					}),
					"."
				] }),
				/* @__PURE__ */ jsxs("span", { children: ["Ahead of ", b] }),
				/* @__PURE__ */ jsxs("span", { children: ["Tied with ", e] })
			] }) : /* @__PURE__ */ jsxs(InlineLines, { children: [/* @__PURE__ */ jsxs("span", { children: [
				"Near ",
				/* @__PURE__ */ jsx(Emphasis, {
					textShadow: emphasisShadow,
					children: "bottom"
				}),
				"."
			] }), /* @__PURE__ */ jsxs("span", { children: ["Ahead of ", b] })] });
			break;
		case "upperMid":
			relativeLine = e > 0 ? /* @__PURE__ */ jsxs(InlineLines, { children: [
				/* @__PURE__ */ jsxs("span", { children: [/* @__PURE__ */ jsx(Emphasis, {
					textShadow: emphasisShadow,
					children: "upper half"
				}), "."] }),
				/* @__PURE__ */ jsxs("span", { children: ["Ahead of ", b] }),
				/* @__PURE__ */ jsxs("span", { children: ["Behind ", a] }),
				/* @__PURE__ */ jsxs("span", { children: ["Tied with ", e] })
			] }) : /* @__PURE__ */ jsxs(InlineLines, { children: [
				/* @__PURE__ */ jsxs("span", { children: [/* @__PURE__ */ jsx(Emphasis, {
					textShadow: emphasisShadow,
					children: "upper half"
				}), "."] }),
				/* @__PURE__ */ jsxs("span", { children: ["Ahead of ", b] }),
				/* @__PURE__ */ jsxs("span", { children: ["Behind ", a] })
			] });
			break;
		case "lowerMid":
			relativeLine = e > 0 ? /* @__PURE__ */ jsxs(InlineLines, { children: [
				/* @__PURE__ */ jsxs("span", { children: [/* @__PURE__ */ jsx(Emphasis, {
					textShadow: emphasisShadow,
					children: "lower half"
				}), "."] }),
				/* @__PURE__ */ jsxs("span", { children: ["Ahead of ", b] }),
				/* @__PURE__ */ jsxs("span", { children: ["Behind ", a] }),
				/* @__PURE__ */ jsxs("span", { children: ["Tied with ", e] })
			] }) : /* @__PURE__ */ jsxs(InlineLines, { children: [
				/* @__PURE__ */ jsxs("span", { children: [/* @__PURE__ */ jsx(Emphasis, {
					textShadow: emphasisShadow,
					children: "lower half"
				}), "."] }),
				/* @__PURE__ */ jsxs("span", { children: ["Ahead of ", b] }),
				/* @__PURE__ */ jsxs("span", { children: ["Behind ", a] })
			] });
			break;
		default: if (canonicalTie === "tiedMiddle") relativeLine = /* @__PURE__ */ jsxs(InlineLines, { children: [
			/* @__PURE__ */ jsxs("span", { children: [/* @__PURE__ */ jsx(Emphasis, {
				textShadow: emphasisShadow,
				children: "middle"
			}), "."] }),
			/* @__PURE__ */ jsxs("span", { children: ["Ahead of ", b] }),
			/* @__PURE__ */ jsxs("span", { children: ["Behind ", a] }),
			/* @__PURE__ */ jsxs("span", { children: ["Tied with ", e] })
		] });
		else if (a < b) relativeLine = /* @__PURE__ */ jsxs(InlineLines, { children: [/* @__PURE__ */ jsxs("span", { children: [/* @__PURE__ */ jsx(Emphasis, {
			textShadow: emphasisShadow,
			children: "middle"
		}), "."] }), /* @__PURE__ */ jsxs("span", { children: ["Behind ", a] })] });
		else if (b < a) relativeLine = /* @__PURE__ */ jsxs(InlineLines, { children: [/* @__PURE__ */ jsxs("span", { children: [/* @__PURE__ */ jsx(Emphasis, {
			textShadow: emphasisShadow,
			children: "middle"
		}), "."] }), /* @__PURE__ */ jsxs("span", { children: ["Ahead of ", b] })] });
		else relativeLine = /* @__PURE__ */ jsxs(InlineLines, { children: [
			/* @__PURE__ */ jsxs("span", { children: [/* @__PURE__ */ jsx(Emphasis, {
				textShadow: emphasisShadow,
				children: "middle"
			}), "."] }),
			/* @__PURE__ */ jsxs("span", { children: ["Ahead of ", b] }),
			/* @__PURE__ */ jsxs("span", { children: ["Behind ", a] })
		] });
	}
	return /* @__PURE__ */ jsx("div", {
		className: "generalized-result",
		children: /* @__PURE__ */ jsxs("div", {
			className: `gam-panel${mode === "relative" ? " is-team" : ""}`,
			children: [mode === "absolute" && (normalizedSoloMessage || description) ? /* @__PURE__ */ jsx("h4", {
				className: "gam-subline",
				children: normalizedSoloMessage || description
			}) : null, mode === "relative" ? /* @__PURE__ */ jsx("p", {
				className: "gam-copy",
				children: relativeLine
			}) : null]
		})
	});
}
//#endregion
//#region src/graph-runtime/gamification/rankLogic.ts
var clampPercent = (value) => Math.max(0, Math.min(100, Math.round(Number.isFinite(value) ? value : 0)));
function defaultDisplayPercentOf(item) {
	return clampPercent(avgWeightOf(item) * 100);
}
function keyOf(item, displayPercentOf) {
	return clampPercent(displayPercentOf ? displayPercentOf(item) : defaultDisplayPercentOf(item));
}
function getTieStats({ data, targetId, targetDisplay, displayPercentOf } = {}) {
	const hasTargetDisplay = typeof targetDisplay === "number" && Number.isFinite(targetDisplay);
	if (!data?.length || !targetId && !hasTargetDisplay) return {
		below: 0,
		equal: 0,
		above: 0,
		totalOthers: 0,
		refKey: 0
	};
	const targetEntry = targetId ? data.find((entry) => entry._id === targetId) ?? null : null;
	const refKey = hasTargetDisplay ? clampPercent(targetDisplay) : targetEntry ? keyOf(targetEntry, displayPercentOf) : 0;
	let below = 0;
	let equal = 0;
	let above = 0;
	for (const entry of data) {
		if (targetEntry && entry._id === targetEntry._id) continue;
		const key = keyOf(entry, displayPercentOf);
		if (key < refKey) below += 1;
		else if (key > refKey) above += 1;
		else equal += 1;
	}
	return {
		below,
		equal,
		above,
		totalOthers: below + equal + above,
		refKey
	};
}
function classifyPosition({ below, equal, above }) {
	if (below + equal + above === 0) return {
		position: "solo",
		tieContext: "none"
	};
	if (above === 0 && equal === 0) return {
		position: "top",
		tieContext: "none"
	};
	if (below === 0 && equal === 0) return {
		position: "bottom",
		tieContext: "none"
	};
	if (above === 0 && equal > 0) return {
		position: "top",
		tieContext: "top"
	};
	if (below === 0 && equal > 0) return {
		position: "bottom",
		tieContext: "bottom"
	};
	if (equal > 0) return {
		position: "middle",
		tieContext: "middle"
	};
	if (below > above) return {
		position: "middle-above",
		tieContext: "none"
	};
	if (above > below) return {
		position: "middle-below",
		tieContext: "none"
	};
	return {
		position: "middle",
		tieContext: "none"
	};
}
//#endregion
//#region src/graph-runtime/dotgraph/components/GeneralizedLayer.tsx
var TMP_CENTER_LOCAL = new Vector3();
var TMP_CENTER_WORLD = new Vector3();
var TMP_ANCHOR_WORLD = new Vector3();
var TMP_ANCHOR_LOCAL = new Vector3();
var TMP_CAMERA_RIGHT = new Vector3();
var TMP_CAMERA_UP = new Vector3();
var TMP_CAMERA_FORWARD = new Vector3();
function AnchoredTooltip({ hoveredDot, fallbackPosition, zoomFraction, className, style, children }) {
	const anchorRef = useRef(null);
	const { camera, gl } = useThree();
	const [hitboxHalfSize, setHitboxHalfSize] = useState({
		width: 0,
		height: 0
	});
	const updateAnchorPosition = useCallback(() => {
		const anchor = anchorRef.current;
		const parent = anchor?.parent;
		const layout = hoveredDot.tooltipLayout;
		if (!anchor || !parent) return;
		if (hoveredDot.anchorPosition && !layout) {
			TMP_ANCHOR_WORLD.set(hoveredDot.anchorPosition[0], hoveredDot.anchorPosition[1], hoveredDot.anchorPosition[2]);
			TMP_ANCHOR_LOCAL.copy(TMP_ANCHOR_WORLD);
			parent.worldToLocal(TMP_ANCHOR_LOCAL);
			anchor.position.copy(TMP_ANCHOR_LOCAL);
			return;
		}
		if (!layout) return;
		TMP_CENTER_LOCAL.set(fallbackPosition[0], fallbackPosition[1], fallbackPosition[2]);
		TMP_CENTER_WORLD.copy(TMP_CENTER_LOCAL);
		parent.localToWorld(TMP_CENTER_WORLD);
		TMP_CAMERA_RIGHT.setFromMatrixColumn(camera.matrixWorld, 0).normalize();
		TMP_CAMERA_UP.setFromMatrixColumn(camera.matrixWorld, 1).normalize();
		TMP_CAMERA_FORWARD.setFromMatrixColumn(camera.matrixWorld, 2).normalize();
		TMP_ANCHOR_WORLD.copy(TMP_CENTER_WORLD);
		if (hoveredDot.tooltipAnchorMode !== "shapeCenter") {
			const [offsetX, offsetY, offsetZ] = resolveTooltipAnchorCenterOffset(layout);
			TMP_ANCHOR_WORLD.addScaledVector(TMP_CAMERA_RIGHT, offsetX).addScaledVector(TMP_CAMERA_UP, offsetY).addScaledVector(TMP_CAMERA_FORWARD, offsetZ);
		}
		const nextHalfSize = resolveHitboxScreenHalfSize({
			camera,
			domElement: gl.domElement,
			anchorWorld: TMP_ANCHOR_WORLD,
			cameraRight: TMP_CAMERA_RIGHT,
			cameraUp: TMP_CAMERA_UP,
			layout
		});
		setHitboxHalfSize((prev) => {
			const width = Math.round(nextHalfSize.width);
			const height = Math.round(nextHalfSize.height);
			return prev.width === width && prev.height === height ? prev : {
				width,
				height
			};
		});
		TMP_ANCHOR_LOCAL.copy(TMP_ANCHOR_WORLD);
		parent.worldToLocal(TMP_ANCHOR_LOCAL);
		anchor.position.copy(TMP_ANCHOR_LOCAL);
	}, [
		camera,
		fallbackPosition,
		gl.domElement,
		hoveredDot.anchorPosition,
		hoveredDot.tooltipAnchorMode,
		hoveredDot.tooltipLayout
	]);
	useLayoutEffect(() => {
		updateAnchorPosition();
	}, [updateAnchorPosition]);
	useFrame(updateAnchorPosition);
	const resolvedStyle = useMemo(() => makeTooltipHitboxCssVars({
		halfSize: hitboxHalfSize,
		zoomFraction,
		style
	}), [
		hitboxHalfSize,
		style,
		zoomFraction
	]);
	return /* @__PURE__ */ jsx("group", {
		ref: anchorRef,
		position: fallbackPosition,
		children: hasResolvedHitboxSize(hitboxHalfSize) && /* @__PURE__ */ jsx(Html, {
			position: [
				0,
				0,
				0
			],
			center: true,
			zIndexRange: [120, 180],
			style: resolvedStyle,
			className,
			children
		})
	});
}
function HoveredLayer({ hoveredDot, shapes, safeData, mode, zoomFraction, viewportClass, calcValueForAvg, getRelForId, absScoreById }) {
	const content = useMemo(() => {
		if (!hoveredDot) return null;
		const hoveredShape = shapes.find((shape) => shape._id === hoveredDot.dotId);
		if (!hoveredShape) return null;
		const hoveredEntry = safeData.find((entry) => entry._id === hoveredDot.dotId);
		const hoveredAvg = hoveredEntry ? avgWeightOf(hoveredEntry) : void 0;
		let displayPct = 0;
		if (typeof hoveredAvg === "number" && Number.isFinite(hoveredAvg)) try {
			displayPct = Math.round(calcValueForAvg(hoveredAvg));
		} catch {
			displayPct = 0;
		}
		if (!Number.isFinite(displayPct) || displayPct < 0) displayPct = mode === "relative" ? getRelForId(hoveredDot.dotId) : absScoreById.get(hoveredDot.dotId) ?? 0;
		const hoveredStats = hoveredEntry ? getTieStats({
			data: safeData,
			targetId: hoveredDot.dotId
		}) : {
			below: 0,
			equal: 0,
			above: 0,
			totalOthers: 0
		};
		const hoveredClass = classifyPosition(hoveredStats);
		return {
			hoveredShape,
			displayPct,
			soloMessage: typeof hoveredEntry?.soloMessage === "string" ? hoveredEntry.soloMessage : "",
			hoveredStats,
			hoveredClass
		};
	}, [
		hoveredDot,
		shapes,
		safeData,
		mode,
		calcValueForAvg,
		getRelForId,
		absScoreById
	]);
	if (!hoveredDot || !content) return null;
	const htmlStyle = {
		pointerEvents: "none",
		...EMPTY_TOOLTIP_HITBOX_CSS_VARS,
		opacity: 1
	};
	return /* @__PURE__ */ jsx(AnchoredTooltip, {
		hoveredDot,
		fallbackPosition: content.hoveredShape.position,
		zoomFraction,
		style: htmlStyle,
		className: viewportClass,
		children: /* @__PURE__ */ jsx(GamificationGeneral, {
			dotId: hoveredDot.dotId,
			percentage: content.displayPct,
			color: content.hoveredShape.color,
			soloMessage: content.soloMessage,
			mode,
			belowCountStrict: content.hoveredStats.below,
			equalCount: content.hoveredStats.equal,
			aboveCountStrict: content.hoveredStats.above,
			positionClass: content.hoveredClass.position
		})
	});
}
//#endregion
//#region src/graph-runtime/dotgraph/scope/scoping.ts
var ROLE = {
	VISITOR: "visitor",
	STUDENTS: "all-students",
	STAFF: "all-staff",
	UNKNOWN: "unknown"
};
var BUCKETS = new Set([
	"all",
	"all-massart",
	"all-students",
	"all-staff",
	"visitor"
]);
var roleSections = ROLE_SECTIONS;
var STUDENT_ID_SET = new Set(roleSections.student.map((section) => section.value));
var STAFF_ID_SET = new Set(roleSections.staff.map((section) => section.value));
var normStr = (v) => {
	if (typeof v === "string") return v.trim().toLowerCase();
	if (typeof v === "number" || typeof v === "boolean") return String(v).trim().toLowerCase();
	return "";
};
function normSection(sectionRaw) {
	const s = normStr(sectionRaw);
	if (!s) return "all";
	if (s === "all" || s.includes("everyone")) return "all";
	if (s.includes("massart")) return "all-massart";
	if (s.includes("all-students") || s.includes("all students")) return "all-students";
	if (s.includes("all-staff") || s.includes("all staff") || s.includes("faculty/staff") || s.includes("faculty-staff")) return "all-staff";
	if (s.includes("visitor")) return "visitor";
	return s;
}
function deriveRoleFromSectionId(mySectionRaw) {
	const s = normSection(mySectionRaw);
	if (s === "visitor") return ROLE.VISITOR;
	if (STUDENT_ID_SET.has(s) || s === "all-students") return ROLE.STUDENTS;
	if (STAFF_ID_SET.has(s) || s === "all-staff") return ROLE.STAFF;
	return ROLE.UNKNOWN;
}
function includedScopesForUser(role, mySectionRaw) {
	const me = normSection(mySectionRaw);
	switch (role) {
		case ROLE.VISITOR: return new Set(["all", "visitor"]);
		case ROLE.STUDENTS: {
			const set = new Set([
				"all-students",
				"all-massart",
				"all"
			]);
			if (me && !BUCKETS.has(me)) set.add(me);
			return set;
		}
		case ROLE.STAFF: {
			const set = new Set([
				"all-staff",
				"all-massart",
				"all"
			]);
			if (me && !BUCKETS.has(me)) set.add(me);
			return set;
		}
		default: {
			const set = new Set(["all-massart", "all"]);
			if (me && !BUCKETS.has(me)) set.add(me);
			return set;
		}
	}
}
function allowPersonalInSection(role, mySectionRaw, sectionRaw) {
	const here = normSection(sectionRaw);
	return includedScopesForUser(role, mySectionRaw).has(here);
}
//#endregion
//#region src/graph-runtime/dotgraph/scope/useViewerScope.ts
function useViewerScope(args) {
	const { mySection, section } = args;
	const effectiveMySection = useMemo(() => {
		if (mySection && mySection !== "") return mySection;
		const s = getSessionItem("be.mySection");
		if (s && s !== "") return s;
		return "";
	}, [mySection]);
	const viewerRole = useMemo(() => deriveRoleFromSectionId(effectiveMySection), [effectiveMySection]);
	return {
		effectiveMySection,
		viewerRole,
		shouldShowPersonalized: useMemo(() => {
			const viewing = section ?? getSessionItem("be.viewingSection") ?? "all";
			const ok = allowPersonalInSection(viewerRole, effectiveMySection, viewing);
			if (viewerRole === ROLE.VISITOR) {
				const v = normSection(viewing);
				return v === "all" || v === "visitor";
			}
			return ok;
		}, [
			viewerRole,
			effectiveMySection,
			section
		])
	};
}
//#endregion
//#region src/graph-runtime/dotgraph/scene/usePersonalizationGate.ts
function hasStoredPersonalSnapshot(entryId) {
	if (!entryId) return false;
	try {
		const raw = getSessionItem("be.myDoc");
		if (!raw) return false;
		return JSON.parse(raw)._id === entryId;
	} catch {
		return false;
	}
}
function usePersonalizationGate({ myEntryId, mySection, section, safeData, observerMode, isSmallScreen }) {
	const personalizedEntryId = myEntryId ?? getSessionItem("be.myEntryId");
	const [personalOpen, setPersonalOpen] = useState(true);
	const hasPersonalizedInDataset = useMemo(() => !!personalizedEntryId && safeData.some((entry) => entry._id === personalizedEntryId), [personalizedEntryId, safeData]);
	const hasPersonalizedSnapshot = useMemo(() => hasStoredPersonalSnapshot(personalizedEntryId), [personalizedEntryId]);
	const { shouldShowPersonalized } = useViewerScope({
		mySection,
		section
	});
	return {
		personalizedEntryId,
		personalOpen,
		setPersonalOpen,
		hasPersonalizedInDataset,
		shouldShowPersonalized,
		wantsSkew: isSmallScreen && !observerMode && (hasPersonalizedInDataset || hasPersonalizedSnapshot) && personalOpen && shouldShowPersonalized
	};
}
//#endregion
//#region src/lib/utils/color-and-interpolation.ts
/** Clamp a number to [min,max] */
var clamp = (v, min = 0, max = 1) => Math.max(min, Math.min(max, v));
/** Interpolate two RGB colors */
var lerpColor = (t, c1, c2) => ({
	r: Math.round(c1.r + (c2.r - c1.r) * t),
	g: Math.round(c1.g + (c2.g - c1.g) * t),
	b: Math.round(c1.b + (c2.b - c1.b) * t)
});
/** Convert RGB object to css rgb() string */
var rgbString = (c) => `rgb(${String(c.r)}, ${String(c.g)}, ${String(c.b)})`;
var BRAND_STOPS = [
	{
		stop: 0,
		color: {
			r: 210,
			g: 0,
			b: 25
		}
	},
	{
		stop: .2,
		color: {
			r: 235,
			g: 90,
			b: 0
		}
	},
	{
		stop: .4,
		color: {
			r: 255,
			g: 150,
			b: 40
		}
	},
	{
		stop: .6,
		color: {
			r: 225,
			g: 175,
			b: 40
		}
	},
	{
		stop: .7,
		color: {
			r: 180,
			g: 180,
			b: 120
		}
	},
	{
		stop: .78,
		color: {
			r: 110,
			g: 195,
			b: 70
		}
	},
	{
		stop: 1,
		color: {
			r: 0,
			g: 200,
			b: 40
		}
	}
];
/**
* Sample a multi-stop gradient.
* @param tRaw - normalized 0..1 position
* @param stops - gradient stops (sorted by stop)
*/
var sampleStops = (tRaw, stops = BRAND_STOPS) => {
	const t = clamp(tRaw, 0, 1);
	let lower = stops[0], upper = stops[stops.length - 1];
	for (let i = 0; i < stops.length - 1; i++) if (t >= stops[i].stop && t <= stops[i + 1].stop) {
		lower = stops[i];
		upper = stops[i + 1];
		break;
	}
	const range = Math.max(upper.stop - lower.stop, 1e-6);
	return lerpColor((t - lower.stop) / range, lower.color, upper.color);
};
//#endregion
//#region src/graph-runtime/dotgraph/camera/controls/useActivity.ts
function useActivity({ startOnLoad = true, delayMs = 1e4 } = {}) {
	const hasInteractedRef = useRef(false);
	const lastActivityRef = useRef(0);
	return {
		hasInteractedRef,
		lastActivityRef,
		markActivity: useCallback(() => {
			hasInteractedRef.current = true;
			lastActivityRef.current = performance.now();
		}, []),
		isIdle: useCallback(({ userInteracting, hasInteractedRef: hRef, lastActivityRef: lRef }) => {
			const timeSince = performance.now() - (lRef?.current ?? lastActivityRef.current);
			const interacted = hRef?.current ?? hasInteractedRef.current;
			return !interacted && startOnLoad && !userInteracting || interacted && !userInteracting && timeSince >= delayMs;
		}, [startOnLoad, delayMs])
	};
}
//#endregion
//#region src/graph-runtime/dotgraph/camera/controls/useZoom.ts
function useZoom({ minRadius, maxRadius, initialTarget, markActivity, gestureRef }) {
	const clamp = (v, mn, mx) => Math.max(mn, Math.min(mx, v));
	const resolvedInitialTarget = typeof initialTarget === "number" && Number.isFinite(initialTarget) ? clamp(initialTarget, minRadius, maxRadius) : null;
	const [radius, setRadius] = useState(() => {
		return resolvedInitialTarget ?? (minRadius + maxRadius) / 2;
	});
	const zoomTargetRef = useRef(resolvedInitialTarget);
	const zoomVelRef = useRef(0);
	const radiusRef = useRef(radius);
	const pinchCooldownRef = useRef(false);
	const pinchTimeoutRef = useRef(null);
	const pinchCooldownTimerRef = useRef(null);
	const touchStartDistance = useRef(null);
	useEffect(() => {
		radiusRef.current = radius;
	}, [radius]);
	const setZoomTarget = useCallback((val) => {
		zoomTargetRef.current = clamp(val, minRadius, maxRadius);
	}, [minRadius, maxRadius]);
	const resetZoomTarget = useCallback((val) => {
		const next = clamp(val, minRadius, maxRadius);
		zoomVelRef.current = 0;
		zoomTargetRef.current = null;
		radiusRef.current = next;
		setRadius(next);
		return next;
	}, [minRadius, maxRadius]);
	useEffect(() => {
		const WHEEL_SCALE_PER_PX = .0012;
		const CTRL_ZOOM_GAIN = 3;
		const PINCH_GAIN = 1.4;
		const PINCH_COOLDOWN_MS = 200;
		const ping = () => {
			if (typeof markActivity === "function") markActivity();
		};
		const isGraphEvent = (event) => {
			const target = event.target;
			return target instanceof Element && Boolean(target.closest(".graph-container"));
		};
		const preventGraphDefault = (event) => {
			if (!isGraphEvent(event)) return false;
			if (event.cancelable) event.preventDefault();
			return true;
		};
		const handleScroll = (event) => {
			if (!preventGraphDefault(event)) return;
			bumpZoomMetric("wheelEvents");
			ping();
			const current = zoomTargetRef.current ?? radiusRef.current;
			let dy = event.deltaY;
			if (event.deltaMode === 1) dy *= 20;
			else if (event.deltaMode === 2) dy *= 300;
			const gain = event.ctrlKey ? CTRL_ZOOM_GAIN : 1;
			zoomTargetRef.current = clamp(current * (1 + clamp(dy * WHEEL_SCALE_PER_PX * gain, -.35, .35)), minRadius, maxRadius);
		};
		const handleTouchMove = (event) => {
			if (event.touches.length !== 2) return;
			if (!preventGraphDefault(event)) return;
			if (pinchCooldownRef.current) return;
			bumpZoomMetric("touchMoveEvents");
			ping();
			const [t1, t2] = [event.touches[0], event.touches[1]];
			const dist = Math.hypot(t2.clientX - t1.clientX, t2.clientY - t1.clientY);
			const current = zoomTargetRef.current ?? radiusRef.current;
			if (touchStartDistance.current != null) {
				const pinchDelta = dist - touchStartDistance.current;
				const zoomOutT = clamp((current - minRadius) / Math.max(1e-6, maxRadius - minRadius), 0, 1);
				zoomTargetRef.current = clamp(current - pinchDelta * (PINCH_GAIN * (.55 + .75 * Math.pow(zoomOutT, .7))), minRadius, maxRadius);
			}
			touchStartDistance.current = dist;
		};
		const handleTouchStart = (event) => {
			if (!isGraphEvent(event)) return;
			if (event.touches.length === 2) {
				ping();
				const [t1, t2] = [event.touches[0], event.touches[1]];
				touchStartDistance.current = Math.hypot(t2.clientX - t1.clientX, t2.clientY - t1.clientY);
				if (gestureRef?.current) {
					gestureRef.current.pinching = true;
					gestureRef.current.touchCount = 2;
				}
			}
		};
		const handleTouchEnd = (event) => {
			ping();
			const touches = event.touches.length;
			if (gestureRef?.current) gestureRef.current.touchCount = touches;
			if (gestureRef?.current) {
				if (gestureRef.current.pinching && touches < 2) {
					gestureRef.current.pinching = false;
					gestureRef.current.pinchCooldownUntil = performance.now() + PINCH_COOLDOWN_MS;
				}
			}
			if (touches < 2) {
				if (pinchTimeoutRef.current) window.clearTimeout(pinchTimeoutRef.current);
				pinchTimeoutRef.current = window.setTimeout(() => {
					touchStartDistance.current = null;
				}, 120);
				pinchCooldownRef.current = true;
				if (pinchCooldownTimerRef.current) window.clearTimeout(pinchCooldownTimerRef.current);
				pinchCooldownTimerRef.current = window.setTimeout(() => {
					pinchCooldownRef.current = false;
					pinchCooldownTimerRef.current = null;
				}, 160);
			}
		};
		const handleBrowserGesture = (event) => {
			preventGraphDefault(event);
		};
		window.addEventListener("wheel", handleScroll, { passive: false });
		window.addEventListener("gesturestart", handleBrowserGesture, { passive: false });
		window.addEventListener("gesturechange", handleBrowserGesture, { passive: false });
		window.addEventListener("gestureend", handleBrowserGesture, { passive: false });
		window.addEventListener("touchstart", handleTouchStart, { passive: false });
		window.addEventListener("touchmove", handleTouchMove, { passive: false });
		window.addEventListener("touchend", handleTouchEnd);
		return () => {
			if (pinchTimeoutRef.current) window.clearTimeout(pinchTimeoutRef.current);
			if (pinchCooldownTimerRef.current) window.clearTimeout(pinchCooldownTimerRef.current);
			window.removeEventListener("wheel", handleScroll);
			window.removeEventListener("gesturestart", handleBrowserGesture);
			window.removeEventListener("gesturechange", handleBrowserGesture);
			window.removeEventListener("gestureend", handleBrowserGesture);
			window.removeEventListener("touchstart", handleTouchStart);
			window.removeEventListener("touchmove", handleTouchMove);
			window.removeEventListener("touchend", handleTouchEnd);
		};
	}, [
		minRadius,
		maxRadius,
		markActivity,
		gestureRef
	]);
	const ZOOM_OMEGA = 18;
	const ZOOM_SNAP_EPS = .0015;
	const ZOOM_MAX_FRAME_DT = 1 / 30;
	useFrame((_, rawDelta) => {
		if (zoomTargetRef.current == null) return;
		bumpZoomMetric("zoomFrames");
		const delta = Math.min(rawDelta, ZOOM_MAX_FRAME_DT);
		const r = radius;
		const target = clamp(zoomTargetRef.current, minRadius, maxRadius);
		let v = zoomVelRef.current;
		const x = r - target;
		const a = -2 * ZOOM_OMEGA * v - ZOOM_OMEGA * ZOOM_OMEGA * x;
		v += a * delta;
		let next = r + v * delta;
		next = clamp(next, minRadius, maxRadius);
		if (next === maxRadius && v > 0) v = 0;
		if (next === minRadius && v < 0) v = 0;
		if (Math.abs(next - r) > ZOOM_SNAP_EPS) {
			bumpZoomMetric("radiusStateUpdates");
			setRadius(next);
		} else {
			bumpZoomMetric("radiusStateUpdates");
			setRadius(target);
			v = 0;
			zoomTargetRef.current = null;
		}
		zoomVelRef.current = v;
	});
	return {
		radius,
		zoomTargetRef,
		zoomVelRef,
		setZoomTarget,
		resetZoomTarget
	};
}
//#endregion
//#region src/graph-runtime/dotgraph/camera/controls/useRotation.ts
var _rotQ = new Quaternion();
var _axisX = new Vector3(1, 0, 0);
var _axisY = new Vector3(0, 1, 0);
var _dotWorld = new Vector3();
var _frustum = new Frustum();
var _projScreen = new Matrix4();
var ROT_RELEASE_TAU = .38;
var ROT_IDLE_RELEASE_TAU = .18;
var ROT_STOP_EPSILON = .001;
var TOUCH_SENSITIVITY_RELEASE_CURVE = .55;
var mapResponsiveDelta = (delta, deadzone) => {
	const magnitude = Math.abs(delta);
	if (magnitude === 0) return 0;
	const sign = Math.sign(delta);
	if (magnitude <= deadzone) return sign * (magnitude * magnitude / (2 * deadzone));
	return sign * (magnitude - deadzone / 2);
};
var decaySpinAxis = (value, tau, delta) => {
	if (Math.abs(value) <= ROT_STOP_EPSILON) return 0;
	const next = value * Math.exp(-delta / tau);
	return Math.abs(next) <= ROT_STOP_EPSILON ? 0 : next;
};
var clamp01$1 = (value) => Math.max(0, Math.min(1, value));
var lerp$1 = (a, b, t) => a + (b - a) * t;
var getZoomRatio = (radius, minRadius, maxRadius) => {
	const span = Math.max(1e-6, maxRadius - minRadius);
	return clamp01$1((radius - minRadius) / span);
};
var getDragTuning = ({ radius, minRadius, maxRadius, isTouch, isTabletLike, closestDist }) => {
	const zoomRatio = Math.pow(getZoomRatio(radius, minRadius, maxRadius), .85);
	const distRatio = clamp01$1(closestDist / maxRadius);
	const sensitivityRatio = isTouch ? Math.max(distRatio, Math.pow(zoomRatio, TOUCH_SENSITIVITY_RELEASE_CURVE)) : distRatio;
	return {
		deadzoneMul: isTouch ? lerp$1(.72, 1, distRatio) : lerp$1(.55, 1.1, distRatio),
		sensitivityMul: isTouch ? lerp$1(isTabletLike ? .42 : .35, 1, sensitivityRatio) : lerp$1(.17, 1.2, distRatio)
	};
};
function useRotation({ groupRef, useDesktopLayout, isTabletLike, minRadius, maxRadius, radius, markActivity, gestureRef, dotPositions }) {
	const { gl, camera } = useThree();
	const isPinchingRef = useRef(false);
	const isTouchRotatingRef = useRef(false);
	const isDesktopRotatingRef = useRef(false);
	const lastTouchRef = useRef({
		x: 0,
		y: 0,
		t: 0
	});
	const lastDesktopPointerRef = useRef({
		x: 0,
		y: 0,
		t: 0
	});
	const spinVelRef = useRef({
		x: 0,
		y: 0
	});
	const ignoreFirstSingleAfterPinchRef = useRef(false);
	const effectiveDraggingRef = useRef(false);
	const getLatched = () => {
		var _window;
		if (typeof window === "undefined") return true;
		(_window = window).__gpEdgeLatched ?? (_window.__gpEdgeLatched = true);
		return window.__gpEdgeLatched;
	};
	const setLatched = (next) => {
		if (typeof window === "undefined") return;
		window.__gpEdgeLatched = next;
		window.dispatchEvent(new CustomEvent("gp:edge-cue-state", { detail: { latched: next } }));
	};
	const appActiveRef = useRef(true);
	useEffect(() => {
		const recompute = () => {
			const visible = document.visibilityState === "visible";
			const focused = document.hasFocus();
			appActiveRef.current = visible && focused;
		};
		const onPointerOut = (e) => {
			if (e.relatedTarget === null) appActiveRef.current = false;
		};
		const onPointerOver = () => {
			const visible = document.visibilityState === "visible";
			const focused = document.hasFocus();
			appActiveRef.current = visible && focused;
		};
		const onBlur = () => {
			appActiveRef.current = false;
		};
		const onFocus = () => {
			recompute();
		};
		const onVis = () => {
			recompute();
		};
		window.addEventListener("blur", onBlur);
		window.addEventListener("focus", onFocus);
		document.addEventListener("visibilitychange", onVis);
		window.addEventListener("pointerout", onPointerOut);
		window.addEventListener("pointerover", onPointerOver);
		recompute();
		return () => {
			window.removeEventListener("blur", onBlur);
			window.removeEventListener("focus", onFocus);
			document.removeEventListener("visibilitychange", onVis);
			window.removeEventListener("pointerout", onPointerOut);
			window.removeEventListener("pointerover", onPointerOver);
		};
	}, []);
	const holdTimerRef = useRef(null);
	const holdArmedRef = useRef(false);
	const holdSceneRef = useRef(false);
	const touchOwnsSceneRef = useRef(false);
	const HOLD_MS = 650;
	const lastMouseMoveTsRef = useRef(0);
	const isMovingRef = useRef(false);
	const isDraggingRef = useRef(false);
	const zoomMetricsRef = useRef({
		radius,
		minRadius,
		maxRadius
	});
	const closestDistRef = useRef(Infinity);
	const dotPositionsRef = useRef(dotPositions ?? []);
	useEffect(() => {
		zoomMetricsRef.current = {
			radius,
			minRadius,
			maxRadius
		};
	}, [
		radius,
		minRadius,
		maxRadius
	]);
	useEffect(() => {
		dotPositionsRef.current = dotPositions ?? [];
	}, [dotPositions]);
	useEffect(() => {
		const dpr = window.devicePixelRatio;
		const DESKTOP_DEADZONE_PX = Math.max(.2, .35 * dpr);
		const TOUCH_DEADZONE_PX = Math.max(.6, .8 * dpr);
		const TOUCH_PX_TO_RAD = (isTabletLike ? .004 : .006) / dpr;
		const DESKTOP_PX_TO_RAD = .0032 / dpr;
		const canvas = gl.domElement;
		const isSceneTouchTarget = (target) => {
			const canvas = gl.domElement;
			if (!(target instanceof Node)) return false;
			return target === canvas || canvas.contains(target);
		};
		const isDesktopScenePointer = (event) => useDesktopLayout && (event.pointerType === "mouse" || event.pointerType === "pen") && isSceneTouchTarget(event.target);
		const hasSceneTouchTarget = (touches) => {
			for (const touch of Array.from(touches)) if (isSceneTouchTarget(touch.target)) return true;
			return false;
		};
		const handlePointerDown = (event) => {
			if (!isDesktopScenePointer(event)) return;
			if (isDraggingRef.current) return;
			isDesktopRotatingRef.current = true;
			canvas.classList.add("is-rotating");
			isMovingRef.current = false;
			spinVelRef.current = {
				x: 0,
				y: 0
			};
			lastDesktopPointerRef.current = {
				x: event.clientX,
				y: event.clientY,
				t: performance.now()
			};
			lastMouseMoveTsRef.current = lastDesktopPointerRef.current.t;
			markActivity?.();
		};
		const handlePointerMove = (event) => {
			if (event.pointerType !== "mouse" && event.pointerType !== "pen") return;
			lastMouseMoveTsRef.current = performance.now();
			if (!isDesktopRotatingRef.current) return;
			if (isDraggingRef.current) {
				isDesktopRotatingRef.current = false;
				canvas.classList.remove("is-rotating");
				isMovingRef.current = false;
				spinVelRef.current = {
					x: 0,
					y: 0
				};
				return;
			}
			markActivity?.();
			const now = performance.now();
			const last = lastDesktopPointerRef.current;
			const dt = Math.max(1, now - last.t);
			const rawDx = event.clientX - last.x;
			const rawDy = event.clientY - last.y;
			const { radius, minRadius, maxRadius } = zoomMetricsRef.current;
			const { deadzoneMul, sensitivityMul } = getDragTuning({
				radius,
				minRadius,
				maxRadius,
				isTouch: false,
				isTabletLike,
				closestDist: closestDistRef.current
			});
			const dx = mapResponsiveDelta(rawDx, DESKTOP_DEADZONE_PX * deadzoneMul);
			const dy = mapResponsiveDelta(rawDy, DESKTOP_DEADZONE_PX * deadzoneMul);
			const desktopPxToRad = DESKTOP_PX_TO_RAD * sensitivityMul;
			const moving = Math.abs(dx) > .005 || Math.abs(dy) > .005;
			isMovingRef.current = moving;
			if (!moving) {
				lastDesktopPointerRef.current = {
					x: event.clientX,
					y: event.clientY,
					t: now
				};
				return;
			}
			const g = groupRef.current;
			if (g) {
				_rotQ.setFromAxisAngle(_axisX, -dy * desktopPxToRad);
				g.quaternion.premultiply(_rotQ);
				_rotQ.setFromAxisAngle(_axisY, -dx * desktopPxToRad);
				g.quaternion.premultiply(_rotQ);
			}
			const vx = -dy / dt * 1e3 * desktopPxToRad;
			const vy = -dx / dt * 1e3 * desktopPxToRad;
			spinVelRef.current = {
				x: (spinVelRef.current.x + vx) * .5,
				y: (spinVelRef.current.y + vy) * .5
			};
			lastDesktopPointerRef.current = {
				x: event.clientX,
				y: event.clientY,
				t: now
			};
		};
		const endDesktopRotation = () => {
			isDesktopRotatingRef.current = false;
			canvas.classList.remove("is-rotating");
			isMovingRef.current = false;
		};
		const handleTouchStart = (event) => {
			markActivity?.();
			if (gestureRef?.current) gestureRef.current.touchCount = event.touches.length;
			if (event.touches.length === 1) {
				const t = event.touches[0];
				holdSceneRef.current = isSceneTouchTarget(t.target);
				touchOwnsSceneRef.current = holdSceneRef.current;
				if (!touchOwnsSceneRef.current) {
					isTouchRotatingRef.current = false;
					isMovingRef.current = false;
					spinVelRef.current = {
						x: 0,
						y: 0
					};
					if (holdTimerRef.current) window.clearTimeout(holdTimerRef.current);
					holdTimerRef.current = null;
					holdArmedRef.current = false;
					return;
				}
				isTouchRotatingRef.current = true;
				isMovingRef.current = false;
				lastTouchRef.current = {
					x: t.clientX,
					y: t.clientY,
					t: performance.now()
				};
				spinVelRef.current = {
					x: 0,
					y: 0
				};
				holdArmedRef.current = holdSceneRef.current;
				if (holdTimerRef.current) window.clearTimeout(holdTimerRef.current);
				if (holdArmedRef.current) holdTimerRef.current = window.setTimeout(() => {
					if (touchOwnsSceneRef.current && holdArmedRef.current && holdSceneRef.current && !isPinchingRef.current && !gestureRef?.current?.pinching) {
						setLatched(!getLatched());
						holdArmedRef.current = false;
					}
				}, HOLD_MS);
			} else if (event.touches.length >= 2) {
				touchOwnsSceneRef.current = hasSceneTouchTarget(event.touches);
				if (!touchOwnsSceneRef.current) {
					isTouchRotatingRef.current = false;
					isMovingRef.current = false;
					spinVelRef.current = {
						x: 0,
						y: 0
					};
					if (gestureRef?.current) gestureRef.current.pinching = false;
					if (holdTimerRef.current) window.clearTimeout(holdTimerRef.current);
					holdTimerRef.current = null;
					holdArmedRef.current = false;
					holdSceneRef.current = false;
					return;
				}
				isTouchRotatingRef.current = false;
				isMovingRef.current = false;
				spinVelRef.current = {
					x: 0,
					y: 0
				};
				if (gestureRef?.current) gestureRef.current.pinching = true;
				if (holdTimerRef.current) window.clearTimeout(holdTimerRef.current);
				holdTimerRef.current = null;
				holdArmedRef.current = false;
			}
		};
		const handleTouchMove = (event) => {
			if (!touchOwnsSceneRef.current) return;
			event.preventDefault();
			if (isDraggingRef.current) return;
			markActivity?.();
			const now = performance.now();
			const gs = gestureRef?.current;
			const inCooldown = gs ? now < gs.pinchCooldownUntil : false;
			const multiTouch = (gs?.touchCount ?? event.touches.length) >= 2;
			const pinching = (gs?.pinching ?? false) || isPinchingRef.current;
			if (multiTouch || pinching) return;
			if (inCooldown) {
				if (event.touches.length === 1) {
					const t = event.touches[0];
					lastTouchRef.current = {
						x: t.clientX,
						y: t.clientY,
						t: performance.now()
					};
					ignoreFirstSingleAfterPinchRef.current = true;
				}
				return;
			}
			if (event.touches.length === 1) {
				const t = event.touches[0];
				const now2 = performance.now();
				if (ignoreFirstSingleAfterPinchRef.current) {
					lastTouchRef.current = {
						x: t.clientX,
						y: t.clientY,
						t: now2
					};
					ignoreFirstSingleAfterPinchRef.current = false;
					return;
				}
				const last = lastTouchRef.current;
				const dt = Math.max(1, now2 - last.t);
				const rawDx = t.clientX - last.x;
				const rawDy = t.clientY - last.y;
				const { radius, minRadius, maxRadius } = zoomMetricsRef.current;
				const { deadzoneMul, sensitivityMul } = getDragTuning({
					radius,
					minRadius,
					maxRadius,
					isTouch: true,
					isTabletLike,
					closestDist: closestDistRef.current
				});
				const dx = mapResponsiveDelta(rawDx, TOUCH_DEADZONE_PX * deadzoneMul);
				const dy = mapResponsiveDelta(rawDy, TOUCH_DEADZONE_PX * deadzoneMul);
				const touchPxToRad = TOUCH_PX_TO_RAD * sensitivityMul;
				const moving = Math.abs(dx) > .005 || Math.abs(dy) > .005;
				isMovingRef.current = moving;
				if (!moving) {
					lastTouchRef.current = {
						x: t.clientX,
						y: t.clientY,
						t: now2
					};
					return;
				}
				const g = groupRef.current;
				if (g) {
					_rotQ.setFromAxisAngle(_axisX, -dy * touchPxToRad);
					g.quaternion.premultiply(_rotQ);
					_rotQ.setFromAxisAngle(_axisY, -dx * touchPxToRad);
					g.quaternion.premultiply(_rotQ);
				}
				const vx = -dy / dt * 1e3 * touchPxToRad;
				const vy = -dx / dt * 1e3 * touchPxToRad;
				spinVelRef.current = {
					x: (spinVelRef.current.x + vx) * .5,
					y: (spinVelRef.current.y + vy) * .5
				};
				lastTouchRef.current = {
					x: t.clientX,
					y: t.clientY,
					t: now2
				};
			}
		};
		const handleTouchEnd = (event) => {
			markActivity?.();
			if (gestureRef?.current) {
				gestureRef.current.touchCount = event.touches.length;
				if (gestureRef.current.pinching && event.touches.length < 2) {
					gestureRef.current.pinching = false;
					if (gestureRef.current.pinchCooldownUntil < performance.now() + 200) gestureRef.current.pinchCooldownUntil = performance.now() + 200;
				}
			}
			if (event.touches.length === 0) {
				isTouchRotatingRef.current = false;
				isMovingRef.current = false;
				touchOwnsSceneRef.current = false;
			}
			if (event.touches.length < 2) isPinchingRef.current = false;
			if (holdTimerRef.current) window.clearTimeout(holdTimerRef.current);
			holdTimerRef.current = null;
			holdArmedRef.current = false;
			holdSceneRef.current = false;
			if (event.touches.length === 0) touchOwnsSceneRef.current = false;
		};
		window.addEventListener("pointerdown", handlePointerDown, { passive: true });
		window.addEventListener("pointermove", handlePointerMove, { passive: true });
		window.addEventListener("pointerup", endDesktopRotation);
		window.addEventListener("pointercancel", endDesktopRotation);
		window.addEventListener("touchstart", handleTouchStart, { passive: false });
		window.addEventListener("touchmove", handleTouchMove, { passive: false });
		window.addEventListener("touchend", handleTouchEnd);
		window.addEventListener("touchcancel", handleTouchEnd);
		return () => {
			window.removeEventListener("pointerdown", handlePointerDown);
			window.removeEventListener("pointermove", handlePointerMove);
			window.removeEventListener("pointerup", endDesktopRotation);
			window.removeEventListener("pointercancel", endDesktopRotation);
			window.removeEventListener("touchstart", handleTouchStart);
			window.removeEventListener("touchmove", handleTouchMove);
			window.removeEventListener("touchend", handleTouchEnd);
			window.removeEventListener("touchcancel", handleTouchEnd);
			canvas.classList.remove("is-rotating");
			if (holdTimerRef.current) window.clearTimeout(holdTimerRef.current);
			touchOwnsSceneRef.current = false;
		};
	}, [
		groupRef,
		isTabletLike,
		markActivity,
		gl,
		gestureRef,
		useDesktopLayout
	]);
	function applyRotationFrame({ idleActive, delta }) {
		const g = groupRef.current;
		if (!g) return;
		effectiveDraggingRef.current = isDraggingRef.current || isDesktopRotatingRef.current || isTouchRotatingRef.current || isPinchingRef.current;
		if (isDraggingRef.current) return;
		const zf = Math.max(0, Math.min(1, (radius - minRadius) / (maxRadius - minRadius) || 0));
		const zoomMul = lerp$1(.55, 1.8, zf);
		const tabletMul = isTabletLike ? 1.6 : 1;
		const motionMul = !useDesktopLayout && isMovingRef.current ? .1 + .19999999999999998 * zf : 1;
		const idleMul = idleActive ? .42 : 1;
		const holdingTouch = isTouchRotatingRef.current && !isPinchingRef.current;
		const holdingDesktop = useDesktopLayout && isDesktopRotatingRef.current;
		if (!holdingTouch && !holdingDesktop) {
			const releaseTau = idleActive ? ROT_IDLE_RELEASE_TAU : ROT_RELEASE_TAU;
			spinVelRef.current.x = decaySpinAxis(spinVelRef.current.x, releaseTau, delta);
			spinVelRef.current.y = decaySpinAxis(spinVelRef.current.y, releaseTau, delta);
		}
		const mul = zoomMul * tabletMul * motionMul * idleMul;
		_rotQ.setFromAxisAngle(_axisX, spinVelRef.current.x * delta * mul);
		g.quaternion.premultiply(_rotQ);
		_rotQ.setFromAxisAngle(_axisY, spinVelRef.current.y * delta * mul);
		g.quaternion.premultiply(_rotQ);
	}
	useFrame(() => {
		appActiveRef.current;
		const g = groupRef.current;
		const pts = dotPositionsRef.current;
		if (!g || !pts.length) {
			closestDistRef.current = Infinity;
			return;
		}
		g.updateWorldMatrix(true, false);
		_projScreen.multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse);
		_frustum.setFromProjectionMatrix(_projScreen);
		let minDist = Infinity;
		for (const pos of pts) {
			_dotWorld.set(pos[0], pos[1], pos[2]);
			_dotWorld.applyMatrix4(g.matrixWorld);
			if (!_frustum.containsPoint(_dotWorld)) continue;
			const d = camera.position.distanceTo(_dotWorld);
			if (d < minDist) minDist = d;
		}
		closestDistRef.current = minDist;
	});
	return {
		isPinchingRef,
		isTouchRotatingRef,
		effectiveDraggingRef,
		applyRotationFrame,
		lastMouseMoveTsRef
	};
}
//#endregion
//#region src/graph-runtime/dotgraph/camera/controls/usePixelOffsets.ts
var isPerspectiveCameraLike = (camera) => "aspect" in camera && "fov" in camera && typeof camera.aspect === "number" && typeof camera.fov === "number";
function usePixelOffsets({ groupRef, camera, domElement, radius, xOffset, yOffset, xOffsetPx, yOffsetPx }) {
	const desiredPxRef = useRef({
		x: xOffsetPx,
		y: yOffsetPx
	});
	const animPxRef = useRef({
		x: xOffsetPx,
		y: yOffsetPx
	});
	const queuePausedRef = useRef(false);
	useEffect(() => {
		desiredPxRef.current = {
			x: xOffsetPx,
			y: yOffsetPx
		};
	}, [xOffsetPx, yOffsetPx]);
	useEffect(() => {
		return () => {
			if (queuePausedRef.current) {
				resumeQueue();
				queuePausedRef.current = false;
			}
		};
	}, []);
	useFrame((_, delta) => {
		const g = groupRef.current;
		if (!g) return;
		const targetPx = desiredPxRef.current;
		const anim = animPxRef.current;
		const dx = targetPx.x - anim.x;
		const dy = targetPx.y - anim.y;
		const moving = dx * dx + dy * dy > .25;
		if (moving && !queuePausedRef.current) {
			pauseQueue();
			queuePausedRef.current = true;
		} else if (!moving && queuePausedRef.current) {
			resumeQueue();
			queuePausedRef.current = false;
		}
		const alpha = 1 - Math.exp(-((delta > 0 ? delta : .016) / .25));
		anim.x += dx * alpha;
		anim.y += dy * alpha;
		const rect = domElement.getBoundingClientRect();
		const W = rect.width || domElement.clientWidth || window.innerWidth || 1;
		const H = rect.height || domElement.clientHeight || window.innerHeight || 1;
		const aspect = isPerspectiveCameraLike(camera) ? camera.aspect : W / H;
		const fovRad = (isPerspectiveCameraLike(camera) ? camera.fov : 50) * Math.PI / 180;
		const worldPerPxY = 2 * Math.tan(fovRad / 2) * radius / H;
		const worldPerPxX = worldPerPxY * aspect;
		const offX = xOffset + anim.x * worldPerPxX;
		const offY = yOffset + -anim.y * worldPerPxY;
		g.position.set(offX, offY, 0);
	});
}
//#endregion
//#region src/graph-runtime/dotgraph/camera/shared/sharedGesture.ts
var createGestureState = () => ({
	pinching: false,
	touchCount: 0,
	pinchCooldownUntil: 0
});
//#endregion
//#region src/graph-runtime/dotgraph/camera/compute/zoomTarget.ts
function computeInitialZoomTarget(params) {
	const { count, isSmallScreen, isTabletLike, minRadius, maxRadius } = params;
	const t = (Math.max(1, Math.min(300, count)) - 1) / 299;
	const curved = Math.pow(t, .4);
	const near = isSmallScreen ? 80 : isTabletLike ? 92 : 108;
	const target = near + curved * ((isSmallScreen ? 270 : isTabletLike ? 325 : 392) - near);
	return Math.max(minRadius, Math.min(maxRadius, target));
}
//#endregion
//#region src/graph-runtime/dotgraph/camera/useOrbitController.ts
function useOrbitController(params = {}) {
	const ROTATE_EVT = "gp:orbit-rot";
	const DESKTOP_IDLE_MOUSE_DELAY_MS = 4e3;
	const { useDesktopLayout = params.layout?.useDesktopLayout ?? params.useDesktopLayout ?? true, isSmallScreen = params.layout?.isSmallScreen ?? params.isSmallScreen ?? false, isTabletLike = params.layout?.isTabletLike ?? params.isTabletLike ?? false, xOffset = params.layout?.xOffset ?? params.xOffset ?? 0, yOffset = params.layout?.yOffset ?? params.yOffset ?? 0, xOffsetPx = params.layout?.xOffsetPx ?? params.xOffsetPx ?? 0, yOffsetPx = params.layout?.yOffsetPx ?? params.yOffsetPx ?? 0, minRadius = params.bounds?.minRadius ?? params.minRadius ?? (isSmallScreen ? 2 : 20), maxRadius = params.bounds?.maxRadius ?? params.maxRadius ?? 800, initialZoomFraction = params.initialZoomFraction, dataCount = params.dataCount ?? (Array.isArray(params.data) ? params.data.length : 0), zoomResetKey = params.zoomResetKey, idle = {}, thresholds = {
		mobile: 50,
		tablet: 65,
		desktop: 90
	}, dotPositions } = params;
	const { startOnLoad = idle.startOnLoad ?? true, delayMs = idle.delayMs ?? 2e3 } = idle;
	const { camera, gl } = useThree();
	const groupRef = useRef(null);
	const gestureRef = useRef(createGestureState());
	const count = useMemo(() => typeof dataCount === "number" ? dataCount : 0, [dataCount]);
	const initialTargetComputed = useMemo(() => {
		if (typeof initialZoomFraction === "number" && Number.isFinite(initialZoomFraction)) return maxRadius - Math.max(0, Math.min(1, initialZoomFraction)) * (maxRadius - minRadius);
		return computeInitialZoomTarget({
			count,
			isSmallScreen,
			isTabletLike,
			thresholds,
			minRadius,
			maxRadius
		});
	}, [
		count,
		initialZoomFraction,
		isSmallScreen,
		isTabletLike,
		thresholds,
		minRadius,
		maxRadius
	]);
	const { hasInteractedRef, lastActivityRef, markActivity, isIdle } = useActivity({
		startOnLoad,
		delayMs
	});
	const isIdleWrapped = ({ userInteracting, hasInteractedRef: hiRef = hasInteractedRef, lastActivityRef: laRef = lastActivityRef }) => {
		if (useDesktopLayout) {
			const lastMouseMoveValue = lastMouseMoveTsRef.current ?? 0;
			const lastMouseMoveAt = lastMouseMoveValue > 0 ? lastMouseMoveValue : performance.now();
			return !userInteracting && performance.now() - lastMouseMoveAt >= DESKTOP_IDLE_MOUSE_DELAY_MS;
		}
		return isIdle({
			userInteracting,
			hasInteractedRef: hiRef,
			lastActivityRef: laRef
		});
	};
	const { radius, zoomTargetRef, zoomVelRef, setZoomTarget, resetZoomTarget } = useZoom({
		minRadius,
		maxRadius,
		initialTarget: initialTargetComputed,
		markActivity,
		gestureRef
	});
	const latestInitialTargetRef = useRef(initialTargetComputed);
	const latestResetZoomTargetRef = useRef(resetZoomTarget);
	useLayoutEffect(() => {
		latestInitialTargetRef.current = initialTargetComputed;
		latestResetZoomTargetRef.current = resetZoomTarget;
	}, [initialTargetComputed, resetZoomTarget]);
	useLayoutEffect(() => {
		camera.position.set(0, 0, radius);
		camera.lookAt(0, 0, 0);
		camera.updateMatrixWorld();
	}, [camera, radius]);
	const mountedRef = useRef(false);
	useLayoutEffect(() => {
		if (!mountedRef.current) {
			mountedRef.current = true;
			return;
		}
		const nextRadius = latestResetZoomTargetRef.current(latestInitialTargetRef.current);
		camera.position.set(0, 0, nextRadius);
		camera.lookAt(0, 0, 0);
		camera.updateMatrixWorld();
	}, [camera, zoomResetKey]);
	const { isPinchingRef, isTouchRotatingRef, effectiveDraggingRef, lastMouseMoveTsRef, applyRotationFrame } = useRotation({
		groupRef,
		useDesktopLayout,
		isTabletLike,
		minRadius,
		maxRadius,
		radius,
		markActivity,
		gestureRef,
		dotPositions
	});
	usePixelOffsets({
		groupRef,
		camera,
		domElement: gl.domElement,
		radius,
		xOffset,
		yOffset,
		xOffsetPx,
		yOffsetPx
	});
	useFrame(() => {
		camera.position.set(0, 0, radius);
		camera.lookAt(0, 0, 0);
	}, -100);
	useFrame((_, delta) => {
		applyRotationFrame({
			idleActive: isIdleWrapped({
				userInteracting: !!effectiveDraggingRef.current || !!isTouchRotatingRef.current || !!isPinchingRef.current,
				hasInteractedRef,
				lastActivityRef
			}),
			delta
		});
	});
	const lastRotEvtRef = useRef({
		x: 0,
		y: 0,
		t: 0
	});
	useFrame(() => {
		if (!groupRef.current) return;
		const now2 = performance.now();
		const rx = groupRef.current.rotation.x;
		const ry = groupRef.current.rotation.y;
		if (Math.abs(rx - lastRotEvtRef.current.x) + Math.abs(ry - lastRotEvtRef.current.y) > .002 && now2 - lastRotEvtRef.current.t > 120) {
			lastRotEvtRef.current = {
				x: rx,
				y: ry,
				t: now2
			};
			window.dispatchEvent(new CustomEvent(ROTATE_EVT, { detail: {
				rx,
				ry,
				source: useDesktopLayout ? "desktop" : "touch"
			} }));
		}
	});
	return {
		groupRef,
		radius,
		isPinchingRef,
		isTouchRotatingRef,
		minRadius,
		maxRadius,
		setZoomTarget,
		zoomTargetRef
	};
}
//#endregion
//#region src/graph-runtime/dotgraph/utils/positions.ts
var TAU = Math.PI * 2;
var OUTER_CLUSTER_MIN_CAPACITY = 90;
var OUTER_CLUSTER_FULL_CAPACITY = 300;
var OUTER_CLUSTER_COUNT = 9;
var clamp01 = (v) => Math.max(0, Math.min(1, v));
var lerp = (a, b, t) => a + (b - a) * t;
var smoothstep = (t) => {
	const x = clamp01(t);
	return x * x * (3 - 2 * x);
};
var hash01 = (seed) => {
	const x = Math.sin(seed * 12.9898) * 43758.5453123;
	return x - Math.floor(x);
};
var normalizeVec = (v) => {
	const len = Math.hypot(v[0], v[1], v[2]) || 1;
	return [
		v[0] / len,
		v[1] / len,
		v[2] / len
	];
};
var rotateVec = (v, rot) => {
	const [x0, y0, z0] = v;
	const yaw = rot?.yaw ?? 0;
	const pitch = rot?.pitch ?? 0;
	const roll = rot?.roll ?? 0;
	const cy = Math.cos(yaw), sy = Math.sin(yaw);
	const cp = Math.cos(pitch), sp = Math.sin(pitch);
	const cr = Math.cos(roll), sr = Math.sin(roll);
	const y1 = y0 * cr - z0 * sr;
	const z1 = y0 * sr + z0 * cr;
	const x1 = x0;
	const x2 = x1 * cp + z1 * sp;
	const y2 = y1;
	const z2 = -x1 * sp + z1 * cp;
	return [
		x2 * cy - y2 * sy,
		x2 * sy + y2 * cy,
		z2
	];
};
var radicalInverseVdc = (index) => {
	let bits = index >>> 0;
	bits = bits << 16 | bits >>> 16;
	bits = (bits & 1431655765) << 1 | (bits & 2863311530) >>> 1;
	bits = (bits & 858993459) << 2 | (bits & 3435973836) >>> 2;
	bits = (bits & 252645135) << 4 | (bits & 4042322160) >>> 4;
	bits = (bits & 16711935) << 8 | (bits & 4278255360) >>> 8;
	return (bits >>> 0) * 23283064365386963e-26;
};
var progressiveSphereDirections = (n, rot) => {
	if (n <= 0) return [];
	const dirs = new Array(n);
	const golden = (1 + Math.sqrt(5)) / 2;
	const ga = TAU / (golden * golden);
	for (let i = 0; i < n; i++) {
		const y = 1 - 2 * radicalInverseVdc(i + 1);
		const r = Math.sqrt(Math.max(0, 1 - y * y));
		const theta = ga * i;
		const v = [
			r * Math.cos(theta),
			y,
			r * Math.sin(theta)
		];
		dirs[i] = rot ? rotateVec(v, rot) : v;
	}
	return dirs;
};
var mulberry32 = (seed) => {
	let t = seed >>> 0;
	return () => {
		t += 1831565813;
		let r = Math.imul(t ^ t >>> 15, 1 | t);
		r ^= r + Math.imul(r ^ r >>> 7, 61 | r);
		return ((r ^ r >>> 14) >>> 0) / 4294967296;
	};
};
var tangentBasis = (n) => {
	const [nx, ny, nz] = n;
	const up = Math.abs(nz) < .9 ? [
		0,
		0,
		1
	] : [
		0,
		1,
		0
	];
	let ux = up[1] * nz - up[2] * ny;
	let uy = up[2] * nx - up[0] * nz;
	let uz = up[0] * ny - up[1] * nx;
	const len = Math.hypot(ux, uy, uz) || 1;
	ux /= len;
	uy /= len;
	uz /= len;
	const vx = ny * uz - nz * uy;
	const vy = nz * ux - nx * uz;
	const vz = nx * uy - ny * ux;
	return [[
		ux,
		uy,
		uz
	], [
		vx,
		vy,
		vz
	]];
};
var gridKey = (i, j, k) => `${String(i)},${String(j)},${String(k)}`;
var cellIndex = (p, cs) => [
	Math.floor(p[0] / cs),
	Math.floor(p[1] / cs),
	Math.floor(p[2] / cs)
];
function nearestDirectionIndex(direction, centers) {
	let bestIndex = 0;
	let bestDot = -Infinity;
	for (let i = 0; i < centers.length; i += 1) {
		const center = centers[i];
		const dot = direction[0] * center[0] + direction[1] * center[1] + direction[2] * center[2];
		if (dot > bestDot) {
			bestDot = dot;
			bestIndex = i;
		}
	}
	return bestIndex;
}
function organicAttractor(direction, centers, seed, index) {
	if (!centers.length) return {
		direction,
		strength: 0,
		regionIndex: 0
	};
	const regionIndex = nearestDirectionIndex(direction, centers);
	let wx = direction[0] * .18;
	let wy = direction[1] * .18;
	let wz = direction[2] * .18;
	let weightTotal = .18;
	for (let i = 0; i < centers.length; i += 1) {
		const center = centers[i];
		const dot = direction[0] * center[0] + direction[1] * center[1] + direction[2] * center[2];
		const threshold = .08 + hash01(seed + i * 31.7) * .24;
		const width = .56 + hash01(seed + i * 43.3) * .22;
		const raw = smoothstep((dot - threshold) / width);
		if (raw <= 0) continue;
		const lobeWeight = Math.pow(raw, 1.35 + hash01(seed + i * 59.1) * 1.2);
		wx += center[0] * lobeWeight;
		wy += center[1] * lobeWeight;
		wz += center[2] * lobeWeight;
		weightTotal += lobeWeight;
	}
	const blended = normalizeVec([
		wx / weightTotal,
		wy / weightTotal,
		wz / weightTotal
	]);
	const [tangentX, tangentY] = tangentBasis(blended);
	const flowAngle = hash01(seed + index * 17.13) * TAU + hash01(seed + regionIndex * 113.9) * TAU;
	const flowRadius = (hash01(seed + index * 23.71) - .5) * (.18 + hash01(seed + regionIndex * 97.5) * .18);
	return {
		direction: normalizeVec([
			blended[0] + tangentX[0] * Math.cos(flowAngle) * flowRadius + tangentY[0] * Math.sin(flowAngle) * flowRadius,
			blended[1] + tangentX[1] * Math.cos(flowAngle) * flowRadius + tangentY[1] * Math.sin(flowAngle) * flowRadius,
			blended[2] + tangentX[2] * Math.cos(flowAngle) * flowRadius + tangentY[2] * Math.sin(flowAngle) * flowRadius
		]),
		strength: clamp01((weightTotal - .18) / 2.6),
		regionIndex
	};
}
function outerClusterT(index, total) {
	if (total < OUTER_CLUSTER_MIN_CAPACITY) return 0;
	const slotT = total <= 1 ? 0 : index / (total - 1);
	return clamp01(smoothstep((total - OUTER_CLUSTER_MIN_CAPACITY) / (OUTER_CLUSTER_FULL_CAPACITY - OUTER_CLUSTER_MIN_CAPACITY)) * Math.pow(slotT, 1.12));
}
/**
* Generate near-uniform 3D positions centered at the origin.
*/
var generatePositions = (numPoints, minDistance = 2.5, spreadOverride, opts = {}) => {
	const n = Math.max(0, numPoints | 0);
	if (n === 0) return [];
	const baseRadius = opts.baseRadius ?? 10;
	const densityK = opts.densityK ?? 6;
	const maxRadiusCap = opts.maxRadiusCap ?? 180;
	const yaw = opts.yaw ?? 0;
	const pitch = opts.pitch ?? 0;
	const roll = opts.roll ?? 0;
	const jitterAmp = opts.jitterAmp ?? .25;
	const relaxPasses = opts.relaxPasses ?? (n > 3e3 ? 0 : 1);
	const relaxStrength = opts.relaxStrength ?? .7;
	const seed = opts.seed ?? 1337;
	const tightRefN = opts.tightRefN ?? 24;
	const baseRadiusTight = opts.baseRadiusTight ?? Math.max(.5 * minDistance, .5);
	const tightMaxAlpha = opts.tightMaxAlpha ?? .85;
	const tightCurve = opts.tightCurve ?? 1.25;
	const tightT = Math.pow(clamp01(1 - n / tightRefN), tightCurve);
	const adaptiveMaxR = lerp(baseRadius, baseRadiusTight, tightT) + densityK * minDistance * Math.cbrt(n);
	const maxR = Math.min(maxRadiusCap, spreadOverride ?? adaptiveMaxR);
	const dirs = progressiveSphereDirections(n, {
		yaw,
		pitch,
		roll
	});
	const outerClusterCenters = n >= OUTER_CLUSTER_MIN_CAPACITY ? progressiveSphereDirections(OUTER_CLUSTER_COUNT, {
		yaw: yaw + hash01(seed + 17) * TAU,
		pitch: pitch + (hash01(seed + 29) - .5) * .65,
		roll: roll + (hash01(seed + 41) - .5) * .65
	}) : [];
	const alpha = lerp(.5, tightMaxAlpha, tightT);
	const rand = mulberry32(seed);
	const pts = new Array(n);
	for (let i = 0; i < n; i++) {
		const u = (i + .5) / n;
		const outerT = outerClusterT(i, n);
		let r = maxR * Math.pow(u, alpha);
		let d = dirs[i];
		if (outerT > 0 && outerClusterCenters.length) {
			const easedOuterT = smoothstep(Math.pow(outerT, .8));
			const organic = organicAttractor(d, outerClusterCenters, seed, i);
			const pull = easedOuterT * organic.strength * (.42 + hash01(seed + i * 107.19) * .38);
			d = normalizeVec([
				d[0] * (1 - pull) + organic.direction[0] * pull,
				d[1] * (1 - pull) + organic.direction[1] * pull,
				d[2] * (1 - pull) + organic.direction[2] * pull
			]);
			const localR = maxR * (.58 + hash01(seed + organic.regionIndex * 193.23) * .52) * (.86 + hash01(seed + i * 131.47) * .28);
			r = lerp(r, Math.min(maxR * 1.08, localR), easedOuterT * organic.strength * .68);
		}
		const [t1, t2] = tangentBasis(d);
		const j1 = (rand() - .5) * 2;
		const j2 = (rand() - .5) * 2;
		const jScale = jitterAmp * minDistance * (1 + outerT * (3.2 + hash01(seed + i * 97.11) * 2.4));
		const jx = t1[0] * j1 * jScale + t2[0] * j2 * jScale;
		const jy = t1[1] * j1 * jScale + t2[1] * j2 * jScale;
		const jz = t1[2] * j1 * jScale + t2[2] * j2 * jScale;
		pts[i] = [
			d[0] * r + jx,
			d[1] * r + jy,
			d[2] * r + jz
		];
	}
	if (relaxPasses <= 0 || minDistance <= 0) return pts;
	const cellSize = Math.max(1e-6, minDistance);
	const nbr = [
		-1,
		0,
		1
	];
	for (let pass = 0; pass < relaxPasses; pass++) {
		const grid = /* @__PURE__ */ new Map();
		for (let i = 0; i < n; i++) {
			const c = cellIndex(pts[i], cellSize);
			const k = gridKey(c[0], c[1], c[2]);
			let arr = grid.get(k);
			if (!arr) {
				arr = [];
				grid.set(k, arr);
			}
			arr.push(i);
		}
		for (let i = 0; i < n; i++) {
			const pi = pts[i];
			const ci = cellIndex(pi, cellSize);
			let px = 0, py = 0, pz = 0, cnt = 0;
			for (const dx of nbr) for (const dy of nbr) for (const dz of nbr) {
				const k = gridKey(ci[0] + dx, ci[1] + dy, ci[2] + dz);
				const bucket = grid.get(k);
				if (!bucket) continue;
				for (const j of bucket) {
					if (j === i) continue;
					const pj = pts[j];
					const rx = pi[0] - pj[0], ry = pi[1] - pj[1], rz = pi[2] - pj[2];
					const d2 = rx * rx + ry * ry + rz * rz;
					if (d2 > 1e-12 && d2 < minDistance * minDistance) {
						const d = Math.sqrt(d2);
						const overlap = minDistance - d;
						if (overlap > 0) {
							const ux = rx / d, uy = ry / d, uz = rz / d;
							px += ux * overlap * .5;
							py += uy * overlap * .5;
							pz += uz * overlap * .5;
							cnt++;
						}
					}
				}
			}
			if (cnt > 0) {
				pi[0] += px / cnt * relaxStrength;
				pi[1] += py / cnt * relaxStrength;
				pi[2] += pz / cnt * relaxStrength;
				const rNow = Math.hypot(pi[0], pi[1], pi[2]);
				if (rNow > maxR) {
					const k = maxR / rNow;
					pi[0] *= k;
					pi[1] *= k;
					pi[2] *= k;
				}
			}
		}
	}
	return pts;
};
//#endregion
//#region src/graph-runtime/dotgraph/utils/dotPoints.ts
var defaultColorForAverage = (avg) => rgbString(sampleStops(avg));
var hashFromString = (value) => {
	let h = 2166136261;
	for (let i = 0; i < value.length; i += 1) {
		h ^= value.charCodeAt(i);
		h = Math.imul(h, 16777619);
	}
	return h >>> 0;
};
var hashUnit = (seed) => {
	const x = Math.sin(seed * 12.9898) * 43758.5453123;
	return x - Math.floor(x);
};
var computeLocalAvg = (response) => {
	const w = response.weights;
	if (!w) return void 0;
	const vals = Object.values(w).filter((x) => Number.isFinite(x));
	if (!vals.length) return void 0;
	return vals.reduce((a, b) => a + b, 0) / vals.length;
};
function normalizedSlotIndex(response, fallbackIndex) {
	const slotIndex = response.__dotSlotIndex;
	return typeof slotIndex === "number" && Number.isFinite(slotIndex) && slotIndex >= 0 ? Math.floor(slotIndex) : fallbackIndex;
}
function resolvePositionCapacity(data) {
	let capacity = data.length;
	for (let i = 0; i < data.length; i += 1) {
		const response = data[i];
		const slotIndex = normalizedSlotIndex(response, i);
		capacity = Math.max(capacity, slotIndex + 1);
		if (typeof response.__dotSlotCapacity === "number" && Number.isFinite(response.__dotSlotCapacity)) capacity = Math.max(capacity, Math.floor(response.__dotSlotCapacity));
	}
	return Math.max(0, capacity);
}
function computeDotPoints(data, opts = {}) {
	const safe = Array.isArray(data) ? data : [];
	if (safe.length === 0) return [];
	const { colorForAverage = defaultColorForAverage, personalizedEntryId, showPersonalized = false, minDistance = 2.5, spreadOverride, baseRadius, densityK, maxRadiusCap, yaw, pitch, roll, jitterAmp, relaxPasses, relaxStrength, seed, tightRefN, baseRadiusTight, tightMaxAlpha, tightCurve } = opts;
	const base = generatePositions(resolvePositionCapacity(safe), minDistance, spreadOverride, {
		baseRadius,
		densityK,
		maxRadiusCap,
		yaw,
		pitch,
		roll,
		jitterAmp,
		relaxPasses,
		relaxStrength,
		seed,
		tightRefN,
		baseRadiusTight,
		tightMaxAlpha,
		tightCurve
	});
	const pts = safe.map((response, i) => {
		const rawAvg = typeof response.avgWeight === "number" && Number.isFinite(response.avgWeight) ? response.avgWeight : computeLocalAvg(response);
		const avg = typeof rawAvg === "number" && Number.isFinite(rawAvg) ? rawAvg : .5;
		const pos = base[normalizedSlotIndex(response, i)];
		return {
			position: pos,
			originalPosition: pos,
			color: colorForAverage(avg),
			averageWeight: avg,
			_id: response._id
		};
	});
	if (showPersonalized && personalizedEntryId) {
		const mine = pts.find((p) => p._id === personalizedEntryId);
		if (mine) {
			mine.position = [
				0,
				0,
				0
			];
			mine.originalPosition = [
				0,
				0,
				0
			];
			const CLEAR_RADIUS = 22;
			const FRONT_CORRIDOR_RADIUS = 26;
			for (const pt of pts) {
				if (pt._id === personalizedEntryId) continue;
				const [x, y, z] = pt.position;
				const dist = Math.hypot(x, y, z);
				if (dist < CLEAR_RADIUS) {
					const scale = dist < .001 ? 1 : CLEAR_RADIUS / dist;
					const pushed = [
						x * scale,
						y * scale,
						z * scale
					];
					pt.position = pushed;
					pt.originalPosition = pushed;
				}
				if (pt.position[2] > 0) {
					const [px, py, pz] = pt.position;
					const planarDist = Math.hypot(px, py);
					if (planarDist < FRONT_CORRIDOR_RADIUS) {
						const fallbackAngle = hashUnit(hashFromString(pt._id ?? `${String(px)}:${String(py)}:${String(pz)}`)) * Math.PI * 2;
						const dirX = planarDist < .001 ? Math.cos(fallbackAngle) : px / planarDist;
						const dirY = planarDist < .001 ? Math.sin(fallbackAngle) : py / planarDist;
						const pushed = [
							dirX * FRONT_CORRIDOR_RADIUS,
							dirY * FRONT_CORRIDOR_RADIUS,
							pz
						];
						pt.position = pushed;
						pt.originalPosition = pushed;
					}
				}
			}
		}
	}
	return pts;
}
//#endregion
//#region src/graph-runtime/dotgraph/scene/useDotPoints.ts
function useDotPoints(data, opts = {}) {
	return useMemo(() => computeDotPoints(data, opts), [data, opts]);
}
//#endregion
//#region src/graph-runtime/dotgraph/utils/math.ts
var nonlinearLerp = (start, end, t) => {
	const eased = 1 - Math.pow(1 - t, 5);
	return start + (end - start) * eased;
};
//#endregion
//#region src/graph-runtime/dotgraph/scene/useDotGraphSceneState.ts
var MOBILE_PANEL_X_OFFSET_PX = -200;
var SOLO_MOBILE_PANEL_EXTRA_X_OFFSET_PX = -60;
var GRAPH_MIN_RADIUS_MOBILE = 2;
var GRAPH_MIN_RADIUS_DESKTOP = 20;
var GRAPH_MAX_RADIUS_TOUCH = 800;
var GRAPH_MAX_RADIUS_DESKTOP = 600;
var PERSONALIZED_MAX_ZOOM_FRACTION_DESKTOP = .965;
var PERSONALIZED_INITIAL_ZOOM_FRACTION_DESKTOP = .92;
var PERSONALIZED_MAX_ZOOM_FRACTION_TABLET_1_TILE = .965;
var PERSONALIZED_MAX_ZOOM_FRACTION_TABLET_2_TILE = .92;
var PERSONALIZED_MAX_ZOOM_FRACTION_TABLET_3_TILE = .89;
var PERSONALIZED_MAX_ZOOM_FRACTION_PHONE_1_TILE = .92;
var PERSONALIZED_MAX_ZOOM_FRACTION_PHONE_2_TILE = .83;
var PERSONALIZED_MAX_ZOOM_FRACTION_PHONE_3_TILE = .74;
var DOTGRAPH_BAG_SEED = "dotgraph-bag-v1";
var TILE_SIZE_ZOOM_SETTLE_MS = 220;
function resolvePersonalizedMaxZoomFraction({ isRealMobile, isSmallScreen, isTabletLike, tileWidth }) {
	const width = Math.max(1, Math.round(tileWidth));
	if (isRealMobile || isSmallScreen) {
		if (width >= 3) return PERSONALIZED_MAX_ZOOM_FRACTION_PHONE_3_TILE;
		if (width >= 2) return PERSONALIZED_MAX_ZOOM_FRACTION_PHONE_2_TILE;
		return PERSONALIZED_MAX_ZOOM_FRACTION_PHONE_1_TILE;
	}
	if (isTabletLike) {
		if (width >= 3) return PERSONALIZED_MAX_ZOOM_FRACTION_TABLET_3_TILE;
		if (width >= 2) return PERSONALIZED_MAX_ZOOM_FRACTION_TABLET_2_TILE;
		return PERSONALIZED_MAX_ZOOM_FRACTION_TABLET_1_TILE;
	}
	return PERSONALIZED_MAX_ZOOM_FRACTION_DESKTOP;
}
function resolvePersonalizedInitialZoomFraction({ isRealMobile, isSmallScreen, isTabletLike, tileWidth }) {
	const width = Math.max(1, Math.round(tileWidth));
	if (isRealMobile || isSmallScreen) {
		if (width >= 3) return PERSONALIZED_MAX_ZOOM_FRACTION_PHONE_3_TILE;
		if (width >= 2) return PERSONALIZED_MAX_ZOOM_FRACTION_PHONE_2_TILE;
		return PERSONALIZED_MAX_ZOOM_FRACTION_PHONE_1_TILE;
	}
	if (isTabletLike) {
		if (width >= 3) return PERSONALIZED_MAX_ZOOM_FRACTION_TABLET_3_TILE;
		if (width >= 2) return PERSONALIZED_MAX_ZOOM_FRACTION_TABLET_2_TILE;
		return PERSONALIZED_MAX_ZOOM_FRACTION_TABLET_1_TILE;
	}
	return PERSONALIZED_INITIAL_ZOOM_FRACTION_DESKTOP;
}
function resolvePersonalizedSpriteTileWidth({ safeData, personalizedEntryId, sectionKey }) {
	if (!personalizedEntryId) return 1;
	const index = safeData.findIndex((entry) => entry._id === personalizedEntryId);
	const entry = index >= 0 ? safeData[index] : null;
	if (!entry) return 1;
	return resolveSpriteVisual({
		entryId: personalizedEntryId,
		sectionKey,
		avg: Number.isFinite(entry.avgWeight) ? Number(entry.avgWeight) : .5,
		seed: DOTGRAPH_BAG_SEED,
		orderIndex: Math.max(0, index),
		baseScale: 1
	}).layout.footprint.w;
}
function minRadiusForZoomFraction({ baseMinRadius, maxRadius, maxZoomFraction }) {
	return maxRadius - Math.max(0, Math.min(1, maxZoomFraction)) * (maxRadius - baseMinRadius);
}
function useDotGraphSceneState({ safeData, personalizedEntryId, sectionKey, showPersonalized, darkMode, wantsSkew, wantsSoloSkew, zoomResetKey }) {
	const isRealMobile = useRealMobileViewport();
	const windowWidth = useWindowWidth();
	const ui = useOptionalUiFlow();
	const isSmallScreen = isMobileWidth(windowWidth);
	const isTabletLike = isTabletWidth(windowWidth);
	const useDesktopLayout = !(isSmallScreen || isRealMobile || isTabletLike);
	const logsOpen = Boolean(ui?.logsOpen);
	const widgetsOpen = Boolean(ui?.widgetsOpen);
	const graphNavOffsetPx = desktopGraphToolsOffsetPx(windowWidth, logsOpen, widgetsOpen);
	const tabletNavYOffsetPx = tabletGraphToolsYOffsetPx(windowWidth, logsOpen, widgetsOpen);
	const mobilePanelOffsetPx = wantsSkew ? MOBILE_PANEL_X_OFFSET_PX : 0;
	const soloPanelOffsetPx = wantsSoloSkew ? SOLO_MOBILE_PANEL_EXTRA_X_OFFSET_PX : 0;
	const baseMinRadius = isSmallScreen ? GRAPH_MIN_RADIUS_MOBILE : GRAPH_MIN_RADIUS_DESKTOP;
	const maxRadiusLimit = useDesktopLayout ? GRAPH_MAX_RADIUS_DESKTOP : GRAPH_MAX_RADIUS_TOUCH;
	const personalizedSpriteTileWidth = useMemo(() => resolvePersonalizedSpriteTileWidth({
		safeData,
		personalizedEntryId,
		sectionKey
	}), [
		personalizedEntryId,
		safeData,
		sectionKey
	]);
	const personalizedZoomCap = resolvePersonalizedMaxZoomFraction({
		isRealMobile,
		isSmallScreen,
		isTabletLike,
		tileWidth: personalizedSpriteTileWidth
	});
	const personalizedInitialZoomFraction = resolvePersonalizedInitialZoomFraction({
		isRealMobile,
		isSmallScreen,
		isTabletLike,
		tileWidth: personalizedSpriteTileWidth
	});
	const orbitMinRadius = showPersonalized && personalizedEntryId ? minRadiusForZoomFraction({
		baseMinRadius,
		maxRadius: maxRadiusLimit,
		maxZoomFraction: personalizedZoomCap
	}) : baseMinRadius;
	const spread = useMemo(() => {
		const n = safeData.length;
		const MIN_SPREAD = 28;
		const MAX_SPREAD = 220;
		const t = n <= 1 ? 0 : Math.min(1, Math.pow(n / 50, .5));
		return MIN_SPREAD + (MAX_SPREAD - MIN_SPREAD) * t;
	}, [safeData.length]);
	const colorForAverage = useMemo(() => (avg) => rgbString(sampleStops(avg)), []);
	const shapes = useDotPoints(safeData, useMemo(() => {
		return {
			spreadOverride: spread,
			minDistance: 2.1,
			seed: 1337,
			relaxPasses: 1,
			relaxStrength: .25,
			colorForAverage,
			personalizedEntryId,
			showPersonalized
		};
	}, [
		spread,
		colorForAverage,
		personalizedEntryId,
		showPersonalized
	]));
	const dotPositions = useMemo(() => shapes.map((s) => s.position), [shapes]);
	const { groupRef, radius, isPinchingRef, isTouchRotatingRef, minRadius, maxRadius, zoomTargetRef } = useOrbitController({
		layout: {
			useDesktopLayout,
			isSmallScreen,
			isTabletLike,
			xOffset: 0,
			yOffset: 0,
			xOffsetPx: mobilePanelOffsetPx + soloPanelOffsetPx + graphNavOffsetPx,
			yOffsetPx: (wantsSkew ? 12 : 0) + tabletNavYOffsetPx
		},
		bounds: {
			minRadius: orbitMinRadius,
			maxRadius: maxRadiusLimit
		},
		dataCount: safeData.length,
		dotPositions,
		initialZoomFraction: showPersonalized && personalizedEntryId ? personalizedInitialZoomFraction : void 0,
		zoomResetKey
	});
	const bagSeed = DOTGRAPH_BAG_SEED;
	const particleFrames = isRealMobile ? 60 : 219;
	const desiredTileSize = chooseCameraSpriteTileSize({
		radius,
		minRadius,
		maxRadius,
		isRealMobile,
		isTabletLike
	});
	const [tileSize, setTileSize] = useState(desiredTileSize);
	useEffect(() => {
		if (tileSize === desiredTileSize) return;
		if (zoomTargetRef.current != null) return;
		const timer = setTimeout(() => {
			bumpZoomMetric("tileSizeUpdates");
			setTileSize(desiredTileSize);
		}, TILE_SIZE_ZOOM_SETTLE_MS);
		return () => {
			clearTimeout(timer);
		};
	}, [
		desiredTileSize,
		tileSize,
		zoomTargetRef
	]);
	const prewarmLimit = isRealMobile ? 30 : shapes.length;
	const prewarmItems = useMemo(() => shapes.slice(0, prewarmLimit).map((shape, i) => ({
		avg: Number.isFinite(shape.averageWeight) ? shape.averageWeight : .5,
		orderIndex: i,
		seed: bagSeed
	})), [
		shapes,
		prewarmLimit,
		bagSeed
	]);
	useEffect(() => {
		if (!prewarmItems.length) return;
		prewarmSpriteTextures(prewarmItems, {
			tileSize,
			darkMode,
			particleFrames,
			particleStepMs: 33
		});
	}, [
		prewarmItems,
		tileSize,
		darkMode,
		particleFrames
	]);
	return {
		isSmallScreen,
		isRealMobile,
		isTabletLike,
		useDesktopLayout,
		groupRef,
		radius,
		isPinchingRef,
		isTouchRotatingRef,
		minRadius,
		maxRadius,
		zoomTargetRef,
		shapes,
		posById: useMemo(() => {
			const map = /* @__PURE__ */ new Map();
			for (const shape of shapes) if (shape._id) map.set(shape._id, shape.position);
			return map;
		}, [shapes]),
		spriteScale: useMemo(() => {
			const denom = Math.max(1e-6, maxRadius - minRadius);
			const tRaw = Math.max(0, Math.min(1, (radius - minRadius) / denom));
			return nonlinearLerp(13.5, 8, Math.round(tRaw * 32) / 32);
		}, [
			radius,
			minRadius,
			maxRadius
		]),
		bagSeed,
		particleFrames,
		tileSize
	};
}
//#endregion
//#region src/graph-runtime/dotgraph/scene/usePersonalizationState.ts
function usePersonalizationState({ personalizedEntryId, sectionKey: _sectionKey, bagSeed, shapes, dataById, showCompleteUI, mode, getRelForId, getRelForValue, getAbsForId, getAbsForValue, fullData, shouldShowPersonalized, statsLoading, darkMode }) {
	const myShape = useMemo(() => shapes.find((shape) => shape._id === personalizedEntryId), [shapes, personalizedEntryId]);
	const myShapeIndex = useMemo(() => shapes.findIndex((shape) => shape._id === personalizedEntryId), [shapes, personalizedEntryId]);
	const myEntry = useMemo(() => personalizedEntryId ? dataById.get(personalizedEntryId) ?? null : null, [dataById, personalizedEntryId]);
	const ui = useOptionalUiFlow();
	const mySnapshot = useMemo(() => {
		if (myEntry) return null;
		try {
			const raw = getSessionItem("be.myDoc");
			return raw ? JSON.parse(raw) : null;
		} catch {
			return null;
		}
	}, [myEntry]);
	const effectiveMyEntry = myEntry ?? mySnapshot;
	const fallbackColor = useMemo(() => {
		const avg = Number(effectiveMyEntry?.avgWeight);
		if (!Number.isFinite(avg)) return "#ffffff";
		return rgbString(sampleStops(avg));
	}, [effectiveMyEntry]);
	const effectiveMyShape = myShape ?? (effectiveMyEntry ? {
		position: [
			0,
			0,
			0
		],
		color: fallbackColor
	} : null);
	const personalSprite = useMemo(() => {
		if (!effectiveMyEntry) return null;
		const entryId = effectiveMyEntry._id ?? personalizedEntryId;
		if (!entryId) return null;
		const entryAvg = Number(effectiveMyEntry.avgWeight);
		const shapeAvg = Number(myShape?.averageWeight);
		const visual = resolveSpriteVisual({
			entryId,
			sectionKey: entryId,
			avg: Number.isFinite(entryAvg) ? entryAvg : Number.isFinite(shapeAvg) ? shapeAvg : .5,
			seed: bagSeed,
			orderIndex: myShapeIndex >= 0 ? myShapeIndex : 0,
			baseScale: 1
		});
		if (!visual.assignment) return null;
		return {
			assignment: visual.assignment,
			identity: resolveSpriteIdentity(visual.assignment, { darkMode })
		};
	}, [
		bagSeed,
		darkMode,
		effectiveMyEntry,
		myShape?.averageWeight,
		myShapeIndex,
		personalizedEntryId
	]);
	const myDisplayValue = useMemo(() => {
		if (!(showCompleteUI && effectiveMyEntry)) return 0;
		if (myEntry?._id) return mode === "relative" ? getRelForId(myEntry._id) : getAbsForId(myEntry._id);
		const avg = Number(effectiveMyEntry.avgWeight);
		if (!Number.isFinite(avg)) return 0;
		try {
			return mode === "relative" ? Math.round(getRelForValue(avg)) : Math.round(getAbsForValue(avg));
		} catch {
			return 0;
		}
	}, [
		showCompleteUI,
		effectiveMyEntry,
		myEntry,
		mode,
		getRelForId,
		getAbsForId,
		getRelForValue,
		getAbsForValue
	]);
	const myScoreValue = useMemo(() => {
		if (!effectiveMyEntry) return 0;
		return Math.round(avgWeightOf(effectiveMyEntry) * 100);
	}, [effectiveMyEntry]);
	const groupAverageValue = useMemo(() => {
		if (!fullData.length) return 0;
		const total = fullData.reduce((sum, entry) => sum + avgWeightOf(entry), 0);
		return Math.round(total / fullData.length * 100);
	}, [fullData]);
	const myStats = effectiveMyEntry && myEntry?._id ? getTieStats({
		data: fullData,
		targetId: myEntry._id
	}) : {
		below: 0,
		equal: 0,
		above: 0,
		totalOthers: 0
	};
	const shouldRenderPersonalUI = showCompleteUI && shouldShowPersonalized && !!effectiveMyShape && !!effectiveMyEntry;
	const shouldShowStatsLoading = shouldRenderPersonalUI && (statsLoading || !myEntry?._id);
	const shouldRenderExtraPersonalSprite = shouldRenderPersonalUI;
	useEffect(() => {
		if (!(getSessionItem("be.openPersonalOnNext") === "1")) return;
		if (!shouldRenderPersonalUI) return;
		removeSessionItems(["be.openPersonalOnNext"]);
		ui?.setOpenPersonalized(true);
	}, [shouldRenderPersonalUI, ui]);
	return {
		myEntry,
		effectiveMyEntry,
		effectiveMyShape,
		personalSpriteAssignment: personalSprite?.assignment,
		personalSpriteIdentity: personalSprite?.identity,
		myDisplayValue,
		myScoreValue,
		groupAverageValue,
		myStats,
		shouldShowStatsLoading,
		shouldRenderPersonalUI,
		shouldRenderExtraPersonalSprite
	};
}
//#endregion
//#region src/graph-runtime/dotgraph/scene.tsx
function DotGraph() {
	const { darkMode } = usePreferences();
	const { observerMode, mode, setPersonalPanelOpen } = useUiFlow();
	const { myEntryId, mySection } = useIdentity();
	const { section, data: fullSurveyData, loading } = useSurveyData();
	const { safeData, dataById, getRelForId, getRelForValue, getAbsForId, getAbsForValue, absScoreById: absScoreByIdMap } = useSharedGraphData();
	const showCompleteUI = useObserverDelay(observerMode, 2e3);
	const personalizationGate = usePersonalizationGate({
		myEntryId,
		mySection,
		section,
		safeData,
		observerMode,
		isSmallScreen: isMobileWidth(typeof window === "undefined" ? DEFAULT_VIEWPORT_WIDTH : window.innerWidth)
	});
	useEffect(() => {
		setPersonalPanelOpen(personalizationGate.personalOpen);
	}, [personalizationGate.personalOpen, setPersonalPanelOpen]);
	const isPersonalizedGraphView = personalizationGate.hasPersonalizedInDataset && personalizationGate.shouldShowPersonalized;
	const showPersonalizedForZoom = observerMode ? isPersonalizedGraphView : !!personalizationGate.personalizedEntryId && personalizationGate.shouldShowPersonalized;
	const graphViewKey = useMemo(() => [section, !observerMode && personalizationGate.personalizedEntryId && personalizationGate.shouldShowPersonalized ? "personalized" : isPersonalizedGraphView ? personalizationGate.personalizedEntryId ?? "personalized" : "general"].join("|"), [
		isPersonalizedGraphView,
		observerMode,
		personalizationGate.personalizedEntryId,
		personalizationGate.shouldShowPersonalized,
		section
	]);
	const { groupRef, shapes, useDesktopLayout, isPinchingRef, isTouchRotatingRef, spriteScale, bagSeed, isRealMobile, isTabletLike, particleFrames, tileSize, radius, minRadius, maxRadius, zoomTargetRef } = useDotGraphSceneState({
		safeData,
		personalizedEntryId: personalizationGate.personalizedEntryId,
		sectionKey: section,
		showPersonalized: showPersonalizedForZoom,
		darkMode,
		wantsSkew: personalizationGate.wantsSkew,
		wantsSoloSkew: mode === "absolute" && personalizationGate.wantsSkew,
		zoomResetKey: graphViewKey
	});
	const zoomFraction = (maxRadius - radius) / Math.max(1, maxRadius - minRadius);
	const shapeHitboxScale = 1;
	const personalization = usePersonalizationState({
		personalizedEntryId: personalizationGate.personalizedEntryId,
		sectionKey: section,
		bagSeed,
		shapes,
		dataById,
		showCompleteUI,
		mode,
		getRelForId,
		getRelForValue,
		getAbsForId,
		getAbsForValue,
		fullData: fullSurveyData,
		shouldShowPersonalized: personalizationGate.shouldShowPersonalized,
		statsLoading: loading,
		darkMode
	});
	const calcValueForAvg = useCallback((averageWeight) => {
		try {
			return mode === "relative" ? getRelForValue(averageWeight) : getAbsForValue(averageWeight);
		} catch {
			return 0;
		}
	}, [
		mode,
		getRelForValue,
		getAbsForValue
	]);
	const { hoveredDot, viewportClass, onHoverStart, onHoverEnd } = useHoverBubble({
		useDesktopLayout,
		isPinchingRef,
		isTouchRotatingRef,
		calcPercentForAvg: calcValueForAvg
	});
	useLayoutEffect(() => {
		bumpGeneration();
		resetQueue();
		onHoverEnd();
	}, [graphViewKey, onHoverEnd]);
	const { spotlightActiveRef } = useObserverSpotlight({
		points: shapes,
		onHoverStart,
		onHoverEnd,
		groupRef,
		excludeId: personalizationGate.personalizedEntryId,
		sectionKey: section,
		bagSeed,
		spriteScale,
		hitboxScale: shapeHitboxScale,
		useDesktopLayout
	});
	useHoverDismissal({
		mode,
		section,
		dataCount: safeData.length,
		useDesktopLayout,
		spotlightActiveRef,
		onHoverEnd
	});
	return /* @__PURE__ */ jsx(Fragment, { children: /* @__PURE__ */ jsxs("group", {
		ref: groupRef,
		children: [
			/* @__PURE__ */ jsx(ShapesLayer, {
				shapes,
				myEntry: personalization.myEntry,
				personalizedEntryId: personalizationGate.personalizedEntryId,
				showCompleteUI,
				onHoverStart,
				onHoverEnd,
				spriteScale,
				bagSeed,
				darkMode,
				occasionalRefreshMs: isRealMobile ? 3600 : isTabletLike ? 2200 : 2e3,
				hitboxScale: shapeHitboxScale,
				particleFrames,
				tileSize,
				section,
				useDesktopLayout,
				zoomTargetRef,
				hidePersonalizedSprite: personalization.shouldRenderPersonalUI
			}),
			/* @__PURE__ */ jsx(PersonalizedLayer, {
				shouldRenderPersonalUI: personalization.shouldRenderPersonalUI,
				shouldRenderExtraPersonalSprite: personalization.shouldRenderExtraPersonalSprite,
				effectiveMyShape: personalization.effectiveMyShape,
				effectiveMyEntry: personalization.effectiveMyEntry,
				personalSpriteAssignment: personalization.personalSpriteAssignment,
				personalSpriteIdentity: personalization.personalSpriteIdentity,
				spriteScale,
				bagSeed,
				myDisplayValue: personalization.myDisplayValue,
				myScoreValue: personalization.myScoreValue,
				groupAverageValue: personalization.groupAverageValue,
				mode,
				myStats: personalization.myStats,
				statsLoading: personalization.shouldShowStatsLoading,
				setPersonalOpen: personalizationGate.setPersonalOpen,
				onPersonalizedPanelEnter: onHoverEnd,
				darkMode,
				zoomFraction,
				particleFrames,
				sectionKey: section,
				hitboxScale: shapeHitboxScale
			}),
			/* @__PURE__ */ jsx(HoveredLayer, {
				hoveredDot,
				shapes,
				safeData,
				mode,
				zoomFraction,
				viewportClass,
				calcValueForAvg,
				getRelForId,
				absScoreById: absScoreByIdMap
			})
		]
	}) });
}
//#endregion
//#region src/graph-runtime/debug/context.ts
function setGraphContextLost(value) {
	if (typeof window === "undefined") return;
	try {
		window.__GP_CTX_LOST = value;
	} catch {}
}
//#endregion
//#region src/graph-runtime/dotgraph/canvas-host.tsx
var isIOS = (() => {
	if (typeof navigator === "undefined") return false;
	const ua = navigator.userAgent;
	const ipadOS13Plus = ua.includes("Macintosh") && navigator.maxTouchPoints > 1;
	return /iPad|iPhone|iPod/.test(ua) || ipadOS13Plus;
})();
var REOPEN_FUSE_MS = isIOS ? 420 : 240;
var VISIBILITY_RESUME_DELAY_MS = 280;
function WebGLCanvas({ lowFidelity, dpr }) {
	const rendererRef = useRef(null);
	useEffect(() => {
		let resumeTimer = null;
		const clearResumeTimer = () => {
			if (!resumeTimer) return;
			clearTimeout(resumeTimer);
			resumeTimer = null;
		};
		const pauseGraphWork = () => {
			clearResumeTimer();
			pauseQueue();
			pauseEpochScheduler();
		};
		const resumeGraphWork = () => {
			clearResumeTimer();
			resumeTimer = setTimeout(() => {
				resumeTimer = null;
				if (typeof document !== "undefined" && document.hidden) return;
				resumeQueue();
				resumeEpochScheduler();
			}, VISIBILITY_RESUME_DELAY_MS);
		};
		const syncVisibility = () => {
			if (typeof document !== "undefined" && document.hidden) pauseGraphWork();
			else resumeGraphWork();
		};
		document.addEventListener("visibilitychange", syncVisibility);
		window.addEventListener("pagehide", pauseGraphWork);
		window.addEventListener("pageshow", resumeGraphWork);
		syncVisibility();
		return () => {
			clearResumeTimer();
			document.removeEventListener("visibilitychange", syncVisibility);
			window.removeEventListener("pagehide", pauseGraphWork);
			window.removeEventListener("pageshow", resumeGraphWork);
			resumeQueue();
			resumeEpochScheduler();
		};
	}, []);
	useEffect(() => {
		bumpGeneration();
		return () => {
			try {
				bumpGeneration();
			} catch {}
		};
	}, []);
	useEffect(() => {
		return () => {
			try {
				resetQueue();
			} catch {}
			try {
				disposeAllSpriteTextures();
			} catch {}
			const renderer = rendererRef.current;
			if (!renderer) return;
			try {
				const el = renderer.domElement;
				if (el.__gp_onLost) {
					el.removeEventListener("webglcontextlost", el.__gp_onLost, false);
					el.__gp_onLost = null;
				}
				if (el.__gp_onRestored) {
					el.removeEventListener("webglcontextrestored", el.__gp_onRestored, false);
					el.__gp_onRestored = null;
				}
				renderer.dispose();
				renderer.getContext().getExtension("WEBGL_lose_context")?.loseContext();
				try {
					setGraphContextLost(true);
				} catch {}
			} catch {}
		};
	}, []);
	return /* @__PURE__ */ jsxs(Canvas, {
		camera: {
			position: [
				0,
				0,
				25
			],
			fov: 40,
			near: .5,
			far: 2e3
		},
		raycaster: { near: .5 },
		dpr,
		shadows: !lowFidelity && !isIOS,
		gl: {
			antialias: !lowFidelity && !isIOS,
			powerPreference: "high-performance",
			stencil: false,
			depth: true,
			alpha: true,
			preserveDrawingBuffer: false,
			toneMapping: ACESFilmicToneMapping,
			outputColorSpace: SRGBColorSpace
		},
		frameloop: "always",
		onCreated: ({ gl }) => {
			rendererRef.current = gl;
			const el = gl.domElement;
			const onLost = (event) => {
				try {
					event.preventDefault();
				} catch {}
				setGraphContextLost(true);
				console.warn("WebGL context lost");
			};
			const onRestored = () => {
				try {
					setGraphContextLost(false);
				} catch {}
				console.warn("WebGL context restored");
			};
			el.__gp_onLost = onLost;
			el.__gp_onRestored = onRestored;
			el.addEventListener("webglcontextlost", onLost, false);
			el.addEventListener("webglcontextrestored", onRestored, false);
		},
		children: [
			/* @__PURE__ */ jsx("ambientLight", { intensity: lowFidelity || isIOS ? 1.4 : 1.6 }),
			/* @__PURE__ */ jsx("directionalLight", {
				position: [
					13,
					13,
					13
				],
				intensity: lowFidelity || isIOS ? .9 : 1.1,
				castShadow: !lowFidelity && !isIOS,
				"shadow-mapSize-width": lowFidelity || isIOS ? 1024 : 2048,
				"shadow-mapSize-height": lowFidelity || isIOS ? 1024 : 2048,
				"shadow-bias": -5e-4
			}),
			/* @__PURE__ */ jsx("spotLight", {
				position: [
					6,
					4,
					8
				],
				intensity: lowFidelity || isIOS ? 3.5 : 4,
				angle: Math.PI / 1,
				distance: 100,
				decay: .4,
				castShadow: !isIOS
			}),
			/* @__PURE__ */ jsx(DotGraph, {}),
			/* @__PURE__ */ jsx(AdaptiveDpr, {}),
			/* @__PURE__ */ jsx(AdaptiveEvents, {}),
			/* @__PURE__ */ jsx(Preload, { all: true })
		]
	});
}
var DotGraphCanvasHost = () => {
	const { vizVisible, logsOpen, widgetsOpen } = useUiFlow();
	const { data: surveyData, loading, section } = useSurveyData();
	const isRealMobile = useRealMobileViewport();
	const windowWidth = typeof window !== "undefined" ? window.innerWidth : DEFAULT_VIEWPORT_WIDTH;
	const emptyStateOffset = desktopGraphToolsOffsetPx(windowWidth, logsOpen, widgetsOpen, typeof window !== "undefined" ? window.innerWidth / window.innerHeight : 1.78);
	const emptyStateTransform = `translateX(${String(emptyStateOffset)}px)`;
	const safeData = surveyData;
	const isNarrow = isMobileWidth(windowWidth);
	const lowFidelity = isRealMobile || isNarrow;
	const dpr = useMemo(() => {
		const max = typeof window !== "undefined" ? window.devicePixelRatio || 1.5 : 1.5;
		const hi = isRealMobile ? Math.min(3, max) : Math.min(2, max);
		return [isRealMobile ? Math.min(1.5, hi) : 1, hi];
	}, [isRealMobile]);
	const [mountVersion, setMountVersion] = useState(0);
	const [canMount, setCanMount] = useState(false);
	const lastCloseAtRef = useRef(0);
	const openTimerRef = useRef(null);
	useEffect(() => {
		if (openTimerRef.current) {
			clearTimeout(openTimerRef.current);
			openTimerRef.current = null;
		}
		if (!vizVisible) {
			lastCloseAtRef.current = performance.now();
			setCanMount(false);
			return;
		}
		const elapsed = performance.now() - lastCloseAtRef.current;
		const wait = Math.max(0, REOPEN_FUSE_MS - Math.max(0, elapsed));
		openTimerRef.current = setTimeout(() => {
			setMountVersion((v) => v + 1);
			setCanMount(true);
		}, wait);
		return () => {
			if (openTimerRef.current) {
				clearTimeout(openTimerRef.current);
				openTimerRef.current = null;
			}
		};
	}, [vizVisible]);
	return /* @__PURE__ */ jsx("div", {
		className: "graph-container",
		style: {
			height: "100svh",
			width: "100%"
		},
		children: !section ? /* @__PURE__ */ jsx("p", {
			className: "graph-loading",
			children: "Pick a section to begin."
		}) : loading ? /* @__PURE__ */ jsx("div", {
			className: "graph-loading",
			"aria-busy": "true",
			"aria-live": "polite",
			style: {
				height: "100%",
				display: "flex",
				alignItems: "center",
				justifyContent: "center"
			},
			children: /* @__PURE__ */ jsx("h3", {
				className: "graph-loading-word",
				style: {
					transform: emptyStateTransform,
					transition: "transform 0.2s ease"
				},
				children: "Loading..."
			})
		}) : safeData.length === 0 ? /* @__PURE__ */ jsx("div", {
			className: "graph-loading",
			style: {
				height: "100%",
				display: "flex",
				alignItems: "center",
				justifyContent: "center"
			},
			children: /* @__PURE__ */ jsx("h3", {
				style: {
					transform: emptyStateTransform,
					transition: "transform 0.2s ease"
				},
				children: "Nothing yet..."
			})
		}) : vizVisible && canMount ? /* @__PURE__ */ jsx(WebGLCanvas, {
			lowFidelity,
			dpr
		}, mountVersion) : null
	});
};
//#endregion
//#region src/graph-runtime/dotgraph/data-boundary.tsx
var MAX_GRAPH_SPRITES = 300;
var MOBILE_DATA_LIMIT = 150;
function withDotSlot(row, slotIndex, capacity) {
	return {
		...row,
		__dotSlotIndex: Math.max(0, Math.floor(slotIndex)),
		__dotSlotCapacity: Math.max(1, Math.floor(capacity))
	};
}
function isSlottedRow(row) {
	const maybe = row;
	return typeof maybe.__dotSlotIndex === "number" && Number.isFinite(maybe.__dotSlotIndex) && typeof maybe.__dotSlotCapacity === "number" && Number.isFinite(maybe.__dotSlotCapacity);
}
function nextUnusedSlot(usedSlots, capacity) {
	for (let slot = 0; slot < capacity; slot += 1) if (!usedSlots.has(slot)) return slot;
	return Math.max(0, capacity - 1);
}
function uniqueSlots(slots) {
	const seen = /* @__PURE__ */ new Set();
	const result = [];
	for (const slot of slots) {
		if (!Number.isFinite(slot) || seen.has(slot)) continue;
		seen.add(slot);
		result.push(slot);
	}
	return result;
}
function readPersonalSnapshot(entryId) {
	if (!entryId) return null;
	try {
		const raw = getSessionItem("be.myDoc");
		if (!raw) return null;
		const parsed = JSON.parse(raw);
		if (!parsed || typeof parsed !== "object") return null;
		const row = parsed;
		return row._id === entryId ? row : null;
	} catch {
		return null;
	}
}
function includePersonalRow(rows, limit, personalRow) {
	if (limit <= 0) return [];
	const capped = rows.slice(0, limit);
	if (!personalRow?._id || capped.some((row) => row._id === personalRow._id)) return capped;
	const reservedRow = rows.find((row) => row._id === personalRow._id) ?? personalRow;
	const rowsBeforeReserved = capped.slice(0, Math.max(0, limit - 1));
	const usedSlots = new Set(rowsBeforeReserved.map((row) => row.__dotSlotIndex));
	const droppedRow = capped.length >= limit ? capped[limit - 1] : void 0;
	const slotIndex = isSlottedRow(reservedRow) ? reservedRow.__dotSlotIndex : droppedRow?.__dotSlotIndex ?? nextUnusedSlot(usedSlots, limit);
	return [...rowsBeforeReserved, withDotSlot(reservedRow, slotIndex, limit)].slice(0, limit);
}
function buildVisibleRowsSnapshot(rows, limit, scopeKey, previous) {
	const nextKnownIds = new Set(rows.map((row) => row._id).filter((id) => Boolean(id)));
	if (previous?.scopeKey !== scopeKey || previous.capacity !== limit) return {
		scopeKey,
		capacity: limit,
		rows: rows.slice(0, limit).map((row, slotIndex) => withDotSlot(row, slotIndex, limit)),
		knownIds: nextKnownIds
	};
	const latestById = new Map(rows.map((row) => [row._id, row]));
	const stillVisible = [];
	const freedSlots = [];
	for (const row of previous.rows) {
		if (!row._id) continue;
		const latest = latestById.get(row._id);
		if (latest) stillVisible.push(withDotSlot(latest, row.__dotSlotIndex, limit));
		else freedSlots.push(row.__dotSlotIndex);
	}
	const incoming = rows.filter((row) => row._id && !previous.knownIds.has(row._id));
	const keepCount = Math.max(0, limit - incoming.length);
	const keptVisible = stillVisible.slice(0, keepCount);
	for (const evicted of stillVisible.slice(keepCount)) freedSlots.push(evicted.__dotSlotIndex);
	const usedSlots = new Set(keptVisible.map((row) => row.__dotSlotIndex));
	const availableSlots = uniqueSlots(freedSlots).filter((slot) => !usedSlots.has(slot));
	return {
		scopeKey,
		capacity: limit,
		rows: [...incoming.slice(0, limit).map((row) => {
			const slotIndex = availableSlots.shift() ?? nextUnusedSlot(usedSlots, limit);
			usedSlots.add(slotIndex);
			return withDotSlot(row, slotIndex, limit);
		}), ...keptVisible].slice(0, limit),
		knownIds: nextKnownIds
	};
}
function useStableVisibleRows(rows, limit, scopeKey) {
	const [snapshot, setSnapshot] = useState(() => buildVisibleRowsSnapshot(rows, limit, scopeKey, null));
	useEffect(() => {
		setSnapshot((previous) => buildVisibleRowsSnapshot(rows, limit, scopeKey, previous));
	}, [
		limit,
		rows,
		scopeKey
	]);
	return snapshot.scopeKey === scopeKey && snapshot.capacity === limit ? snapshot.rows : buildVisibleRowsSnapshot(rows, limit, scopeKey, null).rows;
}
function DotGraphDataBoundary() {
	const { allFilteredRows, section } = useSurveyData();
	const { myEntryId, mySection } = useIdentity();
	const dataLimit = useRealMobileViewport() ? Math.min(MOBILE_DATA_LIMIT, MAX_GRAPH_SPRITES) : MAX_GRAPH_SPRITES;
	const personalEntryId = myEntryId ?? getSessionItem("be.myEntryId");
	const effectiveMySection = mySection ?? getSessionItem("be.mySection") ?? "";
	const personalRow = useMemo(() => {
		if (!personalEntryId) return null;
		return allFilteredRows.find((row) => row._id === personalEntryId) ?? readPersonalSnapshot(personalEntryId);
	}, [allFilteredRows, personalEntryId]);
	const scopedPersonalRow = useMemo(() => {
		if (!personalRow) return null;
		return allowPersonalInSection(deriveRoleFromSectionId(effectiveMySection), effectiveMySection, section) ? personalRow : null;
	}, [
		effectiveMySection,
		personalRow,
		section
	]);
	const stableVisibleRows = useStableVisibleRows(allFilteredRows, dataLimit, section);
	return /* @__PURE__ */ jsx(GraphDataProvider, {
		data: useMemo(() => includePersonalRow(stableVisibleRows, dataLimit, scopedPersonalRow), [
			stableVisibleRows,
			dataLimit,
			scopedPersonalRow
		]),
		children: /* @__PURE__ */ jsx(DotGraphCanvasHost, {})
	});
}
//#endregion
export { DotGraphDataBoundary as default };

//# sourceMappingURL=data-boundary-CbJ6T3jh.mjs.map