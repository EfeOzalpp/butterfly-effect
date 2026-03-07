// DotGraph scene composition + interaction wiring

import React, { useMemo, useEffect, useRef, useState, useCallback } from 'react';

import { useAppState } from "../../app/appState";

import { useRealMobileViewport } from "../../lib/hooks/useRealMobileViewport";
import { sampleStops, rgbString } from "../../lib/utils/color-and-interpolation";
import { useRelativeScores, avgWeightOf } from "../../lib/hooks/useRelativeScore";
import { useAbsoluteScore } from "../../lib/hooks/useAbsoluteScore";

// DotGraph internals (feature-owned) — use public surface
import { useOrbitController } from "./event-handlers";
import useDotPoints from "./hooks/useDotPoints";
import useHoverBubble from "./hooks/useHoverBubble";
import useObserverDelay from "./hooks/useObserverDelay";

import { getTieStats, classifyPosition } from "../gamification/rankLogic";

import {
  prewarmSpriteTextures,
  useTextureQueueProgress,
} from "../sprites/entry";

import { nonlinearLerp, boostColor } from "./utils/colorBoost";
import useObserverSpotlight from "./hooks/useObserverSpotlight";
import useViewerScope from "./hooks/useViewerScope";
import {
  buildRankChainIds,
  buildTieBuckets,
  getHoveredRelativeIds,
  getSelectedTieLinePoints,
  getTieKeyForId,
} from "./utils/tieGraph";
import TopOverlays from "./components/TopOverlays";
import PointsLayer from "./components/PointsLayer";
import PersonalizedLayer from "./components/PersonalizedLayer";
import HoveredLayer from "./components/HoveredLayer";


// Minimal props typing (tighten later)
type DotGraphProps = {
  isDragging?: boolean;
  data?: any[];
};

const BLEED_FRAC: Record<string, { top: number; right: number; bottom: number; left: number }> = {
  trees: { top: 0.28, right: 0.0, bottom: 0.0, left: 0.0 },
  clouds: { top: 0, right: 0, bottom: 0, left: 0 },
  bus: { top: 0, right: 0, bottom: 0, left: 0 },
  snow: { top: 0, right: 0, bottom: 0, left: 0 },
  house: { top: 0, right: 0, bottom: 0, left: 0 },
  power: { top: 0, right: 0, bottom: 0, left: 0 },
  sun: { top: 0, right: 0, bottom: 0, left: 0 },
  villa: { top: 0, right: 0, bottom: 0, left: 0 },
  car: { top: 0, right: 0, bottom: 0, left: 0 },
  sea: { top: 0, right: 0, bottom: 0, left: 0 },
  carFactory: { top: 0, right: 0, bottom: 0, left: 0 },
};

const loaderCardStyle: React.CSSProperties = {
  pointerEvents: 'none',
  backdropFilter: 'blur(6px)',
  WebkitBackdropFilter: 'blur(6px)',
  color: 'gray',
  borderRadius: 6,
  padding: '24px 16px',
  letterSpacing: '0.2px',
  whiteSpace: 'nowrap',
};

export default function DotGraph({ isDragging = false, data = [] }: DotGraphProps) {
  const { myEntryId, mySection, observerMode, mode, section } = useAppState() as any;

  const safeData: any[] = Array.isArray(data) ? data : [];
  const showCompleteUI = useObserverDelay(observerMode, 2000);

  const personalizedEntryId: string | null =
    myEntryId || (typeof window !== 'undefined' ? sessionStorage.getItem('gp.myEntryId') : null);

  const [personalOpen, setPersonalOpen] = useState(true);

  const width = typeof window !== 'undefined' ? window.innerWidth : 1024;
  const isRealMobile = useRealMobileViewport();
  const isSmallScreen = width < 768;
  const isTabletLike = width >= 768 && width <= 1024;
  const useDesktopLayout = !(isSmallScreen || isRealMobile || isTabletLike);

  const hasPersonalizedInDataset = useMemo(
    () => !!personalizedEntryId && safeData.some((d) => d?._id === personalizedEntryId),
    [personalizedEntryId, safeData]
  );

  // ───────────────────────────────────────────────────────────
  // First-render safe identity + strict role derivation
  // ───────────────────────────────────────────────────────────
  const { shouldShowPersonalized } = useViewerScope({
    mySection,
    section,
  });

  // Only skew under 768px and when we're actually showing the personalized card here
  const wantsSkew =
    isSmallScreen &&
    !observerMode &&
    hasPersonalizedInDataset &&
    personalOpen &&
    shouldShowPersonalized;

  const {
    groupRef,
    radius,
    isPinchingRef,
    isTouchRotatingRef,
    minRadius,
    maxRadius,
    tooltipOffsetPx,
  } = useOrbitController({
    isDragging,
    layout: {
      useDesktopLayout,
      isSmallScreen,
      isTabletLike,
      xOffset: 0,
      yOffset: 0,
      xOffsetPx: wantsSkew ? -112 : 0,
      yOffsetPx: wantsSkew ? 12 : 0,
    },
    bounds: { minRadius: isSmallScreen ? 2 : 20, maxRadius: 800 },
    dataCount: safeData.length,
  } as any);

  // adaptive spread
  const spread = useMemo(() => {
    const n = safeData.length;
    const MIN_SPREAD = 28;
    const MAX_SPREAD = 220;
    const REF_N = 50;
    const CURVE = 0.5;
    const t = n <= 1 ? 0 : Math.min(1, Math.pow(n / REF_N, CURVE));
    return MIN_SPREAD + (MAX_SPREAD - MIN_SPREAD) * t;
  }, [safeData.length]);

  const colorForAverage = useMemo(
    () => (avg: number) => boostColor(rgbString(sampleStops(avg))),
    []
  );

  const points: any[] = useDotPoints(safeData, {
    spread,
    minDistance: 2.1,
    seed: 1337,
    relaxPasses: 1,
    relaxStrength: 0.25,
    centerBias: 0.35,
    colorForAverage,
    personalizedEntryId,
    showPersonalized: showCompleteUI && hasPersonalizedInDataset && shouldShowPersonalized,
  } as any);

  /* ---------- PREWARM textures once based on rendered order ---------- */
  useEffect(() => {
    if (!points || !points.length) return;
    const items = points.map((p, i) => ({
      avg: Number.isFinite(p?.averageWeight) ? p.averageWeight : 0.5,
      orderIndex: i,
      seed: 'dotgraph-bag-v1',
    }));
    prewarmSpriteTextures(items, { tileSize: 128, alpha: 215, blend: 0.6 } as any);
  }, [points]);

  // maps & helpers
  const posById = useMemo(() => new Map(points.map((p) => [p._id, p.position])), [points]);

  const myPoint = useMemo(
    () => points.find((p) => p?._id === personalizedEntryId),
    [points, personalizedEntryId]
  );

  const myEntry = useMemo(
    () => safeData.find((e) => e?._id === personalizedEntryId),
    [safeData, personalizedEntryId]
  );

  // ---- Fallbacks for umbrella views
  const mySnapshot = useMemo(() => {
    if (myEntry || typeof window === 'undefined') return null;
    try {
      const raw = sessionStorage.getItem('gp.myDoc');
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }, [myEntry]);

  const effectiveMyEntry = myEntry || mySnapshot;

  const fallbackColor = useMemo(() => {
    const avg = Number((effectiveMyEntry as any)?.avgWeight);
    if (!Number.isFinite(avg)) return '#ffffff';
    return rgbString(sampleStops(avg));
  }, [effectiveMyEntry]);

  const effectiveMyPoint =
    myPoint ||
    (effectiveMyEntry ? { position: [0, 0, 0], color: fallbackColor } : null);

  // ---- Metrics (relative vs absolute) ----
  const { getForId: getRelForId, getForValue: getRelForValue } = useRelativeScores(safeData);
  const { getForId: getAbsForId, getForValue: getAbsForValue } = useAbsoluteScore(safeData, {
    decimals: 0,
  } as any);

  const myDisplayValue = useMemo(() => {
    if (!(showCompleteUI && effectiveMyEntry)) return 0;

    if (myEntry) {
      return mode === 'relative' ? getRelForId(myEntry._id) : getAbsForId(myEntry._id);
    }

    const avg = Number((effectiveMyEntry as any)?.avgWeight);
    if (!Number.isFinite(avg)) return 0;

    try {
      return mode === 'relative' ? Math.round(getRelForValue(avg)) : Math.round(getAbsForValue(avg));
    } catch {
      return 0;
    }
  }, [
    showCompleteUI,
    effectiveMyEntry,
    myEntry,
    mode,
    getRelForId,
    getAbsForId,
    getRelForValue,
    getAbsForValue,
  ]);

  const calcValueForAvg = useCallback(
    (averageWeight: number) => {
      try {
        return mode === 'relative' ? getRelForValue(averageWeight) : getAbsForValue(averageWeight);
      } catch {
        return 0;
      }
    },
    [mode, getRelForValue, getAbsForValue]
  );

  const absScoreById = useMemo(() => {
    const m = new Map<string, number>();
    for (const d of safeData) m.set(d._id, getAbsForId(d._id));
    return m;
  }, [safeData, getAbsForId]);

  // hover tooltips
  const { hoveredDot, viewportClass, onHoverStart, onHoverEnd } = useHoverBubble({
    useDesktopLayout,
    isDragging,
    isPinchingRef,
    isTouchRotatingRef,
    calcPercentForAvg: calcValueForAvg,
  } as any);

  // spotlight system (extracted)
  const { spotlightActiveRef } = useObserverSpotlight({
    points,
    onHoverStart: onHoverStart as any,
    onHoverEnd: onHoverEnd as any,
  });

  // ───────────────────────────────────────────────────────────
  // On mode/section/data change: clear hover/tie (guarded by spotlight)
  // ───────────────────────────────────────────────────────────
  const [selectedTieKey, setSelectedTieKey] = useState<number | null>(null);

  useEffect(() => {
    if (spotlightActiveRef.current) return;
    onHoverEnd(); // stop hover on mode change, keep tie line
    // intentionally NOT clearing selected tie on mode change (per your comment)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode]);

  useEffect(() => {
    if (spotlightActiveRef.current) return;
    onHoverEnd();
    setSelectedTieKey(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [section]);

  useEffect(() => {
    if (spotlightActiveRef.current) return;
    onHoverEnd();
    setSelectedTieKey(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [safeData.length]);

  // ========= Shared key for buckets/rank-chain: rounded RAW % (avg*100) =========
  const linkKeyOf = useCallback((d: any) => Math.round(avgWeightOf(d) * 100), []);

  // global bottom→top chain, de-dup by linkKeyOf
  const rankChainIds = useMemo(() => {
    if (points.length < 2) return [];
    return buildRankChainIds(safeData, linkKeyOf, avgWeightOf);
  }, [points, safeData, linkKeyOf]);

  const rankChainIdSet = useMemo(() => new Set(rankChainIds), [rankChainIds]);

  // ============================ LINKING by ROUNDED RAW AVG ============================
  const tieBuckets = useMemo(
    () => buildTieBuckets(safeData, linkKeyOf),
    [safeData, linkKeyOf]
  );

  const selectedTieLinePoints = useMemo(
    () => getSelectedTieLinePoints(selectedTieKey, tieBuckets, posById),
    [selectedTieKey, tieBuckets, posById]
  );

  const tieKeyForId = useCallback(
    (id: string): number | null =>
      getTieKeyForId(id, safeData, tieBuckets, linkKeyOf),
    [safeData, tieBuckets, linkKeyOf]
  );

  const hoveredRelIds = useMemo(() => {
    if (mode !== 'relative' || !hoveredDot) return [];
    return getHoveredRelativeIds(hoveredDot.dotId, safeData, tieBuckets, linkKeyOf);
  }, [mode, hoveredDot, safeData, tieBuckets, linkKeyOf]);

  const hoveredAbsEqualSet = useMemo(() => {
    if (mode !== 'absolute' || !hoveredDot) return new Set<string>();
    const score = absScoreById.get(hoveredDot.dotId);
    if (score == null) return new Set<string>();
    const ids = safeData
      .filter((d) => absScoreById.get(d._id) === score)
      .map((d) => d._id);
    return new Set<string>(ids);
  }, [mode, hoveredDot, absScoreById, safeData]);

  const mobileRotDismissRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    const onRot = (e: any) => {
      const source = (e && e.detail && e.detail.source) || undefined;
      if (useDesktopLayout) return;
      if (source !== 'touch') return;
      if (mobileRotDismissRef.current) clearTimeout(mobileRotDismissRef.current);
      mobileRotDismissRef.current = setTimeout(() => {
        onHoverEnd();
        mobileRotDismissRef.current = null;
      }, 2000);
    };

    window.addEventListener('gp:orbit-rot', onRot as any);
    return () => {
      window.removeEventListener('gp:orbit-rot', onRot as any);
      if (mobileRotDismissRef.current) {
        clearTimeout(mobileRotDismissRef.current);
        mobileRotDismissRef.current = null;
      }
    };
  }, [useDesktopLayout, onHoverEnd]);

  const isPortrait =
    typeof window !== 'undefined' ? window.innerHeight > window.innerWidth : false;

  const offsetBase = isPortrait ? 160 : 120;

  const offsetPx = Number.isFinite(tooltipOffsetPx)
    ? tooltipOffsetPx
    : nonlinearLerp(
        offsetBase,
        offsetBase * 1.35,
        Math.max(0, Math.min(1, (radius - minRadius) / (maxRadius - minRadius)))
      );

  const myStats =
    effectiveMyEntry && myEntry
      ? getTieStats({ data: safeData, targetId: myEntry._id })
      : { below: 0, equal: 0, above: 0, totalOthers: 0 };

  const myClass = classifyPosition(myStats);

  // ------------------------- DYNAMIC SPRITE SCALE -------------------------
  const spriteScale = useMemo(() => {
    const denom = Math.max(1e-6, maxRadius - minRadius);
    const t = Math.max(0, Math.min(1, (radius - minRadius) / denom));
    const SCALE_MIN = 7;
    const SCALE_MAX = 12;
    return nonlinearLerp(SCALE_MAX, SCALE_MIN, t);
  }, [radius, minRadius, maxRadius]);

  const bleedOf = (shapeKey: string) =>
    BLEED_FRAC[shapeKey] || { top: 0, right: 0, bottom: 0, left: 0 };

  // ---------------------- DUPLICATE-RENDER GUARDS ------------------------
  const shouldRenderPersonalUI =
    showCompleteUI && shouldShowPersonalized && !!effectiveMyPoint && !!effectiveMyEntry;

  const shouldRenderExtraPersonalSprite = shouldRenderPersonalUI && !hasPersonalizedInDataset;

  // ====== SHUFFLE-BAG SEED ======
  const bagSeed = 'dotgraph-bag-v1';

  // queue progress → small top-center indicator
  const { isBusy, pending } = useTextureQueueProgress();

  // Open the personalized panel exactly when the UI is ready (one-shot)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const wantOpen = sessionStorage.getItem('gp.openPersonalOnNext') === '1';
    if (!wantOpen) return;
    if (!shouldRenderPersonalUI) return;
    try {
      window.dispatchEvent(new CustomEvent('gp:open-personalized'));
    } finally {
      sessionStorage.removeItem('gp.openPersonalOnNext');
    }
  }, [shouldRenderPersonalUI]);

  return (
    <>
      <TopOverlays
        showCompleteUI={showCompleteUI}
        isBusy={isBusy}
        pending={pending}
        loaderCardStyle={loaderCardStyle}
      />

      <group ref={groupRef as any}>
        <PointsLayer
          points={points}
          mode={mode}
          myEntry={myEntry}
          personalizedEntryId={personalizedEntryId}
          showCompleteUI={showCompleteUI}
          onHoverStart={onHoverStart}
          onHoverEnd={onHoverEnd}
          tieKeyForId={tieKeyForId}
          setSelectedTieKey={setSelectedTieKey}
          selectedTieKey={selectedTieKey}
          selectedTieLinePoints={selectedTieLinePoints}
          hoveredAbsEqualSet={hoveredAbsEqualSet}
          hoveredRelIds={hoveredRelIds}
          rankChainIdSet={rankChainIdSet}
          spriteScale={spriteScale}
          bagSeed={bagSeed}
          bleedOf={bleedOf}
        />

        <PersonalizedLayer
          shouldRenderPersonalUI={shouldRenderPersonalUI}
          shouldRenderExtraPersonalSprite={shouldRenderExtraPersonalSprite}
          effectiveMyPoint={effectiveMyPoint}
          effectiveMyEntry={effectiveMyEntry}
          spriteScale={spriteScale}
          bagSeed={bagSeed}
          offsetPx={offsetPx}
          myDisplayValue={myDisplayValue}
          mode={mode}
          section={section}
          myStats={myStats}
          myClass={myClass}
          setPersonalOpen={setPersonalOpen}
        />

        <HoveredLayer
          hoveredDot={hoveredDot}
          points={points}
          safeData={safeData}
          mode={mode}
          offsetPx={offsetPx}
          viewportClass={viewportClass}
          calcValueForAvg={calcValueForAvg}
          getRelForId={getRelForId}
          absScoreById={absScoreById}
        />
      </group>
    </>
  );
}
