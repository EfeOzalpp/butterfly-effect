// src/components/bottom/ModeToggle.jsx
import React, { useMemo } from "react";

import { usePreferences } from "../../app/state/preferences-context";
import { useUiFlow } from "../../app/state/ui-context";
import { useSurveyData } from "../../app/state/survey-data-context";
import { useIdentity } from "../../app/state/identity-context";
import { useInteraction } from "../../app/state/interaction-context";
import { avgWeightOf } from "../../lib/hooks/useRelativeScore";
import { useAbsoluteScore } from "../../lib/hooks/useAbsoluteScore";
import CheckIcon from "../../assets/svg/check/CheckIcon";

export default function ModeToggle() {
  const { mode, setMode } = usePreferences();
  const { observerMode, setOpenPersonalized } = useUiFlow();
  const { data } = useSurveyData();
  const { myEntryId } = useIdentity();
  const { setSpotlightRequest } = useInteraction();

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
      if (canPersonalize) setOpenPersonalized(true);
      return;
    }

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

  const titleWhenRelative = observerMode ? "Switch to Rankings" : relFeedback;
  const titleWhenAbsolute = observerMode ? "Switch to Scores"   : absFeedback;

  const ToggleCheckIcon = () => (
    <span className="mode-toggle-check">
      <CheckIcon className="switch-check-icon ui-icon" />
    </span>
  );

  return (
    <div className="mode-toggle-wrap">
      <div
        role="radiogroup"
        aria-label="Visualization mode"
        className={`mode-toggle-switch${observerMode ? " is-observing" : ""}`}
      >
        <button
          role="radio"
          aria-checked={!isAbsolute}
          className={`mode-toggle-label${!isAbsolute ? " active" : ""}`}
          onClick={() => flipModeAndMaybeSpotlight(isAbsolute ? "relative" : "absolute")}
          title={!isAbsolute ? relFeedback : "Switch to Rankings"}
          tabIndex={0}
        >
          {!isAbsolute && <ToggleCheckIcon />}
          team
        </button>
        <button
          role="radio"
          aria-checked={isAbsolute}
          className={`mode-toggle-label${isAbsolute ? " active" : ""}`}
          onClick={() => flipModeAndMaybeSpotlight(isAbsolute ? "relative" : "absolute")}
          title={isAbsolute ? absFeedback : "Switch to Scores"}
          tabIndex={0}
        >
          {isAbsolute && <ToggleCheckIcon />}
          solo
        </button>
      </div>
    </div>
  );
}
