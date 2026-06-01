import { SPOTLIGHT_SLIDES } from "../spotlight/slides/index";
import type { BackgroundSpec, SpotlightBackgroundsByMode } from "./types";

const SPOTLIGHT_BACKGROUND_VARIANTS = SPOTLIGHT_SLIDES.map(
  (slide) => slide.background
) as readonly BackgroundSpec[];

const SPOTLIGHT_DARK_BACKGROUND_VARIANTS = SPOTLIGHT_SLIDES.map(
  (slide) => slide.darkBackground
) as readonly BackgroundSpec[];

const SPOTLIGHT_BACKGROUND: BackgroundSpec = {
  ...SPOTLIGHT_SLIDES[0].background,
  variants: SPOTLIGHT_BACKGROUND_VARIANTS,
} as const;

export const BACKGROUNDS_SPOTLIGHT: SpotlightBackgroundsByMode = {
  spotlight: SPOTLIGHT_BACKGROUND,
} as const;

const SPOTLIGHT_BACKGROUND_DARK: BackgroundSpec = {
  ...SPOTLIGHT_SLIDES[0].darkBackground,
  variants: SPOTLIGHT_DARK_BACKGROUND_VARIANTS,
} as const;

export const BACKGROUNDS_SPOTLIGHT_DARK: SpotlightBackgroundsByMode = {
  spotlight: SPOTLIGHT_BACKGROUND_DARK,
} as const;
