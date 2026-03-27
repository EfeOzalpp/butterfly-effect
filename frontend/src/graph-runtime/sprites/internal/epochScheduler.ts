// graph-runtime/sprites/internal/epochScheduler.ts
// Global round-robin epoch scheduler. Allocates refresh ticks only to
// visible shapes so the budget concentrates on what the camera sees.

const TICK_MS = 60;        // scheduler fires every 60ms
const SHAPES_PER_TICK = 3; // shapes refreshed per tick → ~50 refreshes/sec total

type Entry = {
  isVisible: () => boolean;
  tick: () => void;
};

const entries = new Map<string, Entry>();
let keys: string[] = [];
let rrIdx = 0;

function schedulerTick() {
  const visible: string[] = [];
  for (const k of keys) {
    const e = entries.get(k);
    if (e?.isVisible()) visible.push(k);
  }
  if (!visible.length) return;

  for (let i = 0; i < SHAPES_PER_TICK; i++) {
    const k = visible[rrIdx % visible.length];
    entries.get(k)?.tick();
    rrIdx = (rrIdx + 1) % visible.length;
  }
}

if (typeof window !== 'undefined') {
  setInterval(schedulerTick, TICK_MS);
}

let idCounter = 0;

export function registerEpochShape(entry: Entry): () => void {
  const id = String(idCounter++);
  entries.set(id, entry);
  keys = Array.from(entries.keys());
  return () => {
    entries.delete(id);
    keys = Array.from(entries.keys());
  };
}
