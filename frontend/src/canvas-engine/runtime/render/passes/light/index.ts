// src/canvas-engine/runtime/render/passes/light/index.ts

// Light pass owns scene-level highlight overlays. Per-shape light response still
// happens inside shape color calculations through lightCtx.
export { createRowLightCache, drawRowTopLightOverlay } from "./rowLight";
