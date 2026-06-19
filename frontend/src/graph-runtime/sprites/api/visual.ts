import {
  chooseShape,
  getOrAssignShapeEntry,
  DEFAULT_VARIANT_SLOTS,
  makeSpriteSeedKey,
} from "../internal/spritePolicy";
import {
  getShapeProfile,
  SPRITE_FOOTPRINT_WORLD_SCALE,
} from "./shapeProfiles";
import { DRAWERS } from "../selection/drawers";
import { measureRenderedShapeBounds } from "../textures/measureRenderedBounds";

import type {
  ShapeKey,
  SpriteAssignment,
  SpriteBoundsPadding,
  SpriteBoundsPaddingSpec,
  SpriteBoundsPaddingValue,
  SpriteVisual,
  SpriteVisualLayout,
} from "../types";

// Dotgraph gives us graph facts; sprites decide the visual implementation.
// This keeps shape selection and footprint math out of the scene layer.
function normalizeBoundsPaddingSpec(bounds?: SpriteBoundsPaddingSpec): Required<SpriteBoundsPaddingSpec> {
  return {
    top: bounds?.top ?? 0,
    right: bounds?.right ?? 0,
    bottom: bounds?.bottom ?? 0,
    left: bounds?.left ?? 0,
  };
}

function farPaddingValue(value: SpriteBoundsPaddingValue): number {
  return Array.isArray(value) ? value[0] : value;
}

function resolveStaticBoundsPadding(bounds: Required<SpriteBoundsPaddingSpec>): Required<SpriteBoundsPadding> {
  return {
    top: farPaddingValue(bounds.top),
    right: farPaddingValue(bounds.right),
    bottom: farPaddingValue(bounds.bottom),
    left: farPaddingValue(bounds.left),
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
  boundsPadding?: SpriteBoundsPaddingSpec;
  assignment?: SpriteAssignment;
}): SpriteVisualLayout {
  const profile = getShapeProfile(args.shape);
  const footprint = profile.footprint;
  const boundsPaddingSpec = normalizeBoundsPaddingSpec(args.boundsPadding ?? profile.interactionPadding);
  const boundsPadding = resolveStaticBoundsPadding(boundsPaddingSpec);
  const hitboxScale = args.hitboxScale ?? 1;
  const interactionScale = profile.interactionScale ?? 1;
  // Hitboxes start from the footprint scale, then apply explicit interaction
  // padding. Texture bleed is for clipping safety and does not participate here.
  const finalScale =
    args.baseScale *
    SPRITE_FOOTPRINT_WORLD_SCALE *
    (profile.visualScale ?? 1);
  const drawer = DRAWERS[args.shape];
  const renderedBounds =
    profile.interactionBounds === "renderedShape" && args.assignment && drawer
      ? measureRenderedShapeBounds({
          drawer,
          footprint,
          bleed: profile.bleed,
          seedKey: makeSpriteSeedKey({
            shape: args.shape,
            bucketId: args.assignment.bucketId,
            variant: args.assignment.variant,
          }),
          liveAvg: args.assignment.bucketAvg,
        })
      : null;
  const baseW = renderedBounds?.width ?? footprint.w;
  const baseH = renderedBounds?.height ?? footprint.h;
  const baseCenterX = renderedBounds?.centerX ?? footprint.w / 2;
  const baseCenterY = renderedBounds?.centerY ?? footprint.h / 2;
  // Each footprint tile = finalScale world units, matching SpriteShape's scale convention.
  const totalW = resolveBoundedSize(baseW, boundsPadding.left, boundsPadding.right);
  const totalH = resolveBoundedSize(baseH, boundsPadding.top, boundsPadding.bottom);
  // Base sizes used for offset/anchor - hitboxScale must not drift the center
  const sxBase = finalScale * totalW;
  const syBase = finalScale * totalH;
  const measuredOffsetX = finalScale * (baseCenterX - footprint.w / 2);
  const measuredOffsetY = finalScale * (footprint.h / 2 - baseCenterY);
  const offsetX = measuredOffsetX + finalScale * (boundsPadding.right - boundsPadding.left) / 2;
  const offsetY = measuredOffsetY + finalScale * (boundsPadding.top - boundsPadding.bottom) / 2;
  const visualOffsetY = offsetY + syBase * (profile.anchorBiasY ?? 0);
  const sxHitbox = sxBase * interactionScale * hitboxScale;
  const syHitbox = syBase * interactionScale * hitboxScale;
  const centerX = 0.5 - offsetX / Math.max(0.0001, sxHitbox);
  const centerY = 0.5 - visualOffsetY / Math.max(0.0001, syHitbox);

  return {
    scale: [sxHitbox, syHitbox, 1],
    offset: [0, 0, 0],
    center: [centerX, centerY],
    visualOffset: [offsetX, visualOffsetY, 0],
    aspect: totalW / Math.max(0.0001, totalH),
    tileWorld: finalScale,
    footprint,
    boundsSize: { w: baseW, h: baseH },
    boundsPadding,
    boundsPaddingSpec,
    tooltipBiasY: syBase * (profile.tooltipAnchorBiasY ?? 0),
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
  assignment?: SpriteAssignment;
}): SpriteVisual {
  const assignment = args.assignment ?? getOrAssignSprite(args);
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
      assignment,
    }),
  };
}
