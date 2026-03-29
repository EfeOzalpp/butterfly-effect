// pages/Frontpage.tsx

import React, { useEffect, useState, Suspense } from "react";

import { AppProvider } from "../app/store";
import { useUiFlow } from "./state/ui-context";

import Survey from "../onboarding";
import Navigation from "../navigation/navigation";
import DataVisualization from "../graph-runtime";

import GamificationCopyPreloader from "../lib/hooks/useGamificationTextPreload";
import { usePreventPageZoomOutsideZones } from "../lib/hooks/usePreventPageZoom";
import { useMockBanner } from "./useMockBanner";
import ErrorBoundary from "./error-boundary";

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
  const { vizVisible, questionnaireOpen, cityPanelOpen, animationVisible } = useUiFlow();
  const { visible: bannerVisible, setDismissed, quotaResetMonth } = useMockBanner();


  // Global zoom prevention policy
  usePreventPageZoomOutsideZones({
    allowWithin: [
      ".graph-container",
      ".dot-graph-container",
      "#canvas-root",
      "#city-canvas-root",
    ],
  });

  // Idle prefetch of CanvasEntry while user is in the heavy viz
  useEffect(() => {
    if (typeof window === "undefined" || !vizVisible) return;
    const prefetch = () => { import("../canvas-instances/OnboardingEntry"); };
    if ("requestIdleCallback" in window) {
      window.requestIdleCallback(prefetch, { timeout: 1500 });
    } else {
      const t = setTimeout(prefetch, 0);
      return () => clearTimeout(t);
    }
  }, [vizVisible]);

  useEffect(() => {
    if (typeof document === "undefined") return;

    const prevHtmlOverflow = document.documentElement.style.overflow;
    const prevBodyOverflow = document.body.style.overflow;

    if (vizVisible) {
      document.documentElement.style.overflow = "hidden";
      document.body.style.overflow = "hidden";
    } else {
      document.documentElement.style.overflow = prevHtmlOverflow;
      document.body.style.overflow = prevBodyOverflow;
    }

    return () => {
      document.documentElement.style.overflow = prevHtmlOverflow;
      document.body.style.overflow = prevBodyOverflow;
    };
  }, [vizVisible]);

  return (
    <div className="app-content">
      {bannerVisible && (
        <div className="mock-read-banner" role="status" aria-live="polite">
          <span>{`API quota exceeded. Demo data until ${quotaResetMonth} 1.`}</span>
          <button
            type="button"
            className="mock-read-banner-close"
            aria-label="Dismiss demo data notice"
            onClick={() => setDismissed(true)}
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

      {vizVisible && (
        <Suspense fallback={null}>
          <EdgeCue />
        </Suspense>
      )}

      <DeferredGamificationPreloader />
      <Navigation />

      {!vizVisible && !animationVisible && !cityPanelOpen && !questionnaireOpen && (
        <div className="welcome-title-layer">
          <h1 className="welcome-title">Butterfly Effect</h1>
        </div>
      )}

      {!vizVisible && !animationVisible && !cityPanelOpen && (
        <ErrorBoundary name="CanvasEntry">
          <Suspense fallback={null}>
            <CanvasEntry visible={true} />
          </Suspense>
        </ErrorBoundary>
      )}

      {cityPanelOpen && questionnaireOpen && (
        <ErrorBoundary name="CityOverlay">
          <Suspense fallback={null}>
            <CityOverlay open={true} />
          </Suspense>
        </ErrorBoundary>
      )}

      {vizVisible && (
        <div className={`graph-wrapper ${vizVisible ? "visible" : ""}`}>
          <ErrorBoundary name="DataVisualization">
            <DataVisualization />
          </ErrorBoundary>
        </div>
      )}

      <div className={`user-flow${questionnaireOpen ? " questionnaire-active" : ""}${vizVisible ? " graph-active" : ""}`}>
        <ErrorBoundary name="Survey">
          <Survey />
        </ErrorBoundary>
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
