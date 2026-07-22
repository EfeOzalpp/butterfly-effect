// src/dev/renderProfilerStats.ts
// Benchmarking helper for the Context -> Zustand re-render comparison.

const counts: Record<string, number> = {};
const durations: Record<string, number> = {};

export function recordRender(id: string, actualDuration: number) {
  counts[id] = (counts[id] ?? 0) + 1;
  durations[id] = (durations[id] ?? 0) + actualDuration;
}

// Shared onRender callback: pass directly to <Profiler onRender={profilerOnRender}>.
// Counts every commit (mount and update alike).
export function profilerOnRender(id: string, _phase: string, actualDuration: number) {
  recordRender(id, actualDuration);
}

export function logRenderStats() {
  const rows = Object.keys(counts).map((id) => ({
    id,
    renders: counts[id],
    totalMs: Number(durations[id].toFixed(2)),
  }));
  console.table(rows);
  const total = rows.reduce((sum, row) => sum + row.renders, 0);
  console.log("Total renders across profiled components:", total);
  return total;
}

export function resetRenderStats() {
  for (const key of Object.keys(counts)) delete counts[key];
  for (const key of Object.keys(durations)) delete durations[key];
}

if (import.meta.env.DEV) {
  (window as unknown as { __renderStats: unknown }).__renderStats = {
    log: logRenderStats,
    reset: resetRenderStats,
  };
}
