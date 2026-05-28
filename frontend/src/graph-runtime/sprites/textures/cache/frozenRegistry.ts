// graph-runtime/sprites/textures/cache/frozenRegistry.ts
import type { CanvasTexture } from 'three';
import {
  particleCacheGet,
  particleCacheSet,
  particleCacheClear,
  particleCacheSize,
} from './particleLRU';
import { spriteCachingDisabled } from '../../internal/debug-flags';

// Frozen textures are particle-heavy outputs. Failed/in-flight sets keep the
// runtime from retrying expensive work every render.
const FAILED_KEYS = new Set<string>();
const INFLIGHT = new Set<string>();
type ReadyListener = (key: string, tex: CanvasTexture) => void;
const READY_LISTENERS = new Set<ReadyListener>();

export function frozenGet(key: string) {
  if (spriteCachingDisabled()) return null;
  return particleCacheGet(key);
}

export function frozenSet(key: string, tex: CanvasTexture) {
  if (spriteCachingDisabled()) return;
  particleCacheSet(key, tex);
  for (const listener of READY_LISTENERS) listener(key, tex);
}

export function frozenOnReady(listener: ReadyListener) {
  READY_LISTENERS.add(listener);
  return () => {
    READY_LISTENERS.delete(listener);
  };
}

export function frozenMarkFailed(key: string) {
  FAILED_KEYS.add(key);
}

export function frozenIsFailed(key: string) {
  return FAILED_KEYS.has(key);
}

export function frozenBeginInflight(key: string) {
  if (INFLIGHT.has(key)) return false;
  INFLIGHT.add(key);
  return true;
}

export function frozenEndInflight(key: string) {
  INFLIGHT.delete(key);
}

export function frozenIsInflight(key: string) {
  return INFLIGHT.has(key);
}

export function frozenClearAll() {
  FAILED_KEYS.clear();
  INFLIGHT.clear();
  READY_LISTENERS.clear();
  particleCacheClear();
}

export function frozenSize() {
  return particleCacheSize();
}
