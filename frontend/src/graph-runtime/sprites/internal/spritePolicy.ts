// graph-runtime/sprites/internal/spritePolicy.ts
import { sampleShapeForAvg, type ShapeKey } from '../selection/shapeForAvg';
import { spriteQuantizationDisabled } from './debug-flags';

export const SPRITE_TINT_BUCKETS = 10;

function clamp01(v: number) {
  return Math.max(0, Math.min(1, v));
}

/* avg bucketing */
const BIAS_GAMMA = 1.8;
function biasDown(t: number, gamma = BIAS_GAMMA) {
  return Math.pow(clamp01(t), Math.max(1, gamma));
}
function rawBucketIdFromAvg(avg: number) {
  const t = Number.isFinite(avg) ? avg : 0.5;
  const tb = biasDown(t);
  return Math.min(SPRITE_TINT_BUCKETS - 1, Math.floor(tb * SPRITE_TINT_BUCKETS));
}
const REMAP: number[] = [0, 0, 1, 1, 2, 3, 4, 6, 6, 6];
function adjustedBucketId(id: number) {
  return REMAP[Math.max(0, Math.min(9, id))];
}
function bucketMidpoint(id: number) {
  return (id + 0.5) / SPRITE_TINT_BUCKETS;
}

export function quantizeAvgWithDownshift(avg: number) {
  if (spriteQuantizationDisabled()) {
    const unclamped = clamp01(Number.isFinite(avg) ? avg : 0.5);
    const bucketId = Math.round(unclamped * 1000);
    return { bucketId, bucketAvg: unclamped };
  }

  const base = rawBucketIdFromAvg(avg);
  const adj = adjustedBucketId(base);
  return { bucketId: adj, bucketAvg: bucketMidpoint(adj) };
}

/* variants */
export const DEFAULT_VARIANT_SLOTS = 3;

function hash01(s: string) {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  h ^= h >>> 16;
  h = Math.imul(h, 0x85ebca6b);
  h ^= h >>> 13;
  h = Math.imul(h, 0xc2b2ae35);
  h ^= h >>> 16;
  return (h >>> 0) / 0xffffffff;
}

export function pickVariantSlot(seedStr: string, slots = DEFAULT_VARIANT_SLOTS) {
  const s = Math.max(1, slots | 0);
  return Math.floor(hash01(seedStr) * s) % s;
}

/* key builders */
export function makeStaticKey(args: {
  shape: ShapeKey;
  tileSize: number;
  dpr: number;
  alpha: number;
  bucketId: number;
  variant: number;
  darkMode?: boolean;
  pixelScaleBoost?: number;
}) {
  const { shape, tileSize, dpr, alpha, bucketId, variant, darkMode, pixelScaleBoost } = args;
  const boostSuffix = pixelScaleBoost && pixelScaleBoost !== 1 ? `|PX${pixelScaleBoost}` : '';
  return `SPRITE|${shape}|B${bucketId}|V${variant}|${tileSize}|${dpr}|${alpha}|STATIC_NATIVE${darkMode ? '|DK' : ''}${boostSuffix}`;
}

export function makeFrozenKey(args: {
  shape: ShapeKey;
  tileSize: number;
  dpr: number;
  alpha: number;
  simulateMs: number;
  stepMs: number;
  bucketId: number;
  variant: number;
  darkMode?: boolean;
}) {
  const { shape, tileSize, dpr, alpha, simulateMs, stepMs, bucketId, variant, darkMode } = args;
  return `SPRITE|${shape}|B${bucketId}|V${variant}|${tileSize}|${dpr}|${alpha}|FROZEN_NATIVE_${Math.round(
    simulateMs
  )}_${Math.round(stepMs)}${darkMode ? '|DK' : ''}`;
}

export function chooseShape(args: { avg: number; seed?: string | number; orderIndex?: number }) {
  const t = clamp01(Number.isFinite(args.avg) ? args.avg : 0.5);
  return sampleShapeForAvg(t, args.seed ?? t, args.orderIndex);
}

export type ShapeAssignment = {
  shape: ShapeKey;
  variant: number;
  bucketId: number;
  bucketAvg: number;
};

const _assignmentCache = new Map<string, ShapeAssignment>();

export function getOrAssignShapeEntry(
  entryId: string,
  sectionKey: string,
  avg: number,
  seed: string | number,
  orderIndex: number,
  variantSlots = DEFAULT_VARIANT_SLOTS
): ShapeAssignment {
  const cacheKey = `${entryId}|${sectionKey}`;
  const hit = _assignmentCache.get(cacheKey);
  if (hit) return hit;

  const shape = chooseShape({ avg, seed, orderIndex });
  const { bucketId, bucketAvg } = quantizeAvgWithDownshift(avg);
  const vSeed = `${shape}|B${bucketId}|${seed}|${orderIndex}`;
  const variant = pickVariantSlot(vSeed, Math.max(1, variantSlots));

  const assignment: ShapeAssignment = { shape, variant, bucketId, bucketAvg };
  _assignmentCache.set(cacheKey, assignment);
  return assignment;
}

export function resolveDpr(fallback = 1) {
  return typeof window !== 'undefined'
    ? Math.min(1.5, window.devicePixelRatio || 1.5)
    : fallback;
}
