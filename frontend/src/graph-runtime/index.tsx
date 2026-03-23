// src/graph-runtime/VisualizationPage.tsx
// Graph page: loads DotGraph only; auxiliary panels live in navigation widgets
import React, { Suspense, useMemo } from 'react';

import { useSurveyData } from "../app/state/survey-data-context";
import { GraphDataProvider } from "./GraphDataContext";

import "../styles/graph.css";

const Graph = React.lazy(() =>
  import(/* webpackChunkName: "graph" */ "./dotgraph/index")
);

export default function VisualizationPage() {
  const { data } = useSurveyData();

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
          height: '100vh',
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
    <GraphDataProvider data={data}>
      <Suspense fallback={pageLoadingFallback}>
        <Graph isDragging={false} />
      </Suspense>
    </GraphDataProvider>
  );
}
