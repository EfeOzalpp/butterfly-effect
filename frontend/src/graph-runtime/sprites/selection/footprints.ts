// graph-runtime/sprites/selection/footprints.ts
import type { ShapeKey } from './types';
import { deviceType, getViewportSize, type DeviceType } from '../../../canvas-engine/shared/responsiveness';

// Footprint is the art's intended tile size before transparent padding is added.
// It controls aspect ratio and keeps sprite scale consistent across texture swaps.
export const FOOTPRINTS: Record<ShapeKey, { w: number; h: number }> = {
  clouds: { w: 2, h: 3 },
  bus: { w: 2, h: 1 },
  snow: { w: 1, h: 3 },
  house:{ w: 1, h: 3 },
  power:{ w: 1, h: 3 },
  sun:  { w: 2, h: 2 },
  villa:{ w: 2, h: 2 },
  car:  { w: 1, h: 1 },
  sea:  { w: 2, h: 1 },
  carFactory: { w: 2, h: 2 },
  trees: { w: 1, h: 1 },
};

// Bleed is extra transparent room around the drawing. Particle trails, shadows,
// and oversized shapes need this so the canvas texture does not clip them.
export const BLEED: Partial<Record<ShapeKey, { top?: number; right?: number; bottom?: number; left?: number }>> = {
  trees: { top: 0.75, left: 0.08, right: 0.08, bottom: 0.10 },
  clouds:{ top: 0.35, left: 0.18, right: 0.35, bottom: 0.35 },
  snow:  { top: 0.10, bottom: 0.10, left: 0.35, right: 0.35 },
  villa: { top: 0.08, bottom: 0.12, left: 0.08, right: 0.08 },
  house: { top: 0, bottom: 0, left: 0, right: 0 },
  power: { top: 0.08, bottom: 0.12, left: 0.5, right: 0.5 },
  carFactory: { top: 2.0, bottom: 0.12, left: 0.12, right: 0.12 },
  sea:   { top: 0.10, bottom: 0.4, left: 1, right: 1 },
  car:   { top: 0.16, bottom: 0.28, left: 0.36, right: 0.36 },
  bus:   { top: 0.06, bottom: 0.08, left: 0.10, right: 0.10 },
  sun:   { top: 2, bottom: 2, left: 2, right: 2 },
};

// Final art-direction nudges for shapes whose visual center differs from their texture center.
export const VISUAL_SCALE: Partial<Record<ShapeKey, number>> = { car: 0.86, snow: 0.9 };
export const ANCHOR_BIAS_Y: Partial<Record<ShapeKey, number>> = { car: -0.14 };

// These shapes have particle/detail systems, so we build frozen textures for them.
export const PARTICLE_SHAPES = new Set<ShapeKey>(['snow', 'clouds', 'house', 'sea', 'carFactory', 'power']);

// Extra pixelScale multiplier for particle-heavy shapes per device breakpoint.
export const PARTICLE_SCALE_BOOST: Partial<Record<ShapeKey, Record<DeviceType, number>>> = {
  snow:   { laptop: 1.2, tablet: 1.1, mobile: 0.7 },
  clouds: { laptop: 2.5, tablet: 1.5, mobile: 1.2 },
  sea:    { laptop: 1.6, tablet: 1.0, mobile: 0.8 },
  house:  { laptop: 2.0, tablet: 1.5, mobile: 1.0 },
};

export function resolveParticleScaleBoost(shape: ShapeKey, dev?: DeviceType): number | undefined {
  const entry = PARTICLE_SCALE_BOOST[shape];
  if (!entry) return undefined;
  const d = dev ?? deviceType(getViewportSize().w);
  return entry[d];
}
