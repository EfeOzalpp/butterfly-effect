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
  const pickerOffset = windowWidth > 768 ? ((logsOpen ? 120 : 0) + (widgetsOpen ? 40 : 0)) * aspectRatio : 0;

  const showPicker = (observerMode || hasCompletedSurvey) && !isSurveyActive;
  const showObserverButton = !isSurveyActive || observerMode || hasCompletedSurvey;

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
            className={cx("observe-results", observerMode && "active", isDark && "is-dark")}
            onClick={toggleObserverMode}
            aria-pressed={observerMode || hasCompletedSurvey}
            aria-label={observerMode || hasCompletedSurvey ? "Back" : "Observe"}
          >
            {observerMode || hasCompletedSurvey ? (
              <svg
                className="ui-icon"
                width="100%"
                height="100%"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
                focusable="false"
              >
                <path
                  d="M9 14L4 9M4 9L9 4M4 9H10.4C13.7603 9 15.4405 9 16.7239 9.65396C17.8529 10.2292 18.7708 11.1471 19.346 12.2761C20 13.5595 20 15.2397 20 18.6V20"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            ) : (
              <>
                <span>Observe</span>
                <svg
                  className="ui-icon"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                  focusable="false"
                >
                  <path d="M2.42012 12.7132C2.28394 12.4975 2.21584 12.3897 2.17772 12.2234C2.14909 12.0985 2.14909 11.9015 2.17772 11.7766C2.21584 11.6103 2.28394 11.5025 2.42012 11.2868C3.54553 9.50484 6.8954 5 12.0004 5C17.1054 5 20.4553 9.50484 21.5807 11.2868C21.7169 11.5025 21.785 11.6103 21.8231 11.7766C21.8517 11.9015 21.8517 12.0985 21.8231 12.2234C21.785 12.3897 21.7169 12.4975 21.5807 12.7132C20.4553 14.4952 17.1054 19 12.0004 19C6.8954 19 3.54553 14.4952 2.42012 12.7132Z" />
                  <path d="M12.0004 15C13.6573 15 15.0004 13.6569 15.0004 12C15.0004 10.3431 13.6573 9 12.0004 9C10.3435 9 9.0004 10.3431 9.0004 12C9.0004 13.6569 10.3435 15 12.0004 15Z" />
                </svg>
              </>
            )}
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
