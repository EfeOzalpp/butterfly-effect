// src/graph-runtime/dotgraph/components/ShapesLayer.tsx

import React, { useMemo } from "react";
import { Line, Billboard } from "@react-three/drei";
import { SpriteShape, resolveSpriteVisual } from "../../sprites/entry";
import { hasDotId } from "../types";
import type { DotGraphHoverEvent, DotGraphHoverStart, DotPoint } from "../types";

const CIRCLE_PTS: [number, number, number][] = Array.from({ length: 49 }, (_, i) => {
  const a = (i / 48) * Math.PI * 2;
  return [Math.cos(a), Math.sin(a), 0];
});

interface ShapesLayerProps {
  shapes: DotPoint[];
  myEntry: unknown;
  personalizedEntryId: string | null;
  showCompleteUI: boolean;
  onHoverStart: DotGraphHoverStart;
  onHoverEnd: () => void;
  tieKeyForId: (id: string) => number | null;
  setSelectedTieKey: React.Dispatch<React.SetStateAction<number | null>>;
  selectedTieKey: number | null;
  spriteScale: number;
  bagSeed: string;
  darkMode?: boolean;
  occasionalRefreshMs?: number;
  particleFrames?: number;
  tileSize?: number;
  section?: string;
}

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
  darkMode = false,
  occasionalRefreshMs = 0,
  particleFrames = 219,
  tileSize = 128,
  section = '',
}: ShapesLayerProps) {
  const setShapeCursor = (active: boolean, e?: DotGraphHoverEvent) => {
    const target = e?.nativeEvent?.target;
    if (!(target instanceof HTMLElement)) return;
    target.classList.toggle("hovering-shape", active);
  };

  const shapeVisuals = useMemo(
    () =>
      shapes.map((shape, i) => {
        const avg = Number.isFinite(shape.averageWeight) ? shape.averageWeight : 0.5;
        const sprite = resolveSpriteVisual({
          entryId: shape._id,
          sectionKey: section,
          avg,
          seed: bagSeed,
          orderIndex: i,
          baseScale: spriteScale,
        });
        return {
          shape,
          avg,
          index: i,
          sx: sprite.layout.scale[0],
          sy: sprite.layout.scale[1],
          assignment: sprite.assignment,
        };
      }),
    [shapes, bagSeed, spriteScale, section]
  );

  return (
    <>
      {shapeVisuals.map(({ shape, avg, index, sx, sy, assignment }) => {
        const suppressHover = !!(myEntry && shape._id === personalizedEntryId && showCompleteUI);
        const identifiedShape = hasDotId(shape) ? shape : null;

        return (
          <group
            key={shape._id ?? shape.position.join("-")}
            position={shape.position}
          >
            <sprite
              onPointerOver={(e) => {
                e.stopPropagation();
                if (!suppressHover && identifiedShape) {
                  setShapeCursor(true, e);
                  onHoverStart(identifiedShape, e);
                }
              }}
              onPointerOut={(e) => {
                e.stopPropagation();
                setShapeCursor(false, e);
                if (!suppressHover && identifiedShape) onHoverEnd();
              }}
              onClick={(e) => {
                e.stopPropagation();
                if (!identifiedShape) return;
                if (!suppressHover) onHoverStart(identifiedShape, e);
                const key = tieKeyForId(identifiedShape._id);
                setSelectedTieKey((prev) => (prev === key ? null : (key ?? null)));
              }}
              scale={[sx, sy, 1]}
              frustumCulled={false}
            >
              <spriteMaterial transparent opacity={0} depthWrite={false} depthTest={false} />
            </sprite>

            {selectedTieKey != null && identifiedShape && tieKeyForId(identifiedShape._id) === selectedTieKey && (
              <Billboard>
                <group scale={[Math.max(sx, sy) * 0.5, Math.max(sx, sy) * 0.5, 1]}>
                  <Line
                    points={CIRCLE_PTS}
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
              tileSize={tileSize}
              alpha={215}
              blend={0.6}
              worldPosition={shape.position}
              seed={bagSeed}
              orderIndex={index}
              freezeParticles={true}
              particleStepMs={33}
              particleFrames={particleFrames}
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
