// src/canvas-engine/runtime/engine/loop.ts

import { normalizeDprTransform, reassertDprTransformIfMutated } from "../util/transform";

import { getPaddingSpecForState } from "../geometry/padding";
import { computeGridCached, type GridMetrics, type RuntimeLayoutState } from "../geometry/gridCache";

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
import { createFoliageLayerCache } from "../render/passes/foliage";
import { drawAmbientParticles } from "../render/passes/ambient-particles";
import type { FogLightSource } from "../render/passes/atmosphere/fog";
import { createRowLightCache } from "../render/passes/light";
import { drawGridOverlay } from "../debug";
import {
  createPaletteCache,
  createShapeRenderCache,
  drawItems,
  getGradientRGB,
  resolveShapeDepthTint,
  sortItemsForRenderInto,
} from "../render/passes/shape";
import { createSceneLightContext } from "../../modifiers/index";

import { drawItemFromRegistry } from "../shape-adapter/draw";
import type { RuntimeShapeServices } from "../shape-adapter/registry";
import type { RuntimeShapeOptions } from "../shape-adapter/types";
import type { RuntimeSurface } from "../p/makeP";
import { ENVIRONMENT_LIGHT_SHAPE } from "../../shapes";
import type { BackgroundSpec } from "../../scene-rules/backgrounds";
import type { AmbientParticlesSceneSpec } from "../../scene-rules/ambient-particles";
import type { FoliageSceneSpec } from "../../scene-rules/foliage";
import {
  clearSceneSurfaceToUnderpaint,
  resolveSceneSurfaceFrame,
} from "./sceneSurfaceLifecycle";

import type { EngineFieldItem } from "./field";
import type { EngineEffectState, EngineRuntimeState } from "./state";
import type { EngineSceneSource } from "./types";

export interface LoopDeps {
  // runtime/p: live canvas draw facade and timing surface created by runtime/index.
  surface: RuntimeSurface;

  // engine/state: mutable field/style/input objects updated by EngineControls.
  engineState: EngineRuntimeState;

  // engine/types: app-resolved scene profile source; runtime/index owns the current value.
  sceneSource: EngineSceneSource;

  // geometry/gridCache: per-engine layout cache, invalidated by resize/profile changes.
  layout: RuntimeLayoutState;

  // engine/state: per-engine visual effect state that persists across frames.
  effects: EngineEffectState;

  // shape-adapter/registry: runtime bridge from item shape names to draw functions.
  shapes: RuntimeShapeServices;
}

export function createEngineTicker(deps: LoopDeps) {
  const surface = deps.surface;
  const engine = deps.engineState;
  const sceneSource = deps.sceneSource;
  const layout = deps.layout;
  const effects = deps.effects;
  const shapes = deps.shapes;

  let running = true;

  // Offscreen caches - redrawn only when inputs change, blitted each frame
  const bgCache = createBgCache();
  const rowLightCache = createRowLightCache();
  const fogLayerCache = createFogLayerCache();
  const fogStateCache = createFogStateCache();
  const starGeometryCache = createStarGeometryCache();
  const foliageLayerCache = createFoliageLayerCache();
  const paletteCache = createPaletteCache();
  const shapeRenderCache = createShapeRenderCache(() => sceneSource.getProfile().renderCache);

  const sortedItemsScratch: EngineFieldItem[] = [];
  const optsScratch: RuntimeShapeOptions = {};
  const shapeOccurrenceScratch = new Map<string, number>();

  let sortedItemsSource: EngineFieldItem[] | null = null;
  let sortedItemsMetrics: GridMetrics | null = null;
  let environmentLightItemsSource: EngineFieldItem[] | null = null;
  let environmentLightWidth = 0;
  let environmentLightDarkMode = false;
  let environmentLightSource: FogLightSource | null = null;

  function clearRenderCaches() {
    bgCache.clear();
    rowLightCache.clear();
    fogLayerCache.clear();
    starGeometryCache.clear();
    foliageLayerCache.clear();
    shapeRenderCache.clear();
  }

  function sortedItemsForFrame(items: EngineFieldItem[], metrics: GridMetrics): EngineFieldItem[] {
    if (items !== sortedItemsSource || metrics !== sortedItemsMetrics) {
      sortItemsForRenderInto(sortedItemsScratch, items, { gridMetrics: metrics });
      sortedItemsSource = items;
      sortedItemsMetrics = metrics;
    }
    return sortedItemsScratch;
  }

  function findLightItem(items: EngineFieldItem[]): EngineFieldItem | null {
    for (const item of items) {
      if (item.shape === "sun") return item;
    }
    return null;
  }

  function getShapeLightItem(items: EngineFieldItem[]): EngineFieldItem | {
    x: number;
    y: number;
    paletteClosenessK?: number;
  } | null {
    const visibleLightItem = findLightItem(items);
    if (visibleLightItem) return visibleLightItem;

    const source = engine.style.shapeLightSource;
    if (!source) return null;

    const lightItem: {
      x: number;
      y: number;
      paletteClosenessK?: number;
    } = {
      x: surface.p.width * source.xK,
      y: surface.p.height * source.yK,
    };

    if (typeof source.paletteClosenessK === "number") {
      lightItem.paletteClosenessK = source.paletteClosenessK;
    }

    return lightItem;
  }

  function parseHexColor(hex: string): FogLightSource["color"] | null {
    const normalized = hex.trim().replace(/^#/, "");
    if (!/^[0-9a-fA-F]{6}$/.test(normalized)) return null;
    const value = Number.parseInt(normalized, 16);
    return {
      r: (value >> 16) & 255,
      g: (value >> 8) & 255,
      b: value & 255,
    };
  }

  function findEnvironmentLightSource(items: EngineFieldItem[]): FogLightSource | null {
    const width = Math.max(1, surface.p.width);
    if (
      items === environmentLightItemsSource &&
      width === environmentLightWidth &&
      engine.style.darkMode === environmentLightDarkMode
    ) {
      return environmentLightSource;
    }

    environmentLightItemsSource = items;
    environmentLightWidth = width;
    environmentLightDarkMode = engine.style.darkMode;
    environmentLightSource = null;

    for (const item of items) {
      const metadata = ENVIRONMENT_LIGHT_SHAPE[item.shape];
      if (!metadata) continue;
      const [, lightColorHex, darkColorHex] = metadata;
      const colorHex = engine.style.darkMode && darkColorHex ? darkColorHex : lightColorHex;
      const color = parseHexColor(colorHex);
      if (!color) continue;
      environmentLightSource = {
        xK: Math.max(0, Math.min(1, item.x / width)),
        color,
      };
      return environmentLightSource;
    }
    return null;
  }

  function positiveModulo(value: number, length: number) {
    return ((value % length) + length) % length;
  }

  function resolveRuntimeBackground(background: BackgroundSpec | null): BackgroundSpec | null {
    const variants = background?.variants;
    if (!variants?.length) return background;

    const spotlight = engine.inputs.spotlight;
    if (!spotlight) {
      return variants[0] ?? null;
    }

    return variants[positiveModulo(spotlight.index, variants.length)];
  }

  function resolveRuntimeAmbientParticles(
    ambientParticles: AmbientParticlesSceneSpec | null
  ): AmbientParticlesSceneSpec | null {
    const variants = ambientParticles?.variants;
    if (!variants?.length) return ambientParticles;

    const spotlight = engine.inputs.spotlight;
    if (!spotlight) {
      return variants[0] ?? null;
    }

    return variants[positiveModulo(spotlight.index, variants.length)] ?? variants[0] ?? null;
  }

  function resolveRuntimeFoliage(foliage: FoliageSceneSpec | null): FoliageSceneSpec | null {
    const variants = foliage?.variants;
    if (!variants?.length) return foliage;

    const spotlight = engine.inputs.spotlight;
    if (!spotlight) {
      return variants[0] ?? null;
    }

    return variants[positiveModulo(spotlight.index, variants.length)] ?? variants[0] ?? null;
  }

  function renderOneSandboxed(
    // Upstream params: one prepared item draw from drawItems.
    it: EngineFieldItem,
    rEff: number,
    opts: RuntimeShapeOptions,
    rootAppearK: number
  ) {
    // End params. This function now owns final opts sync and draw routing.
    surface.p.push();
    try {
      const projection = opts.projection ?? (opts.projection = {});
      const styleOpts = opts.style ?? (opts.style = {});
      const lifecycle = opts.lifecycle ?? (opts.lifecycle = {});
      const pass = opts.pass ?? (opts.pass = {});

      // Keep all shape rendering synchronized to one global liveAvg signal.
      // This avoids per-condition color divergence (mixed red/green at the same moment).
      const itemAvg = engine.inputs.liveAvg;
      const itemGradient = styleOpts.gradientRGB;

      styleOpts.liveAvg = itemAvg;
      styleOpts.gradientRGB = itemGradient;
      lifecycle.rootAppearK = rootAppearK;
      projection.usedRows = layout.gridCache.usedRows;
      const depthTint = resolveShapeDepthTint({
        p: surface.p,
        item: it,
        gridMetrics: layout.gridCache.metrics,
        shapeAlpha: styleOpts.alpha,
        darkMode: styleOpts.darkMode,
      });
      pass.depthTintColor = depthTint?.color;
      pass.depthTintK = depthTint?.blend;

      // Override cell/cellW/cellH with the actual tile size for this item's row.
      // baseOpts carries the horizon reference (smallest tile); shapes that use
      // cell * fraction would otherwise size themselves relative to the horizon
      // regardless of where they sit on screen.
      const fp = it.footprint;
      const m = layout.gridCache.metrics;
      if (fp != null && m.rowHeights.length > 0) {
        // Use the footprint's bottom row for the whole local tile contract.
        // footprintToPx/cellAnchorToPx2 use the same row, so the color pass and
        // baked depth mask do not drift on multi-row perspective shapes.
        const r0 = fp.r0;
        const bottomRow = r0 + fp.h - 1;
        projection.cell  = m.rowHeights[bottomRow]  ?? layout.gridCache.cellH;
        projection.cellH = m.rowHeights[bottomRow]  ?? layout.gridCache.cellH;
        projection.cellW = m.cellWPerRow[bottomRow] ?? layout.gridCache.cellW;

      }

      // Downstream draw path: far bitmap cache first, live draw fallback, then depth overlay.
      const drewCachedShape = shapeRenderCache.drawFarShapeBitmap({
        p: surface.p,
        shapeRegistry: shapes.registry,
        item: it,
        rEff,
        opts,
        gridMetrics: layout.gridCache.metrics,
      });
      if (!drewCachedShape) {
        drawItemFromRegistry(shapes.registry, surface.p, it, rEff, opts);
      }

      shapeRenderCache.drawShapeDepthOverlay({
        p: surface.p,
        shapeRegistry: shapes.registry,
        item: it,
        rEff,
        opts,
        shapeWasDrawnLive: !drewCachedShape,
      });
    } finally {
      surface.p.pop();
      reassertDprTransformIfMutated(surface.p);
    }
  }

  function prepareSceneFrame(now: number) {
    // advance frame timing (deltaTime etc.)
    surface.p.__tick(now);

    normalizeDprTransform(surface.p);
    const sceneProfile = sceneSource.getProfile();
    const background = resolveRuntimeBackground(sceneProfile.background);
    const ambientParticles = resolveRuntimeAmbientParticles(sceneProfile.ambientParticles);
    const foliage = resolveRuntimeFoliage(sceneProfile.foliage);
    const sceneSurface = resolveSceneSurfaceFrame(effects.sceneSurface, {
      nowMs: now,
      ready: sceneProfile.background != null,
    });
    const liveAvgSignal = engine.inputs.liveAvg;
    const spec = getPaddingSpecForState(
      surface.p.width,
      sceneProfile.lookupKey,
      sceneProfile.paddingSpec
    );

    const grid = computeGridCached(layout.gridCache, surface.p, spec);
    const backgroundAnchors = createBackgroundAnchorContext({
      p: surface.p,
      padding: spec,
      metrics: grid.metrics,
    });
    const environmentLightSource = findEnvironmentLightSource(engine.field.items);
    const fog = engine.style.fog ? fogStateCache({
      p: surface.p,
      metrics: grid.metrics,
      darkMode: engine.style.darkMode,
      spec: sceneProfile.fog,
      lightSource: environmentLightSource,
      hasHorizon: typeof spec.horizonPos === "number",
    }) : null;

    return {
      sceneProfile,
      background,
      ambientParticles,
      foliage,
      sceneSurface,
      liveAvgSignal,
      spec,
      grid,
      backgroundAnchors,
      fog,
    };
  }

  type SceneFrameContext = ReturnType<typeof prepareSceneFrame>;

  function renderBackgroundPass(frame: SceneFrameContext) {
    if (!frame.sceneSurface.ready) return;
    bgCache(
      surface.p,
      frame.sceneProfile.lookupKey,
      frame.background,
      frame.liveAvgSignal,
      frame.backgroundAnchors,
      frame.sceneSurface.alpha
    );
  }

  function renderStarPass(frame: SceneFrameContext) {
    if (!frame.sceneSurface.ready) return;
    drawBackgroundStarsOnly(
      surface.p,
      frame.sceneProfile.lookupKey,
      frame.background,
      frame.sceneSurface.alpha,
      frame.liveAvgSignal,
      starGeometryCache
    );
  }

  function renderFoliagePass(frame: SceneFrameContext) {
    if (!frame.sceneSurface.ready) return;
    foliageLayerCache({
      p: surface.p,
      spec: frame.foliage,
      liveAvg: frame.liveAvgSignal,
      anchors: frame.backgroundAnchors,
      compositeAlpha: frame.sceneSurface.alpha,
    });
  }

  function renderAmbientParticlesPass(frame: SceneFrameContext) {
    if (!frame.sceneSurface.ready) return;
    drawAmbientParticles({
      p: surface.p,
      spec: frame.ambientParticles,
      liveAvg: frame.liveAvgSignal,
      timeMs: surface.p.millis(),
      compositeAlpha: frame.sceneSurface.alpha,
    });
  }

  function renderFogPass(frame: SceneFrameContext) {
    if (!frame.sceneSurface.ready) return;
    fogLayerCache(surface.p, frame.fog, frame.sceneSurface.alpha);
  }

  function renderDebugPass(frame: SceneFrameContext) {
    drawGridOverlay(
      surface.p,
      {
        cellW: frame.grid.cellW,
        cellH: frame.grid.cellH,
        ox: frame.grid.ox,
        oy: frame.grid.oy,
        rows: frame.grid.rows,
        cols: frame.grid.cols,
        usedRows: frame.grid.usedRows,
        metrics: frame.grid.metrics,
      },
      frame.spec,
      {
        enabled: engine.style.debug.grid,
        gridAlpha: engine.style.debug.gridAlpha,
      }
    );
  }

  function prepareShapeFrame(sceneFrame: SceneFrameContext) {
    // time model used by shapes / particles
    const tMs = surface.p.millis();
    const gradientRGB = getGradientRGB({
      liveAvg: sceneFrame.liveAvgSignal,
      override: engine.style.gradientRGBOverride,
      cache: paletteCache,
    });

    const sortedItems = sortedItemsForFrame(engine.field.items, sceneFrame.grid.metrics);
    const lightItem = getShapeLightItem(sortedItems);

    const sceneLight = createSceneLightContext({
      lightItem,
      darkMode: engine.style.darkMode,
      canvasW: surface.p.width,
      canvasH: surface.p.height,
      cell: sceneFrame.grid.cell,
      cellW: sceneFrame.grid.cellW,
      cellH: sceneFrame.grid.cellH,
      ...sceneFrame.grid.metrics,
    });

    const baseOpts: RuntimeShapeOptions = {
      projection: {
        cell: sceneFrame.grid.cell,
        cellW: sceneFrame.grid.cellW,
        cellH: sceneFrame.grid.cellH,
        ...sceneFrame.grid.metrics,
      },
      style: {
        gradientRGB,
        blend: engine.style.blend,
        liveAvg: sceneFrame.liveAvgSignal,
        alpha: 235,
        exposure: engine.style.exposure,
        contrast: engine.style.contrast,
        darkMode: engine.style.darkMode,
        lightCtx: sceneLight,
      },
      lifecycle: {
        timeMs: tMs,
        dtSec: surface.p.deltaTime / 1000,
      },
      particles: {
        particleStore: effects.particleStore,
      },
    };

    return {
      ...sceneFrame,
      tMs,
      sortedItems,
      sceneLight,
      baseOpts,
    };
  }

  type ShapeFrameContext = ReturnType<typeof prepareShapeFrame>;

  function renderLightingPass(frame: ShapeFrameContext) {
    if (typeof frame.spec.horizonPos !== "number") return;

    rowLightCache({
      p: surface.p,
      metrics: frame.grid.metrics,
      light: frame.sceneLight,
      alpha: engine.style.darkMode ? 0.18 : 0.11,
      compositeAlpha: frame.sceneSurface.alpha,
      minRow: 0,
    });
  }

  function renderItemPass(frame: ShapeFrameContext) {
    drawItems({
      items: frame.sortedItems,
      visible: engine.field.visible,
      nowMs: frame.tMs,
      appearMs: engine.style.appearMs,
      appearStaggerMs: engine.style.appearStaggerMs,
      liveStates: effects.liveStates,
      perShapeScale: engine.style.perShapeScale,
      baseR: engine.style.r,
      baseOpts: frame.baseOpts,
      optsScratch,
      shapeOccurrenceScratch,
      renderOne: (it, rEff, opts, rootAppearK) =>
        { renderOneSandboxed(it, rEff, opts, rootAppearK); },
    });
  }

  function tick(now: number) {
    if (!running) return;

    const sceneFrame = prepareSceneFrame(now);
    if (sceneFrame.sceneSurface.appearing) clearSceneSurfaceToUnderpaint(surface.p);
    renderBackgroundPass(sceneFrame);
    renderStarPass(sceneFrame);
    renderFoliagePass(sceneFrame);
    renderFogPass(sceneFrame);
    renderDebugPass(sceneFrame);

    const shapeFrame = prepareShapeFrame(sceneFrame);
    renderLightingPass(shapeFrame);
    renderItemPass(shapeFrame);
    renderAmbientParticlesPass(sceneFrame);
  }

  return {
    tick,
    stop() {
      running = false;
      clearRenderCaches();
    },
  };
}
