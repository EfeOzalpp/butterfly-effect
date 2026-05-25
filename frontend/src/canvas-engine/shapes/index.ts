// src/canvas-engine/shapes/index.ts

import { drawClouds } from './clouds';
import { drawSnow } from './snow';
import { drawHouse } from './house';
import { drawPower } from './power';
import { drawVilla } from './villa';
import { drawCar } from './car';
import { drawSea } from './sea';
import { drawSun } from './sun';
import { drawCarFactory } from './carFactory';
import { drawBus } from './bus';
import { drawTrees } from './trees';
import type { ShapeRenderPass } from "./types";

export { drawClouds };
export { drawSnow };
export { drawHouse };
export { drawPower };
export { drawVilla };
export { drawCar };
export { drawSea };
export { drawSun };
export { drawCarFactory };
export { drawBus };
export { drawTrees };

// Shape-level render metadata stays with the public shape surface.
// Runtime reads this to know which optional passes each shape implements.
export const SHAPE_RENDER_PASSES: Record<string, readonly ShapeRenderPass[]> = {
  house: ["silhouette"],
  power: ["silhouette"],
  villa: ["silhouette"],
  carFactory: ["silhouette"],
  bus: ["silhouette"],
  car: ["silhouette"],
  trees: ["silhouette"],
  sea: ["silhouette"],
};
