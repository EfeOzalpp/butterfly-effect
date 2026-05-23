// src/graph-runtime/dotgraph/interaction/useObserverSpotlight.ts
// Consumes a UI spotlight request and turns it into a synthetic hover event.

import { useEffect, useRef } from "react";
import { useOptionalUiFlow } from "../../../app/state/ui-context";
import { hasDotId } from "../types";
import type {
  DotGraphHoverEvent,
  DotGraphHoverStart,
  DotPoint,
  IdentifiedDotPoint,
} from "../types";

const noop = () => undefined;

interface UseObserverSpotlightArgs {
  points: DotPoint[];
  onHoverStart: DotGraphHoverStart;
  onHoverEnd: () => void;
}

export default function useObserverSpotlight({
  points,
  onHoverStart,
  onHoverEnd,
}: UseObserverSpotlightArgs) {
  const ui = useOptionalUiFlow();
  const spotlightRequest = ui?.spotlightRequest ?? null;
  const setSpotlightRequest = ui?.setSpotlightRequest;

  const spotlightTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const spotlightActiveRef = useRef(false);

  const onHoverStartRef = useRef(onHoverStart);
  const onHoverEndRef = useRef(onHoverEnd);
  const pointsRef = useRef(points);

  useEffect(() => {
    onHoverStartRef.current = onHoverStart;
  }, [onHoverStart]);

  useEffect(() => {
    onHoverEndRef.current = onHoverEnd;
  }, [onHoverEnd]);

  useEffect(() => {
    pointsRef.current = points;
  }, [points]);

  useEffect(() => {
    if (!spotlightRequest || !setSpotlightRequest) return;

    const durationMs = Math.max(500, spotlightRequest.durationMs);
    const xRatio = Math.max(0, Math.min(1, spotlightRequest.fakeMouseXRatio));
    const yRatio = Math.max(0, Math.min(1, spotlightRequest.fakeMouseYRatio));

    const pts = pointsRef.current;
    if (!pts.length) return;

    let best: IdentifiedDotPoint | null = null;
    let bestD = Infinity;
    for (const point of pts) {
      if (!hasDotId(point)) continue;
      const [x, y, z] = point.position;
      const d = x * x + y * y + z * z;
      if (d < bestD) {
        bestD = d;
        best = point;
      }
    }
    if (!best) return;

    if (spotlightTimerRef.current) {
      clearTimeout(spotlightTimerRef.current);
      spotlightTimerRef.current = null;
    }

    spotlightActiveRef.current = true;
    const synthEvt: DotGraphHoverEvent = {
      stopPropagation: noop,
      preventDefault: noop,
      clientX: (typeof window !== "undefined" ? window.innerWidth : 1000) * xRatio,
      clientY: (typeof window !== "undefined" ? window.innerHeight : 800) * yRatio,
    };

    try {
      onHoverStartRef.current(best, synthEvt);
    } catch (err) {
      console.warn("[useObserverSpotlight] onHoverStart failed:", err);
    }

    // Consume it immediately so the same UI action can request a fresh spotlight later.
    setSpotlightRequest(null);

    spotlightTimerRef.current = setTimeout(() => {
      try {
        onHoverEndRef.current();
      } catch (err) {
        console.warn("[useObserverSpotlight] onHoverEnd failed:", err);
      }
      spotlightActiveRef.current = false;
      spotlightTimerRef.current = null;
    }, durationMs);

    return () => {
      if (spotlightTimerRef.current) clearTimeout(spotlightTimerRef.current);
      spotlightTimerRef.current = null;
      spotlightActiveRef.current = false;
    };
  }, [setSpotlightRequest, spotlightRequest]);

  return { spotlightActiveRef };
}
