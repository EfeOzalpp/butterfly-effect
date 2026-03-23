// src/canvas-engine/hooks/useSceneField.ts

import { useEffect, useRef, useState } from "react";

import { composeField } from "../scene-logic/composeField";
import type { PoolItem as ScenePoolItem } from "../scene-logic/types";

import type { HostId } from "../multi-canvas-setup/hostDefs";
import { HOST_DEFS } from "../multi-canvas-setup/hostDefs";

import { resolveSceneState } from "../adjustable-rules/sceneMode";
import type { BaseMode, SceneState, SceneLookupKey } from "../adjustable-rules/sceneMode";

import { targetPoolSize } from "../adjustable-rules/poolSizes";
import { resolveCanvasPaddingSpec } from "../adjustable-rules/resolveCanvasPadding";
import { backgroundForTheme } from "../adjustable-rules/backgrounds";

import { getViewportSize } from "../shared/responsiveness";
import { usePreferences } from "../../app/state/preferences-context";

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

function makeDefaultPoolItem(id: number): ScenePoolItem {
  return { id, cond: "A" as ScenePoolItem["cond"] };
}

function ensurePoolSize(
  poolRef: { current: ScenePoolItem[] | null },
  desired: number
) {
  const cur = poolRef.current;

  if (!cur) {
    poolRef.current = Array.from({ length: desired }, (_, i) => makeDefaultPoolItem(i + 1));
    return;
  }

  if (cur.length === desired) return;

  if (cur.length > desired) {
    poolRef.current = cur.slice(0, desired);
    return;
  }

  const maxId = cur.reduce((m, p) => Math.max(m, p.id), 0);
  const toAdd = desired - cur.length;

  const extra = Array.from({ length: toAdd }, (_, k) => makeDefaultPoolItem(maxId + k + 1));
  poolRef.current = cur.concat(extra);
}

export type SceneSignals = {
  questionnaireOpen: boolean;
};

export function useSceneField(
  engine: Engine,
  hostId: HostId,
  allocAvg: number | undefined,
  signals: SceneSignals,
  viewportKey?: number | string
) {
  const [canvasResizeTick, setCanvasResizeTick] = useState(0);

  const hostDef = HOST_DEFS[hostId];
  if (!hostDef) throw new Error(`Unknown hostId "${hostId}"`);
  const { darkMode } = usePreferences();

  const ruleset = hostDef.scene?.ruleset;
  if (!ruleset) throw new Error(`[${hostId}] missing scene.ruleset`);

  const baseMode: BaseMode = hostDef.scene?.baseMode ?? "start";
  const { questionnaireOpen } = signals;

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

  const poolRef = useRef<ScenePoolItem[] | null>(null);

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
      hostId === "start" && !questionnaireOpen ? viewportW : w;

    // inform runtime about the current lookup key (used by ticker/renderer)
    engine.controls.current?.setSceneMode?.(sceneLookupKey);

    const desired = targetPoolSize(profile.poolSizes, ruleWidthPx);
    ensurePoolSize(poolRef, desired);

    const pool = poolRef.current ?? [];

    const result = composeField({
      // scene-logic composes layout using the base mode (start/overlay)
      mode: sceneState.baseMode,
      padding: profile.padding,
      bands: profile.bands,
      separationMeta: profile.separationMeta,
      quotaSpecification: profile.quotaSpecification,
      allocAvg,
      viewportKey,
      ruleWidthPx,
      canvas: { w, h },
      pool,
    });

    poolRef.current = result.nextPool;

    // Let runtime compute forbidden/rows from the current profile padding
    // and optionally override it (escape hatch)
    const spec = resolveCanvasPaddingSpec(ruleWidthPx, profile.padding);
    engine.controls.current?.setPaddingSpec?.(spec);
    engine.controls.current?.setBackgroundSpec?.(
      backgroundForTheme(hostId === "city" ? "city" : "start", sceneLookupKey, darkMode)
    );
    engine.controls.current?.setFieldStyle?.({ darkMode });

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
    darkMode,
  ]);
}
