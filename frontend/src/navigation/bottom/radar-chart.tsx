import { useMemo } from "react";
import { useSurveyData } from "../../app/state/survey-data-context";
import type { SurveyRow } from "../../app/types";

const Q_KEYS: (keyof SurveyRow)[] = ["q1", "q2", "q3", "q4", "q5"];
const Q_LABELS = ["Q1", "Q2", "Q3", "Q4", "Q5"];
const N = Q_KEYS.length;

const W = 260;
const H = 240;
const CX = W / 2;
const CY = 122;
const R = 82;
const LABEL_R = R + 16;
const TICKS = [0.2, 0.4, 0.6, 0.8, 1.0];

const angles = Array.from({ length: N }, (_, i) => -Math.PI / 2 + (i * 2 * Math.PI) / N);

function pt(i: number, v: number): string {
  return `${CX + v * R * Math.cos(angles[i])},${CY + v * R * Math.sin(angles[i])}`;
}

function ringPoly(v: number): string {
  return angles.map((_, i) => pt(i, v)).join(" ");
}

export default function RadarChart() {
  const { allFilteredRows } = useSurveyData();

  const avgs = useMemo(
    () =>
      Q_KEYS.map((key) => {
        const vals = allFilteredRows
          .map((row) => row[key] as number | undefined)
          .filter((v): v is number => typeof v === "number" && Number.isFinite(v));
        return vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : 0;
      }),
    [allFilteredRows]
  );

  const dataPoints = avgs.map((v, i) => pt(i, v)).join(" ");

  return (
    <svg
      className="radar-chart-svg"
      viewBox={`0 0 ${W} ${H}`}
      width="100%"
      aria-label="Average values per question (radar)"
    >
      {/* Grid rings */}
      {TICKS.map((v) => (
        <polygon key={v} points={ringPoly(v)} className="rc-ring" />
      ))}

      {/* Axis lines */}
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

      {/* Data polygon */}
      <polygon points={dataPoints} className="rc-data" />

      {/* Dots at each axis value */}
      {avgs.map((v, i) => (
        <circle
          key={i}
          cx={CX + v * R * Math.cos(angles[i])}
          cy={CY + v * R * Math.sin(angles[i])}
          r={3}
          className="rc-dot"
        />
      ))}

      {/* Axis labels */}
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
  );
}
