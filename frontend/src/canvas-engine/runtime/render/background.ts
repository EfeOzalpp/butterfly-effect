// src/canvas-engine/runtime/render/background.ts

import type { PLike } from "../p/makeP";
import { BACKGROUNDS, type BackgroundSpec, type RadialGradientSpec } from "../../adjustable-rules/backgrounds";
import type { SceneLookupKey } from "../../adjustable-rules/sceneMode";

function resolveOuterRadius(p: PLike, outer: RadialGradientSpec["outer"]) {
  if (outer === "diag") return Math.hypot(p.width, p.height);
  return Math.max(1, outer.k) * Math.max(p.width, p.height);
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
  override: BackgroundSpec | null = null
) {
  const spec = resolveBackgroundSpec(sceneLookup, override);
  p.background(spec.base);

  const overlay = spec.overlay;
  if (!overlay) return;

  const ctx = p.drawingContext;

  if (overlay.kind === "solid") {
    ctx.fillStyle = overlay.color;
    ctx.fillRect(0, 0, p.width, p.height);
    return;
  }

  const cx = p.width * overlay.center.xK;
  const cy = p.height * overlay.center.yK;
  const inner = Math.min(p.width, p.height) * overlay.innerK;
  const outer = resolveOuterRadius(p, overlay.outer);

  const g = ctx.createRadialGradient(cx, cy, inner, cx, cy, outer);
  for (const stop of overlay.stops) g.addColorStop(stop.k, stop.rgba);

  ctx.fillStyle = g;
  ctx.fillRect(0, 0, p.width, p.height);
}
