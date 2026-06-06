// src/canvas-engine/EngineHost.tsx
// View CanvasEntry to see how a canvas is imported via EngineHost API

import React from "react";
import { useCanvasEngine } from "./hooks/useCanvasEngine";
import { useViewportKey } from "./hooks/useViewportKey";
import { useSceneField } from "./hooks/useSceneField";
import { stopCanvasEngine } from "./runtime/index";
import type { Place } from "./grid-layout/occupancy";
import type { SpotlightSignal } from "./hooks/signals";
import type { EngineShapeLightSource } from "./runtime/engine/state";

import { HOST_DEFS, type CanvasBounds, type HostDef, type HostId } from "./multi-canvas-setup/hostDefs";

export function EngineHost({
  id,
  open = true,
  visible = true,
  liveAvg = 0.5,
  reservedFootprints,
  spotlight,
  fog,
  shapeLightSource,
}: {
  id: HostId;
  open?: boolean;
  visible?: boolean;
  liveAvg?: number;
  reservedFootprints?: Place[];
  spotlight?: SpotlightSignal;
  fog?: boolean;
  shapeLightSource?: EngineShapeLightSource | null;
}) {
  const hostDef = React.useMemo<HostDef>(() => HOST_DEFS[id], [id]);

  const stopOnOpenMounts = React.useMemo(() => {
    const ids = hostDef.stopOnOpen ?? [];
    return ids.map((otherId) => HOST_DEFS[otherId].mount);
  }, [hostDef]);

  const resolvedBounds = React.useMemo<CanvasBounds | undefined>(() => {
    return hostDef.canvasDimensions;
  }, [hostDef]);

  React.useEffect(() => {
    if (!open) return;
    for (const mount of stopOnOpenMounts) {
      try {
        stopCanvasEngine(mount);
      } catch (err) {
        console.warn('[EngineHost] Failed to stop canvas engine on mount:', mount, err);
      }
    }
  }, [open, stopOnOpenMounts]);

  const engine = useCanvasEngine({
    enabled: open,
    visible,
    dprMode: hostDef.dprMode,
    mount: hostDef.mount,
    zIndex: hostDef.zIndex,
    bounds: resolvedBounds,
    fpsCap: hostDef.fpsCap,
  });

  const viewportKey = useViewportKey(120);

  useSceneField(
    engine,
    id,
    liveAvg,
    reservedFootprints,
    viewportKey,
    spotlight?.index,
    fog,
    shapeLightSource
  );

  React.useEffect(() => {
    if (!import.meta.env.DEV) return;
    if (!engine.ready.current) return;

    const controls = engine.controls.current;
    if (!controls) return;

    let cancelled = false;
    let cleanup: (() => void) | undefined;

    void import("./runtime/debug/placementAuthoring")
      .then(({ installPlacementAuthoring }) => {
        if (cancelled) return;
        cleanup = installPlacementAuthoring({ hostId: id, controls });
      })
      .catch((err: unknown) => {
        console.warn("[EngineHost] Failed to install placement authoring:", err);
      });

    return () => {
      cancelled = true;
      cleanup?.();
    };
  }, [engine.controls, engine.ready, engine.readyTick, id]);

  React.useEffect(() => {
    if (!engine.ready.current) return;
    engine.controls.current?.setInputs({ liveAvg, spotlight });
  }, [engine, liveAvg, spotlight]);

  return null;
}
