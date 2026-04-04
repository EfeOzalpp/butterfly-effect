import {
  mapBucketRange,
  resolveFootprintBottomRowBucket,
  type FootprintLike,
  type RowHeightBucket,
  type RowHeightBucketContext,
} from "../shared/rowHeightBuckets";

export type ParticleRowBucket = RowHeightBucket;

export function particleRowBucket(
  f: FootprintLike,
  opts: RowHeightBucketContext,
  dedupeEpsilon: number = 0.5
): ParticleRowBucket {
  return resolveFootprintBottomRowBucket(f, opts, dedupeEpsilon);
}

export const particleBucketRange = mapBucketRange;
