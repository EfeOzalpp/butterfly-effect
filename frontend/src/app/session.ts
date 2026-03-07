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
  const saved = getSessionItem("gp.mode") as Mode | null;
  return saved === "absolute" || saved === "relative" ? saved : defaultMode;
}

export function readStoredDarkMode(defaultValue = false): boolean {
  const saved = getSessionItem("gp.darkMode");
  if (saved == null) return defaultValue;
  return saved === "true";
}

export function applyThemeToDocument(darkMode: boolean) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  root.dataset.theme = darkMode ? "dark" : "light";
  root.classList.toggle("dark", darkMode);
}
