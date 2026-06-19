import { createContext, useContext } from "react";

export interface IdentityState {
  // The department/section the user selected during onboarding - e.g. 'fine-arts', 'facilities'
  mySection: string | null;
  setMySection: (s: string | null) => void;
  // Sanity document _id of the user's submitted survey response - used to highlight their dot in the graph
  myEntryId: string | null;
  setMyEntryId: (id: string | null) => void;
  // Role selected during onboarding - 'student', 'staff', or 'visitor'
  myRole: string | null;
  setMyRole: (r: string | null) => void;
};

export const IdentityCtx = createContext<IdentityState | null>(null);

export function useIdentity(): IdentityState {
  const ctx = useContext(IdentityCtx);
  if (!ctx) throw new Error("useIdentity must be used within AppProvider");
  return ctx;
}
