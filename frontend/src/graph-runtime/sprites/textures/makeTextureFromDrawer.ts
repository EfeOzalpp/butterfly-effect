// graph-runtime/sprites/textures/makeTextureFromDrawer.ts
import * as THREE from 'three';
import { makeCanvasFacade } from './canvasFacade';
import { makeSpritePaletteLightContext } from './spriteLight';
import type { DrawerFn } from '../selection/drawers';

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
  seedKey,
  darkMode = false,
  pixelScaleBoost,
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
  seedKey?: string | number;
  darkMode?: boolean;
  pixelScaleBoost?: number;
}): THREE.CanvasTexture {
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
    alpha,
    gradientRGB,
    liveAvg,
    blend,
    fitToFootprint: true,
    cell,
    footprint: footprintForDrawer,
    seedKey,
    coreScaleMult: Math.max(1, pixelScaleBoost ?? 1),
    pixelScale: Math.max(1, pixelScaleBoost ?? 1),
    particlePixelScale: Math.max(1, pixelScaleBoost ?? 1),
    oscAmp: 0,
    oscSpeed: 0,
    opacityOsc: { amp: 0 },
    sizeOsc: { mode: 'none' },
    darkMode,
    lightCtx,
  };

  const r = Math.min(logicalW, logicalH) * 0.8;

  const opts = { ...baseOpts, timeMs };

  try {
    drawer(p, centerX, centerY, r, opts);
  } catch (err) {
    const prev = ctx.getTransform();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, cnv.width, cnv.height);
    ctx.setTransform(prev);
    throw err;
  }

  const tex = new THREE.CanvasTexture(cnv);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.generateMipmaps = true;
  tex.minFilter = THREE.LinearMipmapLinearFilter;
  tex.magFilter = THREE.LinearFilter;
  tex.wrapS = THREE.ClampToEdgeWrapping;
  tex.wrapT = THREE.ClampToEdgeWrapping;
  tex.anisotropy = 8;
  tex.needsUpdate = true;

  return tex;
}
