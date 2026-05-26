import { useCallback, useEffect, useMemo, useState } from "react";
import { DEFAULT_AVG, useCanvasRuntime } from "../../../app/state/canvas-runtime-context";
import type { LiveAvgButtonChange, LiveAvgButtonItem } from "./types";

function clamp01(n: number) {
  return Math.max(0, Math.min(1, n));
}

export function useLiveAvgButtons(
  items: LiveAvgButtonItem[],
  initialActiveIds: string[] = [],
  onChange?: (next: LiveAvgButtonChange) => void
) {
  const { setLiveAvg } = useCanvasRuntime();
  const [activeIds, setActiveIds] = useState<string[]>(() =>
    initialActiveIds.filter((id, index, arr) => arr.indexOf(id) === index)
  );

  const itemMap = useMemo(() => {
    const map = new Map<string, LiveAvgButtonItem>();
    items.forEach((item) => map.set(item.id, item));
    return map;
  }, [items]);

  const activeItems = useMemo(
    () =>
      activeIds
        .map((id) => itemMap.get(id))
        .filter((item): item is LiveAvgButtonItem => !!item && !item.disabled),
    [activeIds, itemMap]
  );

  const liveAvg = useMemo(() => {
    if (!activeItems.length) return DEFAULT_AVG;
    const total = activeItems.reduce((sum, item) => sum + clamp01(item.value), 0);
    return total / activeItems.length;
  }, [activeItems]);

  useEffect(() => {
    setLiveAvg(liveAvg);
    onChange?.({
      activeIds,
      activeItems,
      liveAvg,
    });
  }, [activeIds, activeItems, liveAvg, onChange, setLiveAvg]);

  const toggleButton = useCallback(
    (id: string) => {
      const item = itemMap.get(id);
      if (!item || item.disabled) return;

      setActiveIds((prev) => {
        const next = prev.includes(id)
          ? prev.filter((entry) => entry !== id)
          : [...prev, id];

        return next;
      });
    },
    [itemMap]
  );

  const isActive = useCallback((id: string) => activeIds.includes(id), [activeIds]);

  return {
    activeIds,
    activeItems,
    liveAvg,
    isActive,
    toggleButton,
  };
}
