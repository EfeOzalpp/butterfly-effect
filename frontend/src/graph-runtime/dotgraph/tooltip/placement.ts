// src/graph-runtime/dotgraph/tooltip/placement.ts

import { isMobileWidth } from "../../../lib/responsive/breakpoints";
import type { SpriteVisualLayout } from "../../sprites/types";

type TooltipVerticalPlacement = "top" | "middle" | "bottom";
type TooltipHorizontalPlacement = "left" | "mid" | "right";

export interface TooltipPlacement {
  vertical: TooltipVerticalPlacement;
  horizontal: TooltipHorizontalPlacement;
  className: string;
}

interface TooltipViewportParams {
  x: number;
  y: number;
  width: number;
  height: number;
  useDesktopLayout: boolean;
}

function classNameForPlacement(
  vertical: TooltipVerticalPlacement,
  horizontal: TooltipHorizontalPlacement
): string {
  const parts: string[] = [];
  if (vertical === "top") parts.push("is-top");
  if (vertical === "bottom") parts.push("is-bottom");
  parts.push(horizontal === "mid" ? "is-mid" : `is-${horizontal}`);
  return parts.join(" ");
}

function placement(
  vertical: TooltipVerticalPlacement,
  horizontal: TooltipHorizontalPlacement
): TooltipPlacement {
  return {
    vertical,
    horizontal,
    className: classNameForPlacement(vertical, horizontal),
  };
}

export function computeTooltipPlacement({
  x,
  y,
  width,
  height,
  useDesktopLayout,
}: TooltipViewportParams): TooltipPlacement {
  const isSmallScreen = isMobileWidth(width);

  if (isSmallScreen || !useDesktopLayout) {
    const xFrac = x / width;
    const yFrac = y / height;
    const vertical =
      yFrac < 0.33 ? "top" : yFrac > 0.67 ? "bottom" : "middle";

    const isVerticalEdge = vertical !== "middle";
    const leftEdge = isVerticalEdge ? 0.12 : 0.25;
    const rightEdge = isVerticalEdge ? 0.88 : 0.75;

    if (xFrac < leftEdge) return placement(vertical, "left");
    if (xFrac > rightEdge) return placement(vertical, "right");

    return placement(yFrac < 0.33 ? "top" : "bottom", "mid");
  }

  const vEdge = 150;
  const vertical =
    y < vEdge ? "top" : y > height - vEdge ? "bottom" : "middle";
  const horizontal =
    x > width * 0.84 ? "right" : x < width * 0.22 ? "left" : "mid";

  return placement(vertical, horizontal);
}

export function resolveTooltipAnchorCenterOffset(
  layout: SpriteVisualLayout
): [number, number, number] {
  const width = Math.max(0.0001, layout.scale[0]);
  const height = Math.max(0.0001, layout.scale[1]);
  const [centerX, centerY] = layout.center;
  const left = -centerX * width;
  const right = (1 - centerX) * width;
  const bottom = -centerY * height;
  const top = (1 - centerY) * height;

  return [(left + right) / 2, (bottom + top) / 2, 0];
}
