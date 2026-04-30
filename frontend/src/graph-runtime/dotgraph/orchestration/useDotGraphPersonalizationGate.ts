import { useMemo, useState } from 'react';

import useViewerScope from '../hooks/useViewerScope';

type UseDotGraphPersonalizationGateParams = {
  myEntryId: string | null;
  mySection: string | null;
  section: string;
  safeData: any[];
  observerMode: boolean;
  isSmallScreen: boolean;
};

export default function useDotGraphPersonalizationGate({
  myEntryId,
  mySection,
  section,
  safeData,
  observerMode,
  isSmallScreen,
}: UseDotGraphPersonalizationGateParams) {
  const personalizedEntryId: string | null =
    myEntryId || (typeof window !== 'undefined' ? sessionStorage.getItem('be.myEntryId') : null);

  const [personalOpen, setPersonalOpen] = useState(true);

  const hasPersonalizedInDataset = useMemo(
    () => !!personalizedEntryId && safeData.some((d) => d?._id === personalizedEntryId),
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
