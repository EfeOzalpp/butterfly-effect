import React, { useEffect, useState, useMemo } from 'react';

import '../../styles/gamification.css';

import {
  useGradientColor,
  DEFAULT_COLOR_OPTS,
} from "../../lib/utils/color-and-interpolation";

import { useGeneralPools } from "../../lib/hooks/useGamificationPools";

const NEUTRAL = 'rgba(255,255,255,0.95)';

export default function GamificationGeneral({
  dotId,
  percentage,
  color,
  mode = 'relative',
  belowCountStrict,
  equalCount,
  aboveCountStrict,
  positionClass,
  tieContext,
}) {
  const [currentText, setCurrentText] = useState({ title: '', description: '' });
  
  const safePct = Math.max(0, Math.min(100, Math.round(Number(percentage) || 0)));

  // small visual bias so the knob matches the lighter bar mid
  const knobPct = Math.min(100, safePct + 5);

  const knobSample = useGradientColor(knobPct, DEFAULT_COLOR_OPTS);
  const knobColor  = mode === 'absolute' ? knobSample.css : NEUTRAL;
    
  const { pick, loaded } = useGeneralPools();

  const Strong = useMemo(
    () =>
      function Strong({ children }) {
        return <strong style={{ textShadow: `0 0 12px ${color}` }}>{children}</strong>;
      },
    [color]
  );
  const Lines = useMemo(
    () =>
      function Lines({ children }) {
        return <span className="gam-inline-lines">{children}</span>;
      },
    []
  );

  // counts
  const b = Math.max(0, (belowCountStrict ?? 0) | 0);
  const e = Math.max(0, (equalCount ?? 0) | 0);
  const a = Math.max(0, (aboveCountStrict ?? 0) | 0);
  const totalOthers = b + e + a;

  // rank + percentile
  const N = totalOthers + 1;
  const rankFromLow = b + 1;
  const q = N > 0 ? rankFromLow / N : 0;

  // heuristics
  const SMALL = N < 8;
  const BOTTOM_Q = 0.15;
  const TOP_Q = 0.85;
  const NEAR_M = 0.05;

  // bands
  const isSolo = totalOthers === 0 || positionClass === 'solo';
  const isTopBand = !isSolo && a === 0;
  const isBottomBand = !isSolo && b === 0;
  const isNearTop = !isSolo && !isTopBand && (SMALL ? a === 1 : q >= TOP_Q - NEAR_M);
  const isNearBottom = !isSolo && !isBottomBand && (SMALL ? b === 1 : q <= BOTTOM_Q + NEAR_M);

  // canonical tie state (derived)
  const canonicalTie =
    e > 0 ? (isTopBand ? 'tiedTop' : isBottomBand ? 'tiedBottom' : 'tiedMiddle') : 'notTied';

  useEffect(() => {
    if (!loaded) return;

    const fallbackBuckets = {
      '0-20': {
        titles: ['Low Impact', 'Early Stage'],
        secondary: ['Low effort, just ahead of a few'],
      },
      '21-40': {
        titles: ['Below Average', 'Getting Started'],
        secondary: ['Slow start, keep going'],
      },
      '41-60': {
        titles: ['Average'],
        secondary: ['Right in the pack'],
      },
      '61-80': {
        titles: ['Above Average', 'Solid Standing'],
        secondary: ['Solid progress'],
      },
      '81-100': {
        titles: ['High Impact', 'Leading Group'],
        secondary: ['Top of the class'],
      },
    };

    if (!dotId || percentage === undefined) return;
    const chosen = pick(safePct, 'gd', String(dotId), fallbackBuckets);

    setCurrentText(
      chosen
        ? { title: chosen.title, description: chosen.secondary || '' }
        : { title: 'Eco Participant', description: '' }
    );
  }, [dotId, percentage, safePct, pick, loaded]);

  if (!dotId || percentage === undefined || color === undefined) return null;

  // --- RELATIVE MODE (highlight only Top / Middle / Bottom words; numbers stay neutral) ---
  let relativeLine = null;

  if (mode === 'relative') {
    const band = isSolo ? 'solo' : isTopBand ? 'top' : isBottomBand ? 'bottom' : isNearTop ? 'nearTop' : isNearBottom ? 'nearBottom' : 'middle';

    switch (band) {
      case 'solo':
        relativeLine = <>First one here.</>;
        break;
      case 'top':
        relativeLine = canonicalTie === 'tiedTop'
          ? <Lines><span><Strong>Top</Strong> spot.</span><span>Tied with {e}</span></Lines>
          : <><Strong>Top</Strong> of the group</>;
        break;
      case 'nearTop':
        relativeLine = e > 0
          ? <Lines><span>Near <Strong>Top</Strong>.</span><span>Tied with {e}</span><span>Behind {a}</span></Lines>
          : <Lines><span>Near <Strong>Top</Strong>.</span><span>Behind {a}</span></Lines>;
        break;
      case 'bottom':
        relativeLine = canonicalTie === 'tiedBottom'
          ? <Lines><span><Strong>Bottom</Strong>.</span><span>Tied with {e}</span></Lines>
          : <><Strong>Bottom</Strong></>;
        break;
      case 'nearBottom':
        relativeLine = e > 0
          ? <Lines><span>Near <Strong>Bottom</Strong>.</span><span>Tied with {e}</span><span>Ahead of {b}</span></Lines>
          : <Lines><span>Near <Strong>Bottom</Strong>.</span><span>Ahead of {b}</span></Lines>;
        break;
      default: {
        // middle
        if (canonicalTie === 'tiedMiddle') {
          relativeLine = <Lines><span><Strong>Middle</Strong>.</span><span>Tied with {e}</span><span>Ahead of {b}</span><span>Behind {a}</span></Lines>;
        } else if (a < b) {
          relativeLine = <Lines><span><Strong>Middle</Strong>.</span><span>Behind {a}</span></Lines>;
        } else if (b < a) {
          relativeLine = <Lines><span><Strong>Middle</Strong>.</span><span>Ahead of {b}</span></Lines>;
        } else {
          relativeLine = <Lines><span><Strong>Middle</Strong>.</span><span>Ahead of {b}</span><span>Behind {a}</span></Lines>;
        }
      }
    }

    if (!relativeLine) relativeLine = <>In the mix.</>;
  }

  const line =
    mode === 'relative' ? (
      <>{relativeLine}</>
    ) : (
      <>
        {' '}
        <strong style={{ textShadow: `0 0 12px ${color}, 0 0 22px ${knobSample.css}` }}>
          {Math.round(safePct)}
        </strong>
        /100
      </>
    );

  const { description } = currentText;

  return (
    <div className="generalized-result">
      <div className="gam-general">
        <div className="gam-general-description">
          {/* no title in either mode */}
          {mode === 'absolute' && description ? (
            <h4 className="gam-subline">{description}</h4>
          ) : null}
          <p>{line}</p>
        </div>

        {mode === 'absolute' && (
          <div className="gam-visualization">
            <div className="gam-percentage-knob">
              <div
                className="gam-knob-arrow"
                style={{
                  bottom: `${safePct}%`,
                  borderBottom: `18px solid ${knobColor}`,
                }}
              />
            </div>
            <div className="gam-percentage-bar" />
          </div>
        )}
      </div>
    </div>
  );
}
