// src/canvas-engine/runtime/render/passes/background/index.ts

// Background pass owns the static scene base: base color, gradients, and anchors.
// Animated atmosphere like stars is exported from the atmosphere pass.
export { createBackgroundAnchorContext } from "./anchors";
export { createBgCache, drawBackground } from "./background";
