// src/components/survey/questions/QuestionFlow.tsx
import type { Question } from "../types";
import SliderInput from "./weight-input";
import { useQuestionFlowState } from "./useQuestionFlowState";

export default function QuestionFlow({
  questions,
  onAnswersUpdate,
  onSubmit,
  submitting,
}: {
  questions: Question[];
  onAnswersUpdate?: (answers: Record<string, number | null>) => void;
  onSubmit?: (answers: Record<string, number | null>) => void;
  submitting?: boolean;
}) {
  const { q, current, slidersByQ, slabClass, handleSliderChange, handleCommit, next } =
    useQuestionFlowState(questions, onAnswersUpdate, onSubmit);

  return (
    <section className="survey survey-step questionnaire">
      <div
        className="questionnaire questionnaire-panel-enter"
        aria-labelledby={`question-title-${q.id}`}
        aria-describedby={`question-progress-${q.id}`}
      >
        <div className={`questions ${slabClass}`}>
          <h2 className="q-title" id={`question-title-${q.id}`}>{q.prompt}</h2>
        </div>
        <p
          id={`question-progress-${q.id}`}
          style={{ position: "absolute", width: 1, height: 1, padding: 0, margin: -1, overflow: "hidden", clip: "rect(0, 0, 0, 0)", whiteSpace: "nowrap", border: 0 }}
        >
          Question {current + 1} of {questions.length}
        </p>

        {false && (
          <SliderInput
            question={q}
            sliderVals={slidersByQ[q.id] ?? {}}
            onSliderChange={handleSliderChange}
            onCommit={handleCommit}
            qIndex={current}
            qTotal={questions.length}
          />
        )}

        <div className="survey-actions">
          <button
            type="button"
            className="questionnaire"
            data-label={current < questions.length - 1 ? "Next Question" : "Finish"}
            onClick={next}
            disabled={!!submitting}
            aria-label={current < questions.length - 1 ? `Go to question ${current + 2}` : "Finish survey and open results"}
          >
            <span className="questionnaire__ghost" aria-hidden="true">
              <span>{current < questions.length - 1 ? "Next Question" : "Finish"}</span>
            </span>
            <span className="questionnaire__inner">
              <span>{current < questions.length - 1 ? "Next Question" : "Finish"}</span>
            </span>
          </button>
        </div>
      </div>
    </section>
  );
}
