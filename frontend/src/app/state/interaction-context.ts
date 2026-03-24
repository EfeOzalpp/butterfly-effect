import { createContext, useContext } from "react";

type SpotlightRequest = { durationMs: number; fakeMouseXRatio: number; fakeMouseYRatio: number };

export type InteractionState = {
  menuOpen: boolean;
  setMenuOpen: (v: boolean) => void;
  spotlightRequest: SpotlightRequest | null;
  setSpotlightRequest: (req: SpotlightRequest | null) => void;
};

export const InteractionCtx = createContext<InteractionState | null>(null);

export function useInteraction(): InteractionState {
  const ctx = useContext(InteractionCtx);
  if (!ctx) throw new Error("useInteraction must be used within AppProvider");
  return ctx;
}

export function useOptionalInteraction(): InteractionState | null {
  return useContext(InteractionCtx);
}
