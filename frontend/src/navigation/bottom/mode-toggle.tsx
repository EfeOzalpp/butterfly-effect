// src/navigation/bottom/mode-toggle.tsx

import React, { useMemo } from "react";

import { useUiFlow } from "../../app/state/ui-context";
import type { Mode } from "../../app/types";
import { useSurveyData } from "../../app/state/survey-data-context";
import { useIdentity } from "../../app/state/identity-context";
import { avgWeightOf } from "../../lib/hooks/useRelativeScore";
import { useAbsoluteScore } from "../../lib/hooks/useAbsoluteScore";
import CheckIcon from "../../assets/svg/check/CheckIcon";

function ToggleCheckIcon() {
  return (
    <span className="mode-toggle-check">
      <CheckIcon className="switch-check-icon" />
    </span>
  );
}

export default function ModeToggle() {
  const { mode, setMode, observerMode, setOpenPersonalized, setSpotlightRequest } = useUiFlow();
  const { data } = useSurveyData();
  const { myEntryId } = useIdentity();

  const poolValues = useMemo(
    () => (Array.isArray(data) ? data.map(avgWeightOf) : []),
    [data]
  );
  const myIndex = useMemo(
    () => (myEntryId ? data.findIndex(d => d._id === myEntryId) : -1),
    [data, myEntryId]
  );
  const myRow = myIndex >= 0 ? data[myIndex] : undefined;
  const myValue = myRow ? avgWeightOf(myRow) : undefined;

  const relFeedback = useMemo(() => {
    if (!poolValues.length || typeof myValue !== "number" || !Number.isFinite(myValue)) return "Rankings";
    const currentValue = myValue;
    const pool = poolValues.length - 1;
    const countBelow = poolValues.reduce(
      (acc, v, i) => (i === myIndex ? acc : acc + (v < currentValue ? 1 : 0)),
      0
    );
    return `Ahead of ${String(countBelow)} of ${String(Math.max(0, pool))}`;
  }, [poolValues, myIndex, myValue]);

  const { getForId: getAbsForId } = useAbsoluteScore(data, { decimals: 0 });
  const absFeedback = useMemo(() => {
    if (myIndex < 0) return "Scores";
    const score = getAbsForId(myEntryId ?? undefined);
    return `Score: ${String(score)}/100`;
  }, [getAbsForId, myEntryId, myIndex]);

  const isAbsolute = mode === "absolute";
  const nextMode: Mode = isAbsolute ? "relative" : "absolute";
  const canPersonalize = !observerMode && myIndex >= 0;

  const flipModeAndMaybeSpotlight = (next: Mode) => {
    setMode(next);

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
          onClick={() => { flipModeAndMaybeSpotlight(nextMode); }}
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
          onClick={() => { flipModeAndMaybeSpotlight(nextMode); }}
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
