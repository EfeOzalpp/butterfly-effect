import { createContext, useContext } from "react";

export type UiState = {
  vizVisible: boolean;
  openGraph: () => void;
  closeGraph: () => void;
  isSurveyActive: boolean;
  setSurveyActive: (v: boolean) => void;
  hasCompletedSurvey: boolean;
  setHasCompletedSurvey: (v: boolean) => void;
  questionnaireOpen: boolean;
  setQuestionnaireOpen: (v: boolean) => void;
  sectionOpen: boolean;
  setSectionOpen: (v: boolean) => void;
  cityPanelOpen: boolean;
  setCityPanelOpen: (v: boolean) => void;
  observerMode: boolean;
  setObserverMode: (v: boolean) => void;
  animationVisible: boolean;
  setAnimationVisible: (v: boolean) => void;
  openPersonalized: boolean;
  setOpenPersonalized: (v: boolean) => void;
  resetToStart: () => void;
  radarMode: boolean;
  setRadarMode: (v: boolean) => void;
  logsOpen: boolean;
  setLogsOpen: (v: boolean) => void;
  widgetsOpen: boolean;
  setWidgetsOpen: (v: boolean) => void;
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
