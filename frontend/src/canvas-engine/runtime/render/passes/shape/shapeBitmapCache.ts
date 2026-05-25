import type { EngineFieldItem } from "../../../engine/field";
import type { PLike } from "../../../p/makeP";
import { makeP } from "../../../p/makeP";
import { getCanvasMeta, setCanvasMeta } from "../../../p/canvasMeta";
import type { ShapeRegistry } from "../../../shape-adapter/registry";
import type { RuntimeShapeOptions } from "../../../shape-adapter/types";
import type { GridMetrics } from "../../../../grid-layout/gridMetrics";
import type { FarShapeBitmapCachePolicy } from "../../../../adjustable-rules/render-cache";
import { footprintToPx } from "../../../../modifiers/index";
import { drawItemFromRegistry } from "../../../shape-adapter/draw";
import { pixelSizeForBounds, snapBoundsToDevicePixels, type PixelBounds } from "./pixelBounds";

type ShapeBitmapBounds = PixelBounds;

interface CachedShapeBitmap {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  bitmapP: PLike;
  bounds: ShapeBitmapBounds;
  pixels: number;
}

function finiteNumber(value: number | undefined, fallback: number) {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function rounded(value: number | undefined, precision = 10) {
  return String(Math.round(finiteNumber(value, 0) * precision) / precision);
}

function footprintKey(item: EngineFieldItem) {
  const f = item.footprint;
  return f ? `${String(f.r0)},${String(f.c0)},${String(f.w)},${String(f.h)}` : "none";
}

function rgbKey(rgb: RuntimeShapeOptions["gradientRGB"]) {
  return rgb ? `${String(rgb.r)},${String(rgb.g)},${String(rgb.b)}` : "none";
}

function lightKey(light: RuntimeShapeOptions["lightCtx"]) {
  return light
    ? `${rounded(light.sourceX)},${rounded(light.sourceY)},${rounded(light.sceneDiag)}`
    : "none";
}

function depthTintKey(sharedOptions: RuntimeShapeOptions) {
  const color = sharedOptions.depthTintColor;
  const colorPart = color ? `${String(color.r)},${String(color.g)},${String(color.b)}` : "none";
  return `${colorPart}:${rounded(sharedOptions.depthTintK, 100)}`;
}

function liveAvgKey(liveAvg: number | undefined) {
  return String(Math.round(finiteNumber(liveAvg, 0.5) * 20));
}

function isFarCacheCandidate(item: EngineFieldItem, gridMetrics: GridMetrics | undefined, farSizeK: number) {
  const f = item.footprint;
  if (!f || !gridMetrics || gridMetrics.rowHeights.length === 0) return false;

  const bottomRow = f.r0 + f.h - 1;
  const rowH = gridMetrics.rowHeights[bottomRow] ?? 0;
  const maxRowH = Math.max(...gridMetrics.rowHeights);
  if (rowH <= 0 || maxRowH <= 0) return false;

  return rowH / maxRowH <= farSizeK;
}

function allowsFarShapeBitmapCache(item: EngineFieldItem, policy: FarShapeBitmapCachePolicy) {
  return !policy.alwaysLiveShapes.includes(item.shape);
}

function resolveShapeBounds(item: EngineFieldItem, rEff: number, sharedOptions: RuntimeShapeOptions): ShapeBitmapBounds | null {
  const cell = finiteNumber(sharedOptions.cell, rEff);
  const cellW = finiteNumber(sharedOptions.cellW, cell);
  const cellH = finiteNumber(sharedOptions.cellH, cell);

  const rect = item.footprint
    ? footprintToPx(item.footprint, sharedOptions)
    : { x: item.x - rEff, y: item.y - rEff, w: rEff * 2, h: rEff * 2 };
  if (rect.w <= 0 || rect.h <= 0) return null;

  // The cache is item-sized. Padding catches overhangs, strokes, and anti-aliasing.
  const pad = Math.ceil(Math.max(8, rEff * 0.75, Math.max(cellW, cellH) * 0.8));
  return {
    x: Math.floor(rect.x - pad),
    y: Math.floor(rect.y - pad),
    w: Math.ceil(rect.w + pad * 2),
    h: Math.ceil(rect.h + pad * 2),
  };
}

function shapeBitmapCacheKey(args: {
  item: EngineFieldItem;
  rEff: number;
  sharedOptions: RuntimeShapeOptions;
  bounds: ShapeBitmapBounds;
  dpr: number;
}) {
  const { item, rEff, sharedOptions, bounds, dpr } = args;
  return [
    item.id,
    item.shape,
    footprintKey(item),
    rounded(rEff),
    rounded(sharedOptions.cell),
    rounded(sharedOptions.cellW),
    rounded(sharedOptions.cellH),
    String(sharedOptions.shapeOccurrenceIndex ?? 0),
    liveAvgKey(sharedOptions.liveAvg),
    String(sharedOptions.darkMode ? 1 : 0),
    rounded(sharedOptions.exposure),
    rounded(sharedOptions.contrast),
    rounded(sharedOptions.blend),
    rgbKey(sharedOptions.gradientRGB),
    depthTintKey(sharedOptions),
    lightKey(sharedOptions.lightCtx),
    rounded(bounds.x),
    rounded(bounds.y),
    rounded(bounds.w),
    rounded(bounds.h),
    rounded(dpr, 100),
  ].join("|");
}

function bitmapPixelSize(bounds: ShapeBitmapBounds, dpr: number) {
  return pixelSizeForBounds(bounds, dpr);
}

function maxShapeBitmapCachePixels(p: PLike, policy: FarShapeBitmapCachePolicy) {
  return Math.max(1, Math.floor(p.canvas.width * p.canvas.height * policy.maxPixelsPerCanvasPixel));
}

function createCachedShapeBitmap(bounds: ShapeBitmapBounds, dpr: number): CachedShapeBitmap {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("2D canvas context not available");
  const bitmapP = makeP(canvas, ctx);

  const { pixelW, pixelH, pixels } = bitmapPixelSize(bounds, dpr);
  canvas.width = pixelW;
  canvas.height = pixelH;
  setCanvasMeta(canvas, { dpr, cssW: bounds.w, cssH: bounds.h });

  return { canvas, ctx, bitmapP, bounds, pixels };
}

function touchCacheEntry(cache: Map<string, CachedShapeBitmap>, key: string, entry: CachedShapeBitmap) {
  cache.delete(key);
  cache.set(key, entry);
}

function trimCache(args: {
  cache: Map<string, CachedShapeBitmap>;
  maxPixels: number;
  currentPixels: number;
}) {
  const { cache, maxPixels } = args;
  let currentPixels = args.currentPixels;
  while (currentPixels > maxPixels) {
    const oldest = cache.keys().next().value;
    if (typeof oldest !== "string") return currentPixels;
    const entry = cache.get(oldest);
    currentPixels -= entry?.pixels ?? 0;
    cache.delete(oldest);
  }
  return currentPixels;
}

export function createFarShapeBitmapRenderer(getPolicy: () => FarShapeBitmapCachePolicy) {
  const cache = new Map<string, CachedShapeBitmap>();
  const scratchOptions: RuntimeShapeOptions = {};
  let cachePixels = 0;

  function trimCacheToPolicy(p: PLike, policy: FarShapeBitmapCachePolicy) {
    cachePixels = trimCache({
      cache,
      maxPixels: maxShapeBitmapCachePixels(p, policy),
      currentPixels: cachePixels,
    });
  }

  function bakeShape(args: {
    entry: CachedShapeBitmap;
    shapeRegistry: ShapeRegistry;
    item: EngineFieldItem;
    rEff: number;
    sharedOptions: RuntimeShapeOptions;
    dpr: number;
  }) {
    const { entry, shapeRegistry, item, rEff, sharedOptions, dpr } = args;
    const { canvas, ctx, bitmapP, bounds } = entry;

    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    bitmapP.__tick(sharedOptions.timeMs ?? performance.now());
    Object.assign(scratchOptions, sharedOptions);
    scratchOptions.renderPass = "color";
    scratchOptions.rootAppearK = 1;
    scratchOptions.silhouetteColor = undefined;
    scratchOptions.silhouetteAlpha = undefined;

    bitmapP.push();
    bitmapP.translate(-bounds.x, -bounds.y);
    drawItemFromRegistry(shapeRegistry, bitmapP, item, rEff, scratchOptions);
    bitmapP.pop();
  }

  return function drawFarShapeBitmap(args: {
    p: PLike;
    shapeRegistry: ShapeRegistry;
    item: EngineFieldItem;
    rEff: number;
    sharedOptions: RuntimeShapeOptions;
    gridMetrics?: GridMetrics;
  }): boolean {
    const { p, shapeRegistry, item, rEff, sharedOptions, gridMetrics } = args;
    const policy = getPolicy();
    if (!policy.enabled) return false;
    if ((sharedOptions.rootAppearK ?? 1) < 0.995) return false;
    if (!allowsFarShapeBitmapCache(item, policy)) return false;
    if (!isFarCacheCandidate(item, gridMetrics, policy.farSizeK)) return false;

    const dpr = getCanvasMeta(p.canvas).dpr ?? 1;
    const roughBounds = resolveShapeBounds(item, rEff, sharedOptions);
    if (!roughBounds) return false;
    const bounds = snapBoundsToDevicePixels(roughBounds, dpr);

    trimCacheToPolicy(p, policy);
    const key = shapeBitmapCacheKey({ item, rEff, sharedOptions, bounds, dpr });
    let entry = cache.get(key);

    if (!entry) {
      const bitmapPixels = bitmapPixelSize(bounds, dpr).pixels;
      const maxPixels = maxShapeBitmapCachePixels(p, policy);
      if (bitmapPixels > maxPixels) return false;

      entry = createCachedShapeBitmap(bounds, dpr);
      cachePixels += entry.pixels;
      bakeShape({ entry, shapeRegistry, item, rEff, sharedOptions, dpr });
      cache.set(key, entry);
      cachePixels = trimCache({ cache, maxPixels, currentPixels: cachePixels });
    } else {
      touchCacheEntry(cache, key, entry);
    }

    p.drawingContext.drawImage(entry.canvas, entry.bounds.x, entry.bounds.y, entry.bounds.w, entry.bounds.h);
    return true;
  };
}
