import { useId, useMemo } from "react";

import darkModeSvg from "./dark_mode.svg?raw";
import lightModeSvg from "./light_mode.svg?raw";

type ThemeIconProps = {
  mode: "dark" | "light";
  className?: string;
};

const injectSvgClasses = (svg: string, className: string) =>
  svg.replace(/<svg\b([^>]*)>/, `<svg$1 class="${className}" aria-hidden="true" focusable="false">`);

const scopeSvgIds = (svg: string, prefix: string) =>
  svg
    .replace(/id="([^"]+)"/g, (_, id) => `id="${prefix}-${id}"`)
    .replace(/url\(#([^)]+)\)/g, (_, id) => `url(#${prefix}-${id})`);

export default function ThemeIcon({ mode, className = "ui-icon" }: ThemeIconProps) {
  const iconId = useId().replace(/:/g, "");

  const markup = useMemo(() => {
    const svg = mode === "dark" ? darkModeSvg : lightModeSvg;
    return injectSvgClasses(scopeSvgIds(svg, `theme-${mode}-${iconId}`), className);
  }, [className, iconId, mode]);

  return (
    <span
      aria-hidden="true"
      style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", lineHeight: 0, verticalAlign: "middle" }}
      dangerouslySetInnerHTML={{ __html: markup }}
    />
  );
}
