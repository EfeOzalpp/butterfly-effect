// src/canvas-engine/runtime/render/background.ts

import type { PLike } from "../p/makeP";
import { BACKGROUNDS, type BackgroundSpec, type RgbaStop, type RadialGradientSpec, type LinearGradientSpec } from "../../adjustable-rules/backgrounds";
import type { SceneLookupKey } from "../../adjustable-rules/sceneMode";
import { gradientColor, BRAND_STOPS_VIVID } from "../../modifiers/index";
import { stepAndDrawParticles } from "../../modifiers/particle-systems/particle-1";
import type { GridMetrics } from "../layout/gridCache";
import type { SceneLightContext } from "../../modifiers/lighting";
import { clamp01 } from "../../shared/math";
import { resolveHorizonRow } from "../../shared/horizon";

type RGB = { r: number; g: number; b: number };
type RGBA = RGB & { a: number };
type ResolvedSurfaceStop = {
  k: number;
  left: RGBA;
  right: RGBA;
  order: number;
};

function mix(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

function easeBlendTaper(t: number) {
  const x = clamp01(t);
  return x * x * x;
}

function mixRgb(base: RGB, tint: RGB, amount: number): RGB {
  const t = clamp01(amount);
  return {
    r: Math.round(mix(base.r, tint.r, t)),
    g: Math.round(mix(base.g, tint.g, t)),
    b: Math.round(mix(base.b, tint.b, t)),
  };
}

function mixRgba(a: RGBA, b: RGBA, t: number): RGBA {
  const k = clamp01(t);
  return {
    r: mix(a.r, b.r, k),
    g: mix(a.g, b.g, k),
    b: mix(a.b, b.b, k),
    a: mix(a.a, b.a, k),
  };
}

function cssRgba(color: RGBA) {
  const channel = (value: number) => Math.max(0, Math.min(255, Math.round(value)));
  return `rgba(${channel(color.r)}, ${channel(color.g)}, ${channel(color.b)}, ${clamp01(color.a)})`;
}

function parseCssColor(input: string): RGBA | null {
  const value = input.trim();

  if (value.startsWith("#")) {
    const hex = value.slice(1);
    if (hex.length === 3) {
      return {
        r: parseInt(hex[0] + hex[0], 16),
        g: parseInt(hex[1] + hex[1], 16),
        b: parseInt(hex[2] + hex[2], 16),
        a: 1,
      };
    }
    if (hex.length === 6) {
      return {
        r: parseInt(hex.slice(0, 2), 16),
        g: parseInt(hex.slice(2, 4), 16),
        b: parseInt(hex.slice(4, 6), 16),
        a: 1,
      };
    }
    return null;
  }

  const rgbaMatch = value.match(/^rgba?\(([^)]+)\)$/i);
  if (!rgbaMatch) return null;

  const parts = rgbaMatch[1].split(",").map((part) => part.trim());
  if (parts.length < 3) return null;

  return {
    r: Number(parts[0]),
    g: Number(parts[1]),
    b: Number(parts[2]),
    a: parts[3] == null ? 1 : Number(parts[3]),
  };
}

function resolveStopColor(
  rgba: string,
  liveBlend: number | readonly [number, number] | undefined,
  liveAvg: number
) {
  if (!liveBlend) return rgba;

  const parsed = parseCssColor(rgba);
  if (!parsed) return rgba;

  const blendAmount: number = typeof liveBlend === "number"
    ? liveBlend
    : mix(liveBlend[0], liveBlend[1], easeBlendTaper(liveAvg));
  const tint = gradientColor(BRAND_STOPS_VIVID, liveAvg).rgb;
  const mixed = mixRgb(parsed, tint, blendAmount);
  return `rgba(${mixed.r}, ${mixed.g}, ${mixed.b}, ${parsed.a})`;
}

function resolveStopK(stop: RgbaStop, t: number) {
  return stop.oscK
    ? clamp01(stop.k + stop.oscK.amp * Math.sin(2 * Math.PI * stop.oscK.hz * t))
    : stop.k;
}

function resolveStopRgba(
  rgba: string,
  liveBlend: number | readonly [number, number] | undefined,
  liveAvg: number
) {
  return parseCssColor(resolveStopColor(rgba, liveBlend, liveAvg));
}

function resolveSurfaceStops(
  spec: LinearGradientSpec,
  liveAvg: number,
  t: number
): ResolvedSurfaceStop[] | null {
  const stops: ResolvedSurfaceStop[] = [];

  for (let i = 0; i < spec.stops.length; i += 1) {
    const stop = spec.stops[i];
    const left = resolveStopRgba(stop.rgba, stop.liveBlend, liveAvg);
    const right = resolveStopRgba(stop.rightRgba ?? stop.rgba, stop.liveBlend, liveAvg);
    if (!left || !right) return null;

    stops.push({
      k: clamp01(resolveStopK(stop, t)),
      left,
      right,
      order: i,
    });
  }

  return stops.sort((a, b) => (a.k - b.k) || (a.order - b.order));
}

function sampleSurfaceStop(stops: readonly ResolvedSurfaceStop[], k: number) {
  const y = clamp01(k);
  if (stops.length === 0) return null;
  if (y <= stops[0].k) return { left: stops[0].left, right: stops[0].right };

  for (let i = 0; i < stops.length - 1; i += 1) {
    const a = stops[i];
    const b = stops[i + 1];
    if (y > b.k) continue;

    const span = b.k - a.k;
    const localK = span <= 0 ? 1 : (y - a.k) / span;
    return {
      left: mixRgba(a.left, b.left, localK),
      right: mixRgba(a.right, b.right, localK),
    };
  }

  const last = stops[stops.length - 1];
  return { left: last.left, right: last.right };
}

function drawLinearStopSurface(
  p: PLike,
  ctx: CanvasRenderingContext2D,
  spec: LinearGradientSpec,
  alpha: number,
  liveAvg: number,
  t: number
) {
  const stops = resolveSurfaceStops(spec, liveAvg, t);
  if (!stops) return false;

  const sliceCount = Math.max(1, Math.min(Math.ceil(p.height), 420));
  ctx.save();
  ctx.globalAlpha = alpha;
  for (let i = 0; i < sliceCount; i += 1) {
    const y0 = (i / sliceCount) * p.height;
    const y1 = ((i + 1) / sliceCount) * p.height;
    const sampled = sampleSurfaceStop(stops, (y0 + y1) / (2 * p.height));
    if (!sampled) continue;

    const g = ctx.createLinearGradient(0, 0, p.width, 0);
    g.addColorStop(0, cssRgba(sampled.left));
    g.addColorStop(1, cssRgba(sampled.right));

    ctx.fillStyle = g;
    ctx.fillRect(0, Math.floor(y0), p.width, Math.max(1, Math.ceil(y1) - Math.floor(y0) + 1));
  }
  ctx.restore();
  return true;
}

function resolveOuterRadius(p: PLike, outer: RadialGradientSpec["outer"]) {
  if (outer === "diag") return Math.hypot(p.width, p.height);
  return Math.max(1, outer.k) * Math.max(p.width, p.height);
}

function resolveLinearPoints(p: PLike, spec: LinearGradientSpec) {
  return {
    x1: p.width * spec.from.xK,
    y1: p.height * spec.from.yK,
    x2: p.width * spec.to.xK,
    y2: p.height * spec.to.yK,
  };
}

function resolveBackgroundSpec(
  sceneLookup: SceneLookupKey,
  override: BackgroundSpec | null
): BackgroundSpec {
  return override ?? BACKGROUNDS[sceneLookup] ?? BACKGROUNDS.start;
}

function hash01(seed: number) {
  const x = Math.sin(seed * 127.1) * 43758.5453123;
  return x - Math.floor(x);
}

function drawStars(
  p: PLike,
  ctx: CanvasRenderingContext2D,
  spec: NonNullable<BackgroundSpec["stars"]>,
  liveAvg: number
) {
  const t = p.millis() / 1000;
  const maxY = p.height * spec.topBandK;
  const starCount = Math.max(
    0,
    Math.round(typeof spec.count === "number" ? spec.count : mix(spec.count[0], spec.count[1], clamp01(liveAvg)))
  );

  const alphaRange = resolveStarRange(spec.alpha, liveAvg);
  const flickerRange = resolveStarRange(spec.flickerHz, liveAvg);

  ctx.save();
  for (let i = 0; i < starCount; i += 1) {
    const x = hash01(i + 1.11) * p.width;
    const y = hash01(i + 7.73) * maxY;
    const r = spec.minR + (spec.maxR - spec.minR) * hash01(i + 15.37);
    const hz = flickerRange[0] + (flickerRange[1] - flickerRange[0]) * hash01(i + 23.91);
    const phase = hash01(i + 31.17) * Math.PI * 2;
    const twinkle = 0.5 + 0.5 * Math.sin(t * hz * Math.PI * 2 + phase);
    const alpha = alphaRange[0] + (alphaRange[1] - alphaRange[0]) * twinkle;

    ctx.fillStyle = `rgba(245, 248, 255, ${alpha})`;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

function isRangePair(
  value: [number, number] | readonly [[number, number], [number, number]]
): value is readonly [[number, number], [number, number]] {
  return Array.isArray(value[0]);
}

function resolveStarRange(
  value: [number, number] | readonly [[number, number], [number, number]],
  liveAvg: number
): readonly [number, number] {
  if (!isRangePair(value)) return value;
  return [
    mix(value[0][0], value[1][0], clamp01(liveAvg)),
    mix(value[0][1], value[1][1], clamp01(liveAvg)),
  ] as const;
}

export function drawFogOverlay(
  p: PLike,
  sceneLookup: SceneLookupKey,
  override: BackgroundSpec | null = null,
  alpha: number = 1,
  liveAvg: number = 0.5
) {
  const spec = resolveBackgroundSpec(sceneLookup, override);
  const overlay = spec.overlay;
  if (!overlay || overlay.kind === "solid") return;

  const gradOverlay = overlay as RadialGradientSpec | LinearGradientSpec;
  const hasFog = gradOverlay.stops.some((s) => s.fog);
  if (!hasFog) return;

  const ctx = p.drawingContext as CanvasRenderingContext2D;
  const t = p.millis() / 1000;

  type GradStop = (typeof gradOverlay.stops)[number];
  function fogStopColor(stop: GradStop): string {
    if (!stop.fog) return "rgba(0,0,0,0)";
    const resolved = resolveStopColor(stop.rgba, stop.liveBlend, liveAvg);
    const parsed = parseCssColor(resolved);
    if (!parsed) return "rgba(0,0,0,0)";
    return `rgba(${parsed.r}, ${parsed.g}, ${parsed.b}, ${clamp01(stop.fog.opacity)})`;
  }

  let g: CanvasGradient;

  if (gradOverlay.kind === "linear") {
    const { x1, y1, x2, y2 } = resolveLinearPoints(p, gradOverlay);
    g = ctx.createLinearGradient(x1, y1, x2, y2);
    for (const stop of gradOverlay.stops) {
      const baseK = stop.oscK
        ? clamp01(stop.k + stop.oscK.amp * Math.sin(2 * Math.PI * stop.oscK.hz * t))
        : stop.k;
      const fogK = stop.fog?.k ?? baseK;
      g.addColorStop(fogK, fogStopColor(stop));
    }
  } else {
    const cx = p.width * gradOverlay.center.xK;
    const cy = p.height * gradOverlay.center.yK;
    const inner = Math.min(p.width, p.height) * gradOverlay.innerK;
    const outer = resolveOuterRadius(p, gradOverlay.outer);
    g = ctx.createRadialGradient(cx, cy, inner, cx, cy, outer);
    for (const stop of gradOverlay.stops) {
      const fogK = stop.fog?.k ?? stop.k;
      g.addColorStop(fogK, fogStopColor(stop));
    }
  }

  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, p.width, p.height);
  ctx.restore();

  const dtSec = Math.min(0.1, p.deltaTime / 1000);

  for (let i = 0; i < gradOverlay.stops.length; i++) {
    const stop = gradOverlay.stops[i];
    if (!stop.fog || stop.fog.opacity <= 0) continue;

    const fogK = stop.fog.k ?? stop.k;
    const resolved = resolveStopColor(stop.rgba, stop.liveBlend, liveAvg);
    const parsed = parseCssColor(resolved);
    if (!parsed) continue;

    const bandH = p.height * 0.26;
    const centerY = fogK * p.height;

    stepAndDrawParticles(p, {
      key: `fog-foliage:${sceneLookup}:${i}`,
      rect: { x: 0, y: centerY - bandH * 0.5, w: p.width, h: bandH },
      mode: "dot",
      spawnMode: "stratified",
      respawnStratified: true,
      count: Math.max(1, Math.round(stop.fog.opacity * 48)),
      color: { r: parsed.r, g: parsed.g, b: parsed.b, a: Math.round(stop.fog.opacity * 155) },
      speed: { min: 6, max: 20 },
      angle: { min: -0.28, max: 0.28 },
      accel: { y: 1.8 },
      jitter: { pos: 10, velAngle: 0.45 },
      size: { min: 0.9, max: 2.5 },
      lifetime: { min: 5, max: 13 },
      fadeInFrac: 0.12,
      fadeOutFrac: 0.22,
      edgeFadePx: {
        left: p.width * 0.09,
        right: p.width * 0.09,
        top: bandH * 0.32,
        bottom: bandH * 0.32,
      },
      respawn: true,
    }, dtSec);
  }
}

export function drawBackground(
  p: PLike,
  sceneLookup: SceneLookupKey,
  override: BackgroundSpec | null = null,
  alpha: number = 1,
  liveAvg: number = 0.5,
  skipStars = false
) {
  const spec = resolveBackgroundSpec(sceneLookup, override);
  const ctx = p.drawingContext as CanvasRenderingContext2D;

  if (alpha >= 1) {
    p.background(spec.base);
  } else {
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.fillStyle = spec.base;
    ctx.fillRect(0, 0, p.width, p.height);
    ctx.restore();
  }

  const overlay = spec.overlay;
  if (overlay) {
    if (overlay.kind === "solid") {
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.fillStyle = overlay.color;
      ctx.fillRect(0, 0, p.width, p.height);
      ctx.restore();
    } else if (overlay.kind === "linear") {
      const t = p.millis() / 1000;
      const hasHorizontalStops = overlay.stops.some((stop) => !!stop.rightRgba);
      const drewSurface = hasHorizontalStops
        ? drawLinearStopSurface(p, ctx, overlay, alpha, liveAvg, t)
        : false;

      if (!drewSurface) {
        const { x1, y1, x2, y2 } = resolveLinearPoints(p, overlay);
        const g = ctx.createLinearGradient(x1, y1, x2, y2);
        for (const stop of overlay.stops) {
          const k = resolveStopK(stop, t);
          g.addColorStop(k, resolveStopColor(stop.rgba, stop.liveBlend, liveAvg));
        }
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, p.width, p.height);
        ctx.restore();
      }
    } else {
      const cx = p.width * overlay.center.xK;
      const cy = p.height * overlay.center.yK;
      const inner = Math.min(p.width, p.height) * overlay.innerK;
      const outer = resolveOuterRadius(p, overlay.outer);

      const g = ctx.createRadialGradient(cx, cy, inner, cx, cy, outer);
      for (const stop of overlay.stops) {
        g.addColorStop(stop.k, resolveStopColor(stop.rgba, stop.liveBlend, liveAvg));
      }
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, p.width, p.height);
      ctx.restore();
    }
  }

  if (!skipStars && spec.stars) {
    ctx.save();
    ctx.globalAlpha = alpha;
    drawStars(p, ctx, spec.stars, liveAvg);
    ctx.restore();
  }
}

export function drawBackgroundStarsOnly(
  p: PLike,
  sceneLookup: SceneLookupKey,
  override: BackgroundSpec | null = null,
  alpha: number = 1,
  liveAvg: number = 0.5
) {
  const spec = resolveBackgroundSpec(sceneLookup, override);
  if (!spec.stars) return;
  const ctx = p.drawingContext as CanvasRenderingContext2D;
  ctx.save();
  ctx.globalAlpha = alpha;
  drawStars(p, ctx, spec.stars, liveAvg);
  ctx.restore();
}

// Offscreen cache for background base + overlay (stars excluded — they animate).
// Only redraws when scene, liveAvg (quantized), or canvas dimensions change.
export function createBgCache() {
  let offscreen: HTMLCanvasElement | null = null;
  let cacheKey = "";
  let lastOverride: BackgroundSpec | null | undefined = undefined;

  return function drawBgCached(
    p: PLike,
    sceneLookup: SceneLookupKey,
    override: BackgroundSpec | null,
    liveAvg: number
  ) {
    const w = p.width;
    const h = p.height;
    const liveAvgQ = Math.round(liveAvg * 100);
    const key = `${w}|${h}|${sceneLookup}|${liveAvgQ}`;

    if (!offscreen || offscreen.width !== w || offscreen.height !== h) {
      if (!offscreen) offscreen = document.createElement("canvas");
      offscreen.width = w;
      offscreen.height = h;
      cacheKey = "";
    }

    if (key !== cacheKey || override !== lastOverride) {
      const offCtx = offscreen.getContext("2d")!;
      offCtx.clearRect(0, 0, w, h);
      const fakeP = {
        drawingContext: offCtx,
        width: w,
        height: h,
        millis: () => 0,
        background: (color: string) => {
          offCtx.fillStyle = color;
          offCtx.fillRect(0, 0, w, h);
        },
      } as unknown as PLike;
      drawBackground(fakeP, sceneLookup, override, 1, liveAvg, true);
      cacheKey = key;
      lastOverride = override;
    }

    const ctx = p.drawingContext as CanvasRenderingContext2D;
    ctx.drawImage(offscreen, 0, 0);
  };
}

// Offscreen cache for drawRowTopLightOverlay — pure geometry, no time dependency.
export function createRowLightCache() {
  let offscreen: HTMLCanvasElement | null = null;
  let cacheKey = "";

  return function drawRowLightCached(args: Parameters<typeof drawRowTopLightOverlay>[0]) {
    const { p, metrics, light, alpha = 1 } = args;
    if (!light || alpha <= 0) return;

    const w = p.width;
    const h = p.height;
    const key = `${w}|${h}|${alpha.toFixed(3)}|${light.sourceX.toFixed(1)}|${light.sourceY.toFixed(1)}|${light.sceneDiag.toFixed(1)}|${metrics.rowHeights.join(",")}|${metrics.rowOffsetY.join(",")}`;

    if (!offscreen || offscreen.width !== w || offscreen.height !== h) {
      if (!offscreen) offscreen = document.createElement("canvas");
      offscreen.width = w;
      offscreen.height = h;
      cacheKey = "";
    }

    if (key !== cacheKey) {
      const offCtx = offscreen.getContext("2d")!;
      offCtx.clearRect(0, 0, w, h);
      const fakeP = { drawingContext: offCtx, width: w, height: h } as unknown as PLike;
      drawRowTopLightOverlay({ p: fakeP, metrics, light, alpha });
      cacheKey = key;
    }

    const ctx = p.drawingContext as CanvasRenderingContext2D;
    ctx.drawImage(offscreen, 0, 0);
  };
}

export function drawRowTopLightOverlay(args: {
  p: PLike;
  metrics: GridMetrics;
  light: SceneLightContext | null;
  alpha?: number;
}) {
  const { p, metrics, light, alpha = 1 } = args;
  if (!light || alpha <= 0) return;
  const { rowHeights, rowOffsetY } = metrics;
  if (rowHeights.length < 1 || rowOffsetY.length < 1) return;

  const ctx = p.drawingContext as CanvasRenderingContext2D;
  const horizonRow = resolveHorizonRow(rowHeights);
  const maxBandH = Math.max(4, Math.min(18, p.height * 0.022));

  ctx.save();
  ctx.globalAlpha = alpha;

  const sourceKx = clamp01(light.sourceX / p.width);

  for (let r = 0; r < rowHeights.length; r += 1) {
    const rowTop = rowOffsetY[r] ?? 0;
    const rowH = rowHeights[r] ?? 0;
    if (rowH <= 0) continue;

    const bandH = Math.max(2, Math.min(maxBandH, rowH * 0.16));
    const rowY = rowTop + bandH * 0.5;
    const distY = Math.abs(rowY - light.sourceY);
    const verticalK = clamp01(1 - distY / (p.height * 0.95));
    const skyK = r <= horizonRow
      ? 1
      : clamp01(1 - (r - horizonRow) / Math.max(3, rowHeights.length - horizonRow)) * 0.72;
    const bandAlpha = 0.27 * verticalK * skyK;
    if (bandAlpha <= 0.003) continue;

    // horizontal gradient: bright near light source, fading toward edges
    const peakLeft  = clamp01(sourceKx - 0.18);
    const peakRight = clamp01(sourceKx + 0.18);
    const g = ctx.createLinearGradient(0, 0, p.width, 0);
    g.addColorStop(0,          `rgba(255,255,255,0)`);
    g.addColorStop(peakLeft,   `rgba(255,255,255,${bandAlpha * 0.45})`);
    g.addColorStop(sourceKx,   `rgba(255,255,255,${bandAlpha})`);
    g.addColorStop(peakRight,  `rgba(255,255,255,${bandAlpha * 0.45})`);
    g.addColorStop(1,          `rgba(255,255,255,0)`);

    ctx.fillStyle = g;
    ctx.fillRect(0, rowTop, p.width, bandH);
  }

  ctx.restore();
}
