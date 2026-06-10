import type { ShapeDrawOptions, ShapeStyleOptions } from "../../shapes/types";

export type RuntimeStyleOptions = Omit<ShapeStyleOptions, "palette"> & {
  palette?: never;
  gradientRGBOverrideActive?: boolean;
};

// Runtime creates these options for shape draw functions every frame.
// Shape-specific palette overrides stay owned by the shape files, not the runtime bridge.
export type RuntimeShapeOptions = Omit<ShapeDrawOptions, "style"> & {
  paletteTheme?: never;
  style?: RuntimeStyleOptions;
};
