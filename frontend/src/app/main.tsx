// src/app/main.tsx

import React, { Suspense } from "react";

import { AppProvider } from "./app-provider";
import { useUiFlow } from "./state/ui-context";

import Survey from "../onboarding";
import Navigation from "../navigation/navigation";
import DataVisualization from "../graph-runtime";

import {
  AppBrowserPolicies,
  DeferredGamificationPreloader,
  MockReadBanner,
} from "./app-effects";
import ErrorBoundary from "./error-boundary";

import "../styles/fonts.css";
import "../styles/global-styles.css";
import "../styles/ui-system.css";

const CanvasEntry = React.lazy(() => import("../canvas-instances/OnboardingEntry"));
const CityOverlay = React.lazy(() => import("../canvas-instances/CityEntry"));
const GraphBGDark = React.lazy(() => import("../navigation/right/system-color"));

const AppInner: React.FC = () => {
  const { vizVisible, questionnaireOpen, cityPanelOpen, animationVisible } = useUiFlow();

  return (
    <main id="main-content" className="app-content">
      <AppBrowserPolicies questionnaireOpen={questionnaireOpen} vizVisible={vizVisible} />
      <MockReadBanner />

      {vizVisible && (
        <Suspense fallback={null}>
          <GraphBGDark />
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
        <div className="graph-wrapper visible">
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
    </main>
  );
};

const AppShell: React.FC = () => (
  <AppProvider>
    <AppInner />
  </AppProvider>
);

export default AppShell;
