// src/graph-runtime/dotgraph/camera/index.ts
// Public surface for DotGraph camera and gesture control.

// Composition root
export { default as useOrbitController } from './useOrbitController';

// Core camera control hooks
export { default as useZoom } from './controls/useZoom';
export { default as useRotation } from './controls/useRotation';
export { default as useActivity } from './controls/useActivity';
export { default as usePixelOffsets } from './controls/usePixelOffsets';

// Pure computations
export { computeInitialZoomTarget } from './compute/zoomTarget';

// Shared state helpers
export { createGestureState } from './shared/sharedGesture';
