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
  let cls = '';

  if (isSmallScreen || !useDesktopLayout) {
    const xFrac = x / width;
    const yFrac = y / height;

    if (xFrac < 0.25) {
      cls = 'is-left';
    } else if (xFrac > 0.75) {
      cls = 'is-right';
    } else {
      // middle horizontal band - vertical position decides top vs bottom
      cls = yFrac < 0.33 ? 'is-top is-mid' : 'is-bottom is-mid';
    }
  } else {
    // Desktop: pixel-based edge detection
    const vEdge = 150;
    if (y < vEdge) cls += ' is-top';
    if (y > height - vEdge) cls += ' is-bottom';

    if (x > width * 0.84) cls += ' is-right';
    else if (x < width * 0.22) cls += ' is-left';
    else cls += ' is-mid';
  }

  return cls.trim();
}
