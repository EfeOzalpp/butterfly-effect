// Main-thread host for the particle physics worker.
// Manages a single shared worker instance for all emitters.
// Physics ticks are sent each frame; results are stored and read back by the draw path.
// One frame of latency is introduced (draw uses last frame's physics output) — imperceptible at 60fps.

// Must match FPP in particle-worker.ts.
export const PARTICLE_FLOATS_PER_SLOT = 7;

let instance: Worker | null = null;
const lastResults = new Map<string, Float32Array>();
const warnedKeys = new Set<string>();

function getInstance(): Worker {
  if (!instance) {
    instance = new Worker(new URL("./particle-worker.ts", import.meta.url), { type: "module" });
    instance.onmessage = (e: MessageEvent<{ key: string; particles: Float32Array }>) => {
      lastResults.set(e.data.key, e.data.particles);
    };
  }
  return instance;
}

export function isWorkerSupported(): boolean {
  return typeof Worker !== "undefined";
}

export function warnFunctionColor(key: string): void {
  if (!warnedKeys.has(key)) {
    warnedKeys.add(key);
    console.warn(
      `[particles] emitter "${key}" has useWorker: true but color is a function — ` +
        "functions cannot be transferred to a worker. Falling back to main thread for this emitter.",
    );
  }
}

export function sendP1Tick(key: string, dtSec: number, opts: object): void {
  getInstance().postMessage({ cmd: "step-p1", key, dtSec, opts });
}

export function sendP2Tick(key: string, dtSec: number, opts: object): void {
  getInstance().postMessage({ cmd: "step-p2", key, dtSec, opts });
}

export function getLastParticles(key: string): Float32Array | null {
  return lastResults.get(key) ?? null;
}

export function disposeParticleWorker(): void {
  instance?.terminate();
  instance = null;
  lastResults.clear();
}
