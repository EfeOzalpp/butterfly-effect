// src/canvas-engine/runtime/render/passes/atmosphere/index.ts

// Atmosphere pass owns visual air: stars, fog washes, and material depth color.
export { drawBackgroundStarsOnly } from "../background/background";
export {
  createFogLayerCache,
  createFogStateCache,
} from "./fog";
export { createStarGeometryCache } from "./stars";
