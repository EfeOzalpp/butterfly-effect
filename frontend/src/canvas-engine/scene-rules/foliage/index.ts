import type { FoliageSpecsByMode } from "./types";
import { SPOTLIGHT_SLIDES, type SpotlightSlide } from "../spotlight/slides";

export type {
  FoliageColorStop,
  FoliageLayerSpec,
  FoliageSceneSpec,
  FoliageSpecsByMode,
} from "./types";

const spotlightSlides: readonly SpotlightSlide[] = SPOTLIGHT_SLIDES;

const SPOTLIGHT_FOLIAGE = {
  layers: [],
  variants: spotlightSlides.map((slide) => slide.foliage ?? null),
} as const;

const SPOTLIGHT_DARK_FOLIAGE = {
  layers: [],
  variants: spotlightSlides.map((slide) => slide.darkFoliage ?? slide.foliage ?? null),
} as const;

export const FOLIAGE: FoliageSpecsByMode = {
  start: null,
  questionnaire: null,
  city: null,
  spotlight: SPOTLIGHT_FOLIAGE,
} as const;

export const FOLIAGE_DARK: FoliageSpecsByMode = {
  start: null,
  questionnaire: null,
  city: null,
  spotlight: SPOTLIGHT_DARK_FOLIAGE,
} as const;
