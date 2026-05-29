// Public lifecycle controls for the sprite texture queue. Callers can reset or
// pause texture work without knowing how queue scheduling is implemented.
export {
  bumpGeneration,
  resetQueue,
} from "../textures/queue";

export {
  pauseQueue as pauseSpriteTextureQueue,
  resumeQueue as resumeSpriteTextureQueue,
} from "../textures/queue";

export {
  pauseEpochScheduler as pauseSpriteEpochScheduler,
  resumeEpochScheduler as resumeSpriteEpochScheduler,
} from "../internal/epochScheduler";
