import { createContext, useContext } from "react";
import type { SurveyRow } from "../../domain/survey/types";

export interface SurveyDataState {
  // Active section filter - e.g. 'all', 'all-students', 'fine-arts'
  section: string;
  setSection: (s: string) => void;
  // Increments on every picker choice, including selecting the current section again.
  sectionSelectionVersion: number;
  // Response counts keyed by section - includes aggregates: 'all', 'all-students', 'all-staff', 'all-massart'
  counts: Record<string, number>;
  // All streamed survey rows loaded so far - unfiltered and used by logs/counts
  allRows: SurveyRow[];
  // Filtered rows before the graph slice - used for logs and personalization lookup
  allFilteredRows: SurveyRow[];
  // True while the initial Sanity fetch is in flight
  loading: boolean;
  // Local insert used after submit so graph data does not wait for Sanity's listener echo.
  upsertLocalSurveyRow: (row: SurveyRow, replaceId?: string) => void;
};

export const SurveyDataCtx = createContext<SurveyDataState | null>(null);

export function useSurveyData(): SurveyDataState {
  const ctx = useContext(SurveyDataCtx);
  if (!ctx) throw new Error("useSurveyData must be used within AppProvider");
  return ctx;
}
