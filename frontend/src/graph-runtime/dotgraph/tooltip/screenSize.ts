import { Vector3, type Camera } from "three";
import type { SpriteVisualLayout } from "../../sprites/types";

interface HitboxScreenHalfSizeArgs {
  camera: Camera;
  domElement: HTMLElement;
  anchorWorld: Vector3;
  cameraRight: Vector3;
  cameraUp: Vector3;
  layout: SpriteVisualLayout;
}

export interface HitboxScreenHalfSize {
  width: number;
  height: number;
}

const TMP_LEFT = new Vector3();
const TMP_RIGHT = new Vector3();
const TMP_BOTTOM = new Vector3();
const TMP_TOP = new Vector3();

function projectToClient({
  camera,
  rect,
  world,
}: {
  camera: Camera;
  rect: DOMRect;
  world: Vector3;
}): { x: number; y: number } {
  const projected = world.project(camera);
  return {
    x: (projected.x * 0.5 + 0.5) * rect.width + rect.left,
    y: (-projected.y * 0.5 + 0.5) * rect.height + rect.top,
  };
}

function distance(a: { x: number; y: number }, b: { x: number; y: number }): number {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

export function resolveHitboxScreenHalfSize({
  camera,
  domElement,
  anchorWorld,
  cameraRight,
  cameraUp,
  layout,
}: HitboxScreenHalfSizeArgs): HitboxScreenHalfSize {
  const rect = domElement.getBoundingClientRect();
  const halfWidthWorld = Math.max(0, layout.scale[0]) / 2;
  const halfHeightWorld = Math.max(0, layout.scale[1]) / 2;

  TMP_LEFT.copy(anchorWorld).addScaledVector(cameraRight, -halfWidthWorld);
  TMP_RIGHT.copy(anchorWorld).addScaledVector(cameraRight, halfWidthWorld);
  TMP_BOTTOM.copy(anchorWorld).addScaledVector(cameraUp, -halfHeightWorld);
  TMP_TOP.copy(anchorWorld).addScaledVector(cameraUp, halfHeightWorld);

  const left = projectToClient({ camera, rect, world: TMP_LEFT });
  const right = projectToClient({ camera, rect, world: TMP_RIGHT });
  const bottom = projectToClient({ camera, rect, world: TMP_BOTTOM });
  const top = projectToClient({ camera, rect, world: TMP_TOP });

  return {
    width: distance(left, right) / 2,
    height: distance(bottom, top) / 2,
  };
}
