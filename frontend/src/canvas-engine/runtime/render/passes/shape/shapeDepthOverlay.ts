import type { EngineFieldItem } from "../../../engine/field";
import type { PLike } from "../../../p/makeP";
import { makeP } from "../../../p/makeP";
import { getCanvasMeta, setCanvasMeta } from "../../../p/canvasMeta";
import { shapeRegistrySupportsRenderPass, type ShapeRegistry } from "../../../shape-adapter/registry";
import type { RuntimeShapeOptions } from "../../../shape-adapter/types";
import type { ShapeDepthMaskCachePolicy } from "../../../../adjustable-rules/render-cache";
import type { RGB } from "../../../../modifiers/index";
import { footprintToPx } from "../../../../modifiers/index";
import { clamp01 } from "../../../../shared/math";
import { createDepthMaskDebugTracker } from "../../../debug";
import { drawItemFromRegistry } from "../../../shape-adapter/draw";
import { pixelSizeForBounds, snapBoundsToDevicePixels, type PixelBounds } from "./pixelBounds";

type MaskBounds = PixelBounds;

interface CachedMask {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  maskP: PLike;
  bounds: MaskBounds;
  pixels: number;
}

function finiteNumber(value: number | undefined, fallback: number) {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function resolveMaskBounds(item: EngineFieldItem, rEff: number, sharedOptions: RuntimeShapeOptions): MaskBounds | null {
  const cell = finiteNumber(sharedOptions.cell, rEff);
  const cellW = finiteNumber(sharedOptions.cellW, cell);
  const cellH = finiteNumber(sharedOptions.cellH, cell);

  const rect = item.footprint
    ? footprintToPx(item.footprint, sharedOptions)
    : { x: item.x - rEff, y: item.y - rEff, w: rEff * 2, h: rEff * 2 };
  if (rect.w <= 0 || rect.h <= 0) return null;

  // A little breathing room catches roof overhangs and anti-aliased edges.
  // This is still item-sized, not a full-scene canvas.
  const pad = Math.ceil(Math.max(8, rEff * 0.65, Math.max(cellW, cellH) * 0.7));
  return {
    x: Math.floor(rect.x - pad),
    y: Math.floor(rect.y - pad),
    w: Math.ceil(rect.w + pad * 2),
    h: Math.ceil(rect.h + pad * 2),
  };
}

function rounded(value: number | undefined, precision = 10) {
  return String(Math.round(finiteNumber(value, 0) * precision) / precision);
}

function footprintKey(item: EngineFieldItem) {
  const f = item.footprint;
  return f ? `${String(f.r0)},${String(f.c0)},${String(f.w)},${String(f.h)}` : "none";
}

function colorKey(color: RGB) {
  return `${String(color.r)},${String(color.g)},${String(color.b)}`;
}

function depthOverlayFromOptions(sharedOptions: RuntimeShapeOptions) {
  const color = sharedOptions.depthTintColor;
  const blend = sharedOptions.depthTintK;
  if (!color || typeof blend !== "number" || !Number.isFinite(blend) || blend <= 0) return null;
  return { color, blend: clamp01(blend) };
}

function renderTargetKey(p: PLike, dpr: number) {
  return [
    String(p.canvas.width),
    String(p.canvas.height),
    rounded(p.width),
    rounded(p.height),
    rounded(dpr, 100),
  ].join("|");
}

function maskCacheKey(args: {
  item: EngineFieldItem;
  rEff: number;
  sharedOptions: RuntimeShapeOptions;
  bounds: MaskBounds;
  dpr: number;
  color: RGB;
}) {
  const { item, rEff, sharedOptions, bounds, dpr, color } = args;
  const liveAvgQ = Math.round(clamp01(sharedOptions.liveAvg ?? 0.5) * 20);
  return [
    item.id,
    item.shape,
    footprintKey(item),
    rounded(rEff),
    rounded(sharedOptions.cell),
    rounded(sharedOptions.cellW),
    rounded(sharedOptions.cellH),
    String(sharedOptions.shapeOccurrenceIndex ?? 0),
    String(liveAvgQ),
    String(sharedOptions.darkMode ? 1 : 0),
    rounded(bounds.x),
    rounded(bounds.y),
    rounded(bounds.w),
    rounded(bounds.h),
    rounded(dpr, 100),
    colorKey(color),
  ].join("|");
}

function maskFallbackKey(args: {
  item: EngineFieldItem;
  bounds: MaskBounds;
  dpr: number;
  color: RGB;
}) {
  const { item, bounds, dpr, color } = args;
  return [
    item.id,
    item.shape,
    footprintKey(item),
    rounded(bounds.x),
    rounded(bounds.y),
    rounded(bounds.w),
    rounded(bounds.h),
    rounded(dpr, 100),
    colorKey(color),
  ].join("|");
}

function touchCacheEntry(cache: Map<string, CachedMask>, key: string, entry: CachedMask) {
  cache.delete(key);
  cache.set(key, entry);
}

function trimMaskCache(args: {
  cache: Map<string, CachedMask>;
  maxPixels: number;
  currentPixels: number;
}) {
  const { cache, maxPixels } = args;
  let currentPixels = args.currentPixels;
  let trimmed = 0;
  while (currentPixels > maxPixels) {
    const oldest = cache.keys().next().value;
    if (typeof oldest !== "string") return { trimmed, currentPixels };
    const entry = cache.get(oldest);
    currentPixels -= entry?.pixels ?? 0;
    cache.delete(oldest);
    trimmed += 1;
  }
  return { trimmed, currentPixels };
}

function maskPixelSize(bounds: MaskBounds, dpr: number) {
  return pixelSizeForBounds(bounds, dpr);
}

function maxMaskCachePixels(p: PLike, policy: ShapeDepthMaskCachePolicy) {
  return Math.max(1, Math.floor(p.canvas.width * p.canvas.height * policy.maxPixelsPerCanvasPixel));
}

function createMaskCanvas(bounds: MaskBounds, dpr: number): CachedMask {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("2D canvas context not available");
  const maskP = makeP(canvas, ctx);

  const { pixelW, pixelH, pixels } = maskPixelSize(bounds, dpr);
  canvas.width = pixelW;
  canvas.height = pixelH;
  setCanvasMeta(canvas, { dpr, cssW: bounds.w, cssH: bounds.h });

  return { canvas, ctx, maskP, bounds, pixels };
}

function isAlwaysLiveDepthMask(policy: ShapeDepthMaskCachePolicy, shape: string) {
  return policy.alwaysLiveShapes.includes(shape);
}

export function createShapeDepthOverlayRenderer(getPolicy: () => ShapeDepthMaskCachePolicy) {
  const cache = new Map<string, CachedMask>();
  const fallbackKeys = new Map<string, string>();
  const scratchOptions: RuntimeShapeOptions = {};
  const debug = createDepthMaskDebugTracker();
  let targetKey = "";
  let cachePixels = 0;
  let frameTimeMs = Number.NaN;
  let bakesThisFrame = 0;

  function syncRenderTarget(p: PLike, dpr: number) {
    const nextKey = renderTargetKey(p, dpr);
    if (nextKey !== targetKey) {
      const clearedCount = cache.size;
      cache.clear();
      fallbackKeys.clear();
      cachePixels = 0;
      debug.markCleared(clearedCount);
      targetKey = nextKey;
    }
  }

  function syncFrameBudget(timeMs: number) {
    if (timeMs === frameTimeMs) return;
    frameTimeMs = timeMs;
    bakesThisFrame = 0;
  }

  function trimCacheToPolicy(p: PLike, policy: ShapeDepthMaskCachePolicy) {
    const result = trimMaskCache({
      cache,
      maxPixels: maxMaskCachePixels(p, policy),
      currentPixels: cachePixels,
    });
    cachePixels = result.currentPixels;
    debug.markTrimmed(result.trimmed);
  }

  function bakeMask(args: {
    entry: CachedMask;
    shapeRegistry: ShapeRegistry;
    item: EngineFieldItem;
    rEff: number;
    sharedOptions: RuntimeShapeOptions;
    color: RGB;
    timeMs: number;
    dpr: number;
  }) {
    const { entry, shapeRegistry, item, rEff, sharedOptions, color, timeMs, dpr } = args;
    const { ctx, maskP, bounds, canvas } = entry;

    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    maskP.__tick(timeMs);
    Object.assign(scratchOptions, sharedOptions);
    scratchOptions.renderPass = "silhouette";
    scratchOptions.silhouetteColor = color;
    scratchOptions.silhouetteAlpha = 255;
    scratchOptions.depthTintColor = undefined;
    scratchOptions.depthTintK = undefined;
    scratchOptions.alpha = 255;
    scratchOptions.rootAppearK = 1;

    maskP.push();
    maskP.translate(-bounds.x, -bounds.y);
    drawItemFromRegistry(shapeRegistry, maskP, item, rEff, scratchOptions);
    maskP.pop();

    scratchOptions.renderPass = "color";
    scratchOptions.silhouetteColor = undefined;
    scratchOptions.silhouetteAlpha = undefined;
  }

  return function drawShapeDepthOverlay(args: {
    p: PLike;
    shapeRegistry: ShapeRegistry;
    item: EngineFieldItem;
    rEff: number;
    sharedOptions: RuntimeShapeOptions;
    shapeWasDrawnLive: boolean;
  }) {
    const { p, shapeRegistry, item, rEff, sharedOptions, shapeWasDrawnLive } = args;
    const policy = getPolicy();
    const timeMs = sharedOptions.timeMs ?? performance.now();
    syncFrameBudget(timeMs);

    debug.markCall();
    if (!shapeRegistrySupportsRenderPass(shapeRegistry, item.shape, "silhouette")) {
      debug.markSkippedUnsupported();
      debug.maybeLog(cache.size, cachePixels);
      return;
    }
    if ((sharedOptions.rootAppearK ?? 1) < 0.995) {
      debug.markSkippedAppear();
      debug.maybeLog(cache.size, cachePixels);
      return;
    }

    const overlay = depthOverlayFromOptions(sharedOptions);
    if (!overlay) return;
    if (overlay.blend < policy.minBlend) {
      debug.markSkippedBlend();
      debug.maybeLog(cache.size, cachePixels);
      return;
    }

    const dpr = getCanvasMeta(p.canvas).dpr ?? 1;
    syncRenderTarget(p, dpr);

    const roughBounds = resolveMaskBounds(item, rEff, sharedOptions);
    if (!roughBounds) {
      debug.markSkippedBounds();
      debug.maybeLog(cache.size, cachePixels);
      return;
    }
    const bounds = snapBoundsToDevicePixels(roughBounds, dpr);

    const key = maskCacheKey({ item, rEff, sharedOptions, bounds, dpr, color: overlay.color });
    const fallbackKey = maskFallbackKey({ item, bounds, dpr, color: overlay.color });
    // Keep the mask animation policy matched to the visible shape.
    // If far-shape LOD froze the color pass, the silhouette must freeze too.
    const alwaysLiveMask = shapeWasDrawnLive && isAlwaysLiveDepthMask(policy, item.shape);
    let entry = cache.get(key);

    if (!entry) {
      const maskPixels = maskPixelSize(bounds, dpr).pixels;
      if (maskPixels > maxMaskCachePixels(p, policy)) {
        debug.markSkippedTooLarge();
        debug.maybeLog(cache.size, cachePixels);
        return;
      }
      if (bakesThisFrame >= policy.maxBakesPerFrame) {
        const staleKey = fallbackKeys.get(fallbackKey);
        const staleEntry = staleKey ? cache.get(staleKey) : undefined;
        if (staleEntry) {
          entry = staleEntry;
          debug.markReused();
        } else {
          if (staleKey) fallbackKeys.delete(fallbackKey);
          debug.markSkippedWarmupBudget();
          debug.maybeLog(cache.size, cachePixels);
          return;
        }
      } else {
        entry = createMaskCanvas(bounds, dpr);
        bakesThisFrame += 1;
        cachePixels += entry.pixels;
        debug.markCreated(entry.pixels);
        debug.markBaked();
        bakeMask({
          entry,
          shapeRegistry,
          item,
          rEff,
          sharedOptions,
          color: overlay.color,
          timeMs: sharedOptions.timeMs ?? performance.now(),
          dpr,
        });
        cache.set(key, entry);
        fallbackKeys.set(fallbackKey, key);
        trimCacheToPolicy(p, policy);
      }
    } else {
      debug.markReused();
      if (alwaysLiveMask) {
        debug.markBaked();
        bakeMask({
          entry,
          shapeRegistry,
          item,
          rEff,
          sharedOptions,
          color: overlay.color,
          timeMs: sharedOptions.timeMs ?? performance.now(),
          dpr,
        });
      }
      touchCacheEntry(cache, key, entry);
      fallbackKeys.set(fallbackKey, key);
    }

    const ctx = p.drawingContext;
    ctx.save();
    ctx.globalAlpha = overlay.blend;
    ctx.drawImage(entry.canvas, entry.bounds.x, entry.bounds.y, entry.bounds.w, entry.bounds.h);
    ctx.restore();
    debug.markDrawn();
    debug.maybeLog(cache.size, cachePixels);
  };
}
