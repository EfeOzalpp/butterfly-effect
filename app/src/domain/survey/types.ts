// src/domain/survey/types.ts
// Shared survey row contracts used by the app, browser data services, and server routes.

export interface SurveyWeights {
  q1?: number;
  q2?: number;
  q3?: number;
  q4?: number;
  q5?: number;
}

export interface SurveyRow {
  _id: string;
  section: string;
  q1?: number;
  q2?: number;
  q3?: number;
  q4?: number;
  q5?: number;
  avgWeight?: number;
  soloMessage?: string;
  soloMessageUpdatedAt?: string;
  submittedAt?: string;
  _createdAt: string;
  weights: {
    question1: number;
    question2: number;
    question3: number;
    question4: number;
    question5: number;
  };
}

export interface RawSurveyRow extends SurveyWeights {
  _id: string;
  _type?: "userResponseV4";
  _createdAt?: string;
  _updatedAt?: string;
  section?: string;
  avgWeight?: number;
  soloMessage?: string;
  soloMessageUpdatedAt?: string;
  submittedAt?: string;
}

export type Unsubscribe = () => void;
