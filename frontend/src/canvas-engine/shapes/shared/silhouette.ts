import type { RGB } from "../../modifiers/index";
import type { ShapeRenderPass } from "../types";

// Mask passes use white by default so the engine can tint an offscreen mask.
// Inline depth overlays can pass their final color directly.
export const SILHOUETTE_MASK_RGB: RGB = { r: 255, g: 255, b: 255 };

export function shouldDrawShapePart(renderPass: ShapeRenderPass, includeInSilhouette: boolean): boolean {
  return renderPass === "color" || includeInSilhouette;
}

export function shapePartColor(
  renderPass: ShapeRenderPass,
  color: RGB,
  silhouetteColor: RGB = SILHOUETTE_MASK_RGB
): RGB {
  return renderPass === "silhouette" ? silhouetteColor : color;
}
