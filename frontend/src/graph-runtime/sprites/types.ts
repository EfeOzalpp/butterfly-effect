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

// Tile-relative hitbox padding. Positive values grow the interaction bounds;
// negative values shrink them inward from the footprint.
export interface SpriteBoundsPadding {
  top?: number;
  right?: number;
  bottom?: number;
  left?: number;
}

export interface SpriteVisualLayout {
  scale: [number, number, number];
  offset: [number, number, number];
  aspect: number;
  footprint: SpriteFootprint;
  boundsPadding: Required<SpriteBoundsPadding>;
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
  freezeParticles?: boolean;
  particleFrames?: number;
  particleStepMs?: number;
  variantSlots?: number;
  variantSeed?: string | number;
  darkMode?: boolean;
  occasionalRefreshMs?: number;
  enableDepthFog?: boolean;
  worldPosition?: SpriteVec3;
  assignment?: SpriteAssignment;
}
