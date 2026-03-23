import { useCallback, useEffect, useMemo, useState } from 'react';

import { subscribeSurveyData } from '../../services/sanity/api';
import { useMockSanityReadMode } from '../../services/sanity/config';
import { NON_VISITOR_MASSART, STAFF_IDS, STUDENT_IDS } from '../../services/sanity/sections';
import { getSessionItem, setSessionItem } from '../session';
import type { SurveyRow } from '../types';

type UseSurveyDataStateParams = {
  section: string;
  mySection: string | null;
  setSection: (section: string) => void;
};

const ALL_ROWS_LIMIT = 5000;
const VISIBLE_ROWS_LIMIT = 300;

export default function useSurveyDataState({
  section,
  mySection,
  setSection,
}: UseSurveyDataStateParams) {
  const { active: mockReadMode } = useMockSanityReadMode();

  const [allRows, setAllRows] = useState<SurveyRow[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const subscribeToSurveyData = useCallback(() => {
    void mockReadMode;
    setLoading(true);
    return subscribeSurveyData({
      section: 'all',
      limit: ALL_ROWS_LIMIT,
      onData: (rows: SurveyRow[]) => {
        setAllRows(rows);
        setLoading(false);
      },
    });
  }, [mockReadMode]);

  const counts = useMemo(() => {
    const bySection: Record<string, number> = {};
    for (const row of allRows) {
      const key = row?.section || '';
      bySection[key] = (bySection[key] || 0) + 1;
    }

    const sum = (ids: string[]) => ids.reduce((acc, id) => acc + (bySection[id] || 0), 0);

    return {
      all: allRows.length,
      'all-massart': sum(NON_VISITOR_MASSART),
      'all-students': sum(STUDENT_IDS),
      'all-staff': sum(STAFF_IDS),
      visitor: bySection.visitor || 0,
      ...bySection,
    };
  }, [allRows]);

  const filteredRows = useMemo(() => {
    if (!section || section === 'all') return allRows;
    if (section === 'all-massart') {
      const allowed = new Set(NON_VISITOR_MASSART);
      return allRows.filter((row) => allowed.has(row.section));
    }
    if (section === 'all-students') {
      const allowed = new Set(STUDENT_IDS);
      return allRows.filter((row) => allowed.has(row.section));
    }
    if (section === 'all-staff') {
      const allowed = new Set(STAFF_IDS);
      return allRows.filter((row) => allowed.has(row.section));
    }
    return allRows.filter((row) => row.section === section);
  }, [allRows, section]);

  const data = useMemo(() => filteredRows.slice(0, VISIBLE_ROWS_LIMIT), [filteredRows]);

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
      } catch (err) {
        console.warn('[useSurveyDataState] Failed to set openPersonalOnNext in sessionStorage:', err);
      }
    }

    sessionStorage.removeItem('gp.justSubmitted');
  }, [counts, mySection, setSection]);

  return {
    counts,
    data,
    allFilteredRows: filteredRows,
    loading,
    subscribeToSurveyData,
  };
}
