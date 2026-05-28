// src/graph-runtime/dotgraph/scene/useDotGraphSceneState.ts

import { useEffect, useMemo } from 'react';

import { sampleStops, rgbString } from '../../../lib/utils/color-and-interpolation';
import { useRealMobileViewport } from '../../../lib/hooks/useRealMobileViewport';
import { useWindowWidth } from '../../../lib/hooks/useWindowWidth';
import { isMobileWidth, isTabletWidth } from '../../../lib/responsive/breakpoints';
import { desktopGraphToolsOffsetPx, tabletGraphToolsYOffsetPx } from '../../../lib/responsive/graph-tools-offset';
import { useOptionalUiFlow } from '../../../app/state/ui-context';
import { chooseCameraSpriteTileSize, prewarmSpriteTextures } from '../../sprites/entry';
import { useOrbitController } from '../camera';
import useDotPoints from './useDotPoints';
import { nonlinearLerp } from '../utils/math';
import type { DotPointsOptions, SurveyResponseLike, Vec3 } from '../types';

interface UseDotGraphSceneStateParams {
  safeData: SurveyResponseLike[];
  personalizedEntryId: string | null;
  showPersonalized: boolean;
  darkMode: boolean;
  wantsSkew: boolean;
  wantsSoloSkew: boolean;
}

const MOBILE_PANEL_X_OFFSET_PX = -112;
const SOLO_MOBILE_PANEL_EXTRA_X_OFFSET_PX = -112;

export default function useDotGraphSceneState({
  safeData,
  personalizedEntryId,
  showPersonalized,
  darkMode,
  wantsSkew,
  wantsSoloSkew,
}: UseDotGraphSceneStateParams) {
  const isRealMobile = useRealMobileViewport();
  const windowWidth = useWindowWidth();
  const ui = useOptionalUiFlow();
  const isSmallScreen = isMobileWidth(windowWidth);
  const isTabletLike = isTabletWidth(windowWidth);
  const useDesktopLayout = !(isSmallScreen || isRealMobile || isTabletLike);

  const logsOpen = Boolean(ui?.logsOpen);
  const widgetsOpen = Boolean(ui?.widgetsOpen);
  const graphNavOffsetPx = desktopGraphToolsOffsetPx(windowWidth, logsOpen, widgetsOpen);
  const tabletNavYOffsetPx = tabletGraphToolsYOffsetPx(windowWidth, logsOpen, widgetsOpen);
  const mobilePanelOffsetPx = wantsSkew ? MOBILE_PANEL_X_OFFSET_PX : 0;
  const soloPanelOffsetPx = wantsSoloSkew ? SOLO_MOBILE_PANEL_EXTRA_X_OFFSET_PX : 0;

  // Compute dot positions before orbit controller so they can drive rotation sensitivity.
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
    () => (avg: number) => rgbString(sampleStops(avg)),
    []
  );

  const dotPointOptions = useMemo<DotPointsOptions>(() => {
    const n = safeData.length;
    const chaosT = n <= 1 ? 0 : Math.min(1, (n - 1) / 299);
    return {
      spreadOverride: spread,
      minDistance: 2.1,
      seed: 1337,
      relaxPasses: 1,
      relaxStrength: 0.25,
      // Loose at small counts, tighter clustering as cloud grows toward 300
      attractorStrength: 0.25 + chaosT * 0.31,
      colorForAverage,
      personalizedEntryId,
      showPersonalized,
    };
  }, [spread, colorForAverage, personalizedEntryId, showPersonalized, safeData.length]);

  const shapes = useDotPoints(safeData, dotPointOptions);
  const dotPositions = useMemo(() => shapes.map(s => s.position), [shapes]);

  const {
    groupRef,
    radius,
    isPinchingRef,
    isTouchRotatingRef,
    minRadius,
    maxRadius,
    tooltipOffsetPx,
  } = useOrbitController({
    layout: {
      useDesktopLayout,
      isSmallScreen,
      isTabletLike,
      xOffset: 0,
      yOffset: 0,
      xOffsetPx: mobilePanelOffsetPx + soloPanelOffsetPx + graphNavOffsetPx,
      yOffsetPx: (wantsSkew ? 12 : 0) + tabletNavYOffsetPx,
    },
    bounds: { minRadius: isSmallScreen ? 2 : 20, maxRadius: 800 },
    dataCount: safeData.length,
    dotPositions,
  });

  const bagSeed = 'dotgraph-bag-v1';

  const particleFrames = isRealMobile ? 60 : 219;
  const tileSize = chooseCameraSpriteTileSize({
    radius,
    minRadius,
    maxRadius,
    isRealMobile,
    isTabletLike,
  });
  const prewarmLimit = isRealMobile ? 30 : shapes.length;

  const prewarmItems = useMemo(
    () =>
      shapes.slice(0, prewarmLimit).map((shape, i) => ({
        avg: Number.isFinite(shape.averageWeight) ? shape.averageWeight : 0.5,
        orderIndex: i,
        seed: bagSeed,
      })),
    [shapes, prewarmLimit]
  );

  useEffect(() => {
    if (!prewarmItems.length) return;
    prewarmSpriteTextures(prewarmItems, {
      tileSize,
      darkMode,
      particleFrames,
      particleStepMs: 33,
    });
  }, [prewarmItems, tileSize, darkMode, particleFrames]);

  const posById = useMemo(() => {
    const map = new Map<string, Vec3>();
    for (const shape of shapes) {
      if (shape._id) map.set(shape._id, shape.position);
    }
    return map;
  }, [shapes]);

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

  const spriteScale = useMemo(() => {
    const denom = Math.max(1e-6, maxRadius - minRadius);
    // Quantize to 32 steps so zoom re-renders happen at discrete thresholds
    // rather than every frame, preventing per-frame remount of ShapesLayer sprites
    const tRaw = Math.max(0, Math.min(1, (radius - minRadius) / denom));
    const t = Math.round(tRaw * 32) / 32;
    const SCALE_MIN = 8;
    const SCALE_MAX = 13.5;
    return nonlinearLerp(SCALE_MAX, SCALE_MIN, t);
  }, [radius, minRadius, maxRadius]);

  return {
    isSmallScreen,
    isRealMobile,
    isTabletLike,
    useDesktopLayout,
    groupRef,
    radius,
    isPinchingRef,
    isTouchRotatingRef,
    minRadius,
    maxRadius,
    shapes,
    posById,
    offsetPx,
    spriteScale,
    bagSeed,
    particleFrames,
    tileSize,
  };
}
