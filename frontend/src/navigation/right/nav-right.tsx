import type { CSSProperties } from "react";
import { useState } from "react";

import ColorToggle from "./color-toggle";
import GraphPicker from "../graph-picker";
import { getSessionItem } from "../../app/session";
import { useIdentity } from "../../app/state/identity-context";
import { useUiFlow } from "../../app/state/ui-context";
import { useSurveyData } from "../../app/state/survey-data-context";
import { useWindowWidth } from "../../lib/hooks/useWindowWidth";
import { isDesktopWidth, isTabletWidth } from "../../lib/responsive/breakpoints";
import { desktopGraphToolsOffsetPx } from "../../lib/responsive/graph-tools-offset";

const DEFAULT_SECTION = "fine-arts";
const cx = (...parts: (string | boolean | undefined)[]) => parts.filter(Boolean).join(" ");
type PickerOffsetStyle = CSSProperties & { "--picker-offset": string };

export default function NavRight({ isDark, introActive = false }: { isDark: boolean; introActive?: boolean }) {
  const { isSurveyActive, setSurveyActive, hasCompletedSurvey, setHasCompletedSurvey, observerMode, setObserverMode, openGraph, closeGraph, resetToStart, logsOpen, widgetsOpen, questionnaireOpen } = useUiFlow();
  const { section, setSection } = useSurveyData();
  const { myEntryId, mySection, setMyEntryId, setMySection, setMyRole } = useIdentity();
  const windowWidth = useWindowWidth();
  const [pickerOpen, setPickerOpen] = useState(false);
  const aspectRatio = typeof window !== 'undefined' ? window.innerWidth / window.innerHeight : 1.78;
  const pickerOffset = isDesktopWidth(windowWidth)
    ? desktopGraphToolsOffsetPx(windowWidth, logsOpen, widgetsOpen, aspectRatio)
    : isTabletWidth(windowWidth)
      ? 0
      : (pickerOpen ? 0 : -30);

  const showPicker = (observerMode || hasCompletedSurvey) && !isSurveyActive;
  const showObserverButton = !isSurveyActive || observerMode || hasCompletedSurvey;
  const observerLabel = observerMode || hasCompletedSurvey ? "Back" : "View now";
  const pickerStyle: PickerOffsetStyle = {
    "--picker-offset": `${String(pickerOffset)}px`,
    transition: "transform 0.2s ease",
  };

  const toggleObserverMode = () => {
    if (hasCompletedSurvey && !observerMode) {
      resetToStart();
      return;
    }

    const savedEntryId = myEntryId ?? getSessionItem("be.myEntryId");
    const savedSection = mySection ?? getSessionItem("be.mySection");
    if (!observerMode && !hasCompletedSurvey && savedEntryId && savedSection && !questionnaireOpen) {
      setMyEntryId(savedEntryId);
      setMySection(savedSection);
      setMyRole(getSessionItem("be.myRole"));
      setHasCompletedSurvey(true);
      setObserverMode(false);
      setSurveyActive(false);
      setSection(savedSection);
      openGraph();
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
        <ColorToggle />

        {showObserverButton && (
          <button
            className={cx("observe-results", observerMode && "active")}
            onClick={toggleObserverMode}
            aria-pressed={observerMode || hasCompletedSurvey}
            aria-label={observerMode || hasCompletedSurvey ? "Back" : "View"}
            data-label={observerLabel}
          >
            <span className="observe-results__ghost" aria-hidden="true">{observerLabel}</span>
            <span className="observe-results__inner">{observerLabel}</span>
          </button>
        )}
      </div>
      {showPicker && (
        <div
          className="graph-picker"
          style={pickerStyle}
        >
          <GraphPicker value={section} onChange={setSection} onOpenChange={setPickerOpen} />
        </div>
      )}
    </>
  );
}
