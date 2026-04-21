import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useCanvasRuntime } from "../../../app/state/canvas-runtime-context";
import { useUiFlow } from "../../../app/state/ui-context";
import { DEFAULT_AVG } from "../../../app/store";
import CheckIcon from "../../../assets/svg/check/CheckIcon";
import { BUTTON_QUESTIONS } from "./button-questions";
import { getQuestionButtonPlacement } from "./button-layouts";
import { useQuestionnaireGridLayout } from "./useQuestionnaireGridLayout";
import type { Place } from "../../../canvas-engine/grid-layout/occupancy";

const QUESTIONNAIRE_HINT_DELAY_MS = 1500;
const QUESTIONNAIRE_HINT_VISIBLE_MS = 6000;

function reserveSingleTile(footprint: Place): Place {
  const bottomRow = footprint.r0 + footprint.h - 1;
  const centerCol = footprint.c0 + Math.floor(Math.max(0, footprint.w - 1) / 2);

  return {
    r0: bottomRow,
    c0: centerCol,
    w: 1,
    h: 1,
  };
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
  const { setLiveAvg, commitAllocAvg, setReservedFootprints } = useCanvasRuntime();
  const {
    questionnaireAdvanceTick,
    setQuestionnaireNav,
    resetQuestionnaireNav,
  } = useUiFlow();
  const [step, setStep] = useState(0);
  const [activeOptionsByQuestion, setActiveOptionsByQuestion] = useState<Record<string, string[]>>({});
  const [showQuestionHint, setShowQuestionHint] = useState(false);
  const lastConsumedAdvanceTickRef = useRef(0);
  const {
    ready: gridReady,
    device,
    layout,
    getPlacementStyle,
    resolvePlacement,
  } = useQuestionnaireGridLayout();

  const question = BUTTON_QUESTIONS[step];
  const selectedKeys = activeOptionsByQuestion[question.id] ?? [];
  const answers = useMemo(
    () =>
      BUTTON_QUESTIONS.reduce<Record<string, number | null>>((acc, buttonQuestion) => {
        const activeKeys = activeOptionsByQuestion[buttonQuestion.id] ?? [];
        const activeOptions = buttonQuestion.options.filter((option) =>
          activeKeys.includes(option.key)
        );

        acc[buttonQuestion.id] = activeOptions.length
          ? activeOptions.reduce((sum, option) => sum + option.weight, 0) / activeOptions.length
          : null;
        return acc;
      }, {}),
    [activeOptionsByQuestion]
  );
  const selected = answers[question.id] ?? null;
  const isLast = step === BUTTON_QUESTIONS.length - 1;
  const hintBanner = (
    <div
      className={`questionnaire-read-banner${showQuestionHint ? " is-visible" : ""}`}
      role="information"
      aria-live="polite"
    >
      <span className="questionnaire-read-banner-copy">
        <span>Select all that apply.</span>
        <span>Tap again to remove.</span>
      </span>
      <button
        type="button"
        className="questionnaire-read-banner-close"
        aria-label="Dismiss questionnaire hint"
        onClick={() => setShowQuestionHint(false)}
      >
        <svg
          width="100%"
          height="100%"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
          focusable="false"
        >
          <path
            d="M17 7L7 17M7 7L17 17"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
    </div>
  );

  useEffect(() => {
    onAnswersUpdate?.(answers);
  }, [answers, onAnswersUpdate]);

  useEffect(() => {
    const liveAvg = selected ?? DEFAULT_AVG;
    setLiveAvg(liveAvg);
    commitAllocAvg(liveAvg);
  }, [selected, setLiveAvg, commitAllocAvg]);

  useEffect(() => {
    setQuestionnaireNav({
      step: step + 1,
      total: BUTTON_QUESTIONS.length,
      nextLabel: isLast ? "Finish" : "Next",
      nextDisabled: selectedKeys.length === 0 || selected === null || !!submitting,
    });
  }, [
    isLast,
    selected,
    selectedKeys.length,
    setQuestionnaireNav,
    step,
    submitting,
  ]);

  useEffect(() => {
    setShowQuestionHint(false);

    const showTimer = window.setTimeout(() => {
      setShowQuestionHint(true);
    }, QUESTIONNAIRE_HINT_DELAY_MS);

    const hideTimer = window.setTimeout(() => {
      setShowQuestionHint(false);
    }, QUESTIONNAIRE_HINT_DELAY_MS + QUESTIONNAIRE_HINT_VISIBLE_MS);

    return () => {
      window.clearTimeout(showTimer);
      window.clearTimeout(hideTimer);
    };
  }, []);

  useEffect(() => {
    if (!gridReady || !layout) {
      setReservedFootprints([]);
      return;
    }

    const reserved = question.options
      .map((_, optionIndex) =>
        resolvePlacement(getQuestionButtonPlacement(question.id, optionIndex, device))
      )
      .filter((placement): placement is Place => !!placement)
      .map((placement) => reserveSingleTile(placement));

    setReservedFootprints(reserved);
  }, [device, gridReady, layout, question.id, question.options, resolvePlacement, setReservedFootprints]);

  useEffect(() => {
    setReservedFootprints([]);
    return () => {
      setReservedFootprints([]);
    };
  }, [setReservedFootprints]);

  useEffect(() => {
    return () => {
      resetQuestionnaireNav();
    };
  }, [resetQuestionnaireNav]);

  const toggleOption = useCallback(
    (optionKey: string) => {
      setActiveOptionsByQuestion((prev) => {
        const current = prev[question.id] ?? [];
        const nextKeys = current.includes(optionKey)
          ? current.filter((key) => key !== optionKey)
          : [...current, optionKey];
        return { ...prev, [question.id]: nextKeys };
      });
    },
    [question.id]
  );

  const handleNext = useCallback(() => {
    if (selectedKeys.length === 0 || selected === null) return;
    if (isLast) {
      const final = { ...answers, [question.id]: selected };
      onSubmit?.(final);
    } else {
      setStep((s) => s + 1);
    }
  }, [answers, isLast, onSubmit, question.id, selected, selectedKeys.length]);

  useEffect(() => {
    if (questionnaireAdvanceTick <= lastConsumedAdvanceTickRef.current) return;
    lastConsumedAdvanceTickRef.current = questionnaireAdvanceTick;
    handleNext();
  }, [handleNext, questionnaireAdvanceTick]);

  return (
    <section className="survey survey-step questionnaire">
      <div className="questions questionnaire-title questionnaire-grid-header">
        <h2 key={question.id} className="q-title questionnaire-question-title">
          {question.prompt}
        </h2>
      </div>

      {typeof document !== "undefined" ? createPortal(hintBanner, document.body) : hintBanner}

      {gridReady ? (
        <div className="button-questionnaire__canvas-layer" aria-label={`${question.prompt} options`}>
          {question.options.map((option, optionIndex) => {
            const active = selectedKeys.includes(option.key);
            const style = getPlacementStyle(
              getQuestionButtonPlacement(question.id, optionIndex, device)
            );

            return (
              <div
                key={option.key}
                className="button-questionnaire__slot"
                style={style}
              >
                <button
                  type="button"
                  className={`button-questionnaire__button button-questionnaire__button--placed${active ? " is-active" : ""}`}
                  aria-pressed={active}
                  onClick={() => toggleOption(option.key)}
                >
                  <span className="button-questionnaire__button-content">
                    <span className="button-questionnaire__button-icon" aria-hidden="true">
                      {active ? (
                        <CheckIcon className="button-questionnaire__button-check-icon" />
                      ) : (
                        <svg
                          className="icon-plus ui-icon button-questionnaire__button-plus-icon"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                        >
                          <line x1="12" y1="5" x2="12" y2="19" strokeWidth="2.5" />
                          <line x1="5" y1="12" x2="19" y2="12" strokeWidth="2.5" />
                        </svg>
                      )}
                    </span>
                    <span className="button-questionnaire__button-label">{option.label}</span>
                  </span>
                </button>
              </div>
            );
          })}
        </div>
      ) : (
        <div
          className="button-questionnaire__grid button-questionnaire__grid--single"
          style={{ ["--button-questionnaire-columns" as string]: "1" }}
        >
          {question.options.map((option) => {
            const active = selectedKeys.includes(option.key);
            return (
              <button
                key={option.key}
                type="button"
                className={`button-questionnaire__button${active ? " is-active" : ""}`}
                aria-pressed={active}
                onClick={() => toggleOption(option.key)}
              >
                <span className="button-questionnaire__button-content">
                  <span className="button-questionnaire__button-icon" aria-hidden="true">
                    {active ? (
                      <CheckIcon className="button-questionnaire__button-check-icon" />
                    ) : (
                      <svg
                        className="icon-plus ui-icon button-questionnaire__button-plus-icon"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                      >
                        <line x1="12" y1="5" x2="12" y2="19" strokeWidth="2.5" />
                        <line x1="5" y1="12" x2="19" y2="12" strokeWidth="2.5" />
                      </svg>
                    )}
                  </span>
                  <span className="button-questionnaire__button-label">{option.label}</span>
                </span>
              </button>
            );
          })}
        </div>
      )}
    </section>
  );
}
