import type { EngineFieldItem } from "../../../engine/field";
import type { PLike } from "../../../p/makeP";
import { shapeRegistrySupportsRenderPass, type ShapeRegistry } from "../../../shape-adapter/registry";
import { copyRuntimeShapeOptionsInto } from "../../../shape-adapter/options";
import type { RuntimeShapeOptions } from "../../../shape-adapter/types";
import type { ShapeDepthMaskCachePolicy } from "../../cache-policy";
import type { RGB } from "../../../../shared/math";
import { footprintToPx } from "../../../../modifiers/index";
import { clamp01, finiteNumber } from "../../../../shared/math";
import {
  shapeIdentity,
  shapeLifecycle,
  shapePass,
  shapeProjection,
  shapeStyle,
} from "../../../../shapes/options";
import { createDepthMaskDebugTracker } from "../../../debug";
import { drawItemFromRegistry } from "../../../shape-adapter/draw";
import {
  canvasDpr,
  createOffscreenCache,
  maxCachePixelsForCanvas,
  pixelSizeForBounds,
  snapBoundsToDevicePixels,
  type OffscreenBounds,
  type OffscreenCacheEntry,
} from "../../cache/offscreenCache";

type MaskBounds = OffscreenBounds;
type CachedMask = OffscreenCacheEntry;

function resolveMaskBounds(item: EngineFieldItem, rEff: number, opts: RuntimeShapeOptions): MaskBounds | null {
  const projection = shapeProjection(opts);
  const cell = finiteNumber(projection.cell, rEff);
  const cellW = finiteNumber(projection.cellW, cell);
  const cellH = finiteNumber(projection.cellH, cell);

  const rect = item.footprint
    ? footprintToPx(item.footprint, projection)
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

function depthOverlayFromOptions(opts: RuntimeShapeOptions) {
  const pass = shapePass(opts);
  const color = pass.depthTintColor;
  const blend = pass.depthTintK;
  if (!color || typeof blend !== "number" || !Number.isFinite(blend) || blend <= 0) return null;
  return { color, blend: clamp01(blend) };
}

function maskCacheKey(args: {
  item: EngineFieldItem;
  rEff: number;
  opts: RuntimeShapeOptions;
  bounds: MaskBounds;
  dpr: number;
  color: RGB;
}) {
  const { item, rEff, opts, bounds, dpr, color } = args;
  const projection = shapeProjection(opts);
  const style = shapeStyle(opts);
  const identity = shapeIdentity(opts);
  return [
    item.id,
    item.shape,
    footprintKey(item),
    rounded(rEff),
    rounded(projection.cell),
    rounded(projection.cellW),
    rounded(projection.cellH),
    String(identity.shapeOccurrenceIndex ?? 0),
    String(style.darkMode ? 1 : 0),
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

function isAlwaysLiveDepthMask(policy: ShapeDepthMaskCachePolicy, shape: string) {
  return policy.alwaysLiveShapes.includes(shape);
}

export function createShapeDepthOverlayRenderer(getPolicy: () => ShapeDepthMaskCachePolicy) {
  const cache = createOffscreenCache<MaskBounds>();
  const fallbackKeys = new Map<string, string>();
  const bakeOpts: RuntimeShapeOptions = {};
  const debug = createDepthMaskDebugTracker();
  let frameTimeMs = Number.NaN;
  let bakesThisFrame = 0;

  function clearCache() {
    const clearedCount = cache.clear();
    fallbackKeys.clear();
    debug.markCleared(clearedCount);
  }

  function syncRenderTarget(p: PLike, dpr: number) {
    const result = cache.syncRenderTarget(p, dpr);
    if (result.changed) {
      fallbackKeys.clear();
      debug.markCleared(result.cleared);
    }
  }

  function syncFrameBudget(timeMs: number) {
    if (timeMs === frameTimeMs) return;
    frameTimeMs = timeMs;
    bakesThisFrame = 0;
  }

  function trimCacheToPolicy(p: PLike, policy: ShapeDepthMaskCachePolicy) {
    const trimmed = cache.trim(maxCachePixelsForCanvas(p, policy.maxPixelsPerCanvasPixel));
    debug.markTrimmed(trimmed);
  }

  function bakeMask(args: {
    // Upstream params: cache-miss draw data from drawShapeDepthOverlay.
    entry: CachedMask;
    shapeRegistry: ShapeRegistry;
    item: EngineFieldItem;
    rEff: number;
    opts: RuntimeShapeOptions;
    color: RGB;
    timeMs: number;
    dpr: number;
    // End params.
  }) {
    const { entry, shapeRegistry, item, rEff, opts, color, timeMs, dpr } = args;
    const { ctx, p: maskP, bounds, canvas } = entry;

    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    maskP.__tick(timeMs);
    copyRuntimeShapeOptionsInto(bakeOpts, opts);
    const style = bakeOpts.style ?? (bakeOpts.style = {});
    const lifecycle = bakeOpts.lifecycle ?? (bakeOpts.lifecycle = {});
    const particles = bakeOpts.particles ?? (bakeOpts.particles = {});
    const pass = bakeOpts.pass ?? (bakeOpts.pass = {});
    style.alpha = 255;
    lifecycle.rootAppearK = 1;
    particles.particleStore = undefined;
    pass.renderPass = "depthMask";
    pass.maskColor = color;
    pass.maskAlpha = 255;
    pass.depthTintColor = undefined;
    pass.depthTintK = undefined;

    maskP.push();
    maskP.translate(-bounds.x, -bounds.y);
    drawItemFromRegistry(shapeRegistry, maskP, item, rEff, bakeOpts);
    maskP.pop();

    pass.renderPass = "color";
    pass.maskColor = undefined;
    pass.maskAlpha = undefined;
  }

  const drawShapeDepthOverlay = function drawShapeDepthOverlay(args: {
    // Upstream params: item draw result from engine/loop.ts after the color pass.
    p: PLike;
    shapeRegistry: ShapeRegistry;
    item: EngineFieldItem;
    rEff: number;
    opts: RuntimeShapeOptions;
    shapeWasDrawnLive: boolean;
    // End params.
  }) {
    const { p, shapeRegistry, item, rEff, opts, shapeWasDrawnLive } = args;
    const policy = getPolicy();
    const timeMs = shapeLifecycle(opts).timeMs ?? performance.now();
    syncFrameBudget(timeMs);

    debug.markCall();
    if (!shapeRegistrySupportsRenderPass(shapeRegistry, item.shape, "depthMask")) {
      debug.markSkippedUnsupported();
      debug.maybeLog(cache.size, cache.pixels);
      return;
    }
    if ((shapeLifecycle(opts).rootAppearK ?? 1) < 0.995) {
      debug.markSkippedAppear();
      debug.maybeLog(cache.size, cache.pixels);
      return;
    }

    const overlay = depthOverlayFromOptions(opts);
    if (!overlay) return;
    if (overlay.blend < policy.minBlend) {
      debug.markSkippedBlend();
      debug.maybeLog(cache.size, cache.pixels);
      return;
    }

    const dpr = canvasDpr(p);
    syncRenderTarget(p, dpr);

    const roughBounds = resolveMaskBounds(item, rEff, opts);
    if (!roughBounds) {
      debug.markSkippedBounds();
      debug.maybeLog(cache.size, cache.pixels);
      return;
    }
    const bounds = snapBoundsToDevicePixels(roughBounds, dpr);

    const key = maskCacheKey({ item, rEff, opts, bounds, dpr, color: overlay.color });
    const fallbackKey = maskFallbackKey({ item, bounds, dpr, color: overlay.color });
    // Keep the mask animation policy matched to the visible shape.
    // If far-shape LOD froze the color pass, the depth mask must freeze too.
    const alwaysLiveMask = shapeWasDrawnLive && isAlwaysLiveDepthMask(policy, item.shape);
    let entry = cache.get(key);

    if (!entry) {
      const maskPixels = pixelSizeForBounds(bounds, dpr).pixels;
      if (maskPixels > maxCachePixelsForCanvas(p, policy.maxPixelsPerCanvasPixel)) {
        debug.markSkippedTooLarge();
        debug.maybeLog(cache.size, cache.pixels);
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
          debug.maybeLog(cache.size, cache.pixels);
          return;
        }
      } else {
        entry = cache.createEntry(bounds, dpr);
        bakesThisFrame += 1;
        debug.markCreated(entry.pixels);
        debug.markBaked();
        bakeMask({
          entry,
          shapeRegistry,
          item,
          rEff,
          opts,
          color: overlay.color,
          timeMs: shapeLifecycle(opts).timeMs ?? performance.now(),
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
          opts,
          color: overlay.color,
          timeMs: shapeLifecycle(opts).timeMs ?? performance.now(),
          dpr,
        });
      }
      cache.touch(key, entry);
      fallbackKeys.set(fallbackKey, key);
    }

    const ctx = p.drawingContext;
    ctx.save();
    ctx.globalAlpha = overlay.blend;
    ctx.drawImage(entry.canvas, entry.bounds.x, entry.bounds.y, entry.bounds.w, entry.bounds.h);
    ctx.restore();
    debug.markDrawn();
    debug.maybeLog(cache.size, cache.pixels);
  };

  return Object.assign(drawShapeDepthOverlay, {
    clear: clearCache,
  });
}
