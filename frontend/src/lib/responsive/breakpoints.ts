export const VIEWPORT_BREAKPOINTS = {
  mobileMax: 767,
  tabletMin: 768,
  tabletMax: 1024,
  desktopMin: 1025,
} as const;

export type ViewportBand = "mobile" | "tablet" | "desktop";

export const DEFAULT_VIEWPORT_WIDTH = VIEWPORT_BREAKPOINTS.desktopMin;

export function viewportBandForWidth(width: number): ViewportBand {
  if (width <= VIEWPORT_BREAKPOINTS.mobileMax) return "mobile";
  if (width <= VIEWPORT_BREAKPOINTS.tabletMax) return "tablet";
  return "desktop";
}

export const isMobileWidth = (width: number): boolean =>
  viewportBandForWidth(width) === "mobile";

export const isTabletWidth = (width: number): boolean =>
  viewportBandForWidth(width) === "tablet";

export const isDesktopWidth = (width: number): boolean =>
  width >= VIEWPORT_BREAKPOINTS.desktopMin;
