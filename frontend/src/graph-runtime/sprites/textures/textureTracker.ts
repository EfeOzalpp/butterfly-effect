import * as THREE from 'three';

const __GLOBAL_TEX = new Set<THREE.CanvasTexture>();

export function trackTexture(tex: THREE.CanvasTexture): THREE.CanvasTexture {
  __GLOBAL_TEX.add(tex);
  return tex;
}

export function disposeAllTrackedTextures() {
  try {
    for (const t of __GLOBAL_TEX) {
      try { t.dispose(); } catch {}
    }
  } catch {}
  __GLOBAL_TEX.clear();
}
