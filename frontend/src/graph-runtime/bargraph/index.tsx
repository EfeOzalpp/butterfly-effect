// ─────────────────────────────────────────────────────────────
// src/graph-runtime/bargraph/index.tsx
// BarGraph visualization (single-file, orchestrator-style)
// ─────────────────────────────────────────────────────────────

import React, { useEffect, useMemo, useRef, useState, useLayoutEffect } from 'react';

import { usePreferences } from "../../app/state/preferences-context";
import { useUiFlow } from "../../app/state/ui-context";
import { useIdentity } from "../../app/state/identity-context";
import { useSurveyData } from "../../app/state/survey-data-context";
import { avgWeightOf } from "../../lib/hooks/useRelativeScore";
import { useSharedGraphData } from "../GraphDataContext";

import EmptyStateArt from "./EmptyArt";


type BarColor = 'red' | 'yellow' | 'green';

type Categories = Record<BarColor, number>;

const orderedColors: BarColor[] = ['green', 'yellow', 'red'];

const percentValue = (value: number) => `${value.toFixed(4)}%`;

export default function BarGraph() {
  const { darkMode } = usePreferences();
  const { hasCompletedSurvey } = useUiFlow();
  const { myEntryId } = useIdentity();
  const { loading, section } = useSurveyData();

  const { safeData, dataById, getRelForId } = useSharedGraphData();

  const [animationState, setAnimationState] = useState(false);
  const [animateBars, setAnimateBars] = useState(false);

  const barRefs = useRef<Partial<Record<BarColor, HTMLDivElement | null>>>({});

  const includesMe = useMemo(
    () => Boolean(myEntryId && dataById.has(myEntryId)),
    [dataById, myEntryId]
  );

  const canShowYou = Boolean(hasCompletedSurvey && myEntryId && includesMe);

  useEffect(() => {
    const timeout = window.setTimeout(
      () => {
        setAnimateBars(!loading);
      },
      loading ? 0 : 10
    );

    return () => {
      window.clearTimeout(timeout);
    };
  }, [loading, safeData]);

  const categories: Categories = useMemo(() => {
    const out: Categories = { red: 0, yellow: 0, green: 0 };
    for (const item of safeData) {
      const score = Math.floor(avgWeightOf(item) * 100);
      if (score <= 50) out.red += 1;
      else if (score <= 66) out.yellow += 1;
      else out.green += 1;
    }
    return out;
  }, [safeData]);

  const totalCount = safeData.length;

  const rawYouPercentile = useMemo(() => (canShowYou && myEntryId ? getRelForId(myEntryId) : 0), [
    canShowYou,
    getRelForId,
    myEntryId,
  ]);

  // If you're the only respondent, show 100% instead of 0%
  const youPercentile = useMemo(
    () => (canShowYou && totalCount === 1 ? 100 : rawYouPercentile),
    [canShowYou, totalCount, rawYouPercentile]
  );

  const youAbsoluteBar: BarColor | null = useMemo(() => {
    if (!canShowYou) return null;
    const me = myEntryId ? dataById.get(myEntryId) : null;
    const score = me ? Math.round(avgWeightOf(me) * 100) : 0;
    if (score <= 33) return 'red';
    if (score <= 60) return 'yellow';
    return 'green';
  }, [canShowYou, dataById, myEntryId]);

  const maxItems = Math.max(categories.green, categories.yellow, categories.red) + 15;

  const [normalizeDivisor, setNormalizeDivisor] = useState(100 / 78);

  useEffect(() => {
    const mqSmall = window.matchMedia('(max-width: 768px)');
    const mqMedium = window.matchMedia('(min-width: 769px) and (max-width: 1024px)');

    const apply = () => {
      if (mqSmall.matches) setNormalizeDivisor(100 / 71);
      else if (mqMedium.matches) setNormalizeDivisor(100 / 80);
      else setNormalizeDivisor(100 / 78);
    };

    apply();

    const listeners = [mqSmall, mqMedium] as const;

    listeners.forEach((mq) => {
      mq.addEventListener('change', apply);
    });
    window.addEventListener('resize', apply);

    return () => {
      listeners.forEach((mq) => {
        mq.removeEventListener('change', apply);
      });
      window.removeEventListener('resize', apply);
    };
  }, []);

  useLayoutEffect(() => {
    orderedColors.forEach((color) => {
      const ref = barRefs.current[color];
      if (!ref) return;

      if (!canShowYou) {
        ref.style.setProperty('--user-percentage', '0%');
        return;
      }

      const parentH = Math.max(1, ref.parentElement?.offsetHeight ?? 0);
      const heightPercentage = (ref.offsetHeight / parentH) * 100;
      const raw = (youPercentile / 100) * heightPercentage;
      const normalized = raw / normalizeDivisor;

      ref.style.setProperty('--user-percentage', percentValue(normalized));
    });
  }, [youPercentile, animateBars, canShowYou, normalizeDivisor]);

  useEffect(() => {
    if (animationState) return;
    const timeout = window.setTimeout(() => {
      setAnimationState(true);
    }, 200);

    return () => {
      window.clearTimeout(timeout);
    };
  }, [animationState]);

  if (!section) return <p className="graph-loading">Pick a section to begin.</p>;
  if (loading) return null;

  const noData = safeData.length === 0;
  if (noData) {
    return (
      <div className="empty-center">
        <div className={`empty-card ${darkMode ? 'is-dark' : 'is-light'}`}>
          <EmptyStateArt className="empty-icon floaty" />
          <h4>Nothing yet...</h4>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="bar-graph-container">
        {orderedColors.map((color) => {
          const count = categories[color];
          const heightPercentage = (count / maxItems) * 100;

          const showMarkerInThisBar = canShowYou && youAbsoluteBar === color;

          const userPercentage = (youPercentile / 100) * heightPercentage;
          const normalizedUserPercentage = userPercentage / normalizeDivisor;

          // Drive label color from context.darkMode (no edge-cue dependency)
          const labelColor = darkMode ? 'rgba(249, 249, 249, 0.85)' : 'rgba(0,0,0,0.85)';

          return (
            <div
              className="bar-graph-bar"
              key={color}
              ref={(el) => {
                barRefs.current[color] = el;
              }}
            >
              <span
                className="bar-graph-label"
                style={{
                  color: labelColor,
                  transition: 'color 200ms ease',
                }}
              >
                <p>{count} People</p>
              </span>

              <div className="bar-graph-divider">
                {showMarkerInThisBar && (
                  <div
                    className="percentage-section"
                    style={{
                      height:
                        animationState && animateBars
                          ? percentValue(Math.min(normalizedUserPercentage, heightPercentage))
                          : '0%',
                    }}
                  >
                    <div className="percentage-line" aria-hidden="true" />
                    <div className="percentage-indicator">
                      <p className="percentage-indicator-title">You</p>
                      <p className="percentage-indicator-score">{youPercentile}%</p>
                    </div>
                  </div>
                )}

                <div
                  className={`bar-graph-fill ${color}-animation`}
                  style={{ height: animateBars ? percentValue(heightPercentage) : '0%' }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
