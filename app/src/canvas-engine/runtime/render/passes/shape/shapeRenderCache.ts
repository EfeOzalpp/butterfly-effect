import type { RenderCachePolicy } from "../../cache-policy";
import { createFarShapeBitmapRenderer } from "./cache/farShapeBitmap";
import { createShapeDepthOverlayRenderer } from "../depth";

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
