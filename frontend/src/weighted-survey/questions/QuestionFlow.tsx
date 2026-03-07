// src/components/survey/questions/QuestionFlow.tsx
import { useRef, useState, useCallback, useEffect } from "react";
import type { Question } from "../types";
import AnswersList from "./AnswersList";
import { useAppState, DEFAULT_AVG } from "../../app/appState";

// keep CSS duration in sync with this
const D = 100 as const;

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
  const { setLiveAvg, commitAllocAvg, setCondAvgs } = useAppState();

  const scoreForQuestion = useCallback(
    (question: Question, sliderVals: Record<string, number> = {}) => {
      const EPS = 1e-9;
      const parts = question.options.map((o) => ({
        weight: Math.max(0, Math.min(1, Number(o.weight ?? 0))),
        slider: Math.max(0, Math.min(1, Number(sliderVals[o.key] ?? 0.5))),
      }));
      const denom = parts.reduce((a, p) => a + p.slider, 0);
      return denom <= EPS
        ? null
        : parts.reduce((a, p) => a + p.weight * p.slider, 0) / denom;
    },
    []
  );

  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number | null>>({});
  const [slabState, setSlabState] = useState<"idle" | "leaving" | "entering">("idle");

  // slidersByQ: questionId -> optionKey -> 0..1
  const [slidersByQ, setSlidersByQ] = useState<Record<string, Record<string, number>>>({});

  const q = questions[current];

  // Initialize each question only when it becomes active.
  // This keeps liveAvg based on "visited" questions rather than all 5 upfront.
  useEffect(() => {
    if (!q) return;
    setAnswers((prev) => {
      if (q.id in prev) return prev;
      return { ...prev, [q.id]: scoreForQuestion(q, slidersByQ[q.id] ?? {}) };
    });
  }, [q, slidersByQ, scoreForQuestion]);

  const onAnswersUpdateRef = useRef(onAnswersUpdate);
  useEffect(() => {
    onAnswersUpdateRef.current = onAnswersUpdate;
  }, [onAnswersUpdate]);

  // Helper: compute current live average across all answered questions
  const computeCurrentAvg = useCallback(() => {
    const vals = Object.values(answers).filter(
      (x): x is number => typeof x === "number" && Number.isFinite(x)
    );
    if (!vals.length) return undefined;
    const avg = vals.reduce((a, b) => a + b, 0) / vals.length;
    return Math.round(avg * 100) / 100;
  }, [answers]);

  // Helper: mean slider value per condition kind (A/B/C/D) across all questions.
  // Quantized to 2 dp to avoid spurious re-renders in AppState.
  const computeCondAvgs = useCallback(() => {
    const sums: Record<string, number> = { A: 0, B: 0, C: 0, D: 0 };
    const counts: Record<string, number> = { A: 0, B: 0, C: 0, D: 0 };
    for (const qSliders of Object.values(slidersByQ)) {
      for (const k of ["A", "B", "C", "D"] as const) {
        if (typeof qSliders[k] === "number") {
          sums[k] += qSliders[k];
          counts[k]++;
        }
      }
    }
    const result: Partial<Record<"A" | "B" | "C" | "D", number>> = {};
    for (const k of ["A", "B", "C", "D"] as const) {
      if (counts[k] > 0) result[k] = Math.round((sums[k] / counts[k]) * 100) / 100;
    }
    return result;
  }, [slidersByQ]);

  // Emit answers to parent + update context liveAvg + condAvgs continuously
  useEffect(() => {
    onAnswersUpdateRef.current?.(answers);
    const avg = computeCurrentAvg();
    setLiveAvg(typeof avg === "number" ? avg : DEFAULT_AVG);
    setCondAvgs(computeCondAvgs());
  }, [answers, computeCurrentAvg, computeCondAvgs, setLiveAvg, setCondAvgs]);

  // Commit alloc on drag release (sliders fire gp:weights-commit on pointerUp)
  useEffect(() => {
    const onCommit = () => {
      const avg = computeCurrentAvg();
      commitAllocAvg(typeof avg === "number" ? avg : DEFAULT_AVG);
    };
    window.addEventListener("gp:weights-commit", onCommit);
    return () => window.removeEventListener("gp:weights-commit", onCommit);
  }, [computeCurrentAvg, commitAllocAvg]);

  // Slider change: update slidersByQ[q.id][optKey] and recompute question score
  const handleSliderChange = useCallback(
    (optKey: string, val: number) => {
      setSlidersByQ((prev) => {
        const qSliders = { ...(prev[q.id] ?? {}), [optKey]: val };

        const score = scoreForQuestion(q, qSliders);

        setAnswers((a) => ({ ...a, [q.id]: score }));
        return { ...prev, [q.id]: qSliders };
      });
    },
    [q, scoreForQuestion]
  );

  const next = () => {
    const avg = computeCurrentAvg();
    commitAllocAvg(typeof avg === "number" ? avg : DEFAULT_AVG);

    if (current < questions.length - 1) {
      setSlabState("leaving");
      setTimeout(() => {
        setCurrent((c) => c + 1);
        setSlabState("entering");
        setTimeout(() => setSlabState("idle"), D);
      }, D);
    } else {
      onSubmit?.(answers);
    }
  };

  const slabClass =
    slabState === "leaving"
      ? "q-slab is-leaving"
      : slabState === "entering"
      ? "q-slab is-entering"
      : "q-slab";

  return (
    <section className="survey survey-step survey-step--questions">
      <div className="questionnaire">
        <div className={`questions ${slabClass}`}>
          <div className="q-count">
            {current + 1}/{questions.length}
          </div>
          <h3 className="q-title">{q.prompt}</h3>
        </div>

        <div className="answer-question">
          <div className="survey-flow">
            <AnswersList
              question={q}
              sliderVals={slidersByQ[q.id] ?? {}}
              onSliderChange={handleSliderChange}
            />
            <div className="answer-scroll-spacer" aria-hidden="true" />
          </div>
        </div>

        <div className="survey-actions">
          <button type="button" className="begin-button2" onClick={next} disabled={!!submitting}>
            <span>{current < questions.length - 1 ? "Next" : "Finish"}</span>
          </button>
        </div>
      </div>
    </section>
  );
}
