import React, { useMemo } from "react";
import { Line } from "@react-three/drei";
import { SpriteShape } from "../../sprites/entry";
import { shapeForAvg } from "../../sprites/selection/shapeForAvg";
import { FOOTPRINTS as SHAPE_FOOTPRINT } from "../../sprites/selection/footprints";

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
  selectedTieLinePoints: any[];
  spriteScale: number;
  bagSeed: string;
  bleedOf: (shapeKey: string) => { top: number; right: number; bottom: number; left: number };
  darkMode?: boolean;
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
  selectedTieLinePoints,
  spriteScale,
  bagSeed,
  bleedOf,
  darkMode = false,
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
        const chosenShape = shapeForAvg(avg, bagSeed, i);
        const fp = (SHAPE_FOOTPRINT as any)[chosenShape] ?? { w: 1, h: 1 };
        const aspect = fp.w / Math.max(0.0001, fp.h);
        const b = bleedOf(chosenShape);
        const sCompX = 1 / (1 + (b.left || 0) + (b.right || 0));
        const sCompY = 1 / (1 + (b.top || 0) + (b.bottom || 0));

        return {
          shape,
          avg,
          index: i,
          sx: spriteScale * aspect * sCompX,
          sy: spriteScale * sCompY,
        };
      }),
    [shapes, bagSeed, bleedOf, spriteScale]
  );

  return (
    <>
      {shapeVisuals.map(({ shape, avg, index, sx, sy }) => {
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

            <SpriteShape
              avg={avg}
              position={[0, 0, 0]}
              scale={spriteScale}
              tileSize={128}
              alpha={215}
              blend={0.6}
              seed={bagSeed}
              orderIndex={index}
              freezeParticles={true}
              particleStepMs={33}
              particleFrames={219}
              darkMode={darkMode}
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
