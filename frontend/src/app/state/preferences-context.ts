import { createContext, useContext } from "react";
import type { Mode } from "../types";

export type PreferencesState = {
  darkMode: boolean;
  setDarkMode: (v: boolean) => void;
  mode: Mode;
  setMode: (m: Mode) => void;
  navPanelOpen: boolean;
  setNavPanelOpen: (v: boolean) => void;
  navVisible: boolean;
  setNavVisible: (v: boolean) => void;
};

export const PreferencesCtx = createContext<PreferencesState | null>(null);

export function usePreferences(): PreferencesState {
  const ctx = useContext(PreferencesCtx);
  if (!ctx) throw new Error("usePreferences must be used within AppProvider");
  return ctx;
}

export function useOptionalPreferences(): PreferencesState | null {
  return useContext(PreferencesCtx);
}
