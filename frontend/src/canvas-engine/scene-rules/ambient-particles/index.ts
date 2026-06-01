import { SPOTLIGHT_SLIDES, type SpotlightSlide } from "../spotlight/slides";
import type { AmbientParticlesSpecsByMode } from "./types";

export type {
  AmbientParticleColorStop,
  AmbientParticleLayerSpec,
  AmbientParticlesSceneSpec,
  AmbientParticlesSpecsByMode,
} from "./types";

const spotlightSlides: readonly SpotlightSlide[] = SPOTLIGHT_SLIDES;

const SPOTLIGHT_AMBIENT_PARTICLES = {
  layers: [],
  variants: spotlightSlides.map((slide) => slide.ambientParticles ?? null),
} as const;

const SPOTLIGHT_DARK_AMBIENT_PARTICLES = {
  layers: [],
  variants: spotlightSlides.map(
    (slide) => slide.darkAmbientParticles ?? slide.ambientParticles ?? null
  ),
} as const;

export const AMBIENT_PARTICLES: AmbientParticlesSpecsByMode = {
  start: null,
  questionnaire: null,
  city: null,
  spotlight: SPOTLIGHT_AMBIENT_PARTICLES,
} as const;

export const AMBIENT_PARTICLES_DARK: AmbientParticlesSpecsByMode = {
  start: null,
  questionnaire: null,
  city: null,
  spotlight: SPOTLIGHT_DARK_AMBIENT_PARTICLES,
} as const;
