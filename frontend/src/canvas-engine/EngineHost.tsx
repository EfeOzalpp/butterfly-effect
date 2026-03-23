// src/canvas-engine/EngineHost.tsx
// View CanvasEntry to see how a canvas is imported via EngineHost API

import React from "react";
import { useCanvasEngine } from "./hooks/useCanvasEngine";
import { useViewportKey } from "./hooks/useViewportKey";
import { useSceneField } from "./hooks/useSceneField";
import { stopCanvasEngine } from "./runtime/index";

import { HOST_DEFS, type HostId, type HostDef } from "./multi-canvas-setup/hostDefs";

export function EngineHost({
  id,
  open = true,
  visible = true,
  liveAvg = 0.5,
  allocAvg = 0.5,
  questionnaireOpen = false,
  condAvgs,
}: {
  id: HostId;
  open?: boolean;
  visible?: boolean;
  liveAvg?: number;
  allocAvg?: number;
  questionnaireOpen?: boolean;
  condAvgs?: Partial<Record<'A' | 'B' | 'C' | 'D', number>>;
}) {
  const hostDef = React.useMemo(() => {
    const def = HOST_DEFS[id];
    if (!def) throw new Error(`Unknown hostId "${id}"`);
    return def as HostDef; 
  }, [id]);

  const stopOnOpenMounts = React.useMemo(() => {
    const ids = hostDef.stopOnOpen ?? [];
    return ids.map((otherId) => HOST_DEFS[otherId].mount);
  }, [hostDef]);

  const resolvedBounds = React.useMemo(() => {
    const dims = hostDef.canvasDimensions;
    if (!dims) return undefined;
    if (typeof dims === "function") {
      return dims({ questionnaireOpen });
    }
    return dims;
  }, [hostDef, questionnaireOpen]);


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
    visible: visible,
    dprMode: hostDef.dprMode,
    mount: hostDef.mount,
    zIndex: hostDef.zIndex,
    bounds: resolvedBounds,
    fpsCap: hostDef.fpsCap,
  });

  const viewportKey = useViewportKey(120);

  useSceneField(engine, id, allocAvg, { questionnaireOpen }, viewportKey);

  React.useEffect(() => {
    if (!engine.ready.current) return;
    engine.controls.current?.setInputs?.({ liveAvg, condAvgs });
  }, [engine, liveAvg, condAvgs]);

  return null;
}
