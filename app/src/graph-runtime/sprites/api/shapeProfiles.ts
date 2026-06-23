import { deviceType, getViewportSize, type DeviceType } from '../../../canvas-engine/shared/responsiveness';
import type { ShapeKey, SpriteBleed, SpriteBoundsPaddingSpec, SpriteFootprint } from '../types';

// Per-shape sprite facts. Keep object/texture geometry here; camera-specific
// interaction behavior belongs in dotgraph/interaction.
interface SpriteParticleProfile {
  enabled?: boolean;
  scaleBoost?: Partial<Record<DeviceType, number>>;
}

interface ShapeProfile {
  footprint: SpriteFootprint;
  // Visual-only texture padding. Use interactionPadding for hitboxes.
  bleed?: SpriteBleed;
  interactionBounds?: 'profile' | 'renderedShape';
  visualScale?: number;
  anchorBiasY?: number;
  tooltipAnchorBiasY?: number;
  interactionPadding?: SpriteBoundsPaddingSpec;
  interactionScale?: number;
  particles?: SpriteParticleProfile;
}

export const SPRITE_FOOTPRINT_WORLD_SCALE = 1 / 2;

const SHAPE_PROFILES: Record<ShapeKey, ShapeProfile> = {
  clouds: {
    footprint: { w: 2, h: 3 },
    bleed: { top: 0.5, right: 0.5, bottom: 0.5, left: 0.5 },
    interactionPadding: { top: 0, right: 0, bottom: -1.5, left: 0 },
    particles: {
      enabled: true,
      scaleBoost: { laptop: 2.4, tablet: 1.8, mobile: 1.6 },
    },
  },
  bus: {
    footprint: { w: 2, h: 1 },
  },
  snow: {
    footprint: { w: 1, h: 3 },
    visualScale: 0.9,
    bleed: { top: 0.5, left: 1, right: 1 },
     interactionPadding: { top: [0, -0.5], right: 0.2, left: 0.2, bottom: -1.5 },
    particles: {
      enabled: true,
      scaleBoost: { laptop: 1.4, tablet: 1.4, mobile: 1.3 },
    },
  },
  house: {
    footprint: { w: 1, h: 4 },
    interactionBounds: 'renderedShape',
    bleed: { top: 2 },
    particles: {
      enabled: true,
      scaleBoost: { laptop: 1.5, tablet: 1.5, mobile: 1.35 },
    },
  },
  power: {
    footprint: { w: 1, h: 3 },
    particles: { enabled: true },
    bleed: { top: 3, left: 3, right: 3 },
    interactionPadding: { top: [-1, 0], right: 0, bottom: 0, left: 0 },
  },
  sun: {
    bleed: { top: 1, right: 1, bottom: 1, left: 1 },
    footprint: { w: 1, h: 1 },
    interactionScale: 0.9,
  },
  villa: {
    footprint: { w: 2, h: 2 },
    interactionPadding: { top: -0.3 },
    bleed: { left: 1 },
  },
  car: {
    footprint: { w: 1, h: 1 },
    visualScale: 0.86,
    anchorBiasY: -0.14,
  },
  sea: {
    footprint: { w: 2, h: 1 },
    bleed: { top: 0.1, bottom: 0.4, right: 1, left: 1 },
    particles: {
      enabled: true,
      scaleBoost: { laptop: 1.15, tablet: 1.15, mobile: 1.1 },
    },
  },
  carFactory: {
    footprint: { w: 2, h: 2 },
    particles: { 
      enabled: true, 
      scaleBoost: { laptop: 1.5, tablet: 1.5, mobile: 1.5 },
    },
    bleed: { top: 2, right: 0.1, bottom: 0, left: 0.1 },
    interactionPadding: { top: [-0.2, -0.7], right: 0, bottom: 0, left: 0 },
  },
  trees: {
    footprint: { w: 1, h: 1 },
    bleed: { top: 1.5, right: 0.1, bottom: 0, left: 0.1 },
    interactionPadding: { top: 0.5, right: 0, bottom: 0, left: 0 },
  },
};

export function getShapeProfile(shape: ShapeKey): ShapeProfile {
  return SHAPE_PROFILES[shape];
}

export function resolveParticleScaleBoost(shape: ShapeKey, dev?: DeviceType): number | undefined {
  const boost = getShapeProfile(shape).particles?.scaleBoost;
  if (!boost) return undefined;
  const d = dev ?? deviceType(getViewportSize().w);
  return boost[d];
}

export const PARTICLE_SHAPES = new Set<ShapeKey>(
  (Object.keys(SHAPE_PROFILES) as ShapeKey[]).filter(
    (shape) => SHAPE_PROFILES[shape].particles?.enabled
  )
);

// Convenience maps for internal texture/runtime call sites.
export const FOOTPRINTS = Object.fromEntries(
  (Object.keys(SHAPE_PROFILES) as ShapeKey[]).map((shape) => [
    shape,
    SHAPE_PROFILES[shape].footprint,
  ])
) as Record<ShapeKey, SpriteFootprint>;

export const BLEED = Object.fromEntries(
  (Object.keys(SHAPE_PROFILES) as ShapeKey[])
    .filter((shape) => SHAPE_PROFILES[shape].bleed)
    .map((shape) => [shape, SHAPE_PROFILES[shape].bleed])
) as Partial<Record<ShapeKey, SpriteBleed>>;


