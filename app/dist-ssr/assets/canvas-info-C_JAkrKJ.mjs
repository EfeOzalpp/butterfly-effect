(function() {
	try {
		var e = "undefined" != typeof window ? window : "undefined" != typeof global ? global : "undefined" != typeof globalThis ? globalThis : "undefined" != typeof self ? self : {};
		e.SENTRY_RELEASE = { id: "131decce1f878a04c070a93aabe3e016cfcc66cb" };
		var n = new e.Error().stack;
		n && (e._sentryDebugIds = e._sentryDebugIds || {}, e._sentryDebugIds[n] = "97e1b97d-e3b5-4705-80e7-4a50d01d4184", e._sentryDebugIdIdentifier = "sentry-dbid-97e1b97d-e3b5-4705-80e7-4a50d01d4184");
	} catch (e) {}
})();
import "./shapes-BYH03xOX.mjs";
import { F as useCanvasRuntime, r as PlayPauseIcon, t as EngineHost } from "../entry-server.mjs";
import { useEffect, useRef, useState } from "react";
import { Fragment, jsx, jsxs } from "react/jsx-runtime";
//#region src/canvas-instances/SpotlightEntry.tsx
function SpotlightEntry({ visible = true, spotlight, liveAvg = .5 }) {
	return /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsx("div", {
		id: "spotlight-canvas-root",
		className: "canvas-info__spotlight-canvas"
	}), /* @__PURE__ */ jsx(EngineHost, {
		id: "spotlight",
		open: true,
		visible,
		liveAvg,
		spotlight,
		fog: false,
		shapeLightSource: {
			xK: .4,
			yK: .1,
			paletteClosenessK: .9
		}
	})] });
}
//#endregion
//#region src/onboarding/information/canvas-info.tsx
function CanvasInfo() {
	const { spotlightLiveAvg, setSpotlightLiveAvg, spotlight, previousSpotlight, nextSpotlight, toggleSpotlightPaused } = useCanvasRuntime();
	const asideRef = useRef(null);
	const [inView, setInView] = useState(false);
	useEffect(() => {
		const el = asideRef.current;
		if (!el || typeof IntersectionObserver === "undefined") {
			setInView(true);
			return;
		}
		const observer = new IntersectionObserver(([entry]) => {
			setInView(entry.isIntersecting);
		}, { threshold: .6 });
		observer.observe(el);
		return () => {
			observer.disconnect();
		};
	}, []);
	useEffect(() => {
		if (spotlight.paused || !inView) return;
		const id = window.setInterval(() => {
			nextSpotlight();
		}, 3e3);
		return () => {
			window.clearInterval(id);
		};
	}, [
		nextSpotlight,
		spotlight.index,
		spotlight.paused,
		inView
	]);
	return /* @__PURE__ */ jsxs("aside", {
		ref: asideRef,
		className: "onboarding-info canvas-info",
		"aria-label": "Canvas Engine information",
		children: [/* @__PURE__ */ jsx("section", {
			className: "canvas-info__slider",
			"aria-label": "Canvas Engine preview",
			children: /* @__PURE__ */ jsxs("div", {
				className: "canvas-info__spotlight-frame",
				children: [/* @__PURE__ */ jsx(SpotlightEntry, {
					spotlight,
					liveAvg: spotlightLiveAvg
				}), /* @__PURE__ */ jsxs("div", {
					className: "ui-icon-nav canvas-info__slider-controls",
					"aria-label": "Canvas Engine preview controls",
					children: [
						/* @__PURE__ */ jsxs("div", {
							className: "canvas-info__liveavg-control",
							children: [/* @__PURE__ */ jsx("div", {
								className: "canvas-info__liveavg-track",
								"aria-hidden": "true"
							}), /* @__PURE__ */ jsx("input", {
								className: "canvas-info__liveavg-slider",
								type: "range",
								min: "0",
								max: "1",
								step: "0.01",
								value: spotlightLiveAvg,
								"aria-label": "Preview intensity",
								onChange: (event) => {
									setSpotlightLiveAvg(Number(event.currentTarget.value));
								}
							})]
						}),
						/* @__PURE__ */ jsx("button", {
							type: "button",
							className: "ui-icon-nav-button canvas-info__slider-button",
							"aria-label": "Previous preview",
							onClick: previousSpotlight,
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
						/* @__PURE__ */ jsx("button", {
							type: "button",
							className: "ui-icon-nav-button canvas-info__slider-button canvas-info__slider-button--pause",
							"aria-pressed": spotlight.paused,
							"aria-label": spotlight.paused ? "Resume preview" : "Pause preview",
							onClick: toggleSpotlightPaused,
							children: /* @__PURE__ */ jsx(PlayPauseIcon, {
								mode: spotlight.paused ? "play" : "pause",
								className: "ui-icon"
							})
						}),
						/* @__PURE__ */ jsx("button", {
							type: "button",
							className: "ui-icon-nav-button canvas-info__slider-button",
							"aria-label": "Next preview",
							onClick: nextSpotlight,
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
						})
					]
				})]
			})
		}), /* @__PURE__ */ jsx("section", {
			className: "canvas-info__information",
			children: /* @__PURE__ */ jsxs("div", {
				className: "canvas-info-div",
				children: [
					/* @__PURE__ */ jsx("h3", {
						className: "canvas-info__eyebrow",
						children: "A custom engine for living scenes."
					}),
					/* @__PURE__ */ jsxs("p", {
						className: "canvas-info__copy",
						children: [/* @__PURE__ */ jsx("span", { children: "Butterfly Effect uses a Canvas2D rendering engine built for compositions with depth and motion." }), /* @__PURE__ */ jsx("span", { children: "Try it out for yourself in your projects, contribute on GitHub or feel free to reach out at efe.ozalp@canvas-engine.com." })]
					}),
					/* @__PURE__ */ jsx("div", {
						className: "canvas-info__actions",
						children: /* @__PURE__ */ jsxs("a", {
							className: "canvas-engine-link",
							href: "https://github.com/EfeOzalpp/canvas-engine",
							target: "_blank",
							rel: "noreferrer",
							"data-label": "Repository",
							children: [/* @__PURE__ */ jsx("span", {
								className: "canvas-engine-link__ghost",
								"aria-hidden": "true",
								children: "Repository"
							}), /* @__PURE__ */ jsx("span", {
								className: "canvas-engine-link__inner",
								children: "Repository"
							})]
						})
					})
				]
			})
		})]
	});
}
//#endregion
export { CanvasInfo as default };

//# sourceMappingURL=canvas-info-C_JAkrKJ.mjs.map