import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { unstable_batchedUpdates as batched } from "react-dom";

import { getSessionItem, removeSessionItems } from "./session";
import { USE_MOCK_SANITY, shouldUseMockSanityReads } from "../services/sanity/config";
import { clearMockSurveyState } from "../services/sanity/mockData";

import useIdentityState from "./state/useIdentityState";
import usePreferencesState from "./state/usePreferencesState";
import useUiState from "./state/useUiState";
import useCanvasRuntimeState from "./state/useCanvasRuntimeState";
import useSurveyDataState from "./state/useSurveyDataState";

import { PreferencesCtx } from "./state/preferences-context";
import type { PreferencesState } from "./state/preferences-context";
import { UiCtx } from "./state/ui-context";
import type { UiState } from "./state/ui-context";
import { CanvasRuntimeCtx } from "./state/canvas-runtime-context";
import type { CanvasRuntimeState } from "./state/canvas-runtime-context";
import { IdentityCtx } from "./state/identity-context";
import type { IdentityState } from "./state/identity-context";
import { SurveyDataCtx } from "./state/survey-data-context";
import type { SurveyDataState } from "./state/survey-data-context";
import { InteractionCtx } from "./state/interaction-context";
import type { InteractionState } from "./state/interaction-context";

export { DEFAULT_AVG } from "./state/useCanvasRuntimeState";
export type { Mode } from "./types";

export const AppProvider = ({ children }: { children: React.ReactNode }) => {
  const didMockBootstrapRef = useRef(false);

  // --- state slices ---
  const [section, setSection] = useState<string>("all");
  const [openPersonalized, setOpenPersonalized] = useState(false);
  const [animationVisible, setAnimationVisible] = useState(false);
  const [spotlightRequest, setSpotlightRequest] = useState<{ durationMs: number; fakeMouseXRatio: number; fakeMouseYRatio: number } | null>(null);

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
    questionnaireNav, setQuestionnaireNav,
    questionnaireAdvanceTick, requestQuestionnaireAdvance, resetQuestionnaireNav,
  } = useUiState();

  const {
    liveAvgState,
    setLiveAvg,
    allocAvgState,
    commitAllocAvg,
    condAvgsState,
    setCondAvgs,
    reservedFootprintsState,
    setReservedFootprints,
    resetCanvasRuntimeState,
  } = useCanvasRuntimeState();

  const { counts, allRows, data, allFilteredRows, loading, subscribeToSurveyData } = useSurveyDataState({ section, mySection, setSection });

  useEffect(() => {
    const unsub = subscribeToSurveyData();
    return () => unsub();
  }, [subscribeToSurveyData]);

  // Mock bootstrap: restore session on reload
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
    setSection(mockSection);
    setSurveyActive(false);
    setHasCompletedSurvey(true);
    setObserverMode(false);
    openGraph();
  }, [setHasCompletedSurvey, setMyEntryId, setMyRole, setMySection, setObserverMode, setSection, setSurveyActive, openGraph]);

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
  ]);

  // --- per-context memos (only state values in deps, setters are stable) ---
  const preferencesValue = useMemo<PreferencesState>(
    () => ({ darkMode, setDarkMode }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [darkMode]
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
      logsOpen, setLogsOpen,
      widgetsOpen, setWidgetsOpen,
      mode, setMode,
      radarMode, setRadarMode,
      questionnaireNav, setQuestionnaireNav,
      questionnaireAdvanceTick, requestQuestionnaireAdvance, resetQuestionnaireNav,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [vizVisible, isSurveyActive, hasCompletedSurvey, questionnaireOpen, sectionOpen, cityPanelOpen, observerMode, animationVisible, openPersonalized, resetToStart, logsOpen, widgetsOpen, mode, radarMode, questionnaireNav, questionnaireAdvanceTick]
  );

  const canvasRuntimeValue = useMemo<CanvasRuntimeState>(
    () => ({
      liveAvg: liveAvgState,
      setLiveAvg,
      allocAvg: allocAvgState,
      commitAllocAvg,
      condAvgs: condAvgsState,
      setCondAvgs,
      reservedFootprints: reservedFootprintsState,
      setReservedFootprints,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [liveAvgState, allocAvgState, condAvgsState, reservedFootprintsState]
  );

  const identityValue = useMemo<IdentityState>(
    () => ({ mySection, setMySection, myEntryId, setMyEntryId, myRole, setMyRole }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [mySection, myEntryId, myRole]
  );

  const surveyDataValue = useMemo<SurveyDataState>(
    () => ({ section, setSection, counts, allRows, data, allFilteredRows, loading }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [section, counts, allRows, data, allFilteredRows, loading]
  );

  const interactionValue = useMemo<InteractionState>(
    () => ({ spotlightRequest, setSpotlightRequest }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [spotlightRequest]
  );

  return (
    <PreferencesCtx.Provider value={preferencesValue}>
      <UiCtx.Provider value={uiValue}>
        <CanvasRuntimeCtx.Provider value={canvasRuntimeValue}>
          <IdentityCtx.Provider value={identityValue}>
            <SurveyDataCtx.Provider value={surveyDataValue}>
              <InteractionCtx.Provider value={interactionValue}>
                {children}
              </InteractionCtx.Provider>
            </SurveyDataCtx.Provider>
          </IdentityCtx.Provider>
        </CanvasRuntimeCtx.Provider>
      </UiCtx.Provider>
    </PreferencesCtx.Provider>
  );
};
