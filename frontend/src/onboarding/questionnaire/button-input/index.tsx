import type { CSSProperties } from "react";

import { useLiveAvgButtons } from "./useLiveAvgButtons";
import type { LiveAvgButtonChange, LiveAvgButtonItem } from "./types";

export interface LiveAvgButtonGroupProps {
  items: LiveAvgButtonItem[];
  title?: string;
  description?: string;
  className?: string;
  columns?: number;
  initialActiveIds?: string[];
  onChange?: (next: LiveAvgButtonChange) => void;
}

type ButtonQuestionnaireGridStyle = CSSProperties & {
  "--button-questionnaire-columns": string;
};

export default function LiveAvgButtonGroup({
  items,
  title,
  description,
  className,
  columns = 3,
  initialActiveIds = [],
  onChange,
}: LiveAvgButtonGroupProps) {
  const { isActive, toggleButton } = useLiveAvgButtons(items, initialActiveIds, onChange);
  const hasHeader = title != null || description != null;
  const gridStyle: ButtonQuestionnaireGridStyle = {
    "--button-questionnaire-columns": String(Math.max(1, columns)),
  };

  return (
    <section className={`button-questionnaire ${className ?? ""}`.trim()}>
      {hasHeader && (
        <div className="button-questionnaire__header">
          {title && <h3 className="button-questionnaire__title">{title}</h3>}
          {description && <p className="button-questionnaire__description">{description}</p>}
        </div>
      )}

      <div
        className="button-questionnaire__grid"
        style={gridStyle}
      >
        {items.map((item) => {
          const active = isActive(item.id);
          return (
            <button
              key={item.id}
              type="button"
              className={`ui-toggle-option button-questionnaire__button${active ? " is-active" : ""}`}
              aria-pressed={active}
              disabled={item.disabled}
              onClick={() => { toggleButton(item.id); }}
            >
              <span className="button-questionnaire__button-label">{item.label}</span>
            </button>
          );
        })}
      </div>
    </section>
  );
}

export type { LiveAvgButtonChange, LiveAvgButtonItem } from "./types";
