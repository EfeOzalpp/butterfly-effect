// src/graph-runtime/dotgraph/interaction/useHoverDismissal.ts
// Clears hover UI when the graph context changes or mobile touch rotation settles.

import { useEffect, useRef } from 'react';
import type { RefObject } from 'react';

interface OrbitRotationDetail {
  source?: unknown;
}

interface UseHoverDismissalArgs {
  mode: 'absolute' | 'relative';
  section: string;
  dataCount: number;
  useDesktopLayout: boolean;
  spotlightActiveRef: RefObject<boolean>;
  onHoverEnd: () => void;
}

const getOrbitRotationSource = (event: Event): unknown => {
  if (!(event instanceof CustomEvent)) return undefined;
  const detail = event.detail as unknown;
  if (!detail || typeof detail !== 'object' || !('source' in detail)) return undefined;
  return (detail as OrbitRotationDetail).source;
};

export default function useHoverDismissal({
  mode,
  section,
  dataCount,
  useDesktopLayout,
  spotlightActiveRef,
  onHoverEnd,
}: UseHoverDismissalArgs) {
  useEffect(() => {
    if (!spotlightActiveRef.current) onHoverEnd();
  }, [mode, section, dataCount, onHoverEnd, spotlightActiveRef]);

  const mobileRotDismissRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    const onRot = (event: Event) => {
      if (useDesktopLayout || getOrbitRotationSource(event) !== 'touch') return;
      if (mobileRotDismissRef.current) clearTimeout(mobileRotDismissRef.current);
      mobileRotDismissRef.current = setTimeout(() => {
        onHoverEnd();
        mobileRotDismissRef.current = null;
      }, 2000);
    };

    window.addEventListener('gp:orbit-rot', onRot);
    return () => {
      window.removeEventListener('gp:orbit-rot', onRot);
      if (mobileRotDismissRef.current) clearTimeout(mobileRotDismissRef.current);
    };
  }, [useDesktopLayout, onHoverEnd]);
}
