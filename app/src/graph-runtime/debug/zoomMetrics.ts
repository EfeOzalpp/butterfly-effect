const GRAPH_ZOOM_METRIC_NAMES = [
  'wheelEvents',
  'touchMoveEvents',
  'zoomFrames',
  'radiusStateUpdates',
  'zoomTexturePauses',
  'zoomTextureResumes',
  'tileSizeUpdates',
  'qualityChecks',
  'qualityUpgradeSchedules',
  'qualityUpgradeApplies',
  'qualityDowngrades',
] as const;

type GraphZoomMetricName = (typeof GRAPH_ZOOM_METRIC_NAMES)[number];

export type GraphZoomMetrics = Partial<Record<GraphZoomMetricName, number>> & {
  reset?: () => void;
};

function attachReset(metrics: GraphZoomMetrics) {
  metrics.reset = () => {
    for (const key of GRAPH_ZOOM_METRIC_NAMES) {
      metrics[key] = undefined;
    }
  };
  return metrics;
}

const createMetrics = (): GraphZoomMetrics => attachReset({});

function metricsEnabled() {
  if (typeof window === 'undefined') return false;
  return window.__GP_TRACK_ZOOM_METRICS === true || window.__GP_ZOOM_METRICS != null;
}

export function bumpZoomMetric(name: GraphZoomMetricName, amount = 1) {
  if (!metricsEnabled()) return;
  window.__GP_ZOOM_METRICS ??= createMetrics();
  if (!window.__GP_ZOOM_METRICS.reset) {
    attachReset(window.__GP_ZOOM_METRICS);
  }
  window.__GP_ZOOM_METRICS[name] = (window.__GP_ZOOM_METRICS[name] ?? 0) + amount;
}
