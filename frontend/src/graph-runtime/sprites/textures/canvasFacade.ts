// graph-runtime/sprites/textures/canvasFacade.ts
import { makePFromCanvas } from '../../../canvas-engine/runtime/index';
import type { PLike } from '../../../canvas-engine/runtime/p/makeP';

export type CanvasFacade = PLike;

// Sprite textures reuse canvas-engine drawers by giving them the same p-style
// facade they receive in the main Canvas 2D runtime.
export function makeCanvasFacade(canvas: HTMLCanvasElement, opts: { dpr: number }): CanvasFacade {
  return makePFromCanvas(canvas, opts);
}
