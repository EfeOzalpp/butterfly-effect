export function buildRankChainIds(
  entries: any[],
  keyOf: (d: any) => number,
  avgOf: (d: any) => number
): string[] {
  if (!entries.length) return [];

  const sorted = entries
    .map((d) => ({ id: d?._id, avg: avgOf(d), key: keyOf(d) }))
    .filter((x) => typeof x.id === "string")
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

export function buildTieBuckets(
  entries: any[],
  keyOf: (d: any) => number
): Map<number, string[]> {
  const buckets = new Map<number, string[]>();
  for (const d of entries) {
    const id = d?._id;
    if (typeof id !== "string") continue;
    const key = keyOf(d);
    const arr = buckets.get(key) || [];
    arr.push(id);
    buckets.set(key, arr);
  }
  for (const [k, arr] of buckets) {
    if (!arr || arr.length <= 1) buckets.delete(k);
  }
  return buckets;
}

export function getTieKeyForId(
  id: string,
  entries: any[],
  tieBuckets: Map<number, string[]>,
  keyOf: (d: any) => number
): number | null {
  const entry = entries.find((d) => d?._id === id);
  if (!entry) return null;
  const key = keyOf(entry);
  const arr = tieBuckets.get(key);
  return arr && arr.length > 1 ? key : null;
}

export function getHoveredRelativeIds(
  hoveredId: string | null,
  entries: any[],
  tieBuckets: Map<number, string[]>,
  keyOf: (d: any) => number
): string[] {
  if (!hoveredId) return [];
  const entry = entries.find((d) => d?._id === hoveredId);
  if (!entry) return [];
  const key = keyOf(entry);
  return tieBuckets.get(key) || [];
}

export function getSelectedTieLinePoints(
  selectedTieKey: number | null,
  tieBuckets: Map<number, string[]>,
  posById: Map<string, any>
): any[] {
  if (selectedTieKey == null || !tieBuckets.has(selectedTieKey)) return [];
  const ids = (tieBuckets.get(selectedTieKey) || []).filter((id) =>
    posById.has(id)
  );
  if (ids.length < 2) return [];

  const pts = ids.map((id) => posById.get(id) as any);
  let cx = 0;
  let cy = 0;
  let cz = 0;
  for (const p of pts) {
    cx += p[0];
    cy += p[1];
    cz += p[2];
  }
  cx /= pts.length;
  cy /= pts.length;
  cz /= pts.length;

  return pts.slice().sort((a: any, b: any) => {
    const aa = Math.atan2(a[2] - cz, a[0] - cx);
    const bb = Math.atan2(b[2] - cz, b[0] - cx);
    return aa - bb;
  });
}
