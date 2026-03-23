import { useMemo, useCallback } from "react";
import { ROLE_SECTIONS } from "../../onboarding/section-picker/sections";
import { useSurveyData } from "../../app/state/survey-data-context";
import { useIdentity } from "../../app/state/identity-context";

export const SPECIAL = [
  { id: "all",          label: "Everyone" },
  { id: "all-massart",  label: "MassArt " },
  { id: "all-students", label: "All Students" },
  { id: "all-staff",    label: "All Faculty/Staff" },
  { id: "visitor",      label: "Visitors" },
];

export const CHOOSE_STUDENT = "__choose-student";
export const CHOOSE_STAFF   = "__choose-staff";
export const GO_BACK        = "__go-back";

const LEGACY_UMBRELLAS = [
  { id: "fine-arts",   label: "Fine Arts" },
  { id: "design",      label: "Design" },
  { id: "foundations", label: "Foundations" },
];

export const NON_PERSONAL_IDS = new Set([
  "all", "all-massart", "all-students", "all-staff",
  CHOOSE_STUDENT, CHOOSE_STAFF, GO_BACK,
]);

export function titleFromId(id: string) {
  if (!id) return "";
  return id.replace(/-/g, " ").replace(/\b\w/g, (m) => m.toUpperCase());
}

export function useGraphPickerData(value: string) {
  const { counts } = useSurveyData();
  const { mySection } = useIdentity();

  const yourIdsSet = useMemo(() => new Set(mySection ? [mySection] : []), [mySection]);

  const BASE_STUDENT = useMemo(() => {
    const base = ROLE_SECTIONS.student.map((s) => ({ id: s.value, label: s.label }));
    const have = new Set(base.map((x) => x.id));
    LEGACY_UMBRELLAS.forEach((u) => { if (!have.has(u.id)) base.push(u); });
    return base;
  }, []);

  const BASE_STAFF = useMemo(
    () => ROLE_SECTIONS.staff.map((s) => ({ id: s.value, label: s.label })),
    []
  );

  const ALL_LABELS = useMemo(() => {
    const list = [...SPECIAL, ...BASE_STUDENT, ...BASE_STAFF];
    const map = new Map(list.map((o) => [o.id, o.label]));
    [value, mySection].forEach((id) => {
      if (id && !map.has(id)) map.set(id, titleFromId(id));
    });
    return map;
  }, [BASE_STUDENT, BASE_STAFF, value, mySection]);

  const sortByCountThenAlpha = useCallback(
    (items: { id: string; label: string }[]) =>
      [...items].sort((a, b) => {
        const cb = counts?.[b.id] ?? 0;
        const ca = counts?.[a.id] ?? 0;
        if (cb !== ca) return cb - ca;
        return a.label.localeCompare(b.label, undefined, { sensitivity: "base" });
      }),
    [counts]
  );

  const STUDENT_OPTS = useMemo(() => sortByCountThenAlpha(BASE_STUDENT), [BASE_STUDENT, sortByCountThenAlpha]);
  const STAFF_OPTS   = useMemo(() => sortByCountThenAlpha(BASE_STAFF),   [BASE_STAFF, sortByCountThenAlpha]);

  const MAIN_OPTS = useMemo(
    () => [
      ...SPECIAL,
      { id: CHOOSE_STUDENT, label: "Student Departments" },
      { id: CHOOSE_STAFF,   label: "Institutional Departments" },
    ],
    []
  );

  const studentIdSet = useMemo(() => new Set(BASE_STUDENT.map((s) => s.id)), [BASE_STUDENT]);
  const staffIdSet   = useMemo(() => new Set(BASE_STAFF.map((s) => s.id)),   [BASE_STAFF]);

  return {
    yourIdsSet,
    ALL_LABELS,
    STUDENT_OPTS,
    STAFF_OPTS,
    MAIN_OPTS,
    studentIdSet,
    staffIdSet,
    counts,
    mySection,
  };
}
