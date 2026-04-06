import type { GridMetrics } from "../layout/gridCache";
import type { PLike } from "../p/makeP";
import { clamp01 } from "../../shared/math";
import { resolveHorizonRow } from "../../shared/horizon";

type FogColor = { r: number; g: number; b: number };
type FogGradientStop = { k: number; color: FogColor };

export type FogState = {
  fogStartY: number;
  fogCanvasH: number;
  fogPeakRow: number;
  skyLayerAlpha: number;
  skyPeakOpacity: number;
  rowOffsetY: number[];
  bottomFogLayerBoundaries: number[];
  fogColor: FogColor;
  skyFogGradient: readonly FogGradientStop[] | null;
  bottomFogGradient: readonly FogGradientStop[] | null;
  fogLayerAlpha255: number;
};

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
  return `rgba(${color.r},${color.g},${color.b},${clamp01(alpha)})`;
}

function fogOpacityScaleForRowCount(rowCount: number) {
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
  featherEdge: "top" | "bottom";
  color: FogColor;
  gradientStops?: readonly FogGradientStop[] | null;
}) {
  const { p, top, height, alpha255, featherEdge, color, gradientStops = null } = args;
  if (height <= 0 || alpha255 <= 0) return;

  const ctx = p.drawingContext as CanvasRenderingContext2D;
  const alpha = Math.max(0, Math.min(1, alpha255 / 255));
  const outerFeather = featherEdge === "top"
    ? Math.max(18, Math.min(72, height * 0.6))
    : Math.max(10, Math.min(42, height * 0.35));

  if (featherEdge === "bottom") {
    const rectTop = top;
    const rectBottom = top + height + outerFeather;
    ctx.save();
    ctx.fillStyle = resolveFogFillStyle(ctx, p.width, color, alpha, gradientStops);
    ctx.fillRect(0, rectTop, p.width, rectBottom - rectTop);
    ctx.restore();
    return;
  }

  const rectTop = top - outerFeather;
  const rectBottom = top + height;
  ctx.save();
  ctx.fillStyle = resolveFogFillStyle(ctx, p.width, color, alpha, gradientStops);
  ctx.fillRect(0, rectTop, p.width, rectBottom - rectTop);
  ctx.restore();
}

export function computeFogState(args: {
  p: PLike;
  metrics: GridMetrics;
  darkMode: boolean;
  isRealMobile: boolean;
}): FogState | null {
  const { p, metrics, darkMode, isRealMobile } = args;
  if (metrics.rowHeights.length <= 2) return null;

  const horizonRow = resolveHorizonRow(metrics.rowHeights);
  const fogPeakRow = Math.max(0, horizonRow - 3);
  const fogStartY = metrics.rowOffsetY[fogPeakRow];
  if (!Number.isFinite(fogStartY)) return null;

  const fogCanvasH = (p as any).canvas?._cssH ?? p.height ?? 900;
  const bottomFogLayerBoundaries = [
    ...metrics.rowOffsetY.slice(fogPeakRow + 1),
    fogCanvasH,
  ].filter((y) => Number.isFinite(y) && y > fogStartY);

  const rowCount = metrics.rowHeights.length;
  const fogOpacityScale = fogOpacityScaleForRowCount(rowCount);
  const baseFogLayerAlpha = darkMode ? 42 / 255 : 26 / 255;
  const FOG_LAYER_ALPHA = baseFogLayerAlpha * fogOpacityScale;
  const numBottomFogLayers = bottomFogLayerBoundaries.length;
  const targetHorizonOpacity = numBottomFogLayers > 0
    ? 1 - Math.pow(1 - FOG_LAYER_ALPHA, numBottomFogLayers)
    : 0;
  const numSkyFogLayers = Math.max(0, fogPeakRow);
  const skyLayerAlpha = numSkyFogLayers > 0
    ? 1 - Math.pow(1 - targetHorizonOpacity, 1 / numSkyFogLayers)
    : 0;
  const skyFogGradient = darkMode
    ? [
        ...(isRealMobile
          ? [
              { k: 0.0, color: { r: 18, g: 11, b: 28 } },
              { k: 0.16, color: { r: 33, g: 28, b: 40 } },
              { k: 0.55, color: { r: 26, g: 19, b: 31 } },
              { k: 1, color: { r: 14, g: 8, b: 26 } },
            ] as const
          : [
              { k: 0.0, color: { r: 53, g: 49, b: 49 } },
              { k: 0.08, color: { r: 57, g: 52, b: 54 } },
              { k: 0.75, color: { r: 30, g: 18, b: 30 } },
              { k: 1, color: { r: 15, g: 9, b: 30 } },
            ] as const),
      ] as const
    : null;
  const bottomFogGradient = darkMode
    ? [
        ...(isRealMobile
          ? [
              { k: 0.0,  color: { r: 14, g: 8, b: 26 } },
              { k: 0.10, color: { r: 28, g: 21, b: 37 } },
              { k: 0.18, color: { r: 39, g: 34, b: 55 } },
              { k: 0.26, color: { r: 28, g: 21, b: 37 } },
              { k: 1.0,  color: { r: 14, g: 8, b: 26 } },
            ] as const
          : [
              { k: 0.0, color: { r: 18, g: 12, b: 32 } },
              { k: 0.08, color: { r: 48, g: 40, b: 55 } },
              { k: 0.12, color: { r: 34, g: 25, b: 42 } },
              { k: 1.0,  color: { r: 15, g: 9, b: 30 } },
            ] as const),
      ] as const


    : null;

  return {
    fogStartY,
    fogCanvasH,
    fogPeakRow,
    skyLayerAlpha,
    skyPeakOpacity: targetHorizonOpacity,
    rowOffsetY: [...metrics.rowOffsetY],
    bottomFogLayerBoundaries,
    fogColor: darkMode
      ? (isRealMobile
          ? { r: 23, g: 14, b: 45 }
          : { r: 23, g: 14, b: 45 })
      : { r: 229, g: 246, b: 255 },
    skyFogGradient,
    bottomFogGradient,
    fogLayerAlpha255: Math.round(FOG_LAYER_ALPHA * 255),
  };
}

export function createBottomFogStepper(p: PLike, fog: FogState) {
  let bottomFogLayerIndex = 0;
  const fogTopOffsetPx = 0;

  const drawNext = () => {
    const rectBottom = fog.bottomFogLayerBoundaries[bottomFogLayerIndex];
    if (!Number.isFinite(rectBottom)) return;
    const rectTop = fog.fogStartY + fogTopOffsetPx;
    const rectH = rectBottom - rectTop;
    const layerDepthT = fog.fogCanvasH > fog.fogStartY
      ? clamp01(rectH / (fog.fogCanvasH - fog.fogStartY))
      : 0;
    const gradientUseK = fog.bottomFogGradient
      ? clamp01(Math.pow(remap01(layerDepthT, 0.30, 1), 1.36))
      : 0;
    const fogBlendK = 1 - gradientUseK;
    const gradientStops = fog.bottomFogGradient
      ? blendGradientStopsTowardFog(fog.bottomFogGradient, fog.fogColor, fogBlendK)
      : null;
    bottomFogLayerIndex += 1;
    if (rectH <= 0) return;
    drawFogBand({
      p,
      top: rectTop,
      height: rectH,
      alpha255: fog.fogLayerAlpha255,
      featherEdge: "bottom",
      color: fog.fogColor,
      gradientStops,
    });
  };

  const drawUntilDepth = (depth: number) => {
    while (
      bottomFogLayerIndex < fog.bottomFogLayerBoundaries.length &&
      fog.bottomFogLayerBoundaries[bottomFogLayerIndex] <= depth
    ) {
      drawNext();
    }
  };

  const drawRemaining = () => {
    while (bottomFogLayerIndex < fog.bottomFogLayerBoundaries.length) {
      drawNext();
    }
  };

  return { drawNext, drawUntilDepth, drawRemaining };
}

export function createSkyFogStepper(p: PLike, fog: FogState) {
  let skyRowIndex = 0; // starts at top row (r=0), advances toward fogPeakRow

  const drawNext = () => {
    const r = skyRowIndex;
    if (r >= fog.fogPeakRow) return;
    skyRowIndex += 1;

    const rectTop = fog.rowOffsetY[r] ?? 0;
    const rectBottom = fog.fogStartY;
    const rectH = rectBottom - rectTop;
    if (rectH <= 0) return;

    const layersFromHorizon = fog.fogPeakRow - 1 - r;
    const horizonFogBlendK =
      layersFromHorizon === 0 ? 1 :
      layersFromHorizon === 1 ? 0.75 :
      layersFromHorizon === 2 ? 0.6 :
      0;
    const gradientStops = fog.skyFogGradient
      ? (horizonFogBlendK > 0
          ? blendGradientStopsTowardFog(fog.skyFogGradient, fog.fogColor, horizonFogBlendK)
          : fog.skyFogGradient)
      : null;

    drawFogBand({
      p,
      top: rectTop,
      height: rectH,
      alpha255: Math.round(fog.skyLayerAlpha * 255),
      featherEdge: "top",
      color: fog.fogColor,
      gradientStops,
    });
  };

  // draw all sky fog layers up to (but not including) the row containing depthY
  const drawUntilDepth = (depthY: number) => {
    while (
      skyRowIndex < fog.fogPeakRow &&
      (fog.rowOffsetY[skyRowIndex] ?? 0) <= depthY
    ) {
      drawNext();
    }
  };

  const drawRemaining = () => {
    while (skyRowIndex < fog.fogPeakRow) {
      drawNext();
    }
  };

  return { drawNext, drawUntilDepth, drawRemaining };
}

// Offscreen cache for drawSkyFog — pure gradient geometry, no time dependency.
export function createSkyFogCache() {
  let offscreen: HTMLCanvasElement | null = null;
  let cacheKey = "";

  return function drawSkyFogCached(p: PLike, fog: FogState | null) {
    if (!fog || fog.skyLayerAlpha <= 0 || fog.fogPeakRow <= 0) return;

    const w = p.width;
    const h = p.height;
    const key = `${w}|${h}|${fog.fogStartY.toFixed(1)}|${fog.fogPeakRow}|${fog.skyLayerAlpha.toFixed(4)}|${fog.fogColor.r}|${fog.fogColor.g}|${fog.fogColor.b}|${fog.skyFogGradient ? 1 : 0}|${fog.rowOffsetY.join(",")}`;

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
      drawSkyFog(fakeP, fog);
      cacheKey = key;
    }

    const ctx = p.drawingContext as CanvasRenderingContext2D;
    ctx.drawImage(offscreen, 0, 0);
  };
}

export function drawSkyFog(p: PLike, fog: FogState) {
  if (fog.skyLayerAlpha <= 0 || fog.fogPeakRow <= 0) return;

  for (let r = 0; r < fog.fogPeakRow; r++) {
    const rectTop = fog.rowOffsetY[r] ?? 0;
    const rectBottom = fog.fogStartY;
    const rectH = rectBottom - rectTop;
    if (rectH <= 0) continue;
    const layersFromHorizon = fog.fogPeakRow - 1 - r;
    const horizonFogBlendK =
      layersFromHorizon === 0 ? 1:
      layersFromHorizon === 1 ? 0.75 :
      layersFromHorizon === 2 ? 0.6 :
      0;
    const gradientStops = fog.skyFogGradient
      ? (
          horizonFogBlendK > 0
            ? blendGradientStopsTowardFog(fog.skyFogGradient, fog.fogColor, horizonFogBlendK)
            : fog.skyFogGradient
        )
      : null;
    drawFogBand({
      p,
      top: rectTop,
      height: rectH,
      alpha255: Math.round(fog.skyLayerAlpha * 255),
      featherEdge: "top",
      color: fog.fogColor,
      gradientStops,
    });
  }
}
