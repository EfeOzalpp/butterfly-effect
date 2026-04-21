import { Suspense, lazy, useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import "../../styles/widgets.css";
import CloseIcon from "../../assets/svg/close/CloseIcon";
import { useUiFlow } from "../../app/state/ui-context";
import { useSurveyData } from "../../app/state/survey-data-context";
import { GraphDataProvider } from "../../graph-runtime/GraphDataContext";
import { useWindowWidth } from "../../lib/hooks/useWindowWidth";
import ModeToggle from "./mode-toggle";
import LogsButton from "./logs-button";
import RadarChart from "./radar-chart";

const BarGraph = lazy(() => import("../../graph-runtime/bargraph/index"));

export default function NavBottom({ introActive = false }: { introActive?: boolean }) {
  const {
    cityPanelOpen,
    setCityPanelOpen,
    questionnaireOpen,
    radarMode,
    setRadarMode,
    vizVisible,
    logsOpen,
    setLogsOpen,
    widgetsOpen,
    setWidgetsOpen,
    questionnaireNav,
    requestQuestionnaireAdvance,
  } = useUiFlow();
  const { data } = useSurveyData();
  const windowWidth = useWindowWidth();
  const isMobileGraphNav = windowWidth < 768;
  const isTabletGraphNav = windowWidth >= 768 && windowWidth <= 1024;
  const useCompactGraphNav = windowWidth <= 1024;
  const aspectRatio = typeof window !== 'undefined' ? window.innerWidth / window.innerHeight : 1.78;
  const pickerOffset = windowWidth > 1024 ? ((logsOpen ? 130 : 0) + (widgetsOpen ? 50 : 0)) * aspectRatio : 0;
  const [showHint, setShowHint] = useState(false);
  const [expandedWidget, setExpandedWidget] = useState<"bar" | "radar" | null>("radar");
  const barGraphExpanded = expandedWidget === "bar";
  const radarChartExpanded = expandedWidget === "radar";
  const toggleWidget = (w: "bar" | "radar") => setExpandedWidget((cur) => (cur === w ? null : w));
  const widgetsRef = useRef<HTMLDivElement | null>(null);
  const logsWrapRef = useRef<HTMLDivElement | null>(null);
  const modeToggleRef = useRef<HTMLDivElement | null>(null);
  const questionnaireHintTimerRef = useRef<number | null>(null);
  const [logsSlide, setLogsSlide] = useState(0);
  const [showQuestionnaireDisabledHint, setShowQuestionnaireDisabledHint] = useState(false);
  const [modeToggleShiftPx, setModeToggleShiftPx] = useState(0);

  const flashQuestionnaireDisabledHint = useCallback(() => {
    if (questionnaireHintTimerRef.current != null) {
      window.clearTimeout(questionnaireHintTimerRef.current);
    }
    setShowQuestionnaireDisabledHint(true);
    questionnaireHintTimerRef.current = window.setTimeout(() => {
      setShowQuestionnaireDisabledHint(false);
      questionnaireHintTimerRef.current = null;
    }, 2200);
  }, []);

  useEffect(() => {
    if (!vizVisible) {
      setWidgetsOpen(false);
      setExpandedWidget(null);
    }
  }, [vizVisible]);

  useEffect(() => {
    if (logsOpen && !isMobileGraphNav && logsWrapRef.current) {
      const panelWidth = isTabletGraphNav
        ? window.innerWidth * 0.6
        : Math.min(540, window.innerWidth - 51.2);
      const btnWidth = logsWrapRef.current.offsetWidth;
      setLogsSlide(Math.max(0, panelWidth - btnWidth));
    } else {
      setLogsSlide(0);
    }
  }, [logsOpen, isMobileGraphNav, isTabletGraphNav]);

  useEffect(() => {
    if (!questionnaireNav.nextDisabled) {
      setShowQuestionnaireDisabledHint(false);
      if (questionnaireHintTimerRef.current != null) {
        window.clearTimeout(questionnaireHintTimerRef.current);
        questionnaireHintTimerRef.current = null;
      }
    }
  }, [questionnaireNav.nextDisabled]);

  useEffect(() => {
    return () => {
      if (questionnaireHintTimerRef.current != null) {
        window.clearTimeout(questionnaireHintTimerRef.current);
      }
    };
  }, []);

  useLayoutEffect(() => {
    if (!vizVisible || !modeToggleRef.current || isMobileGraphNav || isTabletGraphNav) {
      setModeToggleShiftPx(0);
      return;
    }

    const frame = window.requestAnimationFrame(() => {
      const modeToggleWidth = modeToggleRef.current?.offsetWidth ?? 0;
      const rootFontSize =
        typeof window !== "undefined"
          ? parseFloat(window.getComputedStyle(document.documentElement).fontSize) || 16
          : 16;
      const gapPx = rootFontSize * 0.4;

      const logsShell = logsWrapRef.current?.querySelector(".logs-popover-shell.is-open") as HTMLElement | null;
      const logsButton = logsWrapRef.current?.querySelector(".logs-button") as HTMLElement | null;
      const widgetsShell = widgetsRef.current?.querySelector(".widgets-popover-shell.is-open") as HTMLElement | null;
      const widgetsButton = widgetsRef.current?.querySelector(".widgets-button") as HTMLElement | null;

      const logsOccupiedRight = logsOpen
        ? logsShell?.getBoundingClientRect().right ?? logsButton?.getBoundingClientRect().right ?? 0
        : 0;
      const widgetsOccupiedRight = widgetsOpen
        ? widgetsShell?.getBoundingClientRect().right ?? widgetsButton?.getBoundingClientRect().right ?? 0
        : 0;
      const occupiedRight = Math.max(logsOccupiedRight, widgetsOccupiedRight);

      let shiftPx = 0;

      shiftPx = pickerOffset;
      const projectedLeft = window.innerWidth / 2 - modeToggleWidth / 2 + shiftPx;
      const overlapPx = occupiedRight + gapPx - projectedLeft;

      if (overlapPx > 0) shiftPx += overlapPx;

      setModeToggleShiftPx((prev) => (Math.abs(prev - shiftPx) < 0.5 ? prev : shiftPx));
    });

    return () => window.cancelAnimationFrame(frame);
  }, [
    vizVisible,
    isMobileGraphNav,
    isTabletGraphNav,
    logsOpen,
    widgetsOpen,
    logsSlide,
    pickerOffset,
    windowWidth,
  ]);

  if (!cityPanelOpen && !questionnaireOpen && !vizVisible) return null;

  return (
    <>
      <div className={`bottom bottom-left${introActive ? " nav-first-enter" : ""}`}>
        {(cityPanelOpen || questionnaireOpen) && (
          <button
            type="button"
            className="city-button city-close-btn"
            onClick={() => setCityPanelOpen(!cityPanelOpen)}
            aria-label={cityPanelOpen ? "Back to questionnaire" : "Open city view"}
          >
            <span className="city-button__inner">
              <span>{cityPanelOpen ? "Back" : "My city"}</span>
            </span>
          </button>
        )}
        {false && questionnaireOpen && !cityPanelOpen && (
          <div
            className="auto-adjust-wrap"
            onMouseEnter={() => setShowHint(true)}
            onMouseLeave={() => setShowHint(false)}
          >
            <button
              type="button"
              role="switch"
              aria-checked={radarMode}
              className={`auto-adjust${radarMode ? " is-on" : ""}`}
              onClick={() => {
                setRadarMode(!radarMode);
                setShowHint(true);
              }}
            >
              <span className="auto-adjust-thumb" />
              <span className="auto-adjust-text">Weighted Sliders</span>
            </button>
            <div className={`auto-adjust-hint${showHint ? " visible" : ""}`} role="status" aria-live="polite">
              Answers balance each other as you adjust.
            </div>
          </div>
        )}
        {vizVisible && (
          <div ref={logsWrapRef}>
            <LogsButton open={logsOpen} onOpenChange={setLogsOpen} />
          </div>
        )}
        {vizVisible && (
          <div className="widgets-wrap" ref={widgetsRef} style={{ marginLeft: logsSlide > 0 ? `calc(${logsSlide}px + 0.3rem)` : widgetsOpen ? '0.3rem' : undefined }}>
            <div
              className={`widgets-popover-shell${widgetsOpen ? " is-open" : ""}`}
              aria-hidden={!widgetsOpen}
              style={isMobileGraphNav ? { left: "-64px" } : undefined}
            >
              <div className="widgets-popover-clip">
                <div className="widgets-popover" role="dialog" aria-label="Widgets">
                <div className="widgets-list">
                  <div className={`widgets-entry widgets-entry--bar-graph${barGraphExpanded ? " is-expanded" : ""}`}>
                    <button
                      type="button"
                      className="widgets-item"
                      aria-expanded={barGraphExpanded}
                      onClick={() => toggleWidget("bar")}
                    >
                      <span>Bar graph</span>
                    </button>
                    <div className={`widgets-expandable${barGraphExpanded ? " is-expanded" : ""}`}>
                      <div className="widgets-panel bar-graph">
                        <GraphDataProvider data={data}>
                          <Suspense fallback={null}>
                            <BarGraph />
                          </Suspense>
                        </GraphDataProvider>
                      </div>
                    </div>
                  </div>
                  <div className={`widgets-entry widgets-entry--radar-chart${radarChartExpanded ? " is-expanded" : ""}`}>
                    <button
                      type="button"
                      className="widgets-item"
                      aria-expanded={radarChartExpanded}
                      onClick={() => toggleWidget("radar")}
                    >
                      <span>Radar chart</span>
                    </button>
                    <div className={`widgets-expandable${radarChartExpanded ? " is-expanded" : ""}`}>
                      <div className="widgets-panel radar-chart">
                        <RadarChart />
                      </div>
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  className="widgets-close-strip"
                  aria-label="Close widgets"
                  onClick={() => {
                    setWidgetsOpen(false);
                  }}
                >
                  <CloseIcon className="ui-close" />
                  <span>Widgets</span>
                </button>
                </div>
              </div>
            </div>

            <button
              type="button"
              className="widgets-button"
              data-label="Widgets"
              aria-expanded={widgetsOpen}
              aria-haspopup="dialog"
              aria-label="Widgets"
              onClick={() => {
                setWidgetsOpen(!widgetsOpen);
              }}
            >
              <span className="widgets-button__inner">Widgets</span>
            </button>
          </div>
        )}
      </div>
      {questionnaireOpen && !vizVisible && questionnaireNav.total > 0 && (
        <div className={`bottom bottom-right${introActive ? " nav-first-enter" : ""}`}>
          <div className="questionnaire-nav-stack">
            <p className="q-step-indicator questionnaire-nav-progress">
              {questionnaireNav.step} / {questionnaireNav.total}
            </p>
            <div className="questionnaire-nav-action">
              <div
                className={`questionnaire-nav-hint${showQuestionnaireDisabledHint ? " is-visible" : ""}`}
                role="status"
                aria-live="polite"
              >
                <span>Select at least one answer.</span>
              </div>
              <button
                type="button"
                className={`questionnaire${questionnaireNav.nextDisabled ? " is-disabled" : ""}`}
                data-label={questionnaireNav.nextLabel}
                aria-disabled={questionnaireNav.nextDisabled}
                onClick={() => {
                  if (questionnaireNav.nextDisabled) {
                    flashQuestionnaireDisabledHint();
                    return;
                  }
                  requestQuestionnaireAdvance();
                }}
                aria-label={
                  questionnaireNav.nextLabel === "Finish"
                    ? "Finish survey and open results"
                    : "Next question"
                }
              >
                <span className="questionnaire__ghost" aria-hidden="true">
                  <span>{questionnaireNav.nextLabel}</span>
                </span>
                <span className="questionnaire__inner">
                  <span>{questionnaireNav.nextLabel}</span>
                </span>
              </button>
            </div>
          </div>
        </div>
      )}
      {vizVisible && (
        <div
          ref={modeToggleRef}
          className={`bottom ${useCompactGraphNav ? "bottom-mobile-right" : "bottom-center"}`}
          style={
            useCompactGraphNav
              ? {
                  transform:
                    isTabletGraphNav && logsOpen && widgetsOpen
                      ? "translateX(calc(100% + 1.7rem))"
                      : "translateX(0px)",
                  transition: "transform 0.2s ease",
                }
              : { transform: `translateX(calc(-50% + ${modeToggleShiftPx}px))`, transition: "transform 0.2s ease" }
          }
        >
          <ModeToggle />
        </div>
      )}
    </>
  );
}
