// src/graph-runtime/dotgraph/event-handlers/useRotation.ts
import { useEffect, useRef } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import type { RefObject } from 'react';
import { Quaternion, Vector3 } from 'three';
import type { Group } from 'three';

// Scratch objects — reused every frame to avoid GC pressure
const _rotQ = new Quaternion();
const _axisX = new Vector3(1, 0, 0);
const _axisY = new Vector3(0, 1, 0);

export type GestureState = {
  pinching: boolean;
  touchCount: number;
  pinchCooldownUntil: number; // ms timestamp
};

export type UseRotationParams = {
  groupRef: RefObject<Group | null>;
  useDesktopLayout: boolean;
  isTabletLike: boolean;
  minRadius: number;
  maxRadius: number;
  radius: number;
  markActivity?: () => void;
  isDragging?: boolean;
  gestureRef?: RefObject<GestureState>;

  // add: info panel gate
  menuOpenRef?: RefObject<boolean>;
};

export type UseRotationReturn = {
  isPinchingRef: RefObject<boolean>;
  isTouchRotatingRef: RefObject<boolean>;
  effectiveDraggingRef: RefObject<boolean>;
  applyRotationFrame: (args: { idleActive: boolean; delta: number }) => void;
  lastMouseMoveTsRef: RefObject<number>;
};

export default function useRotation({
  groupRef,
  useDesktopLayout,
  isTabletLike,
  minRadius,
  maxRadius,
  radius,
  markActivity,
  isDragging,
  gestureRef,
  menuOpenRef,
}: UseRotationParams): UseRotationReturn {
  const { gl } = useThree(); // canvas element lives here

  const isPinchingRef = useRef(false);
  const isTouchRotatingRef = useRef(false);
  const isDesktopRotatingRef = useRef(false);
  const lastTouchRef = useRef({ x: 0, y: 0, t: 0 });
  const lastDesktopPointerRef = useRef({ x: 0, y: 0, t: 0 });
  const spinVelRef = useRef({ x: 0, y: 0 });

  // After pinch, ignore first 1-finger frame (until we reseed)
  const ignoreFirstSingleAfterPinchRef = useRef(false);

  // ✅ exported: "effectiveDraggingRef" (for orchestrator to read)
  const effectiveDraggingRef = useRef(false);

  // --- Canonical latched state helpers (global, shared across app) ---
  const getLatched = () => {
    if (typeof window === 'undefined') return true;
    const w = window as any;
    if (w.__gpEdgeLatched == null) w.__gpEdgeLatched = true;
    return !!w.__gpEdgeLatched;
  };

  const setLatched = (next: boolean) => {
    if (typeof window === 'undefined') return;
    const w = window as any;
    w.__gpEdgeLatched = !!next;
    window.dispatchEvent(
      new CustomEvent('gp:edge-cue-state', {
        detail: { latched: !!next },
      })
    );
  };

  // --- App activity gate: true only when the app/tab is focused and pointer is inside the OS window
  const appActiveRef = useRef(true);

  useEffect(() => {
    const recompute = () => {
      const visible = document.visibilityState === 'visible';
      const focused = document.hasFocus?.() ?? true;
      appActiveRef.current = visible && focused;
    };

    // If pointer leaves **the OS window**, stop edge-drive immediately
    const onPointerOut = (e: PointerEvent) => {
      // relatedTarget === null means it left the browser window
      if ((e as any).relatedTarget === null) appActiveRef.current = false;
    };

    const onPointerOver = () => {
      const visible = document.visibilityState === 'visible';
      const focused = document.hasFocus?.() ?? true;
      appActiveRef.current = visible && focused;
    };

    const onBlur = () => {
      appActiveRef.current = false;
    };
    const onFocus = () => recompute();
    const onVis = () => recompute();

    window.addEventListener('blur', onBlur);
    window.addEventListener('focus', onFocus);
    document.addEventListener('visibilitychange', onVis);
    window.addEventListener('pointerout', onPointerOut);
    window.addEventListener('pointerover', onPointerOver);

    recompute();

    return () => {
      window.removeEventListener('blur', onBlur);
      window.removeEventListener('focus', onFocus);
      document.removeEventListener('visibilitychange', onVis);
      window.removeEventListener('pointerout', onPointerOut);
      window.removeEventListener('pointerover', onPointerOver);
    };
  }, []);

  // --- Touch-only: long-press → flip canonical latched state (mobile HUD) ---
  const holdTimerRef = useRef<number | null>(null);
  const holdArmedRef = useRef(false); // prevent repeat fires per gesture
  const holdSceneRef = useRef(false); // true only if touch started on canvas
  const touchOwnsSceneRef = useRef(false); // true only while the active touch gesture belongs to the canvas
  const HOLD_MS = 650;

  // recent mouse movement (idle gating)
  const lastMouseMoveTsRef = useRef(0);

  const isMovingRef = useRef(false);

  // Live mirror of isDragging for single-bound handlers & frames
  const isDraggingRef = useRef(!!isDragging);
  useEffect(() => {
    isDraggingRef.current = !!isDragging;
  }, [isDragging]);

  useEffect(() => {
    const dpr = window.devicePixelRatio || 1;
    const DEADZONE_PX = Math.max(1, 0.9 * dpr);
    const TOUCH_PX_TO_RAD = (isTabletLike ? 0.004 : 0.006) / dpr;
    const DESKTOP_PX_TO_RAD = 0.0032 / dpr;
    const canvas = (gl as any)?.domElement as HTMLElement | undefined;

    // Helper: did this touch start over the WebGL canvas?
    const isSceneTouchTarget = (target: EventTarget | null) => {
      const canvas = (gl as any)?.domElement as HTMLElement | undefined;
      if (!canvas || !(target instanceof Node)) return false;
      return target === canvas || canvas.contains(target);
    };

    const isDesktopScenePointer = (event: PointerEvent) =>
      useDesktopLayout &&
      (event.pointerType === 'mouse' || event.pointerType === 'pen') &&
      isSceneTouchTarget(event.target);

    const hasSceneTouchTarget = (touches: TouchList) => {
      for (let i = 0; i < touches.length; i++) {
        if (isSceneTouchTarget(touches[i]?.target ?? null)) return true;
      }
      return false;
    };

    const handlePointerDown = (event: PointerEvent) => {
      if (!isDesktopScenePointer(event)) return;
      if (menuOpenRef?.current || isDraggingRef.current) return;

      isDesktopRotatingRef.current = true;
      canvas?.classList.add('is-rotating');
      isMovingRef.current = false;
      spinVelRef.current = { x: 0, y: 0 };
      lastDesktopPointerRef.current = {
        x: event.clientX,
        y: event.clientY,
        t: performance.now(),
      };
      lastMouseMoveTsRef.current = lastDesktopPointerRef.current.t;
      markActivity?.();
    };

    const handlePointerMove = (event: PointerEvent) => {
      if (event.pointerType !== 'mouse' && event.pointerType !== 'pen') return;

      lastMouseMoveTsRef.current = performance.now();
      if (!isDesktopRotatingRef.current) return;
      if (menuOpenRef?.current || isDraggingRef.current) {
        isDesktopRotatingRef.current = false;
        canvas?.classList.remove('is-rotating');
        isMovingRef.current = false;
        spinVelRef.current = { x: 0, y: 0 };
        return;
      }

      markActivity?.();

      const now = performance.now();
      const last = lastDesktopPointerRef.current;
      const dt = Math.max(1, now - last.t);
      const dx = event.clientX - last.x;
      const dy = event.clientY - last.y;
      const moving = Math.abs(dx) >= DEADZONE_PX || Math.abs(dy) >= DEADZONE_PX;
      isMovingRef.current = moving;

      if (!moving) {
        lastDesktopPointerRef.current = { x: event.clientX, y: event.clientY, t: now };
        return;
      }

      const g = groupRef.current;
      if (g) {
        _rotQ.setFromAxisAngle(_axisX, -dy * DESKTOP_PX_TO_RAD);
        g.quaternion.premultiply(_rotQ);
        _rotQ.setFromAxisAngle(_axisY, -dx * DESKTOP_PX_TO_RAD);
        g.quaternion.premultiply(_rotQ);
      }

      const vx = (-dy / dt) * 1000 * DESKTOP_PX_TO_RAD;
      const vy = (-dx / dt) * 1000 * DESKTOP_PX_TO_RAD;
      spinVelRef.current = {
        x: (spinVelRef.current.x + vx) * 0.5,
        y: (spinVelRef.current.y + vy) * 0.5,
      };

      lastDesktopPointerRef.current = { x: event.clientX, y: event.clientY, t: now };
    };

    const endDesktopRotation = () => {
      isDesktopRotatingRef.current = false;
      canvas?.classList.remove('is-rotating');
      isMovingRef.current = false;
    };

    // --- Touch handlers ---
    const handleTouchStart = (event: TouchEvent) => {
      markActivity?.();
      if (gestureRef?.current) gestureRef.current.touchCount = event.touches.length;

      if (event.touches.length === 1) {
        const t = event.touches[0];
        holdSceneRef.current = isSceneTouchTarget(t.target);
        touchOwnsSceneRef.current = holdSceneRef.current;

        if (!touchOwnsSceneRef.current) {
          isTouchRotatingRef.current = false;
          isMovingRef.current = false;
          spinVelRef.current = { x: 0, y: 0 };
          if (holdTimerRef.current) window.clearTimeout(holdTimerRef.current);
          holdTimerRef.current = null;
          holdArmedRef.current = false;
          return;
        }

        isTouchRotatingRef.current = true;
        isMovingRef.current = false;
        lastTouchRef.current = { x: t.clientX, y: t.clientY, t: performance.now() };
        spinVelRef.current = { x: 0, y: 0 };

        holdArmedRef.current = holdSceneRef.current;
        if (holdTimerRef.current) window.clearTimeout(holdTimerRef.current);

        if (holdArmedRef.current) {
          holdTimerRef.current = window.setTimeout(() => {
            if (
              touchOwnsSceneRef.current &&
              holdArmedRef.current &&
              holdSceneRef.current &&
              !isPinchingRef.current &&
              !gestureRef?.current?.pinching
            ) {
              setLatched(!getLatched());
              holdArmedRef.current = false;
            }
          }, HOLD_MS);
        }
      } else if (event.touches.length >= 2) {
        touchOwnsSceneRef.current = hasSceneTouchTarget(event.touches);
        if (!touchOwnsSceneRef.current) {
          isTouchRotatingRef.current = false;
          isMovingRef.current = false;
          spinVelRef.current = { x: 0, y: 0 };
          if (gestureRef?.current) gestureRef.current.pinching = false;
          if (holdTimerRef.current) window.clearTimeout(holdTimerRef.current);
          holdTimerRef.current = null;
          holdArmedRef.current = false;
          holdSceneRef.current = false;
          return;
        }

        isTouchRotatingRef.current = false;
        isMovingRef.current = false;
        spinVelRef.current = { x: 0, y: 0 };
        if (gestureRef?.current) gestureRef.current.pinching = true;

        if (holdTimerRef.current) window.clearTimeout(holdTimerRef.current);
        holdTimerRef.current = null;
        holdArmedRef.current = false;
      }
    };

    const handleTouchMove = (event: TouchEvent) => {
      if (!touchOwnsSceneRef.current) return;
      event.preventDefault();
      if (isDraggingRef.current) return;
      markActivity?.();

      const now = performance.now();
      const gs = gestureRef?.current;
      const inCooldown = gs ? now < (gs.pinchCooldownUntil || 0) : false;
      const multiTouch = (gs?.touchCount ?? event.touches.length) >= 2;
      const pinching = !!(gs?.pinching || isPinchingRef.current);

      if (multiTouch || pinching) return;

      if (inCooldown) {
        if (event.touches.length === 1) {
          const t = event.touches[0];
          lastTouchRef.current = { x: t.clientX, y: t.clientY, t: performance.now() };
          ignoreFirstSingleAfterPinchRef.current = true;
        }
        return;
      }

      if (event.touches.length === 1) {
        const t = event.touches[0];
        const now2 = performance.now();

        if (ignoreFirstSingleAfterPinchRef.current) {
          lastTouchRef.current = { x: t.clientX, y: t.clientY, t: now2 };
          ignoreFirstSingleAfterPinchRef.current = false;
          return;
        }

        const last = lastTouchRef.current;
        const dt = Math.max(1, now2 - last.t);
        const dx = t.clientX - last.x;
        const dy = t.clientY - last.y;

        const moving = Math.abs(dx) >= DEADZONE_PX || Math.abs(dy) >= DEADZONE_PX;
        isMovingRef.current = moving;

        if (!moving) {
          lastTouchRef.current = { x: t.clientX, y: t.clientY, t: now2 };
          return;
        }

        const g = groupRef.current;
        if (g) {
          _rotQ.setFromAxisAngle(_axisX, -dy * TOUCH_PX_TO_RAD);
          g.quaternion.premultiply(_rotQ);
          _rotQ.setFromAxisAngle(_axisY, -dx * TOUCH_PX_TO_RAD);
          g.quaternion.premultiply(_rotQ);
        }

        const vx = (-dy / dt) * 1000 * TOUCH_PX_TO_RAD;
        const vy = (-dx / dt) * 1000 * TOUCH_PX_TO_RAD;
        spinVelRef.current = {
          x: (spinVelRef.current.x + vx) * 0.5,
          y: (spinVelRef.current.y + vy) * 0.5,
        };

        lastTouchRef.current = { x: t.clientX, y: t.clientY, t: now2 };
      }
    };

    const handleTouchEnd = (event: TouchEvent) => {
      markActivity?.();

      if (gestureRef?.current) {
        gestureRef.current.touchCount = event.touches.length;
        if (gestureRef.current.pinching && event.touches.length < 2) {
          gestureRef.current.pinching = false;
          if ((gestureRef.current.pinchCooldownUntil || 0) < performance.now() + 200) {
            gestureRef.current.pinchCooldownUntil = performance.now() + 200;
          }
        }
      }

      if (event.touches.length === 0) {
        isTouchRotatingRef.current = false;
        isMovingRef.current = false;
        touchOwnsSceneRef.current = false;
      }
      if (event.touches.length < 2) isPinchingRef.current = false;

      if (holdTimerRef.current) window.clearTimeout(holdTimerRef.current);
      holdTimerRef.current = null;
      holdArmedRef.current = false;
      holdSceneRef.current = false;
      if (event.touches.length === 0) touchOwnsSceneRef.current = false;
    };

    window.addEventListener('pointerdown', handlePointerDown, { passive: true });
    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    window.addEventListener('pointerup', endDesktopRotation);
    window.addEventListener('pointercancel', endDesktopRotation);
    window.addEventListener('touchstart', handleTouchStart, { passive: false });
    window.addEventListener('touchmove', handleTouchMove, { passive: false });
    window.addEventListener('touchend', handleTouchEnd);
    window.addEventListener('touchcancel', handleTouchEnd);

    return () => {
      window.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', endDesktopRotation);
      window.removeEventListener('pointercancel', endDesktopRotation);
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
      window.removeEventListener('touchcancel', handleTouchEnd);
      canvas?.classList.remove('is-rotating');
      if (holdTimerRef.current) window.clearTimeout(holdTimerRef.current);
      touchOwnsSceneRef.current = false;
    };
  }, [groupRef, isTabletLike, markActivity, gl, gestureRef, menuOpenRef, useDesktopLayout]);

  // frame application
  const ROT_RELEASE_TAU = 0.09;
  const ROT_MIN_SPEED = 0.02;

  function applyRotationFrame({ idleActive, delta }: { idleActive: boolean; delta: number }) {
    const g = groupRef.current;
    if (!g) return;

    // ✅ effectiveDraggingRef: what the system should consider “user interacting”
    effectiveDraggingRef.current =
      !!isDraggingRef.current ||
      !!isDesktopRotatingRef.current ||
      !!isTouchRotatingRef.current ||
      !!isPinchingRef.current;

    // ✅ additional hard gate: menu open freezes rotation updates
    if (menuOpenRef?.current) return;

    // Freeze rotation while dragging external UI
    if (isDraggingRef.current) return;

    if (!idleActive) {
      const zf = Math.max(0, Math.min(1, (radius - minRadius) / (maxRadius - minRadius) || 0));
      const zoomMul = 0.9 + 0.8 * zf;
      const tabletMul = isTabletLike ? 1.6 : 1.25;
      const motionMul = !useDesktopLayout && isMovingRef.current
        ? (0.10 + (0.30 - 0.10) * zf)
        : 1.0;

      const holdingTouch = isTouchRotatingRef.current && !isPinchingRef.current;
      const holdingDesktop = useDesktopLayout && isDesktopRotatingRef.current;
      if (!holdingTouch && !holdingDesktop) {
        const k = Math.exp(-delta / ROT_RELEASE_TAU);
        spinVelRef.current.x *= k;
        spinVelRef.current.y *= k;
        if (Math.abs(spinVelRef.current.x) < ROT_MIN_SPEED) spinVelRef.current.x = 0;
        if (Math.abs(spinVelRef.current.y) < ROT_MIN_SPEED) spinVelRef.current.y = 0;
      }

      const mul = zoomMul * tabletMul * motionMul;
      _rotQ.setFromAxisAngle(_axisX, spinVelRef.current.x * delta * mul);
      g.quaternion.premultiply(_rotQ);
      _rotQ.setFromAxisAngle(_axisY, spinVelRef.current.y * delta * mul);
      g.quaternion.premultiply(_rotQ);
    }
  }

  // keep your optional debug frame hook (no behavior change)
  useFrame(() => {
    void appActiveRef.current;
  });

  return {
    isPinchingRef,
    isTouchRotatingRef,
    effectiveDraggingRef,
    applyRotationFrame,
    lastMouseMoveTsRef,
  };
}
