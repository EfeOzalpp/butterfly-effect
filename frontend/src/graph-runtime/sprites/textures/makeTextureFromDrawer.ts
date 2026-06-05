// graph-runtime/sprites/textures/makeTextureFromDrawer.ts
import {
  CanvasTexture,
  ClampToEdgeWrapping,
  LinearFilter,
  SRGBColorSpace,
} from 'three';
import { makeCanvasFacade } from './canvasFacade';
import { makeSpritePaletteLightContext } from './spriteLight';
import type { DrawerFn } from '../selection/drawers';
import {
  createParticleStore,
  type ParticleStore,
} from '../../../canvas-engine/modifiers/particles';

// Static bridge: run a canvas-engine drawer into an offscreen canvas, then hand
// that canvas to Three as a CanvasTexture.
type Drawer = DrawerFn;

export interface Footprint { w: number; h: number }
export interface BleedFrac { top?: number; right?: number; bottom?: number; left?: number }

export function makeTextureFromDrawer({
  drawer,
  tileSize = 192,
  alpha = 235,
  dpr = typeof window !== 'undefined'
    ? Math.min(2, window.devicePixelRatio || 1)
    : 1,
  gradientRGB,
  liveAvg = 0.5,
  blend = 0.6,
  footprint = { w: 1, h: 1 },
  bleed = {},
  timeMs = (typeof performance !== 'undefined' ? performance.now() : 0),
  dtSec = 1 / 60,
  seedKey,
  darkMode = false,
  pixelScaleBoost,
  particleStore,
}: {
  drawer: Drawer;
  tileSize?: number;
  alpha?: number;
  dpr?: number;
  gradientRGB?: { r: number; g: number; b: number };
  liveAvg?: number;
  blend?: number;
  footprint?: Footprint;
  bleed?: BleedFrac;
  timeMs?: number;
  dtSec?: number;
  seedKey?: string | number;
  darkMode?: boolean;
  pixelScaleBoost?: number;
  particleStore?: ParticleStore;
}): CanvasTexture {
  // Footprint + bleed decide canvas size before drawing, so texture swaps do not
  // resize sprites later in Three.
  const wTiles = Math.max(1e-6, footprint.w || 1);
  const hTiles = Math.max(1e-6, footprint.h || 1);

  const bTop    = Math.max(0, bleed.top    ?? 0);
  const bRight  = Math.max(0, bleed.right  ?? 0);
  const bBottom = Math.max(0, bleed.bottom ?? 0);
  const bLeft   = Math.max(0, bleed.left   ?? 0);

  const totalTilesW = wTiles + bLeft + bRight;
  const totalTilesH = hTiles + bTop  + bBottom;

  const logicalW = Math.max(2, Math.round(totalTilesW * tileSize));
  const logicalH = Math.max(2, Math.round(totalTilesH * tileSize));

  const cnv = document.createElement('canvas');
  cnv.style.width = `${String(logicalW)}px`;
  cnv.style.height = `${String(logicalH)}px`;

  const p = makeCanvasFacade(cnv, { dpr });
  const ctx = p.drawingContext;

  {
    const prev = ctx.getTransform();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, cnv.width, cnv.height);
    ctx.setTransform(prev);
  }

  const centerX = logicalW / 2;
  const centerY = logicalH / 2;

  const cell = tileSize;
  const drawParticleStore = particleStore ?? createParticleStore();

  const footprintForDrawer = {
    r0: bTop,
    c0: bLeft,
    w:  wTiles,
    h:  hTiles,
  };
  const lightCtx = makeSpritePaletteLightContext(logicalW, logicalH, darkMode);

  // These options make the regular canvas-engine shape draw as a centered,
  // non-oscillating sprite texture.
  const baseOpts = {
    projection: {
      cell,
      footprint: footprintForDrawer,
    },
    style: {
      alpha,
      gradientRGB,
      liveAvg,
      blend,
      darkMode,
      lightCtx,
    },
    identity: {
      seedKey,
    },
    sprite: {
      fitToFootprint: true,
      coreScaleMult: Math.max(1, pixelScaleBoost ?? 1),
      pixelScale: Math.max(1, pixelScaleBoost ?? 1),
      particlePixelScale: Math.max(1, pixelScaleBoost ?? 1),
      disableParticleDepthTint: true,
    },
    particles: {
      particleStore: drawParticleStore,
    },
    oscAmp: 0,
    oscSpeed: 0,
    opacityOsc: { amp: 0 },
    sizeOsc: { mode: 'none' },
  };

  const r = Math.min(logicalW, logicalH) * 0.8;
  const safeDtSec = Math.max(1 / 120, Math.min(0.35, dtSec));
  const renderTimeMs = timeMs;

  p.__tick(renderTimeMs - safeDtSec * 1000);
  p.__tick(renderTimeMs);
  const opts = { ...baseOpts, lifecycle: { timeMs: renderTimeMs, dtSec: safeDtSec } };

  try {
    drawer(p, centerX, centerY, r, opts);
  } catch (err) {
    const prev = ctx.getTransform();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, cnv.width, cnv.height);
    ctx.setTransform(prev);
    throw err;
  }

  const tex = new CanvasTexture(cnv);
  tex.colorSpace = SRGBColorSpace;
  tex.generateMipmaps = false;
  tex.minFilter = LinearFilter;
  tex.magFilter = LinearFilter;
  tex.wrapS = ClampToEdgeWrapping;
  tex.wrapT = ClampToEdgeWrapping;
  tex.anisotropy = 8;
  tex.needsUpdate = true;

  return tex;
}
