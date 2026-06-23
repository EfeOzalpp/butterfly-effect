(function() {
	try {
		var e = "undefined" != typeof window ? window : "undefined" != typeof global ? global : "undefined" != typeof globalThis ? globalThis : "undefined" != typeof self ? self : {};
		e.SENTRY_RELEASE = { id: "131decce1f878a04c070a93aabe3e016cfcc66cb" };
		var n = new e.Error().stack;
		n && (e._sentryDebugIds = e._sentryDebugIds || {}, e._sentryDebugIds[n] = "f8f14a12-d4d4-42d1-86f9-651418e42b9f", e._sentryDebugIdIdentifier = "sentry-dbid-f8f14a12-d4d4-42d1-86f9-651418e42b9f");
	} catch (e) {}
})();
import { M as CheckIcon } from "../entry-server.mjs";
import { useMemo, useRef } from "react";
import { jsx, jsxs } from "react/jsx-runtime";
//#region src/onboarding/role-picker/index.tsx
var MASSART_ROLE_OPTIONS = [{
	val: "student",
	label: "MassArt Student"
}, {
	val: "staff",
	label: "Staff & Faculty"
}];
function SelectionIndicator({ selected }) {
	if (selected) return /* @__PURE__ */ jsx(CheckIcon, { className: "role-check-icon" });
	return /* @__PURE__ */ jsx("span", { className: "role-indicator-spacer" });
}
function RolePicker({ value, onChange, errorId }) {
	const roleIds = useMemo(() => ["visitor", ...MASSART_ROLE_OPTIONS.map((opt) => opt.val)], []);
	const optionRefs = useRef({});
	const handleKeyDown = (currentValue) => (e) => {
		if (e.key === "Enter" || e.key === " ") {
			e.preventDefault();
			onChange(currentValue);
			return;
		}
		if (e.key === "ArrowRight" || e.key === "ArrowDown") {
			e.preventDefault();
			const currentIndex = roleIds.indexOf(currentValue);
			if (currentIndex === -1) return;
			const nextValue = roleIds[(currentIndex + 1) % roleIds.length];
			onChange(nextValue);
			optionRefs.current[nextValue]?.focus();
			return;
		}
		if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
			e.preventDefault();
			const currentIndex = roleIds.indexOf(currentValue);
			if (currentIndex === -1) return;
			const nextValue = roleIds[(currentIndex - 1 + roleIds.length) % roleIds.length];
			onChange(nextValue);
			optionRefs.current[nextValue]?.focus();
			return;
		}
		if (e.key === "Home") {
			e.preventDefault();
			const first = roleIds[0];
			onChange(first);
			optionRefs.current[first]?.focus();
			return;
		}
		if (e.key === "End") {
			e.preventDefault();
			const last = roleIds[roleIds.length - 1];
			onChange(last);
			optionRefs.current[last]?.focus();
		}
	};
	return /* @__PURE__ */ jsx("div", {
		className: "radio-group",
		children: /* @__PURE__ */ jsxs("div", {
			role: "radiogroup",
			className: "radio-options",
			"aria-labelledby": "role-picker-label",
			"aria-describedby": errorId,
			children: [
				/* @__PURE__ */ jsx("div", {
					className: "role-tag role-tag--center",
					children: /* @__PURE__ */ jsx("span", {
						className: "role-label",
						id: "role-picker-label",
						children: "Select Your Role"
					})
				}),
				/* @__PURE__ */ jsxs("div", {
					ref: (node) => {
						optionRefs.current.visitor = node;
					},
					role: "radio",
					"aria-checked": value === "visitor",
					tabIndex: value === "visitor" ? 0 : -1,
					className: `input-part-inside radio-option${value === "visitor" ? " selected" : ""}`,
					onClick: () => {
						onChange("visitor");
					},
					onKeyDown: handleKeyDown("visitor"),
					children: [
						/* @__PURE__ */ jsx(SelectionIndicator, { selected: value === "visitor" }),
						/* @__PURE__ */ jsx("h4", { children: "Explorer..." }),
						/* @__PURE__ */ jsx("span", { className: "role-indicator-spacer" })
					]
				}),
				/* @__PURE__ */ jsx("div", { className: "role-separator" }),
				/* @__PURE__ */ jsx("div", {
					className: "role-group-options",
					children: MASSART_ROLE_OPTIONS.map((opt) => {
						const checked = value === opt.val;
						return /* @__PURE__ */ jsxs("div", {
							ref: (node) => {
								optionRefs.current[opt.val] = node;
							},
							role: "radio",
							"aria-checked": checked,
							tabIndex: checked ? 0 : -1,
							className: `input-part-inside radio-option radio-option--inset${checked ? " selected" : ""}`,
							onClick: () => {
								onChange(opt.val);
							},
							onKeyDown: handleKeyDown(opt.val),
							children: [
								/* @__PURE__ */ jsx(SelectionIndicator, { selected: checked }),
								/* @__PURE__ */ jsx("h4", { children: opt.label }),
								/* @__PURE__ */ jsx("span", { className: "role-indicator-spacer" })
							]
						}, opt.val);
					})
				})
			]
		})
	});
}
//#endregion
//#region src/onboarding/role-picker/role-step.tsx
var DISPLAY = {
	student: "Step In",
	staff: "Step In",
	visitor: "Let's Begin"
};
function RoleStep({ value, onChange, onNext, error }) {
	const isSelected = Boolean(value);
	const buttonLabel = value === "" ? "Start Exploring" : DISPLAY[value];
	const errorId = !isSelected && error ? "role-picker-error" : void 0;
	return /* @__PURE__ */ jsx("section", {
		className: "survey survey-step role-select",
		children: /* @__PURE__ */ jsxs("div", {
			className: "onboarding",
			children: [
				/* @__PURE__ */ jsx("h2", {
					className: "welcome-text",
					children: "Shape your digital world with your answers."
				}),
				/* @__PURE__ */ jsx(RolePicker, {
					value,
					onChange,
					errorId
				}),
				!isSelected && error && /* @__PURE__ */ jsx("div", {
					className: "error-container",
					id: errorId,
					role: "alert",
					"aria-live": "polite",
					children: /* @__PURE__ */ jsx("p", { children: "What option fits best?" })
				}),
				/* @__PURE__ */ jsx("div", {
					className: "button-wrap",
					children: /* @__PURE__ */ jsxs("button", {
						type: "button",
						className: `begin-button ${!isSelected ? "is-disabled" : ""} ${value === "staff" ? "is-staff" : ""}`,
						disabled: !isSelected,
						"aria-describedby": errorId,
						onClick: onNext,
						children: [/* @__PURE__ */ jsx("span", {
							className: "begin-button__ghost",
							"aria-hidden": "true",
							children: buttonLabel
						}), /* @__PURE__ */ jsx("span", {
							className: "begin-button__inner",
							children: buttonLabel
						})]
					})
				})
			]
		})
	});
}
//#endregion
export { RoleStep as default };

//# sourceMappingURL=role-step-CP3YkDzP.mjs.map