export const bucketForPercent = (pct: number) => (
  pct <= 20 ? "0-20" :
  pct <= 40 ? "21-40" :
  pct <= 60 ? "41-60" :
  pct <= 80 ? "61-80" : "81-100"
);

export const storageKeyFor = (prefix: string, id: string, pct: number, version = "v1") => (
  `${prefix}:${version}:${id}:${bucketForPercent(pct)}`
);

export const safeSession = {
  get<T>(key: string, fallback: T): T {
    try {
      const raw = sessionStorage.getItem(key);
      return raw ? JSON.parse(raw) as T : fallback;
    } catch {
      return fallback;
    }
  },
  set(key: string, value: unknown): void {
    try {
      sessionStorage.setItem(key, JSON.stringify(value));
    } catch {}
  },
};
