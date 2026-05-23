// Atmosphere horizon rules. Visual horizon follows the smallest grid row;
// fog starts slightly above it so the distant blend does not muddy the ground.
const FOG_HORIZON_POS_THRESHOLD = 0.527;

export function fogHorizonRowOffset(horizonPos?: number): number {
  return (horizonPos ?? 0) >= FOG_HORIZON_POS_THRESHOLD ? 3 : 2;
}

export function resolveHorizonRow(rowHeights: number[]): number {
  if (!Array.isArray(rowHeights) || rowHeights.length < 1) return 0;
  const minH = Math.min(...rowHeights);
  return rowHeights.indexOf(minH);
}

export function resolveFogHorizonRow(rowHeights: number[], horizonPos?: number): number {
  return Math.max(0, resolveHorizonRow(rowHeights) - fogHorizonRowOffset(horizonPos));
}
