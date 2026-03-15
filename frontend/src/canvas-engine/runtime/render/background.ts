// src/canvas-engine/runtime/render/background.ts

import type { PLike } from "../p/makeP";
import { BACKGROUNDS, type BackgroundSpec, type RadialGradientSpec, type LinearGradientSpec } from "../../adjustable-rules/backgrounds";
import type { SceneLookupKey } from "../../adjustable-rules/sceneMode";

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

export function drawBackground(
  p: PLike,
  sceneLookup: SceneLookupKey,
  override: BackgroundSpec | null = null,
  alpha: number = 1
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
  if (!overlay) return;

  if (overlay.kind === "solid") {
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.fillStyle = overlay.color;
    ctx.fillRect(0, 0, p.width, p.height);
    ctx.restore();
    return;
  }

  if (overlay.kind === "linear") {
    const { x1, y1, x2, y2 } = resolveLinearPoints(p, overlay);
    const g = ctx.createLinearGradient(x1, y1, x2, y2);
    const t = p.millis() / 1000;
    for (const stop of overlay.stops) {
      const k = stop.oscK
        ? Math.max(0, Math.min(1, stop.k + stop.oscK.amp * Math.sin(2 * Math.PI * stop.oscK.hz * t)))
        : stop.k;
      g.addColorStop(k, stop.rgba);
    }
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, p.width, p.height);
    ctx.restore();
    return;
  }

  const cx = p.width * overlay.center.xK;
  const cy = p.height * overlay.center.yK;
  const inner = Math.min(p.width, p.height) * overlay.innerK;
  const outer = resolveOuterRadius(p, overlay.outer);

  const g = ctx.createRadialGradient(cx, cy, inner, cx, cy, outer);
  for (const stop of overlay.stops) g.addColorStop(stop.k, stop.rgba);

  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, p.width, p.height);
  ctx.restore();
}
