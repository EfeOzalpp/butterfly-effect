// src/app/app-provider.tsx
// Creates the app-wide state providers and handles cross-slice reset/bootstrap.

import React, { useCallback, useEffect, useMemo } from "react";
import { unstable_batchedUpdates as batched } from "react-dom";

import { getSessionItem, removeSessionItems } from "./session";

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
    personalPanelOpen, setPersonalPanelOpen,
    questionnaireNav, setQuestionnaireNav,
    questionnaireAdvanceTick, requestQuestionnaireAdvance, resetQuestionnaireNav,
    surveyResetKey, incrementSurveyResetKey,
  } = useUiState();
  const {
    hoveredShapeState,
    setHoveredShape,
    clickedShapeState,
    setClickedShape,
    liveAvgState,
    setLiveAvg,
    spotlightLiveAvgState,
    setSpotlightLiveAvg,
    reservedFootprintsState,
    setReservedFootprints,
    spotlightState,
    previousSpotlight,
    nextSpotlight,
    setSpotlightPaused,
    toggleSpotlightPaused,
    resetCanvasRuntimeState,
  } = useCanvasRuntimeState();
  const {
    section,
    setSection,
    sectionSelectionVersion,
    counts,
    allRows,
    data,
    allFilteredRows,
    loading,
    upsertLocalSurveyRow,
    subscribeToSurveyData,
  } = useSurveyDataState({ mySection });

  // Sanity subscription starts once at the app boundary and writes into SurveyDataCtx.
  useEffect(() => {
    const unsub = subscribeToSurveyData();
    return () => { unsub(); };
  }, [subscribeToSurveyData]);

  const resetToStart = useCallback(() => {
    const savedEntryId = getSessionItem("be.myEntryId");
    const savedSection = getSessionItem("be.mySection");
    const savedRole = getSessionItem("be.myRole");

    batched(() => {
      setVizVisible(false);
      setSurveyActive(false);
      setHasCompletedSurvey(false);
      setObserverMode(false);
      setMyEntryId(savedEntryId);
      setMySection(savedSection);
      setMyRole(savedRole);
      setSection(savedSection ?? "all");
      setQuestionnaireOpen(false);
      setSectionOpen(false);
      setCityPanelOpen(false);
      setLogsOpen(false);
      setWidgetsOpen(false);
      setAnimationVisible(false);
      setOpenPersonalized(false);
      setSpotlightRequest(null);
      resetCanvasRuntimeState();
      incrementSurveyResetKey();
    });

    removeSessionItems([
      "be.justSubmitted",
      "be.openPersonalOnNext",
    ]);
  }, [
    resetCanvasRuntimeState,
    setHasCompletedSurvey,
    setMyEntryId,
    setMyRole,
    setMySection,
    setObserverMode,
    setSectionOpen,
    setCityPanelOpen,
    setQuestionnaireOpen,
    setAnimationVisible,
    setOpenPersonalized,
    setSpotlightRequest,
    setSection,
    setSurveyActive,
    setVizVisible,
    setLogsOpen,
    setWidgetsOpen,
    incrementSurveyResetKey,
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
      personalPanelOpen, setPersonalPanelOpen,
      resetToStart,
      surveyResetKey,
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
      personalPanelOpen, setPersonalPanelOpen,
      resetToStart,
      surveyResetKey,
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
      hoveredShape: hoveredShapeState,
      setHoveredShape,
      clickedShape: clickedShapeState,
      setClickedShape,
      liveAvg: liveAvgState,
      setLiveAvg,
      spotlightLiveAvg: spotlightLiveAvgState,
      setSpotlightLiveAvg,
      reservedFootprints: reservedFootprintsState,
      setReservedFootprints,
      spotlight: spotlightState,
      previousSpotlight,
      nextSpotlight,
      setSpotlightPaused,
      toggleSpotlightPaused,
    }),
    [
      hoveredShapeState,
      setHoveredShape,
      clickedShapeState,
      setClickedShape,
      liveAvgState,
      setLiveAvg,
      spotlightLiveAvgState,
      setSpotlightLiveAvg,
      reservedFootprintsState,
      setReservedFootprints,
      spotlightState,
      previousSpotlight,
      nextSpotlight,
      setSpotlightPaused,
      toggleSpotlightPaused,
    ]
  );

  const identityValue = useMemo<IdentityState>(
    () => ({ mySection, setMySection, myEntryId, setMyEntryId, myRole, setMyRole }),
    [mySection, setMySection, myEntryId, setMyEntryId, myRole, setMyRole]
  );

  const surveyDataValue = useMemo<SurveyDataState>(
    () => ({
      section,
      setSection,
      sectionSelectionVersion,
      counts,
      allRows,
      data,
      allFilteredRows,
      loading,
      upsertLocalSurveyRow,
    }),
    [section, setSection, sectionSelectionVersion, counts, allRows, data, allFilteredRows, loading, upsertLocalSurveyRow]
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
