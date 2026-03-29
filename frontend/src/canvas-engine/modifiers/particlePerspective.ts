type Footprint = { r0: number; c0: number; w: number; h: number };

type ParticlePerspectiveContext = {
  cell?: number;
  cellH?: number;
  rowHeights?: number[];
};

export type ParticleRowBucket = {
  t: number;
  bucketIndex: number;
  bucketCount: number;
  baseTileHeight: number;
  bucketHeight: number;
  buckets: number[];
};

export function particleRowBucket(
  f: Footprint,
  opts: ParticlePerspectiveContext,
  dedupeEpsilon: number = 0.5
): ParticleRowBucket {
  const rowHeights = opts?.rowHeights;
  const fallbackH = opts?.cellH ?? opts?.cell ?? 1;

  if (!Array.isArray(rowHeights) || rowHeights.length < 1) {
    return {
      t: 1,
      bucketIndex: 0,
      bucketCount: 1,
      baseTileHeight: fallbackH,
      bucketHeight: fallbackH,
      buckets: [fallbackH],
    };
  }

  const bottomRow = Math.max(0, Math.min(rowHeights.length - 1, f.r0 + f.h - 1));
  const baseTileHeight = rowHeights[bottomRow] ?? rowHeights[0] ?? fallbackH;
  const sortedHeights = [...rowHeights].sort((a, b) => a - b);
  const buckets: number[] = [];

  for (const h of sortedHeights) {
    if (buckets.length === 0 || Math.abs(h - buckets[buckets.length - 1]) > dedupeEpsilon) {
      buckets.push(h);
    }
  }

  let bucketIndex = 0;
  let bestDist = Infinity;
  for (let i = 0; i < buckets.length; i++) {
    const d = Math.abs(baseTileHeight - buckets[i]);
    if (d < bestDist) {
      bestDist = d;
      bucketIndex = i;
    }
  }

  return {
    t: buckets.length > 1 ? bucketIndex / (buckets.length - 1) : 1,
    bucketIndex,
    bucketCount: buckets.length,
    baseTileHeight,
    bucketHeight: buckets[bucketIndex] ?? baseTileHeight,
    buckets,
  };
}

export function particleBucketRange(t: number, min: number, max: number) {
  return min + (max - min) * t;
}
