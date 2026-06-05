const SPRITE_CACHE_METRIC_NAMES = [
  'quantizationCalls',
  'quantizationDisabledCalls',
  'assignmentCacheHits',
  'assignmentCacheMisses',
  'registryGetHits',
  'registryGetMisses',
  'ensureCacheHits',
  'ensureInFlightDedupes',
  'textureBuildsQueued',
  'textureBuildsCompleted',
  'textureBuildFailures',
] as const;

type SpriteCacheMetricName = (typeof SPRITE_CACHE_METRIC_NAMES)[number];

export type SpriteCacheMetrics = Partial<Record<SpriteCacheMetricName, number>> & {
  bucketCounts?: Record<string, number>;
  staticKeys?: Set<string>;
  reset?: () => void;
};

function attachReset(metrics: SpriteCacheMetrics) {
  metrics.reset = () => {
    for (const key of SPRITE_CACHE_METRIC_NAMES) {
      metrics[key] = undefined;
    }
    delete metrics.bucketCounts;
    delete metrics.staticKeys;
  };
  return metrics;
}

const createMetrics = (): SpriteCacheMetrics => attachReset({});

function metricsEnabled() {
  if (typeof window === 'undefined') return false;
  return (
    window.__GP_TRACK_SPRITE_CACHE_METRICS === true ||
    window.__GP_SPRITE_CACHE_METRICS != null
  );
}

function getMetrics() {
  if (!metricsEnabled()) return null;
  window.__GP_SPRITE_CACHE_METRICS ??= createMetrics();
  if (!window.__GP_SPRITE_CACHE_METRICS.reset) {
    attachReset(window.__GP_SPRITE_CACHE_METRICS);
  }
  return window.__GP_SPRITE_CACHE_METRICS;
}

export function bumpSpriteCacheMetric(name: SpriteCacheMetricName, amount = 1) {
  const metrics = getMetrics();
  if (!metrics) return;
  metrics[name] = (metrics[name] ?? 0) + amount;
}

export function recordSpriteBucket(bucketId: number) {
  const metrics = getMetrics();
  if (!metrics) return;
  metrics.bucketCounts ??= {};
  const key = String(bucketId);
  metrics.bucketCounts[key] = (metrics.bucketCounts[key] ?? 0) + 1;
}

export function recordStaticTextureKey(key: string) {
  const metrics = getMetrics();
  if (!metrics) return;
  metrics.staticKeys ??= new Set<string>();
  metrics.staticKeys.add(key);
}
