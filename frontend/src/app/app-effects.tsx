// src/app/app-effects.tsx
// Browser-only app shell effects live here so main.tsx stays readable.

import { useEffect, useState } from "react";

import GamificationCopyPreloader from "../lib/hooks/useGamificationTextPreload";
import { usePreventPageZoomOutsideZones } from "../lib/hooks/usePreventPageZoom";
import { useMockBanner } from "./useMockBanner";

interface AppBrowserPoliciesProps {
  questionnaireOpen: boolean;
  vizVisible: boolean;
}

export function DeferredGamificationPreloader() {
  const [start, setStart] = useState<boolean>(false);

  useEffect(() => {
    const cb = () => { setStart(true); };
    if (typeof window !== "undefined" && "requestIdleCallback" in window) {
      window.requestIdleCallback(cb, { timeout: 1500 });
    } else {
      setTimeout(cb, 0);
    }
  }, []);

  return start ? <GamificationCopyPreloader /> : null;
}

export function AppBrowserPolicies({
  questionnaireOpen,
  vizVisible,
}: AppBrowserPoliciesProps) {
  const zoomAllowedZones = questionnaireOpen
    ? [
        ".graph-container",
        ".dot-graph-container",
        "#city-canvas-root",
      ]
    : [
        ".graph-container",
        ".dot-graph-container",
        "#canvas-root",
        "#city-canvas-root",
      ];

  usePreventPageZoomOutsideZones({
    allowWithin: zoomAllowedZones,
  });

  useEffect(() => {
    if (typeof window === "undefined" || !vizVisible) return;
    // When users leave the graph, the onboarding canvas is likely next.
    const prefetch = () => { void import("../canvas-instances/OnboardingEntry"); };
    if ("requestIdleCallback" in window) {
      window.requestIdleCallback(prefetch, { timeout: 1500 });
    } else {
      const t = setTimeout(prefetch, 0);
      return () => { clearTimeout(t); };
    }
  }, [vizVisible]);

  useEffect(() => {
    if (typeof document === "undefined") return;

    const prevHtmlOverflow = document.documentElement.style.overflow;
    const prevBodyOverflow = document.body.style.overflow;

    if (vizVisible) {
      // The graph owns the viewport while mounted; page scroll fights the camera.
      document.documentElement.style.overflow = "hidden";
      document.body.style.overflow = "hidden";
    } else {
      document.documentElement.style.overflow = prevHtmlOverflow;
      document.body.style.overflow = prevBodyOverflow;
    }

    return () => {
      document.documentElement.style.overflow = prevHtmlOverflow;
      document.body.style.overflow = prevBodyOverflow;
    };
  }, [vizVisible]);

  return null;
}

export function MockReadBanner() {
  const { visible, setDismissed, quotaResetMonth } = useMockBanner();
  if (!visible) return null;

  return (
    <div className="mock-read-banner" role="status" aria-live="polite">
      <span>{`API quota exceeded. Demo data until ${quotaResetMonth} 1.`}</span>
      <button
        type="button"
        className="mock-read-banner-close"
        aria-label="Dismiss demo data notice"
        onClick={() => { setDismissed(true); }}
      >
        <svg
          width="100%"
          height="100%"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
          focusable="false"
        >
          <path
            d="M17 7L7 17M7 7L17 17"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
    </div>
  );
}
