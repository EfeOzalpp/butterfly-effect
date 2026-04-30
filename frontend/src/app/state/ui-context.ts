import { createContext, useContext } from "react";
import type { Mode } from "../types";

export type QuestionnaireNavState = {
  step: number;
  total: number;
  nextLabel: string;
  nextDisabled: boolean;
};

export type UiState = {
  // Whether the 3D dot graph (DataVisualization) is mounted and visible
  vizVisible: boolean;
  // Show the 3D dot graph — called after survey submit or entering observer mode
  openGraph: () => void;
  // Hide the 3D dot graph
  closeGraph: () => void;
  // Whether the onboarding survey panel is currently open (role → section → questions)
  isSurveyActive: boolean;
  setSurveyActive: (v: boolean) => void;
  // Persists across resetToStart — used to skip re-showing the survey on reload
  hasCompletedSurvey: boolean;
  setHasCompletedSurvey: (v: boolean) => void;
  // Whether the questionnaire step (the 5 questions) is active — drives canvas resize
  questionnaireOpen: boolean;
  setQuestionnaireOpen: (v: boolean) => void;
  // Whether the section picker dropdown in the graph view is open
  sectionOpen: boolean;
  setSectionOpen: (v: boolean) => void;
  // Whether the city overlay canvas is shown (appears during questionnaire on certain screens)
  cityPanelOpen: boolean;
  setCityPanelOpen: (v: boolean) => void;
  // User skipped the onboarding and is viewing the graph without submitting
  observerMode: boolean;
  setObserverMode: (v: boolean) => void;
  // True during the post-submit transition animation — hides the landing title and canvas while the graph loads in
  animationVisible: boolean;
  setAnimationVisible: (v: boolean) => void;
  // Whether to auto-open the user's personalized dot in the graph after submit
  openPersonalized: boolean;
  setOpenPersonalized: (v: boolean) => void;
  // Clears all UI, identity, and canvas state — returns app to landing
  resetToStart: () => void;
  // Radar chart overlay toggle in the graph view
  radarMode: boolean;
  setRadarMode: (v: boolean) => void;
  // Activity log panel toggle in the graph view
  logsOpen: boolean;
  setLogsOpen: (v: boolean) => void;
  // Widgets panel toggle in the graph view
  widgetsOpen: boolean;
  setWidgetsOpen: (v: boolean) => void;
  // Graph display mode — 'absolute' shows raw scores, 'relative' ranks against visible peers
  mode: Mode;
  setMode: (m: Mode) => void;
  // Current step, total, next button label and disabled state for the questionnaire
  questionnaireNav: QuestionnaireNavState;
  setQuestionnaireNav: (next: Partial<QuestionnaireNavState>) => void;
  // Incremented to signal the questionnaire to advance to the next question
  questionnaireAdvanceTick: number;
  requestQuestionnaireAdvance: () => void;
  resetQuestionnaireNav: () => void;
};

export const UiCtx = createContext<UiState | null>(null);

export function useUiFlow(): UiState {
  const ctx = useContext(UiCtx);
  if (!ctx) throw new Error("useUiFlow must be used within AppProvider");
  return ctx;
}

export function useOptionalUiFlow(): UiState | null {
  return useContext(UiCtx);
}
