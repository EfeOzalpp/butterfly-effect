// src/graph-runtime/dotgraph/event-handlers/zoomTarget.ts
export function computeInitialZoomTarget(params: {
  count: number;
  isSmallScreen: boolean;
  isTabletLike: boolean;
  thresholds: { mobile: number; tablet: number; desktop: number };
  minRadius: number;
  maxRadius: number;
}) {
  const { count, isSmallScreen, isTabletLike, thresholds, minRadius, maxRadius } = params;

 const THRESH = isSmallScreen
    ? thresholds.mobile
    : isTabletLike
      ? thresholds.tablet
      : thresholds.desktop;

  const near = isSmallScreen ? 136 : 128;
  const far = maxRadius;

  const K_RATIO = 0.6;
  const K = Math.max(1, (THRESH || 70) * K_RATIO);
  const BETA = 5.5;
  const MIN_FILL = 0.08; // floor so small datasets don't collapse to near-minimum zoom

  const smooth = (s: number) => (s * s) * (3 - 2 * s);
  const rawFill = count / (count + K);
  const curved = Math.pow(rawFill, BETA);
  const baseFill = Math.max(MIN_FILL, smooth(Math.min(1, Math.max(0, curved))));

  // Large datasets should start a bit more zoomed in. In this camera model,
  // that means reducing the orbit radius after count clears the device
  // threshold, while keeping smaller graphs on the original curve.
  const overflowRatio = Math.max(0, count - THRESH) / Math.max(1, THRESH);
  const largeDataBoost = smooth(Math.min(1, overflowRatio / 1.6));
  const fill = Math.max(MIN_FILL, baseFill * (1 - 0.3 * largeDataBoost));

  return Math.max(minRadius, Math.min(far, near + (far - near) * fill));
}
