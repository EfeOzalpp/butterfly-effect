// src/canvas-engine/runtime/engine/loop.ts

import type { PLike } from "../p/makeP";
import { normalizeDprTransform, reassertDprTransformIfMutated } from "../util/transform";

import type { SceneLookupKey } from "../../adjustable-rules/sceneMode";
import type { CanvasPaddingSpec } from "../../adjustable-rules/canvasPadding";
import type { BackgroundSpec } from "../../adjustable-rules/backgrounds";

import { getPaddingSpecForState } from "../layout/padding";
import { computeGridCached, type GridCacheState } from "../layout/gridCache";

import { drawBackground } from "../render/background";
import { drawGridOverlay } from "../render/gridOverlay";
import { getGradientRGB, type PaletteCache, type CondPaletteCaches } from "../render/palette";
import { drawGhosts, type Ghost } from "../render/ghosts";
import { drawItems, type LiveState } from "../render/items";

import { drawItemFromRegistry } from "../shapes/draw";
import type { ShapeRegistry } from "../shapes/registry";

import type { EngineFieldItem } from "../types";
import type { DebugFlags } from "../debug/flags";
import type { CondAvgs } from "./state";

export type LoopDeps = {
  p: PLike;

  // state
  field: { items: EngineFieldItem[]; visible: boolean };
  hero: { x: number | null; y: number | null; visible: boolean };

  style: {
    r: number;
    perShapeScale: Record<string, number>;
    gradientRGBOverride: null | { r: number; g: number; b: number };
    blend: number;
    exposure: number;
    contrast: number;
    appearMs: number;
    exitMs: number;
    debug: DebugFlags;
  };

  inputs: { liveAvg: number; condAvgs: CondAvgs };

  // policy getters (so loop doesn't own policy vars)
  getSceneLookup: () => SceneLookupKey;
  getPaddingSpecOverride: () => CanvasPaddingSpec | null;
  getBackgroundSpecOverride: () => BackgroundSpec | null;

  // caches
  gridCache: GridCacheState;
  paletteCache: PaletteCache;
  condPaletteCaches: CondPaletteCaches;

  // lifecycle state
  liveStates: Map<string, LiveState>;
  ghostsRef: { current: Ghost[] };

  // shapes
  shapeRegistry: ShapeRegistry;

  // ordering
  Z: Record<string, number>;

  // identity/lifecycle
  shapeKeyOfItem: (it: EngineFieldItem) => string;
};

export function createEngineTicker(deps: LoopDeps) {
  const {
    p,
    field,
    hero,
    style,
    inputs,
    getSceneLookup,
    getPaddingSpecOverride,
    getBackgroundSpecOverride,
    gridCache,
    paletteCache,
    condPaletteCaches,
    liveStates,
    ghostsRef,
    shapeRegistry,
    Z,
    shapeKeyOfItem,
  } = deps;

  let running = true;

  function renderOneSandboxed(
    it: EngineFieldItem,
    rEff: number,
    sharedOpts: any,
    rootAppearK: number
  ) {
    p.push();
    try {
      // Keep all shape rendering synchronized to one global liveAvg signal.
      // This avoids per-condition color divergence (mixed red/green at the same moment).
      const itemAvg = inputs.liveAvg;
      const itemGradient = sharedOpts.gradientRGB;

      const opts2 = {
        ...sharedOpts,
        liveAvg: itemAvg,
        gradientRGB: itemGradient,
        rootAppearK,
        usedRows: gridCache.usedRows,
      };
      drawItemFromRegistry(shapeRegistry, p, it, rEff, opts2);
    } finally {
      p.pop();
      reassertDprTransformIfMutated(p);
    }
  }

  function tick(now: number) {
    if (!running) return;

    // advance frame timing (deltaTime etc.)
    p.__tick(now);

    normalizeDprTransform(p);
    drawBackground(p, getSceneLookup(), getBackgroundSpecOverride());

    const spec = getPaddingSpecForState(
      p.width,
      getSceneLookup(),
      getPaddingSpecOverride()
    );

    const grid = computeGridCached(gridCache, p, spec);

    drawGridOverlay(
      p,
      {
        cellW: grid.cellW,
        cellH: grid.cellH,
        ox: grid.ox,
        oy: grid.oy,
        rows: grid.rows,
        cols: grid.cols,
        usedRows: grid.usedRows,
      },
      spec,
      {
        enabled: !!style.debug.grid,
        gridAlpha: style.debug.gridAlpha ?? 0.35,
        forbiddenAlpha: style.debug.forbiddenAlpha ?? 0.25,
      }
    );

    // time model used by shapes / particles
    const tMs = p.millis();
    const tSec = tMs / 1000;

    const bpm = 120;
    const beatPhase = ((tSec * bpm) / 60) % 1;
    const transport = { tSec, bpm, beatPhase };

    const signal1 = inputs.liveAvg;

    const gradientRGB = getGradientRGB({
      liveAvg: signal1,
      override: style.gradientRGBOverride,
      cache: paletteCache,
    });

    const baseShared = {
      cell: grid.cell,
      cellW: grid.cellW,
      cellH: grid.cellH,
      gradientRGB,
      blend: style.blend,
      liveAvg: signal1,
      alpha: 235,
      timeMs: tMs,
      exposure: style.exposure,
      contrast: style.contrast,
      transport,
    };

    ghostsRef.current = drawGhosts({
      p,
      nowMs: tMs,
      ghosts: ghostsRef.current,
      exitMs: style.exitMs,
      baseShared,
      perShapeScale: style.perShapeScale,
      baseR: style.r,
      renderOne: (it, rEff, shared, rootAppearK) =>
        renderOneSandboxed(it, rEff, shared, rootAppearK),
    });

    drawItems({
      items: field.items,
      visible: field.visible,
      nowMs: tMs,
      appearMs: style.appearMs,
      Z,
      liveStates,
      perShapeScale: style.perShapeScale,
      baseR: style.r,
      baseShared,
      shapeKeyOfItem,
      renderOne: (it, rEff, shared, rootAppearK) =>
        renderOneSandboxed(it, rEff, shared, rootAppearK),
      onGhost: (g) => ghostsRef.current.push(g),
    });

    if (hero.visible && hero.x != null && hero.y != null) {
      p.fill(255, 0, 0, 255);
      p.circle(hero.x, hero.y, style.r * 2);
    }
  }

  return {
    tick,
    stop() {
      running = false;
    },
  };
}
