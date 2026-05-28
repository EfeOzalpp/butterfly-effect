// graph-runtime/sprites/textures/cache/registry.ts
import {
  LinearFilter,
  LinearMipmapLinearFilter,
  type CanvasTexture,
} from 'three';
import { makeTextureFromDrawer } from '../makeTextureFromDrawer';
import type { DrawerFn } from '../../selection/drawers';

const isMobileDevice =
  typeof window !== 'undefined' &&
  (navigator.maxTouchPoints > 0 || 'ontouchstart' in window);

import { enqueueTexture } from '../queue';
import { spriteCachingDisabled } from '../../internal/debug-flags';

export interface MakeArgs {
  key: string;
  drawer: DrawerFn;
  tileSize: number;
  dpr: number;
  alpha: number;
  gradientRGB?: { r: number; g: number; b: number };
  liveAvg: number;
  blend: number;
  footprint: { w: number; h: number };
  bleed?: { top?: number; right?: number; bottom?: number; left?: number };
  seedKey: string;
  prio?: number;
  darkMode?: boolean;
  pixelScaleBoost?: number;
}

type Listener = (key: string, tex: CanvasTexture) => void;

// Static texture cache with in-flight protection. Multiple sprites can ask for
// the same key without building the same canvas twice.
class TextureRegistry {
  private cache = new Map<string, CanvasTexture>();
  private inFlight = new Set<string>();
  private listeners = new Set<Listener>();

  get(key: string) {
    if (spriteCachingDisabled()) return null;
    return this.cache.get(key) ?? null;
  }

  onReady(cb: Listener) {
    this.listeners.add(cb);
    return () => this.listeners.delete(cb);
  }

  ensure(args: MakeArgs) {
    const { key, prio = 0 } = args;
    const disableCache = spriteCachingDisabled();
    if (this.inFlight.has(key)) return;
    if (!disableCache && this.cache.has(key)) return;

    this.inFlight.add(key);
    // Actual canvas work is queued so creating textures does not block render.
    enqueueTexture(() => {
      let tex: CanvasTexture | null = null;
      try {
        tex = makeTextureFromDrawer({
          drawer: args.drawer,
          tileSize: args.tileSize,
          dpr: args.dpr,
          alpha: args.alpha,
          gradientRGB: args.gradientRGB,
          liveAvg: args.liveAvg,
          blend: args.blend,
          footprint: args.footprint,
          bleed: args.bleed,
          seedKey: args.seedKey,
          darkMode: args.darkMode,
          pixelScaleBoost: args.pixelScaleBoost,
        });
        tex.generateMipmaps = true;
        tex.anisotropy = isMobileDevice ? 4 : 8;
        tex.minFilter = LinearMipmapLinearFilter;
        tex.magFilter = LinearFilter;
        tex.needsUpdate = true;

        if (!disableCache) this.cache.set(key, tex);
        for (const l of this.listeners) l(key, tex);
      } catch (err) {
        if (window.__GP_LOG_LOAD_ERRORS) {
          console.warn('[SPRITE:STATIC] build failed', key, err);
        }
      } finally {
        this.inFlight.delete(key);
      }
    }, prio);
  }

  prewarm(list: MakeArgs[], { prioBase = 0 }: { prioBase?: number } = {}) {
    // Use a small priority ladder so prewarm jobs do not all have identical ordering.
    let p = prioBase;
    for (const args of list) this.ensure({ ...args, prio: p++ });
  }

  clear() {
    for (const tex of this.cache.values()) {
      try { tex.dispose(); } catch {}
    }
    this.cache.clear();
    this.inFlight.clear();
    this.listeners.clear();
  }
}

export const textureRegistry = new TextureRegistry();
