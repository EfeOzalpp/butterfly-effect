// graph-runtime/sprites/entry.ts
// Public sprite boundary. Dotgraph should import from here instead of reaching into
// texture/runtime internals directly.
export { SpriteShape } from './api/spriteShape';

export * from './types';
export * from './api/visual';
export * from './api/prewarm';
export * from './api/dispose';
export * from './api/lifecycle';
export * from './api/theme';

export { default as useTextureQueueProgress } from './textures/useQueueProgress';
