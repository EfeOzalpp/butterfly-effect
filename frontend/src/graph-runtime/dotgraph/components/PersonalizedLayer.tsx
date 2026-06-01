// src/graph-runtime/dotgraph/components/PersonalizedLayer.tsx

import React, { useCallback, useLayoutEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { Html } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { Vector3, type Group } from "three";
import {
  PERSONALIZED_SPRITE_TILE_SIZE,
  resolveSpriteVisual,
  SpriteShape,
  type SpriteAssignment,
  type SpriteIdentity,
  type SpriteVisualLayout,
} from "../../sprites/entry";
import GamificationPersonalized from "../../gamification/gamification-personal";
import { resolveTooltipHitboxState } from "../interaction/hitboxDistancePolicy";
import { resolveHitboxScreenHalfSize } from "../tooltip/screenSize";
import {
  EMPTY_TOOLTIP_HITBOX_CSS_VARS,
  hasResolvedHitboxSize,
  makeTooltipHitboxCssVars,
} from "../tooltip/hitboxCss";
import type {
  DotGraphEntry,
  DotGraphTieStats,
  PersonalizedDotShape,
} from "../types";

interface PersonalizedLayerProps {
  shouldRenderPersonalUI: boolean;
  shouldRenderExtraPersonalSprite: boolean;
  effectiveMyShape: PersonalizedDotShape | null;
  effectiveMyEntry: DotGraphEntry | null;
  personalSpriteAssignment?: SpriteAssignment;
  personalSpriteIdentity?: SpriteIdentity;
  spriteScale: number;
  bagSeed: string;
  myDisplayValue: number;
  mode: "absolute" | "relative";
  myStats: DotGraphTieStats;
  statsLoading: boolean;
  setPersonalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  onPersonalizedPanelEnter?: () => void;
  viewportClass?: string;
  darkMode?: boolean;
  zoomFraction?: number;
  particleFrames?: number;
  sectionKey: string;
  hitboxScale?: number;
}

const TMP_CENTER_LOCAL = new Vector3();
const TMP_CENTER_WORLD = new Vector3();
const TMP_ANCHOR_WORLD = new Vector3();
const TMP_ANCHOR_LOCAL = new Vector3();
const TMP_CAMERA_RIGHT = new Vector3();
const TMP_CAMERA_UP = new Vector3();
const PERSONALIZED_TEXTURE_PRIORITY = 10_000;

function PersonalizedAnchor({
  position,
  layout,
  shape,
  sceneHitboxScale,
  zoomFraction,
  className,
  style,
  children,
}: {
  position: PersonalizedDotShape["position"];
  layout: SpriteVisualLayout | null;
  shape: SpriteAssignment["shape"] | null;
  sceneHitboxScale: number;
  zoomFraction: number;
  className?: string;
  style: CSSProperties;
  children: React.ReactNode;
}) {
  const anchorRef = useRef<Group | null>(null);
  const { camera, gl } = useThree();
  const [hitboxHalfSize, setHitboxHalfSize] = useState({ width: 0, height: 0 });
  const [htmlReady, setHtmlReady] = useState(false);
  const readyFrameRef = useRef<number | null>(null);
  const hasPositionedOnceRef = useRef(false);
  const [positionX, positionY, positionZ] = position;

  const updateAnchorPosition = useCallback(() => {
    const anchor = anchorRef.current;
    const parent = anchor?.parent;
    if (!anchor || !parent || !layout || !shape) return;

    TMP_CENTER_LOCAL.set(positionX, positionY, positionZ);
    TMP_CENTER_WORLD.copy(TMP_CENTER_LOCAL);
    parent.localToWorld(TMP_CENTER_WORLD);

    const next = resolveTooltipHitboxState({
      layout,
      distanceToCamera: camera.position.distanceTo(TMP_CENTER_WORLD),
      sceneHitboxScale,
    });

    TMP_CAMERA_RIGHT.setFromMatrixColumn(camera.matrixWorld, 0).normalize();
    TMP_CAMERA_UP.setFromMatrixColumn(camera.matrixWorld, 1).normalize();

    const resolvedLayout = {
      ...layout,
      scale: next.scale,
      center: next.center,
    };

    // Personalized sprites render with centerAtPosition, so the graph point is
    // already the perceived shape center. Do not re-apply hitbox center offsets.
    TMP_ANCHOR_WORLD.copy(TMP_CENTER_WORLD);

    const nextHalfSize = resolveHitboxScreenHalfSize({
      camera,
      domElement: gl.domElement,
      anchorWorld: TMP_ANCHOR_WORLD,
      cameraRight: TMP_CAMERA_RIGHT,
      cameraUp: TMP_CAMERA_UP,
      layout: resolvedLayout,
    });
    setHitboxHalfSize((prev) => {
      const width = Math.round(nextHalfSize.width);
      const height = Math.round(nextHalfSize.height);
      return prev.width === width && prev.height === height ? prev : { width, height };
    });

    TMP_ANCHOR_LOCAL.copy(TMP_ANCHOR_WORLD);
    parent.worldToLocal(TMP_ANCHOR_LOCAL);
    anchor.position.copy(TMP_ANCHOR_LOCAL);

    if (!hasPositionedOnceRef.current && readyFrameRef.current === null) {
      readyFrameRef.current = requestAnimationFrame(() => {
        readyFrameRef.current = null;
        hasPositionedOnceRef.current = true;
        setHtmlReady(true);
      });
    }
  }, [camera, gl.domElement, layout, positionX, positionY, positionZ, sceneHitboxScale, shape]);

  useLayoutEffect(() => {
    updateAnchorPosition();
    return () => {
      if (readyFrameRef.current !== null) {
        cancelAnimationFrame(readyFrameRef.current);
        readyFrameRef.current = null;
      }
    };
  }, [updateAnchorPosition]);

  useLayoutEffect(() => {
    hasPositionedOnceRef.current = false;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setHtmlReady(false);
  }, [positionX, positionY, positionZ, shape]);

  useFrame(updateAnchorPosition);

  const resolvedStyle = useMemo(
    () => makeTooltipHitboxCssVars({
      halfSize: hitboxHalfSize,
      zoomFraction,
      style,
    }),
    [hitboxHalfSize, style, zoomFraction]
  );

  const replayPointerMoveToCanvas = useCallback((event: React.PointerEvent<HTMLElement>) => {
    if (typeof PointerEvent === "undefined") return;

    const canvas = gl.domElement;
    const replay = new PointerEvent("pointermove", {
      bubbles: true,
      cancelable: true,
      pointerId: event.pointerId,
      pointerType: event.pointerType,
      isPrimary: event.isPrimary,
      clientX: event.clientX,
      clientY: event.clientY,
      screenX: event.screenX,
      screenY: event.screenY,
      button: event.button,
      buttons: event.buttons,
      ctrlKey: event.ctrlKey,
      shiftKey: event.shiftKey,
      altKey: event.altKey,
      metaKey: event.metaKey,
    });
    canvas.dispatchEvent(replay);
  }, [gl.domElement]);

  return (
    <group ref={anchorRef} position={position}>
      {hasResolvedHitboxSize(hitboxHalfSize) && (
        <Html
          position={[0, 0, 0]}
          center
          zIndexRange={[110, 130]}
          className={className}
          style={{
            ...resolvedStyle,
            visibility: htmlReady ? "visible" : "hidden",
          }}
        >
          <div onPointerLeave={replayPointerMoveToCanvas}>
            {children}
          </div>
        </Html>
      )}
    </group>
  );
}

export default function PersonalizedLayer({
  shouldRenderPersonalUI,
  shouldRenderExtraPersonalSprite,
  effectiveMyShape,
  effectiveMyEntry,
  personalSpriteAssignment,
  personalSpriteIdentity,
  spriteScale,
  bagSeed,
  myDisplayValue,
  mode,
  myStats,
  statsLoading,
  setPersonalOpen,
  onPersonalizedPanelEnter,
  viewportClass,
  darkMode = false,
  zoomFraction,
  particleFrames = 219,
  sectionKey,
  hitboxScale = 1,
}: PersonalizedLayerProps) {
  const htmlStyle: CSSProperties = {
    pointerEvents: "none",
    ...EMPTY_TOOLTIP_HITBOX_CSS_VARS,
  };
  const personalVisual = useMemo(() => {
    if (!effectiveMyEntry) return null;
    const entryId = effectiveMyEntry._id;
    if (!entryId) return null;
    const avg = Number.isFinite(effectiveMyEntry.avgWeight)
      ? Number(effectiveMyEntry.avgWeight)
      : 0.5;

    return resolveSpriteVisual({
      entryId,
      sectionKey,
      avg,
      seed: bagSeed,
      orderIndex: 0,
      baseScale: spriteScale,
      assignment: personalSpriteAssignment,
    });
  }, [bagSeed, effectiveMyEntry, personalSpriteAssignment, sectionKey, spriteScale]);

  if (!shouldRenderPersonalUI) return null;

  return (
    <>
      {shouldRenderExtraPersonalSprite && effectiveMyShape && effectiveMyEntry && (
        <group position={effectiveMyShape.position}>
          <SpriteShape
            avg={
              Number.isFinite(effectiveMyEntry.avgWeight)
                ? Number(effectiveMyEntry.avgWeight)
                : 0.5
            }
            position={[0, 0, 0]}
            scale={spriteScale}
            tileSize={PERSONALIZED_SPRITE_TILE_SIZE}
            seed={bagSeed}
            orderIndex={0}
            particleStepMs={33}
            particleFrames={particleFrames}
            occasionalRefreshMs={240}
            darkMode={darkMode}
            assignment={personalSpriteAssignment}
            centerAtPosition={true}
            texturePriority={PERSONALIZED_TEXTURE_PRIORITY}
          />
        </group>
      )}

      {effectiveMyShape && (
        <PersonalizedAnchor
          position={effectiveMyShape.position}
          layout={personalVisual?.layout ?? null}
          shape={personalVisual?.shape ?? personalSpriteAssignment?.shape ?? null}
          sceneHitboxScale={hitboxScale}
          zoomFraction={zoomFraction ?? 0}
          className={viewportClass}
          style={htmlStyle}
        >
          <div>
            <GamificationPersonalized
              userData={effectiveMyEntry}
              percentage={myDisplayValue}
              color={effectiveMyShape.color}
              shapeCopy={personalSpriteIdentity?.copy}
              mode={mode}
              belowCountStrict={myStats.below}
              equalCount={myStats.equal}
              aboveCountStrict={myStats.above}
              statsLoading={statsLoading}
              onOpenChange={setPersonalOpen}
              onPanelEnter={onPersonalizedPanelEnter}
              zoomFraction={zoomFraction}
            />
          </div>
        </PersonalizedAnchor>
      )}
    </>
  );
}
