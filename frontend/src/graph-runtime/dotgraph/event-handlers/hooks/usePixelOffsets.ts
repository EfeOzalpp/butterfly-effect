// src/graph-runtime/dotgraph/event-handlers/usePixelOffsets.ts
import { useEffect, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import type { RefObject } from 'react';
import type { Camera, Group } from 'three';
import { pauseQueue, resumeQueue } from '../../../sprites/textures/queue';

export type UsePixelOffsetsParams = {
  groupRef: RefObject<Group | null>;
  camera: Camera;
  radius: number;
  xOffset: number;
  yOffset: number;
  xOffsetPx: number;
  yOffsetPx: number;
};

export default function usePixelOffsets({
  groupRef,
  camera,
  radius,
  xOffset,
  yOffset,
  xOffsetPx,
  yOffsetPx,
}: UsePixelOffsetsParams) {
  const desiredPxRef = useRef({ x: xOffsetPx, y: yOffsetPx });
  const animPxRef = useRef({ x: xOffsetPx, y: yOffsetPx });
  const queuePausedRef = useRef(false);

  useEffect(() => {
    desiredPxRef.current = { x: xOffsetPx, y: yOffsetPx };
  }, [xOffsetPx, yOffsetPx]);

  // Resume queue on unmount in case we paused and never settled
  useEffect(() => {
    return () => {
      if (queuePausedRef.current) {
        resumeQueue();
        queuePausedRef.current = false;
      }
    };
  }, []);

  useFrame((_, delta) => {
    const g = groupRef.current;
    if (!g) return;

    const targetPx = desiredPxRef.current;
    const anim = animPxRef.current;

    const dx = targetPx.x - anim.x;
    const dy = targetPx.y - anim.y;
    const moving = dx * dx + dy * dy > 0.25; // >0.5px total distance

    if (moving && !queuePausedRef.current) {
      pauseQueue();
      queuePausedRef.current = true;
    } else if (!moving && queuePausedRef.current) {
      resumeQueue();
      queuePausedRef.current = false;
    }

    const alpha = 1 - Math.exp(-((delta || 0.016) / 0.25));
    anim.x += dx * alpha;
    anim.y += dy * alpha;

    const W = window.innerWidth || 1;
    const H = window.innerHeight || 1;

    const aspect = (camera as any).aspect || W / H;
    const fov = (camera as any).fov ?? 50;
    const fovRad = (fov * Math.PI) / 180;

    const worldPerPxY = (2 * Math.tan(fovRad / 2) * radius) / H;
    const worldPerPxX = worldPerPxY * aspect;

    const offX = xOffset + anim.x * worldPerPxX;
    const offY = yOffset + -anim.y * worldPerPxY;

    g.position.set(offX, offY, 0);
  });
}
