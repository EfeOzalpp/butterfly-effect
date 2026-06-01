import type { BackgroundAnchorContext } from "../../../../scene-rules/backgrounds";
import { resolveStopKValue } from "../background/anchors";
import type { FoliageLayerSpec, FoliageSceneSpec } from "../../../../scene-rules/foliage";
import type { PLike } from "../../../p/makeP";
import { clamp01 } from "../../../../shared/math";
import {
  clearOffscreenEntry,
  createOffscreenCache,
  drawCanvasLayer,
  getOrCreateCanvasLayer,
} from "../../cache/offscreenCache";
import { mix } from "../shared/color";

interface FoliagePiece {
  xK: number;
  yJitter: number;
  heightK: number;
  widthK: number;
  leanK: number;
  colorIndex: number;
}

function hash01(seed: number) {
  const x = Math.sin(seed * 127.1) * 43758.5453123;
  return x - Math.floor(x);
}

function resolveCount(count: FoliageLayerSpec["count"], liveAvg: number) {
  return Math.max(
    0,
    Math.round(typeof count === "number" ? count : mix(count[0], count[1], clamp01(liveAvg)))
  );
}

function resolveMaxCount(count: FoliageLayerSpec["count"]) {
  return Math.max(
    0,
    Math.round(typeof count === "number" ? count : Math.max(count[0], count[1]))
  );
}

function colorForLayer(layer: FoliageLayerSpec, index: number) {
  if (typeof layer.color === "string") {
    return { color: layer.color, alpha: layer.alpha ?? 1 };
  }
  const choice = layer.color[index % layer.color.length] ?? layer.color[0];
  return {
    color: choice?.color ?? "rgb(80, 120, 90)",
    alpha: choice?.alpha ?? layer.alpha ?? 1,
  };
}

function makePiece(layerSeed: number, index: number, colorCount: number): FoliagePiece {
  return {
    xK: hash01(layerSeed + index * 11.13),
    yJitter: hash01(layerSeed + index * 17.71) * 2 - 1,
    heightK: hash01(layerSeed + index * 23.37),
    widthK: hash01(layerSeed + index * 29.91),
    leanK: hash01(layerSeed + index * 37.53) * 2 - 1,
    colorIndex: Math.floor(hash01(layerSeed + index * 41.19) * Math.max(1, colorCount)),
  };
}

function drawLayer(args: {
  p: PLike;
  layer: FoliageLayerSpec;
  liveAvg: number;
  anchors?: BackgroundAnchorContext;
}) {
  const { p, layer, liveAvg, anchors } = args;
  const count = resolveCount(layer.count, liveAvg);
  if (count <= 0) return;

  const maxCount = resolveMaxCount(layer.count);
  const colorCount = typeof layer.color === "string" ? 1 : layer.color.length;
  const xRange = layer.xRange ?? [0, 1];
  const y = resolveStopKValue(layer.yK, anchors) * p.height;
  const minH = Math.max(1, layer.heightPx[0]);
  const maxH = Math.max(minH, layer.heightPx[1]);
  const minW = Math.max(1, layer.widthPx?.[0] ?? 2);
  const maxW = Math.max(minW, layer.widthPx?.[1] ?? 5);
  const seed = layer.seed ?? 1;
  const ctx = p.drawingContext;

  ctx.save();
  for (let i = 0; i < Math.min(count, maxCount); i += 1) {
    const piece = makePiece(seed, i, colorCount);
    const xK = xRange[0] + (xRange[1] - xRange[0]) * piece.xK;
    const h = minH + (maxH - minH) * piece.heightK;
    const w = minW + (maxW - minW) * piece.widthK;
    const x = xK * p.width;
    const baseY = y + piece.yJitter * Math.max(2, h * 0.18);
    const lean = piece.leanK * w * 0.8;
    const { color, alpha } = colorForLayer(layer, piece.colorIndex);

    ctx.globalAlpha = clamp01(alpha);
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(x - w * 0.5, baseY);
    ctx.lineTo(x + w * 0.5, baseY);
    ctx.lineTo(x + lean, baseY - h);
    ctx.closePath();
    ctx.fill();
  }
  ctx.restore();
}

export function createFoliageLayerCache() {
  const cache = createOffscreenCache();
  let cacheKey = "";
  let lastSpec: FoliageSceneSpec | null | undefined = undefined;

  const drawFoliageLayerCached = function drawFoliageLayerCached(args: {
    p: PLike;
    spec?: FoliageSceneSpec | null;
    liveAvg: number;
    anchors?: BackgroundAnchorContext;
    compositeAlpha?: number;
  }) {
    const { p, spec, liveAvg, anchors, compositeAlpha = 1 } = args;
    if (!spec || spec.layers.length === 0 || compositeAlpha <= 0) return;

    const { entry, targetChanged } = getOrCreateCanvasLayer(cache, p);
    if (targetChanged) cacheKey = "";

    const liveAvgQ = Math.round(liveAvg * 100);
    const key = [
      String(p.width),
      String(p.height),
      String(liveAvgQ),
      anchors?.visualHorizonK.toFixed(4) ?? "no-anchor",
    ].join("|");

    if (key !== cacheKey || spec !== lastSpec) {
      clearOffscreenEntry(entry);
      const fakeP = {
        drawingContext: entry.ctx,
        width: entry.bounds.w,
        height: entry.bounds.h,
      } as unknown as PLike;
      for (const layer of spec.layers) {
        drawLayer({ p: fakeP, layer, liveAvg, anchors });
      }
      cacheKey = key;
      lastSpec = spec;
    }

    drawCanvasLayer(p, entry, compositeAlpha);
  };

  return Object.assign(drawFoliageLayerCached, {
    clear() {
      cache.clear();
      cacheKey = "";
      lastSpec = undefined;
    },
  });
}
