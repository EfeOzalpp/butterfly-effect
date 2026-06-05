// graph-runtime/sprites/internal/spriteShape.tsx
/* eslint-disable react-hooks/refs, react-hooks/immutability, react-hooks/set-state-in-effect */
import * as React from 'react';
import {
  Frustum,
  Matrix4,
  Vector2,
  Vector3,
  type CanvasTexture,
  type Sprite,
  type SpriteMaterial,
} from 'three';
import { useFrame } from '@react-three/fiber';

import { computeVisualStyle } from "../../../canvas-engine/modifiers/color-modifiers/style";

import type { ShapeKey, SpriteShapeProps } from '../types';
import {
  chooseShape,
  quantizeAvgWithDownshift,
  pickVariantSlot,
  makeStaticKey,
  makeSpriteSeedKey,
  resolveDpr,
  DEFAULT_VARIANT_SLOTS,
  resolveSpriteAvgForDebug,
} from '../internal/spritePolicy';

import { DRAWERS } from '../selection/drawers';
import { houseHasChimney } from '../../../canvas-engine/shapes/house';
import {
  FOOTPRINTS,
  BLEED,
  PARTICLE_SHAPES,
  resolveParticleScaleBoost,
} from '../api/shapeProfiles';
import { deviceType, getViewportSize } from '../../../canvas-engine/shared/responsiveness';

import { makeTextureFromDrawer } from '../textures/makeTextureFromDrawer';
import {
  createParticleStore,
  type ParticleStore,
} from '../../../canvas-engine/modifiers/particles';

import {
  getStaticTexture,
  requestStaticTexture,
} from '../internal/spriteRuntime';
import {
  chooseSpriteTileForScreenSize,
  clampSpriteTileSize,
  maxSpriteTileSize,
  spriteQualityCheckFrameModulo,
  spriteQualityUpgradeDelayMs,
} from './spriteQuality';
import { registerEpochShape } from './epochScheduler';
import { spriteMaterialCachingDisabled } from '../../debug/spriteFlags';
import { bumpZoomMetric } from '../../debug/zoomMetrics';
import {
  PLACEHOLDER_MATERIAL,
  acquireSpriteMaterial,
  makeUnsharedSpriteMaterial,
  releaseSpriteMaterial,
} from './spriteMaterials';
import { computeSpriteWorldGeometry } from './spriteGeometry';
import { scheduleSpriteQualityUpgrade } from './qualityUpgradeScheduler';

function clamp01(v: number) {
  return Math.max(0, Math.min(1, v));
}

import { trackTexture } from '../textures/cache/textureTracker';
const track = trackTexture;

// Epoch textures are one-off refresh textures, so they should not enter the
// global tracker. Zeroing the canvas releases the 2D backing store too.
function releaseEpochTex(tex: CanvasTexture | null) {
  if (!tex) return;
  try {
    tex.dispose();
    if (tex.image instanceof HTMLCanvasElement) {
      // Keep dimensions valid for WebGL while still releasing the large 2D
      // backing store/context slot.
      tex.image.width = 1;
      tex.image.height = 1;
    }
  } catch {}
}

export function SpriteShape({
  avg,
  seed,
  orderIndex,
  position = [0, 0, 0],
  scale = 3.6,
  tileSize = 256,
  alpha: _alpha = 215,
  blend: _blend = 1.0,
  opacity = 1,
  variantSlots = DEFAULT_VARIANT_SLOTS,
  variantSeed,
  darkMode = false,
  occasionalRefreshMs = 0,
  worldPosition,
  centerAtPosition = false,
  suspendQualityUpdates = false,
  texturePriority = 0,
  assignment,
}: SpriteShapeProps) {

  // Assignment may come from the public sprite API. When it does, the component
  // follows that contract instead of picking a shape again locally.
  const effectiveAvg = resolveSpriteAvgForDebug(avg);
  const tShape = clamp01(Number.isFinite(effectiveAvg) ? effectiveAvg : 0.5);
  const _derived = quantizeAvgWithDownshift(effectiveAvg);
  const bucketId   = assignment?.bucketId  ?? _derived.bucketId;
  const bucketAvg  = assignment?.bucketAvg ?? _derived.bucketAvg;

  const shape: ShapeKey = React.useMemo(
    () => assignment?.shape ?? chooseShape({ avg: tShape, seed: seed ?? tShape, orderIndex }),
    // assignment is stable (cache hit) so this only re-runs if avg/seed/orderIndex change without an assignment
    [assignment, tShape, seed, orderIndex]
  );

  const dev = deviceType(getViewportSize().w);
  const baseTile = clampSpriteTileSize(tileSize, dev);
  const [qualityTileSize, setQualityTileSize] = React.useState(baseTile);
  const cancelQualityUpgradeRef = React.useRef<(() => void) | null>(null);
  const pendingQualityTileRef = React.useRef<number | null>(null);
  const qualityCheckModulo = spriteQualityCheckFrameModulo(dev);
  const TILE = qualityTileSize;
  const dpr = resolveDpr(1);
  const isVisibleRef = React.useRef(true);

  const clearPendingQualityUpgrade = React.useCallback(() => {
    cancelQualityUpgradeRef.current?.();
    cancelQualityUpgradeRef.current = null;
    pendingQualityTileRef.current = null;
  }, []);

  const scheduleQualityUpgrade = React.useCallback((nextTile: number) => {
    if (pendingQualityTileRef.current === nextTile) return;
    clearPendingQualityUpgrade();
    pendingQualityTileRef.current = nextTile;
    bumpZoomMetric('qualityUpgradeSchedules');
    cancelQualityUpgradeRef.current = scheduleSpriteQualityUpgrade({
      delayMs: spriteQualityUpgradeDelayMs(dev, orderIndex ?? 0),
      isVisible: () => isVisibleRef.current,
      apply: () => {
        const target = pendingQualityTileRef.current;
        cancelQualityUpgradeRef.current = null;
        pendingQualityTileRef.current = null;
        if (target) {
          bumpZoomMetric('qualityUpgradeApplies');
          setQualityTileSize((prev) => Math.max(prev, target));
        }
      },
    });
  }, [clearPendingQualityUpgrade, dev, orderIndex, setQualityTileSize]);

  React.useEffect(() => {
    const maxTile = maxSpriteTileSize(dev);
    if (qualityTileSize > maxTile) {
      clearPendingQualityUpgrade();
      setQualityTileSize(maxTile);
      return;
    }
    if (baseTile > qualityTileSize) {
      scheduleQualityUpgrade(baseTile);
      return;
    }
    if (pendingQualityTileRef.current !== null && pendingQualityTileRef.current <= baseTile) {
      clearPendingQualityUpgrade();
    }
  }, [baseTile, clearPendingQualityUpgrade, dev, qualityTileSize, scheduleQualityUpgrade]);

  const isParticleShape = PARTICLE_SHAPES.has(shape);

  const vs = computeVisualStyle(bucketAvg);
  const alphaUse = vs.alpha;

  const variant = React.useMemo(() => {
    if (assignment?.variant !== undefined) return assignment.variant;
    const seedPart = seed == null ? '' : String(seed);
    const vSeed = variantSeed ?? `${shape}|B${String(bucketId)}|${seedPart}|${String(orderIndex ?? 0)}`;
    return pickVariantSlot(String(vSeed), Math.max(1, variantSlots));
  }, [assignment, shape, bucketId, seed, orderIndex, variantSeed, variantSlots]);

  // Stagger dark-mode texture rebuilds by orderIndex so the queue isn't flooded
  // when the user toggles theme. CSS vars change instantly; shapes re-texture gradually.
  const [localDarkMode, setLocalDarkMode] = React.useState(darkMode);
  React.useEffect(() => {
    if (localDarkMode === darkMode) return;
    const delay = Math.min((orderIndex ?? 0) * 6, 1200);
    const id = setTimeout(() => { setLocalDarkMode(darkMode); }, delay);
    return () => { clearTimeout(id); };
  }, [darkMode]); // eslint-disable-line react-hooks/exhaustive-deps

  const stableSeedKey = React.useMemo(() => {
    return makeSpriteSeedKey({ shape, bucketId, variant });
  }, [shape, bucketId, variant]);

  const wantsEpochRefresh = React.useMemo(() => {
    if (shape === 'house') return houseHasChimney(stableSeedKey, bucketAvg);
    return true;
  }, [shape, stableSeedKey, bucketAvg]);

  const [refreshEpoch, setRefreshEpoch] = React.useState(0);
  const setRefreshEpochRef = React.useRef(setRefreshEpoch);
  React.useEffect(() => { setRefreshEpochRef.current = setRefreshEpoch; }, [setRefreshEpoch]);

  React.useEffect(() => {
    if (!occasionalRefreshMs || !wantsEpochRefresh) return;
    return registerEpochShape({
      isVisible: () => isVisibleRef.current && fogOpacityRef.current > 0.72,
      tick: () => { setRefreshEpochRef.current((e) => e + 1); },
      intervalMs: occasionalRefreshMs,
    });
  }, [occasionalRefreshMs, wantsEpochRefresh]);

  const key = React.useMemo(() => {
    const staticBase = makeStaticKey({
      shape,
      tileSize: TILE,
      dpr,
      alpha: alphaUse,
      bucketId,
      variant,
      darkMode: localDarkMode,
      pixelScaleBoost: resolveParticleScaleBoost(shape, dev),
      footprint: FOOTPRINTS[shape],
      bleed: BLEED[shape],
    });
    if (refreshEpoch > 0) return `${staticBase}|e:${String(refreshEpoch)}`;
    return staticBase;
  }, [shape, TILE, dpr, alphaUse, bucketId, variant, localDarkMode, refreshEpoch, dev]);

  const [texState, setTexState] = React.useState<{ key: string; tex: CanvasTexture | null }>(() => {
    const tex = getStaticTexture(key) ?? null;
    return { key, tex };
  });
  const tex = texState.key === key ? texState.tex : null;
  const prevTexRef = React.useRef<CanvasTexture | null>(null);
  const prevTexShapeRef = React.useRef<ShapeKey | null>(null);
  React.useEffect(() => {
    if (tex) {
      prevTexRef.current = tex;
      prevTexShapeRef.current = shape;
    }
  }, [tex, shape]);
  // Only reuse prev texture if it's the same shape — cross-shape fallback shows the wrong sprite
  const displayTex = tex ?? (prevTexShapeRef.current === shape ? prevTexRef.current : null);

  // Reset texture when dark mode changes so we request a new dark/light variant
  React.useEffect(() => {
    const nextTex = getStaticTexture(key) ?? null;
    setTexState({ key, tex: nextTex });
  }, [localDarkMode, key]);

  React.useEffect(() => {
    let cancelled = false;

    const setIfAlive = (t: CanvasTexture | null) => {
      if (!cancelled && t) {
        setTexState({ key, tex: track(t) });
      }
    };

    const drawer = DRAWERS[shape];
    if (!drawer) return;

    if (tex) return;

    const footprint = FOOTPRINTS[shape];
    const bleed = BLEED[shape];
    const isRetexture = prevTexShapeRef.current === shape && prevTexRef.current !== null;
    const isBackgroundTextureRequest = isRetexture || texturePriority <= 0;

    const common = {
      tileSize: TILE,
      dpr,
      alpha: alphaUse,
      liveAvg: bucketAvg,
      blend: vs.blend,
      gradientRGB: vs.rgb,
      footprint,
      bleed,
      seedKey: stableSeedKey,
    } as const;

    // Epoch refreshes: build texture directly, bypassing the registry entirely.
    // IMPORTANT: epoch textures must NOT go through track()/setIfAlive because
    // __GLOBAL_TEX would pin them in memory forever. Instead we manage their
    // lifecycle manually via epochTexRef so the canvas 2D context slot is released
    // on each cycle (Chrome hard-caps at ~300 contexts → GPU process crash otherwise).
    if (refreshEpoch > 0) {
      const prevEpochTex = epochTexRef.current;
      try {
        const nowMs = typeof performance !== 'undefined' ? performance.now() : Date.now();
        const particleStoreKey = [
          shape,
          stableSeedKey,
          bucketId,
          variant,
          localDarkMode ? 1 : 0,
          TILE,
          dpr,
          alphaUse,
          resolveParticleScaleBoost(shape, dev) ?? 1,
        ].join('|');

        if (isParticleShape && epochParticleKeyRef.current !== particleStoreKey) {
          epochParticleStoreRef.current?.clear();
          epochParticleStoreRef.current = createParticleStore();
          epochParticleKeyRef.current = particleStoreKey;
          epochParticleTimeRef.current = null;
        }

        const lastParticlePaintMs = epochParticleTimeRef.current;
        const dtSec = lastParticlePaintMs == null
          ? 1 / 60
          : (nowMs - lastParticlePaintMs) / 1000;

        const newTex = makeTextureFromDrawer({
          drawer,
          tileSize: TILE,
          dpr,
          alpha: alphaUse,
          gradientRGB: vs.rgb,
          liveAvg: bucketAvg,
          blend: vs.blend,
          footprint,
          bleed,
          seedKey: common.seedKey,
          darkMode: localDarkMode,
          pixelScaleBoost: resolveParticleScaleBoost(shape, dev),
          timeMs: nowMs,
          dtSec,
          particleStore: isParticleShape ? epochParticleStoreRef.current ?? undefined : undefined,
        });
        if (isParticleShape) epochParticleTimeRef.current = nowMs;
        epochTexRef.current = newTex;
        // Bypass track() — set state directly so this texture is NOT pinned in __GLOBAL_TEX
        setTexState({ key, tex: newTex });
        // Dispose prev after the next frame (GPU has already uploaded it; zeroing the
        // canvas releases the 2D context slot without affecting the rendered output)
        if (prevEpochTex) requestAnimationFrame(() => { releaseEpochTex(prevEpochTex); });
      } catch {}
      return () => { cancelled = true; };
    }

    const off = requestStaticTexture(
      {
        key,
        drawer,
        tileSize: TILE,
        dpr,
        alpha: alphaUse,
        gradientRGB: vs.rgb,
        liveAvg: bucketAvg,
        blend: vs.blend,
        footprint,
        bleed,
        seedKey: common.seedKey,
        prio: texturePriority,
        darkMode: localDarkMode,
        pixelScaleBoost: resolveParticleScaleBoost(shape, dev),
        background: isBackgroundTextureRequest,
      },
      (t) => { setIfAlive(t); }
    );

    return () => {
      cancelled = true;
      off();
    };
  }, [
    key,
    tex,
    shape,
    TILE,
    dpr,
    alphaUse,
    bucketAvg,
    variant,
    bucketId,
    localDarkMode,
    vs.blend,
    vs.rgb,
    refreshEpoch,
    stableSeedKey,
    isParticleShape,
    dev,
    texturePriority,
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

  const basePosition: [number, number, number] = Array.isArray(position)
    ? ([...position] as [number, number, number])
    : [0, 0, 0];
  const spriteGeometry = computeSpriteWorldGeometry({
    shape,
    basePosition,
    scale,
    applyVisualOffsets: !centerAtPosition,
    assignment,
  });
  const sx = spriteGeometry.width;
  const sy = spriteGeometry.height;
  const spriteCenter = React.useMemo(
    () => new Vector2(spriteGeometry.center[0], spriteGeometry.center[1]),
    [spriteGeometry.center]
  );

  const materialRef = React.useRef<SpriteMaterial | null>(null);
  React.useEffect(() => { materialRef.current = material; }, [material]);
  const spriteRef = React.useRef<Sprite | null>(null);
  const _wp = React.useRef(new Vector3());
  const _frustum = React.useRef(new Frustum());
  const _projScreenMatrix = React.useRef(new Matrix4());
  const fogOpacityRef = React.useRef(1);
  const smoothZoomFadeRef = React.useRef(0);
  const smoothFogTRef = React.useRef(0);
  const epochTexRef = React.useRef<CanvasTexture | null>(null);
  const epochParticleStoreRef = React.useRef<ParticleStore | null>(null);
  const epochParticleKeyRef = React.useRef<string | null>(null);
  const epochParticleTimeRef = React.useRef<number | null>(null);
  const qualityCheckFrameRef = React.useRef((orderIndex ?? 0) % qualityCheckModulo);
  React.useEffect(() => {
    return () => {
      cancelQualityUpgradeRef.current?.();
      pendingQualityTileRef.current = null;
      releaseEpochTex(epochTexRef.current);
      epochParticleStoreRef.current?.clear();
    };
  }, []);

  useFrame(({ camera }) => {
    const spr = spriteRef.current;
    if (spr) {
      spr.getWorldPosition(_wp.current);
      _projScreenMatrix.current.multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse);
      _frustum.current.setFromProjectionMatrix(_projScreenMatrix.current);
      isVisibleRef.current = _frustum.current.containsPoint(_wp.current);
    }

    if (!suspendQualityUpdates && spr && isVisibleRef.current) {
      qualityCheckFrameRef.current = (qualityCheckFrameRef.current + 1) % qualityCheckModulo;
      if (qualityCheckFrameRef.current === 0) {
        bumpZoomMetric('qualityChecks');
        const distance = Math.max(0.001, camera.position.distanceTo(_wp.current));
        const height = typeof window !== 'undefined' ? window.innerHeight || 1 : 1;
        const fov = 'fov' in camera && typeof camera.fov === 'number' ? camera.fov : 50;
        const fovRad = (fov * Math.PI) / 180;
        const worldPerPxY = (2 * Math.tan(fovRad / 2) * distance) / height;
        const screenPx = Math.max(sx, sy) / Math.max(1e-6, worldPerPxY);
        const nextTile = chooseSpriteTileForScreenSize(screenPx, qualityTileSize, baseTile, dev);
        if (nextTile < qualityTileSize) {
          clearPendingQualityUpgrade();
          bumpZoomMetric('qualityDowngrades');
          setQualityTileSize(nextTile);
        } else if (nextTile > qualityTileSize && pendingQualityTileRef.current !== nextTile) {
          scheduleQualityUpgrade(nextTile);
        }
      }
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
    // Fade fog out entirely when camera is close; thresholds match scene minRadius (~20).
    const rawZoomFade = Math.max(0, Math.min(1, (cameraToOrigin - 25) / 50));
    smoothZoomFadeRef.current += (rawZoomFade - smoothZoomFadeRef.current) * 0.07;
    const zoomFade = smoothZoomFadeRef.current;
    const fogStrength = 0.74;
    const minOpacity = 0.34;
    const newOpacity = Math.max(minOpacity, 1.0 - t * fogStrength * zoomFade);
    fogOpacityRef.current = newOpacity;
    if (Math.abs(mat.opacity - newOpacity) > 0.004) mat.opacity = newOpacity;
  });

  if (!displayTex) return null;

  return (
    <sprite
      ref={spriteRef}
      position={spriteGeometry.position}
      scale={spriteGeometry.scale}
      center={spriteCenter}
      renderOrder={5}
    >
      <primitive object={material ?? PLACEHOLDER_MATERIAL} attach="material" dispose={null} />
    </sprite>
  );
}
