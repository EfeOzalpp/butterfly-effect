// graph-runtime/sprites/textures/queue.ts
type Job = { run: () => void; prio: number; gen: number };
type QueueCounts = { pending: number; inflight: number; paused: boolean };

let Q: Job[] = [];
let pumping = false;
let paused = false;
let inflight = 0;
const listeners = new Set<() => void>();
let snapshot: QueueCounts = { pending: 0, inflight: 0, paused: false };

let GEN = 0;

const RIC =
  typeof requestIdleCallback === 'function' ? requestIdleCallback : null;

function refreshSnapshot() {
  const nextPending = Q.length;
  const nextInflight = inflight;
  const nextPaused = paused;

  if (
    snapshot.pending === nextPending &&
    snapshot.inflight === nextInflight &&
    snapshot.paused === nextPaused
  ) {
    return false;
  }

  snapshot = {
    pending: nextPending,
    inflight: nextInflight,
    paused: nextPaused,
  };
  return true;
}

function notify() {
  if (!refreshSnapshot()) return;
  for (const listener of listeners) {
    try {
      listener();
    } catch {}
  }
}

function step(deadline?: IdleDeadline) {
  if (paused) { pumping = false; return; }

  let done = 0;
  const hasTime = () => !deadline || deadline.timeRemaining() > 6;

  while (Q.length && (done < 3 || hasTime())) {
    const job = Q.shift()!;
    notify();
    if (job.gen !== GEN) continue;

    inflight++;
    notify();
    try { job.run(); } catch { }
    finally {
      inflight--;
      notify();
    }
    done++;
  }

  if (Q.length && !paused) {
    (RIC ? RIC : (f => setTimeout(f as any, 16)))(step as any);
  } else {
    pumping = false;
  }
}

export function enqueueTexture(run: () => void, prio = 0) {
  const gen = GEN;
  Q.push({ run, prio, gen });
  Q.sort((a, b) => b.prio - a.prio);
  notify();
  if (!pumping && !paused) {
    pumping = true;
    (RIC ? RIC : (f => setTimeout(f as any, 16)))(step as any);
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
    (RIC ? RIC : (f => setTimeout(f as any, 16)))(step as any);
  }
}

export function cancelAllJobs() {
  Q = [];
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

export function getGeneration() { return GEN; }

export function subscribeQueue(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

if (typeof window !== 'undefined') {
  const w = window as any;
  w.__GP_GET_QUEUE_COUNTS = getQueueCounts;
  w.__GP_RESET_QUEUE = resetQueue;
  w.__GP_PAUSE_QUEUE = pauseQueue;
  w.__GP_RESUME_QUEUE = resumeQueue;
  w.__GP_BUMP_GEN = bumpGeneration;
} 