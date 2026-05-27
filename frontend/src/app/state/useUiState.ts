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

function hasStoredSurveySession() {
  return !!(getSessionItem('be.mySection') && getSessionItem('be.myEntryId'));
}

export default function useUiState() {
  const [isSurveyActive, setSurveyActive] = useState<boolean>(false);
  const [hasCompletedSurvey, setHasCompletedSurvey] = useState<boolean>(hasStoredSurveySession);

  const [questionnaireOpen, _setQuestionnaireOpen] = useState<boolean>(false);
  const questionnaireOpenRef = useRef(false);
  const graphOpenedFromQuestionnaireRef = useRef(false);
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

  const [observerMode, setObserverMode] = useState<boolean>(false);
  const [vizVisible, _setVizVisible] = useState<boolean>(hasStoredSurveySession);
  const vizVisibleRef = useRef(hasStoredSurveySession());
  const setVizVisible = useCallback((v: boolean) => {
    if (!v) graphOpenedFromQuestionnaireRef.current = false;
    vizVisibleRef.current = v;
    _setVizVisible(v);
  }, []);
  const [logsOpen, setLogsOpen] = useState<boolean>(false);
  const [widgetsOpen, setWidgetsOpen] = useState<boolean>(false);
  const openGraph = useCallback(() => {
    if (!vizVisibleRef.current) {
      graphOpenedFromQuestionnaireRef.current = questionnaireOpenRef.current;
    }
    setVizVisible(true);
  }, [setVizVisible]);
  const closeGraph = useCallback(() => {
    const shouldRestoreQuestionnaire = graphOpenedFromQuestionnaireRef.current;
    if (shouldRestoreQuestionnaire) {
      questionnaireOpenRef.current = true;
      _setQuestionnaireOpen(true);
    }
    setVizVisible(false);
    setLogsOpen(false);
    setWidgetsOpen(false);
  }, [setVizVisible]);

  const [surveyResetKey, setSurveyResetKey] = useState(0);
  const incrementSurveyResetKey = useCallback(() => { setSurveyResetKey((k) => k + 1); }, []);

  const [animationVisible, setAnimationVisible] = useState(false);
  const [openPersonalized, setOpenPersonalized] = useState(false);
  const [spotlightRequest, setSpotlightRequest] = useState<SpotlightRequest | null>(null);

  const [mode, setMode] = useState<Mode>(() => readStoredMode('absolute'));
  useEffect(() => {
    setSessionItem('be.mode', mode);
  }, [mode]);

  const [radarMode, setRadarMode] = useState<boolean>(() => getSessionItem('be.radarMode') === '1');
  useEffect(() => {
    setSessionItem('be.radarMode', radarMode ? '1' : '0');
  }, [radarMode]);

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
