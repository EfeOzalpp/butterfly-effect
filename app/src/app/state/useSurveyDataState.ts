// src/app/state/useSurveyDataState.ts
// Owns Sanity survey rows plus the active section filter used by graph views.

import { useCallback, useMemo, useRef, useState } from 'react';

import { getSessionItem, removeSessionItems, setSessionItem } from '../session';
import { parentAggregateForSection } from '../../domain/survey/sections';
import type { SurveyRow } from '../../domain/survey/types';
import { deriveSectionCounts, filterRowsForSection, upsertSurveyRow } from './survey-data-utils';

interface UseSurveyDataStateParams {
  mySection: string | null;
}

const ALL_ROWS_LIMIT = 5000;
const VISIBLE_ROWS_LIMIT = 300;
const FIRST_SECTION_SUBMISSION_COUNT = 1;
const noopUnsubscribe: () => void = () => undefined;

export default function useSurveyDataState({
  mySection,
}: UseSurveyDataStateParams) {
  const [section, setSectionValue] = useState<string>(() => mySection ?? 'all');
  const [sectionSelectionVersion, setSectionSelectionVersion] = useState(0);
  const [allRows, setAllRows] = useState<SurveyRow[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const localRowsRef = useRef<SurveyRow[]>([]);

  const setSection = useCallback((nextSection: string) => {
    setSectionValue(nextSection);
    setSectionSelectionVersion((version) => version + 1);
  }, []);

  const mergeLocalRows = useCallback((rows: SurveyRow[]) => {
    const localRows = localRowsRef.current;
    if (!localRows.length) return rows;

    const remoteIds = new Set(rows.map((row) => row._id));
    return localRows.reduce(
      (nextRows, row) => remoteIds.has(row._id) ? nextRows : upsertSurveyRow(nextRows, row),
      rows
    );
  }, []);

  const applyPostSubmitRedirect = useCallback((nextCounts: Record<string, number>) => {
    const justSubmitted = getSessionItem('be.justSubmitted') === '1';
    if (!justSubmitted) return;

    const effectiveMySection = mySection ?? getSessionItem('be.mySection') ?? '';
    if (!effectiveMySection) return;

    if (effectiveMySection === 'visitor') {
      removeSessionItems(['be.justSubmitted']);
      return;
    }

    const sectionCount = nextCounts[effectiveMySection] ?? 0;
    const parentAggregate = parentAggregateForSection(effectiveMySection);
    if (parentAggregate && sectionCount <= FIRST_SECTION_SUBMISSION_COUNT) {
      // First entries in a specific section open the nearest useful aggregate for context.
      setSection(parentAggregate);
      setSessionItem('be.openPersonalOnNext', '1');
    }

    removeSessionItems(['be.justSubmitted']);
  }, [mySection, setSection]);

  const subscribeToSurveyData = useCallback(() => {
    setLoading(true);
    let unsub = noopUnsubscribe;
    let closed = false;

    void import('../../client-api/read-api/api')
      .then(({ subscribeSurveyData }) => {
        if (closed) return;
        unsub = subscribeSurveyData({
          section: 'all',
          limit: ALL_ROWS_LIMIT,
          onData: (rows: SurveyRow[]) => {
            const nextRows = mergeLocalRows(rows);
            setAllRows(nextRows);
            setLoading(false);
            // Run redirect from fresh rows instead of waiting for a separate state effect.
            applyPostSubmitRedirect(deriveSectionCounts(nextRows));
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
  }, [applyPostSubmitRedirect, mergeLocalRows]);

  const upsertLocalSurveyRow = useCallback((row: SurveyRow, replaceId?: string) => {
    localRowsRef.current = upsertSurveyRow(localRowsRef.current, row, replaceId);
    setAllRows((rows) => upsertSurveyRow(rows, row, replaceId));
  }, []);

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
    sectionSelectionVersion,
    counts,
    allRows,
    data,
    allFilteredRows: filteredRows,
    loading,
    upsertLocalSurveyRow,
    subscribeToSurveyData,
  };
}
