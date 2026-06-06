// src/canvas-engine/shared/responsiveness.ts

export type DeviceType = "mobile" | "tablet" | "laptop";

function normalizeViewportUnits(value: number) {
  return Math.max(0, Math.floor(value));
}

export function deviceType(w: number): DeviceType {
  const normalizedW = normalizeViewportUnits(w);
  if (normalizedW <= 767) return "mobile";
  if (normalizedW <= 1024) return "tablet";
  return "laptop";
}

// Returns a count multiplier < 1 when a touch device (tablet or mobile) is in
// landscape orientation, reducing the laptop-tier shape counts that would otherwise
// be assigned to a wide viewport on a physically small device.
// Returns 1 on non-touch devices or portrait orientation.
export function getLandscapeCountScale(): number {
  if (typeof window === "undefined" || typeof navigator === "undefined") return 1;
  const isTouch = navigator.maxTouchPoints > 1;
  if (!isTouch) return 1;
  const isLandscape = window.innerWidth > window.innerHeight;
  if (!isLandscape) return 1;
  const w = window.innerWidth;
  // Mobile landscape (narrow width) gets a lighter reduction than tablet landscape.
  return w <= 767 ? 0.6 : 0.8;
}

export function getViewportSize(): { w: number; h: number } {
  // Avoid crashing in SSR / tests
  if (typeof window === "undefined") return { w: 1024, h: 768 };
  return {
    w: normalizeViewportUnits(window.innerWidth),
    h: normalizeViewportUnits(window.innerHeight),
  };
}
