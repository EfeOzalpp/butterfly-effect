// src/lib/hooks/usePreventPageZoom.ts
import { useEffect } from "react";

interface Options {
  allowWithin: string[];
  disabled?: boolean;
}

function isElement(x: unknown): x is Element {
  return x instanceof Element;
}

function isTouchEvent(event: Event): event is TouchEvent {
  return typeof TouchEvent !== "undefined" && event instanceof TouchEvent;
}

function isZoomGesture(event: Event) {
  const ctrlKey = event instanceof WheelEvent && event.ctrlKey;
  const touchCount =
    isTouchEvent(event) ? event.touches.length : 0;
  const multiTouch = touchCount > 1;
  const safariGestureEvent = event.type.startsWith("gesture");
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
      // Only prevent if it's actually a zoom gesture
      if (!isZoomGesture(event)) return;

      const target = event.target;
      if (shouldAllow(target)) return;

      event.preventDefault();
    };

    // Safari/iOS gesture* events + ctrl+wheel + pinch move
    const activeOptions: AddEventListenerOptions = { passive: false };
    document.addEventListener("wheel", handler, activeOptions);
    document.addEventListener("gesturestart", handler, activeOptions);
    document.addEventListener("gesturechange", handler, activeOptions);
    document.addEventListener("gestureend", handler, activeOptions);
    document.addEventListener("touchmove", handler, activeOptions);

    return () => {
      document.removeEventListener("wheel", handler);
      document.removeEventListener("gesturestart", handler);
      document.removeEventListener("gesturechange", handler);
      document.removeEventListener("gestureend", handler);
      document.removeEventListener("touchmove", handler);
    };
  }, [allowWithin, disabled]);
}
