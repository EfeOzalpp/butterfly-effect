import { useCallback, useEffect, useState } from 'react';
import { getSessionItem, readStoredMode, setSessionItem } from '../session';

import type { QuestionnaireNavState } from './ui-context';
import type { Mode } from '../types';

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
  const [isSurveyActive, setSurveyActive] = useState<boolean>(false);
  const [hasCompletedSurvey, setHasCompletedSurvey] = useState<boolean>(
    () => !!(getSessionItem('be.mySection') && getSessionItem('be.myEntryId'))
  );

  const [questionnaireOpen, setQuestionnaireOpen] = useState<boolean>(false);
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

  useEffect(() => {
    if (!questionnaireOpen && cityPanelOpen) setCityPanelOpen(false);
    if (!questionnaireOpen) resetQuestionnaireNav();
  }, [questionnaireOpen, cityPanelOpen, resetQuestionnaireNav]);

  const [observerMode, setObserverMode] = useState<boolean>(false);
  const [vizVisible, setVizVisible] = useState<boolean>(false);
  const openGraph = () => setVizVisible(true);
  const closeGraph = () => setVizVisible(false);

  const [logsOpen, setLogsOpen] = useState<boolean>(false);
  const [widgetsOpen, setWidgetsOpen] = useState<boolean>(false);

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
    mode,
    setMode,
    radarMode,
    setRadarMode,
    questionnaireNav,
    setQuestionnaireNav,
    questionnaireAdvanceTick,
    requestQuestionnaireAdvance,
    resetQuestionnaireNav,
  };
}
