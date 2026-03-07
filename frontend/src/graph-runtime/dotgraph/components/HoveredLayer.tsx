import React, { useMemo } from "react";
import { Html } from "@react-three/drei";
import GamificationGeneral from "../../gamification/GamificationGeneral";
import { avgWeightOf } from "../../../lib/hooks/useRelativeScore";
import { getTieStats, classifyPosition } from "../../gamification/rankLogic";

type HoveredLayerProps = {
  hoveredDot: any;
  points: any[];
  safeData: any[];
  mode: "absolute" | "relative";
  offsetPx: number;
  viewportClass: string;
  calcValueForAvg: (avg: number) => number;
  getRelForId: (id: string) => number;
  absScoreById: Map<string, number>;
};

export default function HoveredLayer({
  hoveredDot,
  points,
  safeData,
  mode,
  offsetPx,
  viewportClass,
  calcValueForAvg,
  getRelForId,
  absScoreById,
}: HoveredLayerProps) {
  const content = useMemo(() => {
    if (!hoveredDot) return null;

    const hoveredData = points.find((d) => d._id === hoveredDot.dotId);
    if (!hoveredData) return null;

    const hoveredEntry = safeData.find((d) => d._id === hoveredDot.dotId);
    const hoveredAvg = hoveredEntry ? avgWeightOf(hoveredEntry) : undefined;

    let displayPct = 0;
    if (Number.isFinite(hoveredAvg as any)) {
      try {
        displayPct = Math.round(calcValueForAvg(hoveredAvg as number));
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

    const hoveredStats = hoveredEntry
      ? getTieStats({ data: safeData, targetId: hoveredEntry._id })
      : { below: 0, equal: 0, above: 0, totalOthers: 0 };

    const hoveredClass = classifyPosition(hoveredStats);

    return {
      hoveredData,
      displayPct,
      hoveredStats,
      hoveredClass,
    };
  }, [hoveredDot, points, safeData, mode, calcValueForAvg, getRelForId, absScoreById]);

  if (!hoveredDot || !content) return null;

  return (
    <Html
      position={content.hoveredData.position as any}
      center
      zIndexRange={[120, 180]}
      style={{
        pointerEvents: "none",
        ["--offset-px" as any]: `${offsetPx}px`,
        opacity: 1,
      }}
      className={viewportClass}
    >
      <div>
        <GamificationGeneral
          dotId={hoveredDot.dotId}
          percentage={content.displayPct}
          color={content.hoveredData.color}
          mode={mode}
          belowCountStrict={content.hoveredStats.below}
          equalCount={content.hoveredStats.equal}
          aboveCountStrict={content.hoveredStats.above}
          positionClass={content.hoveredClass.position}
          tieContext={content.hoveredClass.tieContext}
        />
      </div>
    </Html>
  );
}
