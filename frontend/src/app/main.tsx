// pages/Frontpage.tsx

import React, { useEffect, useState, Suspense } from "react";

import { AppProvider, useAppState } from "../app/appState";

import Survey from "../weighted-survey/Survey";
import Navigation from "../navigation/Navigation";
import CityButton from "../navigation/CityButton";
import DataVisualization from "../graph-runtime";

import { useDynamicMargin } from "../lib/hooks/useDynamicMargin";
import GamificationCopyPreloader from "../lib/hooks/useGamificationTextPreload";
import { usePreventPageZoomOutsideZones } from "../lib/hooks/usePreventPageZoom";

import RadialBackground from "../navigation/visual/radialBackground";

import "../assets/styles/global-styles.css";

const CanvasEntry = React.lazy(() => import("../weighted-survey/CanvasEntry"));
const CityOverlay = React.lazy(() => import("../navigation/CityOverlay"));
const EdgeCue = React.lazy(() => import("../navigation/DarkMode"));
const ModeToggle = React.lazy(() => import("../navigation/nav-bottom/ModeToggle"));

function DeferredGamificationPreloader() {
  const [start, setStart] = useState<boolean>(false);

  useEffect(() => {
    const cb = () => setStart(true);
    if (typeof window !== "undefined" && "requestIdleCallback" in window) {
      window.requestIdleCallback(cb, { timeout: 1500 });
    } else {
      setTimeout(cb, 0);
    }
  }, []);

  return start ? <GamificationCopyPreloader /> : null;
}

const AppInner: React.FC = () => {
  useDynamicMargin();

  const [animationVisible, setAnimationVisible] = useState<boolean>(false);
  const [surveyWrapperClass, setSurveyWrapperClass] = useState<string>("");
  const [cityPanelOpen, setCityPanelOpen] = useState<boolean>(false);

  const { vizVisible, questionnaireOpen, liveAvg, allocAvg } = useAppState();

  // Global zoom prevention policy
  usePreventPageZoomOutsideZones({
    allowWithin: [
      ".graph-container",
      ".dot-graph-container",
      "#canvas-root",
      "#city-canvas-root",
    ],
  });

  // Optional: idle prefetch of CanvasEntry while user is in the heavy viz
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!vizVisible) return;

    const prefetch = () => {
      import("../weighted-survey/CanvasEntry");
    };

    if ("requestIdleCallback" in window) {
      window.requestIdleCallback(prefetch, { timeout: 1500 });
    } else {
      const t = setTimeout(prefetch, 0);
      return () => clearTimeout(t);
    }
  }, [vizVisible]);

  // Keep city overlay closed if questionnaire closes
  useEffect(() => {
    if (!questionnaireOpen && cityPanelOpen) setCityPanelOpen(false);
  }, [questionnaireOpen, cityPanelOpen]);

  return (
    <div className="app-content">
      {/* HUD mounts only when viz is visible */}
      {vizVisible && (
        <Suspense fallback={null}>
          <EdgeCue />
        </Suspense>
      )}

      <DeferredGamificationPreloader />
      <Navigation />

      {/* City button appears only while questionnaire is open */}
      {questionnaireOpen && (
        <CityButton
          isOpen={cityPanelOpen}
          onToggle={() => setCityPanelOpen((o) => !o)}
          shown
        />
      )}

      {/* Intro canvas mounts only when viz is NOT visible and overlays are not blocking */}
      {!vizVisible && !animationVisible && !cityPanelOpen && (
        <Suspense fallback={null}>
          <CanvasEntry
            liveAvg={liveAvg}
            allocAvg={allocAvg}
            questionnaireOpen={questionnaireOpen}
            visible={true}
          />
        </Suspense>
      )}

      {/* City overlay canvas mounts only when button is open AND questionnaire is open */}
      {cityPanelOpen && questionnaireOpen && (
        <Suspense fallback={null}>
          <CityOverlay open={true} liveAvg={liveAvg} />
        </Suspense>
      )}

      {/* Heavy viz mounts only when vizVisible */}
      {vizVisible && (
        <div className={`graph-wrapper ${vizVisible ? "visible" : ""}`}>
          <DataVisualization />
        </div>
      )}

      <div className={`survey-section-wrapper3 ${surveyWrapperClass}`}>
        <Survey
          setAnimationVisible={setAnimationVisible}
          setSurveyWrapperClass={setSurveyWrapperClass}
        />
      </div>

      {/* Mode toggle is only meaningful when viz is mounted */}
      {vizVisible && (
        <Suspense fallback={null}>
          <ModeToggle />
        </Suspense>
      )}

      <RadialBackground />
    </div>
  );
};

const AppShell: React.FC = () => (
  <AppProvider>
    <AppInner />
  </AppProvider>
);

export default AppShell;
