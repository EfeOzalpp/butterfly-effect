(function() {
	try {
		var e = "undefined" != typeof window ? window : "undefined" != typeof global ? global : "undefined" != typeof globalThis ? globalThis : "undefined" != typeof self ? self : {};
		e.SENTRY_RELEASE = { id: "131decce1f878a04c070a93aabe3e016cfcc66cb" };
		var n = new e.Error().stack;
		n && (e._sentryDebugIds = e._sentryDebugIds || {}, e._sentryDebugIds[n] = "019c5426-3b8a-4677-9172-19257c55df62", e._sentryDebugIdIdentifier = "sentry-dbid-019c5426-3b8a-4677-9172-19257c55df62");
	} catch (e) {}
})();
import "./shapes-BYH03xOX.mjs";
import { F as useCanvasRuntime, t as EngineHost } from "../entry-server.mjs";
import { jsx, jsxs } from "react/jsx-runtime";
//#region src/canvas-instances/QuestionnaireEntry.tsx
function QuestionnaireEntry({ visible = true }) {
	const { liveAvg, reservedFootprints } = useCanvasRuntime();
	return /* @__PURE__ */ jsxs("div", {
		className: "onboarding-canvas questionnaire-active",
		role: "img",
		"aria-label": "Animated sustainability questionnaire visualization",
		children: [/* @__PURE__ */ jsx("div", {
			id: "questionnaire-canvas-root",
			style: {
				width: "100%",
				height: "100%"
			}
		}), /* @__PURE__ */ jsx(EngineHost, {
			id: "questionnaire",
			open: true,
			visible,
			liveAvg,
			reservedFootprints
		})]
	});
}
//#endregion
export { QuestionnaireEntry as default };

//# sourceMappingURL=QuestionnaireEntry-D3thISd5.mjs.map