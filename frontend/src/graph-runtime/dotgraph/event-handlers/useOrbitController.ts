// src/graph-runtime/dotgraph/event-handlers/useOrbitController.ts
import { useMemo, useRef, useEffect } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import { useOptionalInteraction } from '../../../app/state/interaction-context';
import type { Camera, Group } from 'three';

import useActivity from './hooks/useActivity';
import useZoom from './hooks/useZoom';
import useRotation from './hooks/useRotation';
import usePixelOffsets from './hooks/usePixelOffsets';

import { useDynamicOffset } from '../hooks/useDynamicOffset';
import { createGestureState } from './shared/sharedGesture';

import { computeTooltipOffsetPx } from './compute/tooltipOffset';
import { computeInitialZoomTarget } from './compute/zoomTarget';

/** ---------- Types (minimal but useful) ---------- */
export type OrbitLayout = {
  useDesktopLayout?: boolean;
  isSmallScreen?: boolean;
  isTabletLike?: boolean;

  xOffset?: number;
  yOffset?: number;

  xOffsetPx?: number;
  yOffsetPx?: number;
};

export type OrbitBounds = {
  minRadius?: number;
  maxRadius?: number;
};

export type OrbitIdle = {
  startOnLoad?: boolean;
  delayMs?: number;
  speed?: number;
  horizontalOnly?: boolean;
};

export type OrbitThresholds = {
  mobile: number;
  tablet: number;
  desktop: number;
};

export type OrbitParams = {
  layout?: OrbitLayout;
  bounds?: OrbitBounds;

  /** either pass dataCount explicitly or pass data for fallback counting */
  dataCount?: number;
  data?: unknown[];

  idle?: OrbitIdle;
  thresholds?: OrbitThresholds;

  /** legacy support: allow old callsites to pass these at top level */
  useDesktopLayout?: boolean;
  isSmallScreen?: boolean;
  isTabletLike?: boolean;

  xOffset?: number;
  yOffset?: number;
  xOffsetPx?: number;
  yOffsetPx?: number;

  minRadius?: number;
  maxRadius?: number;
};

export type OrbitReturn = {
  groupRef: React.RefObject<Group | null>;
  radius: number;
  isPinchingRef: React.RefObject<boolean>;
  isTouchRotatingRef: React.RefObject<boolean>;
  minRadius: number;
  maxRadius: number;
  tooltipOffsetPx: number;
  setZoomTarget: (val: number) => void;
  zoomTargetRef: React.RefObject<number | null>;
};

export default function useOrbit(params: OrbitParams = {}): OrbitReturn {
  const ROTATE_EVT = 'gp:orbit-rot';
  const DESKTOP_IDLE_MOUSE_DELAY_MS = 4000;

  const {
    useDesktopLayout = params.layout?.useDesktopLayout ?? params.useDesktopLayout ?? true,
    isSmallScreen = params.layout?.isSmallScreen ?? params.isSmallScreen ?? false,
    isTabletLike = params.layout?.isTabletLike ?? params.isTabletLike ?? false,

    xOffset = params.layout?.xOffset ?? params.xOffset ?? 0,
    yOffset = params.layout?.yOffset ?? params.yOffset ?? 0,

    xOffsetPx = params.layout?.xOffsetPx ?? params.xOffsetPx ?? 0,
    yOffsetPx = params.layout?.yOffsetPx ?? params.yOffsetPx ?? 0,

    minRadius = params.bounds?.minRadius ?? params.minRadius ?? (isSmallScreen ? 2 : 20),
    maxRadius = params.bounds?.maxRadius ?? params.maxRadius ?? 800,

    dataCount = params.dataCount ?? (Array.isArray(params.data) ? params.data.length : 0),

    idle = {},
    thresholds = { mobile: 50, tablet: 65, desktop: 90 },
  } = params;

  const {
    startOnLoad = idle.startOnLoad ?? true,
    delayMs = idle.delayMs ?? 2000,
  } = idle;

  const { camera } = useThree();
  const groupRef = useRef<Group | null>(null);

  const gestureRef = useRef(createGestureState());

  // Track InfoPanel open/close via context
  const interaction = useOptionalInteraction();
  const menuOpenRef = useRef<boolean>(false);
  useEffect(() => {
    menuOpenRef.current = interaction?.menuOpen ?? false;
  }, [interaction?.menuOpen]);

  // ----- initial zoom target from data count -----
  const count = useMemo(() => (typeof dataCount === 'number' ? dataCount : 0), [dataCount]);

  const initialTargetComputed = useMemo(
    () =>
      computeInitialZoomTarget({
        count,
        isSmallScreen,
        isTabletLike,
        thresholds,
        minRadius,
        maxRadius,
      }),
    [count, isSmallScreen, isTabletLike, thresholds, minRadius, maxRadius]
  );

  // ----- activity / idle helpers -----
  const { hasInteractedRef, lastActivityRef, markActivity, isIdle } = useActivity({
    startOnLoad,
    delayMs,
  });

  // idle wrapper
  const isIdleWrapped = ({
    userInteracting,
    hasInteractedRef: hiRef = hasInteractedRef,
    lastActivityRef: laRef = lastActivityRef,
  }: {
    userInteracting: boolean;
    hasInteractedRef?: React.RefObject<boolean>;
    lastActivityRef?: React.RefObject<number>;
  }) => {
    if (menuOpenRef.current) return false;
    if (useDesktopLayout) {
      const lastMouseMoveAt = lastMouseMoveTsRef.current || performance.now();
      return !userInteracting && performance.now() - lastMouseMoveAt >= DESKTOP_IDLE_MOUSE_DELAY_MS;
    }
    return isIdle({ userInteracting, hasInteractedRef: hiRef, lastActivityRef: laRef });
  };

  // ----- zoom -----
  const { radius, zoomTargetRef, zoomVelRef, setZoomTarget } = useZoom({
    minRadius,
    maxRadius,
    initialTarget: initialTargetComputed,
    markActivity,
    gestureRef,
  });

  void zoomVelRef; // keep side-effect-free if lint complains about unused

// ----- rotation -----
const rot = useRotation({
  groupRef,                
  useDesktopLayout,
  isTabletLike,
  minRadius,
  maxRadius,
  radius,
  markActivity,
  gestureRef,
  menuOpenRef,
});

// Always create fallbacks (unconditional Hook calls)
const fallbackIsPinchingRef = useRef(false);
const fallbackIsTouchRotatingRef = useRef(false);
const fallbackEffectiveDraggingRef = useRef(false);
const fallbackLastMouseMoveTsRef = useRef(performance.now());

// Select the actual refs if provided, else fallback
const isPinchingRef =
  (rot?.isPinchingRef as React.RefObject<boolean> | undefined) ?? fallbackIsPinchingRef;

const isTouchRotatingRef =
  (rot?.isTouchRotatingRef as React.RefObject<boolean> | undefined) ??
  fallbackIsTouchRotatingRef;

const effectiveDraggingRef =
  (rot?.effectiveDraggingRef as React.RefObject<boolean> | undefined) ??
  fallbackEffectiveDraggingRef;

const lastMouseMoveTsRef =
  (rot?.lastMouseMoveTsRef as React.RefObject<number> | undefined) ??
  fallbackLastMouseMoveTsRef;

// Functions don’t need hooks; safe to default like this
const applyRotationFrame =
  (rot?.applyRotationFrame as ((args: { idleActive: boolean; delta: number }) => void) | undefined) ??
  (() => {});

void lastMouseMoveTsRef;

  usePixelOffsets({
    groupRef,
    camera: camera as Camera,
    radius,
    xOffset,
    yOffset,
    xOffsetPx,
    yOffsetPx,
  });

  useFrame(() => {
    camera.position.set(0, 0, radius);
    camera.lookAt(0, 0, 0);
  });

  useFrame((_, delta) => {
    const userInteracting =
      !!effectiveDraggingRef.current || !!isTouchRotatingRef.current || !!isPinchingRef.current;

    const idleActive = isIdleWrapped({ userInteracting, hasInteractedRef, lastActivityRef });
    applyRotationFrame({ idleActive, delta });
  });

  const lastRotEvtRef = useRef<{ x: number; y: number; t: number }>({ x: 0, y: 0, t: 0 });
  useFrame(() => {
    if (!groupRef.current) return;
    const now2 = performance.now();
    const rx = groupRef.current.rotation.x;
    const ry = groupRef.current.rotation.y;
    const d = Math.abs(rx - lastRotEvtRef.current.x) + Math.abs(ry - lastRotEvtRef.current.y);
    if (d > 0.002 && now2 - lastRotEvtRef.current.t > 120) {
      lastRotEvtRef.current = { x: rx, y: ry, t: now2 };
      window.dispatchEvent(
        new CustomEvent(ROTATE_EVT, {
          detail: { rx, ry, source: useDesktopLayout ? 'desktop' : 'touch' },
        })
      );
    }
  });

  // Tooltip offset (extracted computation; uses dynamicOffset + zoom factor)
  const dynamicOffset = useDynamicOffset();

  const tooltipOffsetPx = computeTooltipOffsetPx({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0,
    radius,
    minRadius,
    maxRadius,
    dynamicOffset,
  });

  return {
    groupRef,
    radius,
    isPinchingRef,
    isTouchRotatingRef,
    minRadius,
    maxRadius,
    tooltipOffsetPx,
    setZoomTarget,
    zoomTargetRef,
  };
}
