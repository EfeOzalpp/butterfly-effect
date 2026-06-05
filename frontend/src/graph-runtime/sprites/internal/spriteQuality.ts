import type { DeviceType } from '../../../canvas-engine/shared/responsiveness';

const MAX_TILE_BY_DEVICE: Record<DeviceType, number> = {
  mobile: 96,
  tablet: 160,
  laptop: 160,
};

export const PERSONALIZED_SPRITE_TILE_SIZE = 192;

const QUALITY_THRESHOLDS: Record<DeviceType, {
  midEnter: number;
  midExit: number;
  highEnter: number;
  highExit: number;
}> = {
  mobile: { midEnter: 150, midExit: 96, highEnter: 360, highExit: 240 },
  tablet: { midEnter: 180, midExit: 104, highEnter: 420, highExit: 280 },
  laptop: { midEnter: 170, midExit: 104, highEnter: 420, highExit: 280 },
};

export function maxSpriteTileSize(dev: DeviceType) {
  return MAX_TILE_BY_DEVICE[dev];
}

export function clampSpriteTileSize(tileSize: number, dev: DeviceType) {
  return Math.max(64, Math.min(Math.round(tileSize), maxSpriteTileSize(dev)));
}

function runtimeHardware() {
  if (typeof navigator === 'undefined') return { cores: 8, memoryGb: 8 };
  const nav = navigator as Navigator & { deviceMemory?: number };
  const cores = nav.hardwareConcurrency;
  return {
    cores: Number.isFinite(cores) && cores > 0 ? cores : 8,
    memoryGb: nav.deviceMemory ?? 8,
  };
}

export function isConstrainedSpriteDevice(dev: DeviceType) {
  if (dev !== 'laptop') return true;
  const { cores, memoryGb } = runtimeHardware();
  return cores <= 4 || memoryGb <= 4;
}

export function spriteQualityCheckFrameModulo(dev: DeviceType) {
  if (dev === 'mobile') return 36;
  if (dev === 'tablet' || isConstrainedSpriteDevice(dev)) return 30;
  return 24;
}

export function spriteQualityUpgradeDelayMs(dev: DeviceType, orderIndex = 0) {
  const constrained = isConstrainedSpriteDevice(dev);
  const slots = dev === 'mobile' ? 48 : dev === 'tablet' ? 48 : constrained ? 42 : 36;
  const stepMs = dev === 'mobile' ? 120 : dev === 'tablet' ? 110 : constrained ? 95 : 80;
  return (Math.abs(orderIndex) % slots) * stepMs;
}

export function chooseSpriteTileForScreenSize(
  screenPx: number,
  current: number,
  base: number,
  dev: DeviceType
) {
  if (dev === 'mobile') return base;

  const mid = Math.max(base, 128);
  const high = Math.max(mid, maxSpriteTileSize(dev));
  const thresholds = QUALITY_THRESHOLDS[dev];

  if (current >= high) return screenPx < thresholds.highExit ? mid : high;
  if (current >= mid) {
    if (screenPx > thresholds.highEnter) return high;
    if (screenPx < thresholds.midExit) return base;
    return mid;
  }
  return screenPx > thresholds.midEnter ? mid : base;
}

export function chooseCameraSpriteTileSize({
  radius: _radius,
  minRadius: _minRadius,
  maxRadius: _maxRadius,
  isRealMobile,
  isTabletLike,
}: {
  radius: number;
  minRadius: number;
  maxRadius: number;
  isRealMobile: boolean;
  isTabletLike: boolean;
}) {
  if (isRealMobile) {
    return 96;
  }

  if (isTabletLike) {
    return 128;
  }

  return 112;
}
