import { getSessionItem } from "../../app/session";

function isPendingEntryId(entryId: string | null): boolean {
  return typeof entryId === "string" && entryId.startsWith("pending-");
}

export function resolvePersonalEntryId(myEntryId: string | null): string | null {
  const storedEntryId = getSessionItem("be.myEntryId");
  if (isPendingEntryId(myEntryId) && storedEntryId && !isPendingEntryId(storedEntryId)) {
    return storedEntryId;
  }
  return myEntryId ?? storedEntryId;
}
