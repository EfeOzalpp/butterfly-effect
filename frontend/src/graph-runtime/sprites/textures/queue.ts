// graph-runtime/sprites/textures/queue.ts
// Texture building can be heavy, so work is pumped through idle time instead
// of blocking animation frames.
interface Job {
  run: () => void;
  prio: number;
  gen: number;
  background?: boolean;
  onCancel?: () => void;
}

interface QueueCounts {
  pending: number;
  inflight: number;
  paused: boolean;
  backgroundPending: number;
  backgroundInflight: number;
}

let Q: Job[] = [];
let pumping = false;
let paused = false;
let inflight = 0;
let backgroundPendingCount = 0;
let backgroundInflightCount = 0;
const listeners = new Set<() => void>();
let snapshot: QueueCounts = { pending: 0, inflight: 0, paused: false, backgroundPending: 0, backgroundInflight: 0 };

// Generation invalidates stale jobs when a graph/theme reset makes old texture
// requests irrelevant.
let GEN = 0;

const isTouchDevice =
  typeof window !== 'undefined' &&
  (navigator.maxTouchPoints > 0 || 'ontouchstart' in window);

const scheduleIdle: (callback: IdleRequestCallback) => number =
  typeof requestIdleCallback === 'function'
    ? requestIdleCallback
    : (callback) =>
        window.setTimeout(() => {
          callback({
            didTimeout: false,
            timeRemaining: () => 0,
          });
        }, 16);

function refreshSnapshot() {
  const nextPending = Q.length;
  const nextInflight = inflight;
  const nextPaused = paused;
  const nextBgPending = backgroundPendingCount;
  const nextBgInflight = backgroundInflightCount;

  if (
    snapshot.pending === nextPending &&
    snapshot.inflight === nextInflight &&
    snapshot.paused === nextPaused &&
    snapshot.backgroundPending === nextBgPending &&
    snapshot.backgroundInflight === nextBgInflight
  ) {
    return false;
  }

  snapshot = {
    pending: nextPending,
    inflight: nextInflight,
    paused: nextPaused,
    backgroundPending: nextBgPending,
    backgroundInflight: nextBgInflight,
  };
  return true;
}

function notify() {
  if (!refreshSnapshot()) return;
  for (const listener of listeners) {
    try {
      listener();
    } catch {
      // Keep one bad listener from breaking queue progress updates.
    }
  }
}

function maxJobsPerIdleSlice() {
  return isTouchDevice ? 1 : 2;
}

function minTimeRemainingMs() {
  return isTouchDevice ? 10 : 6;
}

function takeNextJob() {
  const foregroundIndex = Q.findIndex((job) => !job.background);
  const index = foregroundIndex >= 0 ? foregroundIndex : 0;
  return Q.splice(index, 1)[0];
}

function step(deadline?: IdleDeadline) {
  if (paused) { pumping = false; return; }

  let done = 0;
  const maxJobs = maxJobsPerIdleSlice();
  const hasTime = () => !deadline || deadline.timeRemaining() > minTimeRemainingMs();

  while (Q.length && done < maxJobs && (done === 0 || hasTime())) {
    const job = takeNextJob();
    if (job.background) backgroundPendingCount--;
    notify();
    if (job.gen !== GEN) {
      try {
        job.onCancel?.();
      } catch {
        // Keep stale job cleanup best-effort.
      }
      continue;
    }

    inflight++;
    if (job.background) backgroundInflightCount++;
    notify();
    try { job.run(); } catch (err) { console.warn('[queue] job failed:', err); }
    finally {
      inflight--;
      if (job.background) backgroundInflightCount--;
      notify();
    }
    done++;
    if (job.background) break;
  }

  if (Q.length) {
    scheduleIdle(step);
  } else {
    pumping = false;
  }
}

export function enqueueTexture(run: () => void, prio = 0, background = false, onCancel?: () => void) {
  const gen = GEN;
  if (background) backgroundPendingCount++;
  Q.push({ run, prio, gen, background, onCancel });
  // Higher priority textures are usually visible sooner, so they move first.
  Q.sort((a, b) => b.prio - a.prio);
  notify();
  if (!pumping && !paused) {
    pumping = true;
    scheduleIdle(step);
  }
}

export function getQueueCounts() {
  refreshSnapshot();
  return snapshot;
}

export function pauseQueue() {
  paused = true;
  notify();
}

export function resumeQueue() {
  if (!paused) return;
  paused = false;
  notify();
  if (Q.length && !pumping) {
    pumping = true;
    scheduleIdle(step);
  }
}

function cancelAllJobs() {
  for (const job of Q) {
    try {
      job.onCancel?.();
    } catch {
      // Keep cancellation cleanup best-effort.
    }
  }
  Q = [];
  backgroundPendingCount = 0;
  pumping = false;
  notify();
}

export function resetQueue() {
  cancelAllJobs();
  paused = false;
  notify();
}

export function bumpGeneration() {
  GEN++;
  cancelAllJobs();
}

export function subscribeQueue(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

