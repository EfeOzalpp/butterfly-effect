import type { SurveyRow } from "../../domain/survey/types";

export const MAX_GRAPH_SPRITES = 300;
export const MOBILE_DATA_LIMIT = 150;

export interface VisibleRowsSnapshot {
  scopeKey: string;
  capacity: number;
  rows: SlottedSurveyRow[];
}

export type SlottedSurveyRow = SurveyRow & {
  __dotSlotIndex: number;
  __dotSlotCapacity: number;
};

export function graphDataLimit(isRealMobile: boolean) {
  return isRealMobile ? Math.min(MOBILE_DATA_LIMIT, MAX_GRAPH_SPRITES) : MAX_GRAPH_SPRITES;
}

function withDotSlot(row: SurveyRow, slotIndex: number, capacity: number): SlottedSurveyRow {
  return {
    ...row,
    __dotSlotIndex: Math.max(0, Math.floor(slotIndex)),
    __dotSlotCapacity: Math.max(1, Math.floor(capacity)),
  };
}

function isSlottedRow(row: SurveyRow): row is SlottedSurveyRow {
  const maybe = row as Partial<SlottedSurveyRow>;
  return (
    typeof maybe.__dotSlotIndex === "number" &&
    Number.isFinite(maybe.__dotSlotIndex) &&
    typeof maybe.__dotSlotCapacity === "number" &&
    Number.isFinite(maybe.__dotSlotCapacity)
  );
}

function nextUnusedSlot(usedSlots: Set<number>, capacity: number): number {
  for (let slot = 0; slot < capacity; slot += 1) {
    if (!usedSlots.has(slot)) return slot;
  }
  return Math.max(0, capacity - 1);
}

function uniqueSlots(slots: number[]): number[] {
  const seen = new Set<number>();
  const result: number[] = [];
  for (const slot of slots) {
    if (!Number.isFinite(slot) || seen.has(slot)) continue;
    seen.add(slot);
    result.push(slot);
  }
  return result;
}

export function includePersonalRow(
  rows: SlottedSurveyRow[],
  limit: number,
  personalRow: SurveyRow | null
): SlottedSurveyRow[] {
  if (limit <= 0) return [];

  const capped = rows.slice(0, limit);
  if (!personalRow?._id || capped.some((row) => row._id === personalRow._id)) {
    return capped;
  }

  const fromFilteredRows = rows.find((row) => row._id === personalRow._id);
  const reservedRow = fromFilteredRows ?? personalRow;
  const rowsBeforeReserved = capped.slice(0, Math.max(0, limit - 1));
  const usedSlots = new Set(rowsBeforeReserved.map((row) => row.__dotSlotIndex));
  const droppedRow = capped.length >= limit ? capped[limit - 1] : undefined;
  const slotIndex =
    isSlottedRow(reservedRow)
      ? reservedRow.__dotSlotIndex
      : droppedRow?.__dotSlotIndex ?? nextUnusedSlot(usedSlots, limit);

  return [
    ...rowsBeforeReserved,
    withDotSlot(reservedRow, slotIndex, limit),
  ].slice(0, limit);
}

export function buildVisibleRowsSnapshot(
  rows: SurveyRow[],
  limit: number,
  scopeKey: string,
  previous: VisibleRowsSnapshot | null
): VisibleRowsSnapshot {
  const targetRows = rows.slice(0, limit);

  if (previous?.scopeKey !== scopeKey || previous.capacity !== limit) {
    const visibleRows = targetRows
      .map((row, slotIndex) => withDotSlot(row, slotIndex, limit));

    return {
      scopeKey,
      capacity: limit,
      rows: visibleRows,
    };
  }

  const previousById = new Map(previous.rows.map((row) => [row._id, row]));
  const targetIds = new Set(targetRows.map((row) => row._id));
  const usedSlots = new Set(
    previous.rows
      .filter((row) => targetIds.has(row._id))
      .map((row) => row.__dotSlotIndex)
  );
  const availableSlots = uniqueSlots(
    previous.rows
      .filter((row) => !targetIds.has(row._id))
      .map((row) => row.__dotSlotIndex)
  );

  const nextRows = targetRows.map((row) => {
    const previousRow = previousById.get(row._id);
    if (previousRow) return withDotSlot(row, previousRow.__dotSlotIndex, limit);

    const freedSlot = availableSlots.shift();
    const slotIndex = freedSlot ?? nextUnusedSlot(usedSlots, limit);
    usedSlots.add(slotIndex);
    return withDotSlot(row, slotIndex, limit);
  });

  return {
    scopeKey,
    capacity: limit,
    rows: nextRows,
  };
}
