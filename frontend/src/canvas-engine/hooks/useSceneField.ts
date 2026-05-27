// src/canvas-engine/hooks/useSceneField.ts

import { useEffect, useState, type RefObject } from "react";

import { composeField } from "../scene-logic/composeField";
import type { HostId } from "../multi-canvas-setup/hostDefs";
import { HOST_DEFS } from "../multi-canvas-setup/hostDefs";
import type { CanvasEngineControls } from "../runtime";

import type { SceneLookupKey, SceneState } from "../scene-state";

import { resolvePaddingSpec } from "../scene-rules/canvas-padding";

import { getCanvasMeta } from "../runtime/p/canvasMeta";
import { getViewportSize } from "../shared/responsiveness";
import { usePreferences } from "../../app/state/preferences-context";
import type { Place } from "../grid-layout/occupancy";

interface Engine {
  ready: RefObject<boolean>;
  controls: RefObject<CanvasEngineControls | null>;
  readyTick?: number;
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


export function useSceneField(
  engine: Engine,
  hostId: HostId,
  liveAvg: number | undefined,
  reservedFootprints: Place[] | undefined,
  viewportKey?: number | string
) {
  const [canvasResizeTick, setCanvasResizeTick] = useState(0);
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
        setCanvasResizeTick((t) => t + 1);
      });
    };

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

    const engineControls = controls.current;
    if (!engineControls) return;

    const sceneState: SceneState = { lookupKey: sceneLookupKey };
    const profile = ruleset.getProfile(sceneState, { darkMode });

    const canvas = engineControls.canvas;
    const { w, h } = getCanvasLogicalSize(canvas);
    const viewportW = getViewportSize().w;
    const ruleWidthPx =
      hostId === "start" || hostId === "questionnaire" ? viewportW : w;

    const result = composeField({
      padding: profile.padding,
      placements: profile.placements,
      liveAvg,
      reservedFootprints,
      ruleWidthPx,
      canvas: { w, h },
    });

    // Let runtime compute forbidden/rows from the current profile padding
    // and receive the other resolved scene policies as one handoff.
    const spec = resolvePaddingSpec(ruleWidthPx, profile.padding);
    engineControls.setSceneProfile({
      lookupKey: sceneLookupKey,
      paddingSpec: spec,
      background: profile.background,
      renderCache: profile.renderCache,
    });
    engineControls.setFieldStyle({ darkMode });

    engineControls.setFieldItems(result.placed);
    engineControls.setFieldVisible(result.placed.length > 0);
  }, [
    ready,
    controls,
    readyTick,
    liveAvg,
    viewportKey,
    canvasResizeTick,
    hostId,
    sceneLookupKey,
    ruleset,
    reservedFootprints,
    darkMode,
  ]);
}
