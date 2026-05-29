import { houseHasChimney } from '../../../canvas-engine/shapes/house';
import { resolvePowerVisualKind, type PowerVisualKind } from '../../../canvas-engine/shapes/power';
import { makeSpriteSeedKey } from '../internal/spritePolicy';
import type { ShapeKey, SpriteAssignment } from '../types';

export type SpriteRenderedKind = Exclude<ShapeKey, 'power'> | PowerVisualKind;

export interface SpriteIdentity {
  shape: ShapeKey;
  renderedKind: SpriteRenderedKind;
  label: string;
  copy: string;
  hasChimney?: boolean;
}

const SHAPE_LABELS: Record<Exclude<ShapeKey, 'power'>, string> = {
  clouds: 'cloud',
  snow: 'snow cloud',
  house: 'house',
  sun: 'sun',
  villa: 'villa',
  car: 'car',
  sea: 'pond',
  carFactory: 'workshop',
  bus: 'bus',
  trees: 'tree grove',
};

function sentenceForLabel(label: string) {
  return `You're a ${label}.`;
}

function seedKeyForAssignment(assignment: SpriteAssignment) {
  return makeSpriteSeedKey({
    shape: assignment.shape,
    bucketId: assignment.bucketId,
    variant: assignment.variant,
  });
}

export function resolveSpriteIdentity(assignment: SpriteAssignment): SpriteIdentity {
  const seedKey = seedKeyForAssignment(assignment);

  if (assignment.shape === 'power') {
    const renderedKind = resolvePowerVisualKind({
      liveAvg: assignment.bucketAvg,
      seedKey,
    });
    const label = renderedKind === 'windTurbine' ? 'wind turbine' : 'small factory';
    return {
      shape: assignment.shape,
      renderedKind,
      label,
      copy: sentenceForLabel(label),
    };
  }

  const label = SHAPE_LABELS[assignment.shape];
  const hasChimney = assignment.shape === 'house' ? houseHasChimney(seedKey) : undefined;

  return {
    shape: assignment.shape,
    renderedKind: assignment.shape,
    label,
    copy: sentenceForLabel(label),
    hasChimney,
  };
}
