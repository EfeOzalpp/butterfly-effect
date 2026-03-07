import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

import { unstable_batchedUpdates as batched } from "react-dom";
import { subscribeSurveyData } from "../services/sanity/api";
import useSectionCounts from "../lib/hooks/useSectionCounts";
import type { AppState, CondAvgs, Mode } from "./types";
import {
  applyThemeToDocument,
  getSessionItem,
  readStoredDarkMode,
  readStoredMode,
  removeSessionItems,
  setSessionItem,
} from "./session";
export type { AppState, Mode } from "./types";

const AppCtx = createContext<AppState | null>(null);

// Single baseline used everywhere
export const DEFAULT_AVG = 0.5;

function normalizeAvg(avg: unknown) {
  return typeof avg === "number" && Number.isFinite(avg) ? avg : DEFAULT_AVG;
}

export const AppProvider = ({ children }: { children: React.ReactNode }) => {
  const [section, setSection] = useState<string>("all");
  const [mySection, setMySection] = useState<string | null>(() => getSessionItem("gp.mySection"));
  const [myEntryId, setMyEntryId] = useState<string | null>(() => getSessionItem("gp.myEntryId"));
  const [myRole, setMyRole] = useState<string | null>(() => getSessionItem("gp.myRole"));

  const { counts } = useSectionCounts();

  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const [isSurveyActive, setSurveyActive] = useState<boolean>(false);
  const [hasCompletedSurvey, setHasCompletedSurvey] = useState<boolean>(false);

  const [questionnaireOpen, setQuestionnaireOpen] = useState<boolean>(false);
  const [sectionOpen, setSectionOpen] = useState<boolean>(false);

  const [observerMode, setObserverMode] = useState<boolean>(false);
  const [vizVisible, setVizVisible] = useState<boolean>(false);
  const openGraph = () => setVizVisible(true);
  const closeGraph = () => setVizVisible(false);

  const [mode, setMode] = useState<Mode>(() => readStoredMode("relative"));
  useEffect(() => {
    setSessionItem("gp.mode", mode);
  }, [mode]);

  const [darkMode, setDarkMode] = useState<boolean>(() => readStoredDarkMode(false));
  useEffect(() => {
    setSessionItem("gp.darkMode", String(darkMode));
    applyThemeToDocument(darkMode);
  }, [darkMode]);

  const [navPanelOpen, setNavPanelOpen] = useState<boolean>(false);
  const [navVisible, setNavVisible] = useState<boolean>(true);

  // Two averages on purpose:
  // - liveAvg: continuous updates for visuals
  // - allocAvg: commit-only updates for layout/allocation
  const [liveAvgState, _setLiveAvgState] = useState<number>(DEFAULT_AVG);
  const [allocAvgState, _setAllocAvgState] = useState<number>(DEFAULT_AVG);
  const [condAvgsState, _setCondAvgsState] = useState<CondAvgs>({});

  const setLiveAvg = (avg?: number) => {
    _setLiveAvgState(normalizeAvg(avg));
  };

  const setCondAvgs = (next: CondAvgs) => {
    _setCondAvgsState((prev) => {
      const changed = (["A", "B", "C", "D"] as const).some((k) => prev[k] !== next[k]);
      return changed ? next : prev;
    });
  };

  const commitAllocAvg = (avg?: number) => {
    _setAllocAvgState(normalizeAvg(avg));
  };

  useEffect(() => {
    setLoading(true);
    const unsub = subscribeSurveyData({
      section,
      onData: (rows: any[]) => {
        setData(rows);
        setLoading(false);
      },
    });
    return () => unsub();
  }, [section]);

  useEffect(() => {
    const onIdentityUpdated = () => {
      try {
        setMyEntryId(getSessionItem("gp.myEntryId"));
        setMySection(getSessionItem("gp.mySection"));
        setMyRole(getSessionItem("gp.myRole"));
      } catch {}
    };

    window.addEventListener("gp:identity-updated", onIdentityUpdated);
    window.addEventListener("storage", onIdentityUpdated);

    return () => {
      window.removeEventListener("gp:identity-updated", onIdentityUpdated);
      window.removeEventListener("storage", onIdentityUpdated);
    };
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const justSubmitted = getSessionItem("gp.justSubmitted") === "1";
    if (!justSubmitted) return;
    if (!counts) return;

    const effectiveMySection = mySection || getSessionItem("gp.mySection") || "";
    if (!effectiveMySection) return;

    if (effectiveMySection === "visitor") {
      sessionStorage.removeItem("gp.justSubmitted");
      return;
    }

    const n = counts[effectiveMySection] ?? 0;
    const SMALL_SECTION_THRESHOLD = 5;
    if (n < SMALL_SECTION_THRESHOLD) {
      setSection("all-massart");
      try {
        setSessionItem("gp.openPersonalOnNext", "1");
      } catch {}
    }

    sessionStorage.removeItem("gp.justSubmitted");
  }, [counts, mySection]);

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

      // reset averages too
      _setLiveAvgState(DEFAULT_AVG);
      _setAllocAvgState(DEFAULT_AVG);
      _setCondAvgsState({});
    });

    removeSessionItems(["gp.myEntryId", "gp.mySection", "gp.myRole", "gp.myDoc"]);
  }, []);

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
      data,
      loading,
      isSurveyActive,
      setSurveyActive,
      hasCompletedSurvey,
      setHasCompletedSurvey,
      questionnaireOpen,
      setQuestionnaireOpen,
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
      resetToStart,
    }),
    [
      section,
      mySection,
      myEntryId,
      myRole,
      data,
      loading,
      isSurveyActive,
      hasCompletedSurvey,
      questionnaireOpen,
      sectionOpen,
      observerMode,
      vizVisible,
      mode,
      darkMode,
      navPanelOpen,
      navVisible,
      liveAvgState,
      condAvgsState,
      allocAvgState,
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
