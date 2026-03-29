import Darkmode from "./color-toggle";
import GraphPicker from "./graph-picker";
import { useUiFlow } from "../../app/state/ui-context";
import { useSurveyData } from "../../app/state/survey-data-context";
import { useWindowWidth } from "../../lib/hooks/useWindowWidth";

const DEFAULT_SECTION = "fine-arts";
const cx = (...parts: (string | boolean | undefined)[]) => parts.filter(Boolean).join(" ");

export default function NavRight({ isDark, introActive = false }: { isDark: boolean; introActive?: boolean }) {
  const { isSurveyActive, setSurveyActive, hasCompletedSurvey, observerMode, setObserverMode, openGraph, closeGraph, resetToStart, logsOpen, widgetsOpen } = useUiFlow();
  const { section, setSection } = useSurveyData();
  const windowWidth = useWindowWidth();
  const aspectRatio = typeof window !== 'undefined' ? window.innerWidth / window.innerHeight : 1.78;
  const pickerOffset = windowWidth > 768 ? ((logsOpen ? 130 : 0) + (widgetsOpen ? 50 : 0)) * aspectRatio : 0;

  const showPicker = (observerMode || hasCompletedSurvey) && !isSurveyActive;
  const showObserverButton = !isSurveyActive || observerMode || hasCompletedSurvey;
  const observerLabel = observerMode || hasCompletedSurvey ? "Back" : "View now";

  const toggleObserverMode = () => {
    if (hasCompletedSurvey && !observerMode) {
      resetToStart();
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

  return (
    <>
      <div className={cx("right", isDark && "is-dark", introActive && "nav-first-enter")}>
        <Darkmode />

        {showObserverButton && (
          <button
            className={cx("observe-results", observerMode && "active")}
            onClick={toggleObserverMode}
            aria-pressed={observerMode || hasCompletedSurvey}
            aria-label={observerMode || hasCompletedSurvey ? "Back" : "View now"}
            data-label={observerLabel}
          >
            <span className="observe-results__ghost" aria-hidden="true">{observerLabel}</span>
            <span className="observe-results__inner">{observerLabel}</span>
          </button>
        )}

        {showPicker && (
          <div className="graph-picker" style={{ transform: `translateX(calc(-50% + ${pickerOffset}px))`, transition: "transform 0.2s ease" }}>
            <GraphPicker value={section} onChange={setSection} />
          </div>
        )}
      </div>
    </>
  );
}
