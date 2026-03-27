import { useId, useMemo } from "react";

import closeSvg from "./close.svg?raw";

type CloseIconProps = {
  className?: string;
};

const injectSvgClasses = (svg: string, className: string) =>
  svg.replace(/<svg\b([^>]*)>/, `<svg$1 class="${className}" aria-hidden="true" focusable="false">`);

const scopeSvgIds = (svg: string, prefix: string) =>
  svg
    .replace(/id="([^"]+)"/g, (_, id) => `id="${prefix}-${id}"`)
    .replace(/url\(#([^)]+)\)/g, (_, id) => `url(#${prefix}-${id})`);

export default function CloseIcon({ className = "ui-close" }: CloseIconProps) {
  const iconId = useId().replace(/:/g, "");

  const markup = useMemo(() => {
    return injectSvgClasses(scopeSvgIds(closeSvg, `close-${iconId}`), className);
  }, [className, iconId]);

  return (
    <span
      aria-hidden="true"
      style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", lineHeight: 0, verticalAlign: "middle" }}
      dangerouslySetInnerHTML={{ __html: markup }}
    />
  );
}
