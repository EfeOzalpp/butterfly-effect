// graph-runtime/sprites/entry.ts
// Public sprite boundary. Dotgraph should import from here instead of reaching into
// texture/runtime internals directly.
export type { SpriteAssignment, SpriteVisualLayout } from './types';
export { SpriteShape } from './internal/spriteShape';
export * from './api/visual';
export * from './api/prewarm';
export * from './api/dispose';
export * from './api/lifecycle';
export * from './api/theme';
export * from './api/quality';
export * from './api/identity';
