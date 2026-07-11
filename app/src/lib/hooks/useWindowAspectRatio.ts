import { useEffect, useState } from "react";

const DEFAULT_ASPECT_RATIO = 1.78;

function readWindowAspectRatio() {
  const height = window.innerHeight || 1;
  return window.innerWidth / height;
}

export function useWindowAspectRatio(): number {
  const [aspectRatio, setAspectRatio] = useState(DEFAULT_ASPECT_RATIO);

  useEffect(() => {
    const handler = () => {
      setAspectRatio(readWindowAspectRatio());
    };
    handler();
    window.addEventListener("resize", handler);
    return () => {
      window.removeEventListener("resize", handler);
    };
  }, []);

  return aspectRatio;
}
