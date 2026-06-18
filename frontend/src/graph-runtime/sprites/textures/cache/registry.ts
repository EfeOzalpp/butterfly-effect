// graph-runtime/sprites/textures/cache/registry.ts
import {
  LinearFilter,
  type CanvasTexture,
} from '../../../three';
import { makeTextureFromDrawer } from '../makeTextureFromDrawer';
import type { DrawerFn } from '../../selection/drawers';
import type { SpriteBleed, SpriteFootprint } from '../../types';

const isMobileDevice =
  typeof window !== 'undefined' &&
  (navigator.maxTouchPoints > 0 || 'ontouchstart' in window);

import { enqueueTexture } from '../queue';
import {
  shouldLogSpriteLoadErrors,
  spriteCachingDisabled,
} from '../../../debug/spriteFlags';
import {
  bumpSpriteCacheMetric,
  recordStaticTextureKey,
} from '../../../debug/spriteCacheMetrics';

export interface MakeArgs {
  key: string;
  drawer: DrawerFn;
  tileSize: number;
  dpr: number;
  alpha: number;
  gradientRGB?: { r: number; g: number; b: number };
  liveAvg: number;
  blend: number;
  footprint: SpriteFootprint;
  bleed?: SpriteBleed;
  seedKey: string;
  prio?: number;
  background?: boolean;
  darkMode?: boolean;
  pixelScaleBoost?: number;
}

type Listener = (key: string, tex: CanvasTexture) => void;
type CancelListener = (key: string) => void;

// Static texture cache with in-flight protection. Multiple sprites can ask for
// the same key without building the same canvas twice.
class TextureRegistry {
  private cache = new Map<string, CanvasTexture>();
  private inFlight = new Set<string>();
  private listeners = new Set<Listener>();
  private cancelListeners = new Set<CancelListener>();

  get(key: string) {
    if (spriteCachingDisabled()) return null;
    const tex = this.cache.get(key) ?? null;
    bumpSpriteCacheMetric(tex ? 'registryGetHits' : 'registryGetMisses');
    if (tex) recordStaticTextureKey(key);
    return tex;
  }

  onReady(cb: Listener) {
    this.listeners.add(cb);
    return () => this.listeners.delete(cb);
  }

  onCancel(cb: CancelListener) {
    this.cancelListeners.add(cb);
    return () => this.cancelListeners.delete(cb);
  }

  ensure(args: MakeArgs) {
    const { key, prio = 0, background = false } = args;
    const disableCache = spriteCachingDisabled();
    recordStaticTextureKey(key);
    if (this.inFlight.has(key)) {
      bumpSpriteCacheMetric('ensureInFlightDedupes');
      return;
    }
    if (!disableCache && this.cache.has(key)) {
      bumpSpriteCacheMetric('ensureCacheHits');
      return;
    }

    this.inFlight.add(key);
    bumpSpriteCacheMetric('textureBuildsQueued');
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
        tex.generateMipmaps = false;
        tex.anisotropy = isMobileDevice ? 4 : 8;
        tex.minFilter = LinearFilter;
        tex.magFilter = LinearFilter;
        tex.needsUpdate = true;

        if (!disableCache) this.cache.set(key, tex);
        bumpSpriteCacheMetric('textureBuildsCompleted');
        for (const l of this.listeners) l(key, tex);
      } catch (err) {
        bumpSpriteCacheMetric('textureBuildFailures');
        if (shouldLogSpriteLoadErrors()) {
          console.warn('[SPRITE:STATIC] build failed', key, err);
        }
      } finally {
        this.inFlight.delete(key);
      }
    }, prio, background, () => {
      this.inFlight.delete(key);
      for (const listener of this.cancelListeners) listener(key);
    });
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
    this.cancelListeners.clear();
  }
}

export const textureRegistry = new TextureRegistry();
