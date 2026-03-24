// src/components/bottom/ModeToggle.jsx
import React, { useMemo } from "react";

import { usePreferences } from "../../app/state/preferences-context";
import { useUiFlow } from "../../app/state/ui-context";
import { useSurveyData } from "../../app/state/survey-data-context";
import { useIdentity } from "../../app/state/identity-context";
import { useInteraction } from "../../app/state/interaction-context";
import { avgWeightOf } from "../../lib/hooks/useRelativeScore";
import { useAbsoluteScore } from "../../lib/hooks/useAbsoluteScore";

export default function ModeToggle() {
  const { mode, setMode } = usePreferences();
  const { observerMode, setOpenPersonalized } = useUiFlow();
  const { data } = useSurveyData();
  const { myEntryId } = useIdentity();
  const { setSpotlightRequest } = useInteraction();

  // Pool + personal metrics (used for nicer titles when not observing)
  const poolValues = useMemo(
    () => (Array.isArray(data) ? data.map(avgWeightOf) : []),
    [data]
  );
  const myIndex = useMemo(
    () => (myEntryId ? data.findIndex(d => d._id === myEntryId) : -1),
    [data, myEntryId]
  );
  const myValue = myIndex >= 0 ? avgWeightOf(data[myIndex]) : undefined;

  const relFeedback = useMemo(() => {
    if (!poolValues.length || !Number.isFinite(myValue)) return "Rankings";
    const pool = poolValues.length - 1;
    const countBelow = poolValues.reduce(
      (acc, v, i) => (i === myIndex ? acc : acc + (v < myValue ? 1 : 0)),
      0
    );
    return `Ahead of ${countBelow} of ${Math.max(0, pool)}`;
  }, [poolValues, myIndex, myValue]);

  const { getForId: getAbsForId } = useAbsoluteScore(data, { decimals: 0 });
  const absFeedback = useMemo(() => {
    if (myIndex < 0) return "Scores";
    const score = getAbsForId(myEntryId);
    return `Score: ${score}/100`;
  }, [getAbsForId, myEntryId, myIndex]);

  const isAbsolute = mode === "absolute";
  const canPersonalize = !observerMode && myIndex >= 0;

  const flipModeAndMaybeSpotlight = (nextMode) => {
    setMode(nextMode);

    if (!observerMode) {
      // keep opening the personalized panel as before
      if (canPersonalize) {
        setOpenPersonalized(true);
      }
      return;
    }

    // OBSERVER: Defer spotlight dispatch until DotGraph has re-rendered & Html mounted
    // Double rAF pushes us past layout/paint of the new mode so points exist.
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setSpotlightRequest({
          durationMs: 3000,
          fakeMouseXRatio: 0.25,
          fakeMouseYRatio: 0.5,
        });
      });
    });
  };

  // Context-aware title
  const titleWhenRelative = observerMode ? "Switch to Rankings" : relFeedback;
  const titleWhenAbsolute = observerMode ? "Switch to Scores"   : absFeedback;
  const title = isAbsolute ? titleWhenRelative : titleWhenAbsolute;

  const CheckIcon = () => (
    <span className="mode-toggle-check">
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path d="M3 8.5l3.5 3.5 6.5-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </span>
  );

  return (
    <div className="mode-toggle-wrap">
      <div
        role="switch"
        aria-checked={isAbsolute}
        aria-label="Toggle visualization mode"
        tabIndex={0}
        className={`mode-toggle-switch${observerMode ? " is-observing" : ""}`}
        onClick={() => flipModeAndMaybeSpotlight(isAbsolute ? "relative" : "absolute")}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") { e.preventDefault(); flipModeAndMaybeSpotlight(isAbsolute ? "relative" : "absolute"); }
          if (e.key === "ArrowLeft")  flipModeAndMaybeSpotlight("relative");
          if (e.key === "ArrowRight") flipModeAndMaybeSpotlight("absolute");
        }}
        title={title}
      >
        <div className={`mode-toggle-thumb ${isAbsolute ? "absolute" : "relative"}`} />
        <div className={`mode-toggle-label${!isAbsolute ? " active" : ""}`}>
          {!isAbsolute && <CheckIcon />}
          team
        </div>
        <div className={`mode-toggle-label${isAbsolute ? " active" : ""}`}>
          {isAbsolute && <CheckIcon />}
          solo
        </div>
      </div>
    </div>
  );
}
