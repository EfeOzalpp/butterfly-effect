// graph-runtime/sprites/textures/useQueueProgress.ts
import { useSyncExternalStore } from 'react';
import { getQueueCounts, subscribeQueue } from './queue';

export default function useTextureQueueProgress() {
  const counts = useSyncExternalStore(subscribeQueue, getQueueCounts, getQueueCounts);

  const { pending, inflight, paused, backgroundPending, backgroundInflight } = counts;
  return {
    pending,
    inflight,
    paused: !!paused,
    isBusy: (pending - backgroundPending + inflight - backgroundInflight) > 0,
  };
}
