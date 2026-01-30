// src/canvas-engine/adjustable-rules/resolveCanvasPadding.ts

import { deviceType, type DeviceType } from "../shared/responsiveness";
import type { CanvasPaddingSpec } from "./canvasPadding";

export function resolveCanvasPaddingSpec(
  w: number,
  paddingByDevice: Record<DeviceType, CanvasPaddingSpec>
): CanvasPaddingSpec {
  const band = deviceType(w);
  const spec = paddingByDevice[band];
  if (!spec) throw new Error(`Missing padding spec for band: ${band}. Keys: ${Object.keys(paddingByDevice).join(", ")}`);
  return spec;
}

