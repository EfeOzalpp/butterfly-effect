import type { DeviceType } from '../../../canvas-engine/shared/responsiveness';

const MAX_TILE_BY_DEVICE: Record<DeviceType, number> = {
  mobile: 192,
  tablet: 192,
  laptop: 192,
};

export const PERSONALIZED_SPRITE_TILE_SIZE = 192;

const QUALITY_THRESHOLDS: Record<DeviceType, {
  midEnter: number;
  midExit: number;
  highEnter: number;
  highExit: number;
}> = {
  mobile: { midEnter: 150, midExit: 96, highEnter: 360, highExit: 240 },
  tablet: { midEnter: 140, midExit: 92, highEnter: 320, highExit: 220 },
  laptop: { midEnter: 128, midExit: 86, highEnter: 280, highExit: 190 },
};

function clamp01(v: number) {
  return Math.max(0, Math.min(1, v));
}

function zoomOutRatio(radius: number, minRadius: number, maxRadius: number) {
  const span = Math.max(1e-6, maxRadius - minRadius);
  return clamp01((radius - minRadius) / span);
}

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
  if (dev === 'mobile') return 24;
  if (dev === 'tablet' || isConstrainedSpriteDevice(dev)) return 18;
  return 12;
}

export function spriteQualityUpgradeDelayMs(dev: DeviceType, orderIndex = 0) {
  const constrained = isConstrainedSpriteDevice(dev);
  const slots = dev === 'mobile' ? 36 : dev === 'tablet' ? 30 : constrained ? 24 : 14;
  const stepMs = dev === 'mobile' ? 80 : dev === 'tablet' ? 65 : constrained ? 55 : 30;
  return (Math.abs(orderIndex) % slots) * stepMs;
}

export function chooseSpriteTileForScreenSize(
  screenPx: number,
  current: number,
  base: number,
  dev: DeviceType
) {
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
  radius,
  minRadius,
  maxRadius,
  isRealMobile,
  isTabletLike,
}: {
  radius: number;
  minRadius: number;
  maxRadius: number;
  isRealMobile: boolean;
  isTabletLike: boolean;
}) {
  const t = zoomOutRatio(radius, minRadius, maxRadius);

  if (isRealMobile) {
    if (t < 0.32) return 128;
    return 96;
  }

  if (isTabletLike) {
    if (t < 0.36) return 160;
    return 128;
  }

  if (t < 0.40) return 160;
  return 128;
}
