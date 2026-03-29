// src/canvas-engine/shapes/clouds.js
import {
  oscillateSaturation,
  rgbToHsl,
  hslToRgb,
  cssToRgbViaCanvas,
  makeArchLobes,
  displacementOsc,
  blendRGB,
  stepAndDrawParticles,
  particleBucketRange,
  particleRowBucket,
  clamp01,
  val,
  applyShapeMods,
  footprintToPx,
  rowHeightAt,
  rowWidthAt,
  sampleDirectionalLightRect,
  mixRgb,
} from "../modifiers/index";

/* ───────────────── Palettes ───────────────── */
export const CLOUDS_BASE_PALETTE = {
  default: { r: 236, g: 238, b: 242 },
  rain:    { r: 20,  g: 165, b: 255 },
};

export const CLOUDS_DARK_PALETTE = {
  default: { r: 139, g: 140, b: 185 },
  rain:    { r: 11,  g: 104, b: 195 },
};

export const CLOUDS_WARM_PALETTE = {
  default: { r: 248, g: 238, b: 226 },
  rain:    { r: 30,  g: 158, b: 228 },
};

export const CLOUDS_COOL_PALETTE = {
  default: { r: 228, g: 236, b: 248 },
  rain:    { r: 15,  g: 148, b: 238 },
};

const CLOUD_BASE = CLOUDS_BASE_PALETTE.default;

/* ───────────────── Defaults (tweakable) ───────────────── */
const RAIN = {
  enabled: true,
  spawnX0: 0.12, spawnX1: 0.88,
  spawnY0: 0.22, spawnY1: 0.0,

  angleMin: Math.PI * 0.48,
  angleMax: Math.PI * 0.52,
  speedMin: [260, 140],
  speedMax: [300, 160],
  gravity: 0,
  accelX: 0,
  accelY: 0,

  jitterPos: [3, 0],
  jitterAngle: [0.36, 0],

  count: [24, 18],
  sizeMin: [2, 2.1],
  sizeMax: [2.1, 2.3],
  lengthMin: [3, 8],
  lengthMax: [5, 11],

  lifeMin: 4,
  lifeMax: 5,
  fadeInFrac: 0.15,
  fadeOutFrac: 0.25,

  fadeLeft: 12,
  fadeRight: 12,
  fadeTop: 8,
  fadeBottom: 32,

  alpha: [100, 220],
  blend: [0.02, 0.1],
};

// lerp-able cloud tuning
const CLOUDS = {
  widthEnv:   [0.72, 0.86],
  heightEnv:  [0.24, 0.88],
  spreadX:    [0.72, 0.82],
  arcLift:    [0.12, 0.38],
  rBaseK:     [0.36, 0.46],
  rJitter:    [0.08, 0.14],
  lobeCount:  [6, 9],

  sCap:       [0.14, 0.24],
  oscAmp:     [0.2, 0.12],
  oscSpeed:   [0.32, 0.26],

  wobbleAmp:  [1.4, 1.0],
  blend:      [0.4, 0.08],
};

const WOBBLE = { ampScale: [0.8, 0.95] };

function cloudRowContext(t) {
  return {
    width: particleBucketRange(t, 1.18, 1.0),
    height: particleBucketRange(t, 1.38, 1.0),
    overlap: particleBucketRange(t, 0.58, 1.0),
    radius: particleBucketRange(t, 1.38, 1.0),
    lobeCount: particleBucketRange(t, 0.48, 1.0),
    arcLift: particleBucketRange(t, 0.72, 1.0),
    radiusFromWidth: particleBucketRange(t, 1.95, 2.35),
    wobbleAmp: particleBucketRange(t, 0.12, 1.0),
    wobbleHz: particleBucketRange(t, 0.15, 1.0),
  };
}

/* ───────────────── Draw ───────────────── */
export function drawClouds(p, _cx, _cy, _r, opts) {
  const pal = opts?.palette ?? (opts?.darkMode ? CLOUDS_DARK_PALETTE
    : opts?.paletteTheme === 'warm' ? CLOUDS_WARM_PALETTE
    : opts?.paletteTheme === 'cool' ? CLOUDS_COOL_PALETTE
    : CLOUDS_BASE_PALETTE);
  const cell = opts?.cell;
  const cellW = opts?.cellW ?? cell;
  const cellH = opts?.cellH ?? cell;
  const f = opts?.footprint;
  if (!cell || !f) return;

  const t = ((typeof opts?.timeMs === 'number' ? opts.timeMs : p.millis()) / 1000);
  const seed = (opts?.seed ?? 0) | 0;
  const u = clamp01(opts?.liveAvg ?? 0.5);

  const ex = typeof opts?.exposure === 'number' ? opts.exposure : 1;
  const ct = typeof opts?.contrast === 'number' ? opts.contrast : 1;

  // Prefer the explicit dt from painter; fall back to p.deltaTime.
  const dt = Math.max(
    0.001,
    Number.isFinite(opts?.dtSec) ? opts.dtSec : ((p.deltaTime || 16) / 1000)
  );
  const drawRain = opts?.drawRain !== false;
  const drawCloudBody = opts?.drawCloudBody !== false;

  // ── Texture-pixel scaling for sprite textures ────────────────────────────
  const rowBucket = particleRowBucket(f, opts);
  const rainRowBucket = particleRowBucket({ ...f, h: 1 }, opts);
  const cloudRow = cloudRowContext(rowBucket.t);
  const pixelScale = Number.isFinite(opts?.particlePixelScale) ? Math.max(0.25, opts.particlePixelScale) : 1;
  const PARTICLE_SIZE_SCALE = particleBucketRange(rainRowBucket.t, 0.50, 1.0) * pixelScale;
  const PARTICLE_MOTION_SCALE = particleBucketRange(rainRowBucket.t, 0.02, 1.0) * pixelScale;
  const PARTICLE_LIFE_SCALE = particleBucketRange(rainRowBucket.t, 1.28, 1.0);
  const PARTICLE_COUNT_SCALE = particleBucketRange(rainRowBucket.t, 0.72, 1.0);

  /* ── Layout base ── */
  const topCellW = rowWidthAt(f.r0, opts);
  const { x: fpX, y: y0, w: fpW } = footprintToPx(f, opts);
  const wTop = f.w * topCellW;
  const anchorX = fpX + fpW / 2;
  const x0 = anchorX - wTop / 2;
  const hTop = rowHeightAt(f.r0, opts);
  const anchorY = y0 + hTop * 0.60;

  /* ── Resolve cloud geometry ── */
  const wEnv = wTop * val(CLOUDS.widthEnv, u) * cloudRow.width;
  const hEnv = hTop * val(CLOUDS.heightEnv, u) * cloudRow.height;
  const spreadXBase = val(CLOUDS.spreadX, u) * cloudRow.overlap;
  const arcLift = val(CLOUDS.arcLift, u) * cloudRow.arcLift;
  const rJitter = val(CLOUDS.rJitter, u);
  const lobeCount = Math.max(3, Math.round(val(CLOUDS.lobeCount, u) * cloudRow.lobeCount));
  const rBaseFromHeight = hTop * val(CLOUDS.rBaseK, u) * cloudRow.radius;
  const rBaseFromWidth = wEnv / Math.max(4.5, lobeCount * cloudRow.radiusFromWidth);
  const rBase = Math.max(rBaseFromHeight, rBaseFromWidth);
  const continuitySpan = Math.max(
    rBase * 2.2,
    (lobeCount - 1) * rBase * particleBucketRange(rowBucket.t, 0.90, 1.35)
  );
  const spreadX = Math.max(0.22, Math.min(spreadXBase, continuitySpan / Math.max(1, wEnv)));

  const lobes = makeArchLobes(
    anchorX, anchorY, wEnv, hEnv,
    { count: lobeCount, spreadX, arcLift, rBase, rJitter, seed }
  ) || [];

  /* ── Cloud color ── */
  const cloudBlendDefault = val(CLOUDS.blend, u);
  const cloudBlend = typeof opts?.cloudBlend === 'number' ? opts.cloudBlend : cloudBlendDefault;

  const baseTint =
    (typeof opts?.cloudCss === 'string' && opts.cloudCss.trim().length > 0)
      ? cssToRgbViaCanvas(p, opts.cloudCss)
      : blendRGB(pal.default, opts?.gradientRGB, cloudBlend);

  const sMax = Math.max(0, Math.min(1, val(CLOUDS.sCap, u)));
  const { h, s, l } = rgbToHsl(baseTint);
  const capped = hslToRgb({ h, s: Math.min(s, sMax), l });

  let cloudRgb = oscillateSaturation(capped, t, {
    amp:   (typeof opts?.oscAmp === 'number' ? opts.oscAmp : val(CLOUDS.oscAmp, u)),
    speed: (typeof opts?.oscSpeed === 'number' ? opts.oscSpeed : val(CLOUDS.oscSpeed, u)),
    phase: opts?.oscPhase ?? 0,
  });

  const cloudLight = sampleDirectionalLightRect(
    { x: x0, y: y0, w: wTop, h: hTop * 1.2 },
    opts.lightCtx ?? null
  );
  cloudRgb = mixRgb(cloudRgb, cloudLight.lightColor, 0.16 * cloudLight.overallK);
  const cloudHighlight = mixRgb(cloudRgb, cloudLight.lightColor, 0.36);
  const cloudShadow = mixRgb(cloudRgb, cloudLight.shadowColor, 0.24);

  /* ── Wobble ── */
  const wobbleK = val(CLOUDS.wobbleAmp, u) * val(WOBBLE.ampScale, u) * cloudRow.wobbleAmp;
  const ampX = (opts?.dispAmp ?? Math.min(12, Math.max(6, Math.round(hTop * 0.12)))) * wobbleK;
  const ampY = ((typeof opts?.dispAmpY === 'number') ? opts.dispAmpY : Math.round(ampX * 0.85)) * wobbleK;
  const ampS = (Math.max(0, Math.min(0.25, opts?.dispScale ?? 0.12))) * wobbleK;
  const fX = Math.max(0.01, (opts?.dispSpeed ?? 0.22) * cloudRow.wobbleHz);
  const fY = fX * 0.85;
  const fS = fX * 0.60;

  /* ── APPEAR envelope for the cloud *shape* ── */
  const appear = applyShapeMods({
    p,
    x: anchorX, y: anchorY, r: Math.min(wTop, hTop),
    opts: {
      alpha: Number.isFinite(opts?.cloudAlpha) ? opts.cloudAlpha : 235,
      timeMs: opts?.timeMs,
      liveAvg: opts?.liveAvg,
      rootAppearK: opts?.rootAppearK,
    },
    mods: {
      appear: {
        scaleFrom: 0.0, alphaFrom: 0.0, anchor: 'center', ease: 'back', backOvershoot: 1.2,
      },
      sizeOsc: { mode: 'none' },
    }
  });

  const cloudAlpha = (typeof appear.alpha === 'number') ? appear.alpha : (Number.isFinite(opts?.cloudAlpha) ? opts.cloudAlpha : 235);

  /* ── RAIN under clouds ── */
  if (drawRain && RAIN.enabled) {
    const rect = { x: x0, y: y0 + hTop * 0.5, w: wTop, h: hTop * 2.5 };

     const speedMin    = val(RAIN.speedMin, u) * PARTICLE_MOTION_SCALE;
    const speedMax    = val(RAIN.speedMax, u) * PARTICLE_MOTION_SCALE;
    const jitterPos   = val(RAIN.jitterPos, u);
    const jitterAngle = val(RAIN.jitterAngle, u);
    const count       = Math.max(8, Math.floor(val(RAIN.count, u) * PARTICLE_COUNT_SCALE));

    const sizeMin     = val(RAIN.sizeMin, u)   * PARTICLE_SIZE_SCALE;
    const sizeMax     = Math.max(sizeMin, val(RAIN.sizeMax, u) * PARTICLE_SIZE_SCALE);
    const lengthMin   = val(RAIN.lengthMin, u) * PARTICLE_SIZE_SCALE;
    const lengthMax   = val(RAIN.lengthMax, u) * PARTICLE_SIZE_SCALE;

    const baseAlpha   = Math.round(val(RAIN.alpha, u));
    const syncedAlpha = Math.round(baseAlpha * (cloudAlpha / 255));

    const rainBlend =
      typeof opts?.rainBlend === 'number'
        ? opts.rainBlend
        : val(RAIN.blend, 1 - u);

    let rainTint =
      (typeof opts?.rainCss === 'string' && opts.rainCss.trim().length > 0)
        ? cssToRgbViaCanvas(p, opts.rainCss)
        : blendRGB(pal.rain, opts?.gradientRGB, rainBlend);

    const rainColor = { r: rainTint.r, g: rainTint.g, b: rainTint.b, a: syncedAlpha };

    stepAndDrawParticles(p, {
      key: `${f.r0}:${f.c0}:${f.w}x${f.h}:${seed}:rain`,
      rect,
      mode: 'line',
      color: rainColor,

      spawn: { x0: RAIN.spawnX0, x1: RAIN.spawnX1, y0: RAIN.spawnY0, y1: RAIN.spawnY1 },
      angle: { min: RAIN.angleMin, max: RAIN.angleMax },

      speed: { min: speedMin, max: speedMax },
      gravity: RAIN.gravity,
      accel: { x: RAIN.accelX, y: RAIN.accelY },

      jitter: { pos: jitterPos, velAngle: jitterAngle },

      count,
      size: { min: sizeMin, max: sizeMax },
      length: { min: lengthMin, max: lengthMax },
      sizeHz: 8,
      lenHz: 6,

      thicknessScale: PARTICLE_SIZE_SCALE,

      lifetime: { min: RAIN.lifeMin * PARTICLE_LIFE_SCALE, max: RAIN.lifeMax * PARTICLE_LIFE_SCALE },
      fadeInFrac: RAIN.fadeInFrac,
      fadeOutFrac: RAIN.fadeOutFrac,

      edgeFadePx: { left: RAIN.fadeLeft, right: RAIN.fadeRight, top: RAIN.fadeTop, bottom: RAIN.fadeBottom },
      respawn: true,
    }, dt);
  }

  /* ── CLOUDS above rain ── */
  if (drawCloudBody) {
    p.push();
    p.translate(appear.x, appear.y);
    p.scale(appear.scaleX, appear.scaleY);
    p.translate(-anchorX, -anchorY);

    p.noStroke();
    p.fill(cloudRgb.r, cloudRgb.g, cloudRgb.b, cloudAlpha);

    for (const l of lobes) {
      const { dx, dy, sc } = displacementOsc(t, l.i, {
        ampX, ampY, ampScale: ampS, freqX: fX, freqY: fY, freqScale: fS, seed
      });
      const lx = l.x;
      const ly = l.y;
      const rr = l.r * sc * 2;
      const cx2 = lx + dx;
      const cy2 = ly + dy;
      p.circle(cx2, cy2, rr);

      if (cloudLight.overallK > 0.01) {
        const offX = cloudLight.xBias * l.r * 0.22;
        const offY = cloudLight.yBias * l.r * 0.18;
        p.fill(
          cloudHighlight.r,
          cloudHighlight.g,
          cloudHighlight.b,
          Math.round(cloudAlpha * 0.18 * Math.max(cloudLight.leftK, cloudLight.rightK, cloudLight.topK))
        );
        p.circle(cx2 + offX, cy2 + offY, rr * 0.62);

        p.fill(
          cloudShadow.r,
          cloudShadow.g,
          cloudShadow.b,
          Math.round(cloudAlpha * 0.10 * Math.max(cloudLight.leftK, cloudLight.rightK))
        );
        p.circle(cx2 - offX * 0.9, cy2 - offY * 0.5, rr * 0.54);

        p.fill(cloudRgb.r, cloudRgb.g, cloudRgb.b, cloudAlpha);
      }
    }
    p.pop();
  }
}
