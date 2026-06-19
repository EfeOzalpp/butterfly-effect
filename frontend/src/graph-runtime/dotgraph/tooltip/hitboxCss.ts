import type { CSSProperties } from "react";

interface HitboxScreenSize {
  width: number;
  height: number;
}

type TooltipHitboxCssVars = CSSProperties & {
  "--hitbox-width-px": string;
  "--hitbox-height-px": string;
  "--hitbox-half-width-px": string;
  "--hitbox-half-height-px": string;
};

export const EMPTY_TOOLTIP_HITBOX_CSS_VARS: TooltipHitboxCssVars = {
  "--hitbox-width-px": "0px",
  "--hitbox-height-px": "0px",
  "--hitbox-half-width-px": "0px",
  "--hitbox-half-height-px": "0px",
};

export function hasResolvedHitboxSize(size: HitboxScreenSize): boolean {
  return Number.isFinite(size.width) && Number.isFinite(size.height) && size.width > 0 && size.height > 0;
}

export function resolveZoomEdgeGapPx(zoomFraction: number): number {
  const t = Math.max(0, Math.min(1, zoomFraction));
  return 1 + (15 - 1) * t;
}

export function makeTooltipHitboxCssVars({
  halfSize,
  zoomFraction,
  style,
}: {
  halfSize: HitboxScreenSize;
  zoomFraction: number;
  style: CSSProperties;
}): TooltipHitboxCssVars {
  const edgeGapPx = resolveZoomEdgeGapPx(zoomFraction);

  return {
    ...style,
    "--hitbox-width-px": `${String(halfSize.width * 2 + edgeGapPx)}px`,
    "--hitbox-height-px": `${String(halfSize.height * 2 + edgeGapPx)}px`,
    "--hitbox-half-width-px": `${String(halfSize.width)}px`,
    "--hitbox-half-height-px": `${String(halfSize.height)}px`,
  };
}
