import { useCallback, useEffect, useState } from 'react';

import { subscribeSurveyData } from '../../services/sanity/api';
import { useMockSanityReadMode } from '../../services/sanity/config';
import { getSessionItem, setSessionItem } from '../session';
import type { SurveyRow } from '../types';

type UseSurveyDataStateParams = {
  mySection: string | null;
  setSection: (section: string) => void;
  counts: Record<string, number>;
};

export default function useSurveyDataState({
  mySection,
  setSection,
  counts,
}: UseSurveyDataStateParams) {
  const { active: mockReadMode } = useMockSanityReadMode();

  const [data, setData] = useState<SurveyRow[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const subscribeToSurveyData = useCallback((section: string) => {
    void mockReadMode;
    setLoading(true);
    return subscribeSurveyData({
      section,
      onData: (rows: SurveyRow[]) => {
        setData(rows);
        setLoading(false);
      },
    });
  }, [mockReadMode]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const justSubmitted = getSessionItem('gp.justSubmitted') === '1';
    if (!justSubmitted) return;
    if (!counts) return;

    const effectiveMySection = mySection || getSessionItem('gp.mySection') || '';
    if (!effectiveMySection) return;

    if (effectiveMySection === 'visitor') {
      sessionStorage.removeItem('gp.justSubmitted');
      return;
    }

    const n = counts[effectiveMySection] ?? 0;
    const SMALL_SECTION_THRESHOLD = 5;
    if (n < SMALL_SECTION_THRESHOLD) {
      setSection('all-massart');
      try {
        setSessionItem('gp.openPersonalOnNext', '1');
      } catch {}
    }

    sessionStorage.removeItem('gp.justSubmitted');
  }, [counts, mySection, setSection]);

  return {
    data,
    loading,
    subscribeToSurveyData,
  };
}
