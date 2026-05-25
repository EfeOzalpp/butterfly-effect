// src/canvas-engine/runtime/render/passes/shape/items.ts

import type { EngineFieldItem } from "../../../engine/field";
import type { LiveState } from "../../../engine/itemLifecycle";
import type { RuntimeShapeOptions } from "../../../shape-adapter/types";
import { clamp01, easeOutCubic } from "../../../util/easing";

// drawItems is called by engine/loop.ts during every canvas frame.
// loop.ts owns the frame-wide context: time, grid metrics, lighting, palette,
// and the actual "draw one shape" function.
// This helper owns the item pass: sort the items, track appear state, enrich
// the shared shape options, then hand each item back to renderOne.
export function drawItems(params: {
  items: EngineFieldItem[];
  visible: boolean;
  nowMs: number;
  appearMs: number;
  appearStaggerMs: number;
  // Persistent per-item state lives outside this function so appear animation
  // does not restart every frame.
  liveStates: Map<string, LiveState>;
  perShapeScale: Record<string, number> | undefined;
  baseR: number;
  // baseShared is created in loop.ts. It contains data every shape needs:
  // cell size, grid metrics, gradient color, time, dark mode, light context, etc.
  baseShared: RuntimeShapeOptions;
  sharedScratch?: RuntimeShapeOptions;
  shapeOccurrenceScratch?: Map<string, number>;
  // renderOne comes from loop.ts instead of being imported here because loop.ts
  // wraps shape drawing with p.push()/p.pop() and DPR transform repair.
  renderOne: (it: EngineFieldItem, rEff: number, shared: RuntimeShapeOptions, rootAppearK: number) => void;
}) {
  const {
    items,
    visible,
    nowMs,
    appearMs,
    appearStaggerMs,
    liveStates,
    perShapeScale,
    baseR,
    baseShared,
    sharedScratch,
    shapeOccurrenceScratch,
    renderOne,
  } = params;

  if (!visible || !items.length) return;

  const shapeOccurrence = shapeOccurrenceScratch ?? new Map<string, number>();
  shapeOccurrence.clear();
  const shared = sharedScratch ?? {};
  const staggerDenom = Math.max(1, items.length - 1);

  for (let itemIndex = 0; itemIndex < items.length; itemIndex += 1) {
    const it = items[itemIndex];
    let state = liveStates.get(it.id);
    if (!state) {
      state = {
        bornAtMs: nowMs,
      };
      liveStates.set(it.id, state);
    }

    const bornAt = state.bornAtMs;
    const itemAppearMs = state.appearMs ?? appearMs;
    const itemStaggerMs = state.appearStaggerMs ?? appearStaggerMs;
    const staggerSpan = itemAppearMs > 0 ? Math.max(0, itemStaggerMs) : 0;

    let easedK = 1;
    let alphaK = 1;

    if (itemAppearMs > 0) {
      // Stagger follows render order, so distant items resolve before nearer items.
      // It also spreads cache warmup instead of asking every pass to bake at once.
      const delayMs = (staggerSpan * itemIndex) / staggerDenom;
      const elapsedMs = nowMs - bornAt - delayMs;
      if (elapsedMs <= 0) continue;

      const appearT = clamp01(elapsedMs / itemAppearMs);
      easedK = easeOutCubic(appearT);
      alphaK = easedK;
    }

    const scale = perShapeScale?.[it.shape] ?? 1;
    const rEff = baseR * scale;
    // Some shapes use occurrence index to vary repeated shapes deterministically,
    // so the third house/tree/etc. can pick a different palette or layout.
    const occurrenceIndex = shapeOccurrence.get(it.shape) ?? 0;
    shapeOccurrence.set(it.shape, occurrenceIndex + 1);

    // Reuse one options object through the item pass. Shapes draw synchronously,
    // so this avoids allocating a new options object for every item every frame.
    Object.assign(shared, baseShared);
    shared.footprint = it.footprint;
    shared.alpha = Math.round(235 * alphaK);
    shared.seedKey = `${it.shape}|${it.id}`;
    shared.shapeOccurrenceIndex = occurrenceIndex;
    shared.renderPass = "color";
    shared.silhouetteColor = undefined;
    shared.silhouetteAlpha = undefined;
    shared.depthTintColor = undefined;
    shared.depthTintK = undefined;

    renderOne(it, rEff, shared, easedK);
  }
}
