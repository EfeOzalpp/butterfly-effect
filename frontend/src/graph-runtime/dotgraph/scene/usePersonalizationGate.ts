// src/graph-runtime/dotgraph/scene/usePersonalizationGate.ts

import { useMemo, useState } from 'react';

import useViewerScope from '../scope/useViewerScope';
import type { DotGraphEntry } from '../types';

interface UsePersonalizationGateParams {
  myEntryId: string | null;
  mySection: string | null;
  section: string;
  safeData: DotGraphEntry[];
  observerMode: boolean;
  isSmallScreen: boolean;
}

export default function usePersonalizationGate({
  myEntryId,
  mySection,
  section,
  safeData,
  observerMode,
  isSmallScreen,
}: UsePersonalizationGateParams) {
  const personalizedEntryId: string | null =
    myEntryId ?? (typeof window !== 'undefined' ? sessionStorage.getItem('be.myEntryId') : null);

  const [personalOpen, setPersonalOpen] = useState(true);

  const hasPersonalizedInDataset = useMemo(
    () => !!personalizedEntryId && safeData.some((entry) => entry._id === personalizedEntryId),
    [personalizedEntryId, safeData]
  );

  const { shouldShowPersonalized } = useViewerScope({
    mySection,
    section,
  });

  const wantsSkew =
    isSmallScreen &&
    !observerMode &&
    hasPersonalizedInDataset &&
    personalOpen &&
    shouldShowPersonalized;

  return {
    personalizedEntryId,
    personalOpen,
    setPersonalOpen,
    hasPersonalizedInDataset,
    shouldShowPersonalized,
    wantsSkew,
  };
}
