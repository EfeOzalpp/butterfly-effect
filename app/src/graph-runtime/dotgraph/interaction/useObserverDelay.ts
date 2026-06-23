// src/graph-runtime/dotgraph/interaction/useObserverDelay.ts

import { useEffect, useRef, useState } from 'react';

export default function useObserverDelay(observerMode: boolean, delayMs = 2000): boolean {
  const [showCompleteUI, setShowCompleteUI] = useState<boolean>(!observerMode);
  const t = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (t.current) {
      clearTimeout(t.current);
      t.current = null;
    }

    if (observerMode) {
      // Observer mode must hide the personal UI immediately before the delayed reveal path.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setShowCompleteUI(false);
    } else {
      t.current = setTimeout(() => {
        setShowCompleteUI(true);
        t.current = null;
      }, delayMs);
    }

    return () => {
      if (t.current) clearTimeout(t.current);
      t.current = null;
    };
  }, [observerMode, delayMs]);

  return showCompleteUI;
}
