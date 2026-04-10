// src/canvas-engine/shape/bus.js
import {
  applyShapeMods,
  blendRGB,
  clampBrightness,
  clampSaturation,
  clamp01,
  val,
  footprintToPx,
  sampleDirectionalLightRect,
  mixRgb,
  paintPixelLightBands,
} from "../modifiers/index";

// reuse fit helpers from car.js so behavior matches car exactly
import {
  fitScaleToRectWidth,
  beginFitScale,
  endFitScale,
} from './car';

export const BUS_BASE_PALETTE = {
  grass: [
    { r: 110, g: 160, b: 90 },
    { r: 130, g: 180, b: 110 },
    { r: 100, g: 150, b: 85 },
  ],
  asphalt: { r: 125, g: 125, b: 125 },
  body: [
    { r: 220, g: 136, b: 86  }, // muted transit orange
    { r: 232, g: 160, b: 102 }, // soft amber
    { r: 204, g: 118, b: 86  }, // dusty red-orange
    { r: 224, g: 196, b: 118 }, // pale route yellow
    { r: 92,  g: 158, b: 154 }, // softened teal
    { r: 132, g: 158, b: 204 }, // lighter blue
    { r: 180, g: 92,  b: 96  }, // muted red
    { r: 198, g: 138, b: 154 }, // dusty rose
    { r: 162, g: 182, b: 114 }, // muted lime
    { r: 154, g: 138, b: 204 }, // softened violet-blue
    { r: 118, g: 172, b: 184 }, // pale aqua
  ],
  window: { r: 180, g: 210, b: 235 },
  wheel:  { r: 40,  g: 40,  b: 40  },
};

export const BUS_DARK_PALETTE = {
  grass: [
    { r: 52, g: 96,  b: 104 },
    { r: 58, g: 108, b: 114 },
    { r: 48, g: 90,  b: 102 },
  ],
  asphalt: { r: 68, g: 79, b: 96 },
  body: [
    { r: 188, g: 98,  b: 68  }, // softened orange-red
    { r: 170, g: 92,  b: 66  }, // softened red
    { r: 188, g: 124, b: 88  }, // softened amber
    { r: 64,  g: 128, b: 140 }, // softened teal
    { r: 76,  g: 94,  b: 152 }, // softened navy
    { r: 132, g: 132, b: 78  }, // softened olive
    { r: 158, g: 74,  b: 102 }, // softened crimson
    { r: 144, g: 102, b: 126 }, // muted mauve
    { r: 116, g: 138, b: 96  }, // muted moss
    { r: 108, g: 118, b: 176 }, // softened indigo
    { r: 78,  g: 138, b: 150 }, // cool cyan-teal
  ],
  window: { r: 125, g: 135, b: 200 },
  wheel:  { r: 45, g: 48,  b: 58   },
};

const BUS = {
  grass:   { colorBlend: [0.16, 0.30] },
  body:    { colorBlend: [0.06, 0.03] },
  asphalt: { min: [0.25, 0.32], max: [0.52, 0.65] },
};

// utils
function fillRgb(p, { r, g, b }, a = 255) { p.fill(r, g, b, a); }
function pick(arr, r) { return arr[Math.floor(r * arr.length) % arr.length]; }
function hash32(s) {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
  h ^= h >>> 16; h = Math.imul(h, 0x85ebca6b);
  h ^= h >>> 13; h = Math.imul(h, 0xc2b2ae35);
  h ^= h >>> 16;
  return h >>> 0;
}
function rand01(seed) {
  let t = seed + 0x6D2B79F5;
  t = Math.imul(t ^ (t >>> 15), 1 | t);
  t ^= t + Math.imul(t ^ (t >>> 7), 61 | t);
  return (((t ^ (t >>> 14)) >>> 0) / 4294967296);
}
function seeded01(key, salt = '') {
  return rand01(hash32(`${key}|${salt}`));
}
function pickByOccurrence(arr, occurrence = 0, offset = 0) {
  return arr[(Math.max(0, occurrence) + offset) % arr.length];
}
function applyExposureContrast(rgb, exposure = 1, contrast = 1) {
  const e = Math.max(0.1, Math.min(3, exposure));
  const k = Math.max(0.5, Math.min(2, contrast));
  const adj = (v) => {
    let x = (v / 255) * e;
    x = (x - 0.5) * k + 0.5;
    return Math.max(0, Math.min(1, x)) * 255;
  };
  return { r: Math.round(adj(rgb.r)), g: Math.round(adj(rgb.g)), b: Math.round(adj(rgb.b)) };
}

/**
 * Draws a bus that scales like car.js on small/mobile tiles.
 * Variety is driven by opts.seedKey (or tile footprint) so caching won't collapse colors.
 */
export function drawBus(p, cx, cy, r, opts = {}) {
  const pal = opts?.palette ?? (opts?.darkMode ? BUS_DARK_PALETTE : BUS_BASE_PALETTE);
  const ex = typeof opts?.exposure === 'number' ? opts.exposure : 1;
  const ct = typeof opts?.contrast === 'number' ? opts.contrast : 1;
  const alpha = Number.isFinite(opts.alpha) ? opts.alpha : 235; // used for ground/wheels
  const u = clamp01(opts?.liveAvg ?? 0.5);

  // ---- Tile rect
  const cell = opts?.cell;
  const cellW = opts?.cellW ?? cell;
  const cellH = opts?.cellH ?? cell;
  const f    = opts?.footprint;
  let tileX, tileY, tileW, tileH, tileCx;

  if (cell && f) {
    ({ x: tileX, y: tileY, w: tileW, h: tileH } = footprintToPx(f, opts));
    tileCx = tileX + tileW / 2;
  } else {
    tileW = r * 6.4; tileH = r * 3.0; tileX = cx - tileW / 2; tileY = cy - tileH / 2;
    tileCx = cx;
  }

  // ---- Stable per-instance seed (independent of offscreen center/radius)
  const seedKey =
    (opts.seedKey ?? opts.seed)
    ?? (cell && f ? `bus|${f.r0}:${f.c0}|${f.w}x${f.h}` : `bus|${Math.round(cx)}|${Math.round(cy)}|${Math.round(r)}`);
  const occurrenceIndex = Number.isFinite(opts?.shapeOccurrenceIndex) ? opts.shapeOccurrenceIndex : 0;

  const r1 = seeded01(seedKey, 'a');
  const r2 = seeded01(seedKey, 'b');

  // ---- Appear anchored to bottom-center of the TILE (not cx)
  const baseY = tileY + tileH;
  const m = applyShapeMods({
    p, x: tileCx, y: baseY, r,
    opts: { alpha, timeMs: opts.timeMs, liveAvg: opts.liveAvg, rootAppearK: opts.rootAppearK },
    mods: {
      appear: { scaleFrom: 0.0, alphaFrom: 0.0, anchor: 'bottom-center', ease: 'back', backOvershoot: 1.25 },
      sizeOsc: { mode: 'none' },
    },
  });

  p.push();
  p.translate(m.x, m.y);
  p.scale(m.scaleX, m.scaleY);
  p.translate(-tileCx, -baseY);

  // ---- Ground (unscaled inside appear group)
  const grassH = tileH * 0.50;
  const grassY = tileY + tileH - grassH;
  const aspH   = grassH * 0.38;
  const aspY   = grassY + (grassH - aspH) / 2;

  // Grass tint (with gradient) — seeded variety
  const g1 = pick(pal.grass, r1);
  const g2 = pick(pal.grass, r2);
  let grassTint = blendRGB(g1, g2, 0.4 + 0.3 * u);
  if (opts.gradientRGB) grassTint = blendRGB(grassTint, opts.gradientRGB, val(BUS.grass.colorBlend, u));
  if (opts?.darkMode) {
    grassTint = clampSaturation(grassTint, 0.0, 0.22, 1);
    grassTint = clampBrightness(grassTint, 0.30, 0.48);
  }
  grassTint = applyExposureContrast(grassTint, ex, ct);

  p.noStroke();
  fillRgb(p, grassTint, alpha);
  p.rect(tileX, grassY, tileW, grassH, r * 0.18);

  // Asphalt
  let aspColor = applyExposureContrast(pal.asphalt, ex, ct);
  aspColor = clampBrightness(aspColor, val(BUS.asphalt.min, u), val(BUS.asphalt.max, u));
  fillRgb(p, aspColor, alpha);
  p.rect(tileX, aspY, tileW, aspH, r * 0.14);

  // ---- Wheel baseline from road
  const wheelY = aspY + aspH * 0.25;

  // ---- Fit the bus asset to tile width (like car.js)
  const designW = r * 6.4;
  const sidePad = Math.max(2, tileW * 0.08);
  const s = fitScaleToRectWidth(designW, tileW, sidePad, { allowUpscale: !!opts.allowUpscale });

  // Body/window colors — seeded body pick
  const bodyOffset = hash32(`${seedKey}|body-offset`) % pal.body.length;
  let bodyTint = pickByOccurrence(pal.body, occurrenceIndex, bodyOffset);
  if (opts.gradientRGB) bodyTint = blendRGB(bodyTint, opts.gradientRGB, val(BUS.body.colorBlend, u));
  if (opts?.darkMode) bodyTint = clampBrightness(bodyTint, 0.36, 0.66);
  bodyTint = applyExposureContrast(bodyTint, ex, ct);
  const winTint = applyExposureContrast(pal.window, ex, ct);

  // ---- Draw bus under width-fit transform
  beginFitScale(p, { cx: tileCx, anchorY: wheelY, scale: s });
  {
    const w = designW;
    const bodyH = r * 2.0;
    const busX  = tileCx - w / 2;
    const bodyY = wheelY - bodyH * 1.00;
    const bodyLight = sampleDirectionalLightRect(
      { x: busX, y: bodyY, w, h: bodyH },
      opts.lightCtx ?? null
    );
    const litBodyTint = mixRgb(bodyTint, bodyLight.lightColor, 0.26 * bodyLight.overallK);
    const busHighlight = mixRgb(litBodyTint, bodyLight.lightColor, 0.46);
    const busShadow = mixRgb(litBodyTint, bodyLight.shadowColor, 0.28);

    // Wheels (two rear, one front)
    const wheelD = Math.max(3, r * 0.85);
    fillRgb(p, pal.wheel, 255);
    p.circle(busX + w * 0.22, wheelY, wheelD);
    p.circle(busX + w * 0.38, wheelY, wheelD);
    p.circle(busX + w * 0.78, wheelY, wheelD);

    // Body
    fillRgb(p, litBodyTint, 255);
    p.rect(busX, bodyY, w, bodyH, r * 0.22);
    paintPixelLightBands(p, { x: busX, y: bodyY, w, h: bodyH }, bodyLight, {
      alpha: 255,
      highlightColor: busHighlight,
      shadowColor: busShadow,
      corner: Math.round(r * 0.22),
      sideK: 0.40,
      topK: 0.24,
      shadowK: 0.16,
    });

    // Windows
    fillRgb(p, winTint, 255);
    const smallCount = 4;
    const gap        = w * 0.02;
    const frontW     = Math.max(w * 0.20, r * 2.4);
    const winH       = bodyH * 0.42;
    const winY       = bodyY + bodyH * 0.20;

    const usableForSmall = w - frontW - gap * (smallCount + 2);
    const smallW = Math.max(6, usableForSmall / smallCount);

    let wx = busX + gap;
    for (let i = 0; i < smallCount; i++) {
      p.rect(wx, winY, smallW, winH, r * 0.08);
      wx += smallW + gap;
    }

    const frontX = busX + w - frontW;
    const frontY = winY - Math.max(0, r * 0.02);
    p.rect(frontX, frontY, frontW, winH, r * 0.10, r * 0.30, 0, r * 0.08);
  }
  endFitScale(p);

  p.pop();
}

export default drawBus;
