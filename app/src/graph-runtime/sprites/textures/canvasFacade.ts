// graph-runtime/sprites/textures/canvasFacade.ts
import {
  makeOffscreenShapeSurface,
  type OffscreenShapeSurface,
} from '../../../scene-canvas/offscreen-shape-surface';

type CanvasFacade = OffscreenShapeSurface;

// Sprite textures reuse canvas-engine drawers by giving them the same p-style
// facade they receive in the main Canvas 2D runtime.
export function makeCanvasFacade(canvas: HTMLCanvasElement, opts: { dpr: number }): CanvasFacade {
  return makeOffscreenShapeSurface(canvas, opts);
}
