// src/graph-runtime/dotgraph/scene/useTieState.ts

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { avgWeightOf } from '../../../lib/hooks/useRelativeScore';
import {
  buildTieBuckets,
  getSelectedTieLinePoints,
  getTieKeyForId,
} from '../utils/tieGraph';
import type { DotGraphEntry, Vec3 } from '../types';

interface UseTieStateParams {
  safeData: DotGraphEntry[];
  posById: Map<string, Vec3>;
  spotlightActiveRef: React.RefObject<boolean>;
  onHoverEnd: () => void;
  mode: 'absolute' | 'relative';
  section: string;
  useDesktopLayout: boolean;
}

interface OrbitRotationDetail {
  source?: unknown;
}

const getOrbitRotationSource = (event: Event): unknown => {
  if (!(event instanceof CustomEvent)) return undefined;
  const detail = event.detail as unknown;
  if (!detail || typeof detail !== "object" || !("source" in detail)) {
    return undefined;
  }
  return (detail as OrbitRotationDetail).source;
};

export default function useTieState({
  safeData,
  posById,
  spotlightActiveRef,
  onHoverEnd,
  mode,
  section,
  useDesktopLayout,
}: UseTieStateParams) {
  const [selectedTieKey, setSelectedTieKey] = useState<number | null>(null);

  useEffect(() => {
    if (spotlightActiveRef.current) return;
    onHoverEnd();
  }, [mode, onHoverEnd, spotlightActiveRef]);

  useEffect(() => {
    if (spotlightActiveRef.current) return;
    onHoverEnd();
    setSelectedTieKey(null);
  }, [section, onHoverEnd, spotlightActiveRef]);

  useEffect(() => {
    if (spotlightActiveRef.current) return;
    onHoverEnd();
    setSelectedTieKey(null);
  }, [safeData.length, onHoverEnd, spotlightActiveRef]);

  const linkKeyOf = useCallback((entry: DotGraphEntry) => Math.round(avgWeightOf(entry) * 100), []);

  const tieBuckets = useMemo(
    () => buildTieBuckets(safeData, linkKeyOf),
    [safeData, linkKeyOf]
  );

  const selectedTieLinePoints = useMemo(
    () => getSelectedTieLinePoints(selectedTieKey, tieBuckets, posById),
    [selectedTieKey, tieBuckets, posById]
  );

  const tieKeyForId = useCallback(
    (id: string): number | null =>
      getTieKeyForId(id, safeData, tieBuckets, linkKeyOf),
    [safeData, tieBuckets, linkKeyOf]
  );

  const mobileRotDismissRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    const onRot = (event: Event) => {
      const source = getOrbitRotationSource(event);
      if (useDesktopLayout) return;
      if (source !== 'touch') return;
      if (mobileRotDismissRef.current) clearTimeout(mobileRotDismissRef.current);
      mobileRotDismissRef.current = setTimeout(() => {
        onHoverEnd();
        mobileRotDismissRef.current = null;
      }, 2000);
    };

    window.addEventListener('gp:orbit-rot', onRot);
    return () => {
      window.removeEventListener('gp:orbit-rot', onRot);
      if (mobileRotDismissRef.current) {
        clearTimeout(mobileRotDismissRef.current);
        mobileRotDismissRef.current = null;
      }
    };
  }, [useDesktopLayout, onHoverEnd]);

  return {
    selectedTieKey,
    setSelectedTieKey,
    selectedTieLinePoints,
    tieKeyForId,
  };
}
