// src/graph-runtime/dotgraph/utils/tieGraph.ts

import type { Vec3 } from "../types";

interface TieGraphEntry {
  _id?: string;
}

export function buildRankChainIds<TEntry extends TieGraphEntry>(
  entries: TEntry[],
  keyOf: (entry: TEntry) => number,
  avgOf: (entry: TEntry) => number
): string[] {
  if (!entries.length) return [];

  const sorted = entries
    .map((entry) => ({ id: entry._id, avg: avgOf(entry), key: keyOf(entry) }))
    .filter(
      (row): row is { id: string; avg: number; key: number } =>
        typeof row.id === "string"
    )
    .sort((a, b) => a.avg - b.avg);

  const seenKeys = new Set<number>();
  const uniqueIds: string[] = [];
  for (const row of sorted) {
    if (!seenKeys.has(row.key)) {
      uniqueIds.push(row.id);
      seenKeys.add(row.key);
    }
  }
  return uniqueIds;
}

export function buildTieBuckets<TEntry extends TieGraphEntry>(
  entries: TEntry[],
  keyOf: (entry: TEntry) => number
): Map<number, string[]> {
  const buckets = new Map<number, string[]>();
  for (const entry of entries) {
    const id = entry._id;
    if (typeof id !== "string") continue;
    const key = keyOf(entry);
    const arr = buckets.get(key) ?? [];
    arr.push(id);
    buckets.set(key, arr);
  }
  for (const [k, arr] of buckets) {
    if (arr.length <= 1) buckets.delete(k);
  }
  return buckets;
}

export function getTieKeyForId<TEntry extends TieGraphEntry>(
  id: string,
  entries: TEntry[],
  tieBuckets: Map<number, string[]>,
  keyOf: (entry: TEntry) => number
): number | null {
  const entry = entries.find((item) => item._id === id);
  if (!entry) return null;
  const key = keyOf(entry);
  const arr = tieBuckets.get(key);
  return arr && arr.length > 1 ? key : null;
}

export function getHoveredRelativeIds<TEntry extends TieGraphEntry>(
  hoveredId: string | null,
  entries: TEntry[],
  tieBuckets: Map<number, string[]>,
  keyOf: (entry: TEntry) => number
): string[] {
  if (!hoveredId) return [];
  const entry = entries.find((item) => item._id === hoveredId);
  if (!entry) return [];
  const key = keyOf(entry);
  return tieBuckets.get(key) ?? [];
}

export function getSelectedTieLinePoints(
  selectedTieKey: number | null,
  tieBuckets: Map<number, string[]>,
  posById: Map<string, Vec3>
): Vec3[] {
  if (selectedTieKey == null || !tieBuckets.has(selectedTieKey)) return [];
  const ids = tieBuckets.get(selectedTieKey) ?? [];
  const pts: Vec3[] = [];

  for (const id of ids) {
    const point = posById.get(id);
    if (point) pts.push(point);
  }

  if (pts.length < 2) return [];
  let cx = 0;
  let cz = 0;
  for (const p of pts) {
    cx += p[0];
    cz += p[2];
  }
  cx /= pts.length;
  cz /= pts.length;

  return pts.slice().sort((a, b) => {
    const aa = Math.atan2(a[2] - cz, a[0] - cx);
    const bb = Math.atan2(b[2] - cz, b[0] - cx);
    return aa - bb;
  });
}
