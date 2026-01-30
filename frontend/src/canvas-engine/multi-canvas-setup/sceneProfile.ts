// src/canvas-engine/multi-canvas-setup/sceneProfile.ts

import type { DeviceType } from "../shared/responsiveness";
import type { CanvasPaddingSpec } from "../adjustable-rules/canvasPadding";
import type { ShapeBands } from "../adjustable-rules/placementRules";
import type { ConditionKind } from "../condition/domain";
import type { QuotaAnchor } from "../adjustable-rules/quotaSpecification";

import type { PoolSizes } from "../adjustable-rules/poolSizes";

// Shared
export type ShapeMeta = {
  layer: "sky" | "ground";
  group: "sky" | "building" | "vehicle" | "nature";
  separation?: number;
};

export type PaddingPolicyByDevice = Record<DeviceType, CanvasPaddingSpec>;
export type BandsByDevice = ShapeBands;
export type QuotaCurvesByKind = Record<ConditionKind, QuotaAnchor[]>;

// Profile
export type SceneProfile = {
  padding: PaddingPolicyByDevice;
  bands: BandsByDevice;
  shapeMeta: Record<string, ShapeMeta>;
  poolSizes: PoolSizes;
  quotaCurves: QuotaCurvesByKind;
};
