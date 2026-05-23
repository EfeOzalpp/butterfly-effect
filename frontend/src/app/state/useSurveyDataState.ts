// src/app/state/useSurveyDataState.ts
// Owns Sanity survey rows plus the active section filter used by graph views.

import { useCallback, useMemo, useState } from 'react';

import { subscribeSurveyData } from '../../services/sanity/api';
import { useMockSanityReadMode } from '../../services/sanity/config';
import { getSessionItem, setSessionItem } from '../session';
import type { SurveyRow } from '../types';
import { deriveSectionCounts, filterRowsForSection } from './survey-data-utils';

interface UseSurveyDataStateParams {
  mySection: string | null;
}

const ALL_ROWS_LIMIT = 5000;
const VISIBLE_ROWS_LIMIT = 300;
const SMALL_SECTION_THRESHOLD = 5;

export default function useSurveyDataState({
  mySection,
}: UseSurveyDataStateParams) {
  const { active: mockReadMode } = useMockSanityReadMode();
  const [section, setSection] = useState<string>('all');
  const [allRows, setAllRows] = useState<SurveyRow[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const applyPostSubmitRedirect = useCallback((nextCounts: Record<string, number>) => {
    if (typeof window === 'undefined') return;
    const justSubmitted = getSessionItem('be.justSubmitted') === '1';
    if (!justSubmitted) return;

    const effectiveMySection = mySection ?? getSessionItem('be.mySection') ?? '';
    if (!effectiveMySection) return;

    if (effectiveMySection === 'visitor') {
      sessionStorage.removeItem('be.justSubmitted');
      return;
    }

    const n = nextCounts[effectiveMySection] ?? 0;
    if (n < SMALL_SECTION_THRESHOLD) {
      // Tiny non-visitor sections redirect to the MassArt pool so the user's dot has context.
      setSection('all-massart');
      try {
        setSessionItem('be.openPersonalOnNext', '1');
      } catch (err: unknown) {
        console.warn('[useSurveyDataState] Failed to set openPersonalOnNext:', err);
      }
    }

    sessionStorage.removeItem('be.justSubmitted');
  }, [mySection]);

  const subscribeToSurveyData = useCallback(() => {
    setLoading(true);
    return subscribeSurveyData({
      section: 'all',
      limit: ALL_ROWS_LIMIT,
      onData: (rows: SurveyRow[]) => {
        setAllRows(rows);
        setLoading(false);
        // Run redirect from fresh rows instead of waiting for a separate state effect.
        applyPostSubmitRedirect(deriveSectionCounts(rows));
      },
    });
  }, [applyPostSubmitRedirect, mockReadMode]);

  const counts = useMemo(
    () => deriveSectionCounts(allRows),
    [allRows]
  );

  const filteredRows = useMemo(
    () => filterRowsForSection(allRows, section),
    [allRows, section]
  );

  const data = useMemo(() => filteredRows.slice(0, VISIBLE_ROWS_LIMIT), [filteredRows]);

  return {
    section,
    setSection,
    counts,
    allRows,
    data,
    allFilteredRows: filteredRows,
    loading,
    subscribeToSurveyData,
  };
}
