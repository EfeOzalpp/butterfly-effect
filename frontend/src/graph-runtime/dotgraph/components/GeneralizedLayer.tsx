// src/graph-runtime/dotgraph/components/GeneralizedLayer.tsx

import React, { useCallback, useLayoutEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { Html } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { Vector3, type Group } from "three";
import GamificationGeneral from "../../gamification/gamification-general";
import { avgWeightOf } from "../../../lib/utils/score";
import { getTieStats, classifyPosition } from "../../gamification/rankLogic";
import { resolveTooltipAnchorCenterOffset } from "../tooltip/placement";
import { resolveHitboxScreenHalfSize } from "../tooltip/screenSize";
import {
  EMPTY_TOOLTIP_HITBOX_CSS_VARS,
  hasResolvedHitboxSize,
  makeTooltipHitboxCssVars,
} from "../tooltip/hitboxCss";
import type {
  DotGraphEntry,
  DotGraphHoveredDot,
  DotGraphPositionClass,
  DotGraphTieStats,
  DotPoint,
} from "../types";

interface HoveredLayerProps {
  hoveredDot: DotGraphHoveredDot | null;
  shapes: DotPoint[];
  safeData: DotGraphEntry[];
  mode: "absolute" | "relative";
  zoomFraction: number;
  viewportClass: string;
  calcValueForAvg: (avg: number) => number;
  getRelForId: (id: string) => number;
  absScoreById: Map<string, number>;
}

interface HoveredLayerContent {
  hoveredShape: DotPoint;
  displayPct: number;
  hoveredStats: DotGraphTieStats;
  hoveredClass: DotGraphPositionClass;
}

interface AnchoredTooltipProps {
  hoveredDot: DotGraphHoveredDot;
  fallbackPosition: DotPoint["position"];
  zoomFraction: number;
  className: string;
  style: CSSProperties;
  children: React.ReactNode;
}

const TMP_CENTER_LOCAL = new Vector3();
const TMP_CENTER_WORLD = new Vector3();
const TMP_ANCHOR_WORLD = new Vector3();
const TMP_ANCHOR_LOCAL = new Vector3();
const TMP_CAMERA_RIGHT = new Vector3();
const TMP_CAMERA_UP = new Vector3();
const TMP_CAMERA_FORWARD = new Vector3();

function AnchoredTooltip({
  hoveredDot,
  fallbackPosition,
  zoomFraction,
  className,
  style,
  children,
}: AnchoredTooltipProps) {
  const anchorRef = useRef<Group | null>(null);
  const { camera, gl } = useThree();
  const [hitboxHalfSize, setHitboxHalfSize] = useState({ width: 0, height: 0 });

  const updateAnchorPosition = useCallback(() => {
    const anchor = anchorRef.current;
    const parent = anchor?.parent;
    const layout = hoveredDot.tooltipLayout;
    if (!anchor || !parent) return;

    if (hoveredDot.anchorPosition && !layout) {
      TMP_ANCHOR_WORLD.set(
        hoveredDot.anchorPosition[0],
        hoveredDot.anchorPosition[1],
        hoveredDot.anchorPosition[2]
      );
      TMP_ANCHOR_LOCAL.copy(TMP_ANCHOR_WORLD);
      parent.worldToLocal(TMP_ANCHOR_LOCAL);
      anchor.position.copy(TMP_ANCHOR_LOCAL);
      return;
    }

    if (!layout) return;

    TMP_CENTER_LOCAL.set(fallbackPosition[0], fallbackPosition[1], fallbackPosition[2]);
    TMP_CENTER_WORLD.copy(TMP_CENTER_LOCAL);
    parent.localToWorld(TMP_CENTER_WORLD);

    TMP_CAMERA_RIGHT.setFromMatrixColumn(camera.matrixWorld, 0).normalize();
    TMP_CAMERA_UP.setFromMatrixColumn(camera.matrixWorld, 1).normalize();
    TMP_CAMERA_FORWARD.setFromMatrixColumn(camera.matrixWorld, 2).normalize();

    TMP_ANCHOR_WORLD.copy(TMP_CENTER_WORLD);
    if (hoveredDot.tooltipAnchorMode !== "shapeCenter") {
      const [offsetX, offsetY, offsetZ] = resolveTooltipAnchorCenterOffset(layout);
      TMP_ANCHOR_WORLD
        .addScaledVector(TMP_CAMERA_RIGHT, offsetX)
        .addScaledVector(TMP_CAMERA_UP, offsetY)
        .addScaledVector(TMP_CAMERA_FORWARD, offsetZ);
    }

    const nextHalfSize = resolveHitboxScreenHalfSize({
      camera,
      domElement: gl.domElement,
      anchorWorld: TMP_ANCHOR_WORLD,
      cameraRight: TMP_CAMERA_RIGHT,
      cameraUp: TMP_CAMERA_UP,
      layout,
    });
    setHitboxHalfSize((prev) => {
      const width = Math.round(nextHalfSize.width);
      const height = Math.round(nextHalfSize.height);
      return prev.width === width && prev.height === height ? prev : { width, height };
    });

    TMP_ANCHOR_LOCAL.copy(TMP_ANCHOR_WORLD);
    parent.worldToLocal(TMP_ANCHOR_LOCAL);
    anchor.position.copy(TMP_ANCHOR_LOCAL);
  }, [camera, fallbackPosition, gl.domElement, hoveredDot.anchorPosition, hoveredDot.tooltipAnchorMode, hoveredDot.tooltipLayout]);

  useLayoutEffect(() => {
    updateAnchorPosition();
  }, [updateAnchorPosition]);

  useFrame(updateAnchorPosition);

  const resolvedStyle = useMemo(
    () => makeTooltipHitboxCssVars({
      halfSize: hitboxHalfSize,
      zoomFraction,
      style,
    }),
    [hitboxHalfSize.height, hitboxHalfSize.width, style, zoomFraction]
  );

  return (
    <group ref={anchorRef} position={fallbackPosition}>
      {hasResolvedHitboxSize(hitboxHalfSize) && (
        <Html
          position={[0, 0, 0]}
          center
          zIndexRange={[120, 180]}
          style={resolvedStyle}
          className={className}
        >
          {children}
        </Html>
      )}
    </group>
  );
}

export default function HoveredLayer({
  hoveredDot,
  shapes,
  safeData,
  mode,
  zoomFraction,
  viewportClass,
  calcValueForAvg,
  getRelForId,
  absScoreById,
}: HoveredLayerProps) {
  const content = useMemo<HoveredLayerContent | null>(() => {
    if (!hoveredDot) return null;

    const hoveredShape = shapes.find((shape) => shape._id === hoveredDot.dotId);
    if (!hoveredShape) return null;

    const hoveredEntry = safeData.find((entry) => entry._id === hoveredDot.dotId);
    const hoveredAvg = hoveredEntry ? avgWeightOf(hoveredEntry) : undefined;

    let displayPct = 0;
    if (typeof hoveredAvg === "number" && Number.isFinite(hoveredAvg)) {
      try {
        displayPct = Math.round(calcValueForAvg(hoveredAvg));
      } catch {
        displayPct = 0;
      }
    }

    if (!Number.isFinite(displayPct) || displayPct < 0) {
      displayPct =
        mode === "relative"
          ? getRelForId(hoveredDot.dotId)
          : (absScoreById.get(hoveredDot.dotId) ?? 0);
    }

    const hoveredStats: DotGraphTieStats = hoveredEntry
      ? getTieStats({ data: safeData, targetId: hoveredDot.dotId })
      : { below: 0, equal: 0, above: 0, totalOthers: 0 };

    const hoveredClass = classifyPosition(hoveredStats);

    return {
      hoveredShape,
      displayPct,
      hoveredStats,
      hoveredClass,
    };
  }, [hoveredDot, shapes, safeData, mode, calcValueForAvg, getRelForId, absScoreById]);

  if (!hoveredDot || !content) return null;

  const htmlStyle: CSSProperties = {
    pointerEvents: "none",
    ...EMPTY_TOOLTIP_HITBOX_CSS_VARS,
    opacity: 1,
  };

  return (
    <AnchoredTooltip
      hoveredDot={hoveredDot}
      fallbackPosition={content.hoveredShape.position}
      zoomFraction={zoomFraction}
      style={htmlStyle}
      className={viewportClass}
    >
      <GamificationGeneral
        dotId={hoveredDot.dotId}
        percentage={content.displayPct}
        color={content.hoveredShape.color}
        mode={mode}
        belowCountStrict={content.hoveredStats.below}
        equalCount={content.hoveredStats.equal}
        aboveCountStrict={content.hoveredStats.above}
        positionClass={content.hoveredClass.position}
      />
    </AnchoredTooltip>
  );
}
