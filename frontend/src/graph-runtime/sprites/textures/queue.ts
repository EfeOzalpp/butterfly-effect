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

let Q: Job[] = [];
let pumping = false;
let paused = false;

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
    if (job.gen !== GEN) {
      try {
        job.onCancel?.();
      } catch {
        // Keep stale job cleanup best-effort.
      }
      continue;
    }

    try { job.run(); } catch (err) { console.warn('[queue] job failed:', err); }
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
  Q.push({ run, prio, gen, background, onCancel });
  // Higher priority textures are usually visible sooner, so they move first.
  Q.sort((a, b) => b.prio - a.prio);
  if (!pumping && !paused) {
    pumping = true;
    scheduleIdle(step);
  }
}

export function pauseQueue() {
  paused = true;
}

export function resumeQueue() {
  if (!paused) return;
  paused = false;
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
  pumping = false;
}

export function resetQueue() {
  cancelAllJobs();
  paused = false;
}

export function bumpGeneration() {
  GEN++;
  cancelAllJobs();
}

