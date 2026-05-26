import {
  BACKGROUNDS,
  type BackgroundAnchorContext,
  type BackgroundSpec,
  type LinearGradientSpec,
  type RadialGradientSpec,
} from "../../../../scene-rules/backgrounds";
import type { SceneLookupKey } from "../../../../scene-state";
import type { PLike } from "../../../p/makeP";
import {
  clearOffscreenEntry,
  createOffscreenCache,
  getOrCreateCanvasLayer,
} from "../../cache/offscreenCache";
import { backgroundAnchorCacheKey, resolveStopK } from "./anchors";
import { resolveStopColor } from "../shared/color";
import { createStarGeometryCache, drawStars } from "../atmosphere/stars";
import { drawLinearStopSurface } from "./surface";

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
  return override ?? BACKGROUNDS[sceneLookup];
}

// Draw the base sky/ground fill and gradient overlays.
// Runtime usually caches this pass and draws animated stars separately.
export function drawBackground(
  p: PLike,
  sceneLookup: SceneLookupKey,
  override: BackgroundSpec | null = null,
  alpha = 1,
  liveAvg = 0.5,
  skipStars = false,
  anchors?: BackgroundAnchorContext,
  getStars?: ReturnType<typeof createStarGeometryCache>
) {
  const spec = resolveBackgroundSpec(sceneLookup, override);
  const ctx = p.drawingContext;

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
      const needsSurfaceStops = overlay.stops.some((stop) =>
        !!stop.rightRgba || stop.blendFromPrevious === false || stop.blendToNext === false
      );
      const drewSurface = needsSurfaceStops
        ? drawLinearStopSurface(p, ctx, overlay, alpha, liveAvg, t, anchors)
        : false;

      if (!drewSurface) {
        const { x1, y1, x2, y2 } = resolveLinearPoints(p, overlay);
        const g = ctx.createLinearGradient(x1, y1, x2, y2);
        for (const stop of overlay.stops) {
          const k = resolveStopK(stop, t, anchors);
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
        g.addColorStop(resolveStopK(stop, p.millis() / 1000, anchors), resolveStopColor(stop.rgba, stop.liveBlend, liveAvg));
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
    // Direct callers can still draw stars here, but the main loop passes a cache.
    const starGeometry = getStars ?? createStarGeometryCache();
    drawStars(p, ctx, spec.stars, liveAvg, starGeometry);
    ctx.restore();
  }
}

// Live star pass. The background cache skips stars because their alpha changes every frame.
export function drawBackgroundStarsOnly(
  p: PLike,
  sceneLookup: SceneLookupKey,
  override: BackgroundSpec | null = null,
  alpha = 1,
  liveAvg = 0.5,
  getStars: ReturnType<typeof createStarGeometryCache>
) {
  const spec = resolveBackgroundSpec(sceneLookup, override);
  if (!spec.stars) return;
  const ctx = p.drawingContext;
  ctx.save();
  ctx.globalAlpha = alpha;
  drawStars(p, ctx, spec.stars, liveAvg, getStars);
  ctx.restore();
}

// Offscreen cache for background base + overlay; stars stay live because they animate.
export function createBgCache() {
  const cache = createOffscreenCache();
  let cacheKey = "";
  let lastOverride: BackgroundSpec | null | undefined = undefined;

  const drawBgCached = function drawBgCached(
    p: PLike,
    sceneLookup: SceneLookupKey,
    override: BackgroundSpec | null,
    liveAvg: number,
    anchors?: BackgroundAnchorContext
  ) {
    const w = p.width;
    const h = p.height;
    const { entry, targetChanged } = getOrCreateCanvasLayer(cache, p);
    if (targetChanged) cacheKey = "";

    const liveAvgQ = Math.round(liveAvg * 100);
    const key = [
      String(w),
      String(h),
      sceneLookup,
      String(liveAvgQ),
      backgroundAnchorCacheKey(anchors),
    ].join("|");

    if (key !== cacheKey || override !== lastOverride) {
      const offCtx = entry.ctx;
      clearOffscreenEntry(entry);
      const fakeP = {
        drawingContext: offCtx,
        width: entry.bounds.w,
        height: entry.bounds.h,
        millis: () => 0,
        background: (color: string) => {
          offCtx.fillStyle = color;
          offCtx.fillRect(0, 0, entry.bounds.w, entry.bounds.h);
        },
      } as unknown as PLike;
      drawBackground(fakeP, sceneLookup, override, 1, liveAvg, true, anchors);
      cacheKey = key;
      lastOverride = override;
    }

    const ctx = p.drawingContext;
    ctx.drawImage(entry.canvas, 0, 0);
  };

  return Object.assign(drawBgCached, {
    clear() {
      cache.clear();
      cacheKey = "";
      lastOverride = undefined;
    },
  });
}
