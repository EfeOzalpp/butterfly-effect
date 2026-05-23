// src/app/app-provider.tsx
// Creates the app-wide state providers and handles cross-slice reset/bootstrap.

import React, { useCallback, useEffect, useMemo, useRef } from "react";
import { unstable_batchedUpdates as batched } from "react-dom";

import { getSessionItem, removeSessionItems } from "./session";
import { USE_MOCK_SANITY, shouldUseMockSanityReads } from "../services/sanity/config";
import { clearMockSurveyState } from "../services/sanity/mockData";

import useCanvasRuntimeState from "./state/useCanvasRuntimeState";
import useIdentityState from "./state/useIdentityState";
import usePreferencesState from "./state/usePreferencesState";
import useSurveyDataState from "./state/useSurveyDataState";
import useUiState from "./state/useUiState";

import { CanvasRuntimeCtx } from "./state/canvas-runtime-context";
import type { CanvasRuntimeState } from "./state/canvas-runtime-context";
import { IdentityCtx } from "./state/identity-context";
import type { IdentityState } from "./state/identity-context";
import { PreferencesCtx } from "./state/preferences-context";
import type { PreferencesState } from "./state/preferences-context";
import { SurveyDataCtx } from "./state/survey-data-context";
import type { SurveyDataState } from "./state/survey-data-context";
import { UiCtx } from "./state/ui-context";
import type { UiState } from "./state/ui-context";

export const AppProvider = ({ children }: { children: React.ReactNode }) => {
  const didMockBootstrapRef = useRef(false);

  const { mySection, setMySection, myEntryId, setMyEntryId, myRole, setMyRole } = useIdentityState();
  const { darkMode, setDarkMode } = usePreferencesState();
  const {
    isSurveyActive, setSurveyActive,
    hasCompletedSurvey, setHasCompletedSurvey,
    questionnaireOpen, setQuestionnaireOpen,
    sectionOpen, setSectionOpen,
    cityPanelOpen, setCityPanelOpen,
    observerMode, setObserverMode,
    vizVisible, openGraph, closeGraph, setVizVisible,
    logsOpen, setLogsOpen,
    widgetsOpen, setWidgetsOpen,
    mode, setMode,
    radarMode, setRadarMode,
    spotlightRequest, setSpotlightRequest,
    animationVisible, setAnimationVisible,
    openPersonalized, setOpenPersonalized,
    questionnaireNav, setQuestionnaireNav,
    questionnaireAdvanceTick, requestQuestionnaireAdvance, resetQuestionnaireNav,
  } = useUiState();
  const {
    liveAvgState,
    setLiveAvg,
    allocAvgState,
    commitAllocAvg,
    reservedFootprintsState,
    setReservedFootprints,
    resetCanvasRuntimeState,
  } = useCanvasRuntimeState();
  const { section, setSection, counts, allRows, data, allFilteredRows, loading, subscribeToSurveyData } = useSurveyDataState({ mySection });

  // Sanity subscription starts once at the app boundary and writes into SurveyDataCtx.
  useEffect(() => {
    const unsub = subscribeToSurveyData();
    return () => { unsub(); };
  }, [subscribeToSurveyData]);

  // Mock bootstrap: restore session on reload.
  useEffect(() => {
    if (!USE_MOCK_SANITY || didMockBootstrapRef.current) return;
    didMockBootstrapRef.current = true;

    const mockSection = getSessionItem("be.mySection");
    const mockEntryId = getSessionItem("be.myEntryId");
    const mockRole = getSessionItem("be.myRole");

    if (!mockSection || !mockEntryId) return;

    setMySection(mockSection);
    setMyEntryId(mockEntryId);
    setMyRole(mockRole);
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time mock bootstrap, intentional
    setSection(mockSection);
    setSurveyActive(false);
    setHasCompletedSurvey(true);
    setObserverMode(false);
    openGraph();
  }, [
    setHasCompletedSurvey,
    setMyEntryId,
    setMyRole,
    setMySection,
    setObserverMode,
    setSection,
    setSurveyActive,
    openGraph,
  ]);

  const resetToStart = useCallback(() => {
    batched(() => {
      setVizVisible(false);
      setSurveyActive(false);
      setHasCompletedSurvey(false);
      setObserverMode(false);
      setMyEntryId(null);
      setMySection(null);
      setMyRole(null);
      setSection("all");
      setQuestionnaireOpen(false);
      setLogsOpen(false);
      setWidgetsOpen(false);
      resetCanvasRuntimeState();
    });

    removeSessionItems(["be.myEntryId", "be.mySection", "be.myRole", "be.myDoc"]);
    if (USE_MOCK_SANITY || shouldUseMockSanityReads()) clearMockSurveyState();
  }, [
    resetCanvasRuntimeState,
    setHasCompletedSurvey,
    setMyEntryId,
    setMyRole,
    setMySection,
    setObserverMode,
    setQuestionnaireOpen,
    setSection,
    setSurveyActive,
    setVizVisible,
    setLogsOpen,
    setWidgetsOpen,
  ]);

  const preferencesValue = useMemo<PreferencesState>(
    () => ({ darkMode, setDarkMode }),
    [darkMode, setDarkMode]
  );

  const uiValue = useMemo<UiState>(
    () => ({
      vizVisible, openGraph, closeGraph,
      isSurveyActive, setSurveyActive,
      hasCompletedSurvey, setHasCompletedSurvey,
      questionnaireOpen, setQuestionnaireOpen,
      sectionOpen, setSectionOpen,
      cityPanelOpen, setCityPanelOpen,
      observerMode, setObserverMode,
      animationVisible, setAnimationVisible,
      openPersonalized, setOpenPersonalized,
      resetToStart,
      radarMode, setRadarMode,
      logsOpen, setLogsOpen,
      widgetsOpen, setWidgetsOpen,
      mode, setMode,
      spotlightRequest, setSpotlightRequest,
      questionnaireNav, setQuestionnaireNav,
      questionnaireAdvanceTick, requestQuestionnaireAdvance, resetQuestionnaireNav,
    }),
    [
      vizVisible, openGraph, closeGraph,
      isSurveyActive, setSurveyActive,
      hasCompletedSurvey, setHasCompletedSurvey,
      questionnaireOpen, setQuestionnaireOpen,
      sectionOpen, setSectionOpen,
      cityPanelOpen, setCityPanelOpen,
      observerMode, setObserverMode,
      animationVisible, setAnimationVisible,
      openPersonalized, setOpenPersonalized,
      resetToStart,
      radarMode, setRadarMode,
      logsOpen, setLogsOpen,
      widgetsOpen, setWidgetsOpen,
      mode, setMode,
      spotlightRequest, setSpotlightRequest,
      questionnaireNav, setQuestionnaireNav,
      questionnaireAdvanceTick, requestQuestionnaireAdvance, resetQuestionnaireNav,
    ]
  );

  const canvasRuntimeValue = useMemo<CanvasRuntimeState>(
    () => ({
      liveAvg: liveAvgState,
      setLiveAvg,
      allocAvg: allocAvgState,
      commitAllocAvg,
      reservedFootprints: reservedFootprintsState,
      setReservedFootprints,
    }),
    [
      liveAvgState,
      setLiveAvg,
      allocAvgState,
      commitAllocAvg,
      reservedFootprintsState,
      setReservedFootprints,
    ]
  );

  const identityValue = useMemo<IdentityState>(
    () => ({ mySection, setMySection, myEntryId, setMyEntryId, myRole, setMyRole }),
    [mySection, setMySection, myEntryId, setMyEntryId, myRole, setMyRole]
  );

  const surveyDataValue = useMemo<SurveyDataState>(
    () => ({ section, setSection, counts, allRows, data, allFilteredRows, loading }),
    [section, setSection, counts, allRows, data, allFilteredRows, loading]
  );

  return (
    <PreferencesCtx.Provider value={preferencesValue}>
      <UiCtx.Provider value={uiValue}>
        <CanvasRuntimeCtx.Provider value={canvasRuntimeValue}>
          <IdentityCtx.Provider value={identityValue}>
            <SurveyDataCtx.Provider value={surveyDataValue}>
              {children}
            </SurveyDataCtx.Provider>
          </IdentityCtx.Provider>
        </CanvasRuntimeCtx.Provider>
      </UiCtx.Provider>
    </PreferencesCtx.Provider>
  );
};
