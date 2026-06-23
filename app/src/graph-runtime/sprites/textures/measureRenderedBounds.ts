import { makeCanvasFacade } from './canvasFacade';

function createParticleStore() {
  const particleEmitters = new Map<string, unknown>();
  const puffEmitters = new Map<string, unknown>();
  return {
    particleEmitters,
    puffEmitters,
    clear() { particleEmitters.clear(); puffEmitters.clear(); },
  };
}
import { makeSpritePaletteLightContext } from './spriteLight';
import type { DrawerFn } from '../selection/drawers';
import type { SpriteBleed, SpriteFootprint } from '../types';

interface RenderedShapeBounds {
  width: number;
  height: number;
  centerX: number;
  centerY: number;
}

interface MeasureRenderedBoundsArgs {
  drawer: DrawerFn;
  footprint: SpriteFootprint;
  bleed?: SpriteBleed;
  seedKey?: string | number;
  liveAvg?: number;
  blend?: number;
  tileSize?: number;
}

const CACHE = new Map<string, RenderedShapeBounds | null>();

function cacheKey(args: MeasureRenderedBoundsArgs) {
  const bleed = args.bleed ?? {};
  return [
    args.seedKey ?? 'seedless',
    args.footprint.w,
    args.footprint.h,
    bleed.top ?? 0,
    bleed.right ?? 0,
    bleed.bottom ?? 0,
    bleed.left ?? 0,
    args.liveAvg ?? 0.5,
    args.blend ?? 0.6,
    args.tileSize ?? 96,
  ].join('|');
}

export function measureRenderedShapeBounds(
  args: MeasureRenderedBoundsArgs
): RenderedShapeBounds | null {
  if (typeof document === 'undefined') return null;

  const key = cacheKey(args);
  if (CACHE.has(key)) return CACHE.get(key) ?? null;

  const tileSize = args.tileSize ?? 96;
  const footprint = args.footprint;
  const bleed = args.bleed ?? {};
  const bTop = Math.max(0, bleed.top ?? 0);
  const bRight = Math.max(0, bleed.right ?? 0);
  const bBottom = Math.max(0, bleed.bottom ?? 0);
  const bLeft = Math.max(0, bleed.left ?? 0);
  const logicalW = Math.max(2, Math.round((footprint.w + bLeft + bRight) * tileSize));
  const logicalH = Math.max(2, Math.round((footprint.h + bTop + bBottom) * tileSize));

  const canvas = document.createElement('canvas');
  canvas.style.width = `${String(logicalW)}px`;
  canvas.style.height = `${String(logicalH)}px`;
  const p = makeCanvasFacade(canvas, { dpr: 1 });
  const ctx = p.drawingContext;
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  try {
    args.drawer(p, logicalW / 2, logicalH / 2, Math.min(logicalW, logicalH) * 0.8, {
      projection: {
        cell: tileSize,
        footprint: { r0: bTop, c0: bLeft, w: footprint.w, h: footprint.h },
      },
      style: {
        alpha: 255,
        liveAvg: args.liveAvg ?? 0.5,
        blend: args.blend ?? 0.6,
        darkMode: false,
        lightCtx: makeSpritePaletteLightContext(logicalW, logicalH, false),
      },
      identity: { seedKey: args.seedKey },
      sprite: {
        fitToFootprint: true,
        coreScaleMult: 1,
        pixelScale: 1,
        particlePixelScale: 1,
      },
      particles: { particleStore: createParticleStore() },
      pass: {
        renderPass: 'depthMask',
        maskColor: { r: 0, g: 0, b: 0 },
        maskAlpha: 255,
      },
      lifecycle: { timeMs: 0, dtSec: 1 / 60 },
    });
  } catch {
    CACHE.set(key, null);
    return null;
  }

  const image = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = image.data;
  let minX = canvas.width;
  let minY = canvas.height;
  let maxX = -1;
  let maxY = -1;

  for (let y = 0; y < canvas.height; y += 1) {
    for (let x = 0; x < canvas.width; x += 1) {
      const alpha = data[(y * canvas.width + x) * 4 + 3];
      if (alpha <= 8) continue;
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
    }
  }

  if (maxX < minX || maxY < minY) {
    CACHE.set(key, null);
    return null;
  }

  const left = minX / tileSize - bLeft;
  const right = (maxX + 1) / tileSize - bLeft;
  const top = minY / tileSize - bTop;
  const bottom = (maxY + 1) / tileSize - bTop;
  const bounds = {
    width: Math.max(0.05, right - left),
    height: Math.max(0.05, bottom - top),
    centerX: (left + right) / 2,
    centerY: (top + bottom) / 2,
  };

  CACHE.set(key, bounds);
  return bounds;
}
