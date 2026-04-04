export function resolveHorizonRow(rowHeights: number[]): number {
  if (!Array.isArray(rowHeights) || rowHeights.length < 1) return 0;
  const minH = Math.min(...rowHeights);
  return rowHeights.indexOf(minH);
}
