import { useCallback, useEffect, useRef, useState } from "react";

export function useTransientFlag(durationMs: number) {
  const [visible, setVisible] = useState(false);
  const timerRef = useRef<number | null>(null);

  const clearTimer = useCallback(() => {
    if (timerRef.current == null) return;
    window.clearTimeout(timerRef.current);
    timerRef.current = null;
  }, []);

  const hide = useCallback(() => {
    clearTimer();
    setVisible(false);
  }, [clearTimer]);

  const show = useCallback(() => {
    clearTimer();
    setVisible(true);
    timerRef.current = window.setTimeout(() => {
      setVisible(false);
      timerRef.current = null;
    }, durationMs);
  }, [clearTimer, durationMs]);

  useEffect(() => clearTimer, [clearTimer]);

  return { visible, show, hide };
}
