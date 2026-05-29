import type { ShapeKey, SpriteVec3 } from '../types';
import type { ShapeAssignment } from './spritePolicy';
import {
  getShapeProfile,
  SPRITE_FOOTPRINT_WORLD_SCALE,
} from '../api/shapeProfiles';
import { DRAWERS } from '../selection/drawers';
import { measureRenderedShapeBounds } from '../textures/measureRenderedBounds';
import { makeSpriteSeedKey } from './spritePolicy';

export interface SpriteWorldGeometry {
  scale: [number, number, number];
  position: SpriteVec3;
  center: [number, number];
  width: number;
  height: number;
}

export function computeSpriteWorldGeometry({
  shape,
  basePosition,
  scale,
  applyVisualOffsets = true,
  assignment,
}: {
  shape: ShapeKey;
  basePosition: SpriteVec3;
  scale: number;
  applyVisualOffsets?: boolean;
  assignment?: ShapeAssignment;
}): SpriteWorldGeometry {
  const profile = getShapeProfile(shape);
  const shapeScaleK = profile.visualScale ?? 1;
  const finalScale = scale * SPRITE_FOOTPRINT_WORLD_SCALE * shapeScaleK;
  const fp = profile.footprint;
  const bl = profile.bleed;
  const totalW = fp.w + (bl?.left ?? 0) + (bl?.right ?? 0);
  const totalH = fp.h + (bl?.top ?? 0) + (bl?.bottom ?? 0);
  const width = finalScale * totalW;
  const height = finalScale * totalH;
  const position: SpriteVec3 = [...basePosition];
  const renderedBounds =
    !applyVisualOffsets && profile.interactionBounds === "renderedShape" && assignment && DRAWERS[shape]
      ? measureRenderedShapeBounds({
          drawer: DRAWERS[shape],
          footprint: fp,
          bleed: bl,
          seedKey: makeSpriteSeedKey({
            shape,
            bucketId: assignment.bucketId,
            variant: assignment.variant,
          }),
          liveAvg: assignment.bucketAvg,
        })
      : null;

  const renderedCenterX = renderedBounds ? (bl?.left ?? 0) + renderedBounds.centerX : null;
  const renderedCenterY = renderedBounds ? (bl?.bottom ?? 0) + (fp.h - renderedBounds.centerY) : null;
  const offsetX = bl
    ? ((bl.right ?? 0) - (bl.left ?? 0)) * width / (2 * totalW)
    : 0;
  const offsetY = height * (profile.anchorBiasY ?? 0) + (
    bl ? ((bl.top ?? 0) - (bl.bottom ?? 0)) * height / (2 * totalH) : 0
  );
  const centerX = renderedCenterX !== null
    ? renderedCenterX / Math.max(0.0001, totalW)
    : 0.5 - offsetX / Math.max(0.0001, width);
  const centerY = renderedCenterY !== null
    ? renderedCenterY / Math.max(0.0001, totalH)
    : 0.5 - offsetY / Math.max(0.0001, height);

  return {
    scale: [width, height, 1],
    position,
    center: [centerX, centerY],
    width,
    height,
  };
}
