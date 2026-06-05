import { SPOTLIGHT_SLIDES, type SpotlightSlide } from "../spotlight/slides";
import type { AmbientParticlesSceneSpec, AmbientParticlesSpecsByMode } from "./types";

export type {
  AmbientParticleColorStop,
  AmbientParticleLayerSpec,
  AmbientParticlesSceneSpec,
  AmbientParticlesSpecsByMode,
} from "./types";

const spotlightSlides: readonly SpotlightSlide[] = SPOTLIGHT_SLIDES;

const START_AMBIENT_PARTICLES: AmbientParticlesSceneSpec = {
  layers: [
    {
      count: [24, 48],
      xRange: [0.04, 0.96],
      yRange: [0.16, 0.82],
      sizePx: [1, 2],
      speedX: [3, 4],
      speedY: [-1, 4],
      color: [
        { color: "rgb(215, 234, 255)", alpha: 0.4 },
        { color: "rgb(229, 250, 255)", alpha: 0.5 },
        { color: "rgb(213, 235, 255)", alpha: 0.6 },
      ],
      seed: 31,
    },
  ],
};

const START_DARK_AMBIENT_PARTICLES: AmbientParticlesSceneSpec = {
  layers: [
    {
      count: [12, 24],
      xRange: [0.04, 0.96],
      yRange: [0.14, 0.84],
      sizePx: [1, 2],
      speedX: [3, 4],
      speedY: [-1, 4],
      color: [
        { color: "rgb(219, 235, 164)", alpha: 0.2 },
        { color: "rgb(185, 220, 169)", alpha: 0.3 },
        { color: "rgb(170, 229, 185)", alpha: 0.4 },
      ],
      seed: 37,
    },
  ],
};

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
  start: START_AMBIENT_PARTICLES,
  questionnaire: START_AMBIENT_PARTICLES,
  city: null,
  spotlight: SPOTLIGHT_AMBIENT_PARTICLES,
} as const;

export const AMBIENT_PARTICLES_DARK: AmbientParticlesSpecsByMode = {
  start: START_DARK_AMBIENT_PARTICLES,
  questionnaire: START_DARK_AMBIENT_PARTICLES,
  city: null,
  spotlight: SPOTLIGHT_DARK_AMBIENT_PARTICLES,
} as const;
