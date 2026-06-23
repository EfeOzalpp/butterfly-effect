import { bumpGeneration, resetQueue } from './lifecycle';

export function invalidateSpriteTexturesForThemeChange() {
  bumpGeneration();
  resetQueue();
}
