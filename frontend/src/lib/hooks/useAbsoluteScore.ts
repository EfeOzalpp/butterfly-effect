// src/lib/hooks/useAbsoluteScore.ts
import { useMemo } from 'react';
import { avgWeightOf, toScore100, type WithWeights } from '../utils/score';

export interface AbsoluteOpts<TItem extends WithWeights = WithWeights> {
  accessor?: (item: TItem) => number;
  idOf?: (item: TItem) => string | undefined;
  decimals?: number;
}

const defaultIdOf = (item: WithWeights) => item._id;

/**
 * Absolute score hook (no pool comparison).
 * Returns 0..100 for a value, id, or item.
 */
export function useAbsoluteScore<TItem extends WithWeights>(
  items: TItem[],
  opts?: AbsoluteOpts<TItem>
) {
  const accessor = opts?.accessor ?? avgWeightOf;
  const idOf = opts?.idOf ?? defaultIdOf;
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
