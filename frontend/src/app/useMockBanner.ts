import { useEffect, useMemo, useState } from "react";
import { useMockSanityReadMode } from "../services/sanity/config";

export function useMockBanner() {
  const mockReadMode = useMockSanityReadMode();
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (!mockReadMode.runtimeFallback) setDismissed(false);
  }, [mockReadMode.runtimeFallback]);

  useEffect(() => {
    if (!mockReadMode.runtimeFallback || mockReadMode.forced || dismissed) return;
    const timer = window.setTimeout(() => setDismissed(true), 10000);
    return () => window.clearTimeout(timer);
  }, [dismissed, mockReadMode.forced, mockReadMode.runtimeFallback]);

  const quotaResetMonth = useMemo(() => {
    const now = new Date();
    const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    return nextMonth.toLocaleString(undefined, { month: "long" });
  }, []);

  const visible = mockReadMode.runtimeFallback && !mockReadMode.forced && !dismissed;

  return { visible, dismissed, setDismissed, quotaResetMonth };
}
