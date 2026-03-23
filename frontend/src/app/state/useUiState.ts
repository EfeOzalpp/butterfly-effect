import { useEffect, useState } from 'react';

export default function useUiState() {
  const [isSurveyActive, setSurveyActive] = useState<boolean>(false);
  const [hasCompletedSurvey, setHasCompletedSurvey] = useState<boolean>(false);

  const [questionnaireOpen, setQuestionnaireOpen] = useState<boolean>(false);
  const [sectionOpen, setSectionOpen] = useState<boolean>(false);
  const [cityPanelOpen, setCityPanelOpen] = useState<boolean>(false);

  useEffect(() => {
    if (!questionnaireOpen && cityPanelOpen) setCityPanelOpen(false);
  }, [questionnaireOpen, cityPanelOpen]);

  const [observerMode, setObserverMode] = useState<boolean>(false);
  const [vizVisible, setVizVisible] = useState<boolean>(false);
  const openGraph = () => setVizVisible(true);
  const closeGraph = () => setVizVisible(false);

  const [logsOpen, setLogsOpen] = useState<boolean>(false);
  const [widgetsOpen, setWidgetsOpen] = useState<boolean>(false);

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
  };
}
