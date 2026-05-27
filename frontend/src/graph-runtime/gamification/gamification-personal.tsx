// src/graph-runtime/gamification/gamification-personal.tsx

import React, { useEffect, useRef, useState, useMemo } from 'react';
import CloseIcon from '../../assets/svg/close/CloseIcon';

import "../../styles/gamification.css";

import {
  useGradientColor,
  DEFAULT_COLOR_OPTS,
} from "../../lib/utils/color-and-interpolation";

import { usePersonalizedPools } from "../../lib/hooks/useGamificationPools";
import { useOptionalPreferences } from "../../app/state/preferences-context";
import { useOptionalUiFlow } from "../../app/state/ui-context";
import { saveSoloMessage } from "../../services/sanity/saveSoloMessage";

const FADE_MS = 200;
const PROX_THRESHOLD = 0.02;
const CLOSE_GRACE_MS = 1000;
const NEUTRAL = 'rgba(255,255,255,0.95)';
type MessageStatus = 'idle' | 'saving' | 'saved' | 'error';

interface InlineLinesProps {
  children: React.ReactNode;
}

interface HighlightWordProps extends InlineLinesProps {
  color: string;
}

function InlineLines({ children }: InlineLinesProps) {
  return <span className="gam-inline-lines">{children}</span>;
}

function HighlightWord({ children, color }: HighlightWordProps) {
  return <strong style={{ textShadow: `0 0 7px ${color}` }}>{children}</strong>;
}

function classifyBand({ below: b, equal: e, above: a }: { below: number; equal: number; above: number }) {
  const totalOthers = Math.max(0, b | 0) + Math.max(0, e | 0) + Math.max(0, a | 0);
  const N = totalOthers + 1;
  const rankFromLow = (b | 0) + 1;
  const q = N > 0 ? rankFromLow / N : 0;

  const isSolo = totalOthers === 0;
  if (isSolo) return { band: 'solo', tie: 'none', N, b, e, a, q, rankFromLow };

  const isTopBand = a === 0;
  const isBottomBand = b === 0;

  const EDGE_COUNT = Math.max(2, Math.ceil(0.25 * N));
  const NEAR_Q = 0.30;

  const nearBottom = !isBottomBand && (rankFromLow <= EDGE_COUNT || q <= NEAR_Q);
  const nearTop    = !isTopBand    && ((N - rankFromLow + 1) <= EDGE_COUNT || q >= (1 - NEAR_Q));

  let band = 'middle';
  if (isTopBand) band = 'top';
  else if (isBottomBand) band = 'bottom';
  else if (nearTop) band = 'nearTop';
  else if (nearBottom) band = 'nearBottom';

  const canonicalTie =
    e > 0 ? (isTopBand ? 'tiedTop' : isBottomBand ? 'tiedBottom' : 'tiedMiddle') : 'notTied';

  return { band, tie: canonicalTie, N, b, e, a, q, rankFromLow };
}

interface GamificationPersonalizedProps {
  userData: { _id?: string; soloMessage?: string } | null | undefined;
  percentage: number | undefined;
  color: string;
  mode?: 'relative' | 'absolute';
  onOpenChange?: (open: boolean) => void;
  belowCountStrict?: number;
  equalCount?: number;
  aboveCountStrict?: number;
  positionClass?: string;
  tieContext?: string;
  selectedSectionId?: string;
  statsLoading?: boolean;
}

export default function GamificationPersonalized({
  userData,
  percentage,
  color,
  mode = 'relative',
  onOpenChange,

  belowCountStrict,
  equalCount,
  aboveCountStrict,
  positionClass: _positionClass,
  tieContext: _tieContext,

  selectedSectionId: _selectedSectionId,
  statsLoading = false,
}: GamificationPersonalizedProps) {
  const darkMode = !!useOptionalPreferences()?.darkMode;
  const ui = useOptionalUiFlow();
  const openPersonalized = ui?.openPersonalized;
  const setOpenPersonalized = ui?.setOpenPersonalized;

  // Title stays in the CMS contract, but this panel only renders the secondary line.
  const [open, setOpen] = useState(true);
  const [savedMessageOverride, setSavedMessageOverride] = useState<{
    entryId: string;
    value: string;
  } | null>(null);
  const [draftState, setDraftState] = useState<{
    entryId: string;
    value: string;
    dirty: boolean;
  } | null>(null);
  const [messageStatus, setMessageStatus] = useState<{
    entryId: string;
    state: MessageStatus;
    error: string;
  } | null>(null);

  const [closingGrace, setClosingGrace] = useState(false);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [nearButton, setNearButton] = useState(false);
  const btnRef = useRef<HTMLButtonElement | null>(null);
  const rafRef = useRef(0);
  const lastPointerRef = useRef({ x: 0, y: 0, has: false });

  const safePct = Math.max(0, Math.min(100, Math.round(Number(percentage) || 0)));
  const knobPct = Math.min(100, safePct + 5); // same visual bias as General

  const knobSample = useGradientColor(knobPct, DEFAULT_COLOR_OPTS);
  const { pick } = usePersonalizedPools();
  const knobColor = mode === 'absolute' ? knobSample.css : NEUTRAL;
  const entryId = userData?._id ?? 'me';
  const sourceSoloMessage = typeof userData?.soloMessage === 'string' ? userData.soloMessage : '';
  const savedSoloMessage =
    savedMessageOverride?.entryId === entryId ? savedMessageOverride.value : sourceSoloMessage;
  const draftForEntry = draftState?.entryId === entryId ? draftState : null;
  const messageDraft = draftForEntry?.dirty ? draftForEntry.value : savedSoloMessage;
  const currentMessageStatus = messageStatus?.entryId === entryId ? messageStatus.state : 'idle';
  const messageError = messageStatus?.entryId === entryId ? messageStatus.error : '';
  const normalizedDraft = messageDraft.trim().replace(/\s+/g, ' ');
  const normalizedSavedMessage = savedSoloMessage.trim().replace(/\s+/g, ' ');
  const canSaveSoloMessage = Boolean(
    mode === 'absolute' &&
    userData?._id &&
    !userData._id.startsWith('pending-')
  );
  const saveMessageDisabled =
    currentMessageStatus === 'saving' ||
    !canSaveSoloMessage ||
    normalizedDraft === normalizedSavedMessage;

  const secondaryText = useMemo(() => {
    if (percentage === undefined || !userData) return '';

    const fallbackBuckets = {
      '0-20':   { titles: ['Light Footprint', 'Just Starting', 'Small Steps'],      secondary: ['It\'s not about being perfect; it\'s about direction.'] },
      '21-40':  { titles: ['Stepping Lighter', 'Building Momentum', 'On the Way'], secondary: ['What we buy travels farther than most people ever do.'] },
      '41-60':  { titles: ['Finding Balance', 'In the Mix', 'Middle Path'],         secondary: ['Put yogurt and tomato paste, and butter on poached eggs.'] },
      '61-80':  { titles: ['Leaving a Mark', 'Making Moves', 'Full Life'],          secondary: ['Tree branches that hold the cloud...'] },
      '81-100': { titles: ['Deep Footprint', 'Full Throttle', 'Heavy Load'],        secondary: ['Learning from past to prepare for future, today.'] },
    };

    const chosen = pick(safePct, 'gp', userData._id ?? 'me', fallbackBuckets);
    return mode === 'absolute' ? (chosen?.secondary ?? '') : '';
  }, [percentage, userData, safePct, pick, mode]);

  const visibleSecondaryText = normalizedSavedMessage || secondaryText;

  const handleSoloMessageSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    event.stopPropagation();
    if (saveMessageDisabled) return;

    setMessageStatus({ entryId, state: 'saving', error: '' });
    try {
      const updated = await saveSoloMessage(messageDraft);
      const next = updated.soloMessage ?? '';
      const nextEntryId = updated._id || entryId;
      setSavedMessageOverride({ entryId: nextEntryId, value: next });
      setDraftState({ entryId: nextEntryId, value: next, dirty: false });
      setMessageStatus({ entryId: nextEntryId, state: 'saved', error: '' });
    } catch (error) {
      console.error('[GamificationPersonalized] save solo message failed:', error);
      setMessageStatus({
        entryId,
        state: 'error',
        error: error instanceof Error ? error.message : 'Message could not be saved.',
      });
    }
  };

  useEffect(() => { onOpenChange?.(open); }, [open, onOpenChange]);

  useEffect(() => {
    if (!openPersonalized) return;
    const timerId = window.setTimeout(() => {
      setOpen(true);
    }, 0);
    setOpenPersonalized?.(false);
    return () => {
      window.clearTimeout(timerId);
    };
  }, [openPersonalized, setOpenPersonalized]);

  useEffect(() => {
    const scheduleCheck = () => {
      if (rafRef.current) return;
      rafRef.current = requestAnimationFrame(() => {
        rafRef.current = 0;
        if (!btnRef.current) return;

        const rect = btnRef.current.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;

        const { innerWidth: vw, innerHeight: vh } = window;
        const px = lastPointerRef.current.has ? lastPointerRef.current.x : -9999;
        const py = lastPointerRef.current.has ? lastPointerRef.current.y : -9999;

        const dx = (px - cx) / vw;
        const dy = (py - cy) / vh;
        const dist = Math.sqrt(dx * dx + dy * dy);

        setNearButton(dist < PROX_THRESHOLD);
      });
    };

    const onMouseMove = (e: MouseEvent) => { lastPointerRef.current = { x: e.clientX, y: e.clientY, has: true }; scheduleCheck(); };
    const onTouchMove = (e: TouchEvent) => {
      if (!e.touches.length) return;
      const t = e.touches[0];
      lastPointerRef.current = { x: t.clientX, y: t.clientY, has: true };
      scheduleCheck();
    };
    const onResizeOrScroll = () => {
      scheduleCheck();
    };

    window.addEventListener('mousemove', onMouseMove, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: true });
    window.addEventListener('resize', onResizeOrScroll);
    window.addEventListener('scroll', onResizeOrScroll, { passive: true });

    scheduleCheck();
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('resize', onResizeOrScroll);
      window.removeEventListener('scroll', onResizeOrScroll);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  useEffect(() => {
    const stateTimer = window.setTimeout(() => {
      setClosingGrace(!open);
    }, 0);

    if (!open) {
      if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
      closeTimerRef.current = setTimeout(() => {
        setClosingGrace(false);
        closeTimerRef.current = null;
      }, CLOSE_GRACE_MS);
    } else {
      if (closeTimerRef.current) {
        clearTimeout(closeTimerRef.current);
        closeTimerRef.current = null;
      }
    }
    return () => {
      window.clearTimeout(stateTimer);
      if (closeTimerRef.current) {
        clearTimeout(closeTimerRef.current);
        closeTimerRef.current = null;
      }
    };
  }, [open]);

  if (!userData) return null;

  const panelId = `panel-${userData._id ?? 'me'}`;
  const wrapperVisible = open || closingGrace || nearButton;

  // bands (rank + ties)
  const b = Math.max(0, (belowCountStrict ?? 0) | 0);
  const e = Math.max(0, (equalCount ?? 0) | 0);
  const a = Math.max(0, (aboveCountStrict ?? 0) | 0);

  const bandInfo = classifyBand({ below: b, equal: e, above: a });

  // --- Personalized relative line (highlight only Top / Middle / Bottom words; numbers stay neutral) ---
  let relativeLine = null;
  if (mode === 'relative' && statsLoading) {
    relativeLine = <>Loading stats</>;
  } else if (mode === 'relative') {
    const { band, tie, b: bb, e: ee, a: aa } = bandInfo;

    switch (band) {
      case 'solo':
        relativeLine = <>You're the first one here.</>;
        break;
      case 'top':
        relativeLine = tie === 'tiedTop'
          ? <InlineLines><span>Sharing the very <HighlightWord color={color}>top</HighlightWord>.</span><span>Tied with {ee}.</span></InlineLines>
          : <InlineLines><span>You're on <HighlightWord color={color}>top</HighlightWord>,</span><span>ahead of everyone else.</span></InlineLines>;
        break;
      case 'nearTop':
        relativeLine = ee > 0
          ? <InlineLines><span>Close to the <HighlightWord color={color}>top</HighlightWord>.</span><span>Behind {aa}</span><span>Tied with {ee}.</span></InlineLines>
          : <InlineLines><span>Close to the <HighlightWord color={color}>top</HighlightWord>.</span><span>Behind {aa}</span></InlineLines>;
        break;
      case 'bottom':
        relativeLine = tie === 'tiedBottom'
          ? <InlineLines><span>At the <HighlightWord color={color}>bottom</HighlightWord>.</span><span>Tied with {ee}.</span></InlineLines>
          : <InlineLines><span>At the <HighlightWord color={color}>bottom</HighlightWord>.</span><span>Everyone else is ahead.</span></InlineLines>;
        break;
      case 'nearBottom':
        relativeLine = ee > 0
          ? <InlineLines><span>Near the <HighlightWord color={color}>bottom</HighlightWord>.</span><span>Ahead of {bb}</span><span>Tied with {ee}.</span></InlineLines>
          : <InlineLines><span>Near the <HighlightWord color={color}>bottom</HighlightWord>.</span><span>Ahead of {bb}</span></InlineLines>;
        break;
      default: {
        // middle
        if (tie === 'tiedMiddle') {
          relativeLine = <InlineLines><span>In the <HighlightWord color={color}>middle</HighlightWord>.</span><span>Ahead of {bb}</span><span>Behind {aa}</span><span>Tied with {ee}.</span></InlineLines>;
        } else if (aa < bb) {
          relativeLine = <InlineLines><span>In the <HighlightWord color={color}>middle</HighlightWord>.</span><span>Behind {aa}</span></InlineLines>;
        } else if (bb < aa) {
          relativeLine = <InlineLines><span>In the <HighlightWord color={color}>middle</HighlightWord>.</span><span>Ahead of {bb}</span></InlineLines>;
        } else {
          relativeLine = <InlineLines><span>In the <HighlightWord color={color}>middle</HighlightWord>.</span><span>Ahead of {bb}</span><span>Behind {aa}</span></InlineLines>;
        }
      }
    }
  }

  const line =
    mode === 'relative'
      ? (
        <>{relativeLine}</>
      )
      : (
        <>
          <strong style={{ textShadow: `0 0 7px ${color}, 0 0 14px ${knobColor}` }}>
            {safePct}
          </strong>
          /100
        </>
      );

  return (
    <div className={`personalized-root ${wrapperVisible ? 'is-visible' : ''}`}>
      <div className="personalized-anchor">
      {!open && (
        <button
          ref={btnRef}
          type="button"
          className={`toggle-button toggle${darkMode ? ' is-dark' : ''}`}
          aria-controls={panelId}
          aria-expanded={false}
          aria-label="Open personalized panel"
          onClick={(e) => { e.stopPropagation(); setOpen(true); }}
          style={{ pointerEvents: 'auto' }}
        >
          <span className="toggle-icon is-closed" aria-hidden>
            <svg className="icon-plus ui-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <line x1="12" y1="5"  x2="12" y2="19" strokeWidth="2.5" />
              <line x1="5"  y1="12" x2="19" y2="12" strokeWidth="2.5" />
            </svg>
          </span>
        </button>
      )}

      {open && (
        <div
          id={panelId}
          className="personalized-result"
          style={{ pointerEvents: 'auto', transition: `opacity ${String(FADE_MS)}ms ease` }}
        >
          <button
            type="button"
            className="personal-close-btn"
            aria-label="Close personalized panel"
            onClick={(e) => { e.stopPropagation(); setOpen(false); }}
          >
            <CloseIcon className="ui-close" />
          </button>
          <div className={`gam-general${mode === 'relative' ? ' is-team' : ''}`}>
            {mode === 'absolute' && visibleSecondaryText ? (
              <h4 className="gam-subline">{visibleSecondaryText}</h4>
            ) : null}
            {mode === 'relative' ? (
              <p className="gam-general-copy">{line}</p>
            ) : (
              <p className="gam-general-copy">
                <strong style={{ textShadow: `0 0 7px ${color}, 0 0 14px ${knobColor}` }}>
                  {safePct}
                </strong>
                /100
              </p>
            )}
            {mode === 'absolute' ? (
              <form className="solo-message-form" onSubmit={(event) => { void handleSoloMessageSubmit(event); }}>
                <label className="solo-message-label" htmlFor={`${panelId}-message`}>Message</label>
                <textarea
                  id={`${panelId}-message`}
                  className="solo-message-input"
                  value={messageDraft}
                  maxLength={160}
                  rows={2}
                  placeholder="Type a message..."
                  disabled={currentMessageStatus === 'saving'}
                  onClick={(event) => { event.stopPropagation(); }}
                  onChange={(event) => {
                    setDraftState({ entryId, value: event.currentTarget.value, dirty: true });
                    setMessageStatus({ entryId, state: 'idle', error: '' });
                  }}
                />
                <div className="solo-message-actions">
                  <span className="solo-message-count">{160 - messageDraft.length}</span>
                  <button
                    type="submit"
                    className="solo-message-save"
                    disabled={saveMessageDisabled}
                  >
                    {currentMessageStatus === 'saving' ? 'Saving' : 'Save'}
                  </button>
                </div>
                {currentMessageStatus === 'saved' ? <p className="solo-message-state">Saved</p> : null}
                {messageError ? <p className="solo-message-state is-error">{messageError}</p> : null}
              </form>
            ) : null}
          </div>
        </div>
      )}
      </div>
    </div>
  );
}
