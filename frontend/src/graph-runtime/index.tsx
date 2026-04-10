// src/graph-runtime/VisualizationPage.tsx
// Graph page: loads DotGraph only; auxiliary panels live in navigation widgets
import React, { Suspense, useMemo } from 'react';

import { useSurveyData } from "../app/state/survey-data-context";
import { GraphDataProvider } from "./GraphDataContext";
import { useRealMobileViewport } from "../lib/hooks/useRealMobileViewport";

import "../styles/graph.css";

const Graph = React.lazy(() =>
  import(/* webpackChunkName: "graph" */ "./dotgraph/index")
);

const MOBILE_DATA_LIMIT = 150;

export default function VisualizationPage() {
  const { data } = useSurveyData();
  const isRealMobile = useRealMobileViewport();
  const cappedData = isRealMobile ? data.slice(0, MOBILE_DATA_LIMIT) : data;

  const pageLoadingFallback = useMemo(
    () => (
      <div
        style={{
          position: 'fixed',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 5,
          pointerEvents: 'none',
          height: '100dvh',
          top: '-16px',
          background: 'var(--ui-bg-page)'
        }}
        aria-busy="true"
        aria-live="polite"
      >
        <h4 style={{ opacity: 0.85 }}>Loading...</h4>
      </div>
    ),
    []
  );

  return (
    <GraphDataProvider data={cappedData}>
      <Suspense fallback={pageLoadingFallback}>
        <Graph />
      </Suspense>
    </GraphDataProvider>
  );
}
