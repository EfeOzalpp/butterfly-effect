import { useCallback, useEffect, useMemo, useState } from "react";
import type { CSSProperties } from "react";
import { useUiFlow } from "../../../app/state/ui-context";

import { CANVAS_PADDING } from "../../../canvas-engine/adjustable-rules/canvas-padding/index";
import { resolveCanvasPaddingSpec } from "../../../canvas-engine/adjustable-rules/resolveCanvasPadding";
import {
  deviceType,
  type DeviceType,
} from "../../../canvas-engine/shared/responsiveness";
import {
  justifyContentForUiPlacement,
  makeCenteredSquareGrid,
  resolveUiGridPlacement,
  type CellSize,
  type UiGridPlacementInput,
  uiGridPlacementToPx,
  usedRowsFromSpec,
} from "../../../canvas-engine/grid-layout";

type CanvasBox = {
  width: number;
  height: number;
};

function findActiveGridHost(preferCityCanvas: boolean): HTMLElement | null {
  if (typeof document === "undefined") return null;

  if (preferCityCanvas) {
    const cityHost = document.getElementById("city-canvas-root");
    if (cityHost instanceof HTMLElement) return cityHost;
  }

  const onboardingHost =
    document.getElementById("canvas-root") ??
    document.querySelector(".onboarding-canvas.questionnaire-active") ??
    document.querySelector(".onboarding-canvas");

  return onboardingHost instanceof HTMLElement ? onboardingHost : null;
}

function readCanvasBox(host: HTMLElement | null): CanvasBox | null {
  if (!(host instanceof HTMLElement)) return null;

  const next = {
    width: Math.round(host.clientWidth),
    height: Math.round(host.clientHeight),
  };

  if (next.width <= 0 || next.height <= 0) return null;
  return next;
}

export function useQuestionnaireGridLayout() {
  const { cityPanelOpen, questionnaireOpen } = useUiFlow();
  const preferCityCanvas = cityPanelOpen && questionnaireOpen;
  const [canvasBox, setCanvasBox] = useState<CanvasBox | null>(() =>
    readCanvasBox(findActiveGridHost(preferCityCanvas))
  );

  useEffect(() => {
    let rafId = 0;
    let resizeObserver: ResizeObserver | null = null;
    let mutationObserver: MutationObserver | null = null;
    let observedHost: HTMLElement | null = null;

    const syncObserverTarget = (host: HTMLElement | null) => {
      if (observedHost === host) return;
      resizeObserver?.disconnect();
      observedHost = host;
      if (host && typeof ResizeObserver !== "undefined") {
        resizeObserver = new ResizeObserver(() => scheduleMeasure());
        resizeObserver.observe(host);
      }
    };

    const measure = () => {
      const host = findActiveGridHost(preferCityCanvas);
      syncObserverTarget(host);

      const nextBox = readCanvasBox(host);
      setCanvasBox((prev) => nextBox ?? (questionnaireOpen ? prev : null));
    };

    const scheduleMeasure = () => {
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(measure);
    };

    scheduleMeasure();
    window.addEventListener("resize", scheduleMeasure);
    if (typeof MutationObserver !== "undefined" && typeof document !== "undefined") {
      mutationObserver = new MutationObserver(() => scheduleMeasure());
      mutationObserver.observe(document.body, { childList: true, subtree: true });
    }

    return () => {
      cancelAnimationFrame(rafId);
      resizeObserver?.disconnect();
      mutationObserver?.disconnect();
      window.removeEventListener("resize", scheduleMeasure);
    };
  }, [preferCityCanvas, questionnaireOpen]);

  const layout = useMemo(() => {
    if (!canvasBox) return null;

    const spec = resolveCanvasPaddingSpec(canvasBox.width, CANVAS_PADDING.questionnaire as never);
    const grid = makeCenteredSquareGrid({
      w: canvasBox.width,
      h: canvasBox.height,
      rows: spec.rows,
      useTopRatio: spec.useTopRatio ?? 1,
      horizonPos: spec.horizonPos,
    });

    const size: CellSize = {
      cellW: grid.cellW,
      cellH: grid.cellH,
      ox: grid.ox,
      oy: grid.oy,
      ...grid.metrics,
    };

    return {
      width: canvasBox.width,
      height: canvasBox.height,
      device: deviceType(canvasBox.width) as DeviceType,
      rows: grid.rows,
      cols: grid.cols,
      usedRows: usedRowsFromSpec(grid.rows, spec.useTopRatio),
      spec,
      size,
      colsPerRow: grid.metrics.colsPerRow,
    };
  }, [canvasBox]);

  const getPlacementStyle = (
    placement: UiGridPlacementInput
  ): CSSProperties | undefined => {
    if (!layout) return undefined;

    const resolvedPlacement = resolveUiGridPlacement(
      {
        rows: layout.rows,
        cols: layout.cols,
        usedRows: layout.usedRows,
        colsPerRow: layout.colsPerRow,
      },
      placement
    );
    const px = uiGridPlacementToPx(layout.size, resolvedPlacement);
    return {
      left: `${px.left}px`,
      top: `${px.anchorY}px`,
      width: `${px.width}px`,
      justifyContent: justifyContentForUiPlacement(placement),
    };
  };

  const resolvePlacement = useCallback(
    (placement: UiGridPlacementInput) => {
      if (!layout) return undefined;

      return resolveUiGridPlacement(
        {
          rows: layout.rows,
          cols: layout.cols,
          usedRows: layout.usedRows,
          colsPerRow: layout.colsPerRow,
        },
        placement
      );
    },
    [layout]
  );

  return {
    ready: !!layout,
    device: layout?.device ?? "laptop",
    layout,
    getPlacementStyle,
    resolvePlacement,
  };
}
