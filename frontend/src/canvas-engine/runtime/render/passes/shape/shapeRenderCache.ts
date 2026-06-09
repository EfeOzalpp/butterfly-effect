import type { RenderCachePolicy } from "../../cache-policy";
import { createFarShapeBitmapRenderer } from "./shapeBitmapCache";
import { createShapeDepthOverlayRenderer } from "./shapeDepthOverlay";

export function createShapeRenderCache(getPolicy: () => RenderCachePolicy) {
  const drawFarShapeBitmap = createFarShapeBitmapRenderer(() => getPolicy().farShapeBitmap);
  const drawShapeDepthOverlay = createShapeDepthOverlayRenderer(() => getPolicy().shapeDepthMask);

  return {
    drawFarShapeBitmap,
    drawShapeDepthOverlay,
    clear() {
      drawFarShapeBitmap.clear();
      drawShapeDepthOverlay.clear();
    },
  };
}
