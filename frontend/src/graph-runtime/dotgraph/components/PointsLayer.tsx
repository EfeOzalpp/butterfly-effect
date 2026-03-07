import React from "react";
import { Line } from "@react-three/drei";
import { SpriteShape } from "../../sprites/entry";
import { shapeForAvg } from "../../sprites/selection/shapeForAvg";
import { FOOTPRINTS as SHAPE_FOOTPRINT } from "../../sprites/selection/footprints";

type PointsLayerProps = {
  points: any[];
  mode: "absolute" | "relative";
  myEntry: any;
  personalizedEntryId: string | null;
  showCompleteUI: boolean;
  onHoverStart: (point: any, e: any) => void;
  onHoverEnd: () => void;
  tieKeyForId: (id: string) => number | null;
  setSelectedTieKey: React.Dispatch<React.SetStateAction<number | null>>;
  selectedTieKey: number | null;
  selectedTieLinePoints: any[];
  hoveredAbsEqualSet: Set<string>;
  hoveredRelIds: string[];
  rankChainIdSet: Set<string>;
  spriteScale: number;
  bagSeed: string;
  bleedOf: (shapeKey: string) => { top: number; right: number; bottom: number; left: number };
};

export default function PointsLayer({
  points,
  mode,
  myEntry,
  personalizedEntryId,
  showCompleteUI,
  onHoverStart,
  onHoverEnd,
  tieKeyForId,
  setSelectedTieKey,
  selectedTieKey,
  selectedTieLinePoints,
  hoveredAbsEqualSet,
  hoveredRelIds,
  rankChainIdSet,
  spriteScale,
  bagSeed,
  bleedOf,
}: PointsLayerProps) {
  return (
    <>
      {points.map((point, i) => {
        const suppressHover = !!(myEntry && point._id === personalizedEntryId && showCompleteUI);

        const tieKey = tieKeyForId(point._id);
        const isInSelectedTie = selectedTieKey != null && tieKey === selectedTieKey;

        const showAbsEqualHoverHover = mode === "absolute" && hoveredAbsEqualSet.has(point._id);
        const showRelEqualHoverHover =
          mode === "relative" && hoveredRelIds.length > 1 && hoveredRelIds.includes(point._id);

        const _unused =
          isInSelectedTie ||
          showRelEqualHoverHover ||
          showAbsEqualHoverHover ||
          rankChainIdSet.has(point._id);
        void _unused;

        const avg = Number.isFinite(point.averageWeight) ? point.averageWeight : 0.5;

        const chosenShape = shapeForAvg(avg, bagSeed, i);
        const fp = (SHAPE_FOOTPRINT as any)[chosenShape] ?? { w: 1, h: 1 };
        const aspect = fp.w / Math.max(0.0001, fp.h);

        const b = bleedOf(chosenShape);
        const sCompX = 1 / (1 + (b.left || 0) + (b.right || 0));
        const sCompY = 1 / (1 + (b.top || 0) + (b.bottom || 0));

        const sx = spriteScale * aspect * sCompX;
        const sy = spriteScale * sCompY;

        return (
          <group
            key={point._id ?? `${point.position?.[0]}-${point.position?.[1]}-${point.position?.[2]}`}
            position={point.position as any}
          >
            <sprite
              onPointerOver={(e) => {
                e.stopPropagation();
                if (!suppressHover) onHoverStart(point, e);
              }}
              onPointerOut={(e) => {
                e.stopPropagation();
                if (!suppressHover) onHoverEnd();
              }}
              onClick={(e) => {
                e.stopPropagation();
                if (!suppressHover) onHoverStart(point, e);
                const key = tieKeyForId(point._id);
                setSelectedTieKey((prev) => (prev === key ? null : (key ?? null)));
              }}
              scale={[sx, sy, 1]}
            >
              <spriteMaterial transparent opacity={0} depthWrite={false} depthTest={false} />
            </sprite>

            <SpriteShape
              avg={avg}
              position={[0, 0, 0]}
              scale={spriteScale}
              tileSize={128}
              alpha={215}
              blend={0.6}
              seed={bagSeed}
              orderIndex={i}
              freezeParticles={true}
              particleStepMs={33}
              particleFrames={219}
            />
          </group>
        );
      })}

      {selectedTieKey != null && selectedTieLinePoints.length >= 2 && (
        <Line
          points={selectedTieLinePoints as any}
          color="#a3a3a3"
          lineWidth={1.5}
          dashed={false}
          toneMapped={false}
          transparent
          opacity={0.75}
        />
      )}
    </>
  );
}
