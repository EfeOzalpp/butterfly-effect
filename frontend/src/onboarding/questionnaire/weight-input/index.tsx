import { memo, useCallback, useRef } from 'react';
import type { Question } from '../../types';
import { KEYS, AXIS_ANGLES, axisPoint, projectOntoAxis } from './geometry';
import { simplexSet, simplexNormalize, SIMPLEX_DEFAULT } from './balance';
import type { ShapeKey } from './geometry';

const SIZE = 260;
const CX = SIZE / 2;
const CY = SIZE / 2;
const R = 90;
const LABEL_R = R + 24;
const HANDLE_HIT = 18; // invisible hit target radius

const SHAPE_COLORS: Record<ShapeKey, string> = {
  A: '#4498E6', // circle  — blue
  B: '#64B883', // square  — green
  C: '#F4A42F', // triangle — orange
  D: '#9E82F1', // diamond  — purple
};

const RING_STEPS = [0.25, 0.5, 0.75, 1];

// ── Shape glyphs rendered in SVG ────────────────────────────────────────────

const ShapeHandle = ({
  k,
  cx,
  cy,
  color,
}: {
  k: ShapeKey;
  cx: number;
  cy: number;
  color: string;
}) => {
  const s = 14;
  const h = s / 2;
  const noEvents: React.CSSProperties = { pointerEvents: 'none' };

  if (k === 'A') {
    return <circle cx={cx} cy={cy} r={h} fill={color} stroke="white" strokeWidth={1.5} style={noEvents} />;
  }
  if (k === 'B') {
    return (
      <rect
        x={cx - h * 0.78} y={cy - h * 0.78}
        width={s * 0.78} height={s * 0.78}
        rx={2} fill={color} stroke="white" strokeWidth={1.5} style={noEvents}
      />
    );
  }
  if (k === 'C') {
    const pts = [
      `${cx},${cy - h}`,
      `${cx - h * 0.87},${cy + h * 0.5}`,
      `${cx + h * 0.87},${cy + h * 0.5}`,
    ].join(' ');
    return <polygon points={pts} fill={color} stroke="white" strokeWidth={1.5} style={noEvents} />;
  }
  // D — diamond
  return (
    <g transform={`translate(${cx} ${cy}) rotate(45)`} style={noEvents}>
      <rect
        x={-h * 0.72} y={-h * 0.72}
        width={s * 0.72} height={s * 0.72}
        rx={1.5} fill={color} stroke="white" strokeWidth={1.5}
      />
    </g>
  );
};

// ── Label helpers ────────────────────────────────────────────────────────────

const wrapWords = (label: string, maxPerLine: number): [string, string] => {
  const words = label.split(' ');
  const line1 = words.slice(0, maxPerLine).join(' ');
  const line2 = words.slice(maxPerLine, maxPerLine * 2).join(' ');
  return [line1, line2];
};

// text-anchor and dominant-baseline per axis direction
type TextAnchor = 'middle' | 'start' | 'end';
type DominantBaseline = 'auto' | 'middle' | 'hanging';

const labelAlign = (k: ShapeKey): { anchor: TextAnchor; baseline: DominantBaseline; dyOffset: number } => {
  if (k === 'A') return { anchor: 'middle', baseline: 'auto',    dyOffset: -4 };
  if (k === 'C') return { anchor: 'middle', baseline: 'hanging', dyOffset: 4 };
  if (k === 'B') return { anchor: 'start',  baseline: 'middle',  dyOffset: 0 };
  return             { anchor: 'end',    baseline: 'middle',  dyOffset: 0 };
};

// ── Component ────────────────────────────────────────────────────────────────

export type RadarInputProps = {
  question: Question;
  /** Current per-key allocation values (will be normalized to simplex internally) */
  sliderVals: Record<string, number>;
  /** Called on every drag update with the full new simplex allocation */
  onAllChange: (vals: Record<ShapeKey, number>) => void;
};

function RadarInputInner({ question, sliderVals, onAllChange }: RadarInputProps) {
  const dragging = useRef<ShapeKey | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  // Normalize incoming values — handles cold-start (all 0.25) and slider-mode leftovers
  const raw = KEYS.reduce<Partial<Record<ShapeKey, number>>>(
    (acc, k) => ({ ...acc, [k]: sliderVals[k] ?? SIMPLEX_DEFAULT[k] }),
    {}
  );
  const vals = simplexNormalize(raw);

  const polygonPoints = KEYS.map((k) => {
    const pt = axisPoint(CX, CY, R, k, vals[k]);
    return `${pt.x},${pt.y}`;
  }).join(' ');

  // Pointer → SVG coordinate (accounts for element scaling)
  const toSvgCoords = (e: React.PointerEvent<SVGSVGElement>) => {
    const rect = svgRef.current!.getBoundingClientRect();
    return {
      px: (e.clientX - rect.left) * (SIZE / rect.width),
      py: (e.clientY - rect.top) * (SIZE / rect.height),
    };
  };

  const onPointerDown = useCallback(
    (k: ShapeKey) => (e: React.PointerEvent) => {
      // Capture on the SVG so onPointerMove on the SVG keeps firing
      svgRef.current?.setPointerCapture(e.pointerId);
      dragging.current = k;
    },
    []
  );

  const onPointerMove = useCallback(
    (e: React.PointerEvent<SVGSVGElement>) => {
      if (!dragging.current || !svgRef.current) return;
      const k = dragging.current;
      const { px, py } = toSvgCoords(e);
      const newVal = projectOntoAxis(px, py, CX, CY, k, R);
      onAllChange(simplexSet(vals, k, newVal));
    },
    [vals, onAllChange] // eslint-disable-line react-hooks/exhaustive-deps
  );

  const onPointerUp = useCallback(() => {
    if (!dragging.current) return;
    dragging.current = null;
    try { window.dispatchEvent(new CustomEvent('gp:weights-commit')); } catch {}
  }, []);

  return (
    <svg
      ref={svgRef}
      width={SIZE}
      height={SIZE}
      viewBox={`0 0 ${SIZE} ${SIZE}`}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerLeave={onPointerUp}
      style={{ userSelect: 'none', touchAction: 'none', display: 'block', margin: '0 auto' }}
    >
      {/* Concentric rings */}
      {RING_STEPS.map((v) => (
        <circle
          key={v}
          cx={CX}
          cy={CY}
          r={v * R}
          fill="none"
          stroke="var(--ui-border, #e2e8f0)"
          strokeWidth={v === 1 ? 1 : 0.75}
          opacity={v === 1 ? 0.55 : 0.3}
        />
      ))}

      {/* Axis lines */}
      {KEYS.map((k) => {
        const end = axisPoint(CX, CY, R, k, 1);
        return (
          <line
            key={k}
            x1={CX} y1={CY}
            x2={end.x} y2={end.y}
            stroke="var(--ui-border, #e2e8f0)"
            strokeWidth={1}
            opacity={0.5}
          />
        );
      })}

      {/* Filled allocation polygon */}
      <polygon
        points={polygonPoints}
        fill="rgba(68,152,230,0.10)"
        stroke="rgba(68,152,230,0.55)"
        strokeWidth={1.5}
        strokeLinejoin="round"
      />

      {/* Option labels at axis ends */}
      {KEYS.map((k) => {
        const angle = AXIS_ANGLES[k];
        const lx = CX + LABEL_R * Math.cos(angle);
        const ly = CY + LABEL_R * Math.sin(angle);
        const opt = question.options.find((o) => o.key === k);
        const [line1, line2] = wrapWords(opt?.label ?? '', 2);
        const { anchor, baseline, dyOffset } = labelAlign(k);

        return (
          <text
            key={k}
            x={lx}
            y={ly + dyOffset}
            textAnchor={anchor}
            dominantBaseline={baseline}
            fontSize={8}
            fill="var(--ui-text-muted, #888)"
            style={{ pointerEvents: 'none' }}
          >
            <tspan x={lx} dy={0}>{line1}</tspan>
            {line2 && <tspan x={lx} dy={10}>{line2}</tspan>}
          </text>
        );
      })}

      {/* Draggable handles — large invisible hit area + visible glyph */}
      {KEYS.map((k) => {
        const pt = axisPoint(CX, CY, R, k, vals[k]);
        const color = SHAPE_COLORS[k];
        const pct = Math.round(vals[k] * 100);

        return (
          <g key={k} style={{ cursor: 'grab' }}>
            {/* Invisible hit area — pointer capture lives here */}
            <circle
              cx={pt.x} cy={pt.y} r={HANDLE_HIT}
              fill="transparent"
              style={{ cursor: 'grab' }}
              onPointerDown={onPointerDown(k)}
            />
            {/* Visible shape (no pointer events — hit area handles it) */}
            <ShapeHandle k={k} cx={pt.x} cy={pt.y} color={color} />
            {/* Percentage readout — only when meaningful */}
            {pct >= 5 && (
              <text
                x={pt.x + Math.cos(AXIS_ANGLES[k]) * 20}
                y={pt.y + Math.sin(AXIS_ANGLES[k]) * 20}
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize={8}
                fontWeight={600}
                fill={color}
                style={{ pointerEvents: 'none' }}
              >
                {pct}%
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
}

export default memo(RadarInputInner);
