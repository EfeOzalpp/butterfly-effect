import {
  SpriteMaterial,
  type CanvasTexture,
} from 'three';

export const PLACEHOLDER_MATERIAL = new SpriteMaterial({
  transparent: true,
  opacity: 0.24,
  color: '#a6a6a6',
  depthWrite: false,
  depthTest: false,
  toneMapped: false,
});

interface SharedMaterialEntry {
  material: SpriteMaterial;
  refs: number;
}

const SHARED_SPRITE_MATERIALS = new Map<string, SharedMaterialEntry>();

function makeSpriteMaterialKey(tex: CanvasTexture, opacity: number) {
  return [
    tex.uuid,
    opacity,
    0,
    0,
    0,
    'white',
  ].join('|');
}

export function acquireSpriteMaterial(tex: CanvasTexture, opacity: number) {
  const key = makeSpriteMaterialKey(tex, opacity);
  const hit = SHARED_SPRITE_MATERIALS.get(key);
  if (hit) {
    hit.refs += 1;
    return hit.material;
  }

  const material = new SpriteMaterial({
    map: tex,
    transparent: true,
    depthWrite: false,
    depthTest: false,
    opacity,
    toneMapped: false,
    color: 'white',
  });
  material.needsUpdate = true;
  SHARED_SPRITE_MATERIALS.set(key, { material, refs: 1 });
  return material;
}

export function releaseSpriteMaterial(tex: CanvasTexture, opacity: number) {
  const key = makeSpriteMaterialKey(tex, opacity);
  const hit = SHARED_SPRITE_MATERIALS.get(key);
  if (!hit) return;
  hit.refs -= 1;
  if (hit.refs > 0) return;
  try { hit.material.dispose(); } catch {}
  SHARED_SPRITE_MATERIALS.delete(key);
}

export function makeUnsharedSpriteMaterial(tex: CanvasTexture, opacity: number) {
  const material = new SpriteMaterial({
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
