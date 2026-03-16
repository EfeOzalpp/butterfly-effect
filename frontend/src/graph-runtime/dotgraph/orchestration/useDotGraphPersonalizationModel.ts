import { useEffect, useMemo } from 'react';

import { sampleStops, rgbString } from '../../../lib/utils/color-and-interpolation';
import { classifyPosition, getTieStats } from '../../gamification/rankLogic';

type UseDotGraphPersonalizationModelParams = {
  personalizedEntryId: string | null;
  shapes: any[];
  dataById: Map<string, any>;
  showCompleteUI: boolean;
  mode: 'absolute' | 'relative';
  getRelForId: (id: string) => number;
  getRelForValue: (value: number) => number;
  getAbsForId: (id: string) => number;
  getAbsForValue: (value: number) => number;
  safeData: any[];
  section: string;
  shouldShowPersonalized: boolean;
  hasPersonalizedInDataset: boolean;
};

export default function useDotGraphPersonalizationModel({
  personalizedEntryId,
  shapes,
  dataById,
  showCompleteUI,
  mode,
  getRelForId,
  getRelForValue,
  getAbsForId,
  getAbsForValue,
  safeData,
  section,
  shouldShowPersonalized,
  hasPersonalizedInDataset,
}: UseDotGraphPersonalizationModelParams) {
  const myShape = useMemo(
    () => shapes.find((shape) => shape?._id === personalizedEntryId),
    [shapes, personalizedEntryId]
  );

  const myEntry = useMemo(
    () => (personalizedEntryId ? dataById.get(personalizedEntryId) ?? null : null),
    [dataById, personalizedEntryId]
  );

  const mySnapshot = useMemo(() => {
    if (myEntry || typeof window === 'undefined') return null;
    try {
      const raw = sessionStorage.getItem('gp.myDoc');
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }, [myEntry]);

  const effectiveMyEntry = myEntry || mySnapshot;

  const fallbackColor = useMemo(() => {
    const avg = Number((effectiveMyEntry as any)?.avgWeight);
    if (!Number.isFinite(avg)) return '#ffffff';
    return rgbString(sampleStops(avg));
  }, [effectiveMyEntry]);

  const effectiveMyShape =
    myShape ||
    (effectiveMyEntry ? { position: [0, 0, 0], color: fallbackColor } : null);

  const myDisplayValue = useMemo(() => {
    if (!(showCompleteUI && effectiveMyEntry)) return 0;

    if (myEntry) {
      return mode === 'relative' ? getRelForId(myEntry._id) : getAbsForId(myEntry._id);
    }

    const avg = Number((effectiveMyEntry as any)?.avgWeight);
    if (!Number.isFinite(avg)) return 0;

    try {
      return mode === 'relative' ? Math.round(getRelForValue(avg)) : Math.round(getAbsForValue(avg));
    } catch {
      return 0;
    }
  }, [
    showCompleteUI,
    effectiveMyEntry,
    myEntry,
    mode,
    getRelForId,
    getAbsForId,
    getRelForValue,
    getAbsForValue,
  ]);

  const myStats =
    effectiveMyEntry && myEntry
      ? getTieStats({ data: safeData, targetId: myEntry._id })
      : { below: 0, equal: 0, above: 0, totalOthers: 0 };

  const myClass = classifyPosition(myStats);

  const shouldRenderPersonalUI =
    showCompleteUI && shouldShowPersonalized && !!effectiveMyShape && !!effectiveMyEntry;

  const shouldRenderExtraPersonalSprite = shouldRenderPersonalUI && !hasPersonalizedInDataset;

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const wantOpen = sessionStorage.getItem('gp.openPersonalOnNext') === '1';
    if (!wantOpen) return;
    if (!shouldRenderPersonalUI) return;
    try {
      window.dispatchEvent(new CustomEvent('gp:open-personalized'));
    } finally {
      sessionStorage.removeItem('gp.openPersonalOnNext');
    }
  }, [shouldRenderPersonalUI]);

  void section;

  return {
    myEntry,
    effectiveMyEntry,
    effectiveMyShape,
    myDisplayValue,
    myStats,
    myClass,
    shouldRenderPersonalUI,
    shouldRenderExtraPersonalSprite,
  };
}
