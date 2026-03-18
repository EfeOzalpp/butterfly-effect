// src/graph-runtime/dotgraph/event-handlers/useIdleDrift.ts
import { useFrame } from '@react-three/fiber';
import type { RefObject } from 'react';
import { Quaternion, Vector3 } from 'three';
import type { Group } from 'three';

const _driftQ = new Quaternion();
const _driftAxisY = new Vector3(0, 1, 0);
const _driftAxisX = new Vector3(1, 0, 0);

export type UseIdleDriftParams = {
  groupRef: RefObject<Group | null>;
  speed?: number;
  horizontalOnly?: boolean;
  isIdle: (args: { userInteracting: boolean }) => boolean;
};

export default function useIdleDrift({
  groupRef,
  speed = 0.15,
  horizontalOnly = true,
  isIdle,
}: UseIdleDriftParams) {
  useFrame((_, delta) => {
    const g = groupRef.current;
    if (!g) return;

    const idleActive = isIdle({ userInteracting: false }); // userInteracting evaluated upstream
    if (!idleActive) return;

    if (!horizontalOnly) {
      _driftQ.setFromAxisAngle(_driftAxisX, speed * 0.25 * delta);
      g.quaternion.premultiply(_driftQ);
    }
    _driftQ.setFromAxisAngle(_driftAxisY, speed * delta);
    g.quaternion.premultiply(_driftQ);
  });
}
