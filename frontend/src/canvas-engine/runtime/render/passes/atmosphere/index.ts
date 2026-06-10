// src/canvas-engine/runtime/render/passes/atmosphere/index.ts

// Atmosphere pass owns visual air: stars, fog washes, and material depth color.
export { drawBackgroundStarsOnly } from "../background/background";
export {
  createFogStateCache,
} from "./fog";
export { createFogLayerCache } from "./cache";
export { createStarGeometryCache } from "./stars";
