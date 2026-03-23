// graph-runtime/sprites/api/spriteShape.tsx
import * as React from 'react';
import * as THREE from 'three';

import { computeVisualStyle } from "../../../canvas-engine/modifiers/color-modifiers/style";

import type { ShapeKey } from '../selection/types';
import { chooseShape, quantizeAvgWithDownshift, pickVariantSlot, makeStaticKey, makeFrozenKey, resolveDpr, DEFAULT_VARIANT_SLOTS } from '../internal/spritePolicy';

import { DRAWERS } from '../selection/drawers';
import { FOOTPRINTS, BLEED, VISUAL_SCALE, ANCHOR_BIAS_Y, PARTICLE_SHAPES } from '../selection/footprints';

import { textureRegistry } from '../textures/registry';

import {
  getStaticTexture,
  getFrozenTexture,
  requestStaticTexture,
  requestFrozenTexture,
} from '../internal/spriteRuntime';
import { spriteMaterialCachingDisabled } from './debug-flags';

function clamp01(v: number) {
  return Math.max(0, Math.min(1, v));
}

const __GLOBAL_TEX = new Set<THREE.CanvasTexture>();
function track(tex: THREE.CanvasTexture) {
  __GLOBAL_TEX.add(tex);
  return tex;
}

type SharedMaterialEntry = {
  material: THREE.SpriteMaterial;
  refs: number;
};

const __SHARED_SPRITE_MATERIALS = new Map<string, SharedMaterialEntry>();

function makeSpriteMaterialKey(tex: THREE.CanvasTexture, opacity: number) {
  return [
    tex.uuid,
    opacity,
    0, // depthWrite=false
    0, // depthTest=false
    0, // toneMapped=false
    'white',
  ].join('|');
}

function acquireSpriteMaterial(tex: THREE.CanvasTexture, opacity: number) {
  const key = makeSpriteMaterialKey(tex, opacity);
  const hit = __SHARED_SPRITE_MATERIALS.get(key);
  if (hit) {
    hit.refs += 1;
    return hit.material;
  }

  const material = new THREE.SpriteMaterial({
    map: tex,
    transparent: true,
    depthWrite: false,
    depthTest: false,
    opacity,
    toneMapped: false,
    color: 'white',
  });
  material.needsUpdate = true;
  __SHARED_SPRITE_MATERIALS.set(key, { material, refs: 1 });
  return material;
}

function releaseSpriteMaterial(tex: THREE.CanvasTexture, opacity: number) {
  const key = makeSpriteMaterialKey(tex, opacity);
  const hit = __SHARED_SPRITE_MATERIALS.get(key);
  if (!hit) return;
  hit.refs -= 1;
  if (hit.refs > 0) return;
  try { hit.material.dispose(); } catch {}
  __SHARED_SPRITE_MATERIALS.delete(key);
}

function makeUnsharedSpriteMaterial(tex: THREE.CanvasTexture, opacity: number) {
  const material = new THREE.SpriteMaterial({
    map: tex,
    transparent: true,
    depthWrite: false,
    depthTest: false,
    opacity,
    toneMapped: false,
    color: 'white',
  });
  material.needsUpdate = true;
  return material;
}

export function SpriteShape({
  avg,
  seed,
  orderIndex,
  position = [0, 0, 0],
  scale = 3.6,
  tileSize = 256,
  alpha = 215,
  blend = 1.0,
  opacity = 1,
  freezeParticles = true,
  particleFrames = 240,
  particleStepMs = 33,
  variantSlots = DEFAULT_VARIANT_SLOTS,
  variantSeed,
  darkMode = false,
}: {
  avg: number;
  seed?: string | number;
  orderIndex?: number;
  position?: [number, number, number];
  scale?: number;
  tileSize?: number;
  alpha?: number;
  blend?: number;
  opacity?: number;
  freezeParticles?: boolean;
  particleFrames?: number;
  particleStepMs?: number;
  variantSlots?: number;
  variantSeed?: string | number;
  darkMode?: boolean;
}) {

  const tShape = clamp01(Number.isFinite(avg) ? avg : 0.5);
  const { bucketId, bucketAvg } = quantizeAvgWithDownshift(avg);

  const shape: ShapeKey = React.useMemo(
    () => chooseShape({ avg: tShape, seed: seed ?? tShape, orderIndex }),
    [tShape, seed, orderIndex]
  );

  const TILE = Math.min(tileSize, 128);
  const dpr = resolveDpr(1);

  const wantsFrozen = !!(freezeParticles && PARTICLE_SHAPES.has(shape));
  const simulateMs = Math.max(0, particleFrames * particleStepMs);

  const vs = computeVisualStyle(bucketAvg);
  const alphaUse = vs.alpha ?? alpha;

  const variant = React.useMemo(() => {
    const vSeed = variantSeed ?? `${shape}|B${bucketId}|${seed ?? ''}|${orderIndex ?? 0}`;
    return pickVariantSlot(String(vSeed), Math.max(1, variantSlots));
  }, [shape, bucketId, seed, orderIndex, variantSeed, variantSlots]);

  const key = React.useMemo(() => {
    return wantsFrozen
      ? makeFrozenKey({
          shape,
          tileSize: TILE,
          dpr,
          alpha: alphaUse,
          simulateMs,
          stepMs: particleStepMs,
          bucketId,
          variant,
          darkMode,
        })
      : makeStaticKey({
          shape,
          tileSize: TILE,
          dpr,
          alpha: alphaUse,
          bucketId,
          variant,
          darkMode,
        });
  }, [wantsFrozen, shape, TILE, dpr, alphaUse, simulateMs, particleStepMs, bucketId, variant, darkMode]);

  const [texState, setTexState] = React.useState<{ key: string; tex: THREE.CanvasTexture | null }>(() => {
    const tex = wantsFrozen ? (getFrozenTexture(key) || null) : (getStaticTexture(key) || null);
    return { key, tex };
  });
  const tex = texState.key === key ? texState.tex : null;

  // Reset texture when dark mode changes so we request a new dark/light variant
  React.useEffect(() => {
    const nextTex = wantsFrozen ? (getFrozenTexture(key) || null) : (getStaticTexture(key) || null);
    setTexState({ key, tex: nextTex });
  }, [darkMode, key, wantsFrozen]);

  React.useEffect(() => {
    let cancelled = false;
    let off: (() => void) | undefined;
    let watchdog: any;

    const setIfAlive = (t: THREE.CanvasTexture | null) => {
      if (!cancelled && t) setTexState({ key, tex: track(t) });
    };

    const drawer = DRAWERS[shape];
    if (!drawer) return;

    if (tex) return;

    const footprint = FOOTPRINTS[shape] ?? { w: 1, h: 1 };
    const bleed = BLEED[shape];

    const common = {
      tileSize: TILE,
      dpr,
      alpha: alphaUse,
      liveAvg: bucketAvg,
      blend: (vs.blend ?? blend ?? 1.0),
      gradientRGB: vs.rgb,
      footprint,
      bleed,
      seedKey: `${key}|seed:${shape}|${variant}`,
    } as const;

    const requestStatic = () => {
      const sKey = makeStaticKey({
        shape,
        tileSize: TILE,
        dpr,
        alpha: alphaUse,
        bucketId,
        variant,
        darkMode,
      });

      const existing = textureRegistry.get(sKey);
      if (existing) {
        setIfAlive(existing);
        return () => {};
      }

      off = requestStaticTexture(
        {
          key: sKey,
          drawer,
          tileSize: TILE,
          dpr,
          alpha: alphaUse,
          gradientRGB: vs.rgb,
          liveAvg: bucketAvg,
          blend: vs.blend ?? blend ?? 1.0,
          footprint,
          bleed,
          seedKey: `${sKey}|seed:${shape}|${variant}`,
          prio: 0,
          darkMode,
        },
        (t) => setIfAlive(t)
      );

      return off;
    };

    if (wantsFrozen) {
      const cached = getFrozenTexture(key);
      if (cached) {
        setIfAlive(cached);
        return () => {};
      }

      off = requestFrozenTexture({
        key,
        shape,
        drawer,
        tileSize: TILE,
        dpr,
        alpha: alphaUse,
        bucketAvg,
        gradientRGB: vs.rgb,
        blend: (vs.blend ?? blend ?? 1.0),
        footprint,
        bleed,
        seedKey: common.seedKey,
        simulateMs,
        stepMs: particleStepMs,
        darkMode,
        onReady: (t) => setIfAlive(t),
        onFail: () => { requestStatic(); },
      });

      watchdog = setTimeout(() => {
        if (!cancelled && !getFrozenTexture(key) && !textureRegistry.get(key)) {
          requestStatic();
        }
      }, 1000);

      return () => {
        cancelled = true;
        if (off) off();
        if (watchdog) clearTimeout(watchdog);
      };
    }

    off = requestStaticTexture(
      {
        key,
        drawer,
        tileSize: TILE,
        dpr,
        alpha: alphaUse,
        gradientRGB: vs.rgb,
        liveAvg: bucketAvg,
        blend: (vs.blend ?? blend ?? 1.0),
        footprint,
        bleed,
        seedKey: common.seedKey,
        prio: 0,
        darkMode,
      },
      (t) => setIfAlive(t)
    );

    return () => {
      cancelled = true;
      if (off) off();
    };
  }, [
    key,
    tex,
    wantsFrozen,
    shape,
    TILE,
    dpr,
    alphaUse,
    bucketAvg,
    simulateMs,
    particleStepMs,
    variant,
    bucketId,
    blend,
    darkMode,
    vs.blend,
    vs.rgb,
  ]);

  const materialCacheDisabled = spriteMaterialCachingDisabled();
  const material = React.useMemo(() => {
    if (!tex) return null;
    return materialCacheDisabled
      ? makeUnsharedSpriteMaterial(tex, opacity)
      : acquireSpriteMaterial(tex, opacity);
  }, [tex, opacity, materialCacheDisabled]);
  React.useEffect(() => {
    if (!tex) return;
    return () => {
      if (materialCacheDisabled) {
        try { material?.dispose(); } catch {}
        return;
      }
      releaseSpriteMaterial(tex, opacity);
    };
  }, [tex, opacity, material, materialCacheDisabled]);

  if (!tex || !material) return null;

  const shapeScaleK = VISUAL_SCALE[shape] ?? 1;
  const finalScale = (scale ?? 1) * shapeScaleK;

  const iw = (tex.image as HTMLCanvasElement | HTMLImageElement | undefined)?.width ?? 1;
  const ih = (tex.image as HTMLCanvasElement | HTMLImageElement | undefined)?.height ?? 1;
  const maxSide = Math.max(iw, ih) || 1;
  const sx = finalScale * (iw / maxSide);
  const sy = finalScale * (ih / maxSide);

  const biasY = ANCHOR_BIAS_Y[shape] ?? 0;
  const pos = Array.isArray(position) ? ([...position] as [number, number, number]) : [0, 0, 0];
  pos[1] += sy * biasY;

  return (
    <sprite position={pos as any} scale={[sx, sy, 1]} renderOrder={5}>
      <primitive object={material} attach="material" dispose={null} />
    </sprite>
  );
}
