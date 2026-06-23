(function() {
	try {
		var e = "undefined" != typeof window ? window : "undefined" != typeof global ? global : "undefined" != typeof globalThis ? globalThis : "undefined" != typeof self ? self : {};
		e.SENTRY_RELEASE = { id: "131decce1f878a04c070a93aabe3e016cfcc66cb" };
		var n = new e.Error().stack;
		n && (e._sentryDebugIds = e._sentryDebugIds || {}, e._sentryDebugIds[n] = "3e037057-f102-472f-b5f9-0aba6a684e8d", e._sentryDebugIdIdentifier = "sentry-dbid-3e037057-f102-472f-b5f9-0aba6a684e8d");
	} catch (e) {}
})();
import { D as enableMockReadFallback, O as shouldUseMockReads, T as subscribeMockSurveyData } from "../entry-server.mjs";
//#region src/client-api/read-api/api.ts
var ReadApiError = class extends Error {
	constructor(message, status) {
		super(message);
		this.name = "ReadApiError";
		this.status = status;
	}
};
function isSurveyRows(value) {
	return Array.isArray(value) && value.every((row) => {
		if (!row || typeof row !== "object") return false;
		const record = row;
		return typeof record._id === "string" && typeof record.section === "string";
	});
}
function shouldFallbackToMock(error) {
	if (!(error instanceof ReadApiError)) return false;
	return error.status === 403 || error.status === 429 || error.status >= 500;
}
async function fetchSurveyRows(section, limit) {
	const url = new URL("/api/survey-responses", window.location.origin);
	url.searchParams.set("section", section);
	url.searchParams.set("limit", String(limit));
	const response = await fetch(url, { headers: { Accept: "application/json" } });
	const body = await response.json().catch(() => ({}));
	if (!response.ok) throw new ReadApiError(`Survey read API failed with status ${String(response.status)}`, response.status);
	if (!isSurveyRows(body.rows)) throw new ReadApiError("Survey read API returned an invalid response", 502);
	return body.rows;
}
function subscribeSurveyData({ section, limit = 300, onData }) {
	if (shouldUseMockReads()) return subscribeMockSurveyData({
		section,
		limit,
		onData
	});
	let closed = false;
	let mockUnsub = null;
	let timer = null;
	const clearTimer = () => {
		if (timer === null) return;
		window.clearTimeout(timer);
		timer = null;
	};
	const switchToMock = (error) => {
		if (closed || mockUnsub) return;
		clearTimer();
		enableMockReadFallback(error);
		mockUnsub = subscribeMockSurveyData({
			section,
			limit,
			onData
		});
	};
	const schedule = () => {
		clearTimer();
		if (closed || mockUnsub) return;
		timer = window.setTimeout(() => {
			refresh();
		}, 6e3);
	};
	const refresh = async () => {
		try {
			const rows = await fetchSurveyRows(section, limit);
			if (closed || mockUnsub) return;
			onData(rows);
			schedule();
		} catch (error) {
			if (closed) return;
			if (shouldFallbackToMock(error)) {
				switchToMock(error);
				return;
			}
			console.error("[read-api] survey rows", error);
			schedule();
		}
	};
	refresh();
	return () => {
		closed = true;
		clearTimer();
		mockUnsub?.();
	};
}
//#endregion
export { subscribeSurveyData };

//# sourceMappingURL=api-Cuj6WUIU.mjs.map