import { useId, useMemo } from "react";

import expandAllSvg from "./expand_all.svg?raw";
import collapseAllSvg from "./collapse_all.svg?raw";

type ExpandIconProps = {
  expanded?: boolean;
  className?: string;
};

const injectSvgClasses = (svg: string, className: string) =>
  svg.replace(/<svg\b([^>]*)>/, `<svg$1 class="${className}" aria-hidden="true" focusable="false">`);

const scopeSvgIds = (svg: string, prefix: string) =>
  svg
    .replace(/id="([^"]+)"/g, (_, id) => `id="${prefix}-${id}"`)
    .replace(/url\(#([^)]+)\)/g, (_, id) => `url(#${prefix}-${id})`);

export default function ExpandIcon({ expanded = false, className = "ui-icon" }: ExpandIconProps) {
  const iconId = useId().replace(/:/g, "");

  const markup = useMemo(() => {
    const source = expanded ? collapseAllSvg : expandAllSvg;
    return injectSvgClasses(scopeSvgIds(source, `expand-${iconId}`), className);
  }, [className, expanded, iconId]);

  return (
    <span
      aria-hidden="true"
      style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", lineHeight: 0, verticalAlign: "middle" }}
      dangerouslySetInnerHTML={{ __html: markup }}
    />
  );
}
