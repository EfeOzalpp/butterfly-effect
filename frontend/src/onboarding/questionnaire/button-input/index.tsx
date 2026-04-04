import type { CSSProperties } from "react";

import { useLiveAvgButtons } from "./useLiveAvgButtons";
import type { LiveAvgButtonChange, LiveAvgButtonItem } from "./types";

export type LiveAvgButtonGroupProps = {
  items: LiveAvgButtonItem[];
  title?: string;
  description?: string;
  className?: string;
  columns?: number;
  initialActiveIds?: string[];
  onChange?: (next: LiveAvgButtonChange) => void;
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

  return (
    <section className={`button-questionnaire ${className ?? ""}`.trim()}>
      {(title || description) && (
        <div className="button-questionnaire__header">
          {title && <h3 className="button-questionnaire__title">{title}</h3>}
          {description && <p className="button-questionnaire__description">{description}</p>}
        </div>
      )}

      <div
        className="button-questionnaire__grid"
        style={{ ["--button-questionnaire-columns" as string]: String(Math.max(1, columns)) } as CSSProperties}
      >
        {items.map((item) => {
          const active = isActive(item.id);
          return (
            <button
              key={item.id}
              type="button"
              className={`button-questionnaire__button${active ? " is-active" : ""}`}
              aria-pressed={active}
              disabled={item.disabled}
              onClick={() => toggleButton(item.id)}
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
