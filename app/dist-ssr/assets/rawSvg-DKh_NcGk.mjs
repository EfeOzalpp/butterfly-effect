//#region src/assets/svg/shared/rawSvg.ts
(function() {
	try {
		var e = "undefined" != typeof window ? window : "undefined" != typeof global ? global : "undefined" != typeof globalThis ? globalThis : "undefined" != typeof self ? self : {};
		e.SENTRY_RELEASE = { id: "131decce1f878a04c070a93aabe3e016cfcc66cb" };
		var n = new e.Error().stack;
		n && (e._sentryDebugIds = e._sentryDebugIds || {}, e._sentryDebugIds[n] = "45b4fa8a-0ec0-4d32-8817-9a1987d4a9ee", e._sentryDebugIdIdentifier = "sentry-dbid-45b4fa8a-0ec0-4d32-8817-9a1987d4a9ee");
	} catch (e) {}
})();
var RAW_SVG_WRAPPER_STYLE = {
	display: "inline-flex",
	alignItems: "center",
	justifyContent: "center",
	lineHeight: 0,
	verticalAlign: "middle"
};
function injectSvgClasses(svg, className) {
	return svg.replace(/<svg\b([^>]*)>/, `<svg$1 class="${className}" aria-hidden="true" focusable="false">`);
}
function scopeSvgIds(svg, prefix) {
	return svg.replace(/id="([^"]+)"/g, (_match, id) => `id="${prefix}-${id}"`).replace(/url\(#([^)]+)\)/g, (_match, id) => `url(#${prefix}-${id})`);
}
function prepareRawSvgMarkup(svg, prefix, className) {
	return injectSvgClasses(scopeSvgIds(svg, prefix), className);
}
//#endregion
export { prepareRawSvgMarkup as n, RAW_SVG_WRAPPER_STYLE as t };

//# sourceMappingURL=rawSvg-DKh_NcGk.mjs.map