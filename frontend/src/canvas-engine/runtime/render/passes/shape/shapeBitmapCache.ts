import type { EngineFieldItem } from "../../../engine/field";
import type { PLike } from "../../../p/makeP";
import type { ShapeRegistry } from "../../../shape-adapter/registry";
import { copyRuntimeShapeOptionsInto } from "../../../shape-adapter/options";
import type { RuntimeShapeOptions } from "../../../shape-adapter/types";
import type { GridMetrics } from "../../../geometry/gridCache";
import type { FarShapeBitmapCachePolicy } from "../../cache-policy";
import { footprintToPx } from "../../../../modifiers/index";
import { finiteNumber } from "../../../../shared/math";
import {
  shapeIdentity,
  shapeLifecycle,
  shapePass,
  shapeProjection,
  shapeStyle,
} from "../../../../shapes/options";
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

type ShapeBitmapBounds = OffscreenBounds;
type CachedShapeBitmap = OffscreenCacheEntry;

function rounded(value: number | undefined, precision = 10) {
  return String(Math.round(finiteNumber(value, 0) * precision) / precision);
}

function footprintKey(item: EngineFieldItem) {
  const f = item.footprint;
  return f ? `${String(f.r0)},${String(f.c0)},${String(f.w)},${String(f.h)}` : "none";
}

function rgbKey(rgb: NonNullable<RuntimeShapeOptions["style"]>["gradientRGB"]) {
  return rgb ? `${String(rgb.r)},${String(rgb.g)},${String(rgb.b)}` : "none";
}

function lightKey(light: NonNullable<RuntimeShapeOptions["style"]>["lightCtx"]) {
  return light
    ? `${rounded(light.sourceX)},${rounded(light.sourceY)},${rounded(light.sceneDiag)}`
    : "none";
}

function depthTintKey(opts: RuntimeShapeOptions) {
  const pass = shapePass(opts);
  const color = pass.depthTintColor;
  const colorPart = color ? `${String(color.r)},${String(color.g)},${String(color.b)}` : "none";
  return `${colorPart}:${rounded(pass.depthTintK, 100)}`;
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

function resolveShapeBounds(item: EngineFieldItem, rEff: number, opts: RuntimeShapeOptions): ShapeBitmapBounds | null {
  const projection = shapeProjection(opts);
  const cell = finiteNumber(projection.cell, rEff);
  const cellW = finiteNumber(projection.cellW, cell);
  const cellH = finiteNumber(projection.cellH, cell);

  const rect = item.footprint
    ? footprintToPx(item.footprint, projection)
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
  opts: RuntimeShapeOptions;
  bounds: ShapeBitmapBounds;
  dpr: number;
}) {
  const { item, rEff, opts, bounds, dpr } = args;
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
    liveAvgKey(style.liveAvg),
    String(style.darkMode ? 1 : 0),
    rounded(style.exposure),
    rounded(style.contrast),
    rounded(style.blend),
    rgbKey(style.gradientRGB),
    depthTintKey(opts),
    lightKey(style.lightCtx),
    rounded(bounds.x),
    rounded(bounds.y),
    rounded(bounds.w),
    rounded(bounds.h),
    rounded(dpr, 100),
  ].join("|");
}

function shapeBitmapFallbackKey(args: {
  item: EngineFieldItem;
  rEff: number;
  opts: RuntimeShapeOptions;
  bounds: ShapeBitmapBounds;
  dpr: number;
}) {
  const { item, rEff, opts, bounds, dpr } = args;
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
    rounded(style.exposure),
    rounded(style.contrast),
    rounded(style.blend),
    lightKey(style.lightCtx),
    rounded(bounds.x),
    rounded(bounds.y),
    rounded(bounds.w),
    rounded(bounds.h),
    rounded(dpr, 100),
  ].join("|");
}

export function createFarShapeBitmapRenderer(getPolicy: () => FarShapeBitmapCachePolicy) {
  const cache = createOffscreenCache<ShapeBitmapBounds>();
  const fallbackKeys = new Map<string, string>();
  const bakeOpts: RuntimeShapeOptions = {};
  let frameTimeMs = Number.NaN;
  let bakesThisFrame = 0;

  function clearCache() {
    cache.clear();
    fallbackKeys.clear();
  }

  function syncFrameBudget(timeMs: number) {
    if (timeMs === frameTimeMs) return;
    frameTimeMs = timeMs;
    bakesThisFrame = 0;
  }

  function trimCacheToPolicy(p: PLike, policy: FarShapeBitmapCachePolicy) {
    cache.trim(maxCachePixelsForCanvas(p, policy.maxPixelsPerCanvasPixel));
  }

  function bakeShape(args: {
    // Upstream params: cache-miss draw data from drawFarShapeBitmap.
    entry: CachedShapeBitmap;
    shapeRegistry: ShapeRegistry;
    item: EngineFieldItem;
    rEff: number;
    opts: RuntimeShapeOptions;
    dpr: number;
    // End params.
  }) {
    const { entry, shapeRegistry, item, rEff, opts, dpr } = args;
    const { canvas, ctx, p: bitmapP, bounds } = entry;

    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    bitmapP.__tick(shapeLifecycle(opts).timeMs ?? performance.now());
    copyRuntimeShapeOptionsInto(bakeOpts, opts);
    const lifecycle = bakeOpts.lifecycle ?? (bakeOpts.lifecycle = {});
    const particles = bakeOpts.particles ?? (bakeOpts.particles = {});
    const pass = bakeOpts.pass ?? (bakeOpts.pass = {});
    lifecycle.rootAppearK = 1;
    particles.particleStore = undefined;
    pass.renderPass = "color";
    pass.maskColor = undefined;
    pass.maskAlpha = undefined;

    bitmapP.push();
    bitmapP.translate(-bounds.x, -bounds.y);
    drawItemFromRegistry(shapeRegistry, bitmapP, item, rEff, bakeOpts);
    bitmapP.pop();
  }

  const drawFarShapeBitmap = function drawFarShapeBitmap(args: {
    // Upstream params: live item draw request from engine/loop.ts.
    p: PLike;
    shapeRegistry: ShapeRegistry;
    item: EngineFieldItem;
    rEff: number;
    opts: RuntimeShapeOptions;
    gridMetrics?: GridMetrics;
    // End params. Returns true when this cache handled the color pass.
  }): boolean {
    const { p, shapeRegistry, item, rEff, opts, gridMetrics } = args;
    const policy = getPolicy();
    if (!policy.enabled) return false;
    if ((shapeLifecycle(opts).rootAppearK ?? 1) < 0.995) return false;
    if (!allowsFarShapeBitmapCache(item, policy)) return false;
    if (!isFarCacheCandidate(item, gridMetrics, policy.farSizeK)) return false;

    const dpr = canvasDpr(p);
    const target = cache.syncRenderTarget(p, dpr);
    if (target.changed) fallbackKeys.clear();

    syncFrameBudget(shapeLifecycle(opts).timeMs ?? performance.now());

    const roughBounds = resolveShapeBounds(item, rEff, opts);
    if (!roughBounds) return false;
    const bounds = snapBoundsToDevicePixels(roughBounds, dpr);

    trimCacheToPolicy(p, policy);
    const key = shapeBitmapCacheKey({ item, rEff, opts, bounds, dpr });
    const fallbackKey = shapeBitmapFallbackKey({ item, rEff, opts, bounds, dpr });
    let entry = cache.get(key);

    if (!entry) {
      const bitmapPixels = pixelSizeForBounds(bounds, dpr).pixels;
      const maxPixels = maxCachePixelsForCanvas(p, policy.maxPixelsPerCanvasPixel);
      if (bitmapPixels > maxPixels) return false;

      if (bakesThisFrame >= policy.maxBakesPerFrame) {
        const staleKey = fallbackKeys.get(fallbackKey);
        const staleEntry = staleKey ? cache.get(staleKey) : undefined;
        if (staleKey && staleEntry) {
          cache.touch(staleKey, staleEntry);
          p.drawingContext.drawImage(
            staleEntry.canvas,
            staleEntry.bounds.x,
            staleEntry.bounds.y,
            staleEntry.bounds.w,
            staleEntry.bounds.h
          );
          return true;
        }

        if (staleKey) fallbackKeys.delete(fallbackKey);
        return false;
      }

      entry = cache.createEntry(bounds, dpr);
      bakesThisFrame += 1;
      bakeShape({ entry, shapeRegistry, item, rEff, opts, dpr });
      cache.set(key, entry);
      fallbackKeys.set(fallbackKey, key);
      cache.trim(maxPixels);
    } else {
      cache.touch(key, entry);
      fallbackKeys.set(fallbackKey, key);
    }

    p.drawingContext.drawImage(entry.canvas, entry.bounds.x, entry.bounds.y, entry.bounds.w, entry.bounds.h);
    return true;
  };

  return Object.assign(drawFarShapeBitmap, {
    clear: clearCache,
  });
}
