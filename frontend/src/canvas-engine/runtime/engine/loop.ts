// src/canvas-engine/runtime/engine/loop.ts

import type { PLike } from "../p/makeP";
import { normalizeDprTransform, reassertDprTransformIfMutated } from "../util/transform";

import type { SceneLookupKey } from "../../adjustable-rules/sceneMode";
import type { CanvasPaddingSpec } from "../../adjustable-rules/canvasPadding";
import type { BackgroundSpec } from "../../adjustable-rules/backgrounds";

import { getPaddingSpecForState } from "../layout/padding";
import { computeGridCached, type GridCacheState } from "../layout/gridCache";

import { drawBackground, drawFogOverlay, drawRowTopLightOverlay } from "../render/background";
import { computeFogState, createBottomFogStepper, drawSkyFog } from "../render/fog";
import { drawGridOverlay } from "../render/gridOverlay";
import { getGradientRGB, type PaletteCache } from "../render/palette";
import { drawGhosts, type Ghost } from "../render/ghosts";
import { drawItems, type LiveState } from "../render/items";
import { createSceneLightContext } from "../../modifiers/index";

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
    darkMode: boolean;
    fog: boolean;
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

    liveStates,
    ghostsRef,
    shapeRegistry,
    Z,
    shapeKeyOfItem,
  } = deps;

  let running = true;

  // Background crossfade state
  const BG_TRANSITION_MS = 50;
  let prevBgSpec: BackgroundSpec | null = null;
  let bgFrom: BackgroundSpec | null = null;
  let bgTransitionStart = -1;
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

      const opts2: any = {
        ...sharedOpts,
        liveAvg: itemAvg,
        gradientRGB: itemGradient,
        rootAppearK,
        usedRows: gridCache.usedRows,
      };

      // Override cell/cellW/cellH with the actual tile size for this item's row.
      // baseShared carries the horizon reference (smallest tile); shapes that use
      // cell * fraction would otherwise size themselves relative to the horizon
      // regardless of where they sit on screen.
      const fp = (it as any).footprint;
      const m = gridCache.metrics;
      if (fp != null && m.rowHeights.length > 0) {
        // Use the bottom row of the footprint — matches footprintToPx which uses
        // bottomRow as the unit tile (unitH = rowHeights[bottomRow], pxH = f.h * unitH).
        // Using r0 (top row) caused cell/pxH mismatch on multi-row shapes.
        const bottomRow = (fp.r0 ?? 0) + (fp.h ?? 1) - 1;
        opts2.cell  = m.rowHeights[bottomRow]  ?? gridCache.cellH;
        opts2.cellH = m.rowHeights[bottomRow]  ?? gridCache.cellH;
        opts2.cellW = m.cellWPerRow[bottomRow] ?? gridCache.cellW;

      }

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
    const currentBgSpec = getBackgroundSpecOverride();
    const sceneLookup = getSceneLookup();
    if (currentBgSpec !== prevBgSpec) {
      if (prevBgSpec !== null) { bgFrom = prevBgSpec; bgTransitionStart = now; }
      prevBgSpec = currentBgSpec;
    }
    const liveAvgSignal = inputs.liveAvg;
    if (bgFrom !== null) {
      const t = Math.min(1, (now - bgTransitionStart) / BG_TRANSITION_MS);
      drawBackground(p, sceneLookup, currentBgSpec, 1, liveAvgSignal);
      drawBackground(p, sceneLookup, bgFrom, 1 - t, liveAvgSignal);
      if (t >= 1) bgFrom = null;
    } else {
      drawBackground(p, sceneLookup, currentBgSpec, 1, liveAvgSignal);
    }

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
        metrics: grid.metrics,
      },
      spec,
      {
        enabled: !!style.debug.grid,
        gridAlpha: style.debug.gridAlpha ?? 0.35,
      }
    );

    // time model used by shapes / particles
    const tMs = p.millis();
    const tSec = tMs / 1000;

    const bpm = 120;
    const beatPhase = ((tSec * bpm) / 60) % 1;
    const transport = { tSec, bpm, beatPhase };

    const gradientRGB = getGradientRGB({
      liveAvg: liveAvgSignal,
      override: style.gradientRGBOverride,
      cache: paletteCache,
    });

    const sceneLight = createSceneLightContext({
      lightItem: field.items.find((it) => it.shape === "sun") ?? null,
      darkMode: style.darkMode,
      canvasW: p.width,
      canvasH: p.height,
      cell: grid.cell,
      cellW: grid.cellW,
      cellH: grid.cellH,
      ...grid.metrics,
    });

    drawRowTopLightOverlay({
      p,
      metrics: grid.metrics,
      light: sceneLight,
      alpha: style.darkMode ? 0.18 : 0.11,
    });

    const regularItems = field.items.filter((it) => it.shape !== "sun");
    const fogForegroundItems = field.items.filter((it) => it.shape === "sun");

    const baseShared = {
      cell: grid.cell,
      cellW: grid.cellW,
      cellH: grid.cellH,
      ...grid.metrics,
      gradientRGB,
      blend: style.blend,
      liveAvg: liveAvgSignal,
      alpha: 235,
      timeMs: tMs,
      exposure: style.exposure,
      contrast: style.contrast,
      darkMode: style.darkMode,
      paletteTheme: currentBgSpec,
      transport,
      lightCtx: sceneLight,
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

    const fog = style.fog ? computeFogState({
      p,
      metrics: grid.metrics,
      darkMode: style.darkMode,
    }) : null;
    const bottomFogStepper = fog ? createBottomFogStepper(p, fog) : null;

    drawItems({
      items: regularItems,
      visible: field.visible,
      nowMs: tMs,
      appearMs: style.appearMs,
      Z,
      liveStates,
      perShapeScale: style.perShapeScale,
      baseR: style.r,
      baseShared,
      gridMetrics: grid.metrics,
      shapeKeyOfItem,
      renderOne: (it, rEff, shared, rootAppearK) =>
        renderOneSandboxed(it, rEff, shared, rootAppearK),
      onGhost: (g) => ghostsRef.current.push(g),
      onBeforeGroundItem: bottomFogStepper ? ({ depth }) => {
        bottomFogStepper.drawUntilDepth(depth);
      } : undefined,
      onAfterRowGroup: bottomFogStepper ? () => {
        bottomFogStepper.drawNext();
      } : undefined,
    });

    if (bottomFogStepper) {
      bottomFogStepper.drawRemaining();
    }

    if (fog) {
      drawSkyFog(p, fog);
    }

    drawFogOverlay(p, sceneLookup, currentBgSpec, 1, liveAvgSignal);

    if (fogForegroundItems.length > 0) {
      drawItems({
        items: fogForegroundItems,
        visible: field.visible,
        nowMs: tMs,
        appearMs: style.appearMs,
        Z,
        liveStates,
        perShapeScale: style.perShapeScale,
        baseR: style.r,
        baseShared,
        gridMetrics: grid.metrics,
        shapeKeyOfItem,
        renderOne: (it, rEff, shared, rootAppearK) =>
          renderOneSandboxed(it, rEff, shared, rootAppearK),
        onGhost: (g) => ghostsRef.current.push(g),
      });
    }

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
