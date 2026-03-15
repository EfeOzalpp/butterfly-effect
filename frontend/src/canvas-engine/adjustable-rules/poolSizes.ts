// src/canvas-engine/adjustable-rules/poolSizes.ts

import { deviceType, type DeviceType } from "../shared/responsiveness";
import { SceneLookupKey } from "./sceneMode";

// types
// device-level (mode-resolved)
export type PoolSizes = Record<DeviceType, number>;

// mode-level table (ruleset-owned)
export type PoolSizesByMode = Record<SceneLookupKey, PoolSizes>;

// policy
export const POOL_SIZES: PoolSizesByMode = {
  start:         { mobile: 18, tablet: 26, laptop: 24 },
  questionnaire: { mobile: 24, tablet: 32, laptop: 44 },
  city:          { mobile: 40, tablet: 55, laptop: 70 },
};

// helpers
function deviceTypeOrDefault(width?: number): DeviceType {
  if (width == null) return "laptop";
  return deviceType(width);
}

/**
 * Mode is already resolved by the ruleset
 */
export function targetPoolSize(
  poolSizes: PoolSizes,
  width?: number
): number {
  const dt = deviceTypeOrDefault(width);
  return poolSizes[dt];
}
