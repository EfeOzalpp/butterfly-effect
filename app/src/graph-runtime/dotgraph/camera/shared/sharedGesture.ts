// src/graph-runtime/dotgraph/camera/shared/sharedGesture.ts
export interface GestureState {
  pinching: boolean;
  touchCount: number;
  pinchCooldownUntil: number; // ms timestamp
}

export const createGestureState = (): GestureState => ({
  pinching: false,
  touchCount: 0,
  pinchCooldownUntil: 0,
});
