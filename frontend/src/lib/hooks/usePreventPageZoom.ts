// utils-hooks/usePreventPageZoom.ts
import { useEffect } from "react";

type Options = {
  /** CSS selectors for elements where pinch/ctrl-zoom is allowed */
  allowWithin: string[];
  /** disable listener installation entirely */
  disabled?: boolean;
};

function isElement(x: unknown): x is Element {
  return !!x && typeof (x as any).closest === "function";
}

function isZoomGesture(event: any) {
  const ctrlKey = !!event?.ctrlKey;
  const touchCount =
    typeof event?.touches?.length === "number" ? event.touches.length : 0;
  const multiTouch = touchCount > 1;
  const safariGestureEvent = /^gesture/.test(String(event?.type || ""));
  return ctrlKey || multiTouch || safariGestureEvent;
}

export function usePreventPageZoomOutsideZones({ allowWithin, disabled }: Options) {
  useEffect(() => {
    if (disabled) return;

    const allowSelector = allowWithin.filter(Boolean).join(", ");

    const shouldAllow = (target: EventTarget | null) => {
      if (!allowSelector) return false;
      if (!isElement(target)) return false;
      return !!target.closest(allowSelector);
    };

    const handler = (event: Event) => {
      const e = event as any;

      // Only prevent if it's actually a zoom gesture
      if (!isZoomGesture(e)) return;

      const target = event.target as EventTarget | null;
      if (shouldAllow(target)) return;

      event.preventDefault();
    };

    // Safari/iOS gesture* events + ctrl+wheel + pinch move
    document.addEventListener("wheel", handler, { passive: false });
    document.addEventListener("gesturestart", handler as any, { passive: false } as any);
    document.addEventListener("gesturechange", handler as any, { passive: false } as any);
    document.addEventListener("gestureend", handler as any, { passive: false } as any);
    document.addEventListener("touchmove", handler as any, { passive: false });

    return () => {
      document.removeEventListener("wheel", handler as any);
      document.removeEventListener("gesturestart", handler as any);
      document.removeEventListener("gesturechange", handler as any);
      document.removeEventListener("gestureend", handler as any);
      document.removeEventListener("touchmove", handler as any);
    };
  }, [allowWithin, disabled]);
}
