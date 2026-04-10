// src/components/survey/survey.tsx
import React, { Suspense, useEffect, useMemo, useRef, useState } from 'react';

import { useUiFlow } from "../app/state/ui-context";
import { useSurveyData } from "../app/state/survey-data-context";
import { useIdentity } from "../app/state/identity-context";
import "../styles/onboarding.css";

import { ROLE_SECTIONS } from "./section-picker/sections";
import { ButtonQuestionnaireFlow, WEIGHTED_QUESTIONS } from "./questionnaire";

import { saveUserResponse } from "../services/sanity/saveUserResponse";
type Audience = 'student' | 'staff' | 'visitor' | '';

type RoleKey = 'student' | 'staff';
const isRoleKey = (r: Audience): r is RoleKey => r === 'student' || r === 'staff';

type SectionHeader = { type: 'header'; id: string; label: string };
type SectionOption = {
  type: 'option';
  value: string;
  label: string;
  aliases?: string[];
};
type SectionItem = SectionHeader | SectionOption;

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
  const [finished, setFinished] = useState(false); // hide QuestionFlow right after submit
  const exitingRef = useRef(false);
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

    return () => window.cancelAnimationFrame(rafId);
  }, [stage]);

  useEffect(() => {
    const timer = window.setTimeout(() => setIntroActive(false), 520);
    return () => window.clearTimeout(timer);
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

  // Normalize ROLE_SECTIONS into what SectionPickerIntro expects:
  // - option items must have { value, label, aliases? }
  // - headers have { type:'header', id, label }
  const availableSections = useMemo<SectionItem[]>(() => {
    if (!audience || audience === 'visitor') return [];

    const toOption = (s: any): SectionOption => ({
      type: 'option',
      value: String(s?.value ?? ''),
      label: String(s?.label ?? ''),
      aliases: Array.isArray(s?.aliases) ? s.aliases : undefined,
    });

    if (audience === 'student') {
      return (ROLE_SECTIONS.student || []).map(toOption).filter((o) => o.value);
    }

    if (audience === 'staff') {
      const stu = (ROLE_SECTIONS.student || []).map(toOption).filter((o) => o.value);
      const fac = (ROLE_SECTIONS.staff || []).map(toOption).filter((o) => o.value);
      return [
        { type: 'header', id: 'staff', label: 'Institutional departments' },
        ...fac,
        { type: 'header', id: 'student', label: 'Student departments' },
        ...stu,
      ];
    }

    return [];
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
    transitionTo('section', () => setSurveySection(''));
  };

  const handleBeginFromSection = () => {
    if (!surveySection) {
      setError('Select your section.');
      return;
    }
    setError('');
    transitionTo('questions', () => setAnimationVisible(false));
  };

  // Map answers{id->value} into q1..q5 by original question order
  function answersToWeights(answers: Record<string, number | null>) {
    const getVal = (i: number) => {
      const id = WEIGHTED_QUESTIONS[i]?.id;
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
      const id = created?._id || null;

      setSection(surveySection);
      setMySection(surveySection);
      setMyEntryId(id);
      setMyRole(audience || null);
      setHasCompletedSurvey(true);
      openGraph();
      setSurveyActive(false);
      setAnimationVisible(true);

      if (typeof window !== 'undefined') {
        if (id) sessionStorage.setItem('gp.myEntryId', id);
        sessionStorage.setItem('gp.mySection', surveySection);
        if (audience) sessionStorage.setItem('gp.myRole', audience);
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
      ? [...(ROLE_SECTIONS.student || []), ...(ROLE_SECTIONS.staff || [])].map((s) => s.value)
      : isRoleKey(role)
        ? (ROLE_SECTIONS[role] || []).map((s) => s.value)
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

  // Render
  if (exitingRef.current) {
    return (
      <div className={`survey-section fade-in ${introActive ? 'survey-first-enter' : ''}`}>
        <Suspense fallback={null}>
          <RoleStep value="" onChange={handleAudienceChange} onNext={handleRoleNext} error="" />
        </Suspense>
      </div>
    );
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
              onSubmit={handleSubmitFromQuestions}
              submitting={submitting}
            />
          )}
        </Suspense>
      )}
    </div>
  );
}
