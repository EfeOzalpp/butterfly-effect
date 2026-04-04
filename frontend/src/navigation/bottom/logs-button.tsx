import { useEffect, useMemo, useRef, useState } from "react";
import "../../styles/logs.css";
import { useSurveyData } from "../../app/state/survey-data-context";
import CloseIcon from "../../assets/svg/close/CloseIcon";
import SearchIcon from "../../assets/svg/search/SearchIcon";

const PAGE_SIZE = 50;

function fmt(v?: number): string {
  return v != null ? v.toFixed(2) : "—";
}

function fmtQs(row: { q1?: number; q2?: number; q3?: number; q4?: number; q5?: number }): string {
  return [row.q1, row.q2, row.q3, row.q4, row.q5].map(fmt).join(", ");
}

function formatSectionLabel(section?: string): string {
  return (section ?? "").replace(/-/g, " ");
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export default function LogsButton({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const { allFilteredRows: data } = useSurveyData();
  const setOpen = onOpenChange;
  const [page, setPage] = useState(0);
  const [query, setQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [filterFocused, setFilterFocused] = useState(false);
  const filterInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!searchOpen) return;
    filterInputRef.current?.focus();
  }, [searchOpen]);

  useEffect(() => {
    if (open) return;
    setFilterFocused(false);
    if (!query.trim()) setSearchOpen(false);
  }, [open, query]);

  // Sort ascending by submittedAt (earliest = #1)
  const sorted = useMemo(() => {
    return [...data].sort((a, b) => {
      const da = a.submittedAt ?? a._createdAt;
      const db = b.submittedAt ?? b._createdAt;
      return da < db ? -1 : da > db ? 1 : 0;
    });
  }, [data]);

  // Rank by avgWeight descending (rank 1 = highest avg)
  const rankById = useMemo(() => {
    const byAvg = [...sorted].sort((a, b) => (b.avgWeight ?? 0) - (a.avgWeight ?? 0));
    const map = new Map<string, number>();
    byAvg.forEach((row, i) => map.set(row._id, i + 1));
    return map;
  }, [sorted]);

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return sorted;

    return sorted.filter((row) => {
      const rank = rankById.get(row._id) ?? 0;
      const haystack = [
        formatSectionLabel(row.section),
        fmt(row.avgWeight),
        String(rank),
        fmtQs(row),
      ]
        .join(" ")
        .toLowerCase();

      return haystack.includes(term);
    });
  }, [query, rankById, sorted]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages - 1);
  const pageRows = filtered.slice(safePage * PAGE_SIZE, (safePage + 1) * PAGE_SIZE);
  const startIndex = safePage * PAGE_SIZE;
  const highlightPattern = query.trim();

  function renderHighlighted(text: string) {
    if (!highlightPattern) return text;

    const regex = new RegExp(`(${escapeRegExp(highlightPattern)})`, "ig");
    const parts = text.split(regex);

    if (parts.length === 1) return text;

    return parts.map((part, index) =>
      part.toLowerCase() === highlightPattern.toLowerCase() ? (
        <mark key={`${part}-${index}`} className="logs-highlight">
          {part}
        </mark>
      ) : part
    );
  }

  function toggle() {
    setOpen(!open);
    setPage(0);
  }

  function openSearch() {
    setSearchOpen(true);
  }

  function closeSearchIfEmpty() {
    setFilterFocused(false);
    if (!query.trim()) setSearchOpen(false);
  }

  return (
    <div className="logs-wrap">
      <div className={`logs-popover-shell${open ? " is-open" : ""}`} aria-hidden={!open}>
        <div className="logs-popover-clip">
          <div className="logs-popover" role="dialog" aria-label="Submission logs">
          <div className="logs-header">
            <span className="logs-title">Submission logs</span>
            <div className="logs-header-tools">
              {!searchOpen && <span className="logs-entry-count">{sorted.length} logs</span>}

              {searchOpen ? (
                <label
                  className={`logs-filter-field${filterFocused ? " is-focused" : ""}`}
                  htmlFor="logs-filter-input"
                  data-focused={filterFocused ? "true" : "false"}
                >
                  <SearchIcon className="ui-icon" />
                  <input
                    ref={filterInputRef}
                    id="logs-filter-input"
                    type="text"
                    className="logs-filter-input"
                    value={query}
                    placeholder="search"
                    aria-label={filterFocused ? "Filtering submission logs" : "Filter submission logs"}
                    aria-expanded={searchOpen}
                    onFocus={() => setFilterFocused(true)}
                    onBlur={closeSearchIfEmpty}
                    onKeyDown={(e) => {
                      if (e.key !== "Escape") return;
                      if (query.trim()) {
                        setQuery("");
                        setPage(0);
                        return;
                      }
                      setSearchOpen(false);
                      setFilterFocused(false);
                    }}
                    onChange={(e) => {
                      setQuery(e.target.value);
                      setPage(0);
                    }}
                  />
                </label>
              ) : (
                <button
                  type="button"
                  className="logs-filter-trigger"
                  aria-label="Open log search"
                  onClick={openSearch}
                >
                  <SearchIcon className="ui-icon" />
                </button>
              )}
            </div>
          </div>

          <div className="logs-table-wrap" onWheel={(e) => e.stopPropagation()}>
            <table className="logs-table">
              <thead>
                <tr>
                  <th className="logs-th logs-th--num">#</th>
                  <th className="logs-th logs-th--section">Section</th>
                  <th className="logs-th logs-th--qs">Q1–Q5</th>
                  <th className="logs-th logs-th--avg">Avg</th>
                  <th className="logs-th logs-th--rank">Rank</th>
                </tr>
              </thead>
              <tbody>
                {pageRows.length === 0 ? (
                  <tr className="logs-row logs-row--empty">
                    <td className="logs-empty" colSpan={5}>couldn't find that one.</td>
                  </tr>
                ) : pageRows.map((row, i) => (
                  <tr key={row._id} className="logs-row">
                    <td className="logs-td logs-td--num">{renderHighlighted(String(startIndex + i + 1))}</td>
                    <td className="logs-td logs-td--section">{renderHighlighted(formatSectionLabel(row.section))}</td>
                    <td className="logs-td logs-td--qs">{renderHighlighted(fmtQs(row))}</td>
                    <td className="logs-td logs-td--avg">{renderHighlighted(fmt(row.avgWeight))}</td>
                    <td className="logs-td logs-td--rank">{renderHighlighted(String(rankById.get(row._id) ?? 0))}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="logs-footer">
            <button
              type="button"
              className="logs-close-btn"
              aria-label="Close logs"
              onClick={() => setOpen(false)}
            >
              <CloseIcon className="ui-close" />
              <span>Logs</span>
            </button>

            {totalPages > 1 && (
              <div className="logs-pagination">
                {safePage > 0 && (
                  <button
                    type="button"
                    className="logs-page-arrow"
                    onClick={() => setPage((p) => p - 1)}
                    aria-label="Previous page"
                  >
                    <svg className="ui-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true" focusable="false">
                      <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                )}
                <span className="logs-page-label">
                  {safePage + 1}<span className="logs-page-sep">/</span>{totalPages}
                </span>
                {safePage < totalPages - 1 && (
                  <button
                    type="button"
                    className="logs-page-arrow"
                    onClick={() => setPage((p) => p + 1)}
                    aria-label="Next page"
                  >
                    <svg className="ui-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true" focusable="false">
                      <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                )}
                  <input
                    id="logs-page-input"
                    type="number"
                    className="logs-page-input"
                    min={1}
                  max={totalPages}
                  placeholder="page"
                  aria-label="Go to page"
                  onChange={(e) => {
                    const val = parseInt(e.target.value, 10);
                    if (!isNaN(val) && val >= 1 && val <= totalPages) {
                      setPage(val - 1);
                    }
                  }}
                />
              </div>
            )}
          </div>
          </div>
        </div>
      </div>

      <button
        type="button"
        className="logs-button"
        data-label="Logs"
        aria-label="Logs"
        aria-expanded={open}
        aria-haspopup="dialog"
        onClick={toggle}
      >
        <span className="logs-button__inner">Logs</span>
      </button>
    </div>
  );
}
