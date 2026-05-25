export interface PixelBounds {
  x: number;
  y: number;
  w: number;
  h: number;
}

function safeDpr(dpr: number) {
  return Number.isFinite(dpr) && dpr > 0 ? dpr : 1;
}

// Offscreen shape caches have to land on the same device-pixel grid as the
// live canvas. Otherwise fractional DPR screens can make the baked pass drift
// by a pixel compared with the vector color pass.
export function snapBoundsToDevicePixels(bounds: PixelBounds, dpr: number): PixelBounds {
  const ratio = safeDpr(dpr);
  const left = Math.floor(bounds.x * ratio);
  const top = Math.floor(bounds.y * ratio);
  const right = Math.ceil((bounds.x + bounds.w) * ratio);
  const bottom = Math.ceil((bounds.y + bounds.h) * ratio);

  return {
    x: left / ratio,
    y: top / ratio,
    w: Math.max(1, right - left) / ratio,
    h: Math.max(1, bottom - top) / ratio,
  };
}

export function pixelSizeForBounds(bounds: PixelBounds, dpr: number) {
  const ratio = safeDpr(dpr);
  const pixelW = Math.max(1, Math.round(bounds.w * ratio));
  const pixelH = Math.max(1, Math.round(bounds.h * ratio));
  return {
    pixelW,
    pixelH,
    pixels: pixelW * pixelH,
  };
}
