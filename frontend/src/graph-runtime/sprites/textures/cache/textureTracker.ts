import type { CanvasTexture } from 'three';

// Global tracker for shared textures that need one route-level cleanup pass.
const __GLOBAL_TEX = new Set<CanvasTexture>();

export function trackTexture(tex: CanvasTexture): CanvasTexture {
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
