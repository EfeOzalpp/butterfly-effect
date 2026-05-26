import type {
  BackgroundAnchorContext,
  BackgroundStopK,
  RgbaStop,
} from "../../../../scene-rules/backgrounds";
import type { CanvasPaddingSpec } from "../../../../scene-rules/canvas-padding";
import type { GridMetrics } from "../../../geometry/gridCache";
import type { PLike } from "../../../p/makeP";
import { clamp01 } from "../../../../shared/math";
import { resolveHorizonRow } from "../shared/horizon";

function resolveAnchorK(anchor: Exclude<BackgroundStopK, number>, anchors?: BackgroundAnchorContext) {
  const baseK = anchors?.visualHorizonK;
  const resolvedBaseK = baseK ?? 0.5;
  const offset = typeof anchor === "string" ? 0 : anchor.offset ?? 0;
  return clamp01((Number.isFinite(resolvedBaseK) ? resolvedBaseK : 0.5) + offset);
}

export function resolveStopKValue(k: BackgroundStopK, anchors?: BackgroundAnchorContext) {
  return typeof k === "number" ? clamp01(k) : resolveAnchorK(k, anchors);
}

export function resolveStopK(stop: RgbaStop, t: number, anchors?: BackgroundAnchorContext) {
  const baseK = resolveStopKValue(stop.k, anchors);
  return stop.oscK
    ? clamp01(baseK + stop.oscK.amp * Math.sin(2 * Math.PI * stop.oscK.hz * t))
    : baseK;
}

export function createBackgroundAnchorContext(args: {
  p: PLike;
  padding: CanvasPaddingSpec;
  metrics: GridMetrics;
}): BackgroundAnchorContext {
  const { p, padding, metrics } = args;
  const h = Math.max(1, p.height);
  const fallbackHorizonRow = resolveHorizonRow(metrics.rowHeights);
  const fallbackVisualY = metrics.rowOffsetY[fallbackHorizonRow] ?? h * 0.5;
  const visualHorizonK = clamp01(
    typeof padding.horizonPos === "number" ? padding.horizonPos : fallbackVisualY / h
  );

  return {
    visualHorizonK,
  };
}

export function backgroundAnchorCacheKey(anchors?: BackgroundAnchorContext) {
  if (!anchors) return "anchors:none";
  return `anchors:${anchors.visualHorizonK.toFixed(4)}`;
}
