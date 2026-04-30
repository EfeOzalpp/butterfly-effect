import { gradientColor, VIVID_COLOR_STOPS } from "../../../modifiers/index";
import { clamp01 } from "../../../shared/math";

export type RGB = { r: number; g: number; b: number };
export type RGBA = RGB & { a: number };

export function mix(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

function easeBlendTaper(t: number) {
  const x = clamp01(t);
  return x * x * x;
}

function mixRgb(base: RGB, tint: RGB, amount: number): RGB {
  const t = clamp01(amount);
  return {
    r: Math.round(mix(base.r, tint.r, t)),
    g: Math.round(mix(base.g, tint.g, t)),
    b: Math.round(mix(base.b, tint.b, t)),
  };
}

export function mixRgba(a: RGBA, b: RGBA, t: number): RGBA {
  const k = clamp01(t);
  return {
    r: mix(a.r, b.r, k),
    g: mix(a.g, b.g, k),
    b: mix(a.b, b.b, k),
    a: mix(a.a, b.a, k),
  };
}

export function cssRgba(color: RGBA) {
  const channel = (value: number) => Math.max(0, Math.min(255, Math.round(value)));
  return `rgba(${channel(color.r)}, ${channel(color.g)}, ${channel(color.b)}, ${clamp01(color.a)})`;
}

export function parseCssColor(input: string): RGBA | null {
  const value = input.trim();

  if (value.startsWith("#")) {
    const hex = value.slice(1);
    if (hex.length === 3) {
      return {
        r: parseInt(hex[0] + hex[0], 16),
        g: parseInt(hex[1] + hex[1], 16),
        b: parseInt(hex[2] + hex[2], 16),
        a: 1,
      };
    }
    if (hex.length === 6) {
      return {
        r: parseInt(hex.slice(0, 2), 16),
        g: parseInt(hex.slice(2, 4), 16),
        b: parseInt(hex.slice(4, 6), 16),
        a: 1,
      };
    }
    return null;
  }

  const rgbaMatch = value.match(/^rgba?\(([^)]+)\)$/i);
  if (!rgbaMatch) return null;

  const parts = rgbaMatch[1].split(",").map((part) => part.trim());
  if (parts.length < 3) return null;

  return {
    r: Number(parts[0]),
    g: Number(parts[1]),
    b: Number(parts[2]),
    a: parts[3] == null ? 1 : Number(parts[3]),
  };
}

export function resolveStopColor(
  rgba: string,
  liveBlend: number | readonly [number, number] | undefined,
  liveAvg: number
) {
  if (!liveBlend) return rgba;

  const parsed = parseCssColor(rgba);
  if (!parsed) return rgba;

  const blendAmount: number = typeof liveBlend === "number"
    ? liveBlend
    : mix(liveBlend[0], liveBlend[1], easeBlendTaper(liveAvg));
  const tint = gradientColor(VIVID_COLOR_STOPS, liveAvg).rgb;
  const mixed = mixRgb(parsed, tint, blendAmount);
  return `rgba(${mixed.r}, ${mixed.g}, ${mixed.b}, ${parsed.a})`;
}
