// src/app/main.tsx

import React, { Suspense } from "react";

import { AppProvider } from "./app-provider";
import ClientOnly from "./client-only"; // wrapper to exclude certain files from server-side rendering.
import { useUiFlow } from "./state/ui-context";

import Survey from "../onboarding"; // survey is included in server-side.
import Navigation from "../navigation/navigation"; // navigation is included in server-side. 

// gated via ClientOnly
import DataVisualization from "../graph-runtime";
import CanvasEntry from "../canvas-instances/OnboardingEntry";
import CityOverlay from "../canvas-instances/CityEntry";

import {
  AppBrowserPolicies,
  DeferredGraphPreloader,
  DeferredGamificationPreloader,
  DuplicateSurveyBanner,
  MockReadBanner,
  RateLimitBanner,
} from "./app-effects";
import ErrorBoundary from "./error-boundary";

import "../styles/fonts.css";
import "../styles/global-styles.css";
import "../styles/ui-system.css";

const QuestionnaireEntry = React.lazy(() => import("../canvas-instances/QuestionnaireEntry"));
const GraphBGDark = React.lazy(() => import("../navigation/right/system-color"));
const AppInner: React.FC = () => {
  const { vizVisible, questionnaireOpen, cityPanelOpen, animationVisible } = useUiFlow();

  return (
    <main id="main-content" className="app-content">
      <ClientOnly>
        <AppBrowserPolicies questionnaireOpen={questionnaireOpen} vizVisible={vizVisible} />
        <MockReadBanner />
        <RateLimitBanner />
        <DuplicateSurveyBanner />
        <DeferredGraphPreloader />
        <DeferredGamificationPreloader />
      </ClientOnly>

      {vizVisible && (
        <ClientOnly>
          <Suspense fallback={null}>
            <GraphBGDark />
          </Suspense>
        </ClientOnly>
      )}

      <Navigation />

      {!vizVisible && !animationVisible && !cityPanelOpen && !questionnaireOpen && (
        <div className="welcome-title-layer">
          <h1 className="welcome-title">Butterfly Effect</h1>
        </div>
      )}

      {!vizVisible && !animationVisible && !cityPanelOpen && !questionnaireOpen && (
        <ClientOnly>
          <ErrorBoundary name="CanvasEntry">
            <CanvasEntry visible={true} />
          </ErrorBoundary>
        </ClientOnly>
      )}

      {!vizVisible && !animationVisible && !cityPanelOpen && questionnaireOpen && (
        <ClientOnly>
          <ErrorBoundary name="QuestionnaireEntry">
            <Suspense fallback={null}>
              <QuestionnaireEntry visible={true} />
            </Suspense>
          </ErrorBoundary>
        </ClientOnly>
      )}

      {cityPanelOpen && (
        <ClientOnly>
          <ErrorBoundary name="CityOverlay">
            <CityOverlay open={true} />
          </ErrorBoundary>
        </ClientOnly>
      )}

      {vizVisible && (
        <ClientOnly>
          <div className="graph-wrapper visible">
            <ErrorBoundary name="DataVisualization">
              <DataVisualization />
            </ErrorBoundary>
          </div>
        </ClientOnly>
      )}

      <div className={`user-flow${questionnaireOpen ? " questionnaire-active" : ""}${vizVisible ? " graph-active" : ""}`}>
        <ErrorBoundary name="Survey">
          <Survey />
        </ErrorBoundary>
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
