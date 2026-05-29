import type { ShapeAssignment } from "./internal/spritePolicy";
import type { ShapeKey } from "./selection/types";

// Contracts shared between dotgraph and sprites. This is the shape of the boundary,
// while the texture/cache details stay inside the sprites folder.
export type { ShapeKey };

export type SpriteAssignment = ShapeAssignment;
export type SpriteVec3 = [number, number, number];

export interface SpriteFootprint {
  w: number;
  h: number;
}

export type SpriteBoundsPaddingValue = number | [far: number, near: number];

// Tile-relative hitbox padding. Positive values grow the interaction bounds;
// negative values shrink them inward from the footprint. A tuple means
// [far-from-camera value, close-to-camera value].
export interface SpriteBoundsPaddingSpec {
  top?: SpriteBoundsPaddingValue;
  right?: SpriteBoundsPaddingValue;
  bottom?: SpriteBoundsPaddingValue;
  left?: SpriteBoundsPaddingValue;
}

export interface SpriteBoundsPadding {
  top?: number;
  right?: number;
  bottom?: number;
  left?: number;
}

export interface SpriteVisualLayout {
  scale: [number, number, number];
  offset: [number, number, number];
  center: [number, number];
  visualOffset: [number, number, number];
  aspect: number;
  tileWorld: number;
  footprint: SpriteFootprint;
  boundsSize: SpriteFootprint;
  boundsPadding: Required<SpriteBoundsPadding>;
  boundsPaddingSpec: Required<SpriteBoundsPaddingSpec>;
  tooltipBiasY: number;
}

export interface SpriteVisual {
  shape: ShapeKey;
  assignment?: SpriteAssignment;
  layout: SpriteVisualLayout;
}

// Props accepted by the Three sprite component. Most callers should still go
// through the public helpers so shape assignment stays consistent.
export interface SpriteShapeProps {
  avg: number;
  seed?: string | number;
  orderIndex?: number;
  position?: SpriteVec3;
  scale?: number;
  tileSize?: number;
  alpha?: number;
  blend?: number;
  opacity?: number;
  particleFrames?: number;
  particleStepMs?: number;
  variantSlots?: number;
  variantSeed?: string | number;
  darkMode?: boolean;
  occasionalRefreshMs?: number;
  enableDepthFog?: boolean;
  worldPosition?: SpriteVec3;
  centerAtPosition?: boolean;
  suspendQualityUpdates?: boolean;
  texturePriority?: number;
  assignment?: SpriteAssignment;
}
