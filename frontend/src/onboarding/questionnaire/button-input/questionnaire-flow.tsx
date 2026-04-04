import { useEffect, useMemo, useState } from "react";

import type { LiveAvgButtonChange, LiveAvgButtonItem } from "./types";
import LiveAvgButtonGroup from "./index";

const BUTTON_ITEMS: LiveAvgButtonItem[] = [
  { id: "walk-bike", label: "Walk or bike", value: 0.95 },
  { id: "transit", label: "Public transit", value: 0.8 },
  { id: "car-share", label: "Car share", value: 0.62 },
  { id: "thrift", label: "Thrift first", value: 0.78 },
  { id: "plant-based", label: "Plant-based meals", value: 0.88 },
  { id: "recycle", label: "Recycle at home", value: 0.7 },
];

function buildAnswerSnapshot(change: LiveAvgButtonChange) {
  const activeSet = new Set(change.activeIds);
  return BUTTON_ITEMS.reduce<Record<string, number | null>>((acc, item) => {
    acc[item.id] = activeSet.has(item.id) ? item.value : null;
    return acc;
  }, {});
}

export default function ButtonQuestionnaireFlow({
  onAnswersUpdate,
  onSubmit,
  submitting,
}: {
  onAnswersUpdate?: (answers: Record<string, number | null>) => void;
  onSubmit?: (answers: Record<string, number | null>) => void;
  submitting?: boolean;
}) {
  const [latestChange, setLatestChange] = useState<LiveAvgButtonChange>({
    activeIds: [],
    activeItems: [],
    liveAvg: 0.5,
  });

  const answers = useMemo(() => buildAnswerSnapshot(latestChange), [latestChange]);

  useEffect(() => {
    onAnswersUpdate?.(answers);
  }, [answers, onAnswersUpdate]);

  return (
    <section className="survey survey-step questionnaire">
      <div className="questionnaire questionnaire-panel-enter">
        <div className="questions questionnaire-title">
          <h2 className="q-title">Select the habits that feel most like you right now.</h2>
        </div>

        <LiveAvgButtonGroup
          title="Habits"
          description="Each active button contributes its own 0 to 1 score to the live canvas average."
          items={BUTTON_ITEMS}
          columns={3}
          onChange={setLatestChange}
        />

        <div className="survey-actions">
          <button
            type="button"
            className="questionnaire"
            data-label="Finish"
            onClick={() => onSubmit?.(answers)}
            disabled={!!submitting}
            aria-label="Finish survey and open results"
          >
            <span className="questionnaire__ghost" aria-hidden="true">
              <span>Finish</span>
            </span>
            <span className="questionnaire__inner">
              <span>Finish</span>
            </span>
          </button>
        </div>
      </div>
    </section>
  );
}
