// graph-runtime/sprites/textures/frozenTexture.ts
import * as THREE from 'three';
import { makeCanvasFacade } from './canvasFacade';
import { makeSpritePaletteLightContext } from './spriteLight';
import type { DrawerFn } from '../selection/drawers';

// Particle bridge: run a drawer through time before turning it into a texture.
// Used for sprite art where a single static frame would look empty or clipped.
type Drawer = DrawerFn;

export interface FrozenTextureParams {
  drawer: Drawer;
  tileSize?: number;
  dpr?: number;
  alpha?: number;
  gradientRGB?: { r: number; g: number; b: number };
  liveAvg?: number;
  blend?: number;
  footprint?: { w: number; h: number };
  bleed?: { top?: number; right?: number; bottom?: number; left?: number };
  seedKey?: string | number;
  darkMode?: boolean;
  /** Extra multiplier applied on top of tileSize/128 for particle-heavy shapes (snow, clouds). */
  pixelScaleBoost?: number;

  generateMipmaps?: boolean;
  anisotropy?: number;
  minFilter?: THREE.TextureFilter;
  // IMPORTANT: magFilter must be a MagnificationTextureFilter (Linear/Nearest only)
  magFilter?: THREE.MagnificationTextureFilter;
}

function resolveCanvasSize(
  tileSize: number,
  footprint: { w: number; h: number },
  bleed: { top?: number; right?: number; bottom?: number; left?: number }
) {
  const wTiles = Math.max(1e-6, footprint.w || 1);
  const hTiles = Math.max(1e-6, footprint.h || 1);
  const bTop = Math.max(0, bleed.top ?? 0);
  const bRight = Math.max(0, bleed.right ?? 0);
  const bBottom = Math.max(0, bleed.bottom ?? 0);
  const bLeft = Math.max(0, bleed.left ?? 0);

  const logicalW = Math.max(2, Math.round((wTiles + bLeft + bRight) * tileSize));
  const logicalH = Math.max(2, Math.round((hTiles + bTop + bBottom) * tileSize));
  return { logicalW, logicalH, wTiles, hTiles, bTop, bLeft };
}

function makePainter(
  cnv: HTMLCanvasElement,
  {
    drawer,
    dpr,
    alpha,
    gradientRGB,
    liveAvg,
    blend,
    tileSize,
    wTiles,
    hTiles,
    bTop,
    bLeft,
    seedKey,
    darkMode,
    pixelScaleBoost,
  }: {
    drawer: Drawer;
    dpr: number;
    alpha: number;
    gradientRGB?: { r: number; g: number; b: number };
    liveAvg: number;
    blend: number;
    tileSize: number;
    wTiles: number;
    hTiles: number;
    bTop: number;
    bLeft: number;
    seedKey?: string | number;
    darkMode?: boolean;
    pixelScaleBoost?: number;
  }
) {
  // The painter owns time/delta injection so drawers can keep their normal
  // animation API while rendering into an offscreen texture.
  const p = makeCanvasFacade(cnv, { dpr });
  const ctx = p.drawingContext;
  const centerX = cnv.width / (2 * dpr);
  const centerY = cnv.height / (2 * dpr);
  const r = Math.min(cnv.width / dpr, cnv.height / dpr) * 0.8;

  const pixelScale = Math.max(1, tileSize / 128) * Math.max(1, pixelScaleBoost ?? 1);
  const lightCtx = makeSpritePaletteLightContext(cnv.width / dpr, cnv.height / dpr, darkMode ?? false);

  const baseOpts = {
    projection: {
      cell: tileSize,
      footprint: { r0: bTop, c0: bLeft, w: wTiles, h: hTiles },
    },
    style: {
      alpha,
      gradientRGB,
      liveAvg,
      blend,
      darkMode: darkMode ?? false,
      lightCtx,
    },
    identity: {
      seedKey,
    },
    sprite: {
      fitToFootprint: true,
      coreScaleMult: pixelScale,
      pixelScale,
      particlePixelScale: pixelScale,
    },
    oscAmp: 0,
    oscSpeed: 0,
    opacityOsc: { amp: 0 },
    sizeOsc: { mode: 'none' },
  };

  function clear() {
    const prev = ctx.getTransform();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, cnv.width, cnv.height);
    ctx.setTransform(prev);
  }

  let lastPaintMs = typeof performance !== 'undefined' ? performance.now() : 0;

  function paint(nowMs: number) {
    const dtMs = Math.max(0, nowMs - lastPaintMs);
    lastPaintMs = nowMs;
    clear();
    drawer(p, centerX, centerY, r, {
      ...baseOpts,
      lifecycle: {
        timeMs: nowMs,
        dtSec: dtMs / 1000,
      },
    });
  }

  return { paint };
}

function makeCanvasTexture(
  cnv: HTMLCanvasElement,
  {
    generateMipmaps,
    anisotropy,
    minFilter,
    magFilter,
  }: {
    generateMipmaps: boolean;
    anisotropy: number;
    minFilter: THREE.TextureFilter;
    magFilter: THREE.MagnificationTextureFilter;
  }
) {
  const tex = new THREE.CanvasTexture(cnv);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.generateMipmaps = generateMipmaps;
  tex.minFilter = minFilter;
  tex.magFilter = magFilter;
  tex.wrapS = THREE.ClampToEdgeWrapping;
  tex.wrapT = THREE.ClampToEdgeWrapping;
  tex.anisotropy = anisotropy;
  tex.needsUpdate = true;
  return tex;
}

export function makeFrozenTextureFromDrawer({
  drawer,
  tileSize = 192,
  dpr = typeof window !== 'undefined' ? Math.min(2, window.devicePixelRatio || 1) : 1,
  alpha = 235,
  gradientRGB,
  liveAvg = 0.5,
  blend = 0.6,
  footprint = { w: 1, h: 1 },
  bleed = {},
  seedKey,
  darkMode = false,
  pixelScaleBoost,
  simulateMs = 1200,
  stepMs = 33,
  generateMipmaps = false,
  anisotropy = 2,
  minFilter = THREE.LinearMipmapLinearFilter,
  magFilter = THREE.LinearFilter,
}: FrozenTextureParams & { simulateMs?: number; stepMs?: number }) {
  const { logicalW, logicalH, wTiles, hTiles, bTop, bLeft } = resolveCanvasSize(
    tileSize,
    footprint,
    bleed
  );

  const cnv = document.createElement('canvas');
  cnv.style.width = `${String(logicalW)}px`;
  cnv.style.height = `${String(logicalH)}px`;

  const { paint } = makePainter(cnv, {
    drawer,
    dpr,
    alpha,
    gradientRGB,
    liveAvg,
    blend,
    tileSize,
    wTiles,
    hTiles,
    bTop,
    bLeft,
    seedKey,
    darkMode,
    pixelScaleBoost,
  });

  const start = typeof performance !== 'undefined' ? performance.now() : 0;
  const total = Math.max(0, simulateMs | 0);
  const step = Math.max(1, stepMs | 0);

  paint(start);

  // Advance the simulation offscreen, then freeze the final canvas as a texture.
  const end = start + total;
  for (let t = start + step; t <= end; t += step) {
    paint(t);
  }

  const texture = makeCanvasTexture(cnv, {
    generateMipmaps,
    anisotropy,
    minFilter,
    magFilter,
  });

  return { texture };
}
