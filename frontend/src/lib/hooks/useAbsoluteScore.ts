// src/lib/hooks/useAbsoluteScore.ts
import { useMemo } from 'react';

interface WithWeights {
  _id?: string;
  weights?: Record<string, number>;
  avgWeight?: number;
}

export interface AbsoluteOpts<TItem extends WithWeights = WithWeights> {
  accessor?: (item: TItem) => number;
  idOf?: (item: TItem) => string | undefined;
  decimals?: number;
}

// Prefer server avgWeight; otherwise mean(weights); fallback 0.5.
const avgWeightOf = (item: WithWeights): number => {
  if (typeof item.avgWeight === 'number' && Number.isFinite(item.avgWeight)) {
    return item.avgWeight;
  }
  const vals = Object.values(item.weights ?? {});
  return vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : 0.5;
};

const toScore100 = (v: number, decimals = 0) => {
  const clamped = Math.max(0, Math.min(1, v));
  const raw = clamped * 100;
  const pow = Math.pow(10, decimals);
  return Math.round(raw * pow) / pow;
};

/**
 * Absolute score hook (no pool comparison).
 * Returns 0..100 for a value, id, or item.
 */
export function useAbsoluteScore<TItem extends WithWeights>(
  items: TItem[],
  opts?: AbsoluteOpts<TItem>
) {
  const accessor = opts?.accessor ?? avgWeightOf;
  const idOf = opts?.idOf ?? ((item: TItem) => item._id);
  const decimals = opts?.decimals ?? 0;

  const idToValue = useMemo(() => {
    const map = new Map<string, number>();
    items.forEach((it) => {
      const id = idOf(it);
      if (id) map.set(id, accessor(it));
    });
    return map;
  }, [items, accessor, idOf]);

  const getForValue = (value: number) => toScore100(value, decimals);

  const getForId = (id?: string) => {
    if (!id || !idToValue.has(id)) return 0;
    const value = idToValue.get(id);
    return value === undefined ? 0 : getForValue(value);
  };

  const getForItem = (item: TItem) => {
    const v = accessor(item);
    return getForValue(v);
    // (We don't exclude self because this is absolute, not relative.)
  };

  return { getForId, getForItem, getForValue };
}
