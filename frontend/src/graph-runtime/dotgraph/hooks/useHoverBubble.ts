import { useCallback, useRef, useState } from 'react';
import { computeHoverViewportClass } from '../utils/hoverViewport';

export type DotLike = {
  _id: string;
  averageWeight: number;
  color: string;
};

export type HoveredDot = {
  dotId: string;
  percentage: number;
  color: string;
};

export type UseHoverBubbleArgs = {
  useDesktopLayout: boolean;
  isPinchingRef?: React.RefObject<boolean>;
  isTouchRotatingRef?: React.RefObject<boolean>;
  calcPercentForAvg?: (avg: number) => number;
};

export default function useHoverBubble({
  useDesktopLayout,
  isPinchingRef,
  isTouchRotatingRef,
  calcPercentForAvg,
}: UseHoverBubbleArgs) {
  const [hoveredDot, setHoveredDot] = useState<HoveredDot | null>(null);
  const [viewportClass, setViewportClass] = useState<string>('');
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const onHoverStart = useCallback(
    (dot: DotLike, e: any) => {
      if (isPinchingRef?.current || isTouchRotatingRef?.current) return;

      const native = e?.nativeEvent ?? e;
      const clientX = native?.clientX;
      const clientY = native?.clientY;

      if (Number.isFinite(clientX) && Number.isFinite(clientY) && typeof window !== 'undefined') {
        setViewportClass(
          computeHoverViewportClass({
            x: clientX,
            y: clientY,
            width: document.documentElement.clientWidth,
            height: document.documentElement.clientHeight,
            useDesktopLayout,
          })
        );
      }

      if (!useDesktopLayout && hideTimerRef.current) {
        clearTimeout(hideTimerRef.current);
        hideTimerRef.current = null;
      }

      const avg = Number(dot.averageWeight);
      const pct = typeof calcPercentForAvg === 'function' ? calcPercentForAvg(avg) : 0;

      setHoveredDot({
        dotId: dot._id,
        percentage: pct,
        color: dot.color,
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
