import type { EngineFieldItem } from "../types";
import type { LiveState } from "../render/items";

function footprintKey(footprint: any): string {
  if (!footprint || typeof footprint !== "object") return "";
  const w = Number(footprint.w ?? 0);
  const h = Number(footprint.h ?? 0);
  const r0 = Number(footprint.r0 ?? 0);
  const c0 = Number(footprint.c0 ?? 0);
  return `${w}|${h}|${r0}|${c0}`;
}

function shouldReplayAppear(prev: EngineFieldItem, next: EngineFieldItem): boolean {
  if (prev.shape !== next.shape) return true;
  if (footprintKey(prev.footprint) !== footprintKey(next.footprint)) return true;

  const dx = Math.abs((prev.x ?? 0) - (next.x ?? 0));
  const dy = Math.abs((prev.y ?? 0) - (next.y ?? 0));
  return dx > 0.1 || dy > 0.1;
}

export function reconcileLiveStatesOnFieldUpdate(args: {
  prevItems: EngineFieldItem[];
  nextItems: EngineFieldItem[];
  liveStates: Map<string, LiveState>;
  nowMs: number;
  shapeKeyOfItem: (it: EngineFieldItem) => string;
}) {
  const { prevItems, nextItems, liveStates, nowMs, shapeKeyOfItem } = args;

  const prevById = new Map<string, EngineFieldItem>();
  for (const it of prevItems) prevById.set(it.id, it);

  const nextIds = new Set<string>();
  for (const it of nextItems) nextIds.add(it.id);

  for (const id of Array.from(liveStates.keys())) {
    if (!nextIds.has(id)) liveStates.delete(id);
  }

  for (const next of nextItems) {
    const state = liveStates.get(next.id);
    if (!state) continue;

    const prev = prevById.get(next.id);
    if (!prev || shouldReplayAppear(prev, next)) {
      state.bornAtMs = nowMs;
      state.shapeKey = shapeKeyOfItem(next);
    }
  }
}
