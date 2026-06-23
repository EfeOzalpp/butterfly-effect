(function() {
	try {
		var e = "undefined" != typeof window ? window : "undefined" != typeof global ? global : "undefined" != typeof globalThis ? globalThis : "undefined" != typeof self ? self : {};
		e.SENTRY_RELEASE = { id: "131decce1f878a04c070a93aabe3e016cfcc66cb" };
		var n = new e.Error().stack;
		n && (e._sentryDebugIds = e._sentryDebugIds || {}, e._sentryDebugIds[n] = "fd4c2974-2af1-48e2-852c-499d6af522e1", e._sentryDebugIdIdentifier = "sentry-dbid-fd4c2974-2af1-48e2-852c-499d6af522e1");
	} catch (e) {}
})();
import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import { jsx, jsxs } from "react/jsx-runtime";
//#region src/onboarding/section-picker/index.tsx
function isSectionHeader(item) {
	return item?.type === "header";
}
function normalizeSectionItem(item) {
	return isSectionHeader(item) ? item : {
		...item,
		type: "option"
	};
}
function SectionPickerIntro({ value, onChange, onBegin, error, sections = [], placeholderOverride, titleOverride, onOpenChange }) {
	const titleId = useId();
	const helpId = useId();
	const errorId = useId();
	const hasHeaders = useMemo(() => sections.some(isSectionHeader), [sections]);
	const optionsWithHeaders = useMemo(() => {
		return sections.map(normalizeSectionItem);
	}, [sections]);
	const baseFocusable = useMemo(() => {
		const out = [];
		optionsWithHeaders.forEach((item, idx) => {
			if (!isSectionHeader(item)) out.push({
				...item,
				__listIndex: idx
			});
		});
		return out;
	}, [optionsWithHeaders]);
	const [open, setOpen] = useState(false);
	const [search, setSearch] = useState("");
	const [activeIndex, setActiveIndex] = useState(0);
	const wrapperRef = useRef(null);
	const inputRef = useRef(null);
	const listRef = useRef(null);
	const listboxId = "section-listbox";
	const openedByPointer = useRef(false);
	const outsideTouchRef = useRef({
		active: false,
		moved: false,
		startX: 0,
		startY: 0
	});
	const closePicker = useCallback(() => {
		setOpen(false);
		window.setTimeout(() => {
			inputRef.current?.blur();
		}, 0);
	}, []);
	const current = useMemo(() => baseFocusable.find((option) => option.value === value) ?? null, [baseFocusable, value]);
	const filteredFocusable = useMemo(() => {
		const q = search.trim().toLowerCase();
		if (!q) return baseFocusable;
		return baseFocusable.filter((option) => {
			const labelMatch = option.label.toLowerCase().includes(q);
			const valueMatch = option.value.toLowerCase().includes(q);
			const aliasMatch = (option.aliases ?? []).some((alias) => alias.toLowerCase().includes(q));
			return labelMatch || valueMatch || aliasMatch;
		});
	}, [baseFocusable, search]);
	const displayedList = useMemo(() => {
		if (!hasHeaders) return filteredFocusable;
		const filteredSet = new Set(filteredFocusable.map((option) => option.__listIndex));
		const out = [];
		let i = 0;
		while (i < optionsWithHeaders.length) {
			const item = optionsWithHeaders[i];
			if (isSectionHeader(item)) {
				let j = i + 1, any = false;
				while (j < optionsWithHeaders.length && !isSectionHeader(optionsWithHeaders[j])) {
					if (filteredSet.has(j)) {
						any = true;
						break;
					}
					j++;
				}
				if (any) {
					out.push(item);
					let k = i + 1;
					while (k < optionsWithHeaders.length && !isSectionHeader(optionsWithHeaders[k])) {
						const option = optionsWithHeaders[k];
						if (filteredSet.has(k)) out.push(option);
						k++;
					}
					i = k;
					continue;
				} else {
					let k = i + 1;
					while (k < optionsWithHeaders.length && !isSectionHeader(optionsWithHeaders[k])) k++;
					i = k;
					continue;
				}
			} else {
				if (filteredSet.has(i)) out.push(item);
				i++;
			}
		}
		return out;
	}, [
		hasHeaders,
		filteredFocusable,
		optionsWithHeaders
	]);
	const renderedFocusable = useMemo(() => {
		const out = [];
		displayedList.forEach((item, idx) => {
			if (!isSectionHeader(item)) out.push({
				...item,
				__renderIndex: idx
			});
		});
		return out;
	}, [displayedList]);
	useEffect(() => {
		onOpenChange?.(open);
	}, [open, onOpenChange]);
	useEffect(() => {
		if (!open) return;
		const onDocMouseDown = (e) => {
			if (!wrapperRef.current?.contains(e.target)) closePicker();
		};
		const onDocTouchStart = (e) => {
			const touch = e.changedTouches.item(0);
			if (!touch) return;
			outsideTouchRef.current = {
				active: !!!wrapperRef.current?.contains(e.target),
				moved: false,
				startX: touch.clientX,
				startY: touch.clientY
			};
		};
		const onDocTouchMove = (e) => {
			if (!outsideTouchRef.current.active) return;
			const touch = e.changedTouches.item(0);
			if (!touch) return;
			const dx = Math.abs(touch.clientX - outsideTouchRef.current.startX);
			const dy = Math.abs(touch.clientY - outsideTouchRef.current.startY);
			if (dx > 10 || dy > 10) outsideTouchRef.current.moved = true;
		};
		const onDocTouchEnd = () => {
			if (outsideTouchRef.current.active && !outsideTouchRef.current.moved) closePicker();
			outsideTouchRef.current.active = false;
			outsideTouchRef.current.moved = false;
		};
		const onDocTouchCancel = () => {
			outsideTouchRef.current.active = false;
			outsideTouchRef.current.moved = false;
		};
		document.addEventListener("mousedown", onDocMouseDown);
		document.addEventListener("touchstart", onDocTouchStart, { passive: true });
		document.addEventListener("touchmove", onDocTouchMove, { passive: true });
		document.addEventListener("touchend", onDocTouchEnd);
		document.addEventListener("touchcancel", onDocTouchCancel);
		return () => {
			document.removeEventListener("mousedown", onDocMouseDown);
			document.removeEventListener("touchstart", onDocTouchStart);
			document.removeEventListener("touchmove", onDocTouchMove);
			document.removeEventListener("touchend", onDocTouchEnd);
			document.removeEventListener("touchcancel", onDocTouchCancel);
		};
	}, [open, closePicker]);
	const maxActiveIndex = Math.max(0, renderedFocusable.length - 1);
	const safeActiveIndex = Math.min(Math.max(activeIndex, 0), maxActiveIndex);
	const openPicker = useCallback(() => {
		if (openedByPointer.current) setSearch("");
		const selectedIndex = renderedFocusable.findIndex((option) => option.value === value);
		if (selectedIndex >= 0) setActiveIndex(selectedIndex);
		setOpen(true);
		openedByPointer.current = false;
	}, [renderedFocusable, value]);
	const moveActive = useCallback((delta) => {
		if (!renderedFocusable.length) return;
		setActiveIndex((idx) => (idx + delta + renderedFocusable.length) % renderedFocusable.length);
	}, [renderedFocusable.length]);
	const chooseIndex = useCallback((focusIdx) => {
		if (focusIdx < 0 || focusIdx >= renderedFocusable.length) return;
		const opt = renderedFocusable[focusIdx];
		onChange(opt.value);
		setSearch("");
		closePicker();
	}, [
		renderedFocusable,
		onChange,
		closePicker
	]);
	const activeRenderedId = open && renderedFocusable[safeActiveIndex] ? `opt-${renderedFocusable[safeActiveIndex].value}` : void 0;
	const placeholderText = placeholderOverride ?? (current ? current.label : "MassArt Dept...");
	const describedBy = [helpId, error ? errorId : void 0].filter((id) => Boolean(id)).join(" ");
	return /* @__PURE__ */ jsx("section", {
		className: "survey survey-step section-select",
		ref: wrapperRef,
		children: /* @__PURE__ */ jsxs("div", {
			className: "continue",
			children: [
				/* @__PURE__ */ jsx("h3", {
					className: "section-title",
					id: titleId,
					children: titleOverride ?? "Select Your Department"
				}),
				/* @__PURE__ */ jsx("p", {
					id: helpId,
					style: {
						position: "absolute",
						width: 1,
						height: 1,
						padding: 0,
						margin: -1,
						overflow: "hidden",
						clip: "rect(0, 0, 0, 0)",
						whiteSpace: "nowrap",
						border: 0
					},
					children: "Type to filter departments, then use arrow keys to move through the list and Enter to select."
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "section-picker",
					children: [/* @__PURE__ */ jsxs("div", {
						className: `section-combobox ${open ? "is-open" : ""}`,
						onMouseDown: () => {
							openedByPointer.current = true;
						},
						onTouchStart: () => {
							openedByPointer.current = true;
						},
						onClick: () => {
							openPicker();
						},
						children: [/* @__PURE__ */ jsx("input", {
							ref: inputRef,
							id: "section-combobox-input",
							type: "text",
							className: "section-input",
							role: "combobox",
							"aria-labelledby": titleId,
							"aria-haspopup": "listbox",
							"aria-owns": listboxId,
							"aria-expanded": open,
							"aria-controls": listboxId,
							"aria-activedescendant": activeRenderedId,
							"aria-describedby": describedBy || void 0,
							"aria-invalid": !!error,
							placeholder: placeholderText,
							value: open ? search : current?.label ?? "",
							inputMode: "search",
							autoCapitalize: "none",
							onFocus: () => {
								openPicker();
							},
							onChange: (e) => {
								openedByPointer.current = false;
								if (!open) openPicker();
								setSearch(e.target.value);
							},
							onKeyDown: (e) => {
								openedByPointer.current = false;
								if (e.key === "ArrowDown") {
									e.preventDefault();
									if (!open) openPicker();
									moveActive(1);
								} else if (e.key === "ArrowUp") {
									e.preventDefault();
									if (!open) openPicker();
									moveActive(-1);
								} else if (e.key === "Home") {
									e.preventDefault();
									setActiveIndex(0);
								} else if (e.key === "End") {
									e.preventDefault();
									setActiveIndex(Math.max(0, renderedFocusable.length - 1));
								} else if (e.key === "Enter") {
									e.preventDefault();
									if (open) chooseIndex(safeActiveIndex);
									else openPicker();
								} else if (e.key === "Escape") {
									e.preventDefault();
									closePicker();
								}
							},
							autoComplete: "off",
							spellCheck: false
						}), /* @__PURE__ */ jsx("span", {
							className: "section-chevron",
							"aria-hidden": true,
							children: /* @__PURE__ */ jsx("svg", {
								className: "section-chevron-svg ui-icon",
								viewBox: "0 0 24 24",
								fill: "none",
								stroke: "currentColor",
								children: /* @__PURE__ */ jsx("polyline", {
									points: "6 9 12 15 18 9",
									strokeWidth: "2.5",
									strokeLinecap: "round",
									strokeLinejoin: "round"
								})
							})
						})]
					}), /* @__PURE__ */ jsx("div", {
						className: `section-listbox-shell drop-down${open ? " is-open" : ""}`,
						"aria-hidden": !open,
						children: /* @__PURE__ */ jsx("div", {
							className: "section-listbox-clip",
							children: /* @__PURE__ */ jsxs("div", {
								ref: listRef,
								id: listboxId,
								role: "listbox",
								className: "section-listbox drop-down",
								tabIndex: -1,
								onKeyDown: (e) => {
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
										setActiveIndex(Math.max(0, renderedFocusable.length - 1));
									} else if (e.key === "Enter" || e.key === " ") {
										e.preventDefault();
										chooseIndex(safeActiveIndex);
									} else if (e.key === "Escape") {
										e.preventDefault();
										closePicker();
									}
								},
								children: [displayedList.length === 0 && /* @__PURE__ */ jsx("div", {
									className: "section-empty",
									role: "option",
									"aria-disabled": "true",
									"aria-selected": "false",
									children: "No matches"
								}), displayedList.map((item, idx) => {
									if (isSectionHeader(item)) return /* @__PURE__ */ jsx("span", {
										className: "section-group-header",
										role: "presentation",
										"aria-hidden": "true",
										children: item.label
									}, `hdr-${item.id}`);
									const selected = value === item.value;
									const isActive = renderedFocusable[safeActiveIndex]?.__renderIndex === idx;
									return /* @__PURE__ */ jsx("div", {
										id: `opt-${item.value}`,
										role: "option",
										"aria-selected": selected,
										className: "section-option" + (isActive ? " is-active" : "") + (selected ? " is-selected" : ""),
										onMouseEnter: () => {
											const focusIdx = renderedFocusable.findIndex((option) => option.__renderIndex === idx);
											if (focusIdx !== -1 && focusIdx !== safeActiveIndex) setActiveIndex(focusIdx);
										},
										onMouseDown: (e) => {
											e.preventDefault();
										},
										onClick: () => {
											const focusIdx = renderedFocusable.findIndex((option) => option.__renderIndex === idx);
											if (focusIdx >= 0) chooseIndex(focusIdx);
										},
										children: /* @__PURE__ */ jsx("span", {
											className: "section-label",
											children: item.label
										})
									}, item.value);
								})]
							})
						})
					})]
				}),
				error && /* @__PURE__ */ jsxs("div", {
					className: "error-container",
					id: errorId,
					role: "alert",
					"aria-live": "polite",
					children: [/* @__PURE__ */ jsx("p", { children: error }), !/section/i.test(error) && /* @__PURE__ */ jsx("p", {
						className: "email-tag",
						children: "Mail: eozalp@massart.edu"
					})]
				}),
				/* @__PURE__ */ jsx("div", {
					className: "button-wrap",
					children: /* @__PURE__ */ jsxs("button", {
						type: "button",
						className: "section-continue-button",
						onClick: onBegin,
						"aria-describedby": describedBy || void 0,
						children: [/* @__PURE__ */ jsx("span", {
							className: "section-continue-button__ghost",
							"aria-hidden": "true",
							children: /* @__PURE__ */ jsx("span", { children: "Continue" })
						}), /* @__PURE__ */ jsx("span", {
							className: "section-continue-button__inner",
							children: /* @__PURE__ */ jsx("span", { children: "Continue" })
						})]
					})
				})
			]
		})
	});
}
//#endregion
export { SectionPickerIntro as default };

//# sourceMappingURL=section-picker-0Ig7B2l-.mjs.map