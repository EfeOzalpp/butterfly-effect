import React, { useState, useEffect } from "react";

import Logo from "./visual/left";
import InfoPanel from "./InfoPanel";
import InfoGraph from "./InfoGraph";
import GraphPicker from "./GraphPicker";
import Darkmode from "./DarkmodeToggle";

import { useAppState } from "../app/appState";

import "../styles/navigation.css";
import "../styles/info-graph.css";

const DEFAULT_SECTION = "fine-arts";
const cx = (...parts) => parts.filter(Boolean).join(" ");

const Navigation = () => {
  const [open, setOpen] = useState(false);

  const {
    section,
    setSection,
    isSurveyActive,
    hasCompletedSurvey,
    observerMode,
    setObserverMode,
    setSurveyActive,
    openGraph,
    closeGraph,
    setNavPanelOpen,
    navVisible,
    darkMode,
  } = useAppState();

  useEffect(() => {
    setNavPanelOpen?.(open);
  }, [open, setNavPanelOpen]);

  const showPicker = (observerMode || hasCompletedSurvey) && !isSurveyActive;
  const showObserverButton = !hasCompletedSurvey || observerMode;

  const navClassName = cx("navigation", !navVisible && "nav-hidden-mobile", open && "info-open");
  const navChromeDark = open ? false : !!darkMode;

  const toggleObserverMode = () => {
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
      <nav className={navClassName}>
        <div className="left">
          <Logo />
        </div>

        <div className="nav-right">
          {open ? (
            <button
              className={cx("info-close", navChromeDark && "is-dark")}
              onClick={() => setOpen(false)}
              aria-label="Close info panel"
            >
              <svg
                className="ui-icon"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
              >
                <line x1="5" y1="5" x2="19" y2="19" />
                <line x1="19" y1="5" x2="5" y2="19" />
              </svg>
            </button>
          ) : (
            <div className={cx("nav-top", navChromeDark && "is-dark")}>
              <button
                className={cx("nav-toggle", navChromeDark && "is-dark")}
                onClick={() => setOpen(true)}
                aria-expanded={false}
                aria-controls="info-overlay"
              >
                {"About"}
              </button>

              <Darkmode />

              {showObserverButton && (
                <button
                  className={cx("observe-results", observerMode && "active", navChromeDark && "is-dark")}
                  onClick={toggleObserverMode}
                  aria-pressed={observerMode}
                >
                  {observerMode ? (
                    "Back"
                  ) : (
                    <>
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
                      <span>Explore</span>
                    </>
                  )}
                </button>
              )}

              {showPicker && (
                <div className="graph-picker">
                  <GraphPicker value={section} onChange={setSection} />
                </div>
              )}
            </div>
          )}
        </div>
      </nav>

      <InfoPanel open={open} onClose={() => setOpen(false)}>
        <InfoGraph />
      </InfoPanel>
    </>
  );
};

export default Navigation;
