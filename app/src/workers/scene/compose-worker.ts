import { placePoolItems } from "../../scene-canvas/scene-logic/place";
import type { FieldPrelude } from "../../scene-canvas/scene-logic/composeField";
import type { PlacedItem } from "../../scene-canvas/scene-logic/types";
import type { CanvasPaddingSpec } from "../../scene-canvas/scene-rules/canvas-padding";

type SerialSpec = Omit<CanvasPaddingSpec, "forbidden">;

interface WorkerRequest {
  requestId: number;
  prelude: Omit<FieldPrelude, "spec"> & { spec: SerialSpec };
  // rows × cols bitmap; cell is 1 if forbidden, 0 otherwise.
  // Sent as a transferable so there is no copy overhead.
  forbiddenBitmap: Uint8Array;
}

interface WorkerResponse {
  requestId: number;
  placed: PlacedItem[];
}

onmessage = (e: MessageEvent<WorkerRequest>) => {
  const { requestId, prelude, forbiddenBitmap } = e.data;
  const { cols } = prelude;

  const spec: CanvasPaddingSpec = {
    ...prelude.spec,
    forbidden:
      forbiddenBitmap.length > 0
        ? (r, c) => forbiddenBitmap[r * cols + c] !== 0
        : undefined,
  };

  const { placed } = placePoolItems({ ...prelude, spec });
  const response: WorkerResponse = { requestId, placed };
  postMessage(response);
};
