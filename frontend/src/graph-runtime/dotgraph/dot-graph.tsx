// src/graph-runtime/dotgraph/dot-graph.tsx

// Composition root for DotGraph data, hover state, personalization, and rendered layers.

import { useCallback, useEffect, useLayoutEffect, useMemo } from 'react';

import { usePreferences } from '../../app/state/preferences-context';
import { useUiFlow } from '../../app/state/ui-context';
import { useIdentity } from '../../app/state/identity-context';
import { useSurveyData } from '../../app/state/survey-data-context';
import { useSharedGraphData } from '../GraphDataContext';
import { bumpGeneration, resetQueue } from '../sprites/entry';
import { DEFAULT_VIEWPORT_WIDTH, isMobileWidth } from '../../lib/responsive/breakpoints';

import useHoverBubble from './interaction/useHoverBubble';
import useHoverDismissal from './interaction/useHoverDismissal';
import useObserverDelay from './interaction/useObserverDelay';
import useObserverSpotlight from './interaction/useObserverSpotlight';
import ShapesLayer from './components/ShapesLayer';
import PersonalizedLayer from './components/PersonalizedLayer';
import HoveredLayer from './components/GeneralizedLayer';
import usePersonalizationGate from './scene/usePersonalizationGate';
import useDotGraphSceneState from './scene/useDotGraphSceneState';
import usePersonalizationState from './scene/usePersonalizationState';

export default function DotGraph() {
  const { darkMode } = usePreferences();
  const { observerMode, mode, setPersonalPanelOpen } = useUiFlow();
  const { myEntryId, mySection } = useIdentity();
  const { section, data: fullSurveyData, loading } = useSurveyData();

  const {
    safeData,
    dataById,
    getRelForId,
    getRelForValue,
    getAbsForId,
    getAbsForValue,
    absScoreById: absScoreByIdMap,
  } = useSharedGraphData();

  const datasetKey = useMemo(
    () => [
      section,
      safeData.length,
      safeData[0]?._id ?? '',
      safeData[safeData.length - 1]?._id ?? '',
    ].join('|'),
    [section, safeData]
  );

  const showCompleteUI = useObserverDelay(observerMode, 2000);

  const personalizationGate = usePersonalizationGate({
    myEntryId,
    mySection,
    section,
    safeData,
    observerMode,
    isSmallScreen: isMobileWidth(typeof window === 'undefined' ? DEFAULT_VIEWPORT_WIDTH : window.innerWidth),
  });

  useEffect(() => {
    setPersonalPanelOpen(personalizationGate.personalOpen);
  }, [personalizationGate.personalOpen, setPersonalPanelOpen]);

  const scene = useDotGraphSceneState({
    safeData,
    personalizedEntryId: personalizationGate.personalizedEntryId,
    sectionKey: section,
    showPersonalized:
      personalizationGate.hasPersonalizedInDataset &&
      personalizationGate.shouldShowPersonalized,
    darkMode,
    wantsSkew: personalizationGate.wantsSkew,
    wantsSoloSkew: mode === 'absolute' && personalizationGate.wantsSkew,
    zoomResetKey: datasetKey,
  });
  // Pull the scene contract out of the hook result so layer props stay explicit.
  const {
    groupRef,
    shapes,
    useDesktopLayout,
    isPinchingRef,
    isTouchRotatingRef,
    spriteScale,
    bagSeed,
    isRealMobile,
    isTabletLike,
    particleFrames,
    tileSize,
    radius,
    minRadius,
    maxRadius,
    zoomTargetRef,
  } = scene;

  const zoomFraction = (maxRadius - radius) / Math.max(1, maxRadius - minRadius);
  const shapeHitboxScale = 1;

  const personalization = usePersonalizationState({
    personalizedEntryId: personalizationGate.personalizedEntryId,
    sectionKey: section,
    bagSeed,
    shapes,
    dataById,
    showCompleteUI,
    mode,
    getRelForId,
    getRelForValue,
    getAbsForId,
    getAbsForValue,
    fullData: fullSurveyData,
    shouldShowPersonalized: personalizationGate.shouldShowPersonalized,
    statsLoading: loading,
  });

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

  const { hoveredDot, viewportClass, onHoverStart, onHoverEnd } = useHoverBubble({
    useDesktopLayout,
    isPinchingRef,
    isTouchRotatingRef,
    calcPercentForAvg: calcValueForAvg,
  });

  useLayoutEffect(() => {
    bumpGeneration();
    resetQueue();
    onHoverEnd();
  }, [datasetKey, onHoverEnd]);

  // Observer mode can briefly synthesize a hover so the graph explains itself without real pointer input.
  const { spotlightActiveRef } = useObserverSpotlight({
    points: shapes,
    onHoverStart,
    onHoverEnd,
    groupRef,
    excludeId: personalizationGate.personalizedEntryId,
    sectionKey: section,
    bagSeed,
    spriteScale,
    hitboxScale: shapeHitboxScale,
    useDesktopLayout,
  });

  useHoverDismissal({
    mode,
    section,
    dataCount: safeData.length,
    useDesktopLayout,
    spotlightActiveRef,
    onHoverEnd,
  });

  return (
    <>
      <group ref={groupRef}>
        <ShapesLayer
          shapes={shapes}
          myEntry={personalization.myEntry}
          personalizedEntryId={personalizationGate.personalizedEntryId}
          showCompleteUI={showCompleteUI}
          onHoverStart={onHoverStart}
          onHoverEnd={onHoverEnd}
          spriteScale={spriteScale}
          bagSeed={bagSeed}
          darkMode={darkMode}
          occasionalRefreshMs={isRealMobile ? 3600 : isTabletLike ? 2200 : 2000}
          hitboxScale={shapeHitboxScale}
          particleFrames={particleFrames}
          tileSize={tileSize}
          section={section}
          useDesktopLayout={useDesktopLayout}
          zoomTargetRef={zoomTargetRef}
          hidePersonalizedSprite={personalization.shouldRenderPersonalUI}
        />

        <PersonalizedLayer
          shouldRenderPersonalUI={personalization.shouldRenderPersonalUI}
          shouldRenderExtraPersonalSprite={personalization.shouldRenderExtraPersonalSprite}
          effectiveMyShape={personalization.effectiveMyShape}
          effectiveMyEntry={personalization.effectiveMyEntry}
          personalSpriteAssignment={personalization.personalSpriteAssignment}
          personalSpriteIdentity={personalization.personalSpriteIdentity}
          spriteScale={spriteScale}
          bagSeed={bagSeed}
          myDisplayValue={personalization.myDisplayValue}
          mode={mode}
          myStats={personalization.myStats}
          statsLoading={personalization.shouldShowStatsLoading}
          setPersonalOpen={personalizationGate.setPersonalOpen}
          darkMode={darkMode}
          zoomFraction={zoomFraction}
          particleFrames={particleFrames}
          sectionKey={section}
          hitboxScale={shapeHitboxScale}
        />

        <HoveredLayer
          hoveredDot={hoveredDot}
          shapes={shapes}
          safeData={safeData}
          mode={mode}
          zoomFraction={zoomFraction}
          viewportClass={viewportClass}
          calcValueForAvg={calcValueForAvg}
          getRelForId={getRelForId}
          absScoreById={absScoreByIdMap}
        />
      </group>
    </>
  );
}
