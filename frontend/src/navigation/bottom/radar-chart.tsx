import { useEffect, useMemo, useState } from "react";
import { useSurveyData } from "../../app/state/survey-data-context";
import PlayPauseIcon from "../../assets/svg/play/PlayPauseIcon";
import { GO_BACK, NON_PERSONAL_IDS, useGraphPickerData } from "../right/useGraphPickerData";

const Q_KEYS = ["q1", "q2", "q3", "q4", "q5"] as const;
const Q_LABELS = ["Q1", "Q2", "Q3", "Q4", "Q5"];
const N = Q_KEYS.length;

const W = 260;
const H = 240;
const CX = W / 2;
const CY = 122;
const R = 82;
const LABEL_R = R + 16;
const VALUE_OFFSET = 10;
const TICKS = [0.2, 0.4, 0.6, 0.8, 1.0];
const AUTOPLAY_MS = 2600;

const angles = Array.from({ length: N }, (_, i) => -Math.PI / 2 + (i * 2 * Math.PI) / N);

function pt(i: number, v: number): string {
  return `${CX + v * R * Math.cos(angles[i])},${CY + v * R * Math.sin(angles[i])}`;
}

function ringPoly(v: number): string {
  return angles.map((_, i) => pt(i, v)).join(" ");
}

function fmtPercent(v: number): string {
  return `${Math.round(v * 100)}`;
}

export default function RadarChart() {
  const { allRows, section } = useSurveyData();
  const { ALL_LABELS, MAIN_OPTS, STUDENT_OPTS, STAFF_OPTS, counts } = useGraphPickerData(section);
  const [paused, setPaused] = useState(false);
  const [localSection, setLocalSection] = useState(section);

  useEffect(() => {
    setLocalSection(section);
  }, [section]);

  const cycleSections = useMemo(() => {
    const ordered = [...MAIN_OPTS, ...STUDENT_OPTS, ...STAFF_OPTS]
      .filter((opt) => opt.id !== GO_BACK)
      .filter((opt) => !NON_PERSONAL_IDS.has(opt.id) || opt.id === "all" || opt.id === "all-massart" || opt.id === "all-students" || opt.id === "all-staff" || opt.id === "visitor")
      .filter((opt, index, arr) => arr.findIndex((item) => item.id === opt.id) === index)
      .filter((opt) => (counts?.[opt.id] ?? 0) > 0 || opt.id === localSection);

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
    return () => window.clearInterval(timer);
  }, [cycleSections, paused, localSection]);

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
          .map((row) => row[key] as number | undefined)
          .filter((v): v is number => typeof v === "number" && Number.isFinite(v));
        return vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : 0;
      }),
    [rowsForLocalSection]
  );

  const dataPoints = avgs.map((v, i) => pt(i, v)).join(" ");
  const currentIndex = cycleSections.findIndex((item) => item.id === localSection);
  const currentSectionLabel =
    cycleSections[currentIndex]?.label ??
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
    <div className="radar-chart-panel">
      <svg
        className="radar-chart-svg"
        viewBox={`0 0 ${W} ${H}`}
        width="100%"
        aria-label="Average values per question (radar)"
      >
        {TICKS.map((v) => (
          <polygon key={v} points={ringPoly(v)} className="rc-ring" />
        ))}

        {angles.map((a, i) => (
          <line
            key={i}
            x1={CX}
            y1={CY}
            x2={CX + R * Math.cos(a)}
            y2={CY + R * Math.sin(a)}
            className="rc-axis"
          />
        ))}

        <polygon points={dataPoints} className="rc-data" />

        {avgs.map((v, i) => {
          const dotX = CX + v * R * Math.cos(angles[i]);
          const dotY = CY + v * R * Math.sin(angles[i]);
          const valueX = CX + (v * R + VALUE_OFFSET) * Math.cos(angles[i]);
          const valueY = CY + (v * R + VALUE_OFFSET) * Math.sin(angles[i]);
          const cos = Math.cos(angles[i]);
          const anchor = cos > 0.1 ? "start" : cos < -0.1 ? "end" : "middle";

          return (
            <g key={i}>
              <circle cx={dotX} cy={dotY} r={3} className="rc-dot" />
              <text x={valueX} y={valueY} className="rc-value" textAnchor={anchor} dominantBaseline="middle">
                {fmtPercent(v)}
              </text>
            </g>
          );
        })}

        {Q_LABELS.map((label, i) => {
          const cos = Math.cos(angles[i]);
          const sin = Math.sin(angles[i]);
          const x = CX + LABEL_R * cos;
          const y = CY + LABEL_R * sin;
          const anchor = cos > 0.1 ? "start" : cos < -0.1 ? "end" : "middle";
          const baseline = sin > 0.1 ? "hanging" : sin < -0.1 ? "auto" : "middle";
          return (
            <text key={label} x={x} y={y} className="rc-label" textAnchor={anchor} dominantBaseline={baseline}>
              {label}
            </text>
          );
        })}
      </svg>

      <p className="radar-chart-caption">Sustainability score per question for this group</p>

      <div className="radar-chart-footer">
        <button
          type="button"
          className="radar-footer-btn"
          aria-label="Previous section"
          onClick={() => stepSection(-1)}
        >
          <span aria-hidden="true">‹</span>
        </button>
        <div className="radar-footer-section" title={currentSectionLabel}>{currentSectionLabel}</div>
        <button
          type="button"
          className="radar-footer-btn"
          aria-label="Next section"
          onClick={() => stepSection(1)}
        >
          <span aria-hidden="true">›</span>
        </button>
        <button
          type="button"
          className="radar-footer-btn radar-footer-btn--pause"
          aria-pressed={paused}
          aria-label={paused ? "Resume section autoplay" : "Pause section autoplay"}
          onClick={() => setPaused((cur) => !cur)}
        >
          <span className="radar-footer-btn__ghost" aria-hidden="true">
            <PlayPauseIcon mode="play" className="radar-footer-btn__icon" />
          </span>
          <span className="radar-footer-btn__inner" aria-hidden="true">
            <PlayPauseIcon mode={paused ? "play" : "pause"} className="radar-footer-btn__icon" />
          </span>
        </button>
      </div>
    </div>
  );
}
