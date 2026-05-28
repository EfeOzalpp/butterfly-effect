// src/graph-runtime/dotgraph/camera/compute/tooltipOffset.ts
export function computeTooltipOffsetPx(params: {
  width: number;
  height: number;
  radius: number;
  minRadius: number;
  maxRadius: number;
  dynamicOffset: number;
  useMobilePortraitCurve?: boolean;
}) {
  const {
    width,
    height,
    radius,
    minRadius,
    maxRadius,
    dynamicOffset,
    useMobilePortraitCurve = false,
  } = params;

  const isPortrait = height > width;
  const usePortraitCurve = isPortrait && useMobilePortraitCurve;
  const zoomedInOffset = usePortraitCurve ? 190 : isPortrait ? 160 : 236;

  const denom = Math.max(1e-6, maxRadius - minRadius);
  const zf = Math.max(0, Math.min(1, (radius - minRadius) / denom));

  const clamp01 = (t: number) => Math.max(0, Math.min(1, t));
  const nonlinearLerp = (a: number, b: number, t: number) => {
    const x = clamp01(t);
    return a + (b - a) * (1 - Math.pow(1 - x, 12));
  };

  const target = Number.isFinite(dynamicOffset) ? dynamicOffset : 120;

  const offset = nonlinearLerp(zoomedInOffset, target, zf);
  if (usePortraitCurve) return remapOffset(offset, PORTRAIT_OFFSET_STOPS);
  if (isPortrait) return offset;

  return remapOffset(offset, LANDSCAPE_OFFSET_STOPS);
}

const PORTRAIT_OFFSET_STOPS = [
  { input: 0, output: 0 },
  { input: 126, output: 134 },
  { input: 129, output: 140 },
  { input: 137, output: 158 },
  { input: 150, output: 174 },
  { input: 170, output: 186 },
  { input: 190, output: 190 },
] as const;

const LANDSCAPE_OFFSET_STOPS = [
  { input: 0, output: 0 },
  { input: 94, output: 100 },
  { input: 122, output: 114 },
  { input: 192, output: 158 },
  { input: 205, output: 170 },
  { input: 236, output: 236 },
] as const;

function remapOffset(
  offset: number,
  stops: readonly { input: number; output: number }[]
): number {
  for (let i = 1; i < stops.length; i += 1) {
    const prev = stops[i - 1];
    const next = stops[i];
    if (offset > next.input) continue;

    const span = next.input - prev.input;
    const t = span > 0 ? (offset - prev.input) / span : 0;
    return prev.output + (next.output - prev.output) * Math.max(0, Math.min(1, t));
  }

  return offset;
}
