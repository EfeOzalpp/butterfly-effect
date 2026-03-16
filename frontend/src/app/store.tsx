import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";

import { unstable_batchedUpdates as batched } from "react-dom";
import type { AppState } from "./types";
import {
  getSessionItem,
  removeSessionItems,
} from "./session";
import { USE_MOCK_SANITY } from "../services/sanity/config";
import { clearMockSurveyState } from "../services/sanity/mockData";
import useIdentityState from "./state/useIdentityState";
import usePreferencesState from "./state/usePreferencesState";
import useUiState from "./state/useUiState";
import useGraphRuntimeState from "./state/useGraphRuntimeState";
import useSurveyDataState from "./state/useSurveyDataState";
import useSectionCounts from "../lib/hooks/useSectionCounts";
export type { AppState, Mode } from "./types";

const AppCtx = createContext<AppState | null>(null);
export { DEFAULT_AVG } from "./state/useGraphRuntimeState";

export const AppProvider = ({ children }: { children: React.ReactNode }) => {
  const didMockBootstrapRef = useRef(false);
  const [section, setSection] = useState<string>("all");
  const {
    mySection,
    setMySection,
    myEntryId,
    setMyEntryId,
    myRole,
    setMyRole,
  } = useIdentityState();
  const {
    mode,
    setMode,
    darkMode,
    setDarkMode,
    navPanelOpen,
    setNavPanelOpen,
    navVisible,
    setNavVisible,
    radarMode,
    setRadarMode,
  } = usePreferencesState();
  const {
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
  } = useUiState();
  const {
    liveAvgState,
    setLiveAvg,
    allocAvgState,
    commitAllocAvg,
    condAvgsState,
    setCondAvgs,
    resetGraphRuntimeState,
  } = useGraphRuntimeState();
  const { counts } = useSectionCounts();
  const { data, loading, subscribeToSurveyData } = useSurveyDataState({
    mySection,
    setSection,
    counts,
  });

  useEffect(() => {
    const unsub = subscribeToSurveyData(section);
    return () => unsub();
  }, [section, subscribeToSurveyData]);

  useEffect(() => {
    if (!USE_MOCK_SANITY || didMockBootstrapRef.current) return;
    didMockBootstrapRef.current = true;

    const mockSection = getSessionItem("gp.mySection");
    const mockEntryId = getSessionItem("gp.myEntryId");
    const mockRole = getSessionItem("gp.myRole");

    if (!mockSection || !mockEntryId) return;

    setMySection(mockSection);
    setMyEntryId(mockEntryId);
    setMyRole(mockRole);
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
      setSurveyActive(true);
      setHasCompletedSurvey(false);
      setObserverMode(false);
      setMyEntryId(null);
      setMySection(null);
      setMyRole(null);
      setSection("all");
      setQuestionnaireOpen(false);

      resetGraphRuntimeState();
    });

    removeSessionItems(["gp.myEntryId", "gp.mySection", "gp.myRole", "gp.myDoc"]);
    if (USE_MOCK_SANITY) clearMockSurveyState();
  }, [
    resetGraphRuntimeState,
    setHasCompletedSurvey,
    setMyEntryId,
    setMyRole,
    setMySection,
    setObserverMode,
    setQuestionnaireOpen,
    setSection,
    setSurveyActive,
    setVizVisible,
  ]);

  const value = useMemo<AppState>(
    () => ({
      section,
      setSection,
      mySection,
      setMySection,
      myEntryId,
      setMyEntryId,
      myRole,
      setMyRole,
      counts,
      data,
      loading,
      isSurveyActive,
      setSurveyActive,
      hasCompletedSurvey,
      setHasCompletedSurvey,
      questionnaireOpen,
      setQuestionnaireOpen,
      cityPanelOpen,
      setCityPanelOpen,
      sectionOpen,
      setSectionOpen,
      observerMode,
      setObserverMode,
      vizVisible,
      openGraph,
      closeGraph,
      mode,
      setMode,
      darkMode,
      setDarkMode,
      navPanelOpen,
      setNavPanelOpen,
      navVisible,
      setNavVisible,
      liveAvg: liveAvgState,
      setLiveAvg,
      condAvgs: condAvgsState,
      setCondAvgs,
      allocAvg: allocAvgState,
      commitAllocAvg,
      radarMode,
      setRadarMode,
      resetToStart,
    }),
    // Stable setter refs (useState/useCallback) are intentionally omitted —
    // they never change identity and don't affect memoization correctness.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      section, mySection, myEntryId, myRole,
      counts, data, loading,
      isSurveyActive, hasCompletedSurvey,
      questionnaireOpen, cityPanelOpen, sectionOpen, observerMode, vizVisible,
      mode, darkMode, navPanelOpen, navVisible,
      liveAvgState, condAvgsState, allocAvgState, radarMode,
      resetToStart,
    ]
  );

  return <AppCtx.Provider value={value}>{children}</AppCtx.Provider>;
};

export const useAppState = () => {
  const ctx = useContext(AppCtx);
  if (!ctx) {
    throw new Error("useAppState must be used within an AppProvider");
  }
  return ctx;
};

export const useOptionalAppState = () => useContext(AppCtx);
