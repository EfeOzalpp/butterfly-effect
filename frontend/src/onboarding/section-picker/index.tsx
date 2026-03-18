// src/components/survey/sectionPicker/sectionPicker.tsx
import { useMemo, useRef, useState, useEffect, useCallback, useId } from 'react';

export type SectionHeader = { type: 'header'; id: string; label: string };

export type SectionOption = {
  type?: 'option'; // optional because this component will add it when missing
  value: string;
  label: string;
  aliases?: string[];
};

export type SectionItem = SectionHeader | SectionOption;

type Props = {
  value: string;
  onChange: (val: string) => void;
  onBegin: () => void;
  error: string;
  sections?: SectionItem[];
  placeholderOverride?: string;
  titleOverride?: string;
  onOpenChange?: (open: boolean) => void;
};

export default function SectionPickerIntro({
  value,
  onChange,
  onBegin,
  error,
  sections = [],
  placeholderOverride, // e.g., "Your Major..."
  titleOverride, // e.g., "Select Your Major"
  onOpenChange,
}: Props) {
  const titleId = useId();
  const helpId = useId();
  const errorId = useId();
  const hasHeaders = useMemo(
    () => Array.isArray(sections) && sections.some((s) => s && (s as any).type === 'header'),
    [sections]
  );

  const optionsWithHeaders = useMemo(() => {
    if (!Array.isArray(sections)) return [];
    return sections.map((s) => ((s as any)?.type === 'header' ? { ...(s as any) } : { ...(s as any), type: 'option' }));
  }, [sections]);

  const baseFocusable = useMemo(() => {
    const out: Array<any> = [];
    optionsWithHeaders.forEach((item: any, idx: number) => {
      if (item?.type !== 'header') out.push({ ...item, __listIndex: idx });
    });
    return out;
  }, [optionsWithHeaders]);

  const [open, setOpen] = useState(true);
  const [search, setSearch] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const [placement, setPlacement] = useState<'down' | 'up'>('down');

  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const listRef = useRef<HTMLDivElement | null>(null);
  const listboxId = 'section-listbox';
  const openedByPointer = useRef(false);

  const current = useMemo(() => baseFocusable.find((o: any) => o.value === value) || null, [baseFocusable, value]);

  const filteredFocusable = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return baseFocusable;
    return baseFocusable.filter((o: any) => {
      const labelMatch = (o.label || '').toLowerCase().includes(q);
      const valueMatch = (o.value || '').toLowerCase().includes(q);
      const aliasMatch = (o.aliases || []).some((a: any) => (a || '').toLowerCase().includes(q));
      return labelMatch || valueMatch || aliasMatch;
    });
  }, [baseFocusable, search]);

  const displayedList = useMemo(() => {
    if (!hasHeaders) return filteredFocusable;

    const filteredSet = new Set(filteredFocusable.map((o: any) => o.__listIndex));
    const out: any[] = [];
    let i = 0;
    while (i < optionsWithHeaders.length) {
      const item: any = optionsWithHeaders[i];
      if (item.type === 'header') {
        let j = i + 1,
          any = false;
        while (j < optionsWithHeaders.length && optionsWithHeaders[j].type !== 'header') {
          if (filteredSet.has(j)) {
            any = true;
            break;
          }
          j++;
        }
        if (any) {
          out.push(item);
          let k = i + 1;
          while (k < optionsWithHeaders.length && optionsWithHeaders[k].type !== 'header') {
            if (filteredSet.has(k)) out.push(optionsWithHeaders[k]);
            k++;
          }
          i = k;
          continue;
        } else {
          let k = i + 1;
          while (k < optionsWithHeaders.length && optionsWithHeaders[k].type !== 'header') k++;
          i = k;
          continue;
        }
      } else {
        if (filteredSet.has(i)) out.push(item);
        i++;
      }
    }
    return out;
  }, [hasHeaders, filteredFocusable, optionsWithHeaders]);

  const renderedFocusable = useMemo(() => {
    const out: any[] = [];
    displayedList.forEach((item: any, idx: number) => {
      if (item.type !== 'header') out.push({ ...item, __renderIndex: idx });
    });
    return out;
  }, [displayedList]);

  useEffect(() => {
    setActiveIndex((idx) => (renderedFocusable.length ? Math.min(Math.max(idx, 0), renderedFocusable.length - 1) : 0));
  }, [renderedFocusable.length]);

  useEffect(() => {
    onOpenChange?.(open);
  }, [open, onOpenChange]);

  useEffect(() => {
    const onDoc = (e: MouseEvent | TouchEvent) => {
      if (!wrapperRef.current) return;
      const t = e.target as Element | null;
      if (!t || wrapperRef.current.contains(t)) return;
      if (t.closest('button, a, [role="button"], [role="radio"], label')) return;
      setOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    document.addEventListener('touchstart', onDoc);
    return () => {
      document.removeEventListener('mousedown', onDoc);
      document.removeEventListener('touchstart', onDoc);
    };
  }, []);

  useEffect(() => {
    const computePlacement = () => {
      if (!inputRef.current) return;
      const rect = inputRef.current.getBoundingClientRect();
      const viewportH = window.innerHeight || document.documentElement.clientHeight;
      const spaceBelow = viewportH - rect.bottom;
      const estimatedRowHeight = 44;
      const estimatedHeaders = displayedList.filter((x: any) => x.type === 'header').length;
      const estimatedListHeight = Math.min(260, displayedList.length * estimatedRowHeight + estimatedHeaders * 8 + 12);
      setPlacement(spaceBelow >= estimatedListHeight ? 'down' : 'up');
    };
    if (open) computePlacement();
    const onWin = () => open && computePlacement();
    window.addEventListener('resize', onWin);
    window.addEventListener('scroll', onWin, true);
    return () => {
      window.removeEventListener('resize', onWin);
      window.removeEventListener('scroll', onWin, true);
    };
  }, [open, displayedList]);

  useEffect(() => {
    if (!open) return;
    if (openedByPointer.current) setSearch('');
    const t = setTimeout(() => inputRef.current && inputRef.current.focus(), 0);
    return () => clearTimeout(t);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const idx = renderedFocusable.findIndex((o: any) => o.value === value);
    if (idx >= 0) setActiveIndex(idx);
  }, [value, renderedFocusable, open]);

  const moveActive = useCallback(
    (delta: number) => {
      if (!renderedFocusable.length) return;
      setActiveIndex((idx) => (idx + delta + renderedFocusable.length) % renderedFocusable.length);
    },
    [renderedFocusable.length]
  );

  const chooseIndex = useCallback(
    (focusIdx: number, source: 'keyboard' | 'pointer' = 'keyboard') => {
      const opt = renderedFocusable[focusIdx];
      if (!opt) return;
      onChange(opt.value);
      if (source === 'pointer') {
        setSearch('');
        // Delay close so the Lottie selection animation (frames 0→15) can play
        setTimeout(() => setOpen(false), 260);
      } else {
        setOpen(false);
      }
    },
    [renderedFocusable, onChange]
  );

  const activeRenderedId =
    open && renderedFocusable[activeIndex] ? `opt-${renderedFocusable[activeIndex].value}` : undefined;

  const placeholderText = placeholderOverride ?? (current ? current.label : 'MassArt Dept...');
  const describedBy = [helpId, error ? errorId : null].filter(Boolean).join(' ');

  return (
    <section className="survey survey-step section-select" ref={wrapperRef}>
      <div className="continue">
        <h3 className="section-title" id={titleId}>{titleOverride ?? 'Select Your Department'}</h3>
        <p id={helpId} style={{ position: 'absolute', width: 1, height: 1, padding: 0, margin: -1, overflow: 'hidden', clip: 'rect(0, 0, 0, 0)', whiteSpace: 'nowrap', border: 0 }}>
          Type to filter departments, then use arrow keys to move through the list and Enter to select.
        </p>

      <div className="section-picker">
        <div
          className={`section-combobox ${open ? 'is-open' : ''}`}
          onMouseDown={() => {
            openedByPointer.current = true;
          }}
          onTouchStart={() => {
            openedByPointer.current = true;
          }}
          onClick={() => {
            setOpen(true);
          }}
        >
          <input
            ref={inputRef}
            id="section-combobox-input"
            type="text"
            className="section-input"
            role="combobox"
            aria-labelledby={titleId}
            aria-haspopup="listbox"
            aria-owns={listboxId}
            aria-expanded={open}
            aria-controls={listboxId}
            aria-activedescendant={activeRenderedId}
            aria-describedby={describedBy || undefined}
            aria-invalid={!!error}
            placeholder={placeholderText}
            value={open ? search : (current && current.label) || ''}
            inputMode="search"
            autoCapitalize="none"
            onFocus={() => {
              setOpen(true);
            }}
            onChange={(e) => {
              openedByPointer.current = false;
              if (!open) setOpen(true);
              setSearch(e.target.value);
            }}
            onKeyDown={(e) => {
              openedByPointer.current = false;
              if (e.key === 'ArrowDown') {
                e.preventDefault();
                if (!open) setOpen(true);
                moveActive(1);
              } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                if (!open) setOpen(true);
                moveActive(-1);
              } else if (e.key === 'Home') {
                e.preventDefault();
                setActiveIndex(0);
              } else if (e.key === 'End') {
                e.preventDefault();
                setActiveIndex(Math.max(0, renderedFocusable.length - 1));
              } else if (e.key === 'Enter') {
                e.preventDefault();
                if (open) chooseIndex(activeIndex, 'keyboard');
                else setOpen(true);
              } else if (e.key === 'Escape') {
                e.preventDefault();
                setOpen(false);
              }
            }}
            autoComplete="off"
            spellCheck={false}
          />
          <span className="section-chevron" aria-hidden>
            <svg className="section-chevron-svg ui-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <polyline points="6 9 12 15 18 9" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
        </div>

        {open && (
          <div
            ref={listRef}
            id={listboxId}
            role="listbox"
            className={`section-listbox ${placement === 'up' ? 'drop-up' : 'drop-down'}`}
            tabIndex={-1}
            onKeyDown={(e) => {
              if (e.key === 'ArrowDown') {
                e.preventDefault();
                moveActive(1);
              } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                moveActive(-1);
              } else if (e.key === 'Home') {
                e.preventDefault();
                setActiveIndex(0);
              } else if (e.key === 'End') {
                e.preventDefault();
                setActiveIndex(Math.max(0, renderedFocusable.length - 1));
              } else if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                chooseIndex(activeIndex, 'keyboard');
              } else if (e.key === 'Escape') {
                e.preventDefault();
                setOpen(false);
                inputRef.current && inputRef.current.focus();
              }
            }}
          >
            {displayedList.length === 0 && (
              <div className="section-empty" role="option" aria-disabled="true" aria-selected="false">
                No matches
              </div>
            )}

            {displayedList.map((item: any, idx: number) => {
              if (item.type === 'header') {
                return (
                  <span
                    key={`hdr-${item.id || idx}`}
                    className="section-group-header"
                    role="presentation"
                    aria-hidden="true"
                  >
                    {item.label}
                  </span>
                );
              }
              const selected = value === item.value;
              const isActive = renderedFocusable[activeIndex]?.__renderIndex === idx;
              return (
                <div
                  id={`opt-${item.value}`}
                  key={item.value}
                  role="option"
                  aria-selected={selected}
                  className={'section-option' + (isActive ? ' is-active' : '') + (selected ? ' is-selected' : '')}
                  onMouseEnter={() => {
                    const focusIdx = renderedFocusable.findIndex((f: any) => f.__renderIndex === idx);
                    if (focusIdx !== -1 && focusIdx !== activeIndex) {
                      setActiveIndex(focusIdx);
                    }
                  }}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => {
                    const focusIdx = renderedFocusable.findIndex((f: any) => f.__renderIndex === idx);
                    if (focusIdx >= 0) chooseIndex(focusIdx, 'pointer');
                  }}
                >
                  <span className="section-label">{item.label}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {error && (
        <div className="error-container" id={errorId} role="alert" aria-live="polite">
          <p>{error}</p>
          {!/section/i.test(error) && <p className="email-tag">Mail: eozalp@massart.edu</p>}
        </div>
      )}

      <div className="button-wrap"><button type="button" className="next-button" onClick={onBegin} aria-describedby={describedBy || undefined}>
        <span>Continue</span>
        <svg
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="continue-icon ui-icon"
        >
          <path
            d="M12 16L16 12M16 12L12 8M16 12H8M7.8 21H16.2C17.8802 21 18.7202 21 19.362 20.673C19.9265 20.3854 20.3854 19.9265 20.673 19.362C21 18.7202 21 17.8802 21 16.2V7.8C21 6.11984 21 5.27976 20.673 4.63803C20.3854 4.07354 19.9265 3.6146 19.362 3.32698C18.7202 3 17.8802 3 16.2 3H7.8C6.11984 3 5.27976 3 4.63803 3.32698C4.07354 3.6146 3.6146 4.07354 3.32698 4.63803C3 5.27976 3 6.11984 3 7.8V16.2C3 17.8802 3 18.7202 3.32698 19.362C3.6146 19.9265 4.07354 20.3854 4.63803 20.673C5.27976 21 6.11984 21 7.8 21Z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button></div>
      </div>
    </section>
  );
}
