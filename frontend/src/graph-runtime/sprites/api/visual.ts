import {
  chooseShape,
  getOrAssignShapeEntry,
  DEFAULT_VARIANT_SLOTS,
} from "../internal/spritePolicy";
import { FOOTPRINTS } from "../selection/footprints";

import type {
  ShapeKey,
  SpriteAssignment,
  SpriteBleed,
  SpriteVisual,
  SpriteVisualLayout,
} from "../types";

// Dotgraph gives us graph facts; sprites decide the visual implementation.
// This keeps shape selection and footprint math out of the scene layer.
const EMPTY_BLEED: Required<SpriteBleed> = {
  top: 0,
  right: 0,
  bottom: 0,
  left: 0,
};

const INTERACTION_BLEED: Partial<Record<ShapeKey, SpriteBleed>> = {
  trees: { top: 0.28 },
};

function normalizeBleed(bleed?: SpriteBleed): Required<SpriteBleed> {
  return {
    top: bleed?.top ?? 0,
    right: bleed?.right ?? 0,
    bottom: bleed?.bottom ?? 0,
    left: bleed?.left ?? 0,
  };
}

export function getOrAssignSprite(args: {
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

export function resolveSpriteShape(args: {
  avg: number;
  seed: string | number;
  orderIndex: number;
  assignment?: SpriteAssignment;
}): ShapeKey {
  return args.assignment?.shape ?? chooseShape(args);
}

export function resolveSpriteVisualLayout(args: {
  shape: ShapeKey;
  baseScale: number;
  bleed?: SpriteBleed;
}): SpriteVisualLayout {
  const footprint = FOOTPRINTS[args.shape];
  const bleed = normalizeBleed(args.bleed);
  // Interaction layout uses the same footprint compensation as rendering, so
  // hover/click areas do not drift away from the visible sprite.
  const aspect = footprint.w / Math.max(0.0001, footprint.h);
  const scaleCompX = 1 / (1 + bleed.left + bleed.right);
  const scaleCompY = 1 / (1 + bleed.top + bleed.bottom);

  return {
    scale: [args.baseScale * aspect * scaleCompX, args.baseScale * scaleCompY, 1],
    aspect,
    footprint,
    bleed,
  };
}

export function resolveSpriteVisual(args: {
  entryId?: string | null;
  sectionKey: string;
  avg: number;
  seed: string | number;
  orderIndex: number;
  baseScale: number;
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
      bleed: INTERACTION_BLEED[shape] ?? EMPTY_BLEED,
    }),
  };
}
