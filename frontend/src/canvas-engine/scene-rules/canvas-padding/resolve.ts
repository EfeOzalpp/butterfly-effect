// src/canvas-engine/scene-rules/canvas-padding/resolve.ts

import { deviceType, type DeviceType } from "../../shared/responsiveness";
import type { CanvasPaddingSpec } from "./types";

// Pick the padding spec that matches the current rule width/device band.
export function resolvePaddingSpec(
  w: number,
  paddingByDevice: Record<DeviceType, CanvasPaddingSpec | null>
): CanvasPaddingSpec {
  const band = deviceType(w);
  const spec = paddingByDevice[band];
  if (!spec) {
    throw new Error(`Missing padding spec for band: ${band}. Keys: ${Object.keys(paddingByDevice).join(", ")}`);
  }
  return spec;
}
