// ─────────────────────────────────────────────────────────────
// src/components/dotGraph/hooks/useObserverSpotlight.ts
// Programmatic, short-lived hover spotlight for 
// observer mode when mode toggles are switched
// ─────────────────────────────────────────────────────────────

import { useEffect, useRef } from 'react';
import { useOptionalInteraction } from '../../../app/state/interaction-context';

type PointLike = { position?: unknown };

type HoverStart = (p: any, e: any) => void;
type HoverEnd = () => void;

export default function useObserverSpotlight(args: {
  points: PointLike[];
  onHoverStart: HoverStart;
  onHoverEnd: HoverEnd;
}) {
  const { points, onHoverStart, onHoverEnd } = args;
  const interaction = useOptionalInteraction();

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
    const req = interaction?.spotlightRequest;
    if (!req) return;

    const durationMs = Math.max(500, req.durationMs);
    const xRatio = Math.max(0, Math.min(1, req.fakeMouseXRatio));
    const yRatio = Math.max(0, Math.min(1, req.fakeMouseYRatio));

    const pts: any[] = pointsRef.current as any[];
    if (!pts?.length) return;

    let best: any = null;
    let bestD = Infinity;
    for (const p of pts) {
      const pos = (p?.position as any) || [0, 0, 0];
      if (!Array.isArray(pos) || pos.length < 3) continue;
      const [x, y, z] = pos;
      const d = x * x + y * y + z * z;
      if (d < bestD) { bestD = d; best = p; }
    }
    if (!best) return;

    if (spotlightTimerRef.current) {
      clearTimeout(spotlightTimerRef.current);
      spotlightTimerRef.current = null;
    }

    spotlightActiveRef.current = true;
    const synthEvt = {
      stopPropagation: () => {},
      preventDefault: () => {},
      clientX: (typeof window !== 'undefined' ? window.innerWidth : 1000) * xRatio,
      clientY: (typeof window !== 'undefined' ? window.innerHeight : 800) * yRatio,
    };

    try { onHoverStartRef.current?.(best, synthEvt); } catch (err) { console.warn('[useObserverSpotlight] onHoverStart failed:', err); }

    // Consume the request immediately so a re-trigger works next time
    interaction!.setSpotlightRequest(null);

    spotlightTimerRef.current = setTimeout(() => {
      try { onHoverEndRef.current?.(); } catch (err) { console.warn('[useObserverSpotlight] onHoverEnd failed:', err); }
      spotlightActiveRef.current = false;
      spotlightTimerRef.current = null;
    }, durationMs);

    return () => {
      if (spotlightTimerRef.current) clearTimeout(spotlightTimerRef.current);
      spotlightTimerRef.current = null;
      spotlightActiveRef.current = false;
    };
  }, [interaction?.spotlightRequest]);

  return { spotlightActiveRef };
}
