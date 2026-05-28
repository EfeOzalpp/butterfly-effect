// src/app/state/useUiState.ts
// Keeps UI-only state together so app-provider can focus on wiring contexts.

import { useCallback, useEffect, useRef, useState } from 'react';
import { getSessionItem, readStoredMode, setSessionItem } from '../session';

import type { Mode, QuestionnaireNavState, SpotlightRequest } from './ui-context';

const DEFAULT_QUESTIONNAIRE_NAV: QuestionnaireNavState = {
  step: 0,
  total: 0,
  nextLabel: 'Next',
  nextDisabled: true,
};

function sameQuestionnaireNav(a: QuestionnaireNavState, b: QuestionnaireNavState) {
  return (
    a.step === b.step &&
    a.total === b.total &&
    a.nextLabel === b.nextLabel &&
    a.nextDisabled === b.nextDisabled
  );
}

export default function useUiState() {
  // ── Survey shell ───────────────────────────────────────────────────────────
  // isSurveyActive: survey shell is mounted (role → section → questions).
  // Distinct from questionnaireOpen, which is narrower (only the 'questions' stage).
  const [isSurveyActive, setSurveyActive] = useState<boolean>(false);
  const [hasCompletedSurvey, setHasCompletedSurvey] = useState<boolean>(false);

  // ── Questionnaire sub-state ────────────────────────────────────────────────
  const [questionnaireOpen, _setQuestionnaireOpen] = useState<boolean>(false);
  const questionnaireOpenRef = useRef(false);
  // Tracks whether the graph was opened while the questionnaire was active so
  // closeGraph() can restore the questionnaire rather than returning to landing.
  const graphReturnRef = useRef(false);
  const [sectionOpen, setSectionOpen] = useState<boolean>(false);
  const [cityPanelOpen, setCityPanelOpen] = useState<boolean>(false);
  const [questionnaireNav, _setQuestionnaireNav] = useState<QuestionnaireNavState>(
    DEFAULT_QUESTIONNAIRE_NAV
  );
  const [questionnaireAdvanceTick, setQuestionnaireAdvanceTick] = useState(0);

  const setQuestionnaireNav = useCallback((next: Partial<QuestionnaireNavState>) => {
    _setQuestionnaireNav((prev) => {
      const merged = { ...prev, ...next };
      return sameQuestionnaireNav(prev, merged) ? prev : merged;
    });
  }, []);

  const requestQuestionnaireAdvance = useCallback(() => {
    setQuestionnaireAdvanceTick((tick) => tick + 1);
  }, []);

  const resetQuestionnaireNav = useCallback(() => {
    _setQuestionnaireNav(DEFAULT_QUESTIONNAIRE_NAV);
    setQuestionnaireAdvanceTick(0);
  }, []);

  const setQuestionnaireOpen = useCallback((v: boolean) => {
    questionnaireOpenRef.current = v;
    _setQuestionnaireOpen(v);
    if (!v) {
      setCityPanelOpen(false);
      resetQuestionnaireNav();
    }
  }, [resetQuestionnaireNav]);

  // ── Graph visibility ───────────────────────────────────────────────────────
  const [observerMode, setObserverMode] = useState<boolean>(false);
  const [vizVisible, _setVizVisible] = useState<boolean>(false);
  const vizVisibleRef = useRef(false);

  const setVizVisible = useCallback((v: boolean) => {
    if (!v) graphReturnRef.current = false;
    vizVisibleRef.current = v;
    _setVizVisible(v);
  }, []);

  const [logsOpen, setLogsOpen] = useState<boolean>(false);
  const [widgetsOpen, setWidgetsOpen] = useState<boolean>(false);

  const openGraph = useCallback(() => {
    if (!vizVisibleRef.current) {
      const wasInQuestionnaire = questionnaireOpenRef.current;
      graphReturnRef.current = wasInQuestionnaire;
      if (wasInQuestionnaire) {
        // Suppress questionnaire UI while graph is visible; closeGraph restores it.
        // Use the raw setter to avoid clearing cityPanelOpen or questionnaireNav,
        // which closeGraph does NOT restore (intentional: return to questions, not city panel).
        questionnaireOpenRef.current = false;
        _setQuestionnaireOpen(false);
        setCityPanelOpen(false);
      }
    }
    setVizVisible(true);
  }, [setVizVisible]);

  const closeGraph = useCallback(() => {
    if (graphReturnRef.current) {
      questionnaireOpenRef.current = true;
      _setQuestionnaireOpen(true);
    }
    setVizVisible(false);
    setLogsOpen(false);
    setWidgetsOpen(false);
  }, [setVizVisible]);

  // ── Other overlays ─────────────────────────────────────────────────────────
  const [animationVisible, setAnimationVisible] = useState(false);
  const [openPersonalized, setOpenPersonalized] = useState(false);
  const [personalPanelOpen, setPersonalPanelOpen] = useState(true);
  const [spotlightRequest, setSpotlightRequest] = useState<SpotlightRequest | null>(null);

  // ── Persisted preferences ──────────────────────────────────────────────────
  const [mode, setMode] = useState<Mode>(() => readStoredMode('absolute'));
  useEffect(() => {
    setSessionItem('be.mode', mode);
  }, [mode]);

  const [radarMode, setRadarMode] = useState<boolean>(() => getSessionItem('be.radarMode') === '1');
  useEffect(() => {
    setSessionItem('be.radarMode', radarMode ? '1' : '0');
  }, [radarMode]);

  // ── Survey reset ───────────────────────────────────────────────────────────
  const [surveyResetKey, setSurveyResetKey] = useState(0);
  const incrementSurveyResetKey = useCallback(() => { setSurveyResetKey((k) => k + 1); }, []);

  return {
    isSurveyActive,
    setSurveyActive,
    hasCompletedSurvey,
    setHasCompletedSurvey,
    questionnaireOpen,
    setQuestionnaireOpen,
    sectionOpen,
    setSectionOpen,
    cityPanelOpen,
    setCityPanelOpen,
    observerMode,
    setObserverMode,
    vizVisible,
    openGraph,
    closeGraph,
    setVizVisible,
    logsOpen,
    setLogsOpen,
    widgetsOpen,
    setWidgetsOpen,
    animationVisible,
    setAnimationVisible,
    openPersonalized,
    setOpenPersonalized,
    personalPanelOpen,
    setPersonalPanelOpen,
    mode,
    setMode,
    radarMode,
    setRadarMode,
    spotlightRequest,
    setSpotlightRequest,
    questionnaireNav,
    setQuestionnaireNav,
    questionnaireAdvanceTick,
    requestQuestionnaireAdvance,
    resetQuestionnaireNav,
    surveyResetKey,
    incrementSurveyResetKey,
  };
}
