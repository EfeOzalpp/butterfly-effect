// pages/Frontpage.tsx

import React, { useEffect, useState, Suspense } from "react";

import { AppProvider, useAppState } from "../app/store";

import Survey from "../onboarding";
import Navigation from "../navigation/navigation";
import DataVisualization from "../graph-runtime";

import GamificationCopyPreloader from "../lib/hooks/useGamificationTextPreload";
import { usePreventPageZoomOutsideZones } from "../lib/hooks/usePreventPageZoom";
import { useMockSanityReadMode } from "../services/sanity/config";

import "../styles/fonts.css";
import "../styles/global-styles.css";
import "../styles/ui-system.css";

const CanvasEntry = React.lazy(() => import("../canvas-instances/OnboardingEntry"));
const CityOverlay = React.lazy(() => import("../canvas-instances/CityEntry"));
const EdgeCue = React.lazy(() => import("../navigation/right/system-color"));

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
  const [animationVisible, setAnimationVisible] = useState<boolean>(false);
  const [surveyWrapperClass, setSurveyWrapperClass] = useState<string>("");
  const [dismissedMockBanner, setDismissedMockBanner] = useState<boolean>(false);

  const { vizVisible, questionnaireOpen, cityPanelOpen, liveAvg, allocAvg, condAvgs } = useAppState();
  const mockReadMode = useMockSanityReadMode();
  const quotaResetMonth = React.useMemo(() => {
    const now = new Date();
    const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    return nextMonth.toLocaleString(undefined, { month: "long" });
  }, []);

  useEffect(() => {
    if (!mockReadMode.runtimeFallback) {
      setDismissedMockBanner(false);
    }
  }, [mockReadMode.runtimeFallback]);

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
      import("../canvas-instances/OnboardingEntry");
    };

    if ("requestIdleCallback" in window) {
      window.requestIdleCallback(prefetch, { timeout: 1500 });
    } else {
      const t = setTimeout(prefetch, 0);
      return () => clearTimeout(t);
    }
  }, [vizVisible]);


  return (
    <div className="app-content">
      {mockReadMode.runtimeFallback && !mockReadMode.forced && !dismissedMockBanner && (
        <div className="mock-read-banner" role="status" aria-live="polite">
          <span>{`API quota exceeded. Demo data until ${quotaResetMonth} 1.`}</span>
          <button
            type="button"
            className="mock-read-banner-close"
            aria-label="Dismiss demo data notice"
            onClick={() => setDismissedMockBanner(true)}
          >
            <svg
              width="100%"
              height="100%"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
              focusable="false"
            >
              <path
                d="M17 7L7 17M7 7L17 17"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
      )}

      {/* HUD mounts only when viz is visible */}
      {vizVisible && (
        <Suspense fallback={null}>
          <EdgeCue />
        </Suspense>
      )}

      <DeferredGamificationPreloader />
      <Navigation />


      {/* Intro canvas mounts only when viz is NOT visible and overlays are not blocking */}
      {!vizVisible && !animationVisible && !cityPanelOpen && (
        <Suspense fallback={null}>
          <CanvasEntry
            liveAvg={liveAvg}
            allocAvg={allocAvg}
            questionnaireOpen={questionnaireOpen}
            condAvgs={condAvgs}
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

      <div className={`user-flow${questionnaireOpen ? ' questionnaire-active' : ''} ${surveyWrapperClass}`}>
        <Survey
          setAnimationVisible={setAnimationVisible}
          setSurveyWrapperClass={setSurveyWrapperClass}
        />
      </div>


      <div className="radial-background">
        <div className="radial-gradient"></div>
      </div>
    </div>
  );
};

const AppShell: React.FC = () => (
  <AppProvider>
    <AppInner />
  </AppProvider>
);

export default AppShell;
