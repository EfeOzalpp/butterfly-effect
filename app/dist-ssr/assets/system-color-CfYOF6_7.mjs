(function() {
	try {
		var e = "undefined" != typeof window ? window : "undefined" != typeof global ? global : "undefined" != typeof globalThis ? globalThis : "undefined" != typeof self ? self : {};
		e.SENTRY_RELEASE = { id: "131decce1f878a04c070a93aabe3e016cfcc66cb" };
		var n = new e.Error().stack;
		n && (e._sentryDebugIds = e._sentryDebugIds || {}, e._sentryDebugIds[n] = "4b00fabd-1ab3-40cb-9ea7-2df1936baec4", e._sentryDebugIdIdentifier = "sentry-dbid-4b00fabd-1ab3-40cb-9ea7-2df1936baec4");
	} catch (e) {}
})();
import { P as usePreferences } from "../entry-server.mjs";
import { createPortal } from "react-dom";
import { jsx } from "react/jsx-runtime";
//#region src/navigation/right/system-color.tsx
function DarkMode() {
	const { darkMode } = usePreferences();
	if (typeof document === "undefined" || !darkMode) return null;
	return createPortal(/* @__PURE__ */ jsx("div", {
		style: {
			position: "fixed",
			inset: 0,
			width: "100vw",
			height: "100vh",
			pointerEvents: "none",
			zIndex: 1
		},
		children: /* @__PURE__ */ jsx("div", { style: {
			position: "absolute",
			inset: -1,
			borderRadius: 0,
			backgroundColor: "rgba(13, 14, 15, 0.91)",
			opacity: 1,
			transform: "scale(1)",
			transition: "opacity 140ms linear, transform 140ms ease-out",
			mixBlendMode: "difference",
			willChange: "opacity, transform"
		} })
	}), document.body);
}
//#endregion
export { DarkMode as default };

//# sourceMappingURL=system-color-CfYOF6_7.mjs.map