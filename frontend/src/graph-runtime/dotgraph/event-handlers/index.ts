// ─────────────────────────────────────────────────────────────
// src/graph-runtime/dotgraph/event-handlers/index.ts
// DotGraph interaction / camera control system
// This file is the public surface of event-handlers.
// ─────────────────────────────────────────────────────────────

// Composition root (the orchestrator)
export { default as useOrbitController } from './useOrbitController';

// Core interaction hooks (internal but reusable)
export { default as useZoom } from './hooks/useZoom';
export { default as useRotation } from './hooks/useRotation';
export { default as useActivity } from './hooks/useActivity';
export { default as useIdleDrift } from './hooks/useIdleDrift';
export { default as usePixelOffsets } from './hooks/usePixelOffsets';

// Controllers
export { useEdgeCueController } from './controller/edgeCue.controller';

// Pure computations
export { computeTooltipOffsetPx } from './compute/tooltipOffset';
export { computeInitialZoomTarget } from './compute/zoomTarget';

// Shared state helpers
export { createGestureState } from './shared/sharedGesture';
