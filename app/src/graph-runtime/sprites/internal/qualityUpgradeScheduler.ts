const TICK_MS = 180;

interface QualityUpgradeInput {
  isVisible: () => boolean;
  apply: () => void;
  delayMs?: number;
}

type QualityUpgradeEntry = QualityUpgradeInput & {
  dueAtMs: number;
};

const entries = new Map<string, QualityUpgradeEntry>();
let keys: string[] = [];
let rrIdx = 0;
let idCounter = 0;
let intervalHandle: ReturnType<typeof setInterval> | null = null;
let paused = false;

function upgradeBudget() {
  return 1;
}

function startScheduler() {
  if (intervalHandle !== null || typeof window === "undefined") return;
  intervalHandle = setInterval(schedulerTick, TICK_MS);
}

function stopScheduler() {
  if (intervalHandle === null) return;
  clearInterval(intervalHandle);
  intervalHandle = null;
  rrIdx = 0;
}

function schedulerTick() {
  if (paused) return;
  if (typeof document !== "undefined" && document.hidden) return;
  const now = typeof performance !== "undefined" ? performance.now() : Date.now();
  const ready: string[] = [];

  for (const key of keys) {
    const entry = entries.get(key);
    if (entry?.isVisible() && now >= entry.dueAtMs) ready.push(key);
  }

  if (!ready.length) return;

  const perTick = upgradeBudget();
  const turns = Math.min(perTick, ready.length);
  for (let i = 0; i < turns; i++) {
    const key = ready[rrIdx % ready.length];
    const entry = entries.get(key);
    entries.delete(key);
    keys = keys.filter((candidate) => candidate !== key);
    if (entry) entry.apply();
    rrIdx = (rrIdx + 1) % ready.length;
  }

  if (!entries.size) stopScheduler();
}

export function scheduleSpriteQualityUpgrade(entry: QualityUpgradeInput) {
  const id = String(idCounter++);
  const now = typeof performance !== "undefined" ? performance.now() : Date.now();
  entries.set(id, {
    ...entry,
    dueAtMs: now + Math.max(0, entry.delayMs ?? 0),
  });
  keys = Array.from(entries.keys());
  startScheduler();
  return () => {
    entries.delete(id);
    keys = Array.from(entries.keys());
    if (!entries.size) stopScheduler();
  };
}

export function pauseQualityUpgradeScheduler() {
  paused = true;
}

export function resumeQualityUpgradeScheduler() {
  paused = false;
}
