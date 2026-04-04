// graphPicker.jsx
import React, { useMemo, useRef, useState, useEffect, useCallback } from "react";
import "../../styles/graph-picker.css";

import { useInteraction } from "../../app/state/interaction-context";
import {
  useGraphPickerData,
  CHOOSE_STUDENT, CHOOSE_STAFF, GO_BACK,
  NON_PERSONAL_IDS, titleFromId,
} from "./useGraphPickerData";
import ExpandIcon from "../../assets/svg/expand/ExpandIcon";

export default function GraphPicker({
  value = "all",
  onChange,
  onOpenChange,
}: {
  value?: string;
  onChange?: (id: string) => void;
  onOpenChange?: (open: boolean) => void;
}) {
  const { setMenuOpen } = useInteraction();
  const { yourIdsSet, ALL_LABELS, STUDENT_OPTS, STAFF_OPTS, MAIN_OPTS, studentIdSet, staffIdSet, counts } =
    useGraphPickerData(value);

  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<null | "student" | "staff">(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [placement, setPlacement] = useState("down");

  const wrapperRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const VISIBLE_OPTS = useMemo(() => {
    if (mode === "student") return [{ id: GO_BACK, label: "Back" }, ...STUDENT_OPTS];
    if (mode === "staff") return [{ id: GO_BACK, label: "Back" }, ...STAFF_OPTS];
    return MAIN_OPTS;
  }, [mode, MAIN_OPTS, STUDENT_OPTS, STAFF_OPTS]);

  const triggerCoreLabel = useMemo(() => {
    if (open && mode === "student") return "Student Departments";
    if (open && mode === "staff") return "Institutional Departments";
    const base = ALL_LABELS.get(value) || "Everyone";
    const isPersonal = yourIdsSet.has(value) && !NON_PERSONAL_IDS.has(value);
    return isPersonal ? `${base} (you)` : base;
  }, [open, mode, value, ALL_LABELS, yourIdsSet]);

  useEffect(() => {
    setMenuOpen(open);
    onOpenChange?.(open);
  }, [open, setMenuOpen, onOpenChange]);

  useEffect(() => {
    if (!open) setMode(null);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onDocPointerDown = (e: PointerEvent) => {
      if (!wrapperRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", onDocPointerDown, true);
    return () => document.removeEventListener("pointerdown", onDocPointerDown, true);
  }, [open]);

  useEffect(() => {
    const computePlacement = () => {
      if (!buttonRef.current) return;
      const rect = buttonRef.current.getBoundingClientRect();
      const viewportH = window.innerHeight || document.documentElement.clientHeight;
      const spaceBelow = viewportH - rect.bottom;
      const estimatedListHeight = Math.min(300, VISIBLE_OPTS.length * 44 + 12);
      setPlacement(spaceBelow >= estimatedListHeight ? "down" : "up");
    };

    if (open) computePlacement();

    const onWin = () => open && computePlacement();
    window.addEventListener("resize", onWin);
    window.addEventListener("scroll", onWin, true);
    return () => {
      window.removeEventListener("resize", onWin);
      window.removeEventListener("scroll", onWin, true);
    };
  }, [open, VISIBLE_OPTS.length]);

  useEffect(() => {
    setActiveIndex((idx) => Math.min(Math.max(idx, 0), Math.max(0, VISIBLE_OPTS.length - 1)));
  }, [VISIBLE_OPTS.length]);

  useEffect(() => {
    if (!open) return;
    const el = listRef.current;
    if (!el) return;
    const stopProp = (e: Event) => e.stopPropagation();
    el.addEventListener("wheel", stopProp, { passive: true });
    el.addEventListener("touchstart", stopProp, { passive: true });
    el.addEventListener("touchmove", stopProp, { passive: true });
    return () => {
      el.removeEventListener("wheel", stopProp);
      el.removeEventListener("touchstart", stopProp);
      el.removeEventListener("touchmove", stopProp);
    };
  }, [open]);

  const moveActive = useCallback(
    (delta: number) => setActiveIndex((idx) => (idx + delta + VISIBLE_OPTS.length) % VISIBLE_OPTS.length),
    [VISIBLE_OPTS.length]
  );

  const chooseIndex = useCallback(
    (idx: number) => {
      const opt = VISIBLE_OPTS[idx];
      if (!opt) return;
      if (opt.id === CHOOSE_STUDENT) { setMode("student"); return; }
      if (opt.id === CHOOSE_STAFF) { setMode("staff"); return; }
      if (opt.id === GO_BACK) { setMode(null); return; }
      setMode(null);
      setOpen(false);
      onChange?.(opt.id);
      buttonRef.current?.focus();
    },
    [VISIBLE_OPTS, onChange]
  );

  const onTriggerKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") { e.preventDefault(); if (!open) setOpen(true); moveActive(1); }
    else if (e.key === "ArrowUp") { e.preventDefault(); if (!open) setOpen(true); moveActive(-1); }
    else if (e.key === "Enter" || e.key === " ") { e.preventDefault(); if (!open) setOpen(true); else chooseIndex(activeIndex); }
    else if (e.key === "Escape") { setOpen(false); }
  };

  const onListKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") { e.preventDefault(); moveActive(1); }
    else if (e.key === "ArrowUp") { e.preventDefault(); moveActive(-1); }
    else if (e.key === "Home") { e.preventDefault(); setActiveIndex(0); }
    else if (e.key === "End") { e.preventDefault(); setActiveIndex(VISIBLE_OPTS.length - 1); }
    else if (e.key === "Enter" || e.key === " ") { e.preventDefault(); chooseIndex(activeIndex); }
    else if (e.key === "Escape") { e.preventDefault(); setOpen(false); buttonRef.current?.focus(); }
  };

  const listboxId = "gp-listbox";

  return (
    <div ref={wrapperRef} className="gp-picker">
      <div
        ref={buttonRef}
        role="combobox"
        aria-haspopup="listbox"
        aria-owns={listboxId}
        aria-expanded={open}
        aria-controls={listboxId}
        aria-activedescendant={VISIBLE_OPTS[activeIndex] ? `gp-opt-${VISIBLE_OPTS[activeIndex].id}` : undefined}
        className={`gp-trigger ${open ? "is-open" : ""}`}
        onClick={() => setOpen((v) => !v)}
        onKeyDown={onTriggerKeyDown}
        tabIndex={0}
      >
        <span className="gp-trigger-label"><h4>{triggerCoreLabel}</h4></span>
        <span className="gp-trigger-chevron" aria-hidden>
          <ExpandIcon expanded={open} className="section-chevron-svg ui-icon" />
        </span>
      </div>

      <div
        className={`gp-listbox-shell ${placement === "down" ? "drop-down" : "drop-up"}${open ? " is-open" : ""}`}
        aria-hidden={!open}
      >
        <div className="gp-listbox-clip">
          <div
            ref={listRef}
            id={listboxId}
            role="listbox"
            className="gp-listbox"
            tabIndex={-1}
            onKeyDown={onListKeyDown}
          >
            {VISIBLE_OPTS.map((opt, idx) => {
              const active = idx === activeIndex;
              const isBack = opt.id === GO_BACK;
              const isChooser = opt.id === CHOOSE_STUDENT || opt.id === CHOOSE_STAFF;
              const isStudentChooser = opt.id === CHOOSE_STUDENT;
              const isStaffChooser = opt.id === CHOOSE_STAFF;
              const showCount = !(isBack || isChooser);
              const n = counts?.[opt.id] ?? 0;
              const isPersonal = yourIdsSet.has(opt.id) && !NON_PERSONAL_IDS.has(opt.id);

              return (
                <div
                  id={`gp-opt-${opt.id}`}
                  key={opt.id}
                  role="option"
                  aria-selected={value === opt.id}
                  className={`gp-option${active ? " is-active" : ""}${value === opt.id ? " is-selected" : ""}${isStudentChooser ? " gp-option--student-chooser" : ""}${isStaffChooser ? " gp-option--staff-chooser" : ""}${isBack ? " gp-option--back" : ""}`}
                  onMouseEnter={() => setActiveIndex(idx)}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => chooseIndex(idx)}
                >
                  {isBack ? (
                    <>
                      <span className="gp-back-icon" aria-hidden>
                        <svg className="ui-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                          <polyline points="15 6 9 12 15 18" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </span>
                      <span className="gp-label">Back</span>
                    </>
                  ) : isChooser ? (
                    <>
                      <span className="gp-label-wrap">
                        <span className="gp-label">{opt.label}</span>
                        {(() => {
                          const set = opt.id === CHOOSE_STUDENT ? studentIdSet : staffIdSet;
                          if (!set.has(value)) return null;
                          return (
                            <span className="gp-selected-child">
                              {ALL_LABELS.get(value) ?? titleFromId(value)}
                            </span>
                          );
                        })()}
                      </span>
                      <span className="gp-chooser-icon" aria-hidden>
                        <svg className="ui-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                          <polyline points="9 6 15 12 9 18" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </span>
                    </>
                  ) : (
                    <>
                      <span className="gp-label">
                        {ALL_LABELS.get(opt.id) ?? titleFromId(opt.id)}
                        {isPersonal && <span className="gp-you"> (you)</span>}
                      </span>
                      {showCount && <span className="gp-count">({n})</span>}
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
