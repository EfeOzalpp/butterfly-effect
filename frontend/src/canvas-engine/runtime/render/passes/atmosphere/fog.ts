import { clamp01 } from "../../../../shared/math";
import type { GridMetrics } from "../../../geometry/gridCache";
import type { PLike } from "../../../p/makeP";
import { resolveHorizonRow } from "../shared/horizon";

interface FogColor { r: number; g: number; b: number }
interface FogGradientStop { k: number; color: FogColor }

// Frame-ready fog layout. The loop should not recalculate these row boundaries
// unless the grid or theme changes.
interface FogState {
  fogStartY: number;
  fogCanvasH: number;
  horizonRow: number;
  skyLayerAlpha: number;
  rowOffsetY: number[];
  groundFogLayerBoundaries: number[];
  fogColor: FogColor;
  skyFogGradient: readonly FogGradientStop[] | null;
  groundFogGradient: readonly FogGradientStop[] | null;
  fogLayerAlpha255: number;
}

interface FogStateInput {
  p: PLike;
  metrics: GridMetrics;
  darkMode: boolean;
}

const DARK_SKY_FOG_GRADIENT: readonly FogGradientStop[] = [
  { k: 0, color: { r: 55, g: 58, b: 72 } },
  { k: 0.06, color: { r: 68, g: 70, b: 88 } },
  { k: 0.19, color: { r: 68, g: 70, b: 88 } },
  { k: 0.64, color: { r: 28, g: 22, b: 42 } },
  { k: 1, color: { r: 14, g: 10, b: 32 } },
] as const;

const DARK_GROUND_FOG_GRADIENT: readonly FogGradientStop[] = [
  { k: 0, color: { r: 52, g: 54, b: 54 } },
  { k: 0.16, color: { r: 72, g: 76, b: 86 } },
  { k: 0.22, color: { r: 72, g: 76, b: 86 } },
  { k: 0.74, color: { r: 30, g: 18, b: 30 } },
  { k: 1, color: { r: 15, g: 9, b: 30 } },
] as const;

function remap01(v: number, start: number, end: number) {
  if (end <= start) return v >= end ? 1 : 0;
  return clamp01((v - start) / (end - start));
}

function mixFogColor(a: FogColor, b: FogColor, k: number): FogColor {
  const kk = clamp01(k);
  return {
    r: Math.round(a.r + (b.r - a.r) * kk),
    g: Math.round(a.g + (b.g - a.g) * kk),
    b: Math.round(a.b + (b.b - a.b) * kk),
  };
}

function rgbaString(color: FogColor, alpha: number) {
  return `rgba(${String(color.r)},${String(color.g)},${String(color.b)},${String(clamp01(alpha))})`;
}

function gradientCacheKey(gradientStops: readonly FogGradientStop[] | null | undefined) {
  if (!gradientStops || gradientStops.length === 0) return "none";
  return gradientStops
    .map((stop) => `${String(stop.k)}:${String(stop.color.r)},${String(stop.color.g)},${String(stop.color.b)}`)
    .join("|");
}

function fogOpacityScaleForRowCount(rowCount: number) {
  // More rows means more stacked fog bands, so each band needs less alpha.
  const referenceRows = 18;
  const rawScale = referenceRows / Math.max(1, rowCount);
  return Math.max(0.45, Math.min(1, rawScale));
}

function resolveFogFillStyle(
  ctx: CanvasRenderingContext2D,
  width: number,
  color: FogColor,
  alpha: number,
  gradientStops?: readonly FogGradientStop[] | null
) {
  if (!gradientStops || gradientStops.length === 0) {
    return rgbaString(color, alpha);
  }

  const g = ctx.createLinearGradient(0, 0, width, 0);
  for (const stop of gradientStops) {
    g.addColorStop(clamp01(stop.k), rgbaString(stop.color, alpha));
  }
  return g;
}

function blendGradientStopsTowardFog(
  stops: readonly FogGradientStop[],
  fogColor: FogColor,
  fogBlendK: number
): readonly FogGradientStop[] {
  return stops.map((stop) => ({
    k: stop.k,
    color: mixFogColor(stop.color, fogColor, fogBlendK),
  }));
}

function drawFogBand(args: {
  p: PLike;
  top: number;
  height: number;
  alpha255: number;
  overhangEdge: "top" | "bottom";
  color: FogColor;
  gradientStops?: readonly FogGradientStop[] | null;
  overhangPx?: number;
}) {
  const { p, top, height, alpha255, overhangEdge, color, gradientStops = null, overhangPx } = args;
  if (height <= 0 || alpha255 <= 0) return;

  const ctx = p.drawingContext;
  const alpha = Math.max(0, Math.min(1, alpha255 / 255));
  // Each fog slice overhangs slightly so row seams do not read as hard lines.
  const outerFeather = overhangPx ?? (
    overhangEdge === "top"
      ? Math.max(18, Math.min(72, height * 0.6))
      : Math.max(10, Math.min(42, height * 0.35))
  );

  const fillFogRect = (rectTop: number, rectBottom: number) => {
    const y0 = Math.max(0, Math.round(rectTop));
    const y1 = Math.min(p.height, Math.round(rectBottom));
    if (y1 <= y0) return;

    ctx.save();
    ctx.fillStyle = resolveFogFillStyle(ctx, p.width, color, alpha, gradientStops);
    ctx.fillRect(0, y0, p.width, y1 - y0);
    ctx.restore();
  };

  if (overhangEdge === "bottom") {
    fillFogRect(top, top + height + outerFeather);
    return;
  }

  fillFogRect(top - outerFeather, top + height);
}

function skyFogTopOverhang(rowH: number) {
  return Math.max(4, Math.min(18, rowH * 0.35));
}

function skyFogRowHeight(fog: FogState, row: number, rectTop: number) {
  const nextRowTop = row + 1 < fog.horizonRow
    ? fog.rowOffsetY[row + 1]
    : fog.fogStartY;
  return Math.max(0, nextRowTop - rectTop);
}

function drawSkyFogLayer(p: PLike, fog: FogState, row: number) {
  const rectTop = fog.rowOffsetY[row] ?? 0;
  const rectBottom = fog.fogStartY;
  const rectH = rectBottom - rectTop;
  if (rectH <= 0) return;

  const rowH = skyFogRowHeight(fog, row, rectTop);
  drawFogBand({
    p,
    top: rectTop,
    height: rectH,
    alpha255: Math.round(fog.skyLayerAlpha * 255),
    overhangEdge: "top",
    color: fog.fogColor,
    gradientStops: fog.skyFogGradient,
    overhangPx: skyFogTopOverhang(rowH),
  });
}

function computeFogState(args: {
  p: PLike;
  metrics: GridMetrics;
  darkMode: boolean;
}): FogState | null {
  const { p, metrics, darkMode } = args;
  if (metrics.rowHeights.length <= 2) return null;

  const horizonRow = resolveHorizonRow(metrics.rowHeights);
  const fogStartY = metrics.rowOffsetY[horizonRow];
  if (!Number.isFinite(fogStartY)) return null;

  // Ground fog still uses row boundaries, but it is now one cached background
  // atmosphere pass. Shape depth is handled by the per-shape silhouette overlay.
  const fogCanvasH = p.height;
  const groundFogLayerBoundaries = [
    ...metrics.rowOffsetY.slice(horizonRow + 1),
    fogCanvasH,
  ].filter((y) => Number.isFinite(y) && y > fogStartY);

  const rowCount = metrics.rowHeights.length;
  const fogOpacityScale = fogOpacityScaleForRowCount(rowCount);
  const baseFogLayerAlpha = darkMode ? 44 / 255 : 26 / 255;
  const fogLayerAlpha = baseFogLayerAlpha * fogOpacityScale;
  const numGroundFogLayers = groundFogLayerBoundaries.length;
  // Match sky opacity to the accumulated ground fog so the horizon stays soft.
  const targetHorizonOpacity = numGroundFogLayers > 0
    ? 1 - Math.pow(1 - fogLayerAlpha, numGroundFogLayers)
    : 0;
  const numSkyFogLayers = Math.max(0, horizonRow);
  const skyLayerAlpha = numSkyFogLayers > 0
    ? 1 - Math.pow(1 - targetHorizonOpacity, 1 / numSkyFogLayers)
    : 0;
  const skyFogGradient = darkMode ? DARK_SKY_FOG_GRADIENT : null;
  const groundFogGradient = darkMode ? DARK_GROUND_FOG_GRADIENT : null;

  return {
    fogStartY,
    fogCanvasH,
    horizonRow,
    skyLayerAlpha,
    rowOffsetY: [...metrics.rowOffsetY],
    groundFogLayerBoundaries,
    fogColor: darkMode ? { r: 33, g: 32, b: 40 } : { r: 246, g: 246, b: 248 },
    skyFogGradient,
    groundFogGradient,
    fogLayerAlpha255: Math.round(fogLayerAlpha * 255),
  };
}

// Fog state is pure layout/color data, so this cache only invalidates on
// canvas, grid, or theme changes.
export function createFogStateCache() {
  let hasValue = false;
  let lastWidth = 0;
  let lastHeight = 0;
  let lastMetrics: GridMetrics | null = null;
  let lastDarkMode = false;
  let lastFog: FogState | null = null;

  return function getFogState(args: FogStateInput): FogState | null {
    const { p, metrics, darkMode } = args;
    const width = p.width;
    const height = p.height;

    if (
      hasValue &&
      width === lastWidth &&
      height === lastHeight &&
      metrics === lastMetrics &&
      darkMode === lastDarkMode
    ) {
      return lastFog;
    }

    lastWidth = width;
    lastHeight = height;
    lastMetrics = metrics;
    lastDarkMode = darkMode;
    lastFog = computeFogState(args);
    hasValue = true;

    return lastFog;
  };
}

function drawGroundFog(p: PLike, fog: FogState) {
  for (const rectBottom of fog.groundFogLayerBoundaries) {
    if (!Number.isFinite(rectBottom)) return;
    const rectTop = fog.fogStartY;
    const rectH = rectBottom - rectTop;
    const layerDepthT = fog.fogCanvasH > fog.fogStartY
      ? clamp01(rectH / (fog.fogCanvasH - fog.fogStartY))
      : 0;
    // Deeper ground bands keep more of the scene gradient; near-horizon bands
    // blend harder into the fog color.
    const gradientUseK = fog.groundFogGradient
      ? clamp01(Math.pow(remap01(layerDepthT, 0.30, 1), 1.36))
      : 0;
    const fogBlendK = 1 - gradientUseK;
    const gradientStops = fog.groundFogGradient
      ? blendGradientStopsTowardFog(fog.groundFogGradient, fog.fogColor, fogBlendK)
      : null;
    if (rectH <= 0) continue;
    drawFogBand({
      p,
      top: rectTop,
      height: rectH,
      alpha255: fog.fogLayerAlpha255,
      overhangEdge: "bottom",
      color: fog.fogColor,
      gradientStops,
    });
  }
}

// Offscreen cache for the whole static fog layer. Shape depth now lives in
// render/passes/shape/shapeDepthOverlay.ts, so this layer can stay behind all scene objects.
export function createFogLayerCache() {
  let offscreen: HTMLCanvasElement | null = null;
  let cacheKey = "";

  return function drawFogLayerCached(p: PLike, fog: FogState | null) {
    if (!fog) return;

    const w = p.width;
    const h = p.height;
    const key = [
      String(w),
      String(h),
      fog.fogStartY.toFixed(1),
      String(fog.horizonRow),
      fog.skyLayerAlpha.toFixed(4),
      String(fog.fogLayerAlpha255),
      String(fog.fogColor.r),
      String(fog.fogColor.g),
      String(fog.fogColor.b),
      gradientCacheKey(fog.skyFogGradient),
      gradientCacheKey(fog.groundFogGradient),
      fog.rowOffsetY.join(","),
      fog.groundFogLayerBoundaries.join(","),
    ].join("|");

    if (offscreen?.width !== w || offscreen.height !== h) {
      offscreen ??= document.createElement("canvas");
      offscreen.width = w;
      offscreen.height = h;
      cacheKey = "";
    }

    if (key !== cacheKey) {
      const offCtx = offscreen.getContext("2d");
      if (!offCtx) throw new Error("2D canvas context not available");
      offCtx.clearRect(0, 0, w, h);
      const fakeP = { drawingContext: offCtx, width: w, height: h } as unknown as PLike;
      drawFogLayer(fakeP, fog);
      cacheKey = key;
    }

    const ctx = p.drawingContext;
    ctx.drawImage(offscreen, 0, 0);
  };
}

function drawFogLayer(p: PLike, fog: FogState) {
  drawSkyFog(p, fog);
  drawGroundFog(p, fog);
}

function drawSkyFog(p: PLike, fog: FogState) {
  if (fog.skyLayerAlpha <= 0 || fog.horizonRow <= 0) return;

  for (let r = 0; r < fog.horizonRow; r++) {
    drawSkyFogLayer(p, fog, r);
  }
}
