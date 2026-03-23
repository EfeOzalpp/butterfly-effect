import { createContext, useContext } from "react";

export type IdentityState = {
  mySection: string | null;
  setMySection: (s: string | null) => void;
  myEntryId: string | null;
  setMyEntryId: (id: string | null) => void;
  myRole: string | null;
  setMyRole: (r: string | null) => void;
};

export const IdentityCtx = createContext<IdentityState | null>(null);

export function useIdentity(): IdentityState {
  const ctx = useContext(IdentityCtx);
  if (!ctx) throw new Error("useIdentity must be used within AppProvider");
  return ctx;
}

export function useOptionalIdentity(): IdentityState | null {
  return useContext(IdentityCtx);
}
