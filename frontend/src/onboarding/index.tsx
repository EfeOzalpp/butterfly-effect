// src/onboarding/index.tsx
import React, { Suspense, useEffect, useMemo, useRef, useState } from 'react';

import { useUiFlow } from "../app/state/ui-context";
import { useSurveyData } from "../app/state/survey-data-context";
import { useIdentity } from "../app/state/identity-context";
import "../styles/onboarding.css";

import { ROLE_SECTIONS } from "./section-picker/sections";
import type { RoleSection, SectionItem, SectionOption } from "./section-picker/sections";
import type { RoleValue } from "./role-picker";
import { ButtonQuestionnaireFlow, BUTTON_QUESTIONS } from "./questionnaire";

import { saveUserResponse } from "../services/sanity/saveUserResponse";

type Audience = RoleValue | '';

const RoleStep = React.lazy(() => import("./role-picker/role-step"));
const SectionPickerIntro = React.lazy(
  () => import("./section-picker")
);

export default function Survey({
  onAnswersUpdate,
}: {
  onAnswersUpdate?: (answers: Record<string, number | null>) => void;
}) {
  const { setAnimationVisible } = useUiFlow();
  const [stage, setStage] = useState<'role' | 'section' | 'questions'>('role');
  const [audience, setAudience] = useState<Audience>('visitor');
  const [surveySection, setSurveySection] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [fadeState, setFadeState] = useState<'fade-in' | 'fade-out'>('fade-in');
  const [introActive, setIntroActive] = useState(true);
  const shouldScrollToSectionRef = useRef(false);

  // latches
  const [finished, setFinished] = useState(false); // hide questionnaire immediately after submit
  const prevCompletedRef = useRef(false);

  const { setSurveyActive, setHasCompletedSurvey, observerMode, openGraph, hasCompletedSurvey, setQuestionnaireOpen, setSectionOpen } = useUiFlow();
  const { section, setSection } = useSurveyData();
  const { setMySection, setMyEntryId, setMyRole } = useIdentity();

  // Keep questionnaireOpen in sync with our stage (and finished latch)
  useEffect(() => {
    setQuestionnaireOpen(stage === 'questions' && !observerMode && !finished);
    return () => {
      setQuestionnaireOpen(false);
    };
  }, [stage, observerMode, finished, setQuestionnaireOpen]);

  // Ensure sectionOpen resets whenever we leave the section stage
  useEffect(() => {
    if (stage !== 'section') setSectionOpen(false);
    return () => { setSectionOpen(false); };
  }, [stage, setSectionOpen]);

  useEffect(() => {
    if (stage !== 'section' || !shouldScrollToSectionRef.current) return;
    shouldScrollToSectionRef.current = false;

    const scrollToSection = () => {
      const target = document.querySelector('.survey-step.section-select');
      if (!(target instanceof HTMLElement)) return;
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    const rafId = window.requestAnimationFrame(() => {
      window.setTimeout(scrollToSection, 40);
    });

    return () => { window.cancelAnimationFrame(rafId); };
  }, [stage]);

  useEffect(() => {
    const timer = window.setTimeout(() => { setIntroActive(false); }, 520);
    return () => { window.clearTimeout(timer); };
  }, []);

  useEffect(() => {
    if (observerMode) {
      setSurveyActive(false);
      if (!section) setSection('fine-arts');
      openGraph();
    }
  }, [observerMode, section, setSection, openGraph, setSurveyActive]);

  useEffect(() => {
    if (prevCompletedRef.current && !hasCompletedSurvey) {
      setStage('role');
      setAudience('visitor');
      setSurveySection('');
      setError('');
      setSubmitting(false);
      setFinished(false);
      setFadeState('fade-in');
      setQuestionnaireOpen(false);
      setSectionOpen(false);
      setAnimationVisible(false);
    }

    prevCompletedRef.current = hasCompletedSurvey;
  }, [
    hasCompletedSurvey,
    setAnimationVisible,
    setQuestionnaireOpen,
    setSectionOpen,
  ]);

  const transitionTo = (next: typeof stage, side?: () => void) => {
    setFadeState('fade-out');
    setTimeout(() => {
      side?.();
      setStage(next);
      setFadeState('fade-in');
    }, 70);
  };

  // Normalize role sections into the picker contract and add headers for staff mode.
  const availableSections = useMemo<SectionItem[]>(() => {
    if (!audience || audience === 'visitor') return [];

    const toOption = (sectionOption: RoleSection): SectionOption => ({
      type: 'option',
      value: sectionOption.value,
      label: sectionOption.label,
      aliases: sectionOption.aliases,
    });

    if (audience === 'student') {
      return ROLE_SECTIONS.student.map(toOption);
    }

    const studentOptions = ROLE_SECTIONS.student.map(toOption);
    const staffOptions = ROLE_SECTIONS.staff.map(toOption);
    return [
      { type: 'header', id: 'staff', label: 'Institutional departments' },
      ...staffOptions,
      { type: 'header', id: 'student', label: 'Student departments' },
      ...studentOptions,
    ];
  }, [audience]);

  const handleRoleNext = () => {
    if (!audience) {
      setError('Choose whether you are Student, Staff, or Visitor.');
      return;
    }
    setError('');
    if (audience === 'visitor') {
      transitionTo('questions', () => {
        setSurveySection('visitor');
        setAnimationVisible(false);
      });
      return;
    }
    shouldScrollToSectionRef.current = true;
    transitionTo('section', () => { setSurveySection(''); });
  };

  const handleBeginFromSection = () => {
    if (!surveySection) {
      setError('Select your section.');
      return;
    }
    setError('');
    transitionTo('questions', () => { setAnimationVisible(false); });
  };

  // Map answers{id->value} into q1..q5 by original question order
  function answersToWeights(answers: Record<string, number | null>) {
    const getVal = (i: number) => {
      const id = BUTTON_QUESTIONS[i]?.id;
      const v = id ? answers[id] : undefined;
      return typeof v === 'number' && Number.isFinite(v) ? v : undefined;
    };
    return {
      q1: getVal(0),
      q2: getVal(1),
      q3: getVal(2),
      q4: getVal(3),
      q5: getVal(4),
    };
  }

  const handleSubmitFromQuestions = async (answers: Record<string, number | null>) => {
    if (submitting) return;
    setSubmitting(true);
    setError('');

    // Hide questions immediately and drop the open flag
    setFinished(true);
    setQuestionnaireOpen(false);

    try {
      const weights = answersToWeights(answers);
      const created = await saveUserResponse(surveySection, weights);
      const id = created._id;

      setSection(surveySection);
      setMySection(surveySection);
      setMyEntryId(id);
      setMyRole(audience || null);
      setHasCompletedSurvey(true);
      openGraph();
      setSurveyActive(false);
      setAnimationVisible(true);

      if (typeof window !== 'undefined') {
        if (id) sessionStorage.setItem('be.myEntryId', id);
        sessionStorage.setItem('be.mySection', surveySection);
        if (audience) sessionStorage.setItem('be.myRole', audience);
      }

    } catch (err) {
      console.error('[Survey] submit error:', err);
      // If saving failed, allow returning to questions
      setFinished(false);
      setQuestionnaireOpen(true);
      setHasCompletedSurvey(false);
      setSurveyActive(true);
      setAnimationVisible(false);
    } finally {
      setSubmitting(false);
    }
  };

  const handleAudienceChange = (role: Audience) => {
    setAudience(role);
    setError('');

    // Only index ROLE_SECTIONS when role is student/staff
    const allowed = role === 'staff'
      ? [...ROLE_SECTIONS.student, ...ROLE_SECTIONS.staff].map((sectionOption) => sectionOption.value)
      : role === 'student'
        ? ROLE_SECTIONS.student.map((sectionOption) => sectionOption.value)
        : [];

    setSurveySection((prev) => (allowed.includes(prev) ? prev : role === 'visitor' ? 'visitor' : ''));
  };

  const handleSectionChange = (val: string) => {
    setSurveySection(val);
    setError('');
  };

  if (hasCompletedSurvey && !observerMode) {
    return null;
  }

  return (
    <div className={`survey-section ${fadeState} ${introActive ? 'survey-first-enter' : ''}`}>
      {!observerMode && (
        <Suspense fallback={null}>
          {stage === 'role' && (
            <RoleStep value={audience} onChange={handleAudienceChange} onNext={handleRoleNext} error={error} />
          )}

          {stage === 'section' && (
            <SectionPickerIntro
              value={surveySection}
              onChange={handleSectionChange}
              onBegin={handleBeginFromSection}
              error={error}
              sections={availableSections}
              placeholderOverride={audience === 'student' ? 'Your Major...' : undefined}
              titleOverride={audience === 'student' ? 'Select Your Major' : undefined}
              onOpenChange={setSectionOpen}
            />
          )}

          {stage === 'questions' && !finished && (
            <ButtonQuestionnaireFlow
              onAnswersUpdate={onAnswersUpdate}
              onSubmit={(answers) => { void handleSubmitFromQuestions(answers); }}
              submitting={submitting}
            />
          )}
        </Suspense>
      )}
    </div>
  );
}
