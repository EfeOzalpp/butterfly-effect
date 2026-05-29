// graph-runtime/sprites/internal/epochScheduler.ts
// Global round-robin epoch scheduler. Allocates refresh ticks only to
// visible shapes so the budget concentrates on what the camera sees.

import { deviceType, getViewportSize } from "../../../canvas-engine/shared/responsiveness";
import { isConstrainedSpriteDevice } from "./spriteQuality";

const TICK_MS = 120;        // scheduler fires every 120ms

function schedulerBudget() {
  if (typeof window === 'undefined') return { perTick: 2, cadence: 1 };
  const dev = deviceType(getViewportSize().w);
  if (dev === 'mobile') return { perTick: 1, cadence: 1.2 };
  if (dev === 'tablet') return { perTick: 1, cadence: 1.25 };
  if (isConstrainedSpriteDevice(dev)) return { perTick: 1, cadence: 1.15 };
  return { perTick: 2, cadence: 1 };
}

interface EntryInput {
  isVisible: () => boolean;
  tick: () => void;
  intervalMs: number;
}

type Entry = EntryInput & {
  intervalMs: number;
  nextAtMs: number;
};

const entries = new Map<string, Entry>();
let keys: string[] = [];
let rrIdx = 0;
let intervalHandle: ReturnType<typeof setInterval> | null = null;
let paused = false;

function schedulerTick() {
  if (paused) return;
  if (typeof document !== 'undefined' && document.hidden) return;
  const now = typeof performance !== 'undefined' ? performance.now() : Date.now();
  const visible: string[] = [];
  for (const k of keys) {
    const e = entries.get(k);
    if (e?.isVisible() && now >= e.nextAtMs) visible.push(k);
  }
  if (!visible.length) return;

  const { perTick, cadence } = schedulerBudget();
  const naturalTurnMs = Math.max(TICK_MS, Math.ceil(visible.length / Math.max(1, perTick)) * TICK_MS);

  for (let i = 0; i < perTick; i++) {
    const k = visible[rrIdx % visible.length];
    const entry = entries.get(k);
    if (entry) {
      entry.tick();
      // Never refresh faster than the requested cadence; dense visible sets
      // stretch naturally so rebakes stay below the frame budget.
      entry.nextAtMs = now + Math.ceil(Math.max(entry.intervalMs, naturalTurnMs) * cadence);
    }
    rrIdx = (rrIdx + 1) % visible.length;
  }
}

export function pauseEpochScheduler() {
  paused = true;
}

export function resumeEpochScheduler() {
  paused = false;
}

function startScheduler() {
  if (intervalHandle !== null || typeof window === 'undefined') return;
  intervalHandle = setInterval(schedulerTick, TICK_MS);
}

function stopScheduler() {
  if (intervalHandle === null) return;
  clearInterval(intervalHandle);
  intervalHandle = null;
  rrIdx = 0;
}

let idCounter = 0;

export function registerEpochShape(entry: EntryInput): () => void {
  const id = String(idCounter++);
  const now = typeof performance !== 'undefined' ? performance.now() : Date.now();
  const intervalMs = Math.max(TICK_MS, entry.intervalMs || TICK_MS);
  // New entries are spread across ticks so many sprites do not refresh together.
  const spreadSteps = Math.max(1, Math.round(Math.min(intervalMs, Math.max(TICK_MS, keys.length * TICK_MS)) / TICK_MS));
  const nextAtMs = now + (idCounter % spreadSteps) * TICK_MS;
  entries.set(id, { ...entry, intervalMs, nextAtMs });
  keys = Array.from(entries.keys());
  startScheduler();
  return () => {
    entries.delete(id);
    keys = Array.from(entries.keys());
    if (entries.size === 0) stopScheduler();
  };
}
