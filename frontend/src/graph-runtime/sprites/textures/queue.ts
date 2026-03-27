// graph-runtime/sprites/textures/queue.ts
type Job = { run: () => void; prio: number; gen: number; background?: boolean };
type QueueCounts = { pending: number; inflight: number; paused: boolean; backgroundPending: number; backgroundInflight: number };

let Q: Job[] = [];
let pumping = false;
let paused = false;
let inflight = 0;
let backgroundPendingCount = 0;
let backgroundInflightCount = 0;
const listeners = new Set<() => void>();
let snapshot: QueueCounts = { pending: 0, inflight: 0, paused: false, backgroundPending: 0, backgroundInflight: 0 };

let GEN = 0;

const RIC =
  typeof requestIdleCallback === 'function' ? requestIdleCallback : null;

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
    } catch {}
  }
}

function step(deadline?: IdleDeadline) {
  if (paused) { pumping = false; return; }

  let done = 0;
  const hasTime = () => !deadline || deadline.timeRemaining() > 6;

  while (Q.length && (done < 3 || hasTime())) {
    const job = Q.shift()!;
    if (job.background) backgroundPendingCount--;
    notify();
    if (job.gen !== GEN) continue;

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
  }

  if (Q.length && !paused) {
    (RIC ? RIC : (f => setTimeout(f as any, 16)))(step as any);
  } else {
    pumping = false;
  }
}

export function enqueueTexture(run: () => void, prio = 0, background = false) {
  const gen = GEN;
  if (background) backgroundPendingCount++;
  Q.push({ run, prio, gen, background });
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

export function getGeneration() { return GEN; }

export function subscribeQueue(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/** Calls cb once the non-background queue goes idle. If already idle, fires immediately. */
export function onceQueueIdle(cb: () => void): () => void {
  refreshSnapshot();
  const isIdle = () => {
    const s = snapshot;
    return (s.pending - s.backgroundPending + s.inflight - s.backgroundInflight) <= 0;
  };

  if (isIdle()) {
    cb();
    return () => {};
  }

  const off = subscribeQueue(() => {
    if (isIdle()) {
      off();
      cb();
    }
  });

  return off;
}

