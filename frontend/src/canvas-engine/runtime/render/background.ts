// src/canvas-engine/runtime/render/background.ts

import type { PLike } from "../p/makeP";
import { BACKGROUNDS, type BackgroundSpec, type RadialGradientSpec, type LinearGradientSpec } from "../../adjustable-rules/backgrounds";
import type { SceneLookupKey } from "../../adjustable-rules/sceneMode";
import { gradientColor, BRAND_STOPS_VIVID } from "../../modifiers/index";
import { stepAndDrawParticles } from "../../modifiers/particle-systems/particle-1";

type RGB = { r: number; g: number; b: number };
type RGBA = RGB & { a: number };

function clamp01(v: number) {
  return Math.max(0, Math.min(1, v));
}

function mix(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

function easeBlendTaper(t: number) {
  const x = clamp01(t);
  return x * x * x;
}

function mixRgb(base: RGB, tint: RGB, amount: number): RGB {
  const t = clamp01(amount);
  return {
    r: Math.round(mix(base.r, tint.r, t)),
    g: Math.round(mix(base.g, tint.g, t)),
    b: Math.round(mix(base.b, tint.b, t)),
  };
}

function parseCssColor(input: string): RGBA | null {
  const value = input.trim();

  if (value.startsWith("#")) {
    const hex = value.slice(1);
    if (hex.length === 3) {
      return {
        r: parseInt(hex[0] + hex[0], 16),
        g: parseInt(hex[1] + hex[1], 16),
        b: parseInt(hex[2] + hex[2], 16),
        a: 1,
      };
    }
    if (hex.length === 6) {
      return {
        r: parseInt(hex.slice(0, 2), 16),
        g: parseInt(hex.slice(2, 4), 16),
        b: parseInt(hex.slice(4, 6), 16),
        a: 1,
      };
    }
    return null;
  }

  const rgbaMatch = value.match(/^rgba?\(([^)]+)\)$/i);
  if (!rgbaMatch) return null;

  const parts = rgbaMatch[1].split(",").map((part) => part.trim());
  if (parts.length < 3) return null;

  return {
    r: Number(parts[0]),
    g: Number(parts[1]),
    b: Number(parts[2]),
    a: parts[3] == null ? 1 : Number(parts[3]),
  };
}

function resolveStopColor(
  rgba: string,
  liveBlend: number | readonly [number, number] | undefined,
  liveAvg: number
) {
  if (!liveBlend) return rgba;

  const parsed = parseCssColor(rgba);
  if (!parsed) return rgba;

  const blendAmount: number = typeof liveBlend === "number"
    ? liveBlend
    : mix(liveBlend[0], liveBlend[1], easeBlendTaper(liveAvg));
  const tint = gradientColor(BRAND_STOPS_VIVID, liveAvg).rgb;
  const mixed = mixRgb(parsed, tint, blendAmount);
  return `rgba(${mixed.r}, ${mixed.g}, ${mixed.b}, ${parsed.a})`;
}

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

function hash01(seed: number) {
  const x = Math.sin(seed * 127.1) * 43758.5453123;
  return x - Math.floor(x);
}

function drawStars(
  p: PLike,
  ctx: CanvasRenderingContext2D,
  spec: NonNullable<BackgroundSpec["stars"]>,
  liveAvg: number
) {
  const t = p.millis() / 1000;
  const maxY = p.height * spec.topBandK;
  const starCount = Math.max(
    0,
    Math.round(typeof spec.count === "number" ? spec.count : mix(spec.count[0], spec.count[1], clamp01(liveAvg)))
  );

  const alphaRange = resolveStarRange(spec.alpha, liveAvg);
  const flickerRange = resolveStarRange(spec.flickerHz, liveAvg);

  ctx.save();
  for (let i = 0; i < starCount; i += 1) {
    const x = hash01(i + 1.11) * p.width;
    const y = hash01(i + 7.73) * maxY;
    const r = spec.minR + (spec.maxR - spec.minR) * hash01(i + 15.37);
    const hz = flickerRange[0] + (flickerRange[1] - flickerRange[0]) * hash01(i + 23.91);
    const phase = hash01(i + 31.17) * Math.PI * 2;
    const twinkle = 0.5 + 0.5 * Math.sin(t * hz * Math.PI * 2 + phase);
    const alpha = alphaRange[0] + (alphaRange[1] - alphaRange[0]) * twinkle;

    ctx.fillStyle = `rgba(245, 248, 255, ${alpha})`;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

function isRangePair(
  value: [number, number] | readonly [[number, number], [number, number]]
): value is readonly [[number, number], [number, number]] {
  return Array.isArray(value[0]);
}

function resolveStarRange(
  value: [number, number] | readonly [[number, number], [number, number]],
  liveAvg: number
): readonly [number, number] {
  if (!isRangePair(value)) return value;
  return [
    mix(value[0][0], value[1][0], clamp01(liveAvg)),
    mix(value[0][1], value[1][1], clamp01(liveAvg)),
  ] as const;
}

export function drawFogOverlay(
  p: PLike,
  sceneLookup: SceneLookupKey,
  override: BackgroundSpec | null = null,
  alpha: number = 1,
  liveAvg: number = 0.5
) {
  const spec = resolveBackgroundSpec(sceneLookup, override);
  const overlay = spec.overlay;
  if (!overlay || overlay.kind === "solid") return;

  const gradOverlay = overlay as RadialGradientSpec | LinearGradientSpec;
  const hasFog = gradOverlay.stops.some((s) => s.fog);
  if (!hasFog) return;

  const ctx = p.drawingContext as CanvasRenderingContext2D;
  const t = p.millis() / 1000;

  type GradStop = (typeof gradOverlay.stops)[number];
  function fogStopColor(stop: GradStop): string {
    if (!stop.fog) return "rgba(0,0,0,0)";
    const resolved = resolveStopColor(stop.rgba, stop.liveBlend, liveAvg);
    const parsed = parseCssColor(resolved);
    if (!parsed) return "rgba(0,0,0,0)";
    return `rgba(${parsed.r}, ${parsed.g}, ${parsed.b}, ${clamp01(stop.fog.opacity)})`;
  }

  let g: CanvasGradient;

  if (gradOverlay.kind === "linear") {
    const { x1, y1, x2, y2 } = resolveLinearPoints(p, gradOverlay);
    g = ctx.createLinearGradient(x1, y1, x2, y2);
    for (const stop of gradOverlay.stops) {
      const baseK = stop.oscK
        ? clamp01(stop.k + stop.oscK.amp * Math.sin(2 * Math.PI * stop.oscK.hz * t))
        : stop.k;
      const fogK = stop.fog?.k ?? baseK;
      g.addColorStop(fogK, fogStopColor(stop));
    }
  } else {
    const cx = p.width * gradOverlay.center.xK;
    const cy = p.height * gradOverlay.center.yK;
    const inner = Math.min(p.width, p.height) * gradOverlay.innerK;
    const outer = resolveOuterRadius(p, gradOverlay.outer);
    g = ctx.createRadialGradient(cx, cy, inner, cx, cy, outer);
    for (const stop of gradOverlay.stops) {
      const fogK = stop.fog?.k ?? stop.k;
      g.addColorStop(fogK, fogStopColor(stop));
    }
  }

  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, p.width, p.height);
  ctx.restore();

  const dtSec = Math.min(0.1, p.deltaTime / 1000);

  for (let i = 0; i < gradOverlay.stops.length; i++) {
    const stop = gradOverlay.stops[i];
    if (!stop.fog || stop.fog.opacity <= 0) continue;

    const fogK = stop.fog.k ?? stop.k;
    const resolved = resolveStopColor(stop.rgba, stop.liveBlend, liveAvg);
    const parsed = parseCssColor(resolved);
    if (!parsed) continue;

    const bandH = p.height * 0.26;
    const centerY = fogK * p.height;

    stepAndDrawParticles(p, {
      key: `fog-foliage:${sceneLookup}:${i}`,
      rect: { x: 0, y: centerY - bandH * 0.5, w: p.width, h: bandH },
      mode: "dot",
      spawnMode: "stratified",
      respawnStratified: true,
      count: Math.max(1, Math.round(stop.fog.opacity * 48)),
      color: { r: parsed.r, g: parsed.g, b: parsed.b, a: Math.round(stop.fog.opacity * 155) },
      speed: { min: 6, max: 20 },
      angle: { min: -0.28, max: 0.28 },
      accel: { y: 1.8 },
      jitter: { pos: 10, velAngle: 0.45 },
      size: { min: 0.9, max: 2.5 },
      lifetime: { min: 5, max: 13 },
      fadeInFrac: 0.12,
      fadeOutFrac: 0.22,
      edgeFadePx: {
        left: p.width * 0.09,
        right: p.width * 0.09,
        top: bandH * 0.32,
        bottom: bandH * 0.32,
      },
      respawn: true,
    }, dtSec);
  }
}

export function drawBackground(
  p: PLike,
  sceneLookup: SceneLookupKey,
  override: BackgroundSpec | null = null,
  alpha: number = 1,
  liveAvg: number = 0.5
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
      g.addColorStop(k, resolveStopColor(stop.rgba, stop.liveBlend, liveAvg));
    }
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, p.width, p.height);
    ctx.restore();
  } else {
    const cx = p.width * overlay.center.xK;
    const cy = p.height * overlay.center.yK;
    const inner = Math.min(p.width, p.height) * overlay.innerK;
    const outer = resolveOuterRadius(p, overlay.outer);

    const g = ctx.createRadialGradient(cx, cy, inner, cx, cy, outer);
    for (const stop of overlay.stops) {
      g.addColorStop(stop.k, resolveStopColor(stop.rgba, stop.liveBlend, liveAvg));
    }

    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, p.width, p.height);
    ctx.restore();
  }

  if (spec.stars) {
    ctx.save();
    ctx.globalAlpha = alpha;
    drawStars(p, ctx, spec.stars, liveAvg);
    ctx.restore();
  }
}
