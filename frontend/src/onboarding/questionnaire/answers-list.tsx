// src/components/survey/questions/AnswersList.tsx
import { memo, useMemo, useState } from 'react';
import type { Question } from '../types';

const clamp01 = (n: number) => Math.max(0, Math.min(1, n));

type Props = {
  question: Question;
  sliderVals: Record<string, number>;
  onSliderChange: (key: string, val: number) => void;
  className?: string;
  qIndex?: number;
  qTotal?: number;
};

function AnswersListInner({ question, sliderVals, onSliderChange, className, qIndex, qTotal }: Props) {
  const [activeKey, setActiveKey] = useState<string | null>(null);

  const rows = useMemo(() => {
    return question.options.map((o) => ({
      key: o.key,
      label: o.label,
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
          background: var(--ui-border);
        }
        .q-slider:hover { outline: 1px solid var(--btn-primary-border); outline-offset: 3px; }
        .q-slider:focus { outline: none; }

        .q-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 3px; height: 20px;
          box-sizing: content-box;
          border: 2px solid var(--ui-bg-surface);
          background: var(--thumb-color, #999);
          border-radius: 3px;
          opacity: 0.85;
        }

        .q-slider::-moz-range-thumb {
          width: 3px; height: 20px;
          box-sizing: content-box;
          border: 2px solid var(--ui-bg-surface);
          background: var(--thumb-color, #999);
          border-radius: 3px;
          opacity: 0.85;
        }
        .q-slider::-moz-range-track { background: transparent; }
      `}</style>

      <div className="answers-stack">
        {qIndex !== undefined && qTotal !== undefined && (
          <span className="q-count">{qIndex + 1}/{qTotal}</span>
        )}
        {rows.map((row, idx) => {
          const live = clamp01(Number(sliderVals[row.key] ?? (idx % 2 === 0 ? 0.33 : 0.66)));
          const fill = 'var(--ui-text-secondary)';
          const pct = Math.round(live * 100);
          const isDeactivated = live <= 0.02;

          return (
            <div key={row.key} className="answer-row">
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
                </div>

                <div className="slider-inner">
                  <input
                    id={`slider-${row.key}`}
                    type="range"
                    min={0}
                    max={1}
                    step={0.01}
                    value={live}
                    onInput={(e) => onSliderChange(row.key, (e.target as HTMLInputElement).valueAsNumber)}
                    onChange={(e) => onSliderChange(row.key, (e.target as HTMLInputElement).valueAsNumber)}
                    onPointerDown={() => setActiveKey(row.key)}
                    onPointerUp={() => { setActiveKey(null); try { window.dispatchEvent(new CustomEvent('gp:weights-commit')); } catch {} }}
                    onMouseUp={() => { try { window.dispatchEvent(new CustomEvent('gp:weights-commit')); } catch {} }}
                    onTouchEnd={() => { setActiveKey(null); try { window.dispatchEvent(new CustomEvent('gp:weights-commit')); } catch {} }}
                    aria-valuemin={0}
                    aria-valuemax={1}
                    aria-valuenow={Number(live.toFixed(2))}
                    className="q-slider"
                    style={{
                      flex: 1,
                      height: activeKey === row.key ? 15 : 9,
                      borderRadius: 999,
                      outline: 'none',
                      background: `linear-gradient(to right, ${fill} ${pct}%, var(--ui-border) ${pct}%)`,
                      opacity: isDeactivated ? 0.4 : 1,
                      ['--thumb-color' as any]: fill,
                    }}
                  />
                </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default memo(AnswersListInner);
