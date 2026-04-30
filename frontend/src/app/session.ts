import type { Mode } from "./types";

export function getSessionItem(key: string): string | null {
  if (typeof window === "undefined") return null;
  return sessionStorage.getItem(key);
}

export function setSessionItem(key: string, value: string) {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(key, value);
}

export function removeSessionItems(keys: string[]) {
  if (typeof window === "undefined") return;
  for (const key of keys) sessionStorage.removeItem(key);
}

export function readStoredMode(defaultMode: Mode): Mode {
  const saved = getSessionItem("be.mode") as Mode | null;
  return saved === "absolute" || saved === "relative" ? saved : defaultMode;
}

export function readStoredDarkMode(defaultValue = true): boolean {
  const saved = getSessionItem("be.darkMode");
  if (saved == null) return defaultValue;
  return saved === "true";
}

export function applyThemeToDocument(darkMode: boolean) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  root.dataset.theme = darkMode ? "dark" : "light";
  root.classList.toggle("dark", darkMode);

  const color = darkMode ? "#21201e" : "#f8f3ef";
  document.querySelectorAll<HTMLMetaElement>('meta[name="theme-color"]').forEach(m => {
    m.content = color;
  });
}
