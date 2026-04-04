import { useId, useMemo } from "react";

import checkSvg from "./check.svg?raw";
import { prepareRawSvgMarkup, RAW_SVG_WRAPPER_STYLE } from "../shared/rawSvg";

type CheckIconProps = {
  className?: string;
};

function sanitizeCheckIconClassName(className: string) {
  return className
    .split(/\s+/)
    .filter((token) => token && token !== "ui-icon")
    .join(" ");
}

export default function CheckIcon({ className = "" }: CheckIconProps) {
  const iconId = useId().replace(/:/g, "");
  const resolvedClassName = sanitizeCheckIconClassName(className);

  const markup = useMemo(() => {
    return prepareRawSvgMarkup(checkSvg, `check-${iconId}`, resolvedClassName);
  }, [iconId, resolvedClassName]);

  return (
    <span
      aria-hidden="true"
      style={RAW_SVG_WRAPPER_STYLE}
      dangerouslySetInnerHTML={{ __html: markup }}
    />
  );
}
