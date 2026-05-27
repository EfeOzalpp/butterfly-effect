// src/app/state/survey-data-utils.ts
// Pure survey row transforms. Keeping these here makes useSurveyDataState about flow.

import type { SurveyRow } from '../../services/sanity/types';
import { NON_VISITOR_MASSART, STAFF_IDS, STUDENT_IDS } from '../../services/sanity/sections';

export function deriveSectionCounts(allRows: SurveyRow[]): Record<string, number> {
  const bySection: Record<string, number> = {};
  for (const row of allRows) {
    const key = row.section || '';
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
}

export function filterRowsForSection(allRows: SurveyRow[], section: string) {
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
}
