import { createContext, useContext } from "react";

export interface SpotlightRequest { durationMs: number; fakeMouseXRatio: number; fakeMouseYRatio: number }

export interface InteractionState {
  spotlightRequest: SpotlightRequest | null;
  setSpotlightRequest: (req: SpotlightRequest | null) => void;
}

export const InteractionCtx = createContext<InteractionState | null>(null);

export function useInteraction(): InteractionState {
  const ctx = useContext(InteractionCtx);
  if (!ctx) throw new Error("useInteraction must be used within AppProvider");
  return ctx;
}

export function useOptionalInteraction(): InteractionState | null {
  return useContext(InteractionCtx);
}
