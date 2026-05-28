import {
  chooseShape,
  getOrAssignShapeEntry,
  DEFAULT_VARIANT_SLOTS,
} from "../internal/spritePolicy";
import { ANCHOR_BIAS_Y, FOOTPRINTS, VISUAL_SCALE } from "../selection/footprints";

import type {
  ShapeKey,
  SpriteAssignment,
  SpriteBoundsPadding,
  SpriteVisual,
  SpriteVisualLayout,
} from "../types";

// Dotgraph gives us graph facts; sprites decide the visual implementation.
// This keeps shape selection and footprint math out of the scene layer.
const EMPTY_BOUNDS_PADDING: Required<SpriteBoundsPadding> = {
  top: 0,
  right: 0,
  bottom: 0,
  left: 0,
};

const INTERACTION_BOUNDS_PADDING: Partial<Record<ShapeKey, SpriteBoundsPadding>> = {
  clouds: { bottom: -1 },
  house: { top: -0.5 },
  trees: { top: -0.15, left: -0.1, right: -0.1  },
  car: { top: -0.25 },
  carFactory: { top: -0.8, left: -0.1, right: -0.4 },
  sea: { top: -0.125, bottom: -0.125 },
  sun: { top: -0.5, left: -0.5, right: -0.5, bottom: -0.5 }
};

function normalizeBoundsPadding(bounds?: SpriteBoundsPadding): Required<SpriteBoundsPadding> {
  return {
    top: bounds?.top ?? 0,
    right: bounds?.right ?? 0,
    bottom: bounds?.bottom ?? 0,
    left: bounds?.left ?? 0,
  };
}

function resolveBoundedSize(size: number, before: number, after: number): number {
  return Math.max(0.05, size + before + after);
}

function getOrAssignSprite(args: {
  entryId?: string | null;
  sectionKey: string;
  avg: number;
  seed: string | number;
  orderIndex: number;
  variantSlots?: number;
}): SpriteAssignment | undefined {
  if (!args.entryId) return undefined;

  // Stable assignment keeps the same respondent looking like the same sprite
  // while React and Three rerender around it.
  return getOrAssignShapeEntry(
    args.entryId,
    args.sectionKey,
    args.avg,
    args.seed,
    args.orderIndex,
    args.variantSlots ?? DEFAULT_VARIANT_SLOTS
  );
}

function resolveSpriteShape(args: {
  avg: number;
  seed: string | number;
  orderIndex: number;
  assignment?: SpriteAssignment;
}): ShapeKey {
  return args.assignment?.shape ?? chooseShape(args);
}

function resolveSpriteVisualLayout(args: {
  shape: ShapeKey;
  baseScale: number;
  hitboxScale?: number;
  boundsPadding?: SpriteBoundsPadding;
}): SpriteVisualLayout {
  const footprint = FOOTPRINTS[args.shape];
  const boundsPadding = normalizeBoundsPadding(args.boundsPadding);
  const hitboxScale = args.hitboxScale ?? 1;
  // Hitboxes start from the footprint scale, then apply explicit interaction
  // padding. Texture bleed is for clipping safety and does not participate here.
  const finalScale = args.baseScale * (VISUAL_SCALE[args.shape] ?? 1);
  const baseMaxSide = Math.max(footprint.w, footprint.h) || 1;
  const totalW = resolveBoundedSize(footprint.w, boundsPadding.left, boundsPadding.right);
  const totalH = resolveBoundedSize(footprint.h, boundsPadding.top, boundsPadding.bottom);
  // Base sizes used for offset/anchor — hitboxScale must not drift the center
  const sxBase = finalScale * (totalW / baseMaxSide);
  const syBase = finalScale * (totalH / baseMaxSide);
  const offsetX = finalScale * ((boundsPadding.right - boundsPadding.left) / 2) / baseMaxSide;
  const offsetY = finalScale * ((boundsPadding.top - boundsPadding.bottom) / 2) / baseMaxSide;

  return {
    scale: [sxBase * hitboxScale, syBase * hitboxScale, 1],
    offset: [offsetX, offsetY + syBase * (ANCHOR_BIAS_Y[args.shape] ?? 0), 0],
    aspect: totalW / Math.max(0.0001, totalH),
    footprint,
    boundsPadding,
  };
}

export function resolveSpriteVisual(args: {
  entryId?: string | null;
  sectionKey: string;
  avg: number;
  seed: string | number;
  orderIndex: number;
  baseScale: number;
  hitboxScale?: number;
}): SpriteVisual {
  const assignment = getOrAssignSprite(args);
  const shape = resolveSpriteShape({
    avg: args.avg,
    seed: args.seed,
    orderIndex: args.orderIndex,
    assignment,
  });

  return {
    shape,
    assignment,
    layout: resolveSpriteVisualLayout({
      shape,
      baseScale: args.baseScale,
      hitboxScale: args.hitboxScale,
      boundsPadding: INTERACTION_BOUNDS_PADDING[shape] ?? EMPTY_BOUNDS_PADDING,
    }),
  };
}
