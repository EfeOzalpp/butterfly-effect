// src/canvas-engine/runtime/render/items.ts

import type { EngineFieldItem } from "../types";
import type { Ghost } from "./ghosts";
import type { GridMetrics } from "../../grid-layout/gridMetrics";
import { metricsDepth } from "../../grid-layout/gridMetrics"; // used for painter's order sort
import { clamp01, easeOutCubic } from "../util/easing";


export type LiveState = {
  shapeKey: string;
  bornAtMs: number;
  x: number;
  y: number;
  shape: string;
  footprint?: any;
  _willDie?: boolean;
};

export function drawItems(params: {
  items: EngineFieldItem[];
  visible: boolean;
  nowMs: number;
  appearMs: number;
  Z: Record<string, number>;
  liveStates: Map<string, LiveState>;
  perShapeScale: Record<string, number> | undefined;
  baseR: number;
  baseShared: any;
  gridMetrics?: GridMetrics;
  renderOne: (it: EngineFieldItem, rEff: number, shared: any, rootAppearK: number) => void;
  shapeKeyOfItem: (it: EngineFieldItem) => string;
  onGhost?: (g: Ghost) => void;
  onBeforeGroundItem?: (args: { depth: number }) => void;
  onAfterRowGroup?: (args: { previousDepth: number; nextDepth: number }) => void;
  onBeforeSkyItem?: (args: { depth: number }) => void;
}) {
  const {
    items,
    visible,
    nowMs,
    appearMs,
    Z,
    liveStates,
    perShapeScale,
    baseR,
    baseShared,
    gridMetrics,
    renderOne,
    shapeKeyOfItem,
    onGhost,
    onBeforeGroundItem,
    onAfterRowGroup,
    onBeforeSkyItem,
  } = params;

  if (!visible || !items.length) return;

  // Sort in three tiers:
  // 1. Band: sky shapes (Z < 2) always behind ground shapes (Z >= 2)
  // 2. Within band: metricsDepth ascending for painter's order (near-horizon first)
  // 3. Tiebreaker: Z_INDEX, then id
  const sorted = items.slice().sort((a, b) => {
    const za = Z[a.shape] ?? 9;
    const zb = Z[b.shape] ?? 9;
    const bandA = za < 2 ? 0 : 1;
    const bandB = zb < 2 ? 0 : 1;
    if (bandA !== bandB) return bandA - bandB;
    const da = gridMetrics && a.footprint ? metricsDepth(gridMetrics, a.footprint) : a.y;
    const db = gridMetrics && b.footprint ? metricsDepth(gridMetrics, b.footprint) : b.y;
    if (da !== db) return da - db;
    if (za !== zb) return za - zb;
    return String(a.id).localeCompare(String(b.id));
  });

  const shapeOccurrence = new Map<string, number>();

  let prevBand: number | undefined;
  let prevDepth: number | undefined;

  for (const it of sorted) {
    const itZ = Z[it.shape] ?? 9;
    const itBand = itZ < 2 ? 0 : 1;
    const itDepth = gridMetrics && it.footprint ? metricsDepth(gridMetrics, it.footprint) : (it as any).y;
    if (onBeforeSkyItem && itBand === 0) {
      onBeforeSkyItem({ depth: itDepth });
    }
    if (onBeforeGroundItem && itBand === 1) {
      onBeforeGroundItem({ depth: itDepth });
    }
    if (
      onAfterRowGroup &&
      itBand === 1 &&
      prevBand === 1 &&
      prevDepth !== undefined &&
      itDepth !== prevDepth
    ) {
      onAfterRowGroup({ previousDepth: prevDepth, nextDepth: itDepth });
    }
    prevBand = itBand;
    prevDepth = itDepth;
    let state = liveStates.get(it.id);
      if (!state) {
        state = {
          shapeKey: shapeKeyOfItem(it),
          bornAtMs: nowMs,
          x: it.x,
          y: it.y,
          shape: it.shape,
          footprint: it.footprint,
        };
        liveStates.set(it.id, state);
      } else {
        state.x = it.x;
        state.y = it.y;
        state.shape = it.shape;
        state.footprint = it.footprint;
      }

    const bornAt = state.bornAtMs;

    let easedK = 1;
    let alphaK = 1;

    if (appearMs > 0) {
      const appearT = clamp01((nowMs - bornAt) / appearMs);
      easedK = easeOutCubic(appearT);
      alphaK = easedK;
    }

    const scale = perShapeScale?.[it.shape] ?? 1;
    const rEff = baseR * scale;
    const occurrenceIndex = shapeOccurrence.get(it.shape) ?? 0;
    shapeOccurrence.set(it.shape, occurrenceIndex + 1);

    const shared = {
      ...baseShared,
      footprint: it.footprint,
      alpha: Math.round(235 * alphaK),
      itemId: it.id,
      seedKey: `${it.shape}|${it.id}`,
      shapeOccurrenceIndex: occurrenceIndex,
    };
    renderOne(it, rEff, shared, easedK);
  }
}

export function defaultShapeKeyOfItem(it: EngineFieldItem) {
  const f = it.footprint || { w: 0, h: 0, r0: 0, c0: 0 };
  return `${it.shape}|w${f.w}h${f.h}|r${f.r0}c${f.c0}`;
}
