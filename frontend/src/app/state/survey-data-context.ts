import { createContext, useContext } from "react";
import type { SurveyRow } from "../types";

export type SurveyDataState = {
  section: string;
  setSection: (s: string) => void;
  counts: Record<string, number>;
  allRows: SurveyRow[];
  data: SurveyRow[];
  allFilteredRows: SurveyRow[];
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
