// src/graph-runtime/dotgraph/dot-graph.tsx

// Composition root for DotGraph data, hover state, tie state, and rendered layers.

import { useCallback } from 'react';

import { usePreferences } from '../../app/state/preferences-context';
import { useUiFlow } from '../../app/state/ui-context';
import { useIdentity } from '../../app/state/identity-context';
import { useSurveyData } from '../../app/state/survey-data-context';
import { useSharedGraphData } from '../GraphDataContext';
import { useTextureQueueProgress } from '../sprites/entry';

import useHoverBubble from './interaction/useHoverBubble';
import useObserverDelay from './interaction/useObserverDelay';
import useObserverSpotlight from './interaction/useObserverSpotlight';
import GraphOverlays from './components/GraphLoading';
import ShapesLayer from './components/ShapesLayer';
import PersonalizedLayer from './components/PersonalizedLayer';
import HoveredLayer from './components/GeneralizedLayer';
import usePersonalizationGate from './scene/usePersonalizationGate';
import useDotGraphSceneState from './scene/useDotGraphSceneState';
import usePersonalizationState from './scene/usePersonalizationState';
import useTieState from './scene/useTieState';

export default function DotGraph() {
  const { darkMode } = usePreferences();
  const { observerMode, mode } = useUiFlow();
  const { myEntryId, mySection } = useIdentity();
  const { section, data: fullSurveyData } = useSurveyData();

  const {
    safeData,
    dataById,
    getRelForId,
    getRelForValue,
    getAbsForId,
    getAbsForValue,
    absScoreById: absScoreByIdMap,
  } = useSharedGraphData();

  const showCompleteUI = useObserverDelay(observerMode, 2000);

  const personalizationGate = usePersonalizationGate({
    myEntryId,
    mySection,
    section,
    safeData,
    observerMode,
    isSmallScreen: typeof window !== 'undefined' ? window.innerWidth < 768 : false,
  });

  const scene = useDotGraphSceneState({
    safeData,
    personalizedEntryId: personalizationGate.personalizedEntryId,
    showPersonalized:
      showCompleteUI &&
      personalizationGate.hasPersonalizedInDataset &&
      personalizationGate.shouldShowPersonalized,
    darkMode,
    wantsSkew: personalizationGate.wantsSkew,
  });
  // Pull the scene contract out of the hook result so layer props stay explicit.
  const {
    groupRef,
    shapes,
    posById,
    useDesktopLayout,
    isPinchingRef,
    isTouchRotatingRef,
    spriteScale,
    bagSeed,
    offsetPx,
    isRealMobile,
    isTabletLike,
    particleFrames,
    tileSize,
  } = scene;

  const personalization = usePersonalizationState({
    personalizedEntryId: personalizationGate.personalizedEntryId,
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
    hasPersonalizedInDataset: personalizationGate.hasPersonalizedInDataset,
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

  // Observer mode can briefly synthesize a hover so the graph explains itself without real pointer input.
  const { spotlightActiveRef } = useObserverSpotlight({
    points: shapes,
    onHoverStart,
    onHoverEnd,
  });

  const ties = useTieState({
    safeData,
    posById,
    spotlightActiveRef,
    onHoverEnd,
    mode,
    section,
    useDesktopLayout,
  });

  const { isBusy } = useTextureQueueProgress();

  return (
    <>
      <GraphOverlays isBusy={isBusy} />

      <group ref={groupRef}>
        <ShapesLayer
          shapes={shapes}
          myEntry={personalization.myEntry}
          personalizedEntryId={personalizationGate.personalizedEntryId}
          showCompleteUI={showCompleteUI}
          onHoverStart={onHoverStart}
          onHoverEnd={onHoverEnd}
          tieKeyForId={ties.tieKeyForId}
          setSelectedTieKey={ties.setSelectedTieKey}
          selectedTieKey={ties.selectedTieKey}
          spriteScale={spriteScale}
          bagSeed={bagSeed}
          darkMode={darkMode}
          occasionalRefreshMs={isRealMobile ? 3000 : isTabletLike ? 800 : 2000}
          particleFrames={particleFrames}
          tileSize={tileSize}
          section={section}
        />

        <PersonalizedLayer
          shouldRenderPersonalUI={personalization.shouldRenderPersonalUI}
          shouldRenderExtraPersonalSprite={personalization.shouldRenderExtraPersonalSprite}
          effectiveMyShape={personalization.effectiveMyShape}
          effectiveMyEntry={personalization.effectiveMyEntry}
          spriteScale={spriteScale}
          bagSeed={bagSeed}
          offsetPx={offsetPx}
          myDisplayValue={personalization.myDisplayValue}
          mode={mode}
          section={section}
          myStats={personalization.myStats}
          myClass={personalization.myClass}
          setPersonalOpen={personalizationGate.setPersonalOpen}
          darkMode={darkMode}
        />

        <HoveredLayer
          hoveredDot={hoveredDot}
          shapes={shapes}
          safeData={safeData}
          mode={mode}
          offsetPx={offsetPx}
          viewportClass={viewportClass}
          calcValueForAvg={calcValueForAvg}
          getRelForId={getRelForId}
          absScoreById={absScoreByIdMap}
        />
      </group>
    </>
  );
}
