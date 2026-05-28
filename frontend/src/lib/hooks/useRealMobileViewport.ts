// src/lib/hooks/useRealMobileViewport.ts
import { useEffect, useState } from 'react';
import { VIEWPORT_BREAKPOINTS } from '../responsive/breakpoints';

export function useRealMobileViewport() {
  const [isRealMobile, setIsRealMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      const touch = navigator.maxTouchPoints > 0;
      const coarse = window.matchMedia('(pointer: coarse)').matches;
      const width = window.innerWidth;
      const ua = navigator.userAgent;

      // iPadOS can report a desktop-like user agent, so touch is part of the check.
      const isIOS = ua.includes('iPad') || ua.includes('iPhone') || ua.includes('iPod') ||
        (ua.includes('Macintosh') && touch);

      // Android detection
      const isAndroid = ua.includes('Android');

      // Consider it real mobile if:
      // - Touch exists, and viewport is small, or
      // - Known mobile UA
      const realMobile =
        (touch && width <= VIEWPORT_BREAKPOINTS.tabletMax) ||
        isIOS ||
        isAndroid ||
        coarse;

      setIsRealMobile(realMobile);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    window.addEventListener('orientationchange', checkMobile);

    return () => {
      window.removeEventListener('resize', checkMobile);
      window.removeEventListener('orientationchange', checkMobile);
    };
  }, []);

  return isRealMobile;
}
