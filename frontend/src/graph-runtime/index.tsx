// src/graph-runtime/VisualizationPage.tsx
// Graph page: loads DotGraph only; auxiliary panels live in navigation widgets
import React, { Suspense, useMemo, useRef } from 'react';

import { useSurveyData } from "../app/state/survey-data-context";
import { useIdentity } from "../app/state/identity-context";
import { getSessionItem } from "../app/session";
import { GraphDataProvider } from "./GraphDataContext";
import {
  allowPersonalInSection,
  deriveRoleFromSectionId,
} from "./dotgraph/scope/scoping";
import { useRealMobileViewport } from "../lib/hooks/useRealMobileViewport";
import type { SurveyRow } from "../services/sanity/types";

import "../styles/graph.css";

const Graph = React.lazy(() =>
  import(/* webpackChunkName: "graph" */ "./dotgraph/index")
);

const MAX_GRAPH_SPRITES = 300;
const MOBILE_DATA_LIMIT = 150;

function readPersonalSnapshot(entryId: string | null): SurveyRow | null {
  if (!entryId) return null;

  try {
    const raw = getSessionItem("be.myDoc");
    if (!raw) return null;
    const parsed = JSON.parse(raw) as SurveyRow;
    return parsed?._id === entryId ? parsed : null;
  } catch {
    return null;
  }
}

function includePersonalRow(
  rows: SurveyRow[],
  limit: number,
  personalRow: SurveyRow | null
): SurveyRow[] {
  const capped = rows.slice(0, limit);
  if (!personalRow?._id || capped.some((row) => row._id === personalRow._id)) {
    return capped;
  }

  const fromFilteredRows = rows.find((row) => row._id === personalRow._id);
  const reservedRow = fromFilteredRows ?? personalRow;
  return [reservedRow, ...capped.filter((row) => row._id !== reservedRow._id)].slice(0, limit);
}

function useStableVisibleRows(
  rows: SurveyRow[],
  limit: number,
  scopeKey: string
): SurveyRow[] {
  const previousRef = useRef<{
    scopeKey: string;
    rows: SurveyRow[];
    knownIds: Set<string>;
  } | null>(null);

  return useMemo(() => {
    const previous = previousRef.current;
    const nextKnownIds = new Set(rows.map((row) => row._id).filter(Boolean) as string[]);
    if (!previous || previous.scopeKey !== scopeKey) {
      const initial = rows.slice(0, limit);
      previousRef.current = { scopeKey, rows: initial, knownIds: nextKnownIds };
      return initial;
    }

    const latestById = new Map(rows.map((row) => [row._id, row]));
    const stillVisible: SurveyRow[] = [];

    for (const row of previous.rows) {
      if (!row._id) continue;
      const latest = latestById.get(row._id);
      if (latest) stillVisible.push(latest);
    }

    const incoming = rows.filter((row) => row._id && !previous.knownIds.has(row._id));
    const keepCount = Math.max(0, limit - incoming.length);
    const next = [...stillVisible.slice(0, keepCount), ...incoming].slice(0, limit);

    previousRef.current = { scopeKey, rows: next, knownIds: nextKnownIds };
    return next;
  }, [limit, rows, scopeKey]);
}

export default function VisualizationPage() {
  const { allFilteredRows, section } = useSurveyData();
  const { myEntryId, mySection } = useIdentity();
  const isRealMobile = useRealMobileViewport();
  const dataLimit = isRealMobile ? Math.min(MOBILE_DATA_LIMIT, MAX_GRAPH_SPRITES) : MAX_GRAPH_SPRITES;
  const personalEntryId = myEntryId ?? getSessionItem("be.myEntryId");
  const effectiveMySection = mySection ?? getSessionItem("be.mySection") ?? "";
  const personalRow = useMemo(() => {
    if (!personalEntryId) return null;
    return allFilteredRows.find((row) => row._id === personalEntryId)
      ?? readPersonalSnapshot(personalEntryId);
  }, [allFilteredRows, personalEntryId]);
  const scopedPersonalRow = useMemo(() => {
    if (!personalRow) return null;
    const role = deriveRoleFromSectionId(effectiveMySection);
    return allowPersonalInSection(role, effectiveMySection, section) ? personalRow : null;
  }, [effectiveMySection, personalRow, section]);
  const stableVisibleRows = useStableVisibleRows(allFilteredRows, dataLimit, section);
  const cappedData = useMemo(
    () => includePersonalRow(stableVisibleRows, dataLimit, scopedPersonalRow),
    [stableVisibleRows, dataLimit, scopedPersonalRow]
  );

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
          minHeight: '100dvh',
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
