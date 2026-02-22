// src/canvas-engine/runtime/layout/padding.ts

import { CANVAS_PADDING } from "../../adjustable-rules/canvasPadding";
import type { CanvasPaddingSpec } from "../../adjustable-rules/canvasPadding";
import type { SceneLookupKey } from "../../adjustable-rules/sceneMode";
import { resolveCanvasPaddingSpec } from "../../adjustable-rules/resolveCanvasPadding";

/**
 * Runtime padding policy.
 * - If override is set, use it.
 * - Otherwise resolve from CANVAS_PADDING for current lookup key.
 *
 * NOTE: CANVAS_PADDING entries can contain `null` for a device, and
 * resolveCanvasPaddingSpec should implement fallback behavior.
 */
export function getPaddingSpecForState(
  widthPx: number,
  sceneLookupKey: SceneLookupKey,
  override: CanvasPaddingSpec | null
): CanvasPaddingSpec {
  if (override) return override;

  const byDevice = CANVAS_PADDING[sceneLookupKey] ?? CANVAS_PADDING.start;
  return resolveCanvasPaddingSpec(widthPx, byDevice);
}