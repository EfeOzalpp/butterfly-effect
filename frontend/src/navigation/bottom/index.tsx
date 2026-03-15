import { useState } from "react";
import { useAppState } from "../../app/store";
import ModeToggle from "./mode-toggle";

export default function NavBottom() {
  const { cityPanelOpen, setCityPanelOpen, questionnaireOpen, radarMode, setRadarMode, vizVisible } = useAppState();
  const [showHint, setShowHint] = useState(false);

  if (!cityPanelOpen && !questionnaireOpen && !vizVisible) return null;

  return (
    <div className="bottom">
      {questionnaireOpen && !cityPanelOpen && (
        <div
          className="auto-adjust-wrap"
          onMouseEnter={() => setShowHint(true)}
          onMouseLeave={() => setShowHint(false)}
        >
          <button
            type="button"
            role="switch"
            aria-checked={radarMode}
            className={`auto-adjust${radarMode ? ' is-on' : ''}`}
            onClick={() => { setRadarMode(!radarMode); setShowHint(true); }}
          >
            <span className="auto-adjust-thumb" />
            <span className="auto-adjust-text">Weighted Sliders</span>
          </button>
          <div className={`auto-adjust-hint${showHint ? ' visible' : ''}`} role="status" aria-live="polite">
            Answers balance each other as you adjust.
          </div>
        </div>
      )}
      {vizVisible && <ModeToggle />}

      {(cityPanelOpen || questionnaireOpen) && <button
        type="button"
        className="city-button city-close-btn"
        onClick={() => setCityPanelOpen(!cityPanelOpen)}
        aria-label={cityPanelOpen ? "Back to questionnaire" : "Open city view"}
      >
        <span>{cityPanelOpen ? "Back" : "My city"}</span>
        {!cityPanelOpen && (
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
            <path d="M8 17H16M11.0177 2.764L4.23539 8.03912C3.78202 8.39175 3.55534 8.56806 3.39203 8.78886C3.24737 8.98444 3.1396 9.20478 3.07403 9.43905C3 9.70352 3 9.9907 3 10.5651V17.8C3 18.9201 3 19.4801 3.21799 19.908C3.40973 20.2843 3.71569 20.5903 4.09202 20.782C4.51984 21 5.07989 21 6.2 21H17.8C18.9201 21 19.4802 21 19.908 20.782C20.2843 20.5903 20.5903 20.2843 20.782 19.908C21 19.4801 21 18.9201 21 17.8V10.5651C21 9.9907 21 9.70352 20.926 9.43905C20.8604 9.20478 20.7526 8.98444 20.608 8.78886C20.4447 8.56806 20.218 8.39175 19.7646 8.03913L12.9823 2.764C12.631 2.49075 12.4553 2.35412 12.2613 2.3016C12.0902 2.25526 11.9098 2.25526 11.7387 2.3016C11.5447 2.35412 11.369 2.49075 11.0177 2.764Z" />
          </svg>
        )}
      </button>}
    </div>
  );
}
