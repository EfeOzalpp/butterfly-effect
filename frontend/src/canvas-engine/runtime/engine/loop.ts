// src/canvas-engine/runtime/engine/loop.ts

import type { PLike } from "../p/makeP";
import { normalizeDprTransform, reassertDprTransformIfMutated } from "../util/transform";

import type { SceneLookupKey } from "../../scene-state";
import type { CanvasPaddingSpec } from "../../adjustable-rules/canvas-padding/index";
import type { BackgroundSpec } from "../../adjustable-rules/backgrounds";
import type { RenderCachePolicy } from "../../adjustable-rules/render-cache";

import { getPaddingSpecForState } from "../geometry/padding";
import { computeGridCached, type GridCacheState, type GridMetrics } from "../geometry/gridCache";

import {
  createBackgroundAnchorContext,
  createBgCache,
} from "../render/passes/background";
import {
  createFogLayerCache,
  createFogStateCache,
  createStarGeometryCache,
  drawBackgroundStarsOnly,
} from "../render/passes/atmosphere";
import { createRowLightCache } from "../render/passes/light";
import { drawGridOverlay, type DebugFlags } from "../debug";
import { drawGhosts, type Ghost } from "../render/ghosts";
import {
  createFarShapeBitmapRenderer,
  createShapeDepthOverlayRenderer,
  drawItems,
  getGradientRGB,
  resolveShapeDepthTint,
  sortItemsForRenderInto,
  type PaletteCache,
} from "../render/passes/shape";
import { createSceneLightContext } from "../../modifiers/index";

import { drawItemFromRegistry } from "../shape-adapter/draw";
import type { ShapeRegistry } from "../shape-adapter/registry";
import type { RuntimeShapeOptions } from "../shape-adapter/types";

import type { EngineFieldItem } from "./field";
import type { LiveState } from "./itemLifecycle";

export interface LoopDeps {
  p: PLike;

  // state
  field: { items: EngineFieldItem[]; visible: boolean };

  style: {
    r: number;
    perShapeScale: Record<string, number>;
    gradientRGBOverride: null | { r: number; g: number; b: number };
    blend: number;
    exposure: number;
    contrast: number;
    appearMs: number;
    appearStaggerMs: number;
    exitMs: number;
    darkMode: boolean;
    fog: boolean;
    debug: DebugFlags;
  };

  inputs: { liveAvg: number };

  // policy getters (so loop doesn't own policy vars)
  getSceneLookup: () => SceneLookupKey;
  getPaddingSpecOverride: () => CanvasPaddingSpec | null;
  getBackgroundSpecOverride: () => BackgroundSpec | null;
  getRenderCachePolicy: () => RenderCachePolicy;

  // caches
  gridCache: GridCacheState;
  paletteCache: PaletteCache;
  // lifecycle state
  liveStates: Map<string, LiveState>;
  ghostsRef: { current: Ghost[] };

  // shapes
  shapeRegistry: ShapeRegistry;
}

export function createEngineTicker(deps: LoopDeps) {
  const {
    p,
    field,
    style,
    inputs,
    getSceneLookup,
    getPaddingSpecOverride,
    getBackgroundSpecOverride,
    getRenderCachePolicy,
    gridCache,
    paletteCache,

    liveStates,
    ghostsRef,
    shapeRegistry,
  } = deps;

  let running = true;

  // Offscreen caches — redrawn only when inputs change, blitted each frame
  const bgCache = createBgCache();
  const rowLightCache = createRowLightCache();
  const fogLayerCache = createFogLayerCache();
  const fogStateCache = createFogStateCache();
  const starGeometryCache = createStarGeometryCache();
  const drawFarShapeBitmap = createFarShapeBitmapRenderer(
    () => getRenderCachePolicy().farShapeBitmap
  );
  const drawShapeDepthOverlay = createShapeDepthOverlayRenderer(
    () => getRenderCachePolicy().shapeDepthMask
  );

  const sortedItemsScratch: EngineFieldItem[] = [];
  const sharedScratch: RuntimeShapeOptions = {};
  const shapeOccurrenceScratch = new Map<string, number>();

  let sortedItemsSource: EngineFieldItem[] | null = null;
  let sortedItemsMetrics: GridMetrics | null = null;

  function sortedItemsForFrame(items: EngineFieldItem[], metrics: GridMetrics): EngineFieldItem[] {
    if (items !== sortedItemsSource || metrics !== sortedItemsMetrics) {
      sortItemsForRenderInto(sortedItemsScratch, items, { gridMetrics: metrics });
      sortedItemsSource = items;
      sortedItemsMetrics = metrics;
    }
    return sortedItemsScratch;
  }

  function renderOneSandboxed(
    it: EngineFieldItem,
    rEff: number,
    sharedOpts: RuntimeShapeOptions,
    rootAppearK: number
  ) {
    p.push();
    try {
      // Keep all shape rendering synchronized to one global liveAvg signal.
      // This avoids per-condition color divergence (mixed red/green at the same moment).
      const itemAvg = inputs.liveAvg;
      const itemGradient = sharedOpts.gradientRGB;

      sharedOpts.liveAvg = itemAvg;
      sharedOpts.gradientRGB = itemGradient;
      sharedOpts.rootAppearK = rootAppearK;
      sharedOpts.usedRows = gridCache.usedRows;
      const depthTint = resolveShapeDepthTint({
        p,
        item: it,
        gridMetrics: gridCache.metrics,
        shapeAlpha: sharedOpts.alpha,
        darkMode: sharedOpts.darkMode,
      });
      sharedOpts.depthTintColor = depthTint?.color;
      sharedOpts.depthTintK = depthTint?.blend;

      // Override cell/cellW/cellH with the actual tile size for this item's row.
      // baseShared carries the horizon reference (smallest tile); shapes that use
      // cell * fraction would otherwise size themselves relative to the horizon
      // regardless of where they sit on screen.
      const fp = it.footprint;
      const m = gridCache.metrics;
      if (fp != null && m.rowHeights.length > 0) {
        // Use the footprint's bottom row for the whole local tile contract.
        // footprintToPx/cellAnchorToPx2 use the same row, so the color pass and
        // baked depth mask do not drift on multi-row perspective shapes.
        const r0 = fp.r0;
        const bottomRow = r0 + fp.h - 1;
        sharedOpts.cell  = m.rowHeights[bottomRow]  ?? gridCache.cellH;
        sharedOpts.cellH = m.rowHeights[bottomRow]  ?? gridCache.cellH;
        sharedOpts.cellW = m.cellWPerRow[bottomRow] ?? gridCache.cellW;

      }

      const drewCachedShape = drawFarShapeBitmap({
        p,
        shapeRegistry,
        item: it,
        rEff,
        sharedOptions: sharedOpts,
        gridMetrics: gridCache.metrics,
      });
      if (!drewCachedShape) {
        drawItemFromRegistry(shapeRegistry, p, it, rEff, sharedOpts);
      }

      drawShapeDepthOverlay({
        p,
        shapeRegistry,
        item: it,
        rEff,
        sharedOptions: sharedOpts,
        shapeWasDrawnLive: !drewCachedShape,
      });
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
    const liveAvgSignal = inputs.liveAvg;
    const spec = getPaddingSpecForState(
      p.width,
      getSceneLookup(),
      getPaddingSpecOverride()
    );

    const grid = computeGridCached(gridCache, p, spec);
    const backgroundAnchors = createBackgroundAnchorContext({
      p,
      padding: spec,
      metrics: grid.metrics,
    });
    const fog = style.fog ? fogStateCache({
      p,
      metrics: grid.metrics,
      darkMode: style.darkMode,
    }) : null;

    bgCache(p, sceneLookup, currentBgSpec, liveAvgSignal, backgroundAnchors);
    drawBackgroundStarsOnly(p, sceneLookup, currentBgSpec, 1, liveAvgSignal, starGeometryCache);
    fogLayerCache(p, fog);

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
        enabled: style.debug.grid,
        gridAlpha: style.debug.gridAlpha,
      }
    );

    // time model used by shapes / particles
    const tMs = p.millis();
    const gradientRGB = getGradientRGB({
      liveAvg: liveAvgSignal,
      override: style.gradientRGBOverride,
      cache: paletteCache,
    });

    const sortedItems = sortedItemsForFrame(field.items, grid.metrics);
    let lightItem: EngineFieldItem | null = null;
    for (const item of sortedItems) {
      if (item.shape === "sun") {
        lightItem = item;
        break;
      }
    }

    const sceneLight = createSceneLightContext({
      lightItem,
      darkMode: style.darkMode,
      canvasW: p.width,
      canvasH: p.height,
      cell: grid.cell,
      cellW: grid.cellW,
      cellH: grid.cellH,
      ...grid.metrics,
    });

    const baseShared: RuntimeShapeOptions = {
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
      lightCtx: sceneLight,
    };

    ghostsRef.current = drawGhosts({
      nowMs: tMs,
      ghosts: ghostsRef.current,
      exitMs: style.exitMs,
      baseShared,
      perShapeScale: style.perShapeScale,
      baseR: style.r,
      renderOne: (it, rEff, shared, rootAppearK) =>
        { renderOneSandboxed(it, rEff, shared, rootAppearK); },
    });

    rowLightCache({
      p,
      metrics: grid.metrics,
      light: sceneLight,
      alpha: style.darkMode ? 0.18 : 0.11,
      minRow: 0,
    });

    drawItems({
      items: sortedItems,
      visible: field.visible,
      nowMs: tMs,
      appearMs: style.appearMs,
      appearStaggerMs: style.appearStaggerMs,
      liveStates,
      perShapeScale: style.perShapeScale,
      baseR: style.r,
      baseShared,
      sharedScratch,
      shapeOccurrenceScratch,
      renderOne: (it, rEff, shared, rootAppearK) =>
        { renderOneSandboxed(it, rEff, shared, rootAppearK); },
    });
  }

  return {
    tick,
    stop() {
      running = false;
    },
  };
}
