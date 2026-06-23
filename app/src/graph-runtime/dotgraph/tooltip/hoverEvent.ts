import { Vector3, type Camera, type Sprite } from "../../three";
import type { DotGraphHoverEvent } from "../types";
import type { SpriteVisualLayout } from "../../sprites/types";
import {
  computeTooltipPlacement,
  resolveTooltipAnchorCenterOffset,
} from "./placement";

const TMP_CAMERA_RIGHT = new Vector3();
const TMP_CAMERA_UP = new Vector3();
const TMP_CAMERA_FORWARD = new Vector3();

export function projectWorldToClient({
  camera,
  domElement,
  world,
}: {
  camera: Camera;
  domElement: HTMLElement;
  world: Vector3;
}): { x: number; y: number } {
  const projected = world.clone().project(camera);
  const rect = domElement.getBoundingClientRect();
  return {
    x: (projected.x * 0.5 + 0.5) * rect.width + rect.left,
    y: (-projected.y * 0.5 + 0.5) * rect.height + rect.top,
  };
}

export function spriteRuntimeTooltipLayout(
  layout: SpriteVisualLayout,
  sprite: Sprite
): SpriteVisualLayout {
  return {
    ...layout,
    scale: [sprite.scale.x, sprite.scale.y, sprite.scale.z],
    center: [sprite.center.x, sprite.center.y],
  };
}

export function makeCenteredTooltipEvent({
  camera,
  domElement,
  centerWorld,
  layout,
  target = null,
  useDesktopLayout,
  anchorMode = "hitboxCenter",
}: {
  camera: Camera;
  domElement: HTMLElement;
  centerWorld: Vector3;
  layout: SpriteVisualLayout;
  target?: EventTarget | null;
  useDesktopLayout: boolean;
  anchorMode?: DotGraphHoverEvent["tooltipAnchorMode"];
}): DotGraphHoverEvent | null {
  if (typeof document === "undefined") return null;

  const viewport = {
    width: document.documentElement.clientWidth,
    height: document.documentElement.clientHeight,
    useDesktopLayout,
  };

  const centerClient = projectWorldToClient({ camera, domElement, world: centerWorld });
  const tooltipPlacement = computeTooltipPlacement({
    x: centerClient.x,
    y: centerClient.y,
    ...viewport,
  });

  TMP_CAMERA_RIGHT.setFromMatrixColumn(camera.matrixWorld, 0).normalize();
  TMP_CAMERA_UP.setFromMatrixColumn(camera.matrixWorld, 1).normalize();
  TMP_CAMERA_FORWARD.setFromMatrixColumn(camera.matrixWorld, 2).normalize();

  const anchorWorld = centerWorld.clone();
  if (anchorMode !== "shapeCenter") {
    const [offsetX, offsetY, offsetZ] = resolveTooltipAnchorCenterOffset(layout);
    anchorWorld
      .addScaledVector(TMP_CAMERA_RIGHT, offsetX)
      .addScaledVector(TMP_CAMERA_UP, offsetY)
      .addScaledVector(TMP_CAMERA_FORWARD, offsetZ);
  }

  const finalClient = projectWorldToClient({ camera, domElement, world: anchorWorld });

  return {
    nativeEvent: {
      clientX: finalClient.x,
      clientY: finalClient.y,
      target,
    },
    anchorPosition: [anchorWorld.x, anchorWorld.y, anchorWorld.z],
    tooltipLayout: layout,
    tooltipPlacement,
    tooltipAnchorMode: anchorMode,
  };
}
