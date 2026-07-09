import { useEffect, useMemo, useState } from "react";

import { useIdentity } from "../../app/state/identity-context";
import { getSessionItem } from "../../app/session";
import { useSurveyData } from "../../app/state/survey-data-context";
import { useRealMobileViewport } from "../../lib/hooks/useRealMobileViewport";
import type { SurveyRow } from "../../domain/survey/types";
import { GraphDataProvider } from "../GraphDataContext";
import DotGraphCanvasHost from "./canvas-host";
import { resolvePersonalEntryId } from "./personal-entry";
import {
  allowPersonalInSection,
  deriveRoleFromSectionId,
} from "./scope/scoping";

const MAX_GRAPH_SPRITES = 300;
const MOBILE_DATA_LIMIT = 150;

interface VisibleRowsSnapshot {
  scopeKey: string;
  capacity: number;
  rows: SlottedSurveyRow[];
}

type SlottedSurveyRow = SurveyRow & {
  __dotSlotIndex: number;
  __dotSlotCapacity: number;
};

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

function readPersonalSnapshot(entryId: string | null): SurveyRow | null {
  if (!entryId) return null;

  try {
    const raw = getSessionItem("be.myDoc");
    if (!raw) return null;
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== "object") return null;
    const row = parsed as SurveyRow;
    return row._id === entryId ? row : null;
  } catch {
    return null;
  }
}

function includePersonalRow(
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

function buildVisibleRowsSnapshot(
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

function useStableVisibleRows(
  rows: SurveyRow[],
  limit: number,
  scopeKey: string
): SlottedSurveyRow[] {
  const [snapshot, setSnapshot] = useState<VisibleRowsSnapshot>(() =>
    buildVisibleRowsSnapshot(rows, limit, scopeKey, null)
  );

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSnapshot((previous) => buildVisibleRowsSnapshot(rows, limit, scopeKey, previous));
  }, [limit, rows, scopeKey]);

  return snapshot.scopeKey === scopeKey && snapshot.capacity === limit
    ? snapshot.rows
    : buildVisibleRowsSnapshot(rows, limit, scopeKey, null).rows;
}

export default function DotGraphDataBoundary() {
  const { allFilteredRows, section } = useSurveyData();
  const { myEntryId, mySection } = useIdentity();
  const isRealMobile = useRealMobileViewport();
  const dataLimit = isRealMobile ? Math.min(MOBILE_DATA_LIMIT, MAX_GRAPH_SPRITES) : MAX_GRAPH_SPRITES;
  const personalEntryId = resolvePersonalEntryId(myEntryId);
  const effectiveMySection = mySection ?? getSessionItem("be.mySection") ?? "";

  const personalRow = useMemo(() => {
    if (!personalEntryId) return null;
    return allFilteredRows.find((row) => row._id === personalEntryId)
      ?? readPersonalSnapshot(personalEntryId);
  }, [allFilteredRows, personalEntryId]);

  const scopedPersonalRow = useMemo(() => {
    if (!personalRow) return null;
    const role = deriveRoleFromSectionId(effectiveMySection);
    return allowPersonalInSection(role, effectiveMySection, section) ? personalRow : null;
  }, [effectiveMySection, personalRow, section]);

  const stableVisibleRows = useStableVisibleRows(allFilteredRows, dataLimit, section);
  const cappedData = useMemo(
    () => includePersonalRow(stableVisibleRows, dataLimit, scopedPersonalRow),
    [stableVisibleRows, dataLimit, scopedPersonalRow]
  );

  return (
    <GraphDataProvider data={cappedData}>
      <DotGraphCanvasHost />
    </GraphDataProvider>
  );
}
