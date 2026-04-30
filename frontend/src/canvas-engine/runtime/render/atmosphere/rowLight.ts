import type { SceneLightContext } from "../../../modifiers/lighting";
import { resolveHorizonRow } from "../../../shared/horizon";
import { clamp01 } from "../../../shared/math";
import type { GridMetrics } from "../../layout/gridCache";
import type { PLike } from "../../p/makeP";

const SKY_LIGHT_INNER_RADIUS_K = 0.10;
const SKY_LIGHT_OUTER_RADIUS_K = 0.26;

function addAlphaOnlyLightStops(
  gradient: CanvasGradient,
  sourceKx: number,
  peakAlpha: number,
  innerRadiusK: number,
  outerRadiusK: number
) {
  const rawStops: Array<readonly [number, number]> = [
    [0, 0],
    [sourceKx - outerRadiusK, 0],
    [sourceKx - innerRadiusK, peakAlpha * 0.45],
    [sourceKx, peakAlpha],
    [sourceKx + innerRadiusK, peakAlpha * 0.45],
    [sourceKx + outerRadiusK, 0],
    [1, 0],
  ];
  const stops: Array<[number, number]> = [];

  for (const [rawK, rawAlpha] of rawStops) {
    const k = clamp01(rawK);
    const alpha = clamp01(rawAlpha);
    const existing = stops.find((stop) => Math.abs(stop[0] - k) < 0.0001);
    if (existing) {
      existing[1] = Math.max(existing[1], alpha);
    } else {
      stops.push([k, alpha]);
    }
  }

  stops.sort((a, b) => a[0] - b[0]);
  for (const [k, alpha] of stops) {
    gradient.addColorStop(k, `rgba(255,255,255,${alpha})`);
  }
}

// Offscreen cache for drawRowTopLightOverlay: pure geometry, no time dependency.
export function createRowLightCache() {
  let offscreen: HTMLCanvasElement | null = null;
  let cacheKey = "";

  return function drawRowLightCached(args: Parameters<typeof drawRowTopLightOverlay>[0]) {
    const { p, metrics, light, alpha = 1, minRow = 0, maxRowExclusive } = args;
    if (!light || alpha <= 0) return;

    const w = p.width;
    const h = p.height;
    const key = `${w}|${h}|${alpha.toFixed(3)}|${minRow}|${maxRowExclusive ?? "end"}|${light.sourceX.toFixed(1)}|${light.sourceY.toFixed(1)}|${light.sceneDiag.toFixed(1)}|${metrics.rowHeights.join(",")}|${metrics.rowOffsetY.join(",")}`;

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
      drawRowTopLightOverlay({ p: fakeP, metrics, light, alpha, minRow, maxRowExclusive });
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
  minRow?: number;
  maxRowExclusive?: number;
}) {
  const { p, metrics, light, alpha = 1, minRow = 0, maxRowExclusive } = args;
  if (!light || alpha <= 0) return;
  const { rowHeights, rowOffsetY } = metrics;
  if (rowHeights.length < 1 || rowOffsetY.length < 1) return;

  const ctx = p.drawingContext as CanvasRenderingContext2D;
  const horizonRow = resolveHorizonRow(rowHeights);
  const maxBandH = Math.max(4, Math.min(18, p.height * 0.022));

  ctx.save();
  ctx.globalAlpha = alpha;

  const sourceKx = clamp01(light.sourceX / p.width);

  const firstRow = Math.max(0, Math.min(rowHeights.length, Math.floor(minRow)));
  const lastRow = Math.max(firstRow, Math.min(rowHeights.length, Math.floor(maxRowExclusive ?? rowHeights.length)));

  for (let r = firstRow; r < lastRow; r += 1) {
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

    const g = ctx.createLinearGradient(0, 0, p.width, 0);
    addAlphaOnlyLightStops(g, sourceKx, bandAlpha, SKY_LIGHT_INNER_RADIUS_K, SKY_LIGHT_OUTER_RADIUS_K);

    ctx.fillStyle = g;
    ctx.fillRect(0, rowTop, p.width, bandH);
  }

  ctx.restore();
}
