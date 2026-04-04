export type FootprintLike = { r0: number; c0: number; w: number; h: number };

export type RowHeightBucketContext = {
  cell?: number;
  cellH?: number;
  rowHeights?: number[];
};

export type RowHeightBucket = {
  t: number;
  bucketIndex: number;
  bucketCount: number;
  baseTileHeight: number;
  bucketHeight: number;
  buckets: number[];
};

export function buildRowHeightBuckets(
  rowHeights: number[] | undefined,
  fallbackH: number,
  dedupeEpsilon: number = 0.5
): number[] {
  if (!Array.isArray(rowHeights) || rowHeights.length < 1) {
    return [fallbackH];
  }

  const sortedHeights = [...rowHeights].sort((a, b) => a - b);
  const buckets: number[] = [];

  for (const h of sortedHeights) {
    if (buckets.length === 0 || Math.abs(h - buckets[buckets.length - 1]) > dedupeEpsilon) {
      buckets.push(h);
    }
  }

  return buckets.length > 0 ? buckets : [fallbackH];
}

export function resolveRowHeightBucketFromHeight(
  baseTileHeight: number,
  rowHeights: number[] | undefined,
  fallbackH: number,
  dedupeEpsilon: number = 0.5
): RowHeightBucket {
  const buckets = buildRowHeightBuckets(rowHeights, fallbackH, dedupeEpsilon);

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

export function resolveFootprintBottomRowBucket(
  f: FootprintLike,
  opts: RowHeightBucketContext,
  dedupeEpsilon: number = 0.5
): RowHeightBucket {
  const rowHeights = opts?.rowHeights;
  const fallbackH = opts?.cellH ?? opts?.cell ?? 1;

  if (!Array.isArray(rowHeights) || rowHeights.length < 1) {
    return resolveRowHeightBucketFromHeight(fallbackH, rowHeights, fallbackH, dedupeEpsilon);
  }

  const bottomRow = Math.max(0, Math.min(rowHeights.length - 1, f.r0 + f.h - 1));
  const baseTileHeight = rowHeights[bottomRow] ?? rowHeights[0] ?? fallbackH;
  return resolveRowHeightBucketFromHeight(baseTileHeight, rowHeights, fallbackH, dedupeEpsilon);
}

export function mapBucketRange(t: number, min: number, max: number) {
  return min + (max - min) * t;
}
