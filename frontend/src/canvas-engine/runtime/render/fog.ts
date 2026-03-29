import type { GridMetrics } from "../layout/gridCache";
import type { PLike } from "../p/makeP";

type FogColor = { r: number; g: number; b: number };

export type FogState = {
  fogStartY: number;
  fogCanvasH: number;
  fogPeakRow: number;
  skyLayerAlpha: number;
  skyPeakOpacity: number;
  rowOffsetY: number[];
  bottomFogLayerBoundaries: number[];
  fogColor: FogColor;
  fogLayerAlpha255: number;
};

function drawFogBand(args: {
  p: PLike;
  top: number;
  height: number;
  alpha255: number;
  featherEdge: "top" | "bottom";
  color: FogColor;
}) {
  const { p, top, height, alpha255, featherEdge, color } = args;
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
    ctx.fillStyle = `rgba(${color.r},${color.g},${color.b},${alpha})`;
    ctx.fillRect(0, rectTop, p.width, rectBottom - rectTop);
    ctx.restore();
    return;
  }

  const rectTop = top - outerFeather;
  const rectBottom = top + height;
  ctx.save();
  ctx.fillStyle = `rgba(${color.r},${color.g},${color.b},${alpha})`;
  ctx.fillRect(0, rectTop, p.width, rectBottom - rectTop);
  ctx.restore();
}

export function computeFogState(args: {
  p: PLike;
  metrics: GridMetrics;
  darkMode: boolean;
}): FogState | null {
  const { p, metrics, darkMode } = args;
  if (metrics.rowHeights.length <= 2) return null;

  const minH = Math.min(...metrics.rowHeights);
  const horizonRow = metrics.rowHeights.indexOf(minH);
  const fogPeakRow = Math.max(0, horizonRow - 2);
  const fogStartY = metrics.rowOffsetY[fogPeakRow];
  if (!Number.isFinite(fogStartY)) return null;

  const fogCanvasH = (p as any).canvas?._cssH ?? p.height ?? 900;
  const bottomFogLayerBoundaries = [
    ...metrics.rowOffsetY.slice(fogPeakRow + 1),
    fogCanvasH,
  ].filter((y) => Number.isFinite(y) && y > fogStartY);

  const FOG_LAYER_ALPHA = darkMode ? 48 / 255 : 26 / 255;
  const numBottomFogLayers = bottomFogLayerBoundaries.length;
  const targetHorizonOpacity = numBottomFogLayers > 0
    ? 1 - Math.pow(1 - FOG_LAYER_ALPHA, numBottomFogLayers)
    : 0;
  const numSkyFogLayers = Math.max(0, fogPeakRow);
  const skyLayerAlpha = numSkyFogLayers > 0
    ? 1 - Math.pow(1 - targetHorizonOpacity, 1 / numSkyFogLayers)
    : 0;

  return {
    fogStartY,
    fogCanvasH,
    fogPeakRow,
    skyLayerAlpha,
    skyPeakOpacity: targetHorizonOpacity,
    rowOffsetY: [...metrics.rowOffsetY],
    bottomFogLayerBoundaries,
    fogColor: darkMode
      ? { r: 18, g: 28, b: 42 }
      : { r: 229, g: 246, b: 255 },
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
    bottomFogLayerIndex += 1;
    if (rectH <= 0) return;
    drawFogBand({
      p,
      top: rectTop,
      height: rectH,
      alpha255: fog.fogLayerAlpha255,
      featherEdge: "bottom",
      color: fog.fogColor,
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

export function drawSkyFog(p: PLike, fog: FogState) {
  if (fog.skyLayerAlpha <= 0 || fog.fogPeakRow <= 0) return;

  for (let r = 0; r < fog.fogPeakRow; r++) {
    const rectTop = fog.rowOffsetY[r] ?? 0;
    const rectBottom = fog.fogStartY;
    const rectH = rectBottom - rectTop;
    if (rectH <= 0) continue;
    drawFogBand({
      p,
      top: rectTop,
      height: rectH,
      alpha255: Math.round(fog.skyLayerAlpha * 255),
      featherEdge: "top",
      color: fog.fogColor,
    });
  }
}
