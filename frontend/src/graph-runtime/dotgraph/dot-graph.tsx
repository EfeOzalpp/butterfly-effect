import React, { useCallback } from 'react';

import { useAppState } from '../../app/store';

import useGraphData from '../useGraphData';
import { useTextureQueueProgress } from '../sprites/entry';

import useHoverBubble from './hooks/useHoverBubble';
import useObserverDelay from './hooks/useObserverDelay';
import useObserverSpotlight from './hooks/useObserverSpotlight';
import GraphOverlays from './components/GraphOverlays';
import ShapesLayer from './components/ShapesLayer';
import PersonalizedLayer from './components/PersonalizedLayer';
import HoveredLayer from './components/GeneralizedLayer';
import useDotGraphPersonalizationGate from './orchestration/useDotGraphPersonalizationGate';
import useDotGraphSceneModel from './orchestration/useDotGraphSceneModel';
import useDotGraphPersonalizationModel from './orchestration/useDotGraphPersonalizationModel';
import useDotGraphTieState from './orchestration/useDotGraphTieState';

type DotGraphProps = {
  isDragging?: boolean;
  data?: any[];
};

export default function DotGraph({ isDragging = false, data = [] }: DotGraphProps) {
  const { myEntryId, mySection, observerMode, mode, section, darkMode } = useAppState() as any;

  const {
    safeData,
    dataById,
    getRelForId,
    getRelForValue,
    getAbsForId,
    getAbsForValue,
    absScoreById: absScoreByIdMap,
  } = useGraphData(data);

  const showCompleteUI = useObserverDelay(observerMode, 2000);

  const personalizationGate = useDotGraphPersonalizationGate({
    myEntryId,
    mySection,
    section,
    safeData,
    observerMode,
    isSmallScreen: typeof window !== 'undefined' ? window.innerWidth < 768 : false,
  });

  const scene = useDotGraphSceneModel({
    safeData,
    personalizedEntryId: personalizationGate.personalizedEntryId,
    showPersonalized:
      showCompleteUI &&
      personalizationGate.hasPersonalizedInDataset &&
      personalizationGate.shouldShowPersonalized,
    darkMode,
    isDragging,
    wantsSkew: personalizationGate.wantsSkew,
  });

  const personalization = useDotGraphPersonalizationModel({
    personalizedEntryId: personalizationGate.personalizedEntryId,
    points: scene.points,
    dataById,
    showCompleteUI,
    mode,
    getRelForId,
    getRelForValue,
    getAbsForId,
    getAbsForValue,
    safeData,
    section,
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
    useDesktopLayout: scene.useDesktopLayout,
    isDragging,
    isPinchingRef: scene.isPinchingRef,
    isTouchRotatingRef: scene.isTouchRotatingRef,
    calcPercentForAvg: calcValueForAvg,
  } as any);

  const { spotlightActiveRef } = useObserverSpotlight({
    points: scene.points,
    onHoverStart: onHoverStart as any,
    onHoverEnd: onHoverEnd as any,
  });

  const ties = useDotGraphTieState({
    safeData,
    posById: scene.posById,
    spotlightActiveRef,
    onHoverEnd,
    mode,
    section,
    useDesktopLayout: scene.useDesktopLayout,
  });

  const { isBusy } = useTextureQueueProgress();

  return (
    <>
      <GraphOverlays showCompleteUI={showCompleteUI} isBusy={isBusy} />

      <group ref={scene.groupRef as any}>
        <ShapesLayer
          points={scene.points}
          myEntry={personalization.myEntry}
          personalizedEntryId={personalizationGate.personalizedEntryId}
          showCompleteUI={showCompleteUI}
          onHoverStart={onHoverStart}
          onHoverEnd={onHoverEnd}
          tieKeyForId={ties.tieKeyForId}
          setSelectedTieKey={ties.setSelectedTieKey}
          selectedTieKey={ties.selectedTieKey}
          selectedTieLinePoints={ties.selectedTieLinePoints}
          spriteScale={scene.spriteScale}
          bagSeed={scene.bagSeed}
          bleedOf={scene.bleedOf}
          darkMode={darkMode}
        />

        <PersonalizedLayer
          shouldRenderPersonalUI={personalization.shouldRenderPersonalUI}
          shouldRenderExtraPersonalSprite={personalization.shouldRenderExtraPersonalSprite}
          effectiveMyPoint={personalization.effectiveMyPoint}
          effectiveMyEntry={personalization.effectiveMyEntry}
          spriteScale={scene.spriteScale}
          bagSeed={scene.bagSeed}
          offsetPx={scene.offsetPx}
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
          points={scene.points}
          safeData={safeData}
          mode={mode}
          offsetPx={scene.offsetPx}
          viewportClass={viewportClass}
          calcValueForAvg={calcValueForAvg}
          getRelForId={getRelForId}
          absScoreById={absScoreByIdMap}
        />
      </group>
    </>
  );
}
