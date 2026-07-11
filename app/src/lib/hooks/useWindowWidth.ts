// src/lib/hooks/useWindowWidth.ts

import { useEffect, useState } from "react";
import { DEFAULT_VIEWPORT_WIDTH } from "../responsive/breakpoints";

export function useWindowWidth(): number {
  const [width, setWidth] = useState<number>(DEFAULT_VIEWPORT_WIDTH);

  useEffect(() => {
    const handler = () => {
      setWidth(window.innerWidth);
    };
    handler();
    window.addEventListener("resize", handler);
    return () => {
      window.removeEventListener("resize", handler);
    };
  }, []);

  return width;
}
