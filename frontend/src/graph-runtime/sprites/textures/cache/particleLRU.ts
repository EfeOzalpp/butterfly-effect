// graph-runtime/sprites/textures/cache/particleLRU.ts
import type { CanvasTexture, Texture } from 'three';

interface Entry {
  key: string;
  tex: CanvasTexture;
}
// Frozen particle textures are bigger than static sprites, so cap the cache.
const MAX_CAP = 48;
type SpriteTextureWindow = Window & { __GP_TEX_REGISTRY: Set<Texture> };

// DevTools/debug registry so texture pressure is visible while tuning.
const getGlobals = (): SpriteTextureWindow => {
  window.__GP_TEX_REGISTRY ??= new Set<Texture>();
  return window as SpriteTextureWindow;
};

class ParticleLRU {
  private map = new Map<string, Entry>();
  private order: string[] = [];

  get size() { return this.map.size; }

  get(key: string) {
    const e = this.map.get(key);
    if (!e) return null;
    // Touching a texture moves it to the back so the oldest unused entry evicts first.
    this.order = this.order.filter(k => k !== key);
    this.order.push(key);
    return e.tex;
  }

  set(key: string, tex: CanvasTexture) {
    const g = getGlobals();
    try { g.__GP_TEX_REGISTRY.add(tex); } catch {}
    if (this.map.has(key)) {
      const current = this.map.get(key);
      if (!current) return;
      const old = current.tex;
      if (old !== tex) {
        try { old.dispose(); } catch {}
        try { g.__GP_TEX_REGISTRY.delete(old); } catch {}
      }
      this.map.set(key, { key, tex });
      this.order = this.order.filter(k => k !== key);
      this.order.push(key);
      this.evictIfNeeded();
      return;
    }
    this.map.set(key, { key, tex });
    this.order.push(key);
    this.evictIfNeeded();
  }

  clear() {
    const g = getGlobals();
    for (const { tex } of this.map.values()) {
      try {
        if (tex.image instanceof HTMLCanvasElement) {
          tex.image.width = 0;
          tex.image.height = 0;
        }
        tex.dispose();
      } catch {}
      try { g.__GP_TEX_REGISTRY.delete(tex); } catch {}
    }
    this.map.clear();
    this.order.length = 0;
  }

  private evictIfNeeded() {
    const g = getGlobals();
    while (this.order.length > MAX_CAP) {
      const lruKey = this.order.shift();
      if (!lruKey) break;
      const e = this.map.get(lruKey);
      if (!e) continue;
      // Cache eviction must not dispose the texture. Mounted SpriteMaterials may
      // still reference it, and disposing here can make visible sprites flicker
      // or turn into blank/placeholder textures during camera movement.
      try { g.__GP_TEX_REGISTRY.delete(e.tex); } catch {}
      this.map.delete(lruKey);
    }
  }
}

const _LRU = new ParticleLRU();
export function particleCacheGet(key: string) { return _LRU.get(key); }
export function particleCacheSet(key: string, tex: CanvasTexture) { _LRU.set(key, tex); }
export function particleCacheClear() { _LRU.clear(); }
export function particleCacheSize() { return _LRU.size; }
