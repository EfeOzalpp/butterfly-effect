// graph-runtime/sprites/internal/spriteRuntime.ts
import {
  LinearFilter,
  LinearMipmapLinearFilter,
  type CanvasTexture,
} from 'three';

import { computeVisualStyle } from "../../../canvas-engine/modifiers/color-modifiers/style";

import type { ShapeKey } from '../selection/types';
import { DRAWERS, type DrawerFn } from '../selection/drawers';
import {
  FOOTPRINTS,
  BLEED,
  PARTICLE_SHAPES,
  resolveParticleScaleBoost,
} from '../selection/footprints';
import { deviceType, getViewportSize } from '../../../canvas-engine/shared/responsiveness';

import { makeFrozenTextureFromDrawer } from '../textures/frozenTexture';
import { textureRegistry, type MakeArgs } from '../textures/cache/registry';
import { enqueueTexture } from '../textures/queue';

import {
  frozenGet,
  frozenSet,
  frozenIsFailed,
  frozenMarkFailed,
  frozenBeginInflight,
  frozenEndInflight,
  frozenIsInflight,
  frozenClearAll,
  frozenSize,
} from '../textures/cache/frozenRegistry';

import {
  chooseShape,
  quantizeAvgWithDownshift,
  pickVariantSlot,
  makeStaticKey,
  makeFrozenKey,
  resolveDpr,
} from './spritePolicy';

import { trackTexture, disposeAllTrackedTextures } from '../textures/cache/textureTracker';

const track = trackTexture;
const noop = () => undefined;

// Runtime owns texture creation/caching. React components ask for textures here
// instead of building canvas textures inside render.
export function disposeAllSpriteTextures() {
  disposeAllTrackedTextures();
  try { frozenClearAll(); } catch {}
  try { textureRegistry.clear(); } catch {}
}

export function prewarmSpriteTextures(
  items: { avg: number; orderIndex?: number; seed?: string | number }[],
  {
    tileSize = 256,
    dpr = resolveDpr(1),
    particleStepMs = 33,
    particleFrames = 36,
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
  const TILE = Math.min(tileSize, 128);
  const simulateMs = Math.max(0, particleFrames * particleStepMs);
  const dev = deviceType(getViewportSize().w);

  const seen = new Set<string>(); // (shape,bucketId,variant)
  const jobs: MakeArgs[] = [];
  const frozenJobs: (() => void)[] = [];

  const limited = items.slice(0, Math.max(1, maxCount));

  for (const it of limited) {
    const shape = chooseShape({ avg: it.avg, seed: it.seed, orderIndex: it.orderIndex });

    const { bucketId, bucketAvg } = quantizeAvgWithDownshift(it.avg);

    const variant = pickVariantSlot(
      `${shape}|B${String(bucketId)}|${String(it.seed ?? '')}|${String(it.orderIndex ?? 0)}`
    );
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
      // Static first, frozen second: components can show art quickly while the
      // particle-heavy frozen texture finishes in the background.
      const sKeyEarly = makeStaticKey({
        shape,
        tileSize: TILE,
        dpr,
        alpha: alphaUse,
        bucketId,
        variant,
        darkMode,
        pixelScaleBoost: resolveParticleScaleBoost(shape, dev),
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
          seedKey: `${sKeyEarly}|seed:${shape}|${String(variant)}`,
          prio: 1,
          darkMode,
          pixelScaleBoost: resolveParticleScaleBoost(shape, dev),
        });
      }

      const key = makeFrozenKey({
        shape,
        tileSize: TILE,
        dpr,
        alpha: alphaUse,
        simulateMs,
        stepMs: particleStepMs,
        bucketId,
        variant,
        darkMode,
      });

      if (!frozenGet(key) && !frozenIsFailed(key) && !frozenIsInflight(key)) {
        frozenBeginInflight(key);

        frozenJobs.push(() => {
          try {
            const { texture } = makeFrozenTextureFromDrawer({
              drawer,
              tileSize: TILE,
              dpr,
              alpha: alphaUse,
              gradientRGB: vs.rgb,
              liveAvg: bucketAvg,
              blend: blendUse,
              footprint,
              bleed,
              seedKey: `${key}|seed:${shape}|${String(variant)}`,
              darkMode,
              simulateMs,
              stepMs: particleStepMs,
              generateMipmaps: true,
              anisotropy: 1,
              minFilter: LinearMipmapLinearFilter,
              magFilter: LinearFilter,
            });
            frozenSet(key, track(texture));
          } catch (err) {
            frozenMarkFailed(key);
            if (window.__GP_LOG_LOAD_ERRORS) {
              console.warn('[SPRITE:FROZEN] build failed (prewarm)', key, err);
            }

            const sKey = makeStaticKey({
              shape,
              tileSize: TILE,
              dpr,
              alpha: alphaUse,
              bucketId,
              variant,
              darkMode,
              pixelScaleBoost: resolveParticleScaleBoost(shape, dev),
            });
            if (!textureRegistry.get(sKey)) {
              textureRegistry.ensure({
                key: sKey,
                drawer,
                tileSize: TILE,
                dpr,
                alpha: alphaUse,
                gradientRGB: vs.rgb,
                liveAvg: bucketAvg,
                blend: blendUse,
                footprint,
                bleed,
                seedKey: `${sKey}|seed:${shape}|${String(variant)}`,
                prio: 0,
                darkMode,
                pixelScaleBoost: resolveParticleScaleBoost(shape, dev),
              });
            }
          } finally {
            frozenEndInflight(key);
          }
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
          seedKey: `${key2}|seed:${shape}|${String(variant)}`,
          prio: 0,
          darkMode,
          pixelScaleBoost: resolveParticleScaleBoost(shape, dev),
        });
      }
    }
  }

  if (jobs.length) textureRegistry.prewarm(jobs, { prioBase: 0 });
  for (const run of frozenJobs) enqueueTexture(run, 1000, true);

  if (typeof window !== 'undefined') {
    window.__GP_FROZEN_TEX = { size: frozenSize() };
  }
}

/* runtime request helpers used by the React component */
export function getStaticTexture(key: string) {
  return textureRegistry.get(key);
}

export function getFrozenTexture(key: string) {
  return frozenGet(key);
}

export function requestStaticTexture(args: MakeArgs, onReady: (tex: CanvasTexture) => void) {
  const existing = textureRegistry.get(args.key);
  if (existing) {
    onReady(existing);
    return noop;
  }

  textureRegistry.ensure({ ...args, prio: args.prio ?? 0 });
  // Multiple mounted sprites can wait for the same in-flight texture key.
  const off = textureRegistry.onReady((readyKey, readyTex) => {
    if (readyKey === args.key) onReady(readyTex);
  });

  return off;
}

export function requestFrozenTexture(args: {
  key: string;
  shape: ShapeKey;
  drawer: DrawerFn;
  tileSize: number;
  dpr: number;
  alpha: number;
  bucketAvg: number;
  gradientRGB?: { r: number; g: number; b: number };
  blend: number;
  footprint: { w: number; h: number };
  bleed?: { top?: number; right?: number; bottom?: number; left?: number };
  seedKey: string;
  simulateMs: number;
  stepMs: number;
  darkMode?: boolean;
  background?: boolean;
  pixelScaleBoost?: number;
  onReady: (tex: CanvasTexture) => void;
  onFail: () => void;
}) {
  // Frozen textures simulate particles once and cache the result. That is much
  // cheaper than running particle animation for every sprite every frame.
  const cached = frozenGet(args.key);
  if (cached) {
    args.onReady(cached);
    return noop;
  }

  if (frozenIsFailed(args.key)) {
    args.onFail();
    return noop;
  }

  if (!frozenIsInflight(args.key) && frozenBeginInflight(args.key)) {
    enqueueTexture(() => {
      try {
        const { texture } = makeFrozenTextureFromDrawer({
          drawer: args.drawer,
          tileSize: args.tileSize,
          dpr: args.dpr,
          alpha: args.alpha,
          gradientRGB: args.gradientRGB,
          liveAvg: args.bucketAvg,
          blend: args.blend,
          footprint: args.footprint,
          bleed: args.bleed,
          seedKey: args.seedKey,
          darkMode: args.darkMode,
          pixelScaleBoost: args.pixelScaleBoost,
          simulateMs: args.simulateMs,
          stepMs: args.stepMs,
          generateMipmaps: true,
          anisotropy: 1,
          minFilter: LinearMipmapLinearFilter,
          magFilter: LinearFilter,
        });
        frozenSet(args.key, track(texture));
        args.onReady(texture);
      } catch (err) {
        frozenMarkFailed(args.key);
        if (window.__GP_LOG_LOAD_ERRORS) {
          console.warn('[SPRITE:FROZEN] build failed (runtime)', args.key, err);
        }
        args.onFail();
      } finally {
        frozenEndInflight(args.key);
      }
    }, 0, args.background);
  }

  return noop;
}
