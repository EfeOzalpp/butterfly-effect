import { useCallback, useEffect, useMemo } from 'react';

import { sampleStops, rgbString } from '../../../lib/utils/color-and-interpolation';
import { useRealMobileViewport } from '../../../lib/hooks/useRealMobileViewport';
import { useWindowWidth } from '../../../lib/hooks/useWindowWidth';
import { useOptionalUiFlow } from '../../../app/state/ui-context';
import { prewarmSpriteTextures } from '../../sprites/entry';
import { useOrbitController } from '../event-handlers';
import useDotPoints from '../hooks/useDotPoints';
import { boostColor, nonlinearLerp } from '../utils/colorBoost';

type UseDotGraphSceneModelParams = {
  safeData: any[];
  personalizedEntryId: string | null;
  showPersonalized: boolean;
  darkMode: boolean;
  wantsSkew: boolean;
};

const ZERO_BLEED = { top: 0, right: 0, bottom: 0, left: 0 };

export default function useDotGraphSceneModel({
  safeData,
  personalizedEntryId,
  showPersonalized,
  darkMode,
  wantsSkew,
}: UseDotGraphSceneModelParams) {
  const width = typeof window !== 'undefined' ? document.documentElement.clientWidth : 1024;
  const isRealMobile = useRealMobileViewport();
  const windowWidth = useWindowWidth();
  const ui = useOptionalUiFlow();
  const isSmallScreen = width < 768;
  const isTabletLike = width >= 768 && width <= 1024;
  const useDesktopLayout = !(isSmallScreen || isRealMobile || isTabletLike);

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
      xOffsetPx: (wantsSkew ? -112 : 0) + (windowWidth > 768 ? (ui?.logsOpen ? 130 : 0) + (ui?.widgetsOpen ? 50 : 0) : 0),
      yOffsetPx: wantsSkew ? 12 : 0,
    },
    bounds: { minRadius: isSmallScreen ? 2 : 20, maxRadius: 800 },
    dataCount: safeData.length,
  } as any);

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

  const dotPointOptions = useMemo(
    () => ({
      spread,
      minDistance: 2.1,
      seed: 1337,
      relaxPasses: 1,
      relaxStrength: 0.25,
      centerBias: 0.35,
      colorForAverage,
      personalizedEntryId,
      showPersonalized,
    }),
    [spread, colorForAverage, personalizedEntryId, showPersonalized]
  );

  const shapes: any[] = useDotPoints(safeData, dotPointOptions as any);
  const bagSeed = 'dotgraph-bag-v1';

  const prewarmItems = useMemo(
    () =>
      shapes.map((shape, i) => ({
        avg: Number.isFinite(shape?.averageWeight) ? shape.averageWeight : 0.5,
        orderIndex: i,
        seed: bagSeed,
      })),
    [shapes]
  );

  useEffect(() => {
    if (!prewarmItems.length) return;
    prewarmSpriteTextures(prewarmItems, { tileSize: 128, alpha: 215, blend: 0.6, darkMode } as any);
  }, [prewarmItems, darkMode]);

  const posById = useMemo(() => new Map(shapes.map((shape) => [shape._id, shape.position])), [shapes]);

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
    const t = Math.max(0, Math.min(1, (radius - minRadius) / denom));
    const SCALE_MIN = 8;
    const SCALE_MAX = 13.5;
    return nonlinearLerp(SCALE_MAX, SCALE_MIN, t);
  }, [radius, minRadius, maxRadius]);

  const bleedOf = useCallback(
    (shapeKey: string) => (shapeKey === 'trees' ? { top: 0.28, right: 0, bottom: 0, left: 0 } : ZERO_BLEED),
    []
  );

  return {
    isSmallScreen,
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
    bleedOf,
    bagSeed,
  };
}
