import { useSyncExternalStore } from 'react';

const FORCE_MOCK_SANITY = import.meta.env.VITE_USE_MOCK_DATA === 'true';

type MockReadModeSnapshot = {
  forced: boolean;
  runtimeFallback: boolean;
  active: boolean;
};

let snapshot: MockReadModeSnapshot = {
  forced: FORCE_MOCK_SANITY,
  runtimeFallback: false,
  active: FORCE_MOCK_SANITY,
};

const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((listener) => listener());
}

export const USE_MOCK_SANITY = FORCE_MOCK_SANITY;

export function shouldUseMockSanityReads() {
  return snapshot.active;
}

export function enableMockSanityReadFallback(reason?: unknown) {
  if (FORCE_MOCK_SANITY || snapshot.runtimeFallback) return;
  snapshot = {
    forced: FORCE_MOCK_SANITY,
    runtimeFallback: true,
    active: true,
  };
  console.warn('[sanity] Falling back to mock reads', reason);
  emit();
}

export function subscribeMockSanityReadMode(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function useMockSanityReadMode() {
  return useSyncExternalStore(
    subscribeMockSanityReadMode,
    () => snapshot,
    () => snapshot
  );
}

export function isSanityQuotaError(error: any) {
  const status = error?.statusCode ?? error?.status ?? error?.response?.status;
  const message = String(
    error?.message ??
    error?.error ??
    error?.details ??
    ''
  ).toLowerCase();

  // Also treat CORS / network failures as a fallback trigger so the app
  // shows mock data when Sanity is unreachable (e.g. non-localhost origins
  // that aren't whitelisted in the Sanity project's CORS settings).
  const isNetworkFailure = !status && (
    error instanceof TypeError ||
    message.includes('failed to fetch') ||
    message.includes('network') ||
    message.includes('cors')
  );

  return (
    isNetworkFailure ||
    status === 402 ||
    status === 403 ||
    status === 429 ||
    message.includes('quota') ||
    message.includes('rate limit') ||
    message.includes('rate-limit') ||
    message.includes('too many requests') ||
    message.includes('usage limit') ||
    message.includes('plan limit') ||
    message.includes('request limit')
  );
}
