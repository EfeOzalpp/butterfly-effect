// graph-runtime/sprites/internal/epochScheduler.ts
// Global round-robin epoch scheduler. Allocates refresh ticks only to
// visible shapes so the budget concentrates on what the camera sees.

const TICK_MS = 60;        // scheduler fires every 60ms
const SHAPES_PER_TICK = 3; // shapes refreshed per tick → ~50 refreshes/sec total

type EntryInput = {
  isVisible: () => boolean;
  tick: () => void;
  intervalMs: number;
};

type Entry = EntryInput & {
  intervalMs: number;
  nextAtMs: number;
};

const entries = new Map<string, Entry>();
let keys: string[] = [];
let rrIdx = 0;

function schedulerTick() {
  if (typeof document !== 'undefined' && document.hidden) return;
  const now = typeof performance !== 'undefined' ? performance.now() : Date.now();
  const visible: string[] = [];
  for (const k of keys) {
    const e = entries.get(k);
    if (e?.isVisible() && now >= e.nextAtMs) visible.push(k);
  }
  if (!visible.length) return;

  for (let i = 0; i < SHAPES_PER_TICK; i++) {
    const k = visible[rrIdx % visible.length];
    const entry = entries.get(k);
    if (entry) {
      entry.tick();
      entry.nextAtMs = now + Math.max(TICK_MS, entry.intervalMs);
    }
    rrIdx = (rrIdx + 1) % visible.length;
  }
}

if (typeof window !== 'undefined') {
  setInterval(schedulerTick, TICK_MS);
}

let idCounter = 0;

export function registerEpochShape(entry: EntryInput): () => void {
  const id = String(idCounter++);
  const now = typeof performance !== 'undefined' ? performance.now() : Date.now();
  const intervalMs = Math.max(TICK_MS, entry.intervalMs || TICK_MS);
  const spreadSteps = Math.max(1, Math.round(Math.min(intervalMs, Math.max(TICK_MS, keys.length * TICK_MS)) / TICK_MS));
  const nextAtMs = now + (idCounter % spreadSteps) * TICK_MS;
  entries.set(id, { ...entry, intervalMs, nextAtMs });
  keys = Array.from(entries.keys());
  return () => {
    entries.delete(id);
    keys = Array.from(entries.keys());
  };
}
