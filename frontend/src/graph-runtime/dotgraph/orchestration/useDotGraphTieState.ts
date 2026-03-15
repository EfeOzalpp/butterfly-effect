import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { avgWeightOf } from '../../../lib/hooks/useRelativeScore';
import {
  buildTieBuckets,
  getSelectedTieLinePoints,
  getTieKeyForId,
} from '../utils/tieGraph';

type UseDotGraphTieStateParams = {
  safeData: any[];
  posById: Map<string, any>;
  spotlightActiveRef: React.RefObject<boolean>;
  onHoverEnd: () => void;
  mode: 'absolute' | 'relative';
  section: string;
  useDesktopLayout: boolean;
};

export default function useDotGraphTieState({
  safeData,
  posById,
  spotlightActiveRef,
  onHoverEnd,
  mode,
  section,
  useDesktopLayout,
}: UseDotGraphTieStateParams) {
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

  const linkKeyOf = useCallback((d: any) => Math.round(avgWeightOf(d) * 100), []);

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
    const onRot = (e: any) => {
      const source = (e && e.detail && e.detail.source) || undefined;
      if (useDesktopLayout) return;
      if (source !== 'touch') return;
      if (mobileRotDismissRef.current) clearTimeout(mobileRotDismissRef.current);
      mobileRotDismissRef.current = setTimeout(() => {
        onHoverEnd();
        mobileRotDismissRef.current = null;
      }, 2000);
    };

    window.addEventListener('gp:orbit-rot', onRot as any);
    return () => {
      window.removeEventListener('gp:orbit-rot', onRot as any);
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
