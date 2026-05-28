// src/graph-runtime/dotgraph/components/GeneralizedLayer.tsx

import React, { useMemo, type CSSProperties } from "react";
import { Html } from "@react-three/drei";
import GamificationGeneral from "../../gamification/gamification-general";
import { avgWeightOf } from "../../../lib/utils/score";
import { getTieStats, classifyPosition } from "../../gamification/rankLogic";
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
  offsetPx: number;
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

export default function HoveredLayer({
  hoveredDot,
  shapes,
  safeData,
  mode,
  offsetPx,
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

  const htmlStyle: CSSProperties & { "--offset-px": string } = {
    pointerEvents: "none",
    "--offset-px": `${String(offsetPx)}px`,
    opacity: 1,
  };

  return (
    <Html
      position={content.hoveredShape.position}
      center
      zIndexRange={[120, 180]}
      style={htmlStyle}
      className={viewportClass}
    >
      <>
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
      </>
    </Html>
  );
}
