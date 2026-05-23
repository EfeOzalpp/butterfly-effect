// src/graph-runtime/dotgraph/camera/controls/useActivity.ts
import { useRef, useCallback } from 'react';
import type { RefObject } from 'react';

export interface UseActivityParams {
  startOnLoad?: boolean;
  delayMs?: number;
}

export interface IsIdleArgs {
  userInteracting: boolean;
  hasInteractedRef?: RefObject<boolean>;
  lastActivityRef?: RefObject<number>;
}

export interface UseActivityReturn {
  hasInteractedRef: RefObject<boolean>;
  lastActivityRef: RefObject<number>;
  markActivity: () => void;
  isIdle: (args: IsIdleArgs) => boolean;
}

export default function useActivity(
  { startOnLoad = true, delayMs = 10000 }: UseActivityParams = {}
): UseActivityReturn {
  const hasInteractedRef = useRef(false);
  const lastActivityRef = useRef(0);

  const markActivity = useCallback(() => {
    hasInteractedRef.current = true;
    lastActivityRef.current = performance.now();
  }, []);

  const isIdle = useCallback(
    ({ userInteracting, hasInteractedRef: hRef, lastActivityRef: lRef }: IsIdleArgs) => {
      const now = performance.now();
      const timeSince = now - (lRef?.current ?? lastActivityRef.current);
      const interacted = hRef?.current ?? hasInteractedRef.current;

      return (
        (!interacted && startOnLoad && !userInteracting) ||
        (interacted && !userInteracting && timeSince >= delayMs)
      );
    },
    [startOnLoad, delayMs]
  );

  return { hasInteractedRef, lastActivityRef, markActivity, isIdle };
}
