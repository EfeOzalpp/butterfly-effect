// graph-runtime/sprites/selection/drawers.ts
import type { ShapeKey } from './types';
import type { ShapeDrawFn, ShapeDrawOptions } from '../../../canvas-engine/shapes/types';

import {
  drawClouds,
  drawSnow,
  drawHouse,
  drawPower,
  drawSun,
  drawVilla,
  drawCarFactory,
  drawCar,
  drawSea,
  drawBus,
  drawTrees,
} from '../../../canvas-engine/shapes/index';

// Sprites pass the shared timing/layout options, but not shape-specific palettes.
// Keeping palette out of this contract lets each shape keep its own internal palette type.
export type SpriteDrawerOptions = Omit<ShapeDrawOptions, 'palette' | 'paletteTheme'>;
export type DrawerFn = ShapeDrawFn<SpriteDrawerOptions>;

// Bridge from graph sprite keys to canvas-engine art drawers.
// The sprite layer decides which drawer to run; the shape files only draw.
export const DRAWERS: Partial<Record<ShapeKey, DrawerFn>> = {
  sea: drawSea,
  trees: drawTrees,
  house: drawHouse,
  power: drawPower,
  carFactory: drawCarFactory,
  car: drawCar,
  bus: drawBus,
  clouds: drawClouds,
  sun: drawSun,
  snow: drawSnow,
  villa: drawVilla,
};
