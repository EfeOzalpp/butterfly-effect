// Public lifecycle controls for the sprite system. Callers can reset/dispose
// intentfully without knowing how queues and registries are implemented.
export {
  bumpGeneration,
  resetQueue,
} from "../textures/queue";

export {
  disposeStaticTextures,
} from "../textures/registry";
