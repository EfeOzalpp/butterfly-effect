import type {
  ShapeKey,
  SpriteBoundsPadding,
  SpriteBoundsPaddingValue,
  SpriteVisualLayout,
} from "../../sprites/types";

export interface ResolvedHitboxDistance {
  visible: boolean;
  scale: [number, number, number];
  center: [number, number];
}

const RANGE_FAR_DISTANCE = 50;
const RANGE_NEAR_DISTANCE = 1;
const FAR_HITBOX_SCALE_MAX = 1.75;
const FAR_HITBOX_SCALE_NEAR_DISTANCE = 35;
const FAR_HITBOX_SCALE_FULL_DISTANCE = 180;
const FAR_HITBOX_SCALE_CURVE = 4;

function clamp01(value: number): number {
  return Math.max(0, Math.min(1, value));
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

function resolvePaddingValue(
  value: SpriteBoundsPaddingValue,
  distanceToCamera: number
): number {
  if (!Array.isArray(value)) return value;

  const [farValue, nearValue] = value;
  const t = clamp01(
    (distanceToCamera - RANGE_NEAR_DISTANCE) /
    Math.max(0.0001, RANGE_FAR_DISTANCE - RANGE_NEAR_DISTANCE)
  );
  return lerp(nearValue, farValue, t);
}

function resolvePadding(
  layout: SpriteVisualLayout,
  distanceToCamera: number
): Required<SpriteBoundsPadding> {
  const spec = layout.boundsPaddingSpec;
  return {
    top: resolvePaddingValue(spec.top, distanceToCamera),
    right: resolvePaddingValue(spec.right, distanceToCamera),
    bottom: resolvePaddingValue(spec.bottom, distanceToCamera),
    left: resolvePaddingValue(spec.left, distanceToCamera),
  };
}

function resolveBoundedSize(size: number, before: number, after: number): number {
  return Math.max(0.05, size + before + after);
}

function resolvePaddedLayout(
  layout: SpriteVisualLayout,
  padding: Required<SpriteBoundsPadding>,
  sceneHitboxScale: number,
  distanceScale = 1
): Pick<ResolvedHitboxDistance, "scale" | "center"> {
  const boundsSize = layout.boundsSize;
  const baseTotalW = resolveBoundedSize(
    boundsSize.w,
    layout.boundsPadding.left,
    layout.boundsPadding.right
  );
  const baseTotalH = resolveBoundedSize(
    boundsSize.h,
    layout.boundsPadding.top,
    layout.boundsPadding.bottom
  );
  const hitboxScaleX = layout.scale[0] / Math.max(0.0001, layout.tileWorld * baseTotalW);
  const hitboxScaleY = layout.scale[1] / Math.max(0.0001, layout.tileWorld * baseTotalH);
  const baseOffsetX = layout.tileWorld * (layout.boundsPadding.right - layout.boundsPadding.left) / 2;
  const baseOffsetY = layout.tileWorld * (layout.boundsPadding.top - layout.boundsPadding.bottom) / 2;
  const baseVisualOffsetX = (0.5 - layout.center[0]) * layout.scale[0];
  const baseVisualOffsetY = (0.5 - layout.center[1]) * layout.scale[1];
  const anchorBiasX = baseVisualOffsetX - baseOffsetX;
  const anchorBiasY = baseVisualOffsetY - baseOffsetY;

  const totalW = resolveBoundedSize(boundsSize.w, padding.left, padding.right);
  const totalH = resolveBoundedSize(boundsSize.h, padding.top, padding.bottom);
  const sxBase = layout.tileWorld * totalW * hitboxScaleX * sceneHitboxScale * distanceScale;
  const syBase = layout.tileWorld * totalH * hitboxScaleY * sceneHitboxScale * distanceScale;
  const offsetX = layout.tileWorld * (padding.right - padding.left) / 2;
  const offsetY = layout.tileWorld * (padding.top - padding.bottom) / 2;
  const centerX = 0.5 - (offsetX + anchorBiasX) / Math.max(0.0001, sxBase);
  const centerY = 0.5 - (offsetY + anchorBiasY) / Math.max(0.0001, syBase);

  return {
    scale: [sxBase, syBase, 1],
    center: [centerX, centerY],
  };
}

function resolveFarHitboxScale(distanceToCamera: number): number {
  const t = clamp01(
    (distanceToCamera - FAR_HITBOX_SCALE_NEAR_DISTANCE) /
    Math.max(0.0001, FAR_HITBOX_SCALE_FULL_DISTANCE - FAR_HITBOX_SCALE_NEAR_DISTANCE)
  );
  const curved = Math.pow(t, FAR_HITBOX_SCALE_CURVE);
  return lerp(1, FAR_HITBOX_SCALE_MAX, curved);
}

export function resolveTooltipHitboxState({
  layout,
  distanceToCamera,
  sceneHitboxScale = 1,
}: {
  layout: SpriteVisualLayout;
  distanceToCamera: number;
  sceneHitboxScale?: number;
}): ResolvedHitboxDistance {
  const padding = resolvePadding(layout, distanceToCamera);

  return {
    visible: true,
    ...resolvePaddedLayout(layout, padding, sceneHitboxScale),
  };
}

export function resolveHitboxDistanceState({
  shape: _shape,
  layout,
  distanceToCamera,
  cameraRadius: _cameraRadius,
  sceneHitboxScale = 1,
}: {
  shape: ShapeKey;
  layout: SpriteVisualLayout;
  distanceToCamera: number;
  cameraRadius: number;
  sceneHitboxScale?: number;
}): ResolvedHitboxDistance {
  const padding = resolvePadding(layout, distanceToCamera);
  const farHitboxScale = resolveFarHitboxScale(distanceToCamera);

  return {
    visible: true,
    ...resolvePaddedLayout(layout, padding, sceneHitboxScale, farHitboxScale),
  };
}
