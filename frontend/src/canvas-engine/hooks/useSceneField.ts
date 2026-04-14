// src/canvas-engine/hooks/useSceneField.ts

import { useEffect, useRef, useState } from "react";

import { composeField } from "../scene-logic/composeField";
import type { HostId } from "../multi-canvas-setup/hostDefs";
import { HOST_DEFS } from "../multi-canvas-setup/hostDefs";

import { resolveSceneState } from "../adjustable-rules/sceneMode";
import type { BaseMode, SceneState, SceneLookupKey } from "../adjustable-rules/sceneMode";

import { resolveCanvasPaddingSpec } from "../adjustable-rules/resolveCanvasPadding";
import { backgroundForTheme } from "../adjustable-rules/backgrounds";

import { getViewportSize } from "../shared/responsiveness";
import { usePreferences } from "../../app/state/preferences-context";
import type { Place } from "../grid-layout/occupancy";

type Engine = {
  ready: React.RefObject<boolean>;
  controls: React.RefObject<any>;
  readyTick?: number;
};

const clamp01 = (v?: number) =>
  typeof v === "number" ? Math.max(0, Math.min(1, v)) : 0.5;

function getCanvasLogicalSize(canvas: HTMLCanvasElement | undefined | null) {
  if (!canvas) {
    const { w, h } = getViewportSize();
    return { w, h };
  }

  const dpr =
    (canvas as any)._dpr ||
    (typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1);

  const backingW = (canvas.width || 0) / dpr;
  const backingH = (canvas.height || 0) / dpr;

  const cssW = (canvas as any)._cssW;
  const cssH = (canvas as any)._cssH;

  const w = Number.isFinite(cssW) ? cssW : backingW;
  const h = Number.isFinite(cssH) ? cssH : backingH;

  return { w: Math.round(w), h: Math.round(h) };
}


export type SceneSignals = {
  questionnaireOpen: boolean;
  isRealMobile: boolean;
};

export function useSceneField(
  engine: Engine,
  hostId: HostId,
  allocAvg: number | undefined,
  signals: SceneSignals,
  reservedFootprints: Place[] | undefined,
  viewportKey?: number | string
) {
  const [canvasResizeTick, setCanvasResizeTick] = useState(0);

  const hostDef = HOST_DEFS[hostId];
  if (!hostDef) throw new Error(`Unknown hostId "${hostId}"`);
  const { darkMode } = usePreferences();

  const ruleset = hostDef.scene?.ruleset;
  if (!ruleset) throw new Error(`[${hostId}] missing scene.ruleset`);

  const baseMode: BaseMode = hostDef.scene?.baseMode ?? "start";
  const { questionnaireOpen, isRealMobile } = signals;

  // Build the full scene state (base + modifiers)
  const sceneState: SceneState = resolveSceneState(
    { questionnaireOpen },
    { baseMode }
  );

  // Ask the ruleset to resolve the effective profile from SceneState
  // (ruleset should handle modifier overrides internally)
  const profile = ruleset.getProfile(sceneState);

  // Runtime "lookup key" for low-level rule lookups (if runtime needs it).
  // sectionOpen stays as baseMode — shapes/quota are unchanged, only padding overrides.
  const sceneLookupKey: SceneLookupKey = questionnaireOpen ? "questionnaire" : sceneState.baseMode;

  const uRef = useRef(0.5);
  uRef.current = clamp01(allocAvg);

  // Recompose field when the actual canvas size changes, even if viewport size does not.
  useEffect(() => {
    if (!engine?.ready?.current) return;
    const canvas = engine.controls.current?.canvas as HTMLCanvasElement | null | undefined;
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
      ro = new ResizeObserver(() => bump());
      ro.observe(canvas);
    }

    // Keep a fallback in case a browser misses an observer event.
    const onWindowResize = () => bump();
    window.addEventListener("resize", onWindowResize);

    return () => {
      if (rafId != null) cancelAnimationFrame(rafId);
      window.removeEventListener("resize", onWindowResize);
      ro?.disconnect();
    };
  }, [engine, hostId, engine.readyTick]);

  useEffect(() => {
    if (!engine?.ready?.current) return;

    const canvas = engine.controls.current?.canvas as HTMLCanvasElement | null | undefined;
    const { w, h } = getCanvasLogicalSize(canvas);
    const viewportW = getViewportSize().w;
    const ruleWidthPx =
      hostId === "start" ? viewportW : w;

    // inform runtime about the current lookup key (used by ticker/renderer)
    engine.controls.current?.setSceneMode?.(sceneLookupKey);

    const result = composeField({
      mode: sceneState.baseMode,
      padding: profile.padding,
      placements: profile.placements,
      allocAvg,
      reservedFootprints,
      viewportKey,
      ruleWidthPx,
      canvas: { w, h },
    });

    // Let runtime compute forbidden/rows from the current profile padding
    // and optionally override it (escape hatch)
    const spec = resolveCanvasPaddingSpec(ruleWidthPx, profile.padding);
    engine.controls.current?.setPaddingSpec?.(spec);
    engine.controls.current?.setBackgroundSpec?.(
      backgroundForTheme(hostId === "city" ? "city" : "start", sceneLookupKey, darkMode)
    );
    engine.controls.current?.setFieldStyle?.({ darkMode, isRealMobile });

    engine.controls.current?.setFieldItems?.(result.placed);
    engine.controls.current?.setFieldVisible?.(result.placed.length > 0);
  }, [
    engine,
    allocAvg,
    questionnaireOpen,
    viewportKey,
    canvasResizeTick,
    hostId,
    baseMode,
    // if ruleset identity can change
    ruleset,
    // if profile is a new object each render, this would cause extra effects.
    // If that happens, resolve profile inside the effect instead.
    sceneLookupKey,
    sceneState.baseMode,
    profile,
    reservedFootprints,
    darkMode,
    isRealMobile,
  ]);
}
