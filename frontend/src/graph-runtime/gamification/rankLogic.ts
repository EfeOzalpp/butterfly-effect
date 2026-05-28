// src/graph-runtime/gamification/rankLogic.ts

import { avgWeightOf } from "../../lib/utils/score";
import type {
  DotGraphEntry,
  DotGraphPositionClass,
  DotGraphTieStats,
} from "../dotgraph/types";

export interface TieStatsParams<TEntry extends DotGraphEntry = DotGraphEntry> {
  data?: TEntry[];
  targetId?: string;
  targetDisplay?: number;
  displayPercentOf?: (item: TEntry) => number;
}

const clampPercent = (value: number): number =>
  Math.max(0, Math.min(100, Math.round(Number.isFinite(value) ? value : 0)));

// Default fallback only. Relative mode should pass the same display function the UI uses.
function defaultDisplayPercentOf(item: DotGraphEntry): number {
  return clampPercent(avgWeightOf(item) * 100);
}

function keyOf<TEntry extends DotGraphEntry>(
  item: TEntry,
  displayPercentOf?: (item: TEntry) => number
): number {
  const displayPercent = displayPercentOf
    ? displayPercentOf(item)
    : defaultDisplayPercentOf(item);
  return clampPercent(displayPercent);
}

// Tie counts are based on the displayed integer bucket, not the raw floating average.
export function getTieStats<TEntry extends DotGraphEntry = DotGraphEntry>({
  data,
  targetId,
  targetDisplay,
  displayPercentOf,
}: TieStatsParams<TEntry> = {}): DotGraphTieStats & { refKey: number } {
  const hasTargetDisplay = typeof targetDisplay === 'number' && Number.isFinite(targetDisplay);

  if (!data?.length || (!targetId && !hasTargetDisplay)) {
    return { below: 0, equal: 0, above: 0, totalOthers: 0, refKey: 0 };
  }

  const targetEntry = targetId
    ? data.find((entry) => entry._id === targetId) ?? null
    : null;

  const refKey = hasTargetDisplay
    ? clampPercent(targetDisplay)
    : targetEntry
      ? keyOf(targetEntry, displayPercentOf)
      : 0;

  let below = 0;
  let equal = 0;
  let above = 0;

  for (const entry of data) {
    if (targetEntry && entry._id === targetEntry._id) continue;
    const key = keyOf(entry, displayPercentOf);
    if (key < refKey) below += 1;
    else if (key > refKey) above += 1;
    else equal += 1;
  }

  return { below, equal, above, totalOthers: below + equal + above, refKey };
}

export function classifyPosition({
  below,
  equal,
  above,
}: DotGraphTieStats): DotGraphPositionClass {
  const totalOthers = below + equal + above;
  if (totalOthers === 0) return { position: 'solo', tieContext: 'none' };

  if (above === 0 && equal === 0) return { position: 'top', tieContext: 'none' };
  if (below === 0 && equal === 0) return { position: 'bottom', tieContext: 'none' };

  if (above === 0 && equal > 0) return { position: 'top', tieContext: 'top' };
  if (below === 0 && equal > 0) return { position: 'bottom', tieContext: 'bottom' };
  if (equal > 0) return { position: 'middle', tieContext: 'middle' };

  if (below > above) return { position: 'middle-above', tieContext: 'none' };
  if (above > below) return { position: 'middle-below', tieContext: 'none' };
  return { position: 'middle', tieContext: 'none' };
}

export function buildTieBuckets<TEntry extends DotGraphEntry = DotGraphEntry>(
  data: TEntry[],
  displayPercentOf?: (item: TEntry) => number
): Map<number, string[]> {
  const map = new Map<number, string[]>();
  if (!data.length) return map;

  for (const entry of data) {
    if (!entry._id) continue;
    const key = keyOf(entry, displayPercentOf);
    const bucket = map.get(key) ?? [];
    bucket.push(entry._id);
    map.set(key, bucket);
  }

  for (const [key, bucket] of map) {
    if (bucket.length <= 1) map.delete(key);
  }

  return map;
}
