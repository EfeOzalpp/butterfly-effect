// graph-runtime/sprites/textures/useQueueProgress.ts
import { useSyncExternalStore } from 'react';
import { getQueueCounts, subscribeQueue } from './queue';

// React bridge for texture queue state. Background jobs are excluded from isBusy
// so UI loading states do not stay on forever.
export default function useTextureQueueProgress() {
  const counts = useSyncExternalStore(subscribeQueue, getQueueCounts, getQueueCounts);

  const { pending, inflight, paused, backgroundPending, backgroundInflight } = counts;
  return {
    pending,
    inflight,
    paused,
    isBusy: (pending - backgroundPending + inflight - backgroundInflight) > 0,
  };
}
