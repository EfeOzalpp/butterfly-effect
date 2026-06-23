(function() {
	try {
		var e = "undefined" != typeof window ? window : "undefined" != typeof global ? global : "undefined" != typeof globalThis ? globalThis : "undefined" != typeof self ? self : {};
		e.SENTRY_RELEASE = { id: "131decce1f878a04c070a93aabe3e016cfcc66cb" };
		var n = new e.Error().stack;
		n && (e._sentryDebugIds = e._sentryDebugIds || {}, e._sentryDebugIds[n] = "4ca7a1bb-a79b-45d2-84e6-f77b8df3c961", e._sentryDebugIdIdentifier = "sentry-dbid-4ca7a1bb-a79b-45d2-84e6-f77b8df3c961");
	} catch (e) {}
})();
import { n as usePersonalizedPools, t as useGeneralPools } from "./useGamificationPools-AoDkdkBO.mjs";
//#region src/lib/hooks/useGamificationTextPreload.ts
function GamificationCopyPreloader() {
	useGeneralPools();
	usePersonalizedPools();
	return null;
}
//#endregion
export { GamificationCopyPreloader as default };

//# sourceMappingURL=useGamificationTextPreload-Dz_cZv_t.mjs.map