export interface WithWeights {
  _id?: string;
  weights?: Record<string, number>;
  avgWeight?: number;
}

export function avgWeightOf(item: WithWeights): number {
  if (typeof item.avgWeight === "number" && Number.isFinite(item.avgWeight)) {
    return item.avgWeight;
  }

  const values = Object.values(item.weights ?? {});
  return values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : 0.5;
}

export function toScore100(value: number, decimals = 0): number {
  const clamped = Math.max(0, Math.min(1, value));
  const raw = clamped * 100;
  const pow = Math.pow(10, decimals);
  return Math.round(raw * pow) / pow;
}
