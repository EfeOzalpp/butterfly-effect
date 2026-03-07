// src/components/survey/questions/AnswersList.tsx
import { memo, useMemo } from 'react';
import type { Question } from '../types';

export type ShapeKeyLocal = 'circle' | 'square' | 'triangle' | 'diamond';

const SHAPE_COLORS: Record<ShapeKeyLocal, string> = {
  triangle: '#F4A42F',
  circle:   '#4498E6',
  square:   '#64B883',
  diamond:  '#9E82F1',
};
const OUTER_GRAY = '#6f7781';
const ease = (t: number) => t * t * (3 - 2 * t);
const clamp01 = (n: number) => Math.max(0, Math.min(1, n));

const hexToRgb = (hex: string) => {
  const n = hex.replace('#', '');
  const s = n.length === 3 ? n.split('').map(c => c + c).join('') : n;
  const v = parseInt(s, 16);
  return { r: (v >> 16) & 255, g: (v >> 8) & 255, b: v & 255 };
};
const toHex2 = (n: number) => n.toString(16).padStart(2, '0');
const rgbToHex = (r: number, g: number, b: number) => `#${toHex2(r)}${toHex2(g)}${toHex2(b)}`;
const mix = (a: string, b: string, t: number) => {
  const A = hexToRgb(a), B = hexToRgb(b);
  const lerp = (x: number, y: number) => Math.round(x + (y - x) * t);
  return rgbToHex(lerp(A.r, B.r), lerp(A.g, B.g), lerp(A.b, B.b));
};
const colorFor = (shape: ShapeKeyLocal, factor: number) => {
  const t = ease(clamp01(factor));
  return mix(OUTER_GRAY, SHAPE_COLORS[shape], t);
};

const keyToShape = (key: string): ShapeKeyLocal => {
  const k = key.toUpperCase();
  if (k === 'A') return 'circle';
  if (k === 'B') return 'square';
  if (k === 'C') return 'triangle';
  return 'diamond';
};

const ShapeGlyph = ({ shape, color, size = 18 }: { shape: ShapeKeyLocal; color: string; size?: number }) => {
  const half = size / 2;
  const triR = size * 0.42, sqS = size * 0.75, cirR = size * 0.44, diaS = size * 0.74;
  if (shape === 'triangle') {
    const a = -Math.PI / 2, step = (2 * Math.PI) / 3;
    const p1 = `${half + triR * Math.cos(a)},${half + triR * Math.sin(a)}`;
    const p2 = `${half + triR * Math.cos(a + step)},${half + triR * Math.sin(a + step)}`;
    const p3 = `${half + triR * Math.cos(a + 2 * step)},${half + triR * Math.sin(a + 2 * step)}`;
    return (
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden>
        <polygon points={`${p1} ${p2} ${p3}`} fill={color} />
      </svg>
    );
  }
  if (shape === 'square') {
    return (
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden>
        <rect x={half - sqS / 2} y={half - sqS / 2} width={sqS} height={sqS} fill={color} rx={size * 0.06} />
      </svg>
    );
  }
  if (shape === 'diamond') {
    return (
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden>
        <g transform={`translate(${half} ${half}) rotate(45)`}>
          <rect x={-diaS / 2} y={-diaS / 2} width={diaS} height={diaS} fill={color} rx={size * 0.05} />
        </g>
      </svg>
    );
  }
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden>
      <circle cx={half} cy={half} r={cirR} fill={color} />
    </svg>
  );
};

type Props = {
  question: Question;
  sliderVals: Record<string, number>;
  onSliderChange: (key: string, val: number) => void;
  className?: string;
};

function AnswersListInner({ question, sliderVals, onSliderChange, className }: Props) {
  const rows = useMemo(() => {
    return question.options.map((o) => ({
      key: o.key,
      label: o.label,
      shape: keyToShape(o.key),
    }));
  }, [question.options]);

  return (
    <div
      className={`answer-part ${className ?? ''}`.trim()}
      aria-live="polite"
    >
      {/* Scoped slider styling */}
      <style>{`
        .q-slider {
          -webkit-appearance: none;
          appearance: none;
          height: 4px;
          border-radius: 999px;
          outline: none;
          background: #D7DDE4;
        }
        .q-slider:focus { outline: none; }

        .q-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 18px; height: 18px;
          border: 2px solid #fff;
          background: var(--thumb-color, #999);
          box-shadow: 0 1px 3px rgba(0,0,0,.15);
          border-radius: 50%;
        }
        .q-slider[data-shape="square"]::-webkit-slider-thumb {
          border-radius: 4px;
        }
        .q-slider[data-shape="diamond"]::-webkit-slider-thumb {
          border-radius: 4px;
          transform: rotate(45deg);
        }
        .q-slider[data-shape="triangle"]::-webkit-slider-thumb {
          border-radius: 0;
          -webkit-clip-path: polygon(50% 0%, 0% 100%, 100% 100%);
                  clip-path: polygon(50% 0%, 0% 100%, 100% 100%);
          background: var(--thumb-color, #999);
        }

        .q-slider::-moz-range-thumb {
          width: 18px; height: 18px;
          border: 2px solid #fff;
          background: var(--thumb-color, #999);
          box-shadow: 0 1px 3px rgba(0,0,0,.15);
          border-radius: 50%;
        }
        .q-slider[data-shape="square"]::-moz-range-thumb { border-radius: 4px; }
        .q-slider[data-shape="diamond"]::-moz-range-thumb {
          border-radius: 4px;
          transform: rotate(45deg);
        }
        .q-slider[data-shape="triangle"]::-moz-range-thumb {
          border-radius: 0;
          clip-path: polygon(50% 0%, 0% 100%, 100% 100%);
          background: var(--thumb-color, #999);
        }
        .q-slider::-moz-range-track { background: transparent; }
      `}</style>

      <div className="answers-stack">
        {rows.map(row => {
          const live = clamp01(Number(sliderVals[row.key] ?? 0.5));
          const fill = colorFor(row.shape, live);
          const pct = Math.round(live * 100);
          const isDeactivated = live <= 0.02;

          return (
            <div key={row.key} className="answer-row-wrap">
              <div className={`answer-row shape--${row.shape}`}>
                <div className="answer-content">
                  <div className="q-option">
                    <span
                      className="q-option-label"
                      style={{
                        color: isDeactivated ? '#97A1AF' : undefined,
                        display: 'block',
                        minWidth: 0,
                        maxWidth: '100%',
                      }}
                    >
                      {row.label}
                    </span>
                  </div>
                  <div className="q-option-shape" aria-hidden>
                    <ShapeGlyph shape={row.shape} color={fill} />
                  </div>
                </div>
              </div>

              <div className="option-slider">
                <div className="slider-inner">
                  <p className="none" style={{ margin: 0, whiteSpace: 'nowrap' }}>none</p>
                  <input
                    id={`slider-${row.key}`}
                    type="range"
                    min={0}
                    max={1}
                    step={0.01}
                    value={live}
                    onInput={(e) => onSliderChange(row.key, (e.target as HTMLInputElement).valueAsNumber)}
                    onChange={(e) => onSliderChange(row.key, (e.target as HTMLInputElement).valueAsNumber)}
                    onMouseUp={() => { try { window.dispatchEvent(new CustomEvent('gp:weights-commit')); } catch {} }}
                    onTouchEnd={() => { try { window.dispatchEvent(new CustomEvent('gp:weights-commit')); } catch {} }}
                    aria-valuemin={0}
                    aria-valuemax={1}
                    aria-valuenow={Number(live.toFixed(2))}
                    className="q-slider"
                    data-shape={row.shape}
                    style={{
                      flex: 1,
                      height: 4,
                      borderRadius: 999,
                      outline: 'none',
                      background: `linear-gradient(to right, ${fill} ${pct}%, #D7DDE4 ${pct}%)`,
                      ['--thumb-color' as any]: fill,
                    }}
                  />
                  <p className="alot" style={{ margin: 0, whiteSpace: 'nowrap' }}>a lot</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default memo(AnswersListInner);
