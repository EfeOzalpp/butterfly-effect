// src/graph-runtime/dotgraph/components/ShapesLayer.tsx

import { useEffect, useMemo, useRef } from "react";
import { useThree, useFrame } from "@react-three/fiber";
import { Vector3 } from "three";
import type { Sprite } from "three";
import { SpriteShape, resolveSpriteVisual } from "../../sprites/entry";
import { hasDotId } from "../types";
import type { DotGraphHoverEvent, DotGraphHoverStart, DotPoint } from "../types";

interface ShapesLayerProps {
  shapes: DotPoint[];
  myEntry: unknown;
  personalizedEntryId: string | null;
  showCompleteUI: boolean;
  onHoverStart: DotGraphHoverStart;
  onHoverEnd: () => void;
  spriteScale: number;
  bagSeed: string;
  darkMode?: boolean;
  occasionalRefreshMs?: number;
  particleFrames?: number;
  tileSize?: number;
  section?: string;
  hitboxScale?: number;
}

export default function ShapesLayer({
  shapes,
  myEntry,
  personalizedEntryId,
  showCompleteUI,
  onHoverStart,
  onHoverEnd,
  spriteScale,
  bagSeed,
  darkMode = false,
  occasionalRefreshMs = 0,
  particleFrames = 219,
  tileSize = 128,
  section = '',
  hitboxScale = 1,
}: ShapesLayerProps) {
  const { camera, gl } = useThree();
  const hoverTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hitboxRefs = useRef<(Sprite | null)[]>([]);
  const _tmpVec = useMemo(() => new Vector3(), []);

  useFrame(() => {
    const cullDist = camera.position.length() * 0.35;
    for (let i = 0; i < shapeVisuals.length; i++) {
      const sprite = hitboxRefs.current[i];
      if (!sprite?.parent) continue;
      sprite.getWorldPosition(_tmpVec);
      const tooClose = camera.position.distanceTo(_tmpVec) < cullDist;
      const { sx, sy } = shapeVisuals[i];
      sprite.scale.set(
        tooClose ? 0 : sx,
        tooClose ? 0 : sy,
        1
      );
    }
  });

  const clearHoverTimer = () => {
    if (!hoverTimerRef.current) return;
    clearTimeout(hoverTimerRef.current);
    hoverTimerRef.current = null;
  };

  useEffect(() => () => {
    if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
  }, []);

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
          hitboxScale,
        });
        return {
          shape,
          avg,
          index: i,
          sx: sprite.layout.scale[0],
          sy: sprite.layout.scale[1],
          offset: sprite.layout.offset,
          assignment: sprite.assignment,
        };
      }),
    [shapes, bagSeed, spriteScale, section, hitboxScale]
  );

  return (
    <>
      {shapeVisuals.map(({ shape, avg, index, offset, assignment }, loopIdx) => {
        const suppressHover = !!(myEntry && shape._id === personalizedEntryId && showCompleteUI);
        const identifiedShape = hasDotId(shape) ? shape : null;

        return (
          <group
            key={shape._id ?? shape.position.join("-")}
            position={shape.position}
          >
            <sprite
              ref={(el: Sprite | null) => { hitboxRefs.current[loopIdx] = el; }}
              onPointerOver={(e) => {
                e.stopPropagation();
                if (!suppressHover && identifiedShape) {
                  setShapeCursor(true, e);
                  const tgt = e.nativeEvent.target;
                  const capturedShape = identifiedShape;
                  const capturedPos = shape.position;
                  clearHoverTimer();
                  hoverTimerRef.current = setTimeout(() => {
                    hoverTimerRef.current = null;
                    const projected = new Vector3(...capturedPos).project(camera);
                    const rect = gl.domElement.getBoundingClientRect();
                    const sx = (projected.x * 0.5 + 0.5) * rect.width + rect.left;
                    const sy = (-projected.y * 0.5 + 0.5) * rect.height + rect.top;
                    onHoverStart(capturedShape, { nativeEvent: { clientX: sx, clientY: sy, target: tgt } });
                  }, 80);
                }
              }}
              onPointerOut={(e) => {
                e.stopPropagation();
                setShapeCursor(false, e);
                clearHoverTimer();
                if (!suppressHover && identifiedShape) {
                  onHoverEnd();
                }
              }}
              onClick={(e) => {
                e.stopPropagation();
                if (!identifiedShape) return;
                if (!suppressHover) onHoverStart(identifiedShape, e);
              }}
              position={offset}
            >
              <spriteMaterial transparent opacity={0} depthWrite={false} depthTest={false} />
            </sprite>

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
