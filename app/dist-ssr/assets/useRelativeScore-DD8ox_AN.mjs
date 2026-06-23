(function() {
	try {
		var e = "undefined" != typeof window ? window : "undefined" != typeof global ? global : "undefined" != typeof globalThis ? globalThis : "undefined" != typeof self ? self : {};
		e.SENTRY_RELEASE = { id: "131decce1f878a04c070a93aabe3e016cfcc66cb" };
		var n = new e.Error().stack;
		n && (e._sentryDebugIds = e._sentryDebugIds || {}, e._sentryDebugIds[n] = "2d39403c-ca37-46a0-b2b7-5f12e5bc33e5", e._sentryDebugIdIdentifier = "sentry-dbid-2d39403c-ca37-46a0-b2b7-5f12e5bc33e5");
	} catch (e) {}
})();
import { createContext, useContext, useMemo } from "react";
//#region src/app/state/identity-context.ts
var IdentityCtx = createContext(null);
function useIdentity() {
	const ctx = useContext(IdentityCtx);
	if (!ctx) throw new Error("useIdentity must be used within AppProvider");
	return ctx;
}
//#endregion
//#region src/app/state/survey-data-context.ts
var SurveyDataCtx = createContext(null);
function useSurveyData() {
	const ctx = useContext(SurveyDataCtx);
	if (!ctx) throw new Error("useSurveyData must be used within AppProvider");
	return ctx;
}
//#endregion
//#region src/app/state/ui-context.ts
var UiCtx = createContext(null);
function useUiFlow() {
	const ctx = useContext(UiCtx);
	if (!ctx) throw new Error("useUiFlow must be used within AppProvider");
	return ctx;
}
function useOptionalUiFlow() {
	return useContext(UiCtx);
}
//#endregion
//#region src/onboarding/section-picker/sections.ts
var ROLE_SECTIONS = {
	student: [
		{
			value: "3d-arts",
			label: "3D Arts"
		},
		{
			value: "animation",
			label: "Animation"
		},
		{
			value: "architecture",
			label: "Architecture"
		},
		{
			value: "art-education",
			label: "Art Education"
		},
		{
			value: "ceramics",
			label: "Ceramics"
		},
		{
			value: "communication-design",
			label: "Communication Design",
			aliases: ["comdes", "cd"]
		},
		{
			value: "creative-writing",
			label: "Creative Writing"
		},
		{
			value: "design-innovation",
			label: "Design Innovation",
			aliases: ["mdes"]
		},
		{
			value: "digital-media",
			label: "Digital Media",
			aliases: ["dm"]
		},
		{
			value: "dynamic-media-institute",
			label: "Dynamic Media Institute",
			aliases: ["dmi"]
		},
		{
			value: "fashion-design",
			label: "Fashion Design",
			aliases: ["fd"]
		},
		{
			value: "fibers",
			label: "Fibers"
		},
		{
			value: "film-video",
			label: "Film/Video",
			aliases: ["film"]
		},
		{
			value: "fine-arts-2d",
			label: "Fine Arts 2D",
			aliases: ["fa2d"]
		},
		{
			value: "furniture-design",
			label: "Furniture Design"
		},
		{
			value: "glass",
			label: "Glass"
		},
		{
			value: "history-of-art",
			label: "History of Art",
			aliases: ["hoa"]
		},
		{
			value: "humanities",
			label: "Humanities"
		},
		{
			value: "illustration",
			label: "Illustration",
			aliases: ["ill"]
		},
		{
			value: "industrial-design",
			label: "Industrial Design",
			aliases: ["id"]
		},
		{
			value: "integrative-sciences",
			label: "Integrative Sciences & Biological Arts",
			aliases: ["isba"]
		},
		{
			value: "jewelry-metalsmithing",
			label: "Jewelry & Metalsmithing"
		},
		{
			value: "liberal-arts",
			label: "Liberal Arts",
			aliases: ["la"]
		},
		{
			value: "mfa-low-residency",
			label: "MFA Low Residency",
			aliases: ["mfa-lr"]
		},
		{
			value: "mfa-low-residency-foundation",
			label: "MFA Low Residency | Studio Foundation",
			aliases: ["mfa-lr-sf"]
		},
		{
			value: "mfa-studio-arts",
			label: "MFA Studio Arts | Fine Arts 2D",
			aliases: ["mfa-2d"]
		},
		{
			value: "painting",
			label: "Painting"
		},
		{
			value: "photography",
			label: "Photography",
			aliases: ["photo"]
		},
		{
			value: "printmaking",
			label: "Printmaking"
		},
		{
			value: "sculpture",
			label: "Sculpture"
		},
		{
			value: "studio-arts",
			label: "Studio Arts"
		},
		{
			value: "studio-interrelated-media",
			label: "Studio for Interrelated Media",
			aliases: ["sim"]
		},
		{
			value: "studio-foundation",
			label: "Studio Foundation",
			aliases: ["sf"]
		},
		{
			value: "visual-storytelling",
			label: "Visual Storytelling & Comic Arts",
			aliases: ["vs"]
		}
	],
	staff: [
		{
			value: "academic-affairs",
			label: "Academic Affairs",
			aliases: ["aa"]
		},
		{
			value: "academic-resource-center",
			label: "Academic Resource Center",
			aliases: ["arc"]
		},
		{
			value: "administration-finance",
			label: "Administration & Finance"
		},
		{
			value: "administrative-services",
			label: "Administrative Services"
		},
		{
			value: "admissions",
			label: "Admissions"
		},
		{
			value: "artward-bound",
			label: "Artward Bound"
		},
		{
			value: "bookstore",
			label: "Bookstore"
		},
		{
			value: "bursar",
			label: "Bursar's Office"
		},
		{
			value: "career-development",
			label: "Career Development",
			aliases: ["career"]
		},
		{
			value: "center-art-community",
			label: "Center for Art & Community Partnerships",
			aliases: ["cacp"]
		},
		{
			value: "community-health",
			label: "Community Health & Well-being"
		},
		{
			value: "compass",
			label: "Compass"
		},
		{
			value: "conference-event-services",
			label: "Conference & Event Services"
		},
		{
			value: "counseling-center",
			label: "Counseling Center"
		},
		{
			value: "facilities",
			label: "Facilities"
		},
		{
			value: "fiscal-accounting",
			label: "Fiscal Affairs / Accounting Services"
		},
		{
			value: "fiscal-budget",
			label: "Fiscal Affairs / Budget Office"
		},
		{
			value: "graduate-programs",
			label: "Graduate Programs"
		},
		{
			value: "health-office",
			label: "Health Office"
		},
		{
			value: "housing-residence-life",
			label: "Housing & Residence Life",
			aliases: ["housing"]
		},
		{
			value: "human-resources",
			label: "Human Resources",
			aliases: ["hr"]
		},
		{
			value: "kennedy-cafeteria",
			label: "Kennedy Cafeteria",
			aliases: ["food"]
		},
		{
			value: "institutional-advancement",
			label: "Institutional Advancement"
		},
		{
			value: "institutional-research",
			label: "Institutional Research & Strategic Effectiveness"
		},
		{
			value: "international-education",
			label: "International Education Center"
		},
		{
			value: "justice-equity",
			label: "Justice, Equity, & Transformation",
			aliases: ["jet"]
		},
		{
			value: "library",
			label: "Library"
		},
		{
			value: "marketing-communications",
			label: "Marketing & Communications",
			aliases: ["marcom"]
		},
		{
			value: "maam",
			label: "MassArt Art Museum",
			aliases: ["maam"]
		},
		{
			value: "foundation",
			label: "MassArt Foundation"
		},
		{
			value: "president-office",
			label: "President's Office"
		},
		{
			value: "pce",
			label: "Professional & Continuing Education",
			aliases: ["pce"]
		},
		{
			value: "public-safety",
			label: "Public Safety"
		},
		{
			value: "registrar",
			label: "Registrar's Office"
		},
		{
			value: "student-development",
			label: "Student Development"
		},
		{
			value: "student-engagement",
			label: "Student Engagement"
		},
		{
			value: "student-financial-assistance",
			label: "Student Financial Assistance"
		},
		{
			value: "sustainability",
			label: "Sustainability"
		},
		{
			value: "technology",
			label: "Technology",
			aliases: ["it"]
		},
		{
			value: "woodshop",
			label: "Woodshop"
		},
		{
			value: "youth-programs",
			label: "Youth Programs"
		}
	]
};
//#endregion
//#region src/lib/utils/score.ts
function avgWeightOf(item) {
	if (typeof item.avgWeight === "number" && Number.isFinite(item.avgWeight)) return item.avgWeight;
	const values = Object.values(item.weights ?? {});
	return values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : .5;
}
function toScore100(value, decimals = 0) {
	const raw = Math.max(0, Math.min(1, value)) * 100;
	const pow = Math.pow(10, decimals);
	return Math.round(raw * pow) / pow;
}
//#endregion
//#region src/lib/hooks/useRelativeScore.ts
var defaultIdOf = (item) => item._id;
function useRelativeScores(items, opts) {
	const accessor = opts?.accessor ?? avgWeightOf;
	const tie = opts?.tie ?? "strict";
	const idOf = opts?.idOf ?? defaultIdOf;
	const { sorted, idToValue } = useMemo(() => {
		const sorted = items.map(accessor).slice().sort((a, b) => a - b);
		const idToValue = /* @__PURE__ */ new Map();
		items.forEach((it) => {
			const id = idOf(it);
			if (id) idToValue.set(id, accessor(it));
		});
		return {
			sorted,
			idToValue
		};
	}, [
		items,
		accessor,
		idOf
	]);
	const lowerBound = (v) => {
		let lo = 0, hi = sorted.length;
		while (lo < hi) {
			const mid = lo + hi >>> 1;
			if (sorted[mid] < v) lo = mid + 1;
			else hi = mid;
		}
		return lo;
	};
	const upperBound = (v) => {
		let lo = 0, hi = sorted.length;
		while (lo < hi) {
			const mid = lo + hi >>> 1;
			if (sorted[mid] <= v) lo = mid + 1;
			else hi = mid;
		}
		return lo;
	};
	const belowCount = (v) => tie === "strict" ? lowerBound(v) : upperBound(v);
	/** % of pool below value; optionally exclude one id (e.g., self) */
	const getForValue = (value, excludeId) => {
		if (!sorted.length || !Number.isFinite(value)) return 0;
		let pool = sorted.length;
		let cnt = belowCount(value);
		if (excludeId && idToValue.has(excludeId)) {
			const ex = idToValue.get(excludeId);
			if (ex === void 0) return Math.round(cnt / pool * 100);
			pool -= 1;
			if (tie === "strict") {
				if (ex < value) cnt -= 1;
			} else if (ex <= value) cnt -= 1;
		}
		if (pool <= 0) return 0;
		return Math.round(cnt / pool * 100);
	};
	/** raw count below; optionally exclude one id (e.g., self) */
	const getCountForValue = (value, excludeId) => {
		if (!sorted.length || !Number.isFinite(value)) return 0;
		let cnt = belowCount(value);
		if (excludeId && idToValue.has(excludeId)) {
			const ex = idToValue.get(excludeId);
			if (ex === void 0) return Math.max(0, cnt);
			if (tie === "strict") {
				if (ex < value) cnt -= 1;
			} else if (ex <= value) cnt -= 1;
		}
		return Math.max(0, cnt);
	};
	/** effective pool size used when excluding self (for messaging) */
	const getPoolSize = (excludeId) => Math.max(0, sorted.length - (excludeId && idToValue.has(excludeId) ? 1 : 0));
	/** % below for a given entry id (self excluded automatically). returns 0 if not found */
	const getForId = (id) => {
		if (!id || !idToValue.has(id)) return 0;
		const value = idToValue.get(id);
		return value === void 0 ? 0 : getForValue(value, id);
	};
	/** count below for a given entry id (self excluded automatically). returns 0 if not found */
	const getCountForId = (id) => {
		if (!id || !idToValue.has(id)) return 0;
		const value = idToValue.get(id);
		return value === void 0 ? 0 : getCountForValue(value, id);
	};
	/** % below for a data object (self excluded if it has an id) */
	const getForItem = (item) => {
		const id = idOf(item);
		return getForValue(accessor(item), id);
	};
	/** count below for a data object (self excluded if it has an id) */
	const getCountForItem = (item) => {
		const id = idOf(item);
		return getCountForValue(accessor(item), id);
	};
	return {
		getForId,
		getForItem,
		getForValue,
		getCountForId,
		getCountForItem,
		getCountForValue,
		getPoolSize
	};
}
//#endregion
export { UiCtx as a, SurveyDataCtx as c, useIdentity as d, ROLE_SECTIONS as i, useSurveyData as l, avgWeightOf as n, useOptionalUiFlow as o, toScore100 as r, useUiFlow as s, useRelativeScores as t, IdentityCtx as u };

//# sourceMappingURL=useRelativeScore-DD8ox_AN.mjs.map