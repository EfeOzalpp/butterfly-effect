//#region src/app/session.ts
(function() {
	try {
		var e = "undefined" != typeof window ? window : "undefined" != typeof global ? global : "undefined" != typeof globalThis ? globalThis : "undefined" != typeof self ? self : {};
		e.SENTRY_RELEASE = { id: "131decce1f878a04c070a93aabe3e016cfcc66cb" };
		var n = new e.Error().stack;
		n && (e._sentryDebugIds = e._sentryDebugIds || {}, e._sentryDebugIds[n] = "e75bb6c3-4a73-48ef-9db7-b9d71e55773c", e._sentryDebugIdIdentifier = "sentry-dbid-e75bb6c3-4a73-48ef-9db7-b9d71e55773c");
	} catch (e) {}
})();
var LOCAL_BACKED_KEYS = new Set([
	"be.myEntryId",
	"be.mySection",
	"be.myRole",
	"be.myAvg",
	"be.myDoc",
	"be.myEditToken",
	"be.justSubmitted",
	"be.openPersonalOnNext"
]);
function readStorage(storage, key) {
	if (!storage) return null;
	try {
		return storage.getItem(key);
	} catch {
		return null;
	}
}
function writeStorage(storage, key, value) {
	if (!storage) return;
	try {
		storage.setItem(key, value);
	} catch {
		return;
	}
}
function removeStorage(storage, key) {
	if (!storage) return;
	try {
		storage.removeItem(key);
	} catch {
		return;
	}
}
function getSessionItem(key) {
	if (typeof window === "undefined") return null;
	return readStorage(window.sessionStorage, key) ?? (LOCAL_BACKED_KEYS.has(key) ? readStorage(window.localStorage, key) : null);
}
function setSessionItem(key, value) {
	if (typeof window === "undefined") return;
	writeStorage(window.sessionStorage, key, value);
	if (LOCAL_BACKED_KEYS.has(key)) writeStorage(window.localStorage, key, value);
}
function removeSessionItems(keys) {
	if (typeof window === "undefined") return;
	for (const key of keys) {
		removeStorage(window.sessionStorage, key);
		if (LOCAL_BACKED_KEYS.has(key)) removeStorage(window.localStorage, key);
	}
}
function readStoredMode(defaultMode) {
	const saved = getSessionItem("be.mode");
	return saved === "absolute" || saved === "relative" ? saved : defaultMode;
}
function readStoredDarkMode(defaultValue = true) {
	const saved = getSessionItem("be.darkMode");
	if (saved == null) return defaultValue;
	return saved === "true";
}
function applyThemeToDocument(darkMode) {
	if (typeof document === "undefined") return;
	const root = document.documentElement;
	root.classList.add("theme-switching");
	root.offsetWidth;
	root.dataset.theme = darkMode ? "dark" : "light";
	root.classList.toggle("dark", darkMode);
	window.requestAnimationFrame(() => {
		root.classList.remove("theme-switching");
	});
	const color = darkMode ? "#21201e" : "#f8f3ef";
	document.querySelectorAll("meta[name=\"theme-color\"]").forEach((m) => {
		m.content = color;
	});
}
//#endregion
//#region src/canvas-engine/runtime/p/canvasMeta.ts
var EMPTY_CANVAS_META = {};
var canvasMeta = /* @__PURE__ */ new WeakMap();
function getCanvasMeta(canvas) {
	return canvasMeta.get(canvas) ?? EMPTY_CANVAS_META;
}
function setCanvasMeta(canvas, next) {
	const meta = { ...getCanvasMeta(canvas) };
	if (next.dpr !== void 0) meta.dpr = next.dpr;
	if (next.cssW !== void 0) meta.cssW = next.cssW;
	if (next.cssH !== void 0) meta.cssH = next.cssH;
	canvasMeta.set(canvas, meta);
	return meta;
}
//#endregion
//#region src/canvas-engine/shared/math.ts
function clamp01(v) {
	if (typeof v !== "number" || !Number.isFinite(v)) return 0;
	return Math.max(0, Math.min(1, v));
}
function clampMinMax(v, min, max) {
	return Math.max(min, Math.min(max, v));
}
function lerpNumber(a, b, t) {
	return a + (b - a) * t;
}
function finiteNumber(value, fallback) {
	return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}
function smoothstep01(t) {
	const c = clamp01(t);
	return c * c * (3 - 2 * c);
}
function mixRgb(base, target, k) {
	const kk = clamp01(k);
	return {
		r: Math.round(lerpNumber(base.r, target.r, kk)),
		g: Math.round(lerpNumber(base.g, target.g, kk)),
		b: Math.round(lerpNumber(base.b, target.b, kk))
	};
}
//#endregion
//#region src/canvas-engine/runtime/p/makeP.ts
var DEFAULT_FRAME_DELTA_MS = 1e3 / 60;
var MAX_FRAME_DELTA_MS = 100;
function rgbaCss$1(r, g, b, a) {
	return `rgba(${String(r)},${String(g)},${String(b)},${String(a)})`;
}
function frameDeltaMs(now, last) {
	const raw = now - last;
	if (!Number.isFinite(raw) || raw <= 0) return DEFAULT_FRAME_DELTA_MS;
	return Math.min(raw, MAX_FRAME_DELTA_MS);
}
function makeP(canvas, ctx) {
	let _delta = DEFAULT_FRAME_DELTA_MS, _last = performance.now();
	const state = {
		doFill: true,
		doStroke: false,
		lineWidth: 1
	};
	let _rectMode = "corner";
	const _pStateStack = [];
	const scratchContext = document.createElement("canvas").getContext("2d");
	if (!scratchContext) throw new Error("2D canvas context not available");
	const _scratch = scratchContext;
	function parseCss(css) {
		_scratch.fillStyle = "#000";
		_scratch.fillStyle = css;
		_scratch.fillStyle = _scratch.fillStyle;
		const m = /rgba?\((\d+),\s*(\d+),\s*(\d+)/i.exec(_scratch.fillStyle);
		if (!m) return {
			r: 0,
			g: 0,
			b: 0
		};
		return {
			r: Number(m[1]),
			g: Number(m[2]),
			b: Number(m[3])
		};
	}
	let _shapeOpen = false;
	let _firstVertex = true;
	const c = canvas;
	const p = {
		canvas: c,
		get width() {
			return getCanvasMeta(c).cssW ?? c.width;
		},
		get height() {
			return getCanvasMeta(c).cssH ?? c.height;
		},
		get deltaTime() {
			return _delta;
		},
		millis() {
			return performance.now();
		},
		drawingContext: ctx,
		P2D: "2d",
		createCanvas(w, h) {
			c.width = w;
			c.height = h;
			return c;
		},
		resizeCanvas(w, h) {
			const ratio = getCanvasMeta(c).dpr ?? 1;
			setCanvasMeta(c, {
				cssW: w,
				cssH: h
			});
			c.width = Math.max(1, Math.floor(w * ratio));
			c.height = Math.max(1, Math.floor(h * ratio));
			ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
		},
		pixelDensity(dpr) {
			const meta = getCanvasMeta(c);
			const w = meta.cssW ?? (c.clientWidth > 0 ? c.clientWidth : window.innerWidth);
			const h = meta.cssH ?? (c.clientHeight > 0 ? c.clientHeight : window.innerHeight);
			setCanvasMeta(c, { dpr: Math.max(1, dpr) });
			p.resizeCanvas(w, h);
		},
		background(css) {
			ctx.save();
			ctx.setTransform(1, 0, 0, 1, 0, 0);
			ctx.fillStyle = css;
			ctx.fillRect(0, 0, c.width, c.height);
			ctx.restore();
		},
		push() {
			_pStateStack.push({
				_rectMode,
				doFill: state.doFill,
				doStroke: state.doStroke,
				lineWidth: state.lineWidth
			});
			ctx.save();
		},
		pop() {
			ctx.restore();
			const s = _pStateStack.pop();
			_rectMode = s?._rectMode ?? "corner";
			state.doFill = s?.doFill ?? true;
			state.doStroke = s?.doStroke ?? false;
			state.lineWidth = s?.lineWidth ?? 1;
			ctx.lineWidth = state.lineWidth;
		},
		translate(x, y) {
			ctx.translate(x, y);
		},
		scale(x, y) {
			ctx.scale(x, y ?? x);
		},
		rotate(r) {
			ctx.rotate(r);
		},
		noFill() {
			state.doFill = false;
		},
		fill(r, g, b, a = 255) {
			state.doFill = true;
			if (typeof r === "string") {
				const c2 = parseCss(r);
				ctx.fillStyle = rgbaCss$1(c2.r, c2.g, c2.b, a / 255);
			} else ctx.fillStyle = rgbaCss$1(r | 0, (g ?? 0) | 0, (b ?? 0) | 0, (a | 0) / 255);
		},
		noStroke() {
			state.doStroke = false;
		},
		stroke(r, g, b, a = 255) {
			state.doStroke = true;
			ctx.strokeStyle = rgbaCss$1(r | 0, g | 0, b | 0, (a | 0) / 255);
		},
		strokeWeight(w) {
			state.lineWidth = w;
			ctx.lineWidth = w;
		},
		CORNER: "corner",
		CENTER: "center",
		rectMode(mode) {
			_rectMode = mode === p.CENTER ? "center" : "corner";
		},
		rect(x, y, w, h, tl = 0, tr = tl, br = tl, bl = tl) {
			if (_rectMode === "center") {
				x = x - w / 2;
				y = y - h / 2;
			}
			const rr = (rad) => Math.max(0, Math.min(rad, Math.min(w, h) / 2));
			const rtl = rr(tl), rtr = rr(tr), rbr = rr(br), rbl = rr(bl);
			ctx.beginPath();
			ctx.moveTo(x + rtl, y);
			ctx.lineTo(x + w - rtr, y);
			ctx.quadraticCurveTo(x + w, y, x + w, y + rtr);
			ctx.lineTo(x + w, y + h - rbr);
			ctx.quadraticCurveTo(x + w, y + h, x + w - rbr, y + h);
			ctx.lineTo(x + rbl, y + h);
			ctx.quadraticCurveTo(x, y + h, x, y + h - rbl);
			ctx.lineTo(x, y + rtl);
			ctx.quadraticCurveTo(x, y, x + rtl, y);
			if (state.doFill) ctx.fill();
			if (state.doStroke) ctx.stroke();
		},
		circle(x, y, d) {
			ctx.beginPath();
			ctx.arc(x, y, d / 2, 0, Math.PI * 2);
			if (state.doFill) ctx.fill();
			if (state.doStroke) ctx.stroke();
		},
		line(x1, y1, x2, y2) {
			ctx.beginPath();
			ctx.moveTo(x1, y1);
			ctx.lineTo(x2, y2);
			ctx.stroke();
		},
		triangle(x1, y1, x2, y2, x3, y3) {
			ctx.beginPath();
			ctx.moveTo(x1, y1);
			ctx.lineTo(x2, y2);
			ctx.lineTo(x3, y3);
			ctx.closePath();
			if (state.doFill) ctx.fill();
			if (state.doStroke) ctx.stroke();
		},
		beginShape() {
			ctx.beginPath();
			_shapeOpen = true;
			_firstVertex = true;
		},
		vertex(x, y) {
			if (!_shapeOpen) return;
			if (_firstVertex) {
				ctx.moveTo(x, y);
				_firstVertex = false;
			} else ctx.lineTo(x, y);
		},
		endShape(mode) {
			if (!_shapeOpen) return;
			if (mode && (mode === "close" || mode === p.CLOSE)) ctx.closePath();
			if (state.doFill) ctx.fill();
			if (state.doStroke) ctx.stroke();
			_shapeOpen = false;
		},
		CLOSE: "close",
		color(css) {
			return parseCss(css);
		},
		red(c2) {
			return c2.r;
		},
		green(c2) {
			return c2.g;
		},
		blue(c2) {
			return c2.b;
		},
		__tick(now) {
			_delta = frameDeltaMs(now, _last);
			_last = now;
		}
	};
	return p;
}
//#endregion
//#region src/canvas-engine/modifiers/color-modifiers/utils.ts
function lerp(a, b, t) {
	return lerpNumber(a, b, t);
}
function cssToRgbViaCanvas(p, css) {
	const color = p.color(css);
	return {
		r: p.red(color),
		g: p.green(color),
		b: p.blue(color)
	};
}
//#endregion
//#region src/canvas-engine/modifiers/color-modifiers/colorspace.ts
/** sRGB [0..255] -> linear [0..1] */
function srgbToLin(u8) {
	const x = Math.max(0, Math.min(255, u8)) / 255;
	return x <= .04045 ? x / 12.92 : Math.pow((x + .055) / 1.055, 2.4);
}
/** linear [0..1] -> sRGB [0..255] */
function linToSrgb(u) {
	const y = u <= .0031308 ? 12.92 * u : 1.055 * Math.pow(u, 1 / 2.4) - .055;
	return Math.round(clamp01(y) * 255);
}
/** Linear (non-gamma) blend kept for compatibility */
function mixRGB(a, b, t) {
	const k = clamp01(t);
	return {
		r: Math.round(lerp(a.r, b.r, k)),
		g: Math.round(lerp(a.g, b.g, k)),
		b: Math.round(lerp(a.b, b.b, k))
	};
}
/** Gamma-correct RGB mix: linearize -> lerp -> encode */
function mixRGBGamma(a, b, t) {
	const k = clamp01(t);
	const A = [
		srgbToLin(a.r),
		srgbToLin(a.g),
		srgbToLin(a.b)
	];
	const B = [
		srgbToLin(b.r),
		srgbToLin(b.g),
		srgbToLin(b.b)
	];
	return {
		r: linToSrgb(A[0] + (B[0] - A[0]) * k),
		g: linToSrgb(A[1] + (B[1] - A[1]) * k),
		b: linToSrgb(A[2] + (B[2] - A[2]) * k)
	};
}
function rgbToHsl({ r, g, b }) {
	const R = r / 255, G = g / 255, B = b / 255;
	const max = Math.max(R, G, B);
	const min = Math.min(R, G, B);
	const d = max - min;
	let h = 0;
	if (d !== 0) {
		switch (max) {
			case R:
				h = (G - B) / d + (G < B ? 6 : 0);
				break;
			case G:
				h = (B - R) / d + 2;
				break;
			case B:
				h = (R - G) / d + 4;
				break;
		}
		h /= 6;
	}
	const l = (max + min) / 2;
	const s = d === 0 ? 0 : d / (1 - Math.abs(2 * l - 1));
	return {
		h,
		s,
		l
	};
}
function hslToRgb({ h, s, l }) {
	const hue2rgb = (p, q, t) => {
		if (t < 0) t += 1;
		if (t > 1) t -= 1;
		if (t < 1 / 6) return p + (q - p) * 6 * t;
		if (t < 1 / 2) return q;
		if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
		return p;
	};
	const q = l < .5 ? l * (1 + s) : l + s - l * s;
	const p = 2 * l - q;
	return {
		r: Math.round(hue2rgb(p, q, h + 1 / 3) * 255),
		g: Math.round(hue2rgb(p, q, h) * 255),
		b: Math.round(hue2rgb(p, q, h - 1 / 3) * 255)
	};
}
//#endregion
//#region src/canvas-engine/modifiers/color-modifiers/blend.ts
function blendRGB(base, gradientRGB, blend = .5) {
	if (!gradientRGB) return base;
	return mixRGB(base, gradientRGB, clamp01(blend));
}
function blendRGBGamma(base, gradientRGB, blend = .5) {
	if (!gradientRGB) return base;
	return mixRGBGamma(base, gradientRGB, clamp01(blend));
}
//#endregion
//#region src/canvas-engine/modifiers/color-modifiers/effects.ts
function oscillateSaturation(base, timeSec, { amp = .15, speed = .25, phase = 0 } = {}) {
	const { h, s, l } = rgbToHsl(base);
	const k = clamp01(amp);
	const w = speed * 2 * Math.PI;
	return hslToRgb({
		h,
		s: clamp01(s * (1 + k * Math.sin(w * timeSec + phase))),
		l
	});
}
function clampSaturation$1(base, minS, maxS, t = 1) {
	const { h, s, l } = rgbToHsl(base);
	return hslToRgb({
		h,
		s: s + (Math.min(maxS, Math.max(minS, s)) - s) * clamp01(t),
		l
	});
}
function oscillateBrightness(base, timeSec, { amp = .15, speed = .25, phase = 0 } = {}) {
	const { h, s, l } = rgbToHsl(base);
	const k = clamp01(amp);
	const w = speed * 2 * Math.PI;
	return hslToRgb({
		h,
		s,
		l: clamp01(l * (1 + k * Math.sin(w * timeSec + phase)))
	});
}
function clampBrightness(base, minL, maxL, t = 1) {
	const { h, s, l } = rgbToHsl(base);
	return hslToRgb({
		h,
		s,
		l: l + (Math.min(maxL, Math.max(minL, l)) - l) * clamp01(t)
	});
}
function driveSaturation(base, t, s0, s1) {
	const { h, l } = rgbToHsl(base);
	return hslToRgb({
		h,
		s: clamp01(s0 + (s1 - s0) * clamp01(t)),
		l
	});
}
function scaleRgb({ r, g, b }, k) {
	const scale = (value) => Math.max(0, Math.min(255, Math.round(value * k)));
	return {
		r: scale(r),
		g: scale(g),
		b: scale(b)
	};
}
function applySrgbExposureContrast(rgb, exposure = 1, contrast = 1) {
	const e = Math.max(.1, Math.min(3, exposure));
	const k = Math.max(.5, Math.min(2, contrast));
	const adjust = (v) => {
		let x = v / 255 * e;
		x = (x - .5) * k + .5;
		return Math.max(0, Math.min(1, x)) * 255;
	};
	return {
		r: Math.round(adjust(rgb.r)),
		g: Math.round(adjust(rgb.g)),
		b: Math.round(adjust(rgb.b))
	};
}
/** Simple perceptual exposure / contrast adjustment (in linear space) */
function applyExposureContrast(base, exposure = 1, contrast = 1) {
	const e = Math.max(.01, Math.min(5, exposure));
	const c = Math.max(0, Math.min(3, contrast));
	const lin = {
		r: srgbToLin(base.r),
		g: srgbToLin(base.g),
		b: srgbToLin(base.b)
	};
	return {
		r: linToSrgb(Math.pow(lin.r * e, c)),
		g: linToSrgb(Math.pow(lin.g * e, c)),
		b: linToSrgb(Math.pow(lin.b * e, c))
	};
}
//#endregion
//#region src/canvas-engine/modifiers/color-modifiers/canvas.ts
function fillRgb(p, { r, g, b }, alpha = 255) {
	p.fill(r, g, b, alpha);
}
function strokeRgb(p, { r, g, b }, alpha = 255) {
	p.stroke(r, g, b, alpha);
}
function rgbaCss({ r, g, b }, alpha01) {
	return `rgba(${String(r)},${String(g)},${String(b)},${String(alpha01)})`;
}
//#endregion
//#region src/canvas-engine/modifiers/color-modifiers/gradient.ts
function rgbToCss(c) {
	return `rgb(${String(c.r)}, ${String(c.g)}, ${String(c.b)})`;
}
function gradientColor(stops, tRaw) {
	const t = clamp01(tRaw);
	if (stops.length === 0) {
		const rgb = {
			r: 127,
			g: 127,
			b: 127
		};
		return {
			rgb,
			css: rgbToCss(rgb),
			t
		};
	}
	for (let i = 0; i < stops.length - 1; i++) {
		const s1 = stops[i];
		const s2 = stops[i + 1];
		if (t >= s1.stop && t <= s2.stop) {
			const span = Math.max(1e-6, s2.stop - s1.stop);
			const lt = (t - s1.stop) / span;
			const rgb = mixRGB(s1.color, s2.color, lt);
			return {
				rgb,
				css: rgbToCss(rgb),
				t
			};
		}
	}
	const end = t <= stops[0].stop ? stops[0].color : stops[stops.length - 1].color;
	return {
		rgb: end,
		css: rgbToCss(end),
		t
	};
}
//#endregion
//#region src/canvas-engine/modifiers/color-modifiers/stops.ts
var VIVID_COLOR_STOPS = [
	{
		stop: 0,
		color: {
			r: 210,
			g: 10,
			b: 25
		}
	},
	{
		stop: .2,
		color: {
			r: 225,
			g: 60,
			b: 30
		}
	},
	{
		stop: .46,
		color: {
			r: 255,
			g: 210,
			b: 40
		}
	},
	{
		stop: .52,
		color: {
			r: 255,
			g: 245,
			b: 120
		}
	},
	{
		stop: .58,
		color: {
			r: 150,
			g: 235,
			b: 120
		}
	},
	{
		stop: .78,
		color: {
			r: 75,
			g: 175,
			b: 70
		}
	},
	{
		stop: 1,
		color: {
			r: 25,
			g: 120,
			b: 40
		}
	}
];
//#endregion
//#region src/canvas-engine/shared/hash32.ts
function fnv1a32(s) {
	let h = 2166136261;
	for (let i = 0; i < s.length; i++) {
		h ^= s.charCodeAt(i);
		h = Math.imul(h, 16777619);
	}
	return h >>> 0;
}
function fmix32(h) {
	h ^= h >>> 16;
	h = Math.imul(h, 2246822507);
	h ^= h >>> 13;
	h = Math.imul(h, 3266489909);
	h ^= h >>> 16;
	return h >>> 0;
}
function hashString32(key) {
	return fmix32(fnv1a32(key));
}
function rand01FromString(key) {
	return (hashString32(key) >>> 8 & 65535) / 65535;
}
/**
* Deterministic 32-bit hash -> pseudo-random phase (0..2pi)
* Kept for visual stability in geom/osc wobble.
*/
function phaseFromIndex(idx, seed = 0) {
	let t = idx + (seed >>> 0) ^ 2654435769;
	t ^= t >>> 15;
	t = Math.imul(t, 2246822507);
	t ^= t >>> 13;
	t = Math.imul(t, 3266489909);
	t ^= t >>> 16;
	return Math.abs(t) % 628318530 / 1e8;
}
var rand01Keyed = rand01FromString;
//#endregion
//#region src/canvas-engine/modifiers/shape-modifiers/lobes.ts
function makeArchLobes(cx, cy, width, height, opts = {}) {
	const { count = 7, spreadX = .92, arcLift = .32, rBase = null, rJitter = .12, seed = 0 } = opts;
	const lobes = [];
	const W = width * spreadX;
	const r0 = rBase ?? Math.min(width, height) * .34;
	for (let i = 0; i < count; i++) {
		const u = count === 1 ? .5 : i / (count - 1);
		const x = cx - W / 2 + u * W;
		const arch = Math.sin(u * Math.PI);
		const y = cy - arch * (height * arcLift);
		const ph = phaseFromIndex(i, seed);
		const r = r0 * (1 + Math.sin(ph) * rJitter) * (.85 + arch * .3);
		lobes.push({
			x,
			y,
			r,
			i
		});
	}
	return lobes;
}
//#endregion
//#region src/canvas-engine/modifiers/shape-modifiers/displacement.ts
function displacementOsc(tSec, idx, opts = {}) {
	const { ampX = 8, ampY = 6, ampScale = .12, freqX = .22, freqY = .22 * .85, freqScale = .22 * .6, seed = 0 } = opts;
	const p0 = phaseFromIndex(idx, seed);
	const p1 = phaseFromIndex(idx * 997 + 13, seed);
	const p2 = phaseFromIndex(idx * 577 + 29, seed);
	const wX = 2 * Math.PI * freqX;
	const wY = 2 * Math.PI * freqY;
	const wS = 2 * Math.PI * freqScale;
	return {
		dx: Math.sin(wX * tSec + p0) * ampX,
		dy: Math.sin(wY * tSec + p1) * ampY,
		sc: 1 + Math.sin(wS * tSec + p2) * ampScale
	};
}
//#endregion
//#region src/canvas-engine/modifiers/shape-modifiers/fit.ts
function fitScaleToRectWidth(contentW, rectW, pad = 0, { allowUpscale = false } = {}) {
	const scale = Math.max(1, rectW - pad * 2) / Math.max(1, contentW);
	return allowUpscale ? scale : Math.min(1, scale);
}
function beginFitScale(p, { cx, anchorY, scale }) {
	p.push();
	p.translate(cx, anchorY);
	p.scale(scale, scale);
	p.translate(-cx, -anchorY);
}
function endFitScale(p) {
	p.pop();
}
//#endregion
//#region src/canvas-engine/modifiers/shape-modifiers/path.ts
function roundedRectPath(ctx, x, y, w, h, r) {
	const rr = Math.max(0, Math.min(r, Math.min(w, h) / 2));
	ctx.moveTo(x + rr, y);
	ctx.lineTo(x + w - rr, y);
	ctx.quadraticCurveTo(x + w, y, x + w, y + rr);
	ctx.lineTo(x + w, y + h - rr);
	ctx.quadraticCurveTo(x + w, y + h, x + w - rr, y + h);
	ctx.lineTo(x + rr, y + h);
	ctx.quadraticCurveTo(x, y + h, x, y + h - rr);
	ctx.lineTo(x, y + rr);
	ctx.quadraticCurveTo(x, y, x + rr, y);
	ctx.closePath();
}
//#endregion
//#region src/canvas-engine/modifiers/shape-modifiers/random.ts
function shapeHash32(input) {
	return hashString32(input);
}
function seededUnit(seed) {
	let t = seed + 1831565813;
	t = Math.imul(t ^ t >>> 15, 1 | t);
	t ^= t + Math.imul(t ^ t >>> 7, 61 | t);
	return ((t ^ t >>> 14) >>> 0) / 4294967296;
}
function seeded01(key, salt = "") {
	return seededUnit(shapeHash32(`${String(key)}|${salt}`));
}
function seededTag01(key, tag) {
	return seededUnit(shapeHash32(`${tag}|${String(key)}`));
}
function pick(items, unit) {
	if (items.length === 0) throw new Error("Cannot pick from an empty shape list");
	return items[Math.floor(unit * items.length) % items.length] ?? items[0];
}
function pickByOccurrence(items, occurrence = 0, offset = 0) {
	if (items.length === 0) throw new Error("Cannot pick from an empty shape list");
	return items[(Math.max(0, occurrence) + offset) % items.length] ?? items[0];
}
//#endregion
//#region src/canvas-engine/modifiers/shape-modifiers/ranges.ts
function resolveRangeValue(v, u) {
	return Array.isArray(v) ? lerpNumber(v[0], v[1], clamp01(u)) : v;
}
//#endregion
//#region src/canvas-engine/modifiers/shape-modifiers/appear.ts
var ROOT_APPEAR_DEFAULT = {
	scaleFrom: 0,
	alphaFrom: 0,
	anchor: "bottom-center",
	ease: "back",
	backOvershoot: 1.25
};
function resolveAppear(appear, rootAppearEnabled) {
	if (appear === false) return void 0;
	if (!rootAppearEnabled && !appear) return void 0;
	return {
		...ROOT_APPEAR_DEFAULT,
		...appear ?? {}
	};
}
//#endregion
//#region src/canvas-engine/modifiers/shape-modifiers/transformMath.ts
function applyAnchorShiftForScale(anchor, dx, dy) {
	switch (anchor) {
		case "top": return {
			offX: 0,
			offY: dy / 2
		};
		case "bottom": return {
			offX: 0,
			offY: -dy / 2
		};
		case "left": return {
			offX: dx / 2,
			offY: 0
		};
		case "right": return {
			offX: -dx / 2,
			offY: 0
		};
		case "top-left": return {
			offX: dx / 2,
			offY: dy / 2
		};
		case "top-right": return {
			offX: -dx / 2,
			offY: dy / 2
		};
		case "bottom-left": return {
			offX: dx / 2,
			offY: -dy / 2
		};
		case "bottom-right": return {
			offX: -dx / 2,
			offY: -dy / 2
		};
		case "bottom-center": return {
			offX: 0,
			offY: -dy / 2
		};
		case "top-center": return {
			offX: 0,
			offY: dy / 2
		};
		default: return {
			offX: 0,
			offY: 0
		};
	}
}
function easeOutCubic(t) {
	t = clamp01(t);
	const u = 1 - t;
	return 1 - u * u * u;
}
function easeOutBack(t, s = 1.6) {
	t = clamp01(t);
	const invS = s + 1;
	const x = t - 1;
	return 1 + invS * x * x * x + s * x * x;
}
//#endregion
//#region src/canvas-engine/modifiers/shape-modifiers/apply.ts
function finiteOr(value, fallback) {
	return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}
function applyShapeMods({ p, x, y, r, opts = {}, mods = {} }) {
	const t = (typeof opts.timeMs === "number" ? opts.timeMs : p.millis()) / 1e3;
	let mx = x;
	let my = y;
	let mr = r;
	let alpha = typeof opts.alpha === "number" && Number.isFinite(opts.alpha) ? opts.alpha : 255;
	let rotation = 0;
	let satFactor = 1;
	let scaleX = 1;
	let scaleY = 1;
	const appear = resolveAppear(mods.appear, typeof opts.rootAppearK === "number");
	if (appear) {
		const { scaleFrom, alphaFrom, anchor, ease, backOvershoot } = appear;
		let k = clamp01(typeof opts.rootAppearK === "number" ? opts.rootAppearK : 1);
		if (ease === "cubic") k = easeOutCubic(k);
		else if (ease === "back") k = easeOutBack(k, backOvershoot);
		const s = scaleFrom + (1 - scaleFrom) * k;
		const { offX, offY } = applyAnchorShiftForScale(anchor, r * (s - 1), r * (s - 1));
		mx += offX;
		my += offY;
		scaleX *= s;
		scaleY *= s;
		const aMul = alphaFrom + (1 - alphaFrom) * k;
		alpha = clamp01(alpha * aMul / 255) * 255;
	}
	if (mods.scale && typeof mods.scale.value === "number") {
		const baseR = r * mods.scale.value;
		const delta = baseR - r;
		const { offX, offY } = applyAnchorShiftForScale(mods.scale.anchor ?? "center", delta, delta);
		mx += offX;
		my += offY;
		mr = baseR;
	}
	if (mods.scale2D) {
		const ax = Math.max(0, mods.scale2D.x ?? 1);
		const ay = Math.max(0, mods.scale2D.y ?? 1);
		const { offX, offY } = applyAnchorShiftForScale(mods.scale2D.anchor ?? "center", r * (ax - 1), r * (ay - 1));
		mx += offX;
		my += offY;
		scaleX *= ax;
		scaleY *= ay;
	}
	if (mods.sizeOsc && mods.sizeOsc.mode !== "none") {
		const { mode = "relative", speed = .3, phase = 0, anchor = "center", bias, amp, biasAbs, ampAbs } = mods.sizeOsc;
		const r0 = mr;
		let biasK = 1;
		let ampK = 0;
		if (mode === "absolute") {
			const bAbs = typeof biasAbs === "number" ? biasAbs : r0;
			const aAbs = typeof ampAbs === "number" ? ampAbs : 0;
			biasK = bAbs / Math.max(1e-6, r0);
			ampK = aAbs / Math.max(1e-6, r0);
		} else {
			biasK = typeof bias === "number" ? bias : 1;
			ampK = typeof amp === "number" ? amp : .1;
		}
		const osc = Math.sin(t * speed * Math.PI * 2 + phase);
		const newR = r0 * (biasK + ampK * osc);
		const delta = newR - r0;
		const { offX, offY } = applyAnchorShiftForScale(anchor, delta, delta);
		mx += offX;
		my += offY;
		mr = newR;
	}
	if (mods.scale2DOsc) {
		const { mode = "relative", biasX = 1, ampX = 0, biasY = 1, ampY = 0, biasAbsX, ampAbsX, biasAbsY, ampAbsY, speed = .3, phaseX = 0, phaseY = Math.PI / 2, anchor = "center" } = mods.scale2DOsc;
		let bx = biasX, by = biasY, ax = ampX, ay = ampY;
		if (mode === "absolute") {
			const base = Math.max(1e-6, mr);
			bx = typeof biasAbsX === "number" ? biasAbsX / base : 1;
			by = typeof biasAbsY === "number" ? biasAbsY / base : 1;
			ax = typeof ampAbsX === "number" ? ampAbsX / base : 0;
			ay = typeof ampAbsY === "number" ? ampAbsY / base : 0;
		}
		const kx = bx + ax * Math.sin(t * speed * Math.PI * 2 + phaseX);
		const ky = by + ay * Math.sin(t * speed * Math.PI * 2 + phaseY);
		const { offX, offY } = applyAnchorShiftForScale(anchor, mr * (kx - 1), mr * (ky - 1));
		mx += offX;
		my += offY;
		scaleX *= Math.max(0, kx);
		scaleY *= Math.max(0, ky);
	}
	if (mods.translateOscX) {
		const amp = finiteOr(mods.translateOscX.amp, 0);
		const speed = finiteOr(mods.translateOscX.speed, .25);
		const phase = finiteOr(mods.translateOscX.phase, 0);
		mx += amp * Math.sin(speed * 2 * Math.PI * t + phase);
	}
	if (mods.translateOscY) {
		const amp = finiteOr(mods.translateOscY.amp, 0);
		const speed = finiteOr(mods.translateOscY.speed, .25);
		const phase = finiteOr(mods.translateOscY.phase, Math.PI / 2);
		my += amp * Math.sin(speed * 2 * Math.PI * t + phase);
	}
	if (mods.translateClampX) {
		const { min, max } = mods.translateClampX;
		if (typeof min === "number" && Number.isFinite(min)) mx = Math.max(min, mx);
		if (typeof max === "number" && Number.isFinite(max)) mx = Math.min(max, mx);
	}
	if (mods.translateClampY) {
		const { min, max } = mods.translateClampY;
		if (typeof min === "number" && Number.isFinite(min)) my = Math.max(min, my);
		if (typeof max === "number" && Number.isFinite(max)) my = Math.min(max, my);
	}
	if (mods.opacityOsc) {
		const { amp = 80, speed = .4, phase = 0 } = mods.opacityOsc;
		alpha = clamp01((alpha + amp * Math.sin(t * speed * Math.PI * 2 + phase)) / 255) * 255;
	}
	if (mods.rotation) {
		const { speed = .5, phase = 0 } = mods.rotation;
		rotation += phase + t * speed;
	}
	if (mods.rotationOsc) {
		const { amp = Math.PI / 16, speed = .6, phase = 0 } = mods.rotationOsc;
		rotation += amp * Math.sin(t * speed * Math.PI * 2 + phase);
	}
	if (mods.saturationOsc) {
		const { amp = .1, speed = .2, phase = 0 } = mods.saturationOsc;
		satFactor = 1 + amp * Math.sin(t * speed * Math.PI * 2 + phase);
	}
	return {
		x: mx,
		y: my,
		r: mr,
		alpha,
		rotation,
		satFactor,
		scaleX,
		scaleY
	};
}
//#endregion
//#region src/canvas-engine/modifiers/render-pass.ts
var DEFAULT_MASK_RGB = {
	r: 255,
	g: 255,
	b: 255
};
function shouldDrawInRenderPass(renderPass, includeInDepthMask) {
	return renderPass === "color" || includeInDepthMask;
}
function shapeColorForRenderPass(renderPass, color, maskColor = DEFAULT_MASK_RGB) {
	return renderPass === "depthMask" ? maskColor : color;
}
function applyDepthTint(color, opts, strength = 1) {
	const tint = opts.depthTintColor;
	const k = opts.depthTintK;
	if (!tint || typeof k !== "number" || !Number.isFinite(k) || k <= 0) return color;
	return blendRGB(color, tint, Math.max(0, Math.min(1, k * strength)));
}
//#endregion
//#region src/canvas-engine/modifiers/particles/utils.ts
function mix(a, b, t) {
	return lerpNumber(a, b, t);
}
function makePRNG(seed) {
	let t = seed >>> 0;
	return () => {
		t += 1831565813;
		let r = Math.imul(t ^ t >>> 15, 1 | t);
		r ^= r + Math.imul(r ^ r >>> 7, 61 | r);
		return ((r ^ r >>> 14) >>> 0) / 4294967296;
	};
}
function randRange(rnd, a, b) {
	return mix(Math.min(a, b), Math.max(a, b), rnd());
}
function hzLerp(current, target, hz, dt) {
	if (!(hz > 0) || !(dt > 0)) return target;
	const k = 1 - Math.exp(-hz * dt);
	return current + (target - current) * k;
}
//#endregion
//#region src/canvas-engine/modifiers/particles/store.ts
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
function getParticleEmitterMap(store) {
	return store.particleEmitters;
}
function getPuffEmitterMap(store) {
	return store.puffEmitters;
}
//#endregion
//#region src/workers/particles/worker-host.ts
var instance = null;
var lastResults = /* @__PURE__ */ new Map();
var warnedKeys = /* @__PURE__ */ new Set();
function getInstance() {
	if (!instance) {
		instance = new Worker(new URL("./particle-worker.ts", import.meta.url), { type: "module" });
		instance.onmessage = (e) => {
			lastResults.set(e.data.key, e.data.particles);
		};
	}
	return instance;
}
function isWorkerSupported() {
	return typeof Worker !== "undefined";
}
function warnFunctionColor(key) {
	if (!warnedKeys.has(key)) {
		warnedKeys.add(key);
		console.warn(`[particles] emitter "${key}" has useWorker: true but color is a function — functions cannot be transferred to a worker. Falling back to main thread for this emitter.`);
	}
}
function sendP1Tick(key, dtSec, opts) {
	getInstance().postMessage({
		cmd: "step-p1",
		key,
		dtSec,
		opts
	});
}
function sendP2Tick(key, dtSec, opts) {
	getInstance().postMessage({
		cmd: "step-p2",
		key,
		dtSec,
		opts
	});
}
function getLastParticles(key) {
	return lastResults.get(key) ?? null;
}
//#endregion
//#region src/canvas-engine/modifiers/particles/particle-1.ts
function hashParticleKey(s) {
	let h = 2166136261;
	for (let i = 0; i < s.length; i++) {
		h ^= s.charCodeAt(i);
		h = Math.imul(h, 16777619);
	}
	return h >>> 0;
}
function spawnOne(rnd, rect, jPos, sx0, sx1, sy0, sy1, spMin, spMax, angMin, angMax, jAng, rMin, rMax, lMin, lMax, lifeMin, lifeMax, uSlot) {
	const ux = mix(sx0, sx1, uSlot);
	const uy = randRange(rnd, sy0, sy1);
	const x = rect.x + ux * rect.w + (rnd() * 2 - 1) * jPos;
	const y = rect.y + uy * rect.h + (rnd() * 2 - 1) * jPos;
	const sp = randRange(rnd, spMin, spMax);
	const ang = randRange(rnd, angMin - jAng, angMax + jAng);
	return {
		x,
		y,
		vx: Math.cos(ang) * sp,
		vy: Math.sin(ang) * sp,
		age: 0,
		life: randRange(rnd, lifeMin, lifeMax),
		size: randRange(rnd, rMin, rMax),
		len: randRange(rnd, lMin, lMax),
		uSlot
	};
}
function advanceParticle(pr, dtSec, accX, accY) {
	pr.x += pr.vx * dtSec + .5 * accX * dtSec * dtSec;
	pr.y += pr.vy * dtSec + .5 * accY * dtSec * dtSec;
	pr.vx += accX * dtSec;
	pr.vy += accY * dtSec;
	pr.age += dtSec;
}
function prewarmParticle(pr, rect, rnd, accX, accY) {
	const travelX = Math.abs(pr.vx) > 1 ? rect.w / Math.abs(pr.vx) : Infinity;
	const travelY = Math.abs(pr.vy) > 1 ? rect.h / Math.abs(pr.vy) : Infinity;
	const travelSec = Math.min(travelX, travelY);
	const maxAge = Number.isFinite(travelSec) ? Math.min(pr.life * .85, travelSec * .95) : pr.life * .5;
	advanceParticle(pr, rnd() * Math.max(0, maxAge), accX, accY);
}
function ensureEmitter$1(store, opts) {
	const key = opts.key;
	const emitters = getParticleEmitterMap(store);
	let st = emitters.get(key);
	const wantCount = Math.max(1, Math.floor(opts.count ?? 32));
	const seed = hashParticleKey(key);
	if (!st) {
		const rnd = makePRNG(seed);
		const rect = opts.rect;
		const spawn = opts.spawn ?? {};
		const sx0 = spawn.x0 ?? 0, sx1 = spawn.x1 ?? 1;
		const sy0 = spawn.y0 ?? 0, sy1 = spawn.y1 ?? 0;
		const speed = opts.speed ?? {};
		const spMin = speed.min ?? 120;
		const spMax = speed.max ?? 220;
		const angle = opts.angle ?? {};
		const angMin = angle.min ?? Math.PI / 2;
		const angMax = angle.max ?? Math.PI / 2;
		const jitter = opts.jitter ?? {};
		const jPos = jitter.pos ?? 0;
		const jAng = jitter.velAngle ?? 0;
		const size = opts.size ?? {};
		const rMin = size.min ?? 1;
		const rMax = size.max ?? 2.5;
		const len = opts.length ?? {};
		const lMin = len.min ?? 6;
		const lMax = len.max ?? 12;
		const life = opts.lifetime ?? {};
		const lifeMin = Math.max(.05, life.min ?? .6);
		const lifeMax = Math.max(lifeMin, life.max ?? 1.8);
		const spawnMode = opts.spawnMode ?? "stratified";
		const accX = opts.accel?.x ?? 0;
		const accY = (opts.accel?.y ?? 0) + (opts.gravity ?? 0);
		st = {
			particles: Array.from({ length: wantCount }, (_, i) => {
				const particle = spawnOne(rnd, rect, jPos, sx0, sx1, sy0, sy1, spMin, spMax, angMin, angMax, jAng, rMin, rMax, lMin, lMax, lifeMin, lifeMax, spawnMode === "stratified" ? (i + rnd()) / wantCount : rnd());
				prewarmParticle(particle, rect, rnd, accX, accY);
				return particle;
			}),
			seed,
			rnd
		};
		emitters.set(key, st);
		return st;
	}
	const rnd = st.rnd;
	const rect = opts.rect;
	const spawn = opts.spawn ?? {};
	const sx0 = spawn.x0 ?? 0, sx1 = spawn.x1 ?? 1;
	const sy0 = spawn.y0 ?? 0, sy1 = spawn.y1 ?? 0;
	const speed = opts.speed ?? {};
	const spMin = speed.min ?? 120;
	const spMax = speed.max ?? 220;
	const angle = opts.angle ?? {};
	const angMin = angle.min ?? Math.PI / 2;
	const angMax = angle.max ?? Math.PI / 2;
	const jPos = opts.jitter?.pos ?? 0;
	const jAng = opts.jitter?.velAngle ?? 0;
	const rMin = opts.size?.min ?? 1;
	const rMax = opts.size?.max ?? 2.5;
	const lMin = opts.length?.min ?? 6;
	const lMax = opts.length?.max ?? 12;
	const lifeMin = Math.max(.05, opts.lifetime?.min ?? .6);
	const lifeMax = Math.max(lifeMin, opts.lifetime?.max ?? 1.8);
	const spawnMode = opts.spawnMode ?? "stratified";
	const accX = opts.accel?.x ?? 0;
	const accY = (opts.accel?.y ?? 0) + (opts.gravity ?? 0);
	const cur = st.particles.length;
	if (cur < wantCount) for (let i = cur; i < wantCount; i++) {
		const particle = spawnOne(rnd, rect, jPos, sx0, sx1, sy0, sy1, spMin, spMax, angMin, angMax, jAng, rMin, rMax, lMin, lMax, lifeMin, lifeMax, spawnMode === "stratified" ? (i + rnd()) / wantCount : rnd());
		prewarmParticle(particle, rect, rnd, accX, accY);
		st.particles.push(particle);
	}
	else if (cur > wantCount) st.particles.length = wantCount;
	return st;
}
function toP1WorkerOpts(opts) {
	return {
		rect: opts.rect,
		spawnMode: opts.spawnMode,
		respawnStratified: opts.respawnStratified,
		spawn: opts.spawn,
		speed: opts.speed,
		angle: opts.angle,
		accel: opts.accel,
		gravity: opts.gravity,
		jitter: opts.jitter,
		count: opts.count,
		size: opts.size,
		length: opts.length,
		sizeHz: opts.sizeHz,
		lenHz: opts.lenHz,
		lifetime: opts.lifetime,
		respawn: opts.respawn,
		warmStartSec: opts.warmStartSec
	};
}
function drawP1FromBuffer(p, opts, buf) {
	const FPP = 7;
	const count = buf.length / FPP;
	const mode = opts.mode ?? "dot";
	const rMin = opts.size?.min ?? 1;
	const rMax = opts.size?.max ?? 2.5;
	const fadeInFrac = clamp01(opts.fadeInFrac ?? .1);
	const fadeOutFrac = clamp01(opts.fadeOutFrac ?? .2);
	const ef = opts.edgeFadePx ?? {};
	const fL = Math.max(0, ef.left ?? 0);
	const fR = Math.max(0, ef.right ?? 0);
	const fT = Math.max(0, ef.top ?? 0);
	const fB = Math.max(0, ef.bottom ?? 0);
	const depthAlpha = clamp01(opts.depthAlpha ?? 1);
	const rect = opts.rect;
	const baseColor = opts.color && typeof opts.color !== "function" ? opts.color : {
		r: 200,
		g: 220,
		b: 255,
		a: 160
	};
	const aBase = baseColor.a ?? 255;
	p.push();
	for (let i = 0; i < count; i++) {
		const b = i * FPP;
		const x = buf[b], y = buf[b + 1], vx = buf[b + 2], vy = buf[b + 3];
		const size = buf[b + 4], len = buf[b + 5], tLife = buf[b + 6];
		const fIn = fadeInFrac > 0 ? smoothstep01(tLife / Math.max(1e-6, fadeInFrac)) : 1;
		const fOut = fadeOutFrac > 0 ? smoothstep01((1 - tLife) / Math.max(1e-6, fadeOutFrac)) : 1;
		const eL = fL > 0 ? smoothstep01((x - rect.x) / fL) : 1;
		const eR = fR > 0 ? smoothstep01((rect.x + rect.w - x) / fR) : 1;
		const eT = fT > 0 ? smoothstep01((y - rect.y) / fT) : 1;
		const eB = fB > 0 ? smoothstep01((rect.y + rect.h - y) / fB) : 1;
		let alpha = aBase * fIn * fOut * eL * eR * eT * eB * depthAlpha;
		alpha = Math.max(0, Math.min(255, alpha));
		if (mode === "dot") {
			p.noStroke();
			p.fill(baseColor.r, baseColor.g, baseColor.b, alpha);
			p.circle(x, y, size * 2);
		} else {
			const vLen = Math.hypot(vx, vy) || 1;
			const ux = vx / vLen, uy = vy / vLen;
			const norm = (size - rMin) / Math.max(1e-6, rMax - rMin);
			const baseThick = (norm < 0 ? 0 : norm > 1 ? 1 : norm) * 2 + 1;
			const dprGuess = typeof window !== "undefined" ? window.devicePixelRatio : 1;
			const dprK = 1 + Math.max(0, Math.min(1.5, dprGuess - 1)) * .9;
			const thick = baseThick * (typeof opts.thicknessScale === "number" && Number.isFinite(opts.thicknessScale) ? opts.thicknessScale : dprK);
			p.strokeWeight(thick);
			p.stroke(baseColor.r, baseColor.g, baseColor.b, alpha);
			p.line(x, y, x - ux * len, y - uy * len);
		}
	}
	p.pop();
}
function stepAndDrawParticles(p, opts, dtSec) {
	if (opts.useWorker && isWorkerSupported()) if (typeof opts.color === "function") warnFunctionColor(opts.key);
	else {
		sendP1Tick(opts.key, dtSec, toP1WorkerOpts(opts));
		const buf = getLastParticles(opts.key);
		if (buf) drawP1FromBuffer(p, opts, buf);
		return;
	}
	if (!opts.store) return;
	const state = ensureEmitter$1(opts.store, opts);
	const rect = opts.rect;
	const mode = opts.mode ?? "dot";
	const spawnMode = opts.spawnMode ?? "stratified";
	const keepLane = opts.respawnStratified ?? true;
	const accX = opts.accel?.x ?? 0;
	const accY = (opts.accel?.y ?? 0) + (opts.gravity ?? 0);
	const fadeInFrac = clamp01(opts.fadeInFrac ?? .1);
	const fadeOutFrac = clamp01(opts.fadeOutFrac ?? .2);
	const ef = opts.edgeFadePx ?? {};
	const fL = Math.max(0, ef.left ?? 0);
	const fR = Math.max(0, ef.right ?? 0);
	const fT = Math.max(0, ef.top ?? 0);
	const fB = Math.max(0, ef.bottom ?? 0);
	const respawn = opts.respawn !== false;
	const rnd = state.rnd;
	const spawn = opts.spawn ?? {};
	const sx0 = spawn.x0 ?? 0, sx1 = spawn.x1 ?? 1;
	const sy0 = spawn.y0 ?? 0, sy1 = spawn.y1 ?? 0;
	const speed = opts.speed ?? {};
	const spMin = speed.min ?? 120;
	const spMax = speed.max ?? 220;
	const angle = opts.angle ?? {};
	const angMin = angle.min ?? Math.PI / 2;
	const angMax = angle.max ?? Math.PI / 2;
	const jPos = opts.jitter?.pos ?? 0;
	const jAng = opts.jitter?.velAngle ?? 0;
	const rMin = opts.size?.min ?? 1;
	const rMax = opts.size?.max ?? 2.5;
	const lMin = opts.length?.min ?? 6;
	const lMax = opts.length?.max ?? 12;
	const lifeMin = Math.max(.05, opts.lifetime?.min ?? .6);
	const lifeMax = Math.max(lifeMin, opts.lifetime?.max ?? 1.8);
	const sizeHz = typeof opts.sizeHz === "number" && Number.isFinite(opts.sizeHz) ? opts.sizeHz : 0;
	const lenHz = typeof opts.lenHz === "number" && Number.isFinite(opts.lenHz) ? opts.lenHz : 0;
	const wantSizeFollow = sizeHz > 0 && rMax !== rMin;
	const wantLenFollow = lenHz > 0 && lMax !== lMin;
	function decorrelatedSlot(uSlot) {
		const x = Math.sin((uSlot + .173) * 12.9898) * 43758.5453;
		return x - Math.floor(x);
	}
	function laneTargetSize(uSlot) {
		return rMin + (rMax - rMin) * decorrelatedSlot(uSlot);
	}
	function laneTargetLen(uSlot) {
		return lMin + (lMax - lMin) * decorrelatedSlot(uSlot);
	}
	function respawnParticle(pr, idx, total) {
		if (!(spawnMode === "stratified" && keepLane)) pr.uSlot = spawnMode === "stratified" ? (idx + rnd()) / Math.max(1, total) : rnd();
		const ux = mix(sx0, sx1, pr.uSlot);
		const uy = randRange(rnd, sy0, sy1);
		pr.x = rect.x + ux * rect.w + (rnd() * 2 - 1) * jPos;
		pr.y = rect.y + uy * rect.h + (rnd() * 2 - 1) * jPos;
		const sp = randRange(rnd, spMin, spMax);
		const ang = randRange(rnd, angMin - jAng, angMax + jAng);
		pr.vx = Math.cos(ang) * sp;
		pr.vy = Math.sin(ang) * sp;
		pr.life = randRange(rnd, lifeMin, lifeMax);
		pr.age = 0;
		pr.size = randRange(rnd, rMin, rMax);
		pr.len = randRange(rnd, lMin, lMax);
	}
	if (!state.warmStarted) {
		state.warmStarted = true;
		const warmStartSec = typeof opts.warmStartSec === "number" && Number.isFinite(opts.warmStartSec) ? Math.max(0, opts.warmStartSec) : 0;
		const warmStepSec = 1 / 30;
		const warmSteps = Math.min(180, Math.ceil(warmStartSec / warmStepSec));
		for (let step = 0; step < warmSteps; step++) {
			const stepSec = Math.min(warmStepSec, warmStartSec - step * warmStepSec);
			if (stepSec <= 0) break;
			for (const [i, pr] of state.particles.entries()) {
				advanceParticle(pr, stepSec, accX, accY);
				const alive = pr.age <= pr.life;
				const inside = pr.x >= rect.x && pr.x <= rect.x + rect.w && pr.y >= rect.y && pr.y <= rect.y + rect.h;
				if ((!alive || !inside) && respawn) respawnParticle(pr, i, state.particles.length);
			}
		}
	}
	for (const [i, pr] of state.particles.entries()) {
		advanceParticle(pr, dtSec, accX, accY);
		if (wantSizeFollow) pr.size = hzLerp(pr.size, laneTargetSize(pr.uSlot), sizeHz, dtSec);
		if (wantLenFollow) pr.len = hzLerp(pr.len, laneTargetLen(pr.uSlot), lenHz, dtSec);
		const alive = pr.age <= pr.life;
		const inside = pr.x >= rect.x && pr.x <= rect.x + rect.w && pr.y >= rect.y && pr.y <= rect.y + rect.h;
		if ((!alive || !inside) && respawn) respawnParticle(pr, i, state.particles.length);
	}
	p.push();
	const depthAlpha = clamp01(opts.depthAlpha ?? 1);
	for (const pr of state.particles) {
		let baseColor;
		if (typeof opts.color === "function") baseColor = opts.color(pr) ?? {
			r: 255,
			g: 255,
			b: 255,
			a: 255
		};
		else if (opts.color) baseColor = opts.color;
		else baseColor = {
			r: 200,
			g: 220,
			b: 255,
			a: 160
		};
		const aBase = baseColor.a ?? 255;
		const tLife = clamp01(pr.age / pr.life);
		const fIn = fadeInFrac > 0 ? smoothstep01(tLife / Math.max(1e-6, fadeInFrac)) : 1;
		const fOut = fadeOutFrac > 0 ? smoothstep01((1 - tLife) / Math.max(1e-6, fadeOutFrac)) : 1;
		let alpha = aBase * fIn * fOut;
		const dL = pr.x - rect.x;
		const dR = rect.x + rect.w - pr.x;
		const dT = pr.y - rect.y;
		const dB = rect.y + rect.h - pr.y;
		const eL = fL > 0 ? smoothstep01(dL / fL) : 1;
		const eR = fR > 0 ? smoothstep01(dR / fR) : 1;
		const eT = fT > 0 ? smoothstep01(dT / fT) : 1;
		const eB = fB > 0 ? smoothstep01(dB / fB) : 1;
		alpha *= eL * eR * eT * eB * depthAlpha;
		alpha = Math.max(0, Math.min(255, alpha));
		if (mode === "dot") {
			p.noStroke();
			p.fill(baseColor.r, baseColor.g, baseColor.b, alpha);
			p.circle(pr.x, pr.y, pr.size * 2);
		} else {
			const vLen = Math.hypot(pr.vx, pr.vy) || 1;
			const ux = pr.vx / vLen;
			const uy = pr.vy / vLen;
			const x2 = pr.x - ux * pr.len;
			const y2 = pr.y - uy * pr.len;
			const norm = (pr.size - rMin) / Math.max(1e-6, rMax - rMin);
			const baseThick = (norm < 0 ? 0 : norm > 1 ? 1 : norm) * 2 + 1;
			const dprGuess = typeof window !== "undefined" ? window.devicePixelRatio : 1;
			const dprK = 1 + Math.max(0, Math.min(1.5, dprGuess - 1)) * .9;
			const thick = baseThick * (typeof opts.thicknessScale === "number" && Number.isFinite(opts.thicknessScale) ? opts.thicknessScale : dprK);
			p.strokeWeight(thick);
			p.stroke(baseColor.r, baseColor.g, baseColor.b, alpha);
			p.line(pr.x, pr.y, x2, y2);
		}
	}
	p.pop();
}
//#endregion
//#region src/canvas-engine/modifiers/particles/particle-2.ts
function makeDormantParticle(uSlot) {
	return {
		x: 0,
		y: 0,
		vx: 0,
		vy: 0,
		age: 0,
		life: 0,
		size: 1,
		uSlot
	};
}
function stratifiedSlot(index, total, rnd) {
	const n = Math.max(1, total);
	return (index + .18 + rnd() * .64) / n;
}
function decorrelatedSlot(uSlot) {
	const x = Math.sin((uSlot + .173) * 12.9898) * 43758.5453;
	return x - Math.floor(x);
}
function hashPuffKey(s) {
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
	return h >>> 0;
}
function dirToAngleSpan(dir, spread) {
	const base = {
		none: NaN,
		down: Math.PI / 2,
		up: -Math.PI / 2,
		right: 0,
		left: Math.PI
	}[dir];
	if (Number.isNaN(base)) return {
		min: -Math.PI,
		max: Math.PI
	};
	return {
		min: base - spread,
		max: base + spread
	};
}
function ensureEmitter(store, opts) {
	const key = opts.key;
	const emitters = getPuffEmitterMap(store);
	let st = emitters.get(key);
	const wantCount = Math.max(1, Math.floor(opts.count ?? 32));
	const seed = hashPuffKey(key);
	const mk = () => {
		const rnd = makePRNG(seed);
		return {
			particles: Array.from({ length: wantCount }, (_, i) => makeDormantParticle(stratifiedSlot(i, wantCount, rnd))),
			rnd
		};
	};
	if (!st) {
		st = mk();
		emitters.set(key, st);
	} else if (st.particles.length !== wantCount) {
		if (st.particles.length < wantCount) {
			const rnd = st.rnd;
			for (let i = st.particles.length; i < wantCount; i++) st.particles.push(makeDormantParticle(stratifiedSlot(i, wantCount, rnd)));
		} else st.particles.length = wantCount;
		for (let i = 0; i < st.particles.length; i += 1) st.particles[i].uSlot = stratifiedSlot(i, wantCount, st.rnd);
	}
	return st;
}
function toP2WorkerOpts(opts) {
	return {
		rect: opts.rect,
		dir: opts.dir,
		spreadAngle: opts.spreadAngle,
		angle: opts.angle,
		spawnMode: opts.spawnMode,
		respawnStratified: opts.respawnStratified,
		spawn: opts.spawn,
		speed: opts.speed,
		accel: opts.accel,
		gravity: opts.gravity,
		jitter: opts.jitter,
		drag: opts.drag,
		count: opts.count,
		size: opts.size,
		sizeHz: opts.sizeHz,
		lifetime: opts.lifetime,
		respawn: opts.respawn,
		warmStartSec: opts.warmStartSec
	};
}
function drawP2FromBuffer(p, opts, buf) {
	const FPP = 7;
	const count = buf.length / FPP;
	const fadeInFrac = clamp01(opts.fadeInFrac ?? .12);
	const fadeOutFrac = clamp01(opts.fadeOutFrac ?? .25);
	const ef = opts.edgeFadePx ?? {};
	const fL = Math.max(0, ef.left ?? 0);
	const fR = Math.max(0, ef.right ?? 0);
	const fT = Math.max(0, ef.top ?? 0);
	const fB = Math.max(0, ef.bottom ?? 0);
	const depthAlpha = clamp01(opts.depthAlpha ?? 1);
	const rect = opts.rect;
	const baseColor = opts.color && typeof opts.color !== "function" ? opts.color : {
		r: 235,
		g: 240,
		b: 245,
		a: 180
	};
	const aBase = baseColor.a ?? 255;
	p.push();
	p.noStroke();
	for (let i = 0; i < count; i++) {
		const b = i * FPP;
		const x = buf[b], y = buf[b + 1];
		const size = buf[b + 4], tLife = buf[b + 6];
		const fIn = fadeInFrac > 0 ? smoothstep01(tLife / Math.max(1e-6, fadeInFrac)) : 1;
		const fOut = fadeOutFrac > 0 ? smoothstep01((1 - tLife) / Math.max(1e-6, fadeOutFrac)) : 1;
		const eL = fL > 0 ? smoothstep01((x - rect.x) / fL) : 1;
		const eR = fR > 0 ? smoothstep01((rect.x + rect.w - x) / fR) : 1;
		const eT = fT > 0 ? smoothstep01((y - rect.y) / fT) : 1;
		const eB = fB > 0 ? smoothstep01((rect.y + rect.h - y) / fB) : 1;
		let alpha = aBase * fIn * fOut * eL * eR * eT * eB * depthAlpha;
		alpha = Math.max(0, Math.min(255, alpha));
		p.fill(baseColor.r, baseColor.g, baseColor.b, alpha);
		p.circle(x, y, size * 2);
	}
	p.pop();
}
function stepAndDrawPuffs(p, opts, dtSec) {
	if (opts.useWorker && isWorkerSupported()) if (typeof opts.color === "function") warnFunctionColor(opts.key);
	else {
		sendP2Tick(opts.key, dtSec, toP2WorkerOpts(opts));
		const buf = getLastParticles(opts.key);
		if (buf) drawP2FromBuffer(p, opts, buf);
		return;
	}
	if (!opts.store) return;
	const state = ensureEmitter(opts.store, opts);
	const rect = opts.rect;
	const spawnMode = opts.spawnMode ?? "stratified";
	const keepLane = opts.respawnStratified ?? true;
	const respawn = opts.respawn !== false;
	const accX = opts.accel?.x ?? 0;
	const accY = (opts.accel?.y ?? 0) + (opts.gravity ?? 0);
	const drag = Math.max(0, opts.drag ?? 0);
	const fadeInFrac = clamp01(opts.fadeInFrac ?? .12);
	const fadeOutFrac = clamp01(opts.fadeOutFrac ?? .25);
	const ef = opts.edgeFadePx ?? {};
	const fL = Math.max(0, ef.left ?? 0);
	const fR = Math.max(0, ef.right ?? 0);
	const fT = Math.max(0, ef.top ?? 0);
	const fB = Math.max(0, ef.bottom ?? 0);
	const rnd = state.rnd;
	const spawn = opts.spawn ?? {};
	const sx0 = spawn.x0 ?? 0, sx1 = spawn.x1 ?? 1;
	const sy0 = spawn.y0 ?? 0, sy1 = spawn.y1 ?? 0;
	const speed = opts.speed ?? {};
	const spMin = speed.min ?? 12;
	const spMax = speed.max ?? 48;
	let angMin, angMax;
	const angleMin = opts.angle?.min;
	const angleMax = opts.angle?.max;
	if (typeof angleMin === "number" && Number.isFinite(angleMin) || typeof angleMax === "number" && Number.isFinite(angleMax)) {
		angMin = typeof angleMin === "number" && Number.isFinite(angleMin) ? angleMin : 0;
		angMax = typeof angleMax === "number" && Number.isFinite(angleMax) ? angleMax : 0;
	} else {
		const span = dirToAngleSpan(opts.dir ?? "none", typeof opts.spreadAngle === "number" && Number.isFinite(opts.spreadAngle) ? opts.spreadAngle : .35);
		angMin = span.min;
		angMax = span.max;
	}
	const jPos = opts.jitter?.pos ?? 0;
	const jAng = opts.jitter?.velAngle ?? 0;
	const rMin = opts.size?.min ?? 1.2;
	const rMax = Math.max(rMin, opts.size?.max ?? 3.2);
	const lifeMin = Math.max(.1, opts.lifetime?.min ?? .8);
	const lifeMax = Math.max(lifeMin, opts.lifetime?.max ?? 2.2);
	const sizeHz = typeof opts.sizeHz === "number" && Number.isFinite(opts.sizeHz) ? opts.sizeHz : 0;
	const wantSizeFollow = sizeHz > 0 && rMax !== rMin;
	function laneTargetSize(uSlot) {
		return rMin + (rMax - rMin) * decorrelatedSlot(uSlot);
	}
	function advanceParticle(pr, stepSec) {
		if (drag > 0 && stepSec > 0) {
			const k = Math.exp(-drag * stepSec);
			pr.vx *= k;
			pr.vy *= k;
		}
		pr.vx += accX * stepSec;
		pr.vy += accY * stepSec;
		pr.x += pr.vx * stepSec;
		pr.y += pr.vy * stepSec;
		pr.age += stepSec;
	}
	function prewarmParticle(pr) {
		const travelX = Math.abs(pr.vx) > 1 ? rect.w / Math.abs(pr.vx) : Infinity;
		const travelY = Math.abs(pr.vy) > 1 ? rect.h / Math.abs(pr.vy) : Infinity;
		const travelSec = Math.min(travelX, travelY);
		const maxAge = Number.isFinite(travelSec) ? Math.min(pr.life * .85, travelSec * .95) : pr.life * .5;
		advanceParticle(pr, rnd() * Math.max(0, maxAge));
	}
	function respawnParticle(pr, idx, total, prewarm = false) {
		if (!(spawnMode === "stratified" && keepLane)) pr.uSlot = spawnMode === "stratified" ? (idx + rnd()) / Math.max(1, total) : rnd();
		const ux = mix(sx0, sx1, pr.uSlot);
		const uy = randRange(rnd, sy0, sy1);
		pr.x = rect.x + ux * rect.w + (rnd() * 2 - 1) * jPos;
		pr.y = rect.y + uy * rect.h + (rnd() * 2 - 1) * jPos;
		const sp = randRange(rnd, spMin, spMax);
		const ang = randRange(rnd, angMin - jAng, angMax + jAng);
		pr.vx = Math.cos(ang) * sp;
		pr.vy = Math.sin(ang) * sp;
		pr.life = randRange(rnd, lifeMin, lifeMax);
		pr.age = 0;
		pr.size = randRange(rnd, rMin, rMax);
		if (prewarm) prewarmParticle(pr);
	}
	for (const [i, pr] of state.particles.entries()) if (pr.life <= 0) respawnParticle(pr, i, state.particles.length, true);
	if (!state.warmStarted) {
		state.warmStarted = true;
		const warmStartSec = typeof opts.warmStartSec === "number" && Number.isFinite(opts.warmStartSec) ? Math.max(0, opts.warmStartSec) : 0;
		const warmStepSec = 1 / 30;
		const warmSteps = Math.min(180, Math.ceil(warmStartSec / warmStepSec));
		for (let step = 0; step < warmSteps; step++) {
			const stepSec = Math.min(warmStepSec, warmStartSec - step * warmStepSec);
			if (stepSec <= 0) break;
			for (const [i, pr] of state.particles.entries()) {
				advanceParticle(pr, stepSec);
				const alive = pr.age <= pr.life;
				const inside = pr.x >= rect.x && pr.x <= rect.x + rect.w && pr.y >= rect.y && pr.y <= rect.y + rect.h;
				if ((!alive || !inside) && respawn) respawnParticle(pr, i, state.particles.length);
			}
		}
	}
	for (const [i, pr] of state.particles.entries()) {
		advanceParticle(pr, dtSec);
		if (wantSizeFollow) pr.size = hzLerp(pr.size, laneTargetSize(pr.uSlot), sizeHz, dtSec);
		const alive = pr.age <= pr.life;
		const inside = pr.x >= rect.x && pr.x <= rect.x + rect.w && pr.y >= rect.y && pr.y <= rect.y + rect.h;
		if ((!alive || !inside) && respawn) respawnParticle(pr, i, state.particles.length);
	}
	p.push();
	p.noStroke();
	const depthAlpha = clamp01(opts.depthAlpha ?? 1);
	for (const pr of state.particles) {
		let baseColor;
		if (typeof opts.color === "function") baseColor = opts.color(pr) ?? {
			r: 255,
			g: 255,
			b: 255,
			a: 255
		};
		else if (opts.color) baseColor = opts.color;
		else baseColor = {
			r: 235,
			g: 240,
			b: 245,
			a: 180
		};
		const aBase = baseColor.a ?? 255;
		const tLife = clamp01(pr.age / pr.life);
		const fIn = fadeInFrac > 0 ? smoothstep01(tLife / Math.max(1e-6, fadeInFrac)) : 1;
		const fOut = fadeOutFrac > 0 ? smoothstep01((1 - tLife) / Math.max(1e-6, fadeOutFrac)) : 1;
		const dL = pr.x - rect.x;
		const dR = rect.x + rect.w - pr.x;
		const dT = pr.y - rect.y;
		const dB = rect.y + rect.h - pr.y;
		const eL = fL > 0 ? smoothstep01(dL / fL) : 1;
		const eR = fR > 0 ? smoothstep01(dR / fR) : 1;
		const eT = fT > 0 ? smoothstep01(dT / fT) : 1;
		const eB = fB > 0 ? smoothstep01(dB / fB) : 1;
		let alpha = aBase * fIn * fOut * eL * eR * eT * eB * depthAlpha;
		alpha = Math.max(0, Math.min(255, alpha));
		p.fill(baseColor.r, baseColor.g, baseColor.b, alpha);
		p.circle(pr.x, pr.y, pr.size * 2);
	}
	p.pop();
}
//#endregion
//#region src/canvas-engine/modifiers/particles/perspective/rowHeightBuckets.ts
function buildRowHeightBuckets(rowHeights, fallbackH, dedupeEpsilon = .5) {
	if (!Array.isArray(rowHeights) || rowHeights.length < 1) return [fallbackH];
	const sortedHeights = [...rowHeights].sort((a, b) => a - b);
	const buckets = [];
	for (const h of sortedHeights) if (buckets.length === 0 || Math.abs(h - buckets[buckets.length - 1]) > dedupeEpsilon) buckets.push(h);
	return buckets.length > 0 ? buckets : [fallbackH];
}
function resolveRowHeightBucketFromHeight(baseTileHeight, rowHeights, fallbackH, dedupeEpsilon = .5) {
	const buckets = buildRowHeightBuckets(rowHeights, fallbackH, dedupeEpsilon);
	let bucketIndex = 0;
	let bestDist = Infinity;
	for (let i = 0; i < buckets.length; i++) {
		const d = Math.abs(baseTileHeight - buckets[i]);
		if (d < bestDist) {
			bestDist = d;
			bucketIndex = i;
		}
	}
	return {
		t: buckets.length > 1 ? bucketIndex / (buckets.length - 1) : 1,
		bucketIndex,
		bucketCount: buckets.length,
		baseTileHeight,
		bucketHeight: buckets[bucketIndex] ?? baseTileHeight,
		buckets
	};
}
function resolvePlacedGridBottomRowBucket(rect, opts, dedupeEpsilon = .5) {
	const rowHeights = opts.rowHeights;
	const fallbackH = opts.cellH ?? opts.cell ?? 1;
	if (!Array.isArray(rowHeights) || rowHeights.length < 1) return resolveRowHeightBucketFromHeight(fallbackH, rowHeights, fallbackH, dedupeEpsilon);
	const baseTileHeight = rowHeights[Math.max(0, Math.min(rowHeights.length - 1, rect.r0 + rect.h - 1))];
	return resolveRowHeightBucketFromHeight(baseTileHeight, rowHeights, fallbackH, dedupeEpsilon);
}
function mapBucketRange(t, min, max) {
	return min + (max - min) * t;
}
//#endregion
//#region src/canvas-engine/modifiers/particles/perspective/particlePerspective.ts
function particleRowBucket(rect, opts, dedupeEpsilon = .5) {
	return resolvePlacedGridBottomRowBucket(rect, opts, dedupeEpsilon);
}
var particleBucketRange = mapBucketRange;
function particleDepthAlpha(bucketOrT, minAlpha = .55) {
	const farK = 1 - clamp01(typeof bucketOrT === "number" ? bucketOrT : bucketOrT?.t ?? 1);
	return 1 - Math.pow(farK, .9) * (1 - clamp01(minAlpha));
}
function particleDepthSizeScale(bucketOrT, farScale = .72, nearScale = 1.16) {
	const t = typeof bucketOrT === "number" ? bucketOrT : bucketOrT?.t ?? 1;
	const shapedT = Math.pow(clamp01(t), .9);
	return farScale + (nearScale - farScale) * shapedT;
}
//#endregion
//#region src/canvas-engine/modifiers/projection/index.ts
function rowValue(values, row, fallback) {
	return values?.[row] ?? fallback;
}
function nonZeroBase(value) {
	return Math.max(1e-6, value === 0 ? 1 : value);
}
function footprintToPx(f, opts) {
	if (opts.pixelFootprint) return opts.pixelFootprint;
	const cell = opts.cell ?? 0;
	const cellW = opts.cellW ?? cell;
	const cellH = opts.cellH ?? cell;
	const bottomRow = f.r0 + f.h - 1;
	const unitW = rowValue(opts.cellWPerRow, bottomRow, cellW);
	const unitH = rowValue(opts.rowHeights, bottomRow, cellH);
	const unitOY = rowValue(opts.rowOffsetY, bottomRow, bottomRow * cellH);
	const x = f.c0 * unitW;
	const w = f.w * unitW;
	const h = f.h * unitH;
	return {
		x,
		y: unitOY - unitH * (f.h - 1),
		w,
		h
	};
}
function rowHeightAt(row, opts) {
	const cellH = opts.cellH ?? opts.cell ?? 0;
	return rowValue(opts.rowHeights, row, cellH);
}
function rowWidthAt(row, opts) {
	const cellW = opts.cellW ?? opts.cell ?? 0;
	return rowValue(opts.cellWPerRow, row, cellW);
}
function particlePerspectiveScale(f, opts) {
	const cell = opts.cell ?? 0;
	const baseW = opts.cellW ?? cell;
	const baseH = opts.cellH ?? cell;
	const bottomRow = f.r0 + f.h - 1;
	const unitW = rowValue(opts.cellWPerRow, bottomRow, baseW);
	const unitH = rowValue(opts.rowHeights, bottomRow, baseH);
	const scaleW = unitW / nonZeroBase(baseW);
	const scaleH = unitH / nonZeroBase(baseH);
	const scale = Math.sqrt(Math.max(1e-6, scaleW * scaleH));
	return Math.max(.4, Math.min(3, scale));
}
function particleSizePerspectiveScale(f, opts) {
	const scale = particlePerspectiveScale(f, opts);
	return Math.max(.18, Math.min(3.2, Math.pow(scale, 1.35)));
}
function particleMotionPerspectiveScale(f, opts) {
	const scale = particlePerspectiveScale(f, opts);
	return Math.max(.12, Math.min(3.4, Math.pow(scale, 1.75)));
}
//#endregion
//#region src/canvas-engine/modifiers/lighting/index.ts
var PIXEL_LIGHT_BAND_ALPHA_BOOST = 1.22;
var TRIANGLE_LIGHT_BAND_ALPHA_BOOST = 1.24;
var DEFAULT_LIGHT_CLOSENESS_BREAKPOINTS = {
	mid: .52,
	near: .74
};
function closenessDistanceScale(light) {
	const aspect = light.sceneW / Math.max(1, light.sceneH);
	const aspectBoost = 1.08 + clamp01((1.75 - aspect) / .55) * .34;
	const portraitK = clamp01(1 - aspect);
	const base = light.sceneW * (1 - portraitK) + light.sceneH * portraitK;
	const portraitBoost = 1 + portraitK * 1.1;
	return base * aspectBoost * portraitBoost;
}
function lightClosenessBand(closenessK, breakpoints = DEFAULT_LIGHT_CLOSENESS_BREAKPOINTS) {
	const k = clamp01(closenessK);
	if (k >= clamp01(breakpoints.near)) return "near";
	if (k >= clamp01(breakpoints.mid)) return "mid";
	return "far";
}
function pickLightBandValue(base, byLight, closenessK, breakpoints = DEFAULT_LIGHT_CLOSENESS_BREAKPOINTS) {
	const band = lightClosenessBand(closenessK, breakpoints);
	return byLight?.[band] ?? base;
}
function alphaByte(value) {
	if (!Number.isFinite(value)) return 0;
	return Math.max(0, Math.min(255, Math.round(value)));
}
function createSceneLightContext(opts) {
	const { lightItem, darkMode, canvasW, canvasH, ...projection } = opts;
	if (!lightItem) return null;
	let sourceX = lightItem.x;
	let sourceY = lightItem.y;
	if (lightItem.footprint) {
		const { x, y, w, h } = footprintToPx(lightItem.footprint, projection);
		sourceX = x + w / 2;
		sourceY = y + h / 2;
	}
	return {
		sourceX,
		sourceY,
		kind: darkMode ? "moon" : "sun",
		intensity: darkMode ? .88 : 1.22,
		paletteClosenessK: typeof lightItem.paletteClosenessK === "number" ? clamp01(lightItem.paletteClosenessK) : void 0,
		sceneW: Math.max(1, canvasW),
		sceneH: Math.max(1, canvasH),
		sceneDiag: Math.max(1, Math.hypot(canvasW, canvasH)),
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
function sampleDirectionalLightRect(rect, light) {
	if (!light) return {
		overallK: 0,
		closenessK: 0,
		leftK: 0,
		rightK: 0,
		topK: 0,
		bottomK: 0,
		xBias: 0,
		yBias: 0,
		lightColor: {
			r: 255,
			g: 255,
			b: 255
		},
		shadowColor: {
			r: 0,
			g: 0,
			b: 0
		}
	};
	const cx = rect.x + rect.w / 2;
	const cy = rect.y + rect.h / 2;
	const dx = light.sourceX - cx;
	const dy = light.sourceY - cy;
	const dist = Math.max(1e-6, Math.hypot(dx, dy));
	const nx = dx / dist;
	const ny = dy / dist;
	const falloffK = clamp01(1 - dist / (light.sceneDiag * 1.75));
	const closenessK = typeof light.paletteClosenessK === "number" ? clamp01(light.paletteClosenessK) : clamp01(1 - dist / closenessDistanceScale(light));
	const overallK = Math.min(1.48, light.intensity * (.96 + .22 * falloffK + .24 * falloffK * falloffK));
	const proximityHighlightK = Math.pow(closenessK, 1.35) * (light.kind === "moon" ? .18 : .24);
	const lightColor = mixRgb(light.lightColor, {
		r: 255,
		g: 255,
		b: 255
	}, proximityHighlightK);
	return {
		overallK,
		closenessK,
		leftK: overallK * Math.max(0, -nx),
		rightK: overallK * Math.max(0, nx),
		topK: overallK * Math.max(0, -ny),
		bottomK: overallK * Math.max(0, ny),
		xBias: nx,
		yBias: ny,
		lightColor,
		shadowColor: light.shadowColor
	};
}
function paintPixelLightBands(p, rect, light, opts) {
	const { x, y, w, h } = rect;
	if (!p || w <= 0 || h <= 0) return;
	const sideLitK = Math.max(light.leftK, light.rightK);
	const sideW = Math.max(2, Math.round(w * .16));
	const sideX = light.leftK >= light.rightK ? x : x + w - sideW;
	const topH = Math.max(2, Math.round(h * .12));
	const shadowW = Math.max(2, Math.round(w * .12));
	const shadowX = light.leftK >= light.rightK ? x + w - shadowW : x;
	const corner = opts.corner ?? 0;
	const sideAlpha = alphaByte(opts.alpha * (opts.sideK ?? .48) * sideLitK * PIXEL_LIGHT_BAND_ALPHA_BOOST);
	const topAlpha = alphaByte(opts.alpha * (opts.topK ?? .34) * light.topK * PIXEL_LIGHT_BAND_ALPHA_BOOST);
	const shadowAlpha = alphaByte(opts.alpha * (opts.shadowK ?? .22) * sideLitK);
	p.noStroke();
	p.fill(opts.highlightColor.r, opts.highlightColor.g, opts.highlightColor.b, sideAlpha);
	p.rect(sideX, y + 1, sideW, Math.max(0, h - 2), Math.round(sideW * .35));
	p.fill(opts.highlightColor.r, opts.highlightColor.g, opts.highlightColor.b, topAlpha);
	p.rect(x + 1, y, Math.max(0, w - 2), topH, corner, corner, 0, 0);
	p.fill(opts.shadowColor.r, opts.shadowColor.g, opts.shadowColor.b, shadowAlpha);
	p.rect(shadowX, y + 1, shadowW, Math.max(0, h - 2), Math.round(shadowW * .35));
}
function paintDirectionalTriangleBands(p, tri, light, opts) {
	if (!p) return;
	const { leftX, rightX, baseY, apexX, apexY } = tri;
	const { alpha, highlightColor, shadowColor } = opts;
	const width = Math.max(1, rightX - leftX);
	const litLeft = light.leftK >= light.rightK;
	const roofVisibleK = clamp01(1 - light.bottomK * 1.25);
	const litK = Math.max(light.leftK, light.rightK) * roofVisibleK;
	const centerX = leftX + width * .5;
	const litInnerX = litLeft ? leftX + width * .58 : rightX - width * .58;
	const shadowInnerX = litLeft ? rightX - width * .54 : leftX + width * .54;
	const topBaseInset = width * .18;
	const topApexY = apexY + Math.max(1, (baseY - apexY) * .18);
	const bandBaseY = baseY - Math.max(2, (baseY - apexY) * .18);
	p.push();
	p.noStroke();
	p.fill(highlightColor.r, highlightColor.g, highlightColor.b, alphaByte(alpha * .42 * litK * TRIANGLE_LIGHT_BAND_ALPHA_BOOST));
	p.beginShape();
	p.vertex(apexX, apexY);
	p.vertex(litLeft ? leftX : rightX, bandBaseY);
	p.vertex(litInnerX, bandBaseY);
	p.endShape(p.CLOSE);
	p.fill(highlightColor.r, highlightColor.g, highlightColor.b, alphaByte(alpha * .34 * light.topK * roofVisibleK * TRIANGLE_LIGHT_BAND_ALPHA_BOOST));
	p.beginShape();
	p.vertex(leftX + topBaseInset, bandBaseY);
	p.vertex(rightX - topBaseInset, bandBaseY);
	p.vertex(centerX, topApexY);
	p.endShape(p.CLOSE);
	p.fill(shadowColor.r, shadowColor.g, shadowColor.b, alphaByte(alpha * .24 * litK));
	p.beginShape();
	p.vertex(apexX, apexY);
	p.vertex(litLeft ? rightX : leftX, bandBaseY);
	p.vertex(shadowInnerX, bandBaseY);
	p.endShape(p.CLOSE);
	p.pop();
}
//#endregion
//#region src/canvas-engine/shapes/options.ts
var EMPTY_PROJECTION = {};
var EMPTY_STYLE = {};
var EMPTY_LIFECYCLE = {};
var EMPTY_IDENTITY = {};
var EMPTY_SPRITE = {};
var EMPTY_PARTICLES = {};
var EMPTY_PASS = {};
function shapeProjection(opts) {
	return opts.projection ?? EMPTY_PROJECTION;
}
function shapeStyle(opts) {
	return opts.style ?? EMPTY_STYLE;
}
function shapeLifecycle(opts) {
	return opts.lifecycle ?? EMPTY_LIFECYCLE;
}
function shapeIdentity(opts) {
	return opts.identity ?? EMPTY_IDENTITY;
}
function shapeSprite(opts) {
	return opts.sprite ?? EMPTY_SPRITE;
}
function shapeParticles(opts) {
	return opts.particles ?? EMPTY_PARTICLES;
}
function shapePass(opts) {
	return opts.pass ?? EMPTY_PASS;
}
//#endregion
//#region src/canvas-engine/shapes/clouds.ts
var RAIN = {
	enabled: true,
	spawnX0: .12,
	spawnX1: .88,
	spawnY0: .22,
	spawnY1: 0,
	angleMin: Math.PI * .48,
	angleMax: Math.PI * .52,
	speedMin: [260, 140],
	speedMax: [300, 160],
	gravity: 0,
	accelX: 0,
	accelY: 0,
	jitterPos: [3, 0],
	jitterAngle: [.36, 0],
	count: [24, 18],
	sizeMin: [1.1, 1.2],
	sizeMax: [1.2, 1.4],
	lengthMin: [2, 5],
	lengthMax: [3.5, 7.5],
	lifeMin: 4,
	lifeMax: 5,
	fadeInFrac: .15,
	fadeOutFrac: .25,
	warmStartSec: 1.2,
	fadeLeft: 12,
	fadeRight: 12,
	fadeTop: 8,
	fadeBottom: 32,
	alpha: [100, 220],
	blend: [.02, .1]
};
var CLOUDS = {
	widthEnv: [.72, .86],
	heightEnv: [.24, .88],
	spreadX: [.72, .82],
	arcLift: [.12, .38],
	rBaseK: [.36, .46],
	rJitter: [.08, .14],
	lobeCount: [6, 9],
	sCap: [.14, .24],
	oscAmp: [.2, .12],
	oscSpeed: [.32, .26],
	wobbleAmp: [1.4, 1],
	blend: [.4, .08]
};
var WOBBLE = { ampScale: [.8, .95] };
var CLOUDS_BASE_PALETTE = {
	default: {
		r: 236,
		g: 238,
		b: 242
	},
	rain: {
		r: 20,
		g: 165,
		b: 255
	}
};
var CLOUDS_DARK_PALETTE = {
	default: {
		r: 139,
		g: 140,
		b: 185
	},
	rain: {
		r: 11,
		g: 104,
		b: 195
	}
};
var CLOUDS_WARM_PALETTE = {
	default: {
		r: 248,
		g: 238,
		b: 226
	},
	rain: {
		r: 30,
		g: 158,
		b: 228
	}
};
var CLOUDS_COOL_PALETTE = {
	default: {
		r: 228,
		g: 236,
		b: 248
	},
	rain: {
		r: 15,
		g: 148,
		b: 238
	}
};
function cloudRowContext(t) {
	return {
		width: particleBucketRange(t, 1.1, 1),
		height: particleBucketRange(t, 1.46, 1),
		overlap: particleBucketRange(t, .78, 1),
		radius: particleBucketRange(t, 1.52, 1),
		lobeCount: particleBucketRange(t, .9, 1),
		arcLift: particleBucketRange(t, .56, 1),
		radiusFromWidth: particleBucketRange(t, 1.42, 2.35),
		radiusJitter: particleBucketRange(t, .38, 1),
		centerSpacing: particleBucketRange(t, 1.05, 1.2),
		wobbleAmp: particleBucketRange(t, .08, 1),
		wobbleHz: particleBucketRange(t, .1, 1),
		lobeDrift: particleBucketRange(t, .14, 1)
	};
}
function rainRowContextScale(t) {
	return {
		size: particleBucketRange(t, .26, 1),
		length: particleBucketRange(t, .34, 1),
		motion: particleBucketRange(t, .05, 1),
		life: particleBucketRange(t, 1.58, 1),
		count: particleBucketRange(t, .62, 1)
	};
}
function drawClouds(p, _cx, _cy, _r, opts = {}) {
	const projection = shapeProjection(opts);
	const style = shapeStyle(opts);
	const lifecycle = shapeLifecycle(opts);
	const identity = shapeIdentity(opts);
	const sprite = shapeSprite(opts);
	const particles = shapeParticles(opts);
	const pass = shapePass(opts);
	const darkMode = style.darkMode === true;
	const pal = style.palette ?? (darkMode ? CLOUDS_DARK_PALETTE : opts.paletteTheme === "warm" ? CLOUDS_WARM_PALETTE : opts.paletteTheme === "cool" ? CLOUDS_COOL_PALETTE : CLOUDS_BASE_PALETTE);
	const cell = projection.cell;
	const f = projection.footprint;
	if (!cell || !f) return;
	const t = (typeof lifecycle.timeMs === "number" ? lifecycle.timeMs : p.millis()) / 1e3;
	const seedKey = identity.seedKey ?? identity.seed ?? `clouds|${String(f.r0)}:${String(f.c0)}|${String(f.w)}x${String(f.h)}`;
	const seed = shapeHash32(String(seedKey)) | 0;
	const u = clamp01(style.liveAvg ?? .5);
	const dt = Math.max(.001, typeof lifecycle.dtSec === "number" && Number.isFinite(lifecycle.dtSec) ? lifecycle.dtSec : (p.deltaTime || 16) / 1e3);
	const drawRain = opts.drawRain !== false;
	const drawCloudBody = opts.drawCloudBody !== false;
	const visualRow = f.r0 + f.h - 1;
	const rowBucket = particleRowBucket(f, projection);
	const rainRowBucket = rowBucket;
	const cloudRow = cloudRowContext(rowBucket.t);
	const rainScale = rainRowContextScale(rainRowBucket.t);
	const rainDepthSizeK = particleDepthSizeScale(rainRowBucket);
	const pixelScale = typeof sprite.particlePixelScale === "number" && Number.isFinite(sprite.particlePixelScale) ? Math.max(.25, sprite.particlePixelScale) : Math.max(1, sprite.pixelScale ?? sprite.coreScaleMult ?? 1);
	const sizeK = rainScale.size * rainDepthSizeK * Math.pow(pixelScale, 1.15);
	const lengthK = rainScale.length * rainDepthSizeK * Math.pow(pixelScale, 1.05);
	const motionK = rainScale.motion * pixelScale;
	const lifeK = rainScale.life * Math.pow(pixelScale, 1.2);
	const countK = rainScale.count * Math.sqrt(pixelScale);
	const visualCellW = rowWidthAt(visualRow, projection);
	const { x: fpX, y: y0, w: fpW } = footprintToPx(f, projection);
	const wTop = f.w * visualCellW;
	const anchorX = fpX + fpW / 2;
	const x0 = anchorX - wTop / 2;
	const hTop = rowHeightAt(visualRow, projection);
	const anchorY = y0 + hTop * .6;
	const wEnv = wTop * resolveRangeValue(CLOUDS.widthEnv, u) * cloudRow.width;
	const hEnv = hTop * resolveRangeValue(CLOUDS.heightEnv, u) * cloudRow.height;
	const spreadXBase = resolveRangeValue(CLOUDS.spreadX, u) * cloudRow.overlap;
	const arcLift = resolveRangeValue(CLOUDS.arcLift, u) * cloudRow.arcLift;
	const rJitter = resolveRangeValue(CLOUDS.rJitter, u) * cloudRow.radiusJitter;
	const lobeCount = Math.max(4, Math.round(resolveRangeValue(CLOUDS.lobeCount, u) * cloudRow.lobeCount));
	const rBaseFromHeight = hTop * resolveRangeValue(CLOUDS.rBaseK, u) * cloudRow.radius;
	const rBaseFromWidth = wEnv / Math.max(4.5, lobeCount * cloudRow.radiusFromWidth);
	const rBase = Math.max(rBaseFromHeight, rBaseFromWidth);
	const continuitySpan = Math.max(rBase * 1.85, (lobeCount - 1) * rBase * cloudRow.centerSpacing);
	const lobes = makeArchLobes(anchorX, anchorY, wEnv, hEnv, {
		count: lobeCount,
		spreadX: Math.max(.22, Math.min(spreadXBase, continuitySpan / Math.max(1, wEnv))),
		arcLift,
		rBase,
		rJitter,
		seed
	});
	const cloudBlendDefault = resolveRangeValue(CLOUDS.blend, u);
	const cloudBlend = typeof opts.cloudBlend === "number" ? opts.cloudBlend : cloudBlendDefault;
	const baseTint = typeof opts.cloudCss === "string" && opts.cloudCss.trim().length > 0 ? cssToRgbViaCanvas(p, opts.cloudCss) : blendRGB(pal.default, style.gradientRGB ?? void 0, cloudBlend);
	const sMax = Math.max(0, Math.min(1, resolveRangeValue(CLOUDS.sCap, u)));
	const { h, s, l } = rgbToHsl(baseTint);
	const cloudRgb = applyDepthTint(oscillateSaturation(hslToRgb({
		h,
		s: Math.min(s, sMax),
		l
	}), t, {
		amp: typeof opts.oscAmp === "number" ? opts.oscAmp : resolveRangeValue(CLOUDS.oscAmp, u),
		speed: typeof opts.oscSpeed === "number" ? opts.oscSpeed : resolveRangeValue(CLOUDS.oscSpeed, u),
		phase: opts.oscPhase ?? 0
	}), pass);
	const wobbleK = resolveRangeValue(CLOUDS.wobbleAmp, u) * resolveRangeValue(WOBBLE.ampScale, u) * cloudRow.wobbleAmp;
	const ampX = (opts.dispAmp ?? Math.min(12, Math.max(6, Math.round(hTop * .12)))) * wobbleK;
	const ampY = (typeof opts.dispAmpY === "number" ? opts.dispAmpY : Math.round(ampX * .85)) * wobbleK;
	const ampS = Math.max(0, Math.min(.25, opts.dispScale ?? .12)) * wobbleK;
	const fX = Math.max(.01, (opts.dispSpeed ?? .22) * cloudRow.wobbleHz);
	const fY = fX * .85;
	const fS = fX * .6;
	const groupDrift = displacementOsc(t, -1, {
		ampX: ampX * .72,
		ampY: ampY * .72,
		ampScale: ampS * .28,
		freqX: fX * .72,
		freqY: fY * .72,
		freqScale: fS * .72,
		seed
	});
	const lobeDriftK = cloudRow.lobeDrift;
	const appear = applyShapeMods({
		p,
		x: anchorX,
		y: anchorY,
		r: Math.min(wTop, hTop),
		opts: {
			alpha: finiteNumber(opts.cloudAlpha, 235),
			timeMs: lifecycle.timeMs,
			liveAvg: style.liveAvg,
			rootAppearK: lifecycle.rootAppearK
		},
		mods: { appear: {
			anchor: "center",
			ease: "back",
			backOvershoot: 1.2
		} }
	});
	const cloudAlpha = typeof appear.alpha === "number" ? appear.alpha : finiteNumber(opts.cloudAlpha, 235);
	if (drawRain && RAIN.enabled) {
		const rect = {
			x: x0,
			y: y0 + hTop * .5,
			w: wTop,
			h: hTop * 2.5
		};
		const speedMin = resolveRangeValue(RAIN.speedMin, u) * motionK;
		const speedMax = resolveRangeValue(RAIN.speedMax, u) * motionK;
		const jitterPos = resolveRangeValue(RAIN.jitterPos, u);
		const jitterAngle = resolveRangeValue(RAIN.jitterAngle, u);
		const count = Math.max(8, Math.floor(resolveRangeValue(RAIN.count, u) * countK));
		const sizeMin = resolveRangeValue(RAIN.sizeMin, u) * sizeK;
		const sizeMax = Math.max(sizeMin, resolveRangeValue(RAIN.sizeMax, u) * sizeK);
		const lengthMin = resolveRangeValue(RAIN.lengthMin, u) * lengthK;
		const lengthMax = Math.max(lengthMin, resolveRangeValue(RAIN.lengthMax, u) * lengthK);
		const baseAlpha = Math.round(resolveRangeValue(RAIN.alpha, u));
		const syncedAlpha = Math.round(baseAlpha * (cloudAlpha / 255));
		const rainBlend = typeof opts.rainBlend === "number" ? opts.rainBlend : resolveRangeValue(RAIN.blend, 1 - u);
		const depthRainTint = applyDepthTint(typeof opts.rainCss === "string" && opts.rainCss.trim().length > 0 ? cssToRgbViaCanvas(p, opts.rainCss) : blendRGB(pal.rain, style.gradientRGB ?? void 0, rainBlend), pass, .7);
		const rainColor = {
			r: depthRainTint.r,
			g: depthRainTint.g,
			b: depthRainTint.b,
			a: syncedAlpha
		};
		stepAndDrawParticles(p, {
			store: particles.particleStore,
			key: `cloud-rain:${String(seedKey)}`,
			rect,
			mode: "line",
			color: rainColor,
			depthAlpha: particleDepthAlpha(rainRowBucket),
			spawn: {
				x0: RAIN.spawnX0,
				x1: RAIN.spawnX1,
				y0: RAIN.spawnY0,
				y1: RAIN.spawnY1
			},
			angle: {
				min: RAIN.angleMin,
				max: RAIN.angleMax
			},
			speed: {
				min: speedMin,
				max: speedMax
			},
			gravity: RAIN.gravity,
			accel: {
				x: RAIN.accelX,
				y: RAIN.accelY
			},
			jitter: {
				pos: jitterPos,
				velAngle: jitterAngle
			},
			count,
			size: {
				min: sizeMin,
				max: sizeMax
			},
			length: {
				min: lengthMin,
				max: lengthMax
			},
			sizeHz: 8,
			lenHz: 6,
			thicknessScale: sizeK,
			lifetime: {
				min: RAIN.lifeMin * lifeK,
				max: RAIN.lifeMax * lifeK
			},
			fadeInFrac: RAIN.fadeInFrac,
			fadeOutFrac: RAIN.fadeOutFrac,
			warmStartSec: RAIN.warmStartSec,
			edgeFadePx: {
				left: RAIN.fadeLeft,
				right: RAIN.fadeRight,
				top: RAIN.fadeTop,
				bottom: RAIN.fadeBottom
			},
			respawn: true
		}, dt);
	}
	if (drawCloudBody) {
		p.push();
		p.translate(appear.x, appear.y);
		p.scale(appear.scaleX, appear.scaleY);
		p.translate(-anchorX, -anchorY);
		p.noStroke();
		p.fill(cloudRgb.r, cloudRgb.g, cloudRgb.b, cloudAlpha);
		for (const l of lobes) {
			const { dx, dy, sc } = displacementOsc(t, l.i, {
				ampX: ampX * lobeDriftK,
				ampY: ampY * lobeDriftK,
				ampScale: ampS * Math.max(.35, lobeDriftK),
				freqX: fX,
				freqY: fY,
				freqScale: fS,
				seed
			});
			const lx = l.x;
			const ly = l.y;
			const rr = l.r * sc * 2;
			const cx2 = lx + groupDrift.dx + dx;
			const cy2 = ly + groupDrift.dy + dy;
			p.circle(cx2, cy2, rr);
		}
		p.pop();
	}
}
//#endregion
//#region src/canvas-engine/shapes/snow.ts
var SCLOUD = {
	widthEnv: [.76, .86],
	heightEnv: [.8, .92],
	spreadX: [.92, .8],
	arcLift: [.22, .3],
	rBaseK: [.37, .46],
	rJitter: [.04, .08],
	lobeCount: [5, 7],
	sCap: [.18, .1],
	blend: [.12, .03],
	oscAmp: [.02, .05],
	oscSpeed: [.1, .16],
	lightnessRange: [.95, 1]
};
var SGROUND = {
	blendK: [.18, .05],
	satOscAmp: [0, .02],
	satOscSpeed: [.08, .14],
	lightnessRange: [.96, 1],
	scaleY: [.2, 1.33]
};
var SNOW = {
	spawnX: [0, .9],
	spawnY: [0, .3],
	count: [14, 26],
	sizeMin: [.6, 1.8],
	sizeMax: [1.6, 2.8],
	lifeMin: [1.4, 8],
	lifeMax: [2.4, 12],
	emitterOverflowFrac: [0, .5],
	alpha: [210, 255],
	dir: "down",
	spreadAngle: [.6, .3],
	speedMin: [16, 24],
	speedMax: [26, 48],
	gravity: [28, 16],
	drag: [.84, .92],
	jitterPos: [.4, 1],
	jitterAngle: [.02, .06],
	fadeInFrac: .1,
	fadeOutFrac: .02,
	warmStartSec: 1.4,
	edgeFadePx: {
		left: 2,
		right: 2,
		top: 8,
		bottom: 24
	},
	sizeHz: 3,
	blendK: [.24, .06],
	satOscAmp: [.02, .05],
	satOscSpeed: [.1, .18],
	lightnessRange: [.9, .98]
};
var SNOW_BASE_PALETTE = {
	cloud: {
		r: 248,
		g: 250,
		b: 255
	},
	flake: {
		r: 228,
		g: 235,
		b: 247
	},
	ground: {
		r: 232,
		g: 238,
		b: 244
	}
};
var SNOW_DARK_PALETTE = {
	cloud: {
		r: 182,
		g: 189,
		b: 220
	},
	cloudByLight: {
		far: {
			r: 255,
			g: 122,
			b: 148
		},
		mid: {
			r: 192,
			g: 179,
			b: 210
		},
		near: {
			r: 232,
			g: 238,
			b: 255
		}
	},
	flake: {
		r: 160,
		g: 174,
		b: 208
	},
	ground: {
		r: 148,
		g: 162,
		b: 194
	}
};
function snowRowContextScale(t) {
	return {
		size: particleBucketRange(t, .42, 1),
		motion: particleBucketRange(t, .07, .5),
		life: particleBucketRange(t, 1.18, 1.6),
		count: particleBucketRange(t, .6, 1)
	};
}
/**
* drawSnow
*/
function drawSnow(p, _x, _y, _r, opts = {}) {
	const projection = shapeProjection(opts);
	const style = shapeStyle(opts);
	const lifecycle = shapeLifecycle(opts);
	const identity = shapeIdentity(opts);
	const sprite = shapeSprite(opts);
	const particles = shapeParticles(opts);
	const pass = shapePass(opts);
	const darkMode = style.darkMode === true;
	const pal = style.palette ?? (darkMode ? SNOW_DARK_PALETTE : SNOW_BASE_PALETTE);
	const cell = projection.cell;
	const f = projection.footprint;
	if (!cell || !f) return;
	const gradientRGB = style.gradientRGB ?? void 0;
	const exposure = typeof style.exposure === "number" && Number.isFinite(style.exposure) ? style.exposure : 1;
	const contrast = typeof style.contrast === "number" && Number.isFinite(style.contrast) ? style.contrast : 1;
	const rowBucket = particleRowBucket(f, projection);
	const t = (typeof lifecycle.timeMs === "number" ? lifecycle.timeMs : p.millis()) / 1e3;
	const u = clamp01(style.liveAvg ?? .5);
	const snowSeed = typeof identity.seed === "number" ? identity.seed | 0 : (f.r0 * 73856093 ^ f.c0 * 19349663 ^ f.w * 83492791 ^ f.h * 29791) >>> 0;
	const visualRow = f.r0 + f.h - 1;
	const { x: fpX, y: y0, w: fpW, h: fpH } = footprintToPx(f, projection);
	const visualCellW = rowWidthAt(visualRow, projection);
	const wTop = f.w * visualCellW;
	const footprintCx = fpX + fpW / 2;
	const x0 = footprintCx - wTop / 2;
	const hTop = rowHeightAt(visualRow, projection);
	const cx = footprintCx;
	const cy = y0 + hTop * .62;
	const drawAlpha = typeof style.alpha === "number" && Number.isFinite(style.alpha) ? style.alpha : 235;
	let showGround = opts.showGround !== false;
	if (showGround && typeof opts.hideGroundAboveFrac === "number" && typeof projection.usedRows === "number") {
		const frac = Math.max(0, Math.min(1, opts.hideGroundAboveFrac));
		const cutoffRow = Math.floor(projection.usedRows * frac);
		if (f.r0 <= cutoffRow) showGround = false;
	}
	if (showGround && typeof opts.hideGroundBelowBucketT === "number" && rowBucket.t < opts.hideGroundBelowBucketT) showGround = false;
	if (showGround) {
		const baseH = Math.max(4, Math.round(cell / 3));
		const kY = resolveRangeValue(SGROUND.scaleY, u);
		const stripH = Math.round(baseH * kY);
		if (stripH > 0) {
			const topY = y0 + fpH - stripH;
			const gBlend = resolveRangeValue(SGROUND.blendK, u);
			const gSatAmp = resolveRangeValue(SGROUND.satOscAmp, u);
			const gSatSpd = resolveRangeValue(SGROUND.satOscSpeed, u);
			const base = oscillateSaturation(pal.ground, t, {
				amp: gSatAmp,
				speed: gSatSpd,
				phase: 0
			});
			const mixed = gradientRGB ? blendRGB(base, gradientRGB, gBlend) : base;
			const groundLRange = darkMode ? [.62, .78] : SGROUND.lightnessRange;
			let clamped = clampBrightness(mixed, groundLRange[0], groundLRange[1]);
			clamped = applyDepthTint(applySrgbExposureContrast(clamped, exposure, contrast), pass);
			const rTop = Math.round(cell * .06);
			p.push();
			p.translate(cx, cy);
			p.noStroke();
			p.fill(clamped.r, clamped.g, clamped.b, drawAlpha);
			p.rect(fpX - cx, topY - cy, fpW, stripH, rTop, rTop, 0, 0);
			const groundLight = sampleDirectionalLightRect({
				x: fpX,
				y: topY,
				w: fpW,
				h: stripH
			}, style.lightCtx ?? null);
			const groundHighlight = mixRgb(clamped, groundLight.lightColor, .34);
			const groundShadow = mixRgb(clamped, groundLight.shadowColor, .24);
			paintPixelLightBands(p, {
				x: fpX - cx,
				y: topY - cy,
				w: fpW,
				h: stripH
			}, groundLight, {
				alpha: drawAlpha,
				highlightColor: groundHighlight,
				shadowColor: groundShadow,
				corner: rTop,
				sideK: .34,
				topK: .26,
				shadowK: .16
			});
			p.pop();
		}
	}
	const wEnv = wTop * resolveRangeValue(SCLOUD.widthEnv, u);
	const hEnv = hTop * resolveRangeValue(SCLOUD.heightEnv, u);
	const spreadX = resolveRangeValue(SCLOUD.spreadX, u);
	const arcLift = resolveRangeValue(SCLOUD.arcLift, u);
	const rBase = hTop * resolveRangeValue(SCLOUD.rBaseK, u);
	const rJitter = resolveRangeValue(SCLOUD.rJitter, u);
	const lobes = makeArchLobes(cx, cy, wEnv, hEnv, {
		count: Math.max(3, Math.round(resolveRangeValue(SCLOUD.lobeCount, u))),
		spreadX,
		arcLift,
		rBase,
		rJitter,
		seed: 0
	});
	const cloudLight = sampleDirectionalLightRect({
		x: x0,
		y: y0,
		w: wTop,
		h: hTop * 1.2
	}, style.lightCtx ?? null);
	const cloudBlend = resolveRangeValue(SCLOUD.blend, u);
	const cloudPalette = pickLightBandValue(pal.cloud, pal.cloudByLight, cloudLight.closenessK);
	const baseTint = gradientRGB ? blendRGB(cloudPalette, gradientRGB, cloudBlend) : cloudPalette;
	const sMax = Math.max(0, Math.min(1, resolveRangeValue(SCLOUD.sCap, u)));
	const { h, s, l } = rgbToHsl(baseTint);
	let cloudRgb = oscillateSaturation(hslToRgb({
		h,
		s: Math.min(s, sMax),
		l
	}), t, {
		amp: resolveRangeValue(SCLOUD.oscAmp, u),
		speed: resolveRangeValue(SCLOUD.oscSpeed, u),
		phase: 0
	});
	const cloudLRange = darkMode ? [.68, .82] : SCLOUD.lightnessRange;
	cloudRgb = clampBrightness(cloudRgb, cloudLRange[0], cloudLRange[1]);
	cloudRgb = applySrgbExposureContrast(cloudRgb, exposure, contrast);
	cloudRgb = mixRgb(cloudRgb, cloudLight.lightColor, .16 * cloudLight.overallK);
	cloudRgb = applyDepthTint(cloudRgb, pass);
	const cloudHighlight = mixRgb(cloudRgb, cloudLight.lightColor, .34);
	const cloudShadow = mixRgb(cloudRgb, cloudLight.shadowColor, .22);
	const of = Math.max(0, Math.min(1, resolveRangeValue(SNOW.emitterOverflowFrac, u)));
	const extraW = Math.round(wTop * of);
	const emitW = wTop + extraW;
	const snowRect = {
		x: x0 - Math.round(extraW / 2),
		y: y0 + hTop * .6,
		w: emitW,
		h: hTop * 2.2
	};
	const sideFadePx = Math.round(Math.max(SNOW.edgeFadePx.right, Math.min(28, Math.max(8, emitW * .075))));
	const sxA = resolveRangeValue(SNOW.spawnX, 0), sxB = resolveRangeValue(SNOW.spawnX, 1);
	const syA = resolveRangeValue(SNOW.spawnY, 0), syB = resolveRangeValue(SNOW.spawnY, 1);
	const spawnX0 = Math.min(sxA, sxB);
	const spawnX1 = Math.max(sxA, sxB);
	const spawnY0 = Math.min(syA, syB);
	const spawnY1 = Math.max(syA, syB);
	const baseCount = Math.max(6, Math.floor(resolveRangeValue(SNOW.count, u)));
	const horizonScale = snowRowContextScale(rowBucket.t);
	const particleSizeK = particleDepthSizeScale(rowBucket);
	const spriteScale = Math.max(1, sprite.pixelScale ?? sprite.coreScaleMult ?? 1);
	const spriteLifeScale = spriteScale > 1.7 ? Math.pow(spriteScale, 1.25) : Math.pow(spriteScale, 5);
	const sizeK = horizonScale.size * particleSizeK * Math.pow(spriteScale, 1.75);
	const speedK = horizonScale.motion * spriteScale * 1.35;
	const gravityK = horizonScale.motion * spriteScale * 1.35;
	const lifeK = horizonScale.life * spriteLifeScale;
	const countK = horizonScale.count * Math.sqrt(spriteScale);
	const sizeMin = resolveRangeValue(SNOW.sizeMin, u) * sizeK;
	const sizeMax = Math.max(sizeMin, resolveRangeValue(SNOW.sizeMax, u) * sizeK);
	const lifeMin = Math.max(.1, resolveRangeValue(SNOW.lifeMin, u) * lifeK);
	const lifeMax = Math.max(lifeMin, resolveRangeValue(SNOW.lifeMax, u) * lifeK);
	const alpha = Math.max(0, Math.min(255, Math.round(resolveRangeValue(SNOW.alpha, u))));
	const speedMin = resolveRangeValue(SNOW.speedMin, u) * speedK;
	const speedMax = Math.max(speedMin, resolveRangeValue(SNOW.speedMax, u) * speedK);
	const gravity = resolveRangeValue(SNOW.gravity, u) * gravityK;
	const drag = resolveRangeValue(SNOW.drag, u);
	const jPos = resolveRangeValue(SNOW.jitterPos, u);
	const jAng = resolveRangeValue(SNOW.jitterAngle, u);
	const spreadAng = resolveRangeValue(SNOW.spreadAngle, u);
	const blendK = resolveRangeValue(SNOW.blendK, u);
	const satAmp = resolveRangeValue(SNOW.satOscAmp, u);
	const satSpd = resolveRangeValue(SNOW.satOscSpeed, u);
	let flakeBase = oscillateSaturation(pal.flake, t, {
		amp: satAmp,
		speed: satSpd,
		phase: 0
	});
	flakeBase = gradientRGB ? blendRGB(flakeBase, gradientRGB, blendK) : flakeBase;
	const flakeLRange = darkMode ? [.7, .84] : SNOW.lightnessRange;
	flakeBase = clampBrightness(flakeBase, flakeLRange[0], flakeLRange[1]);
	flakeBase = applySrgbExposureContrast(flakeBase, exposure, contrast);
	if (sprite.disableParticleDepthTint !== true) flakeBase = applyDepthTint(flakeBase, pass, .7);
	const snowColor = {
		r: flakeBase.r,
		g: flakeBase.g,
		b: flakeBase.b,
		a: alpha
	};
	const dt = Math.max(.001, (p.deltaTime || 16) / 1e3);
	stepAndDrawPuffs(p, {
		store: particles.particleStore,
		key: `snow:${String(f.r0)}:${String(f.c0)}:${String(f.w)}x${String(f.h)}`,
		rect: snowRect,
		dir: "down",
		spreadAngle: spreadAng,
		speed: {
			min: speedMin,
			max: speedMax
		},
		gravity,
		drag,
		accel: {
			x: 0,
			y: 0
		},
		spawn: {
			x0: spawnX0,
			x1: spawnX1,
			y0: spawnY0,
			y1: spawnY1
		},
		jitter: {
			pos: jPos,
			velAngle: jAng
		},
		count: Math.max(6, Math.floor(baseCount * countK)),
		size: {
			min: sizeMin,
			max: sizeMax
		},
		sizeHz: SNOW.sizeHz,
		lifetime: {
			min: lifeMin,
			max: lifeMax
		},
		fadeInFrac: SNOW.fadeInFrac,
		fadeOutFrac: SNOW.fadeOutFrac,
		warmStartSec: SNOW.warmStartSec,
		edgeFadePx: {
			...SNOW.edgeFadePx,
			left: sideFadePx,
			right: sideFadePx
		},
		color: snowColor,
		depthAlpha: particleDepthAlpha(rowBucket),
		respawn: true
	}, dt);
	p.push();
	p.translate(cx, cy);
	p.noStroke();
	p.fill(cloudRgb.r, cloudRgb.g, cloudRgb.b, drawAlpha);
	const cloudAlpha = drawAlpha;
	const wobbleAmpX = Math.max(.8, hTop * .045);
	const wobbleAmpY = Math.max(.5, hTop * .035);
	const wobbleAmpS = .045;
	for (const l of lobes) {
		const { dx: ldx, dy: ldy, sc } = displacementOsc(t, l.i, {
			ampX: wobbleAmpX,
			ampY: wobbleAmpY,
			ampScale: wobbleAmpS,
			freqX: .16,
			freqY: .12,
			freqScale: .1,
			seed: snowSeed
		});
		const radius = l.r * sc;
		const lx = l.x - cx + ldx;
		const ly = l.y - cy + ldy;
		p.circle(lx, ly, radius * 2);
		if (cloudLight.overallK > .01) {
			const offX = cloudLight.xBias * l.r * .22;
			const offY = cloudLight.yBias * l.r * .18;
			const shadowK = clamp01((cloudLight.closenessK - .22) / .46);
			p.fill(cloudHighlight.r, cloudHighlight.g, cloudHighlight.b, Math.round(cloudAlpha * .18 * Math.max(cloudLight.leftK, cloudLight.rightK, cloudLight.topK)));
			p.circle(lx + offX, ly + offY, radius * 2 * .62);
			p.fill(cloudShadow.r, cloudShadow.g, cloudShadow.b, Math.round(cloudAlpha * .1 * shadowK * Math.max(cloudLight.leftK, cloudLight.rightK)));
			p.circle(lx - offX * .9, ly - offY * .5, radius * 2 * .54);
			p.fill(cloudRgb.r, cloudRgb.g, cloudRgb.b, cloudAlpha);
		}
	}
	p.pop();
}
//#endregion
//#region src/canvas-engine/shapes/house.ts
var HOUSE = {
	body: {
		colorBlend: [.2, .02],
		brightnessRange: [.45, .7]
	},
	grass: {
		colorBlend: [.14, .28],
		satRange: [.03, .14]
	},
	chimney: { scaleRange: [2, 0] },
	windows: {
		perFloor: 2,
		size: [10, 12],
		marginY: 12,
		thresholds: {
			low: 1.5,
			mid: 2.5
		}
	}
};
var SMOKE = {
	spawnX: [.5, .5],
	spawnY: [.8, .8],
	count: [36, 22],
	sizeMin: [3, 0],
	sizeMax: [6, 1],
	lifeMin: [3, 3.8],
	lifeMax: [5.5, 6.8],
	alpha: [225, 0],
	dir: "up",
	spreadAngle: [4, .26],
	speedMin: [4, 6],
	speedMax: [6, 9],
	gravity: [-10, -5],
	drag: [.55, .72],
	jitterPos: [.4, 1.2],
	jitterAngle: [.06, .16],
	fadeInFrac: .22,
	fadeOutFrac: .38,
	edgeFadePx: {
		left: 2,
		right: 0,
		top: 2,
		bottom: 0
	},
	sizeHz: 4,
	base: {
		r: 232,
		g: 235,
		b: 240
	},
	blendK: [.3, .1],
	satOscAmp: [.04, .08],
	satOscSpeed: [.12, .2],
	brightnessRange: [.2, .95],
	colHk: 2.85,
	offsetXFrac: -.04
};
var WINDOW_OSC$1 = {
	amp: [.035, .085],
	speed: [.18, .42],
	colorAmp: [.05, .13],
	colorSpeed: [.045, .095],
	brightnessMin: [.54, .72],
	brightnessMax: [.82, .96],
	litCurve: .92
};
var WINDOW_COLOR_TARGETS$1 = [
	{
		r: 255,
		g: 214,
		b: 122
	},
	{
		r: 255,
		g: 232,
		b: 176
	},
	{
		r: 255,
		g: 198,
		b: 104
	},
	{
		r: 236,
		g: 242,
		b: 255
	}
];
var HOUSE_BASE_PALETTE = {
	grass: {
		r: 146,
		g: 188,
		b: 126
	},
	body: [
		{
			r: 190,
			g: 212,
			b: 236
		},
		{
			r: 230,
			g: 222,
			b: 202
		},
		{
			r: 202,
			g: 228,
			b: 190
		},
		{
			r: 236,
			g: 214,
			b: 228
		},
		{
			r: 214,
			g: 238,
			b: 246
		},
		{
			r: 202,
			g: 198,
			b: 222
		},
		{
			r: 238,
			g: 228,
			b: 208
		},
		{
			r: 208,
			g: 230,
			b: 216
		},
		{
			r: 236,
			g: 214,
			b: 210
		}
	],
	roof: [
		{
			r: 220,
			g: 136,
			b: 116
		},
		{
			r: 182,
			g: 136,
			b: 118
		},
		{
			r: 160,
			g: 144,
			b: 138
		},
		{
			r: 146,
			g: 132,
			b: 124
		}
	],
	door: [
		{
			r: 170,
			g: 120,
			b: 70
		},
		{
			r: 150,
			g: 170,
			b: 90
		},
		{
			r: 215,
			g: 190,
			b: 95
		},
		{
			r: 180,
			g: 140,
			b: 100
		}
	],
	window: {
		lit: [
			{
				r: 255,
				g: 154,
				b: 64
			},
			{
				r: 255,
				g: 176,
				b: 78
			},
			{
				r: 255,
				g: 198,
				b: 96
			},
			{
				r: 255,
				g: 222,
				b: 128
			},
			{
				r: 255,
				g: 241,
				b: 176
			}
		],
		dark: [{
			r: 120,
			g: 170,
			b: 220
		}]
	},
	solarPanel: {
		r: 180,
		g: 205,
		b: 235
	}
};
var HOUSE_DARK_PALETTE = {
	grass: {
		r: 56,
		g: 108,
		b: 116
	},
	grassByLight: {
		far: {
			r: 76,
			g: 94,
			b: 94
		},
		mid: {
			r: 56,
			g: 108,
			b: 116
		},
		near: {
			r: 52,
			g: 104,
			b: 132
		}
	},
	body: [
		{
			r: 104,
			g: 130,
			b: 178
		},
		{
			r: 118,
			g: 124,
			b: 172
		},
		{
			r: 108,
			g: 146,
			b: 162
		},
		{
			r: 128,
			g: 136,
			b: 178
		},
		{
			r: 114,
			g: 148,
			b: 188
		},
		{
			r: 158,
			g: 106,
			b: 162
		},
		{
			r: 92,
			g: 116,
			b: 152
		},
		{
			r: 110,
			g: 142,
			b: 160
		},
		{
			r: 136,
			g: 124,
			b: 166
		},
		{
			r: 98,
			g: 134,
			b: 170
		},
		{
			r: 110,
			g: 132,
			b: 174
		},
		{
			r: 152,
			g: 110,
			b: 162
		},
		{
			r: 92,
			g: 120,
			b: 160
		}
	],
	roof: [
		{
			r: 140,
			g: 86,
			b: 104
		},
		{
			r: 104,
			g: 106,
			b: 128
		},
		{
			r: 88,
			g: 108,
			b: 142
		},
		{
			r: 114,
			g: 116,
			b: 150
		},
		{
			r: 90,
			g: 104,
			b: 142
		}
	],
	door: [
		{
			r: 93,
			g: 76,
			b: 74
		},
		{
			r: 82,
			g: 107,
			b: 89
		},
		{
			r: 118,
			g: 120,
			b: 93
		},
		{
			r: 99,
			g: 88,
			b: 87
		}
	],
	window: {
		lit: [
			{
				r: 255,
				g: 146,
				b: 62
			},
			{
				r: 255,
				g: 168,
				b: 76
			},
			{
				r: 255,
				g: 190,
				b: 92
			},
			{
				r: 255,
				g: 214,
				b: 120
			},
			{
				r: 250,
				g: 234,
				b: 166
			}
		],
		dark: [
			{
				r: 96,
				g: 105,
				b: 150
			},
			{
				r: 105,
				g: 110,
				b: 160
			},
			{
				r: 95,
				g: 102,
				b: 170
			},
			{
				r: 116,
				g: 128,
				b: 188
			}
		]
	},
	solarPanel: {
		r: 99,
		g: 129,
		b: 180
	}
};
function smokeRowContext(t) {
	return {
		size: particleBucketRange(t, .26, 1),
		motion: particleBucketRange(t, .18, 1),
		life: particleBucketRange(t, 1.28, 1),
		count: particleBucketRange(t, .52, 1),
		columnW: particleBucketRange(t, .62, 1),
		columnH: particleBucketRange(t, .9, 1)
	};
}
function oscillateWindowColor$1(base, timeSec, oscSeed) {
	const targetR = seededUnit(oscSeed ^ 374761393);
	const target = WINDOW_COLOR_TARGETS$1[Math.floor(targetR * WINDOW_COLOR_TARGETS$1.length) % WINDOW_COLOR_TARGETS$1.length];
	const amp = resolveRangeValue(WINDOW_OSC$1.colorAmp, seededUnit(oscSeed ^ 3550635116));
	const speed = resolveRangeValue(WINDOW_OSC$1.colorSpeed, seededUnit(oscSeed ^ 4251993797));
	const phase = seededUnit(oscSeed ^ 3042594569) * Math.PI * 2;
	return mixRgb(base, target, (.5 + .5 * Math.sin(timeSec * Math.PI * 2 * speed + phase)) * amp);
}
function houseHasChimney(seedKey, liveAvg = .5) {
	const u = clamp01(Number.isFinite(liveAvg) ? liveAvg : .5);
	if (u < .25) return true;
	if (u >= .75) return false;
	const r4 = seededUnit(shapeHash32(String(seedKey)) ^ 668265263);
	return Math.floor(r4 * 3) === 0;
}
function drawHouse(p, _cx, _cy, _r, opts = {}) {
	const projection = shapeProjection(opts);
	const style = shapeStyle(opts);
	const lifecycle = shapeLifecycle(opts);
	const identity = shapeIdentity(opts);
	const sprite = shapeSprite(opts);
	const particles = shapeParticles(opts);
	const pass = shapePass(opts);
	const darkMode = style.darkMode === true;
	const pal = style.palette ?? (darkMode ? HOUSE_DARK_PALETTE : HOUSE_BASE_PALETTE);
	const cell = projection.cell;
	const f = projection.footprint;
	if (!cell || !f) return;
	const gradientRGB = style.gradientRGB ?? void 0;
	const isSprite = !!sprite.fitToFootprint || !!sprite.spriteMode;
	const spriteScale = Math.max(1, sprite.pixelScale ?? sprite.coreScaleMult ?? 1);
	const ex = typeof style.exposure === "number" ? style.exposure : 1;
	const ct = typeof style.contrast === "number" ? style.contrast : 1;
	const baseAlpha = typeof style.alpha === "number" && Number.isFinite(style.alpha) ? style.alpha : 255;
	const renderPass = pass.renderPass ?? "color";
	const maskColor = pass.maskColor;
	const requestedMaskAlpha = typeof pass.maskAlpha === "number" && Number.isFinite(pass.maskAlpha) ? pass.maskAlpha : baseAlpha;
	const shouldDrawColorDetails = shouldDrawInRenderPass(renderPass, false);
	const u = clamp01(style.liveAvg ?? .5);
	const t = (typeof lifecycle.timeMs === "number" ? lifecycle.timeMs : p.millis()) / 1e3;
	const rowBucket = particleRowBucket(f, projection);
	const smokeScale = smokeRowContext(rowBucket.t);
	const particleSizeK = particleDepthSizeScale(rowBucket);
	const { x: pxX, y: pxY, w: pxW, h: pxH } = footprintToPx(f, projection);
	const localTileW = pxW / Math.max(1, f.w);
	const localTileH = pxH / Math.max(1, f.h);
	const localTile = Math.max(1, Math.min(localTileW, localTileH));
	const smallScale = localTile <= 8;
	const anchorX = pxX + pxW / 2;
	const anchorY = pxY + pxH;
	const m = applyShapeMods({
		p,
		x: anchorX,
		y: anchorY,
		r: Math.min(pxW, pxH),
		opts: {
			alpha: baseAlpha,
			timeMs: lifecycle.timeMs,
			liveAvg: style.liveAvg,
			rootAppearK: lifecycle.rootAppearK
		}
	});
	const alpha = typeof m.alpha === "number" ? m.alpha : baseAlpha;
	const appearAlphaK = baseAlpha > 0 ? clamp01(alpha / baseAlpha) : 1;
	const maskAlpha = renderPass === "depthMask" ? Math.round(requestedMaskAlpha * appearAlphaK) : alpha;
	const massAlpha = renderPass === "depthMask" ? maskAlpha : alpha;
	const shouldDrawMass = shouldDrawInRenderPass(renderPass, true);
	p.push();
	p.translate(m.x, m.y);
	p.scale(m.scaleX, m.scaleY);
	p.translate(-anchorX, -anchorY);
	const grassH = Math.max(1, Math.round(localTileH / 3));
	const grassY = pxY + pxH - grassH;
	const rGrassTop = Math.max(1, Math.round(localTile * .06));
	const grassSeed = seededUnit(shapeHash32(`house-grass|${String(f.r0)}|${String(f.c0)}|${String(f.w)}x${String(f.h)}`));
	const grassLight = sampleDirectionalLightRect({
		x: pxX,
		y: grassY,
		w: pxW,
		h: grassH
	}, style.lightCtx ?? null);
	const grassBase = darkMode ? pickLightBandValue(pal.grass, pal.grassByLight, grassLight.closenessK) : pal.grass;
	let grassTint = pick(Array.isArray(grassBase) ? grassBase : [grassBase], grassSeed);
	const grassDriveU = Math.pow(u, 1.2);
	if (gradientRGB) grassTint = blendRGB(grassTint, gradientRGB, resolveRangeValue(HOUSE.grass.colorBlend, grassDriveU));
	grassTint = driveSaturation(grassTint, grassDriveU, HOUSE.grass.satRange[0], HOUSE.grass.satRange[1]);
	grassTint = darkMode ? clampBrightness(grassTint, .28, .42) : clampBrightness(grassTint, .5, .75);
	grassTint = applySrgbExposureContrast(grassTint, ex, ct);
	if (darkMode) {
		const grassLightK = grassLight.overallK * (.05 + .12 * grassLight.closenessK);
		grassTint = mixRgb(grassTint, grassLight.lightColor, grassLightK);
	}
	if (shouldDrawMass) {
		p.noStroke();
		fillRgb(p, shapeColorForRenderPass(renderPass, grassTint, maskColor), massAlpha);
		p.rect(pxX, grassY, pxW, grassH, rGrassTop, rGrassTop, 0, 0);
	}
	const availH = Math.max(3, grassY - pxY);
	const seedKey = identity.seedKey ?? identity.seed ?? `house|${String(f.r0)}|${String(f.c0)}|${String(f.w)}x${String(f.h)}`;
	const occurrenceIndex = typeof identity.shapeOccurrenceIndex === "number" && Number.isFinite(identity.shapeOccurrenceIndex) ? identity.shapeOccurrenceIndex : 0;
	const seed = shapeHash32(String(seedKey));
	const r1 = seededUnit(seed ^ 2654435769);
	const r3 = seededUnit(seed ^ 3266489909);
	const r4 = seededUnit(seed ^ 668265263);
	const r5 = seededUnit(seed ^ 2730485921);
	const r6 = seededUnit(seed ^ 1013904242);
	const r7 = seededUnit(seed ^ 3144134277);
	const r8 = seededUnit(seed ^ 528734635);
	const desiredBodyH = Math.round(availH * (.5 + .4 * r1));
	const roofH = clampMinMax(Math.round(localTileH * .15), smallScale ? 1 : 2, Math.max(1, Math.floor(availH * .28)));
	const minBodyH = smallScale ? Math.max(2, Math.round(localTileH * .9)) : Math.max(5, Math.round(localTileH * 1.1));
	const bodyH = clampMinMax(desiredBodyH, minBodyH, Math.max(minBodyH, availH - roofH));
	const bodyY = grassY - bodyH;
	const roofY = Math.max(pxY, bodyY - roofH);
	const bodyOffset = seed % pal.body.length;
	let bodyTint = pickByOccurrence(pal.body, occurrenceIndex, bodyOffset);
	if (gradientRGB) bodyTint = blendRGB(bodyTint, gradientRGB, resolveRangeValue(HOUSE.body.colorBlend, u));
	bodyTint = clampBrightness(bodyTint, HOUSE.body.brightnessRange[0], HOUSE.body.brightnessRange[1]);
	bodyTint = applySrgbExposureContrast(bodyTint, ex, ct);
	let roofTint = applySrgbExposureContrast(pick(pal.roof, r3), ex, ct);
	const buildingLight = sampleDirectionalLightRect({
		x: pxX,
		y: roofY,
		w: pxW,
		h: Math.max(1, grassY - roofY)
	}, style.lightCtx ?? null);
	bodyTint = mixRgb(bodyTint, buildingLight.lightColor, .24 * buildingLight.overallK);
	roofTint = mixRgb(roofTint, buildingLight.lightColor, .18 * buildingLight.overallK);
	const rBody = Math.max(1, Math.round(localTile * .06));
	if (shouldDrawMass) {
		p.noStroke();
		fillRgb(p, shapeColorForRenderPass(renderPass, bodyTint, maskColor), renderPass === "depthMask" ? maskAlpha : 255);
		p.rect(pxX, bodyY, pxW, bodyH, rBody);
	}
	if (shouldDrawColorDetails) paintPixelLightBands(p, {
		x: pxX,
		y: bodyY,
		w: pxW,
		h: bodyH
	}, buildingLight, {
		alpha: 255,
		highlightColor: mixRgb(bodyTint, buildingLight.lightColor, .52),
		shadowColor: mixRgb(bodyTint, buildingLight.shadowColor, .3),
		corner: rBody,
		sideK: .42,
		topK: 0,
		shadowK: .18
	});
	if (shouldDrawMass) {
		fillRgb(p, shapeColorForRenderPass(renderPass, roofTint, maskColor), massAlpha);
		p.rect(pxX, roofY, pxW, roofH, rBody, rBody, 0, 0);
	}
	if (shouldDrawColorDetails) paintPixelLightBands(p, {
		x: pxX,
		y: roofY,
		w: pxW,
		h: roofH
	}, buildingLight, {
		alpha,
		highlightColor: mixRgb(roofTint, buildingLight.lightColor, .44),
		shadowColor: mixRgb(roofTint, buildingLight.shadowColor, .24),
		corner: rBody,
		sideK: .28,
		topK: .18,
		shadowK: .12
	});
	if (shouldDrawColorDetails) {
		const hasPanels = Math.floor(r6 * 3) !== 0;
		const vis = Math.max(0, Math.min(1, (u - .8) / .2));
		const tinyRoof = localTile <= 8 || pxW < 18 || roofH < 3;
		const compactRoof = !tinyRoof && (localTile <= 11 || pxW < 24 || roofH < 5);
		if (hasPanels && vis > 0 && !tinyRoof) {
			const chimneyExists = houseHasChimney(seedKey, u);
			const chimneyLeft = chimneyExists ? r4 < .5 : null;
			let sideLeft = r8 < .5;
			if (chimneyExists && (chimneyLeft && sideLeft || !chimneyLeft && !sideLeft)) sideLeft = !sideLeft;
			const angle = compactRoof ? 0 : (sideLeft ? -1 : 1) * (Math.PI / 6);
			const basePW = compactRoof ? Math.max(7, Math.round(pxW * .26)) : Math.max(smallScale ? 5 : 10, Math.round(pxW * .18));
			const basePH = compactRoof ? Math.max(2, Math.round(roofH * .55)) : Math.max(smallScale ? 2 : 5, Math.round(roofH * .65));
			const s = .7 + .4 * vis;
			let pW = basePW * s;
			let pH = basePH * s;
			const marginSide = Math.max(compactRoof ? 2 : smallScale ? 1 : 4, pxW * .08);
			const sideW = pxW / 2 - marginSide;
			const panelCount = compactRoof ? 1 : 2 + (r6 < .33 ? 1 : 0);
			const maxPW = Math.max(smallScale ? 4 : 8, sideW / panelCount * .95);
			pW = Math.min(pW, maxPW);
			pH = Math.min(pH, Math.max(compactRoof ? 2 : smallScale ? 2 : 6, roofH * .9));
			const yOnRoof = compactRoof ? roofY + Math.max(1, roofH * .28) : roofY - Math.max(2, roofH * .6);
			let startX;
			const spacing = compactRoof ? 0 : pW * .2;
			if (sideLeft) startX = pxX + marginSide + pW / 2;
			else startX = pxX + pxW - marginSide - pW / 2 - (panelCount - 1) * (pW + spacing);
			let panelTint = pal.solarPanel;
			panelTint = applySrgbExposureContrast(panelTint, ex, ct);
			p.push();
			p.rectMode(p.CENTER);
			p.noStroke();
			fillRgb(p, panelTint, Math.round(alpha * vis));
			for (let i = 0; i < panelCount; i++) {
				const jitter = compactRoof ? 0 : i === 0 ? 0 : (r7 * 2 - 1) * pW * .06;
				const cx = startX + i * (pW + spacing) + jitter;
				const cy = compactRoof ? yOnRoof : yOnRoof - (r8 * 2 - 1) * Math.min(3, roofH * .06);
				p.push();
				p.translate(cx, cy);
				p.rotate(angle);
				p.rect(0, 0, pW, pH, Math.round(Math.min(pW, pH) * .12));
				p.pop();
				if (!compactRoof) {
					p.push();
					p.translate(cx, cy);
					p.rotate(angle);
					fillRgb(p, {
						r: Math.min(255, panelTint.r + 22),
						g: Math.min(255, panelTint.g + 22),
						b: Math.min(255, panelTint.b + 22)
					}, Math.round(alpha * vis * .35));
					p.rect(-pW * .18, -pH * .06, pW * .7, pH * .1, Math.round(Math.min(pW, pH) * .12));
					p.pop();
				}
			}
			p.pop();
		}
	}
	if (houseHasChimney(seedKey, u)) {
		const baseW = Math.max(1, Math.round(pxW * .18));
		const baseH = Math.max(1, Math.round(bodyH * .075));
		const scale = resolveRangeValue(HOUSE.chimney.scaleRange, u) * particleBucketRange(rowBucket.t, .52, 1);
		const cW = clampMinMax(baseW * scale, 1, Math.max(1, Math.round(pxW * .28)));
		const cH = clampMinMax(baseH * scale, 1, Math.max(1, Math.round(bodyH * .22)));
		const onLeft = r4 < .5;
		const margin = Math.max(1, pxW * .1);
		const cx = onLeft ? pxX + margin : pxX + pxW - margin - cW;
		const cy = roofY;
		if (shouldDrawColorDetails) {
			const smokeColW = Math.max(2, Math.round(Math.max(cW, localTileW * .18) * smokeScale.columnW));
			const smokeColH = Math.max(Math.round(localTileH * 1.6), Math.round(localTileH * SMOKE.colHk * smokeScale.columnH));
			const smokeX = cx + cW / 2 - smokeColW / 2 + Math.round(smokeColW * SMOKE.offsetXFrac);
			const smokeY = cy - cH - smokeColH + Math.round(localTileH * .46);
			const bottomFadePx = isSprite ? Math.max(0, Math.round(smokeColH - localTileH * .7)) : 0;
			const spawnX0 = Math.min(resolveRangeValue(SMOKE.spawnX, 0), resolveRangeValue(SMOKE.spawnX, u));
			const spawnX1 = Math.max(resolveRangeValue(SMOKE.spawnX, u), 1 - (1 - resolveRangeValue(SMOKE.spawnX, u)));
			const spawnY0 = Math.min(resolveRangeValue(SMOKE.spawnY, 0), resolveRangeValue(SMOKE.spawnY, u));
			const spawnY1 = Math.max(resolveRangeValue(SMOKE.spawnY, u), 1 - (1 - resolveRangeValue(SMOKE.spawnY, u)));
			const count = Math.max(4, Math.floor(resolveRangeValue(SMOKE.count, u) * smokeScale.count));
			const sizeMin = resolveRangeValue(SMOKE.sizeMin, u) * smokeScale.size * particleSizeK * spriteScale;
			const sizeMax = Math.max(sizeMin, resolveRangeValue(SMOKE.sizeMax, u) * smokeScale.size * particleSizeK * spriteScale);
			const lifeMin = Math.max(.05, resolveRangeValue(SMOKE.lifeMin, u) * smokeScale.life);
			const lifeMax = Math.max(lifeMin, resolveRangeValue(SMOKE.lifeMax, u) * smokeScale.life);
			const sAlpha = Math.max(0, Math.min(255, Math.round(resolveRangeValue(SMOKE.alpha, u))));
			const speedMin = resolveRangeValue(SMOKE.speedMin, u) * smokeScale.motion;
			const speedMax = Math.max(speedMin, resolveRangeValue(SMOKE.speedMax, u) * smokeScale.motion);
			const gravity = resolveRangeValue(SMOKE.gravity, u) * smokeScale.motion;
			const drag = resolveRangeValue(SMOKE.drag, u);
			const jPos = resolveRangeValue(SMOKE.jitterPos, u) * smokeScale.size;
			const jAng = resolveRangeValue(SMOKE.jitterAngle, u);
			const spreadAng = resolveRangeValue(SMOKE.spreadAngle, u);
			const blendK = resolveRangeValue(SMOKE.blendK, u);
			const satAmp = resolveRangeValue(SMOKE.satOscAmp, u);
			const satSpd = resolveRangeValue(SMOKE.satOscSpeed, u);
			let smoked = oscillateSaturation(gradientRGB ? blendRGB(SMOKE.base, gradientRGB, blendK) : SMOKE.base, t, {
				amp: satAmp,
				speed: satSpd,
				phase: 0
			});
			smoked = clampBrightness(smoked, SMOKE.brightnessRange[0], SMOKE.brightnessRange[1]);
			smoked = applySrgbExposureContrast(smoked, ex, ct);
			const smokeColor = {
				r: smoked.r,
				g: smoked.g,
				b: smoked.b,
				a: sAlpha
			};
			const dt = Math.max(.001, (p.deltaTime || 16) / 1e3);
			stepAndDrawPuffs(p, {
				store: particles.particleStore,
				key: `chimney-smoke:${String(f.r0)}:${String(f.c0)}:${String(f.w)}x${String(f.h)}:${String(seedKey)}`,
				rect: {
					x: smokeX,
					y: smokeY,
					w: smokeColW,
					h: smokeColH
				},
				dir: SMOKE.dir,
				spreadAngle: spreadAng,
				speed: {
					min: speedMin,
					max: speedMax
				},
				gravity,
				drag,
				accel: {
					x: 0,
					y: 0
				},
				spawn: {
					x0: spawnX0,
					x1: spawnX1,
					y0: spawnY0,
					y1: spawnY1
				},
				jitter: {
					pos: jPos,
					velAngle: jAng
				},
				count,
				size: {
					min: sizeMin,
					max: sizeMax
				},
				sizeHz: SMOKE.sizeHz,
				lifetime: {
					min: lifeMin,
					max: lifeMax
				},
				fadeInFrac: SMOKE.fadeInFrac,
				fadeOutFrac: SMOKE.fadeOutFrac,
				edgeFadePx: {
					...SMOKE.edgeFadePx,
					bottom: bottomFadePx
				},
				color: smokeColor,
				depthAlpha: particleDepthAlpha(rowBucket),
				respawn: true
			}, dt);
		}
		fillRgb(p, shapeColorForRenderPass(renderPass, bodyTint, maskColor), massAlpha);
		p.rectMode(p.CORNER);
		p.rect(cx, cy - cH, cW, cH);
	}
	if (shouldDrawColorDetails) {
		let doorTint = pick(pal.door, r5);
		if (gradientRGB) doorTint = blendRGB(doorTint, gradientRGB, resolveRangeValue(HOUSE.body.colorBlend, u));
		doorTint = applySrgbExposureContrast(doorTint, ex, ct);
		const cellsH = f.h;
		const low = HOUSE.windows.thresholds.low;
		const mid = HOUSE.windows.thresholds.mid;
		let profile = "short";
		if (cellsH >= low) profile = "mid";
		if (cellsH > mid) profile = "tall";
		const cfg = {
			short: {
				W_FRAC: .18,
				H_FRAC: .2,
				Y_OFFSET_FRAC: 0
			},
			mid: {
				W_FRAC: .18,
				H_FRAC: .18,
				Y_OFFSET_FRAC: 0
			},
			tall: {
				W_FRAC: .18,
				H_FRAC: .14,
				Y_OFFSET_FRAC: -.02
			}
		}[profile];
		const doorW = Math.max(smallScale ? 2 : 3, Math.round(pxW * cfg.W_FRAC));
		const doorH = Math.max(smallScale ? 3 : 6, Math.round(bodyH * cfg.H_FRAC));
		const doorX = pxX + (pxW - doorW) / 2;
		const doorDrop = Math.max(1, Math.round(bodyH * .035));
		const doorY = bodyY + bodyH - doorH + Math.round(bodyH * cfg.Y_OFFSET_FRAC) + doorDrop;
		fillRgb(p, doorTint, alpha);
		p.rect(doorX, doorY, doorW, doorH, Math.round(cell * .03));
	}
	if (shouldDrawColorDetails) {
		let winLitVariants = Array.isArray(pal.window.lit) ? pal.window.lit : [pal.window.lit];
		let winDarkVariants = [...pal.window.dark];
		if (gradientRGB) {
			const k = resolveRangeValue(HOUSE.body.colorBlend, u);
			winLitVariants = winLitVariants.map((c) => blendRGB(c, gradientRGB, k));
			winDarkVariants = winDarkVariants.map((c) => blendRGB(c, gradientRGB, k));
		}
		winLitVariants = winLitVariants.map((c) => {
			let toned = c;
			if (!darkMode) {
				toned = driveSaturation(toned, .4, .24, .34);
				toned = clampBrightness(toned, .66, .9);
			}
			return applySrgbExposureContrast(toned, ex, ct);
		});
		winDarkVariants = winDarkVariants.map((c) => applySrgbExposureContrast(c, ex, ct));
		const cellsH = f.h;
		const low = HOUSE.windows.thresholds.low;
		const mid = HOUSE.windows.thresholds.mid;
		const PROFILES = {
			short: {
				rows: 1,
				WIN_W_FRAC: .12,
				WIN_H_FRAC: .34,
				H_GAP_FRAC: .16,
				V_GAP_FRAC: .06,
				TOP_FRAC: .2,
				BOT_FRAC: .34
			},
			mid: {
				rows: 3,
				WIN_W_FRAC: .16,
				WIN_H_FRAC: .105,
				H_GAP_FRAC: .12,
				V_GAP_FRAC: .09,
				TOP_FRAC: .13,
				BOT_FRAC: .24
			},
			compactTall: {
				rows: 3,
				WIN_W_FRAC: .16,
				WIN_H_FRAC: .105,
				H_GAP_FRAC: .12,
				V_GAP_FRAC: .1,
				TOP_FRAC: .13,
				BOT_FRAC: .25
			},
			tall: {
				rows: 4,
				WIN_W_FRAC: .16,
				WIN_H_FRAC: .078,
				H_GAP_FRAC: .12,
				V_GAP_FRAC: .085,
				TOP_FRAC: .11,
				BOT_FRAC: .22
			}
		};
		const bodyTileRows = bodyH / Math.max(1, localTileH);
		const profile = cellsH > mid && bodyTileRows >= 2.75 ? PROFILES.tall : cellsH > mid ? PROFILES.compactTall : cellsH >= low ? PROFILES.mid : PROFILES.short;
		const cols = 2;
		let rows = profile.rows;
		let winW = Math.max(smallScale ? 1 : 2, Math.round(pxW * profile.WIN_W_FRAC));
		const winH = Math.max(smallScale ? 1 : 2, Math.round(bodyH * profile.WIN_H_FRAC));
		let gapX = Math.max(smallScale ? 1 : 2, Math.round(pxW * profile.H_GAP_FRAC));
		const gapY = Math.max(smallScale ? 1 : 2, Math.round(bodyH * profile.V_GAP_FRAC));
		const targetRowW = 2 * winW + gapX;
		const maxRowW = Math.floor(pxW * .92);
		if (targetRowW > maxRowW) {
			const over = targetRowW - maxRowW;
			const giveW = Math.min(over * .6, Math.max(0, winW - 2));
			const giveG = Math.min(over * .4, Math.max(0, gapX - 2));
			winW = Math.max(2, winW - Math.round(giveW));
			gapX = Math.max(2, gapX - Math.round(giveG));
		}
		const topOffset = Math.round(bodyH * profile.TOP_FRAC);
		const bottomKeep = Math.round(bodyH * profile.BOT_FRAC);
		const usableH = Math.max(0, bodyH - topOffset - bottomKeep);
		while (rows > 1 && rows * winH + (rows - 1) * gapY > usableH) rows -= 1;
		if (rows < 1) rows = 1;
		let totalWindows = Math.min(rows * cols, 8);
		if (totalWindows < 2) totalWindows = 2;
		const dynamicLitRatio = Math.pow(1 - u, WINDOW_OSC$1.litCurve);
		const litCount = Math.min(totalWindows, Math.max(1, Math.round(Math.max(darkMode ? .12 : .06, dynamicLitRatio) * totalWindows)));
		const litSlots = new Set(Array.from({ length: totalWindows }, (_, idx) => ({
			idx,
			rank: seededUnit(shapeHash32(`house-lit-slot|${String(seed)}|${String(idx)}`))
		})).sort((a, b) => a.rank - b.rank).slice(0, litCount).map((slot) => slot.idx));
		const extra = usableH - (rows > 1 ? (rows - 1) * gapY + rows * winH : winH);
		const bandStartY = bodyY + topOffset + Math.floor(extra * .5);
		let drawn = 0;
		for (let rr = 0; rr < rows; rr++) {
			if (drawn >= totalWindows) break;
			const y = bandStartY + rr * (winH + gapY);
			const startX = pxX + (pxW - (2 * winW + gapX)) / 2;
			for (let cc = 0; cc < cols; cc++) {
				if (drawn >= totalWindows) break;
				const x = startX + cc * (winW + gapX);
				if (y >= roofY + 2 && y + winH <= bodyY + bodyH - 2) {
					const litRand = seededUnit(shapeHash32(`house-lit|${String(seed)}|${String(rr)}|${String(cc)}|${String(drawn)}`));
					const litIdx = Math.floor(litRand * winLitVariants.length) % winLitVariants.length;
					const isLit = litSlots.has(drawn);
					const darkVariantIdx = Math.floor(seededUnit(shapeHash32(`house-dark-var|${String(seed)}|${String(rr)}|${String(cc)}|${String(drawn)}`)) * winDarkVariants.length) % winDarkVariants.length;
					let tint = isLit ? winLitVariants[litIdx] : winDarkVariants[darkVariantIdx];
					if (isLit) {
						const oscSeed = shapeHash32(`house-window-osc|${String(seed)}|${String(rr)}|${String(cc)}|${String(drawn)}`);
						const oscPhase = seededUnit(oscSeed ^ 2654435769) * Math.PI * 2;
						const oscAmp = resolveRangeValue(WINDOW_OSC$1.amp, seededUnit(oscSeed ^ 2246822507));
						const oscSpeed = resolveRangeValue(WINDOW_OSC$1.speed, seededUnit(oscSeed ^ 3266489909));
						const brightnessMin = resolveRangeValue(WINDOW_OSC$1.brightnessMin, seededUnit(oscSeed ^ 668265263));
						const brightnessMax = resolveRangeValue(WINDOW_OSC$1.brightnessMax, seededUnit(oscSeed ^ 3144134277));
						tint = clampBrightness(tint, brightnessMin, brightnessMax);
						tint = oscillateBrightness(tint, t, {
							amp: oscAmp,
							speed: oscSpeed,
							phase: oscPhase
						});
						tint = oscillateWindowColor$1(tint, t, oscSeed);
						const glowInner = mixRgb(tint, {
							r: 255,
							g: 244,
							b: 214
						}, .28);
						const glowOuter = mixRgb(tint, {
							r: 255,
							g: 236,
							b: 188
						}, .2);
						const glowPad1 = Math.max(1, Math.round(Math.min(winW, winH) * .2));
						const glowPad2 = glowPad1 + Math.max(1, Math.round(Math.min(winW, winH) * .12));
						fillRgb(p, glowOuter, Math.round(alpha * .12));
						p.rect(x - glowPad2, y - glowPad2, winW + glowPad2 * 2, winH + glowPad2 * 2, Math.round(cell * .03));
						fillRgb(p, glowInner, Math.round(alpha * .22));
						p.rect(x - glowPad1, y - glowPad1, winW + glowPad1 * 2, winH + glowPad1 * 2, Math.round(cell * .025));
						tint = mixRgb(tint, {
							r: 255,
							g: 248,
							b: 222
						}, .18);
					}
					fillRgb(p, tint, alpha);
					p.rect(x, y, winW, winH, Math.round(cell * .02));
				}
				drawn++;
			}
		}
	}
	p.pop();
}
//#endregion
//#region src/canvas-engine/shapes/power.ts
var POWER = {
	grass: {
		colorBlend: [.24, .34],
		satRange: [0, .22]
	},
	platform: {
		hFrac: [.28, .34],
		radiusK: .12
	},
	mast: {
		widthK: [.18, .22],
		waistK: [.82, .88],
		topRound: [.32, .46],
		insetX: [.1, .12],
		topFrac: [.14, .22],
		headroom: [.12, .2],
		coreBlend: [0, .02]
	},
	rotor: {
		hubRk: [.11, .15],
		bladeLk: [.82, 1.1],
		bladeWk: [.1, .14],
		bladeTipRound: .6,
		spinSpeed: [.1, .35],
		spinJitter: Math.PI * .6,
		scaleK: [1.15, 1],
		hubYOffsetK: [.28, .16],
		line: {
			weight: [1, 2],
			lenK: [.5, .65],
			offset: [5, 7],
			alpha: [150, 125]
		},
		bladeOsc: {
			amp: [0, .2],
			speed: [.2, .4]
		}
	},
	kindBalance: {
		midpoint: .5,
		midpointBand: .08
	}
};
var FACTORY_SMOKE = {
	spawnX: [0, .8],
	spawnY: [.1, .25],
	count: [54, 20],
	sizeMin: [3.2, 1],
	sizeMax: [6.8, 2.2],
	lifeMin: [12, 3],
	lifeMax: [24, 5],
	alpha: [210, 0],
	dir: "up",
	spreadAngle: [6, .26],
	speedMin: [6, 14],
	speedMax: [12, 22],
	gravity: [-16, -8],
	drag: [.55, .72],
	jitterPos: [.4, 1.2],
	jitterAngle: [.06, .16],
	fadeInFrac: .22,
	fadeOutFrac: .38,
	edgeFadePx: {
		left: 2,
		right: 2,
		top: 2,
		bottom: 4
	},
	sizeHz: 4,
	base: blendRGB({
		r: 210,
		g: 120,
		b: 212
	}, {
		r: 60,
		g: 60,
		b: 80
	}, .65),
	blendK: [.05, .6],
	satOscAmp: [.2, .4],
	satOscSpeed: [.12, .2],
	brightnessRange: [2, .5],
	colWk: .28,
	colHk: 2.6
};
var POWER_BASE_PALETTE = {
	grass: {
		r: 130,
		g: 160,
		b: 110
	},
	mast: {
		r: 203,
		g: 209,
		b: 209
	},
	mastCore: {
		r: 178,
		g: 191,
		b: 190
	},
	hub: {
		r: 185,
		g: 189,
		b: 188
	},
	blade: {
		r: 230,
		g: 235,
		b: 244
	},
	bladeLine: {
		r: 210,
		g: 120,
		b: 212
	}
};
var POWER_DARK_PALETTE = {
	grass: {
		r: 35,
		g: 77,
		b: 156
	},
	mast: {
		r: 136,
		g: 148,
		b: 187
	},
	mastCore: {
		r: 118,
		g: 132,
		b: 168
	},
	hub: {
		r: 101,
		g: 119,
		b: 144
	},
	blade: {
		r: 136,
		g: 148,
		b: 187
	},
	bladeLine: {
		r: 115,
		g: 76,
		b: 142
	}
};
function clampBrightnessLocal(rgb, minK, maxK) {
	const k = Math.max(rgb.r, rgb.g, rgb.b) / 255 || 1;
	const s = Math.max(minK, Math.min(maxK, k)) / k;
	return {
		r: Math.round(rgb.r * s),
		g: Math.round(rgb.g * s),
		b: Math.round(rgb.b * s)
	};
}
function clampSaturation(rgb, minS, maxS) {
	const max = Math.max(rgb.r, rgb.g, rgb.b);
	const min = Math.min(rgb.r, rgb.g, rgb.b);
	const v = max;
	const s = max ? (max - min) / max : 0;
	const s2 = Math.max(minS, Math.min(maxS, s));
	if (s === 0 || s2 === s) return rgb;
	const m = max - min ? s2 * v / (max - min) : 1;
	const r = v - (v - rgb.r) * m;
	const g = v - (v - rgb.g) * m;
	const b = v - (v - rgb.b) * m;
	return {
		r: Math.round(r),
		g: Math.round(g),
		b: Math.round(b)
	};
}
function factorySmokeRowContext(t) {
	return {
		size: particleBucketRange(t, .26, 1),
		motion: particleBucketRange(t, .12, 1),
		life: particleBucketRange(t, 1.18, 1),
		count: particleBucketRange(t, .52, 1),
		columnW: particleBucketRange(t, .7, 1),
		columnH: particleBucketRange(t, .78, 1)
	};
}
function windProbability(u) {
	if (u < .25) return 0;
	if (u < .5) return .25;
	if (u < .75) return .75;
	return 1;
}
function randFromKey(key) {
	return seededUnit(shapeHash32(String(key)));
}
function instanceRand01FromKey(key) {
	return randFromKey(`power-kind-v2|${String(key)}`);
}
function resolvePowerVisualKind({ liveAvg, seedKey, occurrenceIndex: _occurrenceIndex = 0 }) {
	const u = clamp01(liveAvg);
	return instanceRand01FromKey(`kind|${String(seedKey)}`) < windProbability(u) ? "windTurbine" : "factory";
}
function factoryLayoutFromKey(key) {
	const seed = shapeHash32(`factory-layout|${String(key)}`);
	const rA = seededUnit(seed ^ 2654435769);
	const rB = seededUnit(seed ^ 2246822507);
	return {
		chimneyOnLeft: rA < .5,
		roofRiseK: .08 + .08 * rB
	};
}
function pickBodyTintVariantFromKey(key, gradientRGB, ex, ct, pal) {
	const r = seededUnit(shapeHash32(`power-body|${String(key)}`));
	const variants = pal === POWER_DARK_PALETTE ? [
		{
			r: 92,
			g: 108,
			b: 126
		},
		{
			r: 102,
			g: 116,
			b: 132
		},
		blendRGB({
			r: 96,
			g: 110,
			b: 128
		}, pal.hub, .18),
		blendRGB({
			r: 100,
			g: 114,
			b: 134
		}, pal.mastCore, .1)
	] : [
		scaleRgb(pal.mast, .78),
		scaleRgb(pal.mast, .82),
		blendRGB(scaleRgb(pal.mast, .85), pal.hub, .15),
		blendRGB(scaleRgb(pal.mast, .88), pal.mastCore, .1)
	];
	let tint = variants[Math.floor(r * variants.length) % variants.length];
	if (gradientRGB) tint = blendRGB(tint, gradientRGB, .06);
	return applySrgbExposureContrast(tint, ex, ct);
}
function drawPower(p, cx, cy, r, opts = {}) {
	const projection = shapeProjection(opts);
	const style = shapeStyle(opts);
	const lifecycle = shapeLifecycle(opts);
	const identity = shapeIdentity(opts);
	const sprite = shapeSprite(opts);
	const particles = shapeParticles(opts);
	const pass = shapePass(opts);
	const darkMode = style.darkMode === true;
	const pal = style.palette ?? (darkMode ? POWER_DARK_PALETTE : POWER_BASE_PALETTE);
	const cell = projection.cell;
	const cellW = projection.cellW ?? cell;
	const cellH = projection.cellH ?? cell;
	const f = projection.footprint;
	const u = clamp01(style.liveAvg ?? .5);
	const ex = typeof style.exposure === "number" ? style.exposure : 1;
	const ct = typeof style.contrast === "number" ? style.contrast : 1;
	const baseAlpha = typeof style.alpha === "number" && Number.isFinite(style.alpha) ? style.alpha : 235;
	const renderPass = pass.renderPass ?? "color";
	const maskColor = pass.maskColor;
	const requestedMaskAlpha = typeof pass.maskAlpha === "number" && Number.isFinite(pass.maskAlpha) ? pass.maskAlpha : baseAlpha;
	const shouldDrawMass = shouldDrawInRenderPass(renderPass, true);
	const shouldDrawColorDetails = shouldDrawInRenderPass(renderPass, false);
	const gradientRGB = style.gradientRGB ?? void 0;
	const isSprite = !!sprite.fitToFootprint || !!sprite.spriteMode;
	let pxX;
	let pxY;
	let pxW;
	let pxH;
	if (cell && f) ({x: pxX, y: pxY, w: pxW, h: pxH} = footprintToPx(f, projection));
	else {
		pxW = (cell ?? r * 2) * 1;
		pxH = (cell ?? r * 2) * 3;
		pxX = cx - pxW / 2;
		pxY = cy - pxH / 2;
	}
	const localTileW = f ? pxW / Math.max(1, f.w) : cellW ?? pxW;
	const localTileH = f ? pxH / Math.max(1, f.h) : cellH ?? pxH;
	const localTile = Math.max(1, Math.min(localTileW, localTileH));
	const rowBucket = f ? particleRowBucket(f, projection) : void 0;
	const smokeScale = factorySmokeRowContext(rowBucket?.t ?? 1);
	const particleSizeK = particleDepthSizeScale(rowBucket);
	const seedKey = identity.seedKey ?? identity.seed ?? `${String(pxX)}|${String(pxY)}|${String(pxW)}x${String(pxH)}`;
	const asTurbine = resolvePowerVisualKind({
		liveAvg: u,
		seedKey,
		occurrenceIndex: typeof identity.shapeOccurrenceIndex === "number" && Number.isFinite(identity.shapeOccurrenceIndex) ? identity.shapeOccurrenceIndex : 0
	}) === "windTurbine";
	const anchorX = pxX + pxW / 2;
	const anchorY = pxY + pxH;
	const m = applyShapeMods({
		p,
		x: anchorX,
		y: anchorY,
		r: Math.min(pxW, pxH),
		opts: {
			alpha: baseAlpha,
			timeMs: lifecycle.timeMs,
			liveAvg: style.liveAvg,
			rootAppearK: lifecycle.rootAppearK
		}
	});
	const alpha = typeof m.alpha === "number" ? m.alpha : baseAlpha;
	const appearAlphaK = baseAlpha > 0 ? clamp01(alpha / baseAlpha) : 1;
	const maskAlpha = renderPass === "depthMask" ? Math.round(requestedMaskAlpha * appearAlphaK) : alpha;
	const massAlpha = renderPass === "depthMask" ? maskAlpha : alpha;
	p.push();
	p.translate(m.x, m.y);
	p.scale(m.scaleX, m.scaleY);
	p.translate(-anchorX, -anchorY);
	const platFrac = resolveRangeValue(POWER.platform.hFrac, u);
	const platH = Math.max(2, Math.round(localTileH * platFrac));
	const platY = pxY + pxH - platH;
	let grassTint = pal.grass;
	if (gradientRGB) grassTint = blendRGB(grassTint, gradientRGB, resolveRangeValue(POWER.grass.colorBlend, u));
	grassTint = clampSaturation(grassTint, POWER.grass.satRange[0], POWER.grass.satRange[1]);
	grassTint = clampBrightnessLocal(grassTint, .35, .9);
	grassTint = applySrgbExposureContrast(grassTint, ex, ct);
	const rTop = Math.max(1, Math.round(localTile * POWER.platform.radiusK));
	if (shouldDrawMass) {
		p.noStroke();
		fillRgb(p, shapeColorForRenderPass(renderPass, grassTint, maskColor), massAlpha);
		p.rect(pxX, platY, pxW, platH, rTop, rTop, 0, 0);
	}
	if (!asTurbine) {
		const orientKey = `orient|${String(seedKey)}`;
		const { chimneyOnLeft: isLeftChimney } = factoryLayoutFromKey(orientKey);
		const roofVar = .9 + .25 * randFromKey(`${orientKey}|roofVar`);
		const bodyTint = pickBodyTintVariantFromKey(`body|${String(seedKey)}`, gradientRGB, ex, ct, pal);
		const bodyMarginX = Math.round(pxW * .14);
		const bodyW = Math.max(12, pxW - bodyMarginX * 2);
		const bodyH = Math.max(Math.round(pxH * .16), Math.round(localTileH * .9));
		const bodyX = pxX + bodyMarginX;
		const bodyTop = platY - bodyH;
		const roofRise = Math.round(Math.min(pxH * .1, localTileH * roofVar));
		p.noStroke();
		if (shouldDrawMass) {
			fillRgb(p, shapeColorForRenderPass(renderPass, bodyTint, maskColor), renderPass === "depthMask" ? maskAlpha : 255);
			p.rect(bodyX, bodyTop, bodyW, bodyH);
		}
		const xL = bodyX, xR = bodyX + bodyW, yTop = bodyTop + 1;
		const highX = isLeftChimney ? xL : xR;
		const lowX = isLeftChimney ? xR : xL;
		if (shouldDrawMass) {
			fillRgb(p, shapeColorForRenderPass(renderPass, bodyTint, maskColor), renderPass === "depthMask" ? maskAlpha : 255);
			p.triangle(lowX, yTop, highX, yTop, highX, yTop - roofRise);
		}
		if (shouldDrawColorDetails) {
			p.strokeWeight(1);
			strokeRgb(p, pal.mastCore, 255);
			p.noFill();
			p.line(lowX, yTop, highX, yTop - roofRise);
			p.noStroke();
		}
		const doorW = bodyW * .18;
		const doorH = bodyH * .32;
		const doorX = bodyX + bodyW / 2 - doorW / 2;
		const doorY = platY - doorH - 2;
		if (shouldDrawColorDetails) {
			fillRgb(p, applySrgbExposureContrast(scaleRgb(bodyTint, .8), ex, ct), 255);
			p.rect(doorX, doorY, doorW, doorH, 1, 1, 0, 0);
		}
		const tSec = (typeof lifecycle.timeMs === "number" ? lifecycle.timeMs : p.millis()) / 1e3;
		let emitW = Math.max(4, Math.round(bodyW * FACTORY_SMOKE.colWk * smokeScale.columnW));
		let emitH = Math.max(Math.round(localTileH * 1.4), Math.round(localTileH * FACTORY_SMOKE.colHk * smokeScale.columnH));
		if (isSprite) {
			emitW = Math.round(emitW * 1.35);
			emitH = Math.round(emitH * 1.25);
		}
		const peakY = yTop - roofRise;
		const chimW = Math.max(3, Math.round(Math.max(pxW * .18, localTileW * .34)));
		const chimneyCenterX = isLeftChimney ? xL + chimW / 2 : xR - chimW / 2;
		const emitBiasX = Math.round(emitW * .05);
		const emitX = chimneyCenterX - emitW / 2 - emitBiasX;
		const emitY = peakY - Math.round(localTileH * (isSprite ? 1.05 : 1));
		const blendK = resolveRangeValue(FACTORY_SMOKE.blendK, u);
		const satAmp = resolveRangeValue(FACTORY_SMOKE.satOscAmp, u);
		const satSpd = resolveRangeValue(FACTORY_SMOKE.satOscSpeed, u);
		let baseSmoke = FACTORY_SMOKE.base;
		if (gradientRGB) baseSmoke = blendRGB(baseSmoke, gradientRGB, blendK);
		let smoked = oscillateSaturation(baseSmoke, tSec, {
			amp: satAmp,
			speed: satSpd,
			phase: 0
		});
		smoked = clampBrightness(smoked, FACTORY_SMOKE.brightnessRange[0], FACTORY_SMOKE.brightnessRange[1]);
		smoked = applySrgbExposureContrast(smoked, ex, ct);
		const dt = typeof lifecycle.dtSec === "number" && lifecycle.dtSec > 0 ? lifecycle.dtSec : Math.max(1 / 120, p.deltaTime ? p.deltaTime / 1e3 : 1 / 60);
		const count = Math.max(4, Math.floor(resolveRangeValue(FACTORY_SMOKE.count, u) * smokeScale.count));
		let sizeMin = resolveRangeValue(FACTORY_SMOKE.sizeMin, u) * smokeScale.size * particleSizeK;
		let sizeMax = Math.max(sizeMin, resolveRangeValue(FACTORY_SMOKE.sizeMax, u) * smokeScale.size * particleSizeK);
		let lifeMin = Math.max(.05, resolveRangeValue(FACTORY_SMOKE.lifeMin, u) * smokeScale.life);
		let lifeMax = Math.max(lifeMin, resolveRangeValue(FACTORY_SMOKE.lifeMax, u) * smokeScale.life);
		let sAlpha = Math.max(60, Math.min(255, Math.round(resolveRangeValue(FACTORY_SMOKE.alpha, u))));
		let speedMin = resolveRangeValue(FACTORY_SMOKE.speedMin, u) * smokeScale.motion;
		let speedMax = Math.max(speedMin, resolveRangeValue(FACTORY_SMOKE.speedMax, u) * smokeScale.motion);
		let gravity = resolveRangeValue(FACTORY_SMOKE.gravity, u) * smokeScale.motion;
		const drag = resolveRangeValue(FACTORY_SMOKE.drag, u);
		let jPos = resolveRangeValue(FACTORY_SMOKE.jitterPos, u) * smokeScale.size;
		const jAng = resolveRangeValue(FACTORY_SMOKE.jitterAngle, u);
		const spread = resolveRangeValue(FACTORY_SMOKE.spreadAngle, u);
		if (isSprite) {
			const sizeBoost = 1.25, speedBoost = 1.1, lifeBoost = 1.2;
			sizeMin *= sizeBoost;
			sizeMax *= sizeBoost;
			speedMin *= speedBoost;
			speedMax *= speedBoost;
			lifeMin *= lifeBoost;
			lifeMax *= lifeBoost;
			gravity *= 1.08;
			jPos *= .85;
			sAlpha = Math.min(255, Math.round(sAlpha * 1.05));
		}
		const spawn = {
			x0: FACTORY_SMOKE.spawnX[0],
			x1: FACTORY_SMOKE.spawnX[1],
			y0: FACTORY_SMOKE.spawnY[0],
			y1: FACTORY_SMOKE.spawnY[1]
		};
		if (shouldDrawColorDetails) stepAndDrawPuffs(p, {
			store: particles.particleStore,
			key: `factory-smoke:${String(seedKey)}${isSprite ? ":spr" : ""}`,
			rect: {
				x: emitX,
				y: emitY,
				w: emitW,
				h: emitH
			},
			dir: FACTORY_SMOKE.dir,
			spreadAngle: spread,
			speed: {
				min: speedMin,
				max: speedMax
			},
			gravity,
			drag,
			accel: {
				x: 0,
				y: 0
			},
			spawn,
			jitter: {
				pos: jPos,
				velAngle: jAng
			},
			count,
			size: {
				min: sizeMin,
				max: sizeMax
			},
			sizeHz: FACTORY_SMOKE.sizeHz,
			lifetime: {
				min: lifeMin,
				max: lifeMax
			},
			fadeInFrac: FACTORY_SMOKE.fadeInFrac,
			fadeOutFrac: FACTORY_SMOKE.fadeOutFrac,
			edgeFadePx: isSprite ? {
				left: 3,
				right: 3,
				top: 0,
				bottom: 8
			} : FACTORY_SMOKE.edgeFadePx,
			color: {
				r: smoked.r,
				g: smoked.g,
				b: smoked.b,
				a: sAlpha
			},
			depthAlpha: particleDepthAlpha(rowBucket),
			respawn: true
		}, dt);
		const chimTopTarget = Math.max(pxY + Math.round(localTileH * .2), peakY - Math.round(localTileH * .1));
		const chimH = Math.max(Math.round(localTileH * .42), platY - chimTopTarget);
		const chimX = isLeftChimney ? xL : xR - chimW;
		const chimY = platY - chimH;
		let chimTint = darkMode ? {
			r: 112,
			g: 126,
			b: 148
		} : pal.mast;
		if (gradientRGB) chimTint = blendRGB(chimTint, gradientRGB, .08);
		chimTint = applySrgbExposureContrast(chimTint, ex, ct);
		if (shouldDrawMass) {
			fillRgb(p, shapeColorForRenderPass(renderPass, chimTint, maskColor), renderPass === "depthMask" ? maskAlpha : 255);
			p.rect(chimX, chimY, chimW, chimH);
		}
		const capH = Math.max(1, Math.round(localTileH * .12));
		const capY = chimY - Math.max(1, Math.round(localTileH * .1));
		if (shouldDrawMass) p.rect(chimX, capY, chimW, capH);
		if (shouldDrawMass) {
			const capOver = Math.round(chimW * .15);
			const capStrokeW = Math.max(1, Math.round(localTileH * .16));
			p.strokeWeight(capStrokeW);
			strokeRgb(p, shapeColorForRenderPass(renderPass, pal.mastCore, maskColor), renderPass === "depthMask" ? maskAlpha : 255);
			const capX0 = chimX - capOver / 2;
			const capX1 = chimX + chimW + capOver / 2;
			p.line(capX0, capY, capX1, capY);
			p.noStroke();
		}
		p.pop();
		return;
	}
	const compactTurbine = localTile <= 10 || pxW < 18;
	const insetX = Math.round(pxW * resolveRangeValue(POWER.mast.insetX, u));
	const baseW = Math.max(Math.min(3, Math.round(localTileW * .18)), Math.round(pxW * resolveRangeValue(POWER.mast.widthK, u)));
	const waistW = Math.max(Math.min(2, Math.round(localTileW * .14)), Math.round(baseW * resolveRangeValue(POWER.mast.waistK, u)));
	const topRFrac = resolveRangeValue(POWER.mast.topRound, u);
	const mastBottomY = pxY + pxH - Math.max(1, Math.round(localTileH * platFrac));
	const mastTopFrac = resolveRangeValue(POWER.mast.topFrac, u);
	const headroom = resolveRangeValue(POWER.mast.headroom, u);
	const tileTopY = pxY + Math.round(pxH * mastTopFrac);
	const mastClearance = compactTurbine ? Math.max(6, Math.round(localTileH * 2.1)) : 32;
	const mastTopY = Math.min(tileTopY + Math.round(pxH * headroom * .22), mastBottomY - mastClearance);
	const mastH = Math.max(compactTurbine ? 6 : 16, mastBottomY - mastTopY);
	const cxTile = pxX + pxW / 2;
	const baseX0 = cxTile - baseW / 2;
	const baseX1 = cxTile + baseW / 2;
	const waistX0 = cxTile - waistW / 2;
	const waistX1 = cxTile + waistW / 2;
	const minX = pxX + insetX;
	const maxX = pxX + pxW - insetX;
	const clampX = (v) => Math.max(minX, Math.min(maxX, v));
	const b0 = clampX(baseX0), b1 = clampX(baseX1);
	const w0 = clampX(waistX0), w1 = clampX(waistX1);
	let mastTint2 = pal.mast;
	if (gradientRGB) mastTint2 = blendRGB(mastTint2, gradientRGB, .1);
	mastTint2 = applySrgbExposureContrast(mastTint2, ex, ct);
	const hubR = compactTurbine ? Math.max(1, Math.round(localTileW * .1)) : Math.max(Math.min(2, Math.round(localTileW * .1)), Math.round(localTileW * resolveRangeValue(POWER.rotor.hubRk, u)));
	const hubCx = cxTile;
	const hubCy = mastTopY + Math.round(mastH * resolveRangeValue(POWER.rotor.hubYOffsetK, u));
	if (shouldDrawMass) {
		p.noStroke();
		fillRgb(p, shapeColorForRenderPass(renderPass, mastTint2, maskColor), renderPass === "depthMask" ? maskAlpha : 255);
		p.beginShape();
		p.vertex(b0, mastBottomY);
		p.vertex(b1, mastBottomY);
		p.vertex(w1, mastTopY + Math.round(mastH * .42));
		p.vertex(w0, mastTopY + Math.round(mastH * .42));
		p.endShape(p.CLOSE);
	}
	let coreBase = pal.mastCore;
	if (gradientRGB) coreBase = blendRGB(coreBase, gradientRGB, resolveRangeValue(POWER.mast.coreBlend, u));
	const coreTint = applySrgbExposureContrast(coreBase, ex, ct);
	const capW = Math.max(compactTurbine ? 2 : 4, Math.round(waistW * .98));
	const capR = Math.round(capW * topRFrac);
	const capCx = cxTile;
	const capY = mastTopY + Math.round(mastH * .42);
	const invX = m.scaleX !== 0 ? 1 / m.scaleX : 1;
	const invY = m.scaleY !== 0 ? 1 / m.scaleY : 1;
	if (shouldDrawMass) {
		p.push();
		p.rectMode(p.CENTER);
		p.translate(capCx, capY - capR);
		p.scale(invX, invY);
		fillRgb(p, shapeColorForRenderPass(renderPass, coreTint, maskColor), renderPass === "depthMask" ? maskAlpha : 255);
		p.rect(0, 0, capW, capR * 2, capR, capR, 0, 0);
		p.pop();
	}
	const capTopY = capY - capR - capR;
	if (shouldDrawMass) {
		p.push();
		const hiW = Math.max(2, Math.round(Math.max(4, Math.round(waistW * .98)) * .36));
		const hiX = cxTile - Math.max(1, Math.round(Math.max(4, Math.round(waistW * .98)) * .18));
		const hiY = mastTopY + Math.round(mastH * .3);
		const hiH = Math.max(6, Math.round(mastH * .12));
		p.translate(hiX + hiW / 2, hiY + hiH / 2);
		p.scale(invX, invY);
		p.rectMode(p.CENTER);
		fillRgb(p, shapeColorForRenderPass(renderPass, coreTint, maskColor), renderPass === "depthMask" ? maskAlpha : Math.round(alpha * .45));
		p.rect(0, 0, hiW, hiH);
		p.pop();
	}
	if (shouldDrawMass) {
		p.push();
		p.strokeWeight(Math.max(compactTurbine ? .5 : 1, Math.round(localTileW * .08)));
		strokeRgb(p, shapeColorForRenderPass(renderPass, pal.mastCore, maskColor), renderPass === "depthMask" ? maskAlpha : 255);
		p.noFill();
		const lineEndY = capTopY + 2;
		p.line(hubCx, hubCy, hubCx, lineEndY);
		p.pop();
	}
	const hubTint = applySrgbExposureContrast(pal.hub, ex, ct);
	if (shouldDrawMass) {
		const bladeRef = Math.max(localTileW, localTileH);
		const bladeScale = compactTurbine ? .72 : 1;
		const bladeL = Math.max(hubR * 2, Math.round(bladeRef * resolveRangeValue(POWER.rotor.bladeLk, u) * bladeScale));
		const bladeW = compactTurbine ? Math.max(1, Math.round(bladeRef * resolveRangeValue(POWER.rotor.bladeWk, u) * .62)) : Math.max(3, Math.round(bladeRef * resolveRangeValue(POWER.rotor.bladeWk, u)));
		const tipR = compactTurbine ? Math.max(1, Math.round(bladeW * .4)) : Math.round(bladeW * POWER.rotor.bladeTipRound);
		const tSec = (typeof lifecycle.timeMs === "number" ? lifecycle.timeMs : p.millis()) / 1e3;
		const seed = shapeHash32(`power|${String(seedKey)}`) >>> 0;
		const phase = seededUnit(seed) * POWER.rotor.spinJitter;
		const speed = typeof opts.rotorSpeed === "number" ? opts.rotorSpeed : resolveRangeValue(POWER.rotor.spinSpeed, u);
		const lineTint = applySrgbExposureContrast(pal.bladeLine, ex, ct);
		const baseBlade = applySrgbExposureContrast(pal.blade, ex, ct);
		const oscAmp = resolveRangeValue(POWER.rotor.bladeOsc.amp, u);
		const oscSpd = resolveRangeValue(POWER.rotor.bladeOsc.speed, u);
		const phase2 = phase + Math.PI * 2 * seededUnit(seed ^ 11259375);
		const bladeTint = scaleRgb(baseBlade, 1 + oscAmp * Math.sin(tSec * oscSpd + phase2));
		const rotorMods = applyShapeMods({
			p,
			x: hubCx,
			y: hubCy,
			r: hubR,
			opts: {
				timeMs: lifecycle.timeMs,
				liveAvg: style.liveAvg
			},
			mods: {
				rotation: {
					speed,
					phase
				},
				scale2D: {
					x: compactTurbine ? 1 : resolveRangeValue(POWER.rotor.scaleK, u),
					y: compactTurbine ? 1 : resolveRangeValue(POWER.rotor.scaleK, u),
					anchor: "bottom-center"
				}
			}
		});
		p.push();
		p.translate(hubCx, hubCy);
		p.rotate(rotorMods.rotation || 0);
		const sc = rotorMods.scaleX;
		p.translate(0, hubR);
		p.scale(sc, sc);
		p.translate(0, -hubR);
		const showBladeLine = !compactTurbine && bladeL >= 10 && bladeW >= 3;
		const lineW = showBladeLine ? Math.max(1, Math.round(resolveRangeValue(POWER.rotor.line.weight, u))) : 0;
		const lineLen = Math.round(bladeL * resolveRangeValue(POWER.rotor.line.lenK, u));
		const lineOff = Math.round(Math.min(resolveRangeValue(POWER.rotor.line.offset, u), hubR * .5));
		const lineA = Math.round(resolveRangeValue(POWER.rotor.line.alpha, u));
		const lineY = Math.round(bladeW / 2 - Math.max(1, lineW || 1));
		for (let i = 0; i < 3; i++) {
			const ang = i * (Math.PI * 2 / 3);
			p.push();
			p.rotate(ang);
			if (showBladeLine) {
				p.strokeWeight(lineW);
				strokeRgb(p, shapeColorForRenderPass(renderPass, lineTint, maskColor), renderPass === "depthMask" ? maskAlpha : Math.min(alpha, lineA));
				p.noFill();
				p.line(hubR + lineOff, lineY, hubR + lineOff + lineLen, lineY);
			}
			p.noStroke();
			fillRgb(p, shapeColorForRenderPass(renderPass, bladeTint, maskColor), massAlpha);
			p.rectMode(p.CENTER);
			const rootGap = Math.max(1, Math.round(hubR * (compactTurbine ? .12 : .2)));
			p.rect(bladeL / 2, 0, bladeL - rootGap, bladeW, tipR);
			p.rectMode(p.CORNER);
			const rootLen = compactTurbine ? Math.max(1, Math.round(bladeL * .12)) : Math.max(6, Math.round(bladeL * .18));
			p.rect(-rootGap, -Math.round(bladeW * .65), rootLen, Math.round(bladeW * 1.3), Math.round(bladeW * .6));
			p.pop();
		}
		p.pop();
	}
	if (shouldDrawMass) {
		p.noStroke();
		fillRgb(p, shapeColorForRenderPass(renderPass, hubTint, maskColor), massAlpha);
		p.circle(hubCx, hubCy, hubR * 2);
	}
	p.pop();
}
//#endregion
//#region src/canvas-engine/shapes/villa.ts
var VILLA = {
	body: {
		colorBlend: [.04, .02],
		brightnessRange: [.4, .7]
	},
	grass: {
		colorBlend: [.12, .18],
		satRange: [0, .14]
	},
	tree: { colorBlend: [.24, .38] },
	door: { sideMarginPxK: .12 },
	roof: {
		triFracFront: [.2, .24],
		triFracSide: [.24, .36]
	},
	sideVolume: { heightK: .84 },
	bodyShape: {
		frontHMinK: 1,
		frontHMaxK: 1.2,
		sideHMinK: .46,
		sideHMaxK: .68
	},
	variants: { sideRoofChance: .78 },
	windows: {
		marginY: 6,
		frontVert: [10, 16],
		sideSmall: [8, 10],
		sideYOffsetK: .38
	},
	foliage: {
		scaleRange: [.7, 1.15],
		baseWk: .2,
		baseHk: .36,
		triHk: .65,
		offsetEdgePx: 6,
		jitterPx: 4,
		wind: {
			rotAmp: .03,
			rotAmpTopMul: 1.35,
			xShearAmp: .06,
			speedRange: [.6, .2],
			phaseJitter: Math.PI * 4
		}
	}
};
var WINDOW_OSC = {
	amp: [.035, .08],
	speed: [.18, .4],
	colorAmp: [.05, .12],
	colorSpeed: [.045, .09],
	brightnessMin: [.56, .74],
	brightnessMax: [.84, .97],
	litCurve: .95
};
var WINDOW_COLOR_TARGETS = [
	{
		r: 255,
		g: 214,
		b: 122
	},
	{
		r: 255,
		g: 232,
		b: 176
	},
	{
		r: 255,
		g: 198,
		b: 104
	},
	{
		r: 236,
		g: 242,
		b: 255
	}
];
var VILLA_BASE_PALETTE = {
	grass: {
		r: 130,
		g: 172,
		b: 116
	},
	treeFoliage: [
		{
			r: 108,
			g: 176,
			b: 110
		},
		{
			r: 92,
			g: 161,
			b: 100
		},
		{
			r: 122,
			g: 192,
			b: 122
		},
		{
			r: 100,
			g: 148,
			b: 96
		},
		{
			r: 136,
			g: 202,
			b: 118
		},
		{
			r: 152,
			g: 214,
			b: 132
		},
		{
			r: 164,
			g: 224,
			b: 140
		},
		{
			r: 178,
			g: 234,
			b: 146
		}
	],
	body: [
		{
			r: 244,
			g: 228,
			b: 206
		},
		{
			r: 216,
			g: 236,
			b: 244
		},
		{
			r: 220,
			g: 236,
			b: 220
		},
		{
			r: 232,
			g: 224,
			b: 226
		},
		{
			r: 214,
			g: 232,
			b: 248
		},
		{
			r: 208,
			g: 226,
			b: 208
		},
		{
			r: 248,
			g: 236,
			b: 194
		},
		{
			r: 236,
			g: 216,
			b: 206
		},
		{
			r: 208,
			g: 216,
			b: 238
		}
	],
	roof: [
		{
			r: 190,
			g: 95,
			b: 80
		},
		{
			r: 150,
			g: 105,
			b: 92
		},
		{
			r: 130,
			g: 110,
			b: 100
		}
	],
	door: [
		{
			r: 172,
			g: 108,
			b: 78
		},
		{
			r: 146,
			g: 104,
			b: 88
		},
		{
			r: 188,
			g: 132,
			b: 96
		}
	],
	window: {
		lit: {
			r: 255,
			g: 234,
			b: 148
		},
		dark: {
			r: 120,
			g: 170,
			b: 220
		}
	}
};
var VILLA_DARK_PALETTE = {
	grass: {
		r: 58,
		g: 108,
		b: 114
	},
	grassByLight: {
		far: {
			r: 82,
			g: 94,
			b: 88
		},
		mid: {
			r: 68,
			g: 102,
			b: 100
		},
		near: {
			r: 58,
			g: 108,
			b: 114
		}
	},
	treeFoliage: [
		{
			r: 64,
			g: 102,
			b: 98
		},
		{
			r: 58,
			g: 94,
			b: 90
		},
		{
			r: 72,
			g: 110,
			b: 100
		},
		{
			r: 61,
			g: 88,
			b: 84
		},
		{
			r: 76,
			g: 116,
			b: 104
		},
		{
			r: 82,
			g: 124,
			b: 110
		},
		{
			r: 88,
			g: 132,
			b: 116
		},
		{
			r: 94,
			g: 140,
			b: 122
		},
		{
			r: 66,
			g: 108,
			b: 126
		},
		{
			r: 74,
			g: 98,
			b: 126
		},
		{
			r: 88,
			g: 112,
			b: 94
		},
		{
			r: 102,
			g: 120,
			b: 98
		},
		{
			r: 78,
			g: 90,
			b: 116
		},
		{
			r: 60,
			g: 110,
			b: 110
		},
		{
			r: 86,
			g: 100,
			b: 90
		},
		{
			r: 98,
			g: 128,
			b: 108
		}
	],
	treeFoliageByLight: {
		far: [
			{
				r: 128,
				g: 124,
				b: 100
			},
			{
				r: 132,
				g: 118,
				b: 104
			},
			{
				r: 118,
				g: 118,
				b: 106
			},
			{
				r: 116,
				g: 118,
				b: 108
			}
		],
		mid: [
			{
				r: 64,
				g: 140,
				b: 96
			},
			{
				r: 72,
				g: 138,
				b: 98
			},
			{
				r: 76,
				g: 134,
				b: 102
			},
			{
				r: 88,
				g: 140,
				b: 92
			},
			{
				r: 100,
				g: 138,
				b: 96
			},
			{
				r: 96,
				g: 136,
				b: 106
			}
		],
		near: [
			{
				r: 56,
				g: 116,
				b: 134
			},
			{
				r: 64,
				g: 116,
				b: 134
			},
			{
				r: 50,
				g: 120,
				b: 120
			},
			{
				r: 82,
				g: 122,
				b: 118
			},
			{
				r: 78,
				g: 120,
				b: 114
			},
			{
				r: 84,
				g: 118,
				b: 120
			}
		]
	},
	body: [
		{
			r: 126,
			g: 146,
			b: 180
		},
		{
			r: 118,
			g: 150,
			b: 192
		},
		{
			r: 122,
			g: 154,
			b: 186
		},
		{
			r: 130,
			g: 142,
			b: 188
		},
		{
			r: 120,
			g: 150,
			b: 196
		},
		{
			r: 114,
			g: 148,
			b: 172
		},
		{
			r: 154,
			g: 124,
			b: 158
		},
		{
			r: 110,
			g: 146,
			b: 166
		},
		{
			r: 136,
			g: 128,
			b: 176
		},
		{
			r: 106,
			g: 138,
			b: 178
		},
		{
			r: 142,
			g: 120,
			b: 166
		},
		{
			r: 112,
			g: 150,
			b: 154
		}
	],
	roof: [
		{
			r: 104,
			g: 60,
			b: 61
		},
		{
			r: 82,
			g: 66,
			b: 70
		},
		{
			r: 71,
			g: 69,
			b: 77
		}
	],
	door: [
		{
			r: 108,
			g: 74,
			b: 62
		},
		{
			r: 94,
			g: 70,
			b: 78
		},
		{
			r: 116,
			g: 82,
			b: 68
		}
	],
	window: {
		lit: {
			r: 255,
			g: 186,
			b: 62
		},
		dark: {
			r: 116,
			g: 128,
			b: 188
		}
	}
};
function oscillateWindowColor(base, timeSec, oscSeed) {
	const targetR = seededUnit(oscSeed ^ 374761393);
	const target = WINDOW_COLOR_TARGETS[Math.floor(targetR * WINDOW_COLOR_TARGETS.length) % WINDOW_COLOR_TARGETS.length];
	const amp = resolveRangeValue(WINDOW_OSC.colorAmp, seededUnit(oscSeed ^ 3550635116));
	const speed = resolveRangeValue(WINDOW_OSC.colorSpeed, seededUnit(oscSeed ^ 4251993797));
	const phase = seededUnit(oscSeed ^ 3042594569) * Math.PI * 2;
	return mixRgb(base, target, (.5 + .5 * Math.sin(timeSec * Math.PI * 2 * speed + phase)) * amp);
}
function treeTintFromGrass(grass, u, gradientRGB, ex = 1, ct = 1, opts = {}) {
	const { darkMode = false, lightSample = null, palette = null, seedKey = "villa-tree", blend = 1 } = opts;
	const band = lightSample ? lightClosenessBand(lightSample.closenessK) : "mid";
	const foliageSet = darkMode ? palette?.treeFoliageByLight?.[band] ?? palette?.treeFoliage : palette?.treeFoliage;
	if (foliageSet?.length) {
		let mixed = blendRGB(pick(foliageSet, seeded01(seedKey, `foliage|${band}`)), grass, darkMode ? .08 + .08 * u : .08 + .08 * u);
		const gradientBlend = clamp01(resolveRangeValue(VILLA.tree.colorBlend, u) * blend);
		if (gradientRGB && gradientBlend > 0) mixed = blendRGB(mixed, gradientRGB, gradientBlend);
		mixed = clampSaturation$1(mixed, 0, darkMode ? .28 : .32, 1);
		mixed = clampBrightness(mixed, darkMode ? .44 : .6, darkMode ? .55 : .88);
		return applySrgbExposureContrast(mixed, ex, ct);
	}
	const lightK = .26 + .18 * u;
	const base = {
		r: Math.min(255, Math.round(grass.r + (255 - grass.r) * lightK)),
		g: Math.min(255, Math.round(grass.g + (255 - grass.g) * lightK)),
		b: Math.min(255, Math.round(grass.b + (255 - grass.b) * lightK))
	};
	const cool = {
		r: 210,
		g: 230,
		b: 255
	};
	const k = .08 + .1 * u;
	const mixed = {
		r: Math.round(base.r + (cool.r - base.r) * k),
		g: Math.round(base.g + (cool.g - base.g) * k),
		b: Math.round(base.b + (cool.b - base.b) * k)
	};
	const gradientBlend = clamp01(resolveRangeValue(VILLA.tree.colorBlend, u) * blend);
	return applySrgbExposureContrast(clampBrightness(gradientRGB && gradientBlend > 0 ? blendRGB(mixed, gradientRGB, gradientBlend) : mixed, .55, .9), ex, ct);
}
function drawVilla(p, _cx, _cy, _r, opts = {}) {
	const projection = shapeProjection(opts);
	const style = shapeStyle(opts);
	const lifecycle = shapeLifecycle(opts);
	const identity = shapeIdentity(opts);
	const pass = shapePass(opts);
	const darkMode = style.darkMode === true;
	const pal = style.palette ?? (darkMode ? VILLA_DARK_PALETTE : VILLA_BASE_PALETTE);
	const cell = projection.cell;
	const f = projection.footprint;
	if (!cell || !f) return;
	const gradientRGB = style.gradientRGB ?? void 0;
	const ex = typeof style.exposure === "number" ? style.exposure : 1;
	const ct = typeof style.contrast === "number" ? style.contrast : 1;
	const t = (typeof lifecycle.timeMs === "number" ? lifecycle.timeMs : p.millis()) / 1e3;
	const baseAlpha = typeof style.alpha === "number" && Number.isFinite(style.alpha) ? style.alpha : 235;
	const opaque = 255;
	const renderPass = pass.renderPass ?? "color";
	const maskColor = pass.maskColor;
	const requestedMaskAlpha = typeof pass.maskAlpha === "number" && Number.isFinite(pass.maskAlpha) ? pass.maskAlpha : baseAlpha;
	shouldDrawInRenderPass(renderPass, false);
	const u = clamp01(style.liveAvg ?? .5);
	const liveBlend = clamp01(typeof style.blend === "number" ? style.blend : 1);
	function drawPart(includeInDepthMask, draw) {
		if (!shouldDrawInRenderPass(renderPass, includeInDepthMask)) return;
		draw(renderPass === "depthMask");
	}
	const { x: pxX, y: pxY, w: pxW, h: pxH } = footprintToPx(f, projection);
	const localTileW = pxW / Math.max(1, f.w);
	const localTileH = pxH / Math.max(1, f.h);
	const localTile = Math.min(localTileW, localTileH);
	const smallScale = localTile <= 8;
	const seedKey = identity.seedKey ?? identity.seed ?? `villa|${String(f.r0)}:${String(f.c0)}|${String(f.w)}x${String(f.h)}`;
	function pulseLitWindow(base, slotKey) {
		const oscSeed = shapeHash32(`${String(seedKey)}|window-osc|${String(slotKey)}`);
		return oscillateWindowColor(oscillateBrightness(clampBrightness(base, resolveRangeValue(WINDOW_OSC.brightnessMin, seededUnit(oscSeed ^ 668265263)), resolveRangeValue(WINDOW_OSC.brightnessMax, seededUnit(oscSeed ^ 3144134277))), t, {
			amp: resolveRangeValue(WINDOW_OSC.amp, seededUnit(oscSeed ^ 2654435769)),
			speed: resolveRangeValue(WINDOW_OSC.speed, seededUnit(oscSeed ^ 2246822507)),
			phase: seededUnit(oscSeed ^ 3266489909) * Math.PI * 2
		}), t, oscSeed);
	}
	const anchorX = pxX + pxW / 2;
	const anchorY = pxY + pxH;
	const m = applyShapeMods({
		p,
		x: anchorX,
		y: anchorY,
		r: Math.min(pxW, pxH),
		opts: {
			alpha: baseAlpha,
			timeMs: lifecycle.timeMs,
			liveAvg: style.liveAvg,
			rootAppearK: lifecycle.rootAppearK
		}
	});
	const drawAlpha = typeof m.alpha === "number" ? m.alpha : baseAlpha;
	const appearAlphaK = baseAlpha > 0 ? clamp01(drawAlpha / baseAlpha) : 1;
	const maskAlpha = renderPass === "depthMask" ? Math.round(requestedMaskAlpha * appearAlphaK) : opaque;
	p.push();
	p.translate(m.x, m.y);
	p.scale(m.scaleX, m.scaleY);
	p.translate(-anchorX, -anchorY);
	const blockCount = Math.max(1, f.w);
	const colW = pxW / blockCount;
	const baseGrassH = Math.max(1, Math.min(Math.round(localTileH / 3), Math.round(pxH * .1)));
	const tallK = 1.55;
	const sidePresent = seeded01(seedKey, "whichSidePresent") < VILLA.variants.sideRoofChance;
	const sideIndex = sidePresent ? seeded01(seedKey, "sideIndex") < .5 ? 0 : 1 : -1;
	const order = sidePresent ? [sideIndex, 1 - sideIndex] : [0, 1];
	const villaWindowSlots = [];
	for (let col = 0; col < blockCount; col++) if (col === sideIndex) villaWindowSlots.push(`side|${String(col)}|0`, `side|${String(col)}|1`);
	else villaWindowSlots.push(`front|${String(col)}`);
	const villaLitRatio = Math.pow(1 - u, WINDOW_OSC.litCurve);
	const villaLitCount = Math.min(villaWindowSlots.length, Math.round(villaLitRatio * villaWindowSlots.length));
	const villaLitSlots = new Set(villaWindowSlots.map((slot) => ({
		slot,
		rank: seeded01(seedKey, `lit-slot|${slot}`)
	})).sort((a, b) => a.rank - b.rank).slice(0, villaLitCount).map((entry) => entry.slot));
	const leftIsTaller = seeded01(seedKey, "grassSide") < .5;
	const grassLight = sampleDirectionalLightRect({
		x: pxX,
		y: pxY + pxH - Math.max(1, Math.round(baseGrassH * tallK)),
		w: pxW,
		h: Math.max(1, Math.round(baseGrassH * tallK))
	}, style.lightCtx ?? null);
	let grassTint = darkMode ? pickLightBandValue(pal.grass, pal.grassByLight, grassLight.closenessK) : pal.grass;
	if (gradientRGB) grassTint = blendRGB(grassTint, gradientRGB, resolveRangeValue(VILLA.grass.colorBlend, u));
	if (darkMode) {
		grassTint = clampSaturation$1(grassTint, VILLA.grass.satRange[0], VILLA.grass.satRange[1], 1);
		grassTint = clampBrightness(grassTint, .36, .54);
	}
	grassTint = applySrgbExposureContrast(grassTint, ex, ct);
	const rGrass = Math.round(localTile * .06);
	const grassTopY = [];
	const shouldDrawGrass = shouldDrawInRenderPass(renderPass, true);
	if (shouldDrawGrass) {
		p.push();
		p.noStroke();
		fillRgb(p, shapeColorForRenderPass(renderPass, grassTint, maskColor), renderPass === "depthMask" ? maskAlpha : drawAlpha);
	}
	for (let col = 0; col < blockCount; col++) {
		const isLeft = col === 0;
		const gH = Math.max(1, Math.round(baseGrassH * (isLeft === leftIsTaller ? tallK : 1)));
		const gY = pxY + pxH - gH;
		const gLeft = Math.round(pxX + col * colW);
		const gRight = Math.round(pxX + (col + 1) * colW);
		const gX = gLeft;
		const gW = Math.max(1, gRight - gLeft);
		const tl = isLeft ? rGrass : 0;
		const bl = isLeft ? rGrass : 0;
		const tr = isLeft ? 0 : rGrass;
		const br = isLeft ? 0 : rGrass;
		if (shouldDrawGrass) p.rect(gX, gY, gW, gH, tl, tr, br, bl);
		grassTopY[col] = gY;
	}
	if (shouldDrawGrass) p.pop();
	const colMetrics = Array.from({ length: blockCount }, (_, col) => {
		const isSideCol = col === sideIndex;
		const gTop = grassTopY[col];
		const r1 = seeded01(`${String(seedKey)}|col${String(col)}`, "r1");
		const [hMin, hMax] = isSideCol ? [VILLA.bodyShape.sideHMinK, VILLA.bodyShape.sideHMaxK] : [VILLA.bodyShape.frontHMinK, VILLA.bodyShape.frontHMaxK];
		const hK = hMin + (hMax - hMin) * r1;
		const desiredBodyH = Math.round(colW * hK);
		const roofFrac = isSideCol ? VILLA.roof.triFracSide : VILLA.roof.triFracFront;
		const availH = Math.max(3, gTop - pxY);
		const roofH = clampMinMax(Math.round(localTileH * resolveRangeValue(roofFrac, u)), smallScale ? 1 : 2, Math.max(1, Math.floor(availH * (isSideCol ? .38 : .45))));
		const minBodyH = isSideCol ? smallScale ? Math.max(2, Math.round(localTileH * .7)) : Math.max(4, Math.round(localTileH * .82)) : smallScale ? Math.max(2, Math.round(localTileH * .9)) : Math.max(6, Math.round(localTileH * 1.15));
		const maxBodyH = Math.max(minBodyH, availH - roofH);
		return {
			roofH,
			bodyH: clampMinMax(desiredBodyH, minBodyH, maxBodyH),
			minBodyH,
			maxBodyH
		};
	});
	if (sidePresent && sideIndex >= 0) {
		const frontMetric = colMetrics[1 - sideIndex];
		const sideMetric = colMetrics[sideIndex];
		const sideBodyTarget = frontMetric.bodyH + frontMetric.roofH - sideMetric.roofH;
		sideMetric.bodyH = clampMinMax(Math.round(sideBodyTarget * VILLA.sideVolume.heightK), sideMetric.minBodyH, sideMetric.maxBodyH);
	}
	const roofDrawers = [];
	for (const col of order) {
		const isLeftCol = col === 0;
		const colLeft = Math.round(pxX + col * colW);
		const colRight = Math.round(pxX + (col + 1) * colW);
		const x = colLeft;
		const gTop = grassTopY[col];
		const isSide = col === sideIndex;
		const r1 = seeded01(`${String(seedKey)}|col${String(col)}`, "r1");
		const r2 = seeded01(`${String(seedKey)}|col${String(col)}`, "r2");
		const rDoorSide = seeded01(`${String(seedKey)}|col${String(col)}`, "doorSide");
		const rDoor = seeded01(`${String(seedKey)}|col${String(col)}`, "doorPick");
		const rBush = seeded01(`${String(seedKey)}|col${String(col)}`, "bush");
		const { roofH, bodyH } = colMetrics[col];
		const bodyY = Math.max(pxY, gTop - bodyH);
		let bodyTint = blendRGB(pal.body[Math.floor(r2 * pal.body.length) % pal.body.length], {
			r: 255,
			g: 255,
			b: 255
		}, 0);
		if (gradientRGB) bodyTint = blendRGB(bodyTint, gradientRGB, resolveRangeValue(VILLA.body.colorBlend, u));
		bodyTint = clampBrightness(bodyTint, VILLA.body.brightnessRange[0], VILLA.body.brightnessRange[1]);
		bodyTint = applySrgbExposureContrast(bodyTint, ex, ct);
		const ix = colLeft;
		const iColW = Math.max(1, colRight - colLeft);
		const iBodyY = Math.round(bodyY);
		const colLight = sampleDirectionalLightRect({
			x: ix,
			y: iBodyY,
			w: iColW,
			h: Math.max(1, gTop - iBodyY)
		}, style.lightCtx ?? null);
		bodyTint = mixRgb(bodyTint, colLight.lightColor, .24 * colLight.overallK);
		const rBody = Math.max(0, Math.round(localTile * .06));
		const tl = isLeftCol ? rBody : 0;
		const bl = isLeftCol ? rBody : 0;
		const tr = isLeftCol ? 0 : rBody;
		const br = isLeftCol ? 0 : rBody;
		p.push();
		p.noStroke();
		drawPart(true, () => {
			fillRgb(p, shapeColorForRenderPass(renderPass, bodyTint, maskColor), maskAlpha);
			p.rect(ix, iBodyY, iColW, bodyH, tl, tr, br, bl);
		});
		drawPart(false, () => {
			paintPixelLightBands(p, {
				x: ix,
				y: iBodyY,
				w: iColW,
				h: bodyH
			}, colLight, {
				alpha: opaque,
				highlightColor: mixRgb(bodyTint, colLight.lightColor, .52),
				shadowColor: mixRgb(bodyTint, colLight.shadowColor, .3),
				corner: rBody,
				sideK: .42,
				topK: 0,
				shadowK: .18
			});
		});
		drawPart(false, () => {
			let bushOnLeft = Math.floor(rBush * 2) === 0;
			if (!isSide) {
				const cellsH = bodyH / cell;
				const low = 1.5;
				const mid = 1.8;
				let dProfile = "short";
				if (cellsH >= low) dProfile = "mid";
				if (cellsH > mid) dProfile = "tall";
				const dCfg = {
					short: {
						W_FRAC: .18,
						H_FRAC: .24,
						Y_OFFSET_FRAC: 0
					},
					mid: {
						W_FRAC: .18,
						H_FRAC: .22,
						Y_OFFSET_FRAC: 0
					},
					tall: {
						W_FRAC: .18,
						H_FRAC: .18,
						Y_OFFSET_FRAC: -.02
					}
				}[dProfile];
				const compactDoor = localTile <= 16;
				const doorDetailK = compactDoor ? clampMinMax(localTile / 16, .58, .9) : 1;
				const doorW = Math.max(compactDoor ? 1 : 3, Math.round(iColW * dCfg.W_FRAC * doorDetailK));
				const doorH = Math.max(compactDoor ? 1 : 4, Math.round(bodyH * dCfg.H_FRAC * doorDetailK));
				const doorOnLeft = rDoorSide < .5;
				const doorMargin = Math.round(iColW * VILLA.door.sideMarginPxK);
				const doorX = doorOnLeft ? ix + doorMargin : ix + iColW - doorMargin - doorW;
				const doorY = Math.min(iBodyY + bodyH - doorH, iBodyY + bodyH - doorH + Math.round(bodyH * dCfg.Y_OFFSET_FRAC));
				let doorTint = pal.door[Math.floor(rDoor * pal.door.length) % pal.door.length];
				if (gradientRGB) doorTint = blendRGB(doorTint, gradientRGB, resolveRangeValue(VILLA.body.colorBlend, u));
				doorTint = applySrgbExposureContrast(doorTint, ex, ct);
				fillRgb(p, doorTint, drawAlpha);
				p.rect(doorX, doorY, doorW, doorH, Math.round(localTile * .012));
				let wProfile = "short";
				if (cellsH >= low) wProfile = "mid";
				if (cellsH > mid) wProfile = "tall";
				const fCfg = {
					short: {
						W_FRAC: .15,
						H_FRAC: .22,
						TOP_FRAC: .18,
						BOT_MARGIN: 6
					},
					mid: {
						W_FRAC: .17,
						H_FRAC: .18,
						TOP_FRAC: .15,
						BOT_MARGIN: 6
					},
					tall: {
						W_FRAC: .15,
						H_FRAC: .14,
						TOP_FRAC: .13,
						BOT_MARGIN: 6
					}
				}[wProfile];
				const frontSlot = `front|${String(col)}`;
				const winColor = applySrgbExposureContrast(villaLitSlots.has(frontSlot) ? pulseLitWindow(pal.window.lit, frontSlot) : pal.window.dark, ex, ct);
				const wW = Math.max(smallScale ? 2 : 3, Math.round(iColW * fCfg.W_FRAC));
				const wH = Math.max(smallScale ? 2 : 4, Math.round(bodyH * fCfg.H_FRAC));
				const bandTop = iBodyY + Math.round(bodyH * (fCfg.TOP_FRAC ?? 0));
				const yCenter = bandTop + (Math.max(bandTop + 1, doorY - (fCfg.BOT_MARGIN ?? 0)) - bandTop) * .4;
				const y = Math.round(yCenter - wH / 2);
				const winX = doorOnLeft ? ix + iColW - doorMargin - wW : ix + doorMargin;
				fillRgb(p, winColor, drawAlpha);
				if (y >= iBodyY + 2 && y + wH <= iBodyY + bodyH - 2) p.rect(winX, y, wW, wH, 2);
				bushOnLeft = !doorOnLeft;
			} else {
				const cellsH = bodyH / cell;
				const low = 1.5;
				const mid = 1.8;
				let sProfile = "short";
				if (cellsH >= low) sProfile = "mid";
				if (cellsH > mid) sProfile = "tall";
				const sCfg = {
					short: {
						W_FRAC: .12,
						H_FRAC: .14,
						Y_OFF_FRAC: VILLA.windows.sideYOffsetK
					},
					mid: {
						W_FRAC: .13,
						H_FRAC: .13,
						Y_OFF_FRAC: VILLA.windows.sideYOffsetK
					},
					tall: {
						W_FRAC: .15,
						H_FRAC: .11,
						Y_OFF_FRAC: VILLA.windows.sideYOffsetK
					}
				}[sProfile];
				const sideSlot0 = `side|${String(col)}|0`;
				const sideSlot1 = `side|${String(col)}|1`;
				const sideLit0 = villaLitSlots.has(sideSlot0);
				const sideLit1 = villaLitSlots.has(sideSlot1);
				const sideBase0 = sideLit0 ? pulseLitWindow(pal.window.lit, sideSlot0) : pal.window.dark;
				const sideBase1 = sideLit1 ? pulseLitWindow(pal.window.lit, sideSlot1) : pal.window.dark;
				const c0 = applySrgbExposureContrast(sideBase0, ex, ct);
				const c1 = applySrgbExposureContrast(sideBase1, ex, ct);
				const wW = Math.max(smallScale ? 2 : 3, Math.round(iColW * sCfg.W_FRAC));
				const wH = Math.max(smallScale ? 2 : 3, Math.round(bodyH * sCfg.H_FRAC));
				const yCenter = iBodyY + Math.round(bodyH * (sCfg.Y_OFF_FRAC ?? 0));
				const y = Math.round(yCenter - wH / 2);
				const leftCx = ix + Math.round(iColW * .35);
				const rightCx = ix + Math.round(iColW * .65);
				if (y >= iBodyY + 2 && y + wH <= iBodyY + bodyH - 2) {
					fillRgb(p, c0, drawAlpha);
					p.rect(leftCx - Math.round(wW / 2), y, wW, wH, 2);
					fillRgb(p, c1, drawAlpha);
					p.rect(rightCx - Math.round(wW / 2), y, wW, wH, 2);
				}
			}
			if (!isSide) {
				const F = VILLA.foliage;
				const baseW = iColW * F.baseWk;
				const baseH = iColW * F.baseHk;
				const foliageScaleK = Math.min(1, Math.max(.2, localTile / 16));
				const outerInset = F.offsetEdgePx * foliageScaleK;
				const jitter = (rBush * 2 - 1) * F.jitterPx * foliageScaleK;
				const edgeX = bushOnLeft ? ix + outerInset : ix + iColW - outerInset;
				const cx = Math.max(ix + baseW * .5, Math.min(ix + iColW - baseW * .5, (bushOnLeft ? edgeX + baseW * .5 : edgeX - baseW * .5) + jitter));
				const cy = grassTopY[col];
				const s = resolveRangeValue(F.scaleRange, u);
				const speed = F.wind.speedRange[0] + (F.wind.speedRange[1] - F.wind.speedRange[0]) * r1;
				const phase = rBush * F.wind.phaseJitter;
				const { x: bx, scaleX, scaleY, rotation } = applyShapeMods({
					p,
					x: cx,
					y: cy,
					r: baseH,
					opts: {
						timeMs: lifecycle.timeMs,
						liveAvg: u
					},
					mods: {
						scale2D: {
							x: s,
							y: s,
							anchor: "bottom-center"
						},
						scale2DOsc: {
							mode: "relative",
							biasX: 1,
							ampX: F.wind.xShearAmp,
							biasY: 1,
							ampY: 0,
							speed,
							phaseX: phase,
							anchor: "bottom-center"
						},
						rotationOsc: {
							amp: F.wind.rotAmp,
							speed,
							phase
						}
					}
				});
				const w = baseW * scaleX;
				const h = baseH * scaleY;
				const by = cy;
				const bushLight = sampleDirectionalLightRect({
					x: bx - w / 2,
					y: by - h,
					w,
					h
				}, style.lightCtx ?? null);
				const bushTint = mixRgb(treeTintFromGrass(grassTint, u, gradientRGB, ex, ct, {
					darkMode,
					lightSample: bushLight,
					palette: pal,
					seedKey: `${String(seedKey)}|front-bush|${String(col)}`,
					blend: liveBlend
				}), bushLight.lightColor, .18 * bushLight.overallK);
				const bushHighlight = mixRgb(bushTint, bushLight.lightColor, .34);
				const bushShadow = mixRgb(bushTint, bushLight.shadowColor, .24);
				p.push();
				p.translate(bx, by);
				p.rotate(rotation);
				p.noStroke();
				fillRgb(p, bushTint, opaque);
				const bushCorner = Math.min(localTile * .18, h * .4);
				p.rect(-w / 2, -h, w, h, bushCorner);
				paintPixelLightBands(p, {
					x: -w / 2,
					y: -h,
					w,
					h
				}, bushLight, {
					alpha: opaque,
					highlightColor: bushHighlight,
					shadowColor: bushShadow,
					corner: bushCorner,
					sideK: .4,
					topK: .24,
					shadowK: .18
				});
				p.pop();
			}
		});
		roofDrawers.push(() => {
			p.push();
			p.noStroke();
			drawPart(true, (isMaskPass) => {
				if (!isSide) {
					const ridgeY = Math.round(Math.max(pxY, bodyY - roofH));
					const apexX = ix + iColW / 2;
					const baseY = iBodyY + Math.min(2, Math.max(1, Math.floor(bodyH * .14)));
					const safeRidgeY = Math.min(ridgeY, baseY - 1);
					p.noStroke();
					fillRgb(p, shapeColorForRenderPass(renderPass, bodyTint, maskColor), maskAlpha);
					p.beginShape();
					p.vertex(ix, baseY);
					p.vertex(ix + iColW, baseY);
					p.vertex(apexX, safeRidgeY);
					p.endShape(p.CLOSE);
					const strokeCol = isMaskPass ? shapeColorForRenderPass(renderPass, bodyTint, maskColor) : applySrgbExposureContrast(scaleRgb(bodyTint, .72), ex, ct);
					p.strokeWeight(Math.max(1, Math.round(localTile * .06)));
					strokeRgb(p, strokeCol, isMaskPass ? maskAlpha : opaque);
					p.noFill();
					const trimRidgeExtend = Math.max(.5, localTile * .018);
					const trimOuterExtend = Math.max(1, localTile * .045);
					const drawRoofTrim = (baseX) => {
						const dx = baseX - apexX;
						const dy = baseY - safeRidgeY;
						const len = Math.max(1, Math.hypot(dx, dy));
						const ux = dx / len;
						const uy = dy / len;
						p.line(apexX - ux * trimRidgeExtend, safeRidgeY - uy * trimRidgeExtend, baseX + ux * trimOuterExtend, baseY + uy * trimOuterExtend);
					};
					drawRoofTrim(ix);
					drawRoofTrim(ix + iColW);
					return;
				}
				const roofTint = mixRgb(applySrgbExposureContrast(scaleRgb(bodyTint, .72), ex, ct), colLight.lightColor, .18 * colLight.overallK);
				const roofRectH = Math.max(1, Math.round(roofH - Math.max(.5, localTileH * .08)));
				const topY = Math.max(pxY, iBodyY - roofRectH);
				const rx = ix;
				const rw = iColW;
				p.noStroke();
				fillRgb(p, shapeColorForRenderPass(renderPass, roofTint, maskColor), maskAlpha);
				p.rect(rx, topY, Math.max(1, rw), roofRectH);
				if (isMaskPass) return;
				const F = VILLA.foliage;
				const baseCX = isLeftCol ? x + colW * .2 : x + colW * .8;
				const baseCY = grassTopY[col] + Math.max(1, Math.round(localTileH * .05));
				const baseTriH = Math.max(1, localTileH * F.triHk);
				const baseHalfW = Math.max(.75, localTileW * .2);
				const s = resolveRangeValue(F.scaleRange, u);
				const speed = F.wind.speedRange[0] + (F.wind.speedRange[1] - F.wind.speedRange[0]) * r1;
				const phase = rBush * F.wind.phaseJitter;
				const lowRes = applyShapeMods({
					p,
					x: baseCX,
					y: baseCY,
					r: baseTriH,
					opts: {
						timeMs: lifecycle.timeMs,
						liveAvg: u
					},
					mods: {
						scale2D: {
							x: s,
							y: s,
							anchor: "bottom-center"
						},
						scale2DOsc: {
							mode: "relative",
							biasX: 1,
							ampX: F.wind.xShearAmp,
							biasY: 1,
							ampY: 0,
							speed,
							phaseX: phase,
							anchor: "bottom-center"
						},
						rotationOsc: {
							amp: F.wind.rotAmp,
							speed,
							phase
						}
					}
				});
				const topRes = applyShapeMods({
					p,
					x: baseCX,
					y: baseCY,
					r: baseTriH,
					opts: {
						timeMs: lifecycle.timeMs,
						liveAvg: u
					},
					mods: {
						scale2D: {
							x: s,
							y: s,
							anchor: "bottom-center"
						},
						scale2DOsc: {
							mode: "relative",
							biasX: 1,
							ampX: F.wind.xShearAmp * 1.1,
							biasY: 1,
							ampY: 0,
							speed,
							phaseX: phase + .6,
							anchor: "bottom-center"
						},
						rotationOsc: {
							amp: F.wind.rotAmp * F.wind.rotAmpTopMul,
							speed,
							phase: phase + .6
						}
					}
				});
				const treeLight = sampleDirectionalLightRect({
					x: baseCX - baseHalfW,
					y: baseCY - baseTriH * 1.8,
					w: baseHalfW * 2,
					h: baseTriH * 1.8
				}, style.lightCtx ?? null);
				let treeColor = treeTintFromGrass(grassTint, u, gradientRGB, ex, ct, {
					darkMode,
					lightSample: treeLight,
					palette: pal,
					seedKey: `${String(seedKey)}|side-tree|${String(col)}`,
					blend: liveBlend
				});
				treeColor = mixRgb(treeColor, treeLight.lightColor, .16 * treeLight.overallK);
				const treeHighlight = mixRgb(treeColor, treeLight.lightColor, .32);
				const treeShadow = mixRgb(treeColor, treeLight.shadowColor, .22);
				p.noStroke();
				{
					const trunkH = Math.max(1, baseTriH * .26);
					const trunkW = Math.max(1, baseHalfW * .24);
					let trunkColor = pal.door[Math.floor(rDoor * pal.door.length) % pal.door.length];
					trunkColor = applySrgbExposureContrast(trunkColor, ex, ct);
					trunkColor = mixRgb(trunkColor, treeLight.shadowColor, .12 * treeLight.overallK);
					fillRgb(p, trunkColor, opaque);
					p.rect(Math.round(baseCX - trunkW / 2), Math.round(baseCY - trunkH * .28), Math.round(trunkW), Math.round(trunkH));
				}
				fillRgb(p, treeColor, opaque);
				{
					const triH = baseTriH * lowRes.scaleY;
					const halfW = baseHalfW * lowRes.scaleX;
					p.push();
					p.translate(lowRes.x, baseCY);
					p.rotate(lowRes.rotation);
					p.beginShape();
					p.vertex(-halfW, 0);
					p.vertex(halfW, 0);
					p.vertex(0, -triH);
					p.endShape(p.CLOSE);
					paintDirectionalTriangleBands(p, {
						leftX: -halfW,
						rightX: halfW,
						baseY: 0,
						apexX: 0,
						apexY: -triH
					}, treeLight, {
						alpha: opaque,
						highlightColor: treeHighlight,
						shadowColor: treeShadow
					});
					p.pop();
				}
				{
					const triH = baseTriH * topRes.scaleY;
					const halfW = baseHalfW * .75 * topRes.scaleX;
					const lowerTriH = baseTriH * lowRes.scaleY;
					const topBaseY = baseCY - Math.round(lowerTriH * .52);
					fillRgb(p, treeColor, opaque);
					p.push();
					p.translate(topRes.x, topBaseY);
					p.rotate(topRes.rotation);
					p.beginShape();
					p.vertex(-halfW, 0);
					p.vertex(halfW, 0);
					p.vertex(0, -Math.round(triH * .82));
					p.endShape(p.CLOSE);
					paintDirectionalTriangleBands(p, {
						leftX: -halfW,
						rightX: halfW,
						baseY: 0,
						apexX: 0,
						apexY: -Math.round(triH * .82)
					}, treeLight, {
						alpha: opaque,
						highlightColor: treeHighlight,
						shadowColor: treeShadow
					});
					p.pop();
				}
			});
			p.pop();
		});
		p.pop();
	}
	for (const drawRoof of roofDrawers) drawRoof();
	p.pop();
}
//#endregion
//#region src/canvas-engine/shapes/car.ts
var CAR_VARIANTS = {
	suv: "suv",
	sedan: "sedan",
	jeep: "jeep"
};
var CAR = {
	grass: { colorBlend: [.16, .3] },
	body: { colorBlend: [.04, .1] },
	asphalt: {
		min: [.25, .32],
		max: [.52, .65]
	},
	bodyOscY: {
		ampR: [.015, .01],
		intensity: [1, .3],
		speedHz: [4, .35],
		phase: [0, 0]
	}
};
var CAR_BASE_PALETTE = {
	grass: [
		{
			r: 110,
			g: 160,
			b: 90
		},
		{
			r: 130,
			g: 180,
			b: 110
		},
		{
			r: 100,
			g: 150,
			b: 85
		}
	],
	asphalt: {
		r: 125,
		g: 125,
		b: 125
	},
	body: [
		{
			r: 210,
			g: 138,
			b: 108
		},
		{
			r: 224,
			g: 158,
			b: 118
		},
		{
			r: 232,
			g: 192,
			b: 130
		},
		{
			r: 144,
			g: 178,
			b: 132
		},
		{
			r: 104,
			g: 142,
			b: 118
		},
		{
			r: 150,
			g: 192,
			b: 186
		},
		{
			r: 126,
			g: 156,
			b: 206
		},
		{
			r: 146,
			g: 186,
			b: 220
		},
		{
			r: 156,
			g: 136,
			b: 198
		},
		{
			r: 206,
			g: 146,
			b: 154
		},
		{
			r: 222,
			g: 212,
			b: 148
		},
		{
			r: 126,
			g: 128,
			b: 134
		}
	],
	window: {
		r: 154,
		g: 188,
		b: 218
	},
	wheel: {
		r: 40,
		g: 40,
		b: 40
	}
};
var CAR_DARK_PALETTE = {
	grass: [
		{
			r: 52,
			g: 96,
			b: 104
		},
		{
			r: 58,
			g: 108,
			b: 114
		},
		{
			r: 48,
			g: 90,
			b: 102
		}
	],
	grassByLight: {
		far: [
			{
				r: 76,
				g: 90,
				b: 92
			},
			{
				r: 80,
				g: 96,
				b: 94
			},
			{
				r: 70,
				g: 86,
				b: 92
			}
		],
		mid: [
			{
				r: 68,
				g: 96,
				b: 94
			},
			{
				r: 72,
				g: 102,
				b: 96
			},
			{
				r: 64,
				g: 90,
				b: 92
			}
		],
		near: [
			{
				r: 52,
				g: 96,
				b: 104
			},
			{
				r: 58,
				g: 108,
				b: 114
			},
			{
				r: 48,
				g: 90,
				b: 102
			}
		]
	},
	asphalt: {
		r: 68,
		g: 79,
		b: 96
	},
	body: [
		{
			r: 86,
			g: 98,
			b: 210
		},
		{
			r: 208,
			g: 92,
			b: 140
		},
		{
			r: 220,
			g: 150,
			b: 96
		},
		{
			r: 76,
			g: 150,
			b: 220
		},
		{
			r: 70,
			g: 176,
			b: 156
		},
		{
			r: 104,
			g: 196,
			b: 116
		},
		{
			r: 150,
			g: 110,
			b: 222
		},
		{
			r: 72,
			g: 170,
			b: 240
		},
		{
			r: 128,
			g: 90,
			b: 210
		},
		{
			r: 92,
			g: 130,
			b: 230
		}
	],
	window: {
		r: 104,
		g: 116,
		b: 174
	},
	wheel: {
		r: 22,
		g: 25,
		b: 31
	}
};
function drawCarAsset(p, cx, wheelY, r, opts = {}) {
	const style = shapeStyle(opts);
	const lifecycle = shapeLifecycle(opts);
	const identity = shapeIdentity(opts);
	const pass = shapePass(opts);
	const darkMode = style.darkMode === true;
	const pal = style.palette ?? (darkMode ? CAR_DARK_PALETTE : CAR_BASE_PALETTE);
	const ex = finiteNumber(style.exposure, 1);
	const ct = finiteNumber(style.contrast, 1);
	const alpha = finiteNumber(style.alpha, 255);
	const u = clamp01(style.liveAvg ?? .5);
	const renderPass = pass.renderPass ?? "color";
	const maskColor = pass.maskColor;
	const maskAlpha = typeof pass.maskAlpha === "number" && Number.isFinite(pass.maskAlpha) ? pass.maskAlpha : alpha;
	const isDepthMaskPass = renderPass === "depthMask";
	const shouldDrawMass = shouldDrawInRenderPass(renderPass, true);
	const shouldDrawColorDetails = shouldDrawInRenderPass(renderPass, false);
	const solidAlpha = isDepthMaskPass ? maskAlpha : 255;
	const seedKey = identity.seedKey ?? identity.seed ?? `car-asset|${String(Math.round(cx))}|${String(Math.round(wheelY))}|${String(Math.round(r))}`;
	const rBodyPick = seededTag01(seedKey, "bodyTint");
	const rVariant = seededTag01(seedKey, "variant");
	const rSide = seededTag01(seedKey, "sideBias");
	let bodyTint = pick(pal.body, rBodyPick);
	if (style.gradientRGB) bodyTint = blendRGB(bodyTint, style.gradientRGB, resolveRangeValue(CAR.body.colorBlend, u));
	if (darkMode) bodyTint = clampBrightness(bodyTint, .5, 1);
	bodyTint = applySrgbExposureContrast(bodyTint, ex, ct);
	const windowTint = applySrgbExposureContrast(pal.window, ex, ct);
	const w = r * 3.2;
	const wheelR = Math.max(2, r * .52);
	if (opts.useAppear !== false) {
		const m = applyShapeMods({
			p,
			x: cx,
			y: wheelY,
			r,
			opts: {
				alpha,
				timeMs: lifecycle.timeMs ?? p.millis(),
				liveAvg: u,
				rootAppearK: lifecycle.rootAppearK
			}
		});
		p.push();
		p.translate(m.x, m.y);
		p.scale(m.scaleX, m.scaleY);
		p.translate(-cx, -wheelY);
	} else p.push();
	if (shouldDrawColorDetails) {
		fillRgb(p, pal.wheel, 255);
		p.circle(cx - w * .38, wheelY, wheelR);
		p.circle(cx + w * .38, wheelY, wheelR);
	}
	const baseAmpR = resolveRangeValue(CAR.bodyOscY.ampR, u);
	const intensity = clamp01(resolveRangeValue(CAR.bodyOscY.intensity, u));
	const oscAmp = r * baseAmpR * intensity;
	const oscHz = resolveRangeValue(CAR.bodyOscY.speedHz, u);
	const oscPhase = resolveRangeValue(CAR.bodyOscY.phase, u);
	const mBody = applyShapeMods({
		p,
		x: cx,
		y: 0,
		r,
		opts: {
			timeMs: lifecycle.timeMs ?? p.millis(),
			liveAvg: u
		},
		mods: { translateOscY: {
			amp: oscAmp,
			speed: oscHz,
			phase: oscPhase
		} }
	});
	const bodyYOffset = isDepthMaskPass ? 0 : mBody.y;
	const variant = opts.variant ?? (rVariant < .4 ? CAR_VARIANTS.suv : rVariant < .8 ? CAR_VARIANTS.sedan : CAR_VARIANTS.jeep);
	if (variant === CAR_VARIANTS.suv) {
		const h = r * 1.9;
		const bodyCy = wheelY - h * .46 + bodyYOffset;
		const bodyRect = {
			x: cx - w / 2,
			y: bodyCy - h / 2,
			w,
			h
		};
		const bodyLight = sampleDirectionalLightRect(bodyRect, style.lightCtx ?? null);
		const suvTint = mixRgb(bodyTint, bodyLight.lightColor, .28 * bodyLight.overallK);
		const suvHighlight = mixRgb(suvTint, bodyLight.lightColor, .46);
		const suvShadow = mixRgb(suvTint, bodyLight.shadowColor, .3);
		if (shouldDrawMass) {
			p.noStroke();
			fillRgb(p, shapeColorForRenderPass(renderPass, suvTint, maskColor), solidAlpha);
			p.rect(cx - w / 2, bodyCy - h / 2, w, h, r * .42);
		}
		if (shouldDrawColorDetails) {
			paintPixelLightBands(p, bodyRect, bodyLight, {
				alpha: 255,
				highlightColor: suvHighlight,
				shadowColor: suvShadow,
				corner: Math.round(r * .42),
				sideK: .4,
				topK: .28,
				shadowK: .18
			});
			fillRgb(p, windowTint, 255);
			const winH = h * .42;
			const winY = bodyCy - h * .18 - winH / 2;
			p.rect(cx - w * .3, winY, w * .6, winH, r * .1);
		}
	} else if (variant === CAR_VARIANTS.sedan) {
		const chassisW = w * .94;
		const chassisH = Math.max(1, r * .4);
		const chassisCy = wheelY - chassisH * .55 + bodyYOffset;
		const cabinBottomW = w * .7;
		const cabinTopW = cabinBottomW * .84;
		const cabinH = Math.max(1, r * 1.05);
		const cabinBaseY = chassisCy - chassisH / 2;
		const cabinTopY = cabinBaseY - cabinH;
		const x0 = cx - cabinBottomW / 2;
		const x1 = cx + cabinBottomW / 2;
		const xt0 = cx - cabinTopW / 2;
		const xt1 = cx + cabinTopW / 2;
		const bodyLight = sampleDirectionalLightRect({
			x: cx - chassisW / 2,
			y: cabinTopY,
			w: chassisW,
			h: wheelY - cabinTopY
		}, style.lightCtx ?? null);
		const sedanTint = mixRgb(bodyTint, bodyLight.lightColor, .26 * bodyLight.overallK);
		const sedanHighlight = mixRgb(sedanTint, bodyLight.lightColor, .44);
		const sedanShadow = mixRgb(sedanTint, bodyLight.shadowColor, .26);
		if (shouldDrawMass) {
			p.noStroke();
			fillRgb(p, shapeColorForRenderPass(renderPass, sedanTint, maskColor), solidAlpha);
			p.rect(cx - chassisW / 2, chassisCy - chassisH / 2, chassisW, chassisH, r * .22);
			fillRgb(p, shapeColorForRenderPass(renderPass, sedanTint, maskColor), solidAlpha);
			p.beginShape();
			p.vertex(x0, cabinBaseY);
			p.vertex(x1, cabinBaseY);
			p.vertex(xt1, cabinTopY);
			p.vertex(xt0, cabinTopY);
			p.endShape(p.CLOSE);
		}
		if (!shouldDrawColorDetails) {
			p.pop();
			return;
		}
		paintPixelLightBands(p, {
			x: cx - chassisW / 2,
			y: chassisCy - chassisH / 2,
			w: chassisW,
			h: chassisH
		}, bodyLight, {
			alpha: 255,
			highlightColor: sedanHighlight,
			shadowColor: sedanShadow,
			corner: Math.round(r * .22),
			sideK: .36,
			topK: .22,
			shadowK: .16
		});
		const litLeft = bodyLight.leftK >= bodyLight.rightK;
		const sideLitK = Math.max(bodyLight.leftK, bodyLight.rightK);
		p.fill(sedanHighlight.r, sedanHighlight.g, sedanHighlight.b, Math.round(255 * .34 * sideLitK));
		p.beginShape();
		if (litLeft) {
			p.vertex(x0, cabinBaseY);
			p.vertex(x0 + cabinBottomW * .22, cabinBaseY);
			p.vertex(xt0 + cabinTopW * .2, cabinTopY);
			p.vertex(xt0, cabinTopY);
		} else {
			p.vertex(x1 - cabinBottomW * .22, cabinBaseY);
			p.vertex(x1, cabinBaseY);
			p.vertex(xt1, cabinTopY);
			p.vertex(xt1 - cabinTopW * .2, cabinTopY);
		}
		p.endShape(p.CLOSE);
		p.fill(sedanHighlight.r, sedanHighlight.g, sedanHighlight.b, Math.round(255 * .22 * bodyLight.topK));
		p.beginShape();
		p.vertex(x0 + cabinBottomW * .14, cabinBaseY);
		p.vertex(x1 - cabinBottomW * .14, cabinBaseY);
		p.vertex(xt1 - cabinTopW * .12, cabinTopY + Math.max(1, r * .08));
		p.vertex(xt0 + cabinTopW * .12, cabinTopY + Math.max(1, r * .08));
		p.endShape(p.CLOSE);
		p.fill(sedanShadow.r, sedanShadow.g, sedanShadow.b, Math.round(255 * .16 * sideLitK));
		p.beginShape();
		if (litLeft) {
			p.vertex(x1 - cabinBottomW * .18, cabinBaseY);
			p.vertex(x1, cabinBaseY);
			p.vertex(xt1, cabinTopY);
			p.vertex(xt1 - cabinTopW * .14, cabinTopY);
		} else {
			p.vertex(x0, cabinBaseY);
			p.vertex(x0 + cabinBottomW * .18, cabinBaseY);
			p.vertex(xt0 + cabinTopW * .14, cabinTopY);
			p.vertex(xt0, cabinTopY);
		}
		p.endShape(p.CLOSE);
		const insetX = Math.max(1, r * .25);
		const insetTop = Math.max(1, r * .2);
		const insetBot = Math.max(1, r * .28);
		const midW = cabinTopW + (cabinBottomW - cabinTopW) * .45;
		const innerW = Math.max(1, midW - insetX * 2);
		const innerH = Math.max(1, cabinBaseY - cabinTopY - insetTop - insetBot);
		const innerX = cx - innerW / 2;
		const innerY = cabinTopY + insetTop;
		const gap = Math.max(2, r * .18);
		const eachW = (innerW - gap) / 2;
		const eachH = innerH * .72;
		const winY = innerY + (innerH - eachH) * .35;
		fillRgb(p, windowTint, 255);
		p.rect(innerX, winY, eachW, eachH, r * .1);
		p.rect(innerX + eachW + gap, winY, eachW, eachH, r * .1);
	} else {
		const leftAligned = rSide < .5;
		const chassisW = w * .92;
		const chassisH = Math.max(1, r * .65);
		const chassisCy = wheelY - chassisH * .58 + bodyYOffset;
		const bodyLight = sampleDirectionalLightRect({
			x: cx - chassisW / 2,
			y: wheelY - r * 1.8 + bodyYOffset,
			w: chassisW,
			h: r * 1.8
		}, style.lightCtx ?? null);
		const jeepTint = mixRgb(bodyTint, bodyLight.lightColor, .28 * bodyLight.overallK);
		const jeepHighlight = mixRgb(jeepTint, bodyLight.lightColor, .46);
		const jeepShadow = mixRgb(jeepTint, bodyLight.shadowColor, .28);
		if (shouldDrawMass) {
			p.noStroke();
			fillRgb(p, shapeColorForRenderPass(renderPass, jeepTint, maskColor), solidAlpha);
			p.rect(cx - chassisW / 2, chassisCy - chassisH / 2, chassisW, chassisH, r * .18);
		}
		if (shouldDrawColorDetails) paintPixelLightBands(p, {
			x: cx - chassisW / 2,
			y: chassisCy - chassisH / 2,
			w: chassisW,
			h: chassisH
		}, bodyLight, {
			alpha: 255,
			highlightColor: jeepHighlight,
			shadowColor: jeepShadow,
			corner: Math.round(r * .18),
			sideK: .4,
			topK: .2,
			shadowK: .16
		});
		const cabinW = w * .64;
		const cabinH = Math.max(1, r * 1.15);
		const cabinTopY = chassisCy - chassisH / 2 - cabinH;
		const sidePad = Math.max(.5, r * .2);
		const cabinX0 = leftAligned ? cx - chassisW / 2 + sidePad : cx + chassisW / 2 - cabinW - sidePad;
		if (shouldDrawMass) {
			fillRgb(p, shapeColorForRenderPass(renderPass, jeepTint, maskColor), solidAlpha);
			p.rect(cabinX0, cabinTopY, cabinW, cabinH, r * .1);
		}
		if (shouldDrawColorDetails) paintPixelLightBands(p, {
			x: cabinX0,
			y: cabinTopY,
			w: cabinW,
			h: cabinH
		}, bodyLight, {
			alpha: 255,
			highlightColor: jeepHighlight,
			shadowColor: jeepShadow,
			corner: Math.round(r * .1),
			sideK: .32,
			topK: .24,
			shadowK: .14
		});
		const pad = Math.max(1, r * .22);
		const innerW = cabinW - pad * 2;
		const innerH = cabinH - pad * 2;
		const gap = Math.max(1, r * .2);
		const eachW = (innerW - gap) / 2;
		const eachH = innerH * .7;
		const winY = cabinTopY + pad + (innerH - eachH) * .3;
		if (shouldDrawColorDetails) {
			fillRgb(p, windowTint, 255);
			p.rect(cabinX0 + pad, winY, eachW, eachH, r * .08);
			p.rect(cabinX0 + pad + eachW + gap, winY, eachW, eachH, r * .08);
		}
	}
	p.pop();
}
function drawCar(p, cx, cy, r, opts = {}) {
	const projection = shapeProjection(opts);
	const style = shapeStyle(opts);
	const lifecycle = shapeLifecycle(opts);
	const identity = shapeIdentity(opts);
	const sprite = shapeSprite(opts);
	const pass = shapePass(opts);
	const darkMode = style.darkMode === true;
	const pal = style.palette ?? (darkMode ? CAR_DARK_PALETTE : CAR_BASE_PALETTE);
	const ex = finiteNumber(style.exposure, 1);
	const ct = finiteNumber(style.contrast, 1);
	const alpha = finiteNumber(style.alpha, 255);
	const u = clamp01(style.liveAvg ?? .5);
	const renderPass = pass.renderPass ?? "color";
	const maskColor = pass.maskColor;
	const maskAlpha = typeof pass.maskAlpha === "number" && Number.isFinite(pass.maskAlpha) ? pass.maskAlpha : alpha;
	const shouldDrawMass = shouldDrawInRenderPass(renderPass, true);
	const shouldDrawColorDetails = shouldDrawInRenderPass(renderPass, false);
	const massAlpha = renderPass === "depthMask" ? maskAlpha : alpha;
	const cell = projection.cell;
	const f = projection.footprint;
	let tileX;
	let tileY;
	let tileW;
	let tileH;
	if (cell && f) ({x: tileX, y: tileY, w: tileW, h: tileH} = footprintToPx(f, projection));
	else {
		tileW = r * 3;
		tileH = r * 3;
		tileX = cx - tileW / 2;
		tileY = cy - tileH / 2;
	}
	const cx0 = cell && f ? tileX + tileW / 2 : cx;
	const seedKey = identity.seedKey ?? identity.seed ?? `car|${String(Math.round(tileX))}|${String(Math.round(tileY))}|${String(Math.round(tileW))}x${String(Math.round(tileH))}`;
	const rGrass1 = seededTag01(seedKey, "ground:grass1");
	const rGrass2 = seededTag01(seedKey, "ground:grass2");
	const grassH = tileH * .5;
	const grassY = tileY + tileH - grassH;
	const aspH = grassH * .38;
	const aspY = grassY + (grassH - aspH) / 2;
	const baseY = tileY + tileH;
	const m = applyShapeMods({
		p,
		x: cx0,
		y: baseY,
		r,
		opts: {
			alpha,
			timeMs: lifecycle.timeMs,
			liveAvg: style.liveAvg,
			rootAppearK: lifecycle.rootAppearK
		}
	});
	p.push();
	p.translate(m.x, m.y);
	p.scale(m.scaleX, m.scaleY);
	p.translate(-cx0, -baseY);
	const grassLight = sampleDirectionalLightRect({
		x: tileX,
		y: grassY,
		w: tileW,
		h: grassH
	}, style.lightCtx ?? null);
	const grassPalette = darkMode ? pickLightBandValue(pal.grass, pal.grassByLight, grassLight.closenessK) : pal.grass;
	let grassTint = blendRGB(pick(grassPalette, rGrass1), pick(grassPalette, rGrass2), .4 + .3 * u);
	if (style.gradientRGB) grassTint = blendRGB(grassTint, style.gradientRGB, resolveRangeValue(CAR.grass.colorBlend, u));
	if (darkMode) {
		grassTint = clampSaturation$1(grassTint, 0, .22, 1);
		grassTint = clampBrightness(grassTint, .28, .42);
	}
	grassTint = applySrgbExposureContrast(grassTint, ex, ct);
	if (darkMode) {
		const grassLightK = grassLight.overallK * (.03 + .08 * grassLight.closenessK);
		grassTint = mixRgb(grassTint, grassLight.lightColor, grassLightK);
	}
	p.noStroke();
	if (shouldDrawMass) {
		fillRgb(p, shapeColorForRenderPass(renderPass, grassTint, maskColor), massAlpha);
		p.rect(tileX, grassY, tileW, grassH, r * .18);
	}
	if (shouldDrawColorDetails) {
		let aspColor = applySrgbExposureContrast(pal.asphalt, ex, ct);
		aspColor = clampBrightness(aspColor, resolveRangeValue(CAR.asphalt.min, u), resolveRangeValue(CAR.asphalt.max, u));
		fillRgb(p, aspColor, alpha);
		p.rect(tileX, aspY, tileW, aspH, r * .14);
	}
	const wheelY = aspY + aspH * .62;
	const designW = cell && f ? tileW : r * 3.2;
	const designUnit = cell && f ? Math.max(1, tileW / 3.2) : r;
	const sidePad = Math.max(2, tileW * .06);
	beginFitScale(p, {
		cx: cx0,
		anchorY: wheelY,
		scale: fitScaleToRectWidth(designW, tileW, sidePad, { allowUpscale: sprite.allowUpscale === true })
	});
	drawCarAsset(p, cx0, wheelY, designUnit, {
		style: {
			alpha,
			exposure: ex,
			contrast: ct,
			darkMode,
			gradientRGB: style.gradientRGB,
			liveAvg: u,
			lightCtx: style.lightCtx
		},
		identity: { seedKey },
		pass: {
			renderPass,
			maskColor,
			maskAlpha
		},
		useAppear: false
	});
	endFitScale(p);
	p.pop();
}
//#endregion
//#region src/canvas-engine/shapes/sea.ts
var SEA_TUNING = {
	gradient: {
		gamma: true,
		blendTop: [.1, .05],
		blendBottom: [.1, .05]
	},
	colorClamp: {
		sat: {
			min: .1,
			max: .85
		},
		bright: {
			min: .4,
			max: .8
		},
		strength: 1
	},
	scale: {
		baseYRange: [.88, .45],
		oscHzRange: [.45, .85],
		oscAmpRange: [.04, .008]
	},
	appear: { easing: "cubic" },
	overflow: {
		allow: false,
		extraTopPx: 0,
		extraBottomPx: 0
	},
	opacity: { mul: .88 },
	antialias: { expandPx: 2 },
	topBorder: {
		enable: false,
		topLinePx: 1,
		topLineAlpha: .28,
		topLineMix: .25
	},
	foam: {
		enable: true,
		band: {
			heightPx: 10,
			offsetTopPx: 4,
			oscAmpPx: 3,
			oscHzRange: [.12, .25]
		},
		motion: {
			dir: "up",
			spreadAngle: .35,
			speedPxSec: [5, 11],
			gravity: -5,
			drag: .8,
			jitterPos: .5,
			jitterAngle: .15
		},
		pool: {
			count: 18,
			sizePx: [.8, 1.8],
			sizeHz: 6,
			lifetimeSec: [.8, 1.6],
			fadeInFrac: .2,
			fadeOutFrac: .35
		},
		edgeFadePx: {
			left: 6,
			right: 6,
			top: 0,
			bottom: 10
		},
		color: {
			base: {
				r: 250,
				g: 252,
				b: 255,
				a: 200
			},
			varyBySize: true
		}
	},
	bowl: {
		enable: true,
		thicknessK: .2,
		baseFrac: .18,
		postTopFrac: .24,
		colWidthK: 1,
		cornerK: .1,
		mobile: {
			cellMax: 28,
			thicknessK: .1,
			baseFrac: .12,
			postTopFrac: .08,
			colWidthK: .85,
			cornerK: .12
		},
		grassBlend: {
			colorBlend: [.2, .34],
			satRange: [0, .16],
			brightRange: [.35, .9]
		},
		alphaMul: 1,
		pieceRadiusPx: void 0,
		baseOverlapPx: void 0,
		postBottomLiftPx: void 0
	},
	capRect: {
		enable: true,
		widthTiles: .9,
		heightTiles: .45,
		cornerPx: 6,
		followOffsetPx: 0,
		color: {
			top: {
				r: 245,
				g: 248,
				b: 252,
				a: 255
			},
			bottom: {
				r: 210,
				g: 230,
				b: 252,
				a: 255
			}
		},
		scaleMap: {
			uMin: .2,
			uMax: .85,
			xMin: .4,
			xMax: 1,
			yMin: .3,
			yMax: 1.22
		},
		alphaMul: 1,
		satOsc: {
			amp: .08,
			speed: .16,
			phase: 0
		}
	},
	spill: {
		enable: true,
		offsetTilesX: .25,
		leftNudgePx: 0,
		rightNudgePx: 0,
		count: 34,
		sizePx: [2.5, 5],
		leftSpeedPxSec: [60, 120],
		rightSpeedPxSec: [60, 120],
		gravity: 360,
		drag: 6,
		lifetimeSec: [1.2, 2],
		spillPx: 40,
		fadeInFrac: .15,
		fadeOutFrac: .35,
		edgeFadePx: {
			left: 2,
			right: 8,
			top: 4,
			bottom: 8
		},
		coneAccelX: 120,
		spreadAngle: .45,
		leftSpawnFracX: [.7, .96],
		rightSpawnFracX: [0, .2],
		liveGate: {
			min: .25,
			max: 0,
			soft: .12
		},
		leftEdgeFadeLeftPx: 2,
		leftLifetimeSec: [1.2, 2],
		leftExtraRoomPx: 24,
		mobile: {
			cellMax: 28,
			leftNudgePx: 8,
			rightNudgePx: -4
		}
	}
};
var SEA_BASE_PALETTE = {
	top: {
		r: 138,
		g: 196,
		b: 234
	},
	bottom: {
		r: 25,
		g: 124,
		b: 179
	}
};
var SEA_DARK_PALETTE = {
	top: {
		r: 76,
		g: 124,
		b: 179
	},
	bottom: {
		r: 14,
		g: 78,
		b: 137
	}
};
var SEA_WARM_PALETTE = {
	top: {
		r: 148,
		g: 210,
		b: 218
	},
	bottom: {
		r: 48,
		g: 140,
		b: 168
	}
};
var SEA_COOL_PALETTE = {
	top: {
		r: 118,
		g: 182,
		b: 228
	},
	bottom: {
		r: 12,
		g: 98,
		b: 168
	}
};
var GRASS_BASE = {
	r: 150,
	g: 190,
	b: 150
};
var GRASS_DARK = {
	r: 72,
	g: 102,
	b: 130
};
function seaRGBAtY(y, topY, bottomY, topRGB, bottomRGB) {
	const t = Math.max(0, Math.min(1, (y - topY) / Math.max(1e-6, bottomY - topY)));
	return {
		r: Math.round(topRGB.r + (bottomRGB.r - topRGB.r) * t),
		g: Math.round(topRGB.g + (bottomRGB.g - topRGB.g) * t),
		b: Math.round(topRGB.b + (bottomRGB.b - topRGB.b) * t)
	};
}
function liveWindowK(u, a, b, s = 0) {
	let lo = a, hi = b;
	if (lo > hi) [lo, hi] = [hi, lo];
	if (s <= 0) return u >= lo && u <= hi ? 1 : 0;
	const inL = smoothstep01((u - (lo - s)) / s);
	const inR = smoothstep01((hi + s - u) / s);
	return Math.max(0, Math.min(1, Math.min(inL, inR)));
}
function drawSea(p, _x, _y, _r, opts = {}) {
	const projection = shapeProjection(opts);
	const style = shapeStyle(opts);
	const lifecycle = shapeLifecycle(opts);
	const sprite = shapeSprite(opts);
	const particles = shapeParticles(opts);
	const pass = shapePass(opts);
	const darkMode = style.darkMode === true;
	const pal = style.palette ?? (darkMode ? SEA_DARK_PALETTE : opts.paletteTheme === "warm" ? SEA_WARM_PALETTE : opts.paletteTheme === "cool" ? SEA_COOL_PALETTE : SEA_BASE_PALETTE);
	const grassPal = darkMode ? GRASS_DARK : GRASS_BASE;
	const cell = projection.cell;
	const cellW = projection.cellW ?? cell;
	const cellH = projection.cellH ?? cell;
	const f = projection.footprint;
	if (!cell || !f) return;
	const renderPass = pass.renderPass ?? "color";
	const isDepthMaskPass = renderPass === "depthMask";
	const shouldDrawColorDetails = !isDepthMaskPass;
	const maskColor = pass.maskColor;
	const isSprite = (sprite.fitToFootprint ?? false) || (sprite.spriteMode ?? false);
	const pxK = isSprite ? Math.max(1, sprite.coreScaleMult ?? sprite.pixelScale ?? 1) : 1;
	const T = SEA_TUNING;
	const tSec = (typeof lifecycle.timeMs === "number" ? lifecycle.timeMs : p.millis()) / 1e3;
	const u = clamp01(style.liveAvg ?? .5);
	const baseAlpha = typeof style.alpha === "number" ? style.alpha : 235;
	const alphaMulGlobal = clamp01(T.opacity.mul);
	const requestedMaskAlpha = typeof pass.maskAlpha === "number" && Number.isFinite(pass.maskAlpha) ? pass.maskAlpha : baseAlpha;
	const spanTilesX = f.w;
	const rowBucket = particleRowBucket(f, projection);
	const particleDepthA = particleDepthAlpha(rowBucket);
	const particleSizeK = particleDepthSizeScale(rowBucket);
	const { x: x0, y: y0, w, h } = footprintToPx(f, projection);
	const cx = x0 + w / 2;
	const bottomY = y0 + h;
	const baseScaleY = resolveRangeValue(T.scale.baseYRange, u);
	const oscHz = Math.max(0, opts.oscHz ?? resolveRangeValue(T.scale.oscHzRange, u));
	const oscAmp = Math.max(0, opts.oscAmp ?? resolveRangeValue(T.scale.oscAmpRange, u));
	const oscT = .5 + .5 * Math.sin(tSec * (oscHz * 2 * Math.PI));
	const oscScaleY = lerpNumber(1 - oscAmp, 1 + oscAmp, oscT);
	const waterScaleY = Math.max(0, Math.min(1.25, baseScaleY * oscScaleY));
	const useGamma = T.gradient.gamma;
	const blendTopK = clamp01(resolveRangeValue(T.gradient.blendTop, u));
	const blendBottomK = clamp01(resolveRangeValue(T.gradient.blendBottom, u));
	const blender = useGamma ? blendRGBGamma : blendRGB;
	let topRGB = style.gradientRGB ? blender(pal.top, style.gradientRGB, blendTopK) : pal.top;
	let bottomRGB = style.gradientRGB ? blender(pal.bottom, style.gradientRGB, blendBottomK) : pal.bottom;
	const clampStrength = clamp01(T.colorClamp.strength);
	if (clampStrength > 0) {
		const { min: sMin, max: sMax } = T.colorClamp.sat;
		const { min: lMin, max: lMax } = T.colorClamp.bright;
		const clampOnce = (c) => clampBrightness(clampSaturation$1(c, sMin, sMax, clampStrength), lMin, lMax, clampStrength);
		topRGB = clampOnce(topRGB);
		bottomRGB = clampOnce(bottomRGB);
	}
	const ctx = p.drawingContext;
	const extraTop = Math.max(0, T.overflow.extraTopPx || 0);
	const extraBottom = Math.max(0, T.overflow.extraBottomPx || 0);
	const expand = Math.max(0, T.antialias.expandPx || 0);
	const L0 = -w / 2 - expand / 2;
	const W0 = w + expand;
	const Ttop0 = -h - extraTop;
	const H0 = h + extraTop + extraBottom;
	const env = applyShapeMods({
		p,
		x: cx,
		y: bottomY,
		r: Math.min(w, h),
		opts: {
			alpha: baseAlpha * alphaMulGlobal,
			timeMs: lifecycle.timeMs,
			liveAvg: u,
			rootAppearK: lifecycle.rootAppearK
		},
		mods: { appear: { ease: T.appear.easing === "linear" ? "linear" : "cubic" } }
	});
	const drawAlpha = typeof env.alpha === "number" ? env.alpha : baseAlpha * alphaMulGlobal;
	const aFactor = Math.max(0, Math.min(255, Math.round(drawAlpha))) / 255;
	const appearAlphaK = baseAlpha * alphaMulGlobal > 0 ? clamp01(drawAlpha / (baseAlpha * alphaMulGlobal)) : 1;
	const depthMaskFactor = clamp01(requestedMaskAlpha * appearAlphaK / 255);
	const depthMaskRGB = shapeColorForRenderPass(renderPass, topRGB, maskColor);
	const isMobileBowl = cell <= T.bowl.mobile.cellMax;
	const bowlThicknessK = isMobileBowl ? T.bowl.mobile.thicknessK : T.bowl.thicknessK;
	const bowlBaseFrac = isMobileBowl ? T.bowl.mobile.baseFrac : T.bowl.baseFrac;
	const bowlPostTopFrac = isMobileBowl ? T.bowl.mobile.postTopFrac : T.bowl.postTopFrac;
	const bowlColWidthK = isMobileBowl ? T.bowl.mobile.colWidthK : T.bowl.colWidthK;
	const bowlCornerK = isMobileBowl ? T.bowl.mobile.cornerK : T.bowl.cornerK;
	const bowlThicknessPx = Math.max(1, Math.round(cell * bowlThicknessK));
	const bowlColW = Math.max(1, Math.round(bowlThicknessPx * bowlColWidthK));
	const bowlBaseH = Math.max(bowlThicknessPx, Math.round(H0 * bowlBaseFrac));
	const bowlBaseY = bottomY + Ttop0 + H0 - bowlBaseH;
	const bowlBaseX = cx + L0;
	const bowlBaseW = W0;
	const bowlPostsTopY = bottomY + Ttop0 + Math.round(H0 * bowlPostTopFrac);
	p.push();
	p.translate(env.x, env.y);
	p.scale(env.scaleX, env.scaleY);
	p.translate(-cx, -bottomY);
	const wantClip = isSprite ? true : !T.overflow.allow;
	if (wantClip) {
		ctx.save();
		ctx.beginPath();
		ctx.rect(x0, y0, w, h);
		ctx.clip();
	}
	p.push();
	p.translate(cx, bottomY);
	p.scale(1, waterScaleY);
	const waterSideInset = T.bowl.enable ? Math.max(1, bowlColW) : 0;
	const waterX = L0 + waterSideInset;
	const waterW = Math.max(1, W0 - waterSideInset * 2);
	const rTop = Math.min(3, Math.max(.5, Math.round(cell * .03)));
	{
		const x = waterX;
		const y = Ttop0;
		const ww = waterW;
		const hh = H0;
		ctx.save();
		ctx.beginPath();
		roundedRectPath(ctx, x, y, ww, hh, rTop);
		ctx.clip();
		const OVER = 4;
		const gy0 = y - OVER;
		const gy1 = y + hh + OVER;
		if (isDepthMaskPass) ctx.fillStyle = rgbaCss(depthMaskRGB, depthMaskFactor);
		else {
			const g = ctx.createLinearGradient(0, gy0, 0, gy1);
			g.addColorStop(0, rgbaCss(topRGB, aFactor));
			g.addColorStop(1, rgbaCss(bottomRGB, aFactor));
			ctx.fillStyle = g;
		}
		ctx.fillRect(x - 2, gy0, ww + 4, gy1 - gy0);
		ctx.restore();
	}
	if (T.foam.enable && shouldDrawColorDetails) {
		const bandH = Math.max(1, T.foam.band.heightPx);
		const bandOff = Math.max(0, T.foam.band.offsetTopPx);
		const foamHz = resolveRangeValue(T.foam.band.oscHzRange, u);
		const yOsc = Math.sin(tSec * foamHz * 2 * Math.PI) * (T.foam.band.oscAmpPx || 0);
		const rect = {
			x: waterX,
			y: Ttop0 - bandOff + yOsc,
			w: waterW,
			h: bandH
		};
		const speedLo = Array.isArray(T.foam.motion.speedPxSec) ? T.foam.motion.speedPxSec[0] : 10;
		const speedHi = Array.isArray(T.foam.motion.speedPxSec) ? T.foam.motion.speedPxSec[1] : speedLo;
		const sizeLo = (Array.isArray(T.foam.pool.sizePx) ? T.foam.pool.sizePx[0] : 1) * pxK * particleSizeK;
		const sizeHi = Math.max(sizeLo, (Array.isArray(T.foam.pool.sizePx) ? T.foam.pool.sizePx[1] : sizeLo) * pxK * particleSizeK);
		const lifeLo = Array.isArray(T.foam.pool.lifetimeSec) ? T.foam.pool.lifetimeSec[0] : 1;
		const lifeHi = Array.isArray(T.foam.pool.lifetimeSec) ? T.foam.pool.lifetimeSec[1] : 1.6;
		const base = T.foam.color.base;
		const colorFn = (pr) => {
			const aFoam = Math.round(base.a * aFactor);
			if (!T.foam.color.varyBySize || sizeHi === sizeLo) return {
				...base,
				a: aFoam
			};
			const k = clamp01((pr.size - sizeLo) / Math.max(1e-6, sizeHi - sizeLo));
			const d = 5;
			return {
				r: base.r - d * (1 - k),
				g: base.g - d * (1 - k),
				b: base.b - d * (1 - k),
				a: aFoam
			};
		};
		const dtSec = typeof lifecycle.dtSec === "number" && lifecycle.dtSec > 0 ? lifecycle.dtSec : p.deltaTime ? Math.max(1 / 120, p.deltaTime / 1e3) : 1 / 60;
		stepAndDrawPuffs(p, {
			store: particles.particleStore,
			key: `seafoam:${String(f.r0)}:${String(f.c0)}:${String(spanTilesX)}x${String(f.h)}${isSprite ? ":spr" : ""}`,
			rect,
			dir: T.foam.motion.dir,
			spreadAngle: T.foam.motion.spreadAngle,
			spawnMode: "stratified",
			respawnStratified: true,
			spawn: {
				x0: 0,
				x1: 1,
				y0: 0,
				y1: 1
			},
			speed: {
				min: speedLo,
				max: speedHi
			},
			accel: {
				x: 0,
				y: 0
			},
			gravity: T.foam.motion.gravity,
			jitter: {
				pos: T.foam.motion.jitterPos,
				velAngle: T.foam.motion.jitterAngle
			},
			drag: Math.max(0, T.foam.motion.drag || 0),
			count: T.foam.pool.count,
			size: {
				min: sizeLo,
				max: sizeHi
			},
			sizeHz: T.foam.pool.sizeHz,
			lifetime: {
				min: lifeLo,
				max: lifeHi
			},
			fadeInFrac: T.foam.pool.fadeInFrac,
			fadeOutFrac: T.foam.pool.fadeOutFrac,
			edgeFadePx: T.foam.edgeFadePx,
			color: colorFn,
			depthAlpha: particleDepthA,
			respawn: true
		}, dtSec);
	}
	p.pop();
	if (T.capRect.enable) {
		if (wantClip) ctx.restore();
		const surfaceY = bottomY + Ttop0 * waterScaleY;
		const rectW = T.capRect.widthTiles * (cellW ?? 0);
		const rectH = T.capRect.heightTiles * (cellH ?? 0);
		const radius = Math.min(T.capRect.cornerPx, rectH / 2);
		const followOffset = T.capRect.followOffsetPx;
		const sm = T.capRect.scaleMap;
		const uClamped = Math.max(0, Math.min(1, (u - sm.uMin) / Math.max(1e-6, sm.uMax - sm.uMin)));
		const sx = lerpNumber(sm.xMin, sm.xMax, uClamped);
		const sy = lerpNumber(sm.yMin, sm.yMax, uClamped);
		ctx.save();
		ctx.translate(cx, surfaceY + followOffset);
		ctx.scale(sx, sy);
		const left = -rectW / 2;
		const top = -rectH;
		const rectAlpha = isDepthMaskPass ? depthMaskFactor : aFactor * T.capRect.alphaMul;
		if (isDepthMaskPass) ctx.fillStyle = rgbaCss(depthMaskRGB, rectAlpha);
		else {
			const baseTop = T.capRect.color.top;
			const baseBot = T.capRect.color.bottom;
			const satOsc = T.capRect.satOsc;
			const topCol = oscillateSaturation(baseTop, tSec, {
				amp: satOsc.amp,
				speed: satOsc.speed,
				phase: satOsc.phase
			});
			const botCol = oscillateSaturation(baseBot, tSec, {
				amp: satOsc.amp,
				speed: satOsc.speed,
				phase: satOsc.phase + Math.PI / 4
			});
			const grad = ctx.createLinearGradient(0, top, 0, 0);
			grad.addColorStop(0, rgbaCss(topCol, rectAlpha));
			grad.addColorStop(1, rgbaCss(botCol, rectAlpha));
			ctx.fillStyle = grad;
		}
		ctx.beginPath();
		roundedRectPath(ctx, left, top, rectW, rectH, radius);
		ctx.fill();
		ctx.restore();
		if (wantClip) {
			ctx.save();
			ctx.beginPath();
			ctx.rect(x0, y0, w, h);
			ctx.clip();
		}
	}
	if (T.bowl.enable) {
		const baseH = bowlBaseH;
		const baseY = bowlBaseY;
		const baseX = bowlBaseX;
		const baseW = bowlBaseW;
		const postsTopY = bowlPostsTopY;
		const colW = bowlColW;
		const postR = Math.max(0, (T.bowl.pieceRadiusPx ?? 0) | 0);
		const postBottomY = baseY + Math.max(0, T.bowl.baseOverlapPx ?? 2);
		const postDrawH = Math.max(1, postBottomY - postsTopY - Math.max(0, T.bowl.postBottomLiftPx ?? Math.ceil(postR)));
		const leftX = cx + L0;
		const rightX = cx + L0 + W0 - colW;
		const gb = T.bowl.grassBlend;
		const blendK = clamp01(resolveRangeValue(gb.colorBlend, u));
		const [satLo, satHi] = gb.satRange;
		const [briLo, briHi] = gb.brightRange;
		let bowlRGB = grassPal;
		if (style.gradientRGB) bowlRGB = blendRGB(bowlRGB, style.gradientRGB, blendK);
		bowlRGB = clampSaturation$1(bowlRGB, satLo, satHi, 1);
		bowlRGB = clampBrightness(bowlRGB, briLo, briHi, 1);
		ctx.fillStyle = rgbaCss(shapeColorForRenderPass(renderPass, bowlRGB, maskColor), (isDepthMaskPass ? Math.round(255 * depthMaskFactor) : Math.round(255 * clamp01(T.bowl.alphaMul) * appearAlphaK)) / 255);
		const rCorner = Math.round(cell * bowlCornerK);
		{
			const r = Math.min(rCorner, baseH / 2, baseW / 2);
			ctx.beginPath();
			ctx.moveTo(baseX, baseY);
			ctx.lineTo(baseX + baseW, baseY);
			ctx.lineTo(baseX + baseW, baseY + baseH - r);
			ctx.quadraticCurveTo(baseX + baseW, baseY + baseH, baseX + baseW - r, baseY + baseH);
			ctx.lineTo(baseX + r, baseY + baseH);
			ctx.quadraticCurveTo(baseX, baseY + baseH, baseX, baseY + baseH - r);
			ctx.lineTo(baseX, baseY);
			ctx.closePath();
			ctx.fill();
		}
		ctx.beginPath();
		roundedRectPath(ctx, leftX, postsTopY, colW, postDrawH, postR);
		roundedRectPath(ctx, rightX, postsTopY, colW, postDrawH, postR);
		ctx.fill();
	}
	if (shouldDrawColorDetails && T.topBorder.enable && T.topBorder.topLinePx > 0) {
		const aLine = Math.round(drawAlpha * clamp01(T.topBorder.topLineAlpha));
		const kMix = clamp01(T.topBorder.topLineMix);
		const lineRGB = {
			r: Math.round(topRGB.r + (bottomRGB.r - topRGB.r) * kMix),
			g: Math.round(topRGB.g + (bottomRGB.g - topRGB.g) * kMix),
			b: Math.round(topRGB.b + (bottomRGB.b - topRGB.b) * kMix)
		};
		p.push();
		p.noFill();
		p.stroke(lineRGB.r, lineRGB.g, lineRGB.b, aLine);
		p.strokeWeight(T.topBorder.topLinePx);
		p.line(cx + L0, bottomY + Ttop0, cx + L0 + W0, bottomY + Ttop0);
		p.pop();
	}
	if (T.spill.enable && shouldDrawColorDetails) {
		if (wantClip) ctx.restore();
		const gGate = T.spill.liveGate;
		const spillK = liveWindowK(u, gGate.min, gGate.max, gGate.soft);
		if (spillK > .01) {
			const dtSec = typeof lifecycle.dtSec === "number" && lifecycle.dtSec > 0 ? lifecycle.dtSec : p.deltaTime ? Math.max(1 / 120, p.deltaTime / 1e3) : 1 / 60;
			const spillRaw = Math.max(0, T.spill.spillPx);
			const spill = isSprite ? Math.min(spillRaw, Math.round(cell * .1)) : spillRaw;
			const isMobile = cell <= T.spill.mobile.cellMax;
			const waterTopY = bottomY + Ttop0 * waterScaleY;
			const waterBottomY = bottomY + (Ttop0 + H0) * waterScaleY;
			const bottomBound = y0 + h;
			const visibleBottomBound = isSprite ? bottomBound : bottomBound + Math.max(spill, cell * .45);
			const surfaceY = waterTopY;
			const spawnHeightPx = isSprite ? Math.max(5, cell * .16) : Math.max(8, cell * .35);
			const bandTopY = isSprite ? surfaceY - spawnHeightPx : surfaceY - cell * .18;
			const bandH = Math.max(1, bottomBound - bandTopY + cell * .25);
			const spawnFracY = Math.min(1, spawnHeightPx / Math.max(1, bandH));
			const leftSpawnFracX = T.spill.leftSpawnFracX;
			const rightSpawnFracX = T.spill.rightSpawnFracX;
			const colWBase = Math.max(8, cell * .35);
			const leftNudge = isSprite ? 0 : T.spill.leftNudgePx + (isMobile ? T.spill.mobile.leftNudgePx : 0);
			const rightNudge = isSprite ? 0 : T.spill.rightNudgePx + (isMobile ? T.spill.mobile.rightNudgePx : 0);
			const extraRoom = isMobile ? Math.round(cell * .25) : T.spill.leftExtraRoomPx;
			const leftCorridorW = colWBase + extraRoom;
			const rightCorridorW = colWBase + (isSprite ? extraRoom : spill);
			const spriteEdgeOverlap = isSprite ? Math.max(4, Math.round(colWBase * .4)) : 0;
			const waterLeftEdgeX = cx + waterX;
			const waterRightEdgeX = cx + waterX + waterW;
			const leftBaseX = isSprite ? x0 - leftCorridorW + spriteEdgeOverlap : waterLeftEdgeX - leftCorridorW * leftSpawnFracX[1] + leftNudge;
			const rightBaseX = isSprite ? x0 + w - spriteEdgeOverlap : waterRightEdgeX - rightCorridorW * rightSpawnFracX[0] + rightNudge;
			const leftCorridor = {
				x: leftBaseX,
				y: bandTopY,
				w: leftCorridorW,
				h: bandH
			};
			const rightCorridor = {
				x: rightBaseX,
				y: bandTopY,
				w: rightCorridorW,
				h: bandH
			};
			const leftSpawnFrac = isSprite ? {
				x0: .52,
				x1: .94,
				y0: 0,
				y1: spawnFracY
			} : {
				x0: leftSpawnFracX[0],
				x1: leftSpawnFracX[1],
				y0: 0,
				y1: spawnFracY
			};
			const rightSpawnFrac = isSprite ? {
				x0: .06,
				x1: .48,
				y0: 0,
				y1: spawnFracY
			} : {
				x0: rightSpawnFracX[0],
				x1: rightSpawnFracX[1],
				y0: 0,
				y1: spawnFracY
			};
			const rMin = (Array.isArray(T.spill.sizePx) ? T.spill.sizePx[0] : T.spill.sizePx) * pxK * particleSizeK;
			const rMax = Math.max(rMin, (Array.isArray(T.spill.sizePx) ? T.spill.sizePx[1] : rMin) * pxK * particleSizeK);
			const gatedCount = Math.max(0, Math.floor(T.spill.count * spillK));
			const alphaMul = spillK;
			const lifeMin = T.spill.lifetimeSec[0];
			const lifeMax = T.spill.lifetimeSec[1];
			const leftLifeMin = T.spill.leftLifetimeSec[0];
			const leftLifeMax = T.spill.leftLifetimeSec[1];
			const keySuffix = isSprite ? ":spr" : "";
			const runSide = (side) => {
				const isLeft = side === "L";
				const rectSim = isLeft ? leftCorridor : rightCorridor;
				const spawnFr = isLeft ? leftSpawnFrac : rightSpawnFrac;
				const dir = isLeft ? "left" : "right";
				const spRange = isLeft ? T.spill.leftSpeedPxSec : T.spill.rightSpeedPxSec;
				const accelX = T.spill.coneAccelX * (isLeft ? -1 : 1);
				if (gatedCount < 1) return;
				stepAndDrawPuffs(p, {
					store: particles.particleStore,
					key: `spill:${String(f.r0)}:${String(f.c0)}:${String(spanTilesX)}x${String(f.h)}:${side}${keySuffix}`,
					rect: rectSim,
					dir,
					spreadAngle: T.spill.spreadAngle,
					spawnMode: "stratified",
					respawnStratified: true,
					spawn: spawnFr,
					speed: {
						min: spRange[0],
						max: spRange[1]
					},
					accel: {
						x: accelX,
						y: 0
					},
					gravity: T.spill.gravity,
					jitter: {
						pos: 2,
						velAngle: .25
					},
					drag: T.spill.drag,
					count: gatedCount,
					size: {
						min: rMin,
						max: rMax
					},
					sizeHz: 5,
					lifetime: isLeft ? {
						min: leftLifeMin,
						max: leftLifeMax
					} : {
						min: lifeMin,
						max: lifeMax
					},
					fadeInFrac: T.spill.fadeInFrac,
					fadeOutFrac: T.spill.fadeOutFrac,
					edgeFadePx: isLeft ? {
						left: T.spill.leftEdgeFadeLeftPx,
						right: 8,
						top: 4,
						bottom: 8
					} : T.spill.edgeFadePx,
					color: (pr) => {
						if (pr.y > visibleBottomBound) return {
							r: 0,
							g: 0,
							b: 0,
							a: 0
						};
						const c = seaRGBAtY(pr.y, waterTopY, waterBottomY, topRGB, bottomRGB);
						return {
							r: c.r,
							g: c.g,
							b: c.b,
							a: Math.round(175 * aFactor * alphaMul)
						};
					},
					depthAlpha: particleDepthA,
					respawn: true
				}, dtSec);
			};
			runSide("L");
			runSide("R");
		}
		if (wantClip) {
			ctx.save();
			ctx.beginPath();
			ctx.rect(x0, y0, w, h);
			ctx.clip();
		}
	}
	if (wantClip) ctx.restore();
	p.pop();
}
//#endregion
//#region src/canvas-engine/shapes/sun.ts
var SUN = {
	colorBlend: [.3, 0],
	oscAmp: [.12, .06],
	oscSpeed: [.4, .02],
	rayCount: [6, 10],
	rayLenK: [.8, .52],
	rayThickK: [.06, .04],
	coreDiamK: [.6, .45],
	rayAnchorDiamK: [.46, .28]
};
var SUN_BASE_PALETTE = {
	default: {
		r: 255,
		g: 196,
		b: 60
	},
	ray: {
		r: 255,
		g: 140,
		b: 40
	}
};
var SUN_DARK_PALETTE = {
	default: {
		r: 140,
		g: 124,
		b: 46
	},
	ray: {
		r: 140,
		g: 88,
		b: 31
	}
};
var SUN_WARM_PALETTE = {
	default: {
		r: 255,
		g: 188,
		b: 44
	},
	ray: {
		r: 248,
		g: 118,
		b: 26
	}
};
var SUN_COOL_PALETTE = {
	default: {
		r: 255,
		g: 222,
		b: 128
	},
	ray: {
		r: 248,
		g: 180,
		b: 80
	}
};
var MOON_DARK_PALETTE = { default: {
	r: 195,
	g: 208,
	b: 228
} };
function drawCrescentMoon(p, x, y, r, opts, t, ex, ct) {
	const style = shapeStyle(opts);
	const lifecycle = shapeLifecycle(opts);
	const sprite = shapeSprite(opts);
	const u = clamp01(style.liveAvg ?? .5);
	let moonTint = MOON_DARK_PALETTE.default;
	if (style.gradientRGB) moonTint = blendRGB(moonTint, style.gradientRGB, .08);
	moonTint = applySrgbExposureContrast(moonTint, ex, ct);
	const pulsed = oscillateSaturation(moonTint, t, {
		amp: resolveRangeValue([.12, .04], u),
		speed: resolveRangeValue([.4, .06], u),
		phase: 0
	});
	const coreBase = r * resolveRangeValue(SUN.coreDiamK, u) * (sprite.coreScaleMult ?? 5);
	const desiredAbsOsc = r * resolveRangeValue([.05, .01], u);
	const m = applyShapeMods({
		p,
		x,
		y,
		r: coreBase,
		opts: {
			alpha: finiteNumber(style.alpha, 235),
			timeMs: lifecycle.timeMs,
			liveAvg: style.liveAvg,
			rootAppearK: lifecycle.rootAppearK
		},
		mods: {
			appear: {
				anchor: "center",
				ease: "back",
				backOvershoot: 1.6
			},
			sizeOsc: {
				mode: "absolute",
				biasAbs: coreBase,
				ampAbs: desiredAbsOsc,
				speed: resolveRangeValue([8, .18], u),
				anchor: "center"
			},
			opacityOsc: {
				amp: resolveRangeValue([12, 5], u),
				speed: resolveRangeValue([.38, .1], u)
			},
			rotation: { speed: 0 }
		}
	});
	const R = m.r / 2;
	const d = R * .7;
	const ix = d / 2;
	const iy = Math.sqrt(Math.max(0, R * R - ix * ix));
	const moonTop = Math.atan2(-iy, ix);
	const moonBot = Math.atan2(iy, ix);
	const shadBot = Math.atan2(iy, ix - d);
	const shadTop = Math.atan2(-iy, ix - d);
	const alpha = typeof m.alpha === "number" ? m.alpha : 235;
	const ctx = p.drawingContext;
	p.push();
	p.translate(m.x, m.y);
	p.scale(m.scaleX, m.scaleY);
	ctx.save();
	ctx.rotate(-Math.PI / 5);
	ctx.beginPath();
	ctx.arc(0, 0, R, moonTop, moonBot, true);
	ctx.arc(d, 0, R, shadBot, shadTop, false);
	ctx.closePath();
	ctx.fillStyle = rgbaCss(pulsed, alpha / 255);
	ctx.fill();
	ctx.restore();
	p.pop();
}
function drawSun(p, xIn, yIn, rIn, opts = {}) {
	const projection = shapeProjection(opts);
	const style = shapeStyle(opts);
	const lifecycle = shapeLifecycle(opts);
	const sprite = shapeSprite(opts);
	const darkMode = style.darkMode === true;
	const pal = style.palette ?? (darkMode ? SUN_DARK_PALETTE : opts.paletteTheme === "warm" ? SUN_WARM_PALETTE : opts.paletteTheme === "cool" ? SUN_COOL_PALETTE : SUN_BASE_PALETTE);
	const u = clamp01(style.liveAvg ?? .5);
	const t = (typeof lifecycle.timeMs === "number" ? lifecycle.timeMs : p.millis()) / 1e3;
	const ex = finiteNumber(style.exposure, 1);
	const ct = finiteNumber(style.contrast, 1);
	let x = xIn, y = yIn, r = rIn;
	if (projection.pixelFootprint && projection.footprint) {
		const fp = footprintToPx(projection.footprint, projection);
		x = fp.x + fp.w / 2;
		y = fp.y + fp.h / 2;
		r = Math.min(fp.w, fp.h) * .22;
	} else if (sprite.fitToFootprint && projection.cell && projection.footprint) {
		const { c0, w } = projection.footprint;
		const cellW = projection.cellW ?? projection.cell;
		const { y: fpY, h: fpH } = footprintToPx(projection.footprint, projection);
		const cx = c0 * cellW + w * cellW / 2;
		const cy = fpY + fpH / 2;
		const diam = Math.min(w * cellW, fpH);
		x = cx;
		y = cy;
		r = diam;
	}
	if (darkMode) {
		drawCrescentMoon(p, x, y, r, opts, t, ex, ct);
		return;
	}
	const sunBlendDefault = resolveRangeValue(SUN.colorBlend, u);
	const sunBlend = typeof opts.sunBlend === "number" ? clamp01(opts.sunBlend) : sunBlendDefault;
	const oscAmp = typeof opts.oscAmp === "number" ? opts.oscAmp : resolveRangeValue(SUN.oscAmp, u);
	const oscSpeed = typeof opts.oscSpeed === "number" ? opts.oscSpeed : resolveRangeValue(SUN.oscSpeed, u);
	const oscPhase = opts.oscPhase ?? 0;
	let baseTint = pal.default;
	if (typeof opts.sunCss === "string" && opts.sunCss.trim().length > 0) {
		const c = p.color(opts.sunCss);
		baseTint = {
			r: p.red(c),
			g: p.green(c),
			b: p.blue(c)
		};
	} else if (opts.sunGradientRGB) baseTint = blendRGB(pal.default, opts.sunGradientRGB, sunBlend);
	else if (style.gradientRGB) baseTint = blendRGB(pal.default, style.gradientRGB, sunBlend);
	let pulsedCore = oscillateSaturation(baseTint, t, {
		amp: oscAmp,
		speed: oscSpeed,
		phase: oscPhase
	});
	pulsedCore = applySrgbExposureContrast(pulsedCore, ex, ct);
	let rayTintBase = style.gradientRGB ? blendRGB(pal.ray, style.gradientRGB, sunBlend) : pal.ray;
	rayTintBase = applySrgbExposureContrast(rayTintBase, ex, ct);
	const pulsedRay = oscillateSaturation(rayTintBase, t, {
		amp: oscAmp,
		speed: oscSpeed,
		phase: oscPhase
	});
	const rayCount = Math.max(6, Math.floor(opts.rayCount ?? resolveRangeValue(SUN.rayCount, u)));
	const coreBase = r * resolveRangeValue(SUN.coreDiamK, u) * (sprite.coreScaleMult ?? 5);
	const rayLenBaseRaw = r * resolveRangeValue(SUN.rayLenK, u);
	const rayLenBase = Math.max(0, (typeof opts.rayLen === "number" ? opts.rayLen : rayLenBaseRaw) * (opts.rayLenMult ?? 1));
	const rayThickBaseRaw = Math.round(r * resolveRangeValue(SUN.rayThickK, u));
	const rayThickness = Math.max(1, typeof opts.rayThickness === "number" ? opts.rayThickness : rayThickBaseRaw * (opts.rayThicknessMult ?? 1));
	const desiredAbsOsc = r * resolveRangeValue([.1, .02], u);
	const m = applyShapeMods({
		p,
		x,
		y,
		r: coreBase,
		opts: {
			alpha: finiteNumber(style.alpha, 235),
			timeMs: lifecycle.timeMs,
			liveAvg: style.liveAvg,
			rootAppearK: lifecycle.rootAppearK
		},
		mods: {
			appear: {
				anchor: "center",
				ease: "back",
				backOvershoot: 1.6
			},
			sizeOsc: {
				mode: "absolute",
				biasAbs: coreBase,
				ampAbs: desiredAbsOsc,
				speed: resolveRangeValue([10.5, .18], u),
				anchor: "center"
			},
			opacityOsc: {
				amp: resolveRangeValue([20, 40], u),
				speed: resolveRangeValue([.12, .25], u)
			},
			rotation: { speed: resolveRangeValue([.4, .1], u) }
		}
	});
	const ctx = p.drawingContext;
	p.push();
	p.translate(m.x, m.y);
	p.scale(m.scaleX, m.scaleY);
	const coreRadiusNow = m.r * .5;
	const rayGapPx = typeof opts.rayGapPx === "number" && Number.isFinite(opts.rayGapPx) ? opts.rayGapPx : Math.max(8, Math.round(rayThickness * 1.6));
	const a = (typeof m.alpha === "number" ? m.alpha : 235) / 255;
	p.noFill();
	p.strokeWeight(rayThickness);
	for (let i = 0; i < rayCount; i++) {
		const theta = i / rayCount * Math.PI * 2 + m.rotation;
		const len = i % 2 === 0 ? rayLenBase * .7 : rayLenBase * 1.2;
		const startR = coreRadiusNow + rayGapPx;
		const endR = startR + len;
		const x1 = Math.cos(theta) * startR;
		const y1 = Math.sin(theta) * startR;
		const x2 = Math.cos(theta) * endR;
		const y2 = Math.sin(theta) * endR;
		const grad = ctx.createLinearGradient(x1, y1, x2, y2);
		grad.addColorStop(0, rgbaCss(pulsedCore, a));
		grad.addColorStop(1, rgbaCss(pulsedRay, a));
		ctx.strokeStyle = grad;
		ctx.beginPath();
		ctx.moveTo(x1, y1);
		ctx.lineTo(x2, y2);
		ctx.stroke();
	}
	p.noStroke();
	p.fill(pulsedCore.r, pulsedCore.g, pulsedCore.b, typeof m.alpha === "number" ? m.alpha : 235);
	p.circle(0, 0, m.r);
	p.pop();
}
//#endregion
//#region src/canvas-engine/shapes/carFactory.ts
var CF = {
	blendK: [.3, .02],
	grass: {
		colorBlend: [.18, .14],
		satRange: [0, .14]
	},
	grassHk: 1 / 3,
	grassTopRadiusK: .06,
	slabHeightK: 1.15,
	factoryWFrac: .75,
	gapPx: 4,
	framePadK: .18,
	windowPadK: .1,
	frameRadiusPx: 6,
	windowRadiusPx: 4,
	windowStrokePx: [.4, .9],
	carSidePadK: .06,
	carScaleBoost: .72,
	chimWFrac: .22,
	chimTopNarrowK: .82,
	chimRadiusPx: 3,
	chimHeightFrac: .62,
	bodyScaleXRange: [1, 1.33],
	chimScaleYRange: [1, 0],
	roofHk: .12,
	roofOverhangK: .06,
	roofRadiusPx: 6,
	smoke: {
		count: [62, 0],
		sizeMin: [4.5, 0],
		sizeMax: [12, 1],
		lifeMin: [5, 2],
		lifeMax: [10, 4],
		alpha: [235, 0],
		dir: "up",
		spreadAngle: [.9, .22],
		speedMin: [12, 10],
		speedMax: [28, 18],
		gravity: [-12, -6],
		drag: [.6, .7],
		jitterPos: [.8, .25],
		jitterAngle: [.4, .06],
		fadeInFrac: .1,
		fadeOutFrac: 3,
		edgeFadePx: {
			left: 6,
			right: 0,
			top: 4,
			bottom: 12
		},
		sizeHz: 4,
		base: {
			r: 120,
			g: 130,
			b: 140
		},
		blendK: [.3, .06],
		brightnessRange: [.6, .4],
		colWk: .16,
		colHk: 2.6
	},
	panels: {
		count: 5,
		widthFracBase: .19,
		heightFracOfRoof: .8,
		sideMarginFrac: .06,
		gapFracOfPW: .2,
		cornerFrac: .12,
		tiltDeg: 30
	},
	chimCap: {
		overhangPx: 3,
		thicknessPx: 12,
		radiusPx: 2,
		shadeK: .88,
		lipPx: 1,
		lipAlpha: 200
	},
	carVariantList: [
		"suv",
		"sedan",
		"jeep"
	],
	carVariantCycleMs: 3e3,
	carVariantFadeMs: 300
};
var CAR_FACTORY_BASE_PALETTE = {
	grass: {
		r: 120,
		g: 180,
		b: 110
	},
	building: {
		r: 208,
		g: 210,
		b: 214
	},
	frame: {
		r: 180,
		g: 182,
		b: 188
	},
	window: {
		r: 220,
		g: 226,
		b: 236
	},
	chimney: {
		r: 172,
		g: 174,
		b: 180
	},
	roof: {
		r: 160,
		g: 162,
		b: 168
	},
	solarPanel: {
		r: 180,
		g: 205,
		b: 235
	}
};
var CAR_FACTORY_DARK_PALETTE = {
	grass: {
		r: 80,
		g: 100,
		b: 126
	},
	building: {
		r: 114,
		g: 133,
		b: 164
	},
	frame: {
		r: 99,
		g: 115,
		b: 144
	},
	window: {
		r: 120,
		g: 143,
		b: 181
	},
	chimney: {
		r: 94,
		g: 110,
		b: 138
	},
	roof: {
		r: 88,
		g: 102,
		b: 129
	},
	solarPanel: {
		r: 99,
		g: 129,
		b: 180
	}
};
function clampLerped(range, u) {
	const lo = Math.min(range[0], range[1]);
	const hi = Math.max(range[0], range[1]);
	const v = resolveRangeValue(range, u);
	return Math.max(lo, Math.min(hi, v));
}
function drawCarFactory(p, _x, _y, _r, opts = {}) {
	const projection = shapeProjection(opts);
	const style = shapeStyle(opts);
	const lifecycle = shapeLifecycle(opts);
	const identity = shapeIdentity(opts);
	const sprite = shapeSprite(opts);
	const particles = shapeParticles(opts);
	const pass = shapePass(opts);
	const darkMode = style.darkMode === true;
	const pal = style.palette ?? (darkMode ? CAR_FACTORY_DARK_PALETTE : CAR_FACTORY_BASE_PALETTE);
	const cell = projection.cell, f = projection.footprint;
	if (!cell || !f) return;
	const seedKey = identity.seedKey ?? identity.seed ?? `carFactory|${String(f.r0)}:${String(f.c0)}|${String(f.w)}x${String(f.h)}`;
	const isSprite = !!sprite.fitToFootprint || !!sprite.spriteMode;
	const u = clamp01(style.liveAvg ?? .5);
	const a = finiteNumber(style.alpha, 235);
	const ex = finiteNumber(style.exposure, 1);
	const ct = finiteNumber(style.contrast, 1);
	const tMs = typeof lifecycle.timeMs === "number" ? lifecycle.timeMs : p.millis();
	const renderPass = pass.renderPass ?? "color";
	const maskColor = pass.maskColor;
	const requestedMaskAlpha = typeof pass.maskAlpha === "number" && Number.isFinite(pass.maskAlpha) ? pass.maskAlpha : a;
	const isDepthMaskPass = renderPass === "depthMask";
	const shouldDrawMass = shouldDrawInRenderPass(renderPass, true);
	const shouldDrawColorDetails = shouldDrawInRenderPass(renderPass, false);
	const rowBucket = particleRowBucket(f, projection);
	const particleScale = particleSizePerspectiveScale(f, projection) * particleDepthSizeScale(rowBucket);
	const motionScale = particleMotionPerspectiveScale(f, projection);
	const { x: x0, y: y0, w: W, h: H } = footprintToPx(f, projection);
	const localTileW = W / Math.max(1, f.w);
	const localTileH = H / Math.max(1, f.h);
	const localTile = Math.max(1, Math.min(localTileW, localTileH));
	const detailUnit = localTile;
	const anchorX = x0 + W / 2;
	const anchorY = y0 + H;
	const env = applyShapeMods({
		p,
		x: anchorX,
		y: anchorY,
		r: Math.min(W, H),
		opts: {
			alpha: a,
			timeMs: tMs,
			liveAvg: u,
			rootAppearK: lifecycle.rootAppearK
		}
	});
	const alpha = typeof env.alpha === "number" ? env.alpha : a;
	const appearAlphaK = a > 0 ? clamp01(alpha / a) : 1;
	const maskAlpha = isDepthMaskPass ? Math.round(requestedMaskAlpha * appearAlphaK) : alpha;
	const massAlpha = isDepthMaskPass ? maskAlpha : alpha;
	const kBlendGeneral = resolveRangeValue(CF.blendK, u);
	const tintGeneral = (base) => {
		return applySrgbExposureContrast(style.gradientRGB ? blendRGB(base, style.gradientRGB, kBlendGeneral) : base, ex, ct);
	};
	let grass = pal.grass;
	if (style.gradientRGB) grass = blendRGB(grass, style.gradientRGB, resolveRangeValue(CF.grass.colorBlend, u));
	grass = clampSaturation$1(grass, CF.grass.satRange[0], CF.grass.satRange[1], 1);
	if (darkMode) grass = clampBrightness(grass, .36, .54);
	grass = applySrgbExposureContrast(grass, ex, ct);
	const wall = tintGeneral(pal.building);
	const frameRGB = tintGeneral(pal.frame);
	const glassBase = tintGeneral(pal.window);
	const chimneyRGB = tintGeneral(pal.chimney);
	const roofRGB = tintGeneral(pal.roof);
	const glass = clampBrightness(blendRGB(glassBase, {
		r: 120,
		g: 170,
		b: 220
	}, .42), .8, 1.1);
	const backdrop = applySrgbExposureContrast({
		r: Math.round(pal.building.r * .88),
		g: Math.round(pal.building.g * .88),
		b: Math.round(pal.building.b * .88)
	}, ex, ct);
	const grassH = Math.max(4, Math.round(cell * CF.grassHk));
	const grassY = y0 + H - grassH;
	const rGrassTop = Math.round(cell * CF.grassTopRadiusK);
	const usableH = H - grassH;
	const floorY = y0 + usableH;
	const slabH = Math.min(usableH, Math.round(cell * CF.slabHeightK));
	const slabY = floorY - slabH;
	const gap = Math.max(1, Math.round(Math.min(CF.gapPx, detailUnit * .18)));
	const factoryW = Math.max(8, Math.round(W * CF.factoryWFrac));
	const chimW = Math.max(Math.round(detailUnit * .28), Math.round(W * CF.chimWFrac));
	const leftStart = x0 + (W - (factoryW + gap + chimW)) / 2;
	const sideLeft = (f.c0 + f.r0) % 2 === 0;
	const bodyX = sideLeft ? leftStart : leftStart + chimW + gap;
	const chimInset = detailUnit * .05;
	const chimX = sideLeft ? bodyX + factoryW + gap - chimInset : leftStart + chimInset;
	const framePadPx = Math.round(Math.max(2, Math.min(12, detailUnit * CF.framePadK)));
	const windowPadPx = Math.round(Math.max(1, Math.min(10, detailUnit * CF.windowPadK)));
	const frameX = bodyX + framePadPx;
	const frameY = slabY + framePadPx;
	const frameW = Math.max(4, factoryW - framePadPx * 2);
	const frameH = Math.max(4, slabH - framePadPx * 2);
	const winX = frameX + windowPadPx;
	const winY = frameY + windowPadPx;
	const winW = Math.max(4, frameW - windowPadPx * 2);
	const winH = Math.max(4, frameH - windowPadPx * 2);
	const winStroke = Math.max(CF.windowStrokePx[0], Math.min(CF.windowStrokePx[1], detailUnit * .025));
	const bodyScaleX = clampLerped(CF.bodyScaleXRange, u);
	const chimScaleY = clampLerped(CF.chimScaleYRange, u);
	const bodyAnchorX = sideLeft ? bodyX : bodyX + factoryW;
	const roofH = Math.max(2, Math.round(detailUnit * CF.roofHk));
	const roofOver = Math.round(factoryW * CF.roofOverhangK);
	const roofRx = bodyX - roofOver;
	const roofRw = factoryW + 2 * roofOver;
	const roofRy = slabY - roofH;
	const baseW = chimW;
	const topW = Math.round(baseW * CF.chimTopNarrowK);
	const topY0 = slabY - slabH * CF.chimHeightFrac;
	const bottomCenterX = chimX + baseW / 2;
	const bottomY = grassY;
	const topRightX = chimX + (baseW + topW) / 2;
	const topLeftX = chimX + (baseW - topW) / 2;
	const chimneyTopY = topY0 * chimScaleY + bottomY * (1 - chimScaleY);
	p.push();
	p.translate(env.x, env.y);
	p.scale(env.scaleX, env.scaleY);
	p.translate(-anchorX, -anchorY);
	if (shouldDrawMass) {
		const grassFill = shapeColorForRenderPass(renderPass, grass, maskColor);
		p.noStroke();
		p.fill(grassFill.r, grassFill.g, grassFill.b, massAlpha);
		p.rect(x0, grassY, W, grassH, rGrassTop, rGrassTop, 0, 0);
	}
	if (shouldDrawColorDetails) {
		let colW = Math.max(3, Math.round(detailUnit * CF.smoke.colWk));
		let colH = Math.max(Math.round(detailUnit * 1.1), Math.round(detailUnit * 2 * CF.smoke.colHk));
		if (isSprite) {
			colW = Math.round(colW * 1.35);
			colH = Math.round(colH * 1.25);
		}
		const smokeX = (topLeftX + topRightX) / 2 - colW / 2;
		const smokeY = chimneyTopY - Math.round(detailUnit * (isSprite ? 1.35 : 1.45));
		const count = Math.max(4, Math.floor(resolveRangeValue(CF.smoke.count, u)));
		let sizeMin = resolveRangeValue(CF.smoke.sizeMin, u) * particleScale;
		let sizeMax = Math.max(sizeMin, resolveRangeValue(CF.smoke.sizeMax, u) * particleScale);
		let lifeMin = Math.max(.05, resolveRangeValue(CF.smoke.lifeMin, u) * motionScale);
		let lifeMax = Math.max(lifeMin, resolveRangeValue(CF.smoke.lifeMax, u) * motionScale);
		let sAlpha = Math.max(90, Math.min(255, Math.round(resolveRangeValue(CF.smoke.alpha, u))));
		let speedMin = resolveRangeValue(CF.smoke.speedMin, u) * motionScale;
		let speedMax = Math.max(speedMin, resolveRangeValue(CF.smoke.speedMax, u) * motionScale);
		let gravity = resolveRangeValue(CF.smoke.gravity, u) * motionScale;
		const drag = resolveRangeValue(CF.smoke.drag, u);
		let jPos = resolveRangeValue(CF.smoke.jitterPos, u) * particleScale;
		const jAng = resolveRangeValue(CF.smoke.jitterAngle, u);
		const spread = resolveRangeValue(CF.smoke.spreadAngle, u);
		const blendK = resolveRangeValue(CF.smoke.blendK, u);
		if (isSprite) {
			const sizeBoost = 1.35;
			const speedBoost = 1.15;
			const lifeBoost = 1.25;
			sizeMin *= sizeBoost;
			sizeMax *= sizeBoost;
			speedMin *= speedBoost;
			speedMax *= speedBoost;
			lifeMin *= lifeBoost;
			lifeMax *= lifeBoost;
			gravity *= 1.1;
			jPos *= .85;
			sAlpha = Math.min(255, Math.round(sAlpha * 1.05));
		}
		const smoked = applySrgbExposureContrast(clampBrightness(style.gradientRGB ? blendRGB(CF.smoke.base, style.gradientRGB, blendK) : CF.smoke.base, CF.smoke.brightnessRange[0], CF.smoke.brightnessRange[1]), ex, ct);
		const dt = typeof lifecycle.dtSec === "number" && lifecycle.dtSec > 0 ? lifecycle.dtSec : p.deltaTime ? Math.max(1 / 120, p.deltaTime / 1e3) : 1 / 60;
		stepAndDrawPuffs(p, {
			store: particles.particleStore,
			key: `factory-smoke:${String(seedKey)}${isSprite ? ":spr" : ""}`,
			rect: {
				x: smokeX,
				y: smokeY,
				w: colW,
				h: colH
			},
			dir: "up",
			spreadAngle: spread,
			speed: {
				min: speedMin,
				max: speedMax
			},
			gravity,
			drag,
			accel: {
				x: 0,
				y: 0
			},
			spawn: {
				x0: .2,
				x1: .8,
				y0: .1,
				y1: .25
			},
			jitter: {
				pos: jPos,
				velAngle: jAng
			},
			count,
			size: {
				min: sizeMin,
				max: sizeMax
			},
			sizeHz: CF.smoke.sizeHz,
			lifetime: {
				min: lifeMin,
				max: lifeMax
			},
			fadeInFrac: CF.smoke.fadeInFrac,
			fadeOutFrac: CF.smoke.fadeOutFrac,
			edgeFadePx: isSprite ? {
				left: 4,
				right: 4,
				top: 0,
				bottom: 10
			} : {
				...CF.smoke.edgeFadePx,
				top: 0
			},
			color: {
				r: smoked.r,
				g: smoked.g,
				b: smoked.b,
				a: sAlpha
			},
			depthAlpha: particleDepthAlpha(rowBucket),
			respawn: true
		}, dt);
	}
	if (shouldDrawMass) {
		p.noStroke();
		const chimneyFill = shapeColorForRenderPass(renderPass, chimneyRGB, maskColor);
		p.fill(chimneyFill.r, chimneyFill.g, chimneyFill.b, isDepthMaskPass ? maskAlpha : 255);
		p.push();
		p.translate(bottomCenterX, bottomY);
		p.scale(1, chimScaleY);
		p.translate(-bottomCenterX, -bottomY);
		p.beginShape();
		p.vertex(chimX, grassY);
		p.vertex(chimX + chimW, grassY);
		p.vertex(topRightX, topY0);
		p.vertex(topLeftX, topY0);
		p.endShape(p.CLOSE);
		const capOver = Math.max(1, Math.round(Math.min(CF.chimCap.overhangPx, detailUnit * .16)));
		const capTh = Math.max(1, Math.round(Math.min(CF.chimCap.thicknessPx, detailUnit * .34)));
		const capRad = Math.max(0, Math.round(Math.min(CF.chimCap.radiusPx, detailUnit * .12)));
		const capX = topLeftX - capOver;
		const capW = topRightX - topLeftX + capOver * 2;
		const capY = topY0 - capTh;
		const capRGB = {
			r: Math.round(chimneyRGB.r * CF.chimCap.shadeK),
			g: Math.round(chimneyRGB.g * CF.chimCap.shadeK),
			b: Math.round(chimneyRGB.b * CF.chimCap.shadeK)
		};
		const capFill = shapeColorForRenderPass(renderPass, capRGB, maskColor);
		p.fill(capFill.r, capFill.g, capFill.b, isDepthMaskPass ? maskAlpha : 255);
		p.rect(capX, capY, capW, capTh, capRad, capRad, capRad, capRad);
		if (CF.chimCap.lipPx > 0 && shouldDrawColorDetails) {
			const lipH = Math.max(1, Math.round(Math.min(CF.chimCap.lipPx, detailUnit * .08)));
			const lipRGB = {
				r: Math.min(255, capRGB.r + 18),
				g: Math.min(255, capRGB.g + 18),
				b: Math.min(255, capRGB.b + 18)
			};
			p.fill(lipRGB.r, lipRGB.g, lipRGB.b, CF.chimCap.lipAlpha | 0);
			p.rect(capX, capY - lipH, capW, lipH, capRad, capRad, capRad, capRad);
		}
		p.pop();
	}
	p.push();
	if (shouldDrawMass) {
		p.translate(bodyAnchorX, 0);
		p.scale(bodyScaleX, 1);
		p.translate(-bodyAnchorX, 0);
		const wallFill = shapeColorForRenderPass(renderPass, wall, maskColor);
		p.noStroke();
		p.fill(wallFill.r, wallFill.g, wallFill.b, massAlpha);
		p.rect(bodyX, slabY, factoryW, slabH, Math.round(detailUnit * .08));
		const roofFill = shapeColorForRenderPass(renderPass, roofRGB, maskColor);
		p.noStroke();
		p.fill(roofFill.r, roofFill.g, roofFill.b, massAlpha);
		p.rect(roofRx, roofRy, roofRw, roofH, CF.roofRadiusPx, CF.roofRadiusPx, 0, 0);
		if (shouldDrawColorDetails) {
			p.noStroke();
			p.fill(backdrop.r, backdrop.g, backdrop.b, alpha);
			p.rect(frameX, frameY, frameW, frameH, CF.frameRadiusPx);
		}
		if (shouldDrawColorDetails) {
			const cx = winX + winW / 2;
			const bottomPad = Math.max(2, Math.round(winH * .1));
			const wheelBaselineY = winY + winH - bottomPad;
			const sidePad = Math.max(2, Math.round(winW * CF.carSidePadK));
			const rBase = winW / 3.2;
			const designW = rBase * 3.2;
			const fitS = CF.carScaleBoost * fitScaleToRectWidth(designW, winW, sidePad, { allowUpscale: true });
			const cancelSX = 1 / bodyScaleX;
			const configuredList = opts.carVariantList;
			const list = configuredList && configuredList.length > 0 ? configuredList : CF.carVariantList;
			const cycleMs = Math.max(1, opts.carVariantCycleMs ?? CF.carVariantCycleMs);
			const fadeMs = Math.max(1, opts.carVariantFadeMs ?? CF.carVariantFadeMs);
			const cycleOffsetMs = Math.floor(seeded01(seedKey, "car-cycle-offset") * cycleMs * list.length);
			const carSeedBase = `${String(seedKey)}|factory-car`;
			const t = tMs + cycleOffsetMs;
			const tick = Math.floor(t / cycleMs);
			const phaseMs = t % cycleMs;
			const curIdx = (tick % list.length + list.length) % list.length;
			const nxtIdx = (curIdx + 1) % list.length;
			const curVar = list[curIdx];
			const nxtVar = list[nxtIdx];
			const drawVariant = (variant, scaleK, alphaK, variantSeedKey) => {
				const env2 = applyShapeMods({
					p,
					x: cx,
					y: wheelBaselineY,
					r: rBase,
					opts: {
						alpha: Math.round(alpha * alphaK),
						timeMs: tMs,
						liveAvg: u
					},
					mods: { scale: {
						value: scaleK,
						anchor: "bottom-center"
					} }
				});
				p.push();
				p.translate(cx, wheelBaselineY);
				p.scale(cancelSX, 1);
				p.translate(env2.x - cx, env2.y - wheelBaselineY);
				p.scale(env2.scaleX, env2.scaleY);
				p.translate(-cx, -wheelBaselineY);
				beginFitScale(p, {
					cx,
					anchorY: wheelBaselineY,
					scale: fitS
				});
				drawCarAsset(p, cx, wheelBaselineY, rBase, {
					style: {
						alpha: env2.alpha,
						exposure: ex,
						contrast: ct,
						darkMode,
						gradientRGB: style.gradientRGB,
						liveAvg: u
					},
					identity: { seedKey: variantSeedKey },
					useAppear: false,
					variant
				});
				endFitScale(p);
				p.pop();
			};
			if (phaseMs < cycleMs - fadeMs) drawVariant(curVar, 1, 1, `${carSeedBase}|var:${curVar}:t${String(tick)}`);
			else {
				const k = smoothstep01((phaseMs - (cycleMs - fadeMs)) / fadeMs);
				const outScale = 1 - k;
				const inScale = k;
				const outAlpha = 1 - k;
				const inAlpha = k;
				drawVariant(curVar, Math.max(0, outScale), Math.max(0, outAlpha), `${carSeedBase}|out:${curVar}:t${String(tick)}`);
				drawVariant(nxtVar, Math.max(0, inScale), Math.max(0, inAlpha), `${carSeedBase}|in:${nxtVar}:t${String(tick)}`);
			}
		}
		if (shouldDrawColorDetails) {
			const ctx2 = p.drawingContext;
			ctx2.save();
			ctx2.beginPath();
			roundedRectPath(ctx2, frameX, frameY, frameW, frameH, CF.frameRadiusPx);
			roundedRectPath(ctx2, winX, winY, winW, winH, CF.windowRadiusPx);
			ctx2.fillStyle = rgbaCss(frameRGB, alpha / 255);
			ctx2.fill("evenodd");
			ctx2.restore();
		}
		if (shouldDrawColorDetails) {
			const strokeRGB = {
				r: Math.round(wall.r * .82),
				g: Math.round(wall.g * .86),
				b: Math.round(wall.b * .95)
			};
			p.stroke(strokeRGB.r, strokeRGB.g, strokeRGB.b, alpha);
			p.strokeWeight(winStroke);
			p.fill(glass.r, glass.g, glass.b, Math.round(alpha * .36));
			p.rect(winX, winY, winW, winH, CF.windowRadiusPx);
		}
	}
	p.pop();
	{
		const sPanels = clamp01(u);
		if (sPanels > .001) {
			const panelTint0 = applySrgbExposureContrast(pal.solarPanel, ex, ct);
			const count = CF.panels.count;
			const minPanelW = Math.max(1, Math.round(Math.min(8, localTile * .25)));
			const minPanelH = Math.max(1, Math.round(Math.min(6, localTile * .18)));
			const minPanelBaseW = Math.max(minPanelW, Math.round(Math.min(10, localTile * .31)));
			const minMarginSide = Math.max(1, Math.round(Math.min(4, localTile * .13)));
			const marginSide = Math.max(minMarginSide, Math.round(roofRw * CF.panels.sideMarginFrac));
			const usableW = Math.max(minPanelW, roofRw - 2 * marginSide);
			const basePW = Math.max(minPanelBaseW, Math.round(roofRw * CF.panels.widthFracBase));
			const pH = Math.min(Math.max(minPanelH, Math.round(roofH * CF.panels.heightFracOfRoof)), Math.max(minPanelH, Math.round(localTile * .16)));
			const gapFrac = CF.panels.gapFracOfPW;
			const pWFit = usableW / (count + (count - 1) * gapFrac);
			const pW = Math.max(1, Math.round(Math.min(basePW, pWFit)));
			const gap = Math.round(pW * gapFrac);
			const yOnRoof = roofRy;
			const startX = roofRx + (roofRw - (count * pW + (count - 1) * gap)) / 2;
			const corner = Math.round(Math.min(pW, pH) * CF.panels.cornerFrac);
			const tilt = (sideLeft ? -1 : 1) * (CF.panels.tiltDeg * Math.PI / 180);
			p.push();
			p.noStroke();
			p.rectMode(p.CORNER);
			for (let i = 0; i < count; i++) {
				const px = startX + i * (pW + gap) + pW / 2;
				const py = yOnRoof;
				p.push();
				p.translate(px, py);
				p.scale(sPanels, sPanels);
				p.rotate(tilt);
				const panelFill = shapeColorForRenderPass(renderPass, panelTint0, maskColor);
				p.fill(panelFill.r, panelFill.g, panelFill.b, massAlpha);
				p.rect(-pW / 2, -pH, pW, pH, corner);
				if (shouldDrawColorDetails) {
					const hi = {
						r: Math.min(255, panelTint0.r + 22),
						g: Math.min(255, panelTint0.g + 22),
						b: Math.min(255, panelTint0.b + 22)
					};
					p.fill(hi.r, hi.g, hi.b, Math.round(alpha * .35));
					p.rect(-pW * .53, -pH * .88, pW * .7, pH * .1, corner);
				}
				p.pop();
			}
			p.pop();
		}
	}
	p.pop();
}
//#endregion
//#region src/canvas-engine/shapes/bus.ts
var BUS = {
	grass: { colorBlend: [.16, .3] },
	body: { colorBlend: [.06, .03] },
	asphalt: {
		min: [.25, .32],
		max: [.52, .65]
	}
};
var BUS_BASE_PALETTE = {
	grass: [
		{
			r: 110,
			g: 160,
			b: 90
		},
		{
			r: 130,
			g: 180,
			b: 110
		},
		{
			r: 100,
			g: 150,
			b: 85
		}
	],
	asphalt: {
		r: 125,
		g: 125,
		b: 125
	},
	body: [
		{
			r: 220,
			g: 136,
			b: 86
		},
		{
			r: 232,
			g: 160,
			b: 102
		},
		{
			r: 204,
			g: 118,
			b: 86
		},
		{
			r: 224,
			g: 196,
			b: 118
		},
		{
			r: 92,
			g: 158,
			b: 154
		},
		{
			r: 132,
			g: 158,
			b: 204
		},
		{
			r: 180,
			g: 92,
			b: 96
		},
		{
			r: 198,
			g: 138,
			b: 154
		},
		{
			r: 162,
			g: 182,
			b: 114
		},
		{
			r: 154,
			g: 138,
			b: 204
		},
		{
			r: 118,
			g: 172,
			b: 184
		}
	],
	window: {
		r: 150,
		g: 184,
		b: 214
	},
	wheel: {
		r: 40,
		g: 40,
		b: 40
	}
};
var BUS_DARK_PALETTE = {
	grass: [
		{
			r: 52,
			g: 96,
			b: 104
		},
		{
			r: 58,
			g: 108,
			b: 114
		},
		{
			r: 48,
			g: 90,
			b: 102
		}
	],
	grassByLight: {
		far: [
			{
				r: 76,
				g: 90,
				b: 92
			},
			{
				r: 80,
				g: 96,
				b: 94
			},
			{
				r: 70,
				g: 86,
				b: 92
			}
		],
		mid: [
			{
				r: 68,
				g: 96,
				b: 94
			},
			{
				r: 72,
				g: 102,
				b: 96
			},
			{
				r: 64,
				g: 90,
				b: 92
			}
		],
		near: [
			{
				r: 52,
				g: 96,
				b: 104
			},
			{
				r: 58,
				g: 108,
				b: 114
			},
			{
				r: 48,
				g: 90,
				b: 102
			}
		]
	},
	asphalt: {
		r: 68,
		g: 79,
		b: 96
	},
	body: [
		{
			"r": 188,
			"g": 98,
			"b": 68
		},
		{
			"r": 170,
			"g": 92,
			"b": 66
		},
		{
			"r": 188,
			"g": 124,
			"b": 88
		},
		{
			"r": 64,
			"g": 128,
			"b": 140
		},
		{
			"r": 76,
			"g": 94,
			"b": 152
		},
		{
			"r": 132,
			"g": 132,
			"b": 78
		},
		{
			"r": 158,
			"g": 74,
			"b": 102
		},
		{
			"r": 159,
			"g": 87,
			"b": 128
		},
		{
			"r": 115,
			"g": 153,
			"b": 81
		},
		{
			"r": 108,
			"g": 118,
			"b": 176
		},
		{
			"r": 78,
			"g": 138,
			"b": 150
		},
		{
			"r": 168,
			"g": 82,
			"b": 123
		},
		{
			"r": 92,
			"g": 112,
			"b": 164
		},
		{
			"r": 116,
			"g": 86,
			"b": 174
		},
		{
			"r": 79,
			"g": 147,
			"b": 151
		},
		{
			"r": 173,
			"g": 118,
			"b": 91
		},
		{
			"r": 99,
			"g": 120,
			"b": 161
		}
	],
	window: {
		r: 104,
		g: 118,
		b: 182
	},
	wheel: {
		r: 45,
		g: 48,
		b: 58
	}
};
/**
* Draws a bus that scales on small/mobile tiles.
* Variety is driven by identity seed data or tile footprint so texture caching will
* not collapse every bus into the same color.
*/
function drawBus(p, cx, cy, r, opts = {}) {
	const projection = shapeProjection(opts);
	const style = shapeStyle(opts);
	const lifecycle = shapeLifecycle(opts);
	const identity = shapeIdentity(opts);
	const sprite = shapeSprite(opts);
	const pass = shapePass(opts);
	const darkMode = style.darkMode === true;
	const pal = style.palette ?? (darkMode ? BUS_DARK_PALETTE : BUS_BASE_PALETTE);
	const ex = finiteNumber(style.exposure, 1);
	const ct = finiteNumber(style.contrast, 1);
	const alpha = finiteNumber(style.alpha, 235);
	const u = clamp01(style.liveAvg ?? .5);
	const renderPass = pass.renderPass ?? "color";
	const maskColor = pass.maskColor;
	const maskAlpha = typeof pass.maskAlpha === "number" && Number.isFinite(pass.maskAlpha) ? pass.maskAlpha : alpha;
	const shouldDrawMass = shouldDrawInRenderPass(renderPass, true);
	const shouldDrawColorDetails = shouldDrawInRenderPass(renderPass, false);
	const massAlpha = renderPass === "depthMask" ? maskAlpha : alpha;
	const cell = projection.cell;
	const f = projection.footprint;
	let tileX;
	let tileY;
	let tileW;
	let tileH;
	let tileCx;
	if (cell && f) {
		({x: tileX, y: tileY, w: tileW, h: tileH} = footprintToPx(f, projection));
		tileCx = tileX + tileW / 2;
	} else {
		tileW = r * 6.4;
		tileH = r * 3;
		tileX = cx - tileW / 2;
		tileY = cy - tileH / 2;
		tileCx = cx;
	}
	const seedKey = identity.seedKey ?? identity.seed ?? (cell && f ? `bus|${String(f.r0)}:${String(f.c0)}|${String(f.w)}x${String(f.h)}` : `bus|${String(Math.round(cx))}|${String(Math.round(cy))}|${String(Math.round(r))}`);
	const occurrenceIndex = finiteNumber(identity.shapeOccurrenceIndex, 0);
	const r1 = seeded01(seedKey, "a");
	const r2 = seeded01(seedKey, "b");
	const baseY = tileY + tileH;
	const m = applyShapeMods({
		p,
		x: tileCx,
		y: baseY,
		r,
		opts: {
			alpha,
			timeMs: lifecycle.timeMs,
			liveAvg: style.liveAvg,
			rootAppearK: lifecycle.rootAppearK
		}
	});
	p.push();
	p.translate(m.x, m.y);
	p.scale(m.scaleX, m.scaleY);
	p.translate(-tileCx, -baseY);
	const grassH = tileH * .5;
	const grassY = tileY + tileH - grassH;
	const aspH = grassH * .38;
	const aspY = grassY + (grassH - aspH) / 2;
	const grassLight = sampleDirectionalLightRect({
		x: tileX,
		y: grassY,
		w: tileW,
		h: grassH
	}, style.lightCtx ?? null);
	const grassPalette = darkMode ? pickLightBandValue(pal.grass, pal.grassByLight, grassLight.closenessK) : pal.grass;
	let grassTint = blendRGB(pick(grassPalette, r1), pick(grassPalette, r2), .4 + .3 * u);
	if (style.gradientRGB) grassTint = blendRGB(grassTint, style.gradientRGB, resolveRangeValue(BUS.grass.colorBlend, u));
	if (darkMode) {
		grassTint = clampSaturation$1(grassTint, 0, .22, 1);
		grassTint = clampBrightness(grassTint, .28, .42);
	}
	grassTint = applySrgbExposureContrast(grassTint, ex, ct);
	if (darkMode) {
		const grassLightK = grassLight.overallK * (.03 + .08 * grassLight.closenessK);
		grassTint = mixRgb(grassTint, grassLight.lightColor, grassLightK);
	}
	p.noStroke();
	if (shouldDrawMass) {
		fillRgb(p, shapeColorForRenderPass(renderPass, grassTint, maskColor), massAlpha);
		p.rect(tileX, grassY, tileW, grassH, r * .18);
	}
	if (shouldDrawColorDetails) {
		let aspColor = applySrgbExposureContrast(pal.asphalt, ex, ct);
		aspColor = clampBrightness(aspColor, resolveRangeValue(BUS.asphalt.min, u), resolveRangeValue(BUS.asphalt.max, u));
		fillRgb(p, aspColor, alpha);
		p.rect(tileX, aspY, tileW, aspH, r * .14);
	}
	const wheelY = aspY + aspH * .25;
	const designUnit = cell && f ? Math.max(1, Math.min(tileW / 6.4, tileH / 3)) : r;
	const designW = designUnit * 6.4;
	const sidePad = Math.max(2, tileW * .08);
	const s = fitScaleToRectWidth(designW, tileW, sidePad, { allowUpscale: sprite.allowUpscale === true });
	const bodyOffset = shapeHash32(`${String(seedKey)}|body-offset`) % pal.body.length;
	let bodyTint = pickByOccurrence(pal.body, occurrenceIndex, bodyOffset);
	if (style.gradientRGB) bodyTint = blendRGB(bodyTint, style.gradientRGB, resolveRangeValue(BUS.body.colorBlend, u));
	if (darkMode) bodyTint = clampBrightness(bodyTint, .36, .66);
	bodyTint = applySrgbExposureContrast(bodyTint, ex, ct);
	const winTint = applySrgbExposureContrast(pal.window, ex, ct);
	beginFitScale(p, {
		cx: tileCx,
		anchorY: wheelY,
		scale: s
	});
	{
		const w = designW;
		const bodyH = designUnit * 2;
		const busX = tileCx - w / 2;
		const bodyY = wheelY - bodyH * 1;
		const bodyLight = sampleDirectionalLightRect({
			x: busX,
			y: bodyY,
			w,
			h: bodyH
		}, style.lightCtx ?? null);
		const litBodyTint = mixRgb(bodyTint, bodyLight.lightColor, .26 * bodyLight.overallK);
		const busHighlight = mixRgb(litBodyTint, bodyLight.lightColor, .46);
		const busShadow = mixRgb(litBodyTint, bodyLight.shadowColor, .28);
		if (shouldDrawColorDetails) {
			const wheelD = Math.max(3, designUnit * .85);
			fillRgb(p, pal.wheel, 255);
			p.circle(busX + w * .22, wheelY, wheelD);
			p.circle(busX + w * .38, wheelY, wheelD);
			p.circle(busX + w * .78, wheelY, wheelD);
		}
		if (shouldDrawMass) {
			fillRgb(p, shapeColorForRenderPass(renderPass, litBodyTint, maskColor), renderPass === "depthMask" ? maskAlpha : 255);
			p.rect(busX, bodyY, w, bodyH, designUnit * .22);
		}
		if (shouldDrawColorDetails) {
			paintPixelLightBands(p, {
				x: busX,
				y: bodyY,
				w,
				h: bodyH
			}, bodyLight, {
				alpha: 255,
				highlightColor: busHighlight,
				shadowColor: busShadow,
				corner: Math.round(designUnit * .22),
				sideK: .4,
				topK: .24,
				shadowK: .16
			});
			fillRgb(p, winTint, 255);
			const smallCount = 4;
			const gap = w * .02;
			const frontW = Math.max(w * .2, designUnit * 2.4);
			const winH = bodyH * .42;
			const winY = bodyY + bodyH * .2;
			const usableForSmall = w - frontW - gap * (smallCount + 2);
			const smallW = Math.max(6, usableForSmall / smallCount);
			let wx = busX + gap;
			for (let i = 0; i < smallCount; i++) {
				p.rect(wx, winY, smallW, winH, designUnit * .08);
				wx += smallW + gap;
			}
			const frontX = busX + w - frontW;
			const frontY = winY - Math.max(0, designUnit * .02);
			p.rect(frontX, frontY, frontW, winH, designUnit * .1, designUnit * .3, 0, designUnit * .08);
		}
	}
	endFitScale(p);
	p.pop();
}
//#endregion
//#region src/canvas-engine/shapes/trees.ts
var TREES = {
	grass: {
		colorBlend: [.22, .3],
		satRange: [.06, .18]
	},
	asphalt: {
		min: [.25, .32],
		max: [.52, .65],
		xScaleRange: [1, 0]
	},
	wind: {
		rotAmp: [.01, .02],
		xShearAmp: [.02, .03],
		speedHz: [.25, .9],
		phaseSpread: Math.PI * 4
	},
	layout: {
		sidePadK: .08,
		maxOverflowTopK: .28,
		countRange: [2, 3],
		overlapK: .78
	},
	poplar: {
		baseWk: [.2, .28],
		baseHk: [.62, .92],
		trunkWk: [.07, .09],
		trunkHk: [.18, .26],
		radiusK: .22
	},
	conifer: {
		levelsRange: [1, 1],
		baseHalfWk: [.22, .36],
		levelHk: [.5, .7],
		trunkWk: [.07, .09],
		trunkHk: [.18, .26],
		levelShrink: .89,
		triHeightFracs2: [1, .62],
		triWidthFracs2: [1, .72],
		triHeightFracs3: [
			1,
			.62,
			.42
		],
		triWidthFracs3: [
			1,
			.72,
			.52
		],
		intraOverlapK: .35,
		levelOverlapK: .22,
		widthTaper: .95,
		overlapWidthBoost: 1.1
	},
	foliage: {
		colorBlend: [.26, .4],
		brightnessRange: [.54, .66],
		satOscAmp: [.08, .16],
		satOscSpeed: [.18, .35]
	},
	clusterScaleClamp: [.92, 1.08]
};
var TREES_BASE_PALETTE = {
	grass: [
		{
			r: 122,
			g: 172,
			b: 102
		},
		{
			r: 142,
			g: 192,
			b: 122
		},
		{
			r: 112,
			g: 162,
			b: 97
		}
	],
	asphalt: {
		r: 125,
		g: 125,
		b: 125
	},
	trunk: {
		r: 110,
		g: 85,
		b: 60
	},
	foliage: [
		{
			r: 80,
			g: 150,
			b: 90
		},
		{
			r: 60,
			g: 135,
			b: 80
		},
		{
			r: 95,
			g: 165,
			b: 105
		},
		{
			r: 70,
			g: 120,
			b: 80
		},
		{
			r: 110,
			g: 175,
			b: 100
		},
		{
			r: 125,
			g: 190,
			b: 115
		},
		{
			r: 140,
			g: 205,
			b: 125
		},
		{
			r: 160,
			g: 220,
			b: 130
		}
	]
};
var TREES_DARK_PALETTE = {
	grass: [
		{
			r: 52,
			g: 96,
			b: 104
		},
		{
			r: 58,
			g: 108,
			b: 114
		},
		{
			r: 48,
			g: 90,
			b: 102
		}
	],
	grassByLight: {
		far: [
			{
				r: 76,
				g: 90,
				b: 92
			},
			{
				r: 80,
				g: 96,
				b: 94
			},
			{
				r: 70,
				g: 86,
				b: 92
			}
		],
		mid: [
			{
				r: 68,
				g: 96,
				b: 94
			},
			{
				r: 72,
				g: 102,
				b: 96
			},
			{
				r: 64,
				g: 90,
				b: 92
			}
		],
		near: [
			{
				r: 52,
				g: 96,
				b: 104
			},
			{
				r: 58,
				g: 108,
				b: 114
			},
			{
				r: 48,
				g: 90,
				b: 102
			}
		]
	},
	asphalt: {
		r: 68,
		g: 79,
		b: 96
	},
	trunk: {
		r: 60,
		g: 54,
		b: 46
	},
	foliage: [
		{
			r: 48,
			g: 86,
			b: 82
		},
		{
			r: 42,
			g: 78,
			b: 74
		},
		{
			r: 56,
			g: 94,
			b: 84
		},
		{
			r: 45,
			g: 72,
			b: 68
		},
		{
			r: 60,
			g: 100,
			b: 88
		},
		{
			r: 66,
			g: 108,
			b: 94
		},
		{
			r: 72,
			g: 116,
			b: 100
		},
		{
			r: 78,
			g: 124,
			b: 106
		},
		{
			r: 50,
			g: 92,
			b: 112
		},
		{
			r: 58,
			g: 82,
			b: 112
		},
		{
			r: 72,
			g: 96,
			b: 78
		},
		{
			r: 86,
			g: 104,
			b: 82
		},
		{
			r: 62,
			g: 74,
			b: 102
		},
		{
			r: 44,
			g: 96,
			b: 96
		},
		{
			r: 70,
			g: 84,
			b: 74
		},
		{
			r: 82,
			g: 112,
			b: 92
		}
	],
	foliageByLight: {
		far: [
			{
				r: 110,
				g: 108,
				b: 84
			},
			{
				r: 115,
				g: 102,
				b: 88
			},
			{
				r: 102,
				g: 104,
				b: 92
			},
			{
				r: 100,
				g: 104,
				b: 94
			}
		],
		mid: [
			{
				r: 48,
				g: 126,
				b: 82
			},
			{
				r: 56,
				g: 124,
				b: 84
			},
			{
				r: 60,
				g: 120,
				b: 88
			},
			{
				r: 72,
				g: 126,
				b: 78
			},
			{
				r: 86,
				g: 124,
				b: 82
			},
			{
				r: 82,
				g: 122,
				b: 92
			}
		],
		near: [
			{
				r: 40,
				g: 102,
				b: 122
			},
			{
				r: 48,
				g: 102,
				b: 122
			},
			{
				r: 34,
				g: 106,
				b: 106
			},
			{
				r: 66,
				g: 108,
				b: 104
			},
			{
				r: 62,
				g: 106,
				b: 100
			},
			{
				r: 68,
				g: 104,
				b: 106
			}
		]
	}
};
var TREES_WARM_PALETTE = {
	grass: [
		{
			r: 148,
			g: 186,
			b: 98
		},
		{
			r: 162,
			g: 198,
			b: 108
		},
		{
			r: 138,
			g: 178,
			b: 92
		}
	],
	asphalt: {
		r: 142,
		g: 130,
		b: 112
	},
	trunk: {
		r: 132,
		g: 96,
		b: 58
	},
	foliage: [
		{
			r: 112,
			g: 164,
			b: 82
		},
		{
			r: 148,
			g: 188,
			b: 88
		},
		{
			r: 136,
			g: 180,
			b: 86
		},
		{
			r: 168,
			g: 198,
			b: 96
		},
		{
			r: 124,
			g: 172,
			b: 84
		},
		{
			r: 152,
			g: 194,
			b: 102
		},
		{
			r: 172,
			g: 210,
			b: 108
		},
		{
			r: 188,
			g: 218,
			b: 118
		}
	]
};
var TREES_COOL_PALETTE = {
	grass: [
		{
			r: 112,
			g: 168,
			b: 136
		},
		{
			r: 122,
			g: 178,
			b: 144
		},
		{
			r: 104,
			g: 158,
			b: 128
		}
	],
	asphalt: {
		r: 118,
		g: 128,
		b: 138
	},
	trunk: {
		r: 92,
		g: 84,
		b: 76
	},
	foliage: [
		{
			r: 72,
			g: 138,
			b: 108
		},
		{
			r: 58,
			g: 122,
			b: 98
		},
		{
			r: 84,
			g: 148,
			b: 116
		},
		{
			r: 66,
			g: 116,
			b: 104
		},
		{
			r: 96,
			g: 158,
			b: 122
		},
		{
			r: 108,
			g: 168,
			b: 132
		},
		{
			r: 122,
			g: 178,
			b: 142
		},
		{
			r: 138,
			g: 192,
			b: 152
		}
	]
};
var rFromKey = seeded01;
function foliageTint(grassTint, u, gradientRGB, ex, ct, rSeed, pal, liveBlend = 1, darkMode = false, lightBand = "mid", farSideK = 0) {
	let mixed = blendRGB(pick(darkMode && pal.foliageByLight?.[lightBand] ? pal.foliageByLight[lightBand] : pal.foliage, rSeed), grassTint, darkMode ? .08 + .08 * u : .14 + .1 * u);
	const gradientBlend = clamp01(resolveRangeValue(TREES.foliage.colorBlend, u) * liveBlend);
	if (gradientRGB && gradientBlend > 0) mixed = blendRGB(mixed, gradientRGB, gradientBlend);
	const satLiftK = clamp01(farSideK);
	mixed = clampSaturation$1(mixed, darkMode ? .05 + .12 * satLiftK : .08 + .16 * satLiftK, darkMode ? .34 + .06 * satLiftK : .56 + .08 * satLiftK, 1);
	mixed = clampBrightness(mixed, darkMode ? .44 : TREES.foliage.brightnessRange[0], darkMode ? .56 : TREES.foliage.brightnessRange[1]);
	return applySrgbExposureContrast(mixed, ex, ct);
}
function drawTrees(p, _cx, _cy, _r, opts = {}) {
	const projection = shapeProjection(opts);
	const style = shapeStyle(opts);
	const lifecycle = shapeLifecycle(opts);
	const identity = shapeIdentity(opts);
	const pass = shapePass(opts);
	const darkMode = style.darkMode === true;
	const pal = style.palette ?? (darkMode ? TREES_DARK_PALETTE : opts.paletteTheme === "warm" ? TREES_WARM_PALETTE : opts.paletteTheme === "cool" ? TREES_COOL_PALETTE : TREES_BASE_PALETTE);
	const cell = projection.cell;
	const f = projection.footprint;
	if (!cell || !f) return;
	const ex = finiteNumber(style.exposure, 1);
	const ct = finiteNumber(style.contrast, 1);
	const u = clamp01(style.liveAvg ?? .5);
	const liveBlend = clamp01(typeof style.blend === "number" ? style.blend : 1);
	const renderPass = pass.renderPass ?? "color";
	const maskColor = pass.maskColor;
	const requestedMaskAlpha = typeof pass.maskAlpha === "number" && Number.isFinite(pass.maskAlpha) ? pass.maskAlpha : 255;
	const isDepthMaskPass = renderPass === "depthMask";
	const shouldDrawMass = shouldDrawInRenderPass(renderPass, true);
	const shouldDrawColorDetails = shouldDrawInRenderPass(renderPass, false);
	const farSideSatK = clamp01(1 - particleRowBucket(f, projection).t);
	const alpha = 255;
	const seedKey = identity.seedKey ?? identity.seed ?? `trees|${String(f.r0)}|${String(f.c0)}|${String(f.w)}x${String(f.h)}`;
	const { x: x0, y: y0, w, h } = footprintToPx(f, projection);
	const anchorX = x0 + w / 2;
	const anchorY = y0 + h;
	const appear = applyShapeMods({
		p,
		x: anchorX,
		y: anchorY,
		r: Math.min(w, h),
		opts: {
			alpha,
			timeMs: lifecycle.timeMs,
			liveAvg: u,
			rootAppearK: lifecycle.rootAppearK
		}
	});
	const drawAlpha = typeof appear.alpha === "number" ? appear.alpha : alpha;
	const maskAlpha = isDepthMaskPass ? Math.round(requestedMaskAlpha * clamp01(drawAlpha / alpha)) : drawAlpha;
	const massAlpha = isDepthMaskPass ? maskAlpha : drawAlpha;
	const clampK0 = TREES.clusterScaleClamp[0];
	const clampK1 = TREES.clusterScaleClamp[1];
	const clampRand = .96 + rFromKey(seedKey, "clusterClamp") * .035;
	const sClamp = Math.max(clampK0, Math.min(clampK1, clampRand * (.96 + u * .08)));
	const grassH = h * .55;
	const grassY = y0 + h - grassH;
	const grassLight = sampleDirectionalLightRect({
		x: x0,
		y: grassY,
		w,
		h: grassH
	}, style.lightCtx ?? null);
	const grassPalette = darkMode ? pickLightBandValue(pal.grass, pal.grassByLight, grassLight.closenessK) : pal.grass;
	let grassTint = blendRGB(pick(grassPalette, rFromKey(seedKey, "grass1")), pick(grassPalette, rFromKey(seedKey, "grass2")), .4 + .3 * u);
	const grassGradientBlend = clamp01(resolveRangeValue(TREES.grass.colorBlend, u) * liveBlend);
	if (style.gradientRGB && grassGradientBlend > 0) grassTint = blendRGB(grassTint, style.gradientRGB, grassGradientBlend);
	if (darkMode) {
		grassTint = clampSaturation$1(grassTint, TREES.grass.satRange[0], TREES.grass.satRange[1], 1);
		grassTint = clampBrightness(grassTint, .38, .58);
	}
	grassTint = applySrgbExposureContrast(grassTint, ex, ct);
	if (darkMode) {
		const grassLightK = grassLight.overallK * (.04 + .1 * grassLight.closenessK);
		grassTint = mixRgb(grassTint, grassLight.lightColor, grassLightK);
	}
	if (shouldDrawMass) {
		p.noStroke();
		fillRgb(p, shapeColorForRenderPass(renderPass, grassTint, maskColor), massAlpha);
		p.rect(x0, grassY, w, grassH, Math.round(cell * .04));
	}
	let asp = applySrgbExposureContrast(pal.asphalt, ex, ct);
	asp = clampBrightness(asp, resolveRangeValue(TREES.asphalt.min, u), resolveRangeValue(TREES.asphalt.max, u));
	const aspH = grassH * .28;
	const baseAspY = grassY + (grassH - aspH) / 2;
	const roadYOffset = Math.max(1, grassH * .14);
	const aspY = Math.min(grassY + grassH - aspH, baseAspY + roadYOffset);
	if (shouldDrawColorDetails) {
		const sx = resolveRangeValue(TREES.asphalt.xScaleRange, u);
		p.push();
		p.translate(x0, aspY + aspH / 2);
		p.scale(sx, 1);
		p.translate(-x0, -(aspY + aspH / 2));
		fillRgb(p, asp, drawAlpha);
		p.rect(x0, aspY, w, aspH, Math.round(cell * .16));
		p.pop();
	}
	const groundY = baseAspY + aspH * .6;
	p.push();
	p.translate(appear.x, appear.y);
	p.scale(appear.scaleX, appear.scaleY);
	p.translate(-anchorX, -anchorY);
	const countR = rFromKey(seedKey, "count");
	const minC = TREES.layout.countRange[0];
	const maxC = TREES.layout.countRange[1];
	const count = Math.round(minC + (maxC - minC) * countR);
	const sidePad = w * TREES.layout.sidePadK;
	const step = Math.max(8, w - sidePad * 2) / Math.max(1, count) * TREES.layout.overlapK * (count === 3 ? 1.25 : 1);
	const trunkTint = applySrgbExposureContrast(pal.trunk, ex, ct);
	const timeSec = (typeof lifecycle.timeMs === "number" ? lifecycle.timeMs : p.millis()) / 1e3;
	const canopyTintForLight = (treeKey, rSeed, treeLight) => {
		const band = lightClosenessBand(treeLight.closenessK);
		return oscillateSaturation(foliageTint(grassTint, u, style.gradientRGB, ex, ct, rSeed, pal, liveBlend, darkMode, band, farSideSatK), timeSec, {
			amp: resolveRangeValue(TREES.foliage.satOscAmp, u),
			speed: resolveRangeValue(TREES.foliage.satOscSpeed, u),
			phase: rFromKey(treeKey, "satPhase") * Math.PI * 2
		});
	};
	for (let i = 0; i < count; i++) {
		const k = `${String(seedKey)}|tree:${String(i)}`;
		const rx = rFromKey(k, "rx");
		const typePick = rFromKey(k, "type");
		const posJitter = (rFromKey(k, "jitter") - .5) * step * .22;
		const trunkWidthScale = count % 2 === 1 && i === Math.floor(count / 2) ? .84 : 1;
		const baseX = x0 + sidePad + step * (i + .5) + posJitter;
		const baseY = groundY;
		const windSpeed = resolveRangeValue(TREES.wind.speedHz, rFromKey(k, "windSpd"));
		const rotAmp = resolveRangeValue(TREES.wind.rotAmp, u);
		const shearAmp = resolveRangeValue(TREES.wind.xShearAmp, u);
		const phase = rFromKey(k, "windPhase") * TREES.wind.phaseSpread;
		const maxOverflow = h * TREES.layout.maxOverflowTopK;
		const heightBoost = -(rFromKey(k, "heightOver") * maxOverflow);
		const scaleBias = .95 + rFromKey(k, "scaleBias") * .25;
		if (typePick < .5) {
			const fw = (TREES.poplar.baseWk[0] + (TREES.poplar.baseWk[1] - TREES.poplar.baseWk[0]) * rx) * w * .95 * sClamp;
			const fh = (TREES.poplar.baseHk[0] + (TREES.poplar.baseHk[1] - TREES.poplar.baseHk[0]) * rx) * h * scaleBias * sClamp;
			const tw = Math.max(1, Math.round(w * (TREES.poplar.trunkWk[0] + (TREES.poplar.trunkWk[1] - TREES.poplar.trunkWk[0]) * rx) * sClamp * trunkWidthScale));
			const th = Math.max(2, Math.round(h * (TREES.poplar.trunkHk[0] + (TREES.poplar.trunkHk[1] - TREES.poplar.trunkHk[0]) * rx) * sClamp));
			const treeLight = sampleDirectionalLightRect({
				x: baseX - fw / 2,
				y: baseY + heightBoost - th - fh,
				w: fw,
				h: fh + th
			}, style.lightCtx ?? null);
			let leavesTint = canopyTintForLight(k, rx, treeLight);
			leavesTint = mixRgb(leavesTint, treeLight.lightColor, .18 * treeLight.overallK);
			const poplarHighlight = mixRgb(leavesTint, treeLight.lightColor, .34);
			const poplarShadow = mixRgb(leavesTint, treeLight.shadowColor, .24);
			const trunkLit = mixRgb(trunkTint, treeLight.lightColor, .14 * treeLight.overallK);
			const m = applyShapeMods({
				p,
				x: baseX,
				y: baseY + heightBoost,
				r: fh,
				opts: {
					timeMs: lifecycle.timeMs,
					liveAvg: u
				},
				mods: {
					scale2D: {
						x: 1,
						y: 1,
						anchor: "bottom-center"
					},
					scale2DOsc: {
						mode: "relative",
						biasX: 1,
						ampX: shearAmp,
						biasY: 1,
						ampY: 0,
						speed: windSpeed,
						phaseX: phase,
						anchor: "bottom-center"
					},
					rotationOsc: {
						amp: rotAmp,
						speed: windSpeed,
						phase
					}
				}
			});
			p.push();
			p.translate(m.x, m.y);
			p.rotate(m.rotation);
			p.noStroke();
			fillRgb(p, shapeColorForRenderPass(renderPass, trunkLit, maskColor), isDepthMaskPass ? maskAlpha : 255);
			p.rect(-tw / 2, -th, tw, th, 2);
			const rad = Math.round(Math.min(fw, fh) * TREES.poplar.radiusK);
			fillRgb(p, shapeColorForRenderPass(renderPass, leavesTint, maskColor), isDepthMaskPass ? maskAlpha : 255);
			p.rect(-fw / 2, -th - fh, fw, fh, rad);
			if (shouldDrawColorDetails) paintPixelLightBands(p, {
				x: -fw / 2,
				y: -th - fh,
				w: fw,
				h: fh
			}, treeLight, {
				alpha: 255,
				highlightColor: poplarHighlight,
				shadowColor: poplarShadow,
				corner: rad,
				sideK: .4,
				topK: .24,
				shadowK: .18
			});
			p.pop();
		} else {
			const levels = Math.round(TREES.conifer.levelsRange[0] + (TREES.conifer.levelsRange[1] - TREES.conifer.levelsRange[0]) * rx);
			const baseHalfW = (TREES.conifer.baseHalfWk[0] + (TREES.conifer.baseHalfWk[1] - TREES.conifer.baseHalfWk[0]) * rx) * (w * .5) * TREES.conifer.overlapWidthBoost * sClamp;
			const levelH = (TREES.conifer.levelHk[0] + (TREES.conifer.levelHk[1] - TREES.conifer.levelHk[0]) * rFromKey(k, "levelH")) * cell * 1 * scaleBias * sClamp;
			const mRoot = applyShapeMods({
				p,
				x: baseX,
				y: baseY + heightBoost,
				r: levelH * levels,
				opts: {
					timeMs: lifecycle.timeMs,
					liveAvg: u
				},
				mods: {
					scale2D: {
						x: 1,
						y: 1,
						anchor: "bottom-center"
					},
					scale2DOsc: {
						mode: "relative",
						biasX: 1,
						ampX: shearAmp,
						biasY: 1,
						ampY: 0,
						speed: windSpeed,
						phaseX: phase,
						anchor: "bottom-center"
					},
					rotationOsc: {
						amp: rotAmp,
						speed: windSpeed,
						phase
					}
				}
			});
			const th = Math.max(2, Math.round(h * (TREES.conifer.trunkHk[0] + (TREES.conifer.trunkHk[1] - TREES.conifer.trunkHk[0]) * rx) * sClamp));
			const treeLight = sampleDirectionalLightRect({
				x: baseX - baseHalfW,
				y: baseY + heightBoost - levelH * levels - th,
				w: baseHalfW * 2,
				h: levelH * levels + th
			}, style.lightCtx ?? null);
			let leavesTint = canopyTintForLight(k, rx, treeLight);
			leavesTint = mixRgb(leavesTint, treeLight.lightColor, .16 * treeLight.overallK);
			const coniferHighlight = mixRgb(leavesTint, treeLight.lightColor, .32);
			const coniferShadow = mixRgb(leavesTint, treeLight.shadowColor, .22);
			const trunkLit = mixRgb(trunkTint, treeLight.lightColor, .12 * treeLight.overallK);
			p.push();
			p.translate(mRoot.x, mRoot.y);
			p.rotate(mRoot.rotation);
			const tw = Math.max(1, Math.round(w * (TREES.conifer.trunkWk[0] + (TREES.conifer.trunkWk[1] - TREES.conifer.trunkWk[0]) * rx) * sClamp * trunkWidthScale));
			p.noStroke();
			fillRgb(p, shapeColorForRenderPass(renderPass, trunkLit, maskColor), isDepthMaskPass ? maskAlpha : 255);
			p.rect(-tw / 2, -th, tw, th, 2);
			const shrink = TREES.conifer.levelShrink;
			const taper = TREES.conifer.widthTaper;
			const ovK = TREES.conifer.levelOverlapK;
			const intraK = TREES.conifer.intraOverlapK;
			const nT = rFromKey(k, "triCount") < .5 ? 2 : 3;
			const hFracs = nT === 2 ? TREES.conifer.triHeightFracs2 : TREES.conifer.triHeightFracs3;
			const wFracs = nT === 2 ? TREES.conifer.triWidthFracs2 : TREES.conifer.triWidthFracs3;
			for (let l = 0; l < levels; l++) {
				const tierHW = baseHalfW * Math.pow(shrink * taper, l);
				let baseY = -th - levelH * l + (l > 0 ? ovK * levelH : 0);
				let tipY = baseY - levelH * hFracs[0];
				fillRgb(p, shapeColorForRenderPass(renderPass, leavesTint, maskColor), isDepthMaskPass ? maskAlpha : 255);
				p.beginShape();
				p.vertex(-tierHW * wFracs[0], baseY);
				p.vertex(tierHW * wFracs[0], baseY);
				p.vertex(0, tipY);
				p.endShape(p.CLOSE);
				if (shouldDrawColorDetails) paintDirectionalTriangleBands(p, {
					leftX: -tierHW * wFracs[0],
					rightX: tierHW * wFracs[0],
					baseY,
					apexX: 0,
					apexY: tipY
				}, treeLight, {
					alpha: 255,
					highlightColor: coniferHighlight,
					shadowColor: coniferShadow
				});
				for (let t = 1; t < nT; t++) {
					baseY = tipY + intraK * levelH;
					const triH = levelH * hFracs[t];
					tipY = baseY - triH;
					const hwT = tierHW * wFracs[t];
					p.beginShape();
					p.vertex(-hwT, baseY);
					p.vertex(hwT, baseY);
					p.vertex(0, tipY);
					p.endShape(p.CLOSE);
					if (shouldDrawColorDetails) paintDirectionalTriangleBands(p, {
						leftX: -hwT,
						rightX: hwT,
						baseY,
						apexX: 0,
						apexY: tipY
					}, treeLight, {
						alpha: 255,
						highlightColor: coniferHighlight,
						shadowColor: coniferShadow
					});
				}
			}
			p.pop();
		}
	}
	p.pop();
}
//#endregion
//#region src/canvas-engine/shapes/index.ts
var SHAPE_RENDER_PASSES = {
	house: ["depthMask"],
	power: ["depthMask"],
	villa: ["depthMask"],
	carFactory: ["depthMask"],
	bus: ["depthMask"],
	car: ["depthMask"],
	trees: ["depthMask"],
	sea: ["depthMask"]
};
var ENVIRONMENT_LIGHT_SHAPE = { sun: [
	"lightShape",
	"#ffffff",
	"#3f5676"
] };
//#endregion
export { clamp01 as A, setSessionItem as B, createParticleStore as C, gradientColor as D, VIVID_COLOR_STOPS as E, applyThemeToDocument as F, getSessionItem as I, readStoredDarkMode as L, mixRgb as M, getCanvasMeta as N, applyExposureContrast as O, setCanvasMeta as P, readStoredMode as R, footprintToPx as S, rand01Keyed as T, shapeLifecycle as _, drawCarFactory as a, shapeStyle as b, drawCar as c, resolvePowerVisualKind as d, drawHouse as f, shapeIdentity as g, drawClouds as h, drawBus as i, finiteNumber as j, makeP as k, drawVilla as l, drawSnow as m, SHAPE_RENDER_PASSES as n, drawSun as o, houseHasChimney as p, drawTrees as r, drawSea as s, ENVIRONMENT_LIGHT_SHAPE as t, drawPower as u, shapePass as v, hashString32 as w, createSceneLightContext as x, shapeProjection as y, removeSessionItems as z };

//# sourceMappingURL=shapes-BYH03xOX.mjs.map