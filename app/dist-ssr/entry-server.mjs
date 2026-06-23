(function() {
	try {
		var e = "undefined" != typeof window ? window : "undefined" != typeof global ? global : "undefined" != typeof globalThis ? globalThis : "undefined" != typeof self ? self : {};
		e.SENTRY_RELEASE = { id: "131decce1f878a04c070a93aabe3e016cfcc66cb" };
		var n = new e.Error().stack;
		n && (e._sentryDebugIds = e._sentryDebugIds || {}, e._sentryDebugIds[n] = "741b6a0b-4611-44b8-aa8c-631b0e2aace8", e._sentryDebugIdIdentifier = "sentry-dbid-741b6a0b-4611-44b8-aa8c-631b0e2aace8");
	} catch (e) {}
})();
import { A as clamp01$3, B as setSessionItem, C as createParticleStore, D as gradientColor, E as VIVID_COLOR_STOPS, F as applyThemeToDocument, I as getSessionItem, L as readStoredDarkMode, M as mixRgb, N as getCanvasMeta, P as setCanvasMeta, R as readStoredMode, S as footprintToPx, T as rand01Keyed, _ as shapeLifecycle, a as drawCarFactory, b as shapeStyle, c as drawCar, f as drawHouse, g as shapeIdentity, h as drawClouds, i as drawBus, j as finiteNumber, k as makeP, l as drawVilla, m as drawSnow, n as SHAPE_RENDER_PASSES, o as drawSun, r as drawTrees, s as drawSea, t as ENVIRONMENT_LIGHT_SHAPE, u as drawPower, v as shapePass, w as hashString32, x as createSceneLightContext, y as shapeProjection, z as removeSessionItems } from "./assets/shapes-BYH03xOX.mjs";
import { a as UiCtx, c as SurveyDataCtx, d as useIdentity, i as ROLE_SECTIONS, l as useSurveyData, n as avgWeightOf, r as toScore100, s as useUiFlow, t as useRelativeScores, u as IdentityCtx } from "./assets/useRelativeScore-DD8ox_AN.mjs";
import { n as prepareRawSvgMarkup, t as RAW_SVG_WRAPPER_STYLE } from "./assets/rawSvg-DKh_NcGk.mjs";
import * as React$1 from "react";
import React, { Component, Suspense, createContext, lazy, useCallback, useContext, useEffect, useId, useLayoutEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { createPortal, unstable_batchedUpdates } from "react-dom";
import { Fragment, jsx, jsxs } from "react/jsx-runtime";
//#region src/app/state/canvas-runtime-context.ts
var DEFAULT_AVG = .5;
var DEFAULT_SPOTLIGHT_SIGNAL = {
	index: 0,
	paused: false
};
var CanvasRuntimeCtx = createContext(null);
function useCanvasRuntime() {
	const ctx = useContext(CanvasRuntimeCtx);
	if (!ctx) throw new Error("useCanvasRuntime must be used within AppProvider");
	return ctx;
}
//#endregion
//#region src/app/state/useCanvasRuntimeState.ts
function normalizeAvg(avg) {
	return typeof avg === "number" && Number.isFinite(avg) ? avg : DEFAULT_AVG;
}
function sameFootprint(a, b) {
	return a.r0 === b.r0 && a.c0 === b.c0 && a.w === b.w && a.h === b.h;
}
function sameFootprints(a, b) {
	if (a === b) return true;
	if (a.length !== b.length) return false;
	for (let i = 0; i < a.length; i += 1) if (!sameFootprint(a[i], b[i])) return false;
	return true;
}
function useCanvasRuntimeState() {
	const [liveAvgState, _setLiveAvgState] = useState(() => {
		const stored = getSessionItem("be.myAvg");
		if (stored === null) return DEFAULT_AVG;
		const parsed = parseFloat(stored);
		return Number.isFinite(parsed) && parsed >= 0 && parsed <= 1 ? parsed : DEFAULT_AVG;
	});
	const [spotlightLiveAvgState, _setSpotlightLiveAvgState] = useState(DEFAULT_AVG);
	const [reservedFootprintsState, _setReservedFootprintsState] = useState([]);
	const [spotlightState, setSpotlightState] = useState(DEFAULT_SPOTLIGHT_SIGNAL);
	return {
		liveAvgState,
		setLiveAvg: useCallback((avg) => {
			_setLiveAvgState(normalizeAvg(avg));
		}, []),
		spotlightLiveAvgState,
		setSpotlightLiveAvg: useCallback((avg) => {
			_setSpotlightLiveAvgState(normalizeAvg(avg));
		}, []),
		reservedFootprintsState,
		setReservedFootprints: useCallback((next) => {
			_setReservedFootprintsState((prev) => sameFootprints(prev, next) ? prev : next);
		}, []),
		spotlightState,
		previousSpotlight: useCallback(() => {
			setSpotlightState((prev) => ({
				...prev,
				index: prev.index - 1
			}));
		}, []),
		nextSpotlight: useCallback(() => {
			setSpotlightState((prev) => ({
				...prev,
				index: prev.index + 1
			}));
		}, []),
		setSpotlightPaused: useCallback((paused) => {
			setSpotlightState((prev) => prev.paused === paused ? prev : {
				...prev,
				paused
			});
		}, []),
		toggleSpotlightPaused: useCallback(() => {
			setSpotlightState((prev) => ({
				...prev,
				paused: !prev.paused
			}));
		}, []),
		resetCanvasRuntimeState: useCallback(() => {
			_setLiveAvgState(DEFAULT_AVG);
			_setSpotlightLiveAvgState(DEFAULT_AVG);
			_setReservedFootprintsState([]);
			setSpotlightState(DEFAULT_SPOTLIGHT_SIGNAL);
		}, [])
	};
}
//#endregion
//#region src/app/state/useIdentityState.ts
function useIdentityState() {
	const [mySection, setMySection] = useState(() => getSessionItem("be.mySection"));
	const [myEntryId, setMyEntryId] = useState(() => getSessionItem("be.myEntryId"));
	const [myRole, setMyRole] = useState(() => getSessionItem("be.myRole"));
	useEffect(() => {
		const onStorageSync = () => {
			try {
				setMyEntryId(getSessionItem("be.myEntryId"));
				setMySection(getSessionItem("be.mySection"));
				setMyRole(getSessionItem("be.myRole"));
			} catch (err) {
				console.warn("[useIdentityState] Failed to sync identity from storage:", err);
			}
		};
		window.addEventListener("storage", onStorageSync);
		return () => {
			window.removeEventListener("storage", onStorageSync);
		};
	}, []);
	return {
		mySection,
		setMySection,
		myEntryId,
		setMyEntryId,
		myRole,
		setMyRole
	};
}
//#endregion
//#region src/app/state/usePreferencesState.ts
function usePreferencesState() {
	const [darkMode, setDarkMode] = useState(() => readStoredDarkMode(true));
	const didInitThemeRef = useRef(false);
	useEffect(() => {
		setSessionItem("be.darkMode", String(darkMode));
		applyThemeToDocument(darkMode);
		if (!didInitThemeRef.current) {
			didInitThemeRef.current = true;
			return;
		}
		import("./assets/theme-Cey6NMto.mjs").then(({ invalidateSpriteTexturesForThemeChange }) => {
			try {
				invalidateSpriteTexturesForThemeChange();
			} catch (err) {
				console.warn("[usePreferencesState] sprite texture invalidation failed:", err);
			}
		});
	}, [darkMode]);
	return {
		darkMode,
		setDarkMode
	};
}
//#endregion
//#region src/domain/survey/sections.ts
var STUDENT_IDS = [
	"3d-arts",
	"animation",
	"architecture",
	"art-education",
	"ceramics",
	"communication-design",
	"creative-writing",
	"design-innovation",
	"digital-media",
	"dynamic-media-institute",
	"fashion-design",
	"fibers",
	"film-video",
	"fine-arts-2d",
	"furniture-design",
	"glass",
	"history-of-art",
	"humanities",
	"illustration",
	"industrial-design",
	"integrative-sciences",
	"jewelry-metalsmithing",
	"liberal-arts",
	"mfa-low-residency",
	"mfa-low-residency-foundation",
	"mfa-studio-arts",
	"painting",
	"photography",
	"printmaking",
	"sculpture",
	"studio-arts",
	"studio-interrelated-media",
	"studio-foundation",
	"visual-storytelling",
	"fine-arts",
	"design",
	"foundations"
];
var STAFF_IDS = [
	"academic-affairs",
	"academic-resource-center",
	"administration-finance",
	"administrative-services",
	"admissions",
	"artward-bound",
	"bookstore",
	"bursar",
	"career-development",
	"center-art-community",
	"community-health",
	"compass",
	"conference-event-services",
	"counseling-center",
	"facilities",
	"fiscal-accounting",
	"fiscal-budget",
	"graduate-programs",
	"health-office",
	"housing-residence-life",
	"human-resources",
	"institutional-advancement",
	"institutional-research",
	"international-education",
	"justice-equity",
	"library",
	"marketing-communications",
	"maam",
	"foundation",
	"president-office",
	"pce",
	"public-safety",
	"registrar",
	"student-development",
	"student-engagement",
	"student-financial-assistance",
	"sustainability",
	"technology",
	"woodshop",
	"youth-programs"
];
var NON_VISITOR_MASSART = Array.from(new Set([...STUDENT_IDS, ...STAFF_IDS]));
var STUDENT_ID_SET = new Set(STUDENT_IDS);
var STAFF_ID_SET = new Set(STAFF_IDS);
function parentAggregateForSection(section) {
	if (STUDENT_ID_SET.has(section)) return "all-students";
	if (STAFF_ID_SET.has(section)) return "all-staff";
	return null;
}
//#endregion
//#region src/app/state/survey-data-utils.ts
function deriveSectionCounts(allRows) {
	const bySection = {};
	for (const row of allRows) {
		const key = row.section || "";
		bySection[key] = (bySection[key] || 0) + 1;
	}
	const sum = (ids) => ids.reduce((acc, id) => acc + (bySection[id] || 0), 0);
	return {
		all: allRows.length,
		"all-massart": sum(NON_VISITOR_MASSART),
		"all-students": sum(STUDENT_IDS),
		"all-staff": sum(STAFF_IDS),
		visitor: bySection.visitor || 0,
		...bySection
	};
}
function filterRowsForSection(allRows, section) {
	if (!section || section === "all") return allRows;
	if (section === "all-massart") {
		const allowed = new Set(NON_VISITOR_MASSART);
		return allRows.filter((row) => allowed.has(row.section));
	}
	if (section === "all-students") {
		const allowed = new Set(STUDENT_IDS);
		return allRows.filter((row) => allowed.has(row.section));
	}
	if (section === "all-staff") {
		const allowed = new Set(STAFF_IDS);
		return allRows.filter((row) => allowed.has(row.section));
	}
	return allRows.filter((row) => row.section === section);
}
function newestTimestampOf(row) {
	const raw = row.submittedAt ?? row._createdAt;
	const ts = Date.parse(raw);
	return Number.isFinite(ts) ? ts : 0;
}
function upsertSurveyRow(allRows, nextRow, replaceId) {
	return [nextRow, ...allRows.filter((row) => row._id !== nextRow._id && (!replaceId || row._id !== replaceId))].sort((a, b) => newestTimestampOf(b) - newestTimestampOf(a));
}
//#endregion
//#region src/app/state/useSurveyDataState.ts
var ALL_ROWS_LIMIT = 5e3;
var VISIBLE_ROWS_LIMIT = 300;
var FIRST_SECTION_SUBMISSION_COUNT = 1;
var noopUnsubscribe = () => void 0;
function useSurveyDataState({ mySection }) {
	const [section, setSectionValue] = useState(() => mySection ?? "all");
	const [sectionSelectionVersion, setSectionSelectionVersion] = useState(0);
	const [allRows, setAllRows] = useState([]);
	const [loading, setLoading] = useState(false);
	const localRowsRef = useRef([]);
	const setSection = useCallback((nextSection) => {
		setSectionValue(nextSection);
		setSectionSelectionVersion((version) => version + 1);
	}, []);
	const mergeLocalRows = useCallback((rows) => {
		const localRows = localRowsRef.current;
		if (!localRows.length) return rows;
		const remoteIds = new Set(rows.map((row) => row._id));
		return localRows.reduce((nextRows, row) => remoteIds.has(row._id) ? nextRows : upsertSurveyRow(nextRows, row), rows);
	}, []);
	const applyPostSubmitRedirect = useCallback((nextCounts) => {
		if (!(getSessionItem("be.justSubmitted") === "1")) return;
		const effectiveMySection = mySection ?? getSessionItem("be.mySection") ?? "";
		if (!effectiveMySection) return;
		if (effectiveMySection === "visitor") {
			removeSessionItems(["be.justSubmitted"]);
			return;
		}
		const sectionCount = nextCounts[effectiveMySection] ?? 0;
		const parentAggregate = parentAggregateForSection(effectiveMySection);
		if (parentAggregate && sectionCount <= FIRST_SECTION_SUBMISSION_COUNT) {
			setSection(parentAggregate);
			setSessionItem("be.openPersonalOnNext", "1");
		}
		removeSessionItems(["be.justSubmitted"]);
	}, [mySection, setSection]);
	const subscribeToSurveyData = useCallback(() => {
		setLoading(true);
		let unsub = noopUnsubscribe;
		let closed = false;
		import("./assets/api-Cuj6WUIU.mjs").then(({ subscribeSurveyData }) => {
			if (closed) return;
			unsub = subscribeSurveyData({
				section: "all",
				limit: ALL_ROWS_LIMIT,
				onData: (rows) => {
					const nextRows = mergeLocalRows(rows);
					setAllRows(nextRows);
					setLoading(false);
					applyPostSubmitRedirect(deriveSectionCounts(nextRows));
				}
			});
		}).catch((error) => {
			if (closed) return;
			setLoading(false);
			console.error("[useSurveyDataState] failed to load survey data API:", error);
		});
		return () => {
			closed = true;
			unsub();
		};
	}, [applyPostSubmitRedirect, mergeLocalRows]);
	const upsertLocalSurveyRow = useCallback((row, replaceId) => {
		localRowsRef.current = upsertSurveyRow(localRowsRef.current, row, replaceId);
		setAllRows((rows) => upsertSurveyRow(rows, row, replaceId));
	}, []);
	const counts = useMemo(() => deriveSectionCounts(allRows), [allRows]);
	const filteredRows = useMemo(() => filterRowsForSection(allRows, section), [allRows, section]);
	return {
		section,
		setSection,
		sectionSelectionVersion,
		counts,
		allRows,
		data: useMemo(() => filteredRows.slice(0, VISIBLE_ROWS_LIMIT), [filteredRows]),
		allFilteredRows: filteredRows,
		loading,
		upsertLocalSurveyRow,
		subscribeToSurveyData
	};
}
//#endregion
//#region src/app/state/useUiState.ts
var DEFAULT_QUESTIONNAIRE_NAV = {
	step: 0,
	total: 0,
	nextLabel: "Next",
	nextDisabled: true
};
function sameQuestionnaireNav(a, b) {
	return a.step === b.step && a.total === b.total && a.nextLabel === b.nextLabel && a.nextDisabled === b.nextDisabled;
}
function useUiState() {
	const [isSurveyActive, setSurveyActive] = useState(false);
	const [hasCompletedSurvey, setHasCompletedSurvey] = useState(false);
	const [questionnaireOpen, _setQuestionnaireOpen] = useState(false);
	const questionnaireOpenRef = useRef(false);
	const graphReturnRef = useRef(false);
	const [sectionOpen, setSectionOpen] = useState(false);
	const [cityPanelOpen, setCityPanelOpen] = useState(false);
	const [questionnaireNav, _setQuestionnaireNav] = useState(DEFAULT_QUESTIONNAIRE_NAV);
	const [questionnaireAdvanceTick, setQuestionnaireAdvanceTick] = useState(0);
	const setQuestionnaireNav = useCallback((next) => {
		_setQuestionnaireNav((prev) => {
			const merged = {
				...prev,
				...next
			};
			return sameQuestionnaireNav(prev, merged) ? prev : merged;
		});
	}, []);
	const requestQuestionnaireAdvance = useCallback(() => {
		setQuestionnaireAdvanceTick((tick) => tick + 1);
	}, []);
	const resetQuestionnaireNav = useCallback(() => {
		_setQuestionnaireNav(DEFAULT_QUESTIONNAIRE_NAV);
		setQuestionnaireAdvanceTick(0);
	}, []);
	const setQuestionnaireOpen = useCallback((v) => {
		questionnaireOpenRef.current = v;
		_setQuestionnaireOpen(v);
		if (!v) {
			setCityPanelOpen(false);
			resetQuestionnaireNav();
		}
	}, [resetQuestionnaireNav]);
	const [observerMode, setObserverMode] = useState(false);
	const [vizVisible, _setVizVisible] = useState(false);
	const vizVisibleRef = useRef(false);
	const setVizVisible = useCallback((v) => {
		if (!v) graphReturnRef.current = false;
		vizVisibleRef.current = v;
		_setVizVisible(v);
	}, []);
	const [logsOpen, setLogsOpen] = useState(false);
	const [widgetsOpen, setWidgetsOpen] = useState(false);
	const openGraph = useCallback(() => {
		if (!vizVisibleRef.current) {
			const wasInQuestionnaire = questionnaireOpenRef.current;
			graphReturnRef.current = wasInQuestionnaire;
			if (wasInQuestionnaire) {
				questionnaireOpenRef.current = false;
				_setQuestionnaireOpen(false);
				setCityPanelOpen(false);
			}
		}
		setVizVisible(true);
	}, [setVizVisible]);
	const closeGraph = useCallback(() => {
		if (graphReturnRef.current) {
			questionnaireOpenRef.current = true;
			_setQuestionnaireOpen(true);
		}
		setVizVisible(false);
		setLogsOpen(false);
		setWidgetsOpen(false);
	}, [setVizVisible]);
	const [animationVisible, setAnimationVisible] = useState(false);
	const [openPersonalized, setOpenPersonalized] = useState(false);
	const [personalPanelOpen, setPersonalPanelOpen] = useState(true);
	const [spotlightRequest, setSpotlightRequest] = useState(null);
	const [mode, setMode] = useState(() => readStoredMode("absolute"));
	useEffect(() => {
		setSessionItem("be.mode", mode);
	}, [mode]);
	const [radarMode, setRadarMode] = useState(() => getSessionItem("be.radarMode") === "1");
	useEffect(() => {
		setSessionItem("be.radarMode", radarMode ? "1" : "0");
	}, [radarMode]);
	const [surveyResetKey, setSurveyResetKey] = useState(0);
	return {
		isSurveyActive,
		setSurveyActive,
		hasCompletedSurvey,
		setHasCompletedSurvey,
		questionnaireOpen,
		setQuestionnaireOpen,
		sectionOpen,
		setSectionOpen,
		cityPanelOpen,
		setCityPanelOpen,
		observerMode,
		setObserverMode,
		vizVisible,
		openGraph,
		closeGraph,
		setVizVisible,
		logsOpen,
		setLogsOpen,
		widgetsOpen,
		setWidgetsOpen,
		animationVisible,
		setAnimationVisible,
		openPersonalized,
		setOpenPersonalized,
		personalPanelOpen,
		setPersonalPanelOpen,
		mode,
		setMode,
		radarMode,
		setRadarMode,
		spotlightRequest,
		setSpotlightRequest,
		questionnaireNav,
		setQuestionnaireNav,
		questionnaireAdvanceTick,
		requestQuestionnaireAdvance,
		resetQuestionnaireNav,
		surveyResetKey,
		incrementSurveyResetKey: useCallback(() => {
			setSurveyResetKey((k) => k + 1);
		}, [])
	};
}
//#endregion
//#region src/app/state/preferences-context.ts
var PreferencesCtx = createContext(null);
function usePreferences() {
	const ctx = useContext(PreferencesCtx);
	if (!ctx) throw new Error("usePreferences must be used within AppProvider");
	return ctx;
}
function useOptionalPreferences() {
	return useContext(PreferencesCtx);
}
//#endregion
//#region src/app/app-provider.tsx
var AppProvider = ({ children }) => {
	const { mySection, setMySection, myEntryId, setMyEntryId, myRole, setMyRole } = useIdentityState();
	const { darkMode, setDarkMode } = usePreferencesState();
	const { isSurveyActive, setSurveyActive, hasCompletedSurvey, setHasCompletedSurvey, questionnaireOpen, setQuestionnaireOpen, sectionOpen, setSectionOpen, cityPanelOpen, setCityPanelOpen, observerMode, setObserverMode, vizVisible, openGraph, closeGraph, setVizVisible, logsOpen, setLogsOpen, widgetsOpen, setWidgetsOpen, mode, setMode, radarMode, setRadarMode, spotlightRequest, setSpotlightRequest, animationVisible, setAnimationVisible, openPersonalized, setOpenPersonalized, personalPanelOpen, setPersonalPanelOpen, questionnaireNav, setQuestionnaireNav, questionnaireAdvanceTick, requestQuestionnaireAdvance, resetQuestionnaireNav, surveyResetKey, incrementSurveyResetKey } = useUiState();
	const { liveAvgState, setLiveAvg, spotlightLiveAvgState, setSpotlightLiveAvg, reservedFootprintsState, setReservedFootprints, spotlightState, previousSpotlight, nextSpotlight, setSpotlightPaused, toggleSpotlightPaused, resetCanvasRuntimeState } = useCanvasRuntimeState();
	const { section, setSection, sectionSelectionVersion, counts, allRows, data, allFilteredRows, loading, upsertLocalSurveyRow, subscribeToSurveyData } = useSurveyDataState({ mySection });
	useEffect(() => {
		const unsub = subscribeToSurveyData();
		return () => {
			unsub();
		};
	}, [subscribeToSurveyData]);
	const resetToStart = useCallback(() => {
		const savedEntryId = getSessionItem("be.myEntryId");
		const savedSection = getSessionItem("be.mySection");
		const savedRole = getSessionItem("be.myRole");
		unstable_batchedUpdates(() => {
			setVizVisible(false);
			setSurveyActive(false);
			setHasCompletedSurvey(false);
			setObserverMode(false);
			setMyEntryId(savedEntryId);
			setMySection(savedSection);
			setMyRole(savedRole);
			setSection(savedSection ?? "all");
			setQuestionnaireOpen(false);
			setSectionOpen(false);
			setCityPanelOpen(false);
			setLogsOpen(false);
			setWidgetsOpen(false);
			setAnimationVisible(false);
			setOpenPersonalized(false);
			setSpotlightRequest(null);
			resetCanvasRuntimeState();
			incrementSurveyResetKey();
		});
		removeSessionItems(["be.justSubmitted", "be.openPersonalOnNext"]);
	}, [
		resetCanvasRuntimeState,
		setHasCompletedSurvey,
		setMyEntryId,
		setMyRole,
		setMySection,
		setObserverMode,
		setSectionOpen,
		setCityPanelOpen,
		setQuestionnaireOpen,
		setAnimationVisible,
		setOpenPersonalized,
		setSpotlightRequest,
		setSection,
		setSurveyActive,
		setVizVisible,
		setLogsOpen,
		setWidgetsOpen,
		incrementSurveyResetKey
	]);
	const preferencesValue = useMemo(() => ({
		darkMode,
		setDarkMode
	}), [darkMode, setDarkMode]);
	const uiValue = useMemo(() => ({
		vizVisible,
		openGraph,
		closeGraph,
		isSurveyActive,
		setSurveyActive,
		hasCompletedSurvey,
		setHasCompletedSurvey,
		questionnaireOpen,
		setQuestionnaireOpen,
		sectionOpen,
		setSectionOpen,
		cityPanelOpen,
		setCityPanelOpen,
		observerMode,
		setObserverMode,
		animationVisible,
		setAnimationVisible,
		openPersonalized,
		setOpenPersonalized,
		personalPanelOpen,
		setPersonalPanelOpen,
		resetToStart,
		surveyResetKey,
		radarMode,
		setRadarMode,
		logsOpen,
		setLogsOpen,
		widgetsOpen,
		setWidgetsOpen,
		mode,
		setMode,
		spotlightRequest,
		setSpotlightRequest,
		questionnaireNav,
		setQuestionnaireNav,
		questionnaireAdvanceTick,
		requestQuestionnaireAdvance,
		resetQuestionnaireNav
	}), [
		vizVisible,
		openGraph,
		closeGraph,
		isSurveyActive,
		setSurveyActive,
		hasCompletedSurvey,
		setHasCompletedSurvey,
		questionnaireOpen,
		setQuestionnaireOpen,
		sectionOpen,
		setSectionOpen,
		cityPanelOpen,
		setCityPanelOpen,
		observerMode,
		setObserverMode,
		animationVisible,
		setAnimationVisible,
		openPersonalized,
		setOpenPersonalized,
		personalPanelOpen,
		setPersonalPanelOpen,
		resetToStart,
		surveyResetKey,
		radarMode,
		setRadarMode,
		logsOpen,
		setLogsOpen,
		widgetsOpen,
		setWidgetsOpen,
		mode,
		setMode,
		spotlightRequest,
		setSpotlightRequest,
		questionnaireNav,
		setQuestionnaireNav,
		questionnaireAdvanceTick,
		requestQuestionnaireAdvance,
		resetQuestionnaireNav
	]);
	const canvasRuntimeValue = useMemo(() => ({
		liveAvg: liveAvgState,
		setLiveAvg,
		spotlightLiveAvg: spotlightLiveAvgState,
		setSpotlightLiveAvg,
		reservedFootprints: reservedFootprintsState,
		setReservedFootprints,
		spotlight: spotlightState,
		previousSpotlight,
		nextSpotlight,
		setSpotlightPaused,
		toggleSpotlightPaused
	}), [
		liveAvgState,
		setLiveAvg,
		spotlightLiveAvgState,
		setSpotlightLiveAvg,
		reservedFootprintsState,
		setReservedFootprints,
		spotlightState,
		previousSpotlight,
		nextSpotlight,
		setSpotlightPaused,
		toggleSpotlightPaused
	]);
	const identityValue = useMemo(() => ({
		mySection,
		setMySection,
		myEntryId,
		setMyEntryId,
		myRole,
		setMyRole
	}), [
		mySection,
		setMySection,
		myEntryId,
		setMyEntryId,
		myRole,
		setMyRole
	]);
	const surveyDataValue = useMemo(() => ({
		section,
		setSection,
		sectionSelectionVersion,
		counts,
		allRows,
		data,
		allFilteredRows,
		loading,
		upsertLocalSurveyRow
	}), [
		section,
		setSection,
		sectionSelectionVersion,
		counts,
		allRows,
		data,
		allFilteredRows,
		loading,
		upsertLocalSurveyRow
	]);
	return /* @__PURE__ */ jsx(PreferencesCtx.Provider, {
		value: preferencesValue,
		children: /* @__PURE__ */ jsx(UiCtx.Provider, {
			value: uiValue,
			children: /* @__PURE__ */ jsx(CanvasRuntimeCtx.Provider, {
				value: canvasRuntimeValue,
				children: /* @__PURE__ */ jsx(IdentityCtx.Provider, {
					value: identityValue,
					children: /* @__PURE__ */ jsx(SurveyDataCtx.Provider, {
						value: surveyDataValue,
						children
					})
				})
			})
		})
	});
};
//#endregion
//#region src/app/client-only.tsx
function ClientOnly({ children, fallback = null }) {
	const [mounted, setMounted] = React.useState(false);
	React.useEffect(() => {
		setMounted(true);
	}, []);
	return mounted ? /* @__PURE__ */ jsx(Fragment, { children }) : /* @__PURE__ */ jsx(Fragment, { children: fallback });
}
//#endregion
//#region src/assets/svg/check/check.svg?raw
var check_default = "<svg width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\">\r\n<mask id=\"mask0_3_49\" style=\"mask-type:alpha\" maskUnits=\"userSpaceOnUse\" x=\"0\" y=\"0\" width=\"24\" height=\"24\">\r\n<rect width=\"24\" height=\"24\" fill=\"#D9D9D9\"/>\r\n</mask>\r\n<g mask=\"url(#mask0_3_49)\">\r\n<path d=\"M9.54998 18.2037L3.61548 12.2692L5.13448 10.75L9.54998 15.1655L18.9155 5.79999L20.4345 7.31924L9.54998 18.2037Z\" fill=\"#1C1B1F\"/>\r\n</g>\r\n</svg>\r\n";
//#endregion
//#region src/assets/svg/check/CheckIcon.tsx
function sanitizeCheckIconClassName(className) {
	return className.split(/\s+/).filter((token) => token && token !== "ui-icon").join(" ");
}
function CheckIcon({ className = "" }) {
	const iconId = useId().replace(/:/g, "");
	const resolvedClassName = sanitizeCheckIconClassName(className);
	const markup = useMemo(() => {
		return prepareRawSvgMarkup(check_default, `check-${iconId}`, resolvedClassName);
	}, [iconId, resolvedClassName]);
	return /* @__PURE__ */ jsx("span", {
		"aria-hidden": "true",
		style: RAW_SVG_WRAPPER_STYLE,
		dangerouslySetInnerHTML: { __html: markup }
	});
}
//#endregion
//#region src/onboarding/questionnaire/button-input/button-questions.ts
var BUTTON_QUESTIONS = [
	{
		id: "q1",
		prompt: "What guides your food choices?",
		options: [
			{
				key: "A",
				label: "Local foods",
				weight: 1
			},
			{
				key: "B",
				label: "Mostly vegetables",
				weight: .85
			},
			{
				key: "C",
				label: "Balanced meals",
				weight: .67
			},
			{
				key: "D",
				label: "Beef and dairy",
				weight: .45
			},
			{
				key: "E",
				label: "Imported food",
				weight: .25
			}
		]
	},
	{
		id: "q2",
		prompt: "What's your usual commute?",
		options: [
			{
				key: "A",
				label: "On foot",
				weight: 1
			},
			{
				key: "B",
				label: "Bike",
				weight: .95
			},
			{
				key: "C",
				label: "Public Transportation",
				weight: .8
			},
			{
				key: "D",
				label: "Rideshare",
				weight: .6
			},
			{
				key: "E",
				label: "Electric",
				weight: .3
			},
			{
				key: "F",
				label: "Drive",
				weight: .05
			}
		]
	},
	{
		id: "q3",
		prompt: "How do you save energy at home?",
		options: [
			{
				key: "A",
				label: "Careful heating",
				weight: .9
			},
			{
				key: "B",
				label: "Air dry",
				weight: .75
			},
			{
				key: "C",
				label: "Turn off lights",
				weight: .7
			},
			{
				key: "D",
				label: "Avoid standby",
				weight: .6
			},
			{
				key: "E",
				label: "Not really",
				weight: .1
			},
			{
				key: "F",
				label: "Don't have home",
				weight: 1
			}
		]
	},
	{
		id: "q4",
		prompt: "When you shop, what feels most like you?",
		options: [
			{
				key: "A",
				label: "Thrift first",
				weight: 1
			},
			{
				key: "B",
				label: "Buy to last",
				weight: .75
			},
			{
				key: "C",
				label: "Shop local",
				weight: .65
			},
			{
				key: "D",
				label: "Natural materials",
				weight: .8
			},
			{
				key: "E",
				label: "Mass-purchase",
				weight: .25
			},
			{
				key: "F",
				label: "Synthetic clothes",
				weight: 0
			}
		]
	},
	{
		id: "q5",
		prompt: "How do you handle waste at home?",
		options: [
			{
				key: "A",
				label: "Compost often",
				weight: 1
			},
			{
				key: "B",
				label: "Sort carefully",
				weight: .75
			},
			{
				key: "C",
				label: "Recycle at times",
				weight: .5
			},
			{
				key: "D",
				label: "Sometimes do",
				weight: .25
			},
			{
				key: "E",
				label: "Toss all",
				weight: 0
			}
		]
	}
];
//#endregion
//#region src/onboarding/questionnaire/button-input/button-layouts.ts
function slot(verticalK, horizontalK, size = {
	w: 4,
	h: 2
}) {
	return {
		verticalK,
		horizontalK,
		...size,
		rowAlign: "center",
		colAlign: "center"
	};
}
var DEFAULT_BUTTON_SLOTS = {
	laptop: [
		slot([.18, .22], [.08, .14]),
		slot([.18, .22], [.74, .8]),
		slot([.3, .34], [.3, .36]),
		slot([.3, .34], [.58, .64]),
		slot([.46, .52], [.42, .48]),
		slot([.58, .64], [.1, .16])
	],
	tablet: [
		slot([.244, .276], [.181, .226]),
		slot([.244, .276], [.682, .728]),
		slot([.34, .372], [.348, .394]),
		slot([.34, .372], [.561, .606]),
		slot([.468, .516], [.439, .485]),
		slot([.564, .612], [.196, .242])
	],
	mobile: [
		slot([.25, .278], [.231, .27], {
			w: 3,
			h: 2
		}),
		slot([.25, .278], [.654, .692], {
			w: 3,
			h: 2
		}),
		slot([.336, .365], [.372, .41], {
			w: 3,
			h: 2
		}),
		slot([.336, .365], [.551, .59], {
			w: 3,
			h: 2
		}),
		slot([.451, .494], [.449, .487], {
			w: 3,
			h: 2
		}),
		slot([.538, .581], [.244, .282], {
			w: 3,
			h: 2
		})
	]
};
var QUESTION_BUTTON_SLOTS = {
	q1: {
		laptop: [
			slot([.75, .77], [.02, .1]),
			slot([.8, .85], [.65, .7]),
			slot([.66, .7], [.3, .35]),
			slot([.65, .7], [.82, .88]),
			slot([.84, .88], [.42, .5])
		],
		tablet: [
			slot([.65, .65], [.15, .15]),
			slot([.7, .7], [.7, .7]),
			slot([.9, .9], [.1, .1]),
			slot([.75, .75], [.3, .3]),
			slot([.85, .85], [.6, .64])
		],
		mobile: [
			slot([.82, .82], [.1, .1], {
				w: 3,
				h: 2
			}),
			slot([.63, .63], [.25, .25], {
				w: 3,
				h: 2
			}),
			slot([.88, .88], [.75, .75], {
				w: 3,
				h: 2
			}),
			slot([.94, .94], [.3, .3], {
				w: 3,
				h: 2
			}),
			slot([.74, .74], [.65, .65], {
				w: 3,
				h: 2
			})
		]
	},
	q2: {
		laptop: [
			slot([.6, .64], [.76, .82]),
			slot([.66, .7], [.04, .1]),
			slot([.72, .76], [.48, .54]),
			slot([.77, .81], [.2, .26]),
			slot([.82, .87], [.66, .72]),
			slot([.88, .94], [.36, .42])
		],
		tablet: [
			slot([.62, .62], [.56, .6]),
			slot([.7, .7], [.08, .08]),
			slot([.76, .76], [.7, .7]),
			slot([.81, .81], [.22, .22]),
			slot([.85, .85], [.6, .62]),
			slot([.92, .92], [.35, .35])
		],
		mobile: [
			slot([.75, .75], [.3, .3], {
				w: 3,
				h: 2
			}),
			slot([.82, .82], [.75, .75], {
				w: 3,
				h: 2
			}),
			slot([.9, .9], [.4, .4], {
				w: 3,
				h: 2
			}),
			slot([.84, .84], [.15, .15], {
				w: 3,
				h: 2
			}),
			slot([.65, .65], [.1, .1], {
				w: 3,
				h: 2
			}),
			slot([.7, .7], [.8, .8], {
				w: 3,
				h: 2
			})
		]
	},
	q3: {
		laptop: [
			slot([.6, .64], [.06, .12]),
			slot([.65, .69], [.58, .64]),
			slot([.7, .74], [.84, .9]),
			slot([.75, .79], [.3, .36]),
			slot([.86, .92], [.14, .2]),
			slot([.84, .89], [.7, .76])
		],
		tablet: [
			slot([.62, .62], [.14, .14]),
			slot([.71, .71], [.88, .88]),
			slot([.77, .77], [.06, .06]),
			slot([.82, .82], [.64, .64]),
			slot([.87, .87], [.28, .28]),
			slot([.92, .92], [.82, .82])
		],
		mobile: [
			slot([.8, .8], [.3, .3], {
				w: 3,
				h: 2
			}),
			slot([.9, .9], [.2, .2], {
				w: 3,
				h: 2
			}),
			slot([.87, .87], [.6, .6], {
				w: 3,
				h: 2
			}),
			slot([.93, .93], [.25, .4], {
				w: 3,
				h: 2
			}),
			slot([.63, .63], [.1, .2], {
				w: 3,
				h: 2
			}),
			slot([.72, .72], [.82, .82], {
				w: 3,
				h: 2
			})
		]
	},
	q4: {
		laptop: [
			slot([.61, .65], [.16, .22]),
			slot([.67, .71], [.8, .86]),
			slot([.73, .77], [.04, .1]),
			slot([.78, .82], [.5, .56]),
			slot([.83, .88], [.68, .74]),
			slot([.88, .94], [.3, .36])
		],
		tablet: [
			slot([.62, .62], [.5, .5]),
			slot([.7, .7], [.9, .9]),
			slot([.76, .76], [.1, .1]),
			slot([.82, .82], [.7, .7]),
			slot([.87, .87], [.26, .26]),
			slot([.9, .9], [.5, .5])
		],
		mobile: [
			slot([.83, .83], [.15, .15], {
				w: 3,
				h: 2
			}),
			slot([.8, .8], [.7, .7], {
				w: 3,
				h: 2
			}),
			slot([.92, .92], [.4, .4], {
				w: 3,
				h: 2
			}),
			slot([.88, .88], [.5, .5], {
				w: 3,
				h: 2
			}),
			slot([.62, .62], [.2, .2], {
				w: 3,
				h: 2
			}),
			slot([.71, .71], [.78, .78], {
				w: 3,
				h: 2
			})
		]
	},
	q5: {
		laptop: [
			slot([.61, .65], [.72, .78]),
			slot([.68, .72], [.26, .32]),
			slot([.75, .79], [.06, .12]),
			slot([.82, .86], [.6, .66]),
			slot([.88, .94], [.4, .46])
		],
		tablet: [
			slot([.62, .62], [.6, .6]),
			slot([.9, .9], [.4, .4]),
			slot([.82, .82], [.64, .66]),
			slot([.86, .86], [.1, .12]),
			slot([.6, .7], [.1, .15])
		],
		mobile: [
			slot([.65, .67], [.6, .6], {
				w: 3,
				h: 2
			}),
			slot([.75, .75], [.7, .7], {
				w: 3,
				h: 2
			}),
			slot([.87, .87], [.62, .62], {
				w: 3,
				h: 2
			}),
			slot([.9, .9], [.2, .2], {
				w: 3,
				h: 2
			}),
			slot([.79, .79], [.1, .1], {
				w: 3,
				h: 2
			})
		]
	}
};
function getQuestionButtonPlacement(questionId, optionIndex, device) {
	return QUESTION_BUTTON_SLOTS[questionId][device][optionIndex] ?? DEFAULT_BUTTON_SLOTS[device][optionIndex % DEFAULT_BUTTON_SLOTS[device].length];
}
//#endregion
//#region src/canvas-engine/grid-layout/forbidden.ts
function rectFracToCellRange(rect, rows, cols) {
	return {
		r0: Math.floor(rect.top * rows),
		r1: Math.ceil(rect.bottom * rows) - 1,
		c0: Math.floor(rect.left * cols),
		c1: Math.ceil(rect.right * cols) - 1
	};
}
function cellInRectFrac(r, c, rows, cols, rect) {
	const { r0, r1, c0, c1 } = rectFracToCellRange(rect, rows, cols);
	return r >= r0 && r <= r1 && c >= c0 && c <= c1;
}
/**
* Combines forbiddenRects and an optional per-cell forbidden predicate into a single checker.
*/
function makeCellForbidden(spec, rows, cols, colsPerRow) {
	const rects = spec.forbiddenRects ?? [];
	const fn = spec.forbidden;
	return (r, c) => {
		const rowCols = colsPerRow ? colsPerRow[r] ?? cols : cols;
		for (const rect of rects) if (cellInRectFrac(r, c, rows, rowCols, rect)) return true;
		if (fn?.(r, c, rows, rowCols)) return true;
		return false;
	};
}
function snapCols(target, cols) {
	return Math.max(0, Math.min(cols, Math.round(target)));
}
function toCols(val, cols) {
	if (val == null) return 0;
	if (typeof val === "string" && val.endsWith("%")) return snapCols(Math.max(0, Math.min(100, parseFloat(val))) / 100 * cols, cols);
	if (typeof val === "number") {
		if (val >= 1) return snapCols(val, cols);
		return snapCols(Math.max(0, Math.min(1, val)) * cols, cols);
	}
	return 0;
}
/**
* Builds a per-cell forbidden predicate from row-oriented trimming rules.
* Each row can specify left/right trims and an optional centered blocked span.
*/
function makeRowForbidden(rules) {
	return (r, c, _rows, cols) => {
		const rule = rules[Math.min(r, rules.length - 1)] || {};
		const leftCols = toCols(rule.left, cols);
		const rightCols = toCols(rule.right, cols);
		const usableCols = Math.max(0, cols - leftCols - rightCols);
		const centerCols = Math.min(toCols(rule.center, cols), usableCols);
		if (leftCols > 0 && c < leftCols) return true;
		if (rightCols > 0 && c >= cols - rightCols) return true;
		if (centerCols > 0) {
			const start = leftCols + Math.max(0, Math.round((usableCols - centerCols) / 2));
			const end = Math.min(cols - 1, start + centerCols - 1);
			if (c >= start && c <= end) return true;
		}
		return false;
	};
}
//#endregion
//#region src/canvas-engine/scene-rules/canvas-padding/helpers.ts
var LR_0 = {
	left: "0%",
	right: "0%"
};
function uniformRows(rows) {
	return {
		mobile: {
			rows,
			useTopRatio: 1
		},
		tablet: {
			rows,
			useTopRatio: 1
		},
		laptop: {
			rows,
			useTopRatio: 1
		}
	};
}
function rowsByDevice(mobile, tablet, laptop) {
	return {
		mobile: {
			rows: mobile,
			useTopRatio: 1
		},
		tablet: {
			rows: tablet,
			useTopRatio: 1
		},
		laptop: {
			rows: laptop,
			useTopRatio: 1
		}
	};
}
//#endregion
//#region src/canvas-engine/shared/responsiveness.ts
var MOBILE_LANDSCAPE_SHORT_SIDE_MAX = 600;
function normalizeViewportUnits(value) {
	return Math.max(0, Math.floor(value));
}
function supportsTouch() {
	return typeof navigator !== "undefined" && navigator.maxTouchPoints > 0;
}
function hasCoarsePointer() {
	return typeof window !== "undefined" && typeof window.matchMedia === "function" && window.matchMedia("(pointer: coarse)").matches;
}
function userAgent() {
	return typeof navigator === "undefined" ? "" : navigator.userAgent;
}
function deviceType(w) {
	const normalizedW = normalizeViewportUnits(w);
	if (normalizedW <= 767) return "mobile";
	if (normalizedW <= 1024) return "tablet";
	return "laptop";
}
function viewportDeviceType(width, height) {
	const w = normalizeViewportUnits(width);
	const h = normalizeViewportUnits(height);
	const shortSide = Math.min(w, h);
	const touch = supportsTouch();
	const coarse = hasCoarsePointer();
	const ua = userAgent();
	const isiPhone = /\biPhone\b|\biPod\b/.test(ua);
	const isAndroidPhone = /\bAndroid\b/i.test(ua) && /\bMobile\b/i.test(ua);
	const isIPad = /\biPad\b/.test(ua) || /\bMacintosh\b/.test(ua) && touch;
	const isAndroidTablet = /\bAndroid\b/i.test(ua) && !/\bMobile\b/i.test(ua);
	if (isiPhone || isAndroidPhone) return "mobile";
	if (isIPad || isAndroidTablet) return "tablet";
	if ((touch || coarse) && shortSide <= MOBILE_LANDSCAPE_SHORT_SIDE_MAX) return "mobile";
	if ((touch || coarse) && w <= 1366) return "tablet";
	return deviceType(w);
}
function currentViewportDeviceType(fallbackWidth) {
	if (typeof window === "undefined") return deviceType(fallbackWidth);
	return viewportDeviceType(window.innerWidth, window.innerHeight);
}
function getLandscapeCountScale(device, scaleByDevice) {
	if (typeof window === "undefined") return 1;
	if (!(supportsTouch() || hasCoarsePointer())) return 1;
	if (!(window.innerWidth > window.innerHeight)) return 1;
	return scaleByDevice?.[device] ?? 1;
}
function getViewportSize$1() {
	if (typeof window === "undefined") return {
		w: 1024,
		h: 768
	};
	return {
		w: normalizeViewportUnits(window.innerWidth),
		h: normalizeViewportUnits(window.innerHeight)
	};
}
//#endregion
//#region src/canvas-engine/scene-rules/canvas-padding/resolve.ts
function positiveModulo$2(value, length) {
	return (value % length + length) % length;
}
function resolvePaddingPolicyVariants(paddingByDevice, spotlightIndex) {
	const runtimePreset = paddingByDevice.runtimePreset;
	if (!runtimePreset?.entries.length) return paddingByDevice;
	const entries = runtimePreset.entries;
	if (typeof spotlightIndex !== "number") return entries[0] ?? paddingByDevice;
	return entries[positiveModulo$2(spotlightIndex, entries.length)];
}
function resolvePaddingSpec(w, paddingByDevice) {
	const band = deviceType(w);
	const spec = paddingByDevice[band];
	if (!spec) throw new Error(`Missing padding spec for band: ${band}. Keys: ${Object.keys(paddingByDevice).join(", ")}`);
	return spec;
}
//#endregion
//#region src/canvas-engine/scene-rules/canvas-padding/start.ts
var START_PADDING = {
	mobile: {
		rows: 26,
		useTopRatio: 1,
		horizonPos: .5,
		forbidden: makeRowForbidden(Array.from({ length: 26 }, () => ({ ...LR_0 })))
	},
	tablet: {
		rows: 24,
		useTopRatio: 1,
		horizonPos: .46,
		forbidden: makeRowForbidden(Array.from({ length: 22 }, () => ({ ...LR_0 })))
	},
	laptop: {
		rows: 20,
		useTopRatio: 1,
		horizonPos: .5,
		forbidden: makeRowForbidden(Array.from({ length: 18 }, () => ({ ...LR_0 })))
	}
};
//#endregion
//#region src/canvas-engine/scene-rules/canvas-padding/questionnaire.ts
var QUESTIONNAIRE_PADDING = {
	mobile: {
		rows: 36,
		useTopRatio: 1,
		horizonPos: .3,
		forbidden: makeRowForbidden(Array.from({ length: 36 }, () => ({ ...LR_0 })))
	},
	tablet: {
		rows: 36,
		useTopRatio: 1,
		horizonPos: .35,
		forbidden: makeRowForbidden(Array.from({ length: 36 }, () => ({ ...LR_0 })))
	},
	laptop: {
		rows: 24,
		useTopRatio: 1,
		horizonPos: .46,
		forbidden: makeRowForbidden(Array.from({ length: 24 }, () => ({ ...LR_0 })))
	}
};
//#endregion
//#region src/canvas-engine/scene-rules/canvas-padding/city.ts
var CITY_PADDING = {
	mobile: {
		rows: 28,
		useTopRatio: 1,
		horizonPos: .45
	},
	tablet: {
		rows: 26,
		useTopRatio: 1,
		horizonPos: .45
	},
	laptop: {
		rows: 24,
		useTopRatio: 1,
		horizonPos: .45
	}
};
//#endregion
//#region src/canvas-engine/scene-rules/shapeCatalog.ts
var SHAPES = [
	"clouds",
	"snow",
	"house",
	"power",
	"sun",
	"villa",
	"car",
	"sea",
	"carFactory",
	"bus",
	"trees"
];
//#endregion
//#region src/canvas-engine/scene-rules/placement-rules/helpers.ts
var ONE_PER_DEVICE = {
	mobile: 1,
	tablet: 1,
	laptop: 1
};
function centerShape(shape, placement = {}) {
	return { [shape]: { center: {
		count: placement.count ?? ONE_PER_DEVICE,
		xK: placement.xK,
		yK: placement.yK,
		scale: placement.scale
	} } };
}
var SHAPE_IDX = Object.fromEntries(SHAPES.map((s, i) => [s, i]));
function stableItemId(shape, placementKey, itemIdx) {
	if (typeof placementKey === "number") {
		const encodedId = SHAPE_IDX[shape] * 65536 + placementKey * 256 + itemIdx | 0;
		return String(encodedId);
	}
	return `${shape}|${placementKey}|${String(itemIdx)}`;
}
function interpolatePct(quota, t) {
	if (!quota || quota.length === 0) return 50;
	const sorted = [...quota].sort((a, b) => a.t - b.t);
	const clamped = Math.max(0, Math.min(1, t));
	if (clamped <= sorted[0].t) return sorted[0].pct;
	if (clamped >= sorted[sorted.length - 1].t) return sorted[sorted.length - 1].pct;
	let i = 0;
	while (i < sorted.length - 1 && clamped > sorted[i + 1].t) i++;
	const a = sorted[i];
	const b = sorted[i + 1];
	const k = (clamped - a.t) / Math.max(1e-6, b.t - a.t);
	return a.pct + (b.pct - a.pct) * k;
}
//#endregion
//#region src/canvas-engine/scene-rules/spotlight/slides/01-villa.ts
var villaBackground = {
	base: "rgb(43, 43, 54)",
	overlay: {
		kind: "linear",
		from: {
			xK: .5,
			yK: 0
		},
		to: {
			xK: .5,
			yK: 1
		},
		stops: [
			{ rgba: "rgb(214, 242, 255)" },
			{ rgba: "rgb(214, 242, 255)" },
			{ rgba: "rgb(248, 243, 239)" },
			{
				k: .6,
				rgba: "rgb(255, 221, 208)",
				liveBlend: [.1, 0]
			},
			{
				k: .6,
				rgba: "#a9e0a7",
				rightRgba: "#87dcb7",
				liveBlend: [.1, .1]
			},
			{
				rgba: "#c7ca83",
				liveBlend: [.1, .1]
			}
		]
	}
};
var villaDarkBackground = {
	base: "rgb(43, 43, 54)",
	overlay: {
		kind: "linear",
		from: {
			xK: .5,
			yK: 0
		},
		to: {
			xK: .5,
			yK: 1
		},
		stops: [
			{
				rgba: "rgb(44, 63, 106)",
				rightRgba: "rgb(64, 59, 106)"
			},
			{
				k: .6,
				rgba: "rgb(68, 116, 179)",
				rightRgba: "rgb(98, 99, 129)"
			},
			{
				k: .6,
				rgba: "#528b77",
				rightRgba: "#798462",
				liveBlend: [.1, 0]
			},
			{
				rgba: "rgb(60, 71, 57)",
				liveBlend: [.1, 0]
			}
		]
	},
	stars: {
		count: [18, 36],
		topBandK: .59,
		minR: .9,
		maxR: 1.6,
		alpha: [[.5, 1.5], [.6, 1.6]],
		flickerHz: [[.42, .98], [.14, .34]]
	}
};
var villaFoliage = { layers: [{
	count: [60, 120],
	yK: [.6, 1],
	heightPx: [8, 16],
	widthPx: [4, 12],
	color: [
		{
			color: "#96bf64",
			alpha: .4
		},
		{
			color: "#cebf83",
			alpha: .4
		},
		{
			color: "#71b571",
			alpha: .4
		}
	],
	seed: 32
}] };
var villaDarkFoliage = { layers: [{
	count: [60, 120],
	yK: [.6, 1],
	heightPx: [8, 16],
	widthPx: [4, 12],
	color: [
		{
			color: "#8f613c",
			alpha: .3
		},
		{
			color: "#4a6840",
			alpha: .3
		},
		{
			color: "#2e454a",
			alpha: .3
		},
		{
			color: "#639163",
			alpha: .3
		}
	],
	seed: 32
}] };
var villaPlacement = centerShape("villa", { yK: .45 });
var villaSlide = {
	id: "villa",
	shape: "villa",
	background: villaBackground,
	darkBackground: villaDarkBackground,
	foliage: villaFoliage,
	darkFoliage: villaDarkFoliage,
	padding: uniformRows(3),
	placement: villaPlacement
};
//#endregion
//#region src/canvas-engine/scene-rules/spotlight/slides/02-bus.ts
var busBackground = {
	base: "rgb(38, 43, 60)",
	overlay: {
		kind: "radial",
		center: {
			xK: .5,
			yK: .5
		},
		innerK: .08,
		outer: { k: .86 },
		stops: [{ rgba: "rgb(108, 182, 133)" }, { rgba: "rgb(198, 255, 152)" }]
	}
};
var busDarkBackground = {
	base: "rgb(37, 43, 43)",
	overlay: {
		kind: "radial",
		center: {
			xK: .5,
			yK: .5
		},
		innerK: .08,
		outer: { k: .86 },
		stops: [{ rgba: "rgb(89, 150, 109)" }, { rgba: "rgb(149, 149, 92)" }]
	}
};
var busFoliage = { layers: [{
	count: [60, 120],
	yK: [0, 1],
	heightPx: [8, 16],
	widthPx: [4, 12],
	color: [
		{
			color: "#96bf64",
			alpha: .4
		},
		{
			color: "#cebf83",
			alpha: .4
		},
		{
			color: "#71b571",
			alpha: .4
		}
	],
	seed: 32
}] };
var busDarkFoliage = { layers: [{
	count: [60, 120],
	yK: [0, 1],
	heightPx: [8, 16],
	widthPx: [4, 12],
	color: [
		{
			color: "#8f613c",
			alpha: .3
		},
		{
			color: "#4a6840",
			alpha: .3
		},
		{
			color: "#2e454a",
			alpha: .3
		},
		{
			color: "#639163",
			alpha: .3
		}
	],
	seed: 32
}] };
var busPlacement = centerShape("bus");
var busSlide = {
	id: "bus",
	shape: "bus",
	background: busBackground,
	darkBackground: busDarkBackground,
	foliage: busFoliage,
	darkFoliage: busDarkFoliage,
	padding: rowsByDevice(3, 3, 2),
	placement: busPlacement
};
//#endregion
//#region src/canvas-engine/scene-rules/spotlight/slides/03-sea.ts
var seaBackground = {
	base: "rgb(48, 42, 51)",
	overlay: {
		kind: "linear",
		from: {
			xK: .5,
			yK: 0
		},
		to: {
			xK: .5,
			yK: 1
		},
		stops: [
			{ rgba: "rgb(195, 234, 254)" },
			{
				k: .6,
				rgba: "rgb(234, 248, 255)"
			},
			{
				rgba: "rgb(170, 210, 130)",
				liveBlend: [.12, .06]
			}
		]
	}
};
var seaDarkBackground = {
	base: "rgb(43, 40, 55)",
	overlay: {
		kind: "linear",
		from: {
			xK: .5,
			yK: 0
		},
		to: {
			xK: .5,
			yK: 1
		},
		stops: [
			{ rgba: "rgb(46, 95, 135)" },
			{
				k: .6,
				rgba: "rgb(75, 96, 110)"
			},
			{
				rgba: "rgb(121, 114, 75)",
				rightRgba: "rgb(116, 96, 76)",
				liveBlend: [.12, .06]
			}
		]
	}
};
var seaPlacement = centerShape("sea", { yK: .55 });
var seaSlide = {
	id: "sea",
	shape: "sea",
	background: seaBackground,
	darkBackground: seaDarkBackground,
	padding: rowsByDevice(3, 3, 2),
	placement: seaPlacement
};
//#endregion
//#region src/canvas-engine/scene-rules/spotlight/slides/04-clouds.ts
var cloudsBackground = {
	base: "rgb(42, 45, 58)",
	overlay: {
		kind: "linear",
		from: {
			xK: .5,
			yK: 0
		},
		to: {
			xK: .5,
			yK: 1
		},
		stops: [{ rgba: "rgb(137, 180, 220)" }, { rgba: "rgb(178, 221, 246)" }]
	}
};
var cloudsDarkBackground = {
	base: "rgb(43, 40, 55)",
	overlay: {
		kind: "linear",
		from: {
			xK: .5,
			yK: 0
		},
		to: {
			xK: .5,
			yK: 1
		},
		stops: [{
			rgba: "rgb(25, 52, 91)",
			rightRgba: "rgb(44, 62, 97)",
			liveBlend: [.12, .06]
		}, {
			rgba: "rgb(49, 83, 116)",
			rightRgba: "rgb(65, 69, 118)"
		}]
	},
	stars: {
		count: [18, 30],
		topBandK: .95,
		minR: .7,
		maxR: 1.3,
		alpha: [[.36, .92], [.44, 1.12]],
		flickerHz: [[.3, .72], [.12, .28]]
	}
};
var cloudsPlacement = centerShape("clouds", { yK: .62 });
var cloudsSlide = {
	id: "clouds",
	shape: "clouds",
	background: cloudsBackground,
	darkBackground: cloudsDarkBackground,
	padding: uniformRows(3),
	placement: cloudsPlacement
};
//#endregion
//#region src/canvas-engine/scene-rules/spotlight/slides/05-snow.ts
var snowBackground = {
	base: "rgb(40, 44, 58)",
	overlay: {
		kind: "linear",
		from: {
			xK: .5,
			yK: 0
		},
		to: {
			xK: .5,
			yK: 1
		},
		stops: [{ rgba: "rgb(129, 178, 227)" }, {
			rgba: "rgb(190, 194, 204)",
			liveBlend: [.1, .08]
		}]
	}
};
var snowDarkBackground = {
	base: "rgb(34, 39, 54)",
	overlay: {
		kind: "linear",
		from: {
			xK: .5,
			yK: 0
		},
		to: {
			xK: .5,
			yK: 1
		},
		stops: [{ rgba: "rgb(65, 97, 130)" }, {
			rgba: "rgb(53, 71, 110)",
			liveBlend: [.1, .08]
		}]
	},
	stars: {
		count: [16, 24],
		topBandK: .95,
		minR: .7,
		maxR: 1.3,
		alpha: [[.36, .92], [.44, 1.12]],
		flickerHz: [[.3, .72], [.12, .28]]
	}
};
var snowPlacement = centerShape("snow", { yK: .66 });
var snowSlide = {
	id: "snow",
	shape: "snow",
	background: snowBackground,
	darkBackground: snowDarkBackground,
	padding: uniformRows(3),
	placement: snowPlacement
};
var houseSlide = {
	id: "house",
	shape: "house",
	background: {
		base: "rgb(43, 43, 54)",
		overlay: {
			kind: "linear",
			from: {
				xK: .5,
				yK: 0
			},
			to: {
				xK: .5,
				yK: 1
			},
			stops: [
				{ rgba: "rgb(214, 242, 255)" },
				{ rgba: "rgb(214, 242, 255)" },
				{ rgba: "rgb(248, 243, 239)" },
				{
					k: .6,
					rgba: "rgb(255, 226, 202)",
					liveBlend: [.1, 0]
				},
				{
					k: .6,
					rgba: "#a9e0a7",
					rightRgba: "#87dcb7",
					liveBlend: [.1, .1]
				},
				{
					rgba: "#c7ca83",
					liveBlend: [.1, .1]
				}
			]
		}
	},
	darkBackground: {
		base: "rgb(43, 43, 54)",
		overlay: {
			kind: "linear",
			from: {
				xK: .5,
				yK: 0
			},
			to: {
				xK: .5,
				yK: 1
			},
			stops: [
				{
					rgba: "rgb(20, 35, 68)",
					rightRgba: "rgb(44, 49, 60)"
				},
				{
					rgba: "rgb(49, 84, 126)",
					rightRgba: "rgb(67, 71, 93)"
				},
				{
					k: .65,
					rgba: "rgb(68, 116, 179)",
					rightRgba: "rgb(98, 99, 129)"
				},
				{
					k: .65,
					rgba: "#757f5c",
					rightRgba: "#628475",
					liveBlend: [.1, 0]
				},
				{
					rgba: "#3e4137",
					liveBlend: [.1, 0]
				}
			]
		},
		stars: {
			count: [16, 24],
			topBandK: .6,
			minR: .9,
			maxR: 1.6,
			alpha: [[.5, 1.5], [.6, 1.6]],
			flickerHz: [[.42, .98], [.14, .34]]
		}
	},
	padding: uniformRows(6),
	placement: { preset: {
		kind: "zone-communities",
		zones: [{
			id: "house",
			band: "ground",
			center: {
				x: .56,
				y: .7
			},
			radius: {
				tiles: 1,
				xDistort: 2.5,
				yDistort: .4
			},
			shapes: { house: {
				count: {
					mobile: 5,
					tablet: 5,
					laptop: 5
				},
				quota: [{
					t: 0,
					pct: 50
				}, {
					t: 1,
					pct: 50
				}]
			} }
		}]
	} }
};
//#endregion
//#region src/canvas-engine/scene-rules/spotlight/slides/07-power.ts
var powerBackground = {
	base: "rgb(43, 43, 54)",
	overlay: {
		kind: "linear",
		from: {
			xK: .5,
			yK: 0
		},
		to: {
			xK: .5,
			yK: 1
		},
		stops: [
			{ rgba: "rgb(163, 191, 229)" },
			{ rgba: "rgb(181, 218, 235)" },
			{
				k: .85,
				rgba: "rgb(237, 210, 188)",
				liveBlend: [.1, 0]
			},
			{
				k: .85,
				rgba: "#bce6bb",
				rightRgba: "#70bf9d",
				liveBlend: [.1, .1]
			},
			{
				rgba: "#bcdd84",
				liveBlend: [.1, .1]
			}
		]
	}
};
var powerDarkBackground = {
	base: "rgb(35, 42, 50)",
	overlay: {
		kind: "linear",
		from: {
			xK: .5,
			yK: 0
		},
		to: {
			xK: .5,
			yK: 1
		},
		stops: [
			{
				rgba: "rgb(69, 110, 148)",
				rightRgba: "rgb(64, 59, 106)"
			},
			{
				k: .85,
				rgba: "rgb(109, 146, 188)",
				rightRgba: "rgb(71, 84, 112)"
			},
			{
				k: .85,
				rgba: "rgb(120, 175, 130)",
				rightRgba: "rgb(61, 88, 82)",
				liveBlend: [.08, .02]
			},
			{
				rgba: "rgb(160, 181, 126)",
				rightRgba: "rgb(89, 132, 105)",
				liveBlend: [.08, .02]
			}
		]
	}
};
var powerAmbientParticles = { layers: [{
	count: [24, 46],
	xRange: [0, 1],
	yRange: [0, 1],
	sizePx: [1, 2],
	speedX: [24, 48],
	speedY: [-12, 12],
	color: [
		{
			color: "rgb(158, 190, 209)",
			alpha: .4
		},
		{
			color: "rgb(146, 188, 214)",
			alpha: .5
		},
		{
			color: "rgb(148, 162, 221)",
			alpha: .6
		}
	],
	seed: 31
}, {
	count: [8, 16],
	xRange: [0, 1],
	yRange: [0, 1],
	sizePx: [1.5, 3],
	speedX: [16, 24],
	speedY: [-3, 3],
	color: [{
		color: "rgb(139, 191, 231)",
		alpha: .6
	}, {
		color: "rgb(119, 209, 225)",
		alpha: .7
	}],
	seed: 67
}] };
var powerDarkAmbientParticles = { layers: [{
	count: [24, 46],
	xRange: [0, 1],
	yRange: [0, 1],
	sizePx: [1, 2],
	speedX: [24, 48],
	speedY: [-12, 12],
	color: [
		{
			color: "rgb(150, 220, 255)",
			alpha: .4
		},
		{
			color: "rgb(160, 255, 248)",
			alpha: .5
		},
		{
			color: "rgb(200, 210, 255)",
			alpha: .6
		}
	],
	seed: 31
}, {
	count: [8, 16],
	xRange: [0, 1],
	yRange: [0, 1],
	sizePx: [1.5, 3],
	speedX: [16, 24],
	speedY: [-3, 3],
	color: [{
		color: "rgb(91, 174, 131)",
		alpha: .6
	}, {
		color: "rgb(98, 190, 205)",
		alpha: .7
	}],
	seed: 67
}] };
var powerPlacement = centerShape("power");
var powerSlide = {
	id: "power",
	shape: "power",
	background: powerBackground,
	darkBackground: powerDarkBackground,
	ambientParticles: powerAmbientParticles,
	darkAmbientParticles: powerDarkAmbientParticles,
	padding: uniformRows(4),
	placement: powerPlacement
};
//#endregion
//#region src/canvas-engine/scene-rules/spotlight/slides/08-sun.ts
var sunBackground = {
	base: "rgb(50, 43, 50)",
	overlay: {
		kind: "radial",
		center: {
			xK: .5,
			yK: .5
		},
		innerK: .08,
		outer: { k: 1 },
		stops: [
			{
				rgba: "rgb(255, 252, 228)",
				liveBlend: [.08, .02]
			},
			{ rgba: "rgb(181, 237, 247)" },
			{ rgba: "rgb(133, 184, 221)" },
			{ rgba: "rgb(151, 178, 240)" }
		]
	}
};
var sunDarkBackground = {
	base: "rgb(45, 40, 52)",
	overlay: {
		kind: "radial",
		center: {
			xK: .5,
			yK: .5
		},
		innerK: .08,
		outer: { k: 1 },
		stops: [{
			rgba: "rgb(105, 116, 155)",
			liveBlend: [.04, .1]
		}, {
			rgba: "rgb(30, 31, 86)",
			liveBlend: [.04, .1]
		}]
	},
	stars: {
		count: [24, 42],
		topBandK: 1,
		minR: .65,
		maxR: 2,
		alpha: [[.3, .76], [.38, .96]],
		flickerHz: [[.24, .58], [.1, .22]]
	}
};
var sunPlacement = centerShape("sun");
var sunSlide = {
	id: "sun",
	shape: "sun",
	background: sunBackground,
	darkBackground: sunDarkBackground,
	darkAmbientParticles: null,
	padding: uniformRows(3),
	placement: sunPlacement
};
//#endregion
//#region src/canvas-engine/scene-rules/spotlight/slides/09-car.ts
var carBackground = {
	base: "rgb(42, 43, 55)",
	overlay: {
		kind: "linear",
		from: {
			xK: .5,
			yK: 0
		},
		to: {
			xK: .5,
			yK: 1
		},
		stops: [
			{ rgba: "rgb(181, 213, 236)" },
			{
				k: .6,
				rgba: "rgb(210, 228, 245)"
			},
			{
				k: .6,
				rgba: "rgb(147, 202, 150)",
				liveBlend: [.08, .12]
			},
			{
				rgba: "rgb(140, 205, 183)",
				liveBlend: [.08, .12]
			}
		]
	}
};
var carDarkBackground = {
	base: "rgb(39, 40, 52)",
	overlay: {
		kind: "linear",
		from: {
			xK: .5,
			yK: 0
		},
		to: {
			xK: .5,
			yK: 1
		},
		stops: [
			{ rgba: "rgb(75, 89, 132)" },
			{
				k: .6,
				rgba: "rgb(59, 98, 135)"
			},
			{
				k: .6,
				rgba: "rgb(96, 112, 94)",
				liveBlend: [.07, .02]
			},
			{
				rgba: "rgb(83, 112, 101)",
				liveBlend: [.05, .02]
			}
		]
	}
};
var FLAT_QUOTA$3 = [{
	t: 0,
	pct: 50
}, {
	t: 1,
	pct: 50
}];
var carRainAmbientParticles = { layers: [{
	shape: "rain",
	count: [82, 128],
	xRange: [-.04, 1.08],
	yRange: [-.12, 1],
	sizePx: [.8, 1.2],
	lengthPx: [12, 24],
	slantPx: [4, 10],
	lineWidthPx: [.7, 1.25],
	speedX: [22, 38],
	speedY: [170, 245],
	color: [
		{
			color: "rgb(72, 112, 145)",
			alpha: .42
		},
		{
			color: "rgb(55, 94, 128)",
			alpha: .36
		},
		{
			color: "rgb(92, 129, 158)",
			alpha: .32
		}
	],
	seed: 109
}] };
var carDarkRainAmbientParticles = { layers: [{
	shape: "rain",
	count: [74, 118],
	xRange: [-.04, 1.08],
	yRange: [-.12, 1],
	sizePx: [.8, 1.2],
	lengthPx: [13, 26],
	slantPx: [4, 11],
	lineWidthPx: [.65, 1.2],
	speedX: [22, 40],
	speedY: [175, 255],
	color: [
		{
			color: "rgb(155, 198, 235)",
			alpha: .28
		},
		{
			color: "rgb(185, 220, 255)",
			alpha: .22
		},
		{
			color: "rgb(225, 240, 255)",
			alpha: .16
		}
	],
	seed: 113
}] };
var carPlacement = { preset: {
	kind: "zone-communities",
	zones: [{
		id: "car",
		band: "ground",
		center: {
			x: .5,
			y: .6
		},
		radius: {
			tiles: 3,
			xDistort: 2,
			yDistort: .1
		},
		shapes: { car: {
			count: {
				mobile: 5,
				tablet: 5,
				laptop: 5
			},
			quota: FLAT_QUOTA$3
		} }
	}]
} };
var carSlide = {
	id: "car",
	shape: "car",
	background: carBackground,
	darkBackground: carDarkBackground,
	ambientParticles: carRainAmbientParticles,
	darkAmbientParticles: carDarkRainAmbientParticles,
	padding: uniformRows(3),
	placement: carPlacement
};
//#endregion
//#region src/canvas-engine/scene-rules/spotlight/slides/10-car-factory.ts
var carFactoryBackground = {
	base: "rgb(44, 39, 48)",
	overlay: {
		kind: "linear",
		from: {
			xK: .5,
			yK: 0
		},
		to: {
			xK: .5,
			yK: 1
		},
		stops: [
			{
				rgba: "rgb(140, 211, 255)",
				rightRgba: "rgb(145, 157, 215)"
			},
			{
				k: .75,
				rgba: "rgb(255, 231, 231)"
			},
			{
				k: .75,
				rgba: "rgb(212, 189, 183)",
				rightRgba: "rgb(189, 173, 151)",
				liveBlend: [.14, .08]
			},
			{
				rgba: "rgb(185, 185, 185)",
				liveBlend: [.08, .02]
			}
		]
	}
};
var carFactoryDarkBackground = {
	base: "rgb(44, 39, 48)",
	overlay: {
		kind: "linear",
		from: {
			xK: .5,
			yK: 0
		},
		to: {
			xK: .5,
			yK: 1
		},
		stops: [
			{
				rgba: "rgb(47, 94, 124)",
				rightRgba: "rgb(63, 74, 129)"
			},
			{
				k: .75,
				rgba: "rgb(146, 123, 91)"
			},
			{
				k: .75,
				rgba: "rgb(102, 90, 87)",
				rightRgba: "rgb(79, 72, 62)",
				liveBlend: [.14, .08]
			},
			{
				rgba: "rgb(91, 91, 91)",
				liveBlend: [.08, .02]
			}
		]
	}
};
var carFactoryPlacement = centerShape("carFactory", { yK: .52 });
var carFactorySlide = {
	id: "carFactory",
	shape: "carFactory",
	background: carFactoryBackground,
	darkBackground: carFactoryDarkBackground,
	padding: uniformRows(3),
	placement: carFactoryPlacement
};
//#endregion
//#region src/canvas-engine/scene-rules/spotlight/slides/11-trees.ts
var treesBackground = {
	base: "rgb(38, 47, 44)",
	overlay: {
		kind: "radial",
		center: {
			xK: .5,
			yK: .5
		},
		innerK: .08,
		outer: { k: 1 },
		stops: [
			{
				rgba: "rgb(167, 218, 170)",
				liveBlend: [.08, .12]
			},
			{
				rgba: "rgb(153, 229, 158)",
				liveBlend: [.08, .12]
			},
			{
				rgba: "rgb(122, 214, 183)",
				liveBlend: [.08, .12]
			}
		]
	}
};
var treesDarkBackground = {
	base: "rgb(38, 47, 44)",
	overlay: {
		kind: "radial",
		center: {
			xK: .5,
			yK: .5
		},
		innerK: .08,
		outer: { k: 1 },
		stops: [
			{
				rgba: "rgb(97, 143, 116)",
				liveBlend: [.08, .12]
			},
			{
				rgba: "rgb(84, 140, 97)",
				liveBlend: [.08, .12]
			},
			{
				rgba: "rgb(62, 111, 90)",
				liveBlend: [.08, .12]
			}
		]
	}
};
var treesFoliage = { layers: [{
	count: [60, 120],
	yK: [0, 1],
	heightPx: [8, 16],
	widthPx: [4, 12],
	color: [
		{
			color: "#96bf64",
			alpha: .4
		},
		{
			color: "#cebf83",
			alpha: .4
		},
		{
			color: "#71b571",
			alpha: .4
		}
	],
	seed: 32
}] };
var treesDarkFoliage = { layers: [{
	count: [60, 120],
	yK: [0, 1],
	heightPx: [8, 16],
	widthPx: [4, 12],
	color: [
		{
			color: "#8f613c",
			alpha: .3
		},
		{
			color: "#4a6840",
			alpha: .3
		},
		{
			color: "#2e454a",
			alpha: .3
		},
		{
			color: "#639163",
			alpha: .3
		}
	],
	seed: 32
}] };
var treesPlacement = centerShape("trees", { yK: .58 });
//#endregion
//#region src/canvas-engine/scene-rules/spotlight/slides/index.ts
var SPOTLIGHT_SLIDES = [
	villaSlide,
	busSlide,
	powerSlide,
	seaSlide,
	carFactorySlide,
	cloudsSlide,
	{
		id: "trees",
		shape: "trees",
		background: treesBackground,
		darkBackground: treesDarkBackground,
		foliage: treesFoliage,
		darkFoliage: treesDarkFoliage,
		padding: uniformRows(2),
		placement: treesPlacement
	},
	sunSlide,
	snowSlide,
	houseSlide,
	carSlide
];
//#endregion
//#region src/canvas-engine/scene-rules/canvas-padding/spotlight.ts
var SPOTLIGHT_PADDING_VARIANTS = SPOTLIGHT_SLIDES.map((slide) => slide.padding);
//#endregion
//#region src/canvas-engine/scene-rules/canvas-padding/index.ts
var CANVAS_PADDING = {
	start: START_PADDING,
	city: CITY_PADDING,
	questionnaire: QUESTIONNAIRE_PADDING,
	spotlight: {
		...SPOTLIGHT_SLIDES[0].padding,
		runtimePreset: {
			selector: "spotlightIndex",
			entries: SPOTLIGHT_PADDING_VARIANTS
		}
	}
};
//#endregion
//#region src/canvas-engine/grid-layout/coords.ts
function o(v) {
	return typeof v === "number" && Number.isFinite(v) ? v : 0;
}
/** rectangular rect for occupied block */
function cellRectToPx2(size, r0, c0, w, h) {
	const ox = o(size.ox), oy = o(size.oy);
	if (size.rowOffsetY && size.rowHeights) {
		let spanH = 0;
		for (let dr = 0; dr < h; dr++) spanH += size.rowHeights[r0 + dr] ?? size.cellH;
		return {
			x: ox + c0 * size.cellW,
			y: oy + (size.rowOffsetY[r0] ?? r0 * size.cellH),
			w: w * size.cellW,
			h: spanH
		};
	}
	return {
		x: ox + c0 * size.cellW,
		y: oy + r0 * size.cellH,
		w: w * size.cellW,
		h: h * size.cellH
	};
}
/** anchor point for a footprint rect */
function cellAnchorToPx2(size, rect, anchor = "topleft") {
	const ox = o(size.ox), oy = o(size.oy);
	const bottomRow = rect.r0 + rect.h - 1;
	if (size.cellWPerRow && size.rowHeights && size.rowOffsetY) {
		const unitW = size.cellWPerRow[bottomRow] ?? size.cellW;
		const unitH = size.rowHeights[bottomRow] ?? size.cellH;
		const unitOY = size.rowOffsetY[bottomRow] ?? bottomRow * size.cellH;
		const pxH = unitH * rect.h;
		const pxY = unitOY - unitH * (rect.h - 1);
		const pxX = ox + rect.c0 * unitW;
		if (anchor === "center") return {
			x: pxX + rect.w * unitW / 2,
			y: oy + pxY + pxH / 2
		};
		return {
			x: pxX,
			y: oy + pxY
		};
	}
	if (anchor === "center") return {
		x: ox + rect.c0 * size.cellW + rect.w * size.cellW / 2,
		y: oy + rect.r0 * size.cellH + rect.h * size.cellH / 2
	};
	return {
		x: ox + rect.c0 * size.cellW,
		y: oy + rect.r0 * size.cellH
	};
}
//#endregion
//#region src/canvas-engine/grid-layout/uiPlacement.ts
function clampInt(value, min, max) {
	if (max < min) return min;
	return Math.max(min, Math.min(max, value));
}
function alignIndex(min, max, align = "center") {
	if (max <= min) return min;
	if (align === "start") return min;
	if (align === "end") return max;
	return Math.round((min + max) / 2);
}
function horizontalReferenceForFootprint$1(rows, cols, r0, h, colsPerRow) {
	const bottomRow = clampInt(r0 + h - 1, 0, Math.max(0, rows - 1));
	return colsPerRow?.[bottomRow] ?? cols;
}
function resolveUiGridBandPlacement(grid, placement) {
	const usedRows = Math.max(1, Math.min(grid.rows, grid.usedRows ?? grid.rows));
	const maxRowStart = Math.max(0, Math.min(grid.rows, usedRows) - placement.h);
	const topK = Math.max(0, Math.min(1, placement.verticalK[0]));
	const bottomK = Math.max(topK, Math.min(1, placement.verticalK[1]));
	const rMin = clampInt(Math.floor(usedRows * topK), 0, maxRowStart);
	const r0 = alignIndex(rMin, clampInt(Math.floor(usedRows * bottomK), rMin, maxRowStart), placement.rowAlign);
	const refCols = horizontalReferenceForFootprint$1(grid.rows, grid.cols, r0, placement.h, grid.colsPerRow);
	const maxColStart = Math.max(0, refCols - placement.w - 1);
	const leftK = Math.max(0, Math.min(1, placement.horizontalK?.[0] ?? 0));
	const rightK = Math.max(leftK, Math.min(1, placement.horizontalK?.[1] ?? 1));
	const cMin = clampInt(Math.floor(refCols * leftK), 0, maxColStart);
	return {
		r0,
		c0: alignIndex(cMin, clampInt(Math.floor(refCols * rightK), cMin, maxColStart), placement.colAlign),
		w: placement.w,
		h: placement.h,
		anchor: placement.anchor
	};
}
function justifyContentForUiPlacement(placement) {
	if ("colAlign" in placement && placement.colAlign) {
		if (placement.colAlign === "start") return "flex-start";
		if (placement.colAlign === "end") return "flex-end";
	}
	if ("horizontalK" in placement && placement.horizontalK) {
		const mid = (placement.horizontalK[0] + placement.horizontalK[1]) * .5;
		if (mid <= .34) return "flex-start";
		if (mid >= .66) return "flex-end";
	}
	return "center";
}
function resolveUiGridPlacement(grid, placement) {
	if ("r0" in placement) return placement;
	return resolveUiGridBandPlacement(grid, placement);
}
function uiGridRectToPx(size, rect) {
	if (size.cellWPerRow && size.rowHeights && size.rowOffsetY) {
		const bottomRow = clampInt(rect.r0 + rect.h - 1, 0, Math.max(0, size.rowHeights.length - 1));
		const unitW = size.cellWPerRow[bottomRow] ?? size.cellW;
		const unitH = size.rowHeights[bottomRow] ?? size.cellH;
		const topLeft = cellAnchorToPx2(size, rect, "topleft");
		const pxH = unitH * rect.h;
		return {
			left: topLeft.x,
			top: topLeft.y,
			width: rect.w * unitW,
			height: pxH,
			anchorX: topLeft.x + rect.w * unitW / 2,
			anchorY: topLeft.y + pxH / 2
		};
	}
	const pxRect = cellRectToPx2(size, rect.r0, rect.c0, rect.w, rect.h);
	const anchor = cellAnchorToPx2(size, rect, "center");
	return {
		left: pxRect.x,
		top: pxRect.y,
		width: pxRect.w,
		height: pxRect.h,
		anchorX: anchor.x,
		anchorY: anchor.y
	};
}
function uiGridPlacementToPx(size, placement) {
	const pxRect = uiGridRectToPx(size, placement);
	if (placement.anchor === "topleft") return {
		...pxRect,
		anchorX: pxRect.left,
		anchorY: pxRect.top
	};
	return pxRect;
}
//#endregion
//#region src/canvas-engine/grid-layout/resolveCols.ts
function clamp(n, lo, hi) {
	return Math.max(lo, Math.min(hi, n));
}
function quantizeInt(n, step = 1) {
	const s = Math.max(1, Math.round(step));
	return Math.round(n / s) * s;
}
/**
* Canonical column-count policy.
* Inputs:
* - rows (authoritative density)
* - viewport width/height
* - useTopRatio (if you crop height, aspect must use usableH)
*
* Output:
* - integer cols (quantized)
*/
function resolveCols(opts) {
	const rows = Math.max(1, Math.round(opts.rows));
	const w = Math.max(1, opts.widthPx);
	const useTop = clamp(opts.useTopRatio ?? 1, .01, 1);
	let colsF = rows * (w / Math.max(1, Math.round(opts.heightPx * useTop)));
	if (w < 420) colsF *= .95;
	else if (w < 768) colsF *= 1;
	else if (w < 1024) colsF *= 1.08;
	else colsF *= 1.15;
	const step = w >= 768 ? 2 : 1;
	const minCols = Math.max(1, Math.floor(rows * .6));
	const maxCols = Math.max(minCols, Math.ceil(rows * 6));
	let cols = quantizeInt(colsF, step);
	cols = clamp(cols, minCols, maxCols);
	return cols;
}
//#endregion
//#region src/canvas-engine/grid-layout/horizonRowHeights.ts
var MIN_WEIGHT = .15;
var MAX_WEIGHT = 3;
function perspectiveHeights(n, totalH, reversed) {
	if (n === 1) return [totalH];
	const weights = new Array(n);
	for (let i = 0; i < n; i++) {
		const t = i / (n - 1);
		weights[i] = reversed ? MIN_WEIGHT + (MAX_WEIGHT - MIN_WEIGHT) * (1 - t) : MIN_WEIGHT + (MAX_WEIGHT - MIN_WEIGHT) * t;
	}
	const totalW = weights.reduce((a, b) => a + b, 0);
	return weights.map((wt) => wt / totalW * totalH);
}
function computeHorizonRowHeights(totalH, rows, horizonPos, w) {
	const n = Math.max(2, rows);
	const horizonY = totalH * Math.max(.05, Math.min(.95, horizonPos));
	const topH = horizonY;
	const botH = totalH - horizonY;
	const halfRows = Math.floor(n / 2);
	const extra = n % 2;
	let topRows, botRows;
	if (extra === 0) {
		topRows = halfRows;
		botRows = halfRows;
	} else if (topH >= botH) {
		topRows = halfRows + 1;
		botRows = halfRows;
	} else {
		topRows = halfRows;
		botRows = halfRows + 1;
	}
	let topHeights, botHeights;
	if (topH >= botH) {
		topHeights = perspectiveHeights(topRows, topH, true);
		const pinH = Math.min(topHeights[topRows - 1], botH * .9);
		botHeights = botRows === 1 ? [botH] : [pinH, ...perspectiveHeights(botRows - 1, botH - pinH, false)];
	} else {
		botHeights = perspectiveHeights(botRows, botH, false);
		const pinH = Math.min(botHeights[0], topH * .9);
		topHeights = topRows === 1 ? [topH] : [...perspectiveHeights(topRows - 1, topH - pinH, true), pinH];
	}
	const rowHeights = [...topHeights, ...botHeights];
	const rowOffsetY = new Array(n);
	let acc = 0;
	for (let i = 0; i < n; i++) {
		rowOffsetY[i] = acc;
		acc += rowHeights[i];
	}
	const horizonRowIdx = topRows - 1;
	const horizonRowH = topHeights[topRows - 1];
	const maxCols = Math.round(w / 8);
	const colsPerRow = rowHeights.map((rh) => Math.max(2, Math.min(maxCols, Math.round(w / Math.max(1, rh)))));
	return {
		rowHeights,
		rowOffsetY,
		horizonRowH,
		horizonRowIdx,
		colsPerRow,
		cellWPerRow: colsPerRow.map((c) => w / c)
	};
}
//#endregion
//#region src/canvas-engine/grid-layout/buildGrid.ts
function makeCenteredSquareGrid(opts) {
	const { w, h, rows, useTopRatio = 1, horizonPos } = opts;
	const usableH = Math.max(1, Math.round(h * Math.max(.01, Math.min(1, useTopRatio))));
	const ox = 0;
	const oy = 0;
	if (horizonPos != null) {
		const { rowHeights, rowOffsetY, horizonRowH, horizonRowIdx, colsPerRow, cellWPerRow } = computeHorizonRowHeights(usableH, rows, horizonPos, w);
		const cols = Math.max(...colsPerRow);
		const cellW = cellWPerRow[Math.min(cellWPerRow.length - 1, horizonRowIdx)];
		const cellH = horizonRowH;
		const cell = horizonRowH;
		const points = [];
		for (let r = 0; r < rows; r++) {
			const cy = oy + rowOffsetY[r] + rowHeights[r] / 2;
			const rCols = colsPerRow[r];
			const rCellW = cellWPerRow[r];
			for (let c = 0; c < rCols; c++) {
				const cx = ox + c * rCellW + rCellW / 2;
				points.push({
					x: Math.round(cx),
					y: Math.round(cy)
				});
			}
		}
		return {
			points,
			rows,
			cols,
			cell,
			cellW,
			cellH,
			ox,
			oy,
			metrics: {
				rowHeights,
				rowOffsetY,
				colsPerRow,
				cellWPerRow
			}
		};
	}
	const cellH = usableH / Math.max(1, rows);
	const cols = resolveCols({
		rows,
		widthPx: w,
		heightPx: h,
		useTopRatio
	});
	const cellW = w / cols;
	const cell = cellH;
	const rowHeights = Array.from({ length: rows }, () => cellH);
	const rowOffsetY = Array.from({ length: rows }, (_, i) => i * cellH);
	const colsPerRow = Array.from({ length: rows }, () => cols);
	const cellWPerRow = Array.from({ length: rows }, () => cellW);
	const points = [];
	for (let r = 0; r < rows; r++) {
		const cy = oy + r * cellH + cellH / 2;
		for (let c = 0; c < cols; c++) {
			const cx = ox + c * cellW + cellW / 2;
			points.push({
				x: Math.round(cx),
				y: Math.round(cy)
			});
		}
	}
	return {
		points,
		rows,
		cols,
		cell,
		cellW,
		cellH,
		ox,
		oy,
		metrics: {
			rowHeights,
			rowOffsetY,
			colsPerRow,
			cellWPerRow
		}
	};
}
/**
* Computes how many rows are considered within the "used" region.
* This mirrors the way makeCenteredSquareGrid derives usable height.
*/
function usedRowsFromSpec(rows, useTopRatio) {
	return Math.max(1, Math.round(rows * Math.max(.01, Math.min(1, useTopRatio ?? 1))));
}
//#endregion
//#region src/onboarding/questionnaire/button-input/useQuestionnaireGridLayout.ts
function findActiveGridHost(preferCityCanvas, preferQuestionnaireHost) {
	if (typeof document === "undefined") return null;
	if (preferCityCanvas) {
		const cityHost = document.getElementById("city-canvas-root");
		if (cityHost instanceof HTMLElement) return cityHost;
	}
	const questionnaireCanvas = document.getElementById("questionnaire-canvas-root");
	const questionnaireHost = document.querySelector(".onboarding-canvas.questionnaire-active");
	const canvasRoot = document.getElementById("canvas-root");
	const onboardingHost = preferQuestionnaireHost ? questionnaireCanvas ?? questionnaireHost ?? canvasRoot ?? document.querySelector(".onboarding-canvas") : canvasRoot ?? questionnaireHost ?? document.querySelector(".onboarding-canvas");
	return onboardingHost instanceof HTMLElement ? onboardingHost : null;
}
function readCanvasBox(host) {
	if (!(host instanceof HTMLElement)) return null;
	const rect = host.getBoundingClientRect();
	const next = {
		width: Math.floor(rect.width > 0 ? rect.width : host.clientWidth),
		height: Math.floor(rect.height > 0 ? rect.height : host.clientHeight)
	};
	if (next.width <= 0 || next.height <= 0) return null;
	return next;
}
function readViewportBox() {
	if (typeof window === "undefined") return null;
	const vv = window.visualViewport;
	const width = Math.floor(vv?.width ?? getViewportSize$1().w);
	const height = Math.floor(vv?.height ?? getViewportSize$1().h);
	if (width <= 0 || height <= 0) return null;
	return {
		width,
		height
	};
}
function useQuestionnaireGridLayout() {
	const { cityPanelOpen, questionnaireOpen } = useUiFlow();
	const preferCityCanvas = cityPanelOpen && questionnaireOpen;
	const preferQuestionnaireHost = questionnaireOpen && !preferCityCanvas;
	const [canvasBox, setCanvasBox] = useState(() => readCanvasBox(findActiveGridHost(preferCityCanvas, preferQuestionnaireHost)));
	useEffect(() => {
		let rafId = 0;
		let resizeObserver = null;
		let mutationObserver = null;
		let observedHost = null;
		const visualViewport = typeof window !== "undefined" ? window.visualViewport : void 0;
		const syncObserverTarget = (host) => {
			if (observedHost === host) return;
			resizeObserver?.disconnect();
			observedHost = host;
			if (host && typeof ResizeObserver !== "undefined") {
				resizeObserver = new ResizeObserver(() => {
					scheduleMeasure();
				});
				resizeObserver.observe(host);
			}
		};
		const measure = () => {
			const host = findActiveGridHost(preferCityCanvas, preferQuestionnaireHost);
			syncObserverTarget(host);
			setCanvasBox(preferQuestionnaireHost ? readViewportBox() : readCanvasBox(host));
		};
		const scheduleMeasure = () => {
			cancelAnimationFrame(rafId);
			rafId = requestAnimationFrame(measure);
		};
		scheduleMeasure();
		window.addEventListener("resize", scheduleMeasure);
		window.addEventListener("orientationchange", scheduleMeasure);
		if (visualViewport) visualViewport.addEventListener("resize", scheduleMeasure);
		if (typeof MutationObserver !== "undefined" && typeof document !== "undefined") {
			mutationObserver = new MutationObserver(() => {
				scheduleMeasure();
			});
			mutationObserver.observe(document.body, {
				childList: true,
				subtree: true
			});
		}
		return () => {
			cancelAnimationFrame(rafId);
			resizeObserver?.disconnect();
			mutationObserver?.disconnect();
			window.removeEventListener("resize", scheduleMeasure);
			window.removeEventListener("orientationchange", scheduleMeasure);
			if (visualViewport) visualViewport.removeEventListener("resize", scheduleMeasure);
		};
	}, [preferCityCanvas, preferQuestionnaireHost]);
	const layout = useMemo(() => {
		if (!canvasBox) return null;
		const spec = resolvePaddingSpec(canvasBox.width, CANVAS_PADDING.questionnaire);
		const grid = makeCenteredSquareGrid({
			w: canvasBox.width,
			h: canvasBox.height,
			rows: spec.rows,
			useTopRatio: spec.useTopRatio ?? 1,
			horizonPos: spec.horizonPos
		});
		const size = {
			cellW: grid.cellW,
			cellH: grid.cellH,
			ox: grid.ox,
			oy: grid.oy,
			...grid.metrics
		};
		return {
			width: canvasBox.width,
			height: canvasBox.height,
			device: deviceType(canvasBox.width),
			rows: grid.rows,
			cols: grid.cols,
			usedRows: usedRowsFromSpec(grid.rows, spec.useTopRatio),
			spec,
			size,
			colsPerRow: grid.metrics.colsPerRow
		};
	}, [canvasBox]);
	const getPlacementStyle = (placement) => {
		if (!layout) return void 0;
		const resolvedPlacement = resolveUiGridPlacement({
			rows: layout.rows,
			cols: layout.cols,
			usedRows: layout.usedRows,
			colsPerRow: layout.colsPerRow
		}, placement);
		const px = uiGridPlacementToPx(layout.size, resolvedPlacement);
		return {
			left: `${String(px.left)}px`,
			top: `${String(px.anchorY)}px`,
			width: `${String(px.width)}px`,
			justifyContent: justifyContentForUiPlacement(placement)
		};
	};
	const resolvePlacement = useCallback((placement) => {
		if (!layout) return void 0;
		return resolveUiGridPlacement({
			rows: layout.rows,
			cols: layout.cols,
			usedRows: layout.usedRows,
			colsPerRow: layout.colsPerRow
		}, placement);
	}, [layout]);
	return {
		ready: !!layout,
		device: layout?.device ?? "laptop",
		layout,
		getPlacementStyle,
		resolvePlacement
	};
}
//#endregion
//#region src/onboarding/questionnaire/button-input/questionnaire-flow.tsx
function reserveSingleTile(footprint) {
	return {
		r0: footprint.r0 + footprint.h - 1,
		c0: footprint.c0 + Math.floor(Math.max(0, footprint.w - 1) / 2),
		w: 1,
		h: 1
	};
}
function ButtonQuestionnaireIcon({ active }) {
	return /* @__PURE__ */ jsx("span", {
		className: "ui-icon button-questionnaire__button-icon",
		"aria-hidden": "true",
		children: active ? /* @__PURE__ */ jsx(CheckIcon, { className: "button-questionnaire__button-check-icon" }) : /* @__PURE__ */ jsxs("svg", {
			className: "icon-plus button-questionnaire__button-plus-icon",
			viewBox: "0 0 24 24",
			fill: "none",
			stroke: "currentColor",
			children: [/* @__PURE__ */ jsx("line", {
				x1: "12",
				y1: "5",
				x2: "12",
				y2: "19",
				strokeWidth: "2.5"
			}), /* @__PURE__ */ jsx("line", {
				x1: "5",
				y1: "12",
				x2: "19",
				y2: "12",
				strokeWidth: "2.5"
			})]
		})
	});
}
function ButtonQuestionnaireOption({ active, label, onClick, className, style }) {
	return /* @__PURE__ */ jsx("button", {
		type: "button",
		className,
		style,
		"aria-pressed": active,
		onClick,
		children: /* @__PURE__ */ jsxs("span", {
			className: "button-questionnaire__button-content",
			children: [/* @__PURE__ */ jsx(ButtonQuestionnaireIcon, { active }), /* @__PURE__ */ jsx("span", {
				className: "button-questionnaire__button-label",
				children: label
			})]
		})
	});
}
function ButtonQuestionnaireFlow({ onAnswersUpdate, onSubmit, submitting }) {
	const { setLiveAvg, setReservedFootprints } = useCanvasRuntime();
	const { questionnaireAdvanceTick, setQuestionnaireNav, resetQuestionnaireNav } = useUiFlow();
	const [step, setStep] = useState(0);
	const [initialUiReady, setInitialUiReady] = useState(false);
	const [activeOptionsByQuestion, setActiveOptionsByQuestion] = useState({});
	const lastConsumedAdvanceTickRef = useRef(0);
	const { device, layout, getPlacementStyle, resolvePlacement } = useQuestionnaireGridLayout();
	const question = BUTTON_QUESTIONS[step];
	const selectedKeys = activeOptionsByQuestion[question.id] ?? [];
	const answers = useMemo(() => BUTTON_QUESTIONS.reduce((acc, buttonQuestion) => {
		const activeKeys = activeOptionsByQuestion[buttonQuestion.id] ?? [];
		const activeOptions = buttonQuestion.options.filter((option) => activeKeys.includes(option.key));
		acc[buttonQuestion.id] = activeOptions.length ? activeOptions.reduce((sum, option) => sum + option.weight, 0) / activeOptions.length : null;
		return acc;
	}, {}), [activeOptionsByQuestion]);
	const selected = answers[question.id] ?? null;
	const isLast = step === BUTTON_QUESTIONS.length - 1;
	const liveAvg = useMemo(() => {
		const values = BUTTON_QUESTIONS.slice(0, step + 1).map((buttonQuestion) => answers[buttonQuestion.id]).filter((value) => typeof value === "number" && Number.isFinite(value));
		if (!values.length) return DEFAULT_AVG;
		return values.reduce((sum, value) => sum + value, 0) / values.length;
	}, [answers, step]);
	useEffect(() => {
		onAnswersUpdate?.(answers);
	}, [answers, onAnswersUpdate]);
	useEffect(() => {
		const timer = window.setTimeout(() => {
			setInitialUiReady(true);
		}, 300);
		return () => {
			window.clearTimeout(timer);
		};
	}, []);
	useEffect(() => {
		setLiveAvg(liveAvg);
	}, [liveAvg, setLiveAvg]);
	useEffect(() => {
		setQuestionnaireNav({
			step: step + 1,
			total: BUTTON_QUESTIONS.length,
			nextLabel: isLast ? "Finish" : "Next",
			nextDisabled: selectedKeys.length === 0 || selected === null || !!submitting
		});
	}, [
		isLast,
		selected,
		selectedKeys.length,
		setQuestionnaireNav,
		step,
		submitting
	]);
	useEffect(() => {
		if (!layout) {
			setReservedFootprints([]);
			return;
		}
		setReservedFootprints(question.options.map((_, optionIndex) => resolvePlacement(getQuestionButtonPlacement(question.id, optionIndex, device))).filter((placement) => !!placement).map((placement) => reserveSingleTile(placement)));
	}, [
		device,
		layout,
		question.id,
		question.options,
		resolvePlacement,
		setReservedFootprints
	]);
	useEffect(() => {
		setReservedFootprints([]);
		return () => {
			setReservedFootprints([]);
		};
	}, [setReservedFootprints]);
	useEffect(() => {
		return () => {
			resetQuestionnaireNav();
		};
	}, [resetQuestionnaireNav]);
	const toggleOption = useCallback((optionKey) => {
		setActiveOptionsByQuestion((prev) => {
			const current = prev[question.id] ?? [];
			const nextKeys = current.includes(optionKey) ? current.filter((key) => key !== optionKey) : [...current, optionKey];
			return {
				...prev,
				[question.id]: nextKeys
			};
		});
	}, [question.id]);
	const handleNext = useCallback(() => {
		if (selectedKeys.length === 0 || selected === null) return;
		if (isLast) {
			const final = {
				...answers,
				[question.id]: selected
			};
			onSubmit?.(final);
		} else setStep((s) => s + 1);
	}, [
		answers,
		isLast,
		onSubmit,
		question.id,
		selected,
		selectedKeys.length
	]);
	useEffect(() => {
		if (questionnaireAdvanceTick <= lastConsumedAdvanceTickRef.current) return;
		lastConsumedAdvanceTickRef.current = questionnaireAdvanceTick;
		handleNext();
	}, [handleNext, questionnaireAdvanceTick]);
	return /* @__PURE__ */ jsxs("section", {
		className: `survey survey-step questionnaire${initialUiReady ? " is-ui-ready" : " is-ui-delayed"}`,
		children: [/* @__PURE__ */ jsx("div", {
			className: "questions questionnaire-title questionnaire-grid-header",
			children: /* @__PURE__ */ jsx("h2", {
				className: "q-title questionnaire-question-title",
				children: question.prompt
			}, question.id)
		}), layout && /* @__PURE__ */ jsx("div", {
			className: "button-questionnaire__canvas-layer",
			"aria-label": `${question.prompt} options`,
			children: question.options.map((option, optionIndex) => {
				const active = selectedKeys.includes(option.key);
				return /* @__PURE__ */ jsx("div", {
					className: "button-questionnaire__slot",
					style: {
						...getPlacementStyle(getQuestionButtonPlacement(question.id, optionIndex, device)),
						"--slot-index": optionIndex
					},
					children: /* @__PURE__ */ jsx(ButtonQuestionnaireOption, {
						active,
						label: option.label,
						className: `ui-toggle-option button-questionnaire__button button-questionnaire__button--placed${active ? " is-active" : ""}`,
						onClick: () => {
							toggleOption(option.key);
						}
					})
				}, `${question.id}:${option.key}`);
			})
		})]
	});
}
//#endregion
//#region src/app/notices.ts
var DUPLICATE_SURVEY_NOTICE_EVENT = "be:duplicate-survey-notice";
var RATE_LIMIT_NOTICE_EVENT = "be:rate-limit-notice";
function showDuplicateSurveyNotice() {
	if (typeof window === "undefined") return;
	window.dispatchEvent(new Event(DUPLICATE_SURVEY_NOTICE_EVENT));
}
function listenForDuplicateSurveyNotice(callback) {
	if (typeof window === "undefined") return () => void 0;
	window.addEventListener(DUPLICATE_SURVEY_NOTICE_EVENT, callback);
	return () => {
		window.removeEventListener(DUPLICATE_SURVEY_NOTICE_EVENT, callback);
	};
}
function showRateLimitNotice(detail = {}) {
	if (typeof window === "undefined") return;
	window.dispatchEvent(new CustomEvent(RATE_LIMIT_NOTICE_EVENT, { detail }));
}
function normalizeRateLimitNoticeDetail(detail) {
	if (!detail || typeof detail !== "object") return {};
	const maybeDetail = detail;
	return {
		message: typeof maybeDetail.message === "string" ? maybeDetail.message : void 0,
		resetAt: typeof maybeDetail.resetAt === "string" ? maybeDetail.resetAt : void 0
	};
}
function listenForRateLimitNotice(callback) {
	if (typeof window === "undefined") return () => void 0;
	const onNotice = (event) => {
		callback(normalizeRateLimitNoticeDetail(event instanceof CustomEvent ? event.detail : void 0));
	};
	window.addEventListener(RATE_LIMIT_NOTICE_EVENT, onNotice);
	return () => {
		window.removeEventListener(RATE_LIMIT_NOTICE_EVENT, onNotice);
	};
}
//#endregion
//#region src/client-api/read-api/config.ts
var FORCE_MOCK_READS = false;
var snapshot$1 = {
	forced: FORCE_MOCK_READS,
	runtimeFallback: false,
	active: FORCE_MOCK_READS
};
var listeners = /* @__PURE__ */ new Set();
function emit() {
	listeners.forEach((listener) => {
		listener();
	});
}
function shouldUseMockReads() {
	return snapshot$1.active;
}
function enableMockReadFallback(reason) {
	if (snapshot$1.runtimeFallback) return;
	snapshot$1 = {
		forced: FORCE_MOCK_READS,
		runtimeFallback: true,
		active: true
	};
	console.warn("[read-api] Falling back to mock reads", reason);
	emit();
}
function subscribeMockReadMode(listener) {
	listeners.add(listener);
	return () => {
		listeners.delete(listener);
	};
}
function useMockReadMode() {
	return useSyncExternalStore(subscribeMockReadMode, () => snapshot$1, () => snapshot$1);
}
//#endregion
//#region src/domain/survey/normalizeSurveyRow.ts
var round3$2 = (v) => typeof v === "number" ? Math.round(v * 1e3) / 1e3 : void 0;
function normalizeSurveyRow(row) {
	const q1 = round3$2(row.q1);
	const q2 = round3$2(row.q2);
	const q3 = round3$2(row.q3);
	const q4 = round3$2(row.q4);
	const q5 = round3$2(row.q5);
	const avgWeight = round3$2(row.avgWeight);
	const fallbackDate = row.submittedAt ?? row._createdAt ?? "";
	return {
		_id: row._id,
		section: row.section ?? "",
		q1,
		q2,
		q3,
		q4,
		q5,
		avgWeight,
		soloMessage: row.soloMessage,
		soloMessageUpdatedAt: row.soloMessageUpdatedAt,
		submittedAt: row.submittedAt,
		_createdAt: row._createdAt ?? fallbackDate,
		weights: {
			question1: q1 ?? .5,
			question2: q2 ?? .5,
			question3: q3 ?? .5,
			question4: q4 ?? .5,
			question5: q5 ?? .5
		}
	};
}
//#endregion
//#region src/client-api/mock-survey-data/mockData.ts
var MOCK_STORAGE_KEY = "be.mockRows";
var TARGET_BASE_ROW_COUNT = 800;
var MOCK_SEEDS = [
	[
		"animation",
		.38,
		.42,
		.35,
		.4,
		.37
	],
	[
		"animation",
		.77,
		.74,
		.8,
		.76,
		.78
	],
	[
		"illustration",
		.48,
		.51,
		.46,
		.5,
		.47
	],
	[
		"illustration",
		.62,
		.58,
		.64,
		.6,
		.61
	],
	[
		"fine-arts-2d",
		.3,
		.34,
		.32,
		.28,
		.31
	],
	[
		"fine-arts-2d",
		.54,
		.57,
		.51,
		.55,
		.53
	],
	[
		"communication-design",
		.29,
		.33,
		.35,
		.27,
		.31
	],
	[
		"communication-design",
		.84,
		.8,
		.82,
		.78,
		.81
	],
	[
		"visitor",
		.45,
		.48,
		.43,
		.47,
		.46
	],
	[
		"visitor",
		.63,
		.6,
		.66,
		.58,
		.62
	],
	[
		"academic-resource-center",
		.37,
		.41,
		.39,
		.43,
		.38
	],
	[
		"academic-resource-center",
		.57,
		.53,
		.6,
		.55,
		.58
	],
	[
		"industrial-design",
		.34,
		.38,
		.36,
		.4,
		.35
	],
	[
		"industrial-design",
		.76,
		.73,
		.79,
		.74,
		.77
	],
	[
		"student-engagement",
		.26,
		.3,
		.32,
		.25,
		.28
	],
	[
		"student-engagement",
		.5,
		.54,
		.48,
		.52,
		.51
	],
	[
		"photography",
		.27,
		.31,
		.29,
		.25,
		.28
	],
	[
		"photography",
		.56,
		.6,
		.53,
		.58,
		.55
	],
	[
		"architecture",
		.4,
		.44,
		.42,
		.38,
		.41
	],
	[
		"architecture",
		.81,
		.78,
		.84,
		.8,
		.83
	],
	[
		"painting",
		.33,
		.37,
		.35,
		.31,
		.34
	],
	[
		"painting",
		.52,
		.56,
		.49,
		.54,
		.53
	],
	[
		"design-innovation",
		.28,
		.32,
		.3,
		.34,
		.27
	],
	[
		"design-innovation",
		.87,
		.84,
		.89,
		.85,
		.88
	],
	[
		"dynamic-media-institute",
		.31,
		.35,
		.28,
		.37,
		.3
	],
	[
		"dynamic-media-institute",
		.88,
		.85,
		.91,
		.86,
		.89
	],
	[
		"technology",
		.33,
		.37,
		.35,
		.31,
		.34
	],
	[
		"technology",
		.59,
		.55,
		.62,
		.57,
		.6
	],
	[
		"studio-arts",
		.25,
		.29,
		.31,
		.27,
		.26
	],
	[
		"studio-arts",
		.49,
		.52,
		.46,
		.54,
		.5
	]
];
function offsetWeight(value, delta) {
	return Math.max(0, Math.min(1, Math.round((value + delta) * 1e3) / 1e3));
}
function buildBaseRows() {
	return Array.from({ length: TARGET_BASE_ROW_COUNT }, (_, index) => {
		const [section, q1, q2, q3, q4, q5] = MOCK_SEEDS[index % MOCK_SEEDS.length];
		const cycle = Math.floor(index / MOCK_SEEDS.length);
		const drift = (index % 7 - 3) * .009 + cycle * .006;
		const values = [
			offsetWeight(q1, drift),
			offsetWeight(q2, drift * .7),
			offsetWeight(q3, -drift * .45),
			offsetWeight(q4, drift * .55),
			offsetWeight(q5, -drift * .3)
		];
		const avgWeight = Number(((values[0] + values[1] + values[2] + values[3] + values[4]) / 5).toFixed(3));
		const submitted = new Date(Date.UTC(2026, 2, 15, 16, 0 - index * 3, 0)).toISOString();
		return {
			_id: `mock-seed-${String(index + 1)}`,
			_type: "userResponseV4",
			section,
			q1: values[0],
			q2: values[1],
			q3: values[2],
			q4: values[3],
			q5: values[4],
			avgWeight,
			submittedAt: submitted,
			_createdAt: submitted,
			_updatedAt: submitted
		};
	});
}
var BASE_ROWS = buildBaseRows();
var STUDENT_SECTIONS = new Set(STUDENT_IDS);
var STAFF_SECTIONS = new Set(STAFF_IDS);
var surveySubscribers = /* @__PURE__ */ new Set();
var sortNewestFirst = (a, b) => Date.parse(b.submittedAt) - Date.parse(a.submittedAt);
var clamp01$2 = (v) => typeof v === "number" ? Math.max(0, Math.min(1, v)) : void 0;
var round3$1 = (v) => typeof v === "number" ? Math.round(v * 1e3) / 1e3 : void 0;
var computeAvg$1 = (weights) => {
	const vals = [
		weights.q1,
		weights.q2,
		weights.q3,
		weights.q4,
		weights.q5
	].filter((x) => Number.isFinite(x));
	if (!vals.length) return void 0;
	return vals.reduce((a, b) => a + b, 0) / vals.length;
};
function isMockRow(value) {
	if (!value || typeof value !== "object") return false;
	const record = value;
	return typeof record._id === "string" && record._type === "userResponseV4" && typeof record._createdAt === "string" && typeof record.section === "string";
}
function readStoredRows() {
	if (typeof window === "undefined") return [];
	try {
		const raw = sessionStorage.getItem(MOCK_STORAGE_KEY);
		const parsed = raw ? JSON.parse(raw) : [];
		return Array.isArray(parsed) ? parsed.filter(isMockRow) : [];
	} catch {
		return [];
	}
}
function writeStoredRows(rows) {
	if (typeof window === "undefined") return;
	try {
		sessionStorage.setItem(MOCK_STORAGE_KEY, JSON.stringify(rows));
	} catch (error) {
		console.warn("[mockData] Failed to persist mock rows:", error);
	}
}
function allRows() {
	return [...BASE_ROWS, ...readStoredRows()].sort(sortNewestFirst);
}
function filterRows(section, limit) {
	let rows = allRows();
	if (section && section !== "all") if (section === "all-massart") rows = rows.filter((row) => NON_VISITOR_MASSART.includes(row.section));
	else if (section === "all-students") rows = rows.filter((row) => STUDENT_SECTIONS.has(row.section));
	else if (section === "all-staff") rows = rows.filter((row) => STAFF_SECTIONS.has(row.section));
	else rows = rows.filter((row) => row.section === section);
	return rows.slice(0, limit).map(normalizeSurveyRow);
}
function notifyAllSubscribers() {
	surveySubscribers.forEach(({ section, limit, onData }) => {
		onData(filterRows(section, limit));
	});
}
function subscribeMockSurveyData({ section, limit = 300, onData }) {
	const subscriber = {
		section,
		limit,
		onData
	};
	surveySubscribers.add(subscriber);
	const timer = window.setTimeout(() => {
		onData(filterRows(section, limit));
	}, 0);
	return () => {
		window.clearTimeout(timer);
		surveySubscribers.delete(subscriber);
	};
}
function createMockUserResponse(section, weights) {
	const clamped = {
		q1: round3$1(clamp01$2(weights.q1)),
		q2: round3$1(clamp01$2(weights.q2)),
		q3: round3$1(clamp01$2(weights.q3)),
		q4: round3$1(clamp01$2(weights.q4)),
		q5: round3$1(clamp01$2(weights.q5))
	};
	const now = (/* @__PURE__ */ new Date()).toISOString();
	const avgWeight = round3$1(computeAvg$1(clamped));
	const created = {
		_id: `mock-user-${String(Date.now())}`,
		_type: "userResponseV4",
		section,
		q1: clamped.q1 ?? .5,
		q2: clamped.q2 ?? .5,
		q3: clamped.q3 ?? .5,
		q4: clamped.q4 ?? .5,
		q5: clamped.q5 ?? .5,
		avgWeight: avgWeight ?? .5,
		submittedAt: now,
		_createdAt: now,
		_updatedAt: now
	};
	writeStoredRows([...readStoredRows(), created].sort(sortNewestFirst));
	notifyAllSubscribers();
	return created;
}
function updateMockSoloMessage(responseId, message) {
	const rows = readStoredRows();
	const index = rows.findIndex((row) => row._id === responseId);
	if (index < 0) throw new Error("Mock response not found");
	const trimmed = message.trim().replace(/\s+/g, " ");
	const updatedAt = (/* @__PURE__ */ new Date()).toISOString();
	const current = rows[index];
	const withoutMessage = { ...current };
	delete withoutMessage.soloMessage;
	delete withoutMessage.soloMessageUpdatedAt;
	const updated = trimmed ? {
		...current,
		soloMessage: trimmed,
		soloMessageUpdatedAt: updatedAt,
		_updatedAt: updatedAt
	} : {
		...withoutMessage,
		_updatedAt: updatedAt
	};
	rows[index] = updated;
	writeStoredRows(rows.sort(sortNewestFirst));
	notifyAllSubscribers();
	return {
		_id: updated._id,
		soloMessage: updated.soloMessage,
		soloMessageUpdatedAt: updated.soloMessageUpdatedAt
	};
}
//#endregion
//#region src/client-api/response-api/writeApi.ts
var WriteApiError = class extends Error {
	constructor(endpoint, message, status, code, resetAt) {
		super(message);
		this.name = "WriteApiError";
		this.endpoint = endpoint;
		this.status = status;
		this.code = code;
		this.resetAt = resetAt;
	}
};
function makeRandomId() {
	if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") return crypto.randomUUID();
	return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
}
var EDIT_TOKEN_PATTERN = /^[a-zA-Z0-9_-]{32,128}$/;
function isWriteApiEditToken(value) {
	return typeof value === "string" && EDIT_TOKEN_PATTERN.test(value.trim());
}
function makeWriteApiEditToken() {
	if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") return crypto.randomUUID().replace(/-/g, "");
	if (typeof crypto !== "undefined" && typeof crypto.getRandomValues === "function") {
		const bytes = new Uint8Array(24);
		crypto.getRandomValues(bytes);
		return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
	}
	return [
		makeRandomId(),
		makeRandomId(),
		makeRandomId()
	].join("-").replace(/[^a-zA-Z0-9_-]/g, "").slice(0, 128);
}
function getClientId() {
	if (typeof window === "undefined") return makeRandomId();
	const key = "be.clientId";
	try {
		const existing = window.localStorage.getItem(key);
		if (existing) return existing;
		const next = makeRandomId();
		window.localStorage.setItem(key, next);
		return next;
	} catch {
		return makeRandomId();
	}
}
function readApiErrorBody(value) {
	if (!value || typeof value !== "object") return {};
	const record = value;
	return {
		error: typeof record.error === "string" ? record.error : void 0,
		code: typeof record.code === "string" ? record.code : void 0,
		resetAt: typeof record.resetAt === "string" ? record.resetAt : void 0
	};
}
function makeWriteApiError(endpoint, status, body, fallbackMessage) {
	const apiError = readApiErrorBody(body);
	return new WriteApiError(endpoint, apiError.error ?? fallbackMessage, status, apiError.code, apiError.resetAt);
}
//#endregion
//#region src/client-api/response-api/saveUserResponse.ts
var clamp01$1 = (v) => typeof v === "number" ? Math.max(0, Math.min(1, v)) : void 0;
var round3 = (v) => typeof v === "number" ? Math.round(v * 1e3) / 1e3 : void 0;
var computeAvg = (weights) => {
	const vals = [
		weights.q1,
		weights.q2,
		weights.q3,
		weights.q4,
		weights.q5
	].filter((x) => Number.isFinite(x));
	if (!vals.length) return void 0;
	return vals.reduce((a, b) => a + b, 0) / vals.length;
};
function normalizeWeights(weights) {
	return {
		q1: round3(clamp01$1(weights.q1)),
		q2: round3(clamp01$1(weights.q2)),
		q3: round3(clamp01$1(weights.q3)),
		q4: round3(clamp01$1(weights.q4)),
		q5: round3(clamp01$1(weights.q5))
	};
}
function isSavedUserResponse(value) {
	if (!value || typeof value !== "object") return false;
	return typeof value._id === "string";
}
function ensureUserResponseEditToken() {
	const existing = getSessionItem("be.myEditToken");
	if (isWriteApiEditToken(existing)) return existing;
	const next = makeWriteApiEditToken();
	setSessionItem("be.myEditToken", next);
	return next;
}
function beginUserResponseEditSession() {
	const next = makeWriteApiEditToken();
	setSessionItem("be.myEditToken", next);
	return next;
}
function shouldFallbackToMockWrite(error) {
	return error instanceof WriteApiError && error.code === "SANITY_WRITE_UNAVAILABLE";
}
function createOptimisticUserResponse(section, weights) {
	const clamped = normalizeWeights(weights);
	const submittedAt = (/* @__PURE__ */ new Date()).toISOString();
	const avgWeight = round3(computeAvg(clamped)) ?? .5;
	return {
		_id: `pending-${makeRandomId()}`,
		section,
		q1: clamped.q1 ?? .5,
		q2: clamped.q2 ?? .5,
		q3: clamped.q3 ?? .5,
		q4: clamped.q4 ?? .5,
		q5: clamped.q5 ?? .5,
		avgWeight,
		submittedAt
	};
}
function savedUserResponseToSurveyRow(response, fallbackSection) {
	const submittedAt = response.submittedAt ?? (/* @__PURE__ */ new Date()).toISOString();
	const q1 = response.q1 ?? .5;
	const q2 = response.q2 ?? .5;
	const q3 = response.q3 ?? .5;
	const q4 = response.q4 ?? .5;
	const q5 = response.q5 ?? .5;
	return {
		_id: response._id,
		section: response.section ?? fallbackSection,
		q1,
		q2,
		q3,
		q4,
		q5,
		avgWeight: response.avgWeight,
		soloMessage: response.soloMessage,
		soloMessageUpdatedAt: response.soloMessageUpdatedAt,
		submittedAt: response.submittedAt ?? submittedAt,
		_createdAt: submittedAt,
		weights: {
			question1: q1,
			question2: q2,
			question3: q3,
			question4: q4,
			question5: q5
		}
	};
}
function persistUserResponseSession(created, section) {
	if (typeof window === "undefined") return;
	try {
		setSessionItem("be.myEntryId", created._id);
		setSessionItem("be.mySection", section);
		setSessionItem("be.justSubmitted", "1");
	} catch (err) {
		console.warn("[saveUserResponse] Failed to persist identity to browser storage:", err);
	}
	try {
		const snapshot = {
			_id: created._id,
			section,
			q1: created.q1,
			q2: created.q2,
			q3: created.q3,
			q4: created.q4,
			q5: created.q5,
			avgWeight: created.avgWeight,
			soloMessage: created.soloMessage,
			soloMessageUpdatedAt: created.soloMessageUpdatedAt,
			submittedAt: created.submittedAt
		};
		setSessionItem("be.myDoc", JSON.stringify(snapshot));
	} catch (err) {
		console.warn("[saveUserResponse] Failed to persist snapshot to browser storage:", err);
	}
}
async function saveUserResponse(section, weights) {
	const clamped = normalizeWeights(weights);
	let created;
	if (shouldUseMockReads()) created = createMockUserResponse(section, clamped);
	else try {
		created = await saveUserResponseViaApi(section, clamped);
	} catch (error) {
		if (!shouldFallbackToMockWrite(error)) throw error;
		enableMockReadFallback(error);
		created = createMockUserResponse(section, clamped);
	}
	persistUserResponseSession(created, section);
	return created;
}
async function saveUserResponseViaApi(section, weights) {
	return await postSaveUserResponse({
		section,
		weights,
		clientId: getClientId(),
		website: "",
		clientRequestId: makeRandomId(),
		editToken: ensureUserResponseEditToken()
	});
}
async function postSaveUserResponse(payload) {
	const res = await fetch("/api/save-user-response", {
		method: "POST",
		keepalive: true,
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(payload)
	});
	const json = await res.json().catch(() => null);
	if (!res.ok) throw makeWriteApiError("save-user-response", res.status, json, `Write API request failed with status ${String(res.status)}`);
	if (!isSavedUserResponse(json)) throw new Error("Write API returned an invalid response");
	return json;
}
//#endregion
//#region src/lib/posthog.ts
var initPromise = null;
function loadPostHog() {
	const key = "phc_CVpvbmV889bdHeiggiVf7jqhvhqyMSMfegSUQSXiby9F";
	return import("posthog-js").then((mod) => {
		mod.default.init(key, {
			api_host: "https://us.i.posthog.com",
			person_profiles: "identified_only",
			capture_pageview: true,
			capture_pageleave: true,
			autocapture: false,
			disable_session_recording: true,
			enable_heatmaps: false,
			disable_surveys: true,
			disable_web_experiments: true
		});
		return mod.default;
	});
}
function initPostHog() {
	initPromise ?? (initPromise = loadPostHog().catch((error) => {
		console.warn("[posthog] init failed:", error);
		return null;
	}));
	return initPromise;
}
function track(event) {
	initPostHog().then((client) => {
		client?.capture(event.name, event.props);
	});
}
//#endregion
//#region src/onboarding/index.tsx
var RoleStep = React.lazy(() => import("./assets/role-step-CP3YkDzP.mjs"));
var CanvasInfo = React.lazy(() => import("./assets/canvas-info-C_JAkrKJ.mjs"));
var SectionPickerIntro = React.lazy(() => import("./assets/section-picker-0Ig7B2l-.mjs"));
function Survey({ onAnswersUpdate }) {
	const { setAnimationVisible } = useUiFlow();
	const [stage, setStage] = useState("role");
	const [audience, setAudience] = useState("visitor");
	const [surveySection, setSurveySection] = useState("");
	const [error, setError] = useState("");
	const [submitting, setSubmitting] = useState(false);
	const [fadeState, setFadeState] = useState("fade-in");
	const [introActive, setIntroActive] = useState(true);
	const shouldScrollToSectionRef = useRef(false);
	const [finished, setFinished] = useState(false);
	const prevCompletedRef = useRef(false);
	const { setSurveyActive, setHasCompletedSurvey, observerMode, openGraph, closeGraph, hasCompletedSurvey, setQuestionnaireOpen, setSectionOpen, surveyResetKey, resetToStart } = useUiFlow();
	const { section, setSection, counts, upsertLocalSurveyRow } = useSurveyData();
	const { setMySection, setMyEntryId, setMyRole } = useIdentity();
	const { setLiveAvg } = useCanvasRuntime();
	useEffect(() => {
		setQuestionnaireOpen(stage === "questions" && !observerMode && !finished);
	}, [
		stage,
		observerMode,
		finished,
		setQuestionnaireOpen
	]);
	useEffect(() => {
		if (stage !== "section") setSectionOpen(false);
		return () => {
			setSectionOpen(false);
		};
	}, [stage, setSectionOpen]);
	useEffect(() => {
		if (stage !== "section" || !shouldScrollToSectionRef.current) return;
		shouldScrollToSectionRef.current = false;
		const scrollToSection = () => {
			const target = document.querySelector(".survey-step.section-select");
			if (!(target instanceof HTMLElement)) return;
			target.scrollIntoView({
				behavior: "smooth",
				block: "start"
			});
		};
		const rafId = window.requestAnimationFrame(() => {
			window.setTimeout(scrollToSection, 40);
		});
		return () => {
			window.cancelAnimationFrame(rafId);
		};
	}, [stage]);
	useEffect(() => {
		const timer = window.setTimeout(() => {
			setIntroActive(false);
		}, 520);
		return () => {
			window.clearTimeout(timer);
		};
	}, []);
	useEffect(() => {
		if (observerMode) {
			setSurveyActive(false);
			if (!section) setSection("fine-arts");
			openGraph();
		}
	}, [
		observerMode,
		section,
		setSection,
		openGraph,
		setSurveyActive
	]);
	useEffect(() => {
		if (prevCompletedRef.current && !hasCompletedSurvey) {
			setStage("role");
			setAudience("visitor");
			setSurveySection("");
			setError("");
			setSubmitting(false);
			setFinished(false);
			setFadeState("fade-in");
			setQuestionnaireOpen(false);
			setSectionOpen(false);
			setAnimationVisible(false);
		}
		prevCompletedRef.current = hasCompletedSurvey;
	}, [
		hasCompletedSurvey,
		setAnimationVisible,
		setQuestionnaireOpen,
		setSectionOpen
	]);
	const prevResetKeyRef = useRef(surveyResetKey);
	useEffect(() => {
		if (surveyResetKey === prevResetKeyRef.current) return;
		prevResetKeyRef.current = surveyResetKey;
		setStage("role");
		setAudience("visitor");
		setSurveySection("");
		setError("");
		setSubmitting(false);
		setFinished(false);
		setFadeState("fade-in");
		setQuestionnaireOpen(false);
		setSectionOpen(false);
		setAnimationVisible(false);
	}, [
		surveyResetKey,
		setAnimationVisible,
		setQuestionnaireOpen,
		setSectionOpen
	]);
	const transitionTo = (next, side) => {
		setFadeState("fade-out");
		setTimeout(() => {
			side?.();
			setStage(next);
			setFadeState("fade-in");
		}, 70);
	};
	const availableSections = useMemo(() => {
		if (!audience || audience === "visitor") return [];
		const toOption = (sectionOption) => ({
			type: "option",
			value: sectionOption.value,
			label: sectionOption.label,
			aliases: sectionOption.aliases
		});
		if (audience === "student") return ROLE_SECTIONS.student.map(toOption);
		const studentOptions = ROLE_SECTIONS.student.map(toOption);
		return [
			{
				type: "header",
				id: "staff",
				label: "Institutional departments"
			},
			...ROLE_SECTIONS.staff.map(toOption),
			{
				type: "header",
				id: "student",
				label: "Student departments"
			},
			...studentOptions
		];
	}, [audience]);
	const handleRoleNext = () => {
		const savedEntryId = getSessionItem("be.myEntryId");
		const savedSection = getSessionItem("be.mySection");
		if (savedEntryId && savedSection) {
			showDuplicateSurveyNotice();
			resetToStart();
			return;
		}
		if (!audience) {
			setError("Choose whether you are Student, Staff, or Visitor.");
			return;
		}
		setError("");
		track({
			name: "Role Selected",
			props: { role: audience }
		});
		if (audience === "visitor") {
			track({
				name: "Survey Started",
				props: { role: audience }
			});
			transitionTo("questions", () => {
				setSurveySection("visitor");
				setAnimationVisible(false);
			});
			return;
		}
		shouldScrollToSectionRef.current = true;
		transitionTo("section", () => {
			setSurveySection("");
		});
	};
	const handleBeginFromSection = () => {
		if (!surveySection) {
			setError("Select your section.");
			return;
		}
		setError("");
		track({
			name: "Section Selected",
			props: {
				section: surveySection,
				role: audience
			}
		});
		track({
			name: "Survey Started",
			props: { role: audience }
		});
		transitionTo("questions", () => {
			setAnimationVisible(false);
		});
	};
	function answersToWeights(answers) {
		const getVal = (i) => {
			const id = BUTTON_QUESTIONS[i]?.id;
			const v = id ? answers[id] : void 0;
			return typeof v === "number" && Number.isFinite(v) ? v : void 0;
		};
		return {
			q1: getVal(0),
			q2: getVal(1),
			q3: getVal(2),
			q4: getVal(3),
			q5: getVal(4)
		};
	}
	const handleSubmitFromQuestions = async (answers) => {
		if (submitting) return;
		const savedEntryId = getSessionItem("be.myEntryId");
		const savedSection = getSessionItem("be.mySection");
		if (savedEntryId && savedSection) {
			showDuplicateSurveyNotice();
			resetToStart();
			return;
		}
		setSubmitting(true);
		setError("");
		setFinished(true);
		setQuestionnaireOpen(false);
		const weights = answersToWeights(answers);
		const avgValues = Object.values(answers).filter((v) => typeof v === "number" && Number.isFinite(v));
		if (avgValues.length > 0) {
			const finalAvg = avgValues.reduce((s, v) => s + v, 0) / avgValues.length;
			setLiveAvg(finalAvg);
			setSessionItem("be.myAvg", String(finalAvg));
		}
		beginUserResponseEditSession();
		const optimistic = createOptimisticUserResponse(surveySection, weights);
		const optimisticRow = savedUserResponseToSurveyRow(optimistic, surveySection);
		const sectionCountBeforeSubmit = counts[surveySection] ?? 0;
		const parentAggregate = parentAggregateForSection(surveySection);
		const postSubmitSection = parentAggregate && sectionCountBeforeSubmit === 0 ? parentAggregate : surveySection;
		persistUserResponseSession(optimistic, surveySection);
		upsertLocalSurveyRow(optimisticRow);
		setSection(postSubmitSection);
		setMySection(surveySection);
		setMyEntryId(optimistic._id);
		setMyRole(audience || null);
		setHasCompletedSurvey(true);
		openGraph();
		setSurveyActive(false);
		setAnimationVisible(true);
		if (audience) setSessionItem("be.myRole", audience);
		try {
			const created = await saveUserResponse(surveySection, weights);
			upsertLocalSurveyRow(savedUserResponseToSurveyRow(created, surveySection), optimistic._id);
			setSection(postSubmitSection);
			setMySection(surveySection);
			setMyEntryId(created._id);
			setMyRole(audience || null);
			track({
				name: "Survey Completed",
				props: {
					section: surveySection,
					role: audience
				}
			});
		} catch (err) {
			console.error("[Survey] submit error:", err);
			const submitErrorMessage = err instanceof WriteApiError ? err.code === "RATE_LIMITED" ? "Too many submissions from this network. Please wait a moment and try again." : err.code === "INVALID_SURVEY_RESPONSE" ? "One of the selected answers could not be saved. Please adjust your answer and try again." : `We could not save your response. (${String(err.code ?? err.status)})` : "We could not save your response. Please try again.";
			if (err instanceof WriteApiError && err.code === "RATE_LIMITED") showRateLimitNotice({
				message: submitErrorMessage,
				resetAt: err.resetAt
			});
			removeSessionItems([
				"be.myEntryId",
				"be.mySection",
				"be.myRole",
				"be.myEditToken",
				"be.justSubmitted",
				"be.myDoc",
				"be.openPersonalOnNext"
			]);
			setFinished(false);
			closeGraph();
			setMyEntryId(null);
			setMySection(null);
			setMyRole(null);
			setHasCompletedSurvey(false);
			setSurveyActive(true);
			setQuestionnaireOpen(true);
			setAnimationVisible(false);
			setError(submitErrorMessage);
		} finally {
			setSubmitting(false);
		}
	};
	const handleAudienceChange = (role) => {
		setAudience(role);
		setError("");
		const allowed = role === "staff" ? [...ROLE_SECTIONS.student, ...ROLE_SECTIONS.staff].map((sectionOption) => sectionOption.value) : role === "student" ? ROLE_SECTIONS.student.map((sectionOption) => sectionOption.value) : [];
		setSurveySection((prev) => allowed.includes(prev) ? prev : role === "visitor" ? "visitor" : "");
	};
	const handleSectionChange = (val) => {
		setSurveySection(val);
		setError("");
	};
	if (hasCompletedSurvey && !observerMode) return null;
	return /* @__PURE__ */ jsx("div", {
		className: `survey-section ${fadeState} ${introActive ? "survey-first-enter" : ""}`,
		children: !observerMode && /* @__PURE__ */ jsxs(Suspense, {
			fallback: null,
			children: [
				stage === "role" && /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsx(RoleStep, {
					value: audience,
					onChange: handleAudienceChange,
					onNext: handleRoleNext,
					error
				}), /* @__PURE__ */ jsx(CanvasInfo, {})] }),
				stage === "section" && /* @__PURE__ */ jsx(SectionPickerIntro, {
					value: surveySection,
					onChange: handleSectionChange,
					onBegin: handleBeginFromSection,
					error,
					sections: availableSections,
					placeholderOverride: audience === "student" ? "Your Major..." : void 0,
					titleOverride: audience === "student" ? "Select Your Major" : void 0,
					onOpenChange: setSectionOpen
				}),
				stage === "questions" && !finished && /* @__PURE__ */ jsx(ButtonQuestionnaireFlow, {
					onAnswersUpdate,
					onSubmit: (answers) => {
						handleSubmitFromQuestions(answers);
					},
					submitting
				})
			]
		})
	});
}
//#endregion
//#region src/navigation/left/logo.tsx
var Logo = () => {
	const { resetToStart } = useUiFlow();
	return /* @__PURE__ */ jsx("button", {
		type: "button",
		className: "logo-divider",
		"aria-label": "Back to home",
		onClick: resetToStart,
		children: /* @__PURE__ */ jsx("span", {
			className: "logo-text",
			children: "be"
		})
	});
};
//#endregion
//#region src/navigation/left/nav-left.tsx
function NavLeft({ introActive = false }) {
	return /* @__PURE__ */ jsx("div", {
		className: `left${introActive ? " nav-first-enter" : ""}`,
		children: /* @__PURE__ */ jsx(Logo, {})
	});
}
//#endregion
//#region src/assets/svg/theme/dark_mode.svg?raw
var dark_mode_default = "<svg width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\">\r\n<mask id=\"mask0_9_127\" style=\"mask-type:alpha\" maskUnits=\"userSpaceOnUse\" x=\"0\" y=\"0\" width=\"24\" height=\"24\">\r\n<rect width=\"24\" height=\"24\" fill=\"#D9D9D9\"/>\r\n</mask>\r\n<g mask=\"url(#mask0_9_127)\">\r\n<path d=\"M12.0287 20.5C9.66774 20.5 7.66083 19.6736 6.00799 18.0207C4.35533 16.3681 3.52899 14.3611 3.52899 12C3.52899 9.73714 4.29658 7.79647 5.83174 6.17797C7.36691 4.55931 9.24666 3.68264 11.471 3.54797C11.6147 3.54797 11.7557 3.55314 11.8942 3.56347C12.0326 3.57381 12.1684 3.58922 12.3017 3.60972C11.7916 4.08656 11.3852 4.66281 11.0827 5.33847C10.7801 6.01414 10.6287 6.73464 10.6287 7.49997C10.6287 9.13881 11.2024 10.5319 12.3497 11.6792C13.4969 12.8264 14.8899 13.4 16.5287 13.4C17.3044 13.4 18.0275 13.2487 18.698 12.9462C19.3685 12.6436 19.939 12.2371 20.4095 11.727C20.43 11.8603 20.4454 11.9962 20.4557 12.1347C20.4659 12.2731 20.471 12.4141 20.471 12.5577C20.3428 14.7821 19.4695 16.6618 17.851 18.197C16.2323 19.7323 14.2916 20.5 12.0287 20.5ZM12.0287 19C13.4954 19 14.8121 18.5958 15.9787 17.7875C17.1454 16.9791 17.9954 15.925 18.5287 14.625C18.1954 14.7083 17.8621 14.775 17.5287 14.825C17.1954 14.875 16.8621 14.9 16.5287 14.9C14.4787 14.9 12.7329 14.1791 11.2912 12.7375C9.84957 11.2958 9.12874 9.54997 9.12874 7.49997C9.12874 7.16664 9.15374 6.83331 9.20374 6.49997C9.25374 6.16664 9.32041 5.83331 9.40374 5.49997C8.10374 6.03331 7.04957 6.88331 6.24124 8.04997C5.43291 9.21664 5.02874 10.5333 5.02874 12C5.02874 13.9333 5.71207 15.5833 7.07874 16.95C8.44541 18.3166 10.0954 19 12.0287 19Z\" fill=\"#1C1B1F\"/>\r\n</g>\r\n</svg>\r\n";
//#endregion
//#region src/assets/svg/theme/light_mode.svg?raw
var light_mode_default = "<svg width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\">\r\n<mask id=\"mask0_9_115\" style=\"mask-type:alpha\" maskUnits=\"userSpaceOnUse\" x=\"0\" y=\"0\" width=\"24\" height=\"24\">\r\n<rect width=\"24\" height=\"24\" fill=\"#D9D9D9\"/>\r\n</mask>\r\n<g mask=\"url(#mask0_9_115)\">\r\n<path d=\"M14.125 14.125C14.7083 13.5417 15 12.8333 15 12C15 11.1667 14.7083 10.4583 14.125 9.875C13.5417 9.29167 12.8333 9 12 9C11.1667 9 10.4583 9.29167 9.875 9.875C9.29167 10.4583 9 11.1667 9 12C9 12.8333 9.29167 13.5417 9.875 14.125C10.4583 14.7083 11.1667 15 12 15C12.8333 15 13.5417 14.7083 14.125 14.125ZM8.8135 15.1865C7.93783 14.3108 7.5 13.2487 7.5 12C7.5 10.7513 7.93783 9.68917 8.8135 8.8135C9.68917 7.93783 10.7513 7.5 12 7.5C13.2487 7.5 14.3108 7.93783 15.1865 8.8135C16.0622 9.68917 16.5 10.7513 16.5 12C16.5 13.2487 16.0622 14.3108 15.1865 15.1865C14.3108 16.0622 13.2487 16.5 12 16.5C10.7513 16.5 9.68917 16.0622 8.8135 15.1865ZM5 12.75H1.25V11.25H5V12.75ZM22.75 12.75H19V11.25H22.75V12.75ZM11.25 5V1.25H12.75V5H11.25ZM11.25 22.75V19H12.75V22.75H11.25ZM6.573 7.577L4.23075 5.3155L5.2905 4.20575L7.54625 6.523L6.573 7.577ZM18.7095 19.7943L16.4385 17.4615L17.427 16.423L19.7693 18.6845L18.7095 19.7943ZM16.423 6.573L18.6845 4.23075L19.7943 5.2905L17.477 7.54625L16.423 6.573ZM4.20575 18.7095L6.5385 16.4385L7.55775 17.427L5.30575 19.7788L4.20575 18.7095Z\" fill=\"#1C1B1F\"/>\r\n</g>\r\n</svg>\r\n";
//#endregion
//#region src/assets/svg/theme/ThemeIcon.tsx
function ThemeIcon({ mode, className = "ui-icon" }) {
	const iconId = useId().replace(/:/g, "");
	const markup = useMemo(() => {
		return prepareRawSvgMarkup(mode === "dark" ? dark_mode_default : light_mode_default, `theme-${mode}-${iconId}`, className);
	}, [
		className,
		iconId,
		mode
	]);
	return /* @__PURE__ */ jsx("span", {
		"aria-hidden": "true",
		style: RAW_SVG_WRAPPER_STYLE,
		dangerouslySetInnerHTML: { __html: markup }
	});
}
//#endregion
//#region src/navigation/right/color-toggle.tsx
function ColorToggle() {
	const { darkMode, setDarkMode } = usePreferences();
	const textRef = useRef(darkMode ? "Dark mode" : "Light mode");
	useEffect(() => {
		textRef.current = darkMode ? "Dark mode" : "Light mode";
	}, [darkMode]);
	const toggle = (e) => {
		e.preventDefault();
		e.stopPropagation();
		setDarkMode(!darkMode);
		textRef.current = !darkMode ? "Dark mode" : "Light mode";
	};
	const onKeyDown = (e) => {
		if (e.key === "Enter" || e.key === " ") toggle(e);
	};
	return /* @__PURE__ */ jsx("button", {
		type: "button",
		"aria-label": darkMode ? "Switch to light mode" : "Switch to dark mode",
		onClick: toggle,
		onKeyDown,
		className: `svg-lg system-color${darkMode ? " is-dark" : ""}`,
		children: /* @__PURE__ */ jsx(ThemeIcon, { mode: darkMode ? "light" : "dark" })
	});
}
//#endregion
//#region src/navigation/gp-data.ts
var SPECIAL_SECTIONS = [
	{
		id: "all",
		label: "Everyone"
	},
	{
		id: "visitor",
		label: "Explorers"
	},
	{
		id: "all-massart",
		label: "MassArt "
	},
	{
		id: "all-students",
		label: "All Students"
	},
	{
		id: "all-staff",
		label: "All Faculty/Staff"
	}
];
var CHOOSE_STUDENT = "__choose-student";
var CHOOSE_STAFF = "__choose-staff";
var GO_BACK = "__go-back";
var STUDENT_UMBRELLA_OPTIONS = [
	{
		id: "fine-arts",
		label: "Fine Arts"
	},
	{
		id: "design",
		label: "Design"
	},
	{
		id: "foundations",
		label: "Foundations"
	}
];
function titleFromId(id) {
	if (!id) return "";
	return id.replace(/-/g, " ").replace(/\b\w/g, (m) => m.toUpperCase());
}
function useGraphPickerData(value) {
	const { counts } = useSurveyData();
	const { mySection } = useIdentity();
	const BASE_STUDENT = useMemo(() => {
		const base = ROLE_SECTIONS.student.map((section) => ({
			id: section.value,
			label: section.label
		}));
		const have = new Set(base.map((option) => option.id));
		STUDENT_UMBRELLA_OPTIONS.forEach((option) => {
			if (!have.has(option.id)) base.push(option);
		});
		return base;
	}, []);
	const BASE_STAFF = useMemo(() => ROLE_SECTIONS.staff.map((section) => ({
		id: section.value,
		label: section.label
	})), []);
	const ALL_LABELS = useMemo(() => {
		const list = [
			...SPECIAL_SECTIONS,
			...BASE_STUDENT,
			...BASE_STAFF
		];
		const map = new Map(list.map((option) => [option.id, option.label]));
		[value, mySection].forEach((id) => {
			if (id && !map.has(id)) map.set(id, titleFromId(id));
		});
		return map;
	}, [
		BASE_STUDENT,
		BASE_STAFF,
		value,
		mySection
	]);
	const sortByCountThenAlpha = useCallback((items) => [...items].sort((a, b) => {
		const cb = counts[b.id] ?? 0;
		const ca = counts[a.id] ?? 0;
		if (cb !== ca) return cb - ca;
		return a.label.localeCompare(b.label, void 0, { sensitivity: "base" });
	}), [counts]);
	const STUDENT_OPTS = useMemo(() => sortByCountThenAlpha(BASE_STUDENT), [BASE_STUDENT, sortByCountThenAlpha]);
	const STAFF_OPTS = useMemo(() => sortByCountThenAlpha(BASE_STAFF), [BASE_STAFF, sortByCountThenAlpha]);
	const MAIN_OPTS = useMemo(() => [
		...SPECIAL_SECTIONS,
		{
			id: CHOOSE_STUDENT,
			label: "Student Departments"
		},
		{
			id: CHOOSE_STAFF,
			label: "Institutional Departments"
		}
	], []);
	const studentIdSet = useMemo(() => new Set(BASE_STUDENT.map((section) => section.id)), [BASE_STUDENT]);
	const staffIdSet = useMemo(() => new Set(BASE_STAFF.map((section) => section.id)), [BASE_STAFF]);
	return {
		yourIdsSet: useMemo(() => {
			const ids = /* @__PURE__ */ new Set();
			if (!mySection) return ids;
			ids.add(mySection);
			if (studentIdSet.has(mySection)) ids.add("all-students");
			if (staffIdSet.has(mySection)) ids.add("all-staff");
			return ids;
		}, [
			mySection,
			staffIdSet,
			studentIdSet
		]),
		ALL_LABELS,
		STUDENT_OPTS,
		STAFF_OPTS,
		MAIN_OPTS,
		studentIdSet,
		staffIdSet,
		counts
	};
}
//#endregion
//#region src/assets/svg/expand/expand_all.svg?raw
var expand_all_default = "<svg width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\">\r\n<mask id=\"mask0_5_19\" style=\"mask-type:alpha\" maskUnits=\"userSpaceOnUse\" x=\"0\" y=\"0\" width=\"24\" height=\"24\">\r\n<rect width=\"24\" height=\"24\" fill=\"#D9D9D9\"/>\r\n</mask>\r\n<g mask=\"url(#mask0_5_19)\">\r\n<path d=\"M12 21.6538L6.34625 16L7.4155 14.9308L12 19.4963L16.5845 14.9308L17.6538 16L12 21.6538ZM7.43075 9.05375L6.34625 8L12 2.34625L17.6538 8L16.5693 9.05375L12 4.50375L7.43075 9.05375Z\"/>\r\n</g>\r\n</svg>\r\n";
//#endregion
//#region src/assets/svg/expand/collapse_all.svg?raw
var collapse_all_default = "<svg width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\">\r\n<mask id=\"mask0_5_37\" style=\"mask-type:alpha\" maskUnits=\"userSpaceOnUse\" x=\"0\" y=\"0\" width=\"24\" height=\"24\">\r\n<rect width=\"24\" height=\"24\" fill=\"#D9D9D9\"/>\r\n</mask>\r\n<g mask=\"url(#mask0_5_37)\">\r\n<path d=\"M7.4 21.6538L6.34625 20.6L12 14.9463L17.6538 20.6L16.6 21.6538L12 17.0538L7.4 21.6538ZM12 9.05375L6.34625 3.4L7.4 2.34625L12 6.94625L16.6 2.34625L17.6538 3.4L12 9.05375Z\"/>\r\n</g>\r\n</svg>\r\n";
//#endregion
//#region src/assets/svg/expand/ExpandIcon.tsx
function ExpandIcon({ expanded = false, className = "ui-icon" }) {
	const iconId = useId().replace(/:/g, "");
	const markup = useMemo(() => {
		return prepareRawSvgMarkup(expanded ? collapse_all_default : expand_all_default, `expand-${iconId}`, className);
	}, [
		className,
		expanded,
		iconId
	]);
	return /* @__PURE__ */ jsx("span", {
		"aria-hidden": "true",
		style: RAW_SVG_WRAPPER_STYLE,
		dangerouslySetInnerHTML: { __html: markup }
	});
}
//#endregion
//#region src/navigation/graph-picker.tsx
function GraphPicker({ value = "all", onChange, onOpenChange }) {
	const { yourIdsSet, ALL_LABELS, STUDENT_OPTS, STAFF_OPTS, MAIN_OPTS, studentIdSet, staffIdSet, counts } = useGraphPickerData(value);
	const [open, setOpen] = useState(false);
	const [mode, setMode] = useState(null);
	const [activeIndex, setActiveIndex] = useState(0);
	const [placement, setPlacement] = useState("down");
	const wrapperRef = useRef(null);
	const buttonRef = useRef(null);
	const listRef = useRef(null);
	const VISIBLE_OPTS = useMemo(() => {
		if (mode === "student") return [{
			id: GO_BACK,
			label: "Back"
		}, ...STUDENT_OPTS];
		if (mode === "staff") return [{
			id: GO_BACK,
			label: "Back"
		}, ...STAFF_OPTS];
		return MAIN_OPTS;
	}, [
		mode,
		MAIN_OPTS,
		STUDENT_OPTS,
		STAFF_OPTS
	]);
	const triggerCoreLabel = useMemo(() => {
		if (open && mode === "student") return "Student Departments";
		if (open && mode === "staff") return "Institutional Departments";
		return ALL_LABELS.get(value) ?? "Everyone";
	}, [
		open,
		mode,
		value,
		ALL_LABELS
	]);
	const maxActiveIndex = Math.max(0, VISIBLE_OPTS.length - 1);
	const safeActiveIndex = Math.min(Math.max(activeIndex, 0), maxActiveIndex);
	const closePicker = useCallback(() => {
		setOpen(false);
		setMode(null);
	}, []);
	useEffect(() => {
		onOpenChange?.(open);
	}, [open, onOpenChange]);
	useEffect(() => {
		if (!open) return;
		const onDocPointerDown = (e) => {
			if (!wrapperRef.current?.contains(e.target)) closePicker();
		};
		document.addEventListener("pointerdown", onDocPointerDown, true);
		return () => {
			document.removeEventListener("pointerdown", onDocPointerDown, true);
		};
	}, [closePicker, open]);
	useEffect(() => {
		const computePlacement = () => {
			if (!buttonRef.current) return;
			const rect = buttonRef.current.getBoundingClientRect();
			setPlacement((window.innerHeight || document.documentElement.clientHeight) - rect.bottom >= Math.min(300, VISIBLE_OPTS.length * 44 + 12) ? "down" : "up");
		};
		if (open) computePlacement();
		const onWin = () => {
			if (open) computePlacement();
		};
		window.addEventListener("resize", onWin);
		window.addEventListener("scroll", onWin, true);
		return () => {
			window.removeEventListener("resize", onWin);
			window.removeEventListener("scroll", onWin, true);
		};
	}, [open, VISIBLE_OPTS.length]);
	useEffect(() => {
		if (!open) return;
		const el = listRef.current;
		if (!el) return;
		const stopProp = (e) => {
			e.stopPropagation();
		};
		el.addEventListener("wheel", stopProp, { passive: true });
		el.addEventListener("touchstart", stopProp, { passive: true });
		el.addEventListener("touchmove", stopProp, { passive: true });
		return () => {
			el.removeEventListener("wheel", stopProp);
			el.removeEventListener("touchstart", stopProp);
			el.removeEventListener("touchmove", stopProp);
		};
	}, [open]);
	const moveActive = useCallback((delta) => {
		setActiveIndex((idx) => (idx + delta + VISIBLE_OPTS.length) % VISIBLE_OPTS.length);
	}, [VISIBLE_OPTS.length]);
	const chooseIndex = useCallback((idx) => {
		if (idx < 0 || idx >= VISIBLE_OPTS.length) return;
		const opt = VISIBLE_OPTS[idx];
		if (opt.id === "__choose-student") {
			setMode("student");
			return;
		}
		if (opt.id === "__choose-staff") {
			setMode("staff");
			return;
		}
		if (opt.id === "__go-back") {
			setMode(null);
			return;
		}
		setMode(null);
		setOpen(false);
		onChange?.(opt.id);
		buttonRef.current?.focus();
	}, [VISIBLE_OPTS, onChange]);
	const onTriggerKeyDown = (e) => {
		if (e.key === "ArrowDown") {
			e.preventDefault();
			if (!open) setOpen(true);
			moveActive(1);
		} else if (e.key === "ArrowUp") {
			e.preventDefault();
			if (!open) setOpen(true);
			moveActive(-1);
		} else if (e.key === "Enter" || e.key === " ") {
			e.preventDefault();
			if (!open) setOpen(true);
			else chooseIndex(safeActiveIndex);
		} else if (e.key === "Escape") closePicker();
	};
	const onListKeyDown = (e) => {
		if (e.key === "ArrowDown") {
			e.preventDefault();
			moveActive(1);
		} else if (e.key === "ArrowUp") {
			e.preventDefault();
			moveActive(-1);
		} else if (e.key === "Home") {
			e.preventDefault();
			setActiveIndex(0);
		} else if (e.key === "End") {
			e.preventDefault();
			setActiveIndex(VISIBLE_OPTS.length - 1);
		} else if (e.key === "Enter" || e.key === " ") {
			e.preventDefault();
			chooseIndex(safeActiveIndex);
		} else if (e.key === "Escape") {
			e.preventDefault();
			closePicker();
			buttonRef.current?.focus();
		}
	};
	const listboxId = "listbox";
	return /* @__PURE__ */ jsxs("div", {
		ref: wrapperRef,
		className: "picker",
		children: [/* @__PURE__ */ jsxs("div", {
			ref: buttonRef,
			role: "combobox",
			"aria-haspopup": "listbox",
			"aria-owns": listboxId,
			"aria-expanded": open,
			"aria-controls": listboxId,
			"aria-activedescendant": VISIBLE_OPTS[safeActiveIndex] ? `opt-${VISIBLE_OPTS[safeActiveIndex].id}` : void 0,
			className: `trigger ${open ? "is-open" : ""}`,
			onClick: () => {
				if (open) closePicker();
				else setOpen(true);
			},
			onKeyDown: onTriggerKeyDown,
			tabIndex: 0,
			children: [/* @__PURE__ */ jsx("span", {
				className: "trigger-label",
				children: /* @__PURE__ */ jsx("h4", { children: triggerCoreLabel })
			}), /* @__PURE__ */ jsx("span", {
				className: "trigger-chevron",
				"aria-hidden": true,
				children: /* @__PURE__ */ jsx(ExpandIcon, {
					expanded: open,
					className: "section-chevron-svg ui-icon"
				})
			})]
		}), /* @__PURE__ */ jsx("div", {
			className: `listbox-shell ${placement === "down" ? "drop-down" : "drop-up"}${open ? " is-open" : ""}`,
			"aria-hidden": !open,
			children: /* @__PURE__ */ jsx("div", {
				className: "listbox-clip",
				children: /* @__PURE__ */ jsx("div", {
					ref: listRef,
					id: listboxId,
					role: "listbox",
					className: "listbox",
					tabIndex: -1,
					onKeyDown: onListKeyDown,
					children: VISIBLE_OPTS.map((opt, idx) => {
						const active = idx === safeActiveIndex;
						const isBack = opt.id === GO_BACK;
						const isChooser = opt.id === "__choose-student" || opt.id === "__choose-staff";
						const isStudentChooser = opt.id === CHOOSE_STUDENT;
						const isStaffChooser = opt.id === CHOOSE_STAFF;
						const showCount = !(isBack || isChooser);
						const n = counts[opt.id] ?? 0;
						const isPersonal = yourIdsSet.has(opt.id);
						const countLabel = `${String(n)} ${n === 1 ? "person" : "people"}`;
						return /* @__PURE__ */ jsx("div", {
							id: `opt-${opt.id}`,
							role: "option",
							"aria-selected": value === opt.id,
							className: `option${active ? " is-active" : ""}${value === opt.id ? " is-selected" : ""}${isStudentChooser ? " option--student-chooser" : ""}${isStaffChooser ? " option--staff-chooser" : ""}${isBack ? " option--back" : ""}`,
							onMouseEnter: () => {
								setActiveIndex(idx);
							},
							onMouseDown: (e) => {
								e.preventDefault();
							},
							onClick: () => {
								chooseIndex(idx);
							},
							children: isBack ? /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsx("span", {
								className: "back-icon",
								"aria-hidden": true,
								children: /* @__PURE__ */ jsx("svg", {
									className: "ui-icon",
									viewBox: "0 0 24 24",
									fill: "none",
									stroke: "currentColor",
									strokeWidth: "2",
									strokeLinecap: "round",
									strokeLinejoin: "round",
									children: /* @__PURE__ */ jsx("path", { d: "M15 18L9 12L15 6" })
								})
							}), /* @__PURE__ */ jsx("span", {
								className: "label",
								children: "Back"
							})] }) : isChooser ? /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsxs("span", {
								className: "label-wrap",
								children: [/* @__PURE__ */ jsx("span", {
									className: "label",
									children: opt.label
								}), (() => {
									if (!(opt.id === "__choose-student" ? studentIdSet : staffIdSet).has(value)) return null;
									return /* @__PURE__ */ jsx("span", {
										className: "selected-child",
										children: ALL_LABELS.get(value) ?? titleFromId(value)
									});
								})()]
							}), /* @__PURE__ */ jsx("span", {
								className: "chooser-icon",
								"aria-hidden": true,
								children: /* @__PURE__ */ jsx("svg", {
									className: "ui-icon",
									viewBox: "0 0 24 24",
									fill: "none",
									stroke: "currentColor",
									strokeWidth: "2",
									strokeLinecap: "round",
									strokeLinejoin: "round",
									children: /* @__PURE__ */ jsx("path", { d: "M9 18L15 12L9 6" })
								})
							})] }) : /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsxs("span", {
								className: "label option-label",
								children: [opt.id === "visitor" && /* @__PURE__ */ jsx("span", {
									className: "explorer-emoji",
									"aria-hidden": true,
									children: "🌍"
								}), ALL_LABELS.get(opt.id) ?? titleFromId(opt.id)]
							}), /* @__PURE__ */ jsxs("span", {
								className: "picker-labels",
								children: [isPersonal && /* @__PURE__ */ jsx("span", {
									className: "ui-label picker-you",
									children: "you"
								}), showCount && /* @__PURE__ */ jsx("span", {
									className: "ui-label picker-count",
									"aria-label": countLabel,
									title: countLabel,
									children: n
								})]
							})] })
						}, opt.id);
					})
				})
			})
		})]
	});
}
//#endregion
//#region src/lib/responsive/breakpoints.ts
var VIEWPORT_BREAKPOINTS = {
	mobileMax: 767,
	tabletMin: 768,
	tabletMax: 1024,
	desktopMin: 1025
};
var DEFAULT_VIEWPORT_WIDTH = VIEWPORT_BREAKPOINTS.desktopMin;
function viewportBandForWidth(width) {
	if (width <= VIEWPORT_BREAKPOINTS.mobileMax) return "mobile";
	if (width <= VIEWPORT_BREAKPOINTS.tabletMax) return "tablet";
	return "desktop";
}
var isMobileWidth = (width) => viewportBandForWidth(width) === "mobile";
var isTabletWidth = (width) => viewportBandForWidth(width) === "tablet";
var isDesktopWidth = (width) => width >= VIEWPORT_BREAKPOINTS.desktopMin;
//#endregion
//#region src/lib/hooks/useWindowWidth.ts
function useWindowWidth() {
	const [width, setWidth] = useState(() => typeof window === "undefined" ? DEFAULT_VIEWPORT_WIDTH : window.innerWidth);
	useEffect(() => {
		const handler = () => {
			setWidth(window.innerWidth);
		};
		window.addEventListener("resize", handler);
		return () => {
			window.removeEventListener("resize", handler);
		};
	}, []);
	return width;
}
//#endregion
//#region src/lib/responsive/graph-tools-offset.ts
var GRAPH_TOOL_OFFSETS = {
	logs: 130,
	widgets: 50
};
var TABLET_TOOL_Y_OFFSETS = {
	logs: -170,
	widgets: -70
};
function graphToolsOffsetPx(logsOpen, widgetsOpen) {
	return (logsOpen ? GRAPH_TOOL_OFFSETS.logs : 0) + (widgetsOpen ? GRAPH_TOOL_OFFSETS.widgets : 0);
}
function desktopGraphToolsOffsetPx(width, logsOpen, widgetsOpen, scale = 1) {
	return isDesktopWidth(width) ? graphToolsOffsetPx(logsOpen, widgetsOpen) * scale : 0;
}
function tabletGraphToolsYOffsetPx(width, logsOpen, widgetsOpen) {
	if (!isTabletWidth(width)) return 0;
	return (logsOpen ? TABLET_TOOL_Y_OFFSETS.logs : 0) + (widgetsOpen ? TABLET_TOOL_Y_OFFSETS.widgets : 0);
}
//#endregion
//#region src/navigation/right/nav-right.tsx
var DEFAULT_SECTION = "fine-arts";
var cx = (...parts) => parts.filter(Boolean).join(" ");
function NavRight({ isDark, introActive = false }) {
	const { isSurveyActive, setSurveyActive, hasCompletedSurvey, setHasCompletedSurvey, observerMode, setObserverMode, openGraph, closeGraph, resetToStart, logsOpen, widgetsOpen, questionnaireOpen, vizVisible, cityPanelOpen, setCityPanelOpen } = useUiFlow();
	const { section, setSection } = useSurveyData();
	const { myEntryId, mySection, setMyEntryId, setMySection, setMyRole } = useIdentity();
	const { setLiveAvg } = useCanvasRuntime();
	const windowWidth = useWindowWidth();
	const [pickerOpen, setPickerOpen] = useState(false);
	const aspectRatio = typeof window !== "undefined" ? window.innerWidth / window.innerHeight : 1.78;
	const pickerOffset = isDesktopWidth(windowWidth) ? desktopGraphToolsOffsetPx(windowWidth, logsOpen, widgetsOpen, aspectRatio) : isTabletWidth(windowWidth) ? 0 : pickerOpen ? 0 : -30;
	const showPicker = (observerMode || hasCompletedSurvey) && !isSurveyActive;
	const showObserverButton = !isSurveyActive || observerMode || hasCompletedSurvey;
	const observerLabel = observerMode || hasCompletedSurvey ? "Back" : "View now";
	const savedEntryId = myEntryId ?? getSessionItem("be.myEntryId");
	const savedSection = mySection ?? getSessionItem("be.mySection");
	const showSavedCityButton = Boolean(savedEntryId && savedSection) && !isSurveyActive && !observerMode && !hasCompletedSurvey && !vizVisible;
	const pickerStyle = {
		"--picker-offset": `${String(pickerOffset)}px`,
		transition: "transform 0.2s ease"
	};
	const openSavedCity = () => {
		if (!savedEntryId || !savedSection) return;
		setMyEntryId(savedEntryId);
		setMySection(savedSection);
		setMyRole(getSessionItem("be.myRole"));
		setSection(savedSection);
		const storedAvg = getSessionItem("be.myAvg");
		if (storedAvg !== null) {
			const parsed = parseFloat(storedAvg);
			if (Number.isFinite(parsed)) setLiveAvg(parsed);
		}
		setCityPanelOpen(!cityPanelOpen);
	};
	const toggleObserverMode = () => {
		if (hasCompletedSurvey && !observerMode) {
			resetToStart();
			return;
		}
		if (!observerMode && !hasCompletedSurvey && savedEntryId && savedSection && !questionnaireOpen) {
			setMyEntryId(savedEntryId);
			setMySection(savedSection);
			setMyRole(getSessionItem("be.myRole"));
			setHasCompletedSurvey(true);
			setObserverMode(false);
			setSurveyActive(false);
			setSection(savedSection);
			openGraph();
			return;
		}
		const next = !observerMode;
		setObserverMode(next);
		if (next) {
			if (!section) setSection(DEFAULT_SECTION);
			setSurveyActive(false);
			openGraph();
			return;
		}
		if (!hasCompletedSurvey) closeGraph();
	};
	return /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsxs("div", {
		className: cx("right", isDark && "is-dark", introActive && "nav-first-enter"),
		children: [
			/* @__PURE__ */ jsx(ColorToggle, {}),
			showObserverButton && /* @__PURE__ */ jsxs("button", {
				className: cx("observe-results", observerMode && "active"),
				onClick: toggleObserverMode,
				"aria-pressed": observerMode || hasCompletedSurvey,
				"aria-label": observerMode || hasCompletedSurvey ? "Back" : "View",
				"data-label": observerLabel,
				children: [/* @__PURE__ */ jsx("span", {
					className: "observe-results__ghost",
					"aria-hidden": "true",
					children: observerLabel
				}), /* @__PURE__ */ jsx("span", {
					className: "observe-results__inner",
					children: observerLabel
				})]
			}),
			showSavedCityButton && /* @__PURE__ */ jsx("button", {
				type: "button",
				className: "city-button city-top-button",
				"data-label": cityPanelOpen ? "Back" : "My city",
				onClick: openSavedCity,
				"aria-label": cityPanelOpen ? "Back to home" : "Open my city",
				children: /* @__PURE__ */ jsx("span", {
					className: "city-button__inner",
					children: /* @__PURE__ */ jsx("span", { children: cityPanelOpen ? "Back" : "My city" })
				})
			})
		]
	}), showPicker && /* @__PURE__ */ jsx("div", {
		className: "graph-picker",
		style: pickerStyle,
		children: /* @__PURE__ */ jsx(GraphPicker, {
			value: section,
			onChange: setSection,
			onOpenChange: setPickerOpen
		})
	})] });
}
//#endregion
//#region src/assets/svg/close/close.svg?raw
var close_default = "<svg width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\">\r\n<mask id=\"mask0_7_109\" style=\"mask-type:alpha\" maskUnits=\"userSpaceOnUse\" x=\"0\" y=\"0\" width=\"24\" height=\"24\">\r\n<rect width=\"24\" height=\"24\" fill=\"#D9D9D9\"/>\r\n</mask>\r\n<g mask=\"url(#mask0_7_109)\">\r\n<path d=\"M6.4 18.6538L5.34625 17.6L10.9463 12L5.34625 6.4L6.4 5.34625L12 10.9463L17.6 5.34625L18.6538 6.4L13.0538 12L18.6538 17.6L17.6 18.6538L12 13.0538L6.4 18.6538Z\" fill=\"#1C1B1F\"/>\r\n</g>\r\n</svg>\r\n";
//#endregion
//#region src/assets/svg/close/CloseIcon.tsx
function CloseIcon({ className = "ui-close" }) {
	const iconId = useId().replace(/:/g, "");
	const markup = useMemo(() => {
		return prepareRawSvgMarkup(close_default, `close-${iconId}`, className);
	}, [className, iconId]);
	return /* @__PURE__ */ jsx("span", {
		"aria-hidden": "true",
		style: RAW_SVG_WRAPPER_STYLE,
		dangerouslySetInnerHTML: { __html: markup }
	});
}
//#endregion
//#region src/lib/hooks/useAbsoluteScore.ts
var defaultIdOf = (item) => item._id;
/**
* Absolute score hook (no pool comparison).
* Returns 0..100 for a value, id, or item.
*/
function useAbsoluteScore(items, opts) {
	const accessor = opts?.accessor ?? avgWeightOf;
	const idOf = opts?.idOf ?? defaultIdOf;
	const decimals = opts?.decimals ?? 0;
	const idToValue = useMemo(() => {
		const map = /* @__PURE__ */ new Map();
		items.forEach((it) => {
			const id = idOf(it);
			if (id) map.set(id, accessor(it));
		});
		return map;
	}, [
		items,
		accessor,
		idOf
	]);
	const getForValue = (value) => toScore100(value, decimals);
	const getForId = (id) => {
		if (!id || !idToValue.has(id)) return 0;
		const value = idToValue.get(id);
		return value === void 0 ? 0 : getForValue(value);
	};
	const getForItem = (item) => {
		return getForValue(accessor(item));
	};
	return {
		getForId,
		getForItem,
		getForValue
	};
}
//#endregion
//#region src/graph-runtime/useGraphData.ts
var EMPTY_DATA = [];
function useGraphData(data) {
	const safeData = useMemo(() => Array.isArray(data) ? data : EMPTY_DATA, [data]);
	const dataById = useMemo(() => {
		const map = /* @__PURE__ */ new Map();
		for (const item of safeData) if (item._id) map.set(item._id, item);
		return map;
	}, [safeData]);
	const { getForId: getRelForId, getForValue: getRelForValue } = useRelativeScores(safeData);
	const { getForId: getAbsForId, getForValue: getAbsForValue } = useAbsoluteScore(safeData, { decimals: 0 });
	return {
		safeData,
		dataById,
		getRelForId,
		getRelForValue,
		getAbsForId,
		getAbsForValue,
		absScoreById: useMemo(() => {
			const map = /* @__PURE__ */ new Map();
			for (const item of safeData) if (item._id) map.set(item._id, getAbsForId(item._id));
			return map;
		}, [safeData, getAbsForId])
	};
}
//#endregion
//#region src/graph-runtime/GraphDataContext.tsx
var GraphDataContext = React$1.createContext(null);
function GraphDataProvider({ data, children }) {
	const value = useGraphData(data);
	return /* @__PURE__ */ jsx(GraphDataContext.Provider, {
		value,
		children
	});
}
function useSharedGraphData() {
	const ctx = React$1.useContext(GraphDataContext);
	if (!ctx) throw new Error("useSharedGraphData must be used within GraphDataProvider");
	return ctx;
}
//#endregion
//#region src/lib/hooks/useEscapeToClose.ts
function useEscapeToClose(enabled, onClose) {
	useEffect(() => {
		if (!enabled) return;
		const onKeyDown = (event) => {
			if (event.key !== "Escape" || event.defaultPrevented) return;
			onClose();
		};
		document.addEventListener("keydown", onKeyDown);
		return () => {
			document.removeEventListener("keydown", onKeyDown);
		};
	}, [enabled, onClose]);
}
//#endregion
//#region src/lib/hooks/useFocusTrap.ts
var FOCUSABLE_SELECTOR = "button:not([disabled]),[href],input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex=\"-1\"])";
function useFocusTrap({ enabled, containerRef, returnFocusRef, focusOnOpen = true }) {
	useEffect(() => {
		if (!enabled) return;
		const container = containerRef.current;
		if (!container) return;
		const returnTo = returnFocusRef?.current ?? (document.activeElement instanceof HTMLElement ? document.activeElement : null);
		const getFocusable = () => Array.from(container.querySelectorAll(FOCUSABLE_SELECTOR));
		if (focusOnOpen) getFocusable()[0]?.focus();
		const onKeyDown = (event) => {
			if (event.key !== "Tab") return;
			const focusable = getFocusable();
			if (!focusable.length) return;
			const first = focusable[0];
			const last = focusable[focusable.length - 1];
			if (event.shiftKey && document.activeElement === first) {
				event.preventDefault();
				last.focus();
			} else if (!event.shiftKey && document.activeElement === last) {
				event.preventDefault();
				first.focus();
			}
		};
		document.addEventListener("keydown", onKeyDown);
		return () => {
			document.removeEventListener("keydown", onKeyDown);
			returnTo?.focus();
		};
	}, [
		containerRef,
		enabled,
		focusOnOpen,
		returnFocusRef
	]);
}
//#endregion
//#region src/lib/hooks/useTransientFlag.ts
function useTransientFlag(durationMs) {
	const [visible, setVisible] = useState(false);
	const timerRef = useRef(null);
	const clearTimer = useCallback(() => {
		if (timerRef.current == null) return;
		window.clearTimeout(timerRef.current);
		timerRef.current = null;
	}, []);
	const hide = useCallback(() => {
		clearTimer();
		setVisible(false);
	}, [clearTimer]);
	const show = useCallback(() => {
		clearTimer();
		setVisible(true);
		timerRef.current = window.setTimeout(() => {
			setVisible(false);
			timerRef.current = null;
		}, durationMs);
	}, [clearTimer, durationMs]);
	useEffect(() => clearTimer, [clearTimer]);
	return {
		visible,
		show,
		hide
	};
}
//#endregion
//#region src/navigation/bottom/mode-toggle.tsx
function ToggleCheckIcon() {
	return /* @__PURE__ */ jsx("span", {
		className: "mode-toggle-check",
		children: /* @__PURE__ */ jsx(CheckIcon, { className: "switch-check-icon" })
	});
}
function ModeToggle() {
	const { mode, setMode, observerMode, setOpenPersonalized, setSpotlightRequest, personalPanelOpen } = useUiFlow();
	const { data } = useSurveyData();
	const { myEntryId } = useIdentity();
	const poolValues = useMemo(() => Array.isArray(data) ? data.map(avgWeightOf) : [], [data]);
	const myIndex = useMemo(() => myEntryId ? data.findIndex((d) => d._id === myEntryId) : -1, [data, myEntryId]);
	const myRow = myIndex >= 0 ? data[myIndex] : void 0;
	const myValue = myRow ? avgWeightOf(myRow) : void 0;
	const relFeedback = useMemo(() => {
		if (!poolValues.length || typeof myValue !== "number" || !Number.isFinite(myValue)) return "Rankings";
		const currentValue = myValue;
		const pool = poolValues.length - 1;
		const countBelow = poolValues.reduce((acc, v, i) => i === myIndex ? acc : acc + (v < currentValue ? 1 : 0), 0);
		return `Ahead of ${String(countBelow)} of ${String(Math.max(0, pool))}`;
	}, [
		poolValues,
		myIndex,
		myValue
	]);
	const { getForId: getAbsForId } = useAbsoluteScore(data, { decimals: 0 });
	const absFeedback = useMemo(() => {
		if (myIndex < 0) return "Scores";
		const score = getAbsForId(myEntryId ?? void 0);
		return `Score: ${String(score)}/100`;
	}, [
		getAbsForId,
		myEntryId,
		myIndex
	]);
	const isAbsolute = mode === "absolute";
	const nextMode = isAbsolute ? "relative" : "absolute";
	const canPersonalize = !observerMode && myIndex >= 0;
	const flipModeAndMaybeSpotlight = (next) => {
		setMode(next);
		if (!observerMode) {
			if (canPersonalize) if (personalPanelOpen) setOpenPersonalized(true);
			else requestAnimationFrame(() => {
				requestAnimationFrame(() => {
					setSpotlightRequest({
						durationMs: 3e3,
						fakeMouseXRatio: .25,
						fakeMouseYRatio: .5
					});
				});
			});
			return;
		}
		requestAnimationFrame(() => {
			requestAnimationFrame(() => {
				setSpotlightRequest({
					durationMs: 3e3,
					fakeMouseXRatio: .25,
					fakeMouseYRatio: .5
				});
			});
		});
	};
	return /* @__PURE__ */ jsx("div", {
		className: "mode-toggle-wrap",
		children: /* @__PURE__ */ jsxs("div", {
			role: "radiogroup",
			"aria-label": "Visualization mode",
			className: `mode-toggle-switch${observerMode ? " is-observing" : ""}`,
			children: [/* @__PURE__ */ jsxs("button", {
				role: "radio",
				"aria-checked": !isAbsolute,
				className: `mode-toggle-label${!isAbsolute ? " active" : ""}`,
				onClick: () => {
					flipModeAndMaybeSpotlight(nextMode);
				},
				title: !isAbsolute ? relFeedback : "Switch to Rankings",
				tabIndex: 0,
				children: [!isAbsolute && /* @__PURE__ */ jsx(ToggleCheckIcon, {}), "team"]
			}), /* @__PURE__ */ jsxs("button", {
				role: "radio",
				"aria-checked": isAbsolute,
				className: `mode-toggle-label${isAbsolute ? " active" : ""}`,
				onClick: () => {
					flipModeAndMaybeSpotlight(nextMode);
				},
				title: isAbsolute ? absFeedback : "Switch to Scores",
				tabIndex: 0,
				children: [isAbsolute && /* @__PURE__ */ jsx(ToggleCheckIcon, {}), "solo"]
			})]
		})
	});
}
//#endregion
//#region src/assets/svg/search/search.svg?raw
var search_default = "<svg width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\">\r\n<mask id=\"mask0_13_133\" style=\"mask-type:alpha\" maskUnits=\"userSpaceOnUse\" x=\"0\" y=\"0\" width=\"24\" height=\"24\">\r\n<rect width=\"24\" height=\"24\" fill=\"#D9D9D9\"/>\r\n</mask>\r\n<g mask=\"url(#mask0_13_133)\">\r\n<path d=\"M19.5422 20.577L13.2615 14.296C12.7615 14.7088 12.1865 15.0319 11.5365 15.2652C10.8865 15.4986 10.2141 15.6152 9.51924 15.6152C7.81157 15.6152 6.36541 15.023 5.18074 13.8385C3.99624 12.6538 3.40399 11.2077 3.40399 9.49999C3.40399 7.79232 3.99624 6.34615 5.18074 5.16149C6.36541 3.97699 7.81157 3.38474 9.51924 3.38474C11.2269 3.38474 12.6731 3.97699 13.8577 5.16149C15.0422 6.34615 15.6345 7.79232 15.6345 9.49999C15.6345 10.2142 15.5147 10.8962 15.275 11.5462C15.0352 12.1962 14.7152 12.7616 14.3152 13.2422L20.596 19.523L19.5422 20.577ZM9.51924 14.1155C10.8077 14.1155 11.8991 13.6683 12.7932 12.774C13.6876 11.8798 14.1347 10.7885 14.1347 9.49999C14.1347 8.21149 13.6876 7.12015 12.7932 6.22598C11.8991 5.33165 10.8077 4.88449 9.51924 4.88449C8.23074 4.88449 7.13941 5.33165 6.24524 6.22598C5.35091 7.12015 4.90374 8.21149 4.90374 9.49999C4.90374 10.7885 5.35091 11.8798 6.24524 12.774C7.13941 13.6683 8.23074 14.1155 9.51924 14.1155Z\" fill=\"#1C1B1F\"/>\r\n</g>\r\n</svg>\r\n";
//#endregion
//#region src/assets/svg/search/SearchIcon.tsx
function SearchIcon({ className = "ui-icon" }) {
	const iconId = useId().replace(/:/g, "");
	const markup = useMemo(() => {
		return prepareRawSvgMarkup(search_default, `search-${iconId}`, className);
	}, [className, iconId]);
	return /* @__PURE__ */ jsx("span", {
		"aria-hidden": "true",
		style: RAW_SVG_WRAPPER_STYLE,
		dangerouslySetInnerHTML: { __html: markup }
	});
}
//#endregion
//#region src/navigation/bottom/logs-button.tsx
var PAGE_SIZE = 50;
function fmt(v) {
	return v != null ? v.toFixed(2) : "--";
}
function fmtQuestionScore(v) {
	return v != null ? String(Math.round(v * 100)) : "--";
}
function fmtQs(row) {
	return [
		row.q1,
		row.q2,
		row.q3,
		row.q4,
		row.q5
	].map(fmtQuestionScore).join(", ");
}
var SECTION_DISPLAY = { visitor: "Explorer" };
function capitalizeFirstWord(value) {
	return value.replace(/^(\s*)(\p{L})/u, (_match, leading, firstLetter) => `${leading}${firstLetter.toLocaleUpperCase()}`);
}
function formatSectionLabel(section) {
	const s = section ?? "";
	return SECTION_DISPLAY[s] ?? capitalizeFirstWord(s.replace(/-/g, " "));
}
function rowSubmittedTime(row) {
	const raw = row.submittedAt ?? row._createdAt;
	const timestamp = raw ? Date.parse(raw) : 0;
	return Number.isFinite(timestamp) ? timestamp : 0;
}
function escapeRegExp(value) {
	return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
function LogsPageArrow({ direction, hidden, onClick }) {
	const isPrevious = direction === "previous";
	const label = isPrevious ? "Previous page" : "Next page";
	const path = isPrevious ? "M15 18L9 12L15 6" : "M9 18L15 12L9 6";
	if (hidden) return /* @__PURE__ */ jsx("span", {
		className: "ui-icon-nav-button logs-page-arrow logs-page-arrow--placeholder",
		"aria-hidden": "true"
	});
	return /* @__PURE__ */ jsx("button", {
		type: "button",
		className: "ui-icon-nav-button logs-page-arrow",
		onClick,
		"aria-label": label,
		children: /* @__PURE__ */ jsx("svg", {
			className: "ui-icon",
			viewBox: "0 0 24 24",
			fill: "none",
			"aria-hidden": "true",
			focusable: "false",
			children: /* @__PURE__ */ jsx("path", {
				d: path,
				stroke: "currentColor",
				strokeWidth: "2",
				strokeLinecap: "round",
				strokeLinejoin: "round"
			})
		})
	});
}
function LogsPanel({ className = "logs-popover", panelRef, showCloseButton = true, onClose }) {
	const { allFilteredRows: data } = useSurveyData();
	const [page, setPage] = useState(0);
	const [query, setQuery] = useState("");
	const [searchOpen, setSearchOpen] = useState(false);
	const [filterFocused, setFilterFocused] = useState(false);
	const [activeRowId, setActiveRowId] = useState(null);
	const filterInputRef = useRef(null);
	const tableWrapRef = useRef(null);
	useEffect(() => {
		if (!searchOpen) return;
		filterInputRef.current?.focus();
	}, [searchOpen]);
	useEffect(() => {
		const el = tableWrapRef.current;
		if (!el) return;
		let lastTouchY = 0;
		const onTouchStart = (event) => {
			lastTouchY = event.touches.item(0)?.clientY ?? 0;
		};
		const onTouchMove = (event) => {
			const touch = event.touches.item(0);
			if (!touch) return;
			const currentY = touch.clientY;
			const dy = currentY - lastTouchY;
			lastTouchY = currentY;
			const maxScrollTop = el.scrollHeight - el.clientHeight;
			if (maxScrollTop <= 0) {
				if (event.cancelable) event.preventDefault();
				return;
			}
			const atTop = el.scrollTop <= 0;
			const atBottom = el.scrollTop >= maxScrollTop - 1;
			if (atTop && dy > 0 || atBottom && dy < 0) {
				if (event.cancelable) event.preventDefault();
			}
		};
		el.addEventListener("touchstart", onTouchStart, { passive: true });
		el.addEventListener("touchmove", onTouchMove, { passive: false });
		return () => {
			el.removeEventListener("touchstart", onTouchStart);
			el.removeEventListener("touchmove", onTouchMove);
		};
	}, []);
	const sorted = useMemo(() => {
		return [...data].sort((a, b) => {
			const da = rowSubmittedTime(a);
			const db = rowSubmittedTime(b);
			if (da !== db) return db - da;
			return b._id.localeCompare(a._id);
		});
	}, [data]);
	const rankById = useMemo(() => {
		const byAvg = [...sorted].sort((a, b) => (b.avgWeight ?? 0) - (a.avgWeight ?? 0));
		const map = /* @__PURE__ */ new Map();
		byAvg.forEach((row, i) => map.set(row._id, i + 1));
		return map;
	}, [sorted]);
	const filtered = useMemo(() => {
		const term = query.trim().toLowerCase();
		if (!term) return sorted;
		return sorted.filter((row) => {
			const rank = rankById.get(row._id) ?? 0;
			return [
				formatSectionLabel(row.section),
				fmt(row.avgWeight),
				String(rank),
				fmtQs(row)
			].join(" ").toLowerCase().includes(term);
		});
	}, [
		query,
		rankById,
		sorted
	]);
	const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
	const safePage = Math.min(page, totalPages - 1);
	const pageRows = filtered.slice(safePage * PAGE_SIZE, (safePage + 1) * PAGE_SIZE);
	const highlightPattern = query.trim();
	useEffect(() => {
		if (!activeRowId) return;
		if (!pageRows.some((row) => row._id === activeRowId)) setActiveRowId(null);
	}, [activeRowId, pageRows]);
	function renderHighlighted(text) {
		if (!highlightPattern) return text;
		const regex = new RegExp(`(${escapeRegExp(highlightPattern)})`, "ig");
		const parts = text.split(regex);
		if (parts.length === 1) return text;
		return parts.map((part, index) => part.toLowerCase() === highlightPattern.toLowerCase() ? /* @__PURE__ */ jsx("mark", {
			className: "logs-highlight",
			children: part
		}, `${part}-${String(index)}`) : part);
	}
	function closeLogs() {
		setFilterFocused(false);
		if (!query.trim()) setSearchOpen(false);
		onClose();
	}
	function openSearch() {
		setSearchOpen(true);
	}
	function closeSearchIfEmpty() {
		setFilterFocused(false);
		if (!query.trim()) setSearchOpen(false);
	}
	return /* @__PURE__ */ jsxs("div", {
		ref: panelRef,
		className,
		children: [
			/* @__PURE__ */ jsxs("div", {
				className: "logs-header",
				children: [/* @__PURE__ */ jsx("span", {
					className: "logs-title",
					children: "Logs"
				}), /* @__PURE__ */ jsxs("div", {
					className: "logs-header-tools",
					children: [!searchOpen && /* @__PURE__ */ jsxs("span", {
						className: "ui-label logs-entry-count",
						children: [sorted.length, " people"]
					}), searchOpen ? /* @__PURE__ */ jsxs("label", {
						className: `logs-filter-field${filterFocused ? " is-focused" : ""}`,
						htmlFor: "logs-filter-input",
						"data-focused": filterFocused ? "true" : "false",
						children: [/* @__PURE__ */ jsx(SearchIcon, { className: "ui-icon" }), /* @__PURE__ */ jsx("input", {
							ref: filterInputRef,
							id: "logs-filter-input",
							type: "text",
							className: "logs-filter-input",
							value: query,
							placeholder: "search",
							"aria-label": filterFocused ? "Filtering submission logs" : "Filter submission logs",
							"aria-expanded": searchOpen,
							onFocus: () => {
								setFilterFocused(true);
							},
							onBlur: closeSearchIfEmpty,
							onKeyDown: (e) => {
								if (e.key !== "Escape") return;
								e.preventDefault();
								e.stopPropagation();
								if (query.trim()) {
									setQuery("");
									setPage(0);
									return;
								}
								setSearchOpen(false);
								setFilterFocused(false);
							},
							onChange: (e) => {
								setQuery(e.target.value);
								setPage(0);
							}
						})]
					}) : /* @__PURE__ */ jsx("button", {
						type: "button",
						className: "logs-filter-trigger",
						"aria-label": "Open log search",
						onClick: openSearch,
						children: /* @__PURE__ */ jsx(SearchIcon, { className: "ui-icon" })
					})]
				})]
			}),
			/* @__PURE__ */ jsx("div", {
				ref: tableWrapRef,
				className: "logs-table-wrap",
				onWheel: (e) => {
					e.stopPropagation();
				},
				children: /* @__PURE__ */ jsxs("table", {
					className: "logs-table",
					children: [/* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsxs("tr", { children: [
						/* @__PURE__ */ jsx("th", {
							className: "logs-th logs-th--section",
							children: "Section"
						}),
						/* @__PURE__ */ jsx("th", {
							className: "logs-th logs-th--avg",
							children: "Avg"
						}),
						/* @__PURE__ */ jsx("th", {
							className: "logs-th logs-th--rank",
							children: "Rank"
						}),
						/* @__PURE__ */ jsx("th", {
							className: "logs-th logs-th--qs",
							children: "Question 1-5"
						})
					] }) }), /* @__PURE__ */ jsx("tbody", { children: pageRows.length === 0 ? /* @__PURE__ */ jsx("tr", {
						className: "logs-row logs-row--empty",
						children: /* @__PURE__ */ jsx("td", {
							className: "logs-empty",
							colSpan: 4,
							children: "couldn't find that one."
						})
					}) : pageRows.map((row) => /* @__PURE__ */ jsxs("tr", {
						className: `logs-row${activeRowId === row._id ? " is-active" : ""}`,
						tabIndex: 0,
						"aria-selected": activeRowId === row._id,
						onPointerDown: () => {
							setActiveRowId(row._id);
						},
						onClick: () => {
							setActiveRowId(row._id);
						},
						onKeyDown: (event) => {
							if (event.key !== "Enter" && event.key !== " ") return;
							event.preventDefault();
							setActiveRowId(row._id);
						},
						children: [
							/* @__PURE__ */ jsx("td", {
								className: "logs-td logs-td--section",
								children: renderHighlighted(formatSectionLabel(row.section))
							}),
							/* @__PURE__ */ jsx("td", {
								className: "logs-td logs-td--avg",
								children: renderHighlighted(fmt(row.avgWeight))
							}),
							/* @__PURE__ */ jsx("td", {
								className: "logs-td logs-td--rank",
								children: renderHighlighted(String(rankById.get(row._id) ?? 0))
							}),
							/* @__PURE__ */ jsx("td", {
								className: "logs-td logs-td--qs",
								children: renderHighlighted(fmtQs(row))
							})
						]
					}, row._id)) })]
				})
			}),
			(showCloseButton || totalPages > 1) && /* @__PURE__ */ jsxs("div", {
				className: "logs-footer",
				children: [showCloseButton && /* @__PURE__ */ jsx("button", {
					type: "button",
					className: "logs-close-btn",
					"aria-label": "Close logs",
					onClick: closeLogs,
					children: /* @__PURE__ */ jsx(CloseIcon, { className: "ui-close" })
				}), totalPages > 1 && /* @__PURE__ */ jsxs("div", {
					className: "logs-pagination",
					children: [
						/* @__PURE__ */ jsx(LogsPageArrow, {
							direction: "previous",
							hidden: safePage === 0,
							onClick: () => {
								setPage((p) => p - 1);
							}
						}),
						/* @__PURE__ */ jsxs("span", {
							className: "logs-page-label",
							children: [
								safePage + 1,
								/* @__PURE__ */ jsx("span", {
									className: "logs-page-sep",
									children: "/"
								}),
								totalPages
							]
						}),
						/* @__PURE__ */ jsx(LogsPageArrow, {
							direction: "next",
							hidden: safePage >= totalPages - 1,
							onClick: () => {
								setPage((p) => p + 1);
							}
						}),
						/* @__PURE__ */ jsx("input", {
							id: "logs-page-input",
							type: "number",
							className: "logs-page-input",
							min: 1,
							max: totalPages,
							placeholder: "page",
							"aria-label": "Go to page",
							onChange: (e) => {
								const val = parseInt(e.target.value, 10);
								if (!isNaN(val) && val >= 1 && val <= totalPages) setPage(val - 1);
							}
						})
					]
				})]
			})
		]
	});
}
function LogsButton({ open, onOpenChange }) {
	const dialogRef = useRef(null);
	const triggerRef = useRef(null);
	const closeLogs = useCallback(() => {
		onOpenChange(false);
	}, [onOpenChange]);
	useEscapeToClose(open, closeLogs);
	useFocusTrap({
		enabled: open,
		containerRef: dialogRef,
		returnFocusRef: triggerRef
	});
	function toggle() {
		onOpenChange(!open);
	}
	return /* @__PURE__ */ jsxs("div", {
		className: "logs-wrap",
		children: [/* @__PURE__ */ jsx("div", {
			className: `logs-popover-shell${open ? " is-open" : ""}`,
			"aria-hidden": !open,
			children: /* @__PURE__ */ jsx("div", {
				className: "logs-popover-clip",
				children: /* @__PURE__ */ jsx(LogsPanel, {
					panelRef: dialogRef,
					onClose: closeLogs
				})
			})
		}), /* @__PURE__ */ jsx("button", {
			ref: triggerRef,
			type: "button",
			className: "logs-button",
			"data-label": "Logs",
			"aria-label": "Logs",
			"aria-expanded": open,
			"aria-haspopup": "dialog",
			onClick: toggle,
			children: /* @__PURE__ */ jsx("span", {
				className: "logs-button__inner",
				children: "Logs"
			})
		})]
	});
}
//#endregion
//#region src/app/ui/HintBanner.tsx
function classes$1(...names) {
	return names.filter(Boolean).join(" ");
}
function HintBanner({ visible, children, className, copyClassName, closeClassName, closeLabel = "Dismiss notice", onDismiss }) {
	return /* @__PURE__ */ jsxs("div", {
		className: classes$1("hint-banner", visible && "is-visible", onDismiss && "is-dismissible", className),
		role: "status",
		"aria-live": "polite",
		"aria-hidden": !visible,
		children: [/* @__PURE__ */ jsx("span", {
			className: classes$1("hint-banner-copy", copyClassName),
			children
		}), onDismiss ? /* @__PURE__ */ jsx("button", {
			type: "button",
			className: classes$1("hint-banner-close", closeClassName),
			"aria-label": closeLabel,
			tabIndex: visible ? 0 : -1,
			onClick: () => {
				onDismiss();
			},
			children: /* @__PURE__ */ jsx(CloseIcon, { className: "ui-close" })
		}) : null]
	});
}
//#endregion
//#region src/assets/svg/play/pause.svg?raw
var pause_default = "<svg width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\">\n<path d=\"M9 5V19M15 5V19\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\"/>\n</svg>\n";
//#endregion
//#region src/assets/svg/play/PlayPauseIcon.tsx
var PLAY_SVG = `
<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M8 6.5V17.5L17 12L8 6.5Z" fill="currentColor"/>
</svg>
`;
function PlayPauseIcon({ mode, className = "ui-icon" }) {
	const iconId = useId().replace(/:/g, "");
	const markup = useMemo(() => {
		return prepareRawSvgMarkup(mode === "pause" ? pause_default : PLAY_SVG, `play-pause-${mode}-${iconId}`, className);
	}, [
		className,
		iconId,
		mode
	]);
	return /* @__PURE__ */ jsx("span", {
		"aria-hidden": "true",
		style: RAW_SVG_WRAPPER_STYLE,
		dangerouslySetInnerHTML: { __html: markup }
	});
}
//#endregion
//#region src/navigation/bottom/widgets/widget-section-nav.tsx
function classes(...names) {
	return names.filter(Boolean).join(" ");
}
function WidgetSectionNav({ title, paused, className, onPrevious, onNext, onTogglePaused }) {
	return /* @__PURE__ */ jsxs("div", {
		className: classes("ui-icon-nav widget-section-nav", className),
		children: [
			/* @__PURE__ */ jsx("button", {
				type: "button",
				className: "ui-icon-nav-button widget-section-nav-btn",
				"aria-label": "Previous section",
				onClick: onPrevious,
				children: /* @__PURE__ */ jsx("svg", {
					className: "ui-icon",
					viewBox: "0 0 24 24",
					fill: "none",
					stroke: "currentColor",
					strokeWidth: "2",
					strokeLinecap: "round",
					strokeLinejoin: "round",
					"aria-hidden": "true",
					children: /* @__PURE__ */ jsx("path", { d: "M15 18L9 12L15 6" })
				})
			}),
			/* @__PURE__ */ jsx("div", {
				className: "widget-section-nav-title",
				title,
				children: title
			}),
			/* @__PURE__ */ jsx("button", {
				type: "button",
				className: "ui-icon-nav-button widget-section-nav-btn",
				"aria-label": "Next section",
				onClick: onNext,
				children: /* @__PURE__ */ jsx("svg", {
					className: "ui-icon",
					viewBox: "0 0 24 24",
					fill: "none",
					stroke: "currentColor",
					strokeWidth: "2",
					strokeLinecap: "round",
					strokeLinejoin: "round",
					"aria-hidden": "true",
					children: /* @__PURE__ */ jsx("path", { d: "M9 18L15 12L9 6" })
				})
			}),
			/* @__PURE__ */ jsx("button", {
				type: "button",
				className: "ui-icon-nav-button widget-section-nav-btn widget-section-nav-btn--pause",
				"aria-pressed": paused,
				"aria-label": paused ? "Resume section autoplay" : "Pause section autoplay",
				onClick: onTogglePaused,
				children: /* @__PURE__ */ jsx(PlayPauseIcon, {
					mode: paused ? "play" : "pause",
					className: "ui-icon"
				})
			})
		]
	});
}
//#endregion
//#region src/navigation/bottom/widgets/section-scores.tsx
var Q_KEYS = [
	"q1",
	"q2",
	"q3",
	"q4",
	"q5"
];
var AUTOPLAY_MS = 5e3;
var TOUCH_PREVIEW_INDEX = 0;
function shouldPreviewTouchRow() {
	return typeof window !== "undefined" && typeof window.matchMedia === "function" && window.matchMedia("(hover: none), (pointer: coarse)").matches;
}
function SectionScores({ navOutsidePanel = false, panelClassName, paused, onPausedChange } = {}) {
	const { allRows, section, sectionSelectionVersion } = useSurveyData();
	const { ALL_LABELS, MAIN_OPTS, STUDENT_OPTS, STAFF_OPTS, counts } = useGraphPickerData(section);
	const [internalPaused, setInternalPaused] = useState(true);
	const [tooltipIndex, setTooltipIndex] = useState(() => shouldPreviewTouchRow() ? TOUCH_PREVIEW_INDEX : null);
	const listRef = useRef(null);
	useEffect(() => {
		const handler = (e) => {
			if (listRef.current && !listRef.current.contains(e.target)) setTooltipIndex(null);
		};
		document.addEventListener("pointerdown", handler);
		return () => {
			document.removeEventListener("pointerdown", handler);
		};
	}, []);
	useEffect(() => {
		if (typeof window === "undefined" || typeof window.matchMedia !== "function") return;
		const query = window.matchMedia("(hover: none), (pointer: coarse)");
		const syncTouchPreview = () => {
			if (query.matches) setTooltipIndex((current) => current ?? TOUCH_PREVIEW_INDEX);
		};
		query.addEventListener("change", syncTouchPreview);
		return () => {
			query.removeEventListener("change", syncTouchPreview);
		};
	}, []);
	const [localSectionState, setLocalSectionState] = useState({
		sourceSection: section,
		sourceSelectionVersion: sectionSelectionVersion,
		value: section
	});
	const localSection = localSectionState.sourceSection === section && localSectionState.sourceSelectionVersion === sectionSelectionVersion ? localSectionState.value : section;
	const effectivePaused = paused ?? internalPaused;
	const setEffectivePaused = useCallback((nextPaused) => {
		if (paused === void 0) setInternalPaused(nextPaused);
		onPausedChange?.(nextPaused);
	}, [onPausedChange, paused]);
	const setLocalSection = useCallback((value) => {
		setLocalSectionState({
			sourceSection: section,
			sourceSelectionVersion: sectionSelectionVersion,
			value
		});
	}, [section, sectionSelectionVersion]);
	const cycleSections = useMemo(() => {
		const ordered = [
			...MAIN_OPTS,
			...STUDENT_OPTS,
			...STAFF_OPTS
		].filter((opt) => opt.id !== "__go-back" && opt.id !== "__choose-student" && opt.id !== "__choose-staff").filter((opt, index, arr) => arr.findIndex((item) => item.id === opt.id) === index).filter((opt) => (counts[opt.id] ?? 0) > 0 || opt.id === localSection);
		if (!ordered.length && localSection) return [{
			id: localSection,
			label: ALL_LABELS.get(localSection) ?? localSection
		}];
		return ordered;
	}, [
		ALL_LABELS,
		MAIN_OPTS,
		STAFF_OPTS,
		STUDENT_OPTS,
		counts,
		localSection
	]);
	useEffect(() => {
		if (effectivePaused || cycleSections.length <= 1) return;
		const timer = window.setInterval(() => {
			const currentIndex = cycleSections.findIndex((item) => item.id === localSection);
			setLocalSection(cycleSections[currentIndex >= 0 ? (currentIndex + 1) % cycleSections.length : 0].id);
		}, AUTOPLAY_MS);
		return () => {
			window.clearInterval(timer);
		};
	}, [
		cycleSections,
		effectivePaused,
		localSection,
		setLocalSection
	]);
	const rowsForLocalSection = useMemo(() => {
		if (!localSection || localSection === "all") return allRows;
		if (localSection === "all-massart") {
			const allowed = new Set([...STUDENT_OPTS.map((opt) => opt.id), ...STAFF_OPTS.map((opt) => opt.id)]);
			return allRows.filter((row) => allowed.has(row.section));
		}
		if (localSection === "all-students") {
			const allowed = new Set(STUDENT_OPTS.map((opt) => opt.id));
			return allRows.filter((row) => allowed.has(row.section));
		}
		if (localSection === "all-staff") {
			const allowed = new Set(STAFF_OPTS.map((opt) => opt.id));
			return allRows.filter((row) => allowed.has(row.section));
		}
		return allRows.filter((row) => row.section === localSection);
	}, [
		STUDENT_OPTS,
		STAFF_OPTS,
		allRows,
		localSection
	]);
	const avgs = useMemo(() => Q_KEYS.map((key) => {
		const vals = rowsForLocalSection.map((row) => row[key]).filter((v) => typeof v === "number" && Number.isFinite(v));
		return vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : 0;
	}), [rowsForLocalSection]);
	const currentIndex = cycleSections.findIndex((item) => item.id === localSection);
	const currentSectionLabel = cycleSections.find((item) => item.id === localSection)?.label ?? ALL_LABELS.get(localSection) ?? (localSection ? localSection.replace(/-/g, " ") : "Everyone");
	const stepSection = (delta) => {
		if (!cycleSections.length) return;
		setLocalSection(cycleSections[currentIndex >= 0 ? (currentIndex + delta + cycleSections.length) % cycleSections.length : 0].id);
	};
	const sectionNav = /* @__PURE__ */ jsx(WidgetSectionNav, {
		title: currentSectionLabel,
		paused: effectivePaused,
		onPrevious: () => {
			stepSection(-1);
		},
		onNext: () => {
			stepSection(1);
		},
		onTogglePaused: () => {
			setEffectivePaused(!effectivePaused);
		}
	});
	const scoresList = /* @__PURE__ */ jsx("div", {
		className: "q-scores-list",
		ref: listRef,
		children: BUTTON_QUESTIONS.map((q, i) => {
			const pct = Math.round(avgs[i] * 100);
			return /* @__PURE__ */ jsxs("div", {
				className: `q-scores-item${tooltipIndex === i ? " is-active" : ""}`,
				role: "button",
				tabIndex: 0,
				"aria-label": `${q.prompt}: ${String(pct)}%`,
				"aria-pressed": tooltipIndex === i,
				onPointerEnter: (e) => {
					if (e.pointerType !== "touch") setTooltipIndex(i);
				},
				onPointerLeave: (e) => {
					if (e.pointerType !== "touch") setTooltipIndex(null);
				},
				onPointerDown: (e) => {
					e.stopPropagation();
					if (e.pointerType === "touch") setTooltipIndex(i);
				},
				onClick: (e) => {
					e.stopPropagation();
					setTooltipIndex(i);
				},
				onKeyDown: (e) => {
					if (e.key !== "Enter" && e.key !== " ") return;
					e.preventDefault();
					setTooltipIndex(i);
				},
				children: [
					/* @__PURE__ */ jsx("div", {
						className: "q-scores-item-head",
						children: /* @__PURE__ */ jsx("span", {
							className: "q-scores-prompt",
							children: q.prompt
						})
					}),
					/* @__PURE__ */ jsx("div", {
						className: "q-scores-track",
						children: /* @__PURE__ */ jsx("div", {
							className: "q-scores-fill",
							style: { width: `${String(pct)}%` }
						})
					}),
					/* @__PURE__ */ jsx("div", {
						className: "q-scores-pct-tip",
						children: /* @__PURE__ */ jsxs(HintBanner, {
							visible: tooltipIndex === i,
							children: [pct, "%"]
						})
					})
				]
			}, q.id);
		})
	});
	if (navOutsidePanel) return /* @__PURE__ */ jsxs(Fragment, { children: [sectionNav, /* @__PURE__ */ jsx("div", {
		className: panelClassName,
		children: /* @__PURE__ */ jsx("div", {
			className: "q-scores-panel",
			children: scoresList
		})
	})] });
	return /* @__PURE__ */ jsxs("div", {
		className: "q-scores-panel",
		children: [sectionNav, scoresList]
	});
}
//#endregion
//#region src/lib/hooks/useDisclosure.ts
function useDisclosure(initialOpen = false) {
	const [open, setOpen] = useState(initialOpen);
	return {
		open,
		setOpen,
		openDisclosure: useCallback(() => {
			setOpen(true);
		}, []),
		closeDisclosure: useCallback(() => {
			setOpen(false);
		}, []),
		toggleDisclosure: useCallback(() => {
			setOpen((value) => !value);
		}, [])
	};
}
//#endregion
//#region src/navigation/bottom/widgets/compact-graph-tools.tsx
var BarGraph$1 = lazy(() => import("./assets/bargraph-BhafEwDy.mjs"));
var TOOL_LABELS = {
	logs: "Logs",
	bar: "Bar graph",
	questions: "By question"
};
function ToolsGridIcon() {
	return /* @__PURE__ */ jsx("svg", {
		className: "compact-tools-icon",
		viewBox: "0 0 24 24",
		"aria-hidden": "true",
		children: /* @__PURE__ */ jsxs("g", {
			fill: "currentColor",
			children: [
				/* @__PURE__ */ jsx("circle", {
					cx: "6",
					cy: "6",
					r: "1.7"
				}),
				/* @__PURE__ */ jsx("circle", {
					cx: "12",
					cy: "6",
					r: "1.7"
				}),
				/* @__PURE__ */ jsx("circle", {
					cx: "18",
					cy: "6",
					r: "1.7"
				}),
				/* @__PURE__ */ jsx("circle", {
					cx: "6",
					cy: "12",
					r: "1.7"
				}),
				/* @__PURE__ */ jsx("circle", {
					cx: "12",
					cy: "12",
					r: "1.7"
				}),
				/* @__PURE__ */ jsx("circle", {
					cx: "18",
					cy: "12",
					r: "1.7"
				}),
				/* @__PURE__ */ jsx("circle", {
					cx: "6",
					cy: "18",
					r: "1.7"
				}),
				/* @__PURE__ */ jsx("circle", {
					cx: "12",
					cy: "18",
					r: "1.7"
				}),
				/* @__PURE__ */ jsx("circle", {
					cx: "18",
					cy: "18",
					r: "1.7"
				})
			]
		})
	});
}
function CompactGraphTools() {
	const { data } = useSurveyData();
	const { open, openDisclosure, closeDisclosure } = useDisclosure(false);
	const [activeTool, setActiveTool] = useState("logs");
	const [widgetAutoplayPaused, setWidgetAutoplayPaused] = useState(true);
	const triggerRef = useRef(null);
	const modalRef = useRef(null);
	useEscapeToClose(open, closeDisclosure);
	useFocusTrap({
		enabled: open,
		containerRef: modalRef,
		returnFocusRef: triggerRef
	});
	const openTools = () => {
		setActiveTool("logs");
		openDisclosure();
	};
	const modal = /* @__PURE__ */ jsxs("div", {
		className: `compact-tools-root${open ? " is-open" : ""}`,
		"aria-hidden": !open,
		children: [/* @__PURE__ */ jsx("button", {
			type: "button",
			className: "compact-tools-overlay",
			"aria-label": "Close graph tools",
			tabIndex: open ? 0 : -1,
			onClick: closeDisclosure
		}), /* @__PURE__ */ jsx("div", {
			className: "compact-tools-shell",
			children: /* @__PURE__ */ jsxs("div", {
				ref: modalRef,
				className: "compact-tools-modal",
				role: "dialog",
				"aria-modal": "true",
				"aria-label": "Graph tools",
				children: [
					/* @__PURE__ */ jsx("button", {
						type: "button",
						className: "compact-tools-close",
						"aria-label": "Close graph tools",
						onClick: closeDisclosure,
						children: /* @__PURE__ */ jsx(CloseIcon, { className: "ui-close" })
					}),
					/* @__PURE__ */ jsxs("div", {
						className: "compact-tools-content",
						children: [
							activeTool === "logs" && /* @__PURE__ */ jsx(LogsPanel, {
								className: "logs-popover compact-tools-logs",
								showCloseButton: false,
								onClose: closeDisclosure
							}),
							activeTool === "bar" && /* @__PURE__ */ jsx(GraphDataProvider, {
								data,
								children: /* @__PURE__ */ jsx(Suspense, {
									fallback: null,
									children: /* @__PURE__ */ jsx(BarGraph$1, {
										navOutsidePanel: true,
										panelClassName: "widgets-panel bar-graph compact-tools-widget-panel",
										paused: widgetAutoplayPaused,
										onPausedChange: setWidgetAutoplayPaused
									})
								})
							}),
							activeTool === "questions" && /* @__PURE__ */ jsx(SectionScores, {
								navOutsidePanel: true,
								panelClassName: "widgets-panel q-scores compact-tools-widget-panel",
								paused: widgetAutoplayPaused,
								onPausedChange: setWidgetAutoplayPaused
							})
						]
					}),
					/* @__PURE__ */ jsx("div", {
						className: "compact-tools-tabs",
						role: "tablist",
						"aria-label": "Graph tools",
						children: Object.keys(TOOL_LABELS).map((tool) => /* @__PURE__ */ jsx("button", {
							type: "button",
							className: `ui-toggle-option compact-tools-tab${activeTool === tool ? " is-active" : ""}`,
							role: "tab",
							"aria-selected": activeTool === tool,
							tabIndex: open ? 0 : -1,
							onClick: () => {
								setActiveTool(tool);
							},
							children: TOOL_LABELS[tool]
						}, tool))
					})
				]
			})
		})]
	});
	return /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsx("button", {
		ref: triggerRef,
		type: "button",
		className: "compact-tools-button",
		"aria-label": "Open graph tools",
		"aria-expanded": open,
		"aria-haspopup": "dialog",
		onClick: openTools,
		children: /* @__PURE__ */ jsx(ToolsGridIcon, {})
	}), typeof document !== "undefined" ? createPortal(modal, document.body) : modal] });
}
//#endregion
//#region src/navigation/bottom/nav-bottom.tsx
var BarGraph = lazy(() => import("./assets/bargraph-BhafEwDy.mjs"));
function NavBottom({ introActive = false }) {
	const { cityPanelOpen, setCityPanelOpen, questionnaireOpen, vizVisible, logsOpen, setLogsOpen, widgetsOpen, setWidgetsOpen, questionnaireNav, requestQuestionnaireAdvance } = useUiFlow();
	const { data } = useSurveyData();
	const windowWidth = useWindowWidth();
	const useCompactGraphNav = isMobileWidth(windowWidth);
	const showSeparatedGraphTools = vizVisible && !useCompactGraphNav;
	const visibleLogsOpen = showSeparatedGraphTools && logsOpen;
	const visibleWidgetsOpen = showSeparatedGraphTools && widgetsOpen;
	const aspectRatio = typeof window !== "undefined" ? window.innerWidth / window.innerHeight : 1.78;
	const pickerOffset = isDesktopWidth(windowWidth) ? graphToolsOffsetPx(visibleLogsOpen, visibleWidgetsOpen) * aspectRatio : 0;
	const [activeWidgetView, setActiveWidgetView] = useState("bar");
	const [widgetAutoplayPaused, setWidgetAutoplayPaused] = useState(true);
	const widgetsRef = useRef(null);
	const widgetsDialogRef = useRef(null);
	const widgetsTriggerRef = useRef(null);
	const logsWrapRef = useRef(null);
	const modeToggleRef = useRef(null);
	const [logsSlide, setLogsSlide] = useState(0);
	const [modeToggleShiftPx, setModeToggleShiftPx] = useState(0);
	const { visible: showQuestionnaireDisabledHint, show: flashQuestionnaireDisabledHint } = useTransientFlag(2200);
	const questionnaireDisabledHintVisible = showQuestionnaireDisabledHint && questionnaireNav.nextDisabled;
	const closeWidgets = useCallback(() => {
		setActiveWidgetView("bar");
		setWidgetsOpen(false);
	}, [setWidgetsOpen]);
	const toggleWidgetsOpen = useCallback(() => {
		if (visibleWidgetsOpen) {
			closeWidgets();
			return;
		}
		setActiveWidgetView("bar");
		setWidgetsOpen(true);
	}, [
		closeWidgets,
		setWidgetsOpen,
		visibleWidgetsOpen
	]);
	useEscapeToClose(visibleWidgetsOpen, closeWidgets);
	useFocusTrap({
		enabled: visibleWidgetsOpen,
		containerRef: widgetsDialogRef,
		returnFocusRef: widgetsTriggerRef
	});
	useLayoutEffect(() => {
		const logsWrap = logsWrapRef.current;
		if (!visibleLogsOpen || !logsWrap) {
			setLogsSlide(0);
			return;
		}
		const panelWidth = logsWrap.querySelector(".logs-popover-shell")?.getBoundingClientRect().width ?? logsWrap.getBoundingClientRect().width;
		const btnWidth = logsWrap.getBoundingClientRect().width;
		setLogsSlide(Math.max(0, panelWidth - btnWidth));
	}, [visibleLogsOpen, windowWidth]);
	useEffect(() => {
		if (showSeparatedGraphTools) return;
		setLogsOpen(false);
		setWidgetsOpen(false);
	}, [
		showSeparatedGraphTools,
		setLogsOpen,
		setWidgetsOpen
	]);
	useLayoutEffect(() => {
		if (!vizVisible || !modeToggleRef.current || useCompactGraphNav) {
			setModeToggleShiftPx(0);
			return;
		}
		const frame = window.requestAnimationFrame(() => {
			const modeToggleWidth = modeToggleRef.current?.offsetWidth ?? 0;
			const rootFontSize = typeof window !== "undefined" ? parseFloat(window.getComputedStyle(document.documentElement).fontSize) || 16 : 16;
			const overlapGapPx = rootFontSize * .4;
			const panelGapPx = rootFontSize * .3;
			const logsWrapRect = logsWrapRef.current?.getBoundingClientRect();
			const logsShell = logsWrapRef.current?.querySelector(".logs-popover-shell.is-open");
			const logsButton = logsWrapRef.current?.querySelector(".logs-button");
			const widgetsShell = widgetsRef.current?.querySelector(".widgets-popover-shell.is-open");
			const widgetsButton = widgetsRef.current?.querySelector(".widgets-button");
			const toolsLeft = logsWrapRect?.left ?? 0;
			const logsButtonWidth = logsButton?.getBoundingClientRect().width ?? logsWrapRect?.width ?? 0;
			const logsPanelWidth = logsShell?.getBoundingClientRect().width ?? logsButtonWidth;
			const widgetsButtonWidth = widgetsButton?.getBoundingClientRect().width ?? 0;
			const widgetsPanelWidth = widgetsShell?.getBoundingClientRect().width ?? widgetsButtonWidth;
			const logsRight = visibleLogsOpen ? toolsLeft + logsPanelWidth : 0;
			const widgetsControlWidth = visibleWidgetsOpen ? widgetsPanelWidth : widgetsButtonWidth;
			const widgetsRight = toolsLeft + (visibleLogsOpen ? logsPanelWidth : logsButtonWidth) + panelGapPx + widgetsControlWidth;
			const occupiedRight = Math.max(logsRight, widgetsRight);
			let shiftPx = 0;
			shiftPx = pickerOffset;
			const projectedLeft = window.innerWidth / 2 - modeToggleWidth / 2 + shiftPx;
			const overlapPx = occupiedRight + overlapGapPx - projectedLeft;
			if (overlapPx > 0) shiftPx += overlapPx;
			setModeToggleShiftPx((prev) => Math.abs(prev - shiftPx) < .5 ? prev : shiftPx);
		});
		return () => {
			window.cancelAnimationFrame(frame);
		};
	}, [
		vizVisible,
		useCompactGraphNav,
		visibleLogsOpen,
		visibleWidgetsOpen,
		logsSlide,
		pickerOffset,
		windowWidth
	]);
	if (!cityPanelOpen && !questionnaireOpen && !vizVisible) return null;
	return /* @__PURE__ */ jsxs(Fragment, { children: [
		/* @__PURE__ */ jsxs("div", {
			className: `bottom bottom-left${introActive ? " nav-first-enter" : ""}`,
			children: [
				(cityPanelOpen || questionnaireOpen) && /* @__PURE__ */ jsx("button", {
					type: "button",
					className: "city-button city-close-btn",
					"data-label": cityPanelOpen ? "Back" : "My city",
					onClick: () => {
						setCityPanelOpen(!cityPanelOpen);
					},
					"aria-label": cityPanelOpen ? "Back to questionnaire" : "Open city view",
					children: /* @__PURE__ */ jsx("span", {
						className: "city-button__inner",
						children: /* @__PURE__ */ jsx("span", { children: cityPanelOpen ? "Back" : "My city" })
					})
				}),
				showSeparatedGraphTools && /* @__PURE__ */ jsx("div", {
					ref: logsWrapRef,
					children: /* @__PURE__ */ jsx(LogsButton, {
						open: visibleLogsOpen,
						onOpenChange: setLogsOpen
					})
				}),
				showSeparatedGraphTools && /* @__PURE__ */ jsxs("div", {
					className: "widgets-wrap",
					ref: widgetsRef,
					style: { marginLeft: logsSlide > 0 ? `calc(${String(logsSlide)}px + 0.3rem)` : visibleWidgetsOpen ? "0.3rem" : void 0 },
					children: [/* @__PURE__ */ jsx("div", {
						className: `widgets-popover-shell${visibleWidgetsOpen ? " is-open" : ""}`,
						"aria-hidden": !visibleWidgetsOpen,
						children: /* @__PURE__ */ jsx("div", {
							className: "widgets-popover-clip",
							children: /* @__PURE__ */ jsxs("div", {
								ref: widgetsDialogRef,
								className: "widgets-popover",
								role: "dialog",
								"aria-label": "Widgets",
								"aria-modal": "true",
								children: [
									activeWidgetView === "bar" && /* @__PURE__ */ jsx(GraphDataProvider, {
										data,
										children: /* @__PURE__ */ jsx(Suspense, {
											fallback: null,
											children: /* @__PURE__ */ jsx(BarGraph, {
												navOutsidePanel: true,
												panelClassName: "widgets-view widgets-panel bar-graph",
												paused: widgetAutoplayPaused,
												onPausedChange: setWidgetAutoplayPaused
											})
										})
									}),
									activeWidgetView === "questions" && /* @__PURE__ */ jsx(SectionScores, {
										navOutsidePanel: true,
										panelClassName: "widgets-view widgets-panel q-scores",
										paused: widgetAutoplayPaused,
										onPausedChange: setWidgetAutoplayPaused
									}),
									/* @__PURE__ */ jsxs("div", {
										className: "widgets-tabs",
										role: "tablist",
										"aria-label": "Widgets",
										children: [/* @__PURE__ */ jsx("button", {
											type: "button",
											className: `ui-toggle-option widgets-tab${activeWidgetView === "bar" ? " is-active" : ""}`,
											role: "tab",
											"aria-selected": activeWidgetView === "bar",
											onClick: () => {
												setActiveWidgetView("bar");
											},
											children: "Bar graph"
										}), /* @__PURE__ */ jsx("button", {
											type: "button",
											className: `ui-toggle-option widgets-tab${activeWidgetView === "questions" ? " is-active" : ""}`,
											role: "tab",
											"aria-selected": activeWidgetView === "questions",
											onClick: () => {
												setActiveWidgetView("questions");
											},
											children: "By question"
										})]
									}),
									/* @__PURE__ */ jsx("div", {
										className: "widgets-footer",
										children: /* @__PURE__ */ jsx("button", {
											type: "button",
											className: "widgets-close-strip",
											"aria-label": "Close widgets",
											onClick: closeWidgets,
											children: /* @__PURE__ */ jsx(CloseIcon, { className: "ui-close" })
										})
									})
								]
							})
						})
					}), /* @__PURE__ */ jsx("button", {
						ref: widgetsTriggerRef,
						type: "button",
						className: "widgets-button",
						"data-label": "Widgets",
						"aria-expanded": visibleWidgetsOpen,
						"aria-haspopup": "dialog",
						"aria-label": "Widgets",
						onClick: toggleWidgetsOpen,
						children: /* @__PURE__ */ jsx("span", {
							className: "widgets-button__inner",
							children: "Widgets"
						})
					})]
				})
			]
		}),
		questionnaireOpen && !vizVisible && questionnaireNav.total > 0 && /* @__PURE__ */ jsx("div", {
			className: `bottom bottom-right${cityPanelOpen ? " is-behind-city-canvas" : ""}${introActive ? " nav-first-enter" : ""}`,
			children: /* @__PURE__ */ jsxs("div", {
				className: "questionnaire-nav-stack",
				children: [/* @__PURE__ */ jsxs("p", {
					className: "q-step-indicator questionnaire-nav-progress",
					"aria-live": "polite",
					"aria-atomic": "true",
					children: [
						questionnaireNav.step,
						" / ",
						questionnaireNav.total
					]
				}), /* @__PURE__ */ jsxs("div", {
					className: "questionnaire-nav-action",
					children: [/* @__PURE__ */ jsx("div", {
						className: `questionnaire-nav-hint${questionnaireDisabledHintVisible ? " is-visible" : ""}`,
						role: "status",
						"aria-live": "polite",
						children: /* @__PURE__ */ jsx("span", { children: "Select at least one answer." })
					}), /* @__PURE__ */ jsxs("button", {
						type: "button",
						className: `questionnaire${questionnaireNav.nextDisabled ? " is-disabled" : ""}`,
						"data-label": questionnaireNav.nextLabel,
						"aria-disabled": questionnaireNav.nextDisabled,
						onClick: () => {
							if (questionnaireNav.nextDisabled) {
								flashQuestionnaireDisabledHint();
								return;
							}
							requestQuestionnaireAdvance();
						},
						"aria-label": questionnaireNav.nextLabel === "Finish" ? "Finish survey and open results" : "Next question",
						children: [/* @__PURE__ */ jsx("span", {
							className: "questionnaire__ghost",
							"aria-hidden": "true",
							children: /* @__PURE__ */ jsx("span", { children: questionnaireNav.nextLabel })
						}), /* @__PURE__ */ jsx("span", {
							className: "questionnaire__inner",
							children: /* @__PURE__ */ jsx("span", { children: questionnaireNav.nextLabel })
						})]
					})]
				})]
			})
		}),
		vizVisible && /* @__PURE__ */ jsxs("div", {
			ref: modeToggleRef,
			className: `bottom ${useCompactGraphNav ? "bottom-mobile-right" : "bottom-center"}`,
			style: useCompactGraphNav ? void 0 : {
				transform: `translateX(calc(-50% + ${String(modeToggleShiftPx)}px))`,
				transition: "transform 0.2s ease"
			},
			children: [/* @__PURE__ */ jsx(ModeToggle, {}), useCompactGraphNav && /* @__PURE__ */ jsx(CompactGraphTools, {})]
		})
	] });
}
//#endregion
//#region src/navigation/navigation.tsx
var PLACEMENT_TRANSITION_MS = 220;
var Navigation = () => {
	const { darkMode } = usePreferences();
	const { vizVisible, questionnaireOpen, cityPanelOpen, animationVisible, hasCompletedSurvey, observerMode } = useUiFlow();
	const { myEntryId, mySection } = useIdentity();
	const [introActive, setIntroActive] = React.useState(true);
	const navRef = React.useRef(null);
	const previousPlacementRef = React.useRef(null);
	const previousRectsRef = React.useRef(null);
	const transitionFrameRef = React.useRef(null);
	const transitionTimeoutRef = React.useRef(null);
	const savedEntryId = myEntryId ?? getSessionItem("be.myEntryId");
	const savedSection = mySection ?? getSessionItem("be.mySection");
	const isLandingState = !vizVisible && !questionnaireOpen && !animationVisible && (!cityPanelOpen || cityPanelOpen && !!savedEntryId && !!savedSection && !questionnaireOpen && !vizVisible && !animationVisible && !hasCompletedSurvey && !observerMode);
	React.useEffect(() => {
		const timer = window.setTimeout(() => {
			setIntroActive(false);
		}, 520);
		return () => {
			window.clearTimeout(timer);
		};
	}, []);
	React.useLayoutEffect(() => {
		const navEl = navRef.current;
		const leftEl = navEl?.querySelector(".left");
		const rightEl = navEl?.querySelector(".right");
		if (!navEl || !leftEl || !rightEl) return;
		const clearMotion = () => {
			leftEl.style.transition = "";
			leftEl.style.transform = "";
			rightEl.style.transition = "";
			rightEl.style.transform = "";
		};
		if (transitionFrameRef.current !== null) {
			window.cancelAnimationFrame(transitionFrameRef.current);
			transitionFrameRef.current = null;
		}
		if (transitionTimeoutRef.current !== null) {
			window.clearTimeout(transitionTimeoutRef.current);
			transitionTimeoutRef.current = null;
		}
		clearMotion();
		const nextPlacement = isLandingState ? "centered" : "spread";
		const previousPlacement = previousPlacementRef.current;
		const previousRects = previousRectsRef.current;
		const nextRects = {
			left: leftEl.getBoundingClientRect(),
			right: rightEl.getBoundingClientRect()
		};
		const prefersReducedMotion = typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
		if (!introActive && !prefersReducedMotion && previousPlacement === "centered" && nextPlacement === "spread" && !!previousRects) {
			const motions = [{
				el: leftEl,
				deltaX: previousRects.left.left - nextRects.left.left
			}, {
				el: rightEl,
				deltaX: previousRects.right.left - nextRects.right.left
			}].filter(({ deltaX }) => Math.abs(deltaX) > .5);
			if (motions.length > 0) {
				motions.forEach(({ el, deltaX }) => {
					el.style.transition = "none";
					el.style.transform = `translateX(${String(Math.round(deltaX * 100) / 100)}px)`;
				});
				navEl.getBoundingClientRect();
				transitionFrameRef.current = window.requestAnimationFrame(() => {
					motions.forEach(({ el }) => {
						el.style.transition = `transform ${String(PLACEMENT_TRANSITION_MS)}ms cubic-bezier(.22,.61,.36,1)`;
						el.style.transform = "translateX(0px)";
					});
					transitionFrameRef.current = null;
				});
				transitionTimeoutRef.current = window.setTimeout(() => {
					clearMotion();
					transitionTimeoutRef.current = null;
				}, PLACEMENT_TRANSITION_MS + 40);
			}
		}
		previousPlacementRef.current = nextPlacement;
		previousRectsRef.current = nextRects;
		return () => {
			if (transitionFrameRef.current !== null) {
				window.cancelAnimationFrame(transitionFrameRef.current);
				transitionFrameRef.current = null;
			}
			if (transitionTimeoutRef.current !== null) {
				window.clearTimeout(transitionTimeoutRef.current);
				transitionTimeoutRef.current = null;
			}
		};
	}, [isLandingState, introActive]);
	return /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsxs("nav", {
		ref: navRef,
		className: `navigation${isLandingState ? " is-landing-centered" : ""}`,
		children: [/* @__PURE__ */ jsx(NavLeft, { introActive }), /* @__PURE__ */ jsx(NavRight, {
			isDark: darkMode,
			introActive
		})]
	}), /* @__PURE__ */ jsx(NavBottom, { introActive })] });
};
//#endregion
//#region src/graph-runtime/index.tsx
var Graph = React.lazy(() => import(
	/* webpackChunkName: "graph" */
	"./assets/data-boundary-CbJ6T3jh.mjs"
));
function VisualizationPage() {
	return /* @__PURE__ */ jsx(Suspense, {
		fallback: useMemo(() => /* @__PURE__ */ jsx("div", {
			style: {
				position: "fixed",
				inset: 0,
				display: "flex",
				alignItems: "center",
				justifyContent: "center",
				zIndex: 5,
				pointerEvents: "none",
				minHeight: "100dvh",
				background: "var(--ui-bg-page)"
			},
			"aria-busy": "true",
			"aria-live": "polite",
			children: /* @__PURE__ */ jsx("h4", {
				style: { opacity: .85 },
				children: "Loading..."
			})
		}), []),
		children: /* @__PURE__ */ jsx(Graph, {})
	});
}
//#endregion
//#region src/canvas-engine/runtime/util/transform.ts
/**
* At the start of a frame, normalize the canvas transform so drawing code
* can assume logical pixels. DPR lives in canvas metadata, not on the DOM node.
*/
function normalizeDprTransform(p) {
	const dpr = getCanvasMeta(p.canvas).dpr ?? 1;
	p.drawingContext.setTransform(dpr, 0, 0, dpr, 0, 0);
}
/**
* After a shape draw, some draw code may have mutated the ctx transform directly.
* This reasserts the expected DPR transform if it was changed.
*/
function reassertDprTransformIfMutated(p) {
	const ctx = p.drawingContext;
	const dpr = getCanvasMeta(p.canvas).dpr ?? 1;
	const T = ctx.getTransform();
	if (T.a !== dpr || T.d !== dpr || T.b !== 0 || T.c !== 0 || T.e !== 0 || T.f !== 0) ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}
//#endregion
//#region src/canvas-engine/runtime/geometry/padding.ts
/**
* Runtime padding policy.
* - If override is set, use it.
* - Otherwise resolve from CANVAS_PADDING for current lookup key.
*
* NOTE: CANVAS_PADDING entries can contain `null` for a device, and
* resolvePaddingSpec should implement fallback behavior.
*/
function getPaddingSpecForState(widthPx, sceneLookupKey, override) {
	if (override) return override;
	const byDevice = CANVAS_PADDING[sceneLookupKey];
	return resolvePaddingSpec(widthPx, byDevice);
}
//#endregion
//#region src/canvas-engine/grid-layout/gridMetrics.ts
/**
* Returns projected row depth for the bottom row of a footprint.
*
* Horizon grids compress distant rows and enlarge nearby rows on both sides of
* the horizon. That means row height is a better painter-order depth than raw
* screen Y: it works for both ground shapes and sky shapes.
*/
function metricsDepth(metrics, footprint) {
	const bottomRow = Math.max(0, Math.min(metrics.rowHeights.length - 1, footprint.r0 + footprint.h - 1));
	return metrics.rowHeights[bottomRow] ?? 0;
}
//#endregion
//#region src/canvas-engine/runtime/geometry/gridCache.ts
var EMPTY_METRICS = {
	rowHeights: [],
	rowOffsetY: [],
	colsPerRow: [],
	cellWPerRow: []
};
function createGridCache() {
	return {
		w: 0,
		h: 0,
		cell: 0,
		cellW: 0,
		cellH: 0,
		ox: 0,
		oy: 0,
		rows: 0,
		cols: 0,
		usedRows: 0,
		metrics: EMPTY_METRICS,
		specKey: null
	};
}
function invalidateGridCache(cache) {
	cache.w = 0;
	cache.h = 0;
	cache.cell = 0;
	cache.specKey = null;
}
function specKeyOf(spec) {
	return [
		String(spec.rows),
		String(spec.useTopRatio ?? 1),
		spec.horizonPos == null ? "" : String(spec.horizonPos)
	].join("|");
}
function computeGridCached(cache, p, spec) {
	const key = specKeyOf(spec);
	if (p.width === cache.w && p.height === cache.h && cache.specKey === key && cache.cell > 0) return cache;
	const { cell, cellW, cellH, ox, oy, rows, cols, metrics } = makeCenteredSquareGrid({
		w: p.width,
		h: p.height,
		rows: spec.rows,
		useTopRatio: spec.useTopRatio ?? 1,
		horizonPos: spec.horizonPos
	});
	const useTop = Math.max(.01, Math.min(1, spec.useTopRatio ?? 1));
	const usedRows = Math.max(1, Math.round(rows * useTop));
	cache.w = p.width;
	cache.h = p.height;
	cache.cell = cell;
	cache.cellW = cellW;
	cache.cellH = cellH;
	cache.ox = ox;
	cache.oy = oy;
	cache.rows = rows;
	cache.cols = cols;
	cache.usedRows = usedRows;
	cache.metrics = metrics;
	cache.specKey = key;
	return cache;
}
//#endregion
//#region src/canvas-engine/runtime/render/passes/shared/horizon.ts
function resolveHorizonRow(rowHeights) {
	if (!Array.isArray(rowHeights) || rowHeights.length < 1) return 0;
	const minH = Math.min(...rowHeights);
	return rowHeights.indexOf(minH);
}
//#endregion
//#region src/canvas-engine/runtime/render/passes/background/anchors.ts
function resolveAnchorK(anchor, anchors) {
	const resolvedBaseK = anchors?.visualHorizonK ?? .5;
	const offset = typeof anchor === "string" ? 0 : anchor.offset ?? 0;
	return clamp01$3((Number.isFinite(resolvedBaseK) ? resolvedBaseK : .5) + offset);
}
function resolveStopKValue(k, anchors) {
	return typeof k === "number" ? clamp01$3(k) : resolveAnchorK(k, anchors);
}
function resolveExplicitStopK(stop, anchors) {
	return stop.k === void 0 ? null : resolveStopKValue(stop.k, anchors);
}
function applyStopOscillation(k, stop, t) {
	return stop.oscK ? clamp01$3(k + stop.oscK.amp * Math.sin(2 * Math.PI * stop.oscK.hz * t)) : clamp01$3(k);
}
function resolveBackgroundStops(stops, t, anchors) {
	var _ref;
	if (stops.length === 0) return [];
	const resolved = stops.map((stop) => resolveExplicitStopK(stop, anchors));
	resolved[0] ?? (resolved[0] = 0);
	resolved[_ref = resolved.length - 1] ?? (resolved[_ref] = 1);
	for (let i = 0; i < resolved.length; i += 1) {
		if (resolved[i] !== null) continue;
		const startIndex = i - 1;
		let endIndex = i + 1;
		while (endIndex < resolved.length && resolved[endIndex] === null) endIndex += 1;
		const startK = startIndex >= 0 ? resolved[startIndex] ?? 0 : 0;
		const endK = endIndex < resolved.length ? resolved[endIndex] ?? 1 : 1;
		const span = Math.max(1, endIndex - startIndex);
		for (let j = i; j < endIndex; j += 1) resolved[j] = clamp01$3(startK + (endK - startK) * ((j - startIndex) / span));
		i = endIndex - 1;
	}
	return stops.map((stop, order) => ({
		stop,
		k: applyStopOscillation(resolved[order] ?? 0, stop, t),
		order
	})).sort((a, b) => a.k - b.k || a.order - b.order);
}
function createBackgroundAnchorContext(args) {
	const { p, padding, metrics } = args;
	const h = Math.max(1, p.height);
	const fallbackHorizonRow = resolveHorizonRow(metrics.rowHeights);
	const fallbackVisualY = metrics.rowOffsetY[fallbackHorizonRow] ?? h * .5;
	return { visualHorizonK: clamp01$3(typeof padding.horizonPos === "number" ? padding.horizonPos : fallbackVisualY / h) };
}
function backgroundAnchorCacheKey(anchors) {
	if (!anchors) return "anchors:none";
	return `anchors:${anchors.visualHorizonK.toFixed(4)}`;
}
//#endregion
//#region src/canvas-engine/runtime/render/cache/offscreenCache.ts
var CANVAS_LAYER_KEY = "canvas-layer";
function safeDpr(dpr) {
	return Number.isFinite(dpr) && dpr > 0 ? dpr : 1;
}
function rounded$2(value, precision = 10) {
	return String(Math.round(value * precision) / precision);
}
function canvasDpr(p) {
	return getCanvasMeta(p.canvas).dpr ?? 1;
}
function renderTargetKey(p, dpr) {
	return [
		String(p.canvas.width),
		String(p.canvas.height),
		rounded$2(p.width),
		rounded$2(p.height),
		rounded$2(dpr, 100)
	].join("|");
}
function snapBoundsToDevicePixels(bounds, dpr) {
	const ratio = safeDpr(dpr);
	const left = Math.floor(bounds.x * ratio);
	const top = Math.floor(bounds.y * ratio);
	const right = Math.ceil((bounds.x + bounds.w) * ratio);
	const bottom = Math.ceil((bounds.y + bounds.h) * ratio);
	return {
		...bounds,
		x: left / ratio,
		y: top / ratio,
		w: Math.max(1, right - left) / ratio,
		h: Math.max(1, bottom - top) / ratio
	};
}
function pixelSizeForBounds(bounds, dpr) {
	const ratio = safeDpr(dpr);
	const pixelW = Math.max(1, Math.round(bounds.w * ratio));
	const pixelH = Math.max(1, Math.round(bounds.h * ratio));
	return {
		pixelW,
		pixelH,
		pixels: pixelW * pixelH
	};
}
function maxCachePixelsForCanvas(p, maxPixelsPerCanvasPixel) {
	return Math.max(1, Math.floor(p.canvas.width * p.canvas.height * maxPixelsPerCanvasPixel));
}
function clearOffscreenEntry(entry) {
	entry.ctx.setTransform(1, 0, 0, 1, 0, 0);
	entry.ctx.clearRect(0, 0, entry.canvas.width, entry.canvas.height);
}
function drawCanvasLayer(p, entry, compositeAlpha = 1) {
	const alpha = Math.max(0, Math.min(1, compositeAlpha));
	if (alpha <= 0) return;
	const ctx = p.drawingContext;
	if (alpha >= 1) {
		ctx.drawImage(entry.canvas, 0, 0);
		return;
	}
	ctx.save();
	ctx.globalAlpha = alpha;
	ctx.drawImage(entry.canvas, 0, 0);
	ctx.restore();
}
function getOrCreateCanvasLayer(cache, p, dpr = 1) {
	const target = cache.syncRenderTarget(p, dpr);
	let entry = cache.get(CANVAS_LAYER_KEY);
	if (!entry) {
		entry = cache.createEntry({
			x: 0,
			y: 0,
			w: p.width,
			h: p.height
		}, dpr);
		cache.set(CANVAS_LAYER_KEY, entry);
	}
	return {
		entry,
		targetChanged: target.changed
	};
}
function releaseEntry(entry) {
	if (!entry) return;
	entry.canvas.width = 1;
	entry.canvas.height = 1;
}
function createEntry(bounds, dpr) {
	const canvas = document.createElement("canvas");
	const ctx = canvas.getContext("2d");
	if (!ctx) throw new Error("2D canvas context not available");
	const p = makeP(canvas, ctx);
	const { pixelW, pixelH, pixels } = pixelSizeForBounds(bounds, dpr);
	canvas.width = pixelW;
	canvas.height = pixelH;
	setCanvasMeta(canvas, {
		dpr,
		cssW: bounds.w,
		cssH: bounds.h
	});
	return {
		canvas,
		ctx,
		p,
		bounds,
		pixels
	};
}
function createOffscreenCache() {
	const entries = /* @__PURE__ */ new Map();
	let pixels = 0;
	let targetKey = "";
	function clearEntries() {
		const count = entries.size;
		for (const entry of entries.values()) releaseEntry(entry);
		entries.clear();
		pixels = 0;
		return count;
	}
	function trimEntries(maxPixels) {
		let trimmed = 0;
		while (pixels > maxPixels) {
			const oldest = entries.keys().next().value;
			if (typeof oldest !== "string") return trimmed;
			const entry = entries.get(oldest);
			pixels -= entry?.pixels ?? 0;
			entries.delete(oldest);
			releaseEntry(entry);
			trimmed += 1;
		}
		return trimmed;
	}
	return {
		get size() {
			return entries.size;
		},
		get pixels() {
			return pixels;
		},
		get(key) {
			return entries.get(key);
		},
		createEntry(bounds, dpr) {
			return createEntry(bounds, dpr);
		},
		set(key, entry) {
			const existing = entries.get(key);
			if (existing === entry) {
				entries.set(key, entry);
				return;
			}
			if (existing) {
				pixels -= existing.pixels;
				releaseEntry(existing);
			}
			pixels += entry.pixels;
			entries.set(key, entry);
		},
		touch(key, entry) {
			entries.delete(key);
			entries.set(key, entry);
		},
		clear() {
			const cleared = clearEntries();
			targetKey = "";
			return cleared;
		},
		syncRenderTarget(p, dpr) {
			const nextKey = renderTargetKey(p, dpr);
			if (nextKey === targetKey) return {
				changed: false,
				cleared: 0
			};
			const cleared = clearEntries();
			targetKey = nextKey;
			return {
				changed: true,
				cleared
			};
		},
		trim(maxPixels) {
			return trimEntries(maxPixels);
		}
	};
}
var BACKGROUNDS_LIGHT = { start: {
	base: "rgb(158, 222, 248)",
	overlay: {
		kind: "linear",
		from: {
			xK: .5,
			yK: 0
		},
		to: {
			xK: .5,
			yK: 1
		},
		stops: [
			{ rgba: "rgba(158, 222, 248)" },
			{ rgba: "rgb(175, 228, 255)" },
			{ rgba: "rgb(214, 242, 255)" },
			{ rgba: "rgb(214, 242, 255)" },
			{ rgba: "rgb(248, 243, 239)" },
			{
				k: "visualHorizon",
				rgba: "rgb(255, 226, 202)"
			},
			{
				k: "visualHorizon",
				rgba: "rgba(108, 214, 184, 0.95)",
				liveBlend: [.04, .12]
			},
			{
				rgba: "rgba(82, 184, 103, 0.97)",
				liveBlend: [.02, .08]
			},
			{ rgba: "rgba(112, 189, 116, 0.97)" },
			{
				k: .96,
				rgba: "rgba(120, 156, 102, 1)"
			},
			{
				k: .98,
				rgba: "rgba(120, 156, 102, 1)"
			},
			{
				k: .98,
				rgba: "rgb(248, 240, 234)"
			},
			{ rgba: "rgb(248, 240, 234)" }
		]
	}
} };
var BACKGROUNDS_START_DARK = { start: {
	base: "rgb(18, 26, 62)",
	overlay: {
		kind: "linear",
		from: {
			xK: .5,
			yK: 0
		},
		to: {
			xK: .5,
			yK: 1
		},
		stops: [
			{
				rgba: "rgb(20, 35, 68)",
				rightRgba: "rgb(44, 49, 60)"
			},
			{
				rgba: "rgb(49, 84, 126)",
				rightRgba: "rgb(67, 71, 93)"
			},
			{
				rgba: "rgb(68, 116, 179)",
				rightRgba: "rgb(98, 99, 129)"
			},
			{
				rgba: "rgb(79, 135, 198)",
				rightRgba: "rgb(124, 123, 172)",
				liveBlend: [.16, .2]
			},
			{
				k: "visualHorizon",
				rgba: "rgb(102, 158, 255)",
				rightRgba: "rgb(89, 91, 143)",
				liveBlend: [.04, .12],
				blendFromPrevious: false,
				blendToNext: false
			},
			{
				k: "visualHorizon",
				rgba: "rgb(157, 255, 239)",
				rightRgba: "rgb(237, 222, 137)",
				liveBlend: [.06, .12],
				blendFromPrevious: false
			},
			{
				rgba: "rgb(147, 236, 210)",
				rightRgba: "rgb(220, 210, 155)",
				liveBlend: [.08, .1]
			},
			{
				rgba: "rgb(138, 215, 176)",
				rightRgba: "rgb(210, 196, 160)",
				liveBlend: [.08, .12]
			},
			{
				k: .98,
				rgba: "rgb(125, 201, 148)",
				rightRgba: "rgb(205, 185, 158)",
				liveBlend: [.08, .1]
			},
			{
				k: .98,
				rgba: "#191a1b",
				rightRgba: "#272830"
			},
			{
				rgba: "#151516",
				rightRgba: "#272830"
			}
		]
	},
	stars: {
		count: [60, 90],
		topBandK: .5,
		minR: .9,
		maxR: 1.6,
		alpha: [[.5, 1.5], [.6, 1.6]],
		flickerHz: [[.42, .98], [.14, .34]]
	}
} };
var BACKGROUNDS_QUESTIONNAIRE = { questionnaire: {
	base: "rgb(158, 222, 248)",
	overlay: {
		kind: "linear",
		from: {
			xK: .5,
			yK: 0
		},
		to: {
			xK: .5,
			yK: 1
		},
		stops: [
			{ rgba: "rgba(158, 222, 248)" },
			{ rgba: "rgb(175, 228, 255)" },
			{ rgba: "rgb(214, 242, 255)" },
			{ rgba: "rgb(214, 242, 255)" },
			{ rgba: "rgb(248, 243, 239)" },
			{
				k: "visualHorizon",
				rgba: "rgb(255, 226, 202)"
			},
			{
				k: "visualHorizon",
				rgba: "rgba(108, 214, 184, 0.95)",
				liveBlend: [.04, .12]
			},
			{
				rgba: "rgba(82, 184, 103, 0.97)",
				liveBlend: [.02, .08]
			},
			{ rgba: "rgba(112, 189, 116, 0.97)" },
			{ rgba: "rgba(120, 156, 102, 1)" }
		]
	}
} };
var BACKGROUNDS_QUESTIONNAIRE_DARK = { questionnaire: {
	base: "rgb(18, 26, 62)",
	overlay: {
		kind: "linear",
		from: {
			xK: .5,
			yK: 0
		},
		to: {
			xK: .5,
			yK: 1
		},
		stops: [
			{
				rgba: "rgb(20, 35, 68)",
				rightRgba: "rgb(44, 49, 60)"
			},
			{
				rgba: "rgb(49, 84, 126)",
				rightRgba: "rgb(67, 71, 93)"
			},
			{
				rgba: "rgb(68, 116, 179)",
				rightRgba: "rgb(98, 99, 129)"
			},
			{
				rgba: "rgb(79, 135, 198)",
				rightRgba: "rgb(124, 123, 172)",
				liveBlend: [.16, .2]
			},
			{
				k: "visualHorizon",
				rgba: "rgb(102, 158, 255)",
				rightRgba: "rgb(89, 91, 143)",
				liveBlend: [.04, .12],
				blendFromPrevious: false,
				blendToNext: false
			},
			{
				k: "visualHorizon",
				rgba: "rgb(157, 255, 239)",
				rightRgba: "rgb(237, 222, 137)",
				liveBlend: [.06, .12],
				blendFromPrevious: false
			},
			{
				rgba: "rgb(147, 236, 210)",
				rightRgba: "rgb(220, 210, 155)",
				liveBlend: [.08, .1]
			},
			{
				rgba: "rgb(138, 215, 176)",
				rightRgba: "rgb(210, 196, 160)",
				liveBlend: [.08, .12]
			},
			{
				rgba: "rgb(125, 201, 148)",
				rightRgba: "rgb(205, 185, 158)",
				liveBlend: [.08, .1]
			}
		]
	},
	stars: {
		count: [36, 56],
		topBandK: .36,
		minR: .6,
		maxR: 1.2,
		alpha: [[.5, 1.5], [.6, 1.6]],
		flickerHz: [[.42, .98], [.14, .34]]
	}
} };
var BACKGROUNDS_CITY = { city: {
	base: "rgb(158, 222, 248)",
	overlay: {
		kind: "linear",
		from: {
			xK: .5,
			yK: 0
		},
		to: {
			xK: .5,
			yK: 1
		},
		stops: [
			{
				rgba: "rgb(158, 222, 248)",
				leftRgba: "rgb(138, 195, 228)",
				rightRgba: "rgb(138, 195, 228)"
			},
			{
				rgba: "rgb(175, 228, 255)",
				leftRgba: "rgb(148, 205, 240)",
				rightRgba: "rgb(148, 205, 240)"
			},
			{
				rgba: "rgb(214, 242, 255)",
				leftRgba: "rgb(188, 224, 248)",
				rightRgba: "rgb(188, 224, 248)"
			},
			{
				rgba: "rgb(248, 243, 239)",
				leftRgba: "rgb(228, 218, 208)",
				rightRgba: "rgb(228, 218, 208)"
			},
			{
				k: "visualHorizon",
				rgba: "rgb(255, 226, 202)",
				leftRgba: "rgb(232, 208, 178)",
				rightRgba: "rgb(232, 208, 178)"
			},
			{
				k: "visualHorizon",
				rgba: "rgba(108, 214, 184, 0.95)",
				liveBlend: [.04, .12]
			},
			{
				rgba: "rgba(82, 184, 103, 0.97)",
				liveBlend: [.02, .08]
			},
			{ rgba: "rgba(112, 189, 116, 0.97)" },
			{ rgba: "rgba(120, 156, 102, 1)" },
			{ rgba: "rgba(120, 156, 102, 1)" }
		]
	}
} };
var BACKGROUNDS_CITY_DARK = { city: {
	base: "rgb(18, 26, 62)",
	overlay: {
		kind: "linear",
		from: {
			xK: .5,
			yK: 0
		},
		to: {
			xK: .5,
			yK: 1
		},
		stops: [
			{
				rgba: "rgb(20, 35, 68)",
				leftRgba: "rgb(44, 49, 60)",
				rightRgba: "rgb(44, 49, 60)"
			},
			{
				rgba: "rgb(49, 84, 126)",
				leftRgba: "rgb(67, 71, 93)",
				rightRgba: "rgb(67, 71, 93)"
			},
			{
				rgba: "rgb(68, 116, 179)",
				leftRgba: "rgb(98, 99, 129)",
				rightRgba: "rgb(98, 99, 129)"
			},
			{
				rgba: "rgb(79, 135, 198)",
				leftRgba: "rgb(124, 123, 172)",
				rightRgba: "rgb(124, 123, 172)",
				liveBlend: [.16, .2]
			},
			{
				k: "visualHorizon",
				rgba: "rgb(102, 158, 255)",
				leftRgba: "rgb(89, 91, 143)",
				rightRgba: "rgb(89, 91, 143)",
				liveBlend: [.12, .12],
				blendFromPrevious: false,
				blendToNext: false
			},
			{
				k: "visualHorizon",
				rgba: "rgb(157, 255, 239)",
				leftRgba: "rgb(237, 222, 137)",
				rightRgba: "rgb(237, 222, 137)",
				liveBlend: [.12, .12],
				blendFromPrevious: false
			},
			{
				rgba: "rgb(147, 236, 210)",
				leftRgba: "rgb(220, 210, 155)",
				rightRgba: "rgb(220, 210, 155)",
				liveBlend: [.08, .1]
			},
			{
				rgba: "rgb(138, 215, 176)",
				leftRgba: "rgb(210, 196, 160)",
				rightRgba: "rgb(210, 196, 160)",
				liveBlend: [.08, .12]
			},
			{
				rgba: "rgb(125, 201, 148)",
				leftRgba: "rgb(205, 185, 158)",
				rightRgba: "rgb(205, 185, 158)",
				liveBlend: [.08, .1]
			}
		]
	},
	stars: {
		count: [24, 36],
		topBandK: .3,
		minR: .9,
		maxR: 2.1,
		alpha: [[.5, 1.5], [.6, 1.6]],
		flickerHz: [[.42, .98], [.14, .34]]
	}
} };
//#endregion
//#region src/canvas-engine/scene-rules/backgrounds/spotlight.ts
var SPOTLIGHT_BACKGROUND_VARIANTS = SPOTLIGHT_SLIDES.map((slide) => slide.background);
var SPOTLIGHT_DARK_BACKGROUND_VARIANTS = SPOTLIGHT_SLIDES.map((slide) => slide.darkBackground);
var BACKGROUNDS_SPOTLIGHT = { spotlight: {
	...SPOTLIGHT_SLIDES[0].background,
	runtimePreset: {
		selector: "spotlightIndex",
		entries: SPOTLIGHT_BACKGROUND_VARIANTS
	}
} };
var BACKGROUNDS_SPOTLIGHT_DARK = { spotlight: {
	...SPOTLIGHT_SLIDES[0].darkBackground,
	runtimePreset: {
		selector: "spotlightIndex",
		entries: SPOTLIGHT_DARK_BACKGROUND_VARIANTS
	}
} };
//#endregion
//#region src/canvas-engine/scene-rules/backgrounds/index.ts
var BACKGROUNDS = {
	...BACKGROUNDS_LIGHT,
	...BACKGROUNDS_QUESTIONNAIRE,
	city: BACKGROUNDS_CITY.city,
	spotlight: BACKGROUNDS_SPOTLIGHT.spotlight
};
({
	...BACKGROUNDS_START_DARK,
	...BACKGROUNDS_QUESTIONNAIRE_DARK
}), BACKGROUNDS_CITY_DARK.city, BACKGROUNDS_SPOTLIGHT_DARK.spotlight;
//#endregion
//#region src/canvas-engine/runtime/render/passes/shared/color.ts
function mix(a, b, t) {
	return a + (b - a) * t;
}
function easeBlendTaper(t) {
	const x = clamp01$3(t);
	return x * x * x;
}
function mixRgba(a, b, t) {
	const k = clamp01$3(t);
	return {
		r: mix(a.r, b.r, k),
		g: mix(a.g, b.g, k),
		b: mix(a.b, b.b, k),
		a: mix(a.a, b.a, k)
	};
}
function cssRgba(color) {
	const channel = (value) => Math.max(0, Math.min(255, Math.round(value)));
	return `rgba(${String(channel(color.r))}, ${String(channel(color.g))}, ${String(channel(color.b))}, ${String(clamp01$3(color.a))})`;
}
function parseCssColor(input) {
	const value = input.trim();
	if (value.startsWith("#")) {
		const hex = value.slice(1);
		if (hex.length === 3) return {
			r: parseInt(hex[0] + hex[0], 16),
			g: parseInt(hex[1] + hex[1], 16),
			b: parseInt(hex[2] + hex[2], 16),
			a: 1
		};
		if (hex.length === 6) return {
			r: parseInt(hex.slice(0, 2), 16),
			g: parseInt(hex.slice(2, 4), 16),
			b: parseInt(hex.slice(4, 6), 16),
			a: 1
		};
		return null;
	}
	const rgbaMatch = /^rgba?\(([^)]+)\)$/i.exec(value);
	if (!rgbaMatch) return null;
	const parts = rgbaMatch[1].split(",").map((part) => part.trim());
	if (parts.length < 3) return null;
	return {
		r: Number(parts[0]),
		g: Number(parts[1]),
		b: Number(parts[2]),
		a: parts.length < 4 ? 1 : Number(parts[3])
	};
}
function addAlphaOnlyLightStops(gradient, sourceKx, peakAlpha, innerRadiusK, outerRadiusK, innerPeakK = .42) {
	const rawStops = [
		[0, 0],
		[sourceKx - outerRadiusK, 0],
		[sourceKx - innerRadiusK, peakAlpha * innerPeakK],
		[sourceKx, peakAlpha],
		[sourceKx + innerRadiusK, peakAlpha * innerPeakK],
		[sourceKx + outerRadiusK, 0],
		[1, 0]
	];
	const stops = [];
	for (const [rawK, rawAlpha] of rawStops) {
		const k = clamp01$3(rawK);
		const alpha = clamp01$3(rawAlpha);
		const existing = stops.find((s) => Math.abs(s[0] - k) < 1e-4);
		if (existing) existing[1] = Math.max(existing[1], alpha);
		else stops.push([k, alpha]);
	}
	stops.sort((a, b) => a[0] - b[0]);
	for (const [k, alpha] of stops) gradient.addColorStop(k, `rgba(255,255,255,${String(alpha)})`);
}
function resolveStopColor(rgba, liveBlend, liveAvg) {
	if (!liveBlend) return rgba;
	const parsed = parseCssColor(rgba);
	if (!parsed) return rgba;
	const blendAmount = typeof liveBlend === "number" ? liveBlend : mix(liveBlend[0], liveBlend[1], easeBlendTaper(liveAvg));
	const tint = gradientColor(VIVID_COLOR_STOPS, liveAvg).rgb;
	const mixed = mixRgb(parsed, tint, blendAmount);
	return `rgba(${String(mixed.r)}, ${String(mixed.g)}, ${String(mixed.b)}, ${String(parsed.a)})`;
}
//#endregion
//#region src/canvas-engine/runtime/render/passes/atmosphere/stars.ts
function hash01$2(seed) {
	const x = Math.sin(seed * 127.1) * 43758.5453123;
	return x - Math.floor(x);
}
function gcd(a, b) {
	let x = Math.abs(Math.round(a));
	let y = Math.abs(Math.round(b));
	while (y !== 0) {
		const next = x % y;
		x = y;
		y = next;
	}
	return x || 1;
}
function coprimeStride(count) {
	if (count <= 2) return 1;
	const target = Math.max(1, Math.round(count * .6180339887498948));
	for (let offset = 0; offset < count; offset += 1) {
		const hi = target + offset;
		if (hi < count && gcd(hi, count) === 1) return hi;
		const lo = target - offset;
		if (lo > 0 && gcd(lo, count) === 1) return lo;
	}
	return 1;
}
function starX(index, count, width, stride) {
	if (count <= 1) return width * hash01$2(index + 1.11);
	return (index * stride % count + hash01$2(index + 1.11)) / count * width;
}
function isRangePair(value) {
	return Array.isArray(value[0]);
}
function resolveStarRange(value, liveAvg) {
	if (!isRangePair(value)) return value;
	return [mix(value[0][0], value[1][0], clamp01$3(liveAvg)), mix(value[0][1], value[1][1], clamp01$3(liveAvg))];
}
function resolveStarCount(count, liveAvg) {
	return Math.max(0, Math.round(typeof count === "number" ? count : mix(count[0], count[1], clamp01$3(liveAvg))));
}
function resolveMaxStarCount(count) {
	return Math.max(0, Math.round(typeof count === "number" ? count : Math.max(count[0], count[1])));
}
function createStarGeometryCache() {
	let lastKey = "";
	const stars = [];
	return Object.assign(function getStars(args) {
		const { width, height, spec } = args;
		const maxY = height * spec.topBandK;
		const starCount = resolveMaxStarCount(spec.count);
		const flickerRange = resolveStarRange(spec.flickerHz, 1);
		const key = [
			String(width),
			String(height),
			String(starCount),
			String(spec.topBandK),
			String(spec.minR),
			String(spec.maxR),
			String(flickerRange[0]),
			String(flickerRange[1])
		].join("|");
		if (key === lastKey) return stars;
		stars.length = 0;
		const xStride = coprimeStride(starCount);
		for (let i = 0; i < starCount; i += 1) stars.push({
			x: starX(i, starCount, width, xStride),
			y: hash01$2(i + 7.73) * maxY,
			r: spec.minR + (spec.maxR - spec.minR) * hash01$2(i + 15.37),
			hz: flickerRange[0] + (flickerRange[1] - flickerRange[0]) * hash01$2(i + 23.91),
			phase: hash01$2(i + 31.17) * Math.PI * 2
		});
		lastKey = key;
		return stars;
	}, { clear() {
		lastKey = "";
		stars.length = 0;
	} });
}
function drawStars(p, ctx, spec, liveAvg, getStars) {
	const t = p.millis() / 1e3;
	const stars = getStars({
		width: p.width,
		height: p.height,
		spec
	});
	const activeCount = Math.min(stars.length, resolveStarCount(spec.count, liveAvg));
	const alphaRange = resolveStarRange(spec.alpha, liveAvg);
	ctx.save();
	for (let i = 0; i < activeCount; i += 1) {
		const star = stars[i];
		const twinkle = .5 + .5 * Math.sin(t * star.hz * Math.PI * 2 + star.phase);
		const alpha = alphaRange[0] + (alphaRange[1] - alphaRange[0]) * twinkle;
		ctx.fillStyle = `rgba(245, 248, 255, ${String(alpha)})`;
		ctx.beginPath();
		ctx.arc(star.x, star.y, star.r, 0, Math.PI * 2);
		ctx.fill();
	}
	ctx.restore();
}
function resolveBackgroundSpec$1(sceneLookup, override) {
	return override ?? BACKGROUNDS[sceneLookup];
}
function drawBackgroundStarsOnly(p, sceneLookup, override = null, alpha = 1, liveAvg = .5, getStars) {
	const spec = resolveBackgroundSpec$1(sceneLookup, override);
	if (!spec.stars) return;
	const ctx = p.drawingContext;
	ctx.save();
	ctx.globalAlpha = alpha;
	drawStars(p, ctx, spec.stars, liveAvg, getStars);
	ctx.restore();
}
//#endregion
//#region src/canvas-engine/runtime/render/passes/background/surface.ts
function resolveStopRgba(rgba, liveBlend, liveAvg) {
	return parseCssColor(resolveStopColor(rgba, liveBlend, liveAvg));
}
function resolveSurfaceStops(spec, liveAvg, t, anchors) {
	const stops = [];
	for (const resolved of resolveBackgroundStops(spec.stops, t, anchors)) {
		const { stop, k, order } = resolved;
		let leftSource = stop.rgba;
		let center;
		if (stop.leftRgba) {
			leftSource = stop.leftRgba;
			center = resolveStopRgba(stop.rgba, stop.liveBlend, liveAvg) ?? void 0;
		}
		const left = resolveStopRgba(leftSource, stop.liveBlend, liveAvg);
		const right = resolveStopRgba(stop.rightRgba ?? stop.rgba, stop.liveBlend, liveAvg);
		if (!left || !right) return null;
		stops.push({
			k,
			left,
			center: center ?? void 0,
			right,
			blendFromPrevious: stop.blendFromPrevious !== false,
			blendToNext: stop.blendToNext !== false,
			order
		});
	}
	return stops;
}
function drawSurfaceBand(ctx, width, top, bottom, left, right, center) {
	const y0 = Math.max(0, Math.round(Math.min(top, bottom)));
	const y1 = Math.max(0, Math.round(Math.max(top, bottom)));
	if (y1 <= y0) return;
	const g = ctx.createLinearGradient(0, 0, width, 0);
	g.addColorStop(0, cssRgba(left));
	if (center) g.addColorStop(.5, cssRgba(center));
	g.addColorStop(1, cssRgba(right));
	ctx.fillStyle = g;
	ctx.fillRect(0, y0, width, y1 - y0);
}
function drawBlendedSurfaceSegment(ctx, width, top, bottom, a, b) {
	const h = bottom - top;
	if (h <= 0) return;
	const y0 = Math.max(0, Math.round(top));
	const y1 = Math.max(0, Math.round(bottom));
	const aCenter = a.center;
	const bCenter = b.center;
	for (let y = y0; y < y1; y += 1) {
		const localT = clamp01$3((y + .5 - top) / h);
		drawSurfaceBand(ctx, width, y, y + 1, mixRgba(a.left, b.left, localT), mixRgba(a.right, b.right, localT), aCenter && bCenter ? mixRgba(aCenter, bCenter, localT) : void 0);
	}
}
function drawLinearStopSurface(p, ctx, spec, alpha, liveAvg, t, anchors) {
	const stops = resolveSurfaceStops(spec, liveAvg, t, anchors);
	if (!stops) return false;
	ctx.save();
	ctx.globalAlpha = alpha;
	const first = stops[0];
	drawSurfaceBand(ctx, p.width, 0, first.k * p.height, first.left, first.right, first.center);
	for (let i = 0; i < stops.length - 1; i += 1) {
		const a = stops[i];
		const b = stops[i + 1];
		const y0 = a.k * p.height;
		const y1 = b.k * p.height;
		if (y1 <= y0) continue;
		if (a.blendToNext && b.blendFromPrevious) drawBlendedSurfaceSegment(ctx, p.width, y0, y1, a, b);
		else drawSurfaceBand(ctx, p.width, y0, y1, a.left, a.right, a.center);
	}
	const last = stops[stops.length - 1];
	drawSurfaceBand(ctx, p.width, last.k * p.height, p.height, last.left, last.right, last.center);
	ctx.restore();
	return true;
}
//#endregion
//#region src/canvas-engine/runtime/render/passes/background/background.ts
function resolveOuterRadius(p, outer) {
	if (outer === "diag") return Math.hypot(p.width, p.height);
	return Math.max(1, outer.k) * Math.max(p.width, p.height);
}
function resolveLinearPoints(p, spec) {
	return {
		x1: p.width * spec.from.xK,
		y1: p.height * spec.from.yK,
		x2: p.width * spec.to.xK,
		y2: p.height * spec.to.yK
	};
}
function resolveBackgroundSpec(sceneLookup, override) {
	return override ?? BACKGROUNDS[sceneLookup];
}
function drawBackground(p, sceneLookup, override = null, alpha = 1, liveAvg = .5, skipStars = false, anchors, getStars) {
	const spec = resolveBackgroundSpec(sceneLookup, override);
	const ctx = p.drawingContext;
	if (alpha >= 1) p.background(spec.base);
	else {
		ctx.save();
		ctx.globalAlpha = alpha;
		ctx.fillStyle = spec.base;
		ctx.fillRect(0, 0, p.width, p.height);
		ctx.restore();
	}
	const overlay = spec.overlay;
	if (overlay) if (overlay.kind === "solid") {
		ctx.save();
		ctx.globalAlpha = alpha;
		ctx.fillStyle = overlay.color;
		ctx.fillRect(0, 0, p.width, p.height);
		ctx.restore();
	} else if (overlay.kind === "linear") {
		const t = p.millis() / 1e3;
		if (!(overlay.stops.some((stop) => !!stop.rightRgba || stop.blendFromPrevious === false || stop.blendToNext === false) ? drawLinearStopSurface(p, ctx, overlay, alpha, liveAvg, t, anchors) : false)) {
			const { x1, y1, x2, y2 } = resolveLinearPoints(p, overlay);
			const g = ctx.createLinearGradient(x1, y1, x2, y2);
			for (const resolved of resolveBackgroundStops(overlay.stops, t, anchors)) {
				const { stop, k } = resolved;
				g.addColorStop(k, resolveStopColor(stop.rgba, stop.liveBlend, liveAvg));
			}
			ctx.save();
			ctx.globalAlpha = alpha;
			ctx.fillStyle = g;
			ctx.fillRect(0, 0, p.width, p.height);
			ctx.restore();
		}
	} else {
		const cx = p.width * overlay.center.xK;
		const cy = p.height * overlay.center.yK;
		const inner = Math.min(p.width, p.height) * overlay.innerK;
		const outer = resolveOuterRadius(p, overlay.outer);
		const g = ctx.createRadialGradient(cx, cy, inner, cx, cy, outer);
		for (const resolved of resolveBackgroundStops(overlay.stops, p.millis() / 1e3, anchors)) {
			const { stop, k } = resolved;
			g.addColorStop(k, resolveStopColor(stop.rgba, stop.liveBlend, liveAvg));
		}
		ctx.save();
		ctx.globalAlpha = alpha;
		ctx.fillStyle = g;
		ctx.fillRect(0, 0, p.width, p.height);
		ctx.restore();
	}
	if (!skipStars && spec.stars) {
		ctx.save();
		ctx.globalAlpha = alpha;
		const starGeometry = getStars ?? createStarGeometryCache();
		drawStars(p, ctx, spec.stars, liveAvg, starGeometry);
		ctx.restore();
	}
}
//#endregion
//#region src/canvas-engine/runtime/render/passes/background/cache.ts
function createBgCache() {
	const cache = createOffscreenCache();
	let cacheKey = "";
	let lastOverride = void 0;
	return Object.assign(function drawBgCached(p, sceneLookup, override, liveAvg, anchors, compositeAlpha = 1) {
		const w = p.width;
		const h = p.height;
		const { entry, targetChanged } = getOrCreateCanvasLayer(cache, p);
		if (targetChanged) cacheKey = "";
		const liveAvgQ = Math.round(liveAvg * 100);
		const key = [
			String(w),
			String(h),
			sceneLookup,
			String(liveAvgQ),
			backgroundAnchorCacheKey(anchors)
		].join("|");
		if (key !== cacheKey || override !== lastOverride) {
			const offCtx = entry.ctx;
			clearOffscreenEntry(entry);
			drawBackground({
				drawingContext: offCtx,
				width: entry.bounds.w,
				height: entry.bounds.h,
				millis: () => 0,
				background: (color) => {
					offCtx.fillStyle = color;
					offCtx.fillRect(0, 0, entry.bounds.w, entry.bounds.h);
				}
			}, sceneLookup, override, 1, liveAvg, true, anchors);
			cacheKey = key;
			lastOverride = override;
		}
		drawCanvasLayer(p, entry, compositeAlpha);
	}, { clear() {
		cache.clear();
		cacheKey = "";
		lastOverride = void 0;
	} });
}
//#endregion
//#region src/canvas-engine/runtime/render/passes/atmosphere/fog.ts
function remap01(v, start, end) {
	if (end <= start) return v >= end ? 1 : 0;
	return clamp01$3((v - start) / (end - start));
}
function mixFogColor(a, b, k) {
	const kk = clamp01$3(k);
	return {
		r: Math.round(a.r + (b.r - a.r) * kk),
		g: Math.round(a.g + (b.g - a.g) * kk),
		b: Math.round(a.b + (b.b - a.b) * kk)
	};
}
function rgbaString(color, alpha) {
	return `rgba(${String(color.r)},${String(color.g)},${String(color.b)},${String(clamp01$3(alpha))})`;
}
function gradientCacheKey(gradientStops) {
	if (!gradientStops || gradientStops.length === 0) return "none";
	return gradientStops.map((stop) => `${String(stop.k)}:${String(stop.color.r)},${String(stop.color.g)},${String(stop.color.b)}`).join("|");
}
function isLightGradientSpec(value) {
	return Boolean(value && !Array.isArray(value));
}
function isFogGradientStops(value) {
	return Array.isArray(value);
}
function resolveLightGradient(spec, lightSource, fallbackRadiusK) {
	const centerK = clamp01$3(lightSource.xK);
	const centerColor = lightSource.color;
	const innerRadiusK = Math.max(.01, Math.min(.5, fallbackRadiusK ?? spec.innerRadiusK ?? .13));
	const outerFadeWidth = Math.max(.25, innerRadiusK * 2.5);
	const resolvedLeftEdgeColor = spec.leftEdgeColor ?? spec.edgeColor ?? centerColor;
	const resolvedRightEdgeColor = spec.rightEdgeColor ?? spec.edgeColor ?? centerColor;
	const colorAtK = (k) => {
		const dist = Math.abs(k - centerK);
		if (dist <= innerRadiusK) return centerColor;
		return mixFogColor(centerColor, k < centerK ? resolvedLeftEdgeColor : resolvedRightEdgeColor, clamp01$3((dist - innerRadiusK) / outerFadeWidth));
	};
	const stops = [{
		k: 0,
		color: colorAtK(0)
	}];
	const leftInnerK = centerK - innerRadiusK;
	if (leftInnerK > 0 && leftInnerK < 1) stops.push({
		k: leftInnerK,
		color: centerColor
	});
	stops.push({
		k: centerK,
		color: centerColor
	});
	const rightInnerK = centerK + innerRadiusK;
	if (rightInnerK > 0 && rightInnerK < 1) stops.push({
		k: rightInnerK,
		color: centerColor
	});
	stops.push({
		k: 1,
		color: colorAtK(1)
	});
	return stops;
}
function defaultLightGradient(darkMode) {
	return darkMode ? {
		leftEdgeColor: {
			r: 55,
			g: 58,
			b: 72
		},
		rightEdgeColor: {
			r: 14,
			g: 10,
			b: 32
		},
		innerRadiusK: .13
	} : {
		edgeColor: {
			r: 246,
			g: 246,
			b: 248
		},
		innerRadiusK: .13
	};
}
function resolveGradient(gradient, lightSource, fallbackRadiusK, darkMode = false) {
	if (!gradient) return lightSource ? resolveLightGradient(defaultLightGradient(darkMode), lightSource, fallbackRadiusK) : null;
	if (isFogGradientStops(gradient)) return gradient;
	if (isLightGradientSpec(gradient) && lightSource) return resolveLightGradient(gradient, lightSource, fallbackRadiusK);
	return null;
}
function fogOpacityScaleForRowCount(rowCount) {
	const rawScale = 18 / Math.max(1, rowCount);
	return Math.max(.45, Math.min(1, rawScale));
}
function resolveFogFillStyle(ctx, width, color, alpha, gradientStops) {
	if (!gradientStops || gradientStops.length === 0) return rgbaString(color, alpha);
	const g = ctx.createLinearGradient(0, 0, width, 0);
	for (const stop of gradientStops) g.addColorStop(clamp01$3(stop.k), rgbaString(stop.color, alpha));
	return g;
}
function blendGradientStopsTowardFog(stops, fogColor, fogBlendK) {
	return stops.map((stop) => ({
		k: stop.k,
		color: mixFogColor(stop.color, fogColor, fogBlendK)
	}));
}
function drawFogBand(args) {
	const { p, top, height, alpha255, overhangEdge, color, gradientStops = null, overhangPx } = args;
	if (height <= 0 || alpha255 <= 0) return;
	const ctx = p.drawingContext;
	const alpha = Math.max(0, Math.min(1, alpha255 / 255));
	const outerFeather = overhangPx ?? (overhangEdge === "top" ? Math.max(18, Math.min(72, height * .6)) : Math.max(10, Math.min(42, height * .35)));
	const fillFogRect = (rectTop, rectBottom) => {
		const y0 = Math.max(0, Math.round(rectTop));
		const y1 = Math.min(p.height, Math.round(rectBottom));
		if (y1 <= y0) return;
		ctx.save();
		ctx.fillStyle = resolveFogFillStyle(ctx, p.width, color, alpha, gradientStops);
		ctx.fillRect(0, y0, p.width, y1 - y0);
		ctx.restore();
	};
	if (overhangEdge === "bottom") {
		fillFogRect(top, top + height + outerFeather);
		return;
	}
	fillFogRect(top - outerFeather, top + height);
}
function skyFogTopOverhang(rowH) {
	return Math.max(4, Math.min(18, rowH * .35));
}
function skyFogRowHeight(fog, row, rectTop) {
	const nextRowTop = row + 1 < fog.horizonRow ? fog.rowOffsetY[row + 1] : fog.fogStartY;
	return Math.max(0, nextRowTop - rectTop);
}
function drawSkyFogLayer(p, fog, row) {
	const rectTop = fog.rowOffsetY[row] ?? 0;
	const rectH = fog.fogStartY - rectTop;
	if (rectH <= 0) return;
	const rowH = skyFogRowHeight(fog, row, rectTop);
	drawFogBand({
		p,
		top: rectTop,
		height: rectH,
		alpha255: Math.round(fog.skyLayerAlpha * 255),
		overhangEdge: "top",
		color: fog.fogColor,
		gradientStops: fog.skyFogGradient,
		overhangPx: skyFogTopOverhang(rowH)
	});
}
function computeFogState(args) {
	const { p, metrics, darkMode, spec, lightSource, hasHorizon } = args;
	if (metrics.rowHeights.length <= 2) return null;
	const fogColor = spec?.ground?.color ?? spec?.sky?.color ?? (darkMode ? {
		r: 33,
		g: 32,
		b: 40
	} : {
		r: 246,
		g: 246,
		b: 248
	});
	const baseFogLayerAlpha = spec?.ground?.layerAlpha ?? spec?.sky?.layerAlpha ?? (darkMode ? 44 / 255 : 26 / 255);
	if (!hasHorizon) {
		const flatFogLayerBoundaries = [...metrics.rowOffsetY.slice(1), p.height].filter((y) => Number.isFinite(y) && y > 0);
		const flatGradient = resolveGradient(spec?.ground?.groundGradient ?? spec?.sky?.skyGradient, lightSource, spec?.lightRadiusK, darkMode);
		return {
			isFlat: true,
			fogStartY: 0,
			fogCanvasH: p.height,
			horizonRow: 0,
			skyLayerAlpha: 0,
			rowOffsetY: [],
			groundFogLayerBoundaries: flatFogLayerBoundaries,
			fogColor,
			skyFogGradient: null,
			groundFogGradient: flatGradient,
			fogLayerAlpha255: Math.round(baseFogLayerAlpha * 255)
		};
	}
	const horizonRow = resolveHorizonRow(metrics.rowHeights);
	const fogStartY = metrics.rowOffsetY[horizonRow];
	if (!Number.isFinite(fogStartY)) return null;
	const fogCanvasH = p.height;
	const groundFogLayerBoundaries = [...metrics.rowOffsetY.slice(horizonRow + 1), fogCanvasH].filter((y) => Number.isFinite(y) && y > fogStartY);
	const rowCount = metrics.rowHeights.length;
	const fogLayerAlpha = baseFogLayerAlpha * fogOpacityScaleForRowCount(rowCount);
	const numGroundFogLayers = groundFogLayerBoundaries.length;
	const targetHorizonOpacity = numGroundFogLayers > 0 ? 1 - Math.pow(1 - fogLayerAlpha, numGroundFogLayers) : 0;
	const numSkyFogLayers = Math.max(0, horizonRow);
	const skyLayerAlpha = numSkyFogLayers > 0 ? 1 - Math.pow(1 - targetHorizonOpacity, 1 / numSkyFogLayers) : 0;
	const skyFogGradient = resolveGradient(spec?.sky?.skyGradient, lightSource, spec?.lightRadiusK, darkMode);
	const groundFogGradient = resolveGradient(spec?.ground?.groundGradient, lightSource, spec?.lightRadiusK, darkMode);
	return {
		isFlat: false,
		fogStartY,
		fogCanvasH,
		horizonRow,
		skyLayerAlpha,
		rowOffsetY: [...metrics.rowOffsetY],
		groundFogLayerBoundaries,
		fogColor,
		skyFogGradient,
		groundFogGradient,
		fogLayerAlpha255: Math.round(fogLayerAlpha * 255)
	};
}
function createFogStateCache() {
	let hasValue = false;
	let lastWidth = 0;
	let lastHeight = 0;
	let lastMetrics = null;
	let lastDarkMode = false;
	let lastSpec = void 0;
	let lastLightXK = null;
	let lastLightColorKey = "";
	let lastHasHorizon = false;
	let lastFog = null;
	return function getFogState(args) {
		const { p, metrics, darkMode, spec, lightSource } = args;
		const width = p.width;
		const height = p.height;
		const lightXK = lightSource?.xK ?? null;
		const lightColorKey = lightSource ? `${String(lightSource.color.r)},${String(lightSource.color.g)},${String(lightSource.color.b)}` : "";
		if (hasValue && width === lastWidth && height === lastHeight && metrics === lastMetrics && darkMode === lastDarkMode && spec === lastSpec && lightXK === lastLightXK && lightColorKey === lastLightColorKey && args.hasHorizon === lastHasHorizon) return lastFog;
		lastWidth = width;
		lastHeight = height;
		lastMetrics = metrics;
		lastDarkMode = darkMode;
		lastSpec = spec;
		lastLightXK = lightXK;
		lastLightColorKey = lightColorKey;
		lastHasHorizon = args.hasHorizon;
		lastFog = computeFogState(args);
		hasValue = true;
		return lastFog;
	};
}
function drawGroundFog(p, fog) {
	for (const rectBottom of fog.groundFogLayerBoundaries) {
		if (!Number.isFinite(rectBottom)) return;
		const rectTop = fog.fogStartY;
		const rectH = rectBottom - rectTop;
		const layerDepthT = fog.fogCanvasH > fog.fogStartY ? clamp01$3(rectH / (fog.fogCanvasH - fog.fogStartY)) : 0;
		const fogBlendK = 1 - (fog.groundFogGradient ? clamp01$3(Math.pow(remap01(layerDepthT, .3, 1), 1.36)) : 0);
		const gradientStops = fog.groundFogGradient ? blendGradientStopsTowardFog(fog.groundFogGradient, fog.fogColor, fogBlendK) : null;
		if (rectH <= 0) continue;
		drawFogBand({
			p,
			top: rectTop,
			height: rectH,
			alpha255: fog.fogLayerAlpha255,
			overhangEdge: "bottom",
			color: fog.fogColor,
			gradientStops
		});
	}
}
function drawFlatFog(p, fog) {
	drawFogBand({
		p,
		top: 0,
		height: p.height,
		alpha255: fog.fogLayerAlpha255,
		overhangEdge: "bottom",
		color: fog.fogColor,
		gradientStops: fog.groundFogGradient,
		overhangPx: 0
	});
}
function drawFogLayer(p, fog) {
	if (fog.isFlat) {
		drawFlatFog(p, fog);
		return;
	}
	drawSkyFog(p, fog);
	drawGroundFog(p, fog);
}
function drawSkyFog(p, fog) {
	if (fog.skyLayerAlpha <= 0 || fog.horizonRow <= 0) return;
	for (let r = 0; r < fog.horizonRow; r++) drawSkyFogLayer(p, fog, r);
}
//#endregion
//#region src/canvas-engine/runtime/render/passes/atmosphere/cache.ts
function createFogLayerCache() {
	const cache = createOffscreenCache();
	let cacheKey = "";
	return Object.assign(function drawFogLayerCached(p, fog, compositeAlpha = 1) {
		if (!fog) return;
		const w = p.width;
		const h = p.height;
		const { entry, targetChanged } = getOrCreateCanvasLayer(cache, p);
		if (targetChanged) cacheKey = "";
		const key = [
			String(w),
			String(h),
			fog.fogStartY.toFixed(1),
			String(fog.horizonRow),
			fog.skyLayerAlpha.toFixed(4),
			String(fog.fogLayerAlpha255),
			String(fog.fogColor.r),
			String(fog.fogColor.g),
			String(fog.fogColor.b),
			gradientCacheKey(fog.skyFogGradient),
			gradientCacheKey(fog.groundFogGradient),
			fog.rowOffsetY.join(","),
			fog.groundFogLayerBoundaries.join(",")
		].join("|");
		if (key !== cacheKey) {
			clearOffscreenEntry(entry);
			drawFogLayer({
				drawingContext: entry.ctx,
				width: entry.bounds.w,
				height: entry.bounds.h
			}, fog);
			cacheKey = key;
		}
		drawCanvasLayer(p, entry, compositeAlpha);
	}, { clear() {
		cache.clear();
		cacheKey = "";
	} });
}
//#endregion
//#region src/canvas-engine/runtime/render/passes/foliage/foliage.ts
function hash01$1(seed) {
	const x = Math.sin(seed * 127.1) * 43758.5453123;
	return x - Math.floor(x);
}
function resolveCount$1(count, liveAvg) {
	return Math.max(0, Math.round(typeof count === "number" ? count : mix(count[0], count[1], clamp01$3(liveAvg))));
}
function resolveMaxCount$1(count) {
	return Math.max(0, Math.round(typeof count === "number" ? count : Math.max(count[0], count[1])));
}
function colorForLayer$1(layer, index) {
	if (typeof layer.color === "string") return {
		color: layer.color,
		alpha: layer.alpha ?? 1
	};
	if (layer.color.length === 0) return {
		color: "rgb(80, 120, 90)",
		alpha: layer.alpha ?? 1
	};
	const choice = layer.color[index % layer.color.length] ?? layer.color[0];
	return {
		color: choice.color,
		alpha: choice.alpha ?? layer.alpha ?? 1
	};
}
function remapXExclude(xK, exclude) {
	const gap = Math.max(0, exclude[1] - exclude[0]);
	const available = 1 - gap;
	if (available <= 0) return 0;
	const scaled = xK * available;
	return scaled < exclude[0] ? scaled : scaled + gap;
}
function makePiece(layerSeed, index, colorCount) {
	return {
		xK: hash01$1(layerSeed + index * 11.13),
		yJitter: hash01$1(layerSeed + index * 17.71) * 2 - 1,
		heightK: hash01$1(layerSeed + index * 23.37),
		widthK: hash01$1(layerSeed + index * 29.91),
		leanK: hash01$1(layerSeed + index * 37.53) * 2 - 1,
		colorIndex: Math.floor(hash01$1(layerSeed + index * 41.19) * Math.max(1, colorCount))
	};
}
function drawLayer$1(args) {
	const { p, layer, liveAvg, anchors } = args;
	const count = resolveCount$1(layer.count, liveAvg);
	if (count <= 0) return;
	const maxCount = resolveMaxCount$1(layer.count);
	const colorCount = typeof layer.color === "string" ? 1 : layer.color.length;
	const xRange = layer.xRange ?? [0, 1];
	const yKTuple = Array.isArray(layer.yK) ? layer.yK : null;
	const yMin = resolveStopKValue(yKTuple ? yKTuple[0] : layer.yK, anchors) * p.height;
	const yMax = yKTuple ? resolveStopKValue(yKTuple[1], anchors) * p.height : yMin;
	const minH = Math.max(1, layer.heightPx[0]);
	const maxH = Math.max(minH, layer.heightPx[1]);
	const minW = Math.max(1, layer.widthPx?.[0] ?? 2);
	const maxW = Math.max(minW, layer.widthPx?.[1] ?? 5);
	const seed = layer.seed ?? 1;
	const ctx = p.drawingContext;
	ctx.save();
	for (let i = 0; i < Math.min(count, maxCount); i += 1) {
		const piece = makePiece(seed, i, colorCount);
		const pieceXK = layer.xExclude ? remapXExclude(piece.xK, layer.xExclude) : piece.xK;
		const xK = xRange[0] + (xRange[1] - xRange[0]) * pieceXK;
		const h = minH + (maxH - minH) * piece.heightK;
		const w = minW + (maxW - minW) * piece.widthK;
		const x = xK * p.width;
		const baseY = yKTuple ? yMin + (yMax - yMin) * ((piece.yJitter + 1) / 2) : yMin + piece.yJitter * Math.max(2, h * .18);
		const lean = piece.leanK * w * .8;
		const { color, alpha } = colorForLayer$1(layer, piece.colorIndex);
		ctx.globalAlpha = clamp01$3(alpha);
		ctx.fillStyle = color;
		ctx.beginPath();
		ctx.moveTo(x - w * .5, baseY);
		ctx.lineTo(x + w * .5, baseY);
		ctx.lineTo(x + lean, baseY - h);
		ctx.closePath();
		ctx.fill();
	}
	ctx.restore();
}
function drawFoliageLayer(args) {
	const { p, spec, liveAvg, anchors } = args;
	for (const layer of spec.layers) drawLayer$1({
		p,
		layer,
		liveAvg,
		anchors
	});
}
//#endregion
//#region src/canvas-engine/runtime/render/passes/foliage/cache.ts
function createFoliageLayerCache() {
	const cache = createOffscreenCache();
	let cacheKey = "";
	let lastSpec = void 0;
	return Object.assign(function drawFoliageLayerCached(args) {
		const { p, spec, liveAvg, anchors, compositeAlpha = 1 } = args;
		if (!spec || spec.layers.length === 0 || compositeAlpha <= 0) return;
		const { entry, targetChanged } = getOrCreateCanvasLayer(cache, p);
		if (targetChanged) cacheKey = "";
		const liveAvgQ = Math.round(liveAvg * 100);
		const key = [
			String(p.width),
			String(p.height),
			String(liveAvgQ),
			anchors?.visualHorizonK.toFixed(4) ?? "no-anchor"
		].join("|");
		if (key !== cacheKey || spec !== lastSpec) {
			clearOffscreenEntry(entry);
			drawFoliageLayer({
				p: {
					drawingContext: entry.ctx,
					width: entry.bounds.w,
					height: entry.bounds.h
				},
				spec,
				liveAvg,
				anchors
			});
			cacheKey = key;
			lastSpec = spec;
		}
		drawCanvasLayer(p, entry, compositeAlpha);
	}, { clear() {
		cache.clear();
		cacheKey = "";
		lastSpec = void 0;
	} });
}
//#endregion
//#region src/canvas-engine/runtime/render/passes/ambient-particles/ambientParticles.ts
function hash01(seed) {
	const x = Math.sin(seed * 127.1) * 43758.5453123;
	return x - Math.floor(x);
}
function resolveCount(count, liveAvg) {
	return Math.max(0, Math.round(typeof count === "number" ? count : mix(count[0], count[1], clamp01$3(liveAvg))));
}
function resolveMaxCount(count) {
	return Math.max(0, Math.round(typeof count === "number" ? count : Math.max(count[0], count[1])));
}
function makeParticle(layerSeed, index, colorCount) {
	return {
		xK: hash01(layerSeed + index * 11.13),
		yK: hash01(layerSeed + index * 17.71),
		sizeK: hash01(layerSeed + index * 23.37),
		speedXK: hash01(layerSeed + index * 29.91),
		speedYK: hash01(layerSeed + index * 37.53),
		phaseK: hash01(layerSeed + index * 41.19),
		colorIndex: Math.floor(hash01(layerSeed + index * 47.43) * Math.max(1, colorCount))
	};
}
function colorForLayer(layer, index) {
	if (typeof layer.color === "string") return {
		color: layer.color,
		alpha: layer.alpha ?? 1
	};
	if (layer.color.length === 0) return {
		color: "rgb(255, 255, 255)",
		alpha: layer.alpha ?? 1
	};
	const choice = layer.color[index % layer.color.length] ?? layer.color[0];
	return {
		color: choice.color,
		alpha: choice.alpha ?? layer.alpha ?? 1
	};
}
function wrap01(value) {
	return (value % 1 + 1) % 1;
}
function drawDotParticle(args) {
	const { ctx, x, y, size, color } = args;
	ctx.fillStyle = color;
	ctx.beginPath();
	ctx.arc(x, y, size, 0, Math.PI * 2);
	ctx.fill();
}
function drawRainParticle(args) {
	const { ctx, layer, particle, x, y, size, color } = args;
	const lengthMin = layer.lengthPx?.[0] ?? size * 5;
	const lengthMax = layer.lengthPx?.[1] ?? size * 9;
	const slantMin = layer.slantPx?.[0] ?? -size * 1.8;
	const slantMax = layer.slantPx?.[1] ?? -size * 3;
	const lineMin = layer.lineWidthPx?.[0] ?? Math.max(.5, size * .45);
	const lineMax = layer.lineWidthPx?.[1] ?? Math.max(lineMin, size * .75);
	const length = mix(lengthMin, lengthMax, particle.sizeK);
	const slant = mix(slantMin, slantMax, particle.speedXK);
	const lineWidth = mix(lineMin, lineMax, particle.speedYK);
	ctx.strokeStyle = color;
	ctx.lineWidth = lineWidth;
	ctx.lineCap = "round";
	ctx.beginPath();
	ctx.moveTo(x, y);
	ctx.lineTo(x + slant, y + length);
	ctx.stroke();
}
function drawLayer(args) {
	const { p, layer, liveAvg, timeSec, compositeAlpha } = args;
	const count = resolveCount(layer.count, liveAvg);
	if (count <= 0 || compositeAlpha <= 0) return;
	const maxCount = resolveMaxCount(layer.count);
	const xRange = layer.xRange ?? [0, 1];
	const yRange = layer.yRange ?? [0, 1];
	const speedXRange = layer.speedX ?? [3, 10];
	const speedYRange = layer.speedY ?? [0, 0];
	const colorCount = typeof layer.color === "string" ? 1 : layer.color.length;
	const seed = layer.seed ?? 1;
	const ctx = p.drawingContext;
	ctx.save();
	for (let i = 0; i < Math.min(count, maxCount); i += 1) {
		const particle = makeParticle(seed, i, colorCount);
		const speedXPx = mix(speedXRange[0], speedXRange[1], particle.speedXK);
		const speedYPx = mix(speedYRange[0], speedYRange[1], particle.speedYK);
		const rangeW = Math.max(1, (xRange[1] - xRange[0]) * p.width);
		const rangeH = Math.max(1, (yRange[1] - yRange[0]) * p.height);
		const xK = xRange[0] + (xRange[1] - xRange[0]) * wrap01(particle.xK + timeSec * speedXPx / rangeW);
		const yK = yRange[0] + (yRange[1] - yRange[0]) * wrap01(particle.yK + particle.phaseK + timeSec * speedYPx / rangeH);
		const size = mix(layer.sizePx[0], layer.sizePx[1], particle.sizeK);
		const { color, alpha } = colorForLayer(layer, particle.colorIndex);
		const x = xK * p.width;
		const y = yK * p.height;
		ctx.globalAlpha = clamp01$3(alpha * compositeAlpha);
		if (layer.shape === "rain") drawRainParticle({
			ctx,
			layer,
			particle,
			x,
			y,
			size,
			color
		});
		else drawDotParticle({
			ctx,
			x,
			y,
			size,
			color
		});
	}
	ctx.restore();
}
function drawAmbientParticles(args) {
	const { p, spec, liveAvg, timeMs, compositeAlpha = 1 } = args;
	if (!spec || spec.layers.length === 0 || compositeAlpha <= 0) return;
	const timeSec = timeMs / 1e3;
	for (const layer of spec.layers) drawLayer({
		p,
		layer,
		liveAvg,
		timeSec,
		compositeAlpha
	});
}
//#endregion
//#region src/canvas-engine/runtime/render/passes/light/rowLight.ts
var SKY_LIGHT_INNER_RADIUS_K = .1;
var SKY_LIGHT_OUTER_RADIUS_K = .26;
function drawRowTopLightOverlay(args) {
	const { p, metrics, light, alpha = 1, compositeAlpha = 1, minRow = 0, maxRowExclusive } = args;
	if (!light || alpha <= 0 || compositeAlpha <= 0) return;
	const { rowHeights, rowOffsetY } = metrics;
	if (rowHeights.length < 1 || rowOffsetY.length < 1) return;
	const ctx = p.drawingContext;
	const horizonRow = resolveHorizonRow(rowHeights);
	const maxBandH = Math.max(4, Math.min(18, p.height * .022));
	ctx.save();
	ctx.globalAlpha = alpha * compositeAlpha;
	const sourceKx = clamp01$3(light.sourceX / p.width);
	const firstRow = Math.max(0, Math.min(rowHeights.length, Math.floor(minRow)));
	const lastRow = Math.max(firstRow, Math.min(rowHeights.length, Math.floor(maxRowExclusive ?? rowHeights.length)));
	for (let r = firstRow; r < lastRow; r += 1) {
		const rowTop = rowOffsetY[r] ?? 0;
		const rowH = rowHeights[r] ?? 0;
		if (rowH <= 0) continue;
		const bandH = Math.max(2, Math.min(maxBandH, rowH * .16));
		const rowY = rowTop + bandH * .5;
		const verticalK = clamp01$3(1 - Math.abs(rowY - light.sourceY) / (p.height * .95));
		const skyK = r <= horizonRow ? 1 : clamp01$3(1 - (r - horizonRow) / Math.max(3, rowHeights.length - horizonRow)) * .72;
		const bandAlpha = .27 * verticalK * skyK;
		if (bandAlpha <= .003) continue;
		const g = ctx.createLinearGradient(0, 0, p.width, 0);
		addAlphaOnlyLightStops(g, sourceKx, bandAlpha, SKY_LIGHT_INNER_RADIUS_K, SKY_LIGHT_OUTER_RADIUS_K, .45);
		ctx.fillStyle = g;
		ctx.fillRect(0, rowTop, p.width, bandH);
	}
	ctx.restore();
}
//#endregion
//#region src/canvas-engine/runtime/render/passes/light/cache.ts
function createRowLightCache() {
	const cache = createOffscreenCache();
	let cacheKey = "";
	return Object.assign(function drawRowLightCached(args) {
		const { p, metrics, light, alpha = 1, compositeAlpha = 1, minRow = 0, maxRowExclusive } = args;
		if (!light || alpha <= 0 || compositeAlpha <= 0) return;
		const w = p.width;
		const h = p.height;
		const { entry, targetChanged } = getOrCreateCanvasLayer(cache, p);
		if (targetChanged) cacheKey = "";
		const key = [
			String(w),
			String(h),
			alpha.toFixed(3),
			String(minRow),
			maxRowExclusive == null ? "end" : String(maxRowExclusive),
			light.sourceX.toFixed(1),
			light.sourceY.toFixed(1),
			light.sceneDiag.toFixed(1),
			metrics.rowHeights.join(","),
			metrics.rowOffsetY.join(",")
		].join("|");
		if (key !== cacheKey) {
			clearOffscreenEntry(entry);
			drawRowTopLightOverlay({
				p: {
					drawingContext: entry.ctx,
					width: entry.bounds.w,
					height: entry.bounds.h
				},
				metrics,
				light,
				alpha,
				minRow,
				maxRowExclusive
			});
			cacheKey = key;
		}
		drawCanvasLayer(p, entry, compositeAlpha);
	}, { clear() {
		cache.clear();
		cacheKey = "";
	} });
}
//#endregion
//#region src/canvas-engine/runtime/render/passes/light/environmentLight.ts
function createEnvironmentLightResolver() {
	const cache = {
		itemsSource: null,
		width: 0,
		darkMode: false,
		styleSourceXK: null,
		source: null
	};
	function parseHexColor(hex) {
		const normalized = hex.trim().replace(/^#/, "");
		if (!/^[0-9a-fA-F]{6}$/.test(normalized)) return null;
		const value = Number.parseInt(normalized, 16);
		return {
			r: value >> 16 & 255,
			g: value >> 8 & 255,
			b: value & 255
		};
	}
	function environmentLightSourceFromStyle(style) {
		const source = style.shapeLightSource;
		if (!source) return null;
		const metadata = ENVIRONMENT_LIGHT_SHAPE.sun;
		if (!metadata) return null;
		const color = parseHexColor(style.darkMode && metadata[2] ? metadata[2] : metadata[1]);
		if (!color) return null;
		return {
			xK: Math.max(0, Math.min(1, source.xK)),
			color
		};
	}
	return function findEnvironmentLightSource(args) {
		const { items, style } = args;
		const width = Math.max(1, args.width);
		const styleSourceXK = style.shapeLightSource ? Math.max(0, Math.min(1, style.shapeLightSource.xK)) : null;
		if (items === cache.itemsSource && width === cache.width && style.darkMode === cache.darkMode && styleSourceXK === cache.styleSourceXK) return cache.source;
		cache.itemsSource = items;
		cache.width = width;
		cache.darkMode = style.darkMode;
		cache.styleSourceXK = styleSourceXK;
		cache.source = null;
		for (const item of items) {
			const metadata = ENVIRONMENT_LIGHT_SHAPE[item.shape];
			if (!metadata) continue;
			const [, lightColorHex, darkColorHex] = metadata;
			const color = parseHexColor(style.darkMode && darkColorHex ? darkColorHex : lightColorHex);
			if (!color) continue;
			cache.source = {
				xK: Math.max(0, Math.min(1, item.x / width)),
				color
			};
			return cache.source;
		}
		cache.source = environmentLightSourceFromStyle(style);
		return cache.source;
	};
}
//#endregion
//#region src/canvas-engine/runtime/render/surface.ts
function clearSceneSurfaceToUnderpaint(p) {
	const ctx = p.drawingContext;
	ctx.save();
	ctx.setTransform(1, 0, 0, 1, 0, 0);
	ctx.clearRect(0, 0, p.canvas.width, p.canvas.height);
	ctx.restore();
	normalizeDprTransform(p);
}
//#endregion
//#region src/canvas-engine/runtime/debug/depthMaskStats.ts
function createStats$1() {
	return {
		calls: 0,
		skippedUnsupported: 0,
		skippedAppear: 0,
		skippedBlend: 0,
		skippedBounds: 0,
		skippedWarmupBudget: 0,
		skippedTooLarge: 0,
		cleared: 0,
		created: 0,
		baked: 0,
		reused: 0,
		drawn: 0,
		trimmed: 0,
		allocatedPixels: 0,
		largestMaskPixels: 0,
		lastLogMs: 0
	};
}
function resetStats(stats) {
	const lastLogMs = stats.lastLogMs;
	Object.assign(stats, createStats$1());
	stats.lastLogMs = lastLogMs;
}
function depthMaskDebugEnabled() {
	if (typeof window === "undefined") return false;
	if (window.__BE_DEBUG_DEPTH_MASK === true) return true;
	try {
		return window.localStorage.getItem("be:debug:depth-mask") === "1";
	} catch {
		return false;
	}
}
function createDepthMaskDebugTracker() {
	const stats = createStats$1();
	return {
		markCall() {
			stats.calls += 1;
		},
		markSkippedUnsupported() {
			stats.skippedUnsupported += 1;
		},
		markSkippedAppear() {
			stats.skippedAppear += 1;
		},
		markSkippedBlend() {
			stats.skippedBlend += 1;
		},
		markSkippedBounds() {
			stats.skippedBounds += 1;
		},
		markSkippedWarmupBudget() {
			stats.skippedWarmupBudget += 1;
		},
		markSkippedTooLarge() {
			stats.skippedTooLarge += 1;
		},
		markCleared(count) {
			stats.cleared += count;
		},
		markCreated(maskPixels) {
			stats.created += 1;
			stats.allocatedPixels += maskPixels;
			stats.largestMaskPixels = Math.max(stats.largestMaskPixels, maskPixels);
		},
		markBaked() {
			stats.baked += 1;
		},
		markReused() {
			stats.reused += 1;
		},
		markTrimmed(count) {
			stats.trimmed += count;
		},
		markDrawn() {
			stats.drawn += 1;
		},
		maybeLog(cacheSize, cachePixels) {
			const now = performance.now();
			if (now - stats.lastLogMs < 1e3) return;
			stats.lastLogMs = now;
			if (!depthMaskDebugEnabled()) {
				resetStats(stats);
				return;
			}
			console.table({ "depth mask cache": {
				cacheSize,
				calls: stats.calls,
				drawn: stats.drawn,
				created: stats.created,
				baked: stats.baked,
				reused: stats.reused,
				trimmed: stats.trimmed,
				skippedUnsupported: stats.skippedUnsupported,
				skippedAppear: stats.skippedAppear,
				skippedBlend: stats.skippedBlend,
				skippedBounds: stats.skippedBounds,
				skippedWarmupBudget: stats.skippedWarmupBudget,
				skippedTooLarge: stats.skippedTooLarge,
				cleared: stats.cleared,
				cachePixels,
				allocatedPixels: stats.allocatedPixels,
				largestMaskPixels: stats.largestMaskPixels
			} });
			resetStats(stats);
		}
	};
}
function reportSchedulerTickError(id, err) {
	console.error(`[engine scheduler] tick failed for "${id}"`, err);
}
//#endregion
//#region src/canvas-engine/runtime/debug/farShapeCacheStats.ts
function createStats() {
	return {
		calls: 0,
		skippedDisabled: 0,
		skippedPolicy: 0,
		skippedNotFar: 0,
		skippedBounds: 0,
		skippedAppear: 0,
		genericHits: 0,
		genericMisses: 0,
		genericBakes: 0,
		genericCreated: 0,
		genericDrawn: 0,
		genericStaleDrawn: 0,
		genericBudgetSkips: 0,
		genericTooLarge: 0,
		stampCandidates: 0,
		stampHits: 0,
		stampMisses: 0,
		stampBakes: 0,
		stampCreated: 0,
		stampDrawn: 0,
		stampStaleDrawn: 0,
		stampBudgetSkips: 0,
		stampTooLarge: 0,
		stampMaskHits: 0,
		stampMaskMisses: 0,
		stampMaskBakes: 0,
		stampMaskCreated: 0,
		stampMaskDrawn: 0,
		stampMaskStaleDrawn: 0,
		stampMaskBudgetSkips: 0,
		stampMaskTooLarge: 0,
		trims: 0,
		clears: 0,
		renderTargetClears: 0,
		allocatedPixels: 0,
		largestEntryPixels: 0,
		genericCacheSize: 0,
		genericCachePixels: 0,
		stampCacheSize: 0,
		stampCachePixels: 0,
		stampMaskCacheSize: 0,
		stampMaskCachePixels: 0,
		genericFallbackKeys: 0,
		stampFallbackKeys: 0,
		stampMaskFallbackKeys: 0,
		lastUpdatedMs: 0
	};
}
var stats = createStats();
function touch() {
	stats.lastUpdatedMs = typeof performance !== "undefined" ? performance.now() : Date.now();
}
function addAllocatedPixels(pixels) {
	stats.allocatedPixels += pixels;
	stats.largestEntryPixels = Math.max(stats.largestEntryPixels, pixels);
}
function snapshot() {
	return { ...stats };
}
function reset() {
	Object.assign(stats, createStats());
	touch();
	return snapshot();
}
function installWindowHelpers() {
	if (typeof window === "undefined") return;
	const debugWindow = window;
	debugWindow.beCanvasCacheStats ?? (debugWindow.beCanvasCacheStats = snapshot);
	debugWindow.beResetCanvasCacheStats ?? (debugWindow.beResetCanvasCacheStats = reset);
}
function createFarShapeCacheDebugTracker() {
	installWindowHelpers();
	return {
		markCall() {
			stats.calls += 1;
			touch();
		},
		markSkippedDisabled() {
			stats.skippedDisabled += 1;
		},
		markSkippedPolicy() {
			stats.skippedPolicy += 1;
		},
		markSkippedNotFar() {
			stats.skippedNotFar += 1;
		},
		markSkippedBounds() {
			stats.skippedBounds += 1;
		},
		markSkippedAppear() {
			stats.skippedAppear += 1;
		},
		markGenericHit() {
			stats.genericHits += 1;
		},
		markGenericMiss() {
			stats.genericMisses += 1;
		},
		markGenericBake() {
			stats.genericBakes += 1;
		},
		markGenericCreated(pixels) {
			stats.genericCreated += 1;
			addAllocatedPixels(pixels);
		},
		markGenericDrawn() {
			stats.genericDrawn += 1;
		},
		markGenericStaleDrawn() {
			stats.genericStaleDrawn += 1;
		},
		markGenericBudgetSkip() {
			stats.genericBudgetSkips += 1;
		},
		markGenericTooLarge() {
			stats.genericTooLarge += 1;
		},
		markStampCandidate() {
			stats.stampCandidates += 1;
		},
		markStampHit() {
			stats.stampHits += 1;
		},
		markStampMiss() {
			stats.stampMisses += 1;
		},
		markStampBake() {
			stats.stampBakes += 1;
		},
		markStampCreated(pixels) {
			stats.stampCreated += 1;
			addAllocatedPixels(pixels);
		},
		markStampDrawn() {
			stats.stampDrawn += 1;
		},
		markStampStaleDrawn() {
			stats.stampStaleDrawn += 1;
		},
		markStampBudgetSkip() {
			stats.stampBudgetSkips += 1;
		},
		markStampTooLarge() {
			stats.stampTooLarge += 1;
		},
		markStampMaskHit() {
			stats.stampMaskHits += 1;
		},
		markStampMaskMiss() {
			stats.stampMaskMisses += 1;
		},
		markStampMaskBake() {
			stats.stampMaskBakes += 1;
		},
		markStampMaskCreated(pixels) {
			stats.stampMaskCreated += 1;
			addAllocatedPixels(pixels);
		},
		markStampMaskDrawn() {
			stats.stampMaskDrawn += 1;
		},
		markStampMaskStaleDrawn() {
			stats.stampMaskStaleDrawn += 1;
		},
		markStampMaskBudgetSkip() {
			stats.stampMaskBudgetSkips += 1;
		},
		markStampMaskTooLarge() {
			stats.stampMaskTooLarge += 1;
		},
		markTrimmed(count) {
			stats.trims += count;
		},
		markCleared(count) {
			stats.clears += count;
		},
		markRenderTargetCleared(count) {
			stats.renderTargetClears += count;
		},
		updateState(state) {
			Object.assign(stats, state);
			touch();
		}
	};
}
//#endregion
//#region src/canvas-engine/runtime/debug/flags.ts
var DEBUG_DEFAULT = {
	grid: false,
	gridAlpha: 1
};
//#endregion
//#region src/canvas-engine/runtime/debug/gridOverlay.ts
function drawGridOverlay(p, grid, spec, debug) {
	if (!debug.enabled) return;
	const { cellW, cellH, ox, oy, rows, cols, usedRows, metrics } = grid;
	const { rowOffsetY, rowHeights, colsPerRow, cellWPerRow } = metrics;
	if (!cellW || !cellH || !rows || !cols) return;
	const rowTop = (r) => rowOffsetY.length ? rowOffsetY[r] ?? r * cellH : r * cellH;
	const rowH = (r) => rowHeights.length ? rowHeights[r] ?? cellH : cellH;
	const rowCols = (r) => colsPerRow.length ? colsPerRow[r] ?? cols : cols;
	const rowCellW = (r) => cellWPerRow.length ? cellWPerRow[r] ?? cellW : cellW;
	const ctx = p.drawingContext;
	const gridAlpha = debug.gridAlpha ?? .35;
	const forbAlpha = debug.forbiddenAlpha ?? .25;
	const isDark = typeof document !== "undefined" && document.documentElement.getAttribute("data-theme") === "dark";
	const lineColor = isDark ? "rgba(199, 199, 199, 0.1)" : "rgba(0, 0, 0, 0.1)";
	ctx.save();
	ctx.globalAlpha = gridAlpha;
	ctx.lineWidth = 1;
	ctx.strokeStyle = lineColor;
	for (let r = 0; r < rows; r++) {
		const rCols = rowCols(r);
		const rCellW = rowCellW(r);
		const y0 = oy + rowTop(r);
		const y1 = y0 + rowH(r);
		for (let c = 0; c <= rCols; c++) {
			const x = Math.round(ox + c * rCellW) + .5;
			if (x < 0 || x > p.width) continue;
			ctx.beginPath();
			ctx.moveTo(x, y0);
			ctx.lineTo(x, y1);
			ctx.stroke();
		}
	}
	for (let r = 0; r <= rows; r++) {
		const y = Math.round(oy + rowTop(r)) + .5;
		if (y < 0 || y > p.height) continue;
		ctx.beginPath();
		ctx.moveTo(0, y);
		ctx.lineTo(p.width, y);
		ctx.stroke();
	}
	{
		const y = Math.round(oy + rowTop(usedRows)) + .5;
		ctx.strokeStyle = "rgba(255,0,0,0)";
		ctx.beginPath();
		ctx.moveTo(0, y);
		ctx.lineTo(p.width, y);
		ctx.stroke();
		ctx.strokeStyle = isDark ? "rgba(255,255,255,0.35)" : "rgba(0,0,0,0.35)";
	}
	if (spec.forbidden) {
		ctx.globalAlpha = forbAlpha;
		ctx.fillStyle = "rgba(0,0,0,0)";
		for (let r = 0; r < rows; r++) {
			const rCols = rowCols(r);
			const rCellW = rowCellW(r);
			for (let c = 0; c < rCols; c++) if (spec.forbidden(r, c, rows, rCols)) ctx.fillRect(ox + c * rCellW, oy + rowTop(r), rCellW, rowH(r));
		}
	}
	ctx.restore();
}
//#endregion
//#region src/canvas-engine/runtime/shape-adapter/options.ts
function copyGroup(group) {
	return group ? { ...group } : void 0;
}
function copyRuntimeShapeOptionsInto(target, source) {
	target.projection = copyGroup(source.projection);
	target.style = copyGroup(source.style);
	target.lifecycle = copyGroup(source.lifecycle);
	target.identity = copyGroup(source.identity);
	target.sprite = copyGroup(source.sprite);
	target.particles = copyGroup(source.particles);
	target.pass = copyGroup(source.pass);
	return target;
}
//#endregion
//#region src/canvas-engine/runtime/util/easing.ts
function easeOutCubic(t) {
	t = clamp01$3(t);
	const u = 1 - t;
	return 1 - u * u * u;
}
//#endregion
//#region src/canvas-engine/runtime/render/passes/shape/items.ts
function drawItems(params) {
	const { items, visible, nowMs, appearMs, appearStaggerMs, liveStates, perShapeScale, baseR, baseOpts, optsScratch, shapeOccurrenceScratch, renderOne } = params;
	if (!visible || !items.length) return;
	const shapeOccurrence = shapeOccurrenceScratch ?? /* @__PURE__ */ new Map();
	shapeOccurrence.clear();
	const opts = optsScratch ?? {};
	const staggerDenom = Math.max(1, items.length - 1);
	for (let itemIndex = 0; itemIndex < items.length; itemIndex += 1) {
		const it = items[itemIndex];
		let state = liveStates.get(it.id);
		if (!state) {
			state = { bornAtMs: nowMs };
			liveStates.set(it.id, state);
		}
		const bornAt = state.bornAtMs;
		const itemAppearMs = state.appearMs ?? appearMs;
		const itemStaggerMs = state.appearStaggerMs ?? appearStaggerMs;
		const staggerSpan = itemAppearMs > 0 ? Math.max(0, itemStaggerMs) : 0;
		let easedK = 1;
		let alphaK = 1;
		if (itemAppearMs > 0) {
			const delayMs = staggerSpan * itemIndex / staggerDenom;
			const elapsedMs = nowMs - bornAt - delayMs;
			if (elapsedMs <= 0) continue;
			easedK = easeOutCubic(clamp01$3(elapsedMs / itemAppearMs));
			alphaK = easedK;
		}
		const rEff = baseR * (perShapeScale?.[it.shape] ?? 1);
		const occurrenceIndex = shapeOccurrence.get(it.shape) ?? 0;
		shapeOccurrence.set(it.shape, occurrenceIndex + 1);
		copyRuntimeShapeOptionsInto(opts, baseOpts);
		const projection = opts.projection ?? (opts.projection = {});
		const style = opts.style ?? (opts.style = {});
		const identity = opts.identity ?? (opts.identity = {});
		const pass = opts.pass ?? (opts.pass = {});
		projection.footprint = it.footprint;
		projection.pixelFootprint = it.pixelFootprint;
		style.alpha = Math.round(235 * alphaK);
		identity.seedKey = `${it.shape}|${it.id}`;
		identity.shapeOccurrenceIndex = occurrenceIndex;
		pass.renderPass = "color";
		pass.maskColor = void 0;
		pass.maskAlpha = void 0;
		pass.depthTintColor = void 0;
		pass.depthTintK = void 0;
		renderOne(it, rEff, opts, easedK);
	}
}
//#endregion
//#region src/canvas-engine/runtime/render/passes/shape/itemOrder.ts
function itemDepth(item, gridMetrics) {
	return gridMetrics && item.footprint ? metricsDepth(gridMetrics, item.footprint) : item.y;
}
function itemScreenY(item, gridMetrics) {
	if (!gridMetrics || !item.footprint) return item.y;
	const bottomRow = Math.max(0, Math.min(gridMetrics.rowOffsetY.length - 1, item.footprint.r0 + item.footprint.h - 1));
	return gridMetrics.rowOffsetY[bottomRow] ?? item.y;
}
var SEA_OVER_SAME_ROW_SHAPES = new Set([
	"house",
	"trees",
	"villa"
]);
function compareSeaSameRowTie(a, b) {
	const aSeaOverShape = a.shape === "sea" && SEA_OVER_SAME_ROW_SHAPES.has(b.shape);
	const bSeaOverShape = b.shape === "sea" && SEA_OVER_SAME_ROW_SHAPES.has(a.shape);
	if (aSeaOverShape) return 1;
	if (bSeaOverShape) return -1;
	return 0;
}
function compareItemsForRender(a, b, { gridMetrics }) {
	const da = itemDepth(a, gridMetrics);
	const db = itemDepth(b, gridMetrics);
	if (da !== db) return da - db;
	const ya = itemScreenY(a, gridMetrics);
	const yb = itemScreenY(b, gridMetrics);
	if (ya !== yb) return ya - yb;
	const seaSameRowTie = compareSeaSameRowTie(a, b);
	if (seaSameRowTie !== 0) return seaSameRowTie;
	return a.id.localeCompare(b.id);
}
function sortItemsForRenderInto(target, items, context) {
	target.length = items.length;
	for (let i = 0; i < items.length; i += 1) target[i] = items[i];
	target.sort((a, b) => compareItemsForRender(a, b, context));
	return target;
}
//#endregion
//#region src/canvas-engine/runtime/shape-adapter/registry.ts
function withCatalogPasses(shape, draw) {
	const passes = SHAPE_RENDER_PASSES[shape] ?? [];
	draw.supportedRenderPasses = new Set(["color", ...passes]);
	return draw;
}
function supportsShapeRenderPass(draw, pass) {
	return pass === "color" || draw.supportedRenderPasses?.has(pass) === true;
}
function shapeRegistrySupportsRenderPass(registry, shape, pass) {
	const draw = registry.get(shape);
	return draw ? supportsShapeRenderPass(draw, pass) : false;
}
function createRegistry(entries) {
	return new Map(Object.entries(entries));
}
function createDefaultShapeRegistry() {
	return createRegistry({
		snow: withCatalogPasses("snow", (p2, it, rEff, opts) => {
			const vw = p2.width;
			const dt = deviceType(vw);
			const hideFrac = dt === "mobile" ? .56 : dt === "tablet" ? .52 : .5;
			const hideBucketT = dt === "mobile" ? .72 : dt === "tablet" ? .66 : .6;
			drawSnow(p2, it.x, it.y, rEff, {
				...opts,
				projection: {
					...opts.projection,
					footprint: it.footprint
				},
				hideGroundAboveFrac: hideFrac,
				hideGroundBelowBucketT: hideBucketT,
				showGround: true
			});
		}),
		house: withCatalogPasses("house", (p2, it, rEff, opts) => {
			drawHouse(p2, it.x, it.y, rEff, opts);
		}),
		power: withCatalogPasses("power", (p2, it, rEff, opts) => {
			drawPower(p2, it.x, it.y, rEff, opts);
		}),
		villa: withCatalogPasses("villa", (p2, it, rEff, opts) => {
			drawVilla(p2, it.x, it.y, rEff, opts);
		}),
		carFactory: withCatalogPasses("carFactory", (p2, it, rEff, opts) => {
			drawCarFactory(p2, it.x, it.y, rEff, opts);
		}),
		bus: withCatalogPasses("bus", (p2, it, rEff, opts) => {
			drawBus(p2, it.x, it.y, rEff, opts);
		}),
		trees: withCatalogPasses("trees", (p2, it, rEff, opts) => {
			drawTrees(p2, it.x, it.y, rEff, opts);
		}),
		car: withCatalogPasses("car", (p2, it, rEff, opts) => {
			drawCar(p2, it.x, it.y, rEff, opts);
		}),
		sea: withCatalogPasses("sea", (p2, it, rEff, opts) => {
			drawSea(p2, it.x, it.y, rEff, opts);
		}),
		sun: withCatalogPasses("sun", (p2, it, rEff, opts) => {
			drawSun(p2, it.x, it.y, rEff, opts);
		}),
		clouds: withCatalogPasses("clouds", (p2, it, rEff, opts) => {
			drawClouds(p2, it.x, it.y, rEff, opts);
		})
	});
}
//#endregion
//#region src/canvas-engine/runtime/shape-adapter/draw.ts
function drawItemFromRegistry(registry, p, it, rEff, opts) {
	const fn = registry.get(it.shape);
	if (!fn) return false;
	if (!supportsShapeRenderPass(fn, shapePass(opts).renderPass ?? "color")) return false;
	fn(p, it, rEff, opts);
	return true;
}
//#endregion
//#region src/canvas-engine/runtime/render/passes/depth/shapeDepthOverlay.ts
function resolveMaskBounds(item, rEff, opts) {
	const projection = shapeProjection(opts);
	const cell = finiteNumber(projection.cell, rEff);
	const cellW = finiteNumber(projection.cellW, cell);
	const cellH = finiteNumber(projection.cellH, cell);
	const rect = item.footprint ? footprintToPx(item.footprint, projection) : {
		x: item.x - rEff,
		y: item.y - rEff,
		w: rEff * 2,
		h: rEff * 2
	};
	if (rect.w <= 0 || rect.h <= 0) return null;
	const pad = Math.ceil(Math.max(8, rEff * .65, Math.max(cellW, cellH) * .7));
	return {
		x: Math.floor(rect.x - pad),
		y: Math.floor(rect.y - pad),
		w: Math.ceil(rect.w + pad * 2),
		h: Math.ceil(rect.h + pad * 2)
	};
}
function rounded$1(value, precision = 10) {
	return String(Math.round(finiteNumber(value, 0) * precision) / precision);
}
function footprintKey$2(item) {
	const f = item.footprint;
	return f ? `${String(f.r0)},${String(f.c0)},${String(f.w)},${String(f.h)}` : "none";
}
function colorKey(color) {
	return `${String(color.r)},${String(color.g)},${String(color.b)}`;
}
function depthOverlayFromOptions$1(opts) {
	const pass = shapePass(opts);
	const color = pass.depthTintColor;
	const blend = pass.depthTintK;
	if (!color || typeof blend !== "number" || !Number.isFinite(blend) || blend <= 0) return null;
	return {
		color,
		blend: clamp01$3(blend)
	};
}
function maskCacheKey(args) {
	const { item, rEff, opts, bounds, dpr, color } = args;
	const projection = shapeProjection(opts);
	const style = shapeStyle(opts);
	const identity = shapeIdentity(opts);
	return [
		item.id,
		item.shape,
		footprintKey$2(item),
		rounded$1(rEff),
		rounded$1(projection.cell),
		rounded$1(projection.cellW),
		rounded$1(projection.cellH),
		String(identity.shapeOccurrenceIndex ?? 0),
		String(style.darkMode ? 1 : 0),
		rounded$1(bounds.x),
		rounded$1(bounds.y),
		rounded$1(bounds.w),
		rounded$1(bounds.h),
		rounded$1(dpr, 100),
		colorKey(color)
	].join("|");
}
function maskFallbackKey(args) {
	const { item, bounds, dpr, color } = args;
	return [
		item.id,
		item.shape,
		footprintKey$2(item),
		rounded$1(bounds.x),
		rounded$1(bounds.y),
		rounded$1(bounds.w),
		rounded$1(bounds.h),
		rounded$1(dpr, 100),
		colorKey(color)
	].join("|");
}
function isAlwaysLiveDepthMask(policy, shape) {
	return policy.alwaysLiveShapes.includes(shape);
}
function createShapeDepthOverlayRenderer(getPolicy) {
	const cache = createOffscreenCache();
	const fallbackKeys = /* @__PURE__ */ new Map();
	const bakeOpts = {};
	const debug = createDepthMaskDebugTracker();
	let frameTimeMs = NaN;
	let bakesThisFrame = 0;
	function clearCache() {
		const clearedCount = cache.clear();
		fallbackKeys.clear();
		debug.markCleared(clearedCount);
	}
	function syncRenderTarget(p, dpr) {
		const result = cache.syncRenderTarget(p, dpr);
		if (result.changed) {
			fallbackKeys.clear();
			debug.markCleared(result.cleared);
		}
	}
	function syncFrameBudget(timeMs) {
		if (timeMs === frameTimeMs) return;
		frameTimeMs = timeMs;
		bakesThisFrame = 0;
	}
	function trimCacheToPolicy(p, policy) {
		const trimmed = cache.trim(maxCachePixelsForCanvas(p, policy.maxPixelsPerCanvasPixel));
		debug.markTrimmed(trimmed);
	}
	function bakeMask(args) {
		const { entry, shapeRegistry, item, rEff, opts, color, timeMs, dpr } = args;
		const { ctx, p: maskP, bounds, canvas } = entry;
		ctx.setTransform(1, 0, 0, 1, 0, 0);
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
		maskP.__tick(timeMs);
		copyRuntimeShapeOptionsInto(bakeOpts, opts);
		const style = bakeOpts.style ?? (bakeOpts.style = {});
		const lifecycle = bakeOpts.lifecycle ?? (bakeOpts.lifecycle = {});
		const particles = bakeOpts.particles ?? (bakeOpts.particles = {});
		const pass = bakeOpts.pass ?? (bakeOpts.pass = {});
		style.alpha = 255;
		lifecycle.rootAppearK = 1;
		particles.particleStore = void 0;
		pass.renderPass = "depthMask";
		pass.maskColor = color;
		pass.maskAlpha = 255;
		pass.depthTintColor = void 0;
		pass.depthTintK = void 0;
		maskP.push();
		maskP.translate(-bounds.x, -bounds.y);
		drawItemFromRegistry(shapeRegistry, maskP, item, rEff, bakeOpts);
		maskP.pop();
		pass.renderPass = "color";
		pass.maskColor = void 0;
		pass.maskAlpha = void 0;
	}
	return Object.assign(function drawShapeDepthOverlay(args) {
		const { p, shapeRegistry, item, rEff, opts, shapeWasDrawnLive } = args;
		const policy = getPolicy();
		syncFrameBudget(shapeLifecycle(opts).timeMs ?? performance.now());
		debug.markCall();
		if (!shapeRegistrySupportsRenderPass(shapeRegistry, item.shape, "depthMask")) {
			debug.markSkippedUnsupported();
			debug.maybeLog(cache.size, cache.pixels);
			return;
		}
		if ((shapeLifecycle(opts).rootAppearK ?? 1) < .995) {
			debug.markSkippedAppear();
			debug.maybeLog(cache.size, cache.pixels);
			return;
		}
		const overlay = depthOverlayFromOptions$1(opts);
		if (!overlay) return;
		if (overlay.blend < policy.minBlend) {
			debug.markSkippedBlend();
			debug.maybeLog(cache.size, cache.pixels);
			return;
		}
		const dpr = canvasDpr(p);
		syncRenderTarget(p, dpr);
		const roughBounds = resolveMaskBounds(item, rEff, opts);
		if (!roughBounds) {
			debug.markSkippedBounds();
			debug.maybeLog(cache.size, cache.pixels);
			return;
		}
		const bounds = snapBoundsToDevicePixels(roughBounds, dpr);
		const key = maskCacheKey({
			item,
			rEff,
			opts,
			bounds,
			dpr,
			color: overlay.color
		});
		const fallbackKey = maskFallbackKey({
			item,
			bounds,
			dpr,
			color: overlay.color
		});
		const alwaysLiveMask = shapeWasDrawnLive && isAlwaysLiveDepthMask(policy, item.shape);
		let entry = cache.get(key);
		if (!entry) {
			if (pixelSizeForBounds(bounds, dpr).pixels > maxCachePixelsForCanvas(p, policy.maxPixelsPerCanvasPixel)) {
				debug.markSkippedTooLarge();
				debug.maybeLog(cache.size, cache.pixels);
				return;
			}
			if (bakesThisFrame >= policy.maxBakesPerFrame) {
				const staleKey = fallbackKeys.get(fallbackKey);
				const staleEntry = staleKey ? cache.get(staleKey) : void 0;
				if (staleEntry) {
					entry = staleEntry;
					debug.markReused();
				} else {
					if (staleKey) fallbackKeys.delete(fallbackKey);
					debug.markSkippedWarmupBudget();
					debug.maybeLog(cache.size, cache.pixels);
					return;
				}
			} else {
				entry = cache.createEntry(bounds, dpr);
				bakesThisFrame += 1;
				debug.markCreated(entry.pixels);
				debug.markBaked();
				bakeMask({
					entry,
					shapeRegistry,
					item,
					rEff,
					opts,
					color: overlay.color,
					timeMs: shapeLifecycle(opts).timeMs ?? performance.now(),
					dpr
				});
				cache.set(key, entry);
				fallbackKeys.set(fallbackKey, key);
				trimCacheToPolicy(p, policy);
			}
		} else {
			debug.markReused();
			if (alwaysLiveMask) {
				debug.markBaked();
				bakeMask({
					entry,
					shapeRegistry,
					item,
					rEff,
					opts,
					color: overlay.color,
					timeMs: shapeLifecycle(opts).timeMs ?? performance.now(),
					dpr
				});
			}
			cache.touch(key, entry);
			fallbackKeys.set(fallbackKey, key);
		}
		const ctx = p.drawingContext;
		ctx.save();
		ctx.globalAlpha = overlay.blend;
		ctx.drawImage(entry.canvas, entry.bounds.x, entry.bounds.y, entry.bounds.w, entry.bounds.h);
		ctx.restore();
		debug.markDrawn();
		debug.maybeLog(cache.size, cache.pixels);
	}, { clear: clearCache });
}
//#endregion
//#region src/canvas-engine/runtime/render/passes/depth/shapeDepthStyle.ts
var DEPTH_FRONT_CLEAR_K = .18;
var DEPTH_ALPHA_CURVE = 1.85;
var DEPTH_ALPHA_MAX_DARK = .78;
var DEPTH_ALPHA_MAX_LIGHT = .68;
function resolveShapeDepthColor(darkMode) {
	return darkMode ? {
		r: 33,
		g: 32,
		b: 40
	} : {
		r: 246,
		g: 246,
		b: 248
	};
}
function resolveShapeDepthMaxBlend(darkMode) {
	return darkMode ? DEPTH_ALPHA_MAX_DARK : DEPTH_ALPHA_MAX_LIGHT;
}
function rowHeightDepthK(item, gridMetrics) {
	const f = item.footprint;
	if (!f || gridMetrics.rowHeights.length < 1) return null;
	let minH = Infinity;
	let maxH = -Infinity;
	for (const h of gridMetrics.rowHeights) {
		if (h <= 0) continue;
		minH = Math.min(minH, h);
		maxH = Math.max(maxH, h);
	}
	if (!Number.isFinite(minH) || !Number.isFinite(maxH) || maxH <= minH) return null;
	const bottomRow = Math.max(0, Math.min(gridMetrics.rowHeights.length - 1, f.r0 + f.h - 1));
	return 1 - clamp01$3(((gridMetrics.rowHeights[bottomRow] ?? maxH) - minH) / Math.max(1, maxH - minH));
}
function fallbackScreenDepthK(args) {
	const { p, item, gridMetrics } = args;
	const depth = item.y;
	const firstDepth = gridMetrics.rowOffsetY[0] ?? 0;
	const lastDepth = gridMetrics.rowOffsetY[gridMetrics.rowOffsetY.length - 1] ?? p.height;
	return 1 - clamp01$3((depth - firstDepth) / Math.max(1, lastDepth - firstDepth));
}
function resolveShapeDepthTint(args) {
	const { p, item, gridMetrics, shapeAlpha = 255, darkMode = false } = args;
	if (!gridMetrics || gridMetrics.rowOffsetY.length < 2) return null;
	const farK = rowHeightDepthK(item, gridMetrics) ?? fallbackScreenDepthK({
		p,
		item,
		gridMetrics
	});
	const maxBlend = resolveShapeDepthMaxBlend(darkMode);
	const shapedFarK = clamp01$3((farK - DEPTH_FRONT_CLEAR_K) / (1 - DEPTH_FRONT_CLEAR_K));
	const blend = Math.pow(shapedFarK, DEPTH_ALPHA_CURVE) * maxBlend * clamp01$3(shapeAlpha / 255);
	if (blend <= 0) return null;
	return {
		color: resolveShapeDepthColor(darkMode),
		blend
	};
}
//#endregion
//#region src/canvas-engine/runtime/render/passes/shape/cache/bitmapKeys.ts
var LIVE_AVG_CACHE_STEPS = 20;
function rounded(value, precision = 10) {
	return String(Math.round(finiteNumber(value, 0) * precision) / precision);
}
function footprintKey$1(item) {
	const f = item.footprint;
	return f ? `${String(f.r0)},${String(f.c0)},${String(f.w)},${String(f.h)}` : "none";
}
function rgbKey(rgb) {
	return rgb ? `${String(rgb.r)},${String(rgb.g)},${String(rgb.b)}` : "none";
}
function liveAvgBucketId(liveAvg) {
	const raw = Math.round(finiteNumber(liveAvg, .5) * LIVE_AVG_CACHE_STEPS);
	return Math.max(0, Math.min(LIVE_AVG_CACHE_STEPS, raw));
}
function liveAvgBucketAvg(liveAvg) {
	return liveAvgBucketId(liveAvg) / LIVE_AVG_CACHE_STEPS;
}
function paletteKey(style) {
	if (style.gradientRGBOverrideActive) return `override:${rgbKey(style.gradientRGB)}`;
	return `avg:${String(liveAvgBucketId(style.liveAvg))}`;
}
function lightKey(light) {
	return light ? `${rounded(light.sourceX)},${rounded(light.sourceY)},${rounded(light.sceneDiag)}` : "none";
}
function depthTintKey(opts) {
	const pass = shapePass(opts);
	const color = pass.depthTintColor;
	return `${color ? `${String(color.r)},${String(color.g)},${String(color.b)}` : "none"}:${rounded(pass.depthTintK, 100)}`;
}
function shapeBitmapCacheKey(args) {
	const { item, rEff, opts, bounds, dpr } = args;
	const projection = shapeProjection(opts);
	const style = shapeStyle(opts);
	const identity = shapeIdentity(opts);
	return [
		item.id,
		item.shape,
		footprintKey$1(item),
		rounded(rEff),
		rounded(projection.cell),
		rounded(projection.cellW),
		rounded(projection.cellH),
		String(identity.shapeOccurrenceIndex ?? 0),
		String(liveAvgBucketId(style.liveAvg)),
		String(style.darkMode ? 1 : 0),
		rounded(style.exposure),
		rounded(style.contrast),
		rounded(style.blend),
		paletteKey(style),
		depthTintKey(opts),
		lightKey(style.lightCtx),
		rounded(bounds.x),
		rounded(bounds.y),
		rounded(bounds.w),
		rounded(bounds.h),
		rounded(dpr, 100)
	].join("|");
}
function shapeBitmapFallbackKey(args) {
	const { item, rEff, opts, bounds, dpr } = args;
	const projection = shapeProjection(opts);
	const style = shapeStyle(opts);
	const identity = shapeIdentity(opts);
	return [
		item.id,
		item.shape,
		footprintKey$1(item),
		rounded(rEff),
		rounded(projection.cell),
		rounded(projection.cellW),
		rounded(projection.cellH),
		String(identity.shapeOccurrenceIndex ?? 0),
		String(style.darkMode ? 1 : 0),
		rounded(style.exposure),
		rounded(style.contrast),
		rounded(style.blend),
		lightKey(style.lightCtx),
		rounded(bounds.x),
		rounded(bounds.y),
		rounded(bounds.w),
		rounded(bounds.h),
		rounded(dpr, 100)
	].join("|");
}
//#endregion
//#region src/canvas-engine/runtime/render/passes/shape/cache/policy.ts
var SHARED_FAR_STAMP_SHAPES = new Set(["trees", "villa"]);
function isSharedFarStampShape(item) {
	return SHARED_FAR_STAMP_SHAPES.has(item.shape) && item.footprint != null;
}
function isFarCacheCandidate(item, gridMetrics, farSizeK) {
	const f = item.footprint;
	if (!f || !gridMetrics || gridMetrics.rowHeights.length === 0) return false;
	const bottomRow = f.r0 + f.h - 1;
	const rowH = gridMetrics.rowHeights[bottomRow] ?? 0;
	const maxRowH = Math.max(...gridMetrics.rowHeights);
	if (rowH <= 0 || maxRowH <= 0) return false;
	return rowH / maxRowH <= farSizeK;
}
function allowsFarShapeBitmapCache(item, policy) {
	return !policy.alwaysLiveShapes.includes(item.shape);
}
//#endregion
//#region src/canvas-engine/runtime/render/passes/shape/cache/farShapeBitmap.ts
var TREE_STAMP_VARIANTS = 8;
var TREE_STAMP_SIZE_BUCKET_PX = 8;
var TREE_STAMP_LIGHT_COORD_BUCKETS = 8;
var TREE_STAMP_LIGHT_INTENSITY = {
	sun: 1.22,
	moon: .88
};
function bucketSizePx(value) {
	return Math.max(TREE_STAMP_SIZE_BUCKET_PX, Math.round(value / TREE_STAMP_SIZE_BUCKET_PX) * TREE_STAMP_SIZE_BUCKET_PX);
}
function sharedStampVariantSlot(item) {
	return hashString32(`${item.shape}|${item.id}`) % TREE_STAMP_VARIANTS;
}
function suppressCurrentDepthOverlay(opts) {
	const pass = opts.pass ?? (opts.pass = {});
	pass.depthTintColor = void 0;
	pass.depthTintK = void 0;
}
function depthOverlayFromOptions(opts) {
	const pass = shapePass(opts);
	const color = pass.depthTintColor;
	const blend = finiteNumber(pass.depthTintK, 0);
	if (!color || blend <= 0) return null;
	return {
		color,
		blend: Math.max(0, Math.min(1, blend))
	};
}
function quantizeTreeLightCoord(value) {
	const clamped = Math.max(-2, Math.min(3, finiteNumber(value, 0)));
	return Math.round(clamped * TREE_STAMP_LIGHT_COORD_BUCKETS) / TREE_STAMP_LIGHT_COORD_BUCKETS;
}
function treeStampLightSignature(light, itemBounds) {
	if (!light) return "none";
	const relX = quantizeTreeLightCoord((light.sourceX - itemBounds.x) / Math.max(1, itemBounds.w));
	const relY = quantizeTreeLightCoord((light.sourceY - itemBounds.y) / Math.max(1, itemBounds.h));
	return [
		light.kind,
		rounded(relX, 100),
		rounded(relY, 100),
		rounded(light.intensity, 100),
		rounded(light.paletteClosenessK, 100)
	].join(",");
}
function makeTreeStampLightContext(args) {
	const { stampBounds, itemBounds, sceneLight, darkMode } = args;
	const safeW = Math.max(1, stampBounds.w);
	const safeH = Math.max(1, stampBounds.h);
	const relX = sceneLight ? quantizeTreeLightCoord((sceneLight.sourceX - itemBounds.x) / Math.max(1, itemBounds.w)) : .5;
	const relY = sceneLight ? quantizeTreeLightCoord((sceneLight.sourceY - itemBounds.y) / Math.max(1, itemBounds.h)) : -.12;
	return {
		sourceX: safeW * relX,
		sourceY: safeH * relY,
		kind: sceneLight?.kind ?? (darkMode ? "moon" : "sun"),
		intensity: sceneLight?.intensity ?? (darkMode ? TREE_STAMP_LIGHT_INTENSITY.moon : TREE_STAMP_LIGHT_INTENSITY.sun),
		paletteClosenessK: sceneLight?.paletteClosenessK ?? .55,
		sceneW: safeW,
		sceneH: safeH,
		sceneDiag: Math.max(1, Math.hypot(safeW, safeH)),
		lightColor: sceneLight?.lightColor ?? (darkMode ? {
			r: 198,
			g: 220,
			b: 255
		} : {
			r: 255,
			g: 222,
			b: 168
		}),
		shadowColor: sceneLight?.shadowColor ?? (darkMode ? {
			r: 58,
			g: 76,
			b: 108
		} : {
			r: 88,
			g: 114,
			b: 150
		})
	};
}
function sceneLightForMode(light, darkMode) {
	if (!light) return null;
	return {
		...light,
		kind: darkMode ? "moon" : "sun",
		intensity: darkMode ? TREE_STAMP_LIGHT_INTENSITY.moon : TREE_STAMP_LIGHT_INTENSITY.sun,
		lightColor: darkMode ? {
			r: 198,
			g: 220,
			b: 255
		} : {
			r: 255,
			g: 222,
			b: 168
		},
		shadowColor: darkMode ? {
			r: 58,
			g: 76,
			b: 108
		} : {
			r: 88,
			g: 114,
			b: 150
		}
	};
}
function oppositeDepthOverlay(opts, overlay) {
	const currentDarkMode = shapeStyle(opts).darkMode === true;
	const nextDarkMode = !currentDarkMode;
	const currentMaxBlend = resolveShapeDepthMaxBlend(currentDarkMode);
	const nextMaxBlend = resolveShapeDepthMaxBlend(nextDarkMode);
	const blend = currentMaxBlend > 0 ? overlay.blend * (nextMaxBlend / currentMaxBlend) : overlay.blend;
	return {
		darkMode: nextDarkMode,
		color: resolveShapeDepthColor(nextDarkMode),
		blend: Math.max(0, Math.min(1, blend))
	};
}
function liveAvgKey(liveAvg) {
	return String(liveAvgBucketId(liveAvg));
}
function resolveShapeBounds(item, rEff, opts) {
	const projection = shapeProjection(opts);
	const cell = finiteNumber(projection.cell, rEff);
	const cellW = finiteNumber(projection.cellW, cell);
	const cellH = finiteNumber(projection.cellH, cell);
	const rect = item.footprint ? footprintToPx(item.footprint, projection) : {
		x: item.x - rEff,
		y: item.y - rEff,
		w: rEff * 2,
		h: rEff * 2
	};
	if (rect.w <= 0 || rect.h <= 0) return null;
	const pad = Math.ceil(Math.max(8, rEff * .75, Math.max(cellW, cellH) * .8));
	return {
		x: Math.floor(rect.x - pad),
		y: Math.floor(rect.y - pad),
		w: Math.ceil(rect.w + pad * 2),
		h: Math.ceil(rect.h + pad * 2)
	};
}
function resolveShapeRect(item, rEff, opts) {
	const projection = shapeProjection(opts);
	return item.footprint ? footprintToPx(item.footprint, projection) : {
		x: item.x - rEff,
		y: item.y - rEff,
		w: rEff * 2,
		h: rEff * 2
	};
}
function blitWithAppear(ctx, appearK, canvas, x, y, w, h) {
	if (appearK >= .999) {
		ctx.drawImage(canvas, x, y, w, h);
		return;
	}
	const prev = ctx.globalAlpha;
	ctx.globalAlpha = prev * appearK;
	ctx.drawImage(canvas, x, y, w, h);
	ctx.globalAlpha = prev;
}
function createFarShapeBitmapRenderer(getPolicy) {
	const cache = createOffscreenCache();
	const treeStampCache = createOffscreenCache();
	const treeStampMaskCache = createOffscreenCache();
	const treeStampFallbackKeys = /* @__PURE__ */ new Map();
	const treeStampMaskFallbackKeys = /* @__PURE__ */ new Map();
	const fallbackKeys = /* @__PURE__ */ new Map();
	const bakeOpts = {};
	const stampBakeOpts = {};
	const stampPrewarmOpts = {};
	const debug = createFarShapeCacheDebugTracker();
	let frameTimeMs = NaN;
	let bakesThisFrame = 0;
	function updateDebugState() {
		debug.updateState({
			genericCacheSize: cache.size,
			genericCachePixels: cache.pixels,
			stampCacheSize: treeStampCache.size,
			stampCachePixels: treeStampCache.pixels,
			stampMaskCacheSize: treeStampMaskCache.size,
			stampMaskCachePixels: treeStampMaskCache.pixels,
			genericFallbackKeys: fallbackKeys.size,
			stampFallbackKeys: treeStampFallbackKeys.size,
			stampMaskFallbackKeys: treeStampMaskFallbackKeys.size
		});
	}
	function clearCache() {
		const cleared = cache.clear() + treeStampCache.clear() + treeStampMaskCache.clear();
		treeStampFallbackKeys.clear();
		treeStampMaskFallbackKeys.clear();
		fallbackKeys.clear();
		debug.markCleared(cleared);
		updateDebugState();
	}
	function syncFrameBudget(timeMs) {
		if (timeMs === frameTimeMs) return;
		frameTimeMs = timeMs;
		bakesThisFrame = 0;
	}
	function trimCacheToPolicy(p, policy) {
		const maxPixels = maxCachePixelsForCanvas(p, policy.maxPixelsPerCanvasPixel);
		const trimmed = cache.trim(maxPixels) + treeStampCache.trim(maxPixels) + treeStampMaskCache.trim(maxPixels);
		if (trimmed > 0) debug.markTrimmed(trimmed);
		updateDebugState();
	}
	function treeStampKey(args) {
		const { item, opts, stampBounds, itemBounds, dpr } = args;
		const style = shapeStyle(opts);
		const f = item.footprint;
		return [
			"tree-stamp-v1",
			item.shape,
			`v:${String(sharedStampVariantSlot(item))}`,
			f ? `fp:${String(f.w)}x${String(f.h)}` : "fp:none",
			`size:${rounded(stampBounds.w)}x${rounded(stampBounds.h)}`,
			liveAvgKey(style.liveAvg),
			String(style.darkMode ? 1 : 0),
			rounded(style.exposure),
			rounded(style.contrast),
			rounded(style.blend),
			paletteKey(style),
			treeStampLightSignature(style.lightCtx, itemBounds),
			rounded(dpr, 100)
		].join("|");
	}
	function treeStampFallbackKey(args) {
		const { item, stampBounds, dpr } = args;
		const f = item.footprint;
		return [
			"tree-stamp-fallback-v1",
			item.shape,
			`v:${String(sharedStampVariantSlot(item))}`,
			f ? `fp:${String(f.w)}x${String(f.h)}` : "fp:none",
			`size:${rounded(stampBounds.w)}x${rounded(stampBounds.h)}`,
			rounded(dpr, 100)
		].join("|");
	}
	function bakeTreeStamp(args) {
		const { entry, shapeRegistry, item, rEff, opts, itemBounds, itemRect, renderPass, maskColor, dpr } = args;
		const { canvas, ctx, p: stampP, bounds } = entry;
		const footprint = item.footprint;
		if (!footprint) return;
		ctx.setTransform(1, 0, 0, 1, 0, 0);
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
		const scaleX = bounds.w / Math.max(1, itemBounds.w);
		const scaleY = bounds.h / Math.max(1, itemBounds.h);
		const pixelFootprint = {
			x: (itemRect.x - itemBounds.x) * scaleX,
			y: (itemRect.y - itemBounds.y) * scaleY,
			w: Math.max(1, itemRect.w * scaleX),
			h: Math.max(1, itemRect.h * scaleY)
		};
		const cellW = pixelFootprint.w / Math.max(1, footprint.w);
		const cellH = pixelFootprint.h / Math.max(1, footprint.h);
		const cell = Math.max(1, Math.min(cellW, cellH));
		const bucketAvg = liveAvgBucketAvg(shapeStyle(opts).liveAvg);
		const sourceStyle = shapeStyle(opts);
		const darkMode = sourceStyle.darkMode === true;
		stampP.__tick(shapeLifecycle(opts).timeMs ?? performance.now());
		copyRuntimeShapeOptionsInto(stampBakeOpts, opts);
		stampBakeOpts.projection = {
			cell,
			cellW,
			cellH,
			footprint: {
				r0: 0,
				c0: 0,
				w: footprint.w,
				h: footprint.h
			},
			pixelFootprint
		};
		const style = stampBakeOpts.style ?? (stampBakeOpts.style = {});
		if (!style.gradientRGBOverrideActive) {
			style.liveAvg = bucketAvg;
			style.gradientRGB = gradientColor(VIVID_COLOR_STOPS, bucketAvg).rgb;
		}
		style.lightCtx = makeTreeStampLightContext({
			stampBounds: bounds,
			itemBounds,
			sceneLight: sourceStyle.lightCtx,
			darkMode
		});
		style.alpha = renderPass === "depthMask" ? 255 : 235;
		const lifecycle = stampBakeOpts.lifecycle ?? (stampBakeOpts.lifecycle = {});
		const particles = stampBakeOpts.particles ?? (stampBakeOpts.particles = {});
		const pass = stampBakeOpts.pass ?? (stampBakeOpts.pass = {});
		const identity = stampBakeOpts.identity ?? (stampBakeOpts.identity = {});
		const sprite = stampBakeOpts.sprite ?? (stampBakeOpts.sprite = {});
		lifecycle.rootAppearK = 1;
		particles.particleStore = void 0;
		pass.renderPass = renderPass;
		pass.maskColor = renderPass === "depthMask" ? maskColor : void 0;
		pass.maskAlpha = renderPass === "depthMask" ? 255 : void 0;
		pass.depthTintColor = void 0;
		pass.depthTintK = void 0;
		identity.seedKey = `far-${item.shape}-stamp|B${String(liveAvgBucketId(style.liveAvg))}|V${String(sharedStampVariantSlot(item))}`;
		identity.shapeOccurrenceIndex = sharedStampVariantSlot(item);
		sprite.fitToFootprint = true;
		sprite.spriteMode = true;
		sprite.disableParticleDepthTint = true;
		drawItemFromRegistry(shapeRegistry, stampP, {
			id: identity.seedKey,
			shape: item.shape,
			x: bounds.w / 2,
			y: bounds.h / 2,
			footprint: stampBakeOpts.projection.footprint,
			pixelFootprint
		}, Math.max(rEff, cell), stampBakeOpts);
	}
	function prewarmOppositeTreeStampMask(args) {
		const { p, shapeRegistry, item, rEff, opts, bounds, stampBounds, itemRect, dpr, policy, overlay } = args;
		if (bakesThisFrame >= policy.maxBakesPerFrame) return;
		const opposite = oppositeDepthOverlay(opts, overlay);
		if (opposite.blend <= 0) return;
		copyRuntimeShapeOptionsInto(stampPrewarmOpts, opts);
		const sourceStyle = shapeStyle(opts);
		const style = stampPrewarmOpts.style ?? (stampPrewarmOpts.style = {});
		style.darkMode = opposite.darkMode;
		style.lightCtx = sceneLightForMode(sourceStyle.lightCtx, opposite.darkMode);
		const key = `${treeStampKey({
			item,
			opts: stampPrewarmOpts,
			stampBounds,
			itemBounds: bounds,
			dpr
		})}|mask:${rgbKey(opposite.color)}`;
		if (treeStampMaskCache.get(key)) return;
		const maskPixels = pixelSizeForBounds(stampBounds, dpr).pixels;
		const maxPixels = maxCachePixelsForCanvas(p, policy.maxPixelsPerCanvasPixel);
		if (maskPixels > maxPixels) {
			debug.markStampMaskTooLarge();
			updateDebugState();
			return;
		}
		const entry = treeStampMaskCache.createEntry(stampBounds, dpr);
		bakesThisFrame += 1;
		debug.markStampMaskCreated(entry.pixels);
		debug.markStampMaskBake();
		bakeTreeStamp({
			entry,
			shapeRegistry,
			item,
			rEff,
			opts: stampPrewarmOpts,
			itemBounds: bounds,
			itemRect,
			renderPass: "depthMask",
			maskColor: opposite.color,
			dpr
		});
		treeStampMaskCache.set(key, entry);
		debug.markTrimmed(treeStampMaskCache.trim(maxPixels));
		updateDebugState();
	}
	function drawTreeStampMask(args) {
		const { p, shapeRegistry, item, rEff, opts, bounds, stampBounds, itemRect, dpr, policy, stampKey, stampFallbackKey, overlay } = args;
		const key = `${stampKey}|mask:${rgbKey(overlay.color)}`;
		const fallbackKey = `${stampFallbackKey}|mask`;
		let entry = treeStampMaskCache.get(key);
		if (!entry) {
			debug.markStampMaskMiss();
			const maskPixels = pixelSizeForBounds(stampBounds, dpr).pixels;
			const maxPixels = maxCachePixelsForCanvas(p, policy.maxPixelsPerCanvasPixel);
			if (maskPixels > maxPixels) {
				debug.markStampMaskTooLarge();
				updateDebugState();
				return;
			}
			if (bakesThisFrame >= policy.maxBakesPerFrame) {
				const staleKey = treeStampMaskFallbackKeys.get(fallbackKey);
				if (!staleKey) {
					debug.markStampMaskBudgetSkip();
					updateDebugState();
					return;
				}
				const staleEntry = treeStampMaskCache.get(staleKey);
				if (!staleEntry) {
					treeStampMaskFallbackKeys.delete(fallbackKey);
					debug.markStampMaskBudgetSkip();
					updateDebugState();
					return;
				}
				entry = staleEntry;
				debug.markStampMaskStaleDrawn();
				treeStampMaskCache.touch(staleKey, staleEntry);
			} else {
				entry = treeStampMaskCache.createEntry(stampBounds, dpr);
				bakesThisFrame += 1;
				debug.markStampMaskCreated(entry.pixels);
				debug.markStampMaskBake();
				bakeTreeStamp({
					entry,
					shapeRegistry,
					item,
					rEff,
					opts,
					itemBounds: bounds,
					itemRect,
					renderPass: "depthMask",
					maskColor: overlay.color,
					dpr
				});
				treeStampMaskCache.set(key, entry);
				treeStampMaskFallbackKeys.set(fallbackKey, key);
				debug.markTrimmed(treeStampMaskCache.trim(maxPixels));
				updateDebugState();
			}
		} else {
			debug.markStampMaskHit();
			treeStampMaskCache.touch(key, entry);
			treeStampMaskFallbackKeys.set(fallbackKey, key);
		}
		const ctx = p.drawingContext;
		ctx.save();
		ctx.globalAlpha = overlay.blend;
		ctx.drawImage(entry.canvas, bounds.x, bounds.y, bounds.w, bounds.h);
		ctx.restore();
		debug.markStampMaskDrawn();
		prewarmOppositeTreeStampMask({
			p,
			shapeRegistry,
			item,
			rEff,
			opts,
			bounds,
			stampBounds,
			itemRect,
			dpr,
			policy,
			overlay
		});
		updateDebugState();
	}
	function drawSharedFarTreeStamp(args) {
		const { p, shapeRegistry, item, rEff, opts, bounds, dpr, policy } = args;
		if (!isSharedFarStampShape(item)) return false;
		debug.markStampCandidate();
		const itemRect = resolveShapeRect(item, rEff, opts);
		if (itemRect.w <= 0 || itemRect.h <= 0) {
			suppressCurrentDepthOverlay(opts);
			updateDebugState();
			return true;
		}
		const stampBounds = {
			x: 0,
			y: 0,
			w: bucketSizePx(bounds.w),
			h: bucketSizePx(bounds.h)
		};
		const key = treeStampKey({
			item,
			opts,
			stampBounds,
			itemBounds: bounds,
			dpr
		});
		const fallbackKey = treeStampFallbackKey({
			item,
			stampBounds,
			dpr
		});
		let entry = treeStampCache.get(key);
		let drewColor = false;
		if (!entry) {
			debug.markStampMiss();
			const stampPixels = pixelSizeForBounds(stampBounds, dpr).pixels;
			const maxPixels = maxCachePixelsForCanvas(p, policy.maxPixelsPerCanvasPixel);
			if (stampPixels > maxPixels) {
				debug.markStampTooLarge();
				suppressCurrentDepthOverlay(opts);
				updateDebugState();
				return true;
			}
			if (bakesThisFrame >= policy.maxBakesPerFrame) {
				const staleKey = treeStampFallbackKeys.get(fallbackKey);
				if (staleKey) {
					const staleEntry = treeStampCache.get(staleKey);
					if (staleEntry) {
						treeStampCache.touch(staleKey, staleEntry);
						p.drawingContext.drawImage(staleEntry.canvas, bounds.x, bounds.y, bounds.w, bounds.h);
						debug.markStampStaleDrawn();
						drewColor = true;
					} else treeStampFallbackKeys.delete(fallbackKey);
				}
				if (drewColor) {
					const overlay = depthOverlayFromOptions(opts);
					if (overlay) drawTreeStampMask({
						p,
						shapeRegistry,
						item,
						rEff,
						opts,
						bounds,
						stampBounds,
						itemRect,
						dpr,
						policy,
						stampKey: key,
						stampFallbackKey: fallbackKey,
						overlay
					});
				}
				if (!drewColor) debug.markStampBudgetSkip();
				if (drewColor) debug.markStampDrawn();
				suppressCurrentDepthOverlay(opts);
				updateDebugState();
				return true;
			}
			entry = treeStampCache.createEntry(stampBounds, dpr);
			bakesThisFrame += 1;
			debug.markStampCreated(entry.pixels);
			debug.markStampBake();
			bakeTreeStamp({
				entry,
				shapeRegistry,
				item,
				rEff,
				opts,
				itemBounds: bounds,
				itemRect,
				renderPass: "color",
				dpr
			});
			treeStampCache.set(key, entry);
			treeStampFallbackKeys.set(fallbackKey, key);
			debug.markTrimmed(treeStampCache.trim(maxPixels));
			updateDebugState();
		} else {
			debug.markStampHit();
			treeStampCache.touch(key, entry);
			treeStampFallbackKeys.set(fallbackKey, key);
		}
		p.drawingContext.drawImage(entry.canvas, bounds.x, bounds.y, bounds.w, bounds.h);
		debug.markStampDrawn();
		const overlay = depthOverlayFromOptions(opts);
		if (overlay) drawTreeStampMask({
			p,
			shapeRegistry,
			item,
			rEff,
			opts,
			bounds,
			stampBounds,
			itemRect,
			dpr,
			policy,
			stampKey: key,
			stampFallbackKey: fallbackKey,
			overlay
		});
		suppressCurrentDepthOverlay(opts);
		updateDebugState();
		return true;
	}
	function bakeShape(args) {
		const { entry, shapeRegistry, item, rEff, opts, dpr } = args;
		const { canvas, ctx, p: bitmapP, bounds } = entry;
		ctx.setTransform(1, 0, 0, 1, 0, 0);
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
		bitmapP.__tick(shapeLifecycle(opts).timeMs ?? performance.now());
		copyRuntimeShapeOptionsInto(bakeOpts, opts);
		const style = bakeOpts.style ?? (bakeOpts.style = {});
		const lifecycle = bakeOpts.lifecycle ?? (bakeOpts.lifecycle = {});
		const particles = bakeOpts.particles ?? (bakeOpts.particles = {});
		const pass = bakeOpts.pass ?? (bakeOpts.pass = {});
		if (!style.gradientRGBOverrideActive) {
			const bucketAvg = liveAvgBucketAvg(style.liveAvg);
			style.liveAvg = bucketAvg;
			style.gradientRGB = gradientColor(VIVID_COLOR_STOPS, bucketAvg).rgb;
		}
		lifecycle.rootAppearK = 1;
		particles.particleStore = void 0;
		pass.renderPass = "color";
		pass.maskColor = void 0;
		pass.maskAlpha = void 0;
		bitmapP.push();
		bitmapP.translate(-bounds.x, -bounds.y);
		drawItemFromRegistry(shapeRegistry, bitmapP, item, rEff, bakeOpts);
		bitmapP.pop();
	}
	return Object.assign(function drawFarShapeBitmap(args) {
		const { p, shapeRegistry, item, rEff, opts, gridMetrics } = args;
		debug.markCall();
		const policy = getPolicy();
		if (!policy.enabled) {
			debug.markSkippedDisabled();
			updateDebugState();
			return false;
		}
		if (!allowsFarShapeBitmapCache(item, policy)) {
			debug.markSkippedPolicy();
			updateDebugState();
			return false;
		}
		if (!isFarCacheCandidate(item, gridMetrics, policy.farSizeK)) {
			debug.markSkippedNotFar();
			updateDebugState();
			return false;
		}
		const dpr = canvasDpr(p);
		const target = cache.syncRenderTarget(p, dpr);
		if (target.changed) {
			fallbackKeys.clear();
			debug.markRenderTargetCleared(target.cleared);
		}
		syncFrameBudget(shapeLifecycle(opts).timeMs ?? performance.now());
		const roughBounds = resolveShapeBounds(item, rEff, opts);
		if (!roughBounds) {
			debug.markSkippedBounds();
			updateDebugState();
			return false;
		}
		const bounds = snapBoundsToDevicePixels(roughBounds, dpr);
		trimCacheToPolicy(p, policy);
		if (isFarCacheCandidate(item, gridMetrics, Math.min(policy.farSizeK, .45)) && drawSharedFarTreeStamp({
			p,
			shapeRegistry,
			item,
			rEff,
			opts,
			bounds,
			dpr,
			policy
		})) return true;
		const appearK = shapeLifecycle(opts).rootAppearK ?? 1;
		const key = shapeBitmapCacheKey({
			item,
			rEff,
			opts,
			bounds,
			dpr
		});
		const fallbackKey = shapeBitmapFallbackKey({
			item,
			rEff,
			opts,
			bounds,
			dpr
		});
		let entry = cache.get(key);
		if (!entry) {
			debug.markGenericMiss();
			const bitmapPixels = pixelSizeForBounds(bounds, dpr).pixels;
			const maxPixels = maxCachePixelsForCanvas(p, policy.maxPixelsPerCanvasPixel);
			if (bitmapPixels > maxPixels) {
				debug.markGenericTooLarge();
				updateDebugState();
				return false;
			}
			if (bakesThisFrame >= policy.maxBakesPerFrame) {
				const staleKey = fallbackKeys.get(fallbackKey);
				const staleEntry = staleKey ? cache.get(staleKey) : void 0;
				if (staleKey && staleEntry) {
					cache.touch(staleKey, staleEntry);
					debug.markGenericStaleDrawn();
					debug.markGenericDrawn();
					blitWithAppear(p.drawingContext, appearK, staleEntry.canvas, staleEntry.bounds.x, staleEntry.bounds.y, staleEntry.bounds.w, staleEntry.bounds.h);
					updateDebugState();
					return true;
				}
				if (staleKey) fallbackKeys.delete(fallbackKey);
				debug.markGenericBudgetSkip();
				updateDebugState();
				return false;
			}
			entry = cache.createEntry(bounds, dpr);
			bakesThisFrame += 1;
			debug.markGenericCreated(entry.pixels);
			debug.markGenericBake();
			bakeShape({
				entry,
				shapeRegistry,
				item,
				rEff,
				opts,
				dpr
			});
			cache.set(key, entry);
			fallbackKeys.set(fallbackKey, key);
			debug.markTrimmed(cache.trim(maxPixels));
			updateDebugState();
		} else {
			debug.markGenericHit();
			cache.touch(key, entry);
			fallbackKeys.set(fallbackKey, key);
		}
		blitWithAppear(p.drawingContext, appearK, entry.canvas, entry.bounds.x, entry.bounds.y, entry.bounds.w, entry.bounds.h);
		debug.markGenericDrawn();
		updateDebugState();
		return true;
	}, { clear: clearCache });
}
//#endregion
//#region src/canvas-engine/runtime/render/passes/shape/shapeRenderCache.ts
function createShapeRenderCache(getPolicy) {
	const drawFarShapeBitmap = createFarShapeBitmapRenderer(() => getPolicy().farShapeBitmap);
	const drawShapeDepthOverlay = createShapeDepthOverlayRenderer(() => getPolicy().shapeDepthMask);
	return {
		drawFarShapeBitmap,
		drawShapeDepthOverlay,
		clear() {
			drawFarShapeBitmap.clear();
			drawShapeDepthOverlay.clear();
		}
	};
}
//#endregion
//#region src/canvas-engine/runtime/render/passes/shape/frameOptions.ts
function findVisibleLightItem(items) {
	for (const item of items) if (item.shape === "sun") return item;
	return null;
}
function resolveShapeLightItem(args) {
	const visibleLightItem = findVisibleLightItem(args.items);
	if (visibleLightItem) return visibleLightItem;
	const { source } = args;
	if (!source) return null;
	const lightItem = {
		x: args.width * source.xK,
		y: args.height * source.yK
	};
	if (typeof source.paletteClosenessK === "number") lightItem.paletteClosenessK = source.paletteClosenessK;
	return lightItem;
}
function createRuntimeShapeBaseOptions(args) {
	const { grid, style } = args;
	return {
		projection: {
			cell: grid.cell,
			cellW: grid.cellW,
			cellH: grid.cellH,
			...grid.metrics
		},
		style: {
			gradientRGB: args.gradientRGB,
			gradientRGBOverrideActive: style.gradientRGBOverride != null,
			blend: style.blend,
			liveAvg: args.liveAvg,
			alpha: 235,
			exposure: style.exposure,
			contrast: style.contrast,
			darkMode: style.darkMode,
			lightCtx: args.sceneLight
		},
		lifecycle: {
			timeMs: args.timeMs,
			dtSec: args.dtSec
		},
		particles: { particleStore: args.particleStore }
	};
}
//#endregion
//#region src/canvas-engine/runtime/render/passes/shape/palette.ts
function createPaletteCache() {
	return {
		lastU: NaN,
		cachedGradient: null
	};
}
function getGradientRGB(params) {
	const { liveAvg, override, cache } = params;
	if (override) return override;
	const uq = Math.round(liveAvg * 1e3) / 1e3;
	if (uq !== cache.lastU) {
		cache.lastU = uq;
		cache.cachedGradient = gradientColor(VIVID_COLOR_STOPS, uq).rgb;
	}
	return cache.cachedGradient;
}
//#endregion
//#region src/canvas-engine/runtime/engine/runtimeSceneVariants.ts
function positiveModulo$1(value, length) {
	return (value % length + length) % length;
}
function resolveRuntimeBackground(background, spotlight) {
	const runtimePreset = background?.runtimePreset;
	if (!runtimePreset?.entries.length) return background;
	const entries = runtimePreset.entries;
	if (!spotlight) return entries[0] ?? null;
	return entries[positiveModulo$1(spotlight.index, entries.length)];
}
function resolveRuntimeAmbientParticles(ambientParticles, spotlight) {
	const runtimePreset = ambientParticles?.runtimePreset;
	if (!runtimePreset?.entries.length) return ambientParticles;
	const entries = runtimePreset.entries;
	if (!spotlight) return entries[0] ?? null;
	return entries[positiveModulo$1(spotlight.index, entries.length)] ?? null;
}
function resolveRuntimeFoliage(foliage, spotlight) {
	const runtimePreset = foliage?.runtimePreset;
	if (!runtimePreset?.entries.length) return foliage;
	const entries = runtimePreset.entries;
	if (!spotlight) return entries[0] ?? null;
	return entries[positiveModulo$1(spotlight.index, entries.length)] ?? null;
}
//#endregion
//#region src/canvas-engine/runtime/engine/sceneSurfaceLifecycle.ts
var DEFAULT_SCENE_SURFACE_APPEAR_MS = 600;
var APPEAR_DONE_ALPHA = .999;
var MAX_APPEAR_FRAME_ADVANCE_MS = 30;
function createSceneSurfaceLifecycleState(appearMs = DEFAULT_SCENE_SURFACE_APPEAR_MS) {
	return {
		appearMs: Math.max(0, appearMs),
		startedAtMs: null,
		elapsedMs: 0,
		lastFrameAtMs: null
	};
}
function resolveSceneSurfaceFrame(state, args) {
	const { nowMs, ready } = args;
	if (!ready) {
		state.startedAtMs = null;
		state.elapsedMs = 0;
		state.lastFrameAtMs = null;
		return {
			ready: false,
			alpha: 0,
			appearing: true
		};
	}
	if (state.startedAtMs === null) {
		state.startedAtMs = nowMs;
		state.lastFrameAtMs = nowMs;
		state.elapsedMs = 0;
	} else {
		const frameDeltaMs = Math.max(0, nowMs - (state.lastFrameAtMs ?? nowMs));
		state.lastFrameAtMs = nowMs;
		state.elapsedMs += Math.min(frameDeltaMs, MAX_APPEAR_FRAME_ADVANCE_MS);
	}
	const alpha = state.appearMs > 0 ? easeOutCubic(state.elapsedMs / state.appearMs) : 1;
	return {
		ready: true,
		alpha,
		appearing: alpha < APPEAR_DONE_ALPHA
	};
}
//#endregion
//#region src/canvas-engine/runtime/engine/loop.ts
function createEngineTicker(deps) {
	const surface = deps.surface;
	const engine = deps.engineState;
	const sceneSource = deps.sceneSource;
	const layout = deps.layout;
	const effects = deps.effects;
	const shapes = deps.shapes;
	let running = true;
	const bgCache = createBgCache();
	const rowLightCache = createRowLightCache();
	const fogLayerCache = createFogLayerCache();
	const fogStateCache = createFogStateCache();
	const starGeometryCache = createStarGeometryCache();
	const foliageLayerCache = createFoliageLayerCache();
	const paletteCache = createPaletteCache();
	const shapeRenderCache = createShapeRenderCache(() => sceneSource.getProfile().renderCache);
	const sortedItemsScratch = [];
	const optsScratch = {};
	const shapeOccurrenceScratch = /* @__PURE__ */ new Map();
	const findEnvironmentLightSource = createEnvironmentLightResolver();
	let sortedItemsSource = null;
	let sortedItemsMetrics = null;
	function clearRenderCaches() {
		bgCache.clear();
		rowLightCache.clear();
		fogLayerCache.clear();
		starGeometryCache.clear();
		foliageLayerCache.clear();
		shapeRenderCache.clear();
	}
	function sortedItemsForFrame(items, metrics) {
		if (items !== sortedItemsSource || metrics !== sortedItemsMetrics) {
			sortItemsForRenderInto(sortedItemsScratch, items, { gridMetrics: metrics });
			sortedItemsSource = items;
			sortedItemsMetrics = metrics;
		}
		return sortedItemsScratch;
	}
	function renderOneSandboxed(it, rEff, opts, rootAppearK) {
		surface.p.push();
		try {
			const projection = opts.projection ?? (opts.projection = {});
			const styleOpts = opts.style ?? (opts.style = {});
			const lifecycle = opts.lifecycle ?? (opts.lifecycle = {});
			const pass = opts.pass ?? (opts.pass = {});
			const itemAvg = engine.inputs.liveAvg;
			const itemGradient = styleOpts.gradientRGB;
			styleOpts.liveAvg = itemAvg;
			styleOpts.gradientRGB = itemGradient;
			lifecycle.rootAppearK = rootAppearK;
			projection.usedRows = layout.gridCache.usedRows;
			const depthTint = resolveShapeDepthTint({
				p: surface.p,
				item: it,
				gridMetrics: layout.gridCache.metrics,
				shapeAlpha: styleOpts.alpha,
				darkMode: styleOpts.darkMode
			});
			pass.depthTintColor = depthTint?.color;
			pass.depthTintK = depthTint?.blend;
			const fp = it.footprint;
			const m = layout.gridCache.metrics;
			if (fp != null && m.rowHeights.length > 0) {
				const bottomRow = fp.r0 + fp.h - 1;
				projection.cell = m.rowHeights[bottomRow] ?? layout.gridCache.cellH;
				projection.cellH = m.rowHeights[bottomRow] ?? layout.gridCache.cellH;
				projection.cellW = m.cellWPerRow[bottomRow] ?? layout.gridCache.cellW;
			}
			const drewCachedShape = shapeRenderCache.drawFarShapeBitmap({
				p: surface.p,
				shapeRegistry: shapes.registry,
				item: it,
				rEff,
				opts,
				gridMetrics: layout.gridCache.metrics
			});
			if (!drewCachedShape) drawItemFromRegistry(shapes.registry, surface.p, it, rEff, opts);
			shapeRenderCache.drawShapeDepthOverlay({
				p: surface.p,
				shapeRegistry: shapes.registry,
				item: it,
				rEff,
				opts,
				shapeWasDrawnLive: !drewCachedShape
			});
		} finally {
			surface.p.pop();
			reassertDprTransformIfMutated(surface.p);
		}
	}
	function prepareSceneFrame(now) {
		surface.p.__tick(now);
		normalizeDprTransform(surface.p);
		const sceneProfile = sceneSource.getProfile();
		const spotlight = engine.inputs.spotlight;
		const background = resolveRuntimeBackground(sceneProfile.background, spotlight);
		const ambientParticles = resolveRuntimeAmbientParticles(sceneProfile.ambientParticles, spotlight);
		const foliage = resolveRuntimeFoliage(sceneProfile.foliage, spotlight);
		const sceneSurface = resolveSceneSurfaceFrame(effects.sceneSurface, {
			nowMs: now,
			ready: sceneProfile.background != null
		});
		const liveAvgSignal = engine.inputs.liveAvg;
		const spec = getPaddingSpecForState(surface.p.width, sceneProfile.lookupKey, sceneProfile.paddingSpec);
		const grid = computeGridCached(layout.gridCache, surface.p, spec);
		const backgroundAnchors = createBackgroundAnchorContext({
			p: surface.p,
			padding: spec,
			metrics: grid.metrics
		});
		const environmentLightSource = findEnvironmentLightSource({
			items: engine.field.items,
			width: surface.p.width,
			style: engine.style
		});
		return {
			sceneProfile,
			background,
			ambientParticles,
			foliage,
			sceneSurface,
			liveAvgSignal,
			spec,
			grid,
			backgroundAnchors,
			fog: engine.style.fog ? fogStateCache({
				p: surface.p,
				metrics: grid.metrics,
				darkMode: engine.style.darkMode,
				spec: sceneProfile.fog,
				lightSource: environmentLightSource,
				hasHorizon: typeof spec.horizonPos === "number"
			}) : null
		};
	}
	function renderBackgroundPass(frame) {
		if (!frame.sceneSurface.ready) return;
		bgCache(surface.p, frame.sceneProfile.lookupKey, frame.background, frame.liveAvgSignal, frame.backgroundAnchors, frame.sceneSurface.alpha);
	}
	function renderStarPass(frame) {
		if (!frame.sceneSurface.ready) return;
		drawBackgroundStarsOnly(surface.p, frame.sceneProfile.lookupKey, frame.background, frame.sceneSurface.alpha, frame.liveAvgSignal, starGeometryCache);
	}
	function renderFoliagePass(frame) {
		if (!frame.sceneSurface.ready) return;
		foliageLayerCache({
			p: surface.p,
			spec: frame.foliage,
			liveAvg: frame.liveAvgSignal,
			anchors: frame.backgroundAnchors,
			compositeAlpha: frame.sceneSurface.alpha
		});
	}
	function renderAmbientParticlesPass(frame) {
		if (!frame.sceneSurface.ready) return;
		drawAmbientParticles({
			p: surface.p,
			spec: frame.ambientParticles,
			liveAvg: frame.liveAvgSignal,
			timeMs: surface.p.millis(),
			compositeAlpha: frame.sceneSurface.alpha
		});
	}
	function renderFogPass(frame) {
		if (!frame.sceneSurface.ready) return;
		fogLayerCache(surface.p, frame.fog, frame.sceneSurface.alpha);
	}
	function renderDebugPass(frame) {
		drawGridOverlay(surface.p, {
			cellW: frame.grid.cellW,
			cellH: frame.grid.cellH,
			ox: frame.grid.ox,
			oy: frame.grid.oy,
			rows: frame.grid.rows,
			cols: frame.grid.cols,
			usedRows: frame.grid.usedRows,
			metrics: frame.grid.metrics
		}, frame.spec, {
			enabled: engine.style.debug.grid,
			gridAlpha: engine.style.debug.gridAlpha
		});
	}
	function prepareShapeFrame(sceneFrame) {
		const tMs = surface.p.millis();
		const gradientRGB = getGradientRGB({
			liveAvg: sceneFrame.liveAvgSignal,
			override: engine.style.gradientRGBOverride,
			cache: paletteCache
		});
		const sortedItems = sortedItemsForFrame(engine.field.items, sceneFrame.grid.metrics);
		const sceneLight = createSceneLightContext({
			lightItem: resolveShapeLightItem({
				items: sortedItems,
				source: engine.style.shapeLightSource,
				width: surface.p.width,
				height: surface.p.height
			}),
			darkMode: engine.style.darkMode,
			canvasW: surface.p.width,
			canvasH: surface.p.height,
			cell: sceneFrame.grid.cell,
			cellW: sceneFrame.grid.cellW,
			cellH: sceneFrame.grid.cellH,
			...sceneFrame.grid.metrics
		});
		const baseOpts = createRuntimeShapeBaseOptions({
			grid: sceneFrame.grid,
			style: engine.style,
			liveAvg: sceneFrame.liveAvgSignal,
			gradientRGB,
			sceneLight,
			timeMs: tMs,
			dtSec: surface.p.deltaTime / 1e3,
			particleStore: effects.particleStore
		});
		return {
			...sceneFrame,
			tMs,
			sortedItems,
			sceneLight,
			baseOpts
		};
	}
	function renderLightingPass(frame) {
		if (typeof frame.spec.horizonPos !== "number") return;
		rowLightCache({
			p: surface.p,
			metrics: frame.grid.metrics,
			light: frame.sceneLight,
			alpha: engine.style.darkMode ? .18 : .11,
			compositeAlpha: frame.sceneSurface.alpha,
			minRow: 0
		});
	}
	function renderItemPass(frame) {
		drawItems({
			items: frame.sortedItems,
			visible: engine.field.visible,
			nowMs: frame.tMs,
			appearMs: engine.style.appearMs,
			appearStaggerMs: engine.style.appearStaggerMs,
			liveStates: effects.liveStates,
			perShapeScale: engine.style.perShapeScale,
			baseR: engine.style.r,
			baseOpts: frame.baseOpts,
			optsScratch,
			shapeOccurrenceScratch,
			renderOne: (it, rEff, opts, rootAppearK) => {
				renderOneSandboxed(it, rEff, opts, rootAppearK);
			}
		});
	}
	function tick(now) {
		if (!running) return;
		const sceneFrame = prepareSceneFrame(now);
		if (sceneFrame.sceneSurface.appearing) clearSceneSurfaceToUnderpaint(surface.p);
		renderBackgroundPass(sceneFrame);
		renderStarPass(sceneFrame);
		renderFoliagePass(sceneFrame);
		renderFogPass(sceneFrame);
		renderDebugPass(sceneFrame);
		const shapeFrame = prepareShapeFrame(sceneFrame);
		renderLightingPass(shapeFrame);
		renderItemPass(shapeFrame);
		renderAmbientParticlesPass(sceneFrame);
	}
	return {
		tick,
		stop() {
			running = false;
			clearRenderCaches();
		}
	};
}
//#endregion
//#region src/canvas-engine/runtime/engine/scheduler.ts
var entries = /* @__PURE__ */ new Map();
var rafId = null;
var sortedCache = null;
function sortEntries() {
	sortedCache ?? (sortedCache = Array.from(entries.values()).sort((a, b) => b.priority - a.priority || a.id.localeCompare(b.id)));
	return sortedCache;
}
function ensureRunning() {
	if (rafId != null) return;
	rafId = requestAnimationFrame(frame);
}
function stopIfIdle() {
	if (entries.size > 0) return;
	if (rafId != null) {
		cancelAnimationFrame(rafId);
		rafId = null;
	}
}
if (typeof document !== "undefined") document.addEventListener("visibilitychange", () => {
	if (!document.hidden && rafId == null && entries.size > 0) ensureRunning();
});
function frame(now) {
	if (typeof document !== "undefined" && document.hidden) {
		rafId = requestAnimationFrame(frame);
		return;
	}
	rafId = requestAnimationFrame(frame);
	const list = sortEntries();
	for (const e of list) {
		if (e.fpsCap && e.fpsCap > 0) {
			const minDt = 1e3 / e.fpsCap;
			if (now - e.lastTickMs < minDt) continue;
		}
		e.lastTickMs = now;
		try {
			e.tick(now);
		} catch (err) {
			reportSchedulerTickError(e.id, err);
		}
	}
	stopIfIdle();
}
function registerEngineFrame(id, tick, opts = {}) {
	const priority = typeof opts.priority === "number" && Number.isFinite(opts.priority) ? opts.priority : 0;
	const fpsCap = typeof opts.fpsCap === "number" && Number.isFinite(opts.fpsCap) ? opts.fpsCap : void 0;
	entries.set(id, {
		id,
		tick,
		priority,
		fpsCap,
		lastTickMs: 0
	});
	sortedCache = null;
	ensureRunning();
}
function unregisterEngineFrame(id) {
	entries.delete(id);
	sortedCache = null;
	stopIfIdle();
}
//#endregion
//#region src/canvas-engine/runtime/engine/itemLifecycle.ts
function footprintKey(footprint) {
	if (!footprint) return "";
	return `${String(footprint.w)}|${String(footprint.h)}|${String(footprint.r0)}|${String(footprint.c0)}`;
}
function shouldReplayAppear(prev, next) {
	if (prev.shape !== next.shape) return true;
	if (footprintKey(prev.footprint) !== footprintKey(next.footprint)) return true;
	const dx = Math.abs(prev.x - next.x);
	const dy = Math.abs(prev.y - next.y);
	return dx > .1 || dy > .1;
}
function reconcileLiveStatesOnFieldUpdate(args) {
	const { prevItems, nextItems, liveStates, nowMs, appearMs, appearStaggerMs } = args;
	const prevById = /* @__PURE__ */ new Map();
	for (const it of prevItems) prevById.set(it.id, it);
	const nextIds = /* @__PURE__ */ new Set();
	for (const it of nextItems) nextIds.add(it.id);
	for (const id of Array.from(liveStates.keys())) if (!nextIds.has(id)) liveStates.delete(id);
	for (const next of nextItems) {
		const state = liveStates.get(next.id);
		const prev = prevById.get(next.id);
		if (!state || !prev || shouldReplayAppear(prev, next)) liveStates.set(next.id, {
			bornAtMs: nowMs,
			appearMs,
			appearStaggerMs
		});
	}
}
//#endregion
//#region src/canvas-engine/runtime/engine/state.ts
var ENGINE_STYLE_DEFAULT = {
	r: 11,
	perShapeScale: {},
	gradientRGBOverride: null,
	blend: .5,
	exposure: 1.08,
	contrast: 1.03,
	appearMs: 300,
	appearStaggerMs: 1e3,
	darkMode: false,
	fog: true,
	shapeLightSource: null,
	debug: { ...DEBUG_DEFAULT }
};
function createEngineStyle(initialDarkMode) {
	return {
		...ENGINE_STYLE_DEFAULT,
		perShapeScale: { ...ENGINE_STYLE_DEFAULT.perShapeScale },
		debug: { ...ENGINE_STYLE_DEFAULT.debug },
		darkMode: typeof initialDarkMode === "boolean" ? initialDarkMode : ENGINE_STYLE_DEFAULT.darkMode
	};
}
function createEngineInputs() {
	return {
		liveAvg: .5,
		spotlight: null
	};
}
function createEngineField() {
	return {
		items: [],
		visible: false
	};
}
//#endregion
//#region src/canvas-engine/runtime/platform/mount.ts
var ENGINE_OWNED_MOUNT_ATTR = "data-be-engine-owned-mount";
function isEngineOwnedMount(el) {
	return el.getAttribute(ENGINE_OWNED_MOUNT_ATTR) === "true";
}
function ensureMount(mount, zIndex, layout = "fixed") {
	let el = document.querySelector(mount);
	const existed = !!el;
	if (!el) {
		el = document.createElement("div");
		el.id = mount.startsWith("#") ? mount.slice(1) : mount;
		el.setAttribute(ENGINE_OWNED_MOUNT_ATTR, "true");
		document.body.appendChild(el);
	}
	if ((layout === "auto" ? existed ? "inherit" : "fixed" : layout) === "fixed") el.style.zIndex = String(typeof zIndex === "number" && Number.isFinite(zIndex) ? zIndex : 2);
	else {
		const pos = getComputedStyle(el).position;
		if (pos === "static" || pos === "") el.style.position = "relative";
		if (typeof zIndex === "number" && Number.isFinite(zIndex)) el.style.zIndex = String(zIndex);
	}
	el.style.pointerEvents = "none";
	el.style.userSelect = "none";
	el.style.background = "var(--ui-bg-page)";
	el.style.setProperty("-webkit-tap-highlight-color", "transparent");
	el.classList.add("be-canvas-layer");
	return el;
}
function applyCanvasStyle(el) {
	el.style.position = "absolute";
	el.style.inset = "0";
	el.style.zIndex = "0";
	el.style.pointerEvents = "none";
	el.style.userSelect = "none";
	el.style.background = "var(--ui-bg-page)";
	el.style.transform = "translateZ(0)";
	el.style.imageRendering = "auto";
	el.setAttribute("tabindex", "-1");
}
var REGISTRY_BY_EL = /* @__PURE__ */ new WeakMap();
var REGISTRY_BY_KEY = /* @__PURE__ */ new Map();
function mountKey(mount) {
	return mount.trim();
}
function tryResolveMountEl(mount) {
	try {
		return document.querySelector(mount);
	} catch {
		return null;
	}
}
function stopByEl(el) {
	try {
		REGISTRY_BY_EL.get(el)?.stop();
	} catch {}
	try {
		REGISTRY_BY_EL.delete(el);
	} catch {}
}
function registerEngineInstance(args) {
	const { mount, parentEl, stop } = args;
	const key = mountKey(mount);
	const existing = REGISTRY_BY_EL.get(parentEl);
	if (existing?.stop) try {
		existing.stop();
	} catch {}
	try {
		REGISTRY_BY_EL.delete(parentEl);
	} catch {}
	const prevEl = REGISTRY_BY_KEY.get(key);
	if (prevEl && prevEl !== parentEl) stopByEl(prevEl);
	REGISTRY_BY_KEY.set(key, parentEl);
	REGISTRY_BY_EL.set(parentEl, { stop });
	return () => {
		try {
			if (REGISTRY_BY_KEY.get(key) === parentEl) REGISTRY_BY_KEY.delete(key);
		} catch {}
		try {
			stopByEl(parentEl);
		} catch {}
	};
}
function stopCanvasEngine(mount = "#canvas-root") {
	const key = mountKey(mount);
	try {
		const el = REGISTRY_BY_KEY.get(key);
		if (el) {
			stopByEl(el);
			REGISTRY_BY_KEY.delete(key);
		}
	} catch {}
	try {
		const el = tryResolveMountEl(mount);
		if (el) stopByEl(el);
	} catch {}
	try {
		const el = document.querySelector(mount);
		if (el instanceof HTMLElement && isEngineOwnedMount(el)) el.remove();
	} catch {}
}
var DEFAULT_RENDER_CACHE_POLICY = {
	farShapeBitmap: {
		enabled: true,
		farSizeK: .65,
		maxPixelsPerCanvasPixel: 5,
		maxBakesPerFrame: 48,
		alwaysLiveShapes: [
			"snow",
			"power",
			"sun",
			"house",
			"sea",
			"carFactory"
		]
	},
	shapeDepthMask: {
		maxPixelsPerCanvasPixel: 5,
		maxBakesPerFrame: 12,
		minBlend: .08,
		alwaysLiveShapes: [
			"power",
			"sea",
			"carFactory"
		]
	}
};
//#endregion
//#region src/canvas-engine/runtime/platform/viewport.ts
function resolvePixelDensity(mode) {
	const dpr = window.devicePixelRatio || 1;
	const isMobile = /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
	switch (mode) {
		case "fixed1": return 1;
		case "cap1_5": return Math.min(1.5, dpr);
		case "cap2": return Math.min(2, dpr);
		case "cap3": return Math.min(3, dpr);
		case "auto": return isMobile ? Math.min(2, dpr) : Math.min(3, dpr);
		default: return Math.min(3, dpr);
	}
}
function getViewportSize() {
	const vv = typeof window !== "undefined" ? window.visualViewport : null;
	if (vv?.width && vv.height) return {
		w: Math.round(vv.width),
		h: Math.round(vv.height)
	};
	return {
		w: Math.round(window.innerWidth || document.documentElement.clientWidth || 0),
		h: Math.round(window.innerHeight || document.documentElement.clientHeight || 0)
	};
}
//#endregion
//#region src/canvas-engine/runtime/geometry/bounds.ts
/**
* Resolve canvas pixel size from bounds policy.
*/
function resolveBounds(parentEl, bounds) {
	const b = bounds ?? { kind: "viewport" };
	if (b.kind === "fixed") return {
		w: b.w,
		h: b.h
	};
	if (b.kind === "parent") {
		const r = parentEl.getBoundingClientRect();
		return {
			w: Math.max(1, Math.round(r.width)),
			h: Math.max(1, Math.round(r.height))
		};
	}
	return getViewportSize();
}
//#endregion
//#region src/canvas-engine/runtime/platform/resize.ts
function installResizeHandlers(opts) {
	const { parentEl, canvasEl, p, dprMode, resizeTo, onAfterResize } = opts;
	let resizeRaf = null;
	let lastAppliedW = -1;
	let lastAppliedH = -1;
	let lastAppliedDpr = -1;
	function resizeNow() {
		const { w, h } = resizeTo();
		const nextDpr = resolvePixelDensity(dprMode);
		if (w === lastAppliedW && h === lastAppliedH && nextDpr === lastAppliedDpr) return;
		lastAppliedW = w;
		lastAppliedH = h;
		lastAppliedDpr = nextDpr;
		p.pixelDensity(nextDpr);
		p.resizeCanvas(w, h);
		canvasEl.style.width = `${String(w)}px`;
		canvasEl.style.height = `${String(h)}px`;
		applyCanvasStyle(canvasEl);
		onAfterResize?.();
	}
	function resizeThrottled() {
		if (resizeRaf != null) cancelAnimationFrame(resizeRaf);
		resizeRaf = requestAnimationFrame(resizeNow);
	}
	let ro = null;
	if (typeof ResizeObserver !== "undefined") {
		ro = new ResizeObserver(() => {
			resizeThrottled();
		});
		ro.observe(parentEl);
	}
	window.addEventListener("resize", resizeThrottled);
	const visHandler = () => {
		if (document.visibilityState === "visible") resizeThrottled();
	};
	document.addEventListener("visibilitychange", visHandler);
	resizeNow();
	return () => {
		try {
			if (resizeRaf != null) cancelAnimationFrame(resizeRaf);
		} catch {}
		try {
			ro?.disconnect();
		} catch {}
		ro = null;
		try {
			window.removeEventListener("resize", resizeThrottled);
		} catch {}
		try {
			document.removeEventListener("visibilitychange", visHandler);
		} catch {}
	};
}
//#endregion
//#region src/canvas-engine/runtime/index.ts
var FIELD_REFRESH_APPEAR_MS = 180;
var FIELD_REFRESH_STAGGER_MS = 120;
function startCanvasEngine(opts = {}) {
	const { mount = "#canvas-root", onReady, dprMode = "fixed1", zIndex = 2, layout = "fixed", fpsCap, initialDarkMode } = opts;
	const parentEl = ensureMount(mount, zIndex, layout);
	const style = createEngineStyle(initialDarkMode);
	const inputs = createEngineInputs();
	const field = createEngineField();
	let ENGINE_SEQ = 0;
	let sceneProfile = {
		lookupKey: "start",
		paddingSpec: null,
		background: null,
		ambientParticles: null,
		fog: null,
		foliage: null,
		renderCache: DEFAULT_RENDER_CACHE_POLICY
	};
	const liveStates = /* @__PURE__ */ new Map();
	const particleStore = createParticleStore();
	const sceneSurface = createSceneSurfaceLifecycleState();
	const canvasEl = document.createElement("canvas");
	applyCanvasStyle(canvasEl);
	parentEl.appendChild(canvasEl);
	const ctx = canvasEl.getContext("2d", { alpha: true });
	if (!ctx) throw new Error("2D canvas context not available");
	const p = makeP(canvasEl, ctx);
	const gridCache = createGridCache();
	const cleanupResize = installResizeHandlers({
		parentEl,
		canvasEl,
		p,
		dprMode,
		resizeTo: () => resolveBounds(parentEl, opts.bounds),
		onAfterResize: () => {
			invalidateGridCache(gridCache);
		}
	});
	const shapeRegistry = opts.shapeRegistry ?? createDefaultShapeRegistry();
	const surface = { p };
	const engineState = {
		field,
		style,
		inputs
	};
	const sceneSource = { getProfile: () => sceneProfile };
	const layoutState = { gridCache };
	const effectState = {
		liveStates,
		particleStore,
		sceneSurface
	};
	const shapeServices = { registry: shapeRegistry };
	const frameId = `${mount}::${String(++ENGINE_SEQ)}`;
	const ticker = createEngineTicker({
		surface,
		engineState,
		sceneSource,
		layout: layoutState,
		effects: effectState,
		shapes: shapeServices
	});
	let unregister = null;
	let didStop = false;
	function stop() {
		if (didStop) return;
		didStop = true;
		try {
			cleanupResize();
		} catch {}
		try {
			unregisterEngineFrame(frameId);
		} catch {}
		try {
			ticker.stop();
		} catch {}
		try {
			particleStore.clear();
		} catch {}
		try {
			canvasEl.remove();
		} catch {}
		try {
			unregister?.();
		} catch {}
	}
	function setInputs(args = {}) {
		if (typeof args.liveAvg === "number") inputs.liveAvg = clamp01$3(args.liveAvg);
		if ("spotlight" in args) inputs.spotlight = args.spotlight ?? null;
	}
	function setFieldItems(nextItems = [], options = {}) {
		const safeNextItems = Array.isArray(nextItems) ? nextItems : [];
		const isRefresh = field.items.length > 0 && safeNextItems.length > 0;
		const shouldReplayAppear = !isRefresh || options.replayAppear !== false;
		reconcileLiveStatesOnFieldUpdate({
			prevItems: field.items,
			nextItems: safeNextItems,
			liveStates,
			nowMs: p.millis(),
			appearMs: isRefresh ? shouldReplayAppear ? Math.min(style.appearMs, FIELD_REFRESH_APPEAR_MS) : 0 : style.appearMs,
			appearStaggerMs: isRefresh ? shouldReplayAppear ? Math.min(style.appearStaggerMs, FIELD_REFRESH_STAGGER_MS) : 0 : style.appearStaggerMs
		});
		field.items = safeNextItems;
	}
	function setFieldStyle(args = {}) {
		const { r, gradientRGBOverride, blend, perShapeScale, exposure, contrast, appearMs, appearStaggerMs } = args;
		if (typeof r === "number" && Number.isFinite(r) && r > 0) style.r = r;
		if ("gradientRGBOverride" in args) style.gradientRGBOverride = gradientRGBOverride ?? {
			r: 255,
			g: 255,
			b: 255
		};
		if (typeof blend === "number") style.blend = Math.max(0, Math.min(1, blend));
		if (typeof exposure === "number") style.exposure = Math.max(.1, Math.min(3, exposure));
		if (typeof contrast === "number") style.contrast = Math.max(.5, Math.min(2, contrast));
		if (perShapeScale && typeof perShapeScale === "object") style.perShapeScale = {
			...style.perShapeScale,
			...perShapeScale
		};
		if (typeof appearMs === "number" && Number.isFinite(appearMs) && appearMs >= 0) style.appearMs = appearMs | 0;
		if (typeof appearStaggerMs === "number" && Number.isFinite(appearStaggerMs) && appearStaggerMs >= 0) style.appearStaggerMs = appearStaggerMs | 0;
		if (typeof args.darkMode === "boolean") style.darkMode = args.darkMode;
		if (typeof args.fog === "boolean") style.fog = args.fog;
		if ("shapeLightSource" in args) {
			const source = args.shapeLightSource;
			style.shapeLightSource = source && typeof source.xK === "number" && Number.isFinite(source.xK) && typeof source.yK === "number" && Number.isFinite(source.yK) ? {
				xK: source.xK,
				yK: source.yK,
				paletteClosenessK: typeof source.paletteClosenessK === "number" && Number.isFinite(source.paletteClosenessK) ? Math.max(0, Math.min(1, source.paletteClosenessK)) : void 0
			} : null;
		}
		if (args.debug && typeof args.debug === "object") {
			const d = args.debug;
			if (typeof d.grid === "boolean") style.debug.grid = d.grid;
			if (typeof d.gridAlpha === "number") style.debug.gridAlpha = Math.max(0, Math.min(1, d.gridAlpha));
		}
	}
	function setFieldVisible(v) {
		field.visible = v;
	}
	function setVisibleCanvas(v) {
		canvasEl.style.opacity = v ? "1" : "0";
	}
	function setSceneProfile(next) {
		const nextProfile = {
			lookupKey: next.lookupKey,
			paddingSpec: next.paddingSpec ?? null,
			background: next.background ?? null,
			ambientParticles: next.ambientParticles ?? null,
			fog: next.fog ?? null,
			foliage: next.foliage ?? null,
			renderCache: next.renderCache
		};
		const shouldInvalidateGrid = sceneProfile.lookupKey !== nextProfile.lookupKey || sceneProfile.paddingSpec !== nextProfile.paddingSpec;
		sceneProfile = nextProfile;
		if (shouldInvalidateGrid) invalidateGridCache(gridCache);
	}
	const controls = {
		setInputs,
		setFieldItems,
		setFieldStyle,
		setFieldVisible,
		setVisible: setVisibleCanvas,
		setSceneProfile,
		stop,
		get canvas() {
			return canvasEl;
		}
	};
	unregister = registerEngineInstance({
		mount,
		parentEl,
		stop
	});
	onReady?.(controls);
	registerEngineFrame(frameId, ticker.tick, {
		priority: zIndex,
		fpsCap
	});
	return controls;
}
//#endregion
//#region src/canvas-engine/hooks/useCanvasEngine.ts
function safeCall(fn, label) {
	try {
		fn?.();
	} catch (err) {
		console.warn(`[useCanvasEngine] safeCall failed${label ? ` (${label})` : ""}:`, err);
	}
}
function shutdownControls(controls, mount) {
	if (!controls) {
		safeCall(() => {
			stopCanvasEngine(mount);
		});
		return;
	}
	safeCall(() => {
		controls.setVisible(false);
	});
	safeCall(() => {
		controls.stop();
	});
	safeCall(() => {
		stopCanvasEngine(mount);
	});
}
function useCanvasEngine(opts = {}) {
	const { enabled = true, visible = true, dprMode = "cap3", mount = "#canvas-root", zIndex = 2, bounds, fpsCap } = opts;
	const controlsRef = useRef(null);
	const readyRef = useRef(false);
	const [readyTick, setReadyTick] = useState(0);
	useEffect(() => {
		if (!enabled) {
			readyRef.current = false;
			const controls = controlsRef.current;
			controlsRef.current = null;
			shutdownControls(controls, mount);
			return;
		}
		readyRef.current = false;
		controlsRef.current = startCanvasEngine({
			mount,
			dprMode,
			zIndex,
			bounds,
			fpsCap,
			initialDarkMode: readStoredDarkMode(true),
			onReady: () => {
				readyRef.current = true;
				setReadyTick((t) => t + 1);
			}
		});
		return () => {
			readyRef.current = false;
			const controls = controlsRef.current;
			controlsRef.current = null;
			shutdownControls(controls, mount);
		};
	}, [
		enabled,
		dprMode,
		mount,
		zIndex,
		bounds,
		fpsCap
	]);
	useEffect(() => {
		safeCall(() => {
			controlsRef.current?.setVisible(visible);
		});
	}, [visible]);
	return {
		ready: readyRef,
		controls: controlsRef,
		readyTick
	};
}
//#endregion
//#region src/canvas-engine/hooks/useViewportKey.ts
var MOBILE_CHROME_HEIGHT_DELTA_PX = 300;
function readViewportSize() {
	const vv = window.visualViewport;
	if (vv?.width && vv.height) return {
		w: Math.round(vv.width),
		h: Math.round(vv.height)
	};
	return {
		w: Math.round(window.innerWidth || document.documentElement.clientWidth || 0),
		h: Math.round(window.innerHeight || document.documentElement.clientHeight || 0)
	};
}
function useViewportKey(delay = 120) {
	const [key, setKey] = useState(0);
	const tRef = useRef(null);
	const lastSizeRef = useRef(null);
	useEffect(() => {
		if (typeof window === "undefined") return;
		const tick = () => {
			setKey((k) => k + 1);
		};
		const scheduleTick = () => {
			if (tRef.current != null) window.clearTimeout(tRef.current);
			tRef.current = window.setTimeout(tick, delay);
		};
		const onResize = () => {
			const next = readViewportSize();
			const prev = lastSizeRef.current;
			lastSizeRef.current = next;
			if (!prev) {
				scheduleTick();
				return;
			}
			const dw = Math.abs(next.w - prev.w);
			const dh = Math.abs(next.h - prev.h);
			if (dw <= 1 && dh > 0 && dh < MOBILE_CHROME_HEIGHT_DELTA_PX) return;
			scheduleTick();
		};
		const onOrientationChange = () => {
			lastSizeRef.current = readViewportSize();
			scheduleTick();
		};
		const vv = window.visualViewport;
		lastSizeRef.current = readViewportSize();
		window.addEventListener("resize", onResize, { passive: true });
		window.addEventListener("orientationchange", onOrientationChange, { passive: true });
		vv?.addEventListener("resize", onResize, { passive: true });
		tick();
		return () => {
			window.removeEventListener("resize", onResize);
			window.removeEventListener("orientationchange", onOrientationChange);
			vv?.removeEventListener("resize", onResize);
			if (tRef.current != null) window.clearTimeout(tRef.current);
		};
	}, [delay]);
	return key;
}
//#endregion
//#region src/canvas-engine/scene-rules/shapeFootprints.ts
var SHAPE_FOOTPRINTS = {
	clouds: {
		w: 2,
		h: 3
	},
	snow: {
		w: 1,
		h: 3
	},
	house: {
		w: 1,
		h: 4
	},
	power: {
		w: 1,
		h: 3
	},
	sun: {
		w: 2,
		h: 2
	},
	villa: {
		w: 2,
		h: 2
	},
	car: {
		w: 1,
		h: 1
	},
	sea: {
		w: 2,
		h: 1
	},
	carFactory: {
		w: 2,
		h: 2
	},
	bus: {
		w: 2,
		h: 1
	},
	trees: {
		w: 1,
		h: 1
	}
};
function footprintForShape(shape) {
	return SHAPE_FOOTPRINTS[shape];
}
//#endregion
//#region src/canvas-engine/scene-rules/placement-rules/start.ts
var FLAT_QUOTA$2 = [{
	t: 0,
	pct: 50
}, {
	t: 1,
	pct: 50
}];
var S = {
	clouds: [{
		t: 0,
		pct: 40
	}, {
		t: 1,
		pct: 60
	}],
	snow: [{
		t: 0,
		pct: 40
	}, {
		t: 1,
		pct: 80
	}],
	villa: [{
		t: 0,
		pct: 48
	}, {
		t: 1,
		pct: 32
	}],
	house: [{
		t: 0,
		pct: 33
	}, {
		t: 1,
		pct: 38
	}],
	power: [{
		t: 0,
		pct: 90
	}, {
		t: 1,
		pct: 60
	}],
	carFactory: [{
		t: 0,
		pct: 20
	}, {
		t: 1,
		pct: 5
	}],
	trees: [{
		t: 0,
		pct: 25
	}, {
		t: 1,
		pct: 40
	}],
	bus: [{
		t: 0,
		pct: 20
	}, {
		t: 1,
		pct: 40
	}],
	car: [{
		t: 0,
		pct: 100
	}, {
		t: 1,
		pct: 20
	}]
};
function count$2(mobile, tablet, laptop) {
	return {
		mobile,
		tablet,
		laptop
	};
}
var START_PLACEMENTS = { preset: {
	kind: "zone-communities",
	zones: [
		{
			id: "sky-light",
			band: "sky",
			center: {
				x: .2,
				y: .1
			},
			radius: {
				tiles: 2,
				xDistort: 1.8,
				yDistort: .8
			},
			shapes: { sun: {
				count: count$2(0, 0, 1),
				quota: FLAT_QUOTA$2
			} }
		},
		{
			id: "sky-light-tablet",
			band: "sky",
			center: {
				x: .1,
				y: .4
			},
			radius: {
				tiles: 2,
				xDistort: 1.8,
				yDistort: .8
			},
			shapes: { sun: {
				count: count$2(0, 1, 0),
				quota: FLAT_QUOTA$2
			} }
		},
		{
			id: "sky-light-mobile",
			band: "sky",
			center: {
				x: .05,
				y: .15
			},
			radius: {
				tiles: 2,
				xDistort: 1.8,
				yDistort: .8
			},
			shapes: { sun: {
				count: count$2(1, 0, 0),
				quota: FLAT_QUOTA$2
			} }
		},
		{
			id: "weather-right-close",
			band: "sky",
			center: {
				x: .65,
				y: 0
			},
			radius: {
				tiles: 6,
				xDistort: 3,
				yTiles: .6
			},
			shapes: {
				clouds: {
					count: count$2(0, 0, 2),
					quota: S.clouds
				},
				snow: {
					count: count$2(0, 0, 1),
					quota: S.snow
				}
			}
		},
		{
			id: "weather-right-close-2",
			band: "sky",
			center: {
				x: .7,
				y: 0
			},
			radius: {
				tiles: 4,
				xDistort: 6,
				yTiles: .3
			},
			shapes: {
				clouds: {
					count: count$2(0, 2, 0),
					quota: S.clouds
				},
				snow: {
					count: count$2(0, 1, 0),
					quota: S.snow
				}
			}
		},
		{
			id: "weather-right-mid",
			band: "sky",
			center: {
				x: 1,
				y: .15
			},
			radius: {
				tiles: 6,
				xDistort: 5,
				yTiles: .4
			},
			shapes: { clouds: {
				count: count$2(0, 0, 2),
				quota: S.clouds
			} }
		},
		{
			id: "weather-right-mid-mobile",
			band: "sky",
			center: {
				x: .7,
				y: .7
			},
			radius: {
				tiles: 6,
				xDistort: 4,
				yTiles: 1
			},
			shapes: {
				clouds: {
					count: count$2(2, 0, 0),
					quota: S.clouds
				},
				snow: {
					count: count$2(1, 0, 0),
					quota: S.snow
				}
			}
		},
		{
			id: "weather-left-mid-mobile",
			band: "sky",
			center: {
				x: .15,
				y: .6
			},
			radius: {
				tiles: 6,
				xDistort: 5,
				yTiles: .4
			},
			shapes: {
				clouds: {
					count: count$2(3, 0, 0),
					quota: S.clouds
				},
				snow: {
					count: count$2(2, 0, 0),
					quota: S.snow
				}
			}
		},
		{
			id: "weather-left-far-mobile",
			band: "sky",
			center: {
				x: .1,
				y: 1
			},
			radius: {
				tiles: 6,
				xDistort: 5,
				yTiles: .4
			},
			shapes: {
				clouds: {
					count: count$2(4, 0, 0),
					quota: S.clouds
				},
				snow: {
					count: count$2(3, 0, 0),
					quota: S.snow
				}
			}
		},
		{
			id: "weather-left-far-mobile-2",
			band: "sky",
			center: {
				x: .8,
				y: 1
			},
			radius: {
				tiles: 6,
				xDistort: 5,
				yTiles: .4
			},
			shapes: {
				clouds: {
					count: count$2(4, 0, 0),
					quota: S.clouds
				},
				snow: {
					count: count$2(3, 0, 0),
					quota: S.snow
				}
			}
		},
		{
			id: "weather-right-mid-2",
			band: "sky",
			center: {
				x: .85,
				y: .45
			},
			radius: {
				tiles: 6,
				xDistort: 1,
				yTiles: .2
			},
			shapes: {
				clouds: {
					count: count$2(0, 0, 3),
					quota: S.clouds
				},
				snow: {
					count: count$2(0, 0, 1),
					quota: S.snow
				}
			}
		},
		{
			id: "weather-right-mid-tablet",
			band: "sky",
			center: {
				x: .7,
				y: .7
			},
			radius: {
				tiles: 6,
				xDistort: 4,
				yTiles: .2
			},
			shapes: {
				clouds: {
					count: count$2(0, 2, 0),
					quota: S.clouds
				},
				snow: {
					count: count$2(0, 1, 0),
					quota: S.snow
				}
			}
		},
		{
			id: "weather-right-far",
			band: "sky",
			center: {
				x: .7,
				y: .9
			},
			radius: {
				tiles: 6,
				xDistort: 6,
				yTiles: .4
			},
			shapes: {
				clouds: {
					count: count$2(2, 0, 3),
					quota: S.clouds
				},
				snow: {
					count: count$2(1, 0, 2),
					quota: S.snow
				}
			}
		},
		{
			id: "weather-right-far-tablet",
			band: "sky",
			center: {
				x: .3,
				y: 1
			},
			radius: {
				tiles: 6,
				xDistort: 6,
				yTiles: .4
			},
			shapes: {
				clouds: {
					count: count$2(0, 3, 0),
					quota: S.clouds
				},
				snow: {
					count: count$2(0, 2, 0),
					quota: S.snow
				}
			}
		},
		{
			id: "weather-mid-far-tablet",
			band: "sky",
			center: {
				x: .1,
				y: 1
			},
			radius: {
				tiles: 6,
				xDistort: 6,
				yTiles: .4
			},
			shapes: {
				clouds: {
					count: count$2(0, 4, 0),
					quota: S.clouds
				},
				snow: {
					count: count$2(0, 3, 0),
					quota: S.snow
				}
			}
		},
		{
			id: "weather-right-far-2",
			band: "sky",
			center: {
				x: .95,
				y: .55
			},
			radius: {
				tiles: 6,
				xDistort: 6,
				yTiles: .4
			},
			shapes: {
				clouds: {
					count: count$2(0, 3, 0),
					quota: S.clouds
				},
				snow: {
					count: count$2(0, 2, 0),
					quota: S.snow
				}
			}
		},
		{
			id: "weather-right-far-2-mobile",
			band: "sky",
			center: {
				x: .45,
				y: .8
			},
			radius: {
				tiles: 3,
				xDistort: 4,
				yTiles: .5
			},
			shapes: { clouds: {
				count: count$2(2, 0, 0),
				quota: S.clouds
			} }
		},
		{
			id: "weather-left-far",
			band: "sky",
			center: {
				x: .42,
				y: .9
			},
			radius: {
				tiles: 6,
				xDistort: 4,
				yTiles: .4
			},
			shapes: {
				clouds: {
					count: count$2(0, 0, 2),
					quota: S.clouds
				},
				snow: {
					count: count$2(0, 0, 2),
					quota: S.snow
				}
			}
		},
		{
			id: "weather-left-far-mobile",
			band: "sky",
			center: {
				x: .3,
				y: .9
			},
			radius: {
				tiles: 6,
				xDistort: 4,
				yTiles: .4
			},
			shapes: {
				clouds: {
					count: count$2(3, 0, 0),
					quota: S.clouds
				},
				snow: {
					count: count$2(2, 0, 0),
					quota: S.snow
				}
			}
		},
		{
			id: "weather-right-mobile",
			band: "sky",
			center: {
				x: 1.1,
				y: .5
			},
			radius: {
				tiles: 6,
				xDistort: 4,
				yTiles: .4
			},
			shapes: { clouds: {
				count: count$2(2, 0, 0),
				quota: S.clouds
			} }
		},
		{
			id: "weather-left-far",
			band: "sky",
			center: {
				x: .2,
				y: .9
			},
			radius: {
				tiles: 6,
				xDistort: 4,
				yTiles: .4
			},
			shapes: {
				clouds: {
					count: count$2(0, 0, 3),
					quota: S.clouds
				},
				snow: {
					count: count$2(0, 0, 1),
					quota: S.snow
				}
			}
		},
		{
			id: "weather-left-far-tablet",
			band: "sky",
			center: {
				x: .22,
				y: .8
			},
			radius: {
				tiles: 6,
				xDistort: 4,
				yTiles: .4
			},
			shapes: {
				clouds: {
					count: count$2(0, 4, 0),
					quota: S.clouds
				},
				snow: {
					count: count$2(0, 2, 0),
					quota: S.snow
				}
			}
		},
		{
			id: "weather-left-far",
			band: "sky",
			center: {
				x: .15,
				y: .8
			},
			radius: {
				tiles: 3,
				xDistort: 4,
				yTiles: .4
			},
			shapes: { clouds: {
				count: count$2(0, 0, 2),
				quota: S.clouds
			} }
		},
		{
			id: "weather-left-far",
			band: "sky",
			center: {
				x: .1,
				y: 1
			},
			radius: {
				tiles: 3,
				xDistort: 4,
				yTiles: .4
			},
			shapes: {
				clouds: {
					count: count$2(0, 0, 2),
					quota: S.clouds
				},
				snow: {
					count: count$2(0, 0, 2),
					quota: S.snow
				}
			}
		},
		{
			id: "weather-left-close",
			band: "sky",
			center: {
				x: .1,
				y: .3
			},
			radius: {
				tiles: 3,
				xDistort: 4,
				yTiles: .6
			},
			shapes: {
				clouds: {
					count: count$2(0, 0, 2),
					quota: S.clouds
				},
				snow: {
					count: count$2(0, 0, 2),
					quota: S.snow
				}
			}
		},
		{
			id: "weather-left-mid-2",
			band: "sky",
			center: {
				x: .25,
				y: .7
			},
			radius: {
				tiles: 1,
				xDistort: 2,
				yTiles: .6
			},
			shapes: {
				clouds: {
					count: count$2(0, 0, 3),
					quota: S.clouds
				},
				snow: {
					count: count$2(0, 0, 2),
					quota: S.snow
				}
			}
		},
		{
			id: "weather-mid-far",
			band: "sky",
			center: {
				x: .52,
				y: .8
			},
			radius: {
				tiles: 3,
				xDistort: 4,
				yTiles: .6
			},
			shapes: {
				clouds: {
					count: count$2(0, 3, 3),
					quota: S.clouds
				},
				snow: {
					count: count$2(0, 2, 2),
					quota: S.snow
				}
			}
		},
		{
			id: "weather-left-top-tablet",
			band: "sky",
			center: {
				x: .1,
				y: .22
			},
			radius: {
				tiles: 4,
				xDistort: 3,
				yTiles: .4
			},
			shapes: {
				clouds: {
					count: count$2(0, 2, 0),
					quota: S.clouds
				},
				snow: {
					count: count$2(0, 1, 0),
					quota: S.snow
				}
			}
		},
		{
			id: "weather-mid-far-tablet-2",
			band: "sky",
			center: {
				x: .35,
				y: .6
			},
			radius: {
				tiles: 1,
				xDistort: 3,
				yTiles: .3
			},
			shapes: {
				clouds: {
					count: count$2(0, 3, 0),
					quota: S.clouds
				},
				snow: {
					count: count$2(0, 1, 0),
					quota: S.snow
				}
			}
		},
		{
			id: "weather-mid-far-2",
			band: "sky",
			center: {
				x: .95,
				y: .6
			},
			radius: {
				tiles: 1,
				xDistort: 3,
				yTiles: .3
			},
			shapes: {
				clouds: {
					count: count$2(0, 0, 2),
					quota: S.clouds
				},
				snow: {
					count: count$2(0, 0, 1),
					quota: S.snow
				}
			}
		},
		{
			id: "weather-mid-far-3",
			band: "sky",
			center: {
				x: .22,
				y: 1
			},
			radius: {
				tiles: 3,
				xDistort: 2,
				yTiles: .3
			},
			shapes: {
				clouds: {
					count: count$2(0, 0, 3),
					quota: S.clouds
				},
				snow: {
					count: count$2(0, 0, 2),
					quota: S.snow
				}
			}
		},
		{
			id: "weather-mid-far-4",
			band: "sky",
			center: {
				x: .55,
				y: 1
			},
			radius: {
				tiles: 3,
				xDistort: 2,
				yTiles: .3
			},
			shapes: {
				clouds: {
					count: count$2(0, 2, 2),
					quota: S.clouds
				},
				snow: {
					count: count$2(0, 3, 3),
					quota: S.snow
				}
			}
		},
		{
			id: "weather-right-far-4",
			band: "sky",
			center: {
				x: .84,
				y: 1
			},
			radius: {
				tiles: 3,
				xDistort: 3,
				yTiles: .3
			},
			shapes: {
				clouds: {
					count: count$2(0, 3, 3),
					quota: S.clouds
				},
				snow: {
					count: count$2(0, 2, 2),
					quota: S.snow
				}
			}
		},
		{
			id: "left-far-community",
			band: "ground",
			center: {
				x: .2,
				y: 0
			},
			radius: {
				tiles: 8,
				xDistort: 6,
				yDistort: .3
			},
			shapes: {
				house: {
					count: count$2(2, 2, 3),
					quota: S.house
				},
				villa: {
					count: count$2(2, 3, 5),
					quota: S.villa
				},
				trees: {
					count: count$2(4, 6, 8),
					quota: S.trees
				},
				car: {
					count: count$2(1, 2, 4),
					quota: S.car
				}
			}
		},
		{
			id: "left-far-trees",
			band: "ground",
			center: {
				x: .4,
				y: 0
			},
			radius: {
				tiles: 8,
				xDistort: 6,
				yDistort: 4
			},
			shapes: { trees: {
				count: count$2(6, 6, 8),
				quota: S.trees
			} }
		},
		{
			id: "mid-far-trees",
			band: "ground",
			center: {
				x: .45,
				y: .1
			},
			radius: {
				tiles: 8,
				xDistort: 6,
				yDistort: 3
			},
			shapes: {
				trees: {
					count: count$2(6, 6, 8),
					quota: S.trees
				},
				villa: {
					count: count$2(2, 3, 3),
					quota: S.villa
				}
			}
		},
		{
			id: "mid-far-trees",
			band: "ground",
			center: {
				x: .46,
				y: 0
			},
			radius: {
				tiles: 8,
				xDistort: 6,
				yDistort: 3
			},
			shapes: {
				trees: {
					count: count$2(6, 6, 8),
					quota: S.trees
				},
				villa: {
					count: count$2(2, 3, 3),
					quota: S.villa
				},
				house: {
					count: count$2(1, 2, 1),
					quota: S.house
				}
			}
		},
		{
			id: "right-close-trees",
			band: "ground",
			center: {
				x: 1,
				y: .85
			},
			radius: {
				tiles: 4,
				xDistort: 4,
				yDistort: 3
			},
			shapes: { trees: {
				count: count$2(4, 4, 6),
				quota: S.trees
			} }
		},
		{
			id: "mid-far-trees",
			band: "ground",
			center: {
				x: .54,
				y: .3
			},
			radius: {
				tiles: 6,
				xDistort: 4,
				yDistort: 2
			},
			shapes: {
				trees: {
					count: count$2(4, 3, 6),
					quota: S.trees
				},
				villa: {
					count: count$2(3, 1, 2),
					quota: S.villa
				},
				bus: {
					count: count$2(0, 0, 1),
					quota: S.bus
				}
			}
		},
		{
			id: "left-far-trees",
			band: "ground",
			center: {
				x: .06,
				y: 0
			},
			radius: {
				tiles: 12,
				xDistort: 8,
				yDistort: 3
			},
			shapes: { trees: {
				count: count$2(4, 4, 16),
				quota: S.trees
			} }
		},
		{
			id: "left-far-trees-2",
			band: "ground",
			center: {
				x: .3,
				y: 0
			},
			radius: {
				tiles: 12,
				xDistort: 8,
				yDistort: 2
			},
			shapes: {
				villa: {
					count: count$2(2, 3, 6),
					quota: S.villa
				},
				trees: {
					count: count$2(4, 4, 12),
					quota: S.trees
				}
			}
		},
		{
			id: "left-far-trees-3",
			band: "ground",
			center: {
				x: .7,
				y: 0
			},
			radius: {
				tiles: 12,
				xDistort: 8,
				yDistort: 2
			},
			shapes: {
				villa: {
					count: count$2(2, 1, 4),
					quota: S.villa
				},
				trees: {
					count: count$2(4, 4, 6),
					quota: S.trees
				}
			}
		},
		{
			id: "right-mid-trees",
			band: "ground",
			center: {
				x: .8,
				y: .2
			},
			radius: {
				tiles: 4,
				xDistort: 4,
				yDistort: 1
			},
			shapes: { trees: {
				count: count$2(3, 2, 4),
				quota: S.trees
			} }
		},
		{
			id: "left-mid",
			band: "ground",
			center: {
				x: .05,
				y: .2
			},
			radius: {
				tiles: 4,
				xDistort: 6,
				yDistort: 1
			},
			shapes: {
				villa: {
					count: count$2(2, 1, 4),
					quota: S.villa
				},
				trees: {
					count: count$2(2, 4, 6),
					quota: S.trees
				},
				car: {
					count: count$2(1, 2, 0),
					quota: S.car
				},
				power: {
					count: count$2(1, 1, 1),
					quota: FLAT_QUOTA$2
				},
				clouds: {
					count: count$2(0, 0, 1),
					quota: FLAT_QUOTA$2
				},
				snow: {
					count: count$2(0, 0, 1),
					quota: FLAT_QUOTA$2
				}
			}
		},
		{
			id: "right-far-trees-tablet-2",
			band: "ground",
			center: {
				x: .9,
				y: .1
			},
			radius: {
				tiles: 4,
				xDistort: 4,
				yDistort: 1
			},
			shapes: { trees: {
				count: count$2(0, 6, 0),
				quota: S.trees
			} }
		},
		{
			id: "right-far-trees",
			band: "ground",
			center: {
				x: .75,
				y: 0
			},
			radius: {
				tiles: 4,
				xDistort: 4,
				yDistort: 1
			},
			shapes: { trees: {
				count: count$2(4, 8, 6),
				quota: S.trees
			} }
		},
		{
			id: "right-far-trees-2",
			band: "ground",
			center: {
				x: .75,
				y: .05
			},
			radius: {
				tiles: 4,
				xDistort: 3,
				yDistort: 1
			},
			shapes: {
				villa: {
					count: count$2(2, 1, 4),
					quota: S.villa
				},
				trees: {
					count: count$2(1, 3, 6),
					quota: S.trees
				},
				clouds: {
					count: count$2(0, 1, 1),
					quota: FLAT_QUOTA$2
				}
			}
		},
		{
			id: "right-far-community",
			band: "ground",
			center: {
				x: .65,
				y: 0
			},
			radius: {
				tiles: 6,
				xDistort: 4,
				yDistort: 2
			},
			shapes: {
				villa: {
					count: count$2(2, 3, 4),
					quota: S.villa
				},
				trees: {
					count: count$2(3, 3, 3),
					quota: S.trees
				},
				car: {
					count: count$2(1, 2, 1),
					quota: S.car
				},
				bus: {
					count: count$2(1, 1, 0),
					quota: S.bus
				},
				power: {
					count: count$2(1, 1, 1),
					quota: FLAT_QUOTA$2
				},
				clouds: {
					count: count$2(1, 0, 1),
					quota: FLAT_QUOTA$2
				}
			}
		},
		{
			id: "right-far-community-2",
			band: "ground",
			center: {
				x: .95,
				y: 0
			},
			radius: {
				tiles: 6,
				xDistort: 5,
				yDistort: 1.5
			},
			shapes: {
				villa: {
					count: count$2(2, 2, 1),
					quota: S.villa
				},
				house: {
					count: count$2(3, 1, 0),
					quota: S.house
				},
				trees: {
					count: count$2(6, 8, 4),
					quota: S.trees
				},
				car: {
					count: count$2(1, 2, 1),
					quota: S.car
				},
				bus: {
					count: count$2(1, 1, 1),
					quota: S.bus
				}
			}
		},
		{
			id: "right-far-community-2",
			band: "ground",
			center: {
				x: 1,
				y: .4
			},
			radius: {
				tiles: 6,
				xDistort: 4,
				yDistort: 2
			},
			shapes: {
				villa: {
					count: count$2(0, 1, 4),
					quota: S.villa
				},
				house: {
					count: count$2(0, 0, 4),
					quota: S.house
				},
				trees: {
					count: count$2(2, 4, 2),
					quota: S.trees
				},
				car: {
					count: count$2(1, 1, 1),
					quota: S.car
				},
				bus: {
					count: count$2(1, 1, 1),
					quota: S.bus
				},
				power: {
					count: count$2(1, 1, 2),
					quota: FLAT_QUOTA$2
				}
			}
		},
		{
			id: "right-close-community",
			band: "ground",
			center: {
				x: .85,
				y: .4
			},
			radius: {
				tiles: 6,
				xDistort: 4,
				yDistort: 2
			},
			shapes: {
				villa: {
					count: count$2(2, 1, 2),
					quota: S.villa
				},
				trees: {
					count: count$2(1, 2, 4),
					quota: S.trees
				},
				car: {
					count: count$2(0, 1, 1),
					quota: S.car
				},
				bus: {
					count: count$2(1, 1, 1),
					quota: S.bus
				},
				snow: {
					count: count$2(1, 1, 1),
					quota: FLAT_QUOTA$2
				}
			}
		},
		{
			id: "right-community",
			band: "ground",
			center: {
				x: .85,
				y: .8
			},
			radius: {
				tiles: 3,
				xDistort: 2,
				yDistort: 1
			},
			shapes: {
				house: {
					count: count$2(1, 0, 1),
					quota: S.house
				},
				villa: {
					count: count$2(0, 2, 3),
					quota: S.villa
				},
				trees: {
					count: count$2(1, 3, 8),
					quota: S.trees
				},
				car: {
					count: count$2(1, 1, 1),
					quota: S.car
				},
				power: {
					count: count$2(1, 0, 0),
					quota: FLAT_QUOTA$2
				},
				carFactory: {
					count: count$2(2, 1, 1),
					quota: S.carFactory
				}
			}
		},
		{
			id: "left-community-mobile",
			band: "ground",
			center: {
				x: 0,
				y: .9
			},
			radius: {
				tiles: 4,
				xDistort: 1,
				yDistort: 3
			},
			shapes: {
				villa: {
					count: count$2(1, 0, 0),
					quota: S.villa
				},
				house: {
					count: count$2(2, 0, 0),
					quota: S.house
				},
				car: {
					count: count$2(1, 0, 1),
					quota: S.car
				}
			}
		},
		{
			id: "right-community",
			band: "ground",
			center: {
				x: .8,
				y: .55
			},
			radius: {
				tiles: 8,
				xDistort: 5,
				yDistort: .4
			},
			shapes: {
				trees: {
					count: count$2(2, 0, 4),
					quota: S.trees
				},
				car: {
					count: count$2(1, 0, 1),
					quota: S.car
				},
				power: {
					count: count$2(1, 0, 0),
					quota: FLAT_QUOTA$2
				},
				carFactory: {
					count: count$2(1, 0, 1),
					quota: S.carFactory
				}
			}
		},
		{
			id: "mid-community-2",
			band: "ground",
			center: {
				x: .65,
				y: .5
			},
			radius: {
				tiles: 4,
				xDistort: 2,
				yDistort: 1
			},
			shapes: {
				house: {
					count: count$2(0, 1, 1),
					quota: S.house
				},
				villa: {
					count: count$2(0, 1, 1),
					quota: S.villa
				},
				trees: {
					count: count$2(3, 3, 5),
					quota: S.trees
				},
				car: {
					count: count$2(0, 1, 2),
					quota: S.car
				},
				power: {
					count: count$2(0, 1, 0),
					quota: FLAT_QUOTA$2
				},
				carFactory: {
					count: count$2(1, 1, 1),
					quota: S.carFactory
				}
			}
		},
		{
			id: "mid-close-community",
			band: "ground",
			center: {
				x: .55,
				y: .65
			},
			radius: {
				tiles: 4,
				xDistort: 6,
				yDistort: 2
			},
			shapes: {
				villa: {
					count: count$2(0, 1, 0),
					quota: S.villa
				},
				trees: {
					count: count$2(1, 2, 3),
					quota: S.trees
				},
				car: {
					count: count$2(1, 1, 0),
					quota: S.car
				},
				house: {
					count: count$2(0, 1, 0),
					quota: S.house
				},
				bus: {
					count: count$2(0, 0, 1),
					quota: S.bus
				},
				carFactory: {
					count: count$2(1, 1, 1),
					quota: S.carFactory
				},
				sea: {
					count: count$2(0, 0, 1),
					quota: FLAT_QUOTA$2
				}
			}
		},
		{
			id: "mid-close-community-2",
			band: "ground",
			center: {
				x: .55,
				y: .8
			},
			radius: {
				tiles: 4,
				xDistort: 6,
				yDistort: 1
			},
			shapes: {
				villa: {
					count: count$2(0, 1, 1),
					quota: S.villa
				},
				trees: {
					count: count$2(1, 3, 3),
					quota: S.trees
				},
				car: {
					count: count$2(1, 1, 0),
					quota: S.car
				},
				power: {
					count: count$2(0, 0, 1),
					quota: FLAT_QUOTA$2
				}
			}
		},
		{
			id: "mid-edge",
			band: "ground",
			center: {
				x: .65,
				y: .8
			},
			radius: {
				tiles: 8,
				xDistort: 6,
				yDistort: 1
			},
			shapes: {
				villa: {
					count: count$2(2, 1, 1),
					quota: S.villa
				},
				trees: {
					count: count$2(1, 2, 2),
					quota: S.trees
				},
				car: {
					count: count$2(0, 1, 1),
					quota: S.car
				},
				bus: {
					count: count$2(0, 1, 0),
					quota: S.bus
				},
				house: {
					count: count$2(0, 0, 1),
					quota: S.house
				}
			}
		},
		{
			id: "mid-edge-2",
			band: "ground",
			center: {
				x: .72,
				y: .55
			},
			radius: {
				tiles: 4,
				xDistort: 3,
				yDistort: .3
			},
			shapes: {
				trees: {
					count: count$2(0, 2, 5),
					quota: S.trees
				},
				sea: {
					count: count$2(1, 1, 1),
					quota: FLAT_QUOTA$2
				}
			}
		},
		{
			id: "left-edge",
			band: "ground",
			center: {
				x: .2,
				y: .5
			},
			radius: {
				tiles: 8,
				xDistort: 6,
				yDistort: .3
			},
			shapes: { trees: {
				count: count$2(4, 3, 5),
				quota: S.trees
			} }
		},
		{
			id: "right-edge-2",
			band: "ground",
			center: {
				x: .57,
				y: .4
			},
			radius: {
				tiles: 8,
				xDistort: 6,
				yDistort: .3
			},
			shapes: { trees: {
				count: count$2(2, 4, 8),
				quota: S.trees
			} }
		},
		{
			id: "right-edge-3",
			band: "ground",
			center: {
				x: .8,
				y: .45
			},
			radius: {
				tiles: 8,
				xDistort: 3,
				yDistort: .4
			},
			shapes: {
				trees: {
					count: count$2(0, 0, 4),
					quota: S.trees
				},
				house: {
					count: count$2(0, 1, 0),
					quota: S.house
				},
				villa: {
					count: count$2(0, 2, 4),
					quota: S.villa
				}
			}
		},
		{
			id: "left-edge-4",
			band: "ground",
			center: {
				x: .9,
				y: .8
			},
			radius: {
				tiles: 4,
				xDistort: 2,
				yDistort: 2
			},
			shapes: {
				trees: {
					count: count$2(0, 0, 1),
					quota: S.trees
				},
				house: {
					count: count$2(0, 0, 0),
					quota: S.house
				},
				sea: {
					count: count$2(0, 0, 1),
					quota: FLAT_QUOTA$2
				},
				car: {
					count: count$2(1, 1, 2),
					quota: S.car
				}
			}
		},
		{
			id: "right-edge-tablet",
			band: "ground",
			center: {
				x: .9,
				y: 1
			},
			radius: {
				tiles: 8,
				xDistort: 6,
				yDistort: .3
			},
			shapes: { trees: {
				count: count$2(0, 4, 0),
				quota: S.trees
			} }
		},
		{
			id: "right-edge-tablet",
			band: "ground",
			center: {
				x: 1,
				y: .5
			},
			radius: {
				tiles: 8,
				xDistort: 6,
				yDistort: .3
			},
			shapes: { trees: {
				count: count$2(0, 6, 3),
				quota: S.trees
			} }
		},
		{
			id: "mid-trees",
			band: "ground",
			center: {
				x: .35,
				y: .9
			},
			radius: {
				tiles: 5,
				xDistort: 6,
				yDistort: .3
			},
			shapes: { trees: {
				count: count$2(1, 2, 2),
				quota: S.trees
			} }
		},
		{
			id: "mid-close-patch",
			band: "ground",
			center: {
				x: .5,
				y: .9
			},
			radius: {
				tiles: 3,
				xDistort: 6,
				yDistort: .6
			},
			shapes: { trees: {
				count: count$2(0, 0, 3),
				quota: S.trees
			} }
		},
		{
			id: "right-close-patch-mobile",
			band: "ground",
			center: {
				x: .9,
				y: 1
			},
			radius: {
				tiles: 4,
				xDistort: 6,
				yDistort: .3
			},
			shapes: {
				trees: {
					count: count$2(3, 0, 0),
					quota: S.trees
				},
				car: {
					count: count$2(0, 0, 0),
					quota: S.car
				},
				sea: {
					count: count$2(1, 0, 0),
					quota: FLAT_QUOTA$2
				}
			}
		},
		{
			id: "left-close-patch-mobile",
			band: "ground",
			center: {
				x: 0,
				y: .9
			},
			radius: {
				tiles: 3,
				xDistort: 6,
				yDistort: .3
			},
			shapes: { trees: {
				count: count$2(3, 0, 0),
				quota: S.trees
			} }
		},
		{
			id: "right-mid-patch-mobile",
			band: "ground",
			center: {
				x: .65,
				y: .3
			},
			radius: {
				tiles: 6,
				xDistort: 4,
				yDistort: .6
			},
			shapes: { trees: {
				count: count$2(2, 1, 0),
				quota: S.trees
			} }
		},
		{
			id: "left-close",
			band: "ground",
			center: {
				x: 0,
				y: .9
			},
			radius: {
				tiles: 5,
				xDistort: 6,
				yDistort: .3
			},
			shapes: {
				villa: {
					count: count$2(0, 0, 1),
					quota: S.villa
				},
				trees: {
					count: count$2(1, 3, 2),
					quota: S.trees
				},
				clouds: {
					count: count$2(0, 1, 1),
					quota: S.clouds
				}
			}
		},
		{
			id: "left-mid-community",
			band: "ground",
			center: {
				x: .1,
				y: .7
			},
			radius: {
				tiles: 6,
				xDistort: 3,
				yDistort: 1
			},
			shapes: {
				sea: {
					count: count$2(0, 0, 1),
					quota: FLAT_QUOTA$2
				},
				house: {
					count: count$2(0, 0, 2),
					quota: S.house
				},
				villa: {
					count: count$2(0, 2, 3),
					quota: S.villa
				},
				trees: {
					count: count$2(1, 0, 4),
					quota: S.trees
				},
				car: {
					count: count$2(0, 1, 1),
					quota: S.car
				},
				bus: {
					count: count$2(1, 1, 0),
					quota: S.bus
				},
				power: {
					count: count$2(0, 1, 1),
					quota: FLAT_QUOTA$2
				}
			}
		},
		{
			id: "left-patch-community-desktop",
			band: "ground",
			center: {
				x: .15,
				y: 1
			},
			radius: {
				tiles: 4,
				xDistort: 4,
				yDistort: .6
			},
			shapes: {
				carFactory: {
					count: count$2(0, 0, 1),
					quota: FLAT_QUOTA$2
				},
				villa: {
					count: count$2(0, 0, 1),
					quota: S.villa
				}
			}
		},
		{
			id: "left-community-mobile+tablet",
			band: "ground",
			center: {
				x: 0,
				y: .4
			},
			radius: {
				tiles: 6,
				xDistort: 3,
				yDistort: 1
			},
			shapes: {
				sea: {
					count: count$2(1, 1, 0),
					quota: FLAT_QUOTA$2
				},
				villa: {
					count: count$2(1, 0, 0),
					quota: S.villa
				},
				trees: {
					count: count$2(1, 4, 0),
					quota: S.trees
				},
				car: {
					count: count$2(1, 0, 0),
					quota: S.car
				},
				bus: {
					count: count$2(1, 0, 0),
					quota: S.bus
				},
				power: {
					count: count$2(1, 1, 0),
					quota: FLAT_QUOTA$2
				}
			}
		},
		{
			id: "left-mid-community-2",
			band: "ground",
			center: {
				x: .25,
				y: .65
			},
			radius: {
				tiles: 6,
				xDistort: 3,
				yDistort: .6
			},
			shapes: {
				sea: {
					count: count$2(1, 1, 1),
					quota: FLAT_QUOTA$2
				},
				villa: {
					count: count$2(0, 0, 2),
					quota: S.villa
				},
				trees: {
					count: count$2(1, 2, 2),
					quota: S.trees
				},
				car: {
					count: count$2(0, 1, 1),
					quota: S.car
				},
				power: {
					count: count$2(1, 0, 1),
					quota: FLAT_QUOTA$2
				}
			}
		},
		{
			id: "mid-community",
			band: "ground",
			center: {
				x: .4,
				y: .5
			},
			radius: {
				tiles: 5,
				xDistort: 2,
				yDistort: 1
			},
			shapes: {
				sea: {
					count: count$2(0, 1, 1),
					quota: FLAT_QUOTA$2
				},
				carFactory: {
					count: count$2(1, 1, 1),
					quota: FLAT_QUOTA$2
				},
				house: {
					count: count$2(0, 0, 0),
					quota: S.house
				},
				villa: {
					count: count$2(2, 1, 4),
					quota: S.villa
				},
				trees: {
					count: count$2(1, 2, 6),
					quota: S.trees
				},
				car: {
					count: count$2(1, 0, 0),
					quota: S.car
				},
				bus: {
					count: count$2(0, 0, 1),
					quota: S.bus
				}
			}
		},
		{
			id: "left-far-community-2",
			band: "ground",
			center: {
				x: .2,
				y: .3
			},
			radius: {
				tiles: 6,
				xDistort: 4,
				yDistort: 1
			},
			shapes: {
				villa: {
					count: count$2(3, 2, 4),
					quota: S.villa
				},
				house: {
					count: count$2(0, 1, 2),
					quota: S.house
				},
				trees: {
					count: count$2(4, 5, 6),
					quota: S.trees
				},
				car: {
					count: count$2(1, 1, 3),
					quota: S.car
				},
				bus: {
					count: count$2(1, 1, 1),
					quota: S.bus
				},
				power: {
					count: count$2(1, 1, 1),
					quota: FLAT_QUOTA$2
				}
			}
		},
		{
			id: "left-far-community-3",
			band: "ground",
			center: {
				x: .35,
				y: 0
			},
			radius: {
				tiles: 6,
				xDistort: 4,
				yDistort: 1
			},
			shapes: {
				villa: {
					count: count$2(0, 2, 4),
					quota: S.villa
				},
				house: {
					count: count$2(0, 0, 1),
					quota: S.house
				},
				trees: {
					count: count$2(0, 2, 6),
					quota: S.trees
				},
				car: {
					count: count$2(0, 2, 3),
					quota: S.car
				}
			}
		},
		{
			id: "left-far-community-3",
			band: "ground",
			center: {
				x: .14,
				y: 0
			},
			radius: {
				tiles: 6,
				xDistort: 4,
				yDistort: 1
			},
			shapes: {
				villa: {
					count: count$2(0, 3, 4),
					quota: S.villa
				},
				trees: {
					count: count$2(0, 2, 6),
					quota: S.trees
				}
			}
		},
		{
			id: "mid-community-4",
			band: "ground",
			center: {
				x: .33,
				y: .7
			},
			radius: {
				tiles: 6,
				xDistort: 4,
				yDistort: 1
			},
			shapes: {
				villa: {
					count: count$2(0, 0, 2),
					quota: S.villa
				},
				trees: {
					count: count$2(0, 0, 4),
					quota: S.trees
				}
			}
		},
		{
			id: "mid-far-community-5",
			band: "ground",
			center: {
				x: .54,
				y: .4
			},
			radius: {
				tiles: 5,
				xDistort: 3,
				yDistort: 1
			},
			shapes: {
				villa: {
					count: count$2(2, 0, 2),
					quota: S.villa
				},
				house: {
					count: count$2(1, 0, 0),
					quota: S.house
				},
				trees: {
					count: count$2(0, 3, 1),
					quota: S.trees
				},
				car: {
					count: count$2(1, 0, 1),
					quota: S.car
				}
			}
		},
		{
			id: "mid-community-6",
			band: "ground",
			center: {
				x: .6,
				y: .55
			},
			radius: {
				tiles: 2,
				xDistort: 3,
				yDistort: 1
			},
			shapes: {
				trees: {
					count: count$2(0, 0, 2),
					quota: S.trees
				},
				car: {
					count: count$2(0, 0, 1),
					quota: S.car
				}
			}
		},
		{
			id: "mid-close-community-7",
			band: "ground",
			center: {
				x: .58,
				y: .9
			},
			radius: {
				tiles: 2,
				xDistort: 3,
				yDistort: 1
			},
			shapes: {
				villa: {
					count: count$2(0, 0, 1),
					quota: S.villa
				},
				trees: {
					count: count$2(1, 0, 1),
					quota: S.trees
				},
				car: {
					count: count$2(0, 0, 1),
					quota: S.car
				},
				power: {
					count: count$2(0, 0, 1),
					quota: FLAT_QUOTA$2
				}
			}
		},
		{
			id: "left-far-community-8",
			band: "ground",
			center: {
				x: .02,
				y: .4
			},
			radius: {
				tiles: 4,
				xDistort: 3,
				yDistort: 1
			},
			shapes: {
				villa: {
					count: count$2(0, 0, 2),
					quota: S.villa
				},
				trees: {
					count: count$2(0, 0, 4),
					quota: S.trees
				},
				car: {
					count: count$2(0, 0, 1),
					quota: S.car
				},
				house: {
					count: count$2(0, 0, 1),
					quota: S.house
				}
			}
		},
		{
			id: "left-mid-community-9",
			band: "ground",
			center: {
				x: .1,
				y: .4
			},
			radius: {
				tiles: 4,
				xDistort: 3,
				yDistort: 1
			},
			shapes: {
				house: {
					count: count$2(0, 0, 2),
					quota: S.house
				},
				trees: {
					count: count$2(0, 0, 4),
					quota: S.trees
				},
				villa: {
					count: count$2(0, 0, 2),
					quota: S.villa
				}
			}
		},
		{
			id: "close-mid-community-9",
			band: "ground",
			center: {
				x: .25,
				y: .8
			},
			radius: {
				tiles: 4,
				xDistort: 3,
				yDistort: 1
			},
			shapes: { bus: {
				count: count$2(0, 0, 1),
				quota: S.bus
			} }
		},
		{
			id: "right-far-community",
			band: "ground",
			center: {
				x: .55,
				y: .2
			},
			radius: {
				tiles: 6,
				xDistort: 4,
				yDistort: 1
			},
			shapes: {
				villa: {
					count: count$2(1, 1, 4),
					quota: S.villa
				},
				house: {
					count: count$2(1, 0, 2),
					quota: S.house
				},
				trees: {
					count: count$2(1, 2, 6),
					quota: S.trees
				},
				car: {
					count: count$2(1, 1, 3),
					quota: S.car
				},
				bus: {
					count: count$2(1, 1, 1),
					quota: S.bus
				},
				power: {
					count: count$2(1, 1, 1),
					quota: FLAT_QUOTA$2
				}
			}
		},
		{
			id: "right-far-community-1.5",
			band: "ground",
			center: {
				x: .72,
				y: .5
			},
			radius: {
				tiles: 6,
				xDistort: 4,
				yDistort: 1
			},
			shapes: {
				villa: {
					count: count$2(0, 0, 2),
					quota: S.villa
				},
				house: {
					count: count$2(0, 0, 1),
					quota: S.house
				},
				trees: {
					count: count$2(0, 0, 2),
					quota: S.trees
				}
			}
		},
		{
			id: "right-far-community-2",
			band: "ground",
			center: {
				x: .75,
				y: .4
			},
			radius: {
				tiles: 6,
				xDistort: 4,
				yDistort: 1
			},
			shapes: {
				villa: {
					count: count$2(1, 2, 3),
					quota: S.villa
				},
				trees: {
					count: count$2(2, 1, 3),
					quota: S.trees
				},
				car: {
					count: count$2(1, 1, 3),
					quota: S.car
				},
				bus: {
					count: count$2(1, 1, 1),
					quota: S.bus
				},
				power: {
					count: count$2(0, 0, 1),
					quota: FLAT_QUOTA$2
				}
			}
		},
		{
			id: "right-far-community-3",
			band: "ground",
			center: {
				x: .92,
				y: .3
			},
			radius: {
				tiles: 6,
				xDistort: 4,
				yDistort: 1
			},
			shapes: {
				villa: {
					count: count$2(1, 1, 2),
					quota: S.villa
				},
				trees: {
					count: count$2(2, 2, 8),
					quota: S.trees
				},
				car: {
					count: count$2(1, 1, 3),
					quota: S.car
				},
				bus: {
					count: count$2(1, 1, 1),
					quota: S.bus
				}
			}
		},
		{
			id: "right-close-community",
			band: "ground",
			center: {
				x: 1,
				y: 1
			},
			radius: {
				tiles: 6,
				xDistort: 3,
				yDistort: 1
			},
			shapes: {
				villa: {
					count: count$2(1, 0, 2),
					quota: S.villa
				},
				bus: {
					count: count$2(1, 0, 1),
					quota: S.bus
				},
				car: {
					count: count$2(0, 0, 1),
					quota: S.car
				}
			}
		},
		{
			id: "mid-close-community-2",
			band: "ground",
			center: {
				x: .4,
				y: 1
			},
			radius: {
				tiles: 4,
				xDistort: 3,
				yDistort: 1
			},
			shapes: {
				villa: {
					count: count$2(0, 0, 1),
					quota: S.villa
				},
				bus: {
					count: count$2(0, 0, 1),
					quota: S.bus
				},
				car: {
					count: count$2(0, 0, 1),
					quota: S.car
				}
			}
		},
		{
			id: "close-community-tablet",
			band: "ground",
			center: {
				x: .3,
				y: 1
			},
			radius: {
				tiles: 6,
				xDistort: 4,
				yDistort: 1
			},
			shapes: {
				villa: {
					count: count$2(0, 1, 0),
					quota: S.villa
				},
				house: {
					count: count$2(0, 1, 0),
					quota: S.house
				},
				trees: {
					count: count$2(0, 2, 0),
					quota: S.trees
				},
				car: {
					count: count$2(0, 1, 0),
					quota: S.car
				},
				bus: {
					count: count$2(0, 1, 0),
					quota: S.bus
				},
				power: {
					count: count$2(0, 1, 0),
					quota: FLAT_QUOTA$2
				}
			}
		},
		{
			id: "close-community-tablet-2",
			band: "ground",
			center: {
				x: 1,
				y: 1
			},
			radius: {
				tiles: 3,
				xDistort: 4,
				yDistort: 1
			},
			shapes: {
				house: {
					count: count$2(0, 1, 0),
					quota: S.house
				},
				villa: {
					count: count$2(0, 1, 0),
					quota: S.villa
				},
				trees: {
					count: count$2(0, 1, 0),
					quota: S.trees
				}
			}
		},
		{
			id: "mid-community-tablet",
			band: "ground",
			center: {
				x: .35,
				y: .4
			},
			radius: {
				tiles: 6,
				xDistort: 4,
				yDistort: 1
			},
			shapes: {
				villa: {
					count: count$2(0, 1, 0),
					quota: S.villa
				},
				trees: {
					count: count$2(0, 4, 0),
					quota: S.trees
				},
				car: {
					count: count$2(0, 1, 0),
					quota: S.car
				}
			}
		},
		{
			id: "left-community-close",
			band: "ground",
			center: {
				x: 0,
				y: 1
			},
			radius: {
				tiles: 6,
				xDistort: 4,
				yDistort: 1
			},
			shapes: { trees: {
				count: count$2(0, 0, 4),
				quota: S.trees
			} }
		},
		{
			id: "right-community-close",
			band: "ground",
			center: {
				x: .7,
				y: 1
			},
			radius: {
				tiles: 6,
				xDistort: 3,
				yDistort: 2
			},
			shapes: { trees: {
				count: count$2(0, 0, 4),
				quota: S.trees
			} }
		}
	]
} };
//#endregion
//#region src/canvas-engine/scene-rules/placement-rules/city.ts
var FLAT_QUOTA$1 = [{
	t: 0,
	pct: 50
}, {
	t: 1,
	pct: 50
}];
var C = {
	clouds: [{
		t: 0,
		pct: 50
	}, {
		t: 1,
		pct: 60
	}],
	snow: [{
		t: 0,
		pct: 20
	}, {
		t: 1,
		pct: 80
	}],
	villa: [{
		t: 0,
		pct: 55
	}, {
		t: 1,
		pct: 65
	}],
	house: [{
		t: 0,
		pct: 65
	}, {
		t: 1,
		pct: 75
	}],
	power: [{
		t: 0,
		pct: 60
	}, {
		t: 1,
		pct: 30
	}],
	carFactory: [{
		t: 0,
		pct: 80
	}, {
		t: 1,
		pct: 20
	}],
	trees: [{
		t: 0,
		pct: 50
	}, {
		t: 1,
		pct: 70
	}],
	bus: [{
		t: 0,
		pct: 30
	}, {
		t: 1,
		pct: 60
	}],
	car: [{
		t: 0,
		pct: 90
	}, {
		t: 1,
		pct: 20
	}],
	sea: [{
		t: 0,
		pct: 40
	}, {
		t: 1,
		pct: 60
	}]
};
function count$1(mobileOrCounts, tablet = 0, laptop = 0) {
	if (typeof mobileOrCounts === "number") return {
		mobile: mobileOrCounts,
		tablet,
		laptop
	};
	return {
		mobile: mobileOrCounts.mobile ?? 0,
		tablet: mobileOrCounts.tablet ?? 0,
		laptop: mobileOrCounts.laptop ?? 0
	};
}
var CITY_PLACEMENTS = { preset: {
	kind: "zone-communities",
	zones: [
		{
			id: "city-sun",
			band: "sky",
			center: {
				x: .5,
				y: .1
			},
			radius: {
				tiles: 2,
				xDistort: 1.5,
				yDistort: .8
			},
			shapes: { sun: {
				count: count$1(0, 0, 1),
				quota: FLAT_QUOTA$1
			} }
		},
		{
			id: "city-sun-2",
			band: "sky",
			center: {
				x: .5,
				y: 0
			},
			radius: {
				tiles: 2,
				xDistort: 1.5,
				yDistort: .8
			},
			shapes: { sun: {
				count: count$1(0, 1, 0),
				quota: FLAT_QUOTA$1
			} }
		},
		{
			id: "city-sun-2",
			band: "sky",
			center: {
				x: .52,
				y: 0
			},
			radius: {
				tiles: 2,
				xDistort: 1.5,
				yDistort: .8
			},
			shapes: { sun: {
				count: count$1(1, 0, 0),
				quota: FLAT_QUOTA$1
			} }
		},
		{
			id: "weather-1",
			band: "sky",
			center: {
				x: .9,
				y: .4
			},
			radius: {
				tiles: 5,
				xDistort: 2.6,
				yTiles: .6
			},
			shapes: {
				clouds: {
					count: count$1(2, 0, 2),
					quota: C.clouds
				},
				snow: {
					count: count$1(1, 0, 1),
					quota: C.snow
				}
			}
		},
		{
			id: "weather-2",
			band: "sky",
			center: {
				x: 0,
				y: .2
			},
			radius: {
				tiles: 5,
				xDistort: 2.6,
				yTiles: .6
			},
			shapes: {
				clouds: {
					count: count$1(0, 0, 2),
					quota: C.clouds
				},
				snow: {
					count: count$1(0, 0, 1),
					quota: C.snow
				}
			}
		},
		{
			id: "weather-3",
			band: "sky",
			center: {
				x: .7,
				y: .2
			},
			radius: {
				tiles: 3,
				xDistort: 2,
				yTiles: .6
			},
			shapes: { clouds: {
				count: count$1(0, 0, 3),
				quota: C.clouds
			} }
		},
		{
			id: "weather-4",
			band: "sky",
			center: {
				x: .15,
				y: .6
			},
			radius: {
				tiles: 4,
				xDistort: 4,
				yTiles: .4
			},
			shapes: {
				clouds: {
					count: count$1(2, 2, 3),
					quota: C.clouds
				},
				snow: {
					count: count$1(0, 1, 1),
					quota: C.snow
				}
			}
		},
		{
			id: "weather-5",
			band: "sky",
			center: {
				x: .6,
				y: .5
			},
			radius: {
				tiles: 4,
				xDistort: 4,
				yTiles: .4
			},
			shapes: {
				clouds: {
					count: count$1(0, 0, 3),
					quota: C.clouds
				},
				snow: {
					count: count$1(0, 0, 1),
					quota: C.snow
				}
			}
		},
		{
			id: "weather-5-mobile",
			band: "sky",
			center: {
				x: .45,
				y: .47
			},
			radius: {
				tiles: 2,
				xDistort: 1,
				yTiles: .4
			},
			shapes: {
				clouds: {
					count: count$1(2, 0, 0),
					quota: C.clouds
				},
				snow: {
					count: count$1(1, 0, 0),
					quota: C.snow
				}
			}
		},
		{
			id: "weather-6",
			band: "sky",
			center: {
				x: .2,
				y: .8
			},
			radius: {
				tiles: 4,
				xDistort: 4,
				yTiles: .4
			},
			shapes: {
				clouds: {
					count: count$1(2, 2, 3),
					quota: C.clouds
				},
				snow: {
					count: count$1(1, 1, 1),
					quota: C.snow
				}
			}
		},
		{
			id: "weather-7",
			band: "sky",
			center: {
				x: .8,
				y: .8
			},
			radius: {
				tiles: 4,
				xDistort: 4,
				yTiles: .4
			},
			shapes: {
				clouds: {
					count: count$1(2, 2, 3),
					quota: C.clouds
				},
				snow: {
					count: count$1(1, 1, 2),
					quota: C.snow
				}
			}
		},
		{
			id: "weather-8",
			band: "sky",
			center: {
				x: .3,
				y: .9
			},
			radius: {
				tiles: 2,
				xDistort: 3,
				yTiles: .4
			},
			shapes: {
				clouds: {
					count: count$1(2, 0, 4),
					quota: C.clouds
				},
				snow: {
					count: count$1(2, 0, 2),
					quota: C.snow
				}
			}
		},
		{
			id: "weather-9",
			band: "sky",
			center: {
				x: .7,
				y: .9
			},
			radius: {
				tiles: 4,
				xDistort: 4,
				yTiles: .4
			},
			shapes: {
				clouds: {
					count: count$1(2, 2, 2),
					quota: C.clouds
				},
				snow: {
					count: count$1(1, 1, 1),
					quota: C.snow
				}
			}
		},
		{
			id: "weather-10",
			band: "sky",
			center: {
				x: .3,
				y: 0
			},
			radius: {
				tiles: 4,
				xDistort: 4,
				yTiles: .4
			},
			shapes: { clouds: {
				count: count$1(0, 0, 2),
				quota: C.clouds
			} }
		},
		{
			id: "weather-10-tablet",
			band: "sky",
			center: {
				x: .1,
				y: .15
			},
			radius: {
				tiles: 1,
				xDistort: 2,
				yTiles: .4
			},
			shapes: {
				clouds: {
					count: count$1(0, 2, 0),
					quota: C.clouds
				},
				snow: {
					count: count$1(0, 1, 0),
					quota: C.snow
				}
			}
		},
		{
			id: "weather-11-tablet",
			band: "sky",
			center: {
				x: .7,
				y: .3
			},
			radius: {
				tiles: 1,
				xDistort: 2,
				yTiles: .4
			},
			shapes: { clouds: {
				count: count$1(0, 2, 0),
				quota: C.clouds
			} }
		},
		{
			id: "weather-12-tablet",
			band: "sky",
			center: {
				x: 1,
				y: .05
			},
			radius: {
				tiles: 1,
				xDistort: 2,
				yTiles: .4
			},
			shapes: {
				clouds: {
					count: count$1(0, 1, 0),
					quota: C.clouds
				},
				snow: {
					count: count$1(0, 0, 0),
					quota: C.snow
				}
			}
		},
		{
			id: "weather-13-tablet",
			band: "sky",
			center: {
				x: .47,
				y: .5
			},
			radius: {
				tiles: 2,
				xDistort: 1,
				yTiles: .4
			},
			shapes: {
				clouds: {
					count: count$1(0, 2, 0),
					quota: C.clouds
				},
				snow: {
					count: count$1(0, 1, 0),
					quota: C.snow
				}
			}
		},
		{
			id: "weather-14-tablet",
			band: "sky",
			center: {
				x: .45,
				y: .8
			},
			radius: {
				tiles: 2,
				xDistort: 1,
				yTiles: .4
			},
			shapes: {
				clouds: {
					count: count$1(0, 2, 0),
					quota: C.clouds
				},
				snow: {
					count: count$1(0, 1, 0),
					quota: C.snow
				}
			}
		},
		{
			id: "weather-11",
			band: "sky",
			center: {
				x: .5,
				y: 1
			},
			radius: {
				tiles: 4,
				xDistort: 4,
				yTiles: .4
			},
			shapes: {
				clouds: {
					count: count$1(0, 0, 2),
					quota: C.clouds
				},
				snow: {
					count: count$1(0, 0, 1),
					quota: C.snow
				}
			}
		},
		{
			id: "weather-12",
			band: "sky",
			center: {
				x: .4,
				y: 1
			},
			radius: {
				tiles: 4,
				xDistort: 4,
				yTiles: .4
			},
			shapes: {
				clouds: {
					count: count$1(0, 2, 2),
					quota: C.clouds
				},
				snow: {
					count: count$1(0, 1, 1),
					quota: C.snow
				}
			}
		},
		{
			id: "weather-13",
			band: "sky",
			center: {
				x: .1,
				y: 1
			},
			radius: {
				tiles: 4,
				xDistort: 4,
				yTiles: .8
			},
			shapes: {
				clouds: {
					count: count$1(0, 2, 3),
					quota: C.clouds
				},
				snow: {
					count: count$1(0, 2, 2),
					quota: C.snow
				}
			}
		},
		{
			id: "weather-14",
			band: "sky",
			center: {
				x: .8,
				y: 1
			},
			radius: {
				tiles: 4,
				xDistort: 4,
				yTiles: .4
			},
			shapes: {
				clouds: {
					count: count$1(0, 2, 3),
					quota: C.clouds
				},
				snow: {
					count: count$1(0, 2, 2),
					quota: C.snow
				}
			}
		},
		{
			id: "weather-14.5-mobile",
			band: "sky",
			center: {
				x: .1,
				y: .2
			},
			radius: {
				tiles: 4,
				xDistort: 4,
				yTiles: .4
			},
			shapes: {
				clouds: {
					count: count$1(2, 0, 0),
					quota: C.clouds
				},
				snow: {
					count: count$1(1, 0, 0),
					quota: C.snow
				}
			}
		},
		{
			id: "weather-15",
			band: "sky",
			center: {
				x: .35,
				y: .7
			},
			radius: {
				tiles: 4,
				xDistort: 4,
				yTiles: .4
			},
			shapes: {
				clouds: {
					count: count$1(0, 0, 3),
					quota: C.clouds
				},
				snow: {
					count: count$1(0, 0, 2),
					quota: C.snow
				}
			}
		},
		{
			id: "weather-15-tablet",
			band: "sky",
			center: {
				x: .32,
				y: .7
			},
			radius: {
				tiles: 1,
				xDistort: 2,
				yTiles: .4
			},
			shapes: {
				clouds: {
					count: count$1(0, 2, 0),
					quota: C.clouds
				},
				snow: {
					count: count$1(0, 1, 0),
					quota: C.snow
				}
			}
		},
		{
			id: "weather-16",
			band: "sky",
			center: {
				x: 1,
				y: .6
			},
			radius: {
				tiles: 4,
				xDistort: 4,
				yTiles: .4
			},
			shapes: {
				clouds: {
					count: count$1(0, 2, 3),
					quota: C.clouds
				},
				snow: {
					count: count$1(0, 2, 2),
					quota: C.snow
				}
			}
		},
		{
			id: "ground-1",
			band: "ground",
			center: {
				x: 1,
				y: .2
			},
			radius: {
				tiles: 8,
				xDistort: 4,
				yTiles: 2
			},
			shapes: { trees: {
				count: count$1(4, 6, 6),
				quota: C.trees
			} }
		},
		{
			id: "ground-2",
			band: "ground",
			center: {
				x: .8,
				y: .1
			},
			radius: {
				tiles: 8,
				xDistort: 4,
				yTiles: 2
			},
			shapes: { trees: {
				count: count$1(4, 8, 6),
				quota: C.trees
			} }
		},
		{
			id: "ground-3",
			band: "ground",
			center: {
				x: .55,
				y: .3
			},
			radius: {
				tiles: 8,
				xDistort: 4,
				yTiles: 2
			},
			shapes: { trees: {
				count: count$1(5, 8, 6),
				quota: C.trees
			} }
		},
		{
			id: "ground-4",
			band: "ground",
			center: {
				x: .3,
				y: .1
			},
			radius: {
				tiles: 8,
				xDistort: 4,
				yTiles: 2
			},
			shapes: { trees: {
				count: count$1(4, 7, 6),
				quota: C.trees
			} }
		},
		{
			id: "ground-4",
			band: "ground",
			center: {
				x: .1,
				y: .2
			},
			radius: {
				tiles: 8,
				xDistort: 4,
				yTiles: 2
			},
			shapes: {
				trees: {
					count: count$1(4, 6, 6),
					quota: C.trees
				},
				power: {
					count: count$1(1, 1, 1),
					quota: C.power
				}
			}
		},
		{
			id: "ground-1",
			band: "ground",
			center: {
				x: .8,
				y: .4
			},
			radius: {
				tiles: 8,
				xDistort: 4,
				yTiles: 2
			},
			shapes: {
				trees: {
					count: count$1(4, 2, 6),
					quota: C.trees
				},
				power: {
					count: count$1(0, 1, 1),
					quota: C.power
				}
			}
		},
		{
			id: "ground-1.5",
			band: "ground",
			center: {
				x: .2,
				y: .4
			},
			radius: {
				tiles: 8,
				xDistort: 4,
				yTiles: 2
			},
			shapes: {
				trees: {
					count: count$1(3, 3, 6),
					quota: C.trees
				},
				power: {
					count: count$1(1, 1, 1),
					quota: C.power
				}
			}
		},
		{
			id: "ground-2",
			band: "ground",
			center: {
				x: .4,
				y: .5
			},
			radius: {
				tiles: 8,
				xDistort: 4,
				yTiles: 2
			},
			shapes: {
				trees: {
					count: count$1(4, 3, 9),
					quota: C.trees
				},
				sea: {
					count: count$1(0, 1, 1),
					quota: C.sea
				}
			}
		},
		{
			id: "ground-3",
			band: "ground",
			center: {
				x: .3,
				y: .6
			},
			radius: {
				tiles: 8,
				xDistort: 4,
				yTiles: 2
			},
			shapes: {
				trees: {
					count: count$1(3, 4, 7),
					quota: C.trees
				},
				power: {
					count: count$1(1, 1, 1),
					quota: C.power
				},
				sea: {
					count: count$1(0, 1, 1),
					quota: C.sea
				}
			}
		},
		{
			id: "ground-4",
			band: "ground",
			center: {
				x: 0,
				y: .4
			},
			radius: {
				tiles: 8,
				xDistort: 4,
				yTiles: 2
			},
			shapes: {
				trees: {
					count: count$1(1, 2, 6),
					quota: C.trees
				},
				power: {
					count: count$1(1, 1, 1),
					quota: C.power
				}
			}
		},
		{
			id: "ground-4",
			band: "ground",
			center: {
				x: .2,
				y: .5
			},
			radius: {
				tiles: 8,
				xDistort: 4,
				yTiles: 2
			},
			shapes: { trees: {
				count: count$1(4, 3, 4),
				quota: C.trees
			} }
		},
		{
			id: "ground-5",
			band: "ground",
			center: {
				x: .7,
				y: .6
			},
			radius: {
				tiles: 8,
				xDistort: 4,
				yTiles: 2
			},
			shapes: {
				trees: {
					count: count$1(2, 4, 8),
					quota: C.trees
				},
				power: {
					count: count$1(1, 1, 1),
					quota: C.power
				},
				sea: {
					count: count$1(1, 1, 1),
					quota: C.sea
				}
			}
		},
		{
			id: "ground-6",
			band: "ground",
			center: {
				x: .9,
				y: .7
			},
			radius: {
				tiles: 8,
				xDistort: 4,
				yTiles: 2
			},
			shapes: {
				trees: {
					count: count$1(3, 5, 9),
					quota: C.trees
				},
				power: {
					count: count$1(0, 1, 1),
					quota: C.power
				}
			}
		},
		{
			id: "ground-7",
			band: "ground",
			center: {
				x: .66,
				y: .3
			},
			radius: {
				tiles: 8,
				xDistort: 4,
				yTiles: 2
			},
			shapes: { trees: {
				count: count$1(3, 6, 4),
				quota: C.trees
			} }
		},
		{
			id: "ground-8",
			band: "ground",
			center: {
				x: .1,
				y: .7
			},
			radius: {
				tiles: 8,
				xDistort: 4,
				yTiles: 2
			},
			shapes: {
				trees: {
					count: count$1(3, 6, 6),
					quota: C.trees
				},
				power: {
					count: count$1(1, 1, 1),
					quota: C.power
				},
				sea: {
					count: count$1(1, 0, 1),
					quota: C.sea
				}
			}
		},
		{
			id: "ground-9",
			band: "ground",
			center: {
				x: 1,
				y: .9
			},
			radius: {
				tiles: 8,
				xDistort: 4,
				yTiles: 2
			},
			shapes: { trees: {
				count: count$1(2, 3, 6),
				quota: C.trees
			} }
		},
		{
			id: "ground-10",
			band: "ground",
			center: {
				x: .66,
				y: .3
			},
			radius: {
				tiles: 8,
				xDistort: 4,
				yTiles: 2
			},
			shapes: {
				trees: {
					count: count$1(0, 4, 7),
					quota: C.trees
				},
				power: {
					count: count$1(1, 0, 1),
					quota: C.power
				}
			}
		},
		{
			id: "ground-11",
			band: "ground",
			center: {
				x: 0,
				y: .9
			},
			radius: {
				tiles: 8,
				xDistort: 4,
				yTiles: 2
			},
			shapes: {
				trees: {
					count: count$1(1, 2, 8),
					quota: C.trees
				},
				sea: {
					count: count$1(1, 1, 1),
					quota: C.sea
				}
			}
		},
		{
			id: "ground-12",
			band: "ground",
			center: {
				x: .4,
				y: 1
			},
			radius: {
				tiles: 8,
				xDistort: 4,
				yTiles: 2
			},
			shapes: {
				trees: {
					count: count$1(1, 2, 4),
					quota: C.trees
				},
				power: {
					count: count$1(0, 0, 1),
					quota: C.power
				}
			}
		},
		{
			id: "ground-12.5",
			band: "ground",
			center: {
				x: .25,
				y: .85
			},
			radius: {
				tiles: 8,
				xDistort: 4,
				yTiles: 2
			},
			shapes: { trees: {
				count: count$1(0, 0, 5),
				quota: C.trees
			} }
		},
		{
			id: "ground-13",
			band: "ground",
			center: {
				x: .7,
				y: 1
			},
			radius: {
				tiles: 8,
				xDistort: 4,
				yTiles: 2
			},
			shapes: {
				trees: {
					count: count$1(2, 2, 6),
					quota: C.trees
				},
				carFactory: {
					count: count$1(1, 1, 1),
					quota: C.carFactory
				}
			}
		},
		{
			id: "ground-14",
			band: "ground",
			center: {
				x: .95,
				y: .4
			},
			radius: {
				tiles: 8,
				xDistort: 4,
				yTiles: 2
			},
			shapes: {
				trees: {
					count: count$1(1, 3, 7),
					quota: C.trees
				},
				sea: {
					count: count$1(1, 1, 1),
					quota: C.sea
				}
			}
		},
		{
			id: "ground-1",
			band: "ground",
			center: {
				x: .4,
				y: .6
			},
			radius: {
				tiles: 4,
				xDistort: 4,
				yTiles: .6
			},
			shapes: {
				house: {
					count: count$1(1, 1, 2),
					quota: C.house
				},
				villa: {
					count: count$1(1, 1, 2),
					quota: C.villa
				}
			}
		},
		{
			id: "ground-2",
			band: "ground",
			center: {
				x: .5,
				y: .5
			},
			radius: {
				tiles: 4,
				xDistort: 4,
				yTiles: .6
			},
			shapes: {
				house: {
					count: count$1(1, 0, 2),
					quota: C.house
				},
				villa: {
					count: count$1(1, 1, 2),
					quota: C.villa
				},
				car: {
					count: count$1(1, 1, 2),
					quota: C.car
				},
				carFactory: {
					count: count$1(1, 1, 1),
					quota: C.carFactory
				}
			}
		},
		{
			id: "ground-3",
			band: "ground",
			center: {
				x: .6,
				y: .65
			},
			radius: {
				tiles: 4,
				xDistort: 4,
				yTiles: .6
			},
			shapes: {
				house: {
					count: count$1(0, 0, 1),
					quota: C.house
				},
				villa: {
					count: count$1(1, 0, 2),
					quota: C.villa
				},
				car: {
					count: count$1(1, 1, 1),
					quota: C.car
				}
			}
		},
		{
			id: "ground-4",
			band: "ground",
			center: {
				x: .35,
				y: .7
			},
			radius: {
				tiles: 4,
				xDistort: 4,
				yTiles: 1
			},
			shapes: {
				house: {
					count: count$1(0, 0, 2),
					quota: C.house
				},
				villa: {
					count: count$1(1, 3, 3),
					quota: C.villa
				},
				bus: {
					count: count$1(1, 0, 2),
					quota: C.bus
				}
			}
		},
		{
			id: "ground-5",
			band: "ground",
			center: {
				x: .75,
				y: .75
			},
			radius: {
				tiles: 4,
				xDistort: 4,
				yTiles: .6
			},
			shapes: {
				house: {
					count: count$1(1, 1, 1),
					quota: C.house
				},
				villa: {
					count: count$1(1, 2, 2),
					quota: C.villa
				},
				car: {
					count: count$1(1, 1, 1),
					quota: C.car
				},
				bus: {
					count: count$1(1, 1, 1),
					quota: C.bus
				},
				carFactory: {
					count: count$1(1, 1, 1),
					quota: C.carFactory
				}
			}
		},
		{
			id: "ground-6",
			band: "ground",
			center: {
				x: .55,
				y: .9
			},
			radius: {
				tiles: 4,
				xDistort: 4,
				yTiles: 1
			},
			shapes: {
				house: {
					count: count$1(1, 0, 1),
					quota: C.house
				},
				villa: {
					count: count$1(1, 1, 2),
					quota: C.villa
				},
				car: {
					count: count$1(1, 1, 1),
					quota: C.car
				},
				bus: {
					count: count$1(1, 1, 1),
					quota: C.bus
				}
			}
		},
		{
			id: "ground-7",
			band: "ground",
			center: {
				x: .55,
				y: 1
			},
			radius: {
				tiles: 4,
				xDistort: 4,
				yTiles: 1
			},
			shapes: {
				house: {
					count: count$1(0, 1, 0),
					quota: C.house
				},
				villa: {
					count: count$1(1, 3, 2),
					quota: C.villa
				},
				car: {
					count: count$1(1, 1, 1),
					quota: C.car
				}
			}
		},
		{
			id: "ground-3",
			band: "ground",
			center: {
				x: .4,
				y: .3
			},
			radius: {
				tiles: 4,
				xDistort: 4,
				yTiles: .6
			},
			shapes: {
				house: {
					count: count$1(0, 1, 1),
					quota: C.house
				},
				villa: {
					count: count$1(2, 3, 3),
					quota: C.villa
				},
				bus: {
					count: count$1(1, 1, 1),
					quota: C.bus
				}
			}
		},
		{
			id: "ground-4",
			band: "ground",
			center: {
				x: .6,
				y: .4
			},
			radius: {
				tiles: 6,
				xDistort: 4,
				yTiles: 1
			},
			shapes: {
				house: {
					count: count$1(1, 0, 2),
					quota: C.house
				},
				villa: {
					count: count$1(2, 3, 2),
					quota: C.villa
				},
				car: {
					count: count$1(1, 1, 1),
					quota: C.car
				},
				carFactory: {
					count: count$1(0, 1, 1),
					quota: C.carFactory
				}
			}
		},
		{
			id: "ground-5",
			band: "ground",
			center: {
				x: .65,
				y: .3
			},
			radius: {
				tiles: 4,
				xDistort: 4,
				yTiles: .6
			},
			shapes: {
				house: {
					count: count$1(2, 1, 2),
					quota: C.house
				},
				villa: {
					count: count$1(1, 2, 3),
					quota: C.villa
				}
			}
		},
		{
			id: "ground-6",
			band: "ground",
			center: {
				x: .55,
				y: .2
			},
			radius: {
				tiles: 4,
				xDistort: 4,
				yTiles: 1
			},
			shapes: {
				house: {
					count: count$1(1, 0, 1),
					quota: C.house
				},
				villa: {
					count: count$1(2, 4, 4),
					quota: C.villa
				},
				car: {
					count: count$1(1, 1, 1),
					quota: C.car
				}
			}
		},
		{
			id: "ground-7",
			band: "ground",
			center: {
				x: .6,
				y: .1
			},
			radius: {
				tiles: 4,
				xDistort: 4,
				yTiles: 1
			},
			shapes: {
				house: {
					count: count$1(0, 1, 1),
					quota: C.house
				},
				villa: {
					count: count$1(1, 3, 3),
					quota: C.villa
				},
				bus: {
					count: count$1(1, 2, 1),
					quota: C.bus
				}
			}
		},
		{
			id: "ground-8",
			band: "ground",
			center: {
				x: .5,
				y: .3
			},
			radius: {
				tiles: 4,
				xDistort: 4,
				yTiles: 1
			},
			shapes: {
				house: {
					count: count$1(0, 2, 2),
					quota: C.house
				},
				villa: {
					count: count$1(2, 3, 2),
					quota: C.villa
				},
				car: {
					count: count$1(1, 1, 1),
					quota: C.car
				}
			}
		},
		{
			id: "ground-9",
			band: "ground",
			center: {
				x: .3,
				y: .25
			},
			radius: {
				tiles: 3,
				xDistort: 2,
				yTiles: 1
			},
			shapes: {
				house: {
					count: count$1(0, 2, 1),
					quota: C.house
				},
				villa: {
					count: count$1(1, 2, 2),
					quota: C.villa
				},
				carFactory: {
					count: count$1(1, 1, 1),
					quota: C.carFactory
				}
			}
		},
		{
			id: "ground-10",
			band: "ground",
			center: {
				x: .4,
				y: .1
			},
			radius: {
				tiles: 3,
				xDistort: 2,
				yTiles: 1
			},
			shapes: {
				house: {
					count: count$1(0, 2, 1),
					quota: C.house
				},
				villa: {
					count: count$1(1, 3, 2),
					quota: C.villa
				},
				car: {
					count: count$1(1, 1, 1),
					quota: C.car
				}
			}
		}
	]
} };
//#endregion
//#region src/canvas-engine/scene-rules/placement-rules/questionnaire.ts
var FLAT_QUOTA = [{
	t: 0,
	pct: 50
}, {
	t: 1,
	pct: 50
}];
var Q = {
	clouds: [{
		t: 0,
		pct: 60
	}, {
		t: 1,
		pct: 60
	}],
	snow: [{
		t: 0,
		pct: 20
	}, {
		t: 1,
		pct: 80
	}],
	villa: [{
		t: 0,
		pct: 55
	}, {
		t: 1,
		pct: 65
	}],
	house: [{
		t: 0,
		pct: 65
	}, {
		t: 1,
		pct: 75
	}],
	power: [{
		t: 0,
		pct: 60
	}, {
		t: 1,
		pct: 30
	}],
	carFactory: [{
		t: 0,
		pct: 80
	}, {
		t: 1,
		pct: 20
	}],
	trees: [{
		t: 0,
		pct: 50
	}, {
		t: 1,
		pct: 70
	}],
	bus: [{
		t: 0,
		pct: 30
	}, {
		t: 1,
		pct: 60
	}],
	car: [{
		t: 0,
		pct: 90
	}, {
		t: 1,
		pct: 20
	}],
	sea: [{
		t: 0,
		pct: 40
	}, {
		t: 1,
		pct: 60
	}]
};
function count(mobileOrCounts, tablet = 0, laptop = 0) {
	if (typeof mobileOrCounts === "number") return {
		mobile: mobileOrCounts,
		tablet,
		laptop
	};
	return {
		mobile: mobileOrCounts.mobile ?? 0,
		tablet: mobileOrCounts.tablet ?? 0,
		laptop: mobileOrCounts.laptop ?? 0
	};
}
var QUESTIONNAIRE_PLACEMENTS = { preset: {
	kind: "zone-communities",
	zones: [
		{
			id: "sky-light",
			band: "sky",
			center: {
				x: .2,
				y: .1
			},
			radius: {
				tiles: 2,
				xDistort: 1.8,
				yDistort: .8
			},
			shapes: { sun: {
				count: count(0, 0, 1),
				quota: FLAT_QUOTA
			} }
		},
		{
			id: "sky-light-mobile",
			band: "sky",
			center: {
				x: .4,
				y: .05
			},
			radius: {
				tiles: 2,
				xDistort: 1.8,
				yDistort: .8
			},
			shapes: { sun: {
				count: count(1, 0, 0),
				quota: FLAT_QUOTA
			} }
		},
		{
			id: "sky-light-tablet",
			band: "sky",
			center: {
				x: .2,
				y: .1
			},
			radius: {
				tiles: 2,
				xDistort: 1.8,
				yDistort: .8
			},
			shapes: { sun: {
				count: count(0, 1, 0),
				quota: FLAT_QUOTA
			} }
		},
		{
			id: "weather-left-close",
			band: "sky",
			center: {
				x: 0,
				y: .2
			},
			radius: {
				tiles: 5,
				xDistort: 2.6,
				yTiles: .6
			},
			shapes: {
				clouds: {
					count: count(0, 0, 2),
					quota: Q.clouds
				},
				snow: {
					count: count(0, 0, 1),
					quota: Q.snow
				}
			}
		},
		{
			id: "weather-left-close-tablet",
			band: "sky",
			center: {
				x: .52,
				y: .1
			},
			radius: {
				tiles: 4,
				xDistort: 8,
				yTiles: .6
			},
			shapes: {
				clouds: {
					count: count(0, 2, 0),
					quota: Q.clouds
				},
				snow: {
					count: count(0, 1, 0),
					quota: Q.snow
				}
			}
		},
		{
			id: "weather-left-close-tablet-2",
			band: "sky",
			center: {
				x: 0,
				y: .3
			},
			radius: {
				tiles: 4,
				xDistort: 8,
				yTiles: .6
			},
			shapes: {
				clouds: {
					count: count(0, 2, 0),
					quota: Q.clouds
				},
				snow: {
					count: count(0, 1, 0),
					quota: Q.snow
				}
			}
		},
		{
			id: "weather-left-mid",
			band: "sky",
			center: {
				x: .15,
				y: .6
			},
			radius: {
				tiles: 4,
				xDistort: 4,
				yTiles: .4
			},
			shapes: {
				clouds: {
					count: count(0, 2, 3),
					quota: Q.clouds
				},
				snow: {
					count: count(0, 3, 1),
					quota: Q.snow
				}
			}
		},
		{
			id: "weather-left-far",
			band: "sky",
			center: {
				x: .05,
				y: .8
			},
			radius: {
				tiles: 5,
				xDistort: 4,
				yTiles: .4
			},
			shapes: {
				clouds: {
					count: count(0, 2, 1),
					quota: Q.clouds
				},
				snow: {
					count: count(0, 3, 3),
					quota: Q.snow
				}
			}
		},
		{
			id: "weather-right-far",
			band: "sky",
			center: {
				x: .8,
				y: .8
			},
			radius: {
				tiles: 4,
				xDistort: 3.2,
				yTiles: .65
			},
			shapes: {
				clouds: {
					count: count(0, 2, 2),
					quota: Q.clouds
				},
				snow: {
					count: count(0, 1, 2),
					quota: Q.snow
				}
			}
		},
		{
			id: "weather-right-far-tablet",
			band: "sky",
			center: {
				x: .9,
				y: .55
			},
			radius: {
				tiles: 2,
				xDistort: 2,
				yTiles: .3
			},
			shapes: {
				clouds: {
					count: count(0, 3, 0),
					quota: Q.clouds
				},
				snow: {
					count: count(0, 1, 0),
					quota: Q.snow
				}
			}
		},
		{
			id: "weather-right-far-tablet-2",
			band: "sky",
			center: {
				x: .65,
				y: .75
			},
			radius: {
				tiles: 3,
				xDistort: 2,
				yTiles: .3
			},
			shapes: {
				clouds: {
					count: count(0, 2, 0),
					quota: Q.clouds
				},
				snow: {
					count: count(0, 1, 0),
					quota: Q.snow
				}
			}
		},
		{
			id: "weather-mid-far",
			band: "sky",
			center: {
				x: .45,
				y: .7
			},
			radius: {
				tiles: 4,
				xDistort: 3.5,
				yTiles: .5
			},
			shapes: {
				clouds: {
					count: count(0, 0, 2),
					quota: Q.clouds
				},
				snow: {
					count: count(0, 0, 1),
					quota: Q.snow
				}
			}
		},
		{
			id: "weather-mid-far-2",
			band: "sky",
			center: {
				x: .6,
				y: .6
			},
			radius: {
				tiles: 2,
				xDistort: 2,
				yTiles: .4
			},
			shapes: {
				clouds: {
					count: count(0, 0, 2),
					quota: Q.clouds
				},
				snow: {
					count: count(0, 0, 2),
					quota: Q.snow
				}
			}
		},
		{
			id: "weather-mid-far-3",
			band: "sky",
			center: {
				x: .3,
				y: .9
			},
			radius: {
				tiles: 2,
				xDistort: 1,
				yTiles: .6
			},
			shapes: {
				clouds: {
					count: count(0, 0, 3),
					quota: Q.clouds
				},
				snow: {
					count: count(0, 0, 3),
					quota: Q.snow
				}
			}
		},
		{
			id: "weather-mid-far-3.5",
			band: "sky",
			center: {
				x: .3,
				y: .5
			},
			radius: {
				tiles: 2,
				xDistort: 2,
				yTiles: .3
			},
			shapes: {
				clouds: {
					count: count(0, 0, 2),
					quota: Q.clouds
				},
				snow: {
					count: count(0, 0, 1),
					quota: Q.snow
				}
			}
		},
		{
			id: "weather-mid-far-4",
			band: "sky",
			center: {
				x: .7,
				y: .9
			},
			radius: {
				tiles: 2,
				xDistort: 2,
				yTiles: .3
			},
			shapes: {
				clouds: {
					count: count(0, 0, 2),
					quota: Q.clouds
				},
				snow: {
					count: count(0, 0, 1),
					quota: Q.snow
				}
			}
		},
		{
			id: "weather-mid-far-4.5",
			band: "sky",
			center: {
				x: .65,
				y: .8
			},
			radius: {
				tiles: 2,
				xDistort: 2,
				yTiles: .6
			},
			shapes: {
				clouds: {
					count: count(0, 0, 3),
					quota: Q.clouds
				},
				snow: {
					count: count(0, 0, 2),
					quota: Q.snow
				}
			}
		},
		{
			id: "weather-mid-far-tablet-4.6",
			band: "sky",
			center: {
				x: .55,
				y: .8
			},
			radius: {
				tiles: 2,
				xDistort: 4,
				yTiles: .6
			},
			shapes: {
				clouds: {
					count: count(0, 3, 0),
					quota: Q.clouds
				},
				snow: {
					count: count(0, 1, 0),
					quota: Q.snow
				}
			}
		},
		{
			id: "weather-mid-far-tablet-4.6",
			band: "sky",
			center: {
				x: .35,
				y: .5
			},
			radius: {
				tiles: 6,
				xDistort: 8,
				yTiles: .6
			},
			shapes: {
				clouds: {
					count: count(0, 3, 0),
					quota: Q.clouds
				},
				snow: {
					count: count(0, 1, 0),
					quota: Q.snow
				}
			}
		},
		{
			id: "weather-mid-far-5",
			band: "sky",
			center: {
				x: .35,
				y: .8
			},
			radius: {
				tiles: 2,
				xDistort: 2,
				yTiles: .3
			},
			shapes: {
				clouds: {
					count: count(0, 3, 2),
					quota: Q.clouds
				},
				snow: {
					count: count(0, 1, 2),
					quota: Q.snow
				}
			}
		},
		{
			id: "weather-right-close",
			band: "sky",
			center: {
				x: .8,
				y: .1
			},
			radius: {
				tiles: 3,
				xDistort: 2,
				yTiles: .6
			},
			shapes: {
				clouds: {
					count: count(0, 0, 2),
					quota: Q.clouds
				},
				snow: {
					count: count(0, 0, 1),
					quota: Q.snow
				}
			}
		},
		{
			id: "weather-right-close-tablet",
			band: "sky",
			center: {
				x: .9,
				y: .2
			},
			radius: {
				tiles: 3,
				xDistort: 2,
				yTiles: .6
			},
			shapes: {
				clouds: {
					count: count(0, 2, 0),
					quota: Q.clouds
				},
				snow: {
					count: count(0, 1, 0),
					quota: Q.snow
				}
			}
		},
		{
			id: "weather-right-close-2",
			band: "sky",
			center: {
				x: .62,
				y: .2
			},
			radius: {
				tiles: 2,
				xDistort: 1,
				yTiles: .6
			},
			shapes: { clouds: {
				count: count(0, 0, 2),
				quota: Q.clouds
			} }
		},
		{
			id: "weather-right-close-2",
			band: "sky",
			center: {
				x: .72,
				y: 0
			},
			radius: {
				tiles: 2,
				xDistort: 1,
				yTiles: .6
			},
			shapes: {
				clouds: {
					count: count(0, 3, 0),
					quota: Q.clouds
				},
				snow: {
					count: count(0, 1, 0),
					quota: Q.snow
				}
			}
		},
		{
			id: "weather-right-mid",
			band: "sky",
			center: {
				x: 1,
				y: .3
			},
			radius: {
				tiles: 6,
				xDistort: 5,
				yTiles: .4
			},
			shapes: {
				clouds: {
					count: count(0, 0, 2),
					quota: Q.clouds
				},
				snow: {
					count: count(0, 0, 1),
					quota: Q.snow
				}
			}
		},
		{
			id: "weather-right-far-2",
			band: "sky",
			center: {
				x: .88,
				y: .6
			},
			radius: {
				tiles: 4,
				xDistort: 5,
				yTiles: .4
			},
			shapes: {
				clouds: {
					count: count(0, 0, 2),
					quota: Q.clouds
				},
				snow: {
					count: count(0, 0, 2),
					quota: Q.snow
				}
			}
		},
		{
			id: "weather-right-far-2-tablet",
			band: "sky",
			center: {
				x: .8,
				y: 1
			},
			radius: {
				tiles: 2,
				xDistort: 6,
				yTiles: .2
			},
			shapes: {
				clouds: {
					count: count(0, 2, 0),
					quota: Q.clouds
				},
				snow: {
					count: count(0, 2, 0),
					quota: Q.snow
				}
			}
		},
		{
			id: "weather-mid-far-tablet",
			band: "sky",
			center: {
				x: .4,
				y: 1
			},
			radius: {
				tiles: 2,
				xDistort: 6,
				yTiles: .2
			},
			shapes: {
				clouds: {
					count: count(0, 3, 0),
					quota: Q.clouds
				},
				snow: {
					count: count(0, 3, 0),
					quota: Q.snow
				}
			}
		},
		{
			id: "weather-right-far-tablet-2",
			band: "sky",
			center: {
				x: .92,
				y: 1
			},
			radius: {
				tiles: 2,
				xDistort: 6,
				yTiles: .2
			},
			shapes: {
				clouds: {
					count: count(0, 1, 0),
					quota: Q.clouds
				},
				snow: {
					count: count(0, 2, 0),
					quota: Q.snow
				}
			}
		},
		{
			id: "weather-far-phone",
			band: "sky",
			center: {
				x: .8,
				y: 1
			},
			radius: {
				tiles: 3,
				xDistort: 4,
				yTiles: 1
			},
			shapes: {
				clouds: {
					count: count(3, 0, 0),
					quota: Q.clouds
				},
				snow: {
					count: count(2, 0, 0),
					quota: Q.snow
				}
			}
		},
		{
			id: "weather-far-phone-2",
			band: "sky",
			center: {
				x: .3,
				y: 1
			},
			radius: {
				tiles: 3,
				xDistort: 4,
				yTiles: 1
			},
			shapes: {
				clouds: {
					count: count(2, 0, 0),
					quota: Q.clouds
				},
				snow: {
					count: count(1, 0, 0),
					quota: Q.snow
				}
			}
		},
		{
			id: "weather-far-phone-3",
			band: "sky",
			center: {
				x: .2,
				y: .8
			},
			radius: {
				tiles: 3,
				xDistort: 4,
				yTiles: 1
			},
			shapes: {
				clouds: {
					count: count(2, 0, 0),
					quota: Q.clouds
				},
				snow: {
					count: count(1, 0, 0),
					quota: Q.snow
				}
			}
		},
		{
			id: "weather-far-phone-4",
			band: "sky",
			center: {
				x: .7,
				y: .7
			},
			radius: {
				tiles: 2,
				xDistort: 6,
				yTiles: .2
			},
			shapes: {
				clouds: {
					count: count(2, 0, 0),
					quota: Q.clouds
				},
				snow: {
					count: count(1, 0, 0),
					quota: Q.snow
				}
			}
		},
		{
			id: "weather-far-phone-5",
			band: "sky",
			center: {
				x: .1,
				y: .6
			},
			radius: {
				tiles: 2,
				xDistort: 6,
				yTiles: .2
			},
			shapes: {
				clouds: {
					count: count(2, 0, 0),
					quota: Q.clouds
				},
				snow: {
					count: count(1, 0, 0),
					quota: Q.snow
				}
			}
		},
		{
			id: "weather-far-phone-6",
			band: "sky",
			center: {
				x: 1,
				y: .5
			},
			radius: {
				tiles: 4,
				xDistort: 5,
				yTiles: .4
			},
			shapes: {
				clouds: {
					count: count(2, 0, 0),
					quota: Q.clouds
				},
				snow: {
					count: count(1, 0, 0),
					quota: Q.snow
				}
			}
		},
		{
			id: "weather-far-phone-7",
			band: "sky",
			center: {
				x: 0,
				y: .2
			},
			radius: {
				tiles: 4,
				xDistort: 5,
				yTiles: .4
			},
			shapes: {
				clouds: {
					count: count(2, 0, 0),
					quota: Q.clouds
				},
				snow: {
					count: count(1, 0, 0),
					quota: Q.snow
				}
			}
		},
		{
			id: "mixed-01",
			band: "ground",
			center: {
				x: .25,
				y: .1
			},
			radius: {
				tiles: 4,
				xDistort: 5,
				yDistort: 3
			},
			shapes: {
				villa: {
					count: count(0, 3, 2),
					quota: Q.villa
				},
				car: {
					count: count(1, 1, 1),
					quota: Q.car
				},
				house: {
					count: count(0, 1, 0),
					quota: Q.house
				},
				trees: {
					count: count(1, 3, 6),
					quota: Q.trees
				}
			}
		},
		{
			id: "mixed-01.1",
			band: "ground",
			center: {
				x: .15,
				y: .2
			},
			radius: {
				tiles: 4,
				xDistort: 7,
				yDistort: 1
			},
			shapes: {
				villa: {
					count: count(0, 3, 3),
					quota: Q.villa
				},
				car: {
					count: count(1, 1, 1),
					quota: Q.car
				},
				house: {
					count: count(0, 1, 0),
					quota: Q.house
				},
				trees: {
					count: count(3, 3, 6),
					quota: Q.trees
				}
			}
		},
		{
			id: "mixed-01.2",
			band: "ground",
			center: {
				x: 0,
				y: .1
			},
			radius: {
				tiles: 4,
				xDistort: 7,
				yDistort: 2
			},
			shapes: {
				villa: {
					count: count(0, 2, 2),
					quota: Q.villa
				},
				car: {
					count: count(1, 2, 0),
					quota: Q.car
				},
				bus: {
					count: count(0, 2, 0),
					quota: Q.bus
				},
				trees: {
					count: count(4, 4, 6),
					quota: Q.trees
				},
				carFactory: {
					count: count(1, 1, 1),
					quota: Q.carFactory
				}
			}
		},
		{
			id: "mixed-01.3",
			band: "ground",
			center: {
				x: .6,
				y: .1
			},
			radius: {
				tiles: 4,
				xDistort: 7,
				yDistort: 2
			},
			shapes: {
				villa: {
					count: count(1, 2, 1),
					quota: Q.villa
				},
				trees: {
					count: count(4, 4, 6),
					quota: Q.trees
				}
			}
		},
		{
			id: "mixed-01.4",
			band: "ground",
			center: {
				x: .95,
				y: .1
			},
			radius: {
				tiles: 4,
				xDistort: 6,
				yDistort: 2
			},
			shapes: { trees: {
				count: count(4, 3, 3),
				quota: Q.trees
			} }
		},
		{
			id: "mixed-01.5",
			band: "ground",
			center: {
				x: .1,
				y: .1
			},
			radius: {
				tiles: 4,
				xDistort: 6,
				yDistort: 3
			},
			shapes: {
				trees: {
					count: count(4, 4, 4),
					quota: Q.trees
				},
				villa: {
					count: count(1, 2, 2),
					quota: Q.villa
				}
			}
		},
		{
			id: "mixed-01.6",
			band: "ground",
			center: {
				x: .2,
				y: .45
			},
			radius: {
				tiles: 4,
				xDistort: 6,
				yDistort: 1
			},
			shapes: {
				trees: {
					count: count(4, 4, 4),
					quota: Q.trees
				},
				car: {
					count: count(0, 0, 2),
					quota: Q.car
				}
			}
		},
		{
			id: "mixed-01.6",
			band: "ground",
			center: {
				x: .8,
				y: .7
			},
			radius: {
				tiles: 4,
				xDistort: 6,
				yDistort: 2
			},
			shapes: {
				villa: {
					count: count(1, 1, 0),
					quota: Q.villa
				},
				car: {
					count: count(1, 0, 2),
					quota: Q.car
				},
				bus: {
					count: count(0, 0, 1),
					quota: Q.bus
				},
				trees: {
					count: count(4, 3, 5),
					quota: Q.trees
				},
				carFactory: {
					count: count(0, 0, 1),
					quota: Q.carFactory
				}
			}
		},
		{
			id: "mixed-02",
			band: "ground",
			center: {
				x: .25,
				y: .3
			},
			radius: {
				tiles: 3,
				xDistort: 3,
				yDistort: 1
			},
			shapes: {
				trees: {
					count: count(4, 3, 8),
					quota: Q.trees
				},
				car: {
					count: count(0, 0, 1),
					quota: Q.car
				}
			}
		},
		{
			id: "mixed-02.5",
			band: "ground",
			center: {
				x: .4,
				y: .1
			},
			radius: {
				tiles: 3,
				xDistort: 3,
				yDistort: 2
			},
			shapes: {
				trees: {
					count: count(8, 3, 5),
					quota: Q.trees
				},
				villa: {
					count: count(6, 1, 2),
					quota: Q.villa
				},
				power: {
					count: count(2, 1, 1),
					quota: Q.power
				}
			}
		},
		{
			id: "mixed-03",
			band: "ground",
			center: {
				x: .5,
				y: .208
			},
			radius: {
				tiles: 8,
				xDistort: 4,
				yDistort: 1
			},
			shapes: {
				trees: {
					count: count(3, 3, 2),
					quota: Q.trees
				},
				car: {
					count: count(0, 0, 1),
					quota: Q.car
				}
			}
		},
		{
			id: "mixed-03.5",
			band: "ground",
			center: {
				x: .5,
				y: .4
			},
			radius: {
				tiles: 4,
				xDistort: 6,
				yDistort: 3
			},
			shapes: {
				trees: {
					count: count(3, 5, 2),
					quota: Q.trees
				},
				villa: {
					count: count(3, 2, 2),
					quota: Q.house
				},
				car: {
					count: count(0, 0, 3),
					quota: Q.car
				},
				house: {
					count: count(0, 1, 1),
					quota: Q.house
				}
			}
		},
		{
			id: "mixed-04",
			band: "ground",
			center: {
				x: .5,
				y: .4
			},
			radius: {
				tiles: 4,
				xDistort: 3,
				yDistort: 1
			},
			shapes: { trees: {
				count: count(3, 3, 5),
				quota: Q.trees
			} }
		},
		{
			id: "mixed-04.5",
			band: "ground",
			center: {
				x: .65,
				y: .6
			},
			radius: {
				tiles: 4,
				xDistort: 3,
				yDistort: 1
			},
			shapes: {
				villa: {
					count: count(2, 1, 1),
					quota: Q.villa
				},
				car: {
					count: count(1, 1, 1),
					quota: Q.car
				},
				bus: {
					count: count(0, 0, 0),
					quota: Q.bus
				},
				trees: {
					count: count(3, 2, 3),
					quota: Q.trees
				},
				carFactory: {
					count: count(0, 1, 1),
					quota: Q.carFactory
				}
			}
		},
		{
			id: "mixed-05",
			band: "ground",
			center: {
				x: .15,
				y: .768
			},
			radius: {
				tiles: 4,
				xDistort: 3,
				yDistort: 1
			},
			shapes: { trees: {
				count: count(2, 3, 4),
				quota: Q.trees
			} }
		},
		{
			id: "mixed-05.5",
			band: "ground",
			center: {
				x: .8,
				y: .6
			},
			radius: {
				tiles: 4,
				xDistort: 3,
				yDistort: 1
			},
			shapes: {
				villa: {
					count: count(1, 1, 1),
					quota: Q.villa
				},
				trees: {
					count: count(3, 2, 5),
					quota: Q.trees
				}
			}
		},
		{
			id: "mixed-05.6",
			band: "ground",
			center: {
				x: .5,
				y: 1
			},
			radius: {
				tiles: 6,
				xDistort: 2,
				yDistort: 1
			},
			shapes: { trees: {
				count: count(2, 2, 2),
				quota: Q.trees
			} }
		},
		{
			id: "mixed-05.7-tablet",
			band: "ground",
			center: {
				x: .2,
				y: .5
			},
			radius: {
				tiles: 6,
				xDistort: 2,
				yDistort: 1
			},
			shapes: { trees: {
				count: count(4, 2, 0),
				quota: Q.trees
			} }
		},
		{
			id: "mixed-05.8",
			band: "ground",
			center: {
				x: .4,
				y: .5
			},
			radius: {
				tiles: 6,
				xDistort: 2,
				yDistort: 1
			},
			shapes: {
				villa: {
					count: count(2, 2, 3),
					quota: Q.villa
				},
				car: {
					count: count(1, 1, 1),
					quota: Q.car
				},
				bus: {
					count: count(1, 0, 1),
					quota: Q.bus
				},
				trees: {
					count: count(2, 2, 6),
					quota: Q.trees
				},
				carFactory: {
					count: count(0, 1, 0),
					quota: Q.carFactory
				}
			}
		},
		{
			id: "mixed-05.9-tablet",
			band: "ground",
			center: {
				x: .9,
				y: .4
			},
			radius: {
				tiles: 6,
				xDistort: 2,
				yDistort: 1
			},
			shapes: {
				trees: {
					count: count(3, 2, 0),
					quota: Q.trees
				},
				villa: {
					count: count(2, 2, 0),
					quota: Q.villa
				},
				car: {
					count: count(1, 2, 0),
					quota: Q.car
				},
				bus: {
					count: count(0, 2, 0),
					quota: Q.bus
				}
			}
		},
		{
			id: "mixed-05.91-tablet",
			band: "ground",
			center: {
				x: .35,
				y: .2
			},
			radius: {
				tiles: 6,
				xDistort: 2,
				yDistort: 1
			},
			shapes: {
				trees: {
					count: count(0, 8, 2),
					quota: Q.trees
				},
				villa: {
					count: count(0, 2, 2),
					quota: Q.villa
				},
				car: {
					count: count(1, 2, 0),
					quota: Q.car
				},
				bus: {
					count: count(0, 2, 1),
					quota: Q.bus
				}
			}
		},
		{
			id: "mixed-05.92-tablet",
			band: "ground",
			center: {
				x: .65,
				y: .3
			},
			radius: {
				tiles: 6,
				xDistort: 2,
				yDistort: 1
			},
			shapes: {
				trees: {
					count: count(0, 4, 3),
					quota: Q.trees
				},
				villa: {
					count: count(0, 2, 1),
					quota: Q.villa
				},
				car: {
					count: count(0, 2, 1),
					quota: Q.car
				},
				bus: {
					count: count(0, 2, 0),
					quota: Q.bus
				}
			}
		},
		{
			id: "mixed-06",
			band: "ground",
			center: {
				x: .95,
				y: .75
			},
			radius: {
				tiles: 4,
				xDistort: 4,
				yDistort: 1
			},
			shapes: {
				house: {
					count: count(1, 0, 1),
					quota: Q.house
				},
				villa: {
					count: count(0, 1, 1),
					quota: Q.villa
				},
				car: {
					count: count(1, 2, 1),
					quota: Q.car
				},
				bus: {
					count: count(0, 1, 1),
					quota: Q.bus
				},
				trees: {
					count: count(1, 4, 7),
					quota: Q.trees
				},
				carFactory: {
					count: count(0, 1, 0),
					quota: Q.carFactory
				}
			}
		},
		{
			id: "mixed-07",
			band: "ground",
			center: {
				x: .3,
				y: .7
			},
			radius: {
				tiles: 6,
				xDistort: 6,
				yDistort: 1
			},
			shapes: {
				house: {
					count: count(1, 1, 1),
					quota: Q.house
				},
				villa: {
					count: count(1, 1, 3),
					quota: Q.villa
				},
				car: {
					count: count(1, 2, 1),
					quota: Q.car
				},
				bus: {
					count: count(0, 1, 2),
					quota: Q.bus
				},
				trees: {
					count: count(1, 5, 6),
					quota: Q.trees
				},
				sea: {
					count: count(1, 1, 1),
					quota: Q.sea
				},
				carFactory: {
					count: count(0, 0, 1),
					quota: Q.carFactory
				}
			}
		},
		{
			id: "mixed-08",
			band: "ground",
			center: {
				x: .75,
				y: .75
			},
			radius: {
				tiles: 4,
				xDistort: 3,
				yDistort: 1
			},
			shapes: {
				house: {
					count: count(1, 1, 1),
					quota: Q.house
				},
				villa: {
					count: count(2, 1, 1),
					quota: Q.villa
				},
				car: {
					count: count(1, 1, 1),
					quota: Q.car
				},
				bus: {
					count: count(0, 1, 0),
					quota: Q.bus
				},
				trees: {
					count: count(2, 3, 6),
					quota: Q.trees
				},
				carFactory: {
					count: count(1, 1, 0),
					quota: Q.carFactory
				}
			}
		},
		{
			id: "mixed-09",
			band: "ground",
			center: {
				x: .1,
				y: .89
			},
			radius: {
				tiles: 4,
				xDistort: 3,
				yDistort: 1
			},
			shapes: {
				house: {
					count: count(1, 1, 1),
					quota: Q.house
				},
				villa: {
					count: count(1, 1, 2),
					quota: Q.villa
				},
				car: {
					count: count(1, 1, 1),
					quota: Q.car
				},
				bus: {
					count: count(1, 0, 0),
					quota: Q.bus
				},
				trees: {
					count: count(1, 5, 3),
					quota: Q.trees
				},
				power: {
					count: count(1, 1, 1),
					quota: Q.power
				},
				sea: {
					count: count(1, 1, 1),
					quota: Q.sea
				}
			}
		},
		{
			id: "mixed-10",
			band: "ground",
			center: {
				x: .82,
				y: .915
			},
			radius: {
				tiles: 8,
				xDistort: 6,
				yDistort: 1
			},
			shapes: {
				villa: {
					count: count(0, 1, 0),
					quota: Q.villa
				},
				car: {
					count: count(1, 1, 1),
					quota: Q.car
				},
				bus: {
					count: count(1, 0, 0),
					quota: Q.bus
				},
				trees: {
					count: count(1, 3, 2),
					quota: Q.trees
				}
			}
		},
		{
			id: "mixed-10.5",
			band: "ground",
			center: {
				x: .6,
				y: .7
			},
			radius: {
				tiles: 8,
				xDistort: 6,
				yDistort: 1
			},
			shapes: {
				villa: {
					count: count(1, 1, 3),
					quota: Q.villa
				},
				car: {
					count: count(1, 1, 1),
					quota: Q.car
				},
				bus: {
					count: count(1, 0, 0),
					quota: Q.bus
				},
				trees: {
					count: count(3, 5, 4),
					quota: Q.trees
				},
				sea: {
					count: count(1, 0, 1),
					quota: Q.sea
				}
			}
		},
		{
			id: "mixed-10.5",
			band: "ground",
			center: {
				x: .72,
				y: .2
			},
			radius: {
				tiles: 12,
				xDistort: 6,
				yDistort: 1
			},
			shapes: {
				villa: {
					count: count(1, 3, 4),
					quota: Q.villa
				},
				car: {
					count: count(1, 2, 1),
					quota: Q.car
				},
				bus: {
					count: count(1, 1, 0),
					quota: Q.bus
				},
				trees: {
					count: count(1, 6, 8),
					quota: Q.trees
				}
			}
		},
		{
			id: "mixed-10.6",
			band: "ground",
			center: {
				x: .8,
				y: .1
			},
			radius: {
				tiles: 12,
				xDistort: 6,
				yDistort: 1
			},
			shapes: {
				villa: {
					count: count(0, 0, 2),
					quota: Q.villa
				},
				trees: {
					count: count(0, 0, 6),
					quota: Q.trees
				}
			}
		},
		{
			id: "mixed-11",
			band: "ground",
			center: {
				x: .5,
				y: .95
			},
			radius: {
				tiles: 8,
				xDistort: 4,
				yDistort: 2
			},
			shapes: {
				house: {
					count: count(1, 1, 1),
					quota: Q.house
				},
				villa: {
					count: count(1, 1, 1),
					quota: Q.villa
				},
				car: {
					count: count(1, 1, 2),
					quota: Q.car
				},
				bus: {
					count: count(0, 1, 1),
					quota: Q.bus
				},
				trees: {
					count: count(1, 2, 4),
					quota: Q.trees
				},
				power: {
					count: count(1, 1, 1),
					quota: Q.power
				},
				sea: {
					count: count(1, 1, 1),
					quota: Q.sea
				}
			}
		},
		{
			id: "mixed-11.5",
			band: "ground",
			center: {
				x: 1,
				y: .1
			},
			radius: {
				tiles: 4,
				xDistort: 3,
				yDistort: 2
			},
			shapes: {
				house: {
					count: count(1, 1, 1),
					quota: Q.house
				},
				villa: {
					count: count(2, 2, 2),
					quota: Q.villa
				},
				car: {
					count: count(1, 1, 0),
					quota: Q.car
				},
				bus: {
					count: count(1, 1, 0),
					quota: Q.bus
				},
				trees: {
					count: count(6, 4, 2),
					quota: Q.trees
				},
				power: {
					count: count(1, 1, 1),
					quota: Q.power
				}
			}
		},
		{
			id: "mixed-12",
			band: "ground",
			center: {
				x: .05,
				y: .52
			},
			radius: {
				tiles: 4,
				xDistort: 3,
				yDistort: 1
			},
			shapes: {
				villa: {
					count: count(3, 1, 3),
					quota: Q.villa
				},
				car: {
					count: count(1, 1, 1),
					quota: Q.car
				},
				bus: {
					count: count(1, 0, 2),
					quota: Q.bus
				},
				trees: {
					count: count(1, 4, 3),
					quota: Q.trees
				},
				sea: {
					count: count(1, 1, 1),
					quota: Q.sea
				}
			}
		},
		{
			id: "mixed-13",
			band: "ground",
			center: {
				x: .55,
				y: .1
			},
			radius: {
				tiles: 12,
				xDistort: 3,
				yDistort: 1
			},
			shapes: {
				house: {
					count: count(1, 1, 1),
					quota: Q.house
				},
				villa: {
					count: count(1, 1, 3),
					quota: Q.villa
				},
				car: {
					count: count(1, 1, 0),
					quota: Q.car
				},
				bus: {
					count: count(1, 0, 1),
					quota: Q.bus
				},
				trees: {
					count: count(1, 5, 6),
					quota: Q.trees
				}
			}
		},
		{
			id: "mixed-14",
			band: "ground",
			center: {
				x: .35,
				y: .1
			},
			radius: {
				tiles: 4,
				xDistort: 3,
				yDistort: 1
			},
			shapes: {
				house: {
					count: count(1, 1, 1),
					quota: Q.house
				},
				villa: {
					count: count(1, 1, 2),
					quota: Q.villa
				},
				car: {
					count: count(1, 1, 0),
					quota: Q.car
				},
				bus: {
					count: count(1, 1, 0),
					quota: Q.bus
				},
				trees: {
					count: count(3, 2, 4),
					quota: Q.trees
				}
			}
		},
		{
			id: "mixed-15",
			band: "ground",
			center: {
				x: .875,
				y: 0
			},
			radius: {
				tiles: 10,
				xDistort: 4,
				yDistort: 1
			},
			shapes: {
				house: {
					count: count(1, 1, 1),
					quota: Q.house
				},
				villa: {
					count: count(1, 1, 2),
					quota: Q.villa
				},
				car: {
					count: count(1, 1, 3),
					quota: Q.car
				},
				bus: {
					count: count(1, 0, 2),
					quota: Q.bus
				},
				trees: {
					count: count(1, 3, 6),
					quota: Q.trees
				}
			}
		},
		{
			id: "mixed-15",
			band: "ground",
			center: {
				x: .25,
				y: .9
			},
			radius: {
				tiles: 4,
				xDistort: 4,
				yDistort: 1
			},
			shapes: { trees: {
				count: count(0, 3, 4),
				quota: Q.trees
			} }
		},
		{
			id: "mixed-16-mobile",
			band: "ground",
			center: {
				x: 1,
				y: .9
			},
			radius: {
				tiles: 6,
				xDistort: 3,
				yDistort: 1
			},
			shapes: {
				villa: {
					count: count(1, 0, 0),
					quota: Q.villa
				},
				car: {
					count: count(1, 0, 1),
					quota: Q.car
				},
				trees: {
					count: count(3, 0, 2),
					quota: Q.trees
				},
				house: {
					count: count(1, 1, 1),
					quota: Q.house
				}
			}
		},
		{
			id: "mixed-17",
			band: "ground",
			center: {
				x: .5,
				y: .4
			},
			radius: {
				tiles: 6,
				xDistort: 3,
				yDistort: 2
			},
			shapes: {
				villa: {
					count: count(1, 2, 2),
					quota: Q.villa
				},
				car: {
					count: count(3, 1, 0),
					quota: Q.car
				},
				bus: {
					count: count(1, 0, 0),
					quota: Q.bus
				},
				trees: {
					count: count(3, 1, 0),
					quota: Q.trees
				},
				power: {
					count: count(1, 1, 1),
					quota: Q.power
				}
			}
		},
		{
			id: "mixed-18-mobile",
			band: "ground",
			center: {
				x: 0,
				y: .7
			},
			radius: {
				tiles: 3,
				xDistort: 2,
				yDistort: 2
			},
			shapes: {
				car: {
					count: count(1, 0, 0),
					quota: Q.car
				},
				trees: {
					count: count(2, 0, 0),
					quota: Q.trees
				},
				power: {
					count: count(1, 0, 0),
					quota: Q.power
				}
			}
		},
		{
			id: "mixed-19-tablet",
			band: "ground",
			center: {
				x: 0,
				y: .6
			},
			radius: {
				tiles: 3,
				xDistort: 2,
				yDistort: 2
			},
			shapes: {
				car: {
					count: count(0, 1, 0),
					quota: Q.car
				},
				trees: {
					count: count(0, 3, 0),
					quota: Q.trees
				},
				power: {
					count: count(0, 1, 0),
					quota: Q.power
				}
			}
		},
		{
			id: "mixed-20-tablet",
			band: "ground",
			center: {
				x: .9,
				y: .5
			},
			radius: {
				tiles: 3,
				xDistort: 2,
				yDistort: 2
			},
			shapes: {
				car: {
					count: count(0, 1, 0),
					quota: Q.car
				},
				trees: {
					count: count(0, 4, 0),
					quota: Q.trees
				},
				power: {
					count: count(0, 1, 0),
					quota: Q.power
				},
				villa: {
					count: count(0, 2, 0),
					quota: Q.villa
				}
			}
		},
		{
			id: "mixed-21-mobile",
			band: "ground",
			center: {
				x: .25,
				y: .55
			},
			radius: {
				tiles: 3,
				xDistort: 2,
				yDistort: 2
			},
			shapes: {
				villa: {
					count: count(1, 1, 0),
					quota: Q.villa
				},
				power: {
					count: count(1, 1, 0),
					quota: Q.power
				}
			}
		},
		{
			id: "mixed-22",
			band: "ground",
			center: {
				x: .25,
				y: .4
			},
			radius: {
				tiles: 3,
				xDistort: 2,
				yDistort: 2
			},
			shapes: {
				villa: {
					count: count(0, 0, 2),
					quota: Q.villa
				},
				power: {
					count: count(0, 0, 1),
					quota: Q.power
				}
			}
		},
		{
			id: "mixed-22",
			band: "ground",
			center: {
				x: .95,
				y: .4
			},
			radius: {
				tiles: 3,
				xDistort: 2,
				yDistort: 2
			},
			shapes: {
				car: {
					count: count(0, 0, 1),
					quota: Q.car
				},
				trees: {
					count: count(0, 0, 3),
					quota: Q.trees
				},
				power: {
					count: count(0, 0, 1),
					quota: Q.power
				},
				villa: {
					count: count(0, 0, 2),
					quota: Q.villa
				}
			}
		},
		{
			id: "mixed-23",
			band: "ground",
			center: {
				x: .63,
				y: .35
			},
			radius: {
				tiles: 6,
				xDistort: 3,
				yDistort: 1
			},
			shapes: {
				villa: {
					count: count(1, 3, 2),
					quota: Q.villa
				},
				car: {
					count: count(2, 1, 2),
					quota: Q.car
				},
				trees: {
					count: count(3, 4, 4),
					quota: Q.trees
				},
				house: {
					count: count(1, 2, 1),
					quota: Q.house
				}
			}
		},
		{
			id: "mixed-24",
			band: "ground",
			center: {
				x: .2,
				y: .7
			},
			radius: {
				tiles: 6,
				xDistort: 3,
				yDistort: 1
			},
			shapes: {
				villa: {
					count: count(1, 0, 0),
					quota: Q.villa
				},
				trees: {
					count: count(2, 0, 0),
					quota: Q.trees
				},
				house: {
					count: count(1, 0, 0),
					quota: Q.house
				}
			}
		}
	]
} };
//#endregion
//#region src/canvas-engine/scene-rules/placement-rules/spotlight.ts
var SPOTLIGHT_PLACEMENT_VARIANTS = SPOTLIGHT_SLIDES.map((slide) => slide.placement);
//#endregion
//#region src/canvas-engine/scene-rules/placement-rules/index.ts
var SHAPE_PLACEMENTS = {
	start: START_PLACEMENTS,
	city: CITY_PLACEMENTS,
	questionnaire: QUESTIONNAIRE_PLACEMENTS,
	spotlight: {
		...SPOTLIGHT_SLIDES[0].placement,
		runtimePreset: {
			selector: "spotlightIndex",
			entries: SPOTLIGHT_PLACEMENT_VARIANTS
		}
	}
};
//#endregion
//#region src/canvas-engine/scene-logic/math.ts
var clamp01 = (v) => typeof v === "number" ? Math.max(0, Math.min(1, v)) : .5;
//#endregion
//#region src/canvas-engine/grid-layout/occupancy.ts
/**
* Tracks the bottom row of placed footprints.
* A multi-row footprint still controls sizing/depth elsewhere; occupation only
* reserves the cells that touch the ground row.
*/
function createOccupancy(rows, cols, isForbidden, colsPerRow) {
	const forbidden = new Array(rows * cols).fill(false);
	const used = new Array(rows * cols).fill(false);
	const idx = (r, c) => r * cols + c;
	for (let r = 0; r < rows; r++) {
		const rowCols = colsPerRow ? colsPerRow[r] ?? cols : cols;
		for (let c = 0; c < cols; c++) if (c >= rowCols || isForbidden?.(r, c)) forbidden[idx(r, c)] = true;
	}
	function canPlace(r0, c0, w, h) {
		if (r0 < 0 || c0 < 0 || r0 + h > rows || c0 + w > cols) return false;
		const bottomR = r0 + h - 1;
		if (colsPerRow && c0 + w > (colsPerRow[bottomR] ?? cols)) return false;
		for (let c = 0; c < w; c++) {
			const cellIdx = idx(bottomR, c0 + c);
			if (used[cellIdx] || forbidden[cellIdx]) return false;
		}
		return true;
	}
	function mark(r0, c0, w, h) {
		const bottomR = r0 + h - 1;
		for (let c = 0; c < w; c++) used[idx(bottomR, c0 + c)] = true;
	}
	function tryPlaceAt(r0, c0, w, h) {
		if (!canPlace(r0, c0, w, h)) return null;
		mark(r0, c0, w, h);
		return {
			r0,
			c0,
			w,
			h
		};
	}
	return { tryPlaceAt };
}
//#endregion
//#region src/canvas-engine/scene-logic/candidates.ts
/**
* Produces an ordered list of candidate (r,c) cells for fallback placement.
* Non-overlay mode sorts by distance to the used-region center.
*/
function buildFallbackCells(rows, cols, spec, opts) {
	const useTop = Math.max(.01, Math.min(1, spec.useTopRatio ?? 1));
	const usedRows = Math.max(1, Math.round(rows * useTop));
	const centerR = (usedRows - 1) / 2;
	const centerC = (cols - 1) / 2;
	const out = [];
	for (let r = 0; r < rows; r++) {
		const rInUsed = r < usedRows ? r : usedRows - 1 + (r - usedRows + 1) * 2;
		for (let c = 0; c < cols; c++) {
			const dr = rInUsed - centerR;
			const dc = c - centerC;
			out.push({
				r,
				c,
				d2: dr * dr + dc * dc
			});
		}
	}
	if (!opts?.overlay) out.sort((a, b) => a.d2 - b.d2);
	return out.map(({ r, c }) => ({
		r,
		c
	}));
}
//#endregion
//#region src/canvas-engine/scene-logic/constraints.ts
/**
* Combines grid spec forbidden rules into a single cell-level predicate.
*/
function cellForbiddenFromSpec(spec, rows, cols, colsPerRow) {
	return makeCellForbidden(spec, rows, cols, colsPerRow);
}
/**
* Checks whether a footprint fits and its bottom row avoids forbidden cells.
* The upper rows still affect vertical fit and projection, but no longer block
* occupation.
*/
function footprintAllowed(r0, c0, w, h, rows, cols, isForbidden, colsPerRow) {
	if (r0 < 0 || c0 < 0 || r0 + h > rows) return false;
	const { refRow, refCols } = horizontalReferenceForFootprint(r0, h, cols, colsPerRow);
	if (c0 + w > refCols) return false;
	for (let dc = 0; dc < w; dc++) if (isForbidden(refRow, c0 + dc)) return false;
	return true;
}
/**
* Returns the row that governs horizontal placement for a footprint.
* Horizontal fit/projection intentionally lives in the footprint's bottom-row
* space so multi-row shapes use the same row reference as pixel sizing.
*/
function horizontalReferenceForFootprint(r0, hCell, cols, colsPerRow) {
	const refRow = r0 + hCell - 1;
	return {
		refRow,
		refCols: colsPerRow ? colsPerRow[refRow] ?? cols : cols
	};
}
/**
* Returns contiguous horizontal segments [cStart..cEnd] where a footprint can be placed on a row.
* cEnd is inclusive and represents the footprint's left column.
*/
function allowedSegmentsForRow(r0, wCell, hCell, rows, cols, isForbidden, colsPerRow) {
	const { refCols: effectiveCols } = horizontalReferenceForFootprint(r0, hCell, cols, colsPerRow);
	const segs = [];
	let c = 0;
	while (c <= effectiveCols - wCell) {
		while (c <= effectiveCols - wCell && !footprintAllowed(r0, c, wCell, hCell, rows, cols, isForbidden, colsPerRow)) c++;
		if (c > effectiveCols - wCell) break;
		const cStart = c;
		while (c <= effectiveCols - wCell && footprintAllowed(r0, c, wCell, hCell, rows, cols, isForbidden, colsPerRow)) c++;
		const cEnd = c - 1;
		segs.push({
			cStart,
			cEnd
		});
	}
	return segs;
}
//#endregion
//#region src/canvas-engine/scene-logic/scoring.ts
function centerOf(f) {
	return {
		x: f.c0 + f.w / 2,
		y: f.r0 + f.h / 2
	};
}
function scoreCandidateGeneric(opts) {
	const { r0, c0, wCell, hCell, cols, usedRows, placed, salt, effectiveCenterC, effectiveCenterR } = opts;
	const { x: cx, y: cy } = centerOf({
		r0,
		c0,
		w: wCell,
		h: hCell
	});
	const gridCx = effectiveCenterC ?? (cols - 1) / 2;
	const usedCy = effectiveCenterR ?? (usedRows - 1) / 2;
	const centerTerm = -.08 * ((cx - gridCx) ** 2 + (cy - usedCy) ** 2);
	let spreadTerm = 0;
	if (placed.length > 0) {
		let minDist2 = Infinity;
		for (const p of placed) {
			const pc = centerOf(p);
			const d2 = (cx - pc.x) ** 2 + (cy - pc.y) ** 2;
			if (d2 < minDist2) minDist2 = d2;
		}
		spreadTerm = .1 * Math.min(minDist2, 36);
	}
	const jitter = (rand01Keyed(`cand|${String(r0)},${String(c0)},${String(wCell)},${String(hCell)}|${String(salt)}`) - .5) * .25;
	return centerTerm + spreadTerm + jitter;
}
//#endregion
//#region src/canvas-engine/scene-logic/place.ts
function clampZoneCenterRowForFootprint(centerRow, hCell, usedRows) {
	const minCenter = hCell / 2;
	const maxCenter = Math.max(minCenter, usedRows - hCell / 2);
	return Math.max(minCenter, Math.min(maxCenter, centerRow));
}
function communityBandRowBounds(band, spec, usedRows, hCell) {
	const maxR0 = Math.max(0, usedRows - hCell);
	if (typeof spec.horizonPos !== "number") return {
		minR0: 0,
		maxR0
	};
	const halfRows = Math.floor(usedRows / 2);
	const topRows = usedRows % 2 === 0 ? halfRows : spec.horizonPos >= .5 ? halfRows + 1 : halfRows;
	if (band === "sky") return {
		minR0: 0,
		maxR0: Math.max(0, Math.min(maxR0, topRows - hCell))
	};
	return {
		minR0: Math.max(0, Math.min(maxR0, topRows)),
		maxR0
	};
}
function communityBandBottomRowBounds(band, spec, usedRows, hCell) {
	if (typeof spec.horizonPos !== "number") return {
		minBottomR: Math.max(0, hCell - 1),
		maxBottomR: Math.max(0, usedRows - 1)
	};
	const halfRows = Math.floor(usedRows / 2);
	const topRows = usedRows % 2 === 0 ? halfRows : spec.horizonPos >= .5 ? halfRows + 1 : halfRows;
	if (band === "sky") return {
		minBottomR: Math.max(0, hCell - 1),
		maxBottomR: Math.max(0, topRows - 1)
	};
	return {
		minBottomR: Math.max(0, Math.min(usedRows - 1, topRows)),
		maxBottomR: Math.max(0, usedRows - 1)
	};
}
function zoneCenterRowForSpec(args) {
	const { band, yK, spec, usedRows, hCell } = args;
	const clampedY = Math.max(0, Math.min(1, yK));
	const rowSpan = Math.max(1, usedRows - 1);
	if (typeof spec.horizonPos !== "number") return clampedY * rowSpan;
	if (band === "ground") {
		const horizon = Math.max(0, Math.min(1, spec.horizonPos));
		return (horizon + clampedY * (1 - horizon)) * rowSpan;
	}
	const { minR0, maxR0 } = communityBandRowBounds(band, spec, usedRows, hCell);
	const minCenter = minR0 + hCell / 2;
	return minCenter + (maxR0 + hCell / 2 - minCenter) * clampedY;
}
function clampRow(value, min, max) {
	return Math.max(min, Math.min(max, value));
}
function isThinRowZone(zone) {
	return zone.radiusY > 0 && zone.radiusY < 1;
}
function thinRowR0ForZone(args) {
	const { band, centerRow, spec, usedRows, hCell } = args;
	const { minBottomR, maxBottomR } = communityBandBottomRowBounds(band, spec, usedRows, hCell);
	return clampRow(clampRow(Math.round(centerRow), minBottomR, maxBottomR) - hCell + 1, 0, Math.max(0, usedRows - hCell));
}
function candidateInCommunityZone(args) {
	const { item, r0, c0, wCell, hCell, usedRows, refCols, spec } = args;
	const zone = item.communityZone;
	if (!zone) return false;
	if (isThinRowZone(zone)) {
		const { minBottomR, maxBottomR } = communityBandBottomRowBounds(zone.band, spec, usedRows, hCell);
		const bottomR = r0 + hCell - 1;
		if (bottomR < minBottomR || bottomR > maxBottomR) return false;
	} else {
		const { minR0, maxR0 } = communityBandRowBounds(zone.band, spec, usedRows, hCell);
		if (r0 < minR0 || r0 > maxR0) return false;
	}
	const centerRow = clampZoneCenterRowForFootprint(zoneCenterRowForSpec({
		band: zone.band,
		yK: zone.centerY,
		spec,
		usedRows,
		hCell
	}), hCell, usedRows);
	const centerCol = zone.centerX * Math.max(1, refCols - 1);
	const itemRow = r0 + hCell / 2;
	const itemCol = c0 + wCell / 2;
	const radiusY = Math.max(.5, zone.radiusY);
	const radiusX = Math.max(.5, zone.radiusX);
	const dx = (itemCol - centerCol) / radiusX;
	if (isThinRowZone(zone)) return Math.abs(dx) <= 1;
	const dy = (itemRow - centerRow) / radiusY;
	if (zone.radiusShape === "rect") return Math.abs(dx) <= 1 && Math.abs(dy) <= 1;
	return dx * dx + dy * dy <= 1;
}
function placePoolItems(opts) {
	const { pool, spec, rows, cols, cellW, cellH, ox, oy, usedRows, salt, placements, metrics, canvas, reservedFootprints = [] } = opts;
	const { colsPerRow } = metrics ?? {};
	const isForbidden = cellForbiddenFromSpec(spec, rows, cols, colsPerRow);
	const occ = createOccupancy(rows, cols, (r, c) => isForbidden(r, c), colsPerRow);
	const occClouds = createOccupancy(rows, cols, void 0, colsPerRow);
	const fallbackCells = buildFallbackCells(rows, cols, spec);
	for (const reserved of reservedFootprints) occ.tryPlaceAt(reserved.r0, reserved.c0, reserved.w, reserved.h);
	const placedFootprints = [];
	const emptyPlacedFootprints = [];
	const outPlaced = [];
	let cursor = 0;
	for (const item of pool) {
		const { shape, size } = item;
		const wCell = size.w;
		const hCell = size.h;
		const itemForbidden = shape === "clouds" ? (() => false) : isForbidden;
		const targetOcc = shape === "clouds" ? occClouds : occ;
		if (item.point) {
			const rawR0 = Math.max(0, Math.round((usedRows - hCell) * item.point.yK));
			const boundedR0 = Math.max(0, Math.min(rows - hCell, rawR0));
			const { refCols } = horizontalReferenceForFootprint(boundedR0, hCell, cols, colsPerRow);
			const rawC0 = Math.max(0, Math.round((refCols - wCell) * item.point.xK));
			const boundedC0 = Math.max(0, Math.min(refCols - wCell, rawC0));
			const rectHit = targetOcc.tryPlaceAt(boundedR0, boundedC0, wCell, hCell);
			if (!rectHit) continue;
			const { x, y } = cellAnchorToPx2({
				cellW,
				cellH,
				ox,
				oy,
				...metrics
			}, rectHit, "center");
			item.footprint = rectHit;
			item.x = x;
			item.y = y;
			if (shape !== "clouds") placedFootprints.push(rectHit);
			outPlaced.push({
				id: item.id,
				x,
				y,
				shape: item.shape,
				footprint: rectHit
			});
			continue;
		}
		if (item.center) {
			const rectW = Math.max(1, wCell * cellW * item.center.scale);
			const rectH = Math.max(1, hCell * cellH * item.center.scale);
			const rectX = canvas.w * item.center.xK - rectW / 2;
			const rectY = canvas.h * item.center.yK - rectH / 2;
			const centerX = rectX + rectW / 2;
			const centerY = rectY + rectH / 2;
			const rectHit = {
				r0: Math.max(0, Math.round((usedRows - hCell) * item.center.yK)),
				c0: Math.max(0, Math.round((cols - wCell) * item.center.xK)),
				w: wCell,
				h: hCell
			};
			const reservedHit = targetOcc.tryPlaceAt(rectHit.r0, rectHit.c0, rectHit.w, rectHit.h) ?? rectHit;
			item.footprint = reservedHit;
			item.pixelFootprint = {
				x: rectX,
				y: rectY,
				w: rectW,
				h: rectH
			};
			item.x = centerX;
			item.y = centerY;
			if (shape !== "clouds") placedFootprints.push(reservedHit);
			outPlaced.push({
				id: item.id,
				x: centerX,
				y: centerY,
				shape: item.shape,
				footprint: reservedHit,
				pixelFootprint: item.pixelFootprint
			});
			continue;
		}
		const placedForScore = shape === "clouds" ? emptyPlacedFootprints : placedFootprints;
		const candidates = [];
		if (item.communityZone) {
			const { minR0: bandMinR0, maxR0: bandMaxR0 } = communityBandRowBounds(item.communityZone.band, spec, usedRows, hCell);
			const centerRow = clampZoneCenterRowForFootprint(zoneCenterRowForSpec({
				band: item.communityZone.band,
				yK: item.communityZone.centerY,
				spec,
				usedRows,
				hCell
			}), hCell, usedRows);
			const thinRowR0 = isThinRowZone(item.communityZone) ? thinRowR0ForZone({
				band: item.communityZone.band,
				centerRow,
				spec,
				usedRows,
				hCell
			}) : null;
			const rMin = thinRowR0 ?? Math.max(bandMinR0, Math.floor(centerRow - item.communityZone.radiusY - hCell));
			const rMax = thinRowR0 ?? Math.min(bandMaxR0, Math.ceil(centerRow + item.communityZone.radiusY));
			for (let r0 = rMin; r0 <= Math.min(rMax, rows - hCell); r0++) {
				const { refCols } = horizontalReferenceForFootprint(r0, hCell, cols, colsPerRow);
				const centerCol = item.communityZone.centerX * Math.max(1, refCols - 1);
				const cMin = Math.max(0, Math.floor(centerCol - item.communityZone.radiusX - wCell));
				const cMax = Math.min(refCols - wCell, Math.ceil(centerCol + item.communityZone.radiusX));
				const segs = allowedSegmentsForRow(r0, wCell, hCell, rows, cols, itemForbidden, colsPerRow);
				for (const seg of segs) {
					const c0Start = Math.max(seg.cStart, cMin);
					const c0End = Math.min(seg.cEnd, cMax);
					const effectiveCenterC = centerCol;
					for (let c0 = c0Start; c0 <= c0End; c0++) {
						if (!candidateInCommunityZone({
							item,
							r0,
							c0,
							wCell,
							hCell,
							usedRows,
							refCols,
							spec
						})) continue;
						const score = scoreCandidateGeneric({
							r0,
							c0,
							wCell,
							hCell,
							cols,
							usedRows,
							placed: placedForScore,
							salt,
							effectiveCenterC,
							effectiveCenterR: centerRow
						});
						candidates.push({
							r0,
							c0,
							score
						});
					}
				}
			}
			candidates.sort((a, b) => b.score - a.score);
			let rectHit = null;
			for (const cand of candidates) {
				const hit = targetOcc.tryPlaceAt(cand.r0, cand.c0, wCell, hCell);
				if (hit) {
					rectHit = hit;
					break;
				}
			}
			if (!rectHit) continue;
			const { x, y } = cellAnchorToPx2({
				cellW,
				cellH,
				ox,
				oy,
				...metrics
			}, rectHit, "center");
			item.footprint = rectHit;
			item.x = x;
			item.y = y;
			if (shape !== "clouds") placedFootprints.push(rectHit);
			outPlaced.push({
				id: item.id,
				x,
				y,
				shape: item.shape,
				footprint: rectHit
			});
			continue;
		}
		const zone = typeof item.zoneIndex === "number" ? placements[shape]?.zones?.[item.zoneIndex] : void 0;
		const topK = zone?.verticalK[0] ?? 0;
		const botK = zone?.verticalK[1] ?? 1;
		const leftK = zone?.horizontalK?.[0] ?? 0;
		const rightK = zone?.horizontalK?.[1] ?? 1;
		const rMin = Math.max(0, Math.floor(usedRows * topK));
		const rMax = Math.min(usedRows - hCell, Math.floor(usedRows * botK));
		for (let r0 = rMin; r0 <= Math.min(rMax, rows - hCell); r0++) {
			const { refCols } = horizontalReferenceForFootprint(r0, hCell, cols, colsPerRow);
			const cMin = Math.max(0, Math.floor(refCols * leftK));
			const cMax = Math.min(refCols - wCell, Math.floor(refCols * rightK));
			const segs = allowedSegmentsForRow(r0, wCell, hCell, rows, cols, itemForbidden, colsPerRow);
			for (const seg of segs) {
				const c0Start = Math.max(seg.cStart, cMin);
				const c0End = Math.min(seg.cEnd, cMax);
				const effectiveCenterC = (c0Start + c0End) / 2;
				for (let c0 = c0Start; c0 <= c0End; c0++) {
					const score = scoreCandidateGeneric({
						r0,
						c0,
						wCell,
						hCell,
						cols,
						usedRows,
						placed: placedForScore,
						salt,
						effectiveCenterC
					});
					candidates.push({
						r0,
						c0,
						score
					});
				}
			}
		}
		let rectHit = null;
		if (candidates.length === 0) for (let k = cursor; k < fallbackCells.length; k++) {
			const { r, c } = fallbackCells[k];
			if (r < rMin || r > rMax) continue;
			const { refCols: fbRefCols } = horizontalReferenceForFootprint(r, hCell, cols, colsPerRow);
			const fbCMin = Math.max(0, Math.floor(fbRefCols * leftK));
			const fbCMax = Math.min(fbRefCols - wCell, Math.floor(fbRefCols * rightK));
			if (c < fbCMin || c > fbCMax) continue;
			if (!footprintAllowed(r, c, wCell, hCell, rows, cols, itemForbidden, colsPerRow)) continue;
			const hit = targetOcc.tryPlaceAt(r, c, wCell, hCell);
			if (hit) {
				rectHit = hit;
				cursor = Math.max(k - 2, 0);
				break;
			}
		}
		else {
			candidates.sort((a, b) => b.score - a.score);
			for (const cand of candidates) {
				const hit = targetOcc.tryPlaceAt(cand.r0, cand.c0, wCell, hCell);
				if (hit) {
					rectHit = hit;
					break;
				}
			}
		}
		if (!rectHit) continue;
		const { x, y } = cellAnchorToPx2({
			cellW,
			cellH,
			ox,
			oy,
			...metrics
		}, rectHit, "center");
		item.footprint = rectHit;
		item.x = x;
		item.y = y;
		if (shape !== "clouds") placedFootprints.push(rectHit);
		outPlaced.push({
			id: item.id,
			x,
			y,
			shape: item.shape,
			footprint: rectHit
		});
	}
	return { placed: outPlaced };
}
//#endregion
//#region src/canvas-engine/scene-logic/composeField.ts
var CENTER_PLACEMENT_KEY = -2e3;
function resolveDeviceCount(count, device, fallbackWhenMissing) {
	if (!count) return fallbackWhenMissing;
	return count[device] ?? 0;
}
function formatKeyNumber(value) {
	if (!Number.isFinite(value)) return "0";
	return value.toFixed(4).replace(/\.?0+$/, "");
}
function occurrenceKey(base, seen) {
	const occurrence = seen.get(base) ?? 0;
	seen.set(base, occurrence + 1);
	return occurrence === 0 ? base : `${base}#${String(occurrence)}`;
}
function pointPlacementKey(shape, point) {
	return [
		"point",
		shape,
		`x:${formatKeyNumber(point.xK)}`,
		`y:${formatKeyNumber(point.yK)}`
	].join("|");
}
function zonePlacementKey(shape, zone) {
	const horizontal = zone.horizontalK ?? [0, 1];
	return [
		"zone",
		shape,
		`v:${formatKeyNumber(zone.verticalK[0])}-${formatKeyNumber(zone.verticalK[1])}`,
		`h:${formatKeyNumber(horizontal[0])}-${formatKeyNumber(horizontal[1])}`
	].join("|");
}
function hasExplicitShapePlacement(rule) {
	if (!rule || Array.isArray(rule) || "kind" in rule) return false;
	const r = rule;
	return "center" in r || Array.isArray(r.points) && r.points.length > 0 || Array.isArray(r.zones) && r.zones.length > 0;
}
function buildPresetPool(opts, device, landscapeScale) {
	const preset = opts.placements.preset;
	if (preset?.kind !== "zone-communities") return [];
	const t = clamp01(opts.liveAvg);
	const queues = [];
	const zoneIdCounts = /* @__PURE__ */ new Map();
	preset.zones.forEach((zone, zoneIdx) => {
		let stableZoneKey = null;
		const resolveStableZoneKey = () => {
			if (stableZoneKey) return stableZoneKey;
			const zoneIdBase = zone.id || `zone-${String(zoneIdx)}`;
			const zoneIdOccurrence = zoneIdCounts.get(zoneIdBase) ?? 0;
			zoneIdCounts.set(zoneIdBase, zoneIdOccurrence + 1);
			stableZoneKey = zoneIdOccurrence === 0 ? zoneIdBase : `${zoneIdBase}#${String(zoneIdOccurrence)}`;
			return stableZoneKey;
		};
		for (const shape of SHAPES) {
			if (hasExplicitShapePlacement(opts.placements[shape])) continue;
			const rule = zone.shapes[shape];
			if (!rule) continue;
			const baseCount = resolveDeviceCount(rule.count, device, 0);
			const pct = interpolatePct(rule.quota, t);
			const bandScale = zone.band === "sky" ? 1 : landscapeScale;
			const count = Math.max(0, Math.round(baseCount * pct / 50 * bandScale));
			if (count <= 0) continue;
			const size = footprintForShape(shape);
			const radiusX = zone.radius.xTiles ?? zone.radius.tiles * (zone.radius.xDistort ?? 1);
			const radiusY = zone.radius.yTiles ?? zone.radius.tiles * (zone.radius.yDistort ?? 1);
			const radiusShape = zone.radius.shape ?? "ellipse";
			const queue = [];
			for (let i = 0; i < count; i++) queue.push({
				id: stableItemId(shape, resolveStableZoneKey(), i),
				shape,
				size,
				communityZone: {
					band: zone.band,
					centerX: zone.center.x,
					centerY: zone.center.y,
					radiusShape,
					radiusX,
					radiusY
				}
			});
			queues.push(queue);
		}
	});
	const items = [];
	let round = 0;
	let found = true;
	while (found) {
		found = false;
		for (const queue of queues) {
			const item = queue[round];
			if (item !== void 0) {
				items.push(item);
				found = true;
			}
		}
		round += 1;
	}
	return items;
}
function buildRulePool(opts, device, landscapeScale) {
	const { placements, liveAvg } = opts;
	const t = clamp01(liveAvg);
	const items = [];
	for (const shape of SHAPES) {
		const rule = placements[shape];
		if (!rule) continue;
		const pct = interpolatePct(rule.quota, t);
		const size = footprintForShape(shape);
		const pointKeyCounts = /* @__PURE__ */ new Map();
		const zoneKeyCounts = /* @__PURE__ */ new Map();
		if (rule.center) {
			const baseCount = resolveDeviceCount(rule.center.count, device, 1);
			const count = Math.max(0, Math.round(baseCount * pct / 50 * landscapeScale));
			for (let i = 0; i < count; i++) items.push({
				id: stableItemId(shape, CENTER_PLACEMENT_KEY, i),
				shape,
				size,
				center: {
					xK: rule.center.xK ?? .5,
					yK: rule.center.yK ?? .5,
					scale: rule.center.scale ?? 1
				}
			});
		}
		rule.points?.forEach((pointPlacement) => {
			const baseCount = resolveDeviceCount(pointPlacement.count, device, 1);
			const count = Math.max(0, Math.round(baseCount * pct / 50 * landscapeScale));
			if (count <= 0) return;
			const pointKey = occurrenceKey(pointPlacementKey(shape, pointPlacement), pointKeyCounts);
			for (let i = 0; i < count; i++) items.push({
				id: stableItemId(shape, pointKey, i),
				shape,
				size,
				point: {
					xK: pointPlacement.xK,
					yK: pointPlacement.yK
				}
			});
		});
		rule.zones?.forEach((zone, zoneIdx) => {
			const baseCount = resolveDeviceCount(zone.count, device, 0);
			const count = Math.max(0, Math.round(baseCount * pct / 50 * landscapeScale));
			if (count <= 0) return;
			const zoneKey = occurrenceKey(zonePlacementKey(shape, zone), zoneKeyCounts);
			for (let i = 0; i < count; i++) items.push({
				id: stableItemId(shape, zoneKey, i),
				shape,
				zoneIndex: zoneIdx,
				size
			});
		});
	}
	return items;
}
function buildPool(opts, device, landscapeScale) {
	const rulePool = buildRulePool(opts, device, landscapeScale);
	if (opts.placements.preset?.kind === "zone-communities") return [...rulePool, ...buildPresetPool(opts, device, landscapeScale)];
	return rulePool;
}
function buildFieldPrelude(opts) {
	const w = Math.round(opts.canvas.w);
	const h = Math.round(opts.canvas.h);
	const ruleW = Math.round(opts.ruleWidthPx ?? w);
	const device = currentViewportDeviceType(ruleW);
	const landscapeScale = getLandscapeCountScale(device, opts.landscapeCountScale);
	const spec = resolvePaddingSpec(ruleW, opts.padding);
	const { cell, cellW, cellH, ox, oy, rows, cols, metrics } = makeCenteredSquareGrid({
		w,
		h,
		rows: spec.rows,
		useTopRatio: spec.useTopRatio ?? 1,
		horizonPos: spec.horizonPos
	});
	if (!rows || !cols || !cell) return null;
	const usedRows = usedRowsFromSpec(rows, spec.useTopRatio);
	const salt = typeof opts.salt === "number" ? opts.salt : rows * 73856093 ^ cols * 19349663;
	return {
		pool: buildPool(opts, device, landscapeScale),
		spec,
		device,
		rows,
		cols,
		cell,
		cellW,
		cellH,
		ox,
		oy,
		metrics,
		canvas: {
			w,
			h
		},
		usedRows,
		salt,
		placements: opts.placements,
		reservedFootprints: opts.reservedFootprints ?? []
	};
}
function composeField(opts) {
	const prelude = buildFieldPrelude(opts);
	if (!prelude) return { placed: [] };
	const { placed } = placePoolItems(prelude);
	return { placed };
}
//#endregion
//#region src/canvas-engine/scene-logic/resolveAuthoredLightSource.ts
function resolveActiveDeviceCount(count, device, fallbackWhenMissing = 0) {
	if (!count) return fallbackWhenMissing;
	return count[device] ?? 0;
}
function hasActiveCount(count, quota, device, liveAvg, fallbackWhenMissing = 0) {
	const baseCount = resolveActiveDeviceCount(count, device, fallbackWhenMissing);
	if (baseCount <= 0) return false;
	return Math.round(baseCount * interpolatePct(quota, typeof liveAvg === "number" && Number.isFinite(liveAvg) ? liveAvg : .5) / 50) > 0;
}
function resolveAuthoredLightSource(placements, liveAvg, ruleWidthPx) {
	const device = currentViewportDeviceType(ruleWidthPx);
	const sunRule = placements.sun;
	if (sunRule?.center && hasActiveCount(sunRule.center.count, sunRule.quota, device, liveAvg, 1)) return {
		xK: sunRule.center.xK ?? .5,
		yK: sunRule.center.yK ?? .5,
		paletteClosenessK: .9
	};
	for (const point of sunRule?.points ?? []) {
		if (!hasActiveCount(point.count, sunRule?.quota, device, liveAvg, 1)) continue;
		return {
			xK: point.xK,
			yK: point.yK,
			paletteClosenessK: .9
		};
	}
	for (const zone of sunRule?.zones ?? []) {
		if (!hasActiveCount(zone.count, sunRule?.quota, device, liveAvg)) continue;
		const horizontal = zone.horizontalK ?? [0, 1];
		return {
			xK: (horizontal[0] + horizontal[1]) / 2,
			yK: (zone.verticalK[0] + zone.verticalK[1]) / 2,
			paletteClosenessK: .9
		};
	}
	const zones = placements.preset?.kind === "zone-communities" ? placements.preset.zones : [];
	for (const zone of zones) {
		const sun = zone.shapes.sun;
		if (!sun || !hasActiveCount(sun.count, sun.quota, device, liveAvg)) continue;
		return {
			xK: zone.center.x,
			yK: zone.center.y,
			paletteClosenessK: .9
		};
	}
	return null;
}
//#endregion
//#region src/canvas-engine/scene-logic/resolveRuntimePlacements.ts
function positiveModulo(value, length) {
	return (value % length + length) % length;
}
function resolveRuntimePlacements(placements, spotlightIndex) {
	const runtimePreset = placements.runtimePreset;
	if (!runtimePreset?.entries.length) return placements;
	const entries = runtimePreset.entries;
	if (typeof spotlightIndex !== "number") return entries[0] ?? placements;
	return entries[positiveModulo(spotlightIndex, entries.length)];
}
//#endregion
//#region src/workers/scene/compose-worker-host.ts
var instance = null;
var nextRequestId = 0;
var pending = /* @__PURE__ */ new Map();
function getInstance() {
	if (!instance) {
		instance = new Worker(new URL("./compose-worker.ts", import.meta.url), { type: "module" });
		instance.onmessage = (e) => {
			const resolve = pending.get(e.data.requestId);
			if (resolve) {
				pending.delete(e.data.requestId);
				resolve(e.data.placed);
			}
		};
		instance.onerror = (e) => {
			console.error("[compose-worker] error:", e.message);
		};
	}
	return instance;
}
function isComposeWorkerSupported() {
	return typeof Worker !== "undefined";
}
function composeFieldAsync(opts) {
	if (!isComposeWorkerSupported()) return Promise.resolve(composeField(opts).placed);
	const prelude = buildFieldPrelude(opts);
	if (!prelude) return Promise.resolve([]);
	const { spec, rows, cols } = prelude;
	const bitmap = new Uint8Array(rows * cols);
	if (spec.forbidden) {
		for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) if (spec.forbidden(r, c, rows, cols)) bitmap[r * cols + c] = 1;
	}
	const { forbidden: _dropped, ...serialSpec } = spec;
	return new Promise((resolve) => {
		const requestId = nextRequestId++;
		pending.set(requestId, resolve);
		getInstance().postMessage({
			requestId,
			prelude: {
				...prelude,
				spec: serialSpec
			},
			forbiddenBitmap: bitmap
		}, { transfer: [bitmap.buffer] });
	});
}
//#endregion
//#region src/canvas-engine/validation/invariant.ts
function invariant(condition, message) {
	if (!condition) {
		console.error(`Canvas Engine Validation Failed:\n${message}`);
		throw new Error(message);
	}
}
//#endregion
//#region src/canvas-engine/validation/validateSceneProfile.ts
var warnedRuntimePresets = /* @__PURE__ */ new Set();
function warnOnce(key, message) {
	if (warnedRuntimePresets.has(key)) return;
	warnedRuntimePresets.add(key);
	console.warn(`Canvas Engine Validation Warning:\n${message}`);
}
function validateSceneProfile(id, mode, profile) {
	invariant(!!profile, `[${id}] SceneProfile is missing`);
	invariant(!!profile.padding, `[${id}] missing "padding" on SceneProfile`);
	invariant(!!profile.placements, `[${id}] missing "placements" on SceneProfile`);
	invariant(!!profile.background, `[${id}] missing "background" on SceneProfile`);
	invariant(!!profile.renderCache, `[${id}] missing "renderCache" on SceneProfile`);
	invariant(typeof mode === "string", `[${id}] invalid mode`);
	if (profile.background.runtimePreset?.selector === "spotlightIndex" && id !== "spotlight") warnOnce(`${id}:${mode}:background-runtime-preset`, `[${id}] background runtimePreset is driven by the Spotlight signal. Move this background sequence to the spotlight ruleset or wire an explicit signal contract before using it here.`);
	if (profile.placements.runtimePreset?.selector === "spotlightIndex" && id !== "spotlight") warnOnce(`${id}:${mode}:placement-runtime-preset`, `[${id}] placement runtimePreset is driven by the Spotlight signal. Move this placement sequence to the spotlight ruleset or wire an explicit signal contract before using it here.`);
	if (profile.padding.runtimePreset?.selector === "spotlightIndex" && id !== "spotlight") warnOnce(`${id}:${mode}:padding-runtime-preset`, `[${id}] padding runtimePreset is driven by the Spotlight signal. Move this padding sequence to the spotlight ruleset or wire an explicit signal contract before using it here.`);
}
//#endregion
//#region src/canvas-engine/validation/defineRuleSet.ts
function defineRuleSet(id, getProfile) {
	return {
		id,
		getProfile: (state, context) => {
			const profile = getProfile(state, context);
			validateSceneProfile(id, state.lookupKey, profile);
			return profile;
		}
	};
}
//#endregion
//#region src/canvas-engine/scene-rules/ambient-particles/index.ts
var spotlightSlides$1 = SPOTLIGHT_SLIDES;
var START_AMBIENT_PARTICLES = { layers: [{
	count: [48, 96],
	xRange: [.04, .96],
	yRange: [.16, .82],
	sizePx: [1, 2],
	speedX: [6, 12],
	speedY: [-1, 4],
	color: [
		{
			color: "rgb(215, 234, 255)",
			alpha: .4
		},
		{
			color: "rgb(229, 250, 255)",
			alpha: .5
		},
		{
			color: "rgb(213, 235, 255)",
			alpha: .6
		}
	],
	seed: 31
}] };
var START_DARK_AMBIENT_PARTICLES = { layers: [{
	count: [24, 36],
	xRange: [.04, .96],
	yRange: [.14, .84],
	sizePx: [1, 2],
	speedX: [3, 4],
	speedY: [-1, 4],
	color: [
		{
			color: "rgb(219, 235, 164)",
			alpha: .2
		},
		{
			color: "rgb(185, 220, 169)",
			alpha: .3
		},
		{
			color: "rgb(170, 229, 185)",
			alpha: .4
		}
	],
	seed: 37
}] };
var SPOTLIGHT_AMBIENT_PARTICLES = {
	layers: [],
	runtimePreset: {
		selector: "spotlightIndex",
		entries: spotlightSlides$1.map((slide) => slide.ambientParticles ?? null)
	}
};
var SPOTLIGHT_DARK_AMBIENT_PARTICLES = {
	layers: [],
	runtimePreset: {
		selector: "spotlightIndex",
		entries: spotlightSlides$1.map((slide) => slide.darkAmbientParticles ?? slide.ambientParticles ?? null)
	}
};
var CITY_AMBIENT_PARTICLES = { layers: [{
	count: [32, 56],
	xRange: [0, 1],
	yRange: [.1, .85],
	sizePx: [1, 2],
	speedX: [2, 5],
	speedY: [-.5, 1.5],
	color: [
		{
			color: "rgb(200, 230, 255)",
			alpha: .35
		},
		{
			color: "rgb(220, 240, 255)",
			alpha: .45
		},
		{
			color: "rgb(245, 250, 255)",
			alpha: .3
		}
	],
	seed: 71
}, {
	count: [16, 28],
	xRange: [0, 1],
	yRange: [.2, .75],
	sizePx: [2, 3.5],
	speedX: [1, 4],
	speedY: [-.5, 1],
	color: [{
		color: "rgb(180, 215, 245)",
		alpha: .2
	}, {
		color: "rgb(210, 235, 255)",
		alpha: .3
	}],
	seed: 83
}] };
var CITY_DARK_AMBIENT_PARTICLES = { layers: [{
	count: [28, 48],
	xRange: [0, 1],
	yRange: [.1, .85],
	sizePx: [1, 2],
	speedX: [2, 5],
	speedY: [-.5, 1.5],
	color: [
		{
			color: "rgb(180, 210, 160)",
			alpha: .2
		},
		{
			color: "rgb(160, 200, 180)",
			alpha: .25
		},
		{
			color: "rgb(200, 225, 170)",
			alpha: .3
		}
	],
	seed: 73
}, {
	count: [14, 24],
	xRange: [0, 1],
	yRange: [.2, .75],
	sizePx: [1.5, 3],
	speedX: [1, 4],
	speedY: [-.5, 1],
	color: [{
		color: "rgb(160, 195, 145)",
		alpha: .15
	}, {
		color: "rgb(180, 215, 165)",
		alpha: .2
	}],
	seed: 89
}] };
var AMBIENT_PARTICLES = {
	start: START_AMBIENT_PARTICLES,
	questionnaire: START_AMBIENT_PARTICLES,
	city: CITY_AMBIENT_PARTICLES,
	spotlight: SPOTLIGHT_AMBIENT_PARTICLES
};
var AMBIENT_PARTICLES_DARK = {
	start: START_DARK_AMBIENT_PARTICLES,
	questionnaire: START_DARK_AMBIENT_PARTICLES,
	city: CITY_DARK_AMBIENT_PARTICLES,
	spotlight: SPOTLIGHT_DARK_AMBIENT_PARTICLES
};
//#endregion
//#region src/canvas-engine/scene-rules/fog/index.ts
function darkLightGradient(args) {
	return {
		leftEdgeColor: args.leftEdgeColor,
		rightEdgeColor: args.rightEdgeColor,
		innerRadiusK: .13
	};
}
var DEFAULT_FOG = {};
var DEFAULT_DARK_FOG = {
	lightRadiusK: .13,
	sky: {
		color: {
			r: 33,
			g: 32,
			b: 40
		},
		skyGradient: darkLightGradient({
			leftEdgeColor: {
				r: 55,
				g: 58,
				b: 72
			},
			rightEdgeColor: {
				r: 14,
				g: 10,
				b: 32
			}
		})
	},
	ground: {
		color: {
			r: 33,
			g: 32,
			b: 40
		},
		groundGradient: darkLightGradient({
			leftEdgeColor: {
				r: 52,
				g: 54,
				b: 54
			},
			rightEdgeColor: {
				r: 15,
				g: 9,
				b: 30
			}
		})
	}
};
var FOG = {
	start: DEFAULT_FOG,
	questionnaire: DEFAULT_FOG,
	city: DEFAULT_FOG,
	spotlight: null
};
var FOG_DARK = {
	start: DEFAULT_DARK_FOG,
	questionnaire: DEFAULT_DARK_FOG,
	city: DEFAULT_DARK_FOG,
	spotlight: null
};
//#endregion
//#region src/canvas-engine/scene-rules/foliage/index.ts
var spotlightSlides = SPOTLIGHT_SLIDES;
var SPOTLIGHT_FOLIAGE = {
	layers: [],
	runtimePreset: {
		selector: "spotlightIndex",
		entries: spotlightSlides.map((slide) => slide.foliage ?? null)
	}
};
var SPOTLIGHT_DARK_FOLIAGE = {
	layers: [],
	runtimePreset: {
		selector: "spotlightIndex",
		entries: spotlightSlides.map((slide) => slide.darkFoliage ?? slide.foliage ?? null)
	}
};
var _FOLIAGE = { layers: [
	{
		count: [50, 90],
		yK: [.5, .62],
		heightPx: [3, 7],
		widthPx: [2, 6],
		color: [
			{
				color: "#96bf64",
				alpha: .25
			},
			{
				color: "#cebf83",
				alpha: .22
			},
			{
				color: "#71b571",
				alpha: .28
			},
			{
				color: "#a8c472",
				alpha: .24
			}
		],
		seed: 41
	},
	{
		count: [36, 60],
		yK: [.6, .72],
		heightPx: [5, 10],
		widthPx: [3, 8],
		color: [
			{
				color: "#88ba58",
				alpha: .3
			},
			{
				color: "#c4b878",
				alpha: .28
			},
			{
				color: "#6aaf6a",
				alpha: .33
			},
			{
				color: "#9ec468",
				alpha: .3
			}
		],
		seed: 55
	},
	{
		count: [24, 42],
		yK: [.7, .82],
		heightPx: [7, 14],
		widthPx: [4, 10],
		color: [
			{
				color: "#82b552",
				alpha: .35
			},
			{
				color: "#bdb274",
				alpha: .32
			},
			{
				color: "#64aa64",
				alpha: .38
			},
			{
				color: "#94be60",
				alpha: .34
			}
		],
		seed: 67
	},
	{
		count: [16, 28],
		yK: [.8, .95],
		heightPx: [9, 18],
		widthPx: [4, 12],
		color: [
			{
				color: "#7ab04e",
				alpha: .38
			},
			{
				color: "#b6ab6e",
				alpha: .35
			},
			{
				color: "#5ea55e",
				alpha: .4
			}
		],
		seed: 79
	}
] };
var DARK_FOLIAGE = { layers: [
	{
		count: [50, 90],
		yK: [.5, .62],
		heightPx: [3, 7],
		widthPx: [2, 6],
		color: [
			{
				color: "#4a6840",
				alpha: .12
			},
			{
				color: "#2e454a",
				alpha: .1
			},
			{
				color: "#3d5e3a",
				alpha: .15
			},
			{
				color: "#8f613c",
				alpha: .1
			}
		],
		seed: 41
	},
	{
		count: [36, 60],
		yK: [.6, .72],
		heightPx: [5, 10],
		widthPx: [3, 8],
		color: [
			{
				color: "#507248",
				alpha: .17
			},
			{
				color: "#344e52",
				alpha: .15
			},
			{
				color: "#436442",
				alpha: .2
			},
			{
				color: "#7a5236",
				alpha: .14
			}
		],
		seed: 55
	},
	{
		count: [24, 42],
		yK: [.7, .82],
		heightPx: [7, 14],
		widthPx: [4, 10],
		color: [
			{
				color: "#567c50",
				alpha: .22
			},
			{
				color: "#3a555a",
				alpha: .2
			},
			{
				color: "#496e48",
				alpha: .25
			}
		],
		seed: 67
	},
	{
		count: [16, 28],
		yK: [.8, .95],
		heightPx: [9, 18],
		widthPx: [4, 12],
		color: [
			{
				color: "#5c865a",
				alpha: .26
			},
			{
				color: "#3e5c60",
				alpha: .13
			},
			{
				color: "#4f7850",
				alpha: .18
			},
			{
				color: "#7d5538",
				alpha: .18
			}
		],
		seed: 79
	}
] };
var FOLIAGE = {
	start: _FOLIAGE,
	questionnaire: _FOLIAGE,
	city: _FOLIAGE,
	spotlight: SPOTLIGHT_FOLIAGE
};
var FOLIAGE_DARK = {
	start: DARK_FOLIAGE,
	questionnaire: DARK_FOLIAGE,
	city: DARK_FOLIAGE,
	spotlight: SPOTLIGHT_DARK_FOLIAGE
};
//#endregion
//#region src/canvas-engine/scene-rules/resolver.ts
var LANDSCAPE_COUNT_SCALE = {
	start: {
		mobile: 1.6,
		tablet: 1.4
	},
	questionnaire: {
		mobile: 2,
		tablet: .8
	},
	city: {},
	spotlight: {}
};
function rulesForLookupKey(lookupKey) {
	if (lookupKey === "start") return {
		padding: CANVAS_PADDING.start,
		placements: SHAPE_PLACEMENTS.start
	};
	if (lookupKey === "questionnaire") return {
		padding: CANVAS_PADDING.questionnaire,
		placements: SHAPE_PLACEMENTS.questionnaire
	};
	if (lookupKey === "spotlight") return {
		padding: CANVAS_PADDING.spotlight,
		placements: SHAPE_PLACEMENTS.spotlight
	};
	return {
		padding: CANVAS_PADDING.city,
		placements: SHAPE_PLACEMENTS.city
	};
}
function backgroundForState(state, context) {
	if (state.lookupKey === "city") return context.darkMode ? BACKGROUNDS_CITY_DARK.city : BACKGROUNDS_CITY.city;
	if (state.lookupKey === "questionnaire") return context.darkMode ? BACKGROUNDS_QUESTIONNAIRE_DARK.questionnaire : BACKGROUNDS_QUESTIONNAIRE.questionnaire;
	if (state.lookupKey === "spotlight") return context.darkMode ? BACKGROUNDS_SPOTLIGHT_DARK.spotlight : BACKGROUNDS_SPOTLIGHT.spotlight;
	return context.darkMode ? BACKGROUNDS_START_DARK.start : BACKGROUNDS_LIGHT.start;
}
function fogForState(state, context) {
	return context.darkMode ? FOG_DARK[state.lookupKey] : FOG[state.lookupKey];
}
function ambientParticlesForState(state, context) {
	return context.darkMode ? AMBIENT_PARTICLES_DARK[state.lookupKey] : AMBIENT_PARTICLES[state.lookupKey];
}
function foliageForState(state, context) {
	return context.darkMode ? FOLIAGE_DARK[state.lookupKey] : FOLIAGE[state.lookupKey];
}
function resolveProfile(state, context) {
	return {
		...rulesForLookupKey(state.lookupKey),
		background: backgroundForState(state, context),
		ambientParticles: ambientParticlesForState(state, context),
		fog: fogForState(state, context),
		foliage: foliageForState(state, context),
		renderCache: DEFAULT_RENDER_CACHE_POLICY,
		landscapeCountScale: LANDSCAPE_COUNT_SCALE[state.lookupKey]
	};
}
//#endregion
//#region src/canvas-engine/scene-rules/registry.ts
var SCENE_RULESETS = {
	intro: defineRuleSet("intro", (state, context) => resolveProfile(state, context)),
	city: defineRuleSet("city", (state, context) => resolveProfile(state, context)),
	spotlight: defineRuleSet("spotlight", (state, context) => resolveProfile(state, context))
};
//#endregion
//#region src/canvas-engine/multi-canvas-setup/hostDefs.ts
var defineHosts = (t) => t;
var HOST_DEFS = defineHosts({
	start: {
		mount: "#canvas-root",
		zIndex: 2,
		dprMode: "cap2",
		fpsCap: 60,
		canvasDimensions: { kind: "parent" },
		scene: {
			lookupKey: "start",
			ruleset: SCENE_RULESETS.intro
		}
	},
	questionnaire: {
		mount: "#questionnaire-canvas-root",
		zIndex: 2,
		dprMode: "cap2",
		fpsCap: 60,
		stopOnOpen: ["start"],
		initialFieldDelayMs: 100,
		canvasDimensions: { kind: "parent" },
		scene: {
			lookupKey: "questionnaire",
			ruleset: SCENE_RULESETS.intro
		}
	},
	city: {
		mount: "#city-canvas-root",
		zIndex: 60,
		dprMode: "cap2",
		fpsCap: 60,
		initialFieldDelayMs: 50,
		canvasDimensions: { kind: "viewport" },
		scene: {
			lookupKey: "city",
			ruleset: SCENE_RULESETS.city
		}
	},
	spotlight: {
		mount: "#spotlight-canvas-root",
		zIndex: 60,
		dprMode: "cap2",
		fpsCap: 60,
		canvasDimensions: { kind: "parent" },
		scene: {
			lookupKey: "spotlight",
			ruleset: SCENE_RULESETS.spotlight
		}
	}
});
function getHostDef(id) {
	return HOST_DEFS[id];
}
//#endregion
//#region src/canvas-engine/hooks/sceneFieldSignature.ts
function reservedFootprintsKey(reservedFootprints) {
	if (!reservedFootprints?.length) return "";
	return reservedFootprints.map((footprint) => [
		footprint.r0,
		footprint.c0,
		footprint.w,
		footprint.h
	].map((value) => String(value)).join(",")).join(";");
}
function lightSourceKey(shapeLightSource) {
	if (shapeLightSource === void 0) return "authored";
	if (!shapeLightSource) return "none";
	return [
		shapeLightSource.xK,
		shapeLightSource.yK,
		shapeLightSource.paletteClosenessK ?? ""
	].map((value) => String(value)).join(":");
}
function fieldRefreshSignature(args) {
	return [
		args.hostId,
		args.sceneLookupKey,
		String(args.viewportKey ?? ""),
		String(args.spotlightIndex ?? ""),
		String(args.fog ?? ""),
		String(args.darkMode),
		`${String(args.canvas.w)}x${String(args.canvas.h)}`,
		reservedFootprintsKey(args.reservedFootprints),
		lightSourceKey(args.shapeLightSource)
	].join("|");
}
//#endregion
//#region src/canvas-engine/hooks/useCanvasLogicalSize.ts
function getCanvasLogicalSize(canvas) {
	if (!canvas) {
		const { w, h } = getViewportSize$1();
		return {
			w,
			h
		};
	}
	const meta = getCanvasMeta(canvas);
	const dpr = meta.dpr ?? (typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1);
	const backingW = (canvas.width || 0) / dpr;
	const backingH = (canvas.height || 0) / dpr;
	const { cssW, cssH } = meta;
	return {
		w: Math.round(typeof cssW === "number" && Number.isFinite(cssW) ? cssW : backingW),
		h: Math.round(typeof cssH === "number" && Number.isFinite(cssH) ? cssH : backingH)
	};
}
function useCanvasLogicalSizeTick(engine) {
	const { ready, controls, readyTick } = engine;
	const [canvasResizeTick, setCanvasResizeTick] = useState(0);
	const lastCanvasSizeRef = useRef(null);
	useEffect(() => {
		if (!ready.current) return;
		const canvas = controls.current?.canvas;
		if (!canvas) return;
		let rafId = null;
		const bump = () => {
			if (rafId != null) cancelAnimationFrame(rafId);
			rafId = requestAnimationFrame(() => {
				rafId = null;
				const next = getCanvasLogicalSize(canvas);
				const prev = lastCanvasSizeRef.current;
				if (prev && Math.abs(next.w - prev.w) <= 1 && Math.abs(next.h - prev.h) <= 1) return;
				lastCanvasSizeRef.current = next;
				setCanvasResizeTick((t) => t + 1);
			});
		};
		lastCanvasSizeRef.current = getCanvasLogicalSize(canvas);
		let ro = null;
		if (typeof ResizeObserver !== "undefined") {
			ro = new ResizeObserver(() => {
				bump();
			});
			ro.observe(canvas);
		}
		const onWindowResize = () => {
			bump();
		};
		window.addEventListener("resize", onWindowResize);
		return () => {
			if (rafId != null) cancelAnimationFrame(rafId);
			window.removeEventListener("resize", onWindowResize);
			ro?.disconnect();
		};
	}, [
		ready,
		controls,
		readyTick
	]);
	return canvasResizeTick;
}
//#endregion
//#region src/canvas-engine/hooks/useSceneField.ts
function useSceneField(engine, hostId, liveAvg, reservedFootprints, viewportKey, spotlightIndex, fog, shapeLightSource, initialFieldDelayMs = 0) {
	const fieldDelayStateRef = useRef(null);
	const fieldApplyStateRef = useRef(null);
	const { ready, controls, readyTick } = engine;
	const hostDef = HOST_DEFS[hostId];
	const { darkMode } = usePreferences();
	const canvasResizeTick = useCanvasLogicalSizeTick(engine);
	const ruleset = hostDef.scene.ruleset;
	const sceneLookupKey = hostDef.scene.lookupKey;
	useLayoutEffect(() => {
		if (!ready.current) return;
		let cancelled = false;
		let fieldRafId = null;
		let fieldTimerId = null;
		const readyGeneration = readyTick;
		const nowMs = typeof performance !== "undefined" ? performance.now() : Date.now();
		let fieldDelayMs = 0;
		if (initialFieldDelayMs > 0) {
			let delayState = fieldDelayStateRef.current;
			if (delayState?.generation !== readyGeneration) {
				delayState = {
					generation: readyGeneration,
					untilMs: nowMs + initialFieldDelayMs
				};
				fieldDelayStateRef.current = delayState;
			}
			fieldDelayMs = Math.max(0, delayState.untilMs - nowMs);
		}
		const composeAndApplyField = async (engineControls, args) => {
			if (!ready.current) return;
			const placed = await composeFieldAsync({
				padding: args.padding,
				placements: args.placements,
				liveAvg,
				reservedFootprints,
				landscapeCountScale: args.landscapeCountScale,
				ruleWidthPx: args.ruleWidthPx,
				canvas: args.canvas
			});
			if (cancelled) return;
			const previousApply = fieldApplyStateRef.current;
			const liveAvgOnlyRefresh = previousApply !== null && previousApply.itemCount > 0 && placed.length > 0 && previousApply.signature === args.refreshSignature && !Object.is(previousApply.liveAvg, liveAvg);
			engineControls.setFieldItems(placed, { replayAppear: !liveAvgOnlyRefresh });
			engineControls.setFieldVisible(placed.length > 0);
			fieldApplyStateRef.current = {
				liveAvg,
				signature: args.refreshSignature,
				itemCount: placed.length
			};
		};
		const engineControls = controls.current;
		if (!engineControls) return;
		const sceneState = { lookupKey: sceneLookupKey };
		const profile = ruleset.getProfile(sceneState, { darkMode });
		const placements = resolveRuntimePlacements(profile.placements, spotlightIndex);
		const padding = resolvePaddingPolicyVariants(profile.padding, spotlightIndex);
		const canvas = engineControls.canvas;
		const { w, h } = getCanvasLogicalSize(canvas);
		const ruleWidthPx = getViewportSize$1().w;
		const resolvedShapeLightSource = shapeLightSource === void 0 ? resolveAuthoredLightSource(placements, liveAvg, ruleWidthPx) : shapeLightSource;
		const spec = resolvePaddingSpec(ruleWidthPx, padding);
		engineControls.setSceneProfile({
			lookupKey: sceneLookupKey,
			paddingSpec: spec,
			background: profile.background,
			ambientParticles: profile.ambientParticles,
			fog: profile.fog,
			foliage: profile.foliage,
			renderCache: profile.renderCache
		});
		engineControls.setFieldStyle({
			darkMode,
			fog,
			shapeLightSource: resolvedShapeLightSource
		});
		const fieldArgs = {
			padding,
			placements,
			landscapeCountScale: profile.landscapeCountScale,
			ruleWidthPx,
			canvas: {
				w,
				h
			},
			refreshSignature: fieldRefreshSignature({
				hostId,
				sceneLookupKey,
				viewportKey,
				spotlightIndex,
				fog,
				darkMode,
				canvas: {
					w,
					h
				},
				reservedFootprints,
				shapeLightSource
			})
		};
		if (fieldDelayMs > 0) {
			engineControls.setFieldVisible(false);
			const delayState = fieldDelayStateRef.current;
			composeFieldAsync({
				padding: fieldArgs.padding,
				placements: fieldArgs.placements,
				liveAvg,
				reservedFootprints,
				landscapeCountScale: fieldArgs.landscapeCountScale,
				ruleWidthPx: fieldArgs.ruleWidthPx,
				canvas: fieldArgs.canvas
			}).then((placed) => {
				if (cancelled) return;
				const remainingMs = Math.max(0, (delayState?.untilMs ?? 0) - performance.now());
				const applyInRaf = () => {
					fieldRafId = requestAnimationFrame(() => {
						fieldRafId = null;
						if (cancelled) return;
						engineControls.setFieldItems(placed, { replayAppear: true });
						engineControls.setFieldVisible(placed.length > 0);
						fieldApplyStateRef.current = {
							liveAvg,
							signature: fieldArgs.refreshSignature,
							itemCount: placed.length
						};
					});
				};
				if (remainingMs > 0) fieldTimerId = window.setTimeout(() => {
					fieldTimerId = null;
					applyInRaf();
				}, remainingMs);
				else applyInRaf();
			});
			return;
		}
		composeAndApplyField(engineControls, fieldArgs);
		return () => {
			cancelled = true;
			if (fieldRafId !== null) cancelAnimationFrame(fieldRafId);
			if (fieldTimerId !== null) window.clearTimeout(fieldTimerId);
		};
	}, [
		ready,
		controls,
		readyTick,
		liveAvg,
		viewportKey,
		spotlightIndex,
		fog,
		shapeLightSource,
		canvasResizeTick,
		hostId,
		sceneLookupKey,
		ruleset,
		reservedFootprints,
		darkMode,
		initialFieldDelayMs
	]);
}
//#endregion
//#region src/canvas-engine/EngineHost.tsx
function EngineHost({ id, open = true, visible = true, liveAvg = .5, reservedFootprints, spotlight, fog, shapeLightSource }) {
	const hostDef = React.useMemo(() => getHostDef(id), [id]);
	const stopOnOpenMounts = React.useMemo(() => {
		return (hostDef.stopOnOpen ?? []).map((otherId) => HOST_DEFS[otherId].mount);
	}, [hostDef]);
	const resolvedBounds = React.useMemo(() => {
		return hostDef.canvasDimensions;
	}, [hostDef]);
	React.useEffect(() => {
		if (!open) return;
		for (const mount of stopOnOpenMounts) try {
			stopCanvasEngine(mount);
		} catch (err) {
			console.warn("[EngineHost] Failed to stop canvas engine on mount:", mount, err);
		}
	}, [open, stopOnOpenMounts]);
	const engine = useCanvasEngine({
		enabled: open,
		visible,
		dprMode: hostDef.dprMode,
		mount: hostDef.mount,
		zIndex: hostDef.zIndex,
		bounds: resolvedBounds,
		fpsCap: hostDef.fpsCap
	});
	useSceneField(engine, id, liveAvg, reservedFootprints, useViewportKey(120), spotlight?.index, fog, shapeLightSource, hostDef.initialFieldDelayMs);
	React.useEffect(() => {}, [
		engine.controls,
		engine.ready,
		engine.readyTick,
		id
	]);
	React.useLayoutEffect(() => {
		if (!engine.ready.current) return;
		engine.controls.current?.setInputs({
			liveAvg,
			spotlight
		});
	}, [
		engine,
		liveAvg,
		spotlight
	]);
	return null;
}
//#endregion
//#region src/canvas-instances/OnboardingEntry.tsx
function CanvasEntry({ visible = true }) {
	const { liveAvg, reservedFootprints } = useCanvasRuntime();
	return /* @__PURE__ */ jsxs("div", {
		className: "onboarding-canvas",
		role: "img",
		"aria-label": "Animated sustainability visualization",
		children: [/* @__PURE__ */ jsx("div", {
			id: "canvas-root",
			style: {
				width: "100%",
				height: "100%"
			}
		}), /* @__PURE__ */ jsx(EngineHost, {
			id: "start",
			open: true,
			visible,
			liveAvg,
			reservedFootprints
		})]
	});
}
//#endregion
//#region src/canvas-instances/CityEntry.tsx
function CityOverlay({ open }) {
	const { liveAvg, reservedFootprints } = useCanvasRuntime();
	return /* @__PURE__ */ jsxs("div", {
		id: "city-overlay-root",
		className: `city-overlay ${open ? "open" : ""}`,
		"aria-hidden": !open,
		children: [/* @__PURE__ */ jsx("div", {
			id: "city-canvas-root",
			className: "city-canvas-host"
		}), /* @__PURE__ */ jsx(EngineHost, {
			id: "city",
			open,
			liveAvg,
			reservedFootprints
		})]
	});
}
//#endregion
//#region src/lib/hooks/usePreventPageZoom.ts
function isElement(x) {
	return x instanceof Element;
}
function isTouchEvent(event) {
	return typeof TouchEvent !== "undefined" && event instanceof TouchEvent;
}
function isZoomGesture(event) {
	const ctrlKey = event instanceof WheelEvent && event.ctrlKey;
	const multiTouch = (isTouchEvent(event) ? event.touches.length : 0) > 1;
	const safariGestureEvent = event.type.startsWith("gesture");
	return ctrlKey || multiTouch || safariGestureEvent;
}
function usePreventPageZoomOutsideZones({ allowWithin, disabled }) {
	useEffect(() => {
		if (disabled) return;
		const allowSelector = allowWithin.filter(Boolean).join(", ");
		const shouldAllow = (target) => {
			if (!allowSelector) return false;
			if (!isElement(target)) return false;
			return !!target.closest(allowSelector);
		};
		const handler = (event) => {
			if (!isZoomGesture(event)) return;
			const target = event.target;
			if (shouldAllow(target)) return;
			event.preventDefault();
		};
		const activeOptions = { passive: false };
		document.addEventListener("wheel", handler, activeOptions);
		document.addEventListener("gesturestart", handler, activeOptions);
		document.addEventListener("gesturechange", handler, activeOptions);
		document.addEventListener("gestureend", handler, activeOptions);
		document.addEventListener("touchmove", handler, activeOptions);
		return () => {
			document.removeEventListener("wheel", handler);
			document.removeEventListener("gesturestart", handler);
			document.removeEventListener("gesturechange", handler);
			document.removeEventListener("gestureend", handler);
			document.removeEventListener("touchmove", handler);
		};
	}, [allowWithin, disabled]);
}
//#endregion
//#region src/app/useMockBanner.ts
function useMockBanner() {
	const mockReadMode = useMockReadMode();
	const [dismissed, setDismissed] = useState(false);
	useEffect(() => {
		if (!mockReadMode.runtimeFallback) setDismissed(false);
	}, [mockReadMode.runtimeFallback]);
	useEffect(() => {
		if (!mockReadMode.runtimeFallback || mockReadMode.forced || dismissed) return;
		const timer = window.setTimeout(() => {
			setDismissed(true);
		}, 1e4);
		return () => {
			window.clearTimeout(timer);
		};
	}, [
		dismissed,
		mockReadMode.forced,
		mockReadMode.runtimeFallback
	]);
	const quotaResetMonth = useMemo(() => {
		const now = /* @__PURE__ */ new Date();
		return new Date(now.getFullYear(), now.getMonth() + 1, 1).toLocaleString(void 0, { month: "long" });
	}, []);
	return {
		visible: mockReadMode.runtimeFallback && !mockReadMode.forced && !dismissed,
		dismissed,
		setDismissed,
		quotaResetMonth
	};
}
//#endregion
//#region src/app/app-effects.tsx
var GamificationCopyPreloader = React.lazy(() => import("./assets/useGamificationTextPreload-Dz_cZv_t.mjs"));
function scheduleIdle(callback, timeout = 1500) {
	if (typeof window === "undefined") return void 0;
	const idleWindow = window;
	if (typeof idleWindow.requestIdleCallback === "function") {
		const handle = idleWindow.requestIdleCallback(callback, { timeout });
		return () => {
			idleWindow.cancelIdleCallback?.(handle);
		};
	}
	const timer = idleWindow.setTimeout(callback, 0);
	return () => {
		idleWindow.clearTimeout(timer);
	};
}
function DeferredGraphPreloader() {
	useEffect(() => {
		const timer = setTimeout(() => {
			scheduleIdle(() => {
				import("./assets/data-boundary-CbJ6T3jh.mjs");
			});
		}, 6e3);
		return () => {
			clearTimeout(timer);
		};
	}, []);
	return null;
}
function DeferredGamificationPreloader() {
	const [start, setStart] = useState(false);
	useEffect(() => {
		const cancelIdle = scheduleIdle(() => {
			setStart(true);
		});
		return () => {
			cancelIdle?.();
		};
	}, []);
	return start ? /* @__PURE__ */ jsx(Suspense, {
		fallback: null,
		children: /* @__PURE__ */ jsx(GamificationCopyPreloader, {})
	}) : null;
}
function AppBrowserPolicies({ questionnaireOpen, vizVisible }) {
	usePreventPageZoomOutsideZones({ allowWithin: questionnaireOpen ? [
		".graph-container",
		".dot-graph-container",
		"#questionnaire-canvas-root",
		"#city-canvas-root"
	] : [
		".graph-container",
		".dot-graph-container",
		"#canvas-root",
		"#questionnaire-canvas-root",
		"#city-canvas-root"
	] });
	useEffect(() => {
		if (typeof window === "undefined" || !vizVisible) return;
		return scheduleIdle(() => {
			import("./assets/QuestionnaireEntry-D3thISd5.mjs");
		});
	}, [vizVisible]);
	useEffect(() => {
		if (typeof document === "undefined") return;
		const prevHtmlOverflow = document.documentElement.style.overflow;
		const prevBodyOverflow = document.body.style.overflow;
		if (vizVisible) {
			document.documentElement.style.overflow = "hidden";
			document.body.style.overflow = "hidden";
		} else {
			document.documentElement.style.overflow = prevHtmlOverflow;
			document.body.style.overflow = prevBodyOverflow;
		}
		return () => {
			document.documentElement.style.overflow = prevHtmlOverflow;
			document.body.style.overflow = prevBodyOverflow;
		};
	}, [vizVisible]);
	return null;
}
function MockReadBanner() {
	const { visible, setDismissed, quotaResetMonth } = useMockBanner();
	return /* @__PURE__ */ jsx(HintBanner, {
		visible,
		className: "mock-read-banner",
		closeClassName: "mock-read-banner-close",
		closeLabel: "Dismiss demo data notice",
		onDismiss: () => {
			setDismissed(true);
		},
		children: `API quota exceeded. Demo data until ${quotaResetMonth} 1.`
	});
}
function DuplicateSurveyBanner() {
	const [visible, setVisible] = useState(false);
	const timerRef = useRef(null);
	useEffect(() => {
		return listenForDuplicateSurveyNotice(() => {
			if (timerRef.current) window.clearTimeout(timerRef.current);
			setVisible(true);
			timerRef.current = window.setTimeout(() => {
				setVisible(false);
				timerRef.current = null;
			}, 5200);
		});
	}, []);
	useEffect(() => {
		return () => {
			if (timerRef.current) window.clearTimeout(timerRef.current);
		};
	}, []);
	return /* @__PURE__ */ jsx(HintBanner, {
		visible,
		className: "duplicate-survey-banner",
		children: /* @__PURE__ */ jsxs(Fragment, { children: [
			"You've already taken the survey.",
			/* @__PURE__ */ jsx("br", {}),
			"View now button at top will let you in."
		] })
	});
}
function rateLimitMessage(detail) {
	const fallback = detail.message ?? "Too many submissions. Please wait a moment and try again.";
	if (!detail.resetAt) return fallback;
	const resetMs = Date.parse(detail.resetAt);
	if (!Number.isFinite(resetMs)) return fallback;
	const remainingMs = resetMs - Date.now();
	if (remainingMs <= 0) return fallback;
	const remainingMinutes = Math.max(1, Math.ceil(remainingMs / 6e4));
	if (remainingMinutes <= 90) return `Too many submissions. Try again in about ${String(remainingMinutes)} min.`;
	return `Too many submissions. Try again after ${new Date(resetMs).toLocaleTimeString([], {
		hour: "numeric",
		minute: "2-digit"
	})}.`;
}
function RateLimitBanner() {
	const [topVisible, setTopVisible] = useState(false);
	const [bottomVisible, setBottomVisible] = useState(false);
	const [message, setMessage] = useState("Too many submissions. Please wait a moment and try again.");
	const topTimerRef = useRef(null);
	const bottomTimerRef = useRef(null);
	const hasShownPrimaryRef = useRef(false);
	useEffect(() => {
		return listenForRateLimitNotice((detail) => {
			const showPrimary = !hasShownPrimaryRef.current;
			if (topTimerRef.current) window.clearTimeout(topTimerRef.current);
			if (bottomTimerRef.current) window.clearTimeout(bottomTimerRef.current);
			setMessage(rateLimitMessage(detail));
			if (showPrimary) {
				hasShownPrimaryRef.current = true;
				setBottomVisible(false);
				setTopVisible(true);
				topTimerRef.current = window.setTimeout(() => {
					setTopVisible(false);
					topTimerRef.current = null;
				}, 7e3);
				return;
			}
			setTopVisible(false);
			setBottomVisible(true);
			bottomTimerRef.current = window.setTimeout(() => {
				setBottomVisible(false);
				bottomTimerRef.current = null;
			}, 5200);
		});
	}, []);
	useEffect(() => {
		return () => {
			if (topTimerRef.current) window.clearTimeout(topTimerRef.current);
			if (bottomTimerRef.current) window.clearTimeout(bottomTimerRef.current);
		};
	}, []);
	return /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsx(HintBanner, {
		visible: topVisible,
		className: "rate-limit-banner",
		closeLabel: "Dismiss rate limit notice",
		onDismiss: () => {
			if (topTimerRef.current) {
				window.clearTimeout(topTimerRef.current);
				topTimerRef.current = null;
			}
			setTopVisible(false);
		},
		children: message
	}), /* @__PURE__ */ jsx(HintBanner, {
		visible: bottomVisible,
		className: "rate-limit-retry-banner",
		children: message
	})] });
}
//#endregion
//#region src/app/error-boundary.tsx
var ErrorBoundary = class extends Component {
	constructor(..._args) {
		super(..._args);
		this.state = { crashed: false };
	}
	static getDerivedStateFromError() {
		return { crashed: true };
	}
	componentDidCatch(error, info) {
		console.error(`[ErrorBoundary${this.props.name ? ` "${this.props.name}"` : ""}] Uncaught error:`, error, info.componentStack);
		import("./assets/sentry-oP-Gtss4.mjs").then(({ captureException }) => {
			captureException(error, {
				contexts: { react: { componentStack: info.componentStack ?? "" } },
				tags: { boundary: this.props.name ?? "unknown" }
			});
		}).catch((err) => {
			console.warn("[ErrorBoundary] Sentry capture failed:", err);
		});
	}
	render() {
		if (this.state.crashed) return this.props.fallback ?? null;
		return this.props.children;
	}
};
//#endregion
//#region src/app/main.tsx
var QuestionnaireEntry = React.lazy(() => import("./assets/QuestionnaireEntry-D3thISd5.mjs"));
var GraphBGDark = React.lazy(() => import("./assets/system-color-CfYOF6_7.mjs"));
var AppInner = () => {
	const { vizVisible, questionnaireOpen, cityPanelOpen, animationVisible } = useUiFlow();
	return /* @__PURE__ */ jsxs("main", {
		id: "main-content",
		className: "app-content",
		children: [
			/* @__PURE__ */ jsxs(ClientOnly, { children: [
				/* @__PURE__ */ jsx(AppBrowserPolicies, {
					questionnaireOpen,
					vizVisible
				}),
				/* @__PURE__ */ jsx(MockReadBanner, {}),
				/* @__PURE__ */ jsx(RateLimitBanner, {}),
				/* @__PURE__ */ jsx(DuplicateSurveyBanner, {}),
				/* @__PURE__ */ jsx(DeferredGraphPreloader, {}),
				/* @__PURE__ */ jsx(DeferredGamificationPreloader, {})
			] }),
			vizVisible && /* @__PURE__ */ jsx(ClientOnly, { children: /* @__PURE__ */ jsx(Suspense, {
				fallback: null,
				children: /* @__PURE__ */ jsx(GraphBGDark, {})
			}) }),
			/* @__PURE__ */ jsx(Navigation, {}),
			!vizVisible && !animationVisible && !cityPanelOpen && !questionnaireOpen && /* @__PURE__ */ jsx("div", {
				className: "welcome-title-layer",
				children: /* @__PURE__ */ jsx("h1", {
					className: "welcome-title",
					children: "Butterfly Effect"
				})
			}),
			!vizVisible && !animationVisible && !cityPanelOpen && !questionnaireOpen && /* @__PURE__ */ jsx(ClientOnly, { children: /* @__PURE__ */ jsx(ErrorBoundary, {
				name: "CanvasEntry",
				children: /* @__PURE__ */ jsx(CanvasEntry, { visible: true })
			}) }),
			!vizVisible && !animationVisible && !cityPanelOpen && questionnaireOpen && /* @__PURE__ */ jsx(ClientOnly, { children: /* @__PURE__ */ jsx(ErrorBoundary, {
				name: "QuestionnaireEntry",
				children: /* @__PURE__ */ jsx(Suspense, {
					fallback: null,
					children: /* @__PURE__ */ jsx(QuestionnaireEntry, { visible: true })
				})
			}) }),
			cityPanelOpen && /* @__PURE__ */ jsx(ClientOnly, { children: /* @__PURE__ */ jsx(ErrorBoundary, {
				name: "CityOverlay",
				children: /* @__PURE__ */ jsx(CityOverlay, { open: true })
			}) }),
			vizVisible && /* @__PURE__ */ jsx(ClientOnly, { children: /* @__PURE__ */ jsx("div", {
				className: "graph-wrapper visible",
				children: /* @__PURE__ */ jsx(ErrorBoundary, {
					name: "DataVisualization",
					children: /* @__PURE__ */ jsx(VisualizationPage, {})
				})
			}) }),
			/* @__PURE__ */ jsx("div", {
				className: `user-flow${questionnaireOpen ? " questionnaire-active" : ""}${vizVisible ? " graph-active" : ""}`,
				children: /* @__PURE__ */ jsx(ErrorBoundary, {
					name: "Survey",
					children: /* @__PURE__ */ jsx(Survey, {})
				})
			})
		]
	});
};
var AppShell = () => /* @__PURE__ */ jsx(AppProvider, { children: /* @__PURE__ */ jsx(AppInner, {}) });
//#endregion
//#region src/server-rendering/entry-server.tsx
function ServerApp() {
	return /* @__PURE__ */ jsx(AppShell, {});
}
//#endregion
export { deviceType as A, makeRandomId as C, enableMockReadFallback as D, updateMockSoloMessage as E, useCanvasRuntime as F, CheckIcon as M, useOptionalPreferences as N, shouldUseMockReads as O, usePreferences as P, isWriteApiEditToken as S, ServerApp, subscribeMockSurveyData as T, CHOOSE_STUDENT as _, useTransientFlag as a, useGraphPickerData as b, CloseIcon as c, useWindowWidth as d, DEFAULT_VIEWPORT_WIDTH as f, CHOOSE_STAFF as g, isTabletWidth as h, HintBanner as i, getViewportSize$1 as j, subscribeMockReadMode as k, desktopGraphToolsOffsetPx as l, isMobileWidth as m, WidgetSectionNav as n, GraphDataProvider as o, VIEWPORT_BREAKPOINTS as p, PlayPauseIcon as r, useSharedGraphData as s, EngineHost as t, tabletGraphToolsYOffsetPx as u, GO_BACK as v, makeWriteApiError as w, getClientId as x, titleFromId as y };

//# sourceMappingURL=entry-server.mjs.map