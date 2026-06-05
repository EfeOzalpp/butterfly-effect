// src/canvas-engine/scene-rules/canvas-padding/resolve.ts

import { deviceType, type DeviceType } from "../../shared/responsiveness";
import type {
  CanvasPaddingPolicy,
  CanvasPaddingPolicyByDevice,
  CanvasPaddingSpec,
} from "./types";

function positiveModulo(value: number, length: number) {
  return ((value % length) + length) % length;
}

export function resolvePaddingPolicyVariants(
  paddingByDevice: CanvasPaddingPolicy,
  spotlightIndex: number | undefined
): CanvasPaddingPolicyByDevice {
  const variants = paddingByDevice.variants;
  if (!variants?.length) return paddingByDevice;

  if (typeof spotlightIndex !== "number") {
    return variants[0] ?? paddingByDevice;
  }

  return variants[positiveModulo(spotlightIndex, variants.length)];
}

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
