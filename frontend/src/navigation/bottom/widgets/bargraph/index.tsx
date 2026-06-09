// ─────────────────────────────────────────────────────────────
// ─────────────────────────────────────────────────────────────

import { useCallback, useEffect, useMemo, useRef, useState, useLayoutEffect } from 'react';

import { usePreferences } from "../../../../app/state/preferences-context";
import { useUiFlow } from "../../../../app/state/ui-context";
import { useIdentity } from "../../../../app/state/identity-context";
import { useSurveyData } from "../../../../app/state/survey-data-context";
import { useWindowWidth } from "../../../../lib/hooks/useWindowWidth";
import { viewportBandForWidth } from "../../../../lib/responsive/breakpoints";
import { useRelativeScores } from "../../../../lib/hooks/useRelativeScore";
import { avgWeightOf } from "../../../../lib/utils/score";
import { CHOOSE_STAFF, CHOOSE_STUDENT, GO_BACK, useGraphPickerData, titleFromId } from "../../../gp-data";
import WidgetSectionNav from "../widget-section-nav";

import EmptyStateArt from "./EmptyArt";

function ordinalSuffix(n: number): string {
  const mod100 = Math.abs(n) % 100;
  if (mod100 >= 11 && mod100 <= 13) return `${String(n)}th`;
  switch (Math.abs(n) % 10) {
    case 1: return `${String(n)}st`;
    case 2: return `${String(n)}nd`;
    case 3: return `${String(n)}rd`;
    default: return `${String(n)}th`;
  }
}

type BarColor = 'red' | 'yellow' | 'green';

type Categories = Record<BarColor, number>;

interface BarGraphProps {
  navOutsidePanel?: boolean;
  panelClassName?: string;
  paused?: boolean;
  onPausedChange?: (paused: boolean) => void;
}

const orderedColors: BarColor[] = ['green', 'yellow', 'red'];

const percentValue = (value: number) => `${value.toFixed(4)}%`;
const AUTOPLAY_MS = 5000;

export default function BarGraph({
  navOutsidePanel = false,
  panelClassName,
  paused,
  onPausedChange,
}: BarGraphProps = {}) {
  const { darkMode } = usePreferences();
  const { hasCompletedSurvey } = useUiFlow();
  const { myEntryId } = useIdentity();
  const { allRows, loading, section, sectionSelectionVersion } = useSurveyData();
  const windowWidth = useWindowWidth();

  const { ALL_LABELS, MAIN_OPTS, STUDENT_OPTS, STAFF_OPTS, counts } = useGraphPickerData(section);

  const [animationState, setAnimationState] = useState(false);
  const [animateBars, setAnimateBars] = useState(false);
  const [internalPaused, setInternalPaused] = useState(true);
  const [localSectionState, setLocalSectionState] = useState({
    sourceSection: section,
    sourceSelectionVersion: sectionSelectionVersion,
    value: section,
  });

  const barRefs = useRef<Partial<Record<BarColor, HTMLDivElement | null>>>({});

  const localSection =
    localSectionState.sourceSection === section &&
    localSectionState.sourceSelectionVersion === sectionSelectionVersion
      ? localSectionState.value
      : section;

  const effectivePaused = paused ?? internalPaused;

  const setEffectivePaused = useCallback((nextPaused: boolean) => {
    if (paused === undefined) setInternalPaused(nextPaused);
    onPausedChange?.(nextPaused);
  }, [onPausedChange, paused]);

  const setLocalSection = useCallback((value: string) => {
    setLocalSectionState({ sourceSection: section, sourceSelectionVersion: sectionSelectionVersion, value });
  }, [section, sectionSelectionVersion]);

  const cycleSections = useMemo(() => {
    const ordered = [...MAIN_OPTS, ...STUDENT_OPTS, ...STAFF_OPTS]
      .filter((opt) => opt.id !== GO_BACK && opt.id !== CHOOSE_STUDENT && opt.id !== CHOOSE_STAFF)
      .filter((opt, index, arr) => arr.findIndex((item) => item.id === opt.id) === index)
      .filter((opt) => (counts[opt.id] ?? 0) > 0 || opt.id === localSection);

    if (!ordered.length && localSection) {
      return [{ id: localSection, label: ALL_LABELS.get(localSection) ?? titleFromId(localSection) }];
    }

    return ordered;
  }, [ALL_LABELS, MAIN_OPTS, STAFF_OPTS, STUDENT_OPTS, counts, localSection]);

  const safeData = useMemo(() => {
    if (!localSection || localSection === "all") return allRows;
    if (localSection === "all-massart") {
      const allowed = new Set([...STUDENT_OPTS.map((opt) => opt.id), ...STAFF_OPTS.map((opt) => opt.id)]);
      return allRows.filter((row) => allowed.has(row.section));
    }
    if (localSection === "all-students") {
      const allowed = new Set(STUDENT_OPTS.map((opt) => opt.id));
      return allRows.filter((row) => allowed.has(row.section));
    }
    if (localSection === "all-staff") {
      const allowed = new Set(STAFF_OPTS.map((opt) => opt.id));
      return allRows.filter((row) => allowed.has(row.section));
    }
    return allRows.filter((row) => row.section === localSection);
  }, [STUDENT_OPTS, STAFF_OPTS, allRows, localSection]);

  const dataById = useMemo(() => {
    const map = new Map<string, (typeof safeData)[number]>();
    for (const item of safeData) {
      if (item._id) map.set(item._id, item);
    }
    return map;
  }, [safeData]);

  const { getForId: getRelForId } = useRelativeScores(safeData);

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

  const currentIndex = cycleSections.findIndex((item) => item.id === localSection);
  const matchedSection = cycleSections.find((item) => item.id === localSection);
  const sectionLabel =
    matchedSection?.label ??
    ALL_LABELS.get(localSection) ??
    (localSection ? titleFromId(localSection) : "Everyone");

  const stepSection = (delta: number) => {
    if (!cycleSections.length) return;
    const nextIndex = currentIndex >= 0
      ? (currentIndex + delta + cycleSections.length) % cycleSections.length
      : 0;
    setLocalSection(cycleSections[nextIndex].id);
  };

  useEffect(() => {
    if (effectivePaused || cycleSections.length <= 1) return;
    const timer = window.setInterval(() => {
      const activeIndex = cycleSections.findIndex((item) => item.id === localSection);
      const nextIndex = activeIndex >= 0 ? (activeIndex + 1) % cycleSections.length : 0;
      setLocalSection(cycleSections[nextIndex].id);
    }, AUTOPLAY_MS);
    return () => { window.clearInterval(timer); };
  }, [cycleSections, effectivePaused, localSection, setLocalSection]);

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

  const youRank = useMemo(() => {
    if (!canShowYou || totalCount === 0) return null;
    if (totalCount === 1) return 1;
    return Math.max(1, Math.min(totalCount, Math.round((1 - youPercentile / 100) * (totalCount - 1)) + 1));
  }, [canShowYou, youPercentile, totalCount]);

  const youAbsoluteBar: BarColor | null = useMemo(() => {
    if (!canShowYou) return null;
    const me = myEntryId ? dataById.get(myEntryId) : null;
    const score = me ? Math.round(avgWeightOf(me) * 100) : 0;
    if (score <= 33) return 'red';
    if (score <= 60) return 'yellow';
    return 'green';
  }, [canShowYou, dataById, myEntryId]);

  const normalizeDivisor = useMemo(() => {
    const band = viewportBandForWidth(windowWidth);
    if (band === "mobile") return 100 / 71;
    if (band === "tablet") return 100 / 80;
    return 100 / 78;
  }, [windowWidth]);

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

  const sectionNav = (
    <WidgetSectionNav
      title={sectionLabel}
      paused={effectivePaused}
      className="bar-graph-nav"
      onPrevious={() => { stepSection(-1); }}
      onNext={() => { stepSection(1); }}
      onTogglePaused={() => { setEffectivePaused(!effectivePaused); }}
    />
  );

  const noData = safeData.length === 0;
  if (noData) {
    const emptyBody = (
      <div className="empty-center">
        <div className={`empty-card ${darkMode ? 'is-dark' : 'is-light'}`}>
          <EmptyStateArt className="empty-icon floaty" />
          <h4>Nothing yet...</h4>
        </div>
      </div>
    );

    if (navOutsidePanel) {
      return (
        <>
          {sectionNav}
          <div className={panelClassName}>
            {emptyBody}
          </div>
        </>
      );
    }

    return (
      <>
        {sectionNav}
        {emptyBody}
      </>
    );
  }

  const graphBody = (
    <>
      <div className="bar-graph-container">
        {orderedColors.map((color) => {
          const count = categories[color];
          const heightPercentage = count > 0 ? (count / totalCount) * 100 : 0;

          const showMarkerInThisBar = canShowYou && youAbsoluteBar === color;

          const userPercentage = (youPercentile / 100) * heightPercentage;
          const normalizedUserPercentage = userPercentage / normalizeDivisor;

          return (
            <div
              className="bar-graph-bar"
              key={color}
              ref={(el) => {
                barRefs.current[color] = el;
              }}
            >
              <span className="bar-graph-label">
                <p>{count === 0 ? '-' : count === 1 ? '1 Person' : `${String(count)} People`}</p>
              </span>

              <div className="bar-graph-divider">
                {showMarkerInThisBar && animationState && animateBars && (
                  <div
                    className="percentage-section"
                    style={{ height: percentValue(Math.min(normalizedUserPercentage, heightPercentage)) }}
                  >
                    <div className="percentage-line" aria-hidden="true" />
                    <div className="percentage-indicator">
                      <p className="percentage-indicator-title">You're</p>
                      <p className="percentage-indicator-score">
                        {youRank === totalCount ? 'Last' : ordinalSuffix(youRank ?? 1)}
                      </p>
                    </div>
                  </div>
                )}

                {count > 0 && (
                  <div
                    className={`bar-graph-fill ${color}-animation`}
                    style={{ height: animateBars ? percentValue(heightPercentage) : '0%' }}
                  />
                )}
              </div>
            </div>
          );
        })}
      </div>
      {canShowYou && (
        <h4 className={`bar-graph-percentile-caption${animationState && animateBars ? '' : ' caption-invisible'}`}>
          Among <strong>{sectionLabel}</strong>, you are the {ordinalSuffix(youPercentile)} percentile.
        </h4>
      )}
    </>
  );

  if (navOutsidePanel) {
    return (
      <>
        {sectionNav}
        <div className={panelClassName}>
          {graphBody}
        </div>
      </>
    );
  }

  return (
    <>
      {sectionNav}
      {graphBody}
    </>
  );
}
