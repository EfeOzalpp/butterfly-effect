// src/app/state/ui-context.ts
// App-level UI contract shared by navigation, onboarding, and graph views.

import { createContext, useContext } from "react";

export type Mode = "relative" | "absolute";

export interface QuestionnaireNavState {
  step: number;
  total: number;
  nextLabel: string;
  nextDisabled: boolean;
}

export interface SpotlightRequest {
  durationMs: number;
  fakeMouseXRatio: number;
  fakeMouseYRatio: number;
}

export interface UiState {
  // Whether the 3D dot graph is mounted and visible.
  vizVisible: boolean;
  // Called after survey submit or when entering observer mode.
  openGraph: () => void;
  closeGraph: () => void;

  // Onboarding shell state: role -> section -> questions.
  isSurveyActive: boolean;
  setSurveyActive: (v: boolean) => void;
  // True after submit; reload bootstrap can restore it from saved response keys.
  hasCompletedSurvey: boolean;
  setHasCompletedSurvey: (v: boolean) => void;
  // Drives canvas resizing while the question UI is active.
  questionnaireOpen: boolean;
  setQuestionnaireOpen: (v: boolean) => void;
  // Section dropdown state in the graph view.
  sectionOpen: boolean;
  setSectionOpen: (v: boolean) => void;
  // City overlay canvas shown during parts of the questionnaire.
  cityPanelOpen: boolean;
  setCityPanelOpen: (v: boolean) => void;

  // Observer mode means the user skipped onboarding and is browsing results.
  observerMode: boolean;
  setObserverMode: (v: boolean) => void;
  // Post-submit transition guard that hides landing/canvas while graph loads in.
  animationVisible: boolean;
  setAnimationVisible: (v: boolean) => void;
  // Auto-opens the submitted user's personalized dot after submit.
  openPersonalized: boolean;
  setOpenPersonalized: (v: boolean) => void;
  // True while the personalized gamification panel is expanded (user hasn't pressed X).
  personalPanelOpen: boolean;
  setPersonalPanelOpen: (v: boolean) => void;
  resetToStart: () => void;
  // Incremented by resetToStart so the Survey can detect mid-flow resets.
  surveyResetKey: number;

  // Graph overlay controls.
  radarMode: boolean;
  setRadarMode: (v: boolean) => void;
  logsOpen: boolean;
  setLogsOpen: (v: boolean) => void;
  widgetsOpen: boolean;
  setWidgetsOpen: (v: boolean) => void;
  mode: Mode;
  setMode: (m: Mode) => void;

  // Navigation asks dotgraph to synthesize a hover in observer mode.
  spotlightRequest: SpotlightRequest | null;
  setSpotlightRequest: (req: SpotlightRequest | null) => void;

  // Bottom nav owns the button, questionnaire consumes the tick.
  questionnaireNav: QuestionnaireNavState;
  setQuestionnaireNav: (next: Partial<QuestionnaireNavState>) => void;
  questionnaireAdvanceTick: number;
  requestQuestionnaireAdvance: () => void;
  resetQuestionnaireNav: () => void;
}

export const UiCtx = createContext<UiState | null>(null);

export function useUiFlow(): UiState {
  const ctx = useContext(UiCtx);
  if (!ctx) throw new Error("useUiFlow must be used within AppProvider");
  return ctx;
}

export function useOptionalUiFlow(): UiState | null {
  return useContext(UiCtx);
}
