// src/graph-runtime/gamification/gamification-personal.tsx

import React, { useEffect, useState } from 'react';
import CloseIcon from '../../assets/svg/close/CloseIcon';

import "../../styles/gamification.css";

import { useOptionalPreferences } from "../../app/state/preferences-context";
import { useOptionalUiFlow } from "../../app/state/ui-context";
import HintBanner from "../../app/ui/HintBanner";
import { useTransientFlag } from "../../lib/hooks/useTransientFlag";
import { saveSoloMessage } from "../../services/sanity/saveSoloMessage";

const FADE_MS = 200;
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
  shapeCopy?: string;
  mode?: 'relative' | 'absolute';
  onOpenChange?: (open: boolean) => void;
  belowCountStrict?: number;
  equalCount?: number;
  aboveCountStrict?: number;
  statsLoading?: boolean;
  zoomFraction?: number;
}

export default function GamificationPersonalized({
  userData,
  percentage,
  color,
  shapeCopy,
  mode = 'relative',
  onOpenChange,

  belowCountStrict,
  equalCount,
  aboveCountStrict,
  statsLoading = false,
  zoomFraction,
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
  const {
    visible: savedNoticeVisible,
    show: showSavedNotice,
    hide: hideSavedNotice,
  } = useTransientFlag(2500);


  const safePct = Math.max(0, Math.min(100, Math.round(Number(percentage) || 0)));
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
      showSavedNotice();
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

  if (!userData) return null;

  const panelId = `panel-${userData._id ?? 'me'}`;
  const wrapperVisible = open || (zoomFraction !== undefined ? zoomFraction > 0.7 : true);

  // bands (rank + ties)
  const b = Math.max(0, (belowCountStrict ?? 0) | 0);
  const e = Math.max(0, (equalCount ?? 0) | 0);
  const a = Math.max(0, (aboveCountStrict ?? 0) | 0);

  const bandInfo = classifyBand({ below: b, equal: e, above: a });

  // --- Personalized relative line (highlight only Top / Middle / Bottom words; numbers stay neutral) ---
  let relativeLine = null;
  if (mode === 'relative' && statsLoading) {
    relativeLine = <span className="stats-loading-word" role="status">Loading...</span>;
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

  const saveLabel = currentMessageStatus === 'saving' ? 'Saving' : 'Save';

  return (
    <div className={`personalized-root ${wrapperVisible ? 'is-visible' : ''}`}>
      <div className="personalized-anchor">
      {!open && (
        <button
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
          <div className={`gam-panel${mode === 'relative' ? ' is-team' : ''}`}>
            {mode === 'relative' ? (
              <>
                <p className="gam-copy">{relativeLine}</p>
                <p className="gam-score">
                  {safePct}
                  /100
                </p>
              </>
            ) : null}
            {mode === 'absolute' ? (
              <>
                {shapeCopy ? (
                  <h4 className="gam-subline">{shapeCopy}</h4>
                ) : normalizedSavedMessage ? (
                  <h4 className="gam-subline">{normalizedSavedMessage}</h4>
                ) : null}
                <div className="solo-message-intro">
                  <h4>Have a word to say?</h4>
                  <p>It stays here, with your shape.</p>
                </div>
              </>
            ) : null}
            {mode === 'absolute' ? (
              <form className="solo-message-form" onSubmit={(event) => { void handleSoloMessageSubmit(event); }}>
                <textarea
                  id={`${panelId}-message`}
                  className="solo-message-input"
                  aria-label="Personal message"
                  value={messageDraft}
                  maxLength={160}
                  rows={2}
                  placeholder="I've been thinking about..."
                  disabled={currentMessageStatus === 'saving'}
                  onClick={(event) => { event.stopPropagation(); }}
                  onChange={(event) => {
                    setDraftState({ entryId, value: event.currentTarget.value, dirty: true });
                    setMessageStatus({ entryId, state: 'idle', error: '' });
                    hideSavedNotice();
                  }}
                />
                <div className="solo-message-actions">
                  <span className="solo-message-count">{160 - messageDraft.length}</span>
                  <button
                    type="submit"
                    className="solo-message-save"
                    disabled={saveMessageDisabled}
                  >
                    <span className="solo-message-save__ghost" aria-hidden="true">Saving</span>
                    <span className="solo-message-save__inner">{saveLabel}</span>
                  </button>
                </div>
                {messageError ? <p className="solo-message-state is-error" role="alert">{messageError}</p> : null}
              </form>
            ) : null}
          </div>
          <HintBanner
            visible={savedNoticeVisible}
            className="solo-message-save-toast"
            closeLabel="Dismiss save confirmation"
            onDismiss={hideSavedNotice}
          >
            Message saved.
          </HintBanner>
        </div>
      )}
      </div>
    </div>
  );
}
