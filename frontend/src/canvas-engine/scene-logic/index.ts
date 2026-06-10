// src/canvas/scene-logic/index.ts

export type {
  PoolItem,
  PlacedItem,
  FootRect,
  ComposeOpts,
  ComposeResult,
} from './types';

export { composeField } from './composeField';
export { resolveAuthoredLightSource } from './resolveAuthoredLightSource';
export { resolveRuntimePlacements } from './resolveRuntimePlacements';
export type { SceneShapeLightSource } from './shapeLightSource';
