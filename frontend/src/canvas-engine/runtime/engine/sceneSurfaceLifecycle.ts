import { easeOutCubic } from "../util/easing";
import { normalizeDprTransform } from "../util/transform";
import type { PLike } from "../p/makeP";

const DEFAULT_SCENE_SURFACE_APPEAR_MS = 500;
const APPEAR_DONE_ALPHA = 0.999;

export interface SceneSurfaceLifecycleState {
  appearMs: number;
  startedAtMs: number | null;
}

export interface SceneSurfaceFrame {
  ready: boolean;
  alpha: number;
  appearing: boolean;
}

export function createSceneSurfaceLifecycleState(
  appearMs = DEFAULT_SCENE_SURFACE_APPEAR_MS
): SceneSurfaceLifecycleState {
  return {
    appearMs: Math.max(0, appearMs),
    startedAtMs: null,
  };
}

export function resolveSceneSurfaceFrame(
  state: SceneSurfaceLifecycleState,
  args: { nowMs: number; ready: boolean }
): SceneSurfaceFrame {
  const { nowMs, ready } = args;

  if (!ready) {
    state.startedAtMs = null;
    return { ready: false, alpha: 0, appearing: true };
  }

  state.startedAtMs ??= nowMs;

  const alpha = state.appearMs > 0
    ? easeOutCubic((nowMs - state.startedAtMs) / state.appearMs)
    : 1;

  return {
    ready: true,
    alpha,
    appearing: alpha < APPEAR_DONE_ALPHA,
  };
}

export function clearSceneSurfaceToUnderpaint(p: PLike) {
  const ctx = p.drawingContext;
  ctx.save();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.clearRect(0, 0, p.canvas.width, p.canvas.height);
  ctx.restore();
  normalizeDprTransform(p);
}
