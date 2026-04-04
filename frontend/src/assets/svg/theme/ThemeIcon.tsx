import { useId, useMemo } from "react";

import darkModeSvg from "./dark_mode.svg?raw";
import lightModeSvg from "./light_mode.svg?raw";
import { prepareRawSvgMarkup, RAW_SVG_WRAPPER_STYLE } from "../shared/rawSvg";

type ThemeIconProps = {
  mode: "dark" | "light";
  className?: string;
};

export default function ThemeIcon({ mode, className = "ui-icon" }: ThemeIconProps) {
  const iconId = useId().replace(/:/g, "");

  const markup = useMemo(() => {
    const svg = mode === "dark" ? darkModeSvg : lightModeSvg;
    return prepareRawSvgMarkup(svg, `theme-${mode}-${iconId}`, className);
  }, [className, iconId, mode]);

  return (
    <span
      aria-hidden="true"
      style={RAW_SVG_WRAPPER_STYLE}
      dangerouslySetInnerHTML={{ __html: markup }}
    />
  );
}
