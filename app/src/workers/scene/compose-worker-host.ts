// Main-thread bridge for the scene composition worker.
// placePoolItems (candidate scoring, occupancy, sorting) runs off the main thread.
// Uses a requestId/Promise pattern since composition is on-demand, not per-frame.

import type { ComposeOpts, PlacedItem } from "../../scene-canvas/scene-logic/types";
import { buildFieldPrelude } from "../../scene-canvas/scene-logic/composeField";
import { composeField } from "../../scene-canvas/scene-logic/composeField";

let instance: Worker | null = null;
let nextRequestId = 0;
const pending = new Map<number, (placed: PlacedItem[]) => void>();

function getInstance(): Worker {
  if (!instance) {
    instance = new Worker(
      new URL("./compose-worker.ts", import.meta.url),
      { type: "module" },
    );
    instance.onmessage = (
      e: MessageEvent<{ requestId: number; placed: PlacedItem[] }>,
    ) => {
      const resolve = pending.get(e.data.requestId);
      if (resolve) {
        pending.delete(e.data.requestId);
        resolve(e.data.placed);
      }
    };
    instance.onerror = (e) => {
      console.error("[compose-worker] error:", e.message);
    };
  }
  return instance;
}

export function isComposeWorkerSupported(): boolean {
  return typeof Worker !== "undefined";
}

export function composeFieldAsync(opts: ComposeOpts): Promise<PlacedItem[]> {
  if (!isComposeWorkerSupported()) {
    return Promise.resolve(composeField(opts).placed);
  }

  const prelude = buildFieldPrelude(opts);
  if (!prelude) return Promise.resolve([]);

  const { spec, rows, cols } = prelude;

  // Pre-evaluate the forbidden predicate into a transferable bitmap.
  // Functions cannot cross the worker boundary, so we materialise the result
  // for every cell and let the worker reconstruct a predicate from the array.
  const bitmap = new Uint8Array(rows * cols);
  if (spec.forbidden) {
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (spec.forbidden(r, c, rows, cols)) bitmap[r * cols + c] = 1;
      }
    }
  }

  // Strip the function from spec before structured-clone serialisation.
  const { forbidden: _dropped, ...serialSpec } = spec;

  return new Promise((resolve) => {
    const requestId = nextRequestId++;
    pending.set(requestId, resolve);
    getInstance().postMessage(
      {
        requestId,
        prelude: { ...prelude, spec: serialSpec },
        forbiddenBitmap: bitmap,
      },
      { transfer: [bitmap.buffer] },
    );
  });
}

export function disposeComposeWorker(): void {
  instance?.terminate();
  instance = null;
  pending.clear();
}
