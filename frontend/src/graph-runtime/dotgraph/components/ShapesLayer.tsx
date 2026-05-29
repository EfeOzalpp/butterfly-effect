// src/graph-runtime/dotgraph/components/ShapesLayer.tsx

import { useEffect, useMemo, useRef, useState, type RefObject } from "react";
import { useThree, useFrame } from "@react-three/fiber";
import { Vector2, Vector3 } from "three";
import type { Sprite } from "three";
import {
  SpriteShape,
  pauseSpriteEpochScheduler,
  pauseSpriteTextureQueue,
  resolveSpriteVisual,
  resumeSpriteEpochScheduler,
  resumeSpriteTextureQueue,
} from "../../sprites/entry";
import {
  makeCenteredTooltipEvent,
  spriteRuntimeTooltipLayout,
} from "../tooltip/hoverEvent";
import { hasDotId } from "../types";
import type { DotGraphHoverEvent, DotGraphHoverStart, DotPoint } from "../types";
import type { SpriteVisualLayout } from "../../sprites/types";
import {
  resolveHitboxDistanceState,
  resolveTooltipHitboxState,
} from "../interaction/hitboxDistancePolicy";
import { shouldShowHitboxDebugOverlay } from "../../debug/spriteFlags";

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
  useDesktopLayout: boolean;
  zoomTargetRef?: RefObject<number | null>;
  hidePersonalizedSprite?: boolean;
}

const HITBOX_ZOOM_SETTLE_MS = 80;
const TEXTURE_ZOOM_SETTLE_MS = 180;
const DENSE_SCENE_QUALITY_UPGRADE_LIMIT = 180;

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
  useDesktopLayout,
  zoomTargetRef,
  hidePersonalizedSprite = false,
}: ShapesLayerProps) {
  const { camera, gl } = useThree();
  const hoverTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hitboxRefs = useRef<(Sprite | null)[]>([]);
  const _tmpVec = useMemo(() => new Vector3(), []);
  const showHitboxDebugOverlay = shouldShowHitboxDebugOverlay();
  const lastZoomActiveAtRef = useRef(0);
  const textureQueuePausedRef = useRef(false);
  const epochSchedulerPausedRef = useRef(false);
  const [suspendSpriteQuality, setSuspendSpriteQuality] = useState(false);
  const denseScene = shapes.length >= DENSE_SCENE_QUALITY_UPGRADE_LIMIT;

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
          offset: sprite.layout.offset,
          center: sprite.layout.center,
          spriteShape: sprite.shape,
          assignment: sprite.assignment,
          layout: sprite.layout,
        };
      }),
    [shapes, bagSeed, spriteScale, section]
  );

  useFrame(() => {
    const now = performance.now();
    const zoomActive = zoomTargetRef?.current != null;
    if (zoomActive) {
      lastZoomActiveAtRef.current = now;
      if (!textureQueuePausedRef.current) {
        pauseSpriteTextureQueue();
        textureQueuePausedRef.current = true;
      }
      if (!epochSchedulerPausedRef.current) {
        pauseSpriteEpochScheduler();
        epochSchedulerPausedRef.current = true;
      }
      setSuspendSpriteQuality((prev) => prev ? prev : true);
      return;
    }

    if (
      textureQueuePausedRef.current &&
      now - lastZoomActiveAtRef.current >= TEXTURE_ZOOM_SETTLE_MS
    ) {
      resumeSpriteTextureQueue();
      textureQueuePausedRef.current = false;
      resumeSpriteEpochScheduler();
      epochSchedulerPausedRef.current = false;
      setSuspendSpriteQuality((prev) => prev ? false : prev);
    }

    if (now - lastZoomActiveAtRef.current < HITBOX_ZOOM_SETTLE_MS) return;

    const camRadius = camera.position.length();
    for (let i = 0; i < shapeVisuals.length; i++) {
      const sprite = hitboxRefs.current[i];
      if (!sprite?.parent) continue;
      sprite.getWorldPosition(_tmpVec);
      const d = camera.position.distanceTo(_tmpVec);
      const next = resolveHitboxDistanceState({
        shape: shapeVisuals[i].spriteShape,
        layout: shapeVisuals[i].layout,
        distanceToCamera: d,
        cameraRadius: camRadius,
        sceneHitboxScale: hitboxScale,
      });
      sprite.visible = next.visible;
      sprite.scale.set(next.scale[0], next.scale[1], next.scale[2]);
      sprite.center.set(next.center[0], next.center[1]);
    }
  });

  const clearHoverTimer = () => {
    if (!hoverTimerRef.current) return;
    clearTimeout(hoverTimerRef.current);
    hoverTimerRef.current = null;
  };

  useEffect(() => () => {
    if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
    if (textureQueuePausedRef.current) {
      resumeSpriteTextureQueue();
      textureQueuePausedRef.current = false;
    }
    if (epochSchedulerPausedRef.current) {
      resumeSpriteEpochScheduler();
      epochSchedulerPausedRef.current = false;
    }
  }, []);

  const setShapeCursor = (active: boolean, e?: DotGraphHoverEvent) => {
    const target = e?.nativeEvent?.target;
    if (!(target instanceof HTMLElement)) return;
    target.classList.toggle("hovering-shape", active);
  };

  const makeTooltipHoverEvent = (
    hitbox: Sprite | null,
    target: EventTarget | null,
    layout: SpriteVisualLayout,
    useShapeCenterAnchor: boolean
  ): DotGraphHoverEvent | null => {
    if (!hitbox) return null;

    const centerWorld = new Vector3();
    hitbox.getWorldPosition(centerWorld);
    const tooltipState = resolveTooltipHitboxState({
      layout,
      distanceToCamera: camera.position.distanceTo(centerWorld),
      sceneHitboxScale: hitboxScale,
    });
    return makeCenteredTooltipEvent({
      camera,
      domElement: gl.domElement,
      centerWorld,
      layout: {
        ...spriteRuntimeTooltipLayout(layout, hitbox),
        scale: tooltipState.scale,
        center: tooltipState.center,
      },
      target,
      useDesktopLayout,
      anchorMode: useShapeCenterAnchor ? "shapeCenter" : "hitboxCenter",
    });
  };

  return (
    <>
      {shapeVisuals.map(({ shape, avg, index, offset, center, assignment, layout }, loopIdx) => {
        const suppressHover = !!(myEntry && shape._id === personalizedEntryId && showCompleteUI);
        const identifiedShape = hasDotId(shape) ? shape : null;
        const isPersonalizedShape = !!myEntry && shape._id === personalizedEntryId;
        const shouldHideGraphSprite = hidePersonalizedSprite && isPersonalizedShape;

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
                  clearHoverTimer();
                  hoverTimerRef.current = setTimeout(() => {
                    hoverTimerRef.current = null;
                    const hoverEvent = makeTooltipHoverEvent(
                      hitboxRefs.current[loopIdx] ?? (e.object as Sprite),
                      tgt,
                      layout,
                      isPersonalizedShape
                    );
                    if (hoverEvent) onHoverStart(capturedShape, hoverEvent);
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
                if (!suppressHover) {
                  const hoverEvent = makeTooltipHoverEvent(
                    hitboxRefs.current[loopIdx] ?? (e.object as Sprite),
                    e.nativeEvent.target,
                    layout,
                    isPersonalizedShape
                  );
                  onHoverStart(identifiedShape, hoverEvent ?? e);
                }
              }}
              position={offset}
              center={new Vector2(center[0], center[1])}
            >
              <spriteMaterial
                color="#ff3b8a"
                transparent
                opacity={showHitboxDebugOverlay ? 0.24 : 0}
                depthWrite={false}
                depthTest={false}
              />
            </sprite>

            {!shouldHideGraphSprite && (
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
                particleStepMs={33}
                particleFrames={particleFrames}
                darkMode={darkMode}
                occasionalRefreshMs={occasionalRefreshMs}
                assignment={assignment}
                centerAtPosition={isPersonalizedShape}
                suspendQualityUpdates={suspendSpriteQuality || denseScene}
              />
            )}
          </group>
        );
      })}
    </>
  );
}
