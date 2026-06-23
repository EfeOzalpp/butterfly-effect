(function() {
	try {
		var e = "undefined" != typeof window ? window : "undefined" != typeof global ? global : "undefined" != typeof globalThis ? globalThis : "undefined" != typeof self ? self : {};
		e.SENTRY_RELEASE = { id: "131decce1f878a04c070a93aabe3e016cfcc66cb" };
		var n = new e.Error().stack;
		n && (e._sentryDebugIds = e._sentryDebugIds || {}, e._sentryDebugIds[n] = "7cf477d3-440d-4d5a-85c8-907b3db2b133", e._sentryDebugIdIdentifier = "sentry-dbid-7cf477d3-440d-4d5a-85c8-907b3db2b133");
	} catch (e) {}
})();
import { captureException } from "@sentry/react";
export { captureException };
