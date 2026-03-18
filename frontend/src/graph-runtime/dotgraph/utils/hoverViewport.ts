export type HoverViewportParams = {
  x: number;
  y: number;
  width: number;
  height: number;
  useDesktopLayout: boolean;
};

export function computeHoverViewportClass({
  x,
  y,
  width,
  height,
  useDesktopLayout,
}: HoverViewportParams): string {
  const isSmallScreen = width < 768;

  // Nudge vertical edge padding so bubbles don’t collide with top/bottom UI.
  const vEdge = isSmallScreen ? 100 : 150;

  const isTop = y < vEdge;
  const isBottom = y > height - vEdge;

  let cls = '';
  if (isTop) cls += ' is-top';
  if (isBottom) cls += ' is-bottom';

  // Tuning:
  const LEFT_EDGE_DESKTOP  = 0.22;  // leftmost 22%  → card opens rightward
  const RIGHT_EDGE_DESKTOP = 0.90;  // rightmost 10% → card opens leftward
  const LEFT_PCT_MOBILE    = 0.70;

  if (isSmallScreen || !useDesktopLayout) {
    cls += x < width * LEFT_PCT_MOBILE ? ' is-left' : ' is-right';
  } else {
    if (x > width * RIGHT_EDGE_DESKTOP) cls += ' is-right';
    else if (x < width * LEFT_EDGE_DESKTOP) cls += ' is-left';
    else cls += ' is-mid';
  }

  return cls.trim();
}
