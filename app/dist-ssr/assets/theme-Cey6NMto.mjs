(function() {
	try {
		var e = "undefined" != typeof window ? window : "undefined" != typeof global ? global : "undefined" != typeof globalThis ? globalThis : "undefined" != typeof self ? self : {};
		e.SENTRY_RELEASE = { id: "131decce1f878a04c070a93aabe3e016cfcc66cb" };
		var n = new e.Error().stack;
		n && (e._sentryDebugIds = e._sentryDebugIds || {}, e._sentryDebugIds[n] = "cec32283-a953-46f8-900e-2f3faec5adb7", e._sentryDebugIdIdentifier = "sentry-dbid-cec32283-a953-46f8-900e-2f3faec5adb7");
	} catch (e) {}
})();
import { t as invalidateSpriteTexturesForThemeChange } from "./theme-CrGG_WGJ.mjs";
export { invalidateSpriteTexturesForThemeChange };
