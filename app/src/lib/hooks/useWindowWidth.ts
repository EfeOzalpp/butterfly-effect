// src/lib/hooks/useWindowWidth.ts

import { useEffect, useState } from "react";
import { DEFAULT_VIEWPORT_WIDTH } from "../responsive/breakpoints";

export function useWindowWidth(): number {
  const [width, setWidth] = useState(() =>
    typeof window === "undefined" ? DEFAULT_VIEWPORT_WIDTH : window.innerWidth
  );

  useEffect(() => {
    const handler = () => {
      setWidth(window.innerWidth);
    };
    window.addEventListener("resize", handler);
    return () => {
      window.removeEventListener("resize", handler);
    };
  }, []);

  return width;
}
