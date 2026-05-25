import { blendRGB } from "../../modifiers/index";
import type { RGB } from "../../modifiers/index";
import type { ShapeDrawOptions } from "../types";

export function applyDepthTint(
  color: RGB,
  opts: Pick<ShapeDrawOptions, "depthTintColor" | "depthTintK">,
  strength = 1
): RGB {
  const tint = opts.depthTintColor;
  const k = opts.depthTintK;
  if (!tint || typeof k !== "number" || !Number.isFinite(k) || k <= 0) return color;
  return blendRGB(color, tint, Math.max(0, Math.min(1, k * strength)));
}
