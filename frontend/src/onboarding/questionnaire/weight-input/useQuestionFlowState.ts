import { useRef, useState, useCallback, useEffect } from "react";
import type { Question } from "../../types";
import { simplexSet, simplexNormalize, SIMPLEX_DEFAULT } from "./balance";
import type { ShapeKey } from "./balance";
import { DEFAULT_AVG } from "../../../app/store";
import { useUiFlow } from "../../../app/state/ui-context";
import { useCanvasRuntime } from "../../../app/state/canvas-runtime-context";

const TRANSITION_MS = 100 as const;

export const defaultSliderVal = (index: number) => index % 2 === 0 ? 0.33 : 0.66;

export function useQuestionFlowState(
  questions: Question[],
  onAnswersUpdate: ((answers: Record<string, number | null>) => void) | undefined,
  onSubmit: ((answers: Record<string, number | null>) => void) | undefined
) {
  const { setLiveAvg, commitAllocAvg, setCondAvgs } = useCanvasRuntime();
  const { radarMode } = useUiFlow();

  const scoreForQuestion = useCallback(
    (question: Question, sliderVals: Record<string, number> = {}) => {
      const EPS = 1e-9;
      const parts = question.options.map((o, i) => ({
        weight: Math.max(0, Math.min(1, Number(o.weight ?? 0))),
        slider: Math.max(0, Math.min(1, Number(sliderVals[o.key] ?? defaultSliderVal(i)))),
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
  const [slidersByQ, setSlidersByQ] = useState<Record<string, Record<string, number>>>({});

  const q = questions[current];

  // Initialize each question only when it becomes active
  useEffect(() => {
    if (!q) return;
    setSlidersByQ((prev) => {
      if (q.id in prev) return prev;
      const defaults: Record<string, number> = {};
      q.options.forEach((o, i) => { defaults[o.key] = defaultSliderVal(i); });
      return { ...prev, [q.id]: defaults };
    });
    setAnswers((prev) => {
      if (q.id in prev) return prev;
      return { ...prev, [q.id]: scoreForQuestion(q, slidersByQ[q.id] ?? {}) };
    });
  }, [q, slidersByQ, scoreForQuestion]);

  const onAnswersUpdateRef = useRef(onAnswersUpdate);
  useEffect(() => { onAnswersUpdateRef.current = onAnswersUpdate; }, [onAnswersUpdate]);

  const computeCurrentAvg = useCallback(() => {
    const vals = Object.values(answers).filter(
      (x): x is number => typeof x === "number" && Number.isFinite(x)
    );
    if (!vals.length) return undefined;
    const avg = vals.reduce((a, b) => a + b, 0) / vals.length;
    return Math.round(avg * 100) / 100;
  }, [answers]);

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

  // Sync answers → live canvas + external callback
  useEffect(() => {
    onAnswersUpdateRef.current?.(answers);
    const avg = computeCurrentAvg();
    setLiveAvg(typeof avg === "number" ? avg : DEFAULT_AVG);
    setCondAvgs(computeCondAvgs());
  }, [answers, computeCurrentAvg, computeCondAvgs, setLiveAvg, setCondAvgs]);

  const handleCommit = useCallback(() => {
    const avg = computeCurrentAvg();
    commitAllocAvg(typeof avg === "number" ? avg : DEFAULT_AVG);
  }, [computeCurrentAvg, commitAllocAvg]);

  const handleSliderChange = useCallback(
    (optKey: string, val: number) => {
      setSlidersByQ((prev) => {
        const current = prev[q.id] ?? {};
        let qSliders: Record<string, number>;

        if (radarMode) {
          const simplex = simplexSet(
            { A: current.A ?? SIMPLEX_DEFAULT.A, B: current.B ?? SIMPLEX_DEFAULT.B, C: current.C ?? SIMPLEX_DEFAULT.C, D: current.D ?? SIMPLEX_DEFAULT.D },
            optKey as ShapeKey,
            val
          );
          qSliders = { ...current, ...simplex };
        } else {
          qSliders = { ...current, [optKey]: val };
        }

        const score = scoreForQuestion(q, qSliders);
        setAnswers((a) => ({ ...a, [q.id]: score }));
        return { ...prev, [q.id]: qSliders };
      });
    },
    [q, scoreForQuestion, radarMode]
  );

  // Animate sliders to simplex-normalized positions when switching to radar mode
  const animFrameRef = useRef<number | null>(null);
  const slidersByQRef = useRef(slidersByQ);
  useEffect(() => { slidersByQRef.current = slidersByQ; }, [slidersByQ]);

  useEffect(() => {
    if (!radarMode || !q) return;
    if (animFrameRef.current !== null) cancelAnimationFrame(animFrameRef.current);

    const cur = slidersByQRef.current[q.id];
    if (!cur) return;

    const from = {
      A: cur.A ?? SIMPLEX_DEFAULT.A,
      B: cur.B ?? SIMPLEX_DEFAULT.B,
      C: cur.C ?? SIMPLEX_DEFAULT.C,
      D: cur.D ?? SIMPLEX_DEFAULT.D,
    };
    const to = simplexNormalize(from);

    const DURATION = 350;
    const start = performance.now();
    const smoothstep = (t: number) => t * t * (3 - 2 * t);

    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / DURATION);
      const ease = smoothstep(t);
      const interp: Record<string, number> = {};
      for (const k of ["A", "B", "C", "D"] as const) {
        interp[k] = from[k] + (to[k] - from[k]) * ease;
      }
      setSlidersByQ((prev) => {
        const base = prev[q.id] ?? {};
        const next = { ...base, ...interp };
        const score = scoreForQuestion(q, next);
        setAnswers((a) => ({ ...a, [q.id]: score }));
        return { ...prev, [q.id]: next };
      });
      if (t < 1) animFrameRef.current = requestAnimationFrame(tick);
      else animFrameRef.current = null;
    };

    animFrameRef.current = requestAnimationFrame(tick);
    return () => { if (animFrameRef.current !== null) cancelAnimationFrame(animFrameRef.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [radarMode, q?.id]);

  const next = useCallback(() => {
    const avg = computeCurrentAvg();
    commitAllocAvg(typeof avg === "number" ? avg : DEFAULT_AVG);

    if (current < questions.length - 1) {
      setSlabState("leaving");
      setTimeout(() => {
        setCurrent((c) => c + 1);
        setSlabState("entering");
        setTimeout(() => setSlabState("idle"), TRANSITION_MS);
      }, TRANSITION_MS);
    } else {
      onSubmit?.(answers);
    }
  }, [computeCurrentAvg, commitAllocAvg, current, questions.length, answers, onSubmit]);

  const slabClass =
    slabState === "leaving"
      ? "questionnaire-title is-leaving"
      : slabState === "entering"
      ? "questionnaire-title is-entering"
      : "questionnaire-title";

  return {
    q,
    current,
    slidersByQ,
    slabClass,
    handleSliderChange,
    handleCommit,
    next,
  };
}
