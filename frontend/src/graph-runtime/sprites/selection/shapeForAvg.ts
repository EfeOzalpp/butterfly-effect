import type { ShapeKey } from './types';
import { getProbAt, SHAPE_PROBABILITY_SPEC, type ShapeProbSpec } from './probabilitySpec';

const SHAPES: ShapeKey[] = [
  'clouds', 'snow', 'house', 'power', 'sun', 'villa',
  'car', 'sea', 'carFactory', 'bus', 'trees',
];

function clamp01(t: number) {
  return Math.max(0, Math.min(1, t));
}

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

function prng(seedStr: string) {
  let x = Math.max(1, Math.floor(hash01(seedStr) * 0xffffffff)) >>> 0;
  return () => {
    x ^= x << 13; x >>>= 0;
    x ^= x >> 17; x >>>= 0;
    x ^= x << 5; x >>>= 0;
    return (x >>> 0) / 0xffffffff;
  };
}

function permute<T>(arr: T[], seedStr: string): T[] {
  const out = arr.slice();
  const rnd = prng(seedStr);
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

function pickDeterministicFromShapes(
  shapes: ShapeKey[],
  avgIn: number,
  seed?: string | number,
  orderIndex?: number
): ShapeKey {
  const n = shapes.length;
  if (!n) return SHAPES[0];

  const a = clamp01(Number.isFinite(avgIn) ? avgIn : 0.5);
  const seedStr = seed == null ? 'seed:default' : String(seed);

  if (Number.isFinite(orderIndex as number)) {
    const idx = Math.max(0, Math.floor(orderIndex as number));
    const batch = Math.floor(idx / n);
    const pos = idx % n;
    const perm = permute(shapes, `perm:${seedStr}:b${batch}`);
    return perm[pos];
  }

  const base = Math.min(n - 1, Math.floor(a * n));
  const rot = Math.floor(hash01(`rot:${seedStr}`) * n) % n;
  return shapes[(base + rot) % n];
}

function isUniformPool(pool: Array<{ shape: ShapeKey; w: number }>, epsilon = 1e-6) {
  if (pool.length <= 1) return true;
  const first = pool[0].w;
  return pool.every((entry) => Math.abs(entry.w - first) <= epsilon);
}

function weightsToSlots(pool: Array<{ shape: ShapeKey; w: number }>) {
  const maxWeight = Math.max(...pool.map((entry) => entry.w), 1e-6);
  return pool.map((entry) => ({
    shape: entry.shape,
    slots: Math.max(1, Math.round((entry.w / maxWeight) * 4)),
  }));
}

function buildWeightedSequence(
  pool: Array<{ shape: ShapeKey; w: number }>,
  seedStr: string
): ShapeKey[] {
  const weighted = permute(weightsToSlots(pool), `weights:${seedStr}`);
  const totalSlots = weighted.reduce((sum, entry) => sum + entry.slots, 0);
  const current = new Map(weighted.map((entry) => [entry.shape, 0]));
  const sequence: ShapeKey[] = [];

  for (let step = 0; step < totalSlots; step++) {
    let picked = weighted[0];
    let pickedScore = -Infinity;

    for (const entry of weighted) {
      const nextScore = (current.get(entry.shape) ?? 0) + entry.slots;
      current.set(entry.shape, nextScore);
      if (nextScore > pickedScore) {
        picked = entry;
        pickedScore = nextScore;
      }
    }

    current.set(picked.shape, (current.get(picked.shape) ?? 0) - totalSlots);
    sequence.push(picked.shape);
  }

  return sequence;
}

export function shapeForAvg(
  avgIn: number,
  seed?: string | number,
  orderIndex?: number
): ShapeKey {
  return pickDeterministicFromShapes(SHAPES, avgIn, seed, orderIndex);
}

export function sampleShapeForAvg(
  avgIn: number,
  seed?: string | number,
  orderIndex?: number,
  spec: ShapeProbSpec = SHAPE_PROBABILITY_SPEC,
): ShapeKey {
  const avg = clamp01(Number.isFinite(avgIn) ? avgIn : 0.5);
  const seedStr = seed == null ? 'seed:default' : String(seed);

  const pool: Array<{ shape: ShapeKey; w: number }> = [];
  let total = 0;

  for (const shape of SHAPES) {
    const w = getProbAt(spec[shape], avg);
    if (w > 0) {
      pool.push({ shape, w });
      total += w;
    }
  }

  if (pool.length === 0) return shapeForAvg(avgIn, seed, orderIndex);

  if (isUniformPool(pool)) {
    return pickDeterministicFromShapes(
      pool.map((entry) => entry.shape),
      avgIn,
      seed,
      orderIndex
    );
  }

  if (Number.isFinite(orderIndex as number)) {
    const idx = Math.max(0, Math.floor(orderIndex as number));
    const batchSeed = `${seedStr}:weighted:b${Math.floor(idx / Math.max(1, pool.length))}`;
    const sequence = buildWeightedSequence(pool, batchSeed);
    return sequence[idx % sequence.length];
  }

  const rng = hash01(`prob:${seedStr}:${orderIndex ?? ''}`) * total;
  let acc = 0;
  for (const entry of pool) {
    acc += entry.w;
    if (rng <= acc) return entry.shape;
  }

  return pool[pool.length - 1].shape;
}

export type { ShapeKey, ShapeProbSpec };
