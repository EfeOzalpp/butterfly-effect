// graph-runtime/sprites/api/spriteShape.tsx
import * as React from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';

import { computeVisualStyle } from "../../../canvas-engine/modifiers/color-modifiers/style";

import type { ShapeKey } from '../selection/types';
import { chooseShape, quantizeAvgWithDownshift, pickVariantSlot, makeStaticKey, makeFrozenKey, resolveDpr, DEFAULT_VARIANT_SLOTS, type ShapeAssignment } from '../internal/spritePolicy';

import { DRAWERS } from '../selection/drawers';
import { houseHasChimney } from '../../../canvas-engine/shapes/house.js';
import { FOOTPRINTS, BLEED, VISUAL_SCALE, ANCHOR_BIAS_Y, PARTICLE_SHAPES, resolveParticleScaleBoost } from '../selection/footprints';
import { deviceType, getViewportSize } from '../../../canvas-engine/shared/responsiveness';

import { textureRegistry } from '../textures/registry';
import { makeTextureFromDrawer } from '../textures/makeTextureFromDrawer';

import {
  getStaticTexture,
  getFrozenTexture,
  requestStaticTexture,
  requestFrozenTexture,
} from '../internal/spriteRuntime';
import { onceQueueIdle } from '../textures/queue';
import { registerEpochShape } from './epochScheduler';
import { spriteMaterialCachingDisabled } from './debug-flags';

function clamp01(v: number) {
  return Math.max(0, Math.min(1, v));
}

const PLACEHOLDER_MATERIAL = new THREE.SpriteMaterial({
  transparent: true,
  opacity: 0.24,
  color: '#a6a6a6',
  depthWrite: false,
  depthTest: false,
  toneMapped: false,
});

import { trackTexture } from '../textures/textureTracker';
const track = trackTexture;

/** Dispose an epoch texture fully: zeros its canvas backing store (releases 2D context
 *  slot) then disposes the WebGL handle. Epoch textures must NOT go through track() so
 *  they're not pinned in __GLOBAL_TEX and can be GC'd after this call. */
function releaseEpochTex(tex: THREE.CanvasTexture | null) {
  if (!tex) return;
  try {
    if (tex.image instanceof HTMLCanvasElement) {
      tex.image.width = 0;   // releases 2D backing store + context slot
      tex.image.height = 0;
    }
    tex.dispose();
  } catch {}
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
  occasionalRefreshMs = 0,
  worldPosition,
  assignment,
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
  occasionalRefreshMs?: number;
  worldPosition?: [number, number, number];
  assignment?: ShapeAssignment;
}) {

  const tShape = clamp01(Number.isFinite(avg) ? avg : 0.5);
  const _derived = quantizeAvgWithDownshift(avg);
  const bucketId   = assignment?.bucketId  ?? _derived.bucketId;
  const bucketAvg  = assignment?.bucketAvg ?? _derived.bucketAvg;

  const shape: ShapeKey = React.useMemo(
    () => assignment?.shape ?? chooseShape({ avg: tShape, seed: seed ?? tShape, orderIndex }),
    // assignment is stable (cache hit) so this only re-runs if avg/seed/orderIndex change without an assignment
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [assignment, tShape, seed, orderIndex]
  );

  const TILE = Math.min(tileSize, 128);
  const dpr = resolveDpr(1);
  const dev = deviceType(getViewportSize().w);

  const isParticleShape = PARTICLE_SHAPES.has(shape);
  const [animationReady, setAnimationReady] = React.useState(false);
  const wantsFrozen = !!(animationReady && freezeParticles && isParticleShape);
  const simulateMs = Math.max(0, particleFrames * particleStepMs);

  const vs = computeVisualStyle(bucketAvg);
  const alphaUse = vs.alpha ?? alpha;

  const variant = React.useMemo(() => {
    if (assignment?.variant !== undefined) return assignment.variant;
    const vSeed = variantSeed ?? `${shape}|B${bucketId}|${seed ?? ''}|${orderIndex ?? 0}`;
    return pickVariantSlot(String(vSeed), Math.max(1, variantSlots));
  }, [assignment, shape, bucketId, seed, orderIndex, variantSeed, variantSlots]);

  // Stagger dark-mode texture rebuilds by orderIndex so the queue isn't flooded
  // when the user toggles theme. CSS vars change instantly; shapes re-texture gradually.
  const [localDarkMode, setLocalDarkMode] = React.useState(darkMode);
  React.useEffect(() => {
    if (localDarkMode === darkMode) return;
    const delay = Math.min((orderIndex ?? 0) * 6, 1200);
    const id = setTimeout(() => setLocalDarkMode(darkMode), delay);
    return () => clearTimeout(id);
  }, [darkMode]); // eslint-disable-line react-hooks/exhaustive-deps

  const stableSeedKey = React.useMemo(() => {
    const base = makeStaticKey({ shape, tileSize: TILE, dpr, alpha: alphaUse, bucketId, variant, darkMode: localDarkMode, pixelScaleBoost: resolveParticleScaleBoost(shape, dev) });
    return `${base}|seed:${shape}|${variant}`;
  }, [shape, TILE, dpr, alphaUse, bucketId, variant, localDarkMode]);

  const wantsEpochRefresh = React.useMemo(() => {
    if (shape === 'house') return houseHasChimney(stableSeedKey);
    return true;
  }, [shape, stableSeedKey]);

  const [refreshEpoch, setRefreshEpoch] = React.useState(0);
  const isVisibleRef = React.useRef(true);
  const setRefreshEpochRef = React.useRef(setRefreshEpoch);
  React.useEffect(() => { setRefreshEpochRef.current = setRefreshEpoch; }, [setRefreshEpoch]);

  React.useEffect(() => {
    if (!occasionalRefreshMs || !wantsEpochRefresh) return;
    return registerEpochShape({
      isVisible: () => isVisibleRef.current && fogOpacityRef.current > 0.72,
      tick: () => setRefreshEpochRef.current((e) => e + 1),
      intervalMs: occasionalRefreshMs,
    });
  }, [occasionalRefreshMs, wantsEpochRefresh]);

  const key = React.useMemo(() => {
    const staticBase = makeStaticKey({ shape, tileSize: TILE, dpr, alpha: alphaUse, bucketId, variant, darkMode: localDarkMode, pixelScaleBoost: resolveParticleScaleBoost(shape, dev) });
    // Epoch refreshes always use cheap static textures — frozen rebuilds are too expensive
    if (refreshEpoch > 0) return `${staticBase}|e:${refreshEpoch}`;
    return wantsFrozen
      ? makeFrozenKey({ shape, tileSize: TILE, dpr, alpha: alphaUse, simulateMs, stepMs: particleStepMs, bucketId, variant, darkMode: localDarkMode })
      : staticBase;
  }, [wantsFrozen, shape, TILE, dpr, alphaUse, simulateMs, particleStepMs, bucketId, variant, localDarkMode, refreshEpoch]);

  const [texState, setTexState] = React.useState<{ key: string; tex: THREE.CanvasTexture | null }>(() => {
    const tex = wantsFrozen ? (getFrozenTexture(key) || null) : (getStaticTexture(key) || null);
    return { key, tex };
  });
  const tex = texState.key === key ? texState.tex : null;
  const prevTexRef = React.useRef<THREE.CanvasTexture | null>(null);
  const prevTexShapeRef = React.useRef<ShapeKey | null>(null);
  React.useEffect(() => {
    if (tex) {
      prevTexRef.current = tex;
      prevTexShapeRef.current = shape;
    }
  }, [tex, shape]);
  // Only reuse prev texture if it's the same shape — cross-shape fallback shows the wrong sprite
  const displayTex = tex ?? (prevTexShapeRef.current === shape ? prevTexRef.current : null);

  // Once static texture is loaded, wait for the static queue to go idle, then stagger frozen upgrade
  React.useEffect(() => {
    if (animationReady || !isParticleShape || !tex) return;
    let timerId: ReturnType<typeof setTimeout> | undefined;
    let cancelled = false;
    const offIdle = onceQueueIdle(() => {
      if (cancelled) return;
      timerId = setTimeout(() => setAnimationReady(true), ((orderIndex ?? 0) % 300) * 10);
    });
    return () => {
      cancelled = true;
      offIdle();
      if (timerId !== undefined) clearTimeout(timerId);
    };
  }, [animationReady, isParticleShape, tex, orderIndex]);

  // Reset texture when dark mode changes so we request a new dark/light variant
  React.useEffect(() => {
    const nextTex = wantsFrozen ? (getFrozenTexture(key) || null) : (getStaticTexture(key) || null);
    setTexState({ key, tex: nextTex });
  }, [localDarkMode, key, wantsFrozen]);

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
      seedKey: stableSeedKey,
    } as const;

    const requestStatic = () => {
      const sKey = makeStaticKey({
        shape,
        tileSize: TILE,
        dpr,
        alpha: alphaUse,
        bucketId,
        variant,
        darkMode: localDarkMode,
        pixelScaleBoost: resolveParticleScaleBoost(shape, dev),
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
          darkMode: localDarkMode,
          pixelScaleBoost: resolveParticleScaleBoost(shape, dev),
        },
        (t) => setIfAlive(t)
      );

      return off;
    };

    if (wantsFrozen && refreshEpoch === 0) {
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
        darkMode: localDarkMode,
        background: true,
        pixelScaleBoost: resolveParticleScaleBoost(shape, dev),
        onReady: (t) => setIfAlive(t),
        onFail: () => { requestStatic(); },
      });

      if (refreshEpoch === 0) {
        watchdog = setTimeout(() => {
          if (!cancelled && !getFrozenTexture(key) && !textureRegistry.get(key)) {
            requestStatic();
          }
        }, 1000);
      }

      return () => {
        cancelled = true;
        if (off) off();
        if (watchdog) clearTimeout(watchdog);
      };
    }

    // Epoch refreshes: build texture directly, bypassing the registry entirely.
    // IMPORTANT: epoch textures must NOT go through track()/setIfAlive because
    // __GLOBAL_TEX would pin them in memory forever. Instead we manage their
    // lifecycle manually via epochTexRef so the canvas 2D context slot is released
    // on each cycle (Chrome hard-caps at ~300 contexts → GPU process crash otherwise).
    if (refreshEpoch > 0) {
      const prevEpochTex = epochTexRef.current;
      try {
        const newTex = makeTextureFromDrawer({
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
          darkMode: localDarkMode,
          pixelScaleBoost: resolveParticleScaleBoost(shape, dev),
        });
        epochTexRef.current = newTex;
        // Bypass track() — set state directly so this texture is NOT pinned in __GLOBAL_TEX
        if (!cancelled) setTexState({ key, tex: newTex });
        // Dispose prev after the next frame (GPU has already uploaded it; zeroing the
        // canvas releases the 2D context slot without affecting the rendered output)
        if (prevEpochTex) requestAnimationFrame(() => releaseEpochTex(prevEpochTex));
      } catch {}
      return () => { cancelled = true; };
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
        darkMode: localDarkMode,
        pixelScaleBoost: resolveParticleScaleBoost(shape, dev),
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
    localDarkMode,
    vs.blend,
    vs.rgb,
    refreshEpoch,
  ]);

  const materialCacheDisabled = spriteMaterialCachingDisabled() || !!worldPosition;
  const material = React.useMemo(() => {
    if (!displayTex) return null;
    return materialCacheDisabled
      ? makeUnsharedSpriteMaterial(displayTex, opacity)
      : acquireSpriteMaterial(displayTex, opacity);
  }, [displayTex, opacity, materialCacheDisabled]);
  React.useEffect(() => {
    if (!displayTex) return;
    return () => {
      if (materialCacheDisabled) {
        try { material?.dispose(); } catch {}
        return;
      }
      releaseSpriteMaterial(displayTex, opacity);
    };
  }, [displayTex, opacity, material, materialCacheDisabled]);

  const materialRef = React.useRef<THREE.SpriteMaterial | null>(null);
  React.useEffect(() => { materialRef.current = material; }, [material]);
  const spriteRef = React.useRef<THREE.Sprite | null>(null);
  const _wp = React.useRef(new THREE.Vector3());
  const _frustum = React.useRef(new THREE.Frustum());
  const _projScreenMatrix = React.useRef(new THREE.Matrix4());
  const fogOpacityRef = React.useRef(1);
  const smoothZoomFadeRef = React.useRef(0);
  const smoothFogTRef = React.useRef(0);
  const epochTexRef = React.useRef<THREE.CanvasTexture | null>(null);
  React.useEffect(() => {
    return () => { releaseEpochTex(epochTexRef.current); };
  }, []);

  useFrame(({ camera }) => {
    const spr = spriteRef.current;
    if (spr) {
      spr.getWorldPosition(_wp.current);
      _projScreenMatrix.current.multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse);
      _frustum.current.setFromProjectionMatrix(_projScreenMatrix.current);
      isVisibleRef.current = _frustum.current.containsPoint(_wp.current);
    }

    const mat = materialRef.current;
    if (!mat || !spr || !worldPosition) return;
    const cameraToOrigin = camera.position.length();
    // Project shape onto camera's forward axis (view-space depth)
    // This fogs only truly back-facing shapes, not off-axis side shapes
    const invLen = 1 / Math.max(0.001, cameraToOrigin);
    const fwdX = -camera.position.x * invLen;
    const fwdY = -camera.position.y * invLen;
    const fwdZ = -camera.position.z * invLen;
    const depth = (_wp.current.x - camera.position.x) * fwdX
                + (_wp.current.y - camera.position.y) * fwdY
                + (_wp.current.z - camera.position.z) * fwdZ;
    const fogNear = cameraToOrigin + 1.5;
    const fogFar  = cameraToOrigin + 24;
    const fogTRaw = Math.max(0, Math.min(1, (depth - fogNear) / Math.max(1, fogFar - fogNear)));
    smoothFogTRef.current += (fogTRaw - smoothFogTRef.current) * 0.10;
    const t = smoothFogTRef.current * smoothFogTRef.current * (3 - 2 * smoothFogTRef.current);
    // Fade fog out entirely when camera is close — thresholds match scene minRadius (~20)
    const rawZoomFade = Math.max(0, Math.min(1, (cameraToOrigin - 25) / 50));
    smoothZoomFadeRef.current += (rawZoomFade - smoothZoomFadeRef.current) * 0.07;
    const zoomFade = smoothZoomFadeRef.current;
    const fogStrength = 0.74;
    const minOpacity = 0.34;
    const newOpacity = Math.max(minOpacity, 1.0 - t * fogStrength * zoomFade);
    fogOpacityRef.current = newOpacity;
    if (Math.abs(mat.opacity - newOpacity) > 0.004) mat.opacity = newOpacity;
  });

  if (!displayTex || !material) return null;

  const shapeScaleK = VISUAL_SCALE[shape] ?? 1;
  const finalScale = (scale ?? 1) * shapeScaleK;

  // Use footprint+bleed constants for stable scale — texture swaps never cause size jumps
  const fp = FOOTPRINTS[shape] ?? { w: 1, h: 1 };
  const bl = BLEED[shape] ?? {};
  const totalW = fp.w + (bl.left ?? 0) + (bl.right ?? 0);
  const totalH = fp.h + (bl.top ?? 0) + (bl.bottom ?? 0);
  const maxSide = Math.max(totalW, totalH) || 1;
  const sx = finalScale * (totalW / maxSide);
  const sy = finalScale * (totalH / maxSide);

  const biasY = ANCHOR_BIAS_Y[shape] ?? 0;
  const pos = Array.isArray(position) ? ([...position] as [number, number, number]) : [0, 0, 0];
  pos[1] += sy * biasY;

  return (
    <sprite ref={spriteRef as any} position={pos as any} scale={[sx, sy, 1]} renderOrder={5}>
      <primitive object={material ?? PLACEHOLDER_MATERIAL} attach="material" dispose={null} />
    </sprite>
  );
}
