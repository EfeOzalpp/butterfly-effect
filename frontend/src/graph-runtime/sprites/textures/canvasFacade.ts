// graph-runtime/sprites/textures/canvasFacade.ts
import { makePFromCanvas } from '../../../canvas-engine/runtime/index';

export type CanvasFacade = any;

export function makeCanvasFacade(canvas: HTMLCanvasElement, opts: { dpr: number }): CanvasFacade {
  return makePFromCanvas(canvas, opts);
}
