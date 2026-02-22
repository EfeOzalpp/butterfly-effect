// src/canvas-engine/multi-canvas-setup/sceneProfile.ts

import type { DeviceType } from "../shared/responsiveness";

import type { CanvasPaddingSpec } from "../adjustable-rules/canvasPadding";
import type { ShapeBands } from "../adjustable-rules/placementRules";
import type { SeparationMetaByShape } from "../adjustable-rules/separationMeta";
import type { PoolSizes } from "../adjustable-rules/poolSizes";
import type { QuotaSpecificationByKind } from "../adjustable-rules/quotaSpecification";
import type { BackgroundSpec } from "../adjustable-rules/backgrounds";

// Profile-level aliases (optional, but keeps call sites readable)
export type PaddingPolicyByDevice = Record<DeviceType, CanvasPaddingSpec | null>;
export type BandsByDevice = ShapeBands;

// Profile
export type SceneProfile = {
  padding: PaddingPolicyByDevice;
  bands: BandsByDevice;
  separationMeta: SeparationMetaByShape;
  poolSizes: PoolSizes;
  quotaSpecification: QuotaSpecificationByKind;
  background: BackgroundSpec;
};