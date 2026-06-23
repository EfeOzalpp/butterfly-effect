import { useSyncExternalStore } from 'react';

const FORCE_MOCK_READS = import.meta.env.VITE_USE_MOCK_DATA === 'true';

interface MockReadModeSnapshot {
  forced: boolean;
  runtimeFallback: boolean;
  active: boolean;
}

let snapshot: MockReadModeSnapshot = {
  forced: FORCE_MOCK_READS,
  runtimeFallback: false,
  active: FORCE_MOCK_READS,
};

const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((listener) => {
    listener();
  });
}

export const USE_MOCK_READS = FORCE_MOCK_READS;

export function shouldUseMockReads() {
  return snapshot.active;
}

export function enableMockReadFallback(reason?: unknown) {
  if (FORCE_MOCK_READS || snapshot.runtimeFallback) return;
  snapshot = {
    forced: FORCE_MOCK_READS,
    runtimeFallback: true,
    active: true,
  };
  console.warn('[read-api] Falling back to mock reads', reason);
  emit();
}

export function subscribeMockReadMode(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function useMockReadMode() {
  return useSyncExternalStore(
    subscribeMockReadMode,
    () => snapshot,
    () => snapshot
  );
}
