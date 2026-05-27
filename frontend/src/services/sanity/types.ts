// src/services/sanity/types.ts
// Service contracts for Sanity rows before and after normalization.

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

export type NormalizedSurveyRow = SurveyRow;

export type Unsubscribe = () => void;

export interface SubscribeSurveyDataArgs {
  section: string;
  limit?: number;
  onData: (rows: SurveyRow[]) => void;
}

export interface QueryAndParams {
  query: string;
  params: Record<string, unknown>;
}
