// src/app/state/useSurveyDataState.ts
// Owns Sanity survey rows plus the active section filter used by graph views.

import { useCallback, useMemo, useState } from 'react';

import { getSessionItem, removeSessionItems, setSessionItem } from '../session';
import type { SurveyRow } from '../../services/sanity/types';
import { deriveSectionCounts, filterRowsForSection } from './survey-data-utils';

interface UseSurveyDataStateParams {
  mySection: string | null;
}

const ALL_ROWS_LIMIT = 5000;
const VISIBLE_ROWS_LIMIT = 300;
const SMALL_SECTION_THRESHOLD = 5;
const noopUnsubscribe: () => void = () => undefined;

export default function useSurveyDataState({
  mySection,
}: UseSurveyDataStateParams) {
  const [section, setSection] = useState<string>(() => mySection ?? 'all');
  const [allRows, setAllRows] = useState<SurveyRow[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const applyPostSubmitRedirect = useCallback((nextCounts: Record<string, number>) => {
    const justSubmitted = getSessionItem('be.justSubmitted') === '1';
    if (!justSubmitted) return;

    const effectiveMySection = mySection ?? getSessionItem('be.mySection') ?? '';
    if (!effectiveMySection) return;

    if (effectiveMySection === 'visitor') {
      removeSessionItems(['be.justSubmitted']);
      return;
    }

    const n = nextCounts[effectiveMySection] ?? 0;
    if (n < SMALL_SECTION_THRESHOLD) {
      // Tiny non-visitor sections redirect to the MassArt pool so the user's dot has context.
      setSection('all-massart');
      setSessionItem('be.openPersonalOnNext', '1');
    }

    removeSessionItems(['be.justSubmitted']);
  }, [mySection]);

  const subscribeToSurveyData = useCallback(() => {
    setLoading(true);
    let unsub = noopUnsubscribe;
    let closed = false;

    void import('../../services/sanity/api')
      .then(({ subscribeSurveyData }) => {
        if (closed) return;
        unsub = subscribeSurveyData({
          section: 'all',
          limit: ALL_ROWS_LIMIT,
          onData: (rows: SurveyRow[]) => {
            setAllRows(rows);
            setLoading(false);
            // Run redirect from fresh rows instead of waiting for a separate state effect.
            applyPostSubmitRedirect(deriveSectionCounts(rows));
          },
        });
      })
      .catch((error: unknown) => {
        if (closed) return;
        setLoading(false);
        console.error('[useSurveyDataState] failed to load survey data API:', error);
      });

    return () => {
      closed = true;
      unsub();
    };
  }, [applyPostSubmitRedirect]);

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
