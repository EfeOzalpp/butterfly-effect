// graph-runtime/sprites/internal/spriteRuntime.ts
import type { CanvasTexture } from '../../three';

import { computeVisualStyle } from "../../../canvas-engine/modifiers/color-modifiers/style";

import { DRAWERS } from '../selection/drawers';
import {
  FOOTPRINTS,
  BLEED,
  PARTICLE_SHAPES,
  resolveParticleScaleBoost,
} from '../api/shapeProfiles';
import { deviceType, getViewportSize } from '../../../canvas-engine/shared/responsiveness';

import { textureRegistry, type MakeArgs } from '../textures/cache/registry';

import {
  chooseShape,
  quantizeAvgWithDownshift,
  pickVariantSlot,
  makeStaticKey,
  makeSpriteSeedKey,
  resolveDpr,
  resolveSpriteAvgForDebug,
} from './spritePolicy';
import { clampSpriteTileSize } from './spriteQuality';

import { disposeAllTrackedTextures } from '../textures/cache/textureTracker';
import { disposeAllSpriteMaterials } from './spriteMaterials';
const noop = () => undefined;

// Runtime owns texture creation/caching. React components ask for textures here
// instead of building canvas textures inside render.
export function disposeAllSpriteTextures() {
  disposeAllSpriteMaterials();
  disposeAllTrackedTextures();
  try { textureRegistry.clear(); } catch {}
}

export function prewarmSpriteTextures(
  items: { avg: number; orderIndex?: number; seed?: string | number }[],
  {
    tileSize = 256,
    dpr = resolveDpr(1),
    maxCount = 32,
    darkMode = false,
  }: {
    tileSize?: number;
    dpr?: number;
    particleStepMs?: number;
    particleFrames?: number;
    maxCount?: number;
    darkMode?: boolean;
  } = {}
) {
  // Prewarming builds likely textures before sprites mount, reducing blank or
  // placeholder frames when the dot graph first appears.
  const dev = deviceType(getViewportSize().w);
  const TILE = clampSpriteTileSize(tileSize, dev);
  const seen = new Set<string>(); // (shape,bucketId,variant)
  const jobs: MakeArgs[] = [];

  const limited = items.slice(0, Math.max(1, maxCount));

  for (const it of limited) {
    const effectiveAvg = resolveSpriteAvgForDebug(it.avg);
    const shape = chooseShape({ avg: effectiveAvg, seed: it.seed, orderIndex: it.orderIndex });

    const { bucketId, bucketAvg } = quantizeAvgWithDownshift(effectiveAvg);

    const variant = pickVariantSlot(
      `${shape}|B${String(bucketId)}|${String(it.seed ?? '')}|${String(it.orderIndex ?? 0)}`
    );
    const seedKey = makeSpriteSeedKey({ shape, bucketId, variant });
    const seenKey = `${shape}:${String(bucketId)}:V${String(variant)}`;
    if (seen.has(seenKey)) continue;
    seen.add(seenKey);

    const drawer = DRAWERS[shape];
    if (!drawer) continue;

    const footprint = FOOTPRINTS[shape];
    const bleed = BLEED[shape];

    const vs = computeVisualStyle(bucketAvg);
    const alphaUse = vs.alpha;
    const blendUse = vs.blend;

    if (PARTICLE_SHAPES.has(shape)) {
      // Particles now start from an already-active moment in the drawer itself,
      // so prewarm only needs the static texture path.
      const sKeyEarly = makeStaticKey({
        shape,
        tileSize: TILE,
        dpr,
        alpha: alphaUse,
        bucketId,
        variant,
        darkMode,
        pixelScaleBoost: resolveParticleScaleBoost(shape, dev),
        footprint,
        bleed,
      });
      if (!textureRegistry.get(sKeyEarly)) {
        jobs.push({
          key: sKeyEarly,
          drawer,
          tileSize: TILE,
          dpr,
          alpha: alphaUse,
          gradientRGB: vs.rgb,
          liveAvg: bucketAvg,
          blend: blendUse,
          footprint,
          bleed,
          seedKey,
          prio: 1,
          darkMode,
          pixelScaleBoost: resolveParticleScaleBoost(shape, dev),
        });
      }
    } else {
      const key2 = makeStaticKey({
        shape,
        tileSize: TILE,
        dpr,
        alpha: alphaUse,
        bucketId,
        variant,
        darkMode,
        pixelScaleBoost: resolveParticleScaleBoost(shape, dev),
        footprint,
        bleed,
      });
      if (!textureRegistry.get(key2)) {
        jobs.push({
          key: key2,
          drawer,
          tileSize: TILE,
          dpr,
          alpha: alphaUse,
          gradientRGB: vs.rgb,
          liveAvg: bucketAvg,
          blend: blendUse,
          footprint,
          bleed,
          seedKey,
          prio: 0,
          darkMode,
          pixelScaleBoost: resolveParticleScaleBoost(shape, dev),
        });
      }
    }
  }

  if (jobs.length) textureRegistry.prewarm(jobs, { prioBase: 0 });
}

/* runtime request helpers used by the React component */
export function getStaticTexture(key: string) {
  return textureRegistry.get(key);
}

export function requestStaticTexture(args: MakeArgs, onReady: (tex: CanvasTexture) => void) {
  const existing = textureRegistry.get(args.key);
  if (existing) {
    onReady(existing);
    return noop;
  }

  textureRegistry.ensure({ ...args, prio: args.prio ?? 0 });
  let active = true;
  let retryTimer: ReturnType<typeof setTimeout> | undefined;
  // Multiple mounted sprites can wait for the same in-flight texture key.
  const off = textureRegistry.onReady((readyKey, readyTex) => {
    if (!active) return;
    if (readyKey === args.key) onReady(readyTex);
  });
  const offCancel = textureRegistry.onCancel((cancelledKey) => {
    if (!active || cancelledKey !== args.key) return;
    retryTimer = setTimeout(() => {
      if (!active || textureRegistry.get(args.key)) return;
      textureRegistry.ensure({ ...args, prio: args.prio ?? 0 });
    }, 0);
  });

  return () => {
    active = false;
    off();
    offCancel();
    if (retryTimer !== undefined) clearTimeout(retryTimer);
  };
}

