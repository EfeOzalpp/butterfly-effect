// Runtime debug switches can be flipped from DevTools without changing source.
import type { Texture } from 'three';
import type { ShapeKey } from '../sprites/selection/types';

const SHAPE_ALIASES: Record<string, ShapeKey> = {
  bus: 'bus',
  car: 'car',
  carfactory: 'carFactory',
  clouds: 'clouds',
  cloud: 'clouds',
  house: 'house',
  power: 'power',
  sea: 'sea',
  snow: 'snow',
  sun: 'sun',
  trees: 'trees',
  tree: 'trees',
  villa: 'villa',
};

function readWindowFlag(name: keyof Window) {
  if (typeof window === "undefined") return false;
  return window[name] === true;
}

function readBooleanStorageFlag(key: string) {
  if (typeof window === "undefined") return false;
  try {
    const value = window.localStorage.getItem(key);
    return value === '1' || value === 'true';
  } catch {
    return false;
  }
}

function readBooleanQueryFlag(...keys: string[]) {
  if (typeof window === "undefined") return false;
  try {
    const params = new URLSearchParams(window.location.search);
    return keys.some((key) => {
      const value = params.get(key);
      return value === '1' || value === 'true';
    });
  } catch {
    return false;
  }
}

function normalizeShape(value: unknown): ShapeKey | undefined {
  if (typeof value !== 'string') return undefined;
  return SHAPE_ALIASES[value.trim().replace(/[\s_-]/g, '').toLowerCase()];
}

function normalizeAvg(value: unknown): number | undefined {
  const n = typeof value === 'number' ? value : typeof value === 'string' ? Number(value.trim()) : NaN;
  if (!Number.isFinite(n)) return undefined;
  return Math.max(0, Math.min(1, n));
}

function readStorageShape() {
  if (typeof window === "undefined") return undefined;
  try {
    return normalizeShape(window.localStorage.getItem('be.debug.spriteShape'));
  } catch {
    return undefined;
  }
}

function readQueryShape() {
  if (typeof window === "undefined") return undefined;
  try {
    const params = new URLSearchParams(window.location.search);
    return normalizeShape(params.get('gpShape') ?? params.get('spriteShape'));
  } catch {
    return undefined;
  }
}

function readStorageAvg() {
  if (typeof window === "undefined") return undefined;
  try {
    return normalizeAvg(window.localStorage.getItem('be.debug.spriteAvg'));
  } catch {
    return undefined;
  }
}

function readQueryAvg() {
  if (typeof window === "undefined") return undefined;
  try {
    const params = new URLSearchParams(window.location.search);
    return normalizeAvg(params.get('gpAvg') ?? params.get('spriteAvg'));
  } catch {
    return undefined;
  }
}

function shouldDisableSpriteCaching() {
  return readWindowFlag("__GP_DISABLE_SPRITE_CACHE");
}

function shouldDisableSpriteQuantization() {
  return readWindowFlag("__GP_DISABLE_SPRITE_QUANTIZATION");
}

function shouldDisableSpriteOptimizations() {
  return readWindowFlag("__GP_DISABLE_SPRITE_OPTIMIZATIONS");
}

function shouldDisableSpriteMaterialCaching() {
  return readWindowFlag("__GP_DISABLE_SPRITE_MATERIAL_CACHE");
}

export function spriteCachingDisabled() {
  return shouldDisableSpriteOptimizations() || shouldDisableSpriteCaching();
}

export function spriteQuantizationDisabled() {
  return shouldDisableSpriteOptimizations() || shouldDisableSpriteQuantization();
}

export function spriteMaterialCachingDisabled() {
  return shouldDisableSpriteOptimizations() || shouldDisableSpriteMaterialCaching();
}

export function forcedSpriteShape(): ShapeKey | undefined {
  if (typeof window === "undefined") return undefined;
  return normalizeShape(window.__GP_FORCE_SPRITE_SHAPE) ?? readQueryShape() ?? readStorageShape();
}

export function forcedSpriteShapeCacheKey() {
  return forcedSpriteShape() ?? 'auto';
}

export function forcedSpriteAvg(): number | undefined {
  if (typeof window === "undefined") return undefined;
  return normalizeAvg(window.__GP_FORCE_SPRITE_AVG) ?? readQueryAvg() ?? readStorageAvg();
}

export function forcedSpriteAvgCacheKey() {
  const avg = forcedSpriteAvg();
  return avg === undefined ? 'auto' : avg.toFixed(4);
}

export function shouldLogSpriteLoadErrors() {
  return readWindowFlag("__GP_LOG_LOAD_ERRORS");
}

export function shouldShowHitboxDebugOverlay() {
  return (
     // true ||
    readWindowFlag("__GP_SHOW_HITBOXES") ||
    readBooleanQueryFlag('gpHitboxes', 'showHitboxes') ||
    readBooleanStorageFlag('be.debug.showHitboxes')
  );
}

export function getDebugTextureRegistry() {
  if (typeof window === "undefined") return null;
  window.__GP_TEX_REGISTRY ??= new Set<Texture>();
  return window.__GP_TEX_REGISTRY;
}
