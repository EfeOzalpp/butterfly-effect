(function() {
	try {
		var e = "undefined" != typeof window ? window : "undefined" != typeof global ? global : "undefined" != typeof globalThis ? globalThis : "undefined" != typeof self ? self : {};
		e.SENTRY_RELEASE = { id: "131decce1f878a04c070a93aabe3e016cfcc66cb" };
		var n = new e.Error().stack;
		n && (e._sentryDebugIds = e._sentryDebugIds || {}, e._sentryDebugIds[n] = "7d131b34-e453-4f9e-be65-45ee735ad606", e._sentryDebugIdIdentifier = "sentry-dbid-7d131b34-e453-4f9e-be65-45ee735ad606");
	} catch (e) {}
})();
import { d as useIdentity, l as useSurveyData, n as avgWeightOf, s as useUiFlow, t as useRelativeScores } from "./useRelativeScore-DD8ox_AN.mjs";
import { P as usePreferences, b as useGraphPickerData, n as WidgetSectionNav, y as titleFromId } from "../entry-server.mjs";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Fragment, jsx, jsxs } from "react/jsx-runtime";
//#region src/navigation/bottom/widgets/bargraph/EmptyArt.tsx
function EmptyDust({ className = "" }) {
	return /* @__PURE__ */ jsxs("svg", {
		className,
		width: 80,
		height: 80,
		viewBox: "0 0 80 80",
		fill: "none",
		stroke: "currentColor",
		strokeWidth: 1.5,
		strokeLinecap: "round",
		strokeLinejoin: "round",
		role: "img",
		"aria-label": "Empty dust particles",
		children: [
			/* @__PURE__ */ jsx("circle", {
				cx: 20,
				cy: 25,
				r: 2
			}),
			/* @__PURE__ */ jsx("circle", {
				cx: 40,
				cy: 18,
				r: 1.5,
				opacity: .8
			}),
			/* @__PURE__ */ jsx("circle", {
				cx: 60,
				cy: 30,
				r: 2,
				opacity: .6
			}),
			/* @__PURE__ */ jsx("circle", {
				cx: 28,
				cy: 50,
				r: 1.5,
				opacity: .7
			}),
			/* @__PURE__ */ jsx("circle", {
				cx: 50,
				cy: 55,
				r: 2,
				opacity: .9
			}),
			/* @__PURE__ */ jsx("circle", {
				cx: 36,
				cy: 70,
				r: 1,
				opacity: .5
			}),
			/* @__PURE__ */ jsx("circle", {
				cx: 62,
				cy: 65,
				r: 1.5,
				opacity: .6
			}),
			/* @__PURE__ */ jsx("circle", {
				cx: 18,
				cy: 62,
				r: 1,
				opacity: .4
			}),
			/* @__PURE__ */ jsx("path", {
				d: "M70 20l1.5 2.2L74 24l-2.5 1.8L70 28l-1.5-2.2L66 24l2.5-1.8L70 20z",
				opacity: .5
			})
		]
	});
}
//#endregion
//#region src/navigation/bottom/widgets/bargraph/index.tsx
function ordinalSuffix(n) {
	const mod100 = Math.abs(n) % 100;
	if (mod100 >= 11 && mod100 <= 13) return `${String(n)}th`;
	switch (Math.abs(n) % 10) {
		case 1: return `${String(n)}st`;
		case 2: return `${String(n)}nd`;
		case 3: return `${String(n)}rd`;
		default: return `${String(n)}th`;
	}
}
var orderedColors = [
	"green",
	"yellow",
	"red"
];
var percentValue = (value) => `${value.toFixed(4)}%`;
var AUTOPLAY_MS = 5e3;
function colorForScore(score) {
	if (score <= 50) return "red";
	if (score <= 66) return "yellow";
	return "green";
}
function markerFractionInBucket(rank, categories) {
	const greenEnd = categories.green;
	const yellowEnd = greenEnd + categories.yellow;
	if (rank <= greenEnd) {
		const count = Math.max(1, categories.green);
		return {
			color: "green",
			fraction: Math.max(0, Math.min(1, (greenEnd - rank + .5) / count))
		};
	}
	if (rank <= yellowEnd) {
		const count = Math.max(1, categories.yellow);
		return {
			color: "yellow",
			fraction: Math.max(0, Math.min(1, (yellowEnd - rank + .5) / count))
		};
	}
	const count = Math.max(1, categories.red);
	const totalEnd = yellowEnd + categories.red;
	return {
		color: "red",
		fraction: Math.max(0, Math.min(1, (totalEnd - rank + .5) / count))
	};
}
function BarGraph({ navOutsidePanel = false, panelClassName, paused, onPausedChange } = {}) {
	const { darkMode } = usePreferences();
	const { hasCompletedSurvey } = useUiFlow();
	const { myEntryId } = useIdentity();
	const { allRows, loading, section, sectionSelectionVersion } = useSurveyData();
	const { ALL_LABELS, MAIN_OPTS, STUDENT_OPTS, STAFF_OPTS, counts } = useGraphPickerData(section);
	const [animationState, setAnimationState] = useState(false);
	const [animateBars, setAnimateBars] = useState(false);
	const [internalPaused, setInternalPaused] = useState(true);
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
			label: ALL_LABELS.get(localSection) ?? titleFromId(localSection)
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
	const safeData = useMemo(() => {
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
	const dataById = useMemo(() => {
		const map = /* @__PURE__ */ new Map();
		for (const item of safeData) if (item._id) map.set(item._id, item);
		return map;
	}, [safeData]);
	const { getForId: getRelForId, getCountForId: getBelowCountForId } = useRelativeScores(safeData);
	const includesMe = useMemo(() => Boolean(myEntryId && dataById.has(myEntryId)), [dataById, myEntryId]);
	const canShowYou = Boolean(hasCompletedSurvey && myEntryId && includesMe);
	useEffect(() => {
		const timeout = window.setTimeout(() => {
			setAnimateBars(!loading);
		}, loading ? 0 : 10);
		return () => {
			window.clearTimeout(timeout);
		};
	}, [loading, safeData]);
	const categories = useMemo(() => {
		const out = {
			red: 0,
			yellow: 0,
			green: 0
		};
		for (const item of safeData) {
			const score = Math.floor(avgWeightOf(item) * 100);
			if (score <= 50) out.red += 1;
			else if (score <= 66) out.yellow += 1;
			else out.green += 1;
		}
		return out;
	}, [safeData]);
	const totalCount = safeData.length;
	const currentIndex = cycleSections.findIndex((item) => item.id === localSection);
	const sectionLabel = cycleSections.find((item) => item.id === localSection)?.label ?? ALL_LABELS.get(localSection) ?? (localSection ? titleFromId(localSection) : "Everyone");
	const stepSection = (delta) => {
		if (!cycleSections.length) return;
		setLocalSection(cycleSections[currentIndex >= 0 ? (currentIndex + delta + cycleSections.length) % cycleSections.length : 0].id);
	};
	useEffect(() => {
		if (effectivePaused || cycleSections.length <= 1) return;
		const timer = window.setInterval(() => {
			const activeIndex = cycleSections.findIndex((item) => item.id === localSection);
			setLocalSection(cycleSections[activeIndex >= 0 ? (activeIndex + 1) % cycleSections.length : 0].id);
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
	const rawYouPercentile = useMemo(() => canShowYou && myEntryId ? getRelForId(myEntryId) : 0, [
		canShowYou,
		getRelForId,
		myEntryId
	]);
	const youPercentile = useMemo(() => canShowYou && totalCount === 1 ? 100 : rawYouPercentile, [
		canShowYou,
		totalCount,
		rawYouPercentile
	]);
	const youRank = useMemo(() => {
		if (!canShowYou || totalCount === 0) return null;
		if (totalCount === 1) return 1;
		const below = myEntryId ? getBelowCountForId(myEntryId) : 0;
		return Math.max(1, Math.min(totalCount, totalCount - below));
	}, [
		canShowYou,
		getBelowCountForId,
		myEntryId,
		totalCount
	]);
	const youAbsoluteBar = useMemo(() => {
		if (!canShowYou) return null;
		const me = myEntryId ? dataById.get(myEntryId) : null;
		return colorForScore(me ? Math.floor(avgWeightOf(me) * 100) : 0);
	}, [
		canShowYou,
		dataById,
		myEntryId
	]);
	const rankMarker = useMemo(() => youRank === null ? null : markerFractionInBucket(youRank, categories), [categories, youRank]);
	useEffect(() => {
		if (animationState) return;
		const timeout = window.setTimeout(() => {
			setAnimationState(true);
		}, 200);
		return () => {
			window.clearTimeout(timeout);
		};
	}, [animationState]);
	if (!section) return /* @__PURE__ */ jsx("p", {
		className: "graph-loading",
		children: "Pick a section to begin."
	});
	const sectionNav = /* @__PURE__ */ jsx(WidgetSectionNav, {
		title: sectionLabel,
		paused: effectivePaused,
		className: "bar-graph-nav",
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
	if (loading) {
		const loadingBody = /* @__PURE__ */ jsx("div", {
			className: "bar-graph-container bar-graph-placeholder",
			"aria-hidden": "true",
			children: orderedColors.map((color, index) => /* @__PURE__ */ jsxs("div", {
				className: "bar-graph-bar",
				children: [/* @__PURE__ */ jsx("span", {
					className: "bar-graph-label",
					children: /* @__PURE__ */ jsx("p", { children: "-" })
				}), /* @__PURE__ */ jsx("div", {
					className: "bar-graph-divider",
					children: /* @__PURE__ */ jsx("div", {
						className: "bar-graph-fill bar-graph-fill-placeholder",
						style: { height: `${String([
							62,
							42,
							24
						][index])}%` }
					})
				})]
			}, color))
		});
		if (navOutsidePanel) return /* @__PURE__ */ jsxs(Fragment, { children: [sectionNav, /* @__PURE__ */ jsx("div", {
			className: panelClassName,
			children: loadingBody
		})] });
		return /* @__PURE__ */ jsxs(Fragment, { children: [sectionNav, loadingBody] });
	}
	if (safeData.length === 0) {
		const emptyBody = /* @__PURE__ */ jsx("div", {
			className: "empty-center bar-graph-empty",
			children: /* @__PURE__ */ jsxs("div", {
				className: `empty-card ${darkMode ? "is-dark" : "is-light"}`,
				children: [/* @__PURE__ */ jsx(EmptyDust, { className: "empty-icon floaty" }), /* @__PURE__ */ jsx("h4", { children: "Nothing yet..." })]
			})
		});
		if (navOutsidePanel) return /* @__PURE__ */ jsxs(Fragment, { children: [sectionNav, /* @__PURE__ */ jsx("div", {
			className: panelClassName,
			children: emptyBody
		})] });
		return /* @__PURE__ */ jsxs(Fragment, { children: [sectionNav, emptyBody] });
	}
	const graphBody = /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsx("div", {
		className: "bar-graph-container",
		children: orderedColors.map((color) => {
			const count = categories[color];
			const heightPercentage = count > 0 ? count / totalCount * 100 : 0;
			const markerHeightPercentage = rankMarker?.color === color ? heightPercentage * rankMarker.fraction : 0;
			const showMarkerInThisBar = canShowYou && (rankMarker?.color ?? youAbsoluteBar) === color && markerHeightPercentage > 0;
			return /* @__PURE__ */ jsxs("div", {
				className: "bar-graph-bar",
				children: [/* @__PURE__ */ jsx("span", {
					className: "bar-graph-label",
					children: /* @__PURE__ */ jsx("p", { children: count === 0 ? "-" : count === 1 ? "1 Person" : `${String(count)} People` })
				}), /* @__PURE__ */ jsxs("div", {
					className: "bar-graph-divider",
					children: [showMarkerInThisBar && animationState && animateBars && /* @__PURE__ */ jsxs("div", {
						className: "percentage-section",
						style: { height: percentValue(Math.min(markerHeightPercentage, heightPercentage)) },
						children: [/* @__PURE__ */ jsx("div", {
							className: "percentage-line",
							"aria-hidden": "true"
						}), /* @__PURE__ */ jsxs("div", {
							className: "percentage-indicator",
							children: [/* @__PURE__ */ jsx("p", {
								className: "percentage-indicator-title",
								children: "You're"
							}), /* @__PURE__ */ jsx("p", {
								className: "percentage-indicator-score",
								children: youRank === totalCount ? "Last" : ordinalSuffix(youRank ?? 1)
							})]
						})]
					}), count > 0 && /* @__PURE__ */ jsx("div", {
						className: `bar-graph-fill ${color}-animation`,
						style: { height: animateBars ? percentValue(heightPercentage) : "0%" }
					})]
				})]
			}, color);
		})
	}), canShowYou && /* @__PURE__ */ jsxs("h4", {
		className: `bar-graph-percentile-caption${animationState && animateBars ? "" : " caption-invisible"}`,
		children: [
			"Among ",
			/* @__PURE__ */ jsx("strong", { children: sectionLabel }),
			", you are the ",
			ordinalSuffix(youPercentile),
			" percentile."
		]
	})] });
	if (navOutsidePanel) return /* @__PURE__ */ jsxs(Fragment, { children: [sectionNav, /* @__PURE__ */ jsx("div", {
		className: panelClassName,
		children: graphBody
	})] });
	return /* @__PURE__ */ jsxs(Fragment, { children: [sectionNav, graphBody] });
}
//#endregion
export { BarGraph as default };

//# sourceMappingURL=bargraph-BhafEwDy.mjs.map