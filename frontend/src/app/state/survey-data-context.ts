import { createContext, useContext } from "react";
import type { SurveyRow } from "../types";

export type SurveyDataState = {
  // Active section filter — e.g. 'all', 'all-students', 'fine-arts'
  section: string;
  setSection: (s: string) => void;
  // Response counts keyed by section — includes aggregates: 'all', 'all-students', 'all-staff', 'all-massart'
  counts: Record<string, number>;
  // All rows from Sanity, up to 5,000 — unfiltered
  allRows: SurveyRow[];
  // Filtered rows sliced to 300 — what the graph actually renders
  data: SurveyRow[];
  // Filtered rows before the 300 slice — used for counts and personalization logic
  allFilteredRows: SurveyRow[];
  // True while the initial Sanity fetch is in flight
  loading: boolean;
};

export const SurveyDataCtx = createContext<SurveyDataState | null>(null);

export function useSurveyData(): SurveyDataState {
  const ctx = useContext(SurveyDataCtx);
  if (!ctx) throw new Error("useSurveyData must be used within AppProvider");
  return ctx;
}

export function useOptionalSurveyData(): SurveyDataState | null {
  return useContext(SurveyDataCtx);
}
