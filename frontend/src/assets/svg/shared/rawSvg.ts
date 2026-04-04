export const RAW_SVG_WRAPPER_STYLE = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  lineHeight: 0,
  verticalAlign: "middle",
} as const;

function injectSvgClasses(svg: string, className: string) {
  return svg.replace(/<svg\b([^>]*)>/, `<svg$1 class="${className}" aria-hidden="true" focusable="false">`);
}

function scopeSvgIds(svg: string, prefix: string) {
  return svg
    .replace(/id="([^"]+)"/g, (_, id) => `id="${prefix}-${id}"`)
    .replace(/url\(#([^)]+)\)/g, (_, id) => `url(#${prefix}-${id})`);
}

export function prepareRawSvgMarkup(svg: string, prefix: string, className: string) {
  return injectSvgClasses(scopeSvgIds(svg, prefix), className);
}
