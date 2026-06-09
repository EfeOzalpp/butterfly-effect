// src/canvas-engine/hooks/useSceneField.ts

import { useEffect, useRef, useState, type RefObject } from "react";

import { composeField } from "../scene-logic/composeField";
import type { HostId } from "../multi-canvas-setup/hostDefs";
import { HOST_DEFS } from "../multi-canvas-setup/hostDefs";
import type { CanvasEngineControls } from "../runtime";
import type { EngineShapeLightSource } from "../runtime/engine/state";

import type { SceneLookupKey, SceneState } from "../scene-state";

import { resolvePaddingPolicyVariants, resolvePaddingSpec } from "../scene-rules/canvas-padding";
import { interpolatePct } from "../scene-rules/placement-rules";
import type { DeviceCount, ScenePlacementRules } from "../scene-rules/placement-rules";

import { getCanvasMeta } from "../runtime/p/canvasMeta";
import {
  currentViewportDeviceType,
  getViewportSize,
  type DeviceCountScale,
  type DeviceType,
} from "../shared/responsiveness";
import { usePreferences } from "../../app/state/preferences-context";
import type { Place } from "../grid-layout/occupancy";

interface Engine {
  ready: RefObject<boolean>;
  controls: RefObject<CanvasEngineControls | null>;
  readyTick?: number;
}

function positiveModulo(value: number, length: number) {
  return ((value % length) + length) % length;
}

function resolveRuntimePlacements(
  placements: ScenePlacementRules,
  spotlightIndex: number | undefined
): ScenePlacementRules {
  const variants = placements.variants;
  if (!variants?.length) return placements;

  if (typeof spotlightIndex !== "number") {
    return variants[0] ?? placements;
  }

  return variants[positiveModulo(spotlightIndex, variants.length)];
}

function getCanvasLogicalSize(canvas: HTMLCanvasElement | undefined | null) {
  if (!canvas) {
    const { w, h } = getViewportSize();
    return { w, h };
  }

  // Runtime stores logical canvas size in WeakMap metadata instead of custom DOM fields.
  const meta = getCanvasMeta(canvas);
  const dpr =
    meta.dpr ??
    (typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1);

  const backingW = (canvas.width || 0) / dpr;
  const backingH = (canvas.height || 0) / dpr;

  const { cssW, cssH } = meta;

  const w =
    typeof cssW === "number" && Number.isFinite(cssW) ? cssW : backingW;
  const h =
    typeof cssH === "number" && Number.isFinite(cssH) ? cssH : backingH;

  return { w: Math.round(w), h: Math.round(h) };
}

function resolveActiveDeviceCount(
  count: DeviceCount | undefined,
  device: DeviceType,
  fallbackWhenMissing = 0
) {
  if (!count) return fallbackWhenMissing;
  return count[device] ?? 0;
}

function hasActiveCount(
  count: DeviceCount | undefined,
  quota: Parameters<typeof interpolatePct>[0],
  device: DeviceType,
  liveAvg: number | undefined,
  fallbackWhenMissing = 0
) {
  const baseCount = resolveActiveDeviceCount(count, device, fallbackWhenMissing);
  if (baseCount <= 0) return false;

  const t = typeof liveAvg === "number" && Number.isFinite(liveAvg) ? liveAvg : 0.5;
  return Math.round(baseCount * interpolatePct(quota, t) / 50) > 0;
}

function resolveAuthoredLightSource(
  placements: ScenePlacementRules,
  liveAvg: number | undefined,
  ruleWidthPx: number
): EngineShapeLightSource | null {
  const device = currentViewportDeviceType(ruleWidthPx);
  const sunRule = placements.sun;

  if (sunRule?.center && hasActiveCount(sunRule.center.count, sunRule.quota, device, liveAvg, 1)) {
    return {
      xK: sunRule.center.xK ?? 0.5,
      yK: sunRule.center.yK ?? 0.5,
      paletteClosenessK: 0.9,
    };
  }

  for (const point of sunRule?.points ?? []) {
    if (!hasActiveCount(point.count, sunRule?.quota, device, liveAvg, 1)) continue;
    return {
      xK: point.xK,
      yK: point.yK,
      paletteClosenessK: 0.9,
    };
  }

  for (const zone of sunRule?.zones ?? []) {
    if (!hasActiveCount(zone.count, sunRule?.quota, device, liveAvg)) continue;
    const horizontal = zone.horizontalK ?? [0, 1];
    return {
      xK: (horizontal[0] + horizontal[1]) / 2,
      yK: (zone.verticalK[0] + zone.verticalK[1]) / 2,
      paletteClosenessK: 0.9,
    };
  }

  const zones = placements.preset?.kind === "zone-communities"
    ? placements.preset.zones
    : [];

  for (const zone of zones) {
    const sun = zone.shapes.sun;
    if (!sun || !hasActiveCount(sun.count, sun.quota, device, liveAvg)) continue;
    return {
      xK: zone.center.x,
      yK: zone.center.y,
      paletteClosenessK: 0.9,
    };
  }

  return null;
}


export function useSceneField(
  engine: Engine,
  hostId: HostId,
  liveAvg: number | undefined,
  reservedFootprints: Place[] | undefined,
  viewportKey?: number | string,
  spotlightIndex?: number,
  fog?: boolean,
  shapeLightSource?: EngineShapeLightSource | null,
  initialFieldDelayMs = 0
) {
  const [canvasResizeTick, setCanvasResizeTick] = useState(0);
  const lastCanvasSizeRef = useRef<{ w: number; h: number } | null>(null);
  const fieldDelayStateRef = useRef<{ generation: number; untilMs: number } | null>(null);
  const { ready, controls, readyTick } = engine;

  const hostDef = HOST_DEFS[hostId];
  const { darkMode } = usePreferences();

  const ruleset = hostDef.scene.ruleset;
  const sceneLookupKey: SceneLookupKey = hostDef.scene.lookupKey;

  // Recompose field when the actual canvas size changes, even if viewport size does not.
  useEffect(() => {
    if (!ready.current) return;

    const engineControls = controls.current;
    const canvas = engineControls?.canvas;
    if (!canvas) return;

    let rafId: number | null = null;
    const bump = () => {
      if (rafId != null) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        rafId = null;
        const next = getCanvasLogicalSize(canvas);
        const prev = lastCanvasSizeRef.current;
        if (prev && Math.abs(next.w - prev.w) <= 1 && Math.abs(next.h - prev.h) <= 1) {
          return;
        }
        lastCanvasSizeRef.current = next;
        setCanvasResizeTick((t) => t + 1);
      });
    };

    lastCanvasSizeRef.current = getCanvasLogicalSize(canvas);

    let ro: ResizeObserver | null = null;
    if (typeof ResizeObserver !== "undefined") {
      ro = new ResizeObserver(() => {
        bump();
      });
      ro.observe(canvas);
    }

    // Keep a fallback in case a browser misses an observer event.
    const onWindowResize = () => {
      bump();
    };
    window.addEventListener("resize", onWindowResize);

    return () => {
      if (rafId != null) cancelAnimationFrame(rafId);
      window.removeEventListener("resize", onWindowResize);
      ro?.disconnect();
    };
  }, [ready, controls, readyTick]);

  useEffect(() => {
    if (!ready.current) return;

    let cancelled = false;
    let fieldRafId: number | null = null;
    let fieldTimerId: number | null = null;

    const readyGeneration = readyTick ?? 0;
    const nowMs = typeof performance !== "undefined" ? performance.now() : Date.now();
    let fieldDelayMs = 0;
    if (initialFieldDelayMs > 0) {
      let delayState = fieldDelayStateRef.current;
      if (delayState?.generation !== readyGeneration) {
        delayState = {
          generation: readyGeneration,
          untilMs: nowMs + initialFieldDelayMs,
        };
        fieldDelayStateRef.current = delayState;
      }

      fieldDelayMs = Math.max(0, delayState.untilMs - nowMs);
    }

    const composeAndApplyField = (
      engineControls: CanvasEngineControls,
      args: {
        padding: ReturnType<typeof resolvePaddingPolicyVariants>;
        placements: ScenePlacementRules;
        landscapeCountScale: DeviceCountScale | undefined;
        ruleWidthPx: number;
        canvas: { w: number; h: number };
      }
    ) => {
      if (cancelled || !ready.current) return;

      const result = composeField({
        padding: args.padding,
        placements: args.placements,
        liveAvg,
        reservedFootprints,
        landscapeCountScale: args.landscapeCountScale,
        ruleWidthPx: args.ruleWidthPx,
        canvas: args.canvas,
      });

      engineControls.setFieldItems(result.placed);
      engineControls.setFieldVisible(result.placed.length > 0);
    };

    const profileRafId = requestAnimationFrame(() => {
      if (cancelled || !ready.current) return;

      const engineControls = controls.current;
      if (!engineControls) return;

      const sceneState: SceneState = { lookupKey: sceneLookupKey };
      const profile = ruleset.getProfile(sceneState, { darkMode });
      const placements = resolveRuntimePlacements(profile.placements, spotlightIndex);
      const padding = resolvePaddingPolicyVariants(profile.padding, spotlightIndex);

      const canvas = engineControls.canvas;
      const { w, h } = getCanvasLogicalSize(canvas);
      lastCanvasSizeRef.current = { w, h };
      const viewportW = getViewportSize().w;
      // Device-band rules should follow the actual viewport/device, not the
      // bounded size of a canvas instance such as Spotlight.
      const ruleWidthPx = viewportW;
      const resolvedShapeLightSource =
        shapeLightSource === undefined
          ? resolveAuthoredLightSource(placements, liveAvg, ruleWidthPx)
          : shapeLightSource;

      // Let runtime compute forbidden/rows from the current profile padding
      // and receive the other resolved scene policies as one handoff.
      const spec = resolvePaddingSpec(ruleWidthPx, padding);
      engineControls.setSceneProfile({
        lookupKey: sceneLookupKey,
        paddingSpec: spec,
        background: profile.background,
        ambientParticles: profile.ambientParticles,
        fog: profile.fog,
        foliage: profile.foliage,
        renderCache: profile.renderCache,
      });
      engineControls.setFieldStyle({ darkMode, fog, shapeLightSource: resolvedShapeLightSource });

      const fieldArgs = {
        padding,
        placements,
        landscapeCountScale: profile.landscapeCountScale,
        ruleWidthPx,
        canvas: { w, h },
      };

      if (fieldDelayMs > 0) {
        engineControls.setFieldVisible(false);
        fieldTimerId = window.setTimeout(() => {
          fieldTimerId = null;
          fieldRafId = requestAnimationFrame(() => {
            fieldRafId = null;
            composeAndApplyField(engineControls, fieldArgs);
          });
        }, fieldDelayMs);
        return;
      }

      composeAndApplyField(engineControls, fieldArgs);
    });

    return () => {
      cancelled = true;
      cancelAnimationFrame(profileRafId);
      if (fieldRafId !== null) cancelAnimationFrame(fieldRafId);
      if (fieldTimerId !== null) window.clearTimeout(fieldTimerId);
    };
  }, [
    ready,
    controls,
    readyTick,
    liveAvg,
    viewportKey,
    spotlightIndex,
    fog,
    shapeLightSource,
    canvasResizeTick,
    hostId,
    sceneLookupKey,
    ruleset,
    reservedFootprints,
    darkMode,
    initialFieldDelayMs,
  ]);
}
