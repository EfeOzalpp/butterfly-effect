import React, { useMemo } from "react";
import { Line, Billboard } from "@react-three/drei";
import { SpriteShape } from "../../sprites/entry";
import { chooseShape, getOrAssignShapeEntry } from "../../sprites/internal/spritePolicy";
import { FOOTPRINTS as SHAPE_FOOTPRINT } from "../../sprites/selection/footprints";

const CIRCLE_PTS: [number, number, number][] = Array.from({ length: 49 }, (_, i) => {
  const a = (i / 48) * Math.PI * 2;
  return [Math.cos(a), Math.sin(a), 0];
});

type ShapesLayerProps = {
  shapes: any[];
  myEntry: any;
  personalizedEntryId: string | null;
  showCompleteUI: boolean;
  onHoverStart: (shape: any, e: any) => void;
  onHoverEnd: () => void;
  tieKeyForId: (id: string) => number | null;
  setSelectedTieKey: React.Dispatch<React.SetStateAction<number | null>>;
  selectedTieKey: number | null;
  spriteScale: number;
  bagSeed: string;
  bleedOf: (shapeKey: string) => { top: number; right: number; bottom: number; left: number };
  darkMode?: boolean;
  occasionalRefreshMs?: number;
  section?: string;
};

export default function ShapesLayer({
  shapes,
  myEntry,
  personalizedEntryId,
  showCompleteUI,
  onHoverStart,
  onHoverEnd,
  tieKeyForId,
  setSelectedTieKey,
  selectedTieKey,
  spriteScale,
  bagSeed,
  bleedOf,
  darkMode = false,
  occasionalRefreshMs = 0,
  section = '',
}: ShapesLayerProps) {
  const setShapeCursor = (active: boolean, e?: any) => {
    const canvas = e?.nativeEvent?.target as HTMLElement | undefined;
    if (!canvas?.classList) return;
    canvas.classList.toggle("hovering-shape", active);
  };

  const shapeVisuals = useMemo(
    () =>
      shapes.map((shape, i) => {
        const avg = Number.isFinite(shape.averageWeight) ? shape.averageWeight : 0.5;
        const assignment = shape._id
          ? getOrAssignShapeEntry(shape._id, section, avg, bagSeed, i)
          : undefined;
        const chosenShape = assignment?.shape ?? chooseShape({ avg, seed: bagSeed, orderIndex: i });
        const fp = (SHAPE_FOOTPRINT as any)[chosenShape] ?? { w: 1, h: 1 };
        const aspect = fp.w / Math.max(0.0001, fp.h);
        const b = bleedOf(chosenShape);
        const sCompX = 1 / (1 + (b.left || 0) + (b.right || 0));
        const sCompY = 1 / (1 + (b.top || 0) + (b.bottom || 0));
        return { shape, avg, index: i, sx: spriteScale * aspect * sCompX, sy: spriteScale * sCompY, assignment };
      }),
    [shapes, bagSeed, bleedOf, spriteScale, section]
  );

  return (
    <>
      {shapeVisuals.map(({ shape, avg, index, sx, sy, assignment }) => {
        const suppressHover = !!(myEntry && shape._id === personalizedEntryId && showCompleteUI);

        return (
          <group
            key={shape._id ?? `${shape.position?.[0]}-${shape.position?.[1]}-${shape.position?.[2]}`}
            position={shape.position as any}
          >
            <sprite
              onPointerOver={(e) => {
                e.stopPropagation();
                if (!suppressHover) {
                  setShapeCursor(true, e);
                  onHoverStart(shape, e);
                }
              }}
              onPointerOut={(e) => {
                e.stopPropagation();
                setShapeCursor(false, e);
                if (!suppressHover) onHoverEnd();
              }}
              onClick={(e) => {
                e.stopPropagation();
                if (!suppressHover) onHoverStart(shape, e);
                const key = tieKeyForId(shape._id);
                setSelectedTieKey((prev) => (prev === key ? null : (key ?? null)));
              }}
              scale={[sx, sy, 1]}
            >
              <spriteMaterial transparent opacity={0} depthWrite={false} depthTest={false} />
            </sprite>

            {selectedTieKey != null && tieKeyForId(shape._id) === selectedTieKey && (
              <Billboard>
                <group scale={[Math.max(sx, sy) * 0.5, Math.max(sx, sy) * 0.5, 1]}>
                  <Line
                    points={CIRCLE_PTS as any}
                    color={darkMode ? "#9ca3af" : "#6b7280"}
                    lineWidth={1.5}
                    toneMapped={false}
                    transparent
                    opacity={0.8}
                  />
                </group>
              </Billboard>
            )}

            <SpriteShape
              avg={avg}
              position={[0, 0, 0]}
              scale={spriteScale}
              tileSize={128}
              alpha={215}
              blend={0.6}
              worldPosition={shape.position}
              seed={bagSeed}
              orderIndex={index}
              freezeParticles={true}
              particleStepMs={33}
              particleFrames={219}
              darkMode={darkMode}
              occasionalRefreshMs={occasionalRefreshMs}
              assignment={assignment}
            />
          </group>
        );
      })}

    </>
  );
}
