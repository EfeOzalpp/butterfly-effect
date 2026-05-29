// src/graph-runtime/dotgraph/interaction/useHoverBubble.ts

import { useCallback, useRef, useState } from 'react';
import { computeTooltipPlacement } from '../tooltip/placement';
import type {
  DotGraphHoverEvent,
  DotGraphHoveredDot,
  DotGraphHoverStart,
} from '../types';

export interface UseHoverBubbleArgs {
  useDesktopLayout: boolean;
  isPinchingRef?: React.RefObject<boolean>;
  isTouchRotatingRef?: React.RefObject<boolean>;
  calcPercentForAvg?: (avg: number) => number;
}

export default function useHoverBubble({
  useDesktopLayout,
  isPinchingRef,
  isTouchRotatingRef,
  calcPercentForAvg,
}: UseHoverBubbleArgs) {
  const [hoveredDot, setHoveredDot] = useState<DotGraphHoveredDot | null>(null);
  const [viewportClass, setViewportClass] = useState<string>('');
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const onHoverStart: DotGraphHoverStart = useCallback(
    (dot, e: DotGraphHoverEvent) => {
      if (isPinchingRef?.current || isTouchRotatingRef?.current) return;

      const native = e.nativeEvent ?? e;
      const clientX = native.clientX;
      const clientY = native.clientY;

      if (
        typeof clientX === "number" &&
        typeof clientY === "number" &&
        Number.isFinite(clientX) &&
        Number.isFinite(clientY) &&
        typeof window !== 'undefined'
      ) {
        const placement =
          e.tooltipPlacement ??
          computeTooltipPlacement({
            x: clientX,
            y: clientY,
            width: document.documentElement.clientWidth,
            height: document.documentElement.clientHeight,
            useDesktopLayout,
          });
        setViewportClass(placement.className);
      }

      if (!useDesktopLayout && hideTimerRef.current) {
        clearTimeout(hideTimerRef.current);
        hideTimerRef.current = null;
      }

      const avg = dot.averageWeight;
      const pct = typeof calcPercentForAvg === 'function' ? calcPercentForAvg(avg) : 0;

      setHoveredDot({
        dotId: dot._id,
        percentage: pct,
        color: dot.color,
        anchorPosition: e.anchorPosition,
        tooltipLayout: e.tooltipLayout,
        tooltipPlacement: e.tooltipPlacement,
        tooltipAnchorMode: e.tooltipAnchorMode,
      });

    },
    [useDesktopLayout, isPinchingRef, isTouchRotatingRef, calcPercentForAvg]
  );

  const onHoverEnd = useCallback(() => {
    if (isPinchingRef?.current) return;
    setHoveredDot(null);
    setViewportClass('');
  }, [isPinchingRef]);

  return {
    hoveredDot,
    viewportClass,
    onHoverStart,
    onHoverEnd,
    handleHoverStart: onHoverStart,
    handleHoverEnd: onHoverEnd,
  };
}
