// src/canvas-engine/condition/domain.ts

export type { ConditionKind, ShapeName, ShapeKind } from "../adjustable-rules/shapeCatalog";
export { CONDITION_KINDS, SHAPES } from "../adjustable-rules/shapeCatalog";

export type { Size, Variant, ConditionSpec } from "../adjustable-rules/conditions";
export { CONDITIONS } from "../adjustable-rules/conditions";

export type {
  Quota,
  Limits,
  QuotaAnchor,
  QuotaSpecificationByKind,
} from "../adjustable-rules/quotaSpecification";

export { QUOTA_SPECIFICATION } from "../adjustable-rules/quotaSpecification";