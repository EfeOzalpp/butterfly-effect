import { useMemo, useState } from "react";
import "../../styles/logs.css";
import { useSurveyData } from "../../app/state/survey-data-context";

const PAGE_SIZE = 50;

function fmt(v?: number): string {
  return v != null ? v.toFixed(2) : "—";
}

function fmtQs(row: { q1?: number; q2?: number; q3?: number; q4?: number; q5?: number }): string {
  return [row.q1, row.q2, row.q3, row.q4, row.q5].map(fmt).join(", ");
}

export default function LogsButton({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const { allFilteredRows: data } = useSurveyData();
  const setOpen = onOpenChange;
  const [page, setPage] = useState(0);

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

  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages - 1);
  const pageRows = sorted.slice(safePage * PAGE_SIZE, (safePage + 1) * PAGE_SIZE);
  const startIndex = safePage * PAGE_SIZE;

  function toggle() {
    setOpen(!open);
    setPage(0);
  }

  return (
    <div className="logs-wrap">
      {open && (
        <div className="logs-popover" role="dialog" aria-label="Submission logs">
          <div className="logs-header">
            <span className="logs-title">Submission logs</span>
            <span className="logs-count">{sorted.length} entries</span>
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
                {pageRows.map((row, i) => (
                  <tr key={row._id} className="logs-row">
                    <td className="logs-td logs-td--num">{startIndex + i + 1}</td>
                    <td className="logs-td logs-td--section">{row.section}</td>
                    <td className="logs-td logs-td--qs">{fmtQs(row)}</td>
                    <td className="logs-td logs-td--avg">{fmt(row.avgWeight)}</td>
                    <td className="logs-td logs-td--rank">{rankById.get(row._id) ?? 0}</td>
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
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true" focusable="false">
                <path d="M17 7L7 17M7 7L17 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
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
      )}

      <button
        type="button"
        className="logs-button"
        aria-label="Logs"
        aria-expanded={open}
        aria-haspopup="dialog"
        onClick={toggle}
      >
        <span>Logs</span>
        <svg
          className="ui-icon"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
          focusable="false"
        >
          <path
            d="M14 11H8M10 15H8M16 7H8M20 6.8V17.2C20 18.8802 20 19.7202 19.673 20.362C19.3854 20.9265 18.9265 21.3854 18.362 21.673C17.7202 22 16.8802 22 15.2 22H8.8C7.11984 22 6.27976 22 5.63803 21.673C5.07354 21.3854 4.6146 20.9265 4.32698 20.362C4 19.7202 4 18.8802 4 17.2V6.8C4 5.11984 4 4.27976 4.32698 3.63803C4.6146 3.07354 5.07354 2.6146 5.63803 2.32698C6.27976 2 7.11984 2 8.8 2H15.2C16.8802 2 17.7202 2 18.362 2.32698C18.9265 2.6146 19.3854 3.07354 19.673 3.63803C20 4.27976 20 5.11984 20 6.8Z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
    </div>
  );
}
