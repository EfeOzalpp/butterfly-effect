// src/canvas-engine/shapes/villa.js
import {
  clamp01,
  val,
  blendRGB,
  clampBrightness,
  clampSaturation,
  oscillateBrightness,
  applyShapeMods,
  footprintToPx,
  sampleDirectionalLightRect,
  paintPixelLightBands,
  paintDirectionalTriangleBands,
  mixRgb,
} from "../modifiers/index";

/* Exposure/contrast helper */
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

// ───────────────── Palette
export const VILLA_BASE_PALETTE = {
  grass: { r: 130, g: 172, b: 116 },

  body: [
    { r: 244, g: 228, b: 206 },
    { r: 216, g: 236, b: 244 },
    { r: 220, g: 236, b: 220 },
    { r: 232, g: 224, b: 226 },
    { r: 214, g: 232, b: 248 },
    { r: 208, g: 226, b: 208 },
    { r: 248, g: 236, b: 194 },
    { r: 236, g: 216, b: 206 },
    { r: 208, g: 216, b: 238 },
  ],

  roof: [
    { r: 190, g: 95,  b: 80 },
    { r: 150, g: 105, b: 92 },
    { r: 130, g: 110, b: 100 },
  ],

  door: [
    { r: 170, g: 120, b: 70 },
    { r: 160, g: 150, b: 95 },
    { r: 180, g: 140, b: 100 },
  ],

  window: {
    lit:  { r: 255, g: 234, b: 148 },
    dark: { r: 120, g: 170, b: 220 },
  },

  platform: { r: 130, g: 134, b: 138 },
};

export const VILLA_DARK_PALETTE = {
  grass: { r: 58, g: 108, b: 114 },
  body: [
    { r: 129, g: 146, b: 172 }, { r: 123, g: 148, b: 182 }, { r: 127, g: 151, b: 178 },
    { r: 130, g: 144, b: 179 }, { r: 125, g: 149, b: 188 }, { r: 120, g: 145, b: 165 },
    { r: 148, g: 130, b: 152 }, // orange-lean, purple undertone (mauve)
    { r: 118, g: 142, b: 158 }, // green-lean, purple undertone (slate-teal)
  ],
  roof: [
    { r: 104, g: 60, b: 61 },
    { r: 82,  g: 66, b: 70 },
    { r: 71,  g: 69, b: 77 },
  ],
  door: [
    { r: 93, g: 76, b: 54 },
    { r: 88, g: 95, b: 73 },
    { r: 99, g: 88, b: 77 },
  ],
  window: {
    lit:  { r: 255, g: 186, b: 62 },
    dark: { r: 66,  g: 107, b: 169 },
  },
  platform: { r: 82, g: 86, b: 88 },
};

// ───────────────── Tunables
const VILLA = {
  body: {
    colorBlend: [0.04, 0.02],
    brightnessRange: [0.40, 0.70],
  },
  grass: {
    colorBlend: [0.12, 0.18],
    satRange: [0.00, 0.14],
  },
  door: {
    widthRange: [1.2, 0.9],
    fixedHeights: [12, 14],
    sideMarginPxK: 0.12,
  },
  roof: {
    triFracFront: [0.20, 0.24],
    triFracSide:  [0.24, 0.36],
    dropSideK: 0.04,
    extendK: 0.35,
  },
  bodyShape: {
    frontHMinK: 1.00, frontHMaxK: 1.20,
    sideHMinK:  0.60, sideHMaxK:  0.85,
  },
  windows: {
    marginY: 6,
    frontVert: [10, 16],
    sideSmall: [8, 10],
    sideYOffsetK: 0.38,
  },
  platform: {
    baseK: 0.25,
    scaleRange: [0.0, 1.0]
  },
  foliage: {
    scaleRange: [0.70, 1.15],
    baseWk: 0.20,
    baseHk: 0.36,
    triHk:  0.65,
    offsetEdgePx: 6,
    jitterPx: 4,
    wind: {
      rotAmp: 0.03,
      rotAmpTopMul: 1.35,
      xShearAmp: 0.06,
      speedRange: [0.6, 0.2],
      phaseJitter: Math.PI * 4,
    },
  }
};

const WINDOW_OSC = {
  amp: [0.035, 0.08],
  speed: [0.18, 0.4],
  brightnessMin: [0.56, 0.74],
  brightnessMax: [0.84, 0.97],
  litCurve: 0.95,
};

// helpers
function fillRgb(p, { r, g, b }, a = 255) { p.fill(r, g, b, a); }
function strokeRgb(p, { r, g, b }, a = 255) { p.stroke(r, g, b, a); }
function darken(rgb, k = 0.72) {
  return { r: Math.round(rgb.r * k), g: Math.round(rgb.g * k), b: Math.round(rgb.b * k) };
}
function iround(x){ return Math.round(x); }

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
function seeded01(key, salt=''){ return rand01(hash32(`${key}|${salt}`)); }
function pick(arr, r) { return arr[Math.floor(r * arr.length) % arr.length]; }

// Trees tint
function treeTintFromGrass(grass, u, gradientRGB, ex = 1, ct = 1) {
  const lightK = 0.26 + 0.18 * u;
  const base = {
    r: Math.min(255, Math.round(grass.r + (255 - grass.r) * lightK)),
    g: Math.min(255, Math.round(grass.g + (255 - grass.g) * lightK)),
    b: Math.min(255, Math.round(grass.b + (255 - grass.b) * lightK)),
  };
  const cool = { r: 210, g: 230, b: 255 };
  const k = 0.08 + 0.10 * u;
  const mixed = {
    r: Math.round(base.r + (cool.r - base.r) * k),
    g: Math.round(base.g + (cool.g - base.g) * k),
    b: Math.round(base.b + (cool.b - base.b) * k),
  };
  const blended = gradientRGB ? blendRGB(mixed, gradientRGB, 0.08 + 0.08 * u) : mixed;
  const clamped = clampBrightness(blended, 0.55, 0.9);
  return applyExposureContrast(clamped, ex, ct);
}

export function drawVilla(p, _cx, _cy, _r, opts = {}) {
  const pal = opts?.palette ?? (opts?.darkMode ? VILLA_DARK_PALETTE : VILLA_BASE_PALETTE);
  const cell = opts?.cell;
  const cellW = opts?.cellW ?? cell;
  const f = opts?.footprint;
  if (!cell || !f) return;

  const ex = typeof opts?.exposure === 'number' ? opts.exposure : 1;
  const ct = typeof opts?.contrast === 'number' ? opts.contrast : 1;
  const t = ((typeof opts?.timeMs === 'number' ? opts.timeMs : p.millis()) / 1000);

  const baseAlpha  = Number.isFinite(opts.alpha) ? opts.alpha : 235;
  const opaque = 255;
  const u = clamp01(opts?.liveAvg ?? 0.5);

  const { x: pxX, y: pxY, w: pxW, h: pxH } = footprintToPx(f, opts);
  const localTileW = pxW / Math.max(1, f.w);
  const localTileH = pxH / Math.max(1, f.h);
  const localTile = Math.min(localTileW, localTileH);

  // Stable per-instance seed (independent of offscreen center)
  const seedKey = (opts.seedKey ?? opts.seed) ?? `villa|${f.r0}:${f.c0}|${f.w}x${f.h}`;

  function pulseLitWindow(base, slotKey) {
    const oscSeed = hash32(`${seedKey}|window-osc|${slotKey}`);
    const brightnessMin = val(WINDOW_OSC.brightnessMin, rand01(oscSeed ^ 0x27d4eb2f));
    const brightnessMax = val(WINDOW_OSC.brightnessMax, rand01(oscSeed ^ 0xbb67ae85));
    const toned = clampBrightness(base, brightnessMin, brightnessMax);
    return oscillateBrightness(toned, t, {
      amp: val(WINDOW_OSC.amp, rand01(oscSeed ^ 0x9e3779b9)),
      speed: val(WINDOW_OSC.speed, rand01(oscSeed ^ 0x85ebca6b)),
      phase: rand01(oscSeed ^ 0xc2b2ae35) * Math.PI * 2,
    });
  }

  // ── bottom-center anchored APPEAR/SCALE envelope
  const anchorX = pxX + pxW / 2;
  const anchorY = pxY + pxH;
  const m = applyShapeMods({
    p,
    x: anchorX,
    y: anchorY,
    r: Math.min(pxW, pxH),
    opts: {
      alpha: baseAlpha,
      timeMs: opts.timeMs,
      liveAvg: opts.liveAvg,
      rootAppearK: opts.rootAppearK,
    },
    mods: {
      appear: {
        scaleFrom: 0.0,
        alphaFrom: 0.0,
        anchor: 'bottom-center',
        ease: 'back',
        backOvershoot: 1.25,
      },
      sizeOsc: { mode: 'none' },
    }
  });
  const drawAlpha = (typeof m.alpha === 'number') ? m.alpha : baseAlpha;

  // draw everything inside the appear/scale transform
  p.push();
  p.translate(m.x, m.y);
  p.scale(m.scaleX, m.scaleY);
  p.translate(-anchorX, -anchorY);

  // platform
  {
    const baseH  = VILLA.platform.baseK * cell;
    const s      = clamp01(val(VILLA.platform.scaleRange, u));
    const h      = Math.max(0, baseH * s);
    const y      = pxY + pxH - h;

    p.push(); p.noStroke();
    const plat = applyExposureContrast(pal.platform, ex, ct);
    fillRgb(p, plat, drawAlpha);
    p.rect(pxX, y, pxW, h, Math.round(localTile * 0.08));
    p.pop();
  }

  // grass (two blocks with seeded tall side)
  const blockCount = Math.max(1, f.w);
  const colW = pxW / blockCount;
  const baseGrassH = Math.max(3, Math.round(localTileH / 3));
  const tallK = 1.55;

  const leftIsTaller = seeded01(seedKey, 'grassSide') < 0.5;

  let grassTint = pal.grass;
  if (opts.gradientRGB) grassTint = blendRGB(grassTint, opts.gradientRGB, val(VILLA.grass.colorBlend, u));
  if (opts?.darkMode) {
    grassTint = clampSaturation(grassTint, VILLA.grass.satRange[0], VILLA.grass.satRange[1], 1);
    grassTint = clampBrightness(grassTint, 0.36, 0.54);
  }
  grassTint = applyExposureContrast(grassTint, ex, ct);

  const rGrass = Math.round(localTile * 0.06);
  p.push(); p.noStroke(); fillRgb(p, grassTint, drawAlpha);

  const grassTopY = [];
  for (let col = 0; col < blockCount; col++) {
    const isLeft = (col === 0);
    const gH = Math.round(baseGrassH * ((isLeft === leftIsTaller) ? tallK : 1));
    const gY = pxY + pxH - gH;
    const gLeft = iround(pxX + col * colW);
    const gRight = iround(pxX + (col + 1) * colW);
    const gX = gLeft;
    const gW = Math.max(1, gRight - gLeft);

    const tl = isLeft ? rGrass : 0;
    const bl = isLeft ? rGrass : 0;
    const tr = isLeft ? 0 : rGrass;
    const br = isLeft ? 0 : rGrass;

    p.rect(gX, gY, gW, gH, tl, tr, br, bl);
    grassTopY[col] = gY;
  }
  p.pop();

  // at most one side-facing
  const sidePresent = seeded01(seedKey, 'whichSidePresent') < 0.5;
  const sideIndex = sidePresent ? (seeded01(seedKey, 'sideIndex') < 0.5 ? 0 : 1) : -1;

  const order = sidePresent ? [sideIndex, 1 - sideIndex] : [0, 1];

  for (const col of order) {
    const isLeftCol = (col === 0);
    const colLeft = iround(pxX + col * colW);
    const colRight = iround(pxX + (col + 1) * colW);
    const x = colLeft;
    const gTop = grassTopY[col];
    const isSide = (col === sideIndex);

    // seeded knobs per column
    const r1 = seeded01(`${seedKey}|col${col}`, 'r1');
    const r2 = seeded01(`${seedKey}|col${col}`, 'r2');
    const rDoorSide = seeded01(`${seedKey}|col${col}`, 'doorSide');
    const rDoor = seeded01(`${seedKey}|col${col}`, 'doorPick');
    const rBush = seeded01(`${seedKey}|col${col}`, 'bush');

    const [hMin, hMax] = isSide
      ? [VILLA.bodyShape.sideHMinK,  VILLA.bodyShape.sideHMaxK]
      : [VILLA.bodyShape.frontHMinK, VILLA.bodyShape.frontHMaxK];
    const hK = hMin + (hMax - hMin) * r1;
    const desiredBodyH = Math.round(colW * hK);

    const roofFrac = isSide ? VILLA.roof.triFracSide : VILLA.roof.triFracFront;
    const roofH = Math.max(3, Math.round(localTileH * val(roofFrac, u)));
    const availH = Math.max(6, gTop - pxY);
    const bodyH = Math.min(desiredBodyH, Math.max(8, availH - roofH));
    const bodyY = gTop - bodyH;

    let bodyTint = blendRGB(
      pal.body[Math.floor(r2 * pal.body.length) % pal.body.length],
      { r: 255, g: 255, b: 255 },
      0 // keep palette as-is, later blend with gradient
    );
    if (opts.gradientRGB) bodyTint = blendRGB(bodyTint, opts.gradientRGB, val(VILLA.body.colorBlend, u));
    bodyTint = clampBrightness(bodyTint, VILLA.body.brightnessRange[0], VILLA.body.brightnessRange[1]);
    bodyTint = applyExposureContrast(bodyTint, ex, ct);

    const ix     = colLeft;
    const iColW  = Math.max(1, colRight - colLeft);
    const iBodyY = iround(bodyY);
    const colLight = sampleDirectionalLightRect(
      { x: ix, y: iBodyY, w: iColW, h: Math.max(1, gTop - iBodyY) },
      opts.lightCtx ?? null
    );
    bodyTint = mixRgb(bodyTint, colLight.lightColor, 0.24 * colLight.overallK);

    const rBody = Math.round(localTile * 0.06);
    const tl = isLeftCol ? rBody : 0;
    const bl = isLeftCol ? rBody : 0;
    const tr = isLeftCol ? 0 : rBody;
    const br = isLeftCol ? 0 : rBody;

    p.push(); p.noStroke();
    fillRgb(p, bodyTint, opaque);
    p.rect(ix, iBodyY, iColW, bodyH, tl, tr, br, bl);
    paintPixelLightBands(
      p,
      { x: ix, y: iBodyY, w: iColW, h: bodyH },
      colLight,
      {
        alpha: opaque,
        highlightColor: mixRgb(bodyTint, colLight.lightColor, 0.52),
        shadowColor: mixRgb(bodyTint, colLight.shadowColor, 0.30),
        corner: rBody,
        sideK: 0.42,
        topK: 0.0,
        shadowK: 0.18,
      }
    );

    // doors/windows + foliage
    const marginY = VILLA.windows.marginY;
    let bushOnLeft = Math.floor(rBush * 2) === 0;

    if (!isSide) {
      // FRONT: door + vertical window
      const cellsH = bodyH / cell;
      const low = 1.5;
      const mid = 1.8;

      let dProfile = 'short';
      if (cellsH >= low) dProfile = 'mid';
      if (cellsH >  mid) dProfile = 'tall';

      const DOOR_PROFILES = {
        short: { W_FRAC: 0.18, H_FRAC: 0.20, Y_OFFSET_FRAC: 0.00 },
        mid:   { W_FRAC: 0.18, H_FRAC: 0.18, Y_OFFSET_FRAC: 0.00 },
        tall:  { W_FRAC: 0.18, H_FRAC: 0.14, Y_OFFSET_FRAC: -0.02 },
      };
      const dCfg = DOOR_PROFILES[dProfile];

      const doorW = Math.max(3, Math.round(iColW * dCfg.W_FRAC));
      const doorH = Math.max(4, Math.round(bodyH * dCfg.H_FRAC));
      const doorOnLeft  = rDoorSide < 0.5;
      const doorMargin  = Math.round(iColW * VILLA.door.sideMarginPxK);
      const doorX       = doorOnLeft ? (ix + doorMargin) : (ix + iColW - doorMargin - doorW);
      const doorY       = iBodyY + bodyH - doorH + Math.round(bodyH * dCfg.Y_OFFSET_FRAC);

      let doorTint = pal.door[Math.floor(rDoor * pal.door.length) % pal.door.length];
      if (opts.gradientRGB) doorTint = blendRGB(doorTint, opts.gradientRGB, val(VILLA.body.colorBlend, u));
      doorTint = applyExposureContrast(doorTint, ex, ct);
      fillRgb(p, doorTint, drawAlpha);
      p.rect(doorX, doorY, doorW, doorH, Math.round(localTile * 0.03));

      let wProfile = 'short';
      if (cellsH >= low) wProfile = 'mid';
      if (cellsH >  mid) wProfile = 'tall';

      const FRONT_WIN = {
        short: { W_FRAC: 0.15, H_FRAC: 0.22, TOP_FRAC: 0.18, BOT_MARGIN: 6 },
        mid:   { W_FRAC: 0.17, H_FRAC: 0.18, TOP_FRAC: 0.15, BOT_MARGIN: 6 },
        tall:  { W_FRAC: 0.15, H_FRAC: 0.14, TOP_FRAC: 0.13, BOT_MARGIN: 6 },
      };
      const fCfg = FRONT_WIN[wProfile];

      const frontLitChance = clamp01(Math.pow(1 - u, WINDOW_OSC.litCurve) * 1.08);
      const frontLit = seeded01(`${seedKey}|col${col}|front-lit`) < frontLitChance;
      const frontBaseColor = frontLit
        ? pulseLitWindow(pal.window.lit, `front|${col}`)
        : pal.window.dark;
      const winColor = applyExposureContrast(frontBaseColor, ex, ct);

      const wW = Math.max(3, Math.round(iColW * fCfg.W_FRAC));
      const wH = Math.max(4, Math.round(bodyH * fCfg.H_FRAC));

      const bandTop = iBodyY + Math.round(bodyH * fCfg.TOP_FRAC);
      const bandBot = Math.max(bandTop + 1, doorY - fCfg.BOT_MARGIN);
      const yCenter = bandTop + (bandBot - bandTop) * 0.40;
      const y = Math.round(yCenter - wH / 2);

      const winX = doorOnLeft ? (ix + iColW - doorMargin - wW) : (ix + doorMargin);

      fillRgb(p, winColor, drawAlpha);
      if (y >= iBodyY + 2 && y + wH <= iBodyY + bodyH - 2) {
        p.rect(winX, y, wW, wH, 2);
      }

      bushOnLeft = !doorOnLeft;

    } else {
      // SIDE: two small windows
      const cellsH = bodyH / cell;
      const low = 1.5;
      const mid = 1.8;

      let sProfile = 'short';
      if (cellsH >= low) sProfile = 'mid';
      if (cellsH >  mid) sProfile = 'tall';

      const SIDE_WIN = {
        short: { W_FRAC: 0.12, H_FRAC: 0.14, Y_OFF_FRAC: VILLA.windows.sideYOffsetK },
        mid:   { W_FRAC: 0.13, H_FRAC: 0.13, Y_OFF_FRAC: VILLA.windows.sideYOffsetK },
        tall:  { W_FRAC: 0.15, H_FRAC: 0.11, Y_OFF_FRAC: VILLA.windows.sideYOffsetK },
      };
      const sCfg = SIDE_WIN[sProfile];

      const sideLitChance = clamp01(Math.pow(1 - u, WINDOW_OSC.litCurve) * 1.18);
      const sideLit0 = seeded01(`${seedKey}|col${col}|side-lit|0`) < sideLitChance;
      const sideLit1 = seeded01(`${seedKey}|col${col}|side-lit|1`) < clamp01(sideLitChance - 0.16);
      const sideBase0 = sideLit0
        ? pulseLitWindow(pal.window.lit, `side|${col}|0`)
        : pal.window.dark;
      const sideBase1 = sideLit1
        ? pulseLitWindow(pal.window.lit, `side|${col}|1`)
        : pal.window.dark;
      const c0 = applyExposureContrast(sideBase0, ex, ct);
      const c1 = applyExposureContrast(sideBase1, ex, ct);

      const wW = Math.max(3, Math.round(iColW * sCfg.W_FRAC));
      const wH = Math.max(3, Math.round(bodyH * sCfg.H_FRAC));

      const yCenter = iBodyY + Math.round(bodyH * sCfg.Y_OFF_FRAC);
      const y = Math.round(yCenter - wH / 2);
      const leftCx  = ix + Math.round(iColW * 0.35);
      const rightCx = ix + Math.round(iColW * 0.65);

      if (y >= iBodyY + 2 && y + wH <= iBodyY + bodyH - 2) {
        fillRgb(p, c0, drawAlpha); p.rect(leftCx  - Math.round(wW / 2), y, wW, wH, 2);
        fillRgb(p, c1, drawAlpha); p.rect(rightCx - Math.round(wW / 2), y, wW, wH, 2);
      }
    }

    // Foliage (front bush)
    if (!isSide) {
      const F = VILLA.foliage;

      const baseW = iColW * F.baseWk;
      const baseH = iColW * F.baseHk;

      const outerInset = F.offsetEdgePx;
      const jitter = (rBush * 2 - 1) * F.jitterPx;

      const edgeX = bushOnLeft ? (ix + outerInset) : (ix + iColW - outerInset);
      const cx    = Math.max(ix + baseW * 0.5, Math.min(ix + iColW - baseW * 0.5, (bushOnLeft ? (edgeX + baseW * 0.5) : (edgeX - baseW * 0.5)) + jitter));
      const cy    = grassTopY[col];

      const s = val(F.scaleRange, u);
      const speed = F.wind.speedRange[0] + (F.wind.speedRange[1]-F.wind.speedRange[0]) * r1;
      const phase = rBush * F.wind.phaseJitter;

      const { x: bx, y: by, scaleX, scaleY, rotation } = applyShapeMods({
        p, x: cx, y: cy, r: baseH, opts,
        mods: {
          scale2D:    { x: s, y: s, anchor: 'bottom-center' },
          scale2DOsc: { mode:'relative', biasX:1, ampX:F.wind.xShearAmp, biasY:1, ampY:0, speed, phaseX:phase, anchor:'bottom-center' },
          rotationOsc:{ amp:F.wind.rotAmp, speed, phase }
        }
      });

      const w = baseW * scaleX;
      const h = baseH * scaleY;

      const bushColor = treeTintFromGrass(grassTint, u, opts.gradientRGB, ex, ct);
      const bushLight = sampleDirectionalLightRect(
        { x: bx - w / 2, y: by - h, w, h },
        opts.lightCtx ?? null
      );
      const bushTint = mixRgb(bushColor, bushLight.lightColor, 0.18 * bushLight.overallK);
      const bushHighlight = mixRgb(bushTint, bushLight.lightColor, 0.34);
      const bushShadow = mixRgb(bushTint, bushLight.shadowColor, 0.24);

      p.push();
      p.translate(bx, by);
      p.rotate(rotation);
      p.noStroke();
      fillRgb(p, bushTint, opaque);
      p.rect(-w / 2, -h, w, h, Math.min(6, h * 0.4));
      paintPixelLightBands(
        p,
        { x: -w / 2, y: -h, w, h },
        bushLight,
        {
          alpha: opaque,
          highlightColor: bushHighlight,
          shadowColor: bushShadow,
          corner: Math.min(6, h * 0.4),
          sideK: 0.40,
          topK: 0.24,
          shadowK: 0.18,
        }
      );
      p.pop();
    }

    // Roofs (unchanged logic)
    if (!isSide) {
      const frontRoofH = Math.max(3, Math.round(localTileH * val(VILLA.roof.triFracFront, u)));
      const ridgeY = iround(Math.max(pxY, bodyY - frontRoofH));
      const apexX = ix + iColW / 2;
      const baseY = iBodyY + 1;

      const strokeCol = applyExposureContrast(darken(bodyTint, 0.72), ex, ct);

      p.noStroke();
      fillRgb(p, bodyTint, opaque);
      p.beginShape();
      p.vertex(ix,         baseY);
      p.vertex(ix + iColW, baseY);
      p.vertex(apexX,      ridgeY);
      p.endShape(p.CLOSE);

      p.strokeWeight(Math.max(1, Math.round(localTile * 0.06)));
      strokeRgb(p, strokeCol, opaque);
      p.noFill();
      p.line(apexX, ridgeY, ix,         baseY);
      p.line(apexX, ridgeY, ix + iColW, baseY);
    } else {
      let roofTint = mixRgb(applyExposureContrast(darken(bodyTint, 0.72), ex, ct), colLight.lightColor, 0.18 * colLight.overallK);
      const roofH = Math.max(3, Math.round(localTileH * val(VILLA.roof.triFracSide, u)));
      const drop = Math.round(roofH * VILLA.roof.dropSideK);
      const topY = iround(Math.max(pxY, bodyY - roofH + drop));

      const extend = Math.round(colW * VILLA.roof.extendK);
      const innerOverlap = Math.max(1, Math.round(localTileW * 0.06));
      let rx, rw;
      if (isLeftCol) { rx = ix;                          rw = iColW + extend + innerOverlap; }
      else           { rx = ix - extend - innerOverlap; rw = iColW + extend + innerOverlap; }

      p.noStroke();
      fillRgb(p, roofTint, drawAlpha);
      p.rect(rx, topY, rw, roofH);
      paintPixelLightBands(
        p,
        { x: rx, y: topY, w: rw, h: roofH },
        colLight,
        {
          alpha: drawAlpha,
          highlightColor: mixRgb(roofTint, colLight.lightColor, 0.44),
          shadowColor: mixRgb(roofTint, colLight.shadowColor, 0.24),
          sideK: 0.28,
          topK: 0.18,
          shadowK: 0.12,
        }
      );

      // Side foliage triangles (unchanged aside from seeded phase above)
      const F = VILLA.foliage;
      const baseCX = isLeftCol ? (x + colW * 0.20) : (x + colW * 0.80);
      const baseCY = grassTopY[col];

      const baseTriH  = Math.max(8, Math.round(localTileH * F.triHk));
      const baseHalfW = Math.max(3, Math.round(localTileW * 0.20));

      const s     = val(F.scaleRange, u);
      const speed = F.wind.speedRange[0] + (F.wind.speedRange[1]-F.wind.speedRange[0]) * r1;
      const phase = rBush * F.wind.phaseJitter;

      const lowRes = applyShapeMods({
        p, x: baseCX, y: baseCY, r: baseTriH, opts,
        mods: {
          scale2D:    { x: s, y: s, anchor: 'bottom-center' },
          scale2DOsc: { mode:'relative', biasX:1, ampX:F.wind.xShearAmp, biasY:1, ampY:0, speed, phaseX:phase, anchor:'bottom-center' },
          rotationOsc:{ amp:F.wind.rotAmp, speed, phase }
        }
      });

      const topRes = applyShapeMods({
        p, x: baseCX, y: baseCY, r: baseTriH, opts,
        mods: {
          scale2D:    { x: s, y: s, anchor: 'bottom-center' },
          scale2DOsc: { mode:'relative', biasX:1, ampX:F.wind.xShearAmp*1.1, biasY:1, ampY:0, speed, phaseX:phase + 0.6, anchor:'bottom-center' },
          rotationOsc:{ amp:F.wind.rotAmp * F.wind.rotAmpTopMul, speed, phase: phase + 0.6 }
        }
      });

      const treeLight = sampleDirectionalLightRect(
        { x: baseCX - baseHalfW, y: baseCY - baseTriH * 1.8, w: baseHalfW * 2, h: baseTriH * 1.8 },
        opts.lightCtx ?? null
      );
      let treeColor = treeTintFromGrass(grassTint, u, opts.gradientRGB, ex, ct);
      treeColor = mixRgb(treeColor, treeLight.lightColor, 0.16 * treeLight.overallK);
      const treeHighlight = mixRgb(treeColor, treeLight.lightColor, 0.32);
      const treeShadow = mixRgb(treeColor, treeLight.shadowColor, 0.22);
      p.noStroke();
      fillRgb(p, treeColor, opaque);

      {
        const triH  = baseTriH  * lowRes.scaleY;
        const halfW = baseHalfW * lowRes.scaleX;

        p.push();
        p.translate(lowRes.x, lowRes.y);
        p.rotate(lowRes.rotation);
        p.beginShape();
        p.vertex(-halfW, 0);
        p.vertex( halfW, 0);
        p.vertex( 0,     -triH);
        p.endShape(p.CLOSE);
        paintDirectionalTriangleBands(
          p,
          {
            leftX: -halfW,
            rightX: halfW,
            baseY: 0,
            apexX: 0,
            apexY: -triH,
          },
          treeLight,
          {
            alpha: opaque,
            highlightColor: treeHighlight,
            shadowColor: treeShadow,
          }
        );
        p.pop();
      }

      {
        const triH  = baseTriH  * topRes.scaleY;
        const halfW = baseHalfW * 0.75 * topRes.scaleX;

        p.push();
        p.translate(topRes.x, topRes.y);
        p.rotate(topRes.rotation);
        const midY  = -(baseTriH * s);
        const baseY = midY + Math.round(triH * 0.40);
        const tipY  = baseY - Math.round(triH * 0.80);
        p.beginShape();
        p.vertex(-halfW, baseY);
        p.vertex( halfW, baseY);
        p.vertex( 0,     tipY);
        p.endShape(p.CLOSE);
        paintDirectionalTriangleBands(
          p,
          {
            leftX: -halfW,
            rightX: halfW,
            baseY,
            apexX: 0,
            apexY: tipY,
          },
          treeLight,
          {
            alpha: opaque,
            highlightColor: treeHighlight,
            shadowColor: treeShadow,
          }
        );
        p.pop();
      }
    }

    p.pop();
  }

  p.pop();
}
