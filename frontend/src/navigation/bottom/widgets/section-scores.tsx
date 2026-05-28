import { useCallback, useEffect, useMemo, useState } from "react";
import { useSurveyData } from "../../../app/state/survey-data-context";
import PlayPauseIcon from "../../../assets/svg/play/PlayPauseIcon";
import { CHOOSE_STAFF, CHOOSE_STUDENT, GO_BACK, useGraphPickerData } from "../../gp-data";
import { BUTTON_QUESTIONS } from "../../../onboarding/questionnaire/button-input/button-questions";

interface LocalSectionState {
  sourceSection: string;
  value: string;
}

const Q_KEYS = ["q1", "q2", "q3", "q4", "q5"] as const;
const AUTOPLAY_MS = 5000;

export default function SectionScores() {
  const { allRows, section } = useSurveyData();
  const { ALL_LABELS, MAIN_OPTS, STUDENT_OPTS, STAFF_OPTS, counts } = useGraphPickerData(section);
  const [paused, setPaused] = useState(false);
  const [localSectionState, setLocalSectionState] = useState<LocalSectionState>({
    sourceSection: section,
    value: section,
  });
  const localSection =
    localSectionState.sourceSection === section ? localSectionState.value : section;

  const setLocalSection = useCallback((value: string) => {
    setLocalSectionState({ sourceSection: section, value });
  }, [section]);

  const cycleSections = useMemo(() => {
    const ordered = [...MAIN_OPTS, ...STUDENT_OPTS, ...STAFF_OPTS]
      .filter((opt) => opt.id !== GO_BACK && opt.id !== CHOOSE_STUDENT && opt.id !== CHOOSE_STAFF)
      .filter((opt, index, arr) => arr.findIndex((item) => item.id === opt.id) === index)
      .filter((opt) => (counts[opt.id] ?? 0) > 0 || opt.id === localSection);

    if (!ordered.length && localSection) {
      return [{ id: localSection, label: ALL_LABELS.get(localSection) ?? localSection }];
    }
    return ordered;
  }, [ALL_LABELS, MAIN_OPTS, STAFF_OPTS, STUDENT_OPTS, counts, localSection]);

  useEffect(() => {
    if (paused || cycleSections.length <= 1) return;
    const timer = window.setInterval(() => {
      const currentIndex = cycleSections.findIndex((item) => item.id === localSection);
      const nextIndex = currentIndex >= 0 ? (currentIndex + 1) % cycleSections.length : 0;
      setLocalSection(cycleSections[nextIndex].id);
    }, AUTOPLAY_MS);
    return () => { window.clearInterval(timer); };
  }, [cycleSections, paused, localSection, setLocalSection]);

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
  }, [STUDENT_OPTS, STAFF_OPTS, allRows, localSection]);

  const avgs = useMemo(
    () =>
      Q_KEYS.map((key) => {
        const vals = rowsForLocalSection
          .map((row) => row[key])
          .filter((v): v is number => typeof v === "number" && Number.isFinite(v));
        return vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : 0;
      }),
    [rowsForLocalSection]
  );

  const currentIndex = cycleSections.findIndex((item) => item.id === localSection);
  const matchedSection = cycleSections.find((item) => item.id === localSection);
  const currentSectionLabel =
    matchedSection?.label ??
    ALL_LABELS.get(localSection) ??
    (localSection ? localSection.replace(/-/g, " ") : "Everyone");

  const stepSection = (delta: number) => {
    if (!cycleSections.length) return;
    const nextIndex = currentIndex >= 0
      ? (currentIndex + delta + cycleSections.length) % cycleSections.length
      : 0;
    setLocalSection(cycleSections[nextIndex].id);
  };

  return (
    <div className="q-scores-panel">
      <div className="q-scores-nav">
        <button
          type="button"
          className="q-scores-nav-btn"
          aria-label="Previous section"
          onClick={() => { stepSection(-1); }}
        >
          <svg className="ui-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M15 18L9 12L15 6" />
          </svg>
        </button>
        <div className="q-scores-nav-section" title={currentSectionLabel}>{currentSectionLabel}</div>
        <button
          type="button"
          className="q-scores-nav-btn"
          aria-label="Next section"
          onClick={() => { stepSection(1); }}
        >
          <svg className="ui-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M9 18L15 12L9 6" />
          </svg>
        </button>
        <button
          type="button"
          className="q-scores-nav-btn q-scores-nav-btn--pause"
          aria-pressed={paused}
          aria-label={paused ? "Resume section autoplay" : "Pause section autoplay"}
          onClick={() => { setPaused((cur) => !cur); }}
        >
          <PlayPauseIcon mode={paused ? "play" : "pause"} className="ui-icon" />
        </button>
      </div>

      <div className="q-scores-list">
        {BUTTON_QUESTIONS.map((q, i) => {
          const pct = Math.round(avgs[i] * 100);
          return (
            <div key={q.id} className="q-scores-item">
              <div className="q-scores-item-head">
                <span className="q-scores-prompt">{q.prompt}</span>
                <span className="ui-label q-scores-pct">{pct}%</span>
              </div>
              <div className="q-scores-track">
                <div
                  className="q-scores-fill"
                  style={{ width: `${String(pct)}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
