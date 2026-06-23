export function setGraphContextLost(value: boolean) {
  if (typeof window === 'undefined') return;
  try {
    window.__GP_CTX_LOST = value;
  } catch {}
}
