import { memo, useMemo, useState } from 'react';
import type { Question } from '../../../types';
import { defaultSliderVal } from '../../useQuestionFlowState';

const clamp01 = (n: number) => Math.max(0, Math.min(1, n));

export type SliderInputProps = {
  question: Question;
  sliderVals: Record<string, number>;
  onSliderChange: (key: string, val: number) => void;
  onCommit?: () => void;
  className?: string;
  qIndex?: number;
  qTotal?: number;
};

function SliderInputInner({ question, sliderVals, onSliderChange, onCommit, className, qIndex, qTotal }: SliderInputProps) {
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
      <div className="answers-stack">
        {qIndex !== undefined && qTotal !== undefined && (
          <span className="q-count" aria-hidden="true">{qIndex + 1}/{qTotal}</span>
        )}
        {rows.map((row, idx) => {
          const live = clamp01(Number(sliderVals[row.key] ?? defaultSliderVal(idx)));
          const fill = 'var(--ui-text-secondary)';
          const pct = Math.round(live * 100);
          const isDeactivated = live <= 0.02;
          const labelId = `${question.id}-option-${row.key}-label`;

          return (
            <div key={row.key} className="answer-row">
              <div className="answer-content">
                <div className="q-option">
                  <span
                    id={labelId}
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
                  onPointerUp={() => { setActiveKey(null); onCommit?.(); }}
                  onMouseUp={() => { onCommit?.(); }}
                  onTouchEnd={() => { setActiveKey(null); onCommit?.(); }}
                  aria-labelledby={labelId}
                  aria-valuemin={0}
                  aria-valuemax={1}
                  aria-valuenow={Number(live.toFixed(2))}
                  aria-valuetext={`${pct}% emphasis`}
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

export default memo(SliderInputInner);
